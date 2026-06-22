# Prompt template — term condense (Haiku, bulk draft)

- Model: `claude-haiku-4-5`
- Params: `thinking: {type: "adaptive"}`, `output_config: {effort: "low", format: <json_schema>}`
- Run via Message Batches; `custom_id`: `term:<id>:condense`
- Caching: everything in SYSTEM is the stable prefix → one `cache_control` breakpoint at end of SYSTEM. Per-term content goes in USER (after the breakpoint).

## SYSTEM (cached prefix)
You write factual definitions for a bilingual (EN/IT) university Physics II textbook
(electromagnetism & optics). You will be given the lead section of a Wikipedia article about a
physics term. Produce two English fields:

- `shortEn`: ONE sentence, ≤ 30 words, stating what the term IS plus its key defining
  fact/quantity. Terse and factual — this is the hover-card summary.
- `longEn`: 3–5 sentences, the panel definition. Preserve every numeric value, unit, and symbol
  from the source EXACTLY — do not round, alter, or invent numbers. Physics-accurate, neutral tone.

Rules:
- Express facts in your own words (do not copy sentences verbatim).
- Any math must be valid inline LaTeX between `$...$` (e.g. `$m_e = 9.109\times10^{-31}\,\text{kg}$`).
- If the source is ambiguous or not clearly about the intended physics term, set `draftSelf` low
  and say why in `notes`.
- Return ONLY the JSON object matching the provided schema.

Output schema fields: `{ shortEn, longEn, draftSelf (0–1), notes }`.

## USER (per term, not cached)
term id: {{id}}
intended label (EN): {{labelEn}}
Wikipedia lead (EN):
"""
{{wikipedia_extract_en}}
"""
Authoritative numeric facts from Wikidata (use these for any numbers; CC0):
{{wikidata_facts}}
