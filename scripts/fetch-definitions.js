#!/usr/bin/env node

/**
 * fetch-definitions.js
 *
 * Fetches word definitions from the Free Dictionary API and caches them locally.
 * Can run standalone to pre-populate the cache, or be imported by generate-puzzles.js.
 *
 * Usage (standalone):
 *   node scripts/fetch-definitions.js [wordlist-file]
 *
 * If no wordlist file is given, reads scripts/wordlist/2of12inf.txt and extracts
 * 6-letter words from it.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CACHE_DIR = join(__dirname, "wordlist");
const CACHE_PATH = join(CACHE_DIR, "definitions-cache.json");
const REQUEST_DELAY_MS = 150; // delay between API requests to avoid rate limiting
const SAVE_INTERVAL = 50; // save cache every N new fetches

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

let cache = null;

function loadCache() {
  if (cache !== null) return cache;
  if (existsSync(CACHE_PATH)) {
    try {
      cache = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
    } catch {
      cache = {};
    }
  } else {
    cache = {};
  }
  return cache;
}

function saveCache() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// HTTP helper (uses built-in node:https, returns a Promise)
// ---------------------------------------------------------------------------

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, body: data });
        });
      })
      .on("error", reject);
  });
}

// ---------------------------------------------------------------------------
// Fetch a definition from the API
// ---------------------------------------------------------------------------

async function fetchDefinitionFromAPI(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  try {
    const { statusCode, body } = await httpsGet(url);

    if (statusCode === 404) {
      // Word not found – store null so we don't re-fetch
      return null;
    }

    if (statusCode === 429) {
      // Rate limited – wait and retry once
      await sleep(3000);
      return fetchDefinitionFromAPI(word);
    }

    if (statusCode !== 200) {
      console.warn(`  [warn] HTTP ${statusCode} for "${word}", skipping`);
      return null;
    }

    const entries = JSON.parse(body);
    if (!Array.isArray(entries) || entries.length === 0) return null;

    // Walk through meanings to find the first usable definition
    for (const entry of entries) {
      if (!entry.meanings) continue;
      for (const meaning of entry.meanings) {
        const pos = meaning.partOfSpeech || "";
        if (meaning.definitions && meaning.definitions.length > 0) {
          const def = meaning.definitions[0].definition;
          if (def) {
            return { definition: def, pos };
          }
        }
      }
    }

    return null;
  } catch (err) {
    console.warn(`  [warn] Error fetching "${word}": ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get a definition for a word. Returns {definition, pos} or null.
 * Uses the cache first; fetches from API if not cached.
 *
 * @param {string} word
 * @param {{ skipFetch?: boolean }} options
 * @returns {Promise<{definition: string, pos: string} | null>}
 */
export async function getDefinition(word, options = {}) {
  const c = loadCache();
  const key = word.toLowerCase();

  if (key in c) {
    return c[key]; // may be null (means "no definition found previously")
  }

  if (options.skipFetch) return undefined; // not in cache, caller didn't want a fetch

  // Fetch from API
  const result = await fetchDefinitionFromAPI(key);
  c[key] = result;
  return result;
}

/**
 * Fetch definitions for an array of words, with rate-limiting and periodic saves.
 * Returns the number of newly fetched definitions.
 */
export async function fetchDefinitions(words) {
  const c = loadCache();
  let newFetches = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase();
    if (word in c) continue; // already cached (even if null)

    process.stdout.write(
      `  Fetching [${i + 1}/${words.length}] "${word}" ...`
    );
    const result = await fetchDefinitionFromAPI(word);
    c[word] = result;
    newFetches++;

    if (result) {
      process.stdout.write(` OK (${result.pos})\n`);
    } else {
      process.stdout.write(` (no definition)\n`);
    }

    // Periodic save
    if (newFetches % SAVE_INTERVAL === 0) {
      saveCache();
      console.log(`  [cache saved – ${newFetches} new entries so far]`);
    }

    // Rate-limit delay
    await sleep(REQUEST_DELAY_MS);
  }

  // Final save
  if (newFetches > 0) {
    saveCache();
    console.log(`  [cache saved – ${newFetches} new entries total]`);
  }

  return newFetches;
}

/**
 * Return the full cache object (loads from disk if needed).
 */
export function getCache() {
  return loadCache();
}

/**
 * Persist the current in-memory cache to disk.
 */
export { saveCache };

// ---------------------------------------------------------------------------
// Standalone mode
// ---------------------------------------------------------------------------

async function main() {
  console.log("fetch-definitions.js – standalone mode\n");

  let words;

  const arg = process.argv[2];
  if (arg) {
    // Read a plain word list (one word per line)
    const raw = readFileSync(arg, "utf-8");
    words = raw
      .split("\n")
      .map((w) => w.trim())
      .filter((w) => w.length === 6 && /^[a-z]+$/i.test(w));
    console.log(`Read ${words.length} 6-letter words from ${arg}`);
  } else {
    // Try to read the default 2of12inf wordlist
    const defaultPath = join(CACHE_DIR, "2of12inf.txt");
    if (!existsSync(defaultPath)) {
      console.error(
        `No wordlist found at ${defaultPath}.\n` +
          `Run generate-puzzles.js first to download it, or pass a wordlist file as an argument.`
      );
      process.exit(1);
    }
    const raw = readFileSync(defaultPath, "utf-8");
    words = [];
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      // 2of12inf format: word or word% (% = less common)
      const clean = trimmed.replace(/%$/, "");
      if (clean.length === 6 && /^[a-z]+$/i.test(clean)) {
        words.push(clean.toLowerCase());
      }
    }
    // Deduplicate
    words = [...new Set(words)];
    console.log(`Found ${words.length} 6-letter words in 2of12inf.txt`);
  }

  await fetchDefinitions(words);
  console.log("\nDone.");
}

// Run main() only when executed directly (not imported)
const isMain =
  process.argv[1] &&
  (process.argv[1] === __filename ||
    process.argv[1] === fileURLToPath(import.meta.url));

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
