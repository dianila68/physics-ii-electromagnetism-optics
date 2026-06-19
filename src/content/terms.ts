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

export const TERMS: Record<string, TermDef> = {

  // ── Particles ──
  'quark': {
    labelEn: 'Quark',
    labelIt: 'Quark',
    shortEn: 'Elementary particle and fundamental constituent of matter, bound by the strong force.',
    shortIt: 'Particella elementare e costituente fondamentale della materia, legata dalla forza forte.',
    longEn: 'Quarks are spin-½ fermions that combine in groups of two (mesons) or three (baryons) to form hadrons. The six flavors are up (u), down (d), charm (c), strange (s), top (t), bottom (b). Proton = uud, Neutron = udd. Never found isolated — confinement.',
    longIt: 'I quark sono fermioni di spin-½ che si combinano in gruppi di due (mesoni) o tre (barioni) per formare adroni. I sei sapori sono: up (u), down (d), charm (c), strange (s), top (t), bottom (b). Protone = uud, Neutrone = udd.',
    seeAlso: ['proton', 'neutron', 'gluon'],
    wikipedia: 'Quark',
  },

  'electron': {
    labelEn: 'Electron',
    labelIt: 'Elettrone',
    shortEn: 'Stable lepton with charge −e = −1.602×10⁻¹⁹ C and mass 9.109×10⁻³¹ kg.',
    shortIt: 'Leptone stabile con carica −e = −1.602×10⁻¹⁹ C e massa 9.109×10⁻³¹ kg.',
    longEn: 'The electron is a fundamental particle (not composed of quarks). It occupies atomic shells/orbitals around the nucleus. In conductors, free electrons (conduction electrons) can move, carrying current. The electron\'s charge is the elementary unit of charge e.',
    longIt: 'L\'elettrone è una particella fondamentale (non composta da quark). Occupa i gusci/orbitali atomici attorno al nucleo. Nei conduttori, gli elettroni liberi (elettroni di conduzione) possono muoversi, trasportando corrente.',
    latex: 'e^- \\quad m_e = 9.109 \\times 10^{-31}\\,\\text{kg}',
    seeAlso: ['electric-charge', 'conductor'],
  },

  'proton': {
    labelEn: 'Proton',
    labelIt: 'Protone',
    shortEn: 'Positively charged baryon in the atomic nucleus, composed of 2 up quarks + 1 down quark.',
    shortIt: 'Barione a carica positiva nel nucleo atomico, composto da 2 quark up + 1 quark down.',
    longEn: 'The proton has charge +e and mass 1.673×10⁻²⁷ kg (≈ 1836 electron masses). Its quark content uud gives charge (2/3 + 2/3 − 1/3)e = +e. The number of protons in a nucleus defines the atomic number Z and the element.',
    longIt: 'Il protone ha carica +e e massa 1.673×10⁻²⁷ kg (≈ 1836 masse dell\'elettrone). Il suo contenuto di quark uud dà carica (2/3 + 2/3 − 1/3)e = +e. Il numero di protoni nel nucleo definisce il numero atomico Z e l\'elemento.',
    latex: 'p^+ \\quad m_p = 1.673 \\times 10^{-27}\\,\\text{kg}',
    seeAlso: ['quark', 'neutron', 'electric-charge'],
  },

  'neutron': {
    labelEn: 'Neutron',
    labelIt: 'Neutrone',
    shortEn: 'Electrically neutral baryon in the nucleus, composed of 1 up quark + 2 down quarks.',
    shortIt: 'Barione elettricamente neutro nel nucleo, composto da 1 quark up + 2 quark down.',
    longEn: 'The neutron has mass 1.675×10⁻²⁷ kg and zero net charge. Its quark content udd gives (2/3 − 1/3 − 1/3)e = 0. Neutrons stabilize the nucleus by providing strong force binding without adding electrostatic repulsion. Free neutrons are unstable (β-decay, τ ≈ 15 min).',
    longIt: 'Il neutrone ha massa 1.675×10⁻²⁷ kg e carica netta zero. Il suo contenuto di quark udd dà (2/3 − 1/3 − 1/3)e = 0. I neutroni stabilizzano il nucleo fornendo legame della forza forte senza aggiungere repulsione elettrostatica.',
    seeAlso: ['quark', 'proton'],
  },

  'gluon': {
    labelEn: 'Gluon',
    labelIt: 'Gluone',
    shortEn: 'Massless boson that mediates the strong nuclear force between quarks.',
    shortIt: 'Bosone privo di massa che media la forza nucleare forte tra i quark.',
    longEn: 'Gluons are the gauge bosons of quantum chromodynamics (QCD). They carry "color charge" and couple quarks together inside protons and neutrons. Unlike photons (which are electrically neutral), gluons interact with each other, leading to quark confinement.',
    longIt: 'I gluoni sono i bosoni di gauge della cromodinamica quantistica (QCD). Portano la "carica di colore" e legano i quark all\'interno di protoni e neutroni.',
    seeAlso: ['quark'],
  },

  // ── Electrostatics ──
  'electric-charge': {
    labelEn: 'Electric charge',
    labelIt: 'Carica elettrica',
    shortEn: 'Fundamental property of matter causing electromagnetic interactions. Quantized: q = ne.',
    shortIt: 'Proprietà fondamentale della materia che causa interazioni elettromagnetiche. Quantizzata: q = ne.',
    longEn: 'Electric charge comes in two signs (positive/negative). Like charges repel, unlike attract. It is conserved (total charge of an isolated system is constant) and quantized in units of e = 1.602×10⁻¹⁹ C. The charge of a proton is +e, an electron −e.',
    longIt: 'La carica elettrica viene in due segni (positivo/negativo). Cariche uguali si respingono, opposte si attraggono. È conservata e quantizzata in unità di e = 1.602×10⁻¹⁹ C.',
    latex: 'q = ne, \\quad e = 1.602 \\times 10^{-19}\\,\\text{C}',
    seeAlso: ['coulombs-law', 'electric-field'],
  },

  'coulombs-law': {
    labelEn: 'Coulomb\'s Law',
    labelIt: 'Legge di Coulomb',
    shortEn: 'The electrostatic force between two point charges is proportional to their product and inversely proportional to r².',
    shortIt: 'La forza elettrostatica tra due cariche puntiformi è proporzionale al loro prodotto e inversamente proporzionale a r².',
    longEn: 'Discovered by Charles-Augustin de Coulomb in 1785. The force is: F = kₑ q₁q₂/r². Coulomb\'s constant kₑ = 8.988×10⁹ N·m²/C² = 1/(4πε₀). The force is repulsive for same-sign charges, attractive for opposite-sign. Same r² law as gravity but ~10³⁶ times stronger between electron and proton.',
    longIt: 'Scoperta da Charles-Augustin de Coulomb nel 1785. La forza è: F = kₑ q₁q₂/r². Costante kₑ = 8.988×10⁹ N·m²/C². Repulsiva per cariche dello stesso segno, attrattiva per segni opposti.',
    latex: '\\vec{F} = k_e \\frac{q_1 q_2}{r^2}\\hat{r}, \\quad k_e = 8.988\\times10^9\\,\\text{N·m}^2/\\text{C}^2',
    seeAlso: ['electric-field', 'electric-charge', 'permittivity'],
  },

  'electric-field': {
    labelEn: 'Electric field',
    labelIt: 'Campo elettrico',
    shortEn: 'Vector field E giving the force per unit positive test charge at each point in space.',
    shortIt: 'Campo vettoriale E che dà la forza per unità di carica di prova positiva in ogni punto dello spazio.',
    longEn: 'Defined as E = F/q₀ (force on test charge q₀ → 0). For a point charge Q: E = kₑQ/r² r̂. Field lines point away from positive, toward negative charges. The electric field is related to potential by E = −∇V. Units: N/C = V/m.',
    longIt: 'Definito come E = F/q₀ (forza su carica di prova q₀ → 0). Per una carica puntiforme Q: E = kₑQ/r² r̂. Le linee di campo puntano dalle cariche positive verso le negative. Unità: N/C = V/m.',
    latex: '\\vec{E} = k_e \\frac{Q}{r^2}\\hat{r}, \\quad \\vec{E} = -\\nabla V',
    seeAlso: ['coulombs-law', 'electric-potential', 'gauss-law'],
  },

  'gauss-law': {
    labelEn: 'Gauss\'s Law',
    labelIt: 'Legge di Gauss',
    shortEn: 'The total electric flux through any closed surface equals the enclosed charge divided by ε₀.',
    shortIt: 'Il flusso elettrico totale attraverso qualsiasi superficie chiusa è uguale alla carica racchiusa divisa per ε₀.',
    longEn: 'One of Maxwell\'s four equations. ∮E·dA = Q_enc/ε₀. Allows calculating E for symmetric charge distributions (spheres, cylinders, planes) without integration. The Gaussian surface must be chosen to exploit the symmetry — making E uniform and parallel to dA.',
    longIt: 'Una delle quattro equazioni di Maxwell. ∮E·dA = Q_enc/ε₀. Permette di calcolare E per distribuzioni di carica simmetriche senza integrare.',
    latex: '\\oint \\vec{E}\\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}',
    seeAlso: ['electric-field', 'permittivity', 'maxwell-equations'],
  },

  'electric-potential': {
    labelEn: 'Electric potential',
    labelIt: 'Potenziale elettrico',
    shortEn: 'Scalar field V: work per unit charge to bring a test charge from infinity to a point. Units: volt (V).',
    shortIt: 'Campo scalare V: lavoro per unità di carica per portare una carica di prova dall\'infinito a un punto. Unità: volt (V).',
    longEn: 'V = −∫E·dl from reference (usually infinity). For a point charge Q: V = kₑQ/r. Potential difference ΔV = V_B − V_A = −∫E·dl from A to B. Work done by field: W = q·ΔV. Equipotential surfaces are perpendicular to field lines.',
    longIt: 'V = −∫E·dl da riferimento (di solito l\'infinito). Per una carica puntiforme Q: V = kₑQ/r. La differenza di potenziale ΔV = V_B − V_A = −∫E·dl da A a B.',
    latex: 'V = k_e \\frac{Q}{r}, \\quad \\vec{E} = -\\nabla V',
    seeAlso: ['electric-field', 'capacitance'],
  },

  'capacitance': {
    labelEn: 'Capacitance',
    labelIt: 'Capacità',
    shortEn: 'C = Q/V. Ability of a system to store electric charge per volt. Unit: farad (F).',
    shortIt: 'C = Q/V. Capacità di un sistema di immagazzinare carica elettrica per volt. Unità: farad (F).',
    longEn: 'A capacitor stores energy in the electric field between two conductors. For a parallel-plate capacitor: C = ε₀A/d. Energy stored: U = ½CV² = Q²/(2C). With a dielectric of constant κ: C = κε₀A/d. Capacitors in series add as 1/C_tot = Σ1/Cᵢ; in parallel: C_tot = ΣCᵢ.',
    longIt: 'Un condensatore immagazzina energia nel campo elettrico tra due conduttori. Per un condensatore a facce piane: C = ε₀A/d. Energia: U = ½CV².',
    latex: 'C = \\frac{Q}{V} = \\varepsilon_0\\frac{A}{d}, \\quad U = \\frac{1}{2}CV^2',
    seeAlso: ['electric-potential', 'permittivity', 'dielectric'],
  },

  'permittivity': {
    labelEn: 'Permittivity (ε₀)',
    labelIt: 'Permettività (ε₀)',
    shortEn: 'ε₀ = 8.854×10⁻¹² C²/(N·m²). Constant relating electric field to charge density in vacuum.',
    shortIt: 'ε₀ = 8.854×10⁻¹² C²/(N·m²). Costante che lega il campo elettrico alla densità di carica nel vuoto.',
    longEn: 'The permittivity of free space ε₀ appears in Coulomb\'s law (kₑ = 1/(4πε₀)) and in Maxwell\'s equations. In a dielectric medium: ε = κε₀ where κ is the relative permittivity (dielectric constant). Related to speed of light: c = 1/√(μ₀ε₀).',
    longIt: 'La permettività del vuoto ε₀ appare nella legge di Coulomb (kₑ = 1/(4πε₀)) e nelle equazioni di Maxwell.',
    latex: '\\varepsilon_0 = 8.854\\times10^{-12}\\,\\frac{\\text{C}^2}{\\text{N}\\cdot\\text{m}^2}, \\quad k_e = \\frac{1}{4\\pi\\varepsilon_0}',
    seeAlso: ['coulombs-law', 'gauss-law'],
  },

  'conductor': {
    labelEn: 'Conductor',
    labelIt: 'Conduttore',
    shortEn: 'Material with free electrons that can move under an applied electric field, enabling current flow.',
    shortIt: 'Materiale con elettroni liberi che possono muoversi sotto un campo elettrico applicato, consentendo il flusso di corrente.',
    longEn: 'In a conductor, conduction electrons are not bound to specific atoms. In electrostatic equilibrium: E = 0 inside, excess charge resides on surface, surface is an equipotential. Conductors shield their interiors from external fields. Examples: Cu, Ag, Al. Resistivity ~10⁻⁸ Ω·m.',
    longIt: 'In un conduttore, gli elettroni di conduzione non sono legati ad atomi specifici. All\'equilibrio elettrostatico: E = 0 all\'interno, la carica in eccesso risiede sulla superficie.',
    seeAlso: ['electric-field', 'ohms-law'],
  },

  'dielectric': {
    labelEn: 'Dielectric',
    labelIt: 'Dielettrico',
    shortEn: 'Insulating material that becomes polarized in an electric field, increasing capacitance by factor κ.',
    shortIt: 'Materiale isolante che si polarizza in un campo elettrico, aumentando la capacità di un fattore κ.',
    longEn: 'When a dielectric is placed in an electric field, its molecules align (or distort) creating an opposing polarization field that reduces the net E inside. This allows the capacitor to store more charge at the same voltage. The dielectric constant (relative permittivity) κ = ε/ε₀ > 1.',
    longIt: 'Quando un dielettrico è posto in un campo elettrico, le sue molecole si allineano (o si distorcono) creando un campo di polarizzazione che riduce il campo E netto all\'interno.',
    seeAlso: ['capacitance', 'permittivity', 'electric-dipole'],
  },

  'electric-dipole': {
    labelEn: 'Electric dipole',
    labelIt: 'Dipolo elettrico',
    shortEn: 'A pair of equal and opposite charges ±q separated by distance d. Dipole moment p = qd.',
    shortIt: 'Una coppia di cariche uguali e opposte ±q separate da una distanza d. Momento di dipolo p = qd.',
    longEn: 'The electric dipole moment p = qd (vector from − to +). In an external field E, a dipole experiences torque τ = p × E and has potential energy U = −p·E. The far-field of a dipole falls as 1/r³ (faster than a monopole). Water is a classic permanent electric dipole (κ ≈ 80).',
    longIt: 'Il momento di dipolo p = qd (vettore da − a +). In un campo esterno E, un dipolo subisce coppia τ = p × E e ha energia potenziale U = −p·E.',
    latex: '\\vec{p} = q\\vec{d}, \\quad \\vec{\\tau} = \\vec{p}\\times\\vec{E}',
    seeAlso: ['electric-field', 'dielectric'],
  },

  // ── Circuits ──
  'ohms-law': {
    labelEn: 'Ohm\'s Law',
    labelIt: 'Legge di Ohm',
    shortEn: 'V = IR. The voltage across a resistor equals current times resistance, for ohmic materials.',
    shortIt: 'V = IR. La tensione ai capi di una resistenza è uguale alla corrente per la resistenza, per materiali ohmici.',
    longEn: 'Macroscopic form: V = IR. Microscopic form: J = σE where σ is conductivity, J is current density. Resistance R = ρL/A depends on resistivity ρ, length L, and cross-section A. Not all materials are ohmic (diodes, transistors are non-linear). Power: P = IV = I²R = V²/R.',
    longIt: 'Forma macroscopica: V = IR. Forma microscopica: J = σE dove σ è la conduttività. Resistenza R = ρL/A.',
    latex: 'V = IR, \\quad \\vec{J} = \\sigma\\vec{E}, \\quad P = IV = I^2R',
    seeAlso: ['electric-current', 'resistance', 'kirchhoff'],
  },

  'electric-current': {
    labelEn: 'Electric current',
    labelIt: 'Corrente elettrica',
    shortEn: 'I = dq/dt. Rate of charge flow through a cross-section. Unit: ampere (A = C/s).',
    shortIt: 'I = dq/dt. Velocità del flusso di carica attraverso una sezione. Unità: ampere (A = C/s).',
    longEn: 'Current direction is defined as the direction positive charges would flow (opposite to electron flow). Current density J = I/A = nqv_d where n is carrier density and v_d is drift velocity. In metals, v_d is very slow (~mm/s) even though the electric signal travels at ~c.',
    longIt: 'La direzione della corrente è definita come la direzione in cui fluirebbero le cariche positive (opposta al flusso degli elettroni). Densità di corrente J = nqv_d.',
    latex: 'I = \\frac{dq}{dt}, \\quad \\vec{J} = nq\\vec{v}_d',
    seeAlso: ['ohms-law', 'kirchhoff'],
  },

  'resistance': {
    labelEn: 'Resistance',
    labelIt: 'Resistenza',
    shortEn: 'R = V/I. Opposition to current flow. Unit: ohm (Ω). R = ρL/A for a uniform conductor.',
    shortIt: 'R = V/I. Opposizione al flusso di corrente. Unità: ohm (Ω). R = ρL/A per un conduttore uniforme.',
    longEn: 'Resistance depends on material (resistivity ρ), geometry (R = ρL/A), and temperature. For most metals, ρ increases with temperature: ρ(T) = ρ₀[1 + α(T−T₀)]. Series: R_tot = ΣRᵢ. Parallel: 1/R_tot = Σ1/Rᵢ. Power dissipated as heat: P = I²R (Joule heating).',
    longIt: 'La resistenza dipende dal materiale (resistività ρ), dalla geometria (R = ρL/A) e dalla temperatura. Serie: R_tot = ΣRᵢ. Parallelo: 1/R_tot = Σ1/Rᵢ.',
    latex: 'R = \\frac{V}{I} = \\rho\\frac{L}{A}',
    seeAlso: ['ohms-law', 'kirchhoff'],
  },

  'kirchhoff': {
    labelEn: 'Kirchhoff\'s Laws',
    labelIt: 'Leggi di Kirchhoff',
    shortEn: 'KCL: sum of currents at a node = 0. KVL: sum of voltages around a loop = 0.',
    shortIt: 'KCL: somma delle correnti a un nodo = 0. KVL: somma delle tensioni attorno a una maglia = 0.',
    longEn: 'KCL (current law): the algebraic sum of currents entering a node is zero — conservation of charge. KVL (voltage law): the algebraic sum of voltage changes around any closed loop is zero — conservation of energy. Together they allow solving any linear circuit.',
    longIt: 'KCL (legge delle correnti): la somma algebrica delle correnti entranti in un nodo è zero — conservazione della carica. KVL (legge delle tensioni): la somma delle variazioni di tensione attorno a qualsiasi maglia è zero.',
    latex: '\\sum_k I_k = 0 \\quad (\\text{KCL}), \\qquad \\sum_k V_k = 0 \\quad (\\text{KVL})',
    seeAlso: ['electric-current', 'resistance'],
  },

  // ── Magnetism ──
  'magnetic-field': {
    labelEn: 'Magnetic field',
    labelIt: 'Campo magnetico',
    shortEn: 'Vector field B that exerts a force on moving charges: F = qv × B. Unit: tesla (T).',
    shortIt: 'Campo vettoriale B che esercita una forza sulle cariche in moto: F = qv × B. Unità: tesla (T).',
    longEn: 'Unlike E fields, B fields have no monopoles (∮B·dA = 0). B is created by moving charges (currents). Long straight wire: B = μ₀I/(2πr). Inside solenoid: B = μ₀nI. The direction follows the right-hand rule: curl fingers in the direction of current, thumb points in B direction.',
    longIt: 'A differenza dei campi E, i campi B non hanno monopoli (∮B·dA = 0). B è creato da cariche in moto (correnti). Filo rettilineo lungo: B = μ₀I/(2πr).',
    latex: '\\vec{F} = q\\vec{v}\\times\\vec{B}, \\quad [B] = \\text{T} = \\text{kg/(A·s}^2\\text{)}',
    seeAlso: ['lorentz-force', 'biot-savart', 'ampere-law'],
  },

  'lorentz-force': {
    labelEn: 'Lorentz force',
    labelIt: 'Forza di Lorentz',
    shortEn: 'F = q(E + v × B). Total electromagnetic force on a charged particle.',
    shortIt: 'F = q(E + v × B). Forza elettromagnetica totale su una particella carica.',
    longEn: 'The magnetic part qv×B is always perpendicular to velocity — does no work, only changes direction. This causes circular motion in a uniform B field with cyclotron radius r = mv/(|q|B) and frequency ω_c = |q|B/m. Applications: mass spectrometers, particle accelerators, aurora borealis.',
    longIt: 'La parte magnetica qv×B è sempre perpendicolare alla velocità — non compie lavoro, cambia solo direzione. Causa moto circolare in campo B uniforme con raggio r = mv/(|q|B).',
    latex: '\\vec{F} = q(\\vec{E} + \\vec{v}\\times\\vec{B}), \\quad r = \\frac{mv}{|q|B}',
    seeAlso: ['magnetic-field', 'biot-savart'],
  },

  'biot-savart': {
    labelEn: 'Biot-Savart Law',
    labelIt: 'Legge di Biot-Savart',
    shortEn: 'dB = (μ₀/4π) I dl × r̂/r². Gives the magnetic field from a current element.',
    shortIt: 'dB = (μ₀/4π) I dl × r̂/r². Dà il campo magnetico da un elemento di corrente.',
    longEn: 'The magnetic analogue of Coulomb\'s law. Integrating over the full current gives the total B field. For a long straight wire: B = μ₀I/(2πr). For a circular loop at center: B = μ₀I/(2R). Permeability μ₀ = 4π×10⁻⁷ T·m/A.',
    longIt: 'L\'analogo magnetico della legge di Coulomb. Integrando su tutta la corrente si ottiene il campo B totale. Per un filo rettilineo lungo: B = μ₀I/(2πr).',
    latex: 'd\\vec{B} = \\frac{\\mu_0}{4\\pi}\\frac{I\\,d\\vec{\\ell}\\times\\hat{r}}{r^2}',
    seeAlso: ['magnetic-field', 'ampere-law', 'permeability'],
  },

  'ampere-law': {
    labelEn: 'Ampère\'s Law',
    labelIt: 'Legge di Ampère',
    shortEn: '∮B·dl = μ₀I_enc. The line integral of B around any closed loop equals μ₀ × enclosed current.',
    shortIt: '∮B·dl = μ₀I_enc. L\'integrale di linea di B attorno a qualsiasi percorso chiuso è uguale a μ₀ × corrente racchiusa.',
    longEn: 'Analogous to Gauss\'s law for electric fields. Useful for symmetric geometries. Maxwell extended it with the displacement current: ∮B·dl = μ₀(I_enc + ε₀ dΦ_E/dt). This extension allows EM wave propagation even in vacuum.',
    longIt: 'Analogo alla legge di Gauss per i campi elettrici. Maxwell l\'ha estesa con la corrente di spostamento: ∮B·dl = μ₀(I_enc + ε₀ dΦ_E/dt).',
    latex: '\\oint\\vec{B}\\cdot d\\vec{\\ell} = \\mu_0 I_{\\text{enc}}',
    seeAlso: ['magnetic-field', 'maxwell-equations', 'permeability'],
  },

  'permeability': {
    labelEn: 'Permeability (μ₀)',
    labelIt: 'Permeabilità (μ₀)',
    shortEn: 'μ₀ = 4π×10⁻⁷ T·m/A. Magnetic constant of free space, relating B field to its sources.',
    shortIt: 'μ₀ = 4π×10⁻⁷ T·m/A. Costante magnetica del vuoto, che lega il campo B alle sue sorgenti.',
    longEn: 'Appears in the Biot-Savart law and Ampère\'s law. Together with ε₀, determines the speed of light: c = 1/√(μ₀ε₀). In magnetic materials: μ = μᵣμ₀ where μᵣ is relative permeability (>1 for paramagnetic, <1 for diamagnetic, >> 1 for ferromagnetic materials like iron).',
    longIt: 'Appare nella legge di Biot-Savart e di Ampère. Insieme a ε₀, determina la velocità della luce: c = 1/√(μ₀ε₀).',
    latex: '\\mu_0 = 4\\pi\\times10^{-7}\\,\\text{T}\\cdot\\text{m}/\\text{A}, \\quad c = \\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}}',
    seeAlso: ['ampere-law', 'permittivity'],
  },

  // ── Induction ──
  'faraday-law': {
    labelEn: 'Faraday\'s Law',
    labelIt: 'Legge di Faraday',
    shortEn: 'ε = −dΦ_B/dt. A changing magnetic flux induces an EMF. The basis of generators and transformers.',
    shortIt: 'ε = −dΦ_B/dt. Un flusso magnetico variabile induce una fem. Base di generatori e trasformatori.',
    longEn: 'Discovered by Michael Faraday (1831) and Joseph Henry independently. The induced EMF is proportional to the rate of change of magnetic flux. For N turns: ε = −N dΦ/dt. The minus sign (Lenz\'s law) means the induced current opposes the change. Forms the basis of all electric generators.',
    longIt: 'Scoperta da Michael Faraday (1831). La fem indotta è proporzionale alla velocità di variazione del flusso magnetico. Per N spire: ε = −N dΦ/dt.',
    latex: '\\mathcal{E} = -\\frac{d\\Phi_B}{dt} = -\\frac{d}{dt}\\int\\vec{B}\\cdot d\\vec{A}',
    seeAlso: ['magnetic-field', 'lenz-law', 'inductance'],
  },

  'lenz-law': {
    labelEn: 'Lenz\'s Law',
    labelIt: 'Legge di Lenz',
    shortEn: 'The induced current flows in a direction that opposes the change in flux causing it.',
    shortIt: 'La corrente indotta scorre in una direzione che si oppone alla variazione di flusso che la causa.',
    longEn: 'A consequence of conservation of energy. If the induced current reinforced the flux change, it would amplify itself indefinitely (free energy). Instead, nature opposes: flux increasing → induced B opposes increase; flux decreasing → induced B opposes decrease. This is why eddy currents brake metal objects moving in B fields.',
    longIt: 'Conseguenza della conservazione dell\'energia. Flusso in aumento → B indotto si oppone all\'aumento; flusso in diminuzione → B indotto si oppone alla diminuzione.',
    seeAlso: ['faraday-law', 'inductance'],
  },

  'inductance': {
    labelEn: 'Inductance',
    labelIt: 'Induttanza',
    shortEn: 'L = NΦ/I. Self-inductance: opposes current change ε = −L dI/dt. Unit: henry (H).',
    shortIt: 'L = NΦ/I. Autoinduzione: si oppone alla variazione di corrente ε = −L dI/dt. Unità: henry (H).',
    longEn: 'Self-inductance L quantifies how much a coil opposes changes in its own current. For a solenoid: L = μ₀n²V where V is volume and n is turns/length. Energy stored: U = ½LI². Mutual inductance M describes how one coil induces EMF in another: ε₂ = −M dI₁/dt.',
    longIt: 'L\'autoinduzione L quantifica quanto una bobina si oppone alle variazioni della propria corrente. Per un solenoide: L = μ₀n²V. Energia: U = ½LI².',
    latex: '\\mathcal{E}_L = -L\\frac{dI}{dt}, \\quad U_L = \\frac{1}{2}LI^2',
    seeAlso: ['faraday-law', 'lenz-law'],
  },

  // ── Maxwell ──
  'maxwell-equations': {
    labelEn: 'Maxwell\'s Equations',
    labelIt: 'Equazioni di Maxwell',
    shortEn: 'Four equations unifying electricity and magnetism, predicting EM waves at speed c = 1/√(μ₀ε₀).',
    shortIt: 'Quattro equazioni che unificano elettricità e magnetismo, predicendo onde EM a velocità c = 1/√(μ₀ε₀).',
    longEn: 'Formulated by James Clerk Maxwell (1865). The four equations are: (1) Gauss\'s law for E, (2) Gauss\'s law for B (no monopoles), (3) Faraday\'s law, (4) Ampère-Maxwell law. Together they predict self-sustaining EM waves in vacuum at c = 1/√(μ₀ε₀) ≈ 3×10⁸ m/s — proving light is an EM wave.',
    longIt: 'Formulate da James Clerk Maxwell (1865). Le quattro equazioni predicono onde EM auto-sostenute nel vuoto a c = 1/√(μ₀ε₀) ≈ 3×10⁸ m/s — dimostrando che la luce è un\'onda EM.',
    seeAlso: ['gauss-law', 'faraday-law', 'ampere-law', 'em-wave'],
  },

  'em-wave': {
    labelEn: 'Electromagnetic wave',
    labelIt: 'Onda elettromagnetica',
    shortEn: 'Self-propagating oscillations of E and B fields, perpendicular to each other and to propagation. Speed c in vacuum.',
    shortIt: 'Oscillazioni auto-propaganti dei campi E e B, perpendicolari tra loro e alla propagazione. Velocità c nel vuoto.',
    longEn: 'Derived from Maxwell\'s equations in vacuum: ∇²E = μ₀ε₀ ∂²E/∂t². The E and B fields oscillate in phase, perpendicular to each other, with B = E/c. Energy flux: Poynting vector S = E×B/μ₀. Spectrum: radio → microwave → IR → visible → UV → X-ray → γ-ray.',
    longIt: 'Derivata dalle equazioni di Maxwell nel vuoto. I campi E e B oscillano in fase, perpendicolari tra loro, con B = E/c. Flusso di energia: vettore di Poynting S = E×B/μ₀.',
    latex: 'c = \\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}} \\approx 3\\times10^8\\,\\text{m/s}',
    seeAlso: ['maxwell-equations', 'poynting-vector'],
  },

  'poynting-vector': {
    labelEn: 'Poynting vector',
    labelIt: 'Vettore di Poynting',
    shortEn: 'S = E × B / μ₀. Energy flux density of an EM wave (power per unit area). Unit: W/m².',
    shortIt: 'S = E × B / μ₀. Densità del flusso di energia di un\'onda EM (potenza per unità di area). Unità: W/m².',
    longEn: 'Named after John Henry Poynting (1884). The Poynting vector S points in the direction of energy propagation, with magnitude equal to the intensity of the EM wave. Time-averaged: ⟨S⟩ = E₀²/(2μ₀c). The radiation pressure on a surface is P = S/c (absorbing) or 2S/c (reflecting).',
    longIt: 'Prende il nome da John Henry Poynting (1884). Il vettore di Poynting S punta nella direzione di propagazione dell\'energia, con intensità media ⟨S⟩ = E₀²/(2μ₀c).',
    latex: '\\vec{S} = \\frac{1}{\\mu_0}\\vec{E}\\times\\vec{B}, \\quad \\langle S\\rangle = \\frac{E_0^2}{2\\mu_0 c}',
    seeAlso: ['em-wave', 'maxwell-equations'],
  },

  // ── Optics ──
  'refractive-index': {
    labelEn: 'Refractive index',
    labelIt: 'Indice di rifrazione',
    shortEn: 'n = c/v. Ratio of light speed in vacuum to speed in medium. Dimensionless, always ≥ 1.',
    shortIt: 'n = c/v. Rapporto tra la velocità della luce nel vuoto e la velocità nel mezzo. Adimensionale, sempre ≥ 1.',
    longEn: 'The refractive index determines how much light bends at an interface (Snell\'s law) and the critical angle for total internal reflection. n_vacuum = 1, n_water ≈ 1.33, n_glass ≈ 1.5, n_diamond ≈ 2.42. In a dispersive medium, n depends on wavelength — this causes rainbows and chromatic aberration.',
    longIt: 'L\'indice di rifrazione determina quanto la luce si piega all\'interfaccia (legge di Snell). n_vuoto = 1, n_acqua ≈ 1.33, n_vetro ≈ 1.5, n_diamante ≈ 2.42.',
    latex: 'n = \\frac{c}{v}, \\quad n_1\\sin\\theta_1 = n_2\\sin\\theta_2',
    seeAlso: ['snell-law', 'total-internal-reflection'],
  },

  'snell-law': {
    labelEn: 'Snell\'s Law',
    labelIt: 'Legge di Snell',
    shortEn: 'n₁ sin θ₁ = n₂ sin θ₂. Conservation of the tangential component of the wave vector at an interface.',
    shortIt: 'n₁ sin θ₁ = n₂ sin θ₂. Conservazione della componente tangenziale del vettore d\'onda all\'interfaccia.',
    longEn: 'Describes refraction of light (or any wave) at a boundary between two media. The wave slows when entering a denser medium (higher n) and bends toward the normal. When going from dense to sparse medium (n₁ > n₂), the angle increases until θ₂ = 90° → total internal reflection.',
    longIt: 'Descrive la rifrazione della luce all\'interfaccia tra due mezzi. L\'onda rallenta entrando in un mezzo più denso (n più alto) e si avvicina alla normale.',
    latex: 'n_1\\sin\\theta_1 = n_2\\sin\\theta_2',
    seeAlso: ['refractive-index', 'total-internal-reflection'],
  },

  'total-internal-reflection': {
    labelEn: 'Total internal reflection (TIR)',
    labelIt: 'Riflessione totale interna (RTI)',
    shortEn: 'When θ > θ_c = arcsin(n₂/n₁), light in a denser medium cannot escape — all is reflected.',
    shortIt: 'Quando θ > θ_c = arcsin(n₂/n₁), la luce in un mezzo più denso non può sfuggire — tutta viene riflessa.',
    longEn: 'Critical angle: sin θ_c = n₂/n₁ (requires n₁ > n₂). Beyond this angle, there is no transmitted ray — all energy is reflected. Applications: optical fibers (light trapped in glass core), prisms in binoculars, diamonds (high n gives sparkle from many TIR reflections).',
    longIt: 'Angolo critico: sin θ_c = n₂/n₁ (richiede n₁ > n₂). Oltre questo angolo, non c\'è raggio trasmesso — tutta l\'energia viene riflessa. Applicazioni: fibre ottiche, prismi, diamanti.',
    latex: '\\sin\\theta_c = \\frac{n_2}{n_1} \\quad (n_1 > n_2)',
    seeAlso: ['snell-law', 'refractive-index'],
  },

  'interference': {
    labelEn: 'Interference',
    labelIt: 'Interferenza',
    shortEn: 'Superposition of two or more coherent waves. Constructive when path diff = mλ; destructive when (m+½)λ.',
    shortIt: 'Sovrapposizione di due o più onde coerenti. Costruttiva quando diff. di cammino = mλ; distruttiva quando (m+½)λ.',
    longEn: 'Interference requires coherent sources (same frequency, stable phase relationship). Young\'s double-slit experiment demonstrated light\'s wave nature. Fringe spacing: Δy = λL/d. Interference is used in: anti-reflection coatings, interferometers (detecting gravitational waves), structural colors in butterfly wings.',
    longIt: 'L\'interferenza richiede sorgenti coerenti. Esperimento di Young: spaziatura delle frange Δy = λL/d. Usata in: rivestimenti antiriflesso, interferometri (onde gravitazionali).',
    latex: 'd\\sin\\theta = m\\lambda \\quad (\\text{bright}), \\quad \\Delta y = \\frac{\\lambda L}{d}',
    seeAlso: ['diffraction', 'huygens'],
  },

  'diffraction': {
    labelEn: 'Diffraction',
    labelIt: 'Diffrazione',
    shortEn: 'Bending of waves around obstacles or through openings, significant when λ ≈ aperture size.',
    shortIt: 'Piega delle onde attorno agli ostacoli o attraverso le aperture, significativa quando λ ≈ dimensione dell\'apertura.',
    longEn: 'A consequence of Huygens\' principle: every point on a wavefront radiates secondary wavelets, whose superposition produces the diffracted pattern. Single slit minima: a sin θ = mλ. Diffraction gratings use many slits to produce sharp maxima: d sin θ = mλ (now d = slit separation).',
    longIt: 'Conseguenza del principio di Huygens. Minimi singola fenditura: a sin θ = mλ. Reticoli di diffrazione: d sin θ = mλ.',
    latex: 'a\\sin\\theta = m\\lambda \\quad (\\text{single slit minima})',
    seeAlso: ['interference', 'huygens'],
  },

  'huygens': {
    labelEn: 'Huygens\' principle',
    labelIt: 'Principio di Huygens',
    shortEn: 'Every point on a wavefront is a secondary source of spherical wavelets. The next wavefront is their envelope.',
    shortIt: 'Ogni punto di un fronte d\'onda è sorgente secondaria di onde sferiche. Il fronte d\'onda successivo è il loro inviluppo.',
    longEn: 'Proposed by Christiaan Huygens (1678). Explains reflection, refraction, diffraction, and interference geometrically. The secondary wavelets all travel at the wave speed in the medium. The envelope construction shows why waves refract (different speeds in different media) and diffract (wavelets from an opening spread out).',
    longIt: 'Proposto da Christiaan Huygens (1678). Spiega geometricamente riflessione, rifrazione, diffrazione e interferenza.',
    seeAlso: ['interference', 'diffraction', 'snell-law'],
  },

  'polarization': {
    labelEn: 'Polarization',
    labelIt: 'Polarizzazione',
    shortEn: 'Orientation of the E field oscillation in a transverse EM wave. Can be linear, circular, or elliptical.',
    shortIt: 'Orientamento dell\'oscillazione del campo E in un\'onda EM trasversale. Può essere lineare, circolare o ellittica.',
    longEn: 'Natural light is unpolarized (E oscillates in all transverse directions). A polarizer transmits only one orientation. Intensity after polarizer: I = I₀ cos²θ (Malus\'s law). Brewster\'s angle: tan θ_B = n₂/n₁ — reflected light is completely polarized. Used in: sunglasses, LCD screens, photography filters.',
    longIt: 'Luce naturale non polarizzata (E oscilla in tutte le direzioni trasversali). Intensità dopo polarizzatore: I = I₀ cos²θ (legge di Malus). Angolo di Brewster: tan θ_B = n₂/n₁.',
    latex: 'I = I_0\\cos^2\\theta \\quad (\\text{Malus}), \\quad \\tan\\theta_B = \\frac{n_2}{n_1}',
    seeAlso: ['em-wave', 'interference'],
  },
};
