#!/usr/bin/env node

/**
 * generate-puzzles.js
 *
 * Main puzzle generation pipeline for Ten Text Twist.
 *
 * Steps:
 *  1. Download the 2of12inf word list (if not cached locally).
 *  2. Parse it: extract 6-letter words, mark common vs less-common.
 *  3. Group words by their sorted-letter signature (anagram families).
 *  4. Load/fetch definitions for every candidate word.
 *  5. Assemble 365 daily puzzles (10 sets each), mixing single-answer
 *     and multi-answer (anagram family) sets.
 *  6. Write individual JSON files and a manifest.
 *
 * Usage:
 *   node scripts/generate-puzzles.js           # generate 365 puzzles
 *   node scripts/generate-puzzles.js --quick   # generate 10 puzzles (for testing)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

import {
  getDefinition,
  fetchDefinitions,
  getCache,
  saveCache,
} from "./fetch-definitions.js";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

const WORDLIST_DIR = join(__dirname, "wordlist");
const WORDLIST_PATH = join(WORDLIST_DIR, "2of12inf.txt");
const PUZZLES_DIR = join(PROJECT_ROOT, "static", "puzzles");

// 12dicts word list (Alan Beale). Original source: wordlist.aspell.net/12dicts/
// Mirror hosted on GitHub for easy programmatic download.
const WORDLIST_URL =
  "https://raw.githubusercontent.com/gruter/utogen/master/conf/resources/12dicts-4.0/2of12inf.txt";

const EPOCH = "2026-02-18";

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

const QUICK_MODE = process.argv.includes("--quick");
const SKIP_FETCH = process.argv.includes("--skip-fetch");
const TOTAL_PUZZLES = QUICK_MODE ? 10 : 365;

// ---------------------------------------------------------------------------
// Seeded PRNG – mulberry32
// ---------------------------------------------------------------------------

function mulberry32(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffle an array in place using a PRNG function.
 */
