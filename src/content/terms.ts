export interface TermDef {
  labelEn: string;
  labelIt: string;
  shortEn: string;
  shortIt: string;
  longEn: string;
  longIt: string;
  latex?: string;
  seeAlso?: string[];
  wikipedia?: string;
}

export let TERMS: Record<string, TermDef> = {};

export async function loadTerms() {
  const res = await fetch('/terms.json');
  TERMS = await res.json();
}
