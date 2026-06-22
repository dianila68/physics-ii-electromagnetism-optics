// term id -> Wikipedia article title overrides.
//
// Why this exists (PLAN §1.3): resolving an article from `labelEn` alone
// mis-fires for ambiguous physics terms ("Polarization" is a disambiguation
// page; "Conductor" defaults to an orchestra conductor; etc.). For these we
// pin the canonical EN article title explicitly. If a term id is NOT listed
// here, the resolver falls back to (1) the `wikipedia` field already present
// in terms.json, then (2) the term's `labelEn` with `redirects=1`.
//
// Keep these EN titles; the IT article is resolved via langlinks from the EN
// page during ingest (more reliable than guessing an IT title) — see ingest.mjs.

export const ARTICLE_OVERRIDES = {
  // disambiguation / wrong-default targets
  'polarization': 'Polarization (waves)',
  'conductor': 'Electrical conductor',
  'dielectric': 'Dielectric',
  'resistance': 'Electrical resistance and conductance',
  'inductance': 'Inductance',
  'capacitance': 'Capacitance',
  'interference': 'Wave interference',
  'diffraction': 'Diffraction',
  'refractive-index': 'Refractive index',
  'permittivity': 'Permittivity',
  'permeability': 'Permeability (electromagnetism)',

  // named laws / equations (canonical titles differ from our kebab ids)
  'coulombs-law': "Coulomb's law",
  'ohms-law': "Ohm's law",
  'gauss-law': "Gauss's law",
  'ampere-law': "Ampère's circuital law",
  'faraday-law': "Faraday's law of induction",
  'lenz-law': "Lenz's law",
  'snell-law': "Snell's law",
  'biot-savart': 'Biot–Savart law',
  'kirchhoff': "Kirchhoff's circuit laws",
  'lorentz-force': 'Lorentz force',
  'maxwell-equations': "Maxwell's equations",
  'huygens': 'Huygens–Fresnel principle',
  'total-internal-reflection': 'Total internal reflection',
  'poynting-vector': 'Poynting vector',
  'em-wave': 'Electromagnetic radiation',

  // core fields / quantities (mostly resolve fine, pinned for stability)
  'electric-field': 'Electric field',
  'magnetic-field': 'Magnetic field',
  'electric-charge': 'Electric charge',
  'electric-current': 'Electric current',
  'electric-potential': 'Electric potential',
  'electric-dipole': 'Electric dipole moment',
};
