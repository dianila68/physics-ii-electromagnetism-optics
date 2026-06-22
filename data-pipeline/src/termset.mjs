// Collect the set of term ids that the book actually hyperlinks to (PLAN §1.3).
//
// Sources scanned for [[id]] / [[id|label]] tokens:
//   - src/chapters/<chapter>/index.ts
//   - src/content/narrative.ts
//   - src/main.ts   (margin notes)
//
// The renderer also uses a *cross-reference* syntax [[chapter:<chapter-id>|...]]
// which is NOT a term — those are excluded (the `chapter:` prefix is dropped).
//
// The "required term set" returned here is the union of referenced ids; it both
// scopes ingest (we only fetch what something links to) and powers the
// link-integrity check (every referenced id should have a terms.json record).

import { promises as fs } from 'node:fs';
import path from 'node:path';

// Matches [[id]] and [[id|display]]. The id is kebab-case [a-z0-9-]+.
// `chapter:...` refs do not match because of the literal ':' that follows.
const LINK_RE = /\[\[([a-z0-9-]+)(?:\|[^\]]*)?\]\]/g;

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (e.isFile() && full.endsWith('.ts')) out.push(full);
  }
  return out;
}

/**
 * @param {string} repoRoot absolute path to the repo root
 * @returns {Promise<{ids: string[], byFile: Record<string,string[]>}>}
 */
export async function collectReferencedTermIds(repoRoot) {
  const targets = [];
  targets.push(...(await walk(path.join(repoRoot, 'src', 'chapters'))));
  targets.push(path.join(repoRoot, 'src', 'content', 'narrative.ts'));
  targets.push(path.join(repoRoot, 'src', 'main.ts'));

  const ids = new Set();
  const byFile = {};
  for (const file of targets) {
    let text;
    try {
      text = await fs.readFile(file, 'utf8');
    } catch {
      continue; // file may not exist; skip silently
    }
    const found = new Set();
    for (const m of text.matchAll(LINK_RE)) {
      ids.add(m[1]);
      found.add(m[1]);
    }
    if (found.size) byFile[path.relative(repoRoot, file)] = [...found].sort();
  }
  return { ids: [...ids].sort(), byFile };
}