function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const get = (u) => {
      https
        .get(u, (res) => {
          // Follow redirects
          if (
            (res.statusCode === 301 || res.statusCode === 302) &&
            res.headers.location
          ) {
            get(res.headers.location);
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode} from ${u}`));
            return;
          }
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve(data));
        })
        .on("error", reject);
    };
    get(url);
  });
}

// ---------------------------------------------------------------------------
// Step 1: Download word list
// ---------------------------------------------------------------------------

async function ensureWordlist() {
  if (existsSync(WORDLIST_PATH)) {
    console.log(`Wordlist already cached at ${WORDLIST_PATH}`);
    return;
  }

  console.log(`Downloading wordlist from ${WORDLIST_URL} ...`);
  const data = await downloadFile(WORDLIST_URL);

  if (!existsSync(WORDLIST_DIR)) {
    mkdirSync(WORDLIST_DIR, { recursive: true });
  }
  writeFileSync(WORDLIST_PATH, data, "utf-8");
  console.log(`Saved wordlist (${data.length} bytes)`);
}

// ---------------------------------------------------------------------------
// Step 2: Parse word list
// ---------------------------------------------------------------------------

/**
 * Parse the 2of12inf word list.
 *
 * Format notes (from the 2of12inf README):
 *   - Lines starting with a number or containing tabs are signature lines;
 *     we skip those.
 *   - A trailing "%" marks a less-common / informal word.
 *   - We want only 6-letter, all-alpha words.
 *
 * Returns { common: string[], lessCommon: string[] }
 */
function parseWordlist() {
  const raw = readFileSync(WORDLIST_PATH, "utf-8");
  const common = [];
  const lessCommon = [];

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Skip comment / header lines
    if (trimmed.startsWith("#") || trimmed.startsWith("---")) continue;
    // Skip lines with tabs (signature lines in 2of12inf)
    if (trimmed.includes("\t")) continue;

    const isLessCommon = trimmed.endsWith("%");
    const word = trimmed.replace(/%$/, "").toLowerCase();

    // Only 6-letter, pure alphabetic words
    if (word.length !== 6) continue;
    if (!/^[a-z]+$/.test(word)) continue;

    if (isLessCommon) {
      lessCommon.push(word);
    } else {
      common.push(word);
    }
  }

  return { common: [...new Set(common)], lessCommon: [...new Set(lessCommon)] };
}

// ---------------------------------------------------------------------------
// Step 3: Group by sorted-letter signature (anagram families)
// ---------------------------------------------------------------------------

function sortedSignature(word) {
  return word.split("").sort().join("");
}

/**
 * Build anagram family map.
 * Returns Map<signature, { words: string[], hasCommon: boolean }>
 */
function buildAnagramFamilies(common, lessCommon) {
  const families = new Map();

  const addWord = (word, isCommon) => {
    const sig = sortedSignature(word);
    if (!families.has(sig)) {
      families.set(sig, { words: [], hasCommon: false });
    }
    const fam = families.get(sig);
    if (!fam.words.includes(word)) {
      fam.words.push(word);
    }
    if (isCommon) fam.hasCommon = true;
  };

  for (const w of common) addWord(w, true);
  for (const w of lessCommon) addWord(w, false);

  return families;
}

// ---------------------------------------------------------------------------
// Step 4 & 5: Fetch definitions, assemble puzzles
// ---------------------------------------------------------------------------

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log(
    `generate-puzzles.js – generating ${TOTAL_PUZZLES} puzzles${QUICK_MODE ? " (quick mode)" : ""}\n`
  );

  // Step 1
  await ensureWordlist();

  // Step 2
  console.log("\nParsing wordlist...");
  const { common, lessCommon } = parseWordlist();
  console.log(
    `  ${common.length} common 6-letter words, ${lessCommon.length} less-common`
  );

  // Step 3
  console.log("\nBuilding anagram families...");
  const families = buildAnagramFamilies(common, lessCommon);

  // Separate into multi-word families (for multi-answer sets) and singles
  const multiFamilies = []; // families with 2+ words that have definitions
  const singleWords = []; // words that are the sole member of their family

  for (const [sig, fam] of families) {
    if (fam.words.length >= 2) {
      multiFamilies.push(fam);
    } else {
      singleWords.push(fam.words[0]);
    }
  }

  console.log(
    `  ${families.size} anagram families (${multiFamilies.length} multi-word, ${singleWords.length} singles)`
  );

  // Step 4: Ensure definitions are fetched
  console.log("\nLoading / fetching definitions...");

  // Gather all candidate words
  const allWords = [];
  for (const [, fam] of families) {
    for (const w of fam.words) {
      allWords.push(w);
    }
  }

  // Check which words are missing from cache
  const defCache = getCache();
  const uncached = allWords.filter((w) => !(w in defCache));
  if (uncached.length > 0 && !SKIP_FETCH) {
    console.log(`  ${uncached.length} words not yet in cache – fetching...`);
    await fetchDefinitions(uncached);
  } else if (SKIP_FETCH && uncached.length > 0) {
    console.log(
      `  ${uncached.length} words not in cache (skipping fetch, using cached only)`
    );
  } else {
    console.log(`  All ${allWords.length} words are cached.`);
  }

  // Reload cache reference
  const defs = getCache();

  // Filter: only keep words that have a valid definition
  const hasDefinition = (word) => {
    const d = defs[word];
    return d && d.definition;
  };

  // Build final pools
  // Multi-answer sets: families where at least 2 words have definitions
  const validMultiFamilies = [];
  for (const fam of multiFamilies) {
    const validWords = fam.words.filter(hasDefinition);
    if (validWords.length >= 2) {
      validMultiFamilies.push(validWords);
    } else if (validWords.length === 1) {
      // Demote to single
      singleWords.push(validWords[0]);
    }
  }

  // Single-answer pool: words with definitions
  const validSingles = singleWords.filter(hasDefinition);

  console.log(
    `\n  Valid multi-answer families: ${validMultiFamilies.length}`
  );
  console.log(`  Valid single-answer words:   ${validSingles.length}`);

  // Check if we have enough material
  const minSingles = TOTAL_PUZZLES * 6; // at least 6 singles per puzzle
  const minMulti = TOTAL_PUZZLES * 2; // at least 2 multi-families per puzzle
  if (validSingles.length < minSingles) {
    console.warn(
      `\n  [warn] Only ${validSingles.length} single-answer words available (want ~${minSingles}).`
    );
    console.warn(`  Puzzles may reuse words.`);
  }
  if (validMultiFamilies.length < minMulti) {
    console.warn(
      `\n  [warn] Only ${validMultiFamilies.length} multi-answer families available (want ~${minMulti}).`
    );
    console.warn(`  Puzzles may reuse anagram families.`);
  }

  // Step 5: Assemble puzzles
  console.log(`\nAssembling ${TOTAL_PUZZLES} puzzles...`);

  const rng = mulberry32(20260218); // seed from epoch date

  // Shuffle pools
  const shuffledSingles = shuffle([...validSingles], rng);
  const shuffledMulti = shuffle([...validMultiFamilies], rng);

  let singleIdx = 0;
  let multiIdx = 0;

  const usedWords = new Set();

  function pickSingle() {
    // Try to find an unused word; wrap around if exhausted
    const startIdx = singleIdx;
    while (true) {
      const word = shuffledSingles[singleIdx % shuffledSingles.length];
      singleIdx++;
      if (!usedWords.has(word) || singleIdx - startIdx >= shuffledSingles.length) {
        usedWords.add(word);
        return word;
      }
    }
  }

  function pickMultiFamily() {
    const startIdx = multiIdx;
    while (true) {
      const family = shuffledMulti[multiIdx % shuffledMulti.length];
      multiIdx++;
      // Check if any word in this family is already used
      const anyUsed = family.some((w) => usedWords.has(w));
      if (!anyUsed || multiIdx - startIdx >= shuffledMulti.length) {
        family.forEach((w) => usedWords.add(w));
        return family;
      }
    }
  }

  function shuffleLetters(word, rng) {
    const letters = word.toUpperCase().split("");
    return shuffle(letters, rng);
  }

  function makeSet(words, rng) {
    // All words in a set share the same letters (anagrams), so pick letters from the first
    const letters = shuffleLetters(words[0], rng);
    const answers = words.map((w) => {
      const d = defs[w];
      return {
        word: w,
        definition: d.definition,
        pos: d.pos,
      };
    });
    return { letters, answers };
  }

  // Ensure output directory exists
  if (!existsSync(PUZZLES_DIR)) {
    mkdirSync(PUZZLES_DIR, { recursive: true });
  }

  for (let puzzleNum = 1; puzzleNum <= TOTAL_PUZZLES; puzzleNum++) {
    const date = addDays(EPOCH, puzzleNum - 1);

    // Decide the mix for this puzzle: 10 sets total
    // Multi-answer sets: 2-4, rest are singles
    const numMulti = 2 + Math.floor(rng() * 3); // 2, 3, or 4
    const numSingle = 10 - numMulti;

    const sets = [];

    // Add multi-answer sets
    for (let i = 0; i < numMulti; i++) {
      const family = pickMultiFamily();
      sets.push(makeSet(family, rng));
    }

    // Add single-answer sets
    for (let i = 0; i < numSingle; i++) {
      const word = pickSingle();
      sets.push(makeSet([word], rng));
    }

    // Shuffle the sets so multi-answer aren't all at the start
    shuffle(sets, rng);

    const puzzle = {
      number: puzzleNum,
      date,
      sets,
    };

    const filename = String(puzzleNum).padStart(3, "0") + ".json";
    writeFileSync(
      join(PUZZLES_DIR, filename),
      JSON.stringify(puzzle, null, 2),
      "utf-8"
    );
  }

  // Write manifest
  const manifest = {
    epoch: EPOCH,
    totalPuzzles: TOTAL_PUZZLES,
  };
  writeFileSync(
    join(PUZZLES_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf-8"
  );

  console.log(`\nWrote ${TOTAL_PUZZLES} puzzle files to ${PUZZLES_DIR}`);
  console.log(`Manifest: ${join(PUZZLES_DIR, "manifest.json")}`);
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
