/**
 * game.js.txt
 * Schlaraffia — Fun Engineering Build (Package A)
 *
 * This revision adds:
 * - Mode selection (Casual / Standard / Deep)
 * - Distinct city gimmicks
 * - Tarot powers
 * - Rare world events
 * - Recurring NPC encounters
 * - Rumor system
 * - Package B: graph-native lieutenants / mini-bosses
 * - Slim HUD and Pass D-lite output polish
 *
 * Designed for the browser terminal adapter already used by the project.
 */

// ============================================================================
// BROWSER TERMINAL ADAPTER
// ============================================================================
const terminal = document.getElementById('output');
const commandLine = document.getElementById('command-line');
let pendingResolve = null;

commandLine.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && pendingResolve) {
    const value = commandLine.value;
    commandLine.value = '';
    printToScreen(`> ${value}`, '#ffffff');
    const resolver = pendingResolve;
    pendingResolve = null;
    resolver(value);
  }
});

function printToScreen(text, fallbackColor = '#e0e0e0') {
  let htmlText = String(text)
    .replace(/\x1b\[31m/g, '<span style="color:#ff5555;">')
    .replace(/\x1b\[32m/g, '<span style="color:#50fa7b;">')
    .replace(/\x1b\[33m/g, '<span style="color:#f1fa8c;">')
    .replace(/\x1b\[35m/g, '<span style="color:#ff79c6;">')
    .replace(/\x1b\[36m/g, '<span style="color:#8be9fd;">')
    .replace(/\x1b\[0m/g, '</span>');
  const div = document.createElement('div');
  div.style.color = fallbackColor;
  div.innerHTML = htmlText;
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
}

console.log = (msg) => printToScreen(msg);
console.clear = () => { terminal.innerHTML = ''; };
const ask = (query) => {
  if (query) printToScreen(query, '#f1fa8c');
  commandLine.focus();
  return new Promise(resolve => { pendingResolve = resolve; });
};

// ============================================================================
// MODES / FUN STRINGS
// ============================================================================
const MODE_CONFIGS = {
  Casual: {
    name: 'Casual',
    frictionMultiplier: 0.70,
    caseVolatilityMultiplier: 0.72,
    burnAlwaysHelps: true,
    burnGood: 0.10,
    burnBad: 0.04,
    insightCost: 0.05,
    insightBonus: 0.08,
    corruptionGain: 0.05,
    corruptionRelMod: 0.00,
    contamBase: 0.10,
    contamExposure: 0.18,
    contamAggression: 0.08,
    burnContamMultiplier: 0.20,
    contamBiasInc: 0.25,
    contamTaxInc: 0.02,
    minCities: 1,
    minClues: 2,
    minCoverage: 0.40,
    minConfidence: 0.32,
    strongCaseEnabled: true,
    strongClues: 1,
    strongCoverage: 0.50,
    strongConfidence: 0.55,
    clueConfidenceFactor: 0.48,
    clueContradictionFactor: 0.12,
    clueCrystallizationFactor: 0.13,
    resolvedThreshold: 0.60,
    partialThreshold: 0.38,
    reputationResolvedGain: 0.07,
    exposureResolvedGain: 0.08,
    exposurePartialGain: 0.06,
    exposureFailGain: 0.03,
    corruptionPartialGain: 0.03,
    corruptionFailGain: 0.08,
    sleepCorruptionHeal: 0.09,
    sleepDreamPenalty: 0.01,
    sleepInsightGain: 0.06,
    revealEndgameHints: true,
    invalidDiscernScore: 0.20,
    endgameInterference: ['shadow_injection', 'contradiction_spike', 'shadow_injection'],
    endgameBaseConfidence: 0.24,
    endgameBaseContradiction: 0.14,
    endgameSpike: 0.05,
    endgameBaseCrystallization: 0.08,
    endgameBaseAmbiguity: 0.08,
    interpretTarotWeight: 0.58,
    interpretConfidenceWeight: 0.24,
    interpretCrystallizationWeight: 0.18,
    interpretContradictionWeight: 0.14,
    assertFallback: 0.18,
    endgameCorruptionPenalty: 0.12,
    trueVictory: 0.50,
    pyrrhicVictory: 0.35,
    midExposure: 0.35,
    highExposure: 0.70,
    twistExposure: 0.82,
    frameExposure: 0.88,
    sabotageEarly: 0.62,
    sabotageLate: 0.52
  },
  Standard: {
    name: 'Standard',
    frictionMultiplier: 0.90,
    caseVolatilityMultiplier: 0.90,
    burnAlwaysHelps: false,
    burnGood: 0.08,
    burnBad: -0.04,
    insightCost: 0.10,
    insightBonus: 0.05,
    corruptionGain: 0.08,
    corruptionRelMod: -0.02,
    contamBase: 0.18,
    contamExposure: 0.24,
    contamAggression: 0.12,
    burnContamMultiplier: 0.55,
    contamBiasInc: 0.35,
    contamTaxInc: 0.04,
    minCities: 2,
    minClues: 2,
    minCoverage: 0.55,
    minConfidence: 0.40,
    strongCaseEnabled: false,
    strongClues: 1,
    strongCoverage: 1.0,
    strongConfidence: 1.0,
    clueConfidenceFactor: 0.43,
    clueContradictionFactor: 0.16,
    clueCrystallizationFactor: 0.11,
    resolvedThreshold: 0.65,
    partialThreshold: 0.42,
    reputationResolvedGain: 0.06,
    exposureResolvedGain: 0.06,
    exposurePartialGain: 0.04,
    exposureFailGain: 0.02,
    corruptionPartialGain: 0.05,
    corruptionFailGain: 0.10,
    sleepCorruptionHeal: 0.06,
    sleepDreamPenalty: 0.02,
    sleepInsightGain: 0.04,
    revealEndgameHints: true,
    invalidDiscernScore: 0.14,
    endgameInterference: ['forced_reversal', 'shadow_injection', 'contradiction_spike'],
    endgameBaseConfidence: 0.22,
    endgameBaseContradiction: 0.15,
    endgameSpike: 0.08,
    endgameBaseCrystallization: 0.06,
    endgameBaseAmbiguity: 0.10,
    interpretTarotWeight: 0.56,
    interpretConfidenceWeight: 0.22,
    interpretCrystallizationWeight: 0.16,
    interpretContradictionWeight: 0.18,
    assertFallback: 0.12,
    endgameCorruptionPenalty: 0.17,
    trueVictory: 0.58,
    pyrrhicVictory: 0.42,
    midExposure: 0.25,
    highExposure: 0.55,
    twistExposure: 0.65,
    frameExposure: 0.75,
    sabotageEarly: 0.58,
    sabotageLate: 0.50
  },
  Deep: {
    name: 'Deep',
    frictionMultiplier: 1.05,
    caseVolatilityMultiplier: 1.05,
    burnAlwaysHelps: false,
    burnGood: 0.06,
    burnBad: -0.10,
    insightCost: 0.10,
    insightBonus: 0.04,
    corruptionGain: 0.10,
    corruptionRelMod: -0.05,
    contamBase: 0.25,
    contamExposure: 0.30,
    contamAggression: 0.15,
    burnContamMultiplier: 1.00,
    contamBiasInc: 0.45,
    contamTaxInc: 0.05,
    minCities: 2,
    minClues: 2,
    minCoverage: 0.60,
    minConfidence: 0.45,
    strongCaseEnabled: false,
    strongClues: 1,
    strongCoverage: 1.0,
    strongConfidence: 1.0,
    clueConfidenceFactor: 0.40,
    clueContradictionFactor: 0.18,
    clueCrystallizationFactor: 0.10,
    resolvedThreshold: 0.68,
    partialThreshold: 0.45,
    reputationResolvedGain: 0.06,
    exposureResolvedGain: 0.05,
    exposurePartialGain: 0.03,
    exposureFailGain: 0.01,
    corruptionPartialGain: 0.05,
    corruptionFailGain: 0.12,
    sleepCorruptionHeal: 0.04,
    sleepDreamPenalty: 0.02,
    sleepInsightGain: 0.03,
    revealEndgameHints: false,
    invalidDiscernScore: 0.10,
    endgameInterference: ['forced_reversal', 'shadow_injection', 'contradiction_spike'],
    endgameBaseConfidence: 0.20,
    endgameBaseContradiction: 0.15,
    endgameSpike: 0.10,
    endgameBaseCrystallization: 0.05,
    endgameBaseAmbiguity: 0.10,
    interpretTarotWeight: 0.55,
    interpretConfidenceWeight: 0.20,
    interpretCrystallizationWeight: 0.15,
    interpretContradictionWeight: 0.20,
    assertFallback: 0.08,
    endgameCorruptionPenalty: 0.20,
    trueVictory: 0.62,
    pyrrhicVictory: 0.48,
    midExposure: 0.20,
    highExposure: 0.55,
    twistExposure: 0.55,
    frameExposure: 0.55,
    sabotageEarly: 0.50,
    sabotageLate: 0.50
  }
};
let ACTIVE_MODE = 'Casual';
let MODE = MODE_CONFIGS[ACTIVE_MODE];
function setMode(modeName) {
  const normalized = String(modeName || '').trim();
  if (MODE_CONFIGS[normalized]) {
    ACTIVE_MODE = normalized;
    MODE = MODE_CONFIGS[normalized];
    if (typeof SCHEngine !== 'undefined' && SCHEngine.state) SCHEngine.state.gameMode = normalized;
  }
}

const FUN_STRINGS = {
  provinceTags: {
    prov_lusoria: 'The chips are fake. The debts are real. Splendid.',
    prov_mammonia: 'Every smile has a price tag and most are non-refundable.',
    prov_veneria: 'Perfume, gossip, betrayal. A civic triangle.',
    prov_terra_sancta: 'Holiness by candlelight, hypocrisy by ledger entry.',
    prov_tartaria: 'A lovely place to visit if you enjoy sulfur and regrettable paperwork.',
    prov_bibonia: 'The official drink is denial, served warm.',
    prov_stultorum: 'An empire where nonsense has tenure.',
    prov_pigritarium: 'Motivation was scheduled, then postponed.',
    prov_gourmandise: 'The buffet groans under the moral weight of thirds.',
    prov_schlaraffenland: 'Luxury has overflowed and now requires a mop.',
    prov_tobacco_isle: 'A smoky little island where every tavern keeps receipts and secrets.'
  },
  comboCheers: [
    'Nice. That clue actually meant something.',
    'That felt suspiciously competent.',
    'A rare and beautiful event: progress.',
    'You have bullied the chaos into giving evidence.'
  ],
  victoryCheers: [
    'The paperwork sings. The province sulks. You win.',
    'A delightful outcome for you. A terrible one for local corruption.',
    'Congratulations. Reality briefly agrees with you.'
  ],
  partialCheers: [
    'Messy, but stylish. We respect the hustle.',
    'You got the truth in installments. Bureaucracy approves.',
    'Half a miracle is still a miracle with receipts.'
  ],
  failCheers: [
    'The province is unconvinced and frankly a little smug.',
    'Well. That was educational in the way falling down stairs is educational.',
    'You have produced a fascinating wrong answer.'
  ],
  dreamCheers: [
    'The dream leaves you a tip, which is more than most witnesses do.',
    'A lucid whisper drifts in: suspiciously helpful.',
    'You wake with the rare feeling that your subconscious did some actual work.'
  ]
};

const CITY_TRAITS = {
  Bell: {
    name: 'Bell City',
    desc: 'Sleep here and the bells teach your dreams to speak more clearly.',
    onEnter: 'Somewhere nearby, a bell rings for no visible reason. Great sign. Probably.'
  },
  Mirror: {
    name: 'Mirror City',
    desc: 'Clues sharpen, but interpretation risks inversion.',
    onEnter: 'Windows flash with false doubles; truth here has good posture and terrible habits.'
  },
  Mask: {
    name: 'Mask City',
    desc: 'People perform themselves for strangers; convenient villains prosper here.',
    onEnter: 'Everyone looks briefly rehearsed. Suspicious. Polished. Disturbingly moisturized.'
  },
  Ledger: {
    name: 'Ledger City',
    desc: 'Accounts get audited. Lies get itemized.',
    onEnter: 'Every coin clinks like testimony. Even the dust seems taxable.'
  },
  Lantern: {
    name: 'Lantern City',
    desc: 'Paradox softens under careful light.',
    onEnter: 'Lanterns burn with the quiet confidence of institutions that survived several scandals.'
  },
  Festival: {
    name: 'Festival City',
    desc: 'Truth arrives loudly and in costume.',
    onEnter: 'Drums, masks, banners, gossip. Wonderful place to find clues and lose nuance.'
  }
};

const RARE_EVENTS = {
  tarot_eclipse: {
    name: 'Tarot Eclipse',
    desc: 'Major Arcana powers intensify, contamination rises, and the night develops opinions.'
  },
  shared_dream: {
    name: 'Shared Dream',
    desc: 'The province dreams in chorus. Hints grow louder and stranger.'
  },
  festival_of_excess: {
    name: 'Festival of Excess',
    desc: 'Clues spill everywhere. So does contradiction.'
  },
  silence_before_bells: {
    name: 'Silence Before Bells',
    desc: 'Bell and Lantern cities become unnervingly useful.'
  },
  kingpin_broadcast: {
    name: 'Worlock Broadcast',
    desc: 'False heat floods the region. Even the rumors start acting smug.'
  }
};

// ============================================================================
// ENGINE / STATE / UTILITIES
// ============================================================================
const SCHEngine = {
  state: {
    turn: 1,
    gameMode: 'Casual',
    symbols: {},
    graph: {},
    symbolIndex: {},
    activeProvince: null,
    activeCity: null,
    activeCase: null,
    activeCasesByProvince: {},
    provinceResidues: {},
    isEndgame: false,
    currentEvent: null,
    rumors: [],
    lastNPC: null,
    npcShownThisTurn: false,
    pendingSleepBonus: null,
    lieutenantIds: [],
    activeLieutenantId: null,
    counters: {
      tarotInstance: 0,
      case: 0,
      clue: 0,
      dream: 0,
      trace: 0,
      residue: 0,
      rumor: 0,
      event: 0,
      lieutenant: 0,
      lieutenantTrace: 0,
      lieutenantConfrontation: 0
    },
    archives: {
      resolvedCases: [],
      dreams: [],
      rumors: []
    },
    player: {
      insight: 0.30,
      corruption: 0.00,
      reputation: 0.00,
      hand: [],
      drawPile: [],
      discardPile: [],
      knownDreams: [],
      luckyBreakUsed: false,
      powerUsedThisTurn: false,
      temp: {
        nextInvestigateEvidence: 0,
        nextClueReliability: 0,
        nextClueContradictionDelta: 0,
        revealCaseSymbol: false,
        revealSuspectRead: false,
        protectFromFraming: false,
        nextSleepHints: 0,
        nextSleepCleanse: false,
        theoryBoost: 0,
        lockedDreamSymbol: null,
        auditFocus: null,
        targetSymbolHint: null
      }
    },
    kingpin: {
      exposure: 0.0,
      awareness: 0.05,
      aggression: 0.10,
      preferredSymbols: ['illusion', 'debt', 'hidden'],
      knownPlayerSymbols: [],
      tacticHistory: [],
      traces: [],
      pending: {
        clueReliabilityMod: 0,
        clueContradictionMod: 0,
        forcedReversedSlots: [],
        dreamContaminationSymbols: [],
        framedSuspectId: null,
        broadcastFalseRumor: false
      }
    },
    log: []
  },

  log(msg) {
    this.state.log.push(msg);
    console.log(`\x1b[32m[SYSTEM]\x1b[0m ${msg}`);
  },

  narrative(msg) {
    console.log(`\n\x1b[36m${msg}\x1b[0m\n`);
  },

  registerNode(node) {
    this.state.graph[node.id] = node;
    if (Array.isArray(node.symbols)) {
      node.symbols.forEach((sym) => {
        if (!this.state.symbolIndex[sym]) this.state.symbolIndex[sym] = [];
        if (!this.state.symbolIndex[sym].includes(node.id)) this.state.symbolIndex[sym].push(node.id);
      });
    }
    return node;
  },

  getNode(id) { return this.state.graph[id] || null; },
  updateNode(node) { if (!node || !node.id) return null; this.state.graph[node.id] = node; return node; },
  getNodesByType(type) { return Object.values(this.state.graph).filter((n) => n && n.type === type); },

  adjustSymbolHeat(symbol, amount) {
    if (!symbol) return;
    const current = this.state.symbols[symbol] || 0;
    this.state.symbols[symbol] = Utils.clamp01(current + amount);
  },

  getHottestSymbols(limit = 4) {
    return Object.entries(this.state.symbols)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([sym]) => sym);
  },

  saveToJSON() { return JSON.stringify(this.state, null, 2); },
  loadFromJSON(jsonString) { this.state = JSON.parse(jsonString); return this.state; }
};

const Utils = {
  clamp01(x) { return Math.max(0, Math.min(1, Number.isFinite(x) ? x : 0)); },
  round2(x) { return Math.round((x + Number.EPSILON) * 100) / 100; },
  describePct(x) { return `${Math.round((x || 0) * 100)}%`; },
  unique(arr) { return [...new Set(arr || [])]; },
  pickRandom(arr) { if (!arr || arr.length === 0) return null; return arr[Math.floor(Math.random() * arr.length)]; },
  normalizeId(s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g, '_'); },
  overlap(aList, bList) { const a = new Set(aList || []); const b = new Set(bList || []); return [...a].filter((x) => b.has(x)); },
  jaccardSimilarity(aList, bList) {
    const a = new Set(aList || []); const b = new Set(bList || []);
    const intersection = [...a].filter((x) => b.has(x));
    const union = new Set([...a, ...b]);
    return union.size > 0 ? intersection.length / union.size : 0;
  },
  weightedPick(items, weightFn) {
    if (!items || items.length === 0) return null;
    const weights = items.map((item) => Math.max(0, weightFn(item) || 0));
    const total = weights.reduce((a, b) => a + b, 0);
    if (total <= 0) return items[0];
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  },
  shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },
  clone(obj) { return JSON.parse(JSON.stringify(obj)); }
};

// ============================================================================
// PACKAGE A SYSTEMS: RUMORS / EVENTS / NPCS
// ============================================================================
const RumorSystem = {
  buildRumorText(prov, category, symA, symB) {
    const templates = {
      civic: [
        `A clerk in ${prov.name} bought three locks and no key.`,
        `A ledger changed hands in ${prov.name} and came back heavier.`,
        `A witness in ${prov.name} keeps paying in exact change for impossible things.`
      ],
      dream: [
        `Three citizens in ${prov.name} dreamed of the same symbol.`,
        `No one in ${prov.name} slept cleanly last night.`,
        `A bell is heard in ${prov.name} where no bell hangs.`
      ],
      suspicion: [
        `Someone in ${prov.name} knows too much and smiles too soon.`,
        `A patron in ${prov.name} was seen burning a letter twice.`,
        `One witness in ${prov.name} remembers events in the wrong order.`
      ],
      kingpin: [
        `The streets of ${prov.name} hum with significance that may not belong to them.`,
        `A false motif rises in ${prov.name}, elegant enough to distract.`,
        `A rumor in ${prov.name} sounds rehearsed, but keeps getting better reviews.`
      ]
    };
    let text = Utils.pickRandom(templates[category] || templates.civic);
    if (symA && symB && Math.random() < 0.4) text += ` (${symA} / ${symB})`;
    return text;
  },

  generate(provinceId = null, forceCategory = null) {
    const provinces = WorldBuilder.getProvinces();
    const prov = provinceId ? SCHEngine.getNode(provinceId) : Utils.pickRandom(provinces);
    if (!prov) return null;
    const category = forceCategory || Utils.weightedPick(
      [{ id: 'civic', w: 4 }, { id: 'dream', w: 3 }, { id: 'suspicion', w: 3 }, { id: 'kingpin', w: 2 }],
      x => x.w
    ).id;
    const symbols = prov.symbols.filter(s => s !== 'province').slice(0, 3);
    const symA = Utils.pickRandom(symbols) || Utils.pickRandom(['truth', 'dreams', 'debt']);
    const symB = Utils.pickRandom(SCHEngine.getHottestSymbols(3).concat(symbols)) || symA;
    const falseHint = category === 'kingpin' || SCHEngine.state.kingpin.pending.broadcastFalseRumor;
    const rumor = {
      id: `rumor_${++SCHEngine.state.counters.rumor}`,
      provinceId: prov.id,
      provinceName: prov.name,
      category,
      symbols: Utils.unique([symA, symB]).slice(0, 3),
      credibility: Utils.round2(falseHint ? 0.35 + Math.random() * 0.20 : 0.55 + Math.random() * 0.30),
      text: this.buildRumorText(prov, category, symA, symB),
      falseHint,
      expiresOnTurn: SCHEngine.state.turn + 3
    };
    SCHEngine.state.rumors.push(rumor);
    SCHEngine.state.archives.rumors.push(Utils.clone(rumor));
    if (typeof LieutenantSystem !== 'undefined') LieutenantSystem.observe('rumor', rumor.symbols, { provinceId: rumor.provinceId, rumorId: rumor.id });
    SCHEngine.state.rumors = SCHEngine.state.rumors.slice(-3);
    return rumor;
  },

  purgeExpired() {
    SCHEngine.state.rumors = SCHEngine.state.rumors.filter(r => r.expiresOnTurn >= SCHEngine.state.turn);
  },

  getRelevant(cityNode, caseNode) {
    return SCHEngine.state.rumors.filter(r =>
      (!cityNode || r.provinceId === cityNode.links?.[0] || r.provinceId === caseNode?.provinceId) &&
      (!caseNode || r.provinceId === caseNode.provinceId || Utils.overlap(r.symbols, caseNode.requiredSymbols).length > 0)
    );
  }
};

const EventSystem = {
  maybeTrigger() {
    const state = SCHEngine.state;
    if (state.turn <= 2 || state.currentEvent) return null;
    if (Math.random() > 0.12) return null;
    const eventId = Utils.pickRandom(Object.keys(RARE_EVENTS));
    const event = {
      id: `event_${++state.counters.event}`,
      kind: eventId,
      name: RARE_EVENTS[eventId].name,
      desc: RARE_EVENTS[eventId].desc,
      turnsLeft: 2
    };
    state.currentEvent = event;
    SCHEngine.narrative(`\x1b[35m[RARE EVENT]\x1b[0m ${event.name}: ${event.desc}`);
    if (event.kind === 'kingpin_broadcast') {
      SCHEngine.state.kingpin.pending.broadcastFalseRumor = true;
      SCHEngine.adjustSymbolHeat(Utils.pickRandom(['authority', 'truth', 'trade', 'dreams']) || 'illusion', 0.10);
      RumorSystem.generate(state.activeProvince || null, 'kingpin');
    }
    if (event.kind === 'shared_dream') {
      SCHEngine.state.player.temp.nextSleepHints += 1;
    }
    return event;
  },

  tickDown() {
    const evt = SCHEngine.state.currentEvent;
    if (!evt) return;
    evt.turnsLeft -= 1;
    if (evt.turnsLeft <= 0) {
      SCHEngine.narrative(`\x1b[35m[EVENT ENDS]\x1b[0m ${evt.name} fades, albeit with dramatic reluctance.`);
      SCHEngine.state.currentEvent = null;
      SCHEngine.state.kingpin.pending.broadcastFalseRumor = false;
    }
  }
};


const NPCSystem = {
  coreDefs: {"octavia": {"key": "octavia", "nodeId": "npc_octavia_quill", "name": "Octavia Quill", "title": "Rival Detective", "role": "parallel_detective_future", "symbols": ["truth", "rivalry", "reputation", "investigation"], "intro": "Octavia Quill appears carrying a notebook and several opinions. None are soft.", "contexts": ["city", "case"], "rarity": "rare", "provinceBias": [], "cityTraitBias": ["Ledger", "Lantern"]}, "belladonna": {"key": "belladonna", "nodeId": "npc_sister_belladonna", "name": "Sister Belladonna", "title": "Dream Interpreter", "role": "dream_guide", "symbols": ["dreams", "bell", "cleansing", "false_holiness"], "intro": "Sister Belladonna waits beside a candle that behaves like a witness under oath.", "contexts": ["city", "sleep"], "rarity": "uncommon", "provinceBias": ["prov_terra_sancta", "prov_pigritarium"], "cityTraitBias": ["Bell", "Lantern"]}, "candle_rat": {"key": "candle_rat", "nodeId": "npc_candle_rat", "name": "Candle-Rat", "title": "Informant", "role": "street_informant", "symbols": ["rumor", "truth", "debt", "suspicion"], "intro": "Candle-Rat emerges from the alleys with useful gossip and catastrophic posture.", "contexts": ["city", "case"], "rarity": "common", "provinceBias": ["prov_mammonia", "prov_lusoria", "prov_veneria"], "cityTraitBias": ["Mask", "Ledger"]}, "patron": {"key": "patron", "nodeId": "npc_velvet_patron", "name": "The Velvet Patron", "title": "Suspicious Benefactor", "role": "bargain_vector", "symbols": ["bargain", "corruption", "greed", "choice"], "intro": "A velvet-clad patron smiles as if every bargain has already happened.", "contexts": ["city", "sleep", "case"], "rarity": "rare", "provinceBias": ["prov_veneria", "prov_mammonia", "prov_lusoria"], "cityTraitBias": ["Mask", "Festival"]}},
  worldNPCs: [{"key": "brother_inkfast", "nodeId": "npc_brother_inkfast", "name": "Brother Inkfast", "title": "Monastic Archivist", "role": "scribe", "symbols": ["archive", "doctrine", "truth", "hidden"], "intro": "Brother Inkfast alphabetizes sins before they happen.", "provinceBias": ["prov_terra_sancta", "prov_pigritarium"], "cityTraitBias": ["Ledger", "Lantern"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "prior_loose_threads", "nodeId": "npc_prior_loose_threads", "name": "The Prior of Loose Threads", "title": "Pattern-Hunting Monk", "role": "investigator", "symbols": ["truth", "search", "thread", "hidden"], "intro": "The Prior finds patterns in botched stitches and worse sermons.", "provinceBias": ["prov_terra_sancta", "prov_stultorum"], "cityTraitBias": ["Lantern", "Mirror"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "dame_ysabet_red_ledger", "nodeId": "npc_dame_ysabet_red_ledger", "name": "Dame Ysabet of the Red Ledger", "title": "Noble Auditor", "role": "auditor", "symbols": ["debt", "authority", "truth", "wealth"], "intro": "Dame Ysabet carries a sword-shaped quill and audits with both edges.", "provinceBias": ["prov_mammonia", "prov_lusoria"], "cityTraitBias": ["Ledger"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "ink_eyed_bailiff", "nodeId": "npc_ink_eyed_bailiff", "name": "The Ink-Eyed Bailiff", "title": "Warrant Officer", "role": "official", "symbols": ["authority", "law", "hidden", "punishment"], "intro": "The Ink-Eyed Bailiff remembers every warrant, especially false ones.", "provinceBias": ["prov_tartaria", "prov_mammonia", "prov_terra_sancta"], "cityTraitBias": ["Ledger", "Lantern"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "master_tallowby", "nodeId": "npc_master_tallowby", "name": "Master Tallowby", "title": "Candle-Maker", "role": "artisan", "symbols": ["lantern", "truth", "wax", "hidden"], "intro": "Master Tallowby tracks suspects by wax drippings.", "provinceBias": ["prov_terra_sancta", "prov_pigritarium"], "cityTraitBias": ["Lantern", "Bell"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "notary_three_hands", "nodeId": "npc_notary_three_hands", "name": "The Notary of Three Hands", "title": "Legal Scribe", "role": "scribe", "symbols": ["law", "deception", "authority", "paradox"], "intro": "The Notary’s signatures disagree with each other in three legal dialects.", "provinceBias": ["prov_stultorum", "prov_mammonia"], "cityTraitBias": ["Ledger", "Mirror"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "sibyl_marginata", "nodeId": "npc_sibyl_marginata", "name": "Sibyl Marginata", "title": "Marginalia Scholar", "role": "scholar", "symbols": ["truth", "hidden", "doctrine", "archive"], "intro": "Sibyl reads truth in footnotes and lies in illuminated capitals.", "provinceBias": ["prov_terra_sancta", "prov_bibonia"], "cityTraitBias": ["Lantern", "Ledger"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "clerk_never_blots", "nodeId": "npc_clerk_never_blots", "name": "The Clerk Who Never Blots", "title": "Impossible Recorder", "role": "clerk", "symbols": ["authority", "truth", "ink", "paradox"], "intro": "The Clerk records impossible testimony without spilling ink.", "provinceBias": ["prov_mammonia", "prov_stultorum"], "cityTraitBias": ["Ledger"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "sir_reed_questioner", "nodeId": "npc_sir_reed_questioner", "name": "Sir Reed the Questioner", "title": "Knight-Interrogator", "role": "knight", "symbols": ["truth", "conflict", "courage", "authority"], "intro": "Sir Reed treats clues like combatants and cross-examines armor.", "provinceBias": ["prov_tartaria", "prov_lusoria"], "cityTraitBias": ["Lantern", "Mirror"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "abbot_candlewise", "nodeId": "npc_abbot_candlewise", "name": "Abbot Candlewise", "title": "Abbey Superior", "role": "clergy", "symbols": ["dreams", "false_holiness", "lantern", "confession"], "intro": "Abbot Candlewise hears confessions from candles and distrusts smoke.", "provinceBias": ["prov_terra_sancta", "prov_pigritarium"], "cityTraitBias": ["Bell", "Lantern"], "contexts": ["city", "sleep"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "choirless_cantor", "nodeId": "npc_choirless_cantor", "name": "The Choirless Cantor", "title": "Silent Singer", "role": "clergy", "symbols": ["silence", "bell", "dreams", "truth"], "intro": "The Cantor’s silence makes dream clues lean closer.", "provinceBias": ["prov_pigritarium", "prov_terra_sancta"], "cityTraitBias": ["Bell"], "contexts": ["city", "sleep"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "brother_moth", "nodeId": "npc_brother_moth", "name": "Brother Moth", "title": "Parchment-Eater", "role": "clergy", "symbols": ["hidden", "archive", "consumption", "cleansing"], "intro": "Brother Moth eats corrupted parchment with professional sadness.", "provinceBias": ["prov_terra_sancta", "prov_gourmandise"], "cityTraitBias": ["Lantern", "Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "novice_unfinished_vows", "nodeId": "npc_novice_unfinished_vows", "name": "The Novice of Unfinished Vows", "title": "Restless Novice", "role": "clergy", "symbols": ["bond", "choice", "false_holiness", "identity"], "intro": "The Novice’s promises keep changing owners.", "provinceBias": ["prov_terra_sancta", "prov_veneria"], "cityTraitBias": ["Bell", "Mask"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "saint_checker", "nodeId": "npc_saint_checker", "name": "The Saint-Checker", "title": "Relic Auditor", "role": "official", "symbols": ["false_holiness", "truth", "authority", "relic"], "intro": "The Saint-Checker audits relics and ruins pilgrim holidays.", "provinceBias": ["prov_terra_sancta", "prov_mammonia"], "cityTraitBias": ["Ledger", "Lantern"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "mother_ashveil", "nodeId": "npc_mother_ashveil", "name": "Mother Ashveil", "title": "Abbess of Nightmares", "role": "clergy", "symbols": ["dreams", "absolution", "sleep", "cleansing"], "intro": "Mother Ashveil translates nightmares into penance.", "provinceBias": ["prov_pigritarium", "prov_terra_sancta"], "cityTraitBias": ["Bell", "Lantern"], "contexts": ["city", "sleep"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "bell_sleeper", "nodeId": "npc_bell_sleeper", "name": "The Bell-Sleeper", "title": "Somnolent Lay Brother", "role": "dreamer", "symbols": ["bell", "sleep", "truth", "silence"], "intro": "The Bell-Sleeper wakes only when bells lie.", "provinceBias": ["prov_pigritarium", "prov_bibonia"], "cityTraitBias": ["Bell"], "contexts": ["city", "sleep"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "candle_exorcist", "nodeId": "npc_candle_exorcist", "name": "The Candle Exorcist", "title": "Tarot Cleanser", "role": "occultist", "symbols": ["cleansing", "lantern", "tarot", "corruption"], "intro": "The Candle Exorcist burns taint out of cards at a price.", "provinceBias": ["prov_terra_sancta", "prov_tartaria"], "cityTraitBias": ["Lantern"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["tarot_help", "bargain", "favor"]}, {"key": "pilgrim_nettles", "nodeId": "npc_pilgrim_nettles", "name": "Pilgrim Nettles", "title": "Portable Miracle-Seller", "role": "pilgrim", "symbols": ["false_holiness", "travel", "rumor", "relic"], "intro": "Pilgrim Nettles carries miracles suspiciously well packed.", "provinceBias": ["prov_terra_sancta", "prov_schlaraffenland"], "cityTraitBias": ["Festival", "Bell"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "psalm_mender", "nodeId": "npc_psalm_mender", "name": "The Psalm-Mender", "title": "Hymn Repairer", "role": "clergy", "symbols": ["doctrine", "healing", "bell", "dreams"], "intro": "The Psalm-Mender repairs corrupted hymns and damaged symbols.", "provinceBias": ["prov_terra_sancta", "prov_pigritarium"], "cityTraitBias": ["Bell", "Lantern"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "sister_low_ember", "nodeId": "npc_sister_low_ember", "name": "Sister Low Ember", "title": "Dream-Ward Nun", "role": "clergy", "symbols": ["dreams", "cleansing", "hope", "sleep"], "intro": "Sister Low Ember offers dream protection in a cup of ash-warm tea.", "provinceBias": ["prov_pigritarium", "prov_terra_sancta"], "cityTraitBias": ["Bell", "Lantern"], "contexts": ["city", "sleep"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "confessor_without_ears", "nodeId": "npc_confessor_without_ears", "name": "The Confessor Without Ears", "title": "Written-Sin Confessor", "role": "clergy", "symbols": ["confession", "hidden", "doctrine", "truth"], "intro": "The Confessor hears only written sins and badly folded lies.", "provinceBias": ["prov_terra_sancta", "prov_mammonia"], "cityTraitBias": ["Ledger", "Bell"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "brother_gilt", "nodeId": "npc_brother_gilt", "name": "Brother Gilt", "title": "Gold-Habited Preacher", "role": "clergy", "symbols": ["wealth", "hypocrisy", "false_holiness", "greed"], "intro": "Brother Gilt preaches poverty in a gold-lined habit.", "provinceBias": ["prov_terra_sancta", "prov_mammonia"], "cityTraitBias": ["Festival", "Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "mousekin_bell_thief", "nodeId": "npc_mousekin_bell_thief", "name": "Mousekin the Bell-Thief", "title": "Tiny Bell Burglar", "role": "thief", "symbols": ["bell", "hidden", "warning", "deception"], "intro": "Mousekin steals tiny bells and sells warnings by the clapper.", "provinceBias": ["prov_pigritarium", "prov_veneria"], "cityTraitBias": ["Bell", "Mask"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "old_nettle_tongue", "nodeId": "npc_old_nettle_tongue", "name": "Old Nettle-Tongue", "title": "Gossip Broker", "role": "informant", "symbols": ["rumor", "secrets", "truth", "deception"], "intro": "Old Nettle-Tongue charges in secrets and gives change in slander.", "provinceBias": ["prov_veneria", "prov_bibonia", "prov_stultorum"], "cityTraitBias": ["Mask", "Festival"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "limping_peddler_alibis", "nodeId": "npc_limping_peddler_alibis", "name": "The Limping Peddler of Alibis", "title": "Excuse Vendor", "role": "informant", "symbols": ["deception", "trade", "suspect", "choice"], "intro": "The Peddler sells excuses by the yard and guilt by the inch.", "provinceBias": ["prov_veneria", "prov_mammonia"], "cityTraitBias": ["Mask", "Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "black_fennel", "nodeId": "npc_black_fennel", "name": "Black Fennel", "title": "Herbalist of Lies", "role": "herbalist", "symbols": ["truth", "healing", "poison", "hidden"], "intro": "Black Fennel knows which witnesses are lying by smell.", "provinceBias": ["prov_bibonia", "prov_veneria"], "cityTraitBias": ["Lantern", "Mask"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "boy_three_hats", "nodeId": "npc_boy_three_hats", "name": "The Boy with Three Hats", "title": "Contradictory Messenger", "role": "messenger", "symbols": ["rumor", "choice", "deception", "trade"], "intro": "The Boy has three hats and four employers.", "provinceBias": ["prov_stultorum", "prov_mammonia", "prov_lusoria"], "cityTraitBias": ["Festival", "Mask"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "goosecap_merek", "nodeId": "npc_goosecap_merek", "name": "Goosecap Merek", "title": "Foolish Spy", "role": "spy", "symbols": ["foolishness", "hidden", "truth", "mask"], "intro": "Merek looks foolish enough to be dangerous.", "provinceBias": ["prov_stultorum", "prov_veneria"], "cityTraitBias": ["Festival", "Mask"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "ragged_herald", "nodeId": "npc_ragged_herald", "name": "The Ragged Herald", "title": "Premature Announcer", "role": "herald", "symbols": ["rumor", "calling", "authority", "fate"], "intro": "The Herald announces rumors before they become true.", "provinceBias": ["prov_stultorum", "prov_lusoria"], "cityTraitBias": ["Festival"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "little_saint_pin", "nodeId": "npc_little_saint_pin", "name": "Little Saint Pin", "title": "Incriminating Pickpocket", "role": "thief", "symbols": ["hidden", "relic", "deception", "truth"], "intro": "Little Saint Pin only steals objects that should not exist.", "provinceBias": ["prov_veneria", "prov_terra_sancta"], "cityTraitBias": ["Mask", "Lantern"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "alley_dowser", "nodeId": "npc_alley_dowser", "name": "The Alley Dowser", "title": "Spoon-Diviner", "role": "informant", "symbols": ["hidden", "truth", "search", "absurdity"], "intro": "The Alley Dowser finds guilt using a bent spoon.", "provinceBias": ["prov_stultorum", "prov_mammonia"], "cityTraitBias": ["Lantern", "Mirror"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "pig_eyed_toma", "nodeId": "npc_pig_eyed_toma", "name": "Pig-Eyed Toma", "title": "Crowd Lookout", "role": "informant", "symbols": ["suspicion", "hidden", "rumor", "trade"], "intro": "Toma sees through crowds and occasionally through walls.", "provinceBias": ["prov_gourmandise", "prov_bibonia"], "cityTraitBias": ["Festival", "Mask"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "nan_nine_keys", "nodeId": "npc_nan_nine_keys", "name": "Nan of the Nine Keys", "title": "Locksmith", "role": "artisan", "symbols": ["hidden", "authority", "release", "prison"], "intro": "Nan has opinions about every prison and most marriages.", "provinceBias": ["prov_tartaria", "prov_mammonia"], "cityTraitBias": ["Ledger", "Lantern"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "mudlark_of_seals", "nodeId": "npc_mudlark_of_seals", "name": "The Mudlark of Seals", "title": "Gutter Scavenger", "role": "scavenger", "symbols": ["wax", "authority", "hidden", "trade"], "intro": "The Mudlark finds official wax in gutters and asks why it fell.", "provinceBias": ["prov_mammonia", "prov_terra_sancta"], "cityTraitBias": ["Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "market_crow", "nodeId": "npc_market_crow", "name": "Market-Crow", "title": "Merchant-Spy", "role": "spy", "symbols": ["trade", "rumor", "wealth", "secrets"], "intro": "Market-Crow trades in overheard prices and names.", "provinceBias": ["prov_mammonia", "prov_veneria", "prov_lusoria"], "cityTraitBias": ["Festival", "Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "rat_kings_herald", "nodeId": "npc_rat_kings_herald", "name": "The Rat-King’s Herald", "title": "Underground Messenger", "role": "messenger", "symbols": ["rumor", "authority", "hidden", "madness"], "intro": "The Herald claims to represent a court under the floorboards.", "provinceBias": ["prov_stultorum", "prov_veneria"], "cityTraitBias": ["Mask", "Festival"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "reeve_unpaid_rain", "nodeId": "npc_reeve_unpaid_rain", "name": "The Reeve of Unpaid Rain", "title": "Tax Collector", "role": "official", "symbols": ["debt", "authority", "weather", "absurdity"], "intro": "The Reeve claims storms owe arrears.", "provinceBias": ["prov_mammonia", "prov_lusoria"], "cityTraitBias": ["Ledger"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "lady_writ_thorns", "nodeId": "npc_lady_writ_thorns", "name": "Lady Writ-of-Thorns", "title": "Subpoena Hostess", "role": "noble", "symbols": ["authority", "law", "growth", "debt"], "intro": "Her invitations function like subpoenas and smell of roses.", "provinceBias": ["prov_terra_sancta", "prov_mammonia"], "cityTraitBias": ["Ledger", "Lantern"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "deputy_missing_seals", "nodeId": "npc_deputy_missing_seals", "name": "The Deputy of Missing Seals", "title": "Authentication Officer", "role": "official", "symbols": ["authority", "hidden", "wax", "law"], "intro": "The Deputy is responsible for every unauthenticated document and none of himself.", "provinceBias": ["prov_mammonia", "prov_terra_sancta"], "cityTraitBias": ["Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "laughing_bailiff", "nodeId": "npc_laughing_bailiff", "name": "The Laughing Bailiff", "title": "Court Officer", "role": "official", "symbols": ["punishment", "authority", "foolishness", "truth"], "intro": "The Bailiff laughs only before wrongful sentencing.", "provinceBias": ["prov_tartaria", "prov_stultorum"], "cityTraitBias": ["Festival", "Lantern"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "sir_gallowsmere", "nodeId": "npc_sir_gallowsmere", "name": "Sir Gallowsmere", "title": "Decorative Due-Process Knight", "role": "knight", "symbols": ["punishment", "authority", "honor", "ruin"], "intro": "Sir Gallowsmere thinks due process is a decorative saddle.", "provinceBias": ["prov_tartaria", "prov_lusoria"], "cityTraitBias": ["Lantern", "Mirror"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "chamberlain_dust", "nodeId": "npc_chamberlain_dust", "name": "The Chamberlain of Dust", "title": "Palace Inventory-Keeper", "role": "official", "symbols": ["hidden", "archive", "authority", "dust"], "intro": "The Chamberlain inventories forgotten rooms and remembers who forgot them.", "provinceBias": ["prov_mammonia", "prov_schlaraffenland"], "cityTraitBias": ["Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "herald_premature_verdicts", "nodeId": "npc_herald_premature_verdicts", "name": "The Herald of Premature Verdicts", "title": "Overeager Court Crier", "role": "herald", "symbols": ["fate", "authority", "punishment", "rumor"], "intro": "He announces outcomes before trials begin.", "provinceBias": ["prov_tartaria", "prov_stultorum"], "cityTraitBias": ["Festival", "Ledger"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "crowns_left_witness", "nodeId": "npc_crowns_left_witness", "name": "The Crown’s Left Witness", "title": "Professional Witness", "role": "witness", "symbols": ["authority", "deception", "truth", "memory"], "intro": "Their memory changes sides depending on the bench.", "provinceBias": ["prov_mammonia", "prov_tartaria"], "cityTraitBias": ["Ledger", "Mirror"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "jailer_soft_locks", "nodeId": "npc_jailer_soft_locks", "name": "The Jailer of Soft Locks", "title": "Prison Keeper", "role": "jailer", "symbols": ["authority", "release", "deception", "punishment"], "intro": "His doors open for persuasive lies.", "provinceBias": ["prov_tartaria", "prov_veneria"], "cityTraitBias": ["Mask", "Lantern"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "master_quoin", "nodeId": "npc_master_quoin", "name": "Master Quoin", "title": "Royal Mason", "role": "artisan", "symbols": ["structure", "authority", "hidden", "truth"], "intro": "Master Quoin knows which walls have overheard treason.", "provinceBias": ["prov_mammonia", "prov_terra_sancta"], "cityTraitBias": ["Lantern", "Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "taxed_widow", "nodeId": "npc_taxed_widow", "name": "The Taxed Widow", "title": "Bureaucratic Avenger", "role": "commoner", "symbols": ["debt", "authority", "courage", "truth"], "intro": "The Taxed Widow weaponizes bureaucracy with admirable precision.", "provinceBias": ["prov_mammonia", "prov_lusoria"], "cityTraitBias": ["Ledger"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "seneschal_borrowed_names", "nodeId": "npc_seneschal_borrowed_names", "name": "The Seneschal of Borrowed Names", "title": "Identity Misfiler", "role": "official", "symbols": ["identity", "authority", "deception", "mask"], "intro": "The Seneschal misfiles names until they belong to someone else.", "provinceBias": ["prov_veneria", "prov_stultorum"], "cityTraitBias": ["Mask", "Ledger"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "mistress_anvil_mercy", "nodeId": "npc_mistress_anvil_mercy", "name": "Mistress Anvil-Mercy", "title": "Blacksmith of Evidence", "role": "artisan", "symbols": ["material", "truth", "courage", "repair"], "intro": "She can repair broken evidence, though she judges the break.", "provinceBias": ["prov_tartaria", "prov_mammonia"], "cityTraitBias": ["Lantern", "Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "maskwright", "nodeId": "npc_maskwright", "name": "The Maskwright", "title": "Maker of Honest Masks", "role": "artisan", "symbols": ["mask", "truth", "deception", "identity"], "intro": "The Maskwright believes masks reveal truth by hiding the face.", "provinceBias": ["prov_veneria", "prov_stultorum"], "cityTraitBias": ["Mask", "Festival"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "oath_cobbler", "nodeId": "npc_oath_cobbler", "name": "The Oath-Cobbler", "title": "Promise Repairer", "role": "artisan", "symbols": ["bond", "trade", "deception", "choice"], "intro": "The Cobbler repairs shoes and promises, badly.", "provinceBias": ["prov_lusoria", "prov_veneria"], "cityTraitBias": ["Ledger", "Mask"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "salt_guild_factor", "nodeId": "npc_salt_guild_factor", "name": "The Salt-Guild Factor", "title": "Secret Preserver", "role": "merchant", "symbols": ["trade", "hidden", "wealth", "preservation"], "intro": "The Factor brines secrets to preserve them.", "provinceBias": ["prov_mammonia", "prov_gourmandise"], "cityTraitBias": ["Ledger", "Festival"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "glass_stainer_false_saints", "nodeId": "npc_glass_stainer_false_saints", "name": "The Glass-Stainer of False Saints", "title": "Icon Painter", "role": "artisan", "symbols": ["false_holiness", "illusion", "relic", "trade"], "intro": "The glass-stainer paints saints before they exist.", "provinceBias": ["prov_terra_sancta", "prov_mammonia"], "cityTraitBias": ["Lantern", "Mirror"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "baker_black_loaves", "nodeId": "npc_baker_black_loaves", "name": "The Baker of Black Loaves", "title": "Confession Baker", "role": "artisan", "symbols": ["gluttony", "truth", "confession", "consumption"], "intro": "The Baker folds confession into bread and calls it crust.", "provinceBias": ["prov_gourmandise", "prov_bibonia"], "cityTraitBias": ["Festival", "Lantern"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "weaver_missing_banners", "nodeId": "npc_weaver_missing_banners", "name": "The Weaver of Missing Banners", "title": "Lineage Weaver", "role": "artisan", "symbols": ["identity", "tradition", "hidden", "deception"], "intro": "The Weaver knows which houses are pretending lineage.", "provinceBias": ["prov_veneria", "prov_schlaraffenland"], "cityTraitBias": ["Mask", "Festival"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "bellfounders_widow", "nodeId": "npc_bellfounders_widow", "name": "The Bellfounder’s Widow", "title": "Bronze Listener", "role": "artisan", "symbols": ["bell", "truth", "memory", "silence"], "intro": "She identifies lies by how bronze cools.", "provinceBias": ["prov_pigritarium", "prov_terra_sancta"], "cityTraitBias": ["Bell"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "master_pewter_smile", "nodeId": "npc_master_pewter_smile", "name": "Master Pewter-Smile", "title": "Cupmaker", "role": "artisan", "symbols": ["wine", "memory", "trade", "truth"], "intro": "The cupmaker remembers who drank with whom.", "provinceBias": ["prov_bibonia", "prov_mammonia"], "cityTraitBias": ["Festival", "Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "barrel_nun", "nodeId": "npc_barrel_nun", "name": "The Barrel Nun", "title": "Brewer with Contacts", "role": "clergy", "symbols": ["wine", "rumor", "false_holiness", "trade"], "intro": "The Barrel Nun has monastery contacts and secular instincts.", "provinceBias": ["prov_bibonia", "prov_terra_sancta"], "cityTraitBias": ["Festival", "Bell"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "last_honest_chandler", "nodeId": "npc_last_honest_chandler", "name": "The Last Honest Chandler", "title": "Candle Seller", "role": "artisan", "symbols": ["lantern", "truth", "signature", "trade"], "intro": "His candles expose forged signatures and bad moods.", "provinceBias": ["prov_mammonia", "prov_terra_sancta"], "cityTraitBias": ["Lantern", "Ledger"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "guild_ratifier", "nodeId": "npc_guild_ratifier", "name": "The Guild Ratifier", "title": "Oath Certifier", "role": "official", "symbols": ["trade", "authority", "bond", "deception"], "intro": "The Ratifier certifies guild oaths with questionable authority.", "provinceBias": ["prov_mammonia", "prov_lusoria"], "cityTraitBias": ["Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "auctioneer_of_names", "nodeId": "npc_auctioneer_of_names", "name": "The Auctioneer of Names", "title": "Identity Seller", "role": "merchant", "symbols": ["identity", "trade", "mask", "wealth"], "intro": "The Auctioneer sells identities by candlelight.", "provinceBias": ["prov_veneria", "prov_stultorum"], "cityTraitBias": ["Mask", "Festival"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "dream_notary", "nodeId": "npc_dream_notary", "name": "The Dream Notary", "title": "Sleep-Testimony Certifier", "role": "notary", "symbols": ["dreams", "authority", "sleep", "truth"], "intro": "The Dream Notary certifies testimony given while asleep.", "provinceBias": ["prov_pigritarium", "prov_bibonia"], "cityTraitBias": ["Bell", "Ledger"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "ash_ledger_keeper", "nodeId": "npc_ash_ledger_keeper", "name": "The Ash-Ledger Keeper", "title": "Post-Fire Accountant", "role": "occultist", "symbols": ["debt", "fire", "ruin", "archive"], "intro": "The Keeper records debts after fires and before apologies.", "provinceBias": ["prov_tartaria", "prov_mammonia"], "cityTraitBias": ["Ledger", "Lantern"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "sulfur_advocate", "nodeId": "npc_sulfur_advocate", "name": "The Sulfur Advocate", "title": "Procedural Damnation Lawyer", "role": "advocate", "symbols": ["damnation", "punishment", "authority", "ruin"], "intro": "The Advocate argues damnation is mostly procedural.", "provinceBias": ["prov_tartaria"], "cityTraitBias": ["Ledger", "Lantern"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "penitent_arsonist", "nodeId": "npc_penitent_arsonist", "name": "The Penitent Arsonist", "title": "Future Confessor", "role": "penitent", "symbols": ["fire", "confession", "fate", "ruin"], "intro": "The Arsonist confesses to fires that have not started yet.", "provinceBias": ["prov_tartaria", "prov_stultorum"], "cityTraitBias": ["Lantern", "Mirror"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "witch_bent_noon", "nodeId": "npc_witch_bent_noon", "name": "The Witch of Bent Noon", "title": "Shadow Seller", "role": "witch", "symbols": ["illusion", "hidden", "fate", "shadow"], "intro": "The Witch sells shadows at the wrong time of day.", "provinceBias": ["prov_tartaria", "prov_pigritarium"], "cityTraitBias": ["Mirror", "Lantern"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "cartographer_closed_roads", "nodeId": "npc_cartographer_closed_roads", "name": "The Cartographer of Closed Roads", "title": "Impossible Mapmaker", "role": "cartographer", "symbols": ["travel", "hidden", "paradox", "search"], "intro": "The Cartographer maps places that reject travel.", "provinceBias": ["prov_stultorum", "prov_schlaraffenland"], "cityTraitBias": ["Mirror", "Lantern"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "saint_no_face", "nodeId": "npc_saint_no_face", "name": "The Saint with No Face", "title": "Administrative Miracle", "role": "saint", "symbols": ["false_holiness", "identity", "hidden", "relic"], "intro": "The Saint may be fraud, miracle, or administrative error.", "provinceBias": ["prov_terra_sancta", "prov_veneria"], "cityTraitBias": ["Mask", "Bell"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "rag_bone_prophet", "nodeId": "npc_rag_bone_prophet", "name": "The Rag-and-Bone Prophet", "title": "Furniture Diviner", "role": "prophet", "symbols": ["fate", "ruin", "rumor", "absurdity"], "intro": "The Prophet predicts crimes from broken furniture.", "provinceBias": ["prov_stultorum", "prov_tartaria"], "cityTraitBias": ["Festival", "Mirror"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "grave_dowser", "nodeId": "npc_grave_dowser", "name": "The Grave-Dowser", "title": "Buried Evidence Finder", "role": "dowser", "symbols": ["hidden", "death", "truth", "search"], "intro": "The Grave-Dowser finds buried evidence and occasionally buried futures.", "provinceBias": ["prov_tartaria", "prov_terra_sancta"], "cityTraitBias": ["Lantern"], "contexts": ["city", "case"], "rarity": "rare", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "hollow_farrier", "nodeId": "npc_hollow_farrier", "name": "The Hollow Farrier", "title": "Horse-Shoe Witness", "role": "artisan", "symbols": ["travel", "truth", "material", "trade"], "intro": "The Farrier knows which horses carried lies.", "provinceBias": ["prov_lusoria", "prov_mammonia"], "cityTraitBias": ["Ledger", "Lantern"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "milkmaid_of_bad_omens", "nodeId": "npc_milkmaid_of_bad_omens", "name": "The Milkmaid of Bad Omens", "title": "Dairy Prophet", "role": "commoner", "symbols": ["fate", "dreams", "rumor", "absurdity"], "intro": "Her milk curdles into warnings shaped like initials.", "provinceBias": ["prov_pigritarium", "prov_stultorum"], "cityTraitBias": ["Bell", "Festival"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "embroiderer_of_scars", "nodeId": "npc_embroiderer_of_scars", "name": "The Embroiderer of Scars", "title": "Wound Chronicler", "role": "artisan", "symbols": ["memory", "truth", "blood", "identity"], "intro": "The Embroiderer stitches injuries into legal patterns.", "provinceBias": ["prov_tartaria", "prov_veneria"], "cityTraitBias": ["Lantern", "Mask"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "turnip_reeve", "nodeId": "npc_turnip_reeve", "name": "The Turnip Reeve", "title": "Vegetable Magistrate", "role": "official", "symbols": ["absurdity", "authority", "trade", "foolishness"], "intro": "The Turnip Reeve adjudicates produce with terrifying sincerity.", "provinceBias": ["prov_stultorum", "prov_gourmandise"], "cityTraitBias": ["Festival", "Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "washerwoman_red_threads", "nodeId": "npc_washerwoman_red_threads", "name": "The Washerwoman of Red Threads", "title": "Laundry Witness", "role": "commoner", "symbols": ["hidden", "truth", "blood", "thread"], "intro": "She finds confessions in laundry water.", "provinceBias": ["prov_bibonia", "prov_veneria"], "cityTraitBias": ["Lantern", "Festival"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "falconer_of_lost_letters", "nodeId": "npc_falconer_of_lost_letters", "name": "The Falconer of Lost Letters", "title": "Aerial Informant", "role": "messenger", "symbols": ["rumor", "travel", "hidden", "truth"], "intro": "His birds bring letters no one sent.", "provinceBias": ["prov_mammonia", "prov_schlaraffenland"], "cityTraitBias": ["Lantern", "Festival"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "minstrel_wrong_verses", "nodeId": "npc_minstrel_wrong_verses", "name": "The Minstrel of Wrong Verses", "title": "Song Rumormonger", "role": "minstrel", "symbols": ["rumor", "deception", "festival", "memory"], "intro": "The Minstrel sings yesterday’s crime with tomorrow’s culprit.", "provinceBias": ["prov_bibonia", "prov_stultorum", "prov_veneria"], "cityTraitBias": ["Festival"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "bone_button_merchant", "nodeId": "npc_bone_button_merchant", "name": "The Bone-Button Merchant", "title": "Macabre Haberdasher", "role": "merchant", "symbols": ["trade", "death", "hidden", "material"], "intro": "The Merchant sells buttons carved from histories nobody wants.", "provinceBias": ["prov_tartaria", "prov_mammonia"], "cityTraitBias": ["Market", "Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "goatherd_of_appeals", "nodeId": "npc_goatherd_of_appeals", "name": "The Goatherd of Appeals", "title": "Pastoral Litigant", "role": "commoner", "symbols": ["law", "absurdity", "truth", "stubbornness"], "intro": "The Goatherd has appealed three goats and won one.", "provinceBias": ["prov_stultorum", "prov_lusoria"], "cityTraitBias": ["Festival", "Ledger"], "contexts": ["city", "case"], "rarity": "common", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "owl_courier", "nodeId": "npc_owl_courier", "name": "The Owl Courier", "title": "Nocturnal Messenger", "role": "messenger", "symbols": ["dreams", "hidden", "travel", "truth"], "intro": "The Owl Courier delivers messages after witnesses fall asleep.", "provinceBias": ["prov_pigritarium", "prov_terra_sancta"], "cityTraitBias": ["Bell", "Lantern"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "miller_with_two_shadows", "nodeId": "npc_miller_with_two_shadows", "name": "The Miller with Two Shadows", "title": "Impossible Miller", "role": "artisan", "symbols": ["illusion", "truth", "gluttony", "paradox"], "intro": "The Miller’s second shadow gives better testimony.", "provinceBias": ["prov_gourmandise", "prov_stultorum"], "cityTraitBias": ["Mirror", "Lantern"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}, {"key": "duelist_of_receipts", "nodeId": "npc_duelist_of_receipts", "name": "The Duelist of Receipts", "title": "Accounting Swordsman", "role": "duelist", "symbols": ["debt", "conflict", "truth", "wealth"], "intro": "The Duelist demands satisfaction and itemized damages.", "provinceBias": ["prov_lusoria", "prov_mammonia"], "cityTraitBias": ["Ledger", "Festival"], "contexts": ["city", "case"], "rarity": "uncommon", "encounterTypes": ["rumor", "warning", "favor"]}],
  defs: null,
  buildDefs() {
    if (this.defs) return this.defs;
    this.defs = Object.assign({}, this.coreDefs);
    this.worldNPCs.forEach(n => { this.defs[n.key] = n; });
    return this.defs;
  },
  ensureState() {
    const defs = this.buildDefs();
    const s = SCHEngine.state;
    s.npc = s.npc || { relations: {}, favorIds: [], quill: { active:true,currentCaseId:null,progress:0,clueIds:[],theorySuspectId:null,readyToPublish:false,lastActionTurn:0 } };
    s.npc.relations = s.npc.relations || {};
    s.npc.favorIds = Array.isArray(s.npc.favorIds) ? s.npc.favorIds : [];
    s.npc.quill = s.npc.quill || { active:true,currentCaseId:null,progress:0,clueIds:[],theorySuspectId:null,readyToPublish:false,lastActionTurn:0 };
    s.counters = s.counters || {};
    if (!Number.isFinite(s.counters.npcEncounter)) s.counters.npcEncounter = 0;
    if (!Number.isFinite(s.counters.npcFavor)) s.counters.npcFavor = 0;
    s.archives = s.archives || {};
    s.archives.npcEncounters = Array.isArray(s.archives.npcEncounters) ? s.archives.npcEncounters : [];
    Object.keys(defs).forEach(k => {
      if (!s.npc.relations[k]) s.npc.relations[k] = { trust:0,rivalry:0,debt:0,suspicion:0,favor:0,respect:0,encounters:0,lastChoice:null,lastOutcome:null };
    });
  },
  registerNodes() {
    this.ensureState();
    Object.entries(this.buildDefs()).forEach(([k,d]) => {
      const rel = this.relation(k);
      if (!SCHEngine.getNode(d.nodeId)) SCHEngine.registerNode({
        id:d.nodeId, type:'npc', key:k, name:d.name, title:d.title, role:d.role,
        symbols:Utils.unique([...(d.symbols||[]),'npc','recurring_character']),
        contexts:d.contexts||['city'], provinceBias:d.provinceBias||[], cityTraitBias:d.cityTraitBias||[], rarity:d.rarity||'common',
        relationship:Utils.clone(rel),
        npcHooks:k==='octavia'?['parallel_detective_future','endgame_witness_future']:['world_npc','endgame_witness_future'], links:[]
      });
    });
    SCHEngine.log(`NPC roster loaded: ${Object.keys(this.buildDefs()).length} medieval witnesses, rivals, informants, clergy, officials, and questionable people with hats.`);
  },
  relation(k) { this.ensureState(); return SCHEngine.state.npc.relations[k]; },
  adjust(k,delta={}) {
    const r=this.relation(k);
    Object.entries(delta).forEach(([a,v])=>{ if(a==='encounters') r[a]=(r[a]||0)+v; else r[a]=Utils.round2(Utils.clamp01((r[a]||0)+v)); });
    const d=this.buildDefs()[k], n=d?SCHEngine.getNode(d.nodeId):null; if(n){ n.relationship=Utils.clone(r); SCHEngine.updateNode(n); }
    return r;
  },
  relationshipLabel(k) {
    const r=this.relation(k);
    if(r.debt>=.45)return'Unpaid Debt'; if(r.trust>=.45&&r.rivalry>=.25)return'Rivalrous Trust'; if(r.trust>=.35)return'Cautious Trust';
    if(r.rivalry>=.45)return'Sharp Rivalry'; if(r.suspicion>=.35)return'Suspicious'; if(r.favor>=.25)return'Favor Owed'; if(r.respect>=.30)return'Respectful Distance'; return'Acquainted';
  },
  statusLines() {
    this.ensureState(); const defs=this.buildDefs();
    const keys=Object.keys(defs).filter(k => this.coreDefs[k] || (this.relation(k).encounters||0)>0 || (this.relation(k).favor||0)>0 || (this.relation(k).debt||0)>0);
    return keys.slice(0,14).map(k=>`${defs[k].name} — ${this.relationshipLabel(k)}`);
  },
  introFor(k) {
    const d=this.buildDefs()[k], r=this.relation(k); if(!d) return '';
    if(k==='octavia'&&r.rivalry>=.40)return'Octavia Quill appears again. She has underlined your name in her notebook, which feels both flattering and actionable.';
    if(k==='octavia'&&r.trust>=.35)return'Octavia Quill waits beside the evidence table. “I found something,” she says, with the pained expression of a person choosing collaboration.';
    if(k==='belladonna'&&r.trust>=.35)return'Sister Belladonna sees the dream before you describe it.';
    if(k==='candle_rat'&&r.debt>=.35)return'Candle-Rat appears with the confidence of a creditor.';
    if(k==='patron'&&r.debt>=.35)return'The Velvet Patron smiles with the familiarity of a recurring mistake.';
    return (typeof NPCMemorySystem !== 'undefined') ? NPCMemorySystem.reintroductionLine(k, d.intro) : d.intro;
  },
  rarityWeight(d) { return d.rarity==='rare'?0.45:d.rarity==='uncommon'?0.75:1.0; },
  encounterChance(context) {
    // With the expanded 86-NPC roster, the old <10% cap made the world feel too quiet.
    // These rates keep encounters occasional, but make NPCs a regular part of travel/case play.
    let chance = context==='sleep' ? 0.12 : context==='case' ? 0.22 : 0.16;
    const activeCase = SCHEngine.state.activeCase ? SCHEngine.getNode(SCHEngine.state.activeCase) : null;
    if (activeCase && context==='case') chance += 0.04;
    if (activeCase && context==='city') chance += 0.02;
    if (SCHEngine.state.currentEvent) chance += 0.03;
    return Math.min(0.30, chance);
  },
  candidateWeight(k, context) {
    const d=this.buildDefs()[k]; if(!d || !(d.contexts||['city']).includes(context)) return 0;
    if(d.name===SCHEngine.state.lastNPC) return 0;
    const city=SCHEngine.state.activeCity?SCHEngine.getNode(SCHEngine.state.activeCity):null;
    const activeCase=SCHEngine.state.activeCase?SCHEngine.getNode(SCHEngine.state.activeCase):null;
    const signal=Utils.unique([...(city?.symbols||[]),...(activeCase?.requiredSymbols||[]),...SCHEngine.getHottestSymbols(4)]);
    let w=1*this.rarityWeight(d);
    if((d.provinceBias||[]).includes(SCHEngine.state.activeProvince)) w+=4;
    if(city && (d.cityTraitBias||[]).includes(city.cityTrait)) w+=3;
    w += Utils.overlap(d.symbols||[], signal).length*1.8;
    const rel=this.relation(k); if((rel.encounters||0)>0) w+=0.6; if(rel.debt>=.25||rel.favor>=.25) w+=0.8;
    return Math.max(0,w+Math.random()*0.5);
  },
  recordEncounter(k,context,choice,outcome,symbols=[],delta={},extra={}) {
    this.ensureState(); const d=this.buildDefs()[k]; if(!d)return null; const r=this.adjust(k,Object.assign({encounters:1},delta)); r.lastChoice=choice; r.lastOutcome=outcome;
    const id=`npc_encounter_${++SCHEngine.state.counters.npcEncounter}`;
    const node={id,type:'npc_encounter',npcId:d.nodeId,npcKey:k,npcName:d.name,context,choice,outcome,turn:SCHEngine.state.turn,provinceId:SCHEngine.state.activeProvince,cityId:SCHEngine.state.activeCity,caseId:SCHEngine.state.activeCase,symbols:Utils.unique([...(symbols||[]),'npc_encounter']),relationshipSnapshot:Utils.clone(r),relationshipDelta:delta,npcHooks:k==='octavia'?['parallel_detective_future']:['world_npc'],links:Utils.unique([d.nodeId,SCHEngine.state.activeProvince,SCHEngine.state.activeCity,SCHEngine.state.activeCase].filter(Boolean)),extra};
    SCHEngine.registerNode(node); SCHEngine.state.archives.npcEncounters.push(Utils.clone(node)); return node;
  },
  createFavor(k,kind,label,symbols=[],effect={}) {
    this.ensureState(); const d=this.buildDefs()[k]; if(!d)return null; const id=`npc_favor_${++SCHEngine.state.counters.npcFavor}`;
    const node={id,type:'favor',kind,name:label,npcId:d.nodeId,npcKey:k,npcName:d.name,consumed:false,turnCreated:SCHEngine.state.turn,symbols:Utils.unique([...(symbols||[]),'favor',k]),effect,links:Utils.unique([d.nodeId,SCHEngine.state.activeCase,SCHEngine.state.activeProvince].filter(Boolean))};
    SCHEngine.registerNode(node); SCHEngine.state.npc.favorIds.push(id); this.adjust(k,{favor:.08}); return node;
  },
  activeFavors(kind=null) { this.ensureState(); return SCHEngine.state.npc.favorIds.map(id=>SCHEngine.getNode(id)).filter(f=>f&&!f.consumed&&(!kind||f.kind===kind)); },
  consumeFavor(kind,predicate=()=>true) { const f=this.activeFavors(kind).find(predicate); if(!f)return null; f.consumed=true; f.turnConsumed=SCHEngine.state.turn; SCHEngine.updateNode(f); return f; },
  runCaseOpeningHooks(activeCase) {
    this.ensureState(); const q=SCHEngine.state.npc.quill;
    if(activeCase&&!q.currentCaseId&&Math.random()<(MODE.name==='Deep'?.35:MODE.name==='Standard'?.25:.18)){ q.currentCaseId=activeCase.id; q.progress=1; q.readyToPublish=false; q.lastActionTurn=SCHEngine.state.turn; this.recordEncounter('octavia','case_shadow','quill_attaches','parallel_investigation_seeded',['rivalry','investigation','case'],{rivalry:.02,respect:.02},{caseId:activeCase.id}); SCHEngine.narrative(`[33m[NPC THREAD][0m Octavia Quill has also noticed this case. For now, she is only a shadow in the archive margins.`); }
  },
  advanceOnSleep() {
    this.ensureState(); const q=SCHEngine.state.npc.quill;
    if(q.currentCaseId&&SCHEngine.state.activeCase===q.currentCaseId&&!q.readyToPublish&&SCHEngine.state.turn>q.lastActionTurn&&Math.random()<(MODE.name==='Casual'?.28:MODE.name==='Standard'?.36:.44)){ q.progress=Math.min(4,(q.progress||1)+1); q.lastActionTurn=SCHEngine.state.turn; const stage=['not involved','seen nearby','has a clue','forming a theory','ready to publish'][q.progress]||'moving'; this.recordEncounter('octavia','sleep_advance','independent_progress',stage,['rivalry','investigation'],{rivalry:.01,respect:.01},{quillProgress:q.progress}); if(q.progress>=4){q.readyToPublish=true; SCHEngine.narrative(`[33m[OCTAVIA][0m Octavia Quill is ready to publish a theory on this case.`);} else SCHEngine.narrative(`[33m[OCTAVIA][0m Octavia Quill advances in parallel: ${stage}.`); }
  },
  applyTheoryInterventions(activeCase,suspectNode) {
    const notes=[]; let confidenceDelta=0;
    const linkSummary = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.suspectLinkSummary(activeCase, suspectNode.id) : {supports:0,connects:0,contradicts:0,frames:0,clears:0};
    const argScore = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.argumentScore(activeCase, suspectNode.id) : 0;
    const dirty=this.consumeFavor('dirty_lead',f=>f.effect&&f.effect.caseId===activeCase.id);
    if(dirty){ const framed=SCHEngine.state.kingpin.pending.framedSuspectId===suspectNode.id || linkSummary.frames > Math.max(linkSummary.supports, linkSummary.connects); confidenceDelta+=framed?.06:.02; notes.push(framed?'Candle-Rat’s dirty lead exposes the suspect trail as too polished.':'Candle-Rat’s dirty lead confirms the suspect trail is messy, not staged.'); }
    const oct=this.consumeFavor('octavia_warning',f=>f.effect&&f.effect.caseId===activeCase.id);
    if(oct){ if (argScore < 0.35) { confidenceDelta+=.06; notes.push('Octavia cuts away a weak argument before it embarrasses the record.'); } else { confidenceDelta+=.025; notes.push('Octavia’s professional courtesy sharpens the suspect logic without admitting she helped.'); } }
    const pat=this.consumeFavor('patron_intervention',f=>!f.effect||!f.effect.caseId||f.effect.caseId===activeCase.id);
    if(pat){ confidenceDelta+=.07; SCHEngine.state.player.corruption=Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption+.04)); notes.push('The Velvet Patron makes the theory sound inevitable. The cost arrives later.'); }
    const world=this.consumeFavor('world_npc_favor',f=>!f.effect?.caseId||f.effect.caseId===activeCase.id);
    if(world){ const fit=Utils.jaccardSimilarity(world.symbols||[], activeCase.requiredSymbols||[]); const structureFit = (activeCase.requiredEvidenceRoles || []).some(r => (world.symbols||[]).includes(r)) ? .03 : 0; confidenceDelta+=0.015+fit*.06+structureFit; notes.push(`${world.npcName}’s earlier favor enters the theory as useful marginalia.`); }
    if ((activeCase.theoryBoard?.fabricatedRoles || []).length) { notes.push('A fabricated argument gleams in the file. It helps the shape, but smells like velvet.'); confidenceDelta += .015; SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption + .01)); }
    return {confidenceDelta,notes};
  },
  finalTrialLines(chosenMask) {
    this.ensureState(); const lines=[]; const d=this.buildDefs();
    Object.keys(d).forEach(k=>{ const r=this.relation(k); if((r.trust>=.35||r.rivalry>=.35||r.debt>=.35)&&(lines.length<6)){ if(k==='octavia') lines.push(r.trust>=r.rivalry?'Octavia Quill enters the final trial with a notebook full of corrections.':'Octavia Quill objects, then grudgingly supplies the missing citation.'); else if(k==='patron'&&r.debt>=.30) lines.push('The Velvet Patron smiles from the gallery. One bargain still has your signature.'); else lines.push(`${d[k].name} appears in the final record as ${this.relationshipLabel(k).toLowerCase()} given a voice.`); } });
    return lines;
  },
  async maybeEncounter(context,ask) {
    this.ensureState(); const state=SCHEngine.state; if(state.npcShownThisTurn) return; if(Math.random()>this.encounterChance(context)) return;
    const keys=Object.keys(this.buildDefs()).filter(k=>this.candidateWeight(k,context)>0); if(!keys.length) return;
    const id=Utils.weightedPick(keys,k=>this.candidateWeight(k,context)); const def=this.buildDefs()[id]; state.npcShownThisTurn=true; state.lastNPC=def.name;
    SCHEngine.narrative(`[33m[NPC][0m ${def.name}, ${def.title}. ${this.introFor(id)}
Relationship: ${this.relationshipLabel(id)}.`);
    if(this[`handle_${id}`]) return this[`handle_${id}`](ask);
    return this.handleWorldNPC(id,ask,context);
  },
  async handleWorldNPC(id,ask,context) {
    const d=this.buildDefs()[id], activeCase=SCHEngine.state.activeCase?SCHEngine.getNode(SCHEngine.state.activeCase):null;
    console.log('1. Ask for a local lead or rumor');
    console.log('2. Request a small favor');
    console.log('3. Trade dignity for a sharper hint (+Corruption)');
    console.log('4. Leave politely');
    if (activeCase && activeCase.clues && activeCase.clues.length) console.log('5. Ask them to interpret your last clue');
    const c=(await ask(`${d.name} waits for your choice: `)).trim();
    if(c==='1'){
      if(activeCase){ const sym=Utils.pickRandom(Utils.overlap(d.symbols||[],activeCase.requiredSymbols||[]))||Utils.pickRandom(activeCase.requiredSymbols); SCHEngine.state.player.temp.targetSymbolHint=sym; this.recordEncounter(id,context,'ask_lead','symbol_hint',['rumor','truth',sym],{trust:.03,respect:.01},{symbol:sym}); SCHEngine.narrative(`${d.name} points your attention toward [${sym}].`); }
      else { const rumor=RumorSystem.generate(SCHEngine.state.activeProvince||null,null); this.recordEncounter(id,context,'ask_rumor','rumor_generated',['rumor'],{trust:.02},{rumorId:rumor?.id||null}); if(rumor) SCHEngine.narrative(`${d.name} gives the rumor a local accent: ${rumor.text}`); }
    } else if(c==='2'){
      this.createFavor(id,'world_npc_favor',`${d.name}’s Favor`,d.symbols||[],{caseId:activeCase?.id||null,npcKey:id}); this.recordEncounter(id,context,'request_favor','favor_created',['favor',...(d.symbols||[])],{trust:.03,favor:.05,debt:.02},{caseId:activeCase?.id||null}); SCHEngine.narrative(`${d.name} gives you a small favor. It has edges, as favors do.`);
    } else if(c==='3'){
      SCHEngine.state.player.corruption=Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption+.03));
      if(activeCase){ const sym=Utils.pickRandom(activeCase.requiredSymbols); SCHEngine.state.player.temp.targetSymbolHint=sym; this.recordEncounter(id,context,'corrupt_hint','symbol_hint',['corruption',sym],{debt:.04,suspicion:.03},{symbol:sym}); SCHEngine.narrative(`The hint arrives bright and slightly wrong: [${sym}].`); }
      else { this.adjust(id,{debt:.04,suspicion:.03}); SCHEngine.narrative('The bargain leaves a thumbprint where your better judgment used to be.'); }
    } else if(c==='5' && activeCase && activeCase.clues && activeCase.clues.length && typeof InvestigationCoherence !== 'undefined'){
      const clue = activeCase.clues[activeCase.clues.length - 1]; const isCaseSuspect = Object.values(activeCase.npcCaseRoles || {}).includes('suspect') && (activeCase.suspectIds || []).some(sid => SCHEngine.getNode(sid)?.sourceNpcKey === id);
        const interpretation = InvestigationCoherence.npcInterpretClue(id, d, activeCase, clue);
        if (isCaseSuspect && interpretation) interpretation.text += ' (Note: this interpretation comes from someone on the suspect board.)'; this.recordEncounter(id,context,'interpret_clue','clue_interpreted',['npc_interpretation',...(interpretation?.symbols||[])],{trust:.03,respect:.02},{clueId:clue.id,interpretation}); SCHEngine.narrative(interpretation?.text || `${d.name} studies the clue, then decides the clue should apologize first.`);
    } else { this.recordEncounter(id,context,'leave','no_effect',['distance'],{respect:.01}); SCHEngine.narrative(`${d.name} lets you go, which is not quite the same as forgetting you.`); }
  },
  async handle_octavia(ask) {
    const ac=SCHEngine.state.activeCase?SCHEngine.getNode(SCHEngine.state.activeCase):null;
    if(!ac){this.recordEncounter('octavia','no_case','none','left_disappointed',['rivalry'],{rivalry:.01}); return SCHEngine.narrative('Octavia finds no active case to steal from you and leaves disappointed.');}
    console.log('1. Accept her clue and lose 2% Reputation'); console.log('2. Refuse her help'); console.log('3. Ask her to mark weak suspect logic before resolution'); console.log('4. Mislead her (+Corruption)'); console.log('5. Ask her to audit your argument board');
    const c=(await ask('Octavia offers a “professional courtesy.” Take it? ')).trim();
    if(c==='1'){const unseen=ac.requiredSymbols.filter(sym=>!ac.clues.some(c=>c.symbols.includes(sym))); const h=unseen[0]||Utils.pickRandom(ac.requiredSymbols); SCHEngine.state.player.temp.targetSymbolHint=h; SCHEngine.state.player.reputation=Utils.round2(Utils.clamp01(SCHEngine.state.player.reputation-.02)); this.recordEncounter('octavia','case','accept_clue','shared_lead',['truth','evidence','rivalry'],{trust:.05,rivalry:.03,respect:.03},{hinted:h}); SCHEngine.narrative(`Octavia leaves you a sharpened lead pointing toward [${h}] and quietly signs her name over half your glory.`);}
    else if(c==='3'){this.createFavor('octavia','octavia_warning','Professional Courtesy',['truth','warning','rivalry'],{caseId:ac.id}); this.recordEncounter('octavia','case','request_warning','future_suspect_warning',['truth','warning'],{trust:.04,respect:.04}); SCHEngine.narrative('Octavia marks three places in your notes where a bad suspect argument would embarrass you both.');}
    else if(c==='4'){SCHEngine.state.player.corruption=Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption+.04)); const q=SCHEngine.state.npc.quill; if(q.currentCaseId===ac.id)q.progress=Math.max(0,(q.progress||0)-1); this.recordEncounter('octavia','case','mislead','quill_slowed',['deception','rivalry','corruption'],{rivalry:.09,suspicion:.06},{caseId:ac.id}); SCHEngine.narrative('You misdirect Octavia with a technically plausible wrongness.');}
    else if(c==='5' && typeof InvestigationCoherence !== 'undefined'){ const lines = ac.suspectIds.map(sid => { const s=SCHEngine.getNode(sid); const score=InvestigationCoherence.argumentScore(ac, sid); const link=InvestigationCoherence.suspectLinkSummary(ac, sid); return `${s.name}: argument ${Utils.describePct(score)} | supports ${link.supports} | frames ${link.frames}`; }); this.createFavor('octavia','octavia_warning','Argument Audit',['truth','warning','structure'],{caseId:ac.id}); this.recordEncounter('octavia','case','audit_argument','argument_board_reviewed',['truth','structure','warning'],{trust:.04,respect:.04}); SCHEngine.narrative('Octavia reviews the board. “Symbols are evidence only after they survive grammar.”\n' + lines.join('\n'));}
    else {this.recordEncounter('octavia','case','refuse_help','rivalry_respected',['rivalry','respect'],{rivalry:.04,respect:.02}); SCHEngine.narrative('Octavia files you under “interesting, if temporary.”');}
  },
  async handle_belladonna(ask) {
    console.log('1. Ask for a stronger dream'); console.log('2. Ask for a cleansing vigil'); console.log('3. Request a Dream Vigil favor for later'); console.log('4. Reclassify the last clue as dream context');
    const c=(await ask('Sister Belladonna offers incense and inconvenient truth. Choose: ')).trim(); const ac=SCHEngine.state.activeCase?SCHEngine.getNode(SCHEngine.state.activeCase):null;
    if(c==='1'){SCHEngine.state.player.temp.nextSleepHints+=1; this.recordEncounter('belladonna','dream','stronger_dream','next_sleep_hint',['dreams','guidance'],{trust:.05}); SCHEngine.narrative('Your next dream will speak more clearly.');}
    else if(c==='2'){SCHEngine.state.player.temp.nextSleepCleanse=true; this.recordEncounter('belladonna','cleanse','cleansing_vigil','next_sleep_cleanse',['cleansing'],{trust:.04}); SCHEngine.narrative('One taint will weaken next rest.');}
    else if(c==='3'){this.createFavor('belladonna','dream_vigil','Dream Vigil',['dreams','cleansing'],{}); this.recordEncounter('belladonna','favor','dream_vigil','favor_created',['favor','dreams'],{trust:.06,favor:.04}); SCHEngine.narrative('Belladonna gives you a candle-end wrapped in thread.');}
    else if(c==='4'&&ac&&ac.clues.length&&typeof InvestigationCoherence!=='undefined'){ const newRole = Utils.overlap(ac.requiredEvidenceRoles||[], ['world_context','lieutenant_trace']).length ? Utils.pickRandom(Utils.overlap(ac.requiredEvidenceRoles||[], ['world_context','lieutenant_trace'])) : 'world_context'; const result = InvestigationCoherence.reclassifyLastClue(ac, newRole, 'Belladonna'); this.recordEncounter('belladonna','case','dream_reclassify','clue_role_reclassified',['dreams','interpretation',newRole],{trust:.05,respect:.02},{clueId:result?.clue?.id,oldRole:result?.oldRole,newRole}); SCHEngine.narrative(`Belladonna turns the clue toward sleep. It moves from ${InvestigationCoherence.roleLabels[result.oldRole]||result.oldRole} to ${InvestigationCoherence.roleLabels[newRole]||newRole}.`);}
    else this.recordEncounter('belladonna','decline','leave','no_effect',['distance'],{respect:.01});
  },
  async handle_candle_rat(ask) {
    console.log('1. Pay 5% Insight for the best city lead'); console.log('2. Take 4% Corruption for suspect gossip'); console.log('3. Ask whether the loudest rumor is a lie'); console.log('4. Owe him a favor for a dirty lead'); console.log('5. Ask whether a suspect trail is too polished');
    const c=(await ask('Candle-Rat scratches a price into the air. Choose: ')).trim(); const ac=SCHEngine.state.activeCase?SCHEngine.getNode(SCHEngine.state.activeCase):null;
    if(c==='1'){ if(SCHEngine.state.player.insight<.05)return SCHEngine.narrative('You lack the Insight to afford his confidence.'); SCHEngine.state.player.insight=Utils.round2(Utils.clamp01(SCHEngine.state.player.insight-.05)); if(!ac)return SCHEngine.narrative('No case, no map.'); const cities=WorldBuilder.getCitiesInProvince(ac.provinceId); const best=cities.sort((a,b)=>Utils.jaccardSimilarity(b.symbols,ac.requiredSymbols)-Utils.jaccardSimilarity(a.symbols,ac.requiredSymbols))[0]; this.recordEncounter('candle_rat','lead','paid_city_lead','city_recommended',['rumor','city','truth'],{trust:.04},{cityId:best.id}); SCHEngine.narrative(`Candle-Rat recommends ${best.name}.`);}
    else if(c==='2'){SCHEngine.state.player.corruption=Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption+.04)); if(!ac)return SCHEngine.narrative('Without a case, the gossip is merely slander.'); const sid=Utils.pickRandom(ac.suspectIds), s=SCHEngine.getNode(sid), sym=Utils.pickRandom(s.symbols.filter(x=>x!=='suspect')); this.recordEncounter('candle_rat','gossip','corrupt_suspect_gossip','suspect_hint',['corruption','suspect',sym],{trust:.03,debt:.02},{suspectId:sid,symbol:sym}); SCHEngine.narrative(`Watch ${s.name}. Smells like [${sym}].`);}
    else if(c==='3'){const r=SCHEngine.state.rumors[0]; if(!r)return SCHEngine.narrative('No rumors? Then who have we all been disappointing?'); this.recordEncounter('candle_rat','rumor','test_rumor',r.falseHint?'false_hint_spotted':'rumor_probably_real',['rumor','truth'],{trust:.04},{rumorId:r.id,falseHint:r.falseHint}); SCHEngine.narrative(`That rumor is ${r.falseHint?'performing falsehood professionally':'messy, but probably real'}.`);}
    else if(c==='4'&&ac){ this.createFavor('candle_rat','dirty_lead','Dirty Lead',['rumor','warning','suspect'],{caseId:ac.id}); this.recordEncounter('candle_rat','favor','owe_dirty_lead','favor_created',['debt','warning'],{debt:.10,trust:.03},{caseId:ac.id}); SCHEngine.narrative('Candle-Rat sells you a dirty lead on credit.');}
    else if(c==='5'&&ac&&typeof InvestigationCoherence!=='undefined'){ const suspectLines = ac.suspectIds.map(sid=>{ const s=SCHEngine.getNode(sid); const link=InvestigationCoherence.suspectLinkSummary(ac,sid); return {s,link,score:link.frames-link.supports-link.connects}; }).sort((a,b)=>b.score-a.score); const top=suspectLines[0]; this.createFavor('candle_rat','dirty_lead','Frame-Sniffed Lead',['rumor','warning','suspect'],{caseId:ac.id}); this.recordEncounter('candle_rat','frame_check','sniff_false_lead','frame_logic_reviewed',['rumor','warning','false_lead'],{trust:.04,debt:.04},{suspectId:top?.s?.id,summary:top?.link}); if(top && top.score>0) SCHEngine.narrative(`Candle-Rat sniffs the file. “${top.s.name} smells too polished. Frames: ${top.link.frames}; support: ${top.link.supports + top.link.connects}.”`); else SCHEngine.narrative('Candle-Rat sniffs the file. “Messy, but not staged enough to admire.”');}
    else this.recordEncounter('candle_rat','decline','leave','no_effect',['distance'],{respect:.01});
  },
  async handle_patron(ask) {
    console.log('1. Gain +10% next theory confidence boost for +6% Corruption'); console.log('2. Cleanse one taint now for +4% Worlock awareness'); console.log('3. Reveal a hidden case symbol for +6% Corruption'); console.log('4. Request a Velvet Intervention favor'); console.log('5. Fill a missing evidence role with a suspiciously elegant argument (+5% Corruption)');
    const c=(await ask('The Velvet Patron offers a bargain. Choose: ')).trim();
    if(c==='1'){SCHEngine.state.player.temp.theoryBoost+=.10; SCHEngine.state.player.corruption=Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption+.06)); this.recordEncounter('patron','bargain','theory_boost','corruption_for_confidence',['bargain','corruption'],{debt:.06,suspicion:.02}); SCHEngine.narrative('The Patron toasts your future certainty.');}
    else if(c==='3'){const ac=SCHEngine.state.activeCase?SCHEngine.getNode(SCHEngine.state.activeCase):null; if(!ac)return SCHEngine.narrative('Without a case, the bargain reveals only your willingness to sign.'); const unseen=ac.requiredSymbols.filter(sym=>!ac.clues.some(c=>c.symbols.includes(sym))); const h=unseen[0]||Utils.pickRandom(ac.requiredSymbols); SCHEngine.state.player.temp.targetSymbolHint=h; SCHEngine.state.player.corruption=Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption+.06)); this.recordEncounter('patron','bargain','reveal_symbol','corruption_for_symbol',['bargain','corruption',h],{debt:.06},{symbol:h,caseId:ac.id}); SCHEngine.narrative(`The Patron paints [${h}] on the inside of your eyelids.`);}
    else if(c==='4'){this.createFavor('patron','patron_intervention','Velvet Intervention',['bargain','corruption','confidence'],{caseId:SCHEngine.state.activeCase||null}); this.recordEncounter('patron','favor','velvet_intervention','favor_created',['bargain','favor'],{debt:.12,suspicion:.04}); SCHEngine.narrative('The Patron gives you a sealed compliment. Open it during a theory and it will become useful.');}
    else if(c==='5'){const ac=SCHEngine.state.activeCase?SCHEngine.getNode(SCHEngine.state.activeCase):null; if(!ac || typeof InvestigationCoherence==='undefined') return SCHEngine.narrative('Without a case, the Patron can only admire your pliability.'); const fabricated = InvestigationCoherence.fabricateMissingRole(ac, 'The Velvet Patron'); SCHEngine.state.player.corruption=Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption+.05)); this.recordEncounter('patron','bargain','fabricate_role','missing_role_filled',['bargain','corruption','suspicious',fabricated.role],{debt:.12,suspicion:.06},{caseId:ac.id,fabricated}); SCHEngine.narrative(`The Patron writes a perfect little bridge into your notes: ${InvestigationCoherence.roleLabels[fabricated.role] || fabricated.role}. It is useful. It is also smiling.`);}
    else { const tainted=[...SCHEngine.state.player.hand,...SCHEngine.state.player.drawPile,...SCHEngine.state.player.discardPile].find(c=>c.contamination&&(c.contamination.markedByKingpin||c.contamination.reversedBias>0||c.contamination.corruptionTax>0||(c.contamination.shadowSymbols||[]).length>0)); if(c==='2'&&tainted){tainted.contamination.reversedBias=0; tainted.contamination.corruptionTax=0; tainted.contamination.shadowSymbols=[]; tainted.contamination.markedByKingpin=false; SCHEngine.state.kingpin.awareness=Utils.round2(Utils.clamp01(SCHEngine.state.kingpin.awareness+.04)); this.recordEncounter('patron','bargain','cleanse_taint','worlock_awareness_gain',['bargain','cleansing'],{debt:.05}); SCHEngine.narrative(`${tainted.name} loses its curse. Somewhere, the Worlock notices.`);} else this.recordEncounter('patron','decline','leave','no_effect',['distance'],{respect:.01}); }
  }
};

// ============================================================================
// PACKAGE B SYSTEM: LIEUTENANTS / MINI-BOSSES
// ============================================================================

// ============================================================================
// LIEUTENANT CONFRONTATION STORY SYSTEM
// ============================================================================
const LieutenantConfrontationStorySystem = {
  pick(list, fallback = '') { return Utils.pickRandom(list || []) || fallback; },
  pressureDef(pressure) {
    const defs = {
      mirror: {
        titles:['The Trial in the Mirror','The Court of Polished Verdicts','The Deposition That Refused One Face'],
        venues:['a courthouse whose benches reflect different verdicts','a mirror-hall behind the city records','a lantern-lit court where every witness has a duplicate'],
        defenses:['polishes a false conclusion until it resembles truth','asks the reflections to testify before the witnesses do','turns every answer around and calls the reversal precedent'],
        objects:['reflection','verdict','testimony']
      },
      dream: {
        titles:['The Bell That Would Not Accuse','The Vespers Under Sleep','The Dream Court Below the Clapper'],
        venues:['a chapel where bells hang open but make no sound','a street asleep under a bronze-colored sky','a dream archive where every testimony is heard through ringing'],
        defenses:['swallows the testimony before it can wake','chews the bell-tone out of memory','lulls the witnesses until their names become echoes'],
        objects:['silence','dream','toll']
      },
      mask: {
        titles:['The Masquerade of Borrowed Names','The Stage of Convenient Guilt','The Clerk Behind the Mask'],
        venues:['a festival stage where every mask has a better alibi','a records office dressed as a theater','a market square where suspects bow before being accused'],
        defenses:['hands guilt to the best-performing face','files the wrong name under the right crime','rehearses a confession until it becomes fashionable'],
        objects:['mask','role','confession']
      },
      ledger: {
        titles:['The Audit of the Hungry Office','The Account That Ate the Witness','The Balance Sheet of Teeth'],
        venues:['a ledger hall whose columns extend under the floor','an account room warm with unpaid appetite','a counting house where every debt has a pulse'],
        defenses:['charges interest on every doubt','itemizes witnesses until they become liabilities','balances hunger against law and calls it proof'],
        objects:['account','debt','receipt']
      },
      corruption: {
        titles:['The Velvet Equation','The Bargain Written Backward','The Proof That Smiled Too Soon'],
        venues:['a velvet chamber where certainty is sold by signature','a counting room lit by flattering lies','a parlor where bargains arrive before choices'],
        defenses:['offers the easiest answer with a beautiful receipt','prices your certainty and discounts your doubt','turns temptation into an argument with excellent posture'],
        objects:['bargain','signature','equation']
      },
      festival: {
        titles:['The Feast of Wrong Witnesses','The Carnival of Excess Testimony','The Trial Under Applause'],
        venues:['a festival square where the crowd applauds contradictions','a banquet table laid with warrants and masks','a parade route where evidence arrives in costume'],
        defenses:['drowns the accusation under music and appetite','throws confetti over the hinge of the case','invites every false witness to speak at once'],
        objects:['chorus','banner','witness']
      },
      default: {
        titles:['The Trial of the Hidden Pattern','The Province Under Cross-Examination','The Graph Draws Blood'],
        venues:['a chamber built from the province graph','a crossroads where clues knot into a single figure','an archive room where every symbol leans closer'],
        defenses:['turns symbols into procedure','hides behind an official shape','tries to make the pattern look inevitable'],
        objects:['pattern','trace','argument']
      }
    };
    return defs[pressure] || defs.default;
  },
  context(lt) {
    const province = SCHEngine.state.activeProvince ? SCHEngine.getNode(SCHEngine.state.activeProvince) : null;
    const city = SCHEngine.state.activeCity ? SCHEngine.getNode(SCHEngine.state.activeCity) : null;
    const activeCase = SCHEngine.state.activeCase ? SCHEngine.getNode(SCHEngine.state.activeCase) : null;
    const clues = activeCase?.clues || [];
    const recentClue = clues.length ? clues[clues.length - 1] : null;
    const evidenceSymbols = Utils.unique(clues.flatMap(c => c.symbols || []));
    const caseSymbols = activeCase?.requiredSymbols || [];
    const graphSymbols = Utils.unique([...(province?.symbols || []), ...(city?.symbols || []), ...(caseSymbols || []), ...(evidenceSymbols || [])]).filter(s => !['province','city','settlement'].includes(s));
    return { province, city, activeCase, recentClue, evidenceSymbols, caseSymbols, graphSymbols };
  },
  registerScene(lt, scene) {
    const id = `lieutenant_scene_${++SCHEngine.state.counters.lieutenantConfrontation}_preview`;
    const node = {
      id,
      type:'lieutenant_confrontation_scene',
      lieutenantId:lt.id,
      lieutenantName:lt.name,
      pressure:lt.pressure,
      title:scene.title,
      turn:SCHEngine.state.turn,
      provinceId:SCHEngine.state.activeProvince,
      cityId:SCHEngine.state.activeCity,
      caseId:SCHEngine.state.activeCase,
      symbols:Utils.unique([...(lt.symbols || []), ...(scene.signalSymbols || []), 'lieutenant_scene']),
      fragments:scene.fragments,
      links:Utils.unique([lt.id, SCHEngine.state.activeProvince, SCHEngine.state.activeCity, SCHEngine.state.activeCase].filter(Boolean))
    };
    SCHEngine.registerNode(node);
    return node;
  },
  buildScene(lt) {
    const ctx = this.context(lt);
    const def = this.pressureDef(lt.pressure);
    const signalSymbols = Utils.unique([...(lt.symbols || []), ...(ctx.graphSymbols || [])]).filter(s => !['lieutenant','kingpin_network'].includes(s)).slice(0, 8);
    const title = this.pick(def.titles, `The Trial of ${lt.name}`);
    const venue = this.pick(def.venues, 'a chamber of unstable proof');
    const defense = this.pick(def.defenses, 'turns the argument into smoke');
    const cityLine = ctx.city ? `${ctx.city.name} lends the scene its ${ctx.city.cityTraitName || ctx.city.cityTrait || 'local'} logic.` : 'No city claims responsibility for the shape of the scene.';
    const caseLine = ctx.activeCase ? `The active case drags in [${(ctx.caseSymbols || []).slice(0,3).join(', ')}].` : 'With no active case, the province graph itself supplies the accusation.';
    const clueLine = ctx.recentClue ? `Your latest clue enters as ${ctx.recentClue.evidenceRole || ctx.recentClue.material?.evidenceRole || 'evidence'}, still smelling of [${(ctx.recentClue.symbols || []).slice(0,2).join(', ')}].` : 'No recent clue speaks first; the older traces murmur together.';
    const scene = { title, signalSymbols, fragments:{venue,defense,cityLine,caseLine,clueLine} };
    scene.node = this.registerScene(lt, scene);
    return scene;
  },
  coreChoiceText(sym, i, lt, scene) {
    const def = this.pressureDef(lt.pressure);
    const obj = this.pick(def.objects, 'trace');
    const forms = [
      `The ${obj} that keeps returning to [${sym}]`,
      `The ${obj} hidden under a provincial sign of [${sym}]`,
      `The ${obj} ${lt.name} refuses to let testify: [${sym}]`,
      `The ${obj} that makes the scene lean toward [${sym}]`
    ];
    let line = this.pick(forms, `A structural trace of [${sym}]`);
    if (MODE.name === 'Deep') line = line.replace(` [${sym}]`, '').replace(`[${sym}]`, 'itself');
    else if (MODE.name === 'Standard' && i % 2 === 1) line = line.replace(`[${sym}]`, `[?]`);
    return line;
  },
  openingText(lt, scene) {
    return `=== CONFRONTATION: ${scene.title.toUpperCase()} ===\n${scene.fragments.venue}.\n${lt.name} ${scene.fragments.defense}.\n${scene.fragments.cityLine}\n${scene.fragments.caseLine}\n${scene.fragments.clueLine}\n\nThis is still a symbolic attack on the graph, but the graph has chosen to behave like a courtroom with stage directions.`;
  },
  coreReact(lt, chosenCore, coreHit) {
    if (coreHit) return `${lt.name} flinches. [${chosenCore}] is not merely decoration; it is load-bearing.`;
    return `${lt.name} smiles through the wrong answer. [${chosenCore}] matters, but it is not the hinge.`;
  },
  tarotText(card, family, orientation, tarotFit, lt) {
    const familyVerb = {
      Oracle:'names the hidden architecture', Audit:'turns the defense into accounts and seals', 'Cross-Examine':'forces contradictions to answer in order', Dreamwalk:'steps behind the waking scenery', Pursuit:'chases the lieutenant through its own momentum', Unknown:'presses against the mask'
    }[family] || 'presses against the mask';
    const tilt = orientation === 'reversed' ? 'The card lands reversed; the scene resists the reading.' : 'The card lands upright; the scene gives ground.';
    const fit = tarotFit >= 0.30 ? 'It fits the lieutenant disturbingly well.' : tarotFit >= 0.15 ? 'It catches part of the lieutenant pattern.' : 'It functions more as courage than precision.';
    return `${card.name} unfolds as ${family}. It ${familyVerb}. ${tilt} ${fit}`;
  },
  assertionChoiceText(sym, i, lt) {
    const lines = [
      `The surviving evidence insists on [${sym}]`,
      `A graph-edge brightens around [${sym}]`,
      `The record will accept [${sym}] if you make it speak`,
      `One witness-shape remains: [${sym}]`
    ];
    let line = this.pick(lines, `Assert [${sym}]`);
    if (MODE.name === 'Deep' && i % 2 === 0) line = line.replace(`[${sym}]`, 'an unnamed trace');
    return line;
  },
  assertionText(asserted, assertionHit, lt) {
    if (assertionHit) return `You drive [${asserted}] into the record. The graph accepts it as a surviving edge.`;
    return `You assert [${asserted}]. The graph records it, but the lieutenant twists away from the angle.`;
  },
  outcomeText(outcome, score, lt, record) {
    if (outcome === 'defeated') return `The scene breaks open. ${lt.name} loses its administrative body and collapses into usable traces. Score: ${Utils.describePct(score)}.`;
    if (outcome === 'weakened') return `${lt.name} escapes through a clause in the scenery, but leaves part of its name pinned to the graph. Score: ${Utils.describePct(score)}.`;
    return `${lt.name} survives the confrontation and learns the shape of your method. The province keeps the bruise. Score: ${Utils.describePct(score)}.`;
  },
  pressureLabel(pressure) {
    const labels = { mirror:'Mirror / Reflection', dream:'Dream / Bell', mask:'Mask / Identity', ledger:'Ledger / Debt', corruption:'Bargain / Corruption', festival:'Festival / Excess' };
    return labels[pressure] || 'Hidden Pattern';
  },
  likelySymbols(lt) {
    return (lt.symbols || []).filter(s => !['lieutenant','kingpin_network'].includes(s)).slice(0, 4);
  },
  usefulTarotHints(pressure) {
    const hints = { mirror:'Justice, Moon, Judgement, Swords', dream:'Moon, High Priestess, Star, Cups', mask:'Moon, Judgement, Swords, Hanged Man', ledger:'Devil, Justice, Emperor, Pentacles', corruption:'Devil, Temperance, Justice, Pentacles', festival:'Sun, Wheel, Cups, Wands' };
    return hints[pressure] || 'cards that share the lieutenant symbols';
  },
  matchLabel(score) {
    if (score >= 0.34) return 'Strong match';
    if (score >= 0.20) return 'Good match';
    if (score >= 0.10) return 'Weak match';
    return 'Poor match';
  },
  strengthLabel(score) {
    if (score >= 0.70) return 'dominant';
    if (score >= 0.54) return 'strong';
    if (score >= 0.34) return 'promising';
    if (score >= 0.18) return 'unsteady';
    return 'weak';
  },
  briefText(lt, scene) {
    const likely = this.likelySymbols(lt);
    const lines = [
      '=== CONFRONTATION BRIEF ===',
      `Target: ${lt.name}`,
      `Pressure: ${this.pressureLabel(lt.pressure)}`,
      '',
      'How to win:',
      '1. Identify what the lieutenant is really built from.',
      '2. Use a Tarot card that matches that pattern.',
      '3. Assert evidence your archive or the scene can support.'
    ];
    if (MODE.name === 'Casual') lines.push('', `Likely symbols: ${likely.join(', ') || 'unclear'}`, `Good counters: ${this.usefulTarotHints(lt.pressure)}`);
    else if (MODE.name === 'Standard') lines.push('', `Likely pattern: ${likely.slice(0, 3).join(' / ') || this.pressureLabel(lt.pressure)}`);
    else lines.push('', `The scene whispers: ${this.pressureDef(lt.pressure).objects.join(' / ')}.`);
    return lines.join('\n');
  },
  tarotChoiceText(card, lt) {
    const fit = Utils.jaccardSimilarity(TarotBuilder.cardEffectiveSymbols(card), lt.symbols || []);
    return `${TarotBuilder.cardLabel(card)} [${TarotBuilder.cardEffectiveSymbols(card).join(', ')}] — ${this.matchLabel(fit)}`;
  },
  coreProgressText(coreHit) {
    return coreHit ? 'Confrontation strength: strong opening.' : 'Confrontation strength: weak opening.';
  },
  tarotProgressText(tarotFit, orientation) {
    const reversed = orientation === 'reversed' ? ' Reversed orientation adds risk.' : '';
    return `Confrontation strength: ${this.matchLabel(tarotFit).toLowerCase()}.${reversed}`;
  },
  assertionProgressText(assertionHit) {
    return assertionHit ? 'Final pressure: supported by the archive or lieutenant pattern.' : 'Final pressure: unsupported; the scene may not hold.';
  },
  assertionChoiceText(sym, i, lt, source = null) {
    const lines = [
      `The surviving evidence insists on [${sym}]`,
      `A graph-edge brightens around [${sym}]`,
      `The record will accept [${sym}] if you make it speak`,
      `One witness-shape remains: [${sym}]`
    ];
    let line = this.pick(lines, `Assert [${sym}]`);
    if (source && MODE.name !== 'Deep') line += ` (${source})`;
    if (MODE.name === 'Deep' && i % 2 === 0) line = line.replace(`[${sym}]`, 'an unnamed trace');
    return line;
  },
  summaryText(record, lt) {
    const tarotLabel = this.matchLabel(record.tarotFit || 0);
    const result = record.outcome === 'defeated' ? 'defeated' : record.outcome === 'weakened' ? 'weakened' : 'escaped';
    const lines = [
      'CONFRONTATION SUMMARY',
      `Core pattern: ${record.chosenCore || 'unknown'} — ${record.coreHit ? 'correct' : 'off target'}`,
      `Tarot card: ${record.cardName || 'unknown'} — ${tarotLabel}${record.orientation === 'reversed' ? ', reversed' : ''}`,
      `Evidence assertion: ${record.asserted || 'unknown'} — ${record.assertionHit ? 'supported' : 'unsupported'}`,
      `Result: ${lt.name} ${result}`
    ];
    if (record.outcome === 'defeated') lines.push('What changed: lieutenant power is broken, corruption eases, and the Worlock loses cover.');
    else if (record.outcome === 'weakened') lines.push('What changed: lieutenant power drops, exposure remains useful, and a later confrontation should be easier.');
    else lines.push('What changed: lieutenant power rises slightly, corruption increases, but the exposure trail remains in the archive.');
    return lines.join('\n');
  },
  attachRecord(record, scene, extras = {}) {
    record.sceneTitle = scene?.title || null;
    record.sceneNodeId = scene?.node?.id || null;
    record.storyFragments = scene?.fragments || {};
    record.story = Object.assign({}, extras);
    if (scene?.node) {
      scene.node.resolvedRecordId = record.id;
      scene.node.outcome = record.outcome || 'pending';
      SCHEngine.updateNode(scene.node);
    }
    return record;
  }
};

const LieutenantSystem = {
  templates: [
    { key:'mirror_advocate', name:'The Mirror Advocate', symbols:['illusion','truth','mirror','authority'], preferredTraits:['Mirror','Mask'], provinceBias:['prov_terra_sancta','prov_stultorum','prov_veneria'], pressure:'mirror' },
    { key:'bell_eater', name:'The Bell-Eater', symbols:['bell','dreams','silence','hidden'], preferredTraits:['Bell','Lantern'], provinceBias:['prov_pigritarium','prov_terra_sancta','prov_bibonia'], pressure:'dream' },
    { key:'masked_clerk', name:'The Masked Clerk', symbols:['mask','deception','suspect','trade'], preferredTraits:['Mask','Festival'], provinceBias:['prov_veneria','prov_mammonia','prov_stultorum'], pressure:'mask' },
    { key:'auditor_of_hunger', name:'The Auditor of Hunger', symbols:['debt','gluttony','ledger','excess'], preferredTraits:['Ledger','Festival'], provinceBias:['prov_mammonia','prov_gourmandise','prov_schlaraffenland'], pressure:'ledger' },
    { key:'velvet_mathematician', name:'The Velvet Mathematician', symbols:['bargain','greed','corruption','choice'], preferredTraits:['Ledger','Mask'], provinceBias:['prov_mammonia','prov_lusoria','prov_veneria'], pressure:'corruption' },
    { key:'feast_bailiff', name:'The Feast-Bailiff', symbols:['excess','festival','punishment','indulgence'], preferredTraits:['Festival','Bell'], provinceBias:['prov_schlaraffenland','prov_gourmandise','prov_tartaria'], pressure:'festival' }
  ],

  ensureState() {
    const s = SCHEngine.state;
    s.lieutenantIds = Array.isArray(s.lieutenantIds) ? s.lieutenantIds : [];
    s.activeLieutenantId = s.activeLieutenantId || null;
    s.counters = s.counters || {};
    if (!Number.isFinite(s.counters.lieutenant)) s.counters.lieutenant = 0;
    if (!Number.isFinite(s.counters.lieutenantTrace)) s.counters.lieutenantTrace = 0;
    if (!Number.isFinite(s.counters.lieutenantConfrontation)) s.counters.lieutenantConfrontation = 0;
    s.archives = s.archives || {};
    s.archives.lieutenantConfrontations = Array.isArray(s.archives.lieutenantConfrontations) ? s.archives.lieutenantConfrontations : [];
  },

  initialize() {
    this.ensureState();
    if (SCHEngine.state.lieutenantIds.length > 0 && SCHEngine.state.lieutenantIds.some(id => SCHEngine.getNode(id))) return;
    const provinces = WorldBuilder.getProvinces();
    const selectedTemplates = Utils.shuffle(this.templates).slice(0, 3);
    selectedTemplates.forEach((template, index) => {
      const biased = provinces.filter(p => (template.provinceBias || []).includes(p.id));
      const provincePool = biased.length ? biased : provinces;
      const provinceIds = Utils.shuffle(provincePool).slice(0, 2).map(p => p.id);
      const id = `lieutenant_${++SCHEngine.state.counters.lieutenant}`;
      const node = {
        id,
        type: 'lieutenant',
        name: template.name,
        key: template.key,
        symbols: Utils.unique([...template.symbols, 'lieutenant', 'kingpin_network']),
        provinceIds,
        preferredTraits: Utils.clone(template.preferredTraits || []),
        pressure: template.pressure,
        exposure: 0,
        power: Utils.round2(0.45 + index * 0.08 + (MODE.name === 'Deep' ? 0.08 : MODE.name === 'Casual' ? -0.04 : 0)),
        phase: 'hidden',
        exposed: false,
        confrontationUnlocked: false,
        defeated: false,
        weakened: false,
        links: Utils.unique([...provinceIds])
      };
      SCHEngine.registerNode(node);
      SCHEngine.state.lieutenantIds.push(id);
    });
    SCHEngine.log('Lieutenant network seeded into the graph. The Worlock now has middle management, which is universally alarming.');
  },

  all() { this.ensureState(); return SCHEngine.state.lieutenantIds.map(id => SCHEngine.getNode(id)).filter(Boolean); },
  activeInProvince(provinceId = SCHEngine.state.activeProvince) { if (!provinceId) return []; return this.all().filter(lt => !lt.defeated && (lt.provinceIds || []).includes(provinceId)); },
  phaseForExposure(exposure) { if (exposure >= 0.85) return 'confrontation_unlocked'; if (exposure >= 0.60) return 'named'; if (exposure >= 0.35) return 'hinted'; return 'hidden'; },

  observe(trigger, symbols = [], context = {}) {
    this.ensureState();
    const cleanSymbols = Utils.unique((symbols || []).filter(Boolean));
    if (cleanSymbols.length === 0) return;
    const provinceId = context.provinceId || SCHEngine.state.activeProvince || null;
    this.all().forEach(lt => {
      if (lt.defeated) return;
      const overlap = Utils.overlap(cleanSymbols, lt.symbols || []);
      const localBonus = provinceId && (lt.provinceIds || []).includes(provinceId) ? 0.03 : 0;
      const triggerBonus = { clue:0.025, dream:0.035, rumor:0.025, tarot_power:0.020, case_resolved:0.080, case_failed:0.050 }[trigger] || 0.015;
      if (overlap.length === 0 && !localBonus) return;
      const modeMult = MODE.name === 'Casual' ? 1.15 : MODE.name === 'Deep' ? 0.90 : 1.0;
      const gain = Utils.round2(Utils.clamp01((overlap.length * 0.055 + localBonus + triggerBonus) * modeMult));
      const before = lt.exposure || 0;
      lt.exposure = Utils.round2(Utils.clamp01(before + gain));
      const oldPhase = lt.phase || this.phaseForExposure(before);
      lt.phase = this.phaseForExposure(lt.exposure);
      lt.exposed = lt.exposure >= 0.60;
      lt.confrontationUnlocked = lt.exposure >= 0.85;
      SCHEngine.updateNode(lt);
      this.leaveTrace(lt, trigger, overlap, gain, context);
      if (oldPhase !== lt.phase) this.narratePhaseChange(lt);
    });
  },

  leaveTrace(lt, trigger, overlap, gain, context = {}) {
    const id = `lieutenant_trace_${++SCHEngine.state.counters.lieutenantTrace}`;
    const links = Utils.unique([lt.id, context.provinceId, context.cityId, context.caseId].filter(Boolean));
    SCHEngine.registerNode({ id, type:'lieutenant_trace', name:`${lt.name} trace`, lieutenantId:lt.id, lieutenantName:lt.name, trigger, gain, turn:SCHEngine.state.turn, symbols:Utils.unique([...(overlap || []), 'lieutenant_trace']), links });
  },

  narratePhaseChange(lt) {
    if (lt.phase === 'hinted') SCHEngine.narrative(`\x1b[35m[LIEUTENANT TRACE]\x1b[0m A pattern behind the Worlock flickers: ${lt.name}. Not a king. Worse: administration.`);
    else if (lt.phase === 'named') SCHEngine.narrative(`\x1b[35m[LIEUTENANT NAMED]\x1b[0m ${lt.name} is now visible in the graph. Its symbols: [${lt.symbols.filter(s => !['lieutenant','kingpin_network'].includes(s)).join(', ')}].`);
    else if (lt.phase === 'confrontation_unlocked') SCHEngine.narrative(`\x1b[31m[LIEUTENANT EXPOSED]\x1b[0m ${lt.name} can now be confronted. The Worlock's middle layer has made a clerical error.`);
  },

  clueModifiers(cityNode, activeCase, candidateSymbols) {
    const mods = { reliability: 0, evidenceDelta: 0, contradiction: 0, notes: [] };
    const active = this.activeInProvince(activeCase?.provinceId || SCHEngine.state.activeProvince);
    active.forEach(lt => {
      const strength = (lt.exposure || 0) * (lt.power || 0.45);
      if (strength <= 0.08) return;
      const traitHit = (lt.preferredTraits || []).includes(cityNode.cityTrait);
      const symbolHit = Utils.overlap(candidateSymbols || [], lt.symbols || []).length > 0;
      if (!traitHit && !symbolHit) return;
      if (lt.pressure === 'mirror') { mods.reliability += 0.025; mods.contradiction += 0.025 + strength * 0.04; mods.notes.push(`${lt.name} sharpens clues while bending their reflection.`); }
      else if (lt.pressure === 'dream') { mods.contradiction += 0.020 + strength * 0.03; mods.notes.push(`${lt.name} leaves a muted bell-tone under the clue.`); }
      else if (lt.pressure === 'mask') { mods.reliability -= 0.020; mods.contradiction += 0.030 + strength * 0.03; mods.notes.push(`${lt.name} makes the suspect trail theatrically convenient.`); }
      else if (lt.pressure === 'ledger') { mods.evidenceDelta += 0.035; mods.contradiction += 0.020; mods.notes.push(`${lt.name} itemizes the clue, then charges interest.`); }
      else if (lt.pressure === 'corruption') { mods.evidenceDelta += 0.025; mods.contradiction += 0.020; if (Math.random() < 0.20) SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption + 0.01)); mods.notes.push(`${lt.name} makes the answer feel profitable and therefore suspicious.`); }
      else if (lt.pressure === 'festival') { mods.evidenceDelta += 0.030; mods.contradiction += 0.035; mods.notes.push(`${lt.name} sponsors the clue with excessive confetti.`); }
    });
    return mods;
  },

  applyDreamPressure(dream, activeCase) {
    const active = this.activeInProvince(SCHEngine.state.activeProvince);
    active.forEach(lt => {
      if ((lt.exposure || 0) < 0.35 || lt.defeated) return;
      const strength = (lt.exposure || 0) * (lt.power || 0.45);
      if (lt.pressure === 'dream') {
        const sym = Utils.pickRandom(lt.symbols.filter(s => !['lieutenant','kingpin_network'].includes(s)));
        if (sym && !dream.symbols.includes(sym)) dream.symbols.push(sym);
        dream.contaminated = true;
        dream.intensity = Utils.round2(Utils.clamp01(dream.intensity + 0.05 + strength * 0.05));
        dream.text += ` Beneath it, ${lt.name} swallows the bell before it finishes ringing.`;
      } else if (lt.pressure === 'mirror' && Math.random() < 0.35) {
        dream.symbols = Utils.unique([...dream.symbols, 'illusion']).slice(0, 5);
        dream.text += ` A mirror in the dream insists this was always your idea.`;
      }
    });
    return dream;
  },

  hasConfrontable() { return this.all().some(lt => lt.confrontationUnlocked && !lt.defeated); },

  async confront(ask) {
    const choices = this.all().filter(lt => lt.confrontationUnlocked && !lt.defeated);
    if (choices.length === 0) { SCHEngine.narrative('No lieutenant is sufficiently exposed yet. Keep solving cases, reading dreams, and following traces.'); return; }
    SCHEngine.narrative('=== CONFRONT LIEUTENANT ===\nPick an exposed lieutenant. The confrontation is a three-step puzzle: pattern, Tarot, evidence.');
    choices.forEach((lt, i) => {
      const local = (lt.provinceIds || []).includes(SCHEngine.state.activeProvince) ? 'local' : 'distant';
      const pressure = (typeof LieutenantConfrontationStorySystem !== 'undefined') ? LieutenantConfrontationStorySystem.pressureLabel(lt.pressure) : (lt.pressure || 'unknown');
      console.log(`  ${i}. ${lt.name} | Exposure ${Utils.describePct(lt.exposure)} | Power ${Utils.describePct(lt.power)} | ${pressure} | ${local}`);
    });
    const idx = parseInt(await ask('Choose lieutenant number: '), 10);
    const lt = choices[idx];
    if (!lt) return SCHEngine.narrative('Invalid lieutenant selection. The bureaucracy survives another day.');

    const story = (typeof LieutenantConfrontationStorySystem !== 'undefined') ? LieutenantConfrontationStorySystem : null;
    const scene = story ? story.buildScene(lt) : null;
    if (story && scene) {
      SCHEngine.narrative(story.briefText(lt, scene));
      SCHEngine.narrative(story.openingText(lt, scene));
    }

    const lieutenantCore = lt.symbols.filter(s => !['lieutenant','kingpin_network'].includes(s));
    const decoys = Utils.unique([...SCHEngine.getHottestSymbols(6), 'truth', 'debt', 'dreams', 'authority', 'festival', 'mask']).filter(s => !lieutenantCore.includes(s));
    const pool = Utils.shuffle(Utils.unique([...lieutenantCore.slice(0, 3), ...Utils.shuffle(decoys).slice(0, 4)])).slice(0, 7);

    console.log('\nStep 1 - What is this lieutenant really about?');
    if (MODE.name !== 'Deep') console.log('Tip: choose the choice that best matches the lieutenant pressure and repeated traces.');
    pool.forEach((sym, i) => {
      const line = story ? story.coreChoiceText(sym, i, lt, scene) : sym;
      console.log(`  ${i}. ${line}`);
    });
    const coreIdx = parseInt(await ask('Name the core pattern: '), 10);
    const chosenCore = pool[coreIdx];
    if (!chosenCore) return SCHEngine.narrative('Invalid symbol selection. The scene refuses to hold still.');
    const coreHit = lieutenantCore.includes(chosenCore);
    if (story) SCHEngine.narrative(`${story.coreReact(lt, chosenCore, coreHit)}\n${story.coreProgressText(coreHit)}`);

    if (SCHEngine.state.player.hand.length < 1) { TarotBuilder.reshuffleDiscardIntoDraw(); TarotBuilder.redrawHand(); }
    console.log('\nStep 2 - Which Tarot card breaks its defense?');
    if (MODE.name !== 'Deep') console.log('Tip: Strong/Good match cards share symbols with the lieutenant. Reversed cards add risk.');
    SCHEngine.state.player.hand.forEach((c, i) => {
      const line = story ? story.tarotChoiceText(c, lt) : `${TarotBuilder.cardLabel(c)} [${TarotBuilder.cardEffectiveSymbols(c).join(', ')}]`;
      console.log(`  ${i}. ${line}`);
    });
    const cardIdx = parseInt(await ask('Choose Tarot card: '), 10);
    const card = TarotBuilder.consumeCardAt(cardIdx);
    if (!card) return SCHEngine.narrative('Invalid card. The lieutenant files your hesitation in triplicate.');
    const cardSymbols = TarotBuilder.cardEffectiveSymbols(card);
    const tarotFit = Utils.jaccardSimilarity(cardSymbols, lt.symbols);
    const orientation = TarotBuilder.cardOrientation(card, [], 'lieutenant');
    const family = TarotBuilder.getPowerFamily(card);
    if (story) SCHEngine.narrative(`${story.tarotText(card, family, orientation, tarotFit, lt)}\n${story.tarotProgressText(tarotFit, orientation)}`);
    TarotBuilder.sendToDiscard(card);

    const evidenceSymbols = GameLogic.buildPlayerEvidenceDNA();
    const archiveSyms = Utils.unique(evidenceSymbols).slice(0, 4);
    const tarotSyms = Utils.unique(cardSymbols).filter(s => !archiveSyms.includes(s)).slice(0, 3);
    const sceneSyms = Utils.unique(pool.filter(s => !archiveSyms.includes(s) && !tarotSyms.includes(s))).slice(0, 4);
    let assertionOptions = [];
    console.log('\nStep 3 - What evidence pins it down?');
    console.log('Best assertions usually come from your archive or the lieutenant’s own pattern.');
    const addGroup = (label, syms) => {
      if (!syms.length) return;
      console.log(`${label}:`);
      syms.forEach(sym => {
        const optionIdx = assertionOptions.length;
        assertionOptions.push({ sym, source: label });
        const line = story ? story.assertionChoiceText(sym, optionIdx, lt, label) : sym;
        console.log(`  ${optionIdx}. ${line}`);
      });
    };
    addGroup('Archive evidence', archiveSyms);
    addGroup('Tarot evidence', tarotSyms);
    addGroup('Scene evidence', sceneSyms);
    if (!assertionOptions.length) {
      pool.slice(0, 5).forEach(sym => assertionOptions.push({ sym, source:'Scene evidence' }));
      assertionOptions.forEach((o, i) => console.log(`  ${i}. ${o.sym}`));
    }
    const assertIdx = parseInt(await ask('Choose evidence assertion: '), 10);
    const assertion = assertionOptions[assertIdx];
    const asserted = assertion?.sym;
    if (!asserted) return SCHEngine.narrative('Invalid assertion. The surviving evidence goes quiet.');
    const assertionHit = lieutenantCore.includes(asserted) || evidenceSymbols.includes(asserted);
    if (story) SCHEngine.narrative(`${story.assertionText(asserted, assertionHit, lt)}\n${story.assertionProgressText(assertionHit)}`);

    const reversedPenalty = orientation === 'reversed' ? 0.08 : 0;
    const corruptionPenalty = SCHEngine.state.player.corruption * (MODE.name === 'Deep' ? 0.16 : MODE.name === 'Standard' ? 0.12 : 0.08);
    const score = Utils.clamp01((coreHit ? 0.35 : 0.08) + tarotFit * 0.35 + (assertionHit ? 0.22 : 0.04) + SCHEngine.state.player.insight * 0.06 - reversedPenalty - corruptionPenalty);
    const record = { id: `lieutenant_confrontation_${++SCHEngine.state.counters.lieutenantConfrontation}`, type: 'lieutenant_confrontation', lieutenantId: lt.id, lieutenantName: lt.name, pressure: lt.pressure || 'unknown', turn: SCHEngine.state.turn, chosenCore, coreHit, cardName: card.name, cardFamily: family, cardSymbols, orientation, tarotFit: Utils.round2(tarotFit), asserted, assertionSource: assertion.source, assertionHit, score: Utils.round2(score), scoreBand: story ? story.strengthLabel(score) : null, links: Utils.unique([lt.id, scene?.node?.id, SCHEngine.state.activeProvince, SCHEngine.state.activeCity, SCHEngine.state.activeCase].filter(Boolean)), symbols: Utils.unique([chosenCore, asserted, ...cardSymbols, 'lieutenant_confrontation', lt.pressure].filter(Boolean)) };

    if (score >= (MODE.name === 'Deep' ? 0.58 : MODE.name === 'Standard' ? 0.54 : 0.48)) {
      lt.defeated = true; lt.phase = 'defeated'; lt.exposure = 1; lt.power = 0; record.outcome = 'defeated';
      SCHEngine.state.player.reputation = Utils.round2(Utils.clamp01(SCHEngine.state.player.reputation + 0.05));
      SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption - 0.04));
      SCHEngine.state.kingpin.exposure = Utils.round2(Utils.clamp01(SCHEngine.state.kingpin.exposure + 0.08));
      SCHEngine.state.kingpin.aggression = Utils.round2(Utils.clamp01(SCHEngine.state.kingpin.aggression - 0.05));
      if (story) SCHEngine.narrative(`\x1b[32m[LIEUTENANT DEFEATED]\x1b[0m ${story.outcomeText('defeated', score, lt, record)}`);
      else SCHEngine.narrative(`\x1b[32m[LIEUTENANT DEFEATED]\x1b[0m ${lt.name} collapses into audited symbolism. Score: ${Utils.describePct(score)}.`);
    } else if (score >= 0.34) {
      lt.weakened = true; lt.power = Utils.round2(Utils.clamp01((lt.power || 0.4) - 0.16)); lt.exposure = Utils.round2(Math.max(0.60, lt.exposure - 0.10)); lt.phase = this.phaseForExposure(lt.exposure); lt.confrontationUnlocked = lt.exposure >= 0.85; record.outcome = 'weakened';
      SCHEngine.state.kingpin.exposure = Utils.round2(Utils.clamp01(SCHEngine.state.kingpin.exposure + 0.03));
      if (story) SCHEngine.narrative(`\x1b[33m[LIEUTENANT WEAKENED]\x1b[0m ${story.outcomeText('weakened', score, lt, record)}`);
      else SCHEngine.narrative(`\x1b[33m[LIEUTENANT WEAKENED]\x1b[0m ${lt.name} escapes, but its pattern is damaged. Score: ${Utils.describePct(score)}.`);
    } else {
      lt.power = Utils.round2(Utils.clamp01((lt.power || 0.4) + 0.05)); record.outcome = 'escaped';
      SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption + 0.06));
      SCHEngine.state.kingpin.awareness = Utils.round2(Utils.clamp01(SCHEngine.state.kingpin.awareness + 0.05));
      if (story) SCHEngine.narrative(`\x1b[31m[LIEUTENANT ESCAPES]\x1b[0m ${story.outcomeText('escaped', score, lt, record)}`);
      else SCHEngine.narrative(`\x1b[31m[LIEUTENANT ESCAPES]\x1b[0m ${lt.name} turns your argument into paperwork. Score: ${Utils.describePct(score)}.`);
    }

    if (story && scene) {
      story.attachRecord(record, scene, { coreChoiceText: story.coreChoiceText(chosenCore, coreIdx, lt, scene), assertionText: story.assertionChoiceText(asserted, assertIdx, lt, assertion.source), tarotText: story.tarotText(card, family, orientation, tarotFit, lt) });
      const summary = story.summaryText(record, lt);
      record.claritySummary = summary;
      SCHEngine.narrative(summary);
    }
    if (typeof ConspiracyReactionSystem !== 'undefined' && record.outcome !== 'defeated') ConspiracyReactionSystem.maybeReact('lieutenant_weakened', { provinceId: SCHEngine.state.activeProvince, lieutenantId: lt.id, outcome: record.outcome });
    SCHEngine.updateNode(lt);
    SCHEngine.registerNode(record);
    SCHEngine.state.archives.lieutenantConfrontations.push(Utils.clone(record));
  },
  statusLine() {
    const alive = this.all().filter(lt => !lt.defeated);
    if (alive.length === 0) return 'Lieutenants: none remain active';
    const top = alive.sort((a,b) => (b.exposure || 0) - (a.exposure || 0)).slice(0, 2);
    return `Lieutenants: ${top.map(lt => `${lt.name} ${Utils.describePct(lt.exposure || 0)}${lt.confrontationUnlocked ? ' [CONFRONT]' : ''}`).join(' | ')}`;
  },

  listDetails() {
    return this.all().map(lt => ({ id:lt.id, name:lt.name, phase:lt.phase, exposure:lt.exposure, power:lt.power, defeated:lt.defeated, weakened:lt.weakened, provinceIds:lt.provinceIds, symbols:lt.symbols, pressure:lt.pressure, confrontationUnlocked:lt.confrontationUnlocked }));
  }
};

// ============================================================================
// TAROT
// ============================================================================
const TarotBuilder = {
  build() {
    const suitSemantics = {
      Wands: { symbols: ['action', 'ambition', 'creativity'], weight: 0.60 },
      Cups: { symbols: ['emotion', 'relationships', 'dreams'], weight: 0.70 },
      Swords: { symbols: ['intellect', 'conflict', 'truth'], weight: 0.80 },
      Pentacles: { symbols: ['wealth', 'work', 'material'], weight: 0.90 }
    };
    const ranks = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
    Object.keys(suitSemantics).forEach((suit) => {
      ranks.forEach((rank, index) => {
        SCHEngine.registerNode({
          id: `tarot_minor_${suit.toLowerCase()}_${index}`,
          type: 'tarot',
          arcana: 'Minor',
          name: `${rank} of ${suit}`,
          symbols: [...suitSemantics[suit].symbols, 'minor_arcana'],
          weight: suitSemantics[suit].weight * (index / 14 + 0.1),
          uprightPolarity: { confidence: 0.02, contradiction: 0.00, mythPressure: 0.01, crystallization: 0.01, ambiguity: 0.00 },
          reversedPolarity: { confidence: -0.01, contradiction: 0.03, mythPressure: 0.02, crystallization: 0.00, ambiguity: 0.03 }
        });
      });
    });

    const majors = [
      ['fool','The Fool',['beginnings','risk','freedom'],0.95],
      ['magician','The Magician',['willpower','creation','manifestation'],0.90],
      ['priestess','The High Priestess',['intuition','hidden','subconscious'],1.00],
      ['empress','The Empress',['abundance','nature','growth'],0.80],
      ['emperor','The Emperor',['authority','structure','law'],0.85],
      ['hierophant','The Hierophant',['doctrine','tradition','obedience'],0.88],
      ['lovers','The Lovers',['union','choice','bond'],0.86],
      ['chariot','The Chariot',['drive','victory','control'],0.87],
      ['strength','Strength',['courage','discipline','patience'],0.87],
      ['hermit','The Hermit',['solitude','search','lantern'],0.89],
      ['wheel','Wheel of Fortune',['fate','cycle','chance'],0.92],
      ['justice','Justice',['truth','balance','punishment'],0.95],
      ['hanged_man','The Hanged Man',['suspension','paradox','sacrifice'],0.90],
      ['death','Death',['ending','transformation','release'],0.93],
      ['temperance','Temperance',['balance','alchemy','synthesis'],0.88],
      ['devil','The Devil',['greed','debt','compulsion'],0.98],
      ['tower','The Tower',['ruin','revelation','collapse'],1.00],
      ['star','The Star',['hope','guidance','healing'],0.90],
      ['moon','The Moon',['illusion','dreams','deception'],1.00],
      ['sun','The Sun',['clarity','vitality','success'],0.94],
      ['judgement','Judgement',['reckoning','calling','absolution'],0.93],
      ['world','The World',['completion','wholeness','integration'],0.95]
    ];
    majors.forEach(([id,name,symbols,weight]) => {
      SCHEngine.registerNode({
        id: `tarot_major_${id}`,
        type: 'tarot', arcana: 'Major', name, symbols, weight,
        uprightPolarity: { confidence: 0.05, contradiction: 0.00, mythPressure: 0.03, crystallization: 0.04, ambiguity: 0.01 },
        reversedPolarity: { confidence: -0.02, contradiction: 0.05, mythPressure: 0.04, crystallization: 0.01, ambiguity: 0.05 }
      });
    });

    this.initializePlayerDeck();
    SCHEngine.log('Tarot Deck loaded. The cards look interested, which is never entirely comforting.');
  },

  getAllDefinitions() { return SCHEngine.getNodesByType('tarot'); },
  createCardInstance(baseCard) {
    SCHEngine.state.counters.tarotInstance += 1;
    return {
      instanceId: `tarot_instance_${SCHEngine.state.counters.tarotInstance}`,
      baseId: baseCard.id,
      name: baseCard.name,
      arcana: baseCard.arcana || 'Major',
      symbols: Utils.clone(baseCard.symbols || []),
      weight: baseCard.weight || 1,
      uprightPolarity: Utils.clone(baseCard.uprightPolarity || {}),
      reversedPolarity: Utils.clone(baseCard.reversedPolarity || {}),
      contamination: { reversedBias: 0, corruptionTax: 0, shadowSymbols: [], markedByKingpin: false }
    };
  },
  initializePlayerDeck() {
    const defs = this.getAllDefinitions();
    const instances = defs.map((card) => this.createCardInstance(card));
    SCHEngine.state.player.drawPile = Utils.shuffle(instances);
    SCHEngine.state.player.discardPile = [];
    SCHEngine.state.player.hand = [];
    this.redrawHand();
  },
  cardEffectiveSymbols(card) { return Utils.unique([...(card.symbols || []), ...((card.contamination && card.contamination.shadowSymbols) || [])]); },
  cardLabel(card) {
    const taint = card.contamination && card.contamination.markedByKingpin ? ' [tainted]' : '';
    const shadows = card.contamination && card.contamination.shadowSymbols && card.contamination.shadowSymbols.length > 0 ? ` {shadow:${card.contamination.shadowSymbols.join(',')}}` : '';
    const power = this.getPowerFamily(card);
    return `${card.name}${taint}${shadows} <${power}>`;
  },
  reshuffleDiscardIntoDraw() {
    const player = SCHEngine.state.player;
    if (player.discardPile.length === 0) return;
    player.drawPile = Utils.shuffle([...player.drawPile, ...player.discardPile]);
    player.discardPile = [];
    SCHEngine.log('Discard pile reshuffled into draw pile. Nothing stays gone here; it merely changes posture.');
  },
  drawOne() {
    const player = SCHEngine.state.player;
    if (player.drawPile.length === 0) this.reshuffleDiscardIntoDraw();
    if (player.drawPile.length === 0) return null;
    return player.drawPile.shift();
  },
  redrawHand() {
    while (SCHEngine.state.player.hand.length < 3) {
      const drawn = this.drawOne();
      if (!drawn) break;
      SCHEngine.state.player.hand.push(drawn);
    }
  },
  sendToDiscard(card) { if (!card) return; SCHEngine.state.player.discardPile.push(card); },
  consumeCardAt(index) {
    if (index < 0 || index >= SCHEngine.state.player.hand.length) return null;
    return SCHEngine.state.player.hand.splice(index, 1)[0] || null;
  },
  contaminateCard(card, reason = 'burn') {
    if (!card) return card;
    const kp = SCHEngine.state.kingpin;
    let chance = Utils.clamp01(MODE.contamBase + kp.exposure * MODE.contamExposure + kp.aggression * MODE.contamAggression + (SCHEngine.state.currentEvent?.kind === 'tarot_eclipse' ? 0.08 : 0));
    if (reason === 'burn') chance *= MODE.burnContamMultiplier;
    if (Math.random() > chance) return card;
    card.contamination.markedByKingpin = true;
    const roll = Math.random();
    if (roll < 0.45) card.contamination.reversedBias = Utils.clamp01(card.contamination.reversedBias + MODE.contamBiasInc);
    else if (roll < 0.75) {
      const shadow = Utils.pickRandom(kp.preferredSymbols) || Utils.pickRandom(['illusion', 'debt', 'hidden']);
      card.contamination.shadowSymbols = Utils.unique([...(card.contamination.shadowSymbols || []), shadow]).slice(0, 2);
    } else card.contamination.corruptionTax = Utils.round2(Utils.clamp01(card.contamination.corruptionTax + MODE.contamTaxInc));
    SCHEngine.narrative(`\x1b[35m[WORLOCK MARK]\x1b[0m ${card.name} is impressed into the simulation and may return altered.`);
    return card;
  },
  burnCardAt(index, reason = 'burn') {
    const card = this.consumeCardAt(index);
    if (!card) return null;
    this.contaminateCard(card, reason);
    this.sendToDiscard(card);
    return card;
  },
  cardOrientation(card, forcedSlots = [], slot = null) {
    if (slot && forcedSlots.includes(slot)) return 'reversed';
    const bias = card.contamination?.reversedBias || 0;
    return Math.random() < (0.28 + bias) ? 'reversed' : 'upright';
  },
  getPowerFamily(card) {
    if (!card) return 'Unknown';
    if (card.arcana === 'Major') return 'Oracle';
    if (/Wands/.test(card.name)) return 'Pursuit';
    if (/Cups/.test(card.name)) return 'Dreamwalk';
    if (/Swords/.test(card.name)) return 'Cross-Examine';
    if (/Pentacles/.test(card.name)) return 'Audit';
    return 'Unknown';
  },

  async usePower(ask) {
    if (SCHEngine.state.player.powerUsedThisTurn) {
      SCHEngine.narrative('You have already used a Tarot Power this turn. Even destiny prefers pacing.');
      return;
    }
    if (SCHEngine.state.player.hand.length === 0) {
      SCHEngine.narrative('Your hand is empty. The cards decline to improvise from offstage.');
      return;
    }
    console.log('\nTarot Hand:');
    SCHEngine.state.player.hand.forEach((c, i) => console.log(`  ${i}. ${this.cardLabel(c)} [${this.cardEffectiveSymbols(c).join(', ')}]`));
    const idx = parseInt(await ask('Choose card number to wield as a power: '), 10);
    const card = this.consumeCardAt(idx);
    if (!card) {
      SCHEngine.narrative('Invalid selection. The deck glares artistically.');
      return;
    }
    const family = this.getPowerFamily(card);
    const tainted = card.contamination && (card.contamination.markedByKingpin || card.contamination.reversedBias > 0 || card.contamination.corruptionTax > 0 || (card.contamination.shadowSymbols || []).length > 0);
    SCHEngine.narrative(`\x1b[33m[TAROT POWER]\x1b[0m ${card.name} unfolds as ${family}.`);

    if (family === 'Oracle') {
      const activeCase = SCHEngine.state.activeCase ? SCHEngine.getNode(SCHEngine.state.activeCase) : null;
      console.log('1. Reveal a hidden case symbol');
      console.log('2. Read the currently suspected architecture');
      const c = (await ask('Oracle focus: ')).trim();
      if (!activeCase) {
        SCHEngine.narrative('Without an active case, the Oracle mostly reveals that fate has scheduling concerns.');
      } else if (c === '2') {
        const sid = Utils.pickRandom(activeCase.suspectIds);
        const suspect = SCHEngine.getNode(sid);
        const strength = Utils.jaccardSimilarity(suspect.symbols, activeCase.requiredSymbols);
        let verdict = strength > 0.35 ? 'aligned' : strength > 0.18 ? 'weakly aligned' : 'suspiciously convenient';
        if (tainted && Math.random() < 0.5) verdict = 'suspiciously convenient';
        SCHEngine.narrative(`The Oracle studies ${suspect.name}: ${verdict}.`);
      } else {
        const unseen = activeCase.requiredSymbols.filter(sym => !activeCase.clues.some(c => c.symbols.includes(sym)));
        const trueSym = unseen[0] || Utils.pickRandom(activeCase.requiredSymbols);
        let msg = `The Oracle reveals [${trueSym}].`;
        if (tainted) {
          const falseSym = Utils.pickRandom(['authority', 'trade', 'dreams', 'illusion']);
          msg += ` A second, probably impolite echo follows: [${falseSym}].`;
        }
        SCHEngine.state.player.temp.targetSymbolHint = trueSym;
        SCHEngine.narrative(msg);
      }
    } else if (family === 'Pursuit') {
      let gain = 0.10 + (SCHEngine.state.currentEvent?.kind === 'tarot_eclipse' ? 0.04 : 0);
      SCHEngine.state.player.temp.nextInvestigateEvidence += gain;
      if (SCHEngine.state.activeCity) {
        const city = SCHEngine.getNode(SCHEngine.state.activeCity);
        if (Utils.overlap(this.cardEffectiveSymbols(card), city.symbols).length > 0) {
          SCHEngine.state.player.reputation = Utils.round2(Utils.clamp01(SCHEngine.state.player.reputation + 0.02));
        }
      }
      if (tainted) SCHEngine.state.player.temp.nextClueContradictionDelta += 0.03;
      SCHEngine.narrative(`Momentum surges. Your next investigation gains +${gain.toFixed(2)} Evidence.${tainted ? ' The card also smuggles in a little disorder, because of course it does.' : ''}`);
    } else if (family === 'Dreamwalk') {
      const hot = Utils.unique([...(SCHEngine.getHottestSymbols(2)), ...(SCHEngine.state.activeCase ? SCHEngine.getNode(SCHEngine.state.activeCase).requiredSymbols.slice(0,1) : [])]).slice(0,2);
      SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption - 0.03 + (tainted ? 0.02 : 0)));
      SCHEngine.state.player.temp.nextSleepHints += 1;
      SCHEngine.narrative(`A waking glimpse catches on [${hot.join(', ') || 'cold light'}]. Your next sleep will be louder.${tainted ? ' Something metallic rides behind it.' : ''}`);
    } else if (family === 'Cross-Examine') {
      SCHEngine.state.player.temp.protectFromFraming = true;
      SCHEngine.state.player.temp.nextClueContradictionDelta -= 0.08;
      if (SCHEngine.state.kingpin.pending.framedSuspectId) {
        SCHEngine.narrative('Your questions cut the convenient suspect out of the spotlight.');
        SCHEngine.state.kingpin.pending.framedSuspectId = null;
      } else {
        SCHEngine.narrative('You sharpen the next clue through pure aggression and vocabulary.');
      }
      if (tainted) {
        SCHEngine.state.kingpin.awareness = Utils.round2(Utils.clamp01(SCHEngine.state.kingpin.awareness + 0.03));
        SCHEngine.narrative('The card wins the argument, but the Worlock hears the applause.');
      }
    } else if (family === 'Audit') {
      const materialSymbols = ['debt','greed','trade','wealth','authority'];
      const focus = Utils.pickRandom(materialSymbols);
      SCHEngine.state.player.temp.auditFocus = focus;
      SCHEngine.state.player.temp.nextClueReliability += 0.08;
      SCHEngine.narrative(`You audit the simulation for [${focus}]. The next relevant clue should behave more like evidence and less like poetry.`);
      if (tainted) {
        const shadow = Utils.pickRandom(['illusion','dreams']);
        SCHEngine.state.player.temp.nextClueContradictionDelta += 0.03;
        SCHEngine.narrative(`Unfortunately, the audit also files itself under [${shadow}]. Bureaucracy remains undefeated.`);
      }
    }

    if (card.contamination && card.contamination.corruptionTax > 0) {
      SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption + card.contamination.corruptionTax));
      SCHEngine.narrative(`${card.name} exacts a corruption tax on the way out. Cards can be so petty.`);
    }

    if (typeof LieutenantSystem !== 'undefined') LieutenantSystem.observe('tarot_power', Utils.unique([...this.cardEffectiveSymbols(card), family]), { provinceId: SCHEngine.state.activeProvince, cityId: SCHEngine.state.activeCity, caseId: SCHEngine.state.activeCase });
    if (typeof WhySummarySystem !== 'undefined') SCHEngine.narrative(WhySummarySystem.afterTarotPower(card, family));
    this.sendToDiscard(card);
    SCHEngine.state.player.powerUsedThisTurn = true;
  }
};

// ============================================================================
// WORLD / CLUE TEXT
// ============================================================================
const WorldBuilder = {
  build() {
    const geographyData = [
      { id: 'prov_schlaraffenland', name: 'Schlaraffenland', symbols: ['excess', 'indulgence', 'hubris'], cities: ['Schlarraffenburg', 'Fressstadt', 'Sauffen', 'Wollust', 'Faulbronn', 'Narrenhausen', 'Guldenthal', 'Schlemmingen'], traitPool: ['Festival', 'Bell', 'Ledger'] },
      { id: 'prov_bibonia', name: 'Bibonia Regnum', symbols: ['drunkenness', 'addiction', 'wine'], cities: ['Weinburg', 'Bierstadt', 'Trunkenheim', 'Saufsdorf', 'Rauschfeld', 'Katerhausen', 'Branntwein', 'Hopffen'], traitPool: ['Festival', 'Mirror', 'Bell'] },
      { id: 'prov_lusoria', name: 'Lusoria', symbols: ['gambling', 'risk', 'debt'], cities: ['Würfelstadt', 'Kartenheim', 'Glücksburg', 'Hazard', 'Fortuna', 'Spielerhaven', 'Verlust', 'Gewinnau'], traitPool: ['Mirror', 'Festival', 'Ledger'] },
      { id: 'prov_mammonia', name: 'Mammonia', symbols: ['greed', 'debt', 'wealth'], cities: ['Goldhausen', 'Silberfeld', 'Ducatenstadt', 'Pfennigheim', 'Wucherberg', 'Schatzburg', 'Geldfurt', 'Reichenthal'], traitPool: ['Ledger', 'Mask', 'Festival'] },
      { id: 'prov_veneria', name: 'Res Publica Veneria', symbols: ['desire', 'betrayal', 'secrets'], cities: ['Venusberg', 'Liebenthal', 'Rosenheim', 'Wollustadt', 'Cupidinum', 'Sirenenhafen', 'Amora', 'Zärtlich'], traitPool: ['Mask', 'Mirror', 'Festival'] },
      { id: 'prov_pigritarium', name: 'Pigritarium Regio', symbols: ['sloth', 'stagnation', 'sleep'], cities: ['Schlafstadt', 'Müssiggang', 'Faulhausen', 'Trägdorf', 'Ruhefeld', 'Bettlingen', 'Langweil', 'Schnarchheim'], traitPool: ['Bell', 'Lantern', 'Mirror'] },
      { id: 'prov_gourmandise', name: 'Magni Stomachi Imperium', symbols: ['gluttony', 'consumption', 'waste'], cities: ['Fressburg', 'Bratenheim', 'Wurstfeld', 'Pastetenstadt', 'Küchenhaven', 'Speckdorf', 'Schlemmertal', 'Magenfurt'], traitPool: ['Festival', 'Ledger', 'Mask'] },
      { id: 'prov_stultorum', name: 'Stultorum Regnum', symbols: ['foolishness', 'absurdity', 'madness'], cities: ['Narrenberg', 'Torhausen', 'Dummdorf', 'Eselsheim', 'Gaukelstadt', 'Possenburg', 'Unsinn', 'Aberwitz'], traitPool: ['Mirror', 'Mask', 'Festival'] },
      { id: 'prov_terra_sancta', name: 'Terra Sancta Incognita', symbols: ['false_holiness', 'hypocrisy', 'illusion'], cities: ['Jerusalem', 'Sancta Civitas', 'Heiligberg', 'Klosterthal', 'Bußdorf'], traitPool: ['Bell', 'Mask', 'Lantern'] },
      { id: 'prov_tartaria', name: 'Tartaria Regnum', symbols: ['damnation', 'punishment', 'ruin'], cities: ['Lucifer', 'Satan', 'Beelzebub', 'Pandemonium', 'Verdammnis', 'Höllenburg', 'Schwefelfeld'], traitPool: ['Lantern', 'Mirror', 'Ledger'] },
      { id: 'prov_tobacco_isle', name: 'Tobacco Isle', symbols: ['smoke', 'trade', 'indulgence'], cities: ['Schnupferland', 'Schmauchberg', 'Rotzkolben', 'Stinckmantl'], traitPool: ['Festival', 'Ledger', 'Mask'] }
    ];

    geographyData.forEach((prov) => {
      const cityIds = prov.cities.map(c => `city_${Utils.normalizeId(c)}`);
      SCHEngine.registerNode({ id: prov.id, type: 'province', name: prov.name, symbols: [...prov.symbols, 'province'], links: cityIds, traitPool: prov.traitPool });
      const traitCycle = Utils.shuffle(prov.traitPool.concat(prov.traitPool).concat(prov.traitPool));
      prov.cities.forEach((city, i) => {
        const trait = traitCycle[i % traitCycle.length];
        SCHEngine.registerNode({
          id: `city_${Utils.normalizeId(city)}`,
          type: 'city',
          name: city,
          cityTrait: trait,
          cityTraitName: CITY_TRAITS[trait].name,
          cityTraitDesc: CITY_TRAITS[trait].desc,
          symbols: [...prov.symbols, 'city', 'settlement'],
          links: [prov.id]
        });
      });
    });
    if (typeof ContentLibrary !== 'undefined') ContentLibrary.registerNodes();
    if (typeof EndgameStoryBuilder !== 'undefined') EndgameStoryBuilder.registerNodes();
    if (typeof NPCSystem !== 'undefined') NPCSystem.registerNodes();
    SCHEngine.log('World Map loaded. The cities now have local habits, which is a polite way to say “gimmicks.”');
  },
  getProvinces() { return SCHEngine.getNodesByType('province'); },
  getCitiesInProvince(provinceId) {
    const provNode = SCHEngine.getNode(provinceId);
    if (!provNode || !provNode.links) return [];
    return provNode.links.map(id => SCHEngine.getNode(id)).filter(Boolean);
  }
};

const ClueTextBuilder = {
  nounBySymbol: {
    greed: 'sealed account books', debt: 'a debt marker', wealth: 'a gold-stamped receipt',
    gambling: 'a stack of wager slips', risk: 'a torn betting ledger', wine: 'a cracked ceremonial cup',
    drunkenness: 'a slurred confession', addiction: 'an unpaid tab hidden in plain sight',
    desire: 'a perfumed note folded twice', betrayal: 'a broken signet hidden in velvet',
    secrets: 'a locked drawer with scraped hinges', sloth: 'an untouched order left to rot',
    stagnation: 'dust over a sealed archive box', sleep: 'a witness sleeping through a bell toll',
    gluttony: 'a grease-stained invitation', consumption: 'a missing inventory line',
    waste: 'discarded excess sealed as tribute', foolishness: 'an absurd testimony no two mouths repeat the same way',
    absurdity: 'a courtroom notice written upside down', madness: 'a margin full of repeated names',
    false_holiness: 'a relic case with no relic inside', hypocrisy: 'a prayer ledger balancing stolen coin',
    illusion: 'a reflection that omits one figure', damnation: 'a sulfur-marked directive',
    punishment: 'a sentence written before the crime', ruin: 'collapse lines spreading through the floor',
    authority: 'a signed edict with a hidden amendment', truth: 'a witness statement that almost aligns',
    dreams: 'a note copied from a shared dream', compulsion: 'the same name written again and again',
    hidden: 'a shadow behind an official seal', deception: 'a duplicate ledger with altered dates', trade: 'a cargo manifest with the wrong initials',
    doctrine: 'a sermon copy with strategic omissions', tradition: 'an old ceremonial order still obeyed by the wrong people',
    union: 'paired signatures where one should suffice', choice: 'a branch in the archive trail', bond: 'a letter sealed by two hands',
    drive: 'a route map redrawn in haste', victory: 'a triumphal account written too early', control: 'a harness buckle near a ledger chest',
    courage: 'a witness standing where they should have fled', discipline: 'a schedule followed to the minute', patience: 'a lamp kept lit all night',
    solitude: 'a lone lamp in a locked room', search: 'circles on a district map', lantern: 'a shuttered lamp beside fresh wax',
    fate: 'a docket assigned before appeal', cycle: 'the same debt under a new name', chance: 'dice marks under court dust',
    suspension: 'a report left unsigned but binding', paradox: 'a testimony true in two impossible ways', sacrifice: 'a name struck through in red',
    ending: 'a closed file reopened by a new seal', transformation: 'a ledger rewritten by another hand', release: 'a chain cut in a hidden cabinet',
    alchemy: 'a recipe book filed with tax codes', synthesis: 'two contradictory ledgers merged into one', hope: 'a note to return at dawn',
    guidance: 'chalk arrows beneath an altar', healing: 'a physician bill hidden with bribes', clarity: 'sunlight revealing an erased line',
    vitality: 'fresh fingerprints on old iron', success: 'a celebratory note hidden too soon', reckoning: 'a summons prepared for the wrong name',
    calling: 'a bell rung when no one admitted it', absolution: 'a confession stamped clean'
  },
  build(clue, cityNode, activeCase) {
    if (typeof ContentLibrary !== 'undefined' && clue.material) {
      const materialText = ContentLibrary.describeMaterialClue(clue, cityNode, activeCase);
      if (materialText) return materialText;
    }
    const primary = clue.symbols[0] || 'truth';
    const secondary = clue.symbols[1] || activeCase.requiredSymbols[0] || 'truth';
    const primaryNoun = this.nounBySymbol[primary] || 'a troubling trace';
    const secondaryNoun = this.nounBySymbol[secondary] || 'an unresolved sign';
    const primaryHit = activeCase.requiredSymbols.includes(primary);
    const secondaryHit = activeCase.requiredSymbols.includes(secondary);
    if (primaryHit && secondaryHit) return `In ${cityNode.name}, you uncover ${primaryNoun}. Beside it lies ${secondaryNoun}. Together they begin to align with the province-wide anomaly.`;
    if (primaryHit) return `In ${cityNode.name}, you recover ${primaryNoun}. It strongly echoes the case's central pattern, but the surrounding details remain unstable.`;
    if (clue.reliability >= 0.70) return `In ${cityNode.name}, you notice ${primaryNoun} and ${secondaryNoun}. The clue is coherent, but only partially relevant to the deeper case.`;
    return `In ${cityNode.name}, you overhear or infer ${primaryNoun}. It may matter, but it feels contaminated by contradiction.`;
  }
};


// ============================================================================
// MATERIAL CASE CONTENT: RECOMBINANT CASES / CLUES / SUSPECTS
// ============================================================================

// ============================================================================
// R1-R4 RECOMBINATION SYSTEMS
// ============================================================================
const CaseGrammarSystem = {
  premises:[['false_debt',['debt','authority'],['motive','coverup']],['stolen_identity',['identity','mask'],['identity','false_lead']],['premature_verdict',['punishment','fate'],['opportunity','coverup']],['dream_contagion',['dreams','sleep'],['world_context','lieutenant_trace']],['holy_counterfeit',['false_holiness','doctrine'],['motive','coverup']],['devouring_feast',['gluttony','consumption'],['method','world_context']]],
  distortions:[['time_reversal',['fate','paradox'],['opportunity']],['mirror_inversion',['illusion','mirror'],['identity','alibi_break']],['clerical_overwrite',['archive','authority'],['coverup']],['dream_bleed',['dreams','hidden'],['world_context']],['too_neat',['deception','suspect'],['false_lead']]],
  suspectLogics:[['beneficiary',[],['motive']],['authenticator',[],['coverup','identity']],['desperate_actor',[],['method','motive']],['borrowed_face',[],['identity','alibi_break']]],
  hiddenTruths:[['coverup_for_lieutenant',['lieutenant_trace','hidden'],['lieutenant_trace','coverup']],['institutional_complicity',['authority','law'],['coverup','world_context']],['framed_decoy',['false_lead','deception'],['false_lead','alibi_break']],['dream_source',['dreams','bell'],['world_context','identity']]],
  surfaces:[['obvious_scapegoat',[],['false_lead']],['clean_account',[],['motive']],['official_story',[],['coverup']],['public_performance',[],['identity']]],
  slot(pool, signal){ return Utils.weightedPick(pool.map(x=>({id:x[0],symbols:x[1],roles:x[2]})), x=>1+Utils.overlap(x.symbols||[],signal||[]).length*3+Math.random()); },
  buildGrammar(prov, template, ctx={}){ const signal=Utils.unique([...(prov?.symbols||[]),...(template?.primarySymbols||[]),...(template?.secondarySymbols||[]),...(ctx.hotSymbols||[])]); const g={ premise:this.slot(this.premises,signal), distortion:this.slot(this.distortions,signal), suspectLogic:this.slot(this.suspectLogics,signal), hiddenTruth:this.slot(this.hiddenTruths,signal), falseSurface:this.slot(this.surfaces,signal), templateKey:template?.key||'anomaly', remixSeed:`r${SCHEngine.state.turn}_${SCHEngine.state.counters.case+1}_${Math.floor(Math.random()*9999)}` }; g.symbols=Utils.unique([...(g.premise.symbols||[]),...(g.distortion.symbols||[]),...(g.hiddenTruth.symbols||[]),...(template?.primarySymbols||[])]); g.summary=[g.premise.id,g.distortion.id,g.suspectLogic.id,g.hiddenTruth.id,g.falseSurface.id].join(' / '); return g; },
  requiredRolesForGrammar(g, key){ const base=(typeof InvestigationCoherence!=='undefined')?InvestigationCoherence.defaultRolesForTemplate(key):['motive','method','identity']; return Utils.shuffle(Utils.unique([...base,...(g?.premise?.roles||[]),...(g?.distortion?.roles||[]),...(g?.suspectLogic?.roles||[]),...(g?.hiddenTruth?.roles||[]),...(g?.falseSurface?.roles||[])])).slice(0, MODE.name==='Deep'?4:3); },
  centralQuestionForGrammar(g, template, prov){ const p=prov?.name||'the province'; return `What hidden pattern is trying to become law in ${p}? Surface: ${g?.falseSurface?.id||'unknown'}; hidden truth: ${g?.hiddenTruth?.id||'unknown'}.`; },
  truthArcForGrammar(g){ return [{stage:'surface',preferredRoles:Utils.unique([...(g?.falseSurface?.roles||[]),'false_lead','world_context'])},{stage:'complication',preferredRoles:Utils.unique([...(g?.premise?.roles||[]),...(g?.distortion?.roles||[])])},{stage:'reversal',preferredRoles:Utils.unique([...(g?.suspectLogic?.roles||[]),'alibi_break','identity'])},{stage:'proof',preferredRoles:Utils.unique([...(g?.hiddenTruth?.roles||[]),'coverup','lieutenant_trace'])}]; },
  coherenceContract(g, roles){ return { mustHaveRoles:roles.slice(), mustHaveAtLeastOneTrueSuspectLink:true, maxFalseLeadRatio:.55, validResolutions:['true_culprit','framed_suspect_exposed','guilty_wrong_reason','coverup_resolved','lieutenant_trace_found','patron_tainted_victory','dream_truth_accepted','civic_truth_rejected'], grammarSummary:g?.summary||'unknown' }; }
};
const SuspectLogicSystem = {
  assignProfiles(caseNode, ids, g) {
    const weighted = ids.map(id => {
      const s = SCHEngine.getNode(id);
      const npcWeight = s?.sourceType === 'npc' ? 0.55 : 0;
      const symbolFit = Utils.overlap(s?.symbols || [], g?.symbols || []).length * 2;
      const roleFit = Utils.overlap(s?.symbols || [], caseNode?.requiredSymbols || []).length * 1.5;
      return { id, score: 1 + npcWeight + symbolFit + roleFit + Math.random() };
    });
    const culprit = Utils.weightedPick(weighted, x => x.score)?.id || ids[0];
    const rem = ids.filter(id => id !== culprit);
    const framed = Utils.weightedPick(rem.map(id => ({ id, score: 1 + (SCHEngine.getNode(id)?.sourceType === 'npc' ? 0.35 : 0) + Math.random() })), x => x.score)?.id || rem[0] || culprit;
    const cover = Utils.pickRandom(rem.filter(id => id !== framed)) || culprit;
    const out = {};
    ids.forEach(id => {
      const s = SCHEngine.getNode(id);
      let rel = id === culprit ? 'culprit' : id === framed ? 'framed' : id === cover ? 'coverup_actor' : 'bystander';
      if (s?.sourceNpcKey === 'patron' && rel === 'bystander') rel = 'patron_tangled';
      else if (s?.sourceType === 'npc' && rel === 'bystander' && Math.random() < 0.25) rel = Utils.pickRandom(['beneficiary','witness_hiding_truth','innocent_but_connected']);
      const seed = (typeof NPCSuspectSystem !== 'undefined') ? NPCSuspectSystem.profileSeedFor(caseNode, s || {}, rel) : {};
      const motivePool = ['debt_relief','reputation_salvage','legal_power','dream_control','appetite','borrowed_identity','institutional_protection','favor_collection','secret_preservation'];
      const evidenceNeeded = rel === 'culprit' ? ['motive','method','identity'] : rel === 'framed' ? ['false_lead','alibi_break'] : rel === 'coverup_actor' ? ['coverup','world_context'] : rel === 'beneficiary' ? ['motive','opportunity'] : ['world_context','alibi_break'];
      out[id] = {
        suspectId: id,
        suspectName: s?.name || id,
        apparentRole: rel === 'framed' ? 'obvious_suspect' : (seed.publicRole || s?.role || 'suspect'),
        trueRelation: rel,
        motiveVector: Utils.pickRandom(motivePool),
        alibiState: rel === 'culprit' ? Utils.pickRandom(['contradictory','over_neat','witness_tangled']) : rel === 'framed' ? 'too_neat' : rel === 'coverup_actor' ? 'procedural' : 'ordinary',
        frameRisk: rel === 'framed' ? 0.75 : Utils.round2((s?.sourceType === 'npc' ? 0.08 : 0) + Math.random() * 0.35),
        evidenceNeeded,
        npcOpinions: {},
        sourceType: seed.sourceType || s?.sourceType || 'archetype',
        sourceNpcKey: seed.sourceNpcKey || null,
        sourceNpcId: seed.sourceNpcId || null,
        publicFace: seed.publicFace || '',
        motiveLine: seed.motiveLine || '',
        methodLine: seed.methodLine || '',
        opportunityLine: seed.opportunityLine || '',
        frameWarning: seed.frameWarning || '',
        clearingLine: seed.clearingLine || ''
      };
      if (s) { s.caseSuspectProfile = Utils.clone(out[id]); SCHEngine.updateNode(s); }
    });
    return out;
  },
  profileFor(c, id) { return c?.suspectProfiles?.[id] || SCHEngine.getNode(id)?.caseSuspectProfile || null; },
  relationForRole(p, role, convenient) {
    if (!p) return convenient || role === 'false_lead' ? 'frames' : 'connects';
    if (p.trueRelation === 'framed') return role === 'alibi_break' ? 'clears' : 'frames';
    if (p.trueRelation === 'culprit') return ['motive','method','opportunity','identity'].includes(role) ? 'supports' : 'connects';
    if (p.trueRelation === 'coverup_actor') return ['coverup','world_context','lieutenant_trace'].includes(role) ? 'connects' : (convenient ? 'frames' : 'contradicts');
    if (p.trueRelation === 'beneficiary') return ['motive','opportunity'].includes(role) ? 'supports' : 'connects';
    if (p.trueRelation === 'patron_tangled') return convenient ? 'frames' : 'connects';
    if (p.trueRelation === 'lieutenant_proxy') return ['lieutenant_trace','coverup','method'].includes(role) ? 'connects' : 'contradicts';
    if (p.trueRelation === 'witness_hiding_truth') return ['alibi_break','world_context','coverup'].includes(role) ? 'connects' : 'contradicts';
    if (p.trueRelation === 'innocent_but_connected') return role === 'alibi_break' ? 'clears' : (convenient ? 'frames' : 'connects');
    return convenient ? 'frames' : 'connects';
  }
};

const TruthArcSystem = { currentStage(c){const a=c?.truthArc||[]; return a[Math.min(a.length-1,Math.max(0,c?.currentArcStage||0))]||{stage:'surface',preferredRoles:['motive','identity']};}, roleBias(c){return this.currentStage(c).preferredRoles||[];}, advance(c,clue){ if(!c?.truthArc) return null; const role=clue?.evidenceRole||clue?.material?.evidenceRole; const st=this.currentStage(c); const hit=(st.preferredRoles||[]).includes(role); if(hit) st.revealed=true; const found=Utils.unique((c.clues||[]).map(x=>x.evidenceRole||x.material?.evidenceRole).filter(Boolean)); const req=c.requiredEvidenceRoles||[]; const progress=req.length?req.filter(r=>found.includes(r)).length/req.length:0; if((hit&&(c.clues||[]).length>=(c.currentArcStage||0)+1)||progress>((c.currentArcStage||0)+1)/Math.max(1,c.truthArc.length)){ c.currentArcStage=Math.min(c.truthArc.length-1,(c.currentArcStage||0)+1); return this.currentStage(c);} return null;}, summary(c){const s=this.currentStage(c); return `${s.stage}: ${(s.preferredRoles||[]).join(', ')}`;}};
const CityMeaningSystem = { modifyEvidenceDNA(d,city,c){ const t=city?.cityTrait; d.cityTrait=t; d.cityMeaningNotes=[]; const role=(roles)=>Utils.pickRandom(Utils.overlap(c.requiredEvidenceRoles||[],roles))||d.role; if(t==='Mirror'){d.role=Math.random()<.45?role(['identity','alibi_break']):d.role; d.contradictionVector=d.contradictionVector||'inverted_reflection'; d.cityMeaningNotes.push('Mirror logic can invert identity and alibi evidence.'); if(d.suspectEffect?.relation==='supports'&&Math.random()<.25)d.suspectEffect.relation='frames';} if(t==='Ledger'){d.role=Math.random()<.35?role(['motive','coverup']):d.role; d.reliabilityMod=(d.reliabilityMod||0)+.04; d.cityMeaningNotes.push('Ledger logic itemizes motive and cover-up evidence.');} if(t==='Bell'){d.role=Math.random()<.45?role(['world_context','lieutenant_trace']):d.role; d.hiddenVector=d.hiddenVector||'bell_memory'; d.cityMeaningNotes.push('Bell logic draws dream and lieutenant traces closer.');} if(t==='Mask'){d.role=Math.random()<.5?role(['false_lead','identity']):d.role; if(d.suspectEffect)d.suspectEffect.relation=d.suspectEffect.relation==='clears'?'contradicts':(Math.random()<.35?'frames':d.suspectEffect.relation); d.cityMeaningNotes.push('Mask logic makes suspect trails perform too neatly.');} if(t==='Lantern'){d.role=Math.random()<.35?role(['alibi_break','coverup']):d.role; d.reliabilityMod=(d.reliabilityMod||0)+.03; d.cityMeaningNotes.push('Lantern logic turns paradox readable.');} if(t==='Festival'){d.noiseMod=(d.noiseMod||0)+.04; d.cityMeaningNotes.push('Festival logic adds useful noise.');} return d; } };
const EvidenceDNASystem = { build({activeCase,cityNode,clue,template,linkedSuspect,falseConvenience,formKey,condition,anomaly}){ const arc=TruthArcSystem.roleBias(activeCase); const required=activeCase.requiredEvidenceRoles||[]; const missing=(typeof InvestigationCoherence!=='undefined')?InvestigationCoherence.missingRequiredRoles(activeCase):[]; let role=null; if(typeof InvestigationCoherence!=='undefined'&&InvestigationCoherence.shouldForceMissingRole(activeCase)) role=Utils.pickRandom(missing); if(!role) role=Utils.pickRandom(Utils.overlap(required,arc)) || (typeof InvestigationCoherence!=='undefined'?InvestigationCoherence.pickEvidenceRole(activeCase,clue,linkedSuspect,template):'motive'); const profile=linkedSuspect?SuspectLogicSystem.profileFor(activeCase,linkedSuspect.id):null; const rel=SuspectLogicSystem.relationForRole(profile,role,falseConvenience||role==='false_lead'); const eff=linkedSuspect?{suspectId:linkedSuspect.id,suspectName:linkedSuspect.name,relation:rel}:null; const dna={id:`dna_${clue.id}`,role,source:formKey,condition,anomaly,distortion:activeCase.caseGrammar?.distortion?.id||'local_noise',premise:activeCase.caseGrammar?.premise?.id||activeCase.templateKey,hiddenVector:activeCase.caseGrammar?.hiddenTruth?.id||'unknown_hidden_truth',falseSurface:activeCase.caseGrammar?.falseSurface?.id||'ordinary_surface',suspectRelation:rel,targetSuspectId:linkedSuspect?.id||null,contradictionVector:falseConvenience?'too_clean':(clue.contradiction>.18?'unstable_testimony':'coherent_trace'),npcAffinity:Utils.unique([...(linkedSuspect?.symbols||[]),...(clue.symbols||[]),role,activeCase.caseGrammar?.hiddenTruth?.id].filter(Boolean)).slice(0,8),suspectProfile:profile?{trueRelation:profile.trueRelation,apparentRole:profile.apparentRole,alibiState:profile.alibiState}:null,tags:['DNA',role,rel],suspectEffect:eff}; CityMeaningSystem.modifyEvidenceDNA(dna,cityNode,activeCase); if(typeof InvestigationCoherence!=='undefined'){ const forcedRole=InvestigationCoherence.preferredMissingRoleForNextClue(activeCase,dna.role); if(forcedRole&&forcedRole!==dna.role){ dna.role=forcedRole; if(dna.suspectEffect){ const newRel=SuspectLogicSystem.relationForRole(profile,dna.role,falseConvenience||dna.role==='false_lead'); dna.suspectEffect.relation=newRel; dna.suspectRelation=newRel; } dna.tags=Utils.unique([...(dna.tags||[]),'missing_role_pressure',forcedRole]); } if(linkedSuspect&&dna.suspectEffect&&InvestigationCoherence.shouldForceSuspectLink(activeCase)){ const forcedRel=profile?.trueRelation==='culprit'?'supports':'connects'; dna.suspectEffect.relation=forcedRel; dna.suspectRelation=forcedRel; dna.tags=Utils.unique([...(dna.tags||[]),'suspect_link_pressure']); } } if(dna.suspectEffect)dna.suspectRelation=dna.suspectEffect.relation; dna.tags=Utils.unique([...dna.tags,dna.role,dna.suspectRelation,dna.distortion,dna.hiddenVector,dna.cityTrait].filter(Boolean)); return dna;}, applyToClue(clue,dna){ if(!clue||!dna)return clue; clue.evidenceDNA=dna; clue.evidenceRole=dna.role; clue.suspectEffect=dna.suspectEffect; clue.tags=Utils.unique([...(clue.tags||[]),...(dna.tags||[])]); if(Number.isFinite(dna.reliabilityMod)) clue.reliability=Utils.round2(Utils.clamp01((clue.reliability||0)+dna.reliabilityMod)); if(Number.isFinite(dna.noiseMod)) clue.contradiction=Utils.round2(Utils.clamp01((clue.contradiction||0)+dna.noiseMod)); return clue;}};
const NPCInterpretationSystem = { lensFor(k,d){ if(k==='octavia')return{style:'rival_deduction',preferredRoles:['identity','alibi_break','coverup']}; if(k==='candle_rat')return{style:'street_suspicion',preferredRoles:['false_lead','motive','coverup']}; if(k==='belladonna')return{style:'dream_symbolism',preferredRoles:['world_context','lieutenant_trace']}; if(k==='patron')return{style:'corrupt_completion',preferredRoles:['motive','coverup']}; const sy=d?.symbols||[]; const roles=[]; if(Utils.overlap(sy,['debt','wealth','trade','authority']).length)roles.push('motive','coverup'); if(Utils.overlap(sy,['dreams','bell','sleep']).length)roles.push('world_context','lieutenant_trace'); if(Utils.overlap(sy,['truth','hidden','archive','law']).length)roles.push('coverup','alibi_break'); if(Utils.overlap(sy,['mask','deception','identity','rumor']).length)roles.push('false_lead','identity'); return{style:'world_lens',preferredRoles:Utils.unique(roles.length?roles:['world_context'])};}, remember(k,clueId,data){ if(typeof NPCSystem!=='undefined')NPCSystem.ensureState(); const s=SCHEngine.state; s.npc=s.npc||{}; s.npc.memories=s.npc.memories||{}; s.npc.memories[k]=s.npc.memories[k]||{clueIds:[],interpretations:[]}; if(clueId&&!s.npc.memories[k].clueIds.includes(clueId))s.npc.memories[k].clueIds.push(clueId); s.npc.memories[k].interpretations.push(data); s.npc.memories[k].interpretations=s.npc.memories[k].interpretations.slice(-8);}, interpret(k,d,c,clue){ const lens=this.lensFor(k,d); const dna=clue.evidenceDNA||clue.material?.evidenceDNA||{}; let role=clue.evidenceRole||dna.role||'world_context'; const oldRole=role; const fit=Utils.overlap(d?.symbols||[],dna.npcAffinity||[]).length; if(!lens.preferredRoles.includes(role)&&fit>0&&Math.random()<.45){ role=Utils.pickRandom(Utils.overlap(lens.preferredRoles,c.requiredEvidenceRoles||[]))||role; if(role!==oldRole&&typeof InvestigationCoherence!=='undefined')InvestigationCoherence.reclassifyLastClue(c,role,d.name);} const relation=clue.suspectEffect?.relation||dna.suspectRelation||'connects'; const verdict=relation==='frames'?'too_polished':relation==='clears'?'exculpatory':lens.preferredRoles.includes(role)?'coherent':'symbolic_context'; clue.tags=Utils.unique([...(clue.tags||[]),'Interpreted',lens.style,verdict]); if(clue.material)clue.material.tags=clue.tags; const interp={npcKey:k,npcName:d.name,clueId:clue.id,role,oldRole,verdict,lens:lens.style,symbols:Utils.unique([...(d.symbols||[]),role,verdict,'npc_interpretation']),text:`${d.name} applies a ${lens.style.replace(/_/g,' ')} lens: ${verdict.replace(/_/g,' ')}. The clue now argues as ${InvestigationCoherence.roleLabels[role]||role}.`}; c.theoryBoard=c.theoryBoard||InvestigationCoherence.makeTheoryBoard(c.requiredEvidenceRoles||[]); c.theoryBoard.npcInterpretations=c.theoryBoard.npcInterpretations||[]; c.theoryBoard.npcInterpretations.push(interp); this.remember(k,clue.id,interp); InvestigationCoherence.fileClue(c,clue); SCHEngine.updateNode(c); SCHEngine.updateNode(Object.assign({},clue,{type:'clue',caseId:c.id,provinceId:c.provinceId})); return interp;}};
const NPCAnchorSystem = { assign(draft,prov,g,ids){ if(typeof NPCSystem==='undefined')return[]; const defs=NPCSystem.buildDefs(); const keys=Object.keys(defs); return ['witness','interpreter','obstructer'].map(type=>{const k=Utils.weightedPick(keys,k=>{const d=defs[k]; let w=1+Utils.overlap(d.symbols||[],g?.symbols||[]).length*2; if((d.provinceBias||[]).includes(prov.id))w+=4; if(type==='interpreter'&&Utils.overlap(d.symbols||[],['truth','dreams','archive','law']).length)w+=3; return w+Math.random();}); const d=defs[k]; return{npcKey:k,npcId:d.nodeId,npcName:d.name,anchorType:type,knowsRole:Utils.pickRandom(draft.requiredEvidenceRoles||[]),symbols:Utils.unique([...(d.symbols||[]),type,'case_anchor'])};});}};

// ============================================================================
// NPC SUSPECT SYSTEM (S1-S3): EXPANDED GRAPH-NATIVE SUSPECT POOL
// ============================================================================
const NPCSuspectSystem = {
  ensureState() {
    const s = SCHEngine.state;
    s.counters = s.counters || {};
    if (!Number.isFinite(s.counters.npcCaseConsequence)) s.counters.npcCaseConsequence = 0;
    s.archives = s.archives || {};
    s.archives.npcConsequences = Array.isArray(s.archives.npcConsequences) ? s.archives.npcConsequences : [];
    s.npc = s.npc || {};
    s.npc.suspectHistory = s.npc.suspectHistory || {};
    s.npc.provinceSuspectHistory = s.npc.provinceSuspectHistory || {};
    s.npc.archetypeNpcKeys = Array.isArray(s.npc.archetypeNpcKeys) ? s.npc.archetypeNpcKeys : [];
  },
  historyFor(key) {
    this.ensureState();
    const h = SCHEngine.state.npc.suspectHistory;
    h[key] = h[key] || { timesSuspect: 0, timesCulprit: 0, timesFramed: 0, lastSuspectCase: null, lastSuspectTurn: null, provinceIds: [], recentCaseIds: [] };
    return h[key];
  },
  provinceHistoryFor(provinceId) {
    this.ensureState();
    const h = SCHEngine.state.npc.provinceSuspectHistory;
    h[provinceId] = h[provinceId] || { recentNpcKeys: [], counts: {} };
    return h[provinceId];
  },
  roleCategory(role = '') {
    const r = String(role || '').toLowerCase();
    if (/clergy|abbot|nun|monk|saint|pilgrim|confessor|cantor|preacher|dream_guide/.test(r)) return 'clergy';
    if (/official|bailiff|reeve|clerk|notary|magistrate|archon|advocate|jailer|herald|tax|warrant|auditor/.test(r)) return 'official';
    if (/merchant|factor|auctioneer|peddler|market|patron/.test(r)) return 'merchant';
    if (/artisan|blacksmith|weaver|baker|miller|chandler|cartographer|locksmith|cupmaker|maskwright/.test(r)) return 'artisan';
    if (/informant|spy|witness|messenger|dowser|gossip|lookout|courier/.test(r)) return 'informant';
    if (/noble|duchess|lady|baroness|knight|duelist/.test(r)) return 'noble';
    if (/witch|occultist|prophet|exorcist/.test(r)) return 'occultist';
    return 'civic';
  },
  npcRelation(key) {
    if (typeof NPCSystem === 'undefined') return null;
    const defs = NPCSystem.buildDefs();
    if (defs[key]) return NPCSystem.relation(key);
    this.ensureState();
    SCHEngine.state.npc.relations = SCHEngine.state.npc.relations || {};
    SCHEngine.state.npc.relations[key] = SCHEngine.state.npc.relations[key] || { trust:0,rivalry:0,debt:0,suspicion:0,favor:0,respect:0,encounters:0,lastChoice:null,lastOutcome:null };
    return SCHEngine.state.npc.relations[key];
  },
  archetypeNPCDefs() {
    if (typeof ContentLibrary === 'undefined' || !ContentLibrary.suspectTemplates) return [];
    const existingDefs = (typeof NPCSystem !== 'undefined') ? NPCSystem.buildDefs() : {};
    const existingNames = new Set(Object.values(existingDefs).map(d => d.name));
    const converted = [];
    ContentLibrary.suspectTemplates.forEach(t => {
      // If the world roster already has this figure by key or name, let the real NPC carry that identity.
      if (existingDefs[t.key] || existingNames.has(t.name)) return;
      const key = `arch_${t.key}`;
      const nodeId = `npc_archetype_${t.key}`;
      const def = {
        key,
        nodeId,
        name: t.name,
        title: 'Archetype NPC',
        role: t.role || 'archetype',
        symbols: Utils.unique([...(t.symbols || []), 'archetype_npc']),
        intro: t.personalityLine || `${t.name} has become a local person rather than a loose archetype.`,
        contexts: ['case'],
        rarity: 'converted_archetype',
        provinceBias: t.provinceBias || [],
        cityTraitBias: [],
        templateBias: t.templateBias || [],
        lieutenantAffinity: t.lieutenantAffinity || [],
        archetypeConverted: true,
        originalArchetypeKey: t.key
      };
      if (!SCHEngine.getNode(nodeId)) {
        SCHEngine.registerNode({
          id: nodeId,
          type: 'npc',
          key,
          name: def.name,
          title: def.title,
          role: def.role,
          symbols: Utils.unique([...def.symbols, 'npc', 'converted_archetype_npc']),
          contexts: def.contexts,
          provinceBias: def.provinceBias,
          cityTraitBias: def.cityTraitBias,
          rarity: def.rarity,
          archetypeConverted: true,
          originalArchetypeKey: t.key,
          relationship: Utils.clone(this.npcRelation(key)),
          npcHooks: ['converted_archetype_npc','world_npc'],
          links: Utils.unique([`suspect_template_${t.key}`])
        });
      }
      converted.push({ key, def });
      if (!SCHEngine.state.npc.archetypeNpcKeys.includes(key)) SCHEngine.state.npc.archetypeNpcKeys.push(key);
    });
    return converted;
  },
  eligibleNPCs() {
    if (typeof NPCSystem === 'undefined') return [];
    this.ensureState();
    NPCSystem.ensureState();
    const real = Object.entries(NPCSystem.buildDefs())
      .filter(([key, def]) => key !== 'octavia' && def && def.nodeId)
      .map(([key, def]) => ({ key, def, convertedArchetype: false }));
    const converted = this.archetypeNPCDefs().map(x => ({ ...x, convertedArchetype: true }));
    return [...real, ...converted];
  },
  scoreNPCForCase(key, def, provNode, template, requiredSymbols = [], residueSymbols = [], grammar = null, bucket = 'general') {
    const rel = this.npcRelation(key) || {};
    const hist = this.historyFor(key);
    const ph = this.provinceHistoryFor(provNode.id);
    const nextCaseNumber = (SCHEngine.state.counters.case || 0) + 1;
    const sinceCase = Number.isFinite(hist.lastSuspectCase) ? nextCaseNumber - hist.lastSuspectCase : 999;
    const signal = Utils.unique([...(requiredSymbols || []), ...(residueSymbols || []), ...(grammar?.symbols || []), ...(template?.primarySymbols || []), ...(template?.secondarySymbols || [])]);
    const activeLieutenants = (typeof LieutenantSystem !== 'undefined') ? LieutenantSystem.activeInProvince(provNode.id) : [];
    const isConverted = !!def.archetypeConverted || key.startsWith('arch_');

    let w = isConverted ? 0.28 : 2.4;
    w += Utils.overlap(def.symbols || [], signal).length * (isConverted ? 1.0 : 2.3);
    w += (def.provinceBias || []).includes(provNode.id) ? (isConverted ? 0.8 : 2.5) : 0;
    w += Utils.overlap(def.cityTraitBias || [], template?.preferredTraits || []).length * (isConverted ? 0.5 : 1.4);
    w += Utils.overlap(def.templateBias || [], [template?.key]).length * (isConverted ? 0.9 : 0.4);
    w += Utils.overlap(def.lieutenantAffinity || [], template?.lieutenantBias || []).length * (isConverted ? 0.6 : 0.5);
    w += activeLieutenants.some(lt => Utils.overlap(lt.symbols || [], def.symbols || []).length) ? (isConverted ? 0.4 : 1.0) : 0;

    // Relationship relevance should help, but not overpower fresh roster representation.
    w += (rel.encounters || 0) > 0 ? 0.45 + Math.min(1.0, (rel.encounters || 0) * 0.10) : 0;
    w += (rel.debt || 0) * 1.7 + (rel.suspicion || 0) * 1.4 + (rel.favor || 0) * 0.7;
    if (key === 'patron') w += (SCHEngine.state.player.corruption || 0) * 1.2 + 0.25;

    // Diversity/cooldown: strongly prefer unused real NPCs and avoid recent repeats.
    if (!isConverted) {
      if ((hist.timesSuspect || 0) === 0) w += 7.5;
      else w += Math.max(0, 3.0 - (hist.timesSuspect || 0) * 0.75);
      if (sinceCase <= 4) w -= 12;
      else if (sinceCase <= 8) w -= 6;
      else if (sinceCase <= 14) w -= 2.5;
      if ((ph.recentNpcKeys || []).includes(key)) w -= 5.5;
    } else {
      // Converted archetype NPCs are allowed, but should be special guests rather than defaults.
      if ((hist.timesSuspect || 0) === 0) w += 0.6;
      if (sinceCase <= 10) w -= 8;
      w -= 2.0;
    }

    if (bucket === 'fresh') w += (hist.timesSuspect || 0) === 0 && !isConverted ? 5.0 : -1.0;
    if (bucket === 'relationship') w += ((rel.encounters || 0) > 0 || (rel.debt || 0) > 0 || (rel.favor || 0) > 0 || (rel.suspicion || 0) > 0) ? 3.0 : -0.5;
    if (bucket === 'wildcard') w += Math.random() * 4.0;

    return Math.max(0.01, w + Math.random() * 1.0);
  },
  storyFragmentsFor(def, template = null, requiredSymbols = [], grammar = null) {
    const role = def.role || 'local figure';
    const title = def.title || role;
    const sy = def.symbols || [];
    const caseTone = Utils.pickRandom(requiredSymbols) || Utils.pickRandom(sy) || 'truth';
    const category = this.roleCategory(role);
    const accessMap = {
      clergy: 'access to confession, bells, dreams, or sanctioned silence',
      official: 'access to records, seals, warrants, and civic procedure',
      merchant: 'access to debts, trade routes, favors, and private ledgers',
      artisan: 'access to tools, materials, repairs, and quiet workshops',
      informant: 'access to rumors, witnesses, alleys, and inconvenient names',
      noble: 'access to influence, retainers, ceremonies, and polished alibis',
      occultist: 'access to symbols, shadows, bargains, and spoiled omens',
      civic: 'access to the local pattern from an awkward angle'
    };
    return {
      publicFace: `${title}; ${def.intro || 'a familiar figure in the province.'}`,
      suspicionLine: `${def.name} has ${accessMap[category] || accessMap.civic}.`,
      motive: `${def.name} could benefit if ${caseTone} is steered rather than solved.`,
      method: `${def.name}'s work gives them a plausible way to touch the evidence without looking like a culprit.`,
      opportunity: `${def.name} can move through the case's social machinery without raising immediate alarm.`,
      alibi: `The alibi around ${def.name} is ordinary until the symbols are read together.`,
      secret: `Their connection to [${Utils.unique(sy.slice(0, 3)).join(', ')}] may matter more than their public role suggests.`,
      frameWarning: `The trail against ${def.name} may be too neatly arranged by someone who understands their public habits.`,
      clearingLine: `${def.name} may be dirty, useful, or frightened without being the center of the anomaly.`
    };
  },
  createNPCSuspectNode(key, def, provNode, template, requiredSymbols = [], residueSymbols = [], grammar = null) {
    const provisionalCaseId = `case_${(SCHEngine.state.counters.case || 0) + 1}`;
    const id = `suspect_${Utils.normalizeId(provNode.id)}_${provisionalCaseId}_${Utils.normalizeId(key)}`;
    const existing = SCHEngine.getNode(id);
    const fragments = this.storyFragmentsFor(def, template, requiredSymbols, grammar);
    const isConverted = !!def.archetypeConverted || key.startsWith('arch_');
    const symbols = Utils.unique([...(def.symbols || []), ...(residueSymbols || []), this.roleCategory(def.role), 'suspect', 'npc_suspect', 'case_suspect', isConverted ? 'converted_archetype_npc' : null].filter(Boolean));
    const nodeData = {
      id,
      type: 'suspect',
      key: `npc_${key}`,
      name: def.name,
      role: def.role || def.title || 'npc',
      title: def.title || '',
      sourceType: 'npc',
      sourceNpcKey: key,
      sourceNpcId: def.nodeId,
      sourceNpcRole: def.role || '',
      sourceNpcTitle: def.title || '',
      category: this.roleCategory(def.role),
      archetypeConverted: isConverted,
      originalArchetypeKey: def.originalArchetypeKey || null,
      symbols,
      provinceId: provNode.id,
      provisionalCaseId,
      suspectHook: `${def.title || def.role || 'NPC'} — ${fragments.suspicionLine}`,
      personalityLine: fragments.publicFace,
      storyFragments: fragments,
      provinceBias: def.provinceBias || [],
      cityTraitBias: def.cityTraitBias || [],
      links: Utils.unique([provNode.id, def.nodeId, template ? `case_template_${template.key}` : null, def.originalArchetypeKey ? `suspect_template_${def.originalArchetypeKey}` : null, provisionalCaseId].filter(Boolean))
    };
    if (existing) return Object.assign(existing, nodeData), SCHEngine.updateNode(existing).id;
    SCHEngine.registerNode(nodeData);
    return id;
  },
  pickCandidate(pool, provNode, template, requiredSymbols, residueSymbols, grammar, bucket = 'general', usedKeys = new Set()) {
    const candidates = pool.filter(x => !usedKeys.has(x.key));
    if (!candidates.length) return null;
    // Hard cooldown first, weighted score second. If there are enough alternatives, recent suspects are simply ineligible.
    const nextCaseNumber = (SCHEngine.state.counters.case || 0) + 1;
    const cooled = candidates.filter(x => {
      const h = this.historyFor(x.key);
      if (!Number.isFinite(h.lastSuspectCase)) return true;
      const cooldown = x.def.archetypeConverted ? 12 : 8;
      return nextCaseNumber - h.lastSuspectCase > cooldown;
    });
    const finalCandidates = cooled.length ? cooled : (bucket === 'relationship' ? [] : candidates);
    if (!finalCandidates.length) return null;
    return Utils.weightedPick(finalCandidates, x => this.scoreNPCForCase(x.key, x.def, provNode, template, requiredSymbols, residueSymbols, grammar, bucket));
  },
  buildExpandedSuspectSlate(provNode, template, requiredSymbols = [], residueSymbols = [], grammar = null) {
    const count = MODE.name === 'Casual' ? 3 : (MODE.name === 'Deep' ? 5 : 4);
    const selected = [];
    const usedNames = new Set();
    const usedKeys = new Set();
    const report = { strategy: 'npc_primary_diversity_s4', requestedCount: count, buckets: [], npcCount: 0, convertedArchetypeNpcCount: 0, freshNpcCount: 0, repeatedNpcCount: 0, selected: [] };
    const addCandidate = (candidate, bucket) => {
      if (!candidate || usedKeys.has(candidate.key)) return false;
      const id = this.createNPCSuspectNode(candidate.key, candidate.def, provNode, template, requiredSymbols, residueSymbols, grammar);
      const node = SCHEngine.getNode(id);
      if (!node || usedNames.has(node.name)) return false;
      selected.push(id);
      usedNames.add(node.name);
      usedKeys.add(candidate.key);
      const hist = this.historyFor(candidate.key);
      report.buckets.push(bucket);
      report.npcCount += 1;
      if (candidate.def.archetypeConverted) report.convertedArchetypeNpcCount += 1;
      if ((hist.timesSuspect || 0) === 0 && !candidate.def.archetypeConverted) report.freshNpcCount += 1;
      if ((hist.timesSuspect || 0) > 0) report.repeatedNpcCount += 1;
      report.selected.push({ key: candidate.key, name: node.name, bucket, archetypeConverted: !!candidate.def.archetypeConverted, priorSuspectCount: hist.timesSuspect || 0 });
      return true;
    };

    const all = this.eligibleNPCs();
    const realPool = all.filter(x => !x.def.archetypeConverted && x.key !== 'octavia');
    const convertedPool = all.filter(x => x.def.archetypeConverted);
    const freshPool = realPool.filter(x => (this.historyFor(x.key).timesSuspect || 0) === 0);
    const relationshipPool = realPool.filter(x => { const r = this.npcRelation(x.key) || {}; return (r.encounters || 0) > 0 || (r.debt || 0) > 0 || (r.favor || 0) > 0 || (r.suspicion || 0) > 0; });

    // NPC-primary bucket pass: explicitly pull from fresh and varied real NPCs before anything else.
    addCandidate(this.pickCandidate(freshPool.length ? freshPool : realPool, provNode, template, requiredSymbols, residueSymbols, grammar, 'fresh', usedKeys), 'fresh');
    addCandidate(this.pickCandidate(realPool, provNode, template, requiredSymbols, residueSymbols, grammar, 'bestFit', usedKeys), 'bestFit');
    if (selected.length < count && relationshipPool.length) addCandidate(this.pickCandidate(relationshipPool, provNode, template, requiredSymbols, residueSymbols, grammar, 'relationship', usedKeys), 'relationship');
    if (selected.length < count) addCandidate(this.pickCandidate(freshPool.length ? freshPool : realPool, provNode, template, requiredSymbols, residueSymbols, grammar, 'wildcard', usedKeys), 'freshWildcard');

    while (selected.length < count && realPool.some(x => !usedKeys.has(x.key))) {
      addCandidate(this.pickCandidate(realPool, provNode, template, requiredSymbols, residueSymbols, grammar, selected.length % 2 ? 'fresh' : 'general', usedKeys), 'diverseNPC');
    }

    // Converted archetype NPCs are now NPCs, not standalone archetype suspects. They appear rarely and at most once.
    const convertedChance = MODE.name === 'Deep' ? 0.18 : MODE.name === 'Standard' ? 0.12 : 0.08;
    if (convertedPool.length && Math.random() < convertedChance) {
      const converted = this.pickCandidate(convertedPool, provNode, template, requiredSymbols, residueSymbols, grammar, 'convertedArchetypeNpc', usedKeys);
      if (converted) {
        if (selected.length < count) addCandidate(converted, 'convertedArchetypeNpc');
        else {
          // Replace the most repeated real NPC, never a fresh face, so roster breadth still improves.
          let replaceIdx = -1;
          let replaceScore = -999;
          selected.forEach((id, i) => {
            const s = SCHEngine.getNode(id);
            const h = this.historyFor(s?.sourceNpcKey || '');
            const score = (h.timesSuspect || 0) - (s?.archetypeConverted ? 99 : 0);
            if (score > replaceScore && (h.timesSuspect || 0) > 0) { replaceScore = score; replaceIdx = i; }
          });
          if (replaceIdx >= 0) {
            const old = SCHEngine.getNode(selected[replaceIdx]);
            usedKeys.delete(old?.sourceNpcKey);
            selected.splice(replaceIdx, 1);
            addCandidate(converted, 'convertedArchetypeNpcReplace');
          }
        }
      }
    }

    this.recordSuspectHistory(selected, provNode.id, report);
    SCHEngine.state.lastSuspectSelectionReport = Utils.clone(report);
    return selected;
  },
  recordSuspectHistory(selectedIds, provinceId, report = null) {
    this.ensureState();
    const caseNo = (SCHEngine.state.counters.case || 0) + 1;
    const turn = SCHEngine.state.turn;
    const ph = this.provinceHistoryFor(provinceId);
    selectedIds.forEach(id => {
      const s = SCHEngine.getNode(id);
      const key = s?.sourceNpcKey;
      if (!key) return;
      const h = this.historyFor(key);
      h.timesSuspect = (h.timesSuspect || 0) + 1;
      h.lastSuspectCase = caseNo;
      h.lastSuspectTurn = turn;
      h.provinceIds = Utils.unique([...(h.provinceIds || []), provinceId]);
      h.recentCaseIds = Utils.unique([...(h.recentCaseIds || []), `case_${caseNo}`]).slice(-8);
      ph.counts[key] = (ph.counts[key] || 0) + 1;
      ph.recentNpcKeys = [key, ...(ph.recentNpcKeys || []).filter(k => k !== key)].slice(0, 10);
    });
    if (report) {
      report.recordedCaseNumber = caseNo;
      report.provinceId = provinceId;
    }
  },
  profileSeedFor(caseNode, suspectNode, assignedRelation) {
    const fragments = suspectNode.storyFragments || {};
    const role = suspectNode.sourceType === 'npc' ? (suspectNode.sourceNpcRole || suspectNode.role) : suspectNode.role;
    return {
      sourceType: 'npc',
      sourceNpcKey: suspectNode.sourceNpcKey || null,
      sourceNpcId: suspectNode.sourceNpcId || null,
      publicFace: fragments.publicFace || suspectNode.personalityLine || '',
      motiveLine: fragments.motive || `${suspectNode.name} has a plausible benefit vector.`,
      methodLine: fragments.method || `${suspectNode.name} has a plausible method vector.`,
      opportunityLine: fragments.opportunity || `${suspectNode.name} has access to the case space.`,
      frameWarning: fragments.frameWarning || `The trail against ${suspectNode.name} may be overly convenient.`,
      clearingLine: fragments.clearingLine || `${suspectNode.name} may be connected without being central.`,
      publicRole: role || 'suspect',
      assignedRelation
    };
  },
  caseRolesFor(caseNode) {
    const roles = {};
    (caseNode?.suspectIds || []).forEach(id => {
      const s = SCHEngine.getNode(id);
      if (s?.sourceNpcId) roles[s.sourceNpcId] = 'suspect';
    });
    return roles;
  },
  applyResolutionConsequences(activeCase, suspectNode, outcome, resolutionFlavor = null) {
    this.ensureState();
    if (!suspectNode || suspectNode.sourceType !== 'npc' || !suspectNode.sourceNpcKey) return null;
    const profile = SuspectLogicSystem.profileFor(activeCase, suspectNode.id) || {};
    const landed = outcome === 'resolved' || outcome === 'partially_resolved';
    let delta = { encounters: 0 };
    let note = '';
    if (landed && profile.trueRelation === 'framed') {
      delta = { trust: 0.15, favor: 0.06, suspicion: -0.05, respect: 0.04 };
      note = `${suspectNode.name} was framed more than guilty; clearing the trail changes the relationship.`;
    } else if (landed && ['culprit','coverup_actor','beneficiary','lieutenant_proxy','patron_tangled'].includes(profile.trueRelation)) {
      delta = { trust: -0.16, suspicion: 0.28, rivalry: 0.04, respect: 0.02 };
      note = `${suspectNode.name} is marked by the resolved case as ${String(profile.trueRelation).replace(/_/g, ' ')}.`;
    } else if (landed) {
      delta = { trust: -0.06, suspicion: 0.12, respect: 0.02 };
      note = `${suspectNode.name} is not cleanly guilty, but the case ties them to the anomaly.`;
    } else {
      delta = { trust: -0.18, suspicion: 0.12, rivalry: 0.06 };
      note = `${suspectNode.name} remembers the failed accusation.`;
    }

    const key = suspectNode.sourceNpcKey;
    const defs = (typeof NPCSystem !== 'undefined') ? NPCSystem.buildDefs() : {};
    if (defs[key]) NPCSystem.adjust(key, delta);
    else {
      const rel = this.npcRelation(key);
      Object.entries(delta).forEach(([a,v]) => { rel[a] = Utils.round2(Utils.clamp01((rel[a] || 0) + v)); });
      const base = SCHEngine.getNode(suspectNode.sourceNpcId);
      if (base) { base.relationship = Utils.clone(rel); SCHEngine.updateNode(base); }
    }

    const h = this.historyFor(key);
    if (profile.trueRelation === 'culprit') h.timesCulprit = (h.timesCulprit || 0) + 1;
    if (profile.trueRelation === 'framed') h.timesFramed = (h.timesFramed || 0) + 1;

    const id = `npc_case_consequence_${++SCHEngine.state.counters.npcCaseConsequence}`;
    const node = {
      id,
      type: 'npc_case_consequence',
      npcId: suspectNode.sourceNpcId,
      npcKey: key,
      npcName: suspectNode.name,
      suspectId: suspectNode.id,
      caseId: activeCase.id,
      caseName: activeCase.name,
      outcome,
      trueRelation: profile.trueRelation || 'unknown',
      resolutionFlavor: resolutionFlavor?.id || null,
      relationshipDelta: delta,
      text: note,
      turn: SCHEngine.state.turn,
      symbols: Utils.unique(['npc_consequence', outcome, profile.trueRelation, ...(suspectNode.symbols || []).slice(0, 4)].filter(Boolean)),
      links: Utils.unique([suspectNode.sourceNpcId, suspectNode.id, activeCase.id, activeCase.provinceId].filter(Boolean))
    };
    SCHEngine.registerNode(node);
    SCHEngine.state.archives.npcConsequences.push(Utils.clone(node));
    activeCase.npcConsequences = activeCase.npcConsequences || [];
    activeCase.npcConsequences.push(node.id);
    if (typeof NPCMemorySystem !== 'undefined') NPCMemorySystem.remember(key, { type: profile.trueRelation === 'framed' && landed ? 'cleared_frame' : (!landed ? 'false_accusation' : 'case_consequence'), summary: note, emotionalTag: outcome, weight: 0.85, caseId: activeCase.id, npcId: suspectNode.sourceNpcId, symbols: node.symbols });
    SCHEngine.narrative(`\x1b[33m[NPC CONSEQUENCE]\x1b[0m ${note}`);
    return node;
  }
};

const CoherenceValidator = { validateCase(c){const issues=[]; if(!c.requiredEvidenceRoles?.length)issues.push('missing_required_roles'); if(!Object.values(c.suspectProfiles||{}).some(p=>p.trueRelation==='culprit'))issues.push('no_true_culprit_profile'); if(!c.truthArc?.length)issues.push('missing_truth_arc'); return{ok:!issues.length,issues};}, validateClue(c,clue){const issues=[]; const role=clue.evidenceRole||clue.material?.evidenceRole; if(role&&!(c.requiredEvidenceRoles||[]).includes(role)&&!['world_context','false_lead','lieutenant_trace'].includes(role))issues.push('off_contract_role'); const ratio=(c.theoryBoard?.falseLeads||[]).length/Math.max(1,(c.clues||[]).length); if(ratio>(c.coherenceContract?.maxFalseLeadRatio||.55))issues.push('false_lead_ratio_high'); clue.coherenceIssues=issues; if(issues.length)clue.tags=Utils.unique([...(clue.tags||[]),'Coherence-Warning']); return{ok:!issues.length,issues};}, validateTheoryBoard(c){const readiness=InvestigationCoherence.readinessExplanation(c); const arg=InvestigationCoherence.argumentScore(c,null); return{ok:readiness.ready&&arg>=(MODE.name==='Deep'?.25:.18),readiness,argumentScore:arg};}};
const ResolutionFlavorSystem = {
  determine(c,s,outcome,conf,arg){
    const p=SuspectLogicSystem.profileFor(c,s.id);
    const fabricated=(c.theoryBoard?.fabricatedRoles||[]).length>0;
    const lt=(c.clues||[]).some(x=>(x.evidenceRole||x.material?.evidenceRole)==='lieutenant_trace');
    const dream=(c.clues||[]).some(x=>Utils.overlap(x.symbols||[],['dreams','sleep','bell']).length||(x.tags||[]).includes('Dream-Touched'));
    const fairness=c.theoryFairnessReport||{};
    let id='civic_truth_rejected', text='The province rejects the theory and keeps its favorite lie.';
    if(outcome!=='failed'&&fabricated){id='patron_tainted_victory';text='The case is won with an argument that smells faintly of velvet.';}
    else if(outcome!=='failed'&&p?.trueRelation==='culprit'&&arg>=.55){id='true_culprit';text='You named the true culprit and gave the archive a spine.';}
    else if(outcome!=='failed'&&p?.trueRelation==='framed'){id='framed_suspect_exposed';text='You caught the frame more clearly than the culprit behind it.';}
    else if(outcome!=='failed'&&lt){id='lieutenant_trace_found';text='The civic case opens onto the Worlock network.';}
    else if(outcome!=='failed'&&dream){id='dream_truth_accepted';text='The province accepts dream evidence without entirely trusting sleep.';}
    else if(outcome==='partially_resolved'&&p?.trueRelation==='culprit'){id='guilty_wrong_reason';text='You found the guilty party, but the motive remains crooked.';}
    else if(outcome!=='failed'){id='coverup_resolved';text='You broke the cover-up, though its author may still be walking.';}
    else if(outcome==='failed' && fairness?.after >= (MODE.partialThreshold - 0.04)) { id='near_miss_truth'; text='The theory fails legally, but leaves a useful fracture in the province lie.'; }
    return{id,name:id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),text,profile:p?.trueRelation||'unknown',finalConfidence:Utils.round2(conf),argumentScore:Utils.round2(arg||0),fairness:fairness?.strategy||null};
  }
};

const TheoryFairnessSystem = {
  suspectWeights(activeCase) {
    const suspects = (activeCase?.suspectIds || []).map(id => SCHEngine.getNode(id)).filter(Boolean);
    if (!suspects.length) return {};
    if (activeCase.lastTheoryWeights && Object.keys(activeCase.lastTheoryWeights).length) return activeCase.lastTheoryWeights;
    const raw = suspects.map(s => {
      let score = 0.01;
      if (typeof ClueReportBuilder !== 'undefined' && ClueReportBuilder.suspectRawScore) score = ClueReportBuilder.suspectRawScore(activeCase, s);
      else {
        const link = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.suspectLinkSummary(activeCase, s.id) : {supports:0,connects:0,frames:0,clears:0,contradicts:0};
        const arg = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.argumentScore(activeCase, s.id) : 0;
        score = 0.08 + arg * 0.40 + Utils.jaccardSimilarity(s.symbols || [], activeCase.requiredSymbols || []) * 0.25;
        score += (link.supports || 0) * 0.12 + (link.connects || 0) * 0.07 + (link.frames || 0) * 0.03 - (link.clears || 0) * 0.12;
      }
      return { id:s.id, score:Math.max(0.01, score) };
    });
    const total = raw.reduce((a,b) => a + b.score, 0) || 1;
    const weights = {};
    raw.forEach(x => weights[x.id] = x.score / total);
    activeCase.lastTheoryWeights = weights;
    return weights;
  },
  selectedRank(activeCase, suspectId, weights = null) {
    const w = weights || this.suspectWeights(activeCase);
    const ordered = Object.entries(w).sort((a,b) => b[1] - a[1]);
    const idx = ordered.findIndex(([id]) => id === suspectId);
    return idx < 0 ? ordered.length : idx + 1;
  },
  metrics(activeCase, suspectNode, spreadResult = null, spread = []) {
    const weights = this.suspectWeights(activeCase);
    const weight = weights[suspectNode.id] || 0;
    const rank = this.selectedRank(activeCase, suspectNode.id, weights);
    const link = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.suspectLinkSummary(activeCase, suspectNode.id) : {supports:0,connects:0,contradicts:0,frames:0,clears:0};
    const argumentScore = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.argumentScore(activeCase, suspectNode.id) : (activeCase.argumentScore || 0);
    const missingRoles = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.missingRequiredRoles(activeCase) : [];
    const boardComplete = missingRoles.length === 0;
    const suspectLinked = ((link.supports || 0) + (link.connects || 0) + (link.frames || 0) + (link.clears || 0)) > 0;
    const roles = Utils.unique((activeCase.clues || []).map(c => c.evidenceRole || c.material?.evidenceRole).filter(Boolean));
    const falseLeadEvidence = roles.includes('false_lead') || (activeCase.theoryBoard?.falseLeads || []).length > 0 || (link.frames || 0) > 0;
    const alibiBreakEvidence = roles.includes('alibi_break') || (link.clears || 0) > 0;
    const profile = (typeof SuspectLogicSystem !== 'undefined') ? SuspectLogicSystem.profileFor(activeCase, suspectNode.id) : null;
    const reversedCount = (spread || []).filter(s => s.orientation === 'reversed').length;
    const resonance = Number.isFinite(spreadResult?.resonance) ? spreadResult.resonance : 0;
    const selectedTopOrNearTop = rank <= (MODE.name === 'Deep' ? 2 : 2);
    const contradiction = activeCase.truthState?.contradiction || 0;
    const corruption = SCHEngine.state.player.corruption || 0;
    const severeRisk = (MODE.name === 'Deep' && (corruption >= 0.82 || contradiction >= 0.62)) || (MODE.name === 'Standard' && corruption >= 0.90);
    return { weights, weight, rank, link, argumentScore, missingRoles, boardComplete, suspectLinked, roles, falseLeadEvidence, alibiBreakEvidence, profile, reversedCount, resonance, selectedTopOrNearTop, severeRisk, contradiction, corruption };
  },
  weightBonus(weight) {
    if (MODE.name === 'Casual') return weight >= 0.45 ? 0.08 : weight >= 0.35 ? 0.05 : weight >= 0.25 ? 0.03 : weight >= 0.18 ? 0.01 : -0.02;
    if (MODE.name === 'Standard') return weight >= 0.45 ? 0.06 : weight >= 0.35 ? 0.04 : weight >= 0.25 ? 0.02 : weight >= 0.18 ? 0.01 : -0.03;
    return weight >= 0.45 ? 0.04 : weight >= 0.35 ? 0.025 : weight >= 0.25 ? 0.01 : 0;
  },
  tarotCompensation(spreadResult, spread) {
    const resonance = Number.isFinite(spreadResult?.resonance) ? spreadResult.resonance : 0;
    const reversedCount = (spread || []).filter(s => s.orientation === 'reversed').length;
    const cap = MODE.name === 'Casual' ? 0.02 : MODE.name === 'Standard' ? 0.04 : 0.08;
    let compensation = 0;
    if (resonance < 0.08) compensation += Math.min(cap, 0.08 - resonance);
    if (reversedCount >= 2) compensation += MODE.name === 'Deep' ? 0.015 : MODE.name === 'Standard' ? 0.02 : 0.01;
    return Math.min(cap, compensation);
  },
  apply(activeCase, suspectNode, finalConfidence, spreadResult, spread = []) {
    const m = this.metrics(activeCase, suspectNode, spreadResult, spread);
    const notes = [];
    const before = finalConfidence;
    const add = (amount, note) => {
      if (!Number.isFinite(amount) || amount === 0) return;
      finalConfidence = Utils.clamp01(finalConfidence + amount);
      if (note) notes.push(note);
    };

    const weightBonus = this.weightBonus(m.weight);
    add(weightBonus, `Theory weight adjustment: ${Utils.describePct(m.weight)} (${weightBonus >= 0 ? '+' : ''}${Math.round(weightBonus * 100)}%).`);

    if (m.boardComplete && m.suspectLinked) {
      const boardBonus = MODE.name === 'Casual' ? 0.08 : MODE.name === 'Standard' ? 0.06 : 0.04;
      if (m.argumentScore >= (MODE.name === 'Deep' ? 0.65 : MODE.name === 'Standard' ? 0.50 : 0.35)) add(boardBonus, 'Completed evidence roles protect the theory from collapsing outright.');
    }

    const tarotSave = this.tarotCompensation(spreadResult, spread);
    if (tarotSave > 0) add(tarotSave, `Weak or reversed Tarot spread complicated the reading, but did not erase the evidence (+${Math.round(tarotSave * 100)}%).`);

    // Ready-case floors: these align the player-facing "Ready" state and Theory Weight display with the resolution math.
    if (!m.severeRisk) {
      if (MODE.name === 'Casual') {
        if (m.suspectLinked && m.argumentScore >= 0.30) {
          const floor = MODE.partialThreshold + (m.weight >= 0.35 || m.selectedTopOrNearTop ? 0.06 : 0.03);
          if (finalConfidence < floor) { finalConfidence = floor; notes.push('Casual ready-case floor: a coherent accusation lands as at least Partial Truth.'); }
        }
      } else if (MODE.name === 'Standard') {
        if (m.argumentScore >= 0.55 && m.weight >= 0.40 && m.suspectLinked) {
          const floor = MODE.partialThreshold + 0.05;
          if (finalConfidence < floor) { finalConfidence = floor; notes.push('Standard fairness floor: strong ready theory protected from false-accusation collapse.'); }
        } else if (m.argumentScore >= 0.45 && m.weight >= 0.30 && m.selectedTopOrNearTop && m.suspectLinked) {
          const floor = MODE.partialThreshold + 0.01;
          if (finalConfidence < floor) { finalConfidence = floor; notes.push('Standard near-top suspect floor: reasonable ready theory reaches Partial Truth.'); }
        }
      } else if (MODE.name === 'Deep') {
        if (m.argumentScore >= 0.70 && m.weight >= 0.45 && m.suspectLinked) {
          const floor = MODE.partialThreshold + 0.02;
          if (finalConfidence < floor) { finalConfidence = floor; notes.push('Deep soft floor: strong evidence avoids a total collapse, though consequences may remain.'); }
        } else if (m.argumentScore >= 0.62 && m.weight >= 0.38 && m.selectedTopOrNearTop && m.boardComplete && m.suspectLinked) {
          const floor = MODE.partialThreshold - 0.01;
          if (finalConfidence < floor) { finalConfidence = floor; notes.push('Deep near-partial floor: the theory is scarred, not simply dismissed.'); }
        }
      }

      // Framed suspects: good detective work should expose the frame as progress, not punish the player as simply wrong.
      if (m.profile?.trueRelation === 'framed' && m.suspectLinked && (m.falseLeadEvidence || m.alibiBreakEvidence || m.argumentScore >= (MODE.name === 'Deep' ? 0.58 : 0.45))) {
        const floor = MODE.name === 'Deep' ? MODE.partialThreshold - 0.01 : MODE.partialThreshold + 0.02;
        if (finalConfidence < floor) {
          finalConfidence = floor;
          notes.push('Frame-exposure floor: the suspect trail was staged, but your evidence catches the staging.');
        } else {
          notes.push('Frame-exposure reading: this accusation may reveal the trap even if the suspect is not the author of it.');
        }
      }
    } else {
      notes.push('Severe corruption or contradiction prevents the fairness floor from fully stabilizing the theory.');
    }

    const report = {
      strategy:'theory_fairness_pass_s1',
      mode:MODE.name,
      before:Utils.round2(before),
      after:Utils.round2(finalConfidence),
      delta:Utils.round2(finalConfidence - before),
      selectedTheoryWeight:Utils.round2(m.weight),
      selectedTheoryRank:m.rank,
      argumentScore:Utils.round2(m.argumentScore),
      boardComplete:m.boardComplete,
      suspectLinked:m.suspectLinked,
      framedProfile:m.profile?.trueRelation === 'framed',
      falseLeadEvidence:m.falseLeadEvidence,
      alibiBreakEvidence:m.alibiBreakEvidence,
      severeRisk:m.severeRisk,
      notes
    };
    activeCase.theoryFairnessReport = report;
    return { finalConfidence, notes, report };
  },
  preSubmitWarning(activeCase, suspectNode) {
    const m = this.metrics(activeCase, suspectNode, null, []);
    const risk = [];
    if (m.profile?.trueRelation === 'framed' || (m.link.frames || 0) > Math.max(m.link.supports || 0, m.link.connects || 0)) risk.push('frame-prone');
    if (!m.boardComplete) risk.push('missing-role');
    if (m.argumentScore < (MODE.name === 'Deep' ? 0.60 : 0.45)) risk.push('thin-argument');
    if (m.weight < 0.25) risk.push('low-theory-weight');
    const label = risk.length ? risk.join(', ') : 'stable';
    return `${suspectNode.name}: ${Utils.describePct(m.weight)} theory weight, argument ${Utils.describePct(m.argumentScore)}, trail ${label}`;
  }
};

const ContentLibrary = {
  caseTemplates: [{"key": "false_ledger", "titlePattern": "The False Ledger of {province}", "introPattern": "A manorial ledger in {province} has begun collecting payments from peasants who have not yet borrowed anything.", "primarySymbols": ["debt", "authority", "hidden"], "secondarySymbols": ["greed", "trade", "law"], "preferredTraits": ["Ledger", "Mask"], "clueForms": ["ledger_page", "debt_marker", "wax_seal", "court_roll"], "lieutenantBias": ["auditor_of_hunger", "masked_clerk"], "resolutionThemes": {"resolved": "The false account is closed, though the ink resists.", "partial": "The debt is named, but not forgiven.", "failed": "The ledger grows teeth."}}, {"key": "silent_bell", "titlePattern": "The Silent Bell of {province}", "introPattern": "A chapel bell in {province} has stopped ringing, yet every sleeper hears it under the ribs.", "primarySymbols": ["bell", "sleep", "hidden"], "secondarySymbols": ["dreams", "silence", "false_holiness"], "preferredTraits": ["Bell", "Lantern"], "clueForms": ["bell_clapper", "chapel_rope", "vesper_candle", "dream_scroll"], "lieutenantBias": ["bell_eater"], "resolutionThemes": {"resolved": "The bell remembers its voice.", "partial": "The silence cracks but does not break.", "failed": "The bell is swallowed whole."}}, {"key": "mirror_deposition", "titlePattern": "The Mirror Deposition of {province}", "introPattern": "A deposition in {province} changes its testimony when read by candlelight or seen in polished steel.", "primarySymbols": ["illusion", "truth", "authority"], "secondarySymbols": ["mirror", "law", "deception"], "preferredTraits": ["Mirror", "Lantern"], "clueForms": ["mirror_shard", "court_roll", "oath_tablet", "silver_pin"], "lieutenantBias": ["mirror_advocate"], "resolutionThemes": {"resolved": "The reflection is forced to testify plainly.", "partial": "One mirror lies less fluently.", "failed": "The court believes the reflection."}}, {"key": "convenient_suspect", "titlePattern": "The Trial of the Convenient Suspect", "introPattern": "One suspect in {province} appears guilty with such theatrical neatness that even the stocks seem embarrassed.", "primarySymbols": ["mask", "deception", "suspect"], "secondarySymbols": ["trade", "authority", "hidden"], "preferredTraits": ["Mask", "Festival"], "clueForms": ["mask_fragment", "signed_confession", "guild_token", "wanted_broadside"], "lieutenantBias": ["masked_clerk"], "resolutionThemes": {"resolved": "The convenient villain is pulled offstage.", "partial": "The mask slips, but the actor escapes.", "failed": "The wrong person bows to applause."}}, {"key": "relic_without_saint", "titlePattern": "The Relic Without a Saint", "introPattern": "A reliquary in {province} is venerated daily despite containing nothing but dust and a very official receipt.", "primarySymbols": ["false_holiness", "hypocrisy", "hidden"], "secondarySymbols": ["authority", "doctrine", "wealth"], "preferredTraits": ["Bell", "Lantern"], "clueForms": ["relic_case", "pilgrim_badge", "abbey_key", "vesper_candle"], "lieutenantBias": ["mirror_advocate", "bell_eater"], "resolutionThemes": {"resolved": "The false saint is removed from the calendar.", "partial": "The reliquary opens, but the pilgrims keep kneeling.", "failed": "The dust is canonized."}}, {"key": "feast_witness", "titlePattern": "The Feast That Ate the Witness", "introPattern": "At a banquet in {province}, a witness vanished between courses and reappeared only as a bill of fare.", "primarySymbols": ["gluttony", "excess", "consumption"], "secondarySymbols": ["silence", "waste", "festival"], "preferredTraits": ["Festival", "Ledger"], "clueForms": ["banquet_menu", "grease_oath", "silver_spoon", "butchers_tally"], "lieutenantBias": ["feast_bailiff", "auditor_of_hunger"], "resolutionThemes": {"resolved": "The witness is restored to testimony instead of sauce.", "partial": "The feast ends, though something keeps chewing.", "failed": "The banquet requests a second witness."}}, {"key": "debt_paid_itself", "titlePattern": "The Debt That Paid Itself", "introPattern": "A debt in {province} has been paid, owed, forgiven, and inherited in the same hour.", "primarySymbols": ["debt", "cycle", "fate"], "secondarySymbols": ["greed", "authority", "hidden"], "preferredTraits": ["Ledger", "Mirror"], "clueForms": ["debt_marker", "coin_purse", "court_roll", "ledger_page"], "lieutenantBias": ["auditor_of_hunger"], "resolutionThemes": {"resolved": "The circular debt is cut like a knot.", "partial": "The debt stops multiplying, but still breathes.", "failed": "The debt inherits itself again."}}, {"key": "trial_before_crime", "titlePattern": "The Trial Before the Crime", "introPattern": "A sentence has been passed in {province} for a crime not yet committed.", "primarySymbols": ["punishment", "authority", "fate"], "secondarySymbols": ["truth", "law", "ruin"], "preferredTraits": ["Lantern", "Ledger"], "clueForms": ["court_roll", "iron_key", "gallows_nail", "sealed_edict"], "lieutenantBias": ["mirror_advocate"], "resolutionThemes": {"resolved": "The verdict is dragged back behind the crime.", "partial": "The sentence weakens but remains addressed.", "failed": "The future is found guilty."}}, {"key": "festival_missing_names", "titlePattern": "The Festival of Missing Names", "introPattern": "During festival in {province}, masks began answering to names their owners had never possessed.", "primarySymbols": ["festival", "mask", "madness"], "secondarySymbols": ["identity", "deception", "foolishness"], "preferredTraits": ["Festival", "Mask"], "clueForms": ["festival_program", "mask_fragment", "guild_token", "painted_ribbon"], "lieutenantBias": ["masked_clerk", "feast_bailiff"], "resolutionThemes": {"resolved": "The names crawl back to their proper mouths.", "partial": "Some citizens remember who they were, and resent it.", "failed": "The festival elects a stranger wearing your name."}}, {"key": "dream_plague", "titlePattern": "The Dream Plague of {province}", "introPattern": "Dreams in {province} have begun passing from cottage to castle like a fever with legal standing.", "primarySymbols": ["dreams", "sleep", "madness"], "secondarySymbols": ["hidden", "bell", "truth"], "preferredTraits": ["Bell", "Mirror"], "clueForms": ["dream_scroll", "pillow_token", "midnight_writ", "physicians_note"], "lieutenantBias": ["bell_eater"], "resolutionThemes": {"resolved": "The dream fever breaks before dawn.", "partial": "The dreamers wake, but keep one shared memory.", "failed": "The province learns to sleep in chorus."}}, {"key": "charter_of_thorns", "titlePattern": "The Charter of Thorns", "introPattern": "A royal charter in {province} has sprouted thorns and begun rewriting the privileges of the dead.", "primarySymbols": ["authority", "growth", "hidden"], "secondarySymbols": ["law", "tradition", "punishment"], "preferredTraits": ["Ledger", "Lantern"], "clueForms": ["charter_scroll", "wax_seal", "thorn_crown", "court_roll"], "lieutenantBias": ["mirror_advocate"], "resolutionThemes": {"resolved": "The charter is pruned back to law.", "partial": "The thorns wither, though roots remain in the margins.", "failed": "The dead inherit the court."}}, {"key": "abbey_locked_inside", "titlePattern": "The Abbey Locked from Inside", "introPattern": "An abbey in {province} is locked from within, though its monks are all outside denying entry.", "primarySymbols": ["hidden", "false_holiness", "silence"], "secondarySymbols": ["authority", "sleep", "truth"], "preferredTraits": ["Lantern", "Bell"], "clueForms": ["abbey_key", "vesper_candle", "pilgrim_badge", "oath_tablet"], "lieutenantBias": ["bell_eater", "mirror_advocate"], "resolutionThemes": {"resolved": "The door remembers which side is inside.", "partial": "The abbey opens, but one room stays hidden.", "failed": "The lock is promoted to abbot."}}, {"key": "witchlight_tithe", "titlePattern": "The Witchlight Tithe", "introPattern": "A tithe in {province} is being collected in moonlit coins no mint admits striking.", "primarySymbols": ["wealth", "hidden", "illusion"], "secondarySymbols": ["debt", "witchlight", "false_holiness"], "preferredTraits": ["Mirror", "Ledger"], "clueForms": ["coin_purse", "tithe_box", "moonlit_coin", "abbey_key"], "lieutenantBias": ["auditor_of_hunger", "mirror_advocate"], "resolutionThemes": {"resolved": "The moonlit coins turn back into honest metal.", "partial": "The tithe stops glowing, but not collecting.", "failed": "The moon opens an account."}}, {"key": "mill_black_bread", "titlePattern": "The Mill of Black Bread", "introPattern": "A village mill in {province} grinds grain into black bread that makes eaters confess other people’s sins.", "primarySymbols": ["gluttony", "guilt", "truth"], "secondarySymbols": ["waste", "false_holiness", "madness"], "preferredTraits": ["Festival", "Lantern"], "clueForms": ["millstone_chip", "black_loaf", "bakers_mark", "confession_scrap"], "lieutenantBias": ["feast_bailiff", "bell_eater"], "resolutionThemes": {"resolved": "The millstone forgets the taste of confession.", "partial": "The bread lightens, but still whispers.", "failed": "The village eats testimony for supper."}}, {"key": "knight_confessed_twice", "titlePattern": "The Knight Who Confessed Twice", "introPattern": "A knight in {province} has confessed twice: once to murder, once to being the victim.", "primarySymbols": ["truth", "paradox", "punishment"], "secondarySymbols": ["honor", "blood", "illusion"], "preferredTraits": ["Mirror", "Lantern"], "clueForms": ["broken_lance", "bloodied_gauntlet", "oath_tablet", "court_roll"], "lieutenantBias": ["mirror_advocate"], "resolutionThemes": {"resolved": "The knight is separated from his impossible confession.", "partial": "One confession survives; the other retreats.", "failed": "Both confessions are knighted."}}, {"key": "harvest_of_seals", "titlePattern": "The Harvest of Seals", "introPattern": "The fields of {province} have grown wax seals instead of barley, each stamped by a different office.", "primarySymbols": ["authority", "wealth", "absurdity"], "secondarySymbols": ["trade", "hidden", "law"], "preferredTraits": ["Ledger", "Festival"], "clueForms": ["wax_seal", "field_writ", "reeves_tally", "grain_receipt"], "lieutenantBias": ["masked_clerk", "auditor_of_hunger"], "resolutionThemes": {"resolved": "The seals are harvested into evidence.", "partial": "The fields return to grain, mostly.", "failed": "The harvest files an appeal."}}, {"key": "honest_thieves", "titlePattern": "The Plague of Honest Thieves", "introPattern": "Thieves in {province} have begun returning stolen goods with notarized apologies and greater thefts attached.", "primarySymbols": ["trade", "truth", "deception"], "secondarySymbols": ["wealth", "mask", "choice"], "preferredTraits": ["Mask", "Ledger"], "clueForms": ["guild_token", "returned_purse", "notary_ribbon", "market_tally"], "lieutenantBias": ["masked_clerk"], "resolutionThemes": {"resolved": "The thieves resume normal dishonesty.", "partial": "The apologies stop, but the thefts remain polite.", "failed": "The province legalizes burglary with receipts."}}, {"key": "saints_tax", "titlePattern": "The Saint’s Tax", "introPattern": "A saint in {province} has begun levying taxes through dreams, despite being both dead and disputed.", "primarySymbols": ["false_holiness", "debt", "dreams"], "secondarySymbols": ["authority", "hidden", "doctrine"], "preferredTraits": ["Bell", "Ledger"], "clueForms": ["pilgrim_badge", "tithe_box", "dream_scroll", "relic_case"], "lieutenantBias": ["auditor_of_hunger", "bell_eater"], "resolutionThemes": {"resolved": "The saint is removed from the tax rolls.", "partial": "The tax weakens into donations.", "failed": "The saint forecloses on sleep."}}, {"key": "moat_oaths", "titlePattern": "The Moat Full of Oaths", "introPattern": "A castle moat in {province} is filled not with water but with promises nobody admits making.", "primarySymbols": ["bond", "authority", "hidden"], "secondarySymbols": ["truth", "betrayal", "law"], "preferredTraits": ["Lantern", "Mirror"], "clueForms": ["oath_tablet", "castle_map", "broken_ring", "sealed_edict"], "lieutenantBias": ["mirror_advocate"], "resolutionThemes": {"resolved": "The moat drains into testimony.", "partial": "Some oaths float away; others circle.", "failed": "The castle learns to swear."}}, {"key": "gallows_shadow", "titlePattern": "The Gallows for a Shadow", "introPattern": "A gallows in {province} has been built for a shadow that appears only at noon.", "primarySymbols": ["punishment", "hidden", "illusion"], "secondarySymbols": ["authority", "truth", "ruin"], "preferredTraits": ["Lantern", "Mirror"], "clueForms": ["gallows_nail", "shadow_rope", "court_roll", "sun_dial"], "lieutenantBias": ["mirror_advocate", "masked_clerk"], "resolutionThemes": {"resolved": "The shadow is released for lack of body.", "partial": "The rope slackens, but the noon remains accused.", "failed": "The shadow hangs and everyone applauds."}}, {"key": "blood_pardon", "titlePattern": "The Pardon Written in Blood", "introPattern": "A pardon in {province} has been written in blood for a person not yet accused.", "primarySymbols": ["blood", "absolution", "authority"], "secondarySymbols": ["punishment", "truth", "hidden"], "preferredTraits": ["Ledger", "Lantern"], "clueForms": ["blood_pardon", "court_roll", "iron_key", "confession_scrap"], "lieutenantBias": ["mirror_advocate"], "resolutionThemes": {"resolved": "The pardon is washed back into law.", "partial": "The blood dries, but the name remains wet.", "failed": "The pardon accuses everyone else."}}, {"key": "forged_relic_market", "titlePattern": "The Market of Forged Relics", "introPattern": "A market in {province} is selling relics from saints who are still alive and very annoyed.", "primarySymbols": ["trade", "false_holiness", "deception"], "secondarySymbols": ["wealth", "mask", "authority"], "preferredTraits": ["Mask", "Festival"], "clueForms": ["relic_case", "market_tally", "pilgrim_badge", "guild_token"], "lieutenantBias": ["masked_clerk", "auditor_of_hunger"], "resolutionThemes": {"resolved": "The relics are returned to their living owners.", "partial": "The market closes one stall at a time.", "failed": "The saints are declared counterfeit."}}, {"key": "empty_helm", "titlePattern": "The Riddle of the Empty Helm", "introPattern": "An empty helm in {province} has begun winning jousts and issuing challenges in court Latin.", "primarySymbols": ["honor", "absurdity", "authority"], "secondarySymbols": ["illusion", "foolishness", "truth"], "preferredTraits": ["Festival", "Mirror"], "clueForms": ["empty_helm", "broken_lance", "tournament_list", "heralds_note"], "lieutenantBias": ["mirror_advocate", "feast_bailiff"], "resolutionThemes": {"resolved": "The helm is disqualified for lacking a head.", "partial": "The jousts stop, but the challenges continue.", "failed": "The empty helm is granted lands."}}, {"key": "sermon_answered_back", "titlePattern": "The Sermon That Answered Back", "introPattern": "A sermon in {province} has begun debating its preacher and winning over the congregation.", "primarySymbols": ["doctrine", "truth", "false_holiness"], "secondarySymbols": ["voice", "authority", "madness"], "preferredTraits": ["Bell", "Lantern"], "clueForms": ["sermon_leaf", "vesper_candle", "abbey_key", "choir_book"], "lieutenantBias": ["bell_eater", "mirror_advocate"], "resolutionThemes": {"resolved": "The sermon is reduced to ordinary hypocrisy.", "partial": "The preacher regains the pulpit, though not the argument.", "failed": "The sermon excommunicates its author."}}, {"key": "duchy_one_room", "titlePattern": "The Duchy of One Room", "introPattern": "A single room in {province} has declared itself a duchy and begun issuing tolls on the doorway.", "primarySymbols": ["authority", "absurdity", "wealth"], "secondarySymbols": ["greed", "law", "mask"], "preferredTraits": ["Festival", "Ledger"], "clueForms": ["door_tax", "miniature_charter", "wax_seal", "coin_purse"], "lieutenantBias": ["masked_clerk", "auditor_of_hunger"], "resolutionThemes": {"resolved": "The room is demoted to architecture.", "partial": "The toll is abolished, except on Tuesdays.", "failed": "The doorway demands tribute."}}],
  suspectTemplates: [{"key": "hollow_merchant", "name": "The Hollow Merchant", "role": "merchant", "symbols": ["debt", "trade", "illusion", "greed"], "provinceBias": ["prov_mammonia", "prov_lusoria", "prov_veneria"], "templateBias": ["false_ledger", "debt_paid_itself", "forged_relic_market"], "lieutenantAffinity": ["auditor_of_hunger", "masked_clerk"], "personalityLine": "He sells certainty by the ounce and never keeps any for himself."}, {"key": "baroness_receipts", "name": "The Baroness of Receipts", "role": "accountant", "symbols": ["wealth", "authority", "debt", "hidden"], "provinceBias": ["prov_mammonia", "prov_lusoria"], "templateBias": ["false_ledger", "debt_paid_itself", "witchlight_tithe"], "lieutenantAffinity": ["auditor_of_hunger"], "personalityLine": "She answers every accusation with an invoice."}, {"key": "corrupt_archon", "name": "The Corrupt Archon", "role": "archon", "symbols": ["authority", "greed", "punishment", "law"], "provinceBias": ["prov_terra_sancta", "prov_mammonia", "prov_tartaria"], "templateBias": ["trial_before_crime", "charter_of_thorns", "relic_without_saint"], "lieutenantAffinity": ["mirror_advocate"], "personalityLine": "His decrees arrive early and apologize late."}, {"key": "clerk_errata", "name": "The Clerk of Errata", "role": "clerk", "symbols": ["hidden", "authority", "paradox", "deception"], "provinceBias": ["prov_stultorum", "prov_terra_sancta", "prov_mammonia"], "templateBias": ["false_ledger", "convenient_suspect", "harvest_of_seals"], "lieutenantAffinity": ["masked_clerk", "mirror_advocate"], "personalityLine": "He corrects records before they are written."}, {"key": "blind_witness", "name": "The Blind Witness", "role": "witness", "symbols": ["dreams", "truth", "madness", "hidden"], "provinceBias": ["prov_pigritarium", "prov_bibonia", "prov_stultorum"], "templateBias": ["dream_plague", "silent_bell", "knight_confessed_twice"], "lieutenantAffinity": ["bell_eater"], "personalityLine": "They saw nothing and remember everything."}, {"key": "sister_wax", "name": "Sister Wax", "role": "nun", "symbols": ["false_holiness", "silence", "hidden", "bell"], "provinceBias": ["prov_terra_sancta", "prov_pigritarium"], "templateBias": ["silent_bell", "abbey_locked_inside", "sermon_answered_back"], "lieutenantAffinity": ["bell_eater"], "personalityLine": "She seals confessions in candle wax and refuses to say whose."}, {"key": "magistrate_glass", "name": "Magistrate Glass", "role": "magistrate", "symbols": ["truth", "illusion", "authority", "mirror"], "provinceBias": ["prov_terra_sancta", "prov_tartaria", "prov_stultorum"], "templateBias": ["mirror_deposition", "trial_before_crime", "gallows_shadow"], "lieutenantAffinity": ["mirror_advocate"], "personalityLine": "He never looks at defendants directly, only their reflections."}, {"key": "dream_notary", "name": "The Dream Notary", "role": "notary", "symbols": ["dreams", "authority", "sleep", "truth"], "provinceBias": ["prov_pigritarium", "prov_bibonia"], "templateBias": ["dream_plague", "saints_tax", "silent_bell"], "lieutenantAffinity": ["bell_eater"], "personalityLine": "He certifies statements made while asleep."}, {"key": "maskwright", "name": "The Maskwright", "role": "maskwright", "symbols": ["mask", "truth", "deception", "identity"], "provinceBias": ["prov_veneria", "prov_stultorum", "prov_schlaraffenland"], "templateBias": ["festival_missing_names", "convenient_suspect", "forged_relic_market"], "lieutenantAffinity": ["masked_clerk"], "personalityLine": "She claims masks reveal truth by hiding the face."}, {"key": "duchess_applause", "name": "The Duchess of Applause", "role": "duchess", "symbols": ["festival", "desire", "authority", "vanity"], "provinceBias": ["prov_veneria", "prov_schlaraffenland", "prov_stultorum"], "templateBias": ["festival_missing_names", "feast_witness", "duchy_one_room"], "lieutenantAffinity": ["feast_bailiff", "masked_clerk"], "personalityLine": "Her alibi requires everyone to have been admiring her."}, {"key": "sulfur_advocate", "name": "The Sulfur Advocate", "role": "advocate", "symbols": ["damnation", "punishment", "authority", "ruin"], "provinceBias": ["prov_tartaria"], "templateBias": ["trial_before_crime", "gallows_shadow", "blood_pardon"], "lieutenantAffinity": ["mirror_advocate"], "personalityLine": "He argues that damnation is mostly procedural."}, {"key": "coin_monk", "name": "The Coin-Monk", "role": "monk", "symbols": ["false_holiness", "wealth", "hypocrisy", "doctrine"], "provinceBias": ["prov_terra_sancta", "prov_mammonia"], "templateBias": ["relic_without_saint", "witchlight_tithe", "saints_tax"], "lieutenantAffinity": ["auditor_of_hunger"], "personalityLine": "He preaches poverty in gold-threaded gloves."}],
  clueForms: {"ledger_page": "ledger page", "debt_marker": "debt marker", "wax_seal": "wax seal", "court_roll": "court roll", "bell_clapper": "bell clapper", "chapel_rope": "chapel rope", "vesper_candle": "vesper candle", "dream_scroll": "dream scroll", "mirror_shard": "mirror shard", "oath_tablet": "oath tablet", "silver_pin": "silver pin", "mask_fragment": "mask fragment", "signed_confession": "signed confession", "guild_token": "guild token", "wanted_broadside": "wanted broadside", "relic_case": "relic case", "pilgrim_badge": "pilgrim badge", "abbey_key": "abbey key", "banquet_menu": "banquet menu", "grease_oath": "grease-stained oath", "silver_spoon": "silver spoon", "butchers_tally": "butcher’s tally", "coin_purse": "coin purse", "gallows_nail": "gallows nail", "sealed_edict": "sealed edict", "charter_scroll": "charter scroll", "thorn_crown": "thorn crown", "tithe_box": "tithe box", "moonlit_coin": "moonlit coin", "millstone_chip": "millstone chip", "black_loaf": "black loaf", "confession_scrap": "confession scrap", "broken_lance": "broken lance", "bloodied_gauntlet": "bloodied gauntlet", "grain_receipt": "grain receipt", "returned_purse": "returned purse", "notary_ribbon": "notary ribbon", "market_tally": "market tally", "castle_map": "castle map", "broken_ring": "broken ring", "shadow_rope": "shadow rope", "sun_dial": "sun dial", "blood_pardon": "blood pardon", "field_writ": "field writ", "reeves_tally": "reeve’s tally", "sermon_leaf": "sermon leaf", "choir_book": "choir book", "door_tax": "door tax writ", "miniature_charter": "miniature charter", "empty_helm": "empty helm", "tournament_list": "tournament list", "heralds_note": "herald’s note", "pillow_token": "pillow token", "midnight_writ": "midnight writ", "physicians_note": "physician’s note", "bakers_mark": "baker’s mark", "iron_key": "iron key", "painted_ribbon": "painted ribbon"},
  clueConditions: ["sealed with black wax", "burned at the edges", "written in two inks", "stitched with red thread", "folded around a clipped coin", "blessed in the wrong saint’s name", "stained with winter wine", "smelling faintly of grave-soil", "pierced by a tiny iron nail", "rubbed smooth where the name should be", "wrapped in altar cloth", "dusted with mill flour"],
  clueAnomalies: ["the date has not happened yet", "the witness remembers signing it in a dream", "the ink brightens under lantern light", "the seal belongs to a dead office", "it names a village that is not on any map", "the signature belongs to someone sworn illiterate", "it rings softly when read aloud", "its reflection omits the suspect", "the amount owed changes when counted", "it refers to a trial before the crime", "it pardons a person not yet accused", "the parchment has a pulse"],
  linkStyles: ["points toward", "was planted upon", "contradicts the alibi of", "bears the household mark of", "was witnessed by", "was purchased for", "was hidden by", "was copied in the hand of"],

  registerNodes() {
    this.caseTemplates.forEach(t => {
      const id = `case_template_${t.key}`;
      if (!SCHEngine.getNode(id)) SCHEngine.registerNode({ id, type:'case_template', key:t.key, name:t.titlePattern, symbols:Utils.unique([...(t.primarySymbols||[]), ...(t.secondarySymbols||[]), 'case_template']), preferredTraits:t.preferredTraits || [], lieutenantBias:t.lieutenantBias || [] });
    });
    this.suspectTemplates.forEach(s => {
      const id = `suspect_template_${s.key}`;
      if (!SCHEngine.getNode(id)) SCHEngine.registerNode({ id, type:'suspect_template', key:s.key, name:s.name, role:s.role, symbols:Utils.unique([...(s.symbols||[]), 'suspect_template']), provinceBias:s.provinceBias||[], templateBias:s.templateBias||[], lieutenantAffinity:s.lieutenantAffinity||[] });
    });
    Object.entries(this.clueForms).forEach(([key, name]) => {
      const id = `clue_form_${key}`;
      if (!SCHEngine.getNode(id)) SCHEngine.registerNode({ id, type:'clue_form', key, name, symbols:['clue_form','material_evidence'] });
    });
  },
  getCaseTemplate(key) { return this.caseTemplates.find(t => t.key === key) || this.caseTemplates[0]; },
  selectCaseTemplate(provNode, hotSymbols = [], rumorSymbols = [], residueSymbols = []) {
    const activeLieutenants = (typeof LieutenantSystem !== 'undefined') ? LieutenantSystem.activeInProvince(provNode.id).map(lt => lt.key) : [];
    return Utils.weightedPick(this.caseTemplates, t => {
      let w = 1;
      w += Utils.overlap(t.primarySymbols || [], provNode.symbols || []).length * 3;
      w += Utils.overlap(t.secondarySymbols || [], provNode.symbols || []).length * 2;
      w += Utils.overlap([...(t.primarySymbols || []), ...(t.secondarySymbols || [])], hotSymbols).length * 2;
      w += Utils.overlap([...(t.primarySymbols || []), ...(t.secondarySymbols || [])], rumorSymbols).length * 2;
      w += Utils.overlap([...(t.primarySymbols || []), ...(t.secondarySymbols || [])], residueSymbols).length * 2;
      w += Utils.overlap(t.lieutenantBias || [], activeLieutenants).length * 3;
      return w + Math.random();
    });
  },
  buildCaseTitle(template, provNode, requiredSymbols = []) {
    return (template.titlePattern || 'The Anomaly of {province}').replace('{province}', provNode.name).replace('{symbol}', Utils.pickRandom(requiredSymbols) || provNode.symbols[0] || 'mystery');
  },
  buildCaseIntro(template, provNode) {
    return (template.introPattern || 'A semantic anomaly rises in {province}.').replace('{province}', provNode.name);
  },
  buildRequiredSymbols(provNode, template, hotSymbols = [], residueSymbols = [], rumorSymbols = []) {
    const pool = Utils.unique([...(template.primarySymbols || []), provNode.symbols[0], provNode.symbols[1], ...(template.secondarySymbols || []), ...hotSymbols, ...residueSymbols, ...rumorSymbols]).filter(Boolean).filter(s => !['province','city','settlement'].includes(s));
    return pool.slice(0, 4);
  },
  selectSuspects(provNode, template, requiredSymbols = [], residueSymbols = []) {
    const selected = [];
    const pool = this.suspectTemplates.slice();
    const count = MODE.name === 'Casual' ? 3 : 4;
    while (selected.length < count && pool.length > 0) {
      const pick = Utils.weightedPick(pool, s => {
        let w = 1;
        w += Utils.overlap(s.symbols || [], requiredSymbols).length * 4;
        w += Utils.overlap(s.symbols || [], provNode.symbols || []).length * 2;
        w += (s.provinceBias || []).includes(provNode.id) ? 3 : 0;
        w += (s.templateBias || []).includes(template.key) ? 4 : 0;
        w += Utils.overlap(s.symbols || [], residueSymbols).length * 2;
        w += Utils.overlap(s.lieutenantAffinity || [], template.lieutenantBias || []).length * 2;
        return w + Math.random();
      });
      selected.push(pick);
      pool.splice(pool.indexOf(pick), 1);
    }
    return selected;
  },
  buildMaterialClue(clue, cityNode, activeCase) {
    const template = this.getCaseTemplate(activeCase.templateKey);
    const forms = (template.clueForms && template.clueForms.length) ? template.clueForms : Object.keys(this.clueForms);
    const stageRoles = (typeof TruthArcSystem !== 'undefined') ? TruthArcSystem.roleBias(activeCase) : [];
    const formKey = Utils.weightedPick(forms, f => { let w=1; if(stageRoles.includes('motive')&&/ledger|debt|coin|tithe|receipt|tax/.test(f))w+=3; if(stageRoles.includes('identity')&&/mask|name|ribbon|oath|pin/.test(f))w+=3; if(stageRoles.includes('world_context')&&/dream|bell|candle|sermon|pillow/.test(f))w+=3; if(stageRoles.includes('coverup')&&/seal|edict|court|charter|key/.test(f))w+=3; return w+Math.random(); }) || Utils.pickRandom(Object.keys(this.clueForms));
    const condition = Utils.pickRandom(this.clueConditions);
    const anomaly = Utils.pickRandom(this.clueAnomalies);
    const suspectIds = activeCase.suspectIds || [];
    const suspectScores = suspectIds.map(id => { const s=SCHEngine.getNode(id); const profile=activeCase.suspectProfiles?.[id]; let score=s?Utils.overlap(s.symbols||[],clue.symbols||[]).length+Math.random():0; if(profile?.trueRelation==='culprit')score+=.8; if(profile?.trueRelation==='framed'&&(activeCase.caseGrammar?.falseSurface?.id==='obvious_scapegoat'||cityNode.cityTrait==='Mask'))score+=1.1; if(stageRoles.includes('coverup')&&profile?.trueRelation==='coverup_actor')score+=1; return {id,s,score}; }).filter(x=>x.s).sort((a,b)=>b.score-a.score);
    const linked = suspectScores.length ? suspectScores[0].s : null;
    const linkStyle = Utils.pickRandom(this.linkStyles);
    const falseConvenience = cityNode.cityTrait === 'Mask' || (template.key === 'convenient_suspect') || (activeCase.caseGrammar?.falseSurface?.id === 'obvious_scapegoat') || (SCHEngine.state.kingpin.pending.framedSuspectId && linked && linked.id === SCHEngine.state.kingpin.pending.framedSuspectId);
    const evidenceDNA = (typeof EvidenceDNASystem !== 'undefined') ? EvidenceDNASystem.build({ activeCase, cityNode, clue, template, linkedSuspect:linked, falseConvenience, formKey, condition, anomaly }) : null;
    if (evidenceDNA) EvidenceDNASystem.applyToClue(clue, evidenceDNA);
    const evidenceRole = evidenceDNA?.role || ((typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.pickEvidenceRole(activeCase, clue, linked, template) : 'motive');
    const suspectEffect = evidenceDNA?.suspectEffect || ((typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.pickSuspectEffect(activeCase, clue, linked, evidenceRole, falseConvenience) : null);
    const tags = (typeof InvestigationCoherence !== 'undefined') ? Utils.unique([...(InvestigationCoherence.tagsForClue(clue, evidenceRole, suspectEffect, falseConvenience) || []), ...((evidenceDNA && evidenceDNA.tags) || [])]) : (evidenceDNA?.tags || []);
    const secondaryEvidenceRole = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.suggestKeystoneRole(activeCase, clue, evidenceRole) : null;
    const secondaryEvidenceRoles = secondaryEvidenceRole ? [secondaryEvidenceRole] : [];
    if (secondaryEvidenceRole) { clue.secondaryEvidenceRoles = secondaryEvidenceRoles; tags.push('Keystone'); }
    return { formKey, formName: this.clueForms[formKey] || 'evidence', condition, anomaly, linkedSuspectId: linked ? linked.id : null, linkedSuspectName: linked ? linked.name : null, linkStyle, falseConvenience, templateKey: template.key, evidenceRole, secondaryEvidenceRole, secondaryEvidenceRoles, suspectEffect, tags: Utils.unique(tags), evidenceDNA };
  },
  describeMaterialClue(clue, cityNode, activeCase) {
    const m = clue.material;
    if (!m) return null;
    const dna = clue.evidenceDNA || m.evidenceDNA || {};
    const article = /^[aeiou]/i.test(m.formName || '') ? 'an' : 'a';
    const conditionPhrase = m.condition ? `, ${m.condition}` : '';
    let text = `In ${cityNode.name}, you find ${article} ${m.formName}${conditionPhrase}. ${m.anomaly.charAt(0).toUpperCase()}${m.anomaly.slice(1)}.`;
    if (m.linkedSuspectName) { text += ` It ${m.linkStyle} ${m.linkedSuspectName}.`; if (m.falseConvenience || dna.contradictionVector === 'too_clean') text += ' The implication feels almost too convenient.'; }
    if (dna.premise || dna.distortion) text += ` Evidence DNA: ${dna.premise || 'unknown'} / ${dna.distortion || 'local_noise'} / ${dna.hiddenVector || 'hidden_vector_unknown'}.`;
    if (m.evidenceRole && typeof InvestigationCoherence !== 'undefined') text += ` Evidence role: ${InvestigationCoherence.roleLabels[m.evidenceRole] || m.evidenceRole}.`;
    if (m.secondaryEvidenceRole && typeof InvestigationCoherence !== 'undefined') text += ` Keystone role: ${InvestigationCoherence.roleLabels[m.secondaryEvidenceRole] || m.secondaryEvidenceRole}.`;
    if (m.suspectEffect) { const rel = m.suspectEffect.relation; const suspectName = m.suspectEffect.suspectName; const relationText = { supports: `It supports a theory against ${suspectName}.`, contradicts: `It contradicts ${suspectName}'s position.`, frames: `It may be framing ${suspectName}.`, clears: `It weakens the case against ${suspectName}.`, connects: `It connects ${suspectName} to the case architecture.` }[rel] || `It concerns ${suspectName}.`; text += ` ${relationText}`; }
    if (dna.cityMeaningNotes && dna.cityMeaningNotes.length) text += ` City meaning: ${dna.cityMeaningNotes.join(' ')}`;
    if (m.tags && m.tags.length) text += ` Tags: ${m.tags.join(' | ')}.`;
    return text;
  }
};


// ============================================================================
// INVESTIGATION COHERENCE (I1): CASE QUESTIONS / EVIDENCE ROLES / THEORY BOARD
// ============================================================================
const InvestigationCoherence = {
  evidenceRoles: ['motive', 'method', 'opportunity', 'identity', 'coverup', 'alibi_break', 'false_lead', 'lieutenant_trace', 'world_context'],
  roleLabels: { motive: 'Motive', method: 'Method', opportunity: 'Opportunity', identity: 'Identity', coverup: 'Cover-Up', alibi_break: 'Alibi Break', false_lead: 'Suspicious Lead', lieutenant_trace: 'Lieutenant Trace', world_context: 'World Context' },
  defaultRolesForTemplate(templateKey) {
    const map = { false_ledger:['motive','coverup','identity'], silent_bell:['method','world_context','lieutenant_trace'], mirror_deposition:['identity','alibi_break','coverup'], convenient_suspect:['false_lead','alibi_break','identity'], relic_without_saint:['motive','coverup','world_context'], feast_ate_witness:['method','identity','world_context'], trial_before_crime:['opportunity','coverup','alibi_break'], festival_missing_names:['identity','false_lead','world_context'], dream_plague:['world_context','lieutenant_trace','identity'], smoke_contract:['method','coverup','motive'] };
    return Utils.clone(map[templateKey] || ['motive','method','identity']);
  },
  centralQuestionFor(template, provNode) {
    const key = template?.key || 'anomaly';
    const province = provNode?.name || 'the province';
    const map = {
      false_ledger: `Who benefits from a debt that was written before it was owed in ${province}?`,
      silent_bell: `Why does the silence in ${province} testify more clearly than the witnesses?`,
      mirror_deposition: `Whose truth changes shape when ${province} looks at it directly?`,
      convenient_suspect: `Who is being made guilty too neatly in ${province}?`,
      relic_without_saint: `Who profits from holiness that cannot survive inspection in ${province}?`,
      feast_ate_witness: `Who consumed the witness, and why does the appetite look official?`,
      trial_before_crime: `Who wrote the verdict before the crime had permission to exist?`,
      festival_missing_names: `Whose identity was stolen beneath the festival noise in ${province}?`,
      dream_plague: `Who owns the dream that everyone in ${province} keeps repeating?`,
      smoke_contract: `Who hid the bargain in smoke, and who is still breathing it in?`
    };
    return map[key] || `What pattern is trying to become law in ${province}?`;
  },
  makeTheoryBoard(requiredRoles = []) { const board = { requiredRoles: requiredRoles.slice(), roles: {}, suspectLinks: {}, falseLeads: [], npcInterpretations: [], readinessNotes: [] }; requiredRoles.forEach(role => { board.roles[role] = []; }); return board; },
  missingRequiredRoles(caseNode) {
    const required = caseNode?.requiredEvidenceRoles || [];
    const roles = caseNode?.theoryBoard?.roles || {};
    return required.filter(role => !(roles[role] || []).length);
  },
  hasMeaningfulSuspectLink(caseNode) {
    let linked = false;
    Object.values(caseNode?.theoryBoard?.suspectLinks || {}).forEach(link => {
      if ((link.supports || []).length || (link.connects || []).length || (link.contradicts || []).length) linked = true;
    });
    return linked;
  },
  shouldForceMissingRole(caseNode) {
    const clueCount = (caseNode?.clues || []).length;
    const missing = this.missingRequiredRoles(caseNode);
    if (!missing.length) return false;
    const base = MODE.name === 'Casual' ? 0.72 : MODE.name === 'Standard' ? 0.62 : 0.50;
    const pressure = clueCount >= 4 ? 0.28 : clueCount >= 2 ? 0.14 : 0;
    return clueCount >= 2 && Math.random() < Math.min(0.95, base + pressure);
  },
  preferredMissingRoleForNextClue(caseNode, currentRole = null) {
    const missing = this.missingRequiredRoles(caseNode);
    if (!missing.length) return null;
    if (missing.includes(currentRole) && (caseNode?.clues || []).length < 4) return currentRole;
    if (this.shouldForceMissingRole(caseNode)) return Utils.pickRandom(missing);
    return currentRole || Utils.pickRandom(missing);
  },
  shouldForceSuspectLink(caseNode) {
    const clueCount = (caseNode?.clues || []).length;
    return clueCount >= 3 && !this.hasMeaningfulSuspectLink(caseNode);
  },
  suggestKeystoneRole(caseNode, clue, primaryRole = null) {
    if (!caseNode || !clue) return null;
    if (clue.secondaryEvidenceRoles && clue.secondaryEvidenceRoles.length) return clue.secondaryEvidenceRoles[0];
    const missing = this.missingRequiredRoles(caseNode).filter(role => role !== primaryRole);
    if (!missing.length) return null;
    const clueCount = (caseNode.clues || []).length;
    const reliability = clue.reliability || 0;
    const similarity = clue.clueCaseSimilarity || 0;
    const strongEnough = reliability >= 0.70 && similarity >= 0.33;
    const lateEnough = clueCount >= (MODE.name === 'Casual' ? 1 : MODE.name === 'Standard' ? 2 : 3);
    const chance = Math.min(0.90, (MODE.name === 'Casual' ? 0.70 : MODE.name === 'Standard' ? 0.58 : 0.45) + (clueCount >= 4 ? 0.20 : 0));
    if (lateEnough && strongEnough && Math.random() < chance) return Utils.pickRandom(missing);
    return null;
  },
  effectiveCoverageRequirement(caseNode, coverage = 0) {
    let required = MODE.minCoverage;
    const boardComplete = this.missingRequiredRoles(caseNode).length === 0;
    const hasLink = this.hasMeaningfulSuspectLink(caseNode);
    const clueCount = (caseNode?.clues || []).length;
    if (boardComplete && hasLink) required -= (MODE.name === 'Deep' ? 0.12 : 0.15);
    if (clueCount >= 5) required -= 0.08;
    const floor = MODE.name === 'Casual' ? 0.28 : MODE.name === 'Standard' ? 0.38 : 0.43;
    return Utils.round2(Math.max(floor, required));
  },
  caseRoutingGuidance(requiredRoles = []) {
    const map = { motive:'Motive → Ledger / Festival', method:'Method → Lantern / Festival', opportunity:'Opportunity → Lantern / Ledger', identity:'Identity → Mask / Mirror', coverup:'Cover-Up → Ledger / Lantern', alibi_break:'Alibi Break → Mirror / Lantern', false_lead:'Suspicious Lead → Mask / Festival', lieutenant_trace:'Lieutenant Trace → Bell / Lantern', world_context:'World Context → Bell / Festival' };
    return (requiredRoles || []).map(r => map[r]).filter(Boolean).join('; ');
  },
  pickEvidenceRole(activeCase, clue, linkedSuspect, template) {
    const required = activeCase.requiredEvidenceRoles || this.defaultRolesForTemplate(activeCase.templateKey || template?.key);
    const boardRoles = activeCase.theoryBoard?.roles || {};
    const missing = required.filter(role => !(boardRoles[role] || []).length);
    if (missing.length) return Utils.pickRandom(missing);
    const symbols = Utils.unique([...(clue.symbols || []), ...(linkedSuspect?.symbols || [])]);
    if (symbols.includes('debt') || symbols.includes('greed') || symbols.includes('wealth') || symbols.includes('bargain')) return 'motive';
    if (symbols.includes('mask') || symbols.includes('identity') || symbols.includes('deception') || symbols.includes('secrets')) return 'identity';
    if (symbols.includes('authority') || symbols.includes('law') || symbols.includes('hidden') || symbols.includes('wax')) return 'coverup';
    if (symbols.includes('dreams') || symbols.includes('sleep') || symbols.includes('bell') || symbols.includes('silence')) return 'world_context';
    if (symbols.includes('punishment') || symbols.includes('fate') || symbols.includes('calling')) return 'opportunity';
    if (symbols.includes('ruin') || symbols.includes('fire') || symbols.includes('material')) return 'method';
    return Utils.pickRandom(required) || 'motive';
  },
  pickSuspectEffect(activeCase, clue, linkedSuspect, role, falseConvenience) {
    if (!linkedSuspect) return null;
    let relation = 'connects';
    if (falseConvenience || role === 'false_lead') relation = 'frames';
    else if (role === 'alibi_break') relation = 'contradicts';
    else if (['identity','motive','method','opportunity'].includes(role)) relation = 'supports';
    else if (role === 'coverup') relation = 'connects';
    return { suspectId: linkedSuspect.id, suspectName: linkedSuspect.name, relation };
  },
  tagsForClue(clue, role, suspectEffect, falseConvenience) {
    const tags = ['Material', this.roleLabels[role] || role];
    if (suspectEffect) tags.push('Suspect-Linked');
    if (falseConvenience || suspectEffect?.relation === 'frames') tags.push('Suspicious');
    if ((clue.contradiction || 0) > 0.20) tags.push('Contradictory');
    if ((clue.reliability || 0) >= 0.70) tags.push('Strong');
    if ((clue.symbols || []).some(s => ['dreams','sleep','bell','silence'].includes(s))) tags.push('Dream-Touched');
    return Utils.unique(tags);
  },
  fileClue(caseNode, clue) {
    if (!caseNode || !clue) return;
    caseNode.theoryBoard = caseNode.theoryBoard || this.makeTheoryBoard(caseNode.requiredEvidenceRoles || []);
    const board = caseNode.theoryBoard;
    board.roles = board.roles || {}; board.suspectLinks = board.suspectLinks || {}; board.falseLeads = Array.isArray(board.falseLeads) ? board.falseLeads : [];
    const material = clue.material || {};
    const primaryRole = clue.evidenceRole || material.evidenceRole || clue.evidenceDNA?.role || material.evidenceDNA?.role || 'world_context';
    const secondaryRoles = Utils.unique([...(clue.secondaryEvidenceRoles || []), ...(material.secondaryEvidenceRoles || []), material.secondaryEvidenceRole].filter(Boolean));
    const rolesToFile = Utils.unique([primaryRole, ...secondaryRoles]);
    rolesToFile.forEach(role => { board.roles[role] = board.roles[role] || []; if (!board.roles[role].includes(clue.id)) board.roles[role].push(clue.id); });
    const effect = clue.suspectEffect || material.suspectEffect || clue.evidenceDNA?.suspectEffect || material.evidenceDNA?.suspectEffect;
    if (effect?.suspectId) {
      board.suspectLinks[effect.suspectId] = board.suspectLinks[effect.suspectId] || { supports: [], contradicts: [], frames: [], clears: [], connects: [] };
      const relation = board.suspectLinks[effect.suspectId][effect.relation] ? effect.relation : 'connects';
      if (!board.suspectLinks[effect.suspectId][relation].includes(clue.id)) board.suspectLinks[effect.suspectId][relation].push(clue.id);
      if (relation === 'frames' && !board.falseLeads.includes(clue.id)) board.falseLeads.push(clue.id);
    }
    const readiness = this.readinessExplanation(caseNode);
    board.readinessNotes = [readiness.text];
    caseNode.readinessExplanation = readiness.text;
    SCHEngine.updateNode(caseNode);
  },
  readinessExplanation(caseNode) {
    const required = caseNode.requiredEvidenceRoles || [];
    const board = caseNode.theoryBoard || {};
    const roles = board.roles || {};
    const found = required.filter(role => (roles[role] || []).length > 0);
    const missing = required.filter(role => !(roles[role] || []).length);
    let suspectLinked = false;
    Object.values(board.suspectLinks || {}).forEach(link => { if ((link.supports || []).length || (link.connects || []).length || (link.contradicts || []).length) suspectLinked = true; });
    if (!required.length) return { ready:false, text:'No case structure has been recorded yet.' };
    if (missing.length === 0 && suspectLinked) return { ready:true, text:`Ready: you have ${found.map(r => this.roleLabels[r] || r).join(', ')} and at least one suspect link.` };
    if (missing.length === 0) return { ready:false, text:'Almost ready: the evidence shape is complete, but no suspect is clearly linked.' };
    return { ready:false, text:`Not ready: missing ${missing.map(r => this.roleLabels[r] || r).join(', ')}.` };
  },

  argumentScore(caseNode, chosenSuspectId = null) {
    const board = caseNode?.theoryBoard || {};
    const required = caseNode?.requiredEvidenceRoles || [];
    const roles = board.roles || {};
    const links = board.suspectLinks || {};
    const foundCount = required.filter(role => (roles[role] || []).length > 0).length;
    const roleCoverage = required.length ? foundCount / required.length : 0;
    const suspect = chosenSuspectId ? links[chosenSuspectId] : null;
    let suspectScore = 0;
    if (suspect) {
      suspectScore += Math.min(0.40, (suspect.supports || []).length * 0.14);
      suspectScore += Math.min(0.20, (suspect.connects || []).length * 0.08);
      suspectScore += Math.min(0.15, (suspect.contradicts || []).length * 0.05);
      suspectScore -= Math.min(0.25, (suspect.frames || []).length * 0.12);
      suspectScore += Math.min(0.06, (suspect.clears || []).length * 0.03);
    }
    const falseLeadPenalty = Math.min(0.15, (board.falseLeads || []).length * 0.04);
    const interpretationBonus = Math.min(0.08, (board.npcInterpretations || []).length * 0.025);
    const fabricatedPenalty = Math.min(0.10, (board.fabricatedRoles || []).length * 0.05);
    return Utils.round2(Utils.clamp01(roleCoverage * 0.55 + suspectScore + interpretationBonus + 0.10 - falseLeadPenalty - fabricatedPenalty));
  },

  argumentBonus(argumentScore) {
    if (argumentScore >= 0.75) return 0.08;
    if (argumentScore >= 0.55) return 0.05;
    if (argumentScore >= 0.35) return 0.02;
    return -0.03;
  },

  npcInterpretClue(npcKey, npcDef, caseNode, clue) {
    if (!caseNode || !clue) return null;
    if (typeof NPCInterpretationSystem !== 'undefined') return NPCInterpretationSystem.interpret(npcKey, npcDef, caseNode, clue);
    const role = clue.evidenceRole || clue.material?.evidenceRole || 'world_context';
    const interpretation = { npcKey, npcName:npcDef.name, clueId:clue.id, role, symbols:Utils.unique([...(npcDef.symbols||[]), role, 'npc_interpretation']), text:`${npcDef.name} studies the clue and files it as ${this.roleLabels[role] || role}.` };
    caseNode.theoryBoard = caseNode.theoryBoard || this.makeTheoryBoard(caseNode.requiredEvidenceRoles || []);
    caseNode.theoryBoard.npcInterpretations = caseNode.theoryBoard.npcInterpretations || [];
    caseNode.theoryBoard.npcInterpretations.push(interpretation);
    clue.tags = Utils.unique([...(clue.tags||[]),'Interpreted']);
    this.fileClue(caseNode, clue);
    return interpretation;
  },

  reclassifyLastClue(caseNode, newRole, sourceLabel = 'NPC') {
    if (!caseNode || !caseNode.clues || !caseNode.clues.length) return null;
    const clue = caseNode.clues[caseNode.clues.length - 1];
    const oldRole = clue.evidenceRole || clue.material?.evidenceRole || 'world_context';
    if (caseNode.theoryBoard?.roles?.[oldRole]) caseNode.theoryBoard.roles[oldRole] = caseNode.theoryBoard.roles[oldRole].filter(id => id !== clue.id);
    clue.evidenceRole = newRole;
    clue.tags = Utils.unique([...(clue.tags || []), 'Reclassified', sourceLabel]);
    if (clue.material) { clue.material.evidenceRole = newRole; clue.material.tags = clue.tags; }
    this.fileClue(caseNode, clue);
    SCHEngine.updateNode(Object.assign({}, clue, { type: 'clue', caseId: caseNode.id, provinceId: caseNode.provinceId }));
    return { clue, oldRole, newRole };
  },

  fabricateMissingRole(caseNode, npcName = 'The Velvet Patron') {
    if (!caseNode) return null;
    caseNode.theoryBoard = caseNode.theoryBoard || this.makeTheoryBoard(caseNode.requiredEvidenceRoles || []);
    const missing = (caseNode.requiredEvidenceRoles || []).filter(role => !(caseNode.theoryBoard.roles?.[role] || []).length);
    const role = missing[0] || Utils.pickRandom(caseNode.requiredEvidenceRoles || ['coverup']) || 'coverup';
    const id = `fabricated_role_${caseNode.id}_${role}_${SCHEngine.state.turn}`;
    caseNode.theoryBoard.roles[role] = caseNode.theoryBoard.roles[role] || [];
    if (!caseNode.theoryBoard.roles[role].includes(id)) caseNode.theoryBoard.roles[role].push(id);
    caseNode.theoryBoard.fabricatedRoles = caseNode.theoryBoard.fabricatedRoles || [];
    caseNode.theoryBoard.fabricatedRoles.push({ id, role, npcName, turn: SCHEngine.state.turn, tags: ['Patron-Fabricated', 'Suspicious'] });
    const readiness = this.readinessExplanation(caseNode);
    caseNode.readinessExplanation = readiness.text + ' One role has been filled by a suspiciously elegant argument.';
    SCHEngine.updateNode(caseNode);
    return { id, role, npcName };
  },

  suspectLinkSummary(caseNode, suspectId) {
    const link = caseNode?.theoryBoard?.suspectLinks?.[suspectId] || { supports: [], connects: [], contradicts: [], frames: [], clears: [] };
    return { supports: (link.supports || []).length, connects: (link.connects || []).length, contradicts: (link.contradicts || []).length, frames: (link.frames || []).length, clears: (link.clears || []).length };
  },

  boardSummary(caseNode) {
    if (!caseNode || !caseNode.theoryBoard) return [];
    const board = caseNode.theoryBoard;
    const required = caseNode.requiredEvidenceRoles || board.requiredRoles || [];
    const lines = [];
    required.forEach(role => { const ids = board.roles?.[role] || []; lines.push(`${this.roleLabels[role] || role}: ${ids.length ? ids.length + ' clue(s)' : 'missing'}`); });
    const suspectLines = Object.entries(board.suspectLinks || {}).map(([sid, link]) => { const suspect = SCHEngine.getNode(sid); const count = ['supports','connects','contradicts','frames','clears'].reduce((sum, k) => sum + ((link[k] || []).length), 0); return `${suspect?.name || sid}: ${count} link(s)`; });
    if (suspectLines.length) lines.push(`Suspects: ${suspectLines.slice(0, 3).join(' | ')}`);
    return lines;
  }
};

// ============================================================================
// WORLOCK AI
// ============================================================================
const KingpinAI = {
  observe(state) {
    const kp = state.kingpin;
    const hot = SCHEngine.getHottestSymbols(3);
    const handSymbols = Utils.unique(state.player.hand.flatMap(c => TarotBuilder.cardEffectiveSymbols(c) || [])).slice(0, 6);
    const caseNode = state.activeCase ? SCHEngine.getNode(state.activeCase) : null;
    const caseSymbols = caseNode ? Utils.unique(caseNode.clues.flatMap(c => c.symbols)).slice(-4) : [];
    kp.knownPlayerSymbols = Utils.unique([...kp.knownPlayerSymbols, ...handSymbols, ...caseSymbols]).slice(-12);
    kp.preferredSymbols = Utils.unique([...hot, ...kp.preferredSymbols]).slice(0, 6);
    kp.awareness = Utils.round2(Utils.clamp01(kp.awareness + 0.01 + (state.player.reputation * 0.01)));
    kp.aggression = Utils.round2(Utils.clamp01(0.10 + kp.exposure * 0.50 + kp.awareness * 0.20));
  },
  chooseGoal(state, trigger) {
    const kp = state.kingpin;
    const caseNode = state.activeCase ? SCHEngine.getNode(state.activeCase) : null;
    if (state.isEndgame || kp.exposure >= 1.0) return 'manifest';
    if (trigger === 'sleep') return kp.exposure >= MODE.highExposure ? 'contaminate_dream' : 'poison_symbols';
    if (kp.exposure < MODE.midExposure) return 'poison_symbols';
    if (kp.exposure < MODE.highExposure) {
      if (caseNode && caseNode.truthState && caseNode.truthState.confidence > MODE.sabotageEarly) return 'sabotage_case';
      return 'poison_symbols';
    }
    if (caseNode && caseNode.truthState && caseNode.truthState.confidence > MODE.sabotageLate) return 'sabotage_case';
    if (kp.exposure > MODE.twistExposure) return 'twist_tarot';
    return 'contaminate_dream';
  },
  chooseTactic(state, goal) {
    const exposure = state.kingpin.exposure;
    const tactics = {
      sabotage_case: [
        { id: 'evidence_blur', weight: 5 },
        { id: 'raise_contradiction', weight: 4 },
        ...(exposure >= MODE.frameExposure ? [{ id: 'frame_lieutenant', weight: 2 }] : [])
      ],
      contaminate_dream: [
        { id: 'dream_poison', weight: 4 },
        { id: 'symbol_echo', weight: 4 }
      ],
      twist_tarot: [
        ...(MODE.name === 'Casual' ? [] : [{ id: 'forced_reversal', weight: MODE.name === 'Deep' ? 4 : 2 }]),
        { id: 'deck_contamination', weight: MODE.name === 'Deep' ? 5 : 3 }
      ],
      poison_symbols: [
        { id: 'symbol_poison', weight: 4 },
        { id: 'false_heat', weight: 4 },
        ...(exposure >= MODE.highExposure && MODE.name !== 'Casual' ? [{ id: 'deck_contamination', weight: 1 }] : [])
      ],
      manifest: [{ id: 'manifest', weight: 1 }]
    };
    return Utils.weightedPick(tactics[goal] || tactics.poison_symbols, t => t.weight).id;
  },
  contaminateOneDeckCard() {
    const pools = [SCHEngine.state.player.drawPile, SCHEngine.state.player.discardPile, SCHEngine.state.player.hand].filter(arr => arr && arr.length > 0);
    const pool = Utils.pickRandom(pools);
    if (!pool) return null;
    const card = Utils.pickRandom(pool);
    if (!card) return null;
    TarotBuilder.contaminateCard(card, 'kingpin');
    return card;
  },
  executeTactic(state, tactic) {
    const kp = state.kingpin;
    const caseNode = state.activeCase ? SCHEngine.getNode(state.activeCase) : null;
    const activeProvince = state.activeProvince ? SCHEngine.getNode(state.activeProvince) : null;
    const pending = kp.pending;
    switch (tactic) {
      case 'evidence_blur':
        pending.clueReliabilityMod -= (MODE.name === 'Deep' ? 0.08 : MODE.name === 'Standard' ? 0.06 : 0.04);
        pending.clueContradictionMod += (MODE.name === 'Deep' ? 0.05 : MODE.name === 'Standard' ? 0.03 : 0.02);
        break;
      case 'frame_lieutenant':
        if (caseNode && caseNode.suspectIds && caseNode.suspectIds.length > 0 && !SCHEngine.state.player.temp.protectFromFraming) pending.framedSuspectId = Utils.pickRandom(caseNode.suspectIds);
        break;
      case 'raise_contradiction':
        if (caseNode) {
          caseNode.truthState.contradiction = Utils.clamp01(caseNode.truthState.contradiction + (MODE.name === 'Deep' ? 0.06 : MODE.name === 'Standard' ? 0.04 : 0.03));
          caseNode.truthState.ambiguity = Utils.clamp01(caseNode.truthState.ambiguity + (MODE.name === 'Deep' ? 0.04 : MODE.name === 'Standard' ? 0.03 : 0.02));
          SCHEngine.updateNode(caseNode);
        }
        break;
      case 'dream_poison':
        pending.dreamContaminationSymbols = Utils.unique([...pending.dreamContaminationSymbols, ...kp.preferredSymbols.slice(0, 2)]).slice(0, 3);
        break;
      case 'symbol_echo':
        if (activeProvince) activeProvince.symbols.slice(0, 1).forEach(sym => SCHEngine.adjustSymbolHeat(sym, 0.08));
        break;
      case 'forced_reversal':
        pending.forcedReversedSlots = Utils.unique([...pending.forcedReversedSlots, Utils.pickRandom(['cause', 'obstacle', 'outcome'])]);
        break;
      case 'deck_contamination': {
        const card = this.contaminateOneDeckCard();
        if (card) SCHEngine.narrative(`\x1b[35m[WORLOCK TRACE]\x1b[0m A Tarot card somewhere in your cycle has been marked.`);
        break;
      }
      case 'symbol_poison':
        SCHEngine.adjustSymbolHeat(Utils.pickRandom(kp.preferredSymbols) || 'illusion', MODE.name === 'Deep' ? 0.12 : MODE.name === 'Standard' ? 0.09 : 0.07);
        break;
      case 'false_heat':
        SCHEngine.adjustSymbolHeat(Utils.pickRandom(['authority', 'truth', 'trade', 'dreams']), MODE.name === 'Deep' ? 0.10 : MODE.name === 'Standard' ? 0.08 : 0.06);
        break;
      case 'manifest':
        state.isEndgame = true;
        break;
    }
  },
  leaveTrace(state, tactic) {
    state.counters.trace += 1;
    const traceSymbol = Utils.pickRandom(state.kingpin.preferredSymbols) || Utils.pickRandom(['illusion', 'debt', 'hidden']);
    const trace = { id: `trace_${state.counters.trace}`, turn: state.turn, tactic, symbol: traceSymbol, provinceId: state.activeProvince || null };
    state.kingpin.traces.push(trace);
    state.kingpin.tacticHistory.push(tactic);
    state.kingpin.tacticHistory = state.kingpin.tacticHistory.slice(-12);
    state.kingpin.traces = state.kingpin.traces.slice(-24);
    SCHEngine.adjustSymbolHeat(traceSymbol, 0.06);
  },
  narrateHint(tactic) {
    const hints = {
      evidence_blur: 'A page edge looks rubbed smooth, as if meaning itself were scraped away. Unhelpful. On brand, but unhelpful.',
      frame_lieutenant: 'One suspect begins to glow with suspicious convenience, like a villain auditioning too hard.',
      raise_contradiction: 'Two facts that should fit now grind against one another like badly trained bureaucrats.',
      dream_poison: 'The night tastes slightly metallic, as if a borrowed symbol waits behind sleep with a fake mustache.',
      symbol_echo: 'A familiar motif returns too quickly, too neatly. The universe is overacting again.',
      forced_reversal: 'The cards feel eager to turn against the hand that holds them. Dramatic little rectangles.',
      deck_contamination: 'One of your cards now carries a second shadow somewhere inside the cycle. It is being extra.',
      symbol_poison: 'A false motif rises in the background, plausible enough to distract and smug enough to enjoy it.',
      false_heat: 'The province hums with significance that may not belong to this case. Classic decoy nonsense.'
    };
    if (hints[tactic]) SCHEngine.narrative(`\x1b[35m[WORLOCK TRACE]\x1b[0m ${hints[tactic]}`);
  },
  turn(trigger) {
    const state = SCHEngine.state;
    this.observe(state);
    state.kingpin.exposure = Utils.round2(Utils.clamp01(state.kingpin.exposure + 0.005));
    const goal = this.chooseGoal(state, trigger);
    const tactic = this.chooseTactic(state, goal);
    this.executeTactic(state, tactic);
    this.leaveTrace(state, tactic);
    this.narrateHint(tactic);
  },
  clearTransientPending() {
    SCHEngine.state.kingpin.pending.clueReliabilityMod = 0;
    SCHEngine.state.kingpin.pending.clueContradictionMod = 0;
    SCHEngine.state.kingpin.pending.framedSuspectId = null;
  }
};


// ============================================================================
// ENDGAME STORY BUILDER: RECOMBINANT FINAL TRIAL / EPILOGUE
// ============================================================================
const EndgameStoryBuilder = {
  courtSkins: [
    {
      key: 'counting_cathedral',
      name: 'The Counting-House Cathedral',
      symbols: ['debt', 'greed', 'wealth', 'ledger', 'trade'],
      intro: 'The Master Dream becomes a counting-house built inside a cathedral. Every province is entered as a debtor. Every bell rings like a coin dropped into an empty cup.',
      bench: 'The Worlock sits behind an altar-ledger, blessing debts before anyone incurs them.'
    },
    {
      key: 'sleeping_abbey',
      name: 'The Sleeping Abbey',
      symbols: ['dreams', 'sleep', 'bell', 'hidden', 'silence'],
      intro: 'The Master Dream becomes an abbey dormitory beneath a sky of closed eyes. Sleeping witnesses breathe verdicts into the dark.',
      bench: 'The Worlock sits as abbot of a monastery that owns every dream it hears.'
    },
    {
      key: 'mirrored_tribunal',
      name: 'The Mirrored Tribunal',
      symbols: ['illusion', 'truth', 'mirror', 'deception', 'mask'],
      intro: 'The Master Dream becomes a mirrored tribunal. Every judge is a reflection. Every reflection objects before the witness speaks.',
      bench: 'The Worlock sits in all mirrors at once, correcting testimony by changing the angle.'
    },
    {
      key: 'hanging_court',
      name: 'The Hanging Court',
      symbols: ['authority', 'law', 'punishment', 'damnation', 'ruin'],
      intro: 'The Master Dream becomes a hanging court. The gallows serves as clerk. The sentence has already been written, but not yet signed.',
      bench: 'The Worlock wears a crown of verdicts and calls it procedure.'
    },
    {
      key: 'festival_court',
      name: 'The Festival Court',
      symbols: ['festival', 'mask', 'madness', 'foolishness', 'excess'],
      intro: 'The Master Dream becomes a festival court where every mask is sworn in as a witness and every drumbeat sounds like an objection.',
      bench: 'The Worlock presides from a parade float made of sealed confessions.'
    }
  ],

  maskPool: [
    { id: 'debt', name: 'The Debt-Mask', symbols: ['debt', 'greed', 'wealth', 'authority'], claim: '“All obligation is ownership. Every debt is a chain that asked to be worn.”', challenge: 'Challenge the lie that debt is ownership.', defeatText: 'The Debt-Mask loses its columns. The court can no longer tell owing from being owned.', scar: 'Some ledgers will never again be trusted simply because they are neat.' },
    { id: 'dream', name: 'The Dream-Mask', symbols: ['dreams', 'sleep', 'hidden', 'illusion'], claim: '“Every dream was already mine. Sleep is merely obedience with the eyes closed.”', challenge: 'Challenge the lie that dreams belong to the strong.', defeatText: 'The Dream-Mask wakes with no master left inside it.', scar: 'Some sleepers will still lock their doors before dreaming.' },
    { id: 'mirror', name: 'The Mirror-Mask', symbols: ['illusion', 'truth', 'deception', 'mirror'], claim: '“Truth is only the reflection that survives correction.”', challenge: 'Challenge the lie that truth can always be reversed.', defeatText: 'The Mirror-Mask breaks into shards that finally reflect the same room.', scar: 'For a while, polished silver will make liars flinch.' },
    { id: 'crown', name: 'The Crown-Mask', symbols: ['authority', 'law', 'punishment', 'false_holiness'], claim: '“Law exists to excuse power. A crown is only a verdict that learned to shine.”', challenge: 'Challenge the lie that law exists to serve power.', defeatText: 'The Crown-Mask falls from the bench and becomes ordinary metal.', scar: 'Some courts will spend years learning the difference between sentence and truth.' },
    { id: 'feast', name: 'The Feast-Mask', symbols: ['gluttony', 'excess', 'consumption', 'waste'], claim: '“What is consumed has consented. Hunger is the oldest law.”', challenge: 'Challenge the lie that appetite is authority.', defeatText: 'The Feast-Mask chokes on its own invitation.', scar: 'Some banquet tables will leave one chair empty for the witnesses they almost ate.' },
    { id: 'gallows', name: 'The Gallows-Mask', symbols: ['punishment', 'ruin', 'damnation', 'authority'], claim: '“A sentence proves the crime it names.”', challenge: 'Challenge the lie that punishment creates truth.', defeatText: 'The Gallows-Mask loses the rope before it finds a neck.', scar: 'Noon shadows remain suspicious for one generation.' },
    { id: 'relic', name: 'The Relic-Mask', symbols: ['false_holiness', 'hypocrisy', 'doctrine', 'hidden'], claim: '“If enough knees bend, emptiness becomes holy.”', challenge: 'Challenge the lie that worship can manufacture truth.', defeatText: 'The Relic-Mask opens and contains only dust with bad credentials.', scar: 'Several calendars will misplace their saints on purpose.' },
    { id: 'festival', name: 'The Festival-Mask', symbols: ['festival', 'mask', 'madness', 'identity'], claim: '“A name is only the mask that receives applause.”', challenge: 'Challenge the lie that identity belongs to whoever performs it loudest.', defeatText: 'The Festival-Mask forgets the audience it was trying to impress.', scar: 'Some citizens will wake with old names and new suspicions.' }
  ],

  provinceClosers: {
    prov_mammonia: ['Mammonia wakes to find every debt marker blank on one side.', 'Mammonia distrusts clean accounts for the first honest morning in years.'],
    prov_pigritarium: ['Pigritarium sleeps one honest night and wakes resentful but clean.', 'Pigritarium postpones despair until tomorrow, then forgets to reschedule it.'],
    prov_terra_sancta: ['Terra Sancta removes three saints from the calendar and adds one question mark.', 'Terra Sancta relights its candles with less certainty and more mercy.'],
    prov_tartaria: ['Tartaria keeps its gallows, but the ropes refuse premature verdicts.', 'Tartaria smells less of sulfur and more of difficult paperwork.'],
    prov_stultorum: ['Stultorum keeps the nonsense, but gives it fewer official seals.', 'Stultorum laughs at the old lies until the laughter becomes evidence.'],
    prov_veneria: ['Veneria returns several stolen names and keeps the better gossip.', 'Veneria perfumes the truth, but labels the bottle correctly.'],
    prov_lusoria: ['Lusoria rolls its dice and discovers chance is not the same as doom.', 'Lusoria pays one debt in luck and refuses the next.'],
    prov_bibonia: ['Bibonia wakes with a headache and one sincere confession.', 'Bibonia waters the wine and calls it reform.'],
    prov_gourmandise: ['Gourmandise sets a place for restraint and almost uses it.', 'Gourmandise stops eating witnesses, at least in public.'],
    prov_schlaraffenland: ['Schlaraffenland mops up the luxury and finds a floor beneath it.', 'Schlaraffenland learns that excess makes a poor constitution.'],
    prov_tobacco_isle: ['Tobacco Isle airs out its taverns and finds several old verdicts in the smoke.', 'Tobacco Isle wakes to a clear wind, which everyone mistrusts on principle.']
  },

  registerNodes() {
    this.courtSkins.forEach(s => {
      const id = `endgame_court_${s.key}`;
      if (!SCHEngine.getNode(id)) SCHEngine.registerNode({ id, type: 'endgame_story', subtype: 'court_skin', key: s.key, name: s.name, symbols: Utils.unique([...(s.symbols || []), 'endgame', 'story']), npcHooks: ['octavia_quill_future'] });
    });
    this.maskPool.forEach(m => {
      const id = `endgame_mask_${m.id}`;
      if (!SCHEngine.getNode(id)) SCHEngine.registerNode({ id, type: 'endgame_story', subtype: 'worlock_mask', key: m.id, name: m.name, symbols: Utils.unique([...(m.symbols || []), 'endgame', 'worlock_mask']), npcHooks: ['octavia_quill_future'] });
    });
  },

  chooseCourtSkin(evidenceDNA, kingpinDNA, resolvedCases = []) {
    const caseSymbols = Utils.unique(resolvedCases.flatMap(c => [...(c.requiredSymbols || []), ...(c.symbols || [])]));
    const signal = Utils.unique([...(evidenceDNA || []), ...(kingpinDNA || []), ...caseSymbols]);
    return Utils.weightedPick(this.courtSkins, skin => 1 + Utils.overlap(skin.symbols, signal).length * 3 + Math.random());
  },

  chooseWorlockMasks(evidenceDNA, kingpinDNA, lieutenants = []) {
    const ltSymbols = Utils.unique((lieutenants || []).filter(lt => !lt.defeated).flatMap(lt => lt.symbols || []));
    const signal = Utils.unique([...(evidenceDNA || []), ...(kingpinDNA || []), ...ltSymbols]);
    const ranked = this.maskPool
      .map(mask => Object.assign({}, mask, { storyWeight: 1 + Utils.overlap(mask.symbols, signal).length * 3 + Math.random() }))
      .sort((a, b) => b.storyWeight - a.storyWeight);
    const selected = ranked.slice(0, 4);
    return selected.length >= 4 ? selected : this.maskPool.slice(0, 4);
  },

  buildCaseTestimony(caseRecord, chosenMask) {
    const template = (typeof ContentLibrary !== 'undefined') ? ContentLibrary.getCaseTemplate(caseRecord.templateKey) : null;
    const suspect = caseRecord.finalSuspectId ? SCHEngine.getNode(caseRecord.finalSuspectId) : null;
    const caseSymbols = Utils.unique([...(caseRecord.requiredSymbols || []), ...((caseRecord.clues || []).flatMap(c => c.symbols || [])), ...(caseRecord.symbols || [])]);
    const templateLine = template && template.resolutionThemes
      ? (caseRecord.outcome === 'resolved' ? template.resolutionThemes.resolved : caseRecord.outcome === 'partially_resolved' ? template.resolutionThemes.partial : template.resolutionThemes.failed)
      : 'The case enters the record and refuses revision.';
    const suspectLine = suspect ? `${suspect.name} is named in the margins. ${suspect.personalityLine || ''}`.trim() : 'No single suspect can carry all of what happened.';
    const maskHit = Utils.overlap(caseSymbols, chosenMask.symbols);
    const witnessVerb = maskHit.length ? `answers the ${chosenMask.name} through [${maskHit.join(', ')}]` : 'answers by surviving the archive intact';
    return `${caseRecord.name} takes the stand and ${witnessVerb}. ${templateLine} ${suspectLine}`;
  },

  lieutenantWitnessLine(lt, chosenMask) {
    const overlap = Utils.overlap(lt.symbols || [], chosenMask.symbols).join(', ');
    const subject = overlap ? ` It touches the mask through [${overlap}].` : '';
    if (lt.defeated) return `${lt.name} appears as a broken witness. Its former authority is entered against the Worlock.${subject}`;
    if (lt.weakened) return `${lt.name} limps into the gallery, damaged but not silent. Its objection frays before reaching the bench.${subject}`;
    if ((lt.exposure || 0) >= 0.60) return `${lt.name} objects from the gallery. The objection has teeth.${subject}`;
    return `${lt.name} remains hidden in the back of the dream-court, felt more than seen.${subject}`;
  },

  tarotWitnessLine(card, chosenMask, evidenceDNA) {
    const syms = TarotBuilder.cardEffectiveSymbols(card);
    const maskHits = Utils.overlap(syms, chosenMask.symbols);
    const evidenceHits = Utils.overlap(syms, evidenceDNA || []);
    const family = TarotBuilder.getPowerFamily(card);
    const majorLines = {
      'Justice': 'Justice takes the stand without swearing an oath. The court accepts this as legally frightening.',
      'The Moon': 'The Moon lies, then admits the lie was evidence.',
      'The Devil': 'The Devil presents the chain and asks who polished it.',
      'The Star': 'The Star does not refute the Worlock. It simply shows what survived.',
      'The Tower': 'The Tower does not testify; it demonstrates.',
      'Judgement': 'Judgement calls the room by its true name and waits for an answer.',
      'The World': 'The World enters as a completed sentence the Worlock did not write.'
    };
    const familyLines = {
      Oracle: `${card.name} speaks as prophecy, but the archive pins it to evidence.`,
      Audit: `${card.name} enters as an account book with one honest column.`,
      'Cross-Examine': `${card.name} questions the question until it confesses.`,
      Dreamwalk: `${card.name} brings a dream that remains valid after waking.`,
      Pursuit: `${card.name} runs the falsehood down before it can change masks.`
    };
    const base = majorLines[card.name] || familyLines[family] || `${card.name} gives testimony in a language of symbols.`;
    const echo = maskHits.length ? ` It strikes [${maskHits.join(', ')}].` : evidenceHits.length ? ` It echoes your archive through [${evidenceHits.slice(0, 3).join(', ')}].` : '';
    return base + echo;
  },

  buildProvinceEpilogue(resolvedCases, finalTier, chosenMask) {
    const provinceIds = Utils.unique((resolvedCases || []).map(c => c.provinceId).filter(Boolean));
    const residueIds = Utils.unique(Object.values(SCHEngine.state.provinceResidues || {}).map(r => r.provinceId).filter(Boolean));
    const pickFrom = Utils.unique([...provinceIds, ...residueIds]).slice(-4);
    const lines = [];
    pickFrom.forEach(pid => {
      const pool = this.provinceClosers[pid];
      if (pool && pool.length) lines.push(Utils.pickRandom(pool));
    });
    if (lines.length === 0) lines.push(`The provinces wake around ${chosenMask.name}, unsure whether the silence afterward is mercy or shock.`);
    return lines.slice(0, 4);
  },

  buildCorruptionScar(corruption) {
    if (corruption < 0.15) return 'The verdict is clean enough to be remembered without footnotes.';
    if (corruption < 0.40) return 'A little of the Worlock’s ink remains under your fingernails.';
    return 'The provinces are free, but some doors still open when the Worlock’s name is not spoken.';
  },

  buildReputationCoda(reputation, insight) {
    if (reputation >= 0.20) return 'When the provinces wake, they remember your name almost correctly.';
    if (reputation <= 0.02) return 'The provinces are saved by a detective many official records immediately misplace.';
    if (insight >= 0.45) return 'You understand the grammar as it breaks. That understanding will cost you sleep, but save others from worse.';
    return 'Your name enters the archive in a hand that is not quite yours, but it is legible.';
  },

  buildVerdictAftermath(verdict, finalTier, chosenMask, resolvedCases, evidenceDNA) {
    const tierText = finalTier === 'true'
      ? `${chosenMask.defeatText} ${verdict.name} rewrites the surviving clause.`
      : finalTier === 'pyrrhic'
        ? `${chosenMask.defeatText} Not all of its grammar dies. ${verdict.name} must share the page with scars.`
        : `The ${chosenMask.name} survives the verdict, but not untouched. ${verdict.name} remains as a seed for a later rebellion.`;
    const provinceLines = this.buildProvinceEpilogue(resolvedCases, finalTier, chosenMask);
    return [tierText, chosenMask.scar, ...provinceLines, this.buildCorruptionScar(SCHEngine.state.player.corruption), this.buildReputationCoda(SCHEngine.state.player.reputation, SCHEngine.state.player.insight)];
  }
};

// ============================================================================
// GAME LOGIC
// ============================================================================

// ============================================================================
// CLUE REPORT BUILDER: PLAYER-FACING DETECTIVE BOARD OUTPUT
// ============================================================================

// ============================================================================
// CASE INTRO BUILDER: CLEAN PLAYER-FACING CASE BRIEF
// ============================================================================
const CaseIntroBuilder = {
  roleLabel(role) {
    return (typeof InvestigationCoherence !== 'undefined' && InvestigationCoherence.roleLabels && InvestigationCoherence.roleLabels[role]) || String(role || 'Evidence').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  },
  premise(caseNode, provinceNode) {
    if (caseNode?.templateKey && typeof ContentLibrary !== 'undefined') {
      const template = ContentLibrary.getCaseTemplate(caseNode.templateKey);
      if (template) return ContentLibrary.buildCaseIntro(template, provinceNode);
    }
    return `A semantic anomaly rises in ${provinceNode?.name || 'the province'}.`;
  },
  neededEvidence(caseNode) {
    const roles = caseNode?.requiredEvidenceRoles || [];
    if (!roles.length) return ['- Structured evidence'];
    return roles.map(role => `- ${this.roleLabel(role)}`);
  },
  firstLeads(caseNode) {
    const roles = caseNode?.requiredEvidenceRoles || [];
    const guidance = {
      motive: 'Motive: Ledger or Festival cities',
      method: 'Method: Lantern or Festival cities',
      opportunity: 'Opportunity: Lantern or Ledger cities',
      identity: 'Identity: Mask or Mirror cities',
      coverup: 'Cover-Up: Ledger or Lantern cities',
      alibi_break: 'Alibi Break: Mirror or Lantern cities',
      false_lead: 'Suspicious Lead: Mask or Festival cities',
      lieutenant_trace: 'Lieutenant Trace: Bell or Lantern cities',
      world_context: 'World Context: Bell or Festival cities'
    };
    const lines = roles.map(r => guidance[r]).filter(Boolean);
    if (MODE.name === 'Deep') {
      return lines.length ? lines.map(line => `- ${line}`) : ['- Follow contradiction where the city resists you.'];
    }
    if (MODE.name === 'Casual' && lines.length) {
      return lines.map(line => `- ${line}`);
    }
    return lines.length ? lines.map(line => `- ${line}`) : ['- Start with a city whose trait matches the case mood.'];
  },
  suspectList(caseNode) {
    const suspects = (caseNode?.suspectIds || []).map(id => SCHEngine.getNode(id)).filter(Boolean);
    if (!suspects.length) return ['1. Unknown suspect field'];
    return suspects.map((s, i) => `${i + 1}. ${s.name}${s.suspectHook ? ' — ' + s.suspectHook : ''}`);
  },
  status(caseNode) {
    if (typeof InvestigationCoherence !== 'undefined') {
      const readiness = InvestigationCoherence.readinessExplanation(caseNode);
      return readiness.text || caseNode?.readinessExplanation || 'Not ready: gather structured evidence.';
    }
    return caseNode?.readinessExplanation || 'Not ready: gather structured evidence.';
  },
  themeLine(caseNode) {
    const symbols = (caseNode?.requiredSymbols || []).filter(Boolean).slice(0, 3);
    if (!symbols.length || MODE.name === 'Casual') return null;
    return `Likely themes: ${symbols.join(', ')}.`;
  },
  residualLine(residue) {
    if (!residue) return null;
    return `Old unresolved tones return: [${(residue.symbols || []).join(', ')}].`;
  },
  build(caseNode, provinceNode, options = {}) {
    const residue = options.residue || null;
    const lines = [];
    lines.push(`=== NEW CASE: ${caseNode.name} ===`);
    if (caseNode.caseArchetypeLabel) lines.push(`CASE TYPE: ${caseNode.caseArchetypeLabel}`);
    if (caseNode.caseArchetypeSummary) lines.push(caseNode.caseArchetypeSummary);
    lines.push('');
    lines.push(this.premise(caseNode, provinceNode));
    const theme = this.themeLine(caseNode);
    if (theme) lines.push(theme);
    lines.push('');
    lines.push('CENTRAL QUESTION');
    lines.push(caseNode.centralQuestion || `What pattern is trying to become law in ${provinceNode?.name || 'this province'}?`);
    lines.push('');
    lines.push('WHAT YOU NEED');
    lines.push(...this.neededEvidence(caseNode));
    lines.push('');
    lines.push('FIRST LEADS');
    if (typeof CaseArchetypeSystem !== 'undefined' && caseNode.caseArchetype) {
      CaseArchetypeSystem.firstLeadsForArchetype(caseNode.caseArchetype).slice(1).forEach(x => lines.push(`- ${x}`));
    }
    lines.push(...this.firstLeads(caseNode));
    lines.push('');
    lines.push('SUSPECTS ON THE BOARD');
    lines.push(...this.suspectList(caseNode));
    lines.push('');
    lines.push('STATUS');
    lines.push(this.status(caseNode));
    const residueLine = this.residualLine(residue);
    if (residueLine) {
      lines.push('');
      lines.push('RESIDUE');
      lines.push(residueLine);
    }
    return lines.join('\n');
  }
};

const ClueReportBuilder = {
  titleFor(clue) {
    const form = clue?.material?.formName || 'clue';
    const role = clue?.evidenceRole || clue?.material?.evidenceRole || 'evidence';
    const clean = String(form).replace(/\b\w/g, c => c.toUpperCase());
    return `${clean} / ${this.roleLabel(role)}`;
  },
  roleLabel(role) {
    return (typeof InvestigationCoherence !== 'undefined' && InvestigationCoherence.roleLabels && InvestigationCoherence.roleLabels[role]) || String(role || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  },
  pct(x) { return `${Math.round((Number.isFinite(x) ? x : 0) * 100)}%`; },
  signedPct(delta) {
    const n = Math.round((Number.isFinite(delta) ? delta : 0) * 100);
    if (n > 0) return `+${n}`;
    if (n < 0) return `${n}`;
    return '±0';
  },
  strengthLabel(x, high = 0.70, mid = 0.45) {
    if ((x || 0) >= high) return 'Strong';
    if ((x || 0) >= mid) return 'Solid';
    return 'Weak';
  },
  contradictionLabel(x) {
    if ((x || 0) >= 0.24) return 'High';
    if ((x || 0) >= 0.13) return 'Moderate';
    return 'Low';
  },
  briefClueText(clue, cityNode) {
    const m = clue?.material || null;
    if (m) {
      const article = /^[aeiou]/i.test(m.formName || '') ? 'an' : 'a';
      const condition = m.condition ? `, ${m.condition}` : '';
      let text = `In ${cityNode.name}, you find ${article} ${m.formName}${condition}. ${m.anomaly ? m.anomaly.charAt(0).toUpperCase() + m.anomaly.slice(1) + '.' : ''}`;
      if (m.linkedSuspectName) text += ` It ${m.linkStyle || 'points toward'} ${m.linkedSuspectName}.`;
      if (m.falseConvenience || clue?.evidenceDNA?.contradictionVector === 'too_clean') text += ' The implication feels almost too convenient.';
      return text.trim();
    }
    return clue?.text || `In ${cityNode?.name || 'the city'}, something refuses to remain ordinary.`;
  },
  humanize(value) {
    return String(value || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  },
  interpretation(clue, activeCase, cityNode) {
    const dna = clue?.evidenceDNA || clue?.material?.evidenceDNA || {};
    const role = clue?.evidenceRole || clue?.material?.evidenceRole || dna.role || 'evidence';
    const rel = clue?.suspectEffect?.relation || clue?.material?.suspectEffect?.relation || dna.suspectRelation || 'connects';
    const suspect = clue?.suspectEffect?.suspectName || clue?.material?.suspectEffect?.suspectName || clue?.material?.linkedSuspectName || 'the suspect field';
    const premise = this.humanize(dna.premise || activeCase?.caseGrammar?.premise?.id || activeCase?.templateKey || 'case pattern').toLowerCase();
    const distortion = this.humanize(dna.distortion || activeCase?.caseGrammar?.distortion?.id || 'local distortion').toLowerCase();
    const hidden = this.humanize(dna.hiddenVector || activeCase?.caseGrammar?.hiddenTruth?.id || 'hidden truth').toLowerCase();
    let relationText = 'adds context to the suspect field';
    if (rel === 'supports') relationText = `supports a theory against ${suspect}`;
    else if (rel === 'frames') relationText = `may be making ${suspect} look guilty too neatly`;
    else if (rel === 'clears') relationText = `weakens the case against ${suspect}`;
    else if (rel === 'contradicts') relationText = `contradicts ${suspect}'s position`;
    else if (rel === 'connects') relationText = `connects ${suspect} to the case architecture`;
    return `This clue turns the case toward ${this.roleLabel(role).toLowerCase()}. It suggests the visible pattern (${premise}) is being bent by ${distortion}, with ${hidden} underneath. It ${relationText}.`;
  },
  roleSetForClue(clue) {
    return Utils.unique([clue?.evidenceRole, clue?.material?.evidenceRole, ...(clue?.secondaryEvidenceRoles || []), ...(clue?.material?.secondaryEvidenceRoles || []), clue?.material?.secondaryEvidenceRole].filter(Boolean));
  },
  caseImpactLines(clue, activeCase) {
    const primary = clue?.evidenceRole || clue?.material?.evidenceRole || 'world_context';
    const secondary = Utils.unique([...(clue?.secondaryEvidenceRoles || []), ...(clue?.material?.secondaryEvidenceRoles || []), clue?.material?.secondaryEvidenceRole].filter(Boolean));
    const advanced = Utils.overlap(clue?.symbols || [], activeCase?.requiredSymbols || []);
    const lines = [];
    lines.push(`- Primary role: ${this.roleLabel(primary)}`);
    if (secondary.length) lines.push(`- Keystone role: ${secondary.map(r => this.roleLabel(r)).join(', ')}`);
    lines.push(`- Reliability: ${this.strengthLabel(clue?.reliability)} (${this.pct(clue?.reliability || 0)})`);
    lines.push(`- Contradiction: ${this.contradictionLabel(clue?.contradiction)} (${this.pct(clue?.contradiction || 0)})`);
    lines.push(`- Case symbols advanced: ${advanced.length ? '[' + advanced.join(', ') + ']' : 'none directly'}`);
    return lines;
  },
  causalLinks(activeCase, clue) {
    const rolesInClue = this.roleSetForClue(clue);
    const boardRoles = activeCase?.theoryBoard?.roles || {};
    const describeRole = (role) => {
      const direct = rolesInClue.includes(role);
      const filed = (boardRoles[role] || []).length;
      if (direct) return 'strengthened by this clue';
      if (filed) return `already supported (${filed} clue${filed === 1 ? '' : 's'})`;
      return 'not established';
    };
    return [
      `- Means: ${describeRole('method')}`,
      `- Motive: ${describeRole('motive')}`,
      `- Opportunity: ${describeRole('opportunity')}`,
      `- Identity: ${describeRole('identity')}`,
      `- Cover-Up: ${describeRole('coverup')}`,
      `- Alibi Break: ${describeRole('alibi_break')}`
    ];
  },
  suspectRawScore(activeCase, suspectNode) {
    const link = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.suspectLinkSummary(activeCase, suspectNode.id) : { supports:0, connects:0, contradicts:0, frames:0, clears:0 };
    const argument = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.argumentScore(activeCase, suspectNode.id) : 0;
    const theory = (typeof GameLogic !== 'undefined' && GameLogic.buildTheoryScore) ? GameLogic.buildTheoryScore(activeCase, suspectNode) : { coherence: 0 };
    const symptomFit = Utils.jaccardSimilarity(suspectNode.symbols || [], activeCase.requiredSymbols || []);
    const profile = (typeof SuspectLogicSystem !== 'undefined') ? SuspectLogicSystem.profileFor(activeCase, suspectNode.id) : null;
    let score = 0.08 + (theory.coherence || 0) * 0.32 + argument * 0.30 + symptomFit * 0.16;
    score += (link.supports || 0) * 0.15 + (link.connects || 0) * 0.08 + (link.contradicts || 0) * 0.04;
    score += (link.frames || 0) * 0.07;
    score -= (link.clears || 0) * 0.18;
    if (profile?.trueRelation === 'coverup_actor') score += 0.03;
    if (profile?.frameRisk >= 0.60 && (link.frames || 0) > Math.max(link.supports || 0, link.connects || 0)) score *= 0.88;
    return Math.max(0.01, score);
  },
  suspectBoard(activeCase, clue) {
    const suspects = (activeCase?.suspectIds || []).map(id => SCHEngine.getNode(id)).filter(Boolean);
    if (!suspects.length) return [];
    const raw = suspects.map(s => ({ suspect:s, raw:this.suspectRawScore(activeCase, s) }));
    const total = raw.reduce((a,b) => a + b.raw, 0) || 1;
    const previous = activeCase.lastTheoryWeights || {};
    const current = {};
    const rows = raw.map(x => {
      const weight = x.raw / total;
      current[x.suspect.id] = weight;
      const delta = weight - (previous[x.suspect.id] || 0);
      const link = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.suspectLinkSummary(activeCase, x.suspect.id) : { supports:0, connects:0, contradicts:0, frames:0, clears:0 };
      const profile = (typeof SuspectLogicSystem !== 'undefined') ? SuspectLogicSystem.profileFor(activeCase, x.suspect.id) : null;
      let why = profile?.motiveLine || x.suspect.storyFragments?.suspicionLine || 'mostly symbolic proximity';
      if (link.supports > 0) why = `${link.supports} supporting link${link.supports === 1 ? '' : 's'} — ${profile?.motiveLine || x.suspect.storyFragments?.motive || 'the clue fits their case role'}`;
      else if (link.connects > 0) why = `${link.connects} connective link${link.connects === 1 ? '' : 's'} — ${profile?.opportunityLine || x.suspect.storyFragments?.opportunity || 'they touch the case architecture'}`;
      else if (link.frames > 0) why = `${link.frames} suspiciously convenient/frame-shaped link${link.frames === 1 ? '' : 's'} — ${profile?.frameWarning || x.suspect.storyFragments?.frameWarning || 'the trail may be staged'}`;
      else if (link.clears > 0) why = `${link.clears} clearing link${link.clears === 1 ? '' : 's'} — ${profile?.clearingLine || x.suspect.storyFragments?.clearingLine || 'the evidence may point away'}`;
      let risk = profile?.frameWarning || 'No obvious frame signal yet.';
      if (link.frames > Math.max(link.supports, link.connects)) risk = profile?.frameWarning || 'High frame risk: evidence may be too polished.';
      else if (profile?.trueRelation === 'coverup_actor') risk = 'May be enabling the cover-up rather than acting alone.';
      else if (profile?.trueRelation === 'innocent_but_connected') risk = profile?.clearingLine || 'Could be connected without being central.';
      else if (link.clears > 0) risk = profile?.clearingLine || 'Evidence may point away from this suspect.';
      return { suspect:x.suspect, weight, delta, why, risk, link };
    }).sort((a,b) => b.weight - a.weight);
    activeCase.lastTheoryWeights = current;
    SCHEngine.updateNode(activeCase);
    return rows.map((r, i) => `${i+1}. ${r.suspect.name} — ${this.pct(r.weight)} Theory weight (${this.signedPct(r.delta)})\n   Why: ${r.why}.\n   Risk: ${r.risk}`);
  },
  readinessLines(activeCase) {
    const required = activeCase?.requiredEvidenceRoles || [];
    const roles = activeCase?.theoryBoard?.roles || {};
    const roleLine = required.map(r => `${this.roleLabel(r)} ${(roles[r] || []).length ? '✓' : '✗'}`).join(' | ') || 'No required roles listed';
    const uniqueClueSymbols = Utils.unique((activeCase?.clues || []).flatMap(c => c.symbols || []));
    const coverage = (activeCase?.requiredSymbols || []).filter(sym => uniqueClueSymbols.includes(sym)).length / Math.max(1, (activeCase?.requiredSymbols || []).length);
    const effectiveMin = (typeof InvestigationCoherence !== 'undefined' && InvestigationCoherence.effectiveCoverageRequirement) ? InvestigationCoherence.effectiveCoverageRequirement(activeCase, coverage) : MODE.minCoverage;
    const argument = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.argumentScore(activeCase, null) : (activeCase?.argumentScore || 0);
    const suspectLink = (typeof InvestigationCoherence !== 'undefined' && InvestigationCoherence.hasMeaningfulSuspectLink) ? InvestigationCoherence.hasMeaningfulSuspectLink(activeCase) : false;
    const ready = (typeof GameLogic !== 'undefined' && GameLogic.canSubmitTheory) ? GameLogic.canSubmitTheory(activeCase) : false;
    return [
      `- Roles: ${roleLine}`,
      `- Suspect link: ${suspectLink ? '✓' : '✗'}`,
      `- Coverage: ${this.pct(coverage)} / ${this.pct(effectiveMin)}`,
      `- Argument: ${this.pct(argument)}`,
      `- Ready to submit: ${ready ? 'yes' : 'not yet'}`
    ];
  },
  recommendation(activeCase, cityNode) {
    const missing = (typeof InvestigationCoherence !== 'undefined' && InvestigationCoherence.missingRequiredRoles) ? InvestigationCoherence.missingRequiredRoles(activeCase) : [];
    if (missing.length) {
      const routing = (typeof InvestigationCoherence !== 'undefined' && InvestigationCoherence.caseRoutingGuidance) ? InvestigationCoherence.caseRoutingGuidance(missing) : '';
      return `Recommendation: seek ${missing.map(r => this.roleLabel(r)).join(', ')} evidence next${routing ? `. ${routing}` : ''}.`;
    }
    const hasLink = (typeof InvestigationCoherence !== 'undefined' && InvestigationCoherence.hasMeaningfulSuspectLink) ? InvestigationCoherence.hasMeaningfulSuspectLink(activeCase) : false;
    if (!hasLink) return 'Recommendation: get a cleaner suspect link. Ledger, Lantern, or an NPC interpretation may help.';
    if (typeof GameLogic !== 'undefined' && GameLogic.canSubmitTheory && GameLogic.canSubmitTheory(activeCase)) return 'Recommendation: the board is structurally ready. You can submit a theory, though high frame risk may still matter.';
    return 'Recommendation: gather one more aligned clue or ask an NPC to interpret the latest evidence.';
  },
  build(clue, activeCase, cityNode, context = {}) {
    const exhaustedLine = context.exhausted ? '\n[Exhausted city: diminished returns.]\n' : '';
    const lines = [];
    lines.push(`=== CLUE FOUND: ${this.titleFor(clue)} ===`);
    lines.push('');
    lines.push(this.briefClueText(clue, cityNode));
    if (exhaustedLine) lines.push(exhaustedLine.trim());
    lines.push('');
    lines.push('INTERPRETATION');
    lines.push(this.interpretation(clue, activeCase, cityNode));
    lines.push('');
    lines.push('CASE IMPACT');
    lines.push(...this.caseImpactLines(clue, activeCase));
    lines.push('');
    lines.push('CAUSAL LINKS');
    lines.push(...this.causalLinks(activeCase, clue));
    lines.push('');
    lines.push('SUSPECT BOARD');
    lines.push(...this.suspectBoard(activeCase, clue));
    lines.push('');
    lines.push('THEORY READINESS');
    lines.push(...this.readinessLines(activeCase));
    lines.push(this.recommendation(activeCase, cityNode));
    return lines.join('\n');
  }
};



// ============================================================================
// KEY ADDITIONS: ARCHETYPES / EXPLANATIONS / REACTIONS / DREAM CHOICES / GUIDANCE
// ============================================================================
const CaseArchetypeSystem = {
  archetypes: {
    murder: { label:'Murder / Harm', roles:['method','opportunity','identity','alibi_break'], symbols:['death','blood','punishment','truth'], traits:['Lantern','Mirror'], summary:'This case is about harm, method, opportunity, and damaged alibis.' },
    financial_fraud: { label:'Financial Fraud', roles:['motive','coverup','identity'], symbols:['debt','wealth','trade','authority','ledger'], traits:['Ledger','Lantern'], summary:'This case is about money, false records, motive, and civic cover-up.' },
    disappearance: { label:'Disappearance', roles:['identity','opportunity','world_context'], symbols:['hidden','travel','identity','dreams'], traits:['Mask','Bell','Mirror'], summary:'This case is about absence, identity, and where a person or fact went.' },
    cult_activity: { label:'Cult / False Holiness', roles:['world_context','coverup','lieutenant_trace'], symbols:['false_holiness','doctrine','dreams','hidden'], traits:['Bell','Lantern','Mask'], summary:'This case is about belief, ritual, and the institution hiding behind it.' },
    sabotage: { label:'Sabotage', roles:['method','opportunity','false_lead'], symbols:['ruin','material','deception','trade'], traits:['Lantern','Festival','Ledger'], summary:'This case is about what was broken, how, and who benefits from the break.' },
    political_scandal: { label:'Political Scandal', roles:['coverup','motive','alibi_break'], symbols:['authority','law','secrets','reputation'], traits:['Ledger','Lantern','Mirror'], summary:'This case is about authority, witnesses, and public truth under pressure.' },
    dream_anomaly: { label:'Dream Anomaly', roles:['world_context','lieutenant_trace','identity'], symbols:['dreams','sleep','bell','hidden'], traits:['Bell','Lantern','Mirror'], summary:'This case is about dream evidence becoming civic evidence.' }
  },
  chooseArchetype(provNode, template, grammar) {
    const signal = Utils.unique([...(provNode?.symbols||[]), ...(template?.primarySymbols||[]), ...(template?.secondarySymbols||[]), ...(grammar?.symbols||[])]);
    const weights = Object.entries(this.archetypes).map(([key,a]) => {
      let w = 1 + Utils.overlap(a.symbols, signal).length * 3;
      if ((template?.key||'').includes('ledger') || signal.includes('debt')) w += key==='financial_fraud' ? 4 : 0;
      if ((template?.key||'').includes('dream') || signal.includes('dreams') || signal.includes('sleep')) w += key==='dream_anomaly' ? 4 : 0;
      if ((template?.key||'').includes('relic') || signal.includes('false_holiness')) w += key==='cult_activity' ? 4 : 0;
      if ((template?.key||'').includes('trial') || signal.includes('authority')) w += key==='political_scandal' ? 2 : 0;
      if (signal.includes('ruin') || signal.includes('punishment')) w += key==='murder' || key==='sabotage' ? 2 : 0;
      return { key, def:a, w:w + Math.random() };
    });
    const pick = Utils.weightedPick(weights, x=>x.w) || weights[0];
    return { key:pick.key, ...pick.def };
  },
  rolesForArchetype(key, baseRoles=[]) {
    const a = this.archetypes[key];
    if (!a) return baseRoles;
    const merged = Utils.unique([...a.roles, ...(baseRoles||[])]);
    return merged.slice(0, MODE.name === 'Deep' ? 4 : 3);
  },
  firstLeadsForArchetype(key) {
    const a = this.archetypes[key];
    if (!a) return [];
    return [`Case type: ${a.label}`, `Best first cities: ${(a.traits||[]).join(' / ')}`, a.summary];
  },
  clueBiasForArchetype(key) { return this.archetypes[key]?.roles || []; },
  suspectBiasForArchetype(key) { return this.archetypes[key]?.symbols || []; },
  label(key) { return this.archetypes[key]?.label || 'Unclassified Mystery'; }
};

const CaseQuestionTextBuilder = {
  build(caseNode, grammar, archetype, provinceNode) {
    const prov = provinceNode?.name || 'the province';
    const a = archetype?.key || caseNode?.caseArchetype || '';
    const hidden = grammar?.hiddenTruth?.id || 'hidden pressure';
    const surface = grammar?.falseSurface?.id || 'official story';
    const premise = grammar?.premise?.id || 'anomaly';
    const map = {
      financial_fraud: `Who benefits when ${prov}'s records make obligation look inevitable?`,
      disappearance: `Who or what has been made absent in ${prov}, and who profits from the gap?`,
      cult_activity: `What belief, relic, or ritual in ${prov} is being used to hide the true pattern?`,
      sabotage: `What was broken in ${prov}, and whose story improves because it broke?`,
      political_scandal: `Which authority in ${prov} is protecting the wrong truth?`,
      dream_anomaly: `Whose dream is trying to become public fact in ${prov}?`,
      murder: `Who had the means, opportunity, and motive to turn harm into a civic lie?`
    };
    if (map[a]) return map[a];
    if (premise === 'false_debt') return `Who benefits from a debt that appears before anyone agrees to owe it in ${prov}?`;
    if (hidden === 'coverup_for_lieutenant') return `Which local crime in ${prov} is hiding a lieutenant's larger pattern?`;
    return `What does the ${surface.replace(/_/g,' ')} hide beneath ${prov}'s ${premise.replace(/_/g,' ')}?`;
  }
};

const WhySummarySystem = {
  block(title, lines) { return [title, ...((lines||[]).filter(Boolean).map(x=>`- ${x}`))].join('\n'); },
  afterTheoryResolution(activeCase, suspectNode, outcome, finalConfidence, spreadResult={}) {
    const lines = [];
    if (!activeCase) return '';
    const ready = typeof InvestigationCoherence !== 'undefined' ? InvestigationCoherence.readinessExplanation(activeCase) : null;
    if (ready?.text) lines.push(`Case structure: ${ready.text}`);
    if (suspectNode) {
      const weight = (() => {
        try {
          if (activeCase.lastTheoryWeights && Number.isFinite(activeCase.lastTheoryWeights[suspectNode.id])) {
            return { weight: activeCase.lastTheoryWeights[suspectNode.id] };
          }
          if (typeof ClueReportBuilder !== 'undefined' && typeof ClueReportBuilder.suspectRawScore === 'function') {
            const raw = (activeCase.suspectIds || []).map(id => {
              const s = SCHEngine.getNode(id);
              return s ? { id, raw: ClueReportBuilder.suspectRawScore(activeCase, s) } : null;
            }).filter(Boolean);
            const total = raw.reduce((sum, row) => sum + (Number.isFinite(row.raw) ? row.raw : 0), 0) || 1;
            const hit = raw.find(row => row.id === suspectNode.id);
            if (hit) return { weight: hit.raw / total };
          }
        } catch (err) {
          return null;
        }
        return null;
      })();
      if (weight && Number.isFinite(weight.weight)) lines.push(`${suspectNode.name} carried ${Math.round(weight.weight*100)}% Theory Weight.`);
    }
    if (activeCase.argumentScore !== undefined) lines.push(`Argument strength was ${Utils.describePct(activeCase.argumentScore)}.`);
    if ((spreadResult.notes||[]).length) lines.push('Tarot/NPC notes affected the outcome.');
    lines.push(outcome === 'resolved' ? 'The province accepted the theory cleanly.' : outcome === 'partially_resolved' ? 'The theory landed, but left residue behind.' : 'The theory could not survive the case pressure.');
    return this.block('WHY THIS HAPPENED', lines);
  },
  afterDream(dream, choiceNode=null) {
    const lines = [`Dream symbols: ${(dream?.symbols||[]).join(', ') || 'none'}.`];
    if (choiceNode) lines.push(`You followed ${choiceNode.choiceLabel}; future clues may bend toward ${choiceNode.effect?.nextRoleBias || choiceNode.effect?.nextCityTraitBias || 'its symbol trail'}.`);
    if (dream?.contaminated) lines.push('The dream was contaminated; some help came with noise.');
    else lines.push('The dream cooled the simulation and refreshed your hand.');
    return this.block('DREAM SUMMARY', lines);
  },
  afterConspiracyReaction(node) {
    if (!node) return '';
    return this.block('WHAT CHANGED', [node.text, node.nextHint]);
  },
  afterTarotPower(card, family) {
    return this.block('TAROT POWER SUMMARY', [`${card?.name || 'The card'} acted as ${family}.`, 'Use the next action to exploit the effect before it fades.']);
  }
};

const LieutenantExposureSummary = {
  explain(lt, trigger, overlap, before, after, gain) {
    if (!lt || gain < 0.04) return '';
    const syms = (overlap||[]).join(', ') || 'local pressure';
    return `[LIEUTENANT TRACE] ${lt.name} strengthens because this ${trigger} matched ${syms}. Exposure: ${Utils.describePct(before)} -> ${Utils.describePct(after)}.`;
  }
};

const ConspiracyReactionSystem = {
  ensureState() {
    SCHEngine.state.archives = SCHEngine.state.archives || {};
    SCHEngine.state.archives.conspiracyReactions = Array.isArray(SCHEngine.state.archives.conspiracyReactions) ? SCHEngine.state.archives.conspiracyReactions : [];
    SCHEngine.state.counters = SCHEngine.state.counters || {};
    if (!Number.isFinite(SCHEngine.state.counters.conspiracyReaction)) SCHEngine.state.counters.conspiracyReaction = 0;
  },
  chance(trigger, context={}) {
    let c = trigger === 'clue_found' ? 0.06 : trigger === 'theory_submitted' ? 0.12 : trigger === 'lieutenant_weakened' ? 0.16 : 0.08;
    c += (SCHEngine.state.kingpin.awareness||0) * 0.08 + (SCHEngine.state.kingpin.aggression||0) * 0.06;
    if (context.outcome === 'resolved') c += 0.06;
    if (MODE.name === 'Casual') c *= 0.75;
    if (MODE.name === 'Deep') c *= 1.25;
    return Math.min(0.32, c);
  },
  maybeReact(trigger, context={}) {
    this.ensureState();
    if (Math.random() > this.chance(trigger, context)) return null;
    const activeCase = context.caseId ? SCHEngine.getNode(context.caseId) : (SCHEngine.state.activeCase ? SCHEngine.getNode(SCHEngine.state.activeCase) : null);
    const topSuspect = activeCase?.suspectIds?.map(id=>SCHEngine.getNode(id)).filter(Boolean)[0] || null;
    const kinds = ['rumor_mutates','clue_sabotaged','witness_disappears','suspect_flees','npc_pressured'];
    const kind = Utils.pickRandom(kinds);
    const id = `conspiracy_reaction_${++SCHEngine.state.counters.conspiracyReaction}`;
    const symbols = Utils.unique([...(activeCase?.requiredSymbols||[]).slice(0,2), 'worlock_reaction', kind]);
    let text = 'The Worlock adjusts the pressure around the case.';
    let nextHint = 'Watch the next clue report for shifted theory weights.';
    if (kind === 'witness_disappears') { text = 'A minor witness vanishes before giving a second statement.'; nextHint = 'Alibi Break evidence may become more valuable.'; if (activeCase) activeCase.truthState.ambiguity = Utils.round2(Utils.clamp01(activeCase.truthState.ambiguity + 0.03)); }
    if (kind === 'suspect_flees') { text = `${topSuspect?.name || 'A suspect'} is reported fleeing the province.`; nextHint = 'Flight increases suspicion, but can also indicate a frame.'; if (activeCase) activeCase.truthState.contradiction = Utils.round2(Utils.clamp01(activeCase.truthState.contradiction + 0.02)); }
    if (kind === 'clue_sabotaged') { text = 'A minor clue is found refiled under the wrong authority.'; nextHint = 'Cover-Up or False Lead evidence may appear soon.'; SCHEngine.state.player.temp.nextClueContradictionDelta += 0.03; }
    if (kind === 'rumor_mutates') { text = 'A rumor changes its ending while being repeated.'; nextHint = 'Rumor credibility is less stable until sleep.'; if (SCHEngine.state.rumors[0]) SCHEngine.state.rumors[0].credibility = Utils.round2(Math.max(0.20, (SCHEngine.state.rumors[0].credibility||0.5)-0.15)); }
    if (kind === 'npc_pressured') { text = 'Someone who helped you is suddenly less eager to be seen helping.'; nextHint = 'NPC favors may become more valuable before they become risky.'; }
    const node = { id, type:'conspiracy_reaction', kind, trigger, turn:SCHEngine.state.turn, caseId:context.caseId||SCHEngine.state.activeCase||null, provinceId:context.provinceId||SCHEngine.state.activeProvince||null, suspectId:topSuspect?.id||null, text, nextHint, symbols, links:Utils.unique([context.caseId||SCHEngine.state.activeCase, context.provinceId||SCHEngine.state.activeProvince, topSuspect?.id].filter(Boolean)) };
    SCHEngine.registerNode(node);
    SCHEngine.state.archives.conspiracyReactions.push(Utils.clone(node));
    SCHEngine.narrative(`[CONSPIRACY REACTION] ${text}\n${WhySummarySystem.afterConspiracyReaction(node)}`);
    return node;
  }
};

const DreamChoiceSystem = {
  shouldOfferChoice(dream, activeCase) {
    if (!activeCase) return false;
    const base = MODE.name === 'Casual' ? 0.28 : MODE.name === 'Standard' ? 0.22 : 0.16;
    return Math.random() < base + Math.min(0.10, (dream.symbols||[]).length * 0.02);
  },
  buildChoices(dream, activeCase) {
    const pool = Utils.unique([...(dream.symbols||[]), ...(activeCase.requiredSymbols||[]), 'bell','ledger','witness','mirror']).slice(0,6);
    const map = [
      { key:'follow_bell', label:'Follow the bell under the floor', symbols:['bell','dreams'], effect:{ nextCityTraitBias:'Bell', nextRoleBias:'lieutenant_trace' } },
      { key:'open_ledger', label:'Open the ledger with wet ink', symbols:['debt','authority'], effect:{ nextCityTraitBias:'Ledger', nextRoleBias:'coverup' } },
      { key:'name_witness', label:'Name the faceless witness', symbols:['identity','truth'], effect:{ nextCityTraitBias:'Mask', nextRoleBias:'identity' } },
      { key:'break_mirror', label:'Break the quiet mirror', symbols:['illusion','truth'], effect:{ nextCityTraitBias:'Mirror', nextRoleBias:'alibi_break' } }
    ];
    return map.filter(c => Utils.overlap(c.symbols, pool).length || Math.random()<0.7).slice(0,3);
  },
  async offerChoice(ask, dream, activeCase) {
    if (!this.shouldOfferChoice(dream, activeCase)) return null;
    const choices = this.buildChoices(dream, activeCase);
    if (!choices.length) return null;
    console.log('\nThe dream leaves you three small doors:');
    choices.forEach((c,i)=>console.log(` ${i}. ${c.label}`));
    const idx = parseInt(await ask('Choose a dream path: '), 10);
    const choice = choices[idx];
    if (!choice) return null;
    const id = `dream_choice_${dream.id}_${idx}`;
    const node = { id, type:'dream_choice', dreamId:dream.id, caseId:activeCase.id, provinceId:activeCase.provinceId, choiceKey:choice.key, choiceLabel:choice.label, effect:choice.effect, symbols:Utils.unique([...choice.symbols, 'dream_choice']), links:Utils.unique([dream.id, activeCase.id, activeCase.provinceId]) };
    SCHEngine.registerNode(node);
    activeCase.dreamChoices = activeCase.dreamChoices || [];
    activeCase.dreamChoices.push(node.id);
    activeCase.truthState.confidence = Utils.round2(Utils.clamp01(activeCase.truthState.confidence + (MODE.name==='Casual'?0.035:0.02)));
    activeCase.preferredNextRole = choice.effect.nextRoleBias;
    SCHEngine.state.player.temp.targetSymbolHint = choice.symbols[0];
    SCHEngine.narrative(`[DREAM CHOICE] You ${choice.label.toLowerCase()}. Future evidence leans toward ${choice.effect.nextRoleBias}.`);
    return node;
  }
};

const NPCMemorySystem = {
  ensureState() { SCHEngine.state.npc = SCHEngine.state.npc || {}; SCHEngine.state.npc.memories = SCHEngine.state.npc.memories || {}; },
  remember(npcKey, memory={}) {
    this.ensureState();
    const key = npcKey || 'unknown';
    SCHEngine.state.npc.memories[key] = SCHEngine.state.npc.memories[key] || [];
    const m = { turn:SCHEngine.state.turn, weight:0.5, ...memory };
    SCHEngine.state.npc.memories[key].push(m);
    SCHEngine.state.npc.memories[key] = SCHEngine.state.npc.memories[key].slice(-8);
    const node = { id:`npc_memory_${key}_${SCHEngine.state.turn}_${SCHEngine.state.npc.memories[key].length}`, type:'npc_memory', npcKey:key, symbols:Utils.unique([...(m.symbols||[]), m.type || 'memory','npc_memory']), text:m.summary||'', emotionalTag:m.emotionalTag||'memory', caseId:m.caseId||null, links:Utils.unique([m.caseId, m.npcId].filter(Boolean)) };
    SCHEngine.registerNode(node);
    return node;
  },
  strongestMemory(npcKey) {
    this.ensureState();
    return (SCHEngine.state.npc.memories[npcKey]||[]).sort((a,b)=>(b.weight||0)-(a.weight||0))[0] || null;
  },
  reintroductionLine(npcKey, base='') {
    const m = this.strongestMemory(npcKey);
    if (!m || (m.weight||0) < 0.65) return base;
    if (m.type === 'false_accusation') return `${base} They remember the accusation you failed to make true.`;
    if (m.type === 'cleared_frame') return `${base} They remember you clearing a frame, and hate how grateful that makes them.`;
    if (m.type === 'favor') return `${base} They remember an old favor still breathing in the ledger.`;
    return `${base} They remember you. That is not automatically good.`;
  }
};

const NextMoveAdvisor = {
  advise() {
    const activeCase = SCHEngine.state.activeCase ? SCHEngine.getNode(SCHEngine.state.activeCase) : null;
    if (!activeCase) return this.adviseNoCase();
    return this.adviseCase(activeCase);
  },
  adviseNoCase() {
    if (!SCHEngine.state.activeProvince) return ['Choose a province to begin reading the map.'];
    return ['Allow an anomaly to surface in the current province.', 'Travel to a city first if you want a city trait to shape the case mood.'];
  },
  adviseCase(c) {
    const lines=[];
    const ready = GameLogic.canSubmitTheory(c);
    if (ready) lines.push('The case is ready: submit a theory if your Tarot hand has three cards.');
    else if (typeof InvestigationCoherence !== 'undefined') {
      const missing = InvestigationCoherence.missingRequiredRoles(c);
      if (missing.length) lines.push(`Find missing evidence: ${missing.map(r=>InvestigationCoherence.roleLabels[r]||r).join(', ')}.`);
      if (c.preferredNextRole) lines.push(`Your dream choice suggests chasing ${InvestigationCoherence.roleLabels[c.preferredNextRole]||c.preferredNextRole}.`);
      lines.push(`Best city traits: ${InvestigationCoherence.caseRoutingGuidance(missing.length?missing:c.requiredEvidenceRoles||[])}`);
    }
    if (SCHEngine.state.player.hand.length < 3) lines.push('Sleep to redraw before theory submission.');
    if (typeof LieutenantSystem !== 'undefined' && LieutenantSystem.hasConfrontable()) lines.push('An exposed lieutenant can be confronted, but bring a matching Tarot card.');
    if (typeof NPCSystem !== 'undefined') lines.push('If suspect logic feels shaky, ask Octavia or Candle-Rat to interpret the trail.');
    return lines.slice(0,4);
  },
  print() { console.log('\nNEXT BEST MOVES'); this.advise().forEach((l,i)=>console.log(`${i+1}. ${l}`)); }
};

const GameLogic = {
  makeTruthState(kind = 'routine') {
    if (kind === 'hot') return { confidence: 0.24, contradiction: 0.30, mythPressure: 0.18, crystallization: 0.08, elasticity: 0.48, ambiguity: 0.36 };
    return { confidence: 0.28, contradiction: 0.18, mythPressure: 0.08, crystallization: 0.05, elasticity: 0.35, ambiguity: 0.24 };
  },
  clampTruthState(t) { Object.keys(t).forEach(k => t[k] = Utils.round2(Utils.clamp01(t[k]))); return t; },
  applyResidueToTruthState(baseTruth, residue) {
    if (!residue) return this.clampTruthState(baseTruth);
    const t = baseTruth;
    t.contradiction += residue.truthDelta?.contradiction || 0;
    t.mythPressure += residue.truthDelta?.mythPressure || 0;
    t.ambiguity += residue.truthDelta?.ambiguity || 0;
    t.crystallization += residue.truthDelta?.crystallization || 0;
    return this.clampTruthState(t);
  },
  tarotDelta(card, slot, orientation) {
    const key = orientation === 'reversed' ? 'reversedPolarity' : 'uprightPolarity';
    const p = card[key] || {};
    const delta = { confidence: p.confidence || 0, contradiction: p.contradiction || 0, mythPressure: p.mythPressure || 0, crystallization: p.crystallization || 0, ambiguity: p.ambiguity || 0, elasticity: 0 };
    if (slot === 'cause') delta.mythPressure += 0.02;
    if (slot === 'obstacle') delta.contradiction += 0.03;
    if (slot === 'outcome') delta.crystallization += 0.03;
    return delta;
  },
  buildProvinceSuspects(provNode, residueSymbols = [], caseTemplate = null, requiredSymbols = [], caseGrammar = null) {
    const template = caseTemplate || (typeof ContentLibrary !== 'undefined' ? ContentLibrary.selectCaseTemplate(provNode, [], [], residueSymbols) : null);
    if (typeof NPCSuspectSystem !== 'undefined' && template) {
      return NPCSuspectSystem.buildExpandedSuspectSlate(provNode, template, requiredSymbols, residueSymbols, caseGrammar);
    }
    if (typeof ContentLibrary !== 'undefined' && template) {
      const suspectDefs = ContentLibrary.selectSuspects(provNode, template, requiredSymbols, residueSymbols);
      return suspectDefs.map((s) => {
        const id = `suspect_${Utils.normalizeId(provNode.id)}_${s.key}`;
        const existing = SCHEngine.getNode(id);
        const suspectSymbols = Utils.unique([...(s.symbols || []), ...(residueSymbols || []), 'suspect']);
        if (existing) {
          existing.symbols = Utils.unique([...existing.symbols, ...suspectSymbols]);
          existing.templateBias = Utils.unique([...(existing.templateBias || []), ...((s.templateBias || []))]);
          existing.personalityLine = s.personalityLine;
          existing.role = s.role;
          SCHEngine.updateNode(existing);
          return existing.id;
        }
        SCHEngine.registerNode({ id, type: 'suspect', key: s.key, name: s.name, role: s.role, symbols: suspectSymbols, provinceBias: s.provinceBias || [], templateBias: s.templateBias || [], lieutenantAffinity: s.lieutenantAffinity || [], personalityLine: s.personalityLine, provinceId: provNode.id, links: Utils.unique([provNode.id, `case_template_${template.key}`]) });
        return id;
      });
    }
    const seedSymbol = residueSymbols[0] || provNode.symbols[0];
    const suspectDefs = [
      { key: 'archon', name: 'The Corrupt Archon', symbols: [provNode.symbols[0], 'authority', 'greed', seedSymbol] },
      { key: 'merchant', name: 'The Hollow Merchant', symbols: ['debt', 'trade', 'illusion', seedSymbol] },
      { key: 'witness', name: 'The Blind Witness', symbols: ['dreams', 'truth', 'madness', seedSymbol] }
    ];
    return suspectDefs.map((s) => {
      const id = `suspect_${Utils.normalizeId(provNode.id)}_${s.key}`;
      const existing = SCHEngine.getNode(id);
      if (existing) { existing.symbols = Utils.unique([...existing.symbols, ...s.symbols]); SCHEngine.updateNode(existing); return existing.id; }
      SCHEngine.registerNode({ id, type: 'suspect', name: s.name, symbols: Utils.unique([...s.symbols, 'suspect']), provinceId: provNode.id, links: [provNode.id] });
      return id;
    });
  },

  async generateCase(ask = null) {
    if (!SCHEngine.state.activeProvince) { SCHEngine.narrative('You must choose a province first.'); return null; }
    const provNode = SCHEngine.getNode(SCHEngine.state.activeProvince);
    if (SCHEngine.state.activeCasesByProvince[provNode.id]) {
      SCHEngine.state.activeCase = SCHEngine.state.activeCasesByProvince[provNode.id];
      const existing = SCHEngine.getNode(SCHEngine.state.activeCase);
      SCHEngine.narrative(`The province still seethes with an unresolved case: ${existing.name}.`);
      if (existing?.centralQuestion) SCHEngine.narrative(`Central Question: ${existing.centralQuestion}\n${existing.readinessExplanation || ''}`);
      return existing;
    }
    const residue = SCHEngine.state.provinceResidues[provNode.id] || null;
    const hotSymbols = SCHEngine.getHottestSymbols(2);
    const rumorSymbols = Utils.unique(SCHEngine.state.rumors.filter(r => r.provinceId === provNode.id).flatMap(r => r.symbols)).slice(0,2);
    const residueSymbols = residue ? residue.symbols.slice(0, 2) : [];
    const caseTemplate = (typeof ContentLibrary !== 'undefined') ? ContentLibrary.selectCaseTemplate(provNode, hotSymbols, rumorSymbols, residueSymbols) : null;
    const activeLieutenantKeys = (typeof LieutenantSystem !== 'undefined') ? LieutenantSystem.activeInProvince(provNode.id).map(lt => lt.key) : [];
    const caseGrammar = (typeof CaseGrammarSystem !== 'undefined') ? CaseGrammarSystem.buildGrammar(provNode, caseTemplate, { activeLieutenantKeys, hotSymbols, rumorSymbols, residueSymbols }) : null;
    const caseArchetype = (typeof CaseArchetypeSystem !== 'undefined') ? CaseArchetypeSystem.chooseArchetype(provNode, caseTemplate, caseGrammar) : null;
    let requiredEvidenceRoles = (typeof CaseGrammarSystem !== 'undefined') ? CaseGrammarSystem.requiredRolesForGrammar(caseGrammar, caseTemplate?.key) : ((typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.defaultRolesForTemplate(caseTemplate?.key) : ['motive', 'method', 'identity']);
    if (typeof CaseArchetypeSystem !== 'undefined' && caseArchetype) requiredEvidenceRoles = CaseArchetypeSystem.rolesForArchetype(caseArchetype.key, requiredEvidenceRoles);
    const centralQuestion = (typeof CaseQuestionTextBuilder !== 'undefined') ? CaseQuestionTextBuilder.build(null, caseGrammar, caseArchetype, provNode) : ((typeof CaseGrammarSystem !== 'undefined') ? CaseGrammarSystem.centralQuestionForGrammar(caseGrammar, caseTemplate, provNode) : ((typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.centralQuestionFor(caseTemplate, provNode) : `What is happening in ${provNode.name}?`));
    const theoryBoard = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.makeTheoryBoard(requiredEvidenceRoles) : null;
    const initialReadiness = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.readinessExplanation({ requiredEvidenceRoles, theoryBoard }).text : 'No structured evidence yet.';
    const requiredSymbols = caseTemplate ? Utils.unique([...ContentLibrary.buildRequiredSymbols(provNode, caseTemplate, hotSymbols, residueSymbols, rumorSymbols), ...(caseGrammar?.symbols||[])]).slice(0,4) : Utils.unique([provNode.symbols[0], provNode.symbols[1], ...hotSymbols, ...residueSymbols, ...rumorSymbols]).slice(0, 4);
    const caseSymbols = Utils.unique([...(provNode.symbols || []), ...requiredSymbols, ...((caseTemplate && caseTemplate.primarySymbols) || []), ...(caseGrammar?.symbols||[]), 'case']);
    const suspectIds = this.buildProvinceSuspects(provNode, residueSymbols, caseTemplate, requiredSymbols, caseGrammar);
    const suspectProfiles = (typeof SuspectLogicSystem !== 'undefined') ? SuspectLogicSystem.assignProfiles({ requiredEvidenceRoles }, suspectIds, caseGrammar) : {};
    const truthArc = (typeof CaseGrammarSystem !== 'undefined') ? CaseGrammarSystem.truthArcForGrammar(caseGrammar) : [];
    const coherenceContract = (typeof CaseGrammarSystem !== 'undefined') ? CaseGrammarSystem.coherenceContract(caseGrammar, requiredEvidenceRoles) : null;
    const caseNPCAnchors = (typeof NPCAnchorSystem !== 'undefined') ? NPCAnchorSystem.assign({ requiredEvidenceRoles }, provNode, caseGrammar, suspectIds) : [];
    const kind = (SCHEngine.state.turn > 2 || SCHEngine.state.kingpin.exposure > 0.25 || residue) ? 'hot' : 'routine';
    const truthState = this.applyResidueToTruthState(this.makeTruthState(kind), residue);
    if (caseTemplate && caseTemplate.key === 'convenient_suspect') truthState.contradiction = Utils.round2(Utils.clamp01(truthState.contradiction + 0.03));
    if (caseTemplate && caseTemplate.key === 'silent_bell') truthState.mythPressure = Utils.round2(Utils.clamp01(truthState.mythPressure + 0.03));
    SCHEngine.state.counters.case += 1;
    const caseName = caseTemplate ? ContentLibrary.buildCaseTitle(caseTemplate, provNode, requiredSymbols) : `The Anomaly of ${provNode.name}`;
    const newCase = SCHEngine.registerNode({ id: `case_${SCHEngine.state.counters.case}`, type: 'case', name: caseName, templateKey: caseTemplate ? caseTemplate.key : 'anomaly', templateName: caseTemplate ? caseTemplate.titlePattern : 'Anomaly', caseArchetype: caseArchetype ? caseArchetype.key : 'unclassified', caseArchetypeLabel: caseArchetype ? caseArchetype.label : 'Unclassified Mystery', caseArchetypeSummary: caseArchetype ? caseArchetype.summary : '', provinceId: provNode.id, symbols: caseSymbols, requiredSymbols, requiredEvidenceRoles, centralQuestion, theoryBoard, readinessExplanation: initialReadiness, argumentScore: 0, caseGrammar, truthArc, currentArcStage: 0, coherenceContract, caseNPCAnchors, npcCaseRoles: {}, suspectProfiles, suspectIds, truthState, volatility: Utils.round2((0.20 + Math.random() * 0.25 + (residue ? 0.08 : 0) + SCHEngine.state.kingpin.aggression * 0.10 + (caseTemplate && caseTemplate.key === 'festival_missing_names' ? 0.04 : 0)) * MODE.caseVolatilityMultiplier), clues: [], investigatedCities: [], mirrorPressure: 0, bellPrepared: false, resolved: false, carryoverSource: residue ? residue.id : null, links: Utils.unique([...suspectIds, provNode.id, ...(caseNPCAnchors||[]).map(a=>a.npcId), caseTemplate ? `case_template_${caseTemplate.key}` : null].filter(Boolean)) });
    if (typeof CoherenceValidator !== 'undefined') newCase.coherenceValidation = CoherenceValidator.validateCase(newCase);
    if (typeof NPCSuspectSystem !== 'undefined') {
      newCase.npcCaseRoles = NPCSuspectSystem.caseRolesFor(newCase);
      newCase.suspectSelectionReport = Utils.clone(SCHEngine.state.lastSuspectSelectionReport || {});
    }
    SCHEngine.updateNode(newCase);
    SCHEngine.state.activeCasesByProvince[provNode.id] = newCase.id;
    SCHEngine.state.activeCase = newCase.id;
    const residueMsg = residue ? `
Old unresolved tones return: [${residue.symbols.join(', ')}].` : '';
    const tag = FUN_STRINGS.provinceTags[provNode.id] || 'Everything is terrible, but tastefully so.';
    const premise = caseTemplate ? ContentLibrary.buildCaseIntro(caseTemplate, provNode) : `A semantic anomaly rises in ${provNode.name}.`;
    const suspectPreview = suspectIds.map(id => SCHEngine.getNode(id)?.name).filter(Boolean).join(', ');
    const roleText = requiredEvidenceRoles.map(r => InvestigationCoherence.roleLabels[r] || r).join(', ');
    const grammarText = caseGrammar ? `
Case Grammar: ${caseGrammar.summary}.
Truth Arc: ${TruthArcSystem.summary(newCase)}.` : '';
    const anchorText = caseNPCAnchors.length ? `
Case NPC anchors: ${caseNPCAnchors.map(a => `${a.npcName} (${a.anchorType})`).join(', ')}.` : '';
    const routingText = (typeof InvestigationCoherence !== 'undefined') ? `
Investigation routing: ${InvestigationCoherence.caseRoutingGuidance(requiredEvidenceRoles)}.` : '';
    newCase.caseBriefDetails = {
      provinceTag: tag,
      premise,
      suspectPreview,
      roleText,
      grammarText,
      anchorText,
      routingText,
      residueMsg,
      rawSymbols: requiredSymbols.slice(),
      caseArchetype: caseArchetype ? Utils.clone(caseArchetype) : null,
      npcAnchors: Utils.clone(caseNPCAnchors || [])
    };
    SCHEngine.updateNode(newCase);
    SCHEngine.narrative(
      (typeof CaseIntroBuilder !== 'undefined')
        ? CaseIntroBuilder.build(newCase, provNode, { residue })
        : `${premise}
Central Question: ${centralQuestion}
Needed Evidence: ${roleText}
Suspects now on the board: ${suspectPreview}.
${newCase.readinessExplanation}`
    );
    
if (typeof NPCSystem !== 'undefined') NPCSystem.runCaseOpeningHooks(newCase);
    if (ask) await NPCSystem.maybeEncounter('case', ask);
    return newCase;
  },
  evaluateClue(candidateSymbols, cityNode, activeCase) {
    const truth = activeCase.truthState;
    const clueCaseSimilarity = Utils.jaccardSimilarity(candidateSymbols, activeCase.requiredSymbols);
    const cityCaseSimilarity = Utils.jaccardSimilarity(cityNode.symbols, activeCase.symbols);
    const freshnessNeeded = activeCase.requiredSymbols.filter(sym => !activeCase.clues.some(c => c.symbols.includes(sym)));
    const novelty = candidateSymbols.filter(sym => freshnessNeeded.includes(sym)).length / Math.max(1, activeCase.requiredSymbols.length);
    const pending = SCHEngine.state.kingpin.pending;
    let reliability = Utils.clamp01(0.45 + cityCaseSimilarity * 0.25 + clueCaseSimilarity * 0.20 - truth.contradiction * 0.10 + pending.clueReliabilityMod + SCHEngine.state.player.temp.nextClueReliability);
    let evidenceDelta = Utils.clamp01(clueCaseSimilarity * 0.45 + novelty * 0.30 + cityCaseSimilarity * 0.15 + reliability * 0.10 + SCHEngine.state.player.temp.nextInvestigateEvidence);
    let contradiction = Utils.clamp01((1 - clueCaseSimilarity) * 0.35 + truth.ambiguity * 0.10 + pending.clueContradictionMod + SCHEngine.state.player.temp.nextClueContradictionDelta);

    // City traits
    if (cityNode.cityTrait === 'Mirror') reliability = Utils.clamp01(reliability + 0.05);
    if (cityNode.cityTrait === 'Festival') contradiction = Utils.clamp01(contradiction + 0.04);
    if (cityNode.cityTrait === 'Ledger') {
      const materialHit = candidateSymbols.some(s => ['debt','greed','trade','wealth','authority'].includes(s));
      if (materialHit) evidenceDelta = Utils.clamp01(evidenceDelta + 0.08);
    }
    if (cityNode.cityTrait === 'Mask') {
      const suspect = SCHEngine.getNode(Utils.pickRandom(activeCase.suspectIds));
      const suspectSymbol = Utils.pickRandom((suspect?.symbols || []).filter(s => s !== 'suspect'));
      if (suspectSymbol) candidateSymbols = Utils.unique([...candidateSymbols, suspectSymbol]).slice(0, 3);
    }

    // Rumors
    const rumors = RumorSystem.getRelevant(cityNode, activeCase);
    if (rumors.length > 0) {
      rumors.forEach(r => {
        if (r.falseHint) contradiction = Utils.clamp01(contradiction + 0.03);
        else {
          reliability = Utils.clamp01(reliability + 0.05 * r.credibility);
          if (Utils.overlap(r.symbols, activeCase.requiredSymbols).length > 0) evidenceDelta = Utils.clamp01(evidenceDelta + 0.05);
        }
      });
    }

    // Events
    const evt = SCHEngine.state.currentEvent;
    if (evt?.kind === 'festival_of_excess') {
      evidenceDelta = Utils.clamp01(evidenceDelta + 0.05);
      contradiction = Utils.clamp01(contradiction + 0.03);
      if (cityNode.cityTrait === 'Festival') evidenceDelta = Utils.clamp01(evidenceDelta + 0.05);
    }
    if (evt?.kind === 'silence_before_bells' && ['Bell','Lantern'].includes(cityNode.cityTrait)) {
      reliability = Utils.clamp01(reliability + 0.06);
      contradiction = Utils.clamp01(contradiction - 0.03);
    }

    if (typeof LieutenantSystem !== 'undefined') {
      const ltMods = LieutenantSystem.clueModifiers(cityNode, activeCase, candidateSymbols);
      reliability = Utils.clamp01(reliability + ltMods.reliability);
      evidenceDelta = Utils.clamp01(evidenceDelta + ltMods.evidenceDelta);
      contradiction = Utils.clamp01(contradiction + ltMods.contradiction);
      if (ltMods.notes.length) activeCase.lieutenantPressureNotes = ltMods.notes;
    }
    return { clueCaseSimilarity, cityCaseSimilarity, novelty, reliability, evidenceDelta, contradiction, candidateSymbols };
  },

  async cognitiveFriction(ask, activeCase, cityNode) {
    let frictionFactor = MODE.frictionMultiplier;
    if (cityNode.cityTrait === 'Lantern') frictionFactor *= 0.75;
    if (SCHEngine.state.currentEvent?.kind === 'silence_before_bells' && ['Bell','Lantern'].includes(cityNode.cityTrait)) frictionFactor *= 0.85;
    if (Math.random() >= activeCase.volatility * frictionFactor) return { proceeded: true, reliabilityMod: 0, note: null };

    SCHEngine.narrative(`\x1b[31m[COGNITIVE FRICTION]\x1b[0m The logic of ${cityNode.name} resists your interpretation and makes a face about it.`);
    console.log('Choose a response:');
    console.log(`  1. Burn a Tarot card to stabilize the city (${MODE.burnAlwaysHelps ? 'always helps, returns later' : 'risky, but stylish'})`);
    console.log(`  2. Spend ${Math.round(Math.max(0.02, MODE.insightCost - (cityNode.cityTrait === 'Lantern' ? 0.02 : 0)) * 100)}% Insight to steady your reasoning`);
    console.log('  3. Accept corruption and continue');
    console.log('  4. Retreat and lose the action');
    const choice = await ask('Response: ');
    switch (choice.trim()) {
      case '1': {
        if (SCHEngine.state.player.hand.length === 0) {
          SCHEngine.narrative('Your hand is empty. You cannot burn what you do not hold. Tragic. Poetic. Unhelpful.');
          return { proceeded: false, reliabilityMod: 0, note: 'empty_hand' };
        }
        console.log('\nTarot Hand:');
        SCHEngine.state.player.hand.forEach((c, i) => console.log(`  ${i}. ${TarotBuilder.cardLabel(c)} [${TarotBuilder.cardEffectiveSymbols(c).join(', ')}]`));
        const idx = parseInt(await ask('Select card number to burn: '), 10);
        const burned = TarotBuilder.burnCardAt(idx, 'cognitive_friction');
        if (!burned) {
          SCHEngine.narrative('Invalid card selection. The city remains hostile and a little smug.');
          return { proceeded: false, reliabilityMod: 0, note: 'invalid_card' };
        }
        const fit = Utils.jaccardSimilarity(TarotBuilder.cardEffectiveSymbols(burned), cityNode.symbols.concat(activeCase.requiredSymbols));
        if (MODE.burnAlwaysHelps) {
          SCHEngine.narrative(`You burn ${burned.name}. The flare steadies the city and buys you a little clarity.`);
          SCHEngine.state.player.insight = Utils.round2(Utils.clamp01(SCHEngine.state.player.insight + 0.04));
          TarotBuilder.cardEffectiveSymbols(burned).forEach(sym => SCHEngine.adjustSymbolHeat(sym, 0.10));
          return { proceeded: true, reliabilityMod: fit >= 0.10 ? MODE.burnGood : MODE.burnBad, note: 'stabilized' };
        }
        if (fit >= 0.10) {
          SCHEngine.narrative(`You burn ${burned.name}. It falls into the discard cycle rather than vanishing; its symbols still map to the city.`);
          SCHEngine.state.player.insight = Utils.round2(Utils.clamp01(SCHEngine.state.player.insight + 0.05));
          TarotBuilder.cardEffectiveSymbols(burned).forEach(sym => SCHEngine.adjustSymbolHeat(sym, 0.12));
          return { proceeded: true, reliabilityMod: MODE.burnGood, note: 'stabilized' };
        }
        SCHEngine.narrative(`${burned.name} fails to map cleanly to the paradox. It survives in the discard pile, but the city scorches your logic.`);
        SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption + 0.12));
        return { proceeded: true, reliabilityMod: MODE.burnBad, note: 'misfire' };
      }
      case '2': {
        const cost = Math.max(0.02, MODE.insightCost - (cityNode.cityTrait === 'Lantern' ? 0.02 : 0));
        if (SCHEngine.state.player.insight < cost) {
          SCHEngine.narrative('You do not have enough Insight. The paradox applauds your budgeting.');
          return { proceeded: false, reliabilityMod: 0, note: 'not_enough_insight' };
        }
        SCHEngine.state.player.insight = Utils.round2(Utils.clamp01(SCHEngine.state.player.insight - cost));
        SCHEngine.narrative('You spend Insight to hold the contradictory meanings in suspension. Professionalism, somehow.');
        return { proceeded: true, reliabilityMod: MODE.insightBonus, note: 'insight_spent' };
      }
      case '3':
        SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption + MODE.corruptionGain));
        SCHEngine.narrative('You force yourself through the contradiction and let some corruption in. Not ideal, but brisk.');
        return { proceeded: true, reliabilityMod: MODE.corruptionRelMod, note: 'corruption_taken' };
      case '4':
        SCHEngine.narrative('You retreat before the paradox fully coheres. Sensible. Cowardly. Sensibly cowardly.');
        return { proceeded: false, reliabilityMod: 0, note: 'retreat' };
      default:
        SCHEngine.narrative('Indecision is itself a retreat. The city files this under “probably not a wizard.”');
        return { proceeded: false, reliabilityMod: 0, note: 'retreat' };
    }
  },

  resetTempActionMods() {
    const temp = SCHEngine.state.player.temp;
    temp.nextInvestigateEvidence = 0;
    temp.nextClueReliability = 0;
    temp.nextClueContradictionDelta = 0;
    temp.protectFromFraming = false;
    temp.auditFocus = null;
  },

  async investigate(ask) {
    if (!SCHEngine.state.activeCity || !SCHEngine.state.activeCase) { SCHEngine.narrative('Travel to a city and ensure a case is active.'); return; }
    const activeCase = SCHEngine.getNode(SCHEngine.state.activeCase);
    const cityNode = SCHEngine.getNode(SCHEngine.state.activeCity);
    if (!activeCase || !cityNode) return;

    const friction = await this.cognitiveFriction(ask, activeCase, cityNode);
    if (!friction.proceeded) { KingpinAI.turn('investigate_retreat'); return; }

    const cityOverlap = Utils.overlap(activeCase.symbols, cityNode.symbols);
    const hotSymbols = SCHEngine.getHottestSymbols(2);
    const residue = SCHEngine.state.provinceResidues[activeCase.provinceId];
    const rumors = RumorSystem.getRelevant(cityNode, activeCase);
    const rumorSymbols = Utils.unique(rumors.flatMap(r => r.symbols)).slice(0, 2);
    const freshCaseSymbols = activeCase.requiredSymbols.filter(sym => !activeCase.clues.some(c => (c.symbols || []).includes(sym)));
    const templateSignal = (activeCase.templateKey && activeCase.templateKey !== 'anomaly') ? (Utils.pickRandom(freshCaseSymbols) || Utils.pickRandom(activeCase.requiredSymbols)) : null;
    const rawSymbols = Utils.unique([...cityOverlap.slice(0, 2), ...(templateSignal ? [templateSignal] : []), ...hotSymbols.slice(0, 1), ...rumorSymbols.slice(0, 1), ...(residue ? residue.symbols.slice(0, 1) : [])]).filter(s => !['province','city','settlement'].includes(s));
    let clueSymbols = rawSymbols.length > 0 ? rawSymbols : cityNode.symbols.slice(0, 2);

    if (SCHEngine.state.player.temp.targetSymbolHint && !clueSymbols.includes(SCHEngine.state.player.temp.targetSymbolHint) && Math.random() < 0.65) {
      clueSymbols = Utils.unique([SCHEngine.state.player.temp.targetSymbolHint, ...clueSymbols]).slice(0, 3);
    }

    const analysis = this.evaluateClue(clueSymbols, cityNode, activeCase);
    clueSymbols = analysis.candidateSymbols || clueSymbols;
    analysis.reliability = Utils.clamp01(analysis.reliability + friction.reliabilityMod);
    analysis.evidenceDelta = Utils.clamp01(analysis.evidenceDelta + friction.reliabilityMod * 0.20);

    const deadEndThreshold = (SCHEngine.state.currentEvent?.kind === 'silence_before_bells' && ['Bell','Lantern'].includes(cityNode.cityTrait)) ? 0.10 : 0.15;
    if (analysis.cityCaseSimilarity < deadEndThreshold && cityNode.cityTrait !== 'Festival') {
      SCHEngine.narrative(`DEAD END: ${cityNode.name} holds no coherent resonance with the anomaly.`);
      KingpinAI.turn('dead_end');
      KingpinAI.clearTransientPending();
      this.resetTempActionMods();
      return;
    }

    const exhausted = activeCase.investigatedCities.includes(cityNode.id);
    const exhaustionMultiplier = exhausted ? 0.35 : 1.0;
    SCHEngine.state.counters.clue += 1;
    const clue = {
      id: `clue_${SCHEngine.state.counters.clue}`,
      cityId: cityNode.id,
      cityName: cityNode.name,
      cityTrait: cityNode.cityTrait,
      symbols: clueSymbols,
      reliability: Utils.round2(analysis.reliability),
      evidenceDelta: Utils.round2(analysis.evidenceDelta * exhaustionMultiplier),
      contradiction: Utils.round2(analysis.contradiction),
      clueCaseSimilarity: Utils.round2(analysis.clueCaseSimilarity),
      novelty: Utils.round2(analysis.novelty),
      exhausted,
      text: ''
    };
    if (typeof ContentLibrary !== 'undefined') clue.material = ContentLibrary.buildMaterialClue(clue, cityNode, activeCase);
    if (clue.material) { clue.evidenceRole = clue.material.evidenceRole || null; clue.secondaryEvidenceRoles = clue.material.secondaryEvidenceRoles || []; clue.suspectEffect = clue.material.suspectEffect || null; clue.evidenceDNA = clue.material.evidenceDNA || clue.evidenceDNA || null; clue.tags = clue.material.tags || []; }
    else clue.tags = [];
    if (typeof CoherenceValidator !== 'undefined') CoherenceValidator.validateClue(activeCase, clue);
    clue.text = ClueTextBuilder.build(clue, cityNode, activeCase);
    clue.links = Utils.unique([activeCase.id, cityNode.id, clue.material?.linkedSuspectId, clue.suspectEffect?.suspectId, activeCase.templateKey ? `case_template_${activeCase.templateKey}` : null].filter(Boolean));
    SCHEngine.registerNode(Object.assign({}, clue, { type: 'clue', caseId: activeCase.id, provinceId: activeCase.provinceId }));
    activeCase.clues.push(clue);
    if (typeof InvestigationCoherence !== 'undefined') InvestigationCoherence.fileClue(activeCase, clue);
    const advancedStage = (typeof TruthArcSystem !== 'undefined') ? TruthArcSystem.advance(activeCase, clue) : null;
    if (!exhausted) activeCase.investigatedCities.push(cityNode.id);

    const t = activeCase.truthState;
    t.confidence += clue.evidenceDelta * clue.reliability * MODE.clueConfidenceFactor;
    t.contradiction += clue.contradiction * MODE.clueContradictionFactor;
    t.mythPressure += clue.symbols.length * 0.015;
    t.crystallization += clue.evidenceDelta * MODE.clueCrystallizationFactor;
    t.ambiguity += (1 - clue.reliability) * 0.08;
    this.clampTruthState(t);

    clue.symbols.forEach(sym => SCHEngine.adjustSymbolHeat(sym, 0.14));
    cityNode.symbols.forEach(sym => SCHEngine.adjustSymbolHeat(sym, 0.05));

    const freshHits = clue.symbols.filter(sym => activeCase.requiredSymbols.includes(sym));
    const traitNotes = [];
    if (cityNode.cityTrait === 'Mirror') {
      activeCase.mirrorPressure = Utils.round2(activeCase.mirrorPressure + 0.20);
      traitNotes.push('Mirror pressure builds around your future spread.');
    }
    if (cityNode.cityTrait === 'Bell') {
      activeCase.bellPrepared = true;
      SCHEngine.state.pendingSleepBonus = { type: 'bell', caseId: activeCase.id, provinceId: activeCase.provinceId };
      traitNotes.push('The city rings in advance of sleep.');
    }
    if (cityNode.cityTrait === 'Ledger' && SCHEngine.state.kingpin.pending.framedSuspectId && Math.random() < 0.50) {
      traitNotes.push('Ledger arithmetic exposes a suspect who looks almost too convenient.');
      SCHEngine.state.kingpin.pending.framedSuspectId = null;
    }
    if (cityNode.cityTrait === 'Festival') {
      traitNotes.push('Festival chaos helps you find something before you understand it.');
    }
    if (cityNode.cityTrait === 'Mask' && SCHEngine.state.kingpin.pending.framedSuspectId) {
      traitNotes.push('This city loves convenient villains. Be careful.');
    }
    if (activeCase.lieutenantPressureNotes && activeCase.lieutenantPressureNotes.length) {
      traitNotes.push(...activeCase.lieutenantPressureNotes);
      activeCase.lieutenantPressureNotes = [];
    }
    if (advancedStage) traitNotes.push(`Truth arc advances to ${advancedStage.stage}.`);
    if (clue.evidenceDNA?.cityMeaningNotes?.length) traitNotes.push(...clue.evidenceDNA.cityMeaningNotes);
    if (clue.coherenceIssues && clue.coherenceIssues.length) traitNotes.push(`Coherence warning: ${clue.coherenceIssues.join(', ')}.`);

    const reportText = (typeof ClueReportBuilder !== 'undefined')
      ? ClueReportBuilder.build(clue, activeCase, cityNode, { exhausted, freshHits, traitNotes })
      : clue.text;
    SCHEngine.narrative(reportText);

    if (freshHits.length >= 2 && clue.reliability >= 0.70) SCHEngine.narrative(`\x1b[32m[COMBO]\x1b[0m ${Utils.pickRandom(FUN_STRINGS.comboCheers)}`);
    if (this.canSubmitTheory(activeCase)) SCHEngine.narrative(`\x1b[32m[READY]\x1b[0m ${activeCase.readinessExplanation || 'You have enough structured evidence to submit a theory.'}`);

    if (typeof LieutenantSystem !== 'undefined') LieutenantSystem.observe('clue', clue.symbols, { provinceId: activeCase.provinceId, cityId: cityNode.id, caseId: activeCase.id, clueId: clue.id });
    if (typeof ConspiracyReactionSystem !== 'undefined') ConspiracyReactionSystem.maybeReact('clue_found', { provinceId: activeCase.provinceId, cityId: cityNode.id, caseId: activeCase.id, clueId: clue.id });
    if (SCHEngine.state.player.temp.targetSymbolHint && clue.symbols.includes(SCHEngine.state.player.temp.targetSymbolHint)) SCHEngine.state.player.temp.targetSymbolHint = null;
    this.resetTempActionMods();
    KingpinAI.turn('investigate');
    KingpinAI.clearTransientPending();
  },

  canSubmitTheory(activeCase) {
    const uniqueClueSymbols = Utils.unique(activeCase.clues.flatMap(c => c.symbols));
    const coverage = activeCase.requiredSymbols.filter(sym => uniqueClueSymbols.includes(sym)).length / Math.max(1, activeCase.requiredSymbols.length);
    const cities = activeCase.investigatedCities.length;
    const clues = activeCase.clues.length;
    const coherenceOk = activeCase.truthState.confidence >= MODE.minConfidence;
    const strongCase = MODE.strongCaseEnabled && clues >= MODE.strongClues && coverage >= MODE.strongCoverage && activeCase.truthState.confidence >= MODE.strongConfidence;
    const structural = (typeof CoherenceValidator !== 'undefined') ? CoherenceValidator.validateTheoryBoard(activeCase) : { ok:true, readiness:{text:''}, argumentScore:0.5 };
    activeCase.argumentScore = structural.argumentScore;
    const effectiveMinCoverage = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.effectiveCoverageRequirement(activeCase, coverage) : MODE.minCoverage;
    activeCase.effectiveMinCoverage = effectiveMinCoverage;
    if (strongCase && structural.ok) return true;
    const baseReady = cities >= MODE.minCities && clues >= MODE.minClues && coverage >= effectiveMinCoverage && coherenceOk;
    const ready = baseReady && structural.ok;
    if (!ready && typeof InvestigationCoherence !== 'undefined') { const readiness = InvestigationCoherence.readinessExplanation(activeCase); activeCase.readinessExplanation = `${readiness.text} Coverage: ${Utils.describePct(coverage)} / ${Utils.describePct(effectiveMinCoverage)}. Argument coherence: ${Utils.describePct(structural.argumentScore || 0)}.`; }
    return ready;
  },

  buildTheoryScore(activeCase, suspectNode) {
    const clueSymbols = Utils.unique(activeCase.clues.flatMap(c => c.symbols));
    const suspectMatch = Utils.jaccardSimilarity(suspectNode.symbols, clueSymbols);
    const caseMatch = Utils.jaccardSimilarity(suspectNode.symbols, activeCase.requiredSymbols);
    const clueSupport = activeCase.clues.reduce((acc, c) => acc + Utils.jaccardSimilarity(c.symbols, suspectNode.symbols) * c.reliability, 0) / Math.max(1, activeCase.clues.length);
    const framed = SCHEngine.state.kingpin.pending.framedSuspectId === suspectNode.id;
    const frameMod = framed ? 0.08 : 0;
    const profile = (typeof SuspectLogicSystem !== 'undefined') ? SuspectLogicSystem.profileFor(activeCase, suspectNode.id) : null;
    // Theory Fairness Pass: a framed suspect should not be an automatic scoring trap.
    // Strong evidence can expose the frame as a partial truth rather than collapsing into a false accusation.
    const profileMod = profile?.trueRelation === 'culprit' ? 0.06 : profile?.trueRelation === 'framed' ? -0.01 : profile?.trueRelation === 'coverup_actor' ? 0.025 : 0;
    const argumentScore = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.argumentScore(activeCase, suspectNode.id) : 0;
    const argumentBonus = (typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.argumentBonus(argumentScore) : 0;
    return { suspectMatch, caseMatch, clueSupport, argumentScore, argumentBonus, profileRelation:profile?.trueRelation||'unknown', coherence: Utils.round2((suspectMatch * 0.30) + (caseMatch * 0.23) + (clueSupport * 0.23) + (argumentScore * 0.18) + profileMod + frameMod + SCHEngine.state.player.temp.theoryBoost), framed };
  },

  evaluateSpreadSynergy(spread) {
    const symbols = Utils.unique(spread.flatMap(s => TarotBuilder.cardEffectiveSymbols(s.card)));
    const reversedCount = spread.filter(s => s.orientation === 'reversed').length;
    const synergy = { confidence: 0, contradiction: 0, mythPressure: 0, crystallization: 0, ambiguity: 0, resonanceBonus: 0, notes: [] };
    if (symbols.includes('illusion') && symbols.includes('truth')) { synergy.contradiction += 0.05; synergy.mythPressure += 0.03; synergy.ambiguity += 0.03; synergy.notes.push('Moon/Justice-style conflict detected.'); }
    if (symbols.includes('ruin') && symbols.includes('greed')) { synergy.mythPressure += 0.05; synergy.crystallization += 0.04; synergy.notes.push('Tower/Devil collapse current detected.'); }
    if (symbols.includes('willpower') && symbols.includes('truth')) { synergy.confidence += 0.04; synergy.crystallization += 0.03; synergy.notes.push('Magician/Justice coherence surge detected.'); }
    if (symbols.includes('doctrine') && symbols.includes('truth')) { synergy.confidence += 0.02; synergy.crystallization += 0.03; synergy.notes.push('Hierophant/Justice doctrinal lock detected.'); }
    if (symbols.includes('suspension') && symbols.includes('revelation')) { synergy.mythPressure += 0.04; synergy.ambiguity += 0.03; synergy.notes.push('Hanged Man/Tower paradox fracture detected.'); }
    if (symbols.includes('ending') && symbols.includes('completion')) { synergy.crystallization += 0.05; synergy.confidence += 0.03; synergy.notes.push('Death/World closure current detected.'); }
    if (reversedCount >= 2) { synergy.contradiction += 0.05; synergy.ambiguity += 0.04; synergy.resonanceBonus -= 0.03; synergy.notes.push('Multiple reversed cards destabilize interpretation.'); }
    return synergy;
  },

  applySpread(activeCase, suspectNode, spread) {
    const t = Utils.clone(activeCase.truthState);
    let resonance = 0;
    const notes = [];
    spread.forEach((entry) => {
      const effectiveSymbols = TarotBuilder.cardEffectiveSymbols(entry.card);
      const delta = this.tarotDelta(entry.card, entry.slot, entry.orientation);
      const overlapCase = Utils.jaccardSimilarity(effectiveSymbols, activeCase.requiredSymbols);
      const overlapSuspect = Utils.jaccardSimilarity(effectiveSymbols, suspectNode.symbols);
      resonance += overlapCase * 0.60 + overlapSuspect * 0.40;
      t.confidence += (delta.confidence || 0) + overlapCase * 0.04;
      t.contradiction += (delta.contradiction || 0) + (entry.slot === 'obstacle' ? overlapCase * 0.03 : 0);
      t.mythPressure += (delta.mythPressure || 0) + overlapCase * 0.02;
      t.crystallization += (delta.crystallization || 0) + (entry.slot === 'outcome' ? overlapSuspect * 0.03 : 0);
      t.ambiguity += (delta.ambiguity || 0) + (entry.slot === 'cause' ? overlapCase * 0.02 : 0);
      if (entry.card.contamination && entry.card.contamination.corruptionTax > 0) {
        SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption + entry.card.contamination.corruptionTax));
        notes.push(`${entry.card.name} exacts a corruption tax.`);
      }
      notes.push(`${entry.slot}: ${entry.card.name} (${entry.orientation})`);
      effectiveSymbols.forEach(sym => SCHEngine.adjustSymbolHeat(sym, 0.18));
    });
    const synergy = this.evaluateSpreadSynergy(spread);
    t.confidence += synergy.confidence;
    t.contradiction += synergy.contradiction;
    t.mythPressure += synergy.mythPressure;
    t.crystallization += synergy.crystallization;
    t.ambiguity += synergy.ambiguity;
    resonance += synergy.resonanceBonus;
    notes.push(...synergy.notes);
    this.clampTruthState(t);
    return { updatedTruth: t, resonance: Utils.clamp01(resonance / 3), notes };
  },

  applyCaseCarryover(activeCase, outcome) {
    const provinceId = activeCase.provinceId;
    const clueSymbols = Utils.unique(activeCase.clues.flatMap(c => c.symbols));
    const residueSymbols = Utils.unique([...activeCase.requiredSymbols, ...clueSymbols.slice(0, 2), ...(activeCase.finalSuspectId ? (SCHEngine.getNode(activeCase.finalSuspectId)?.symbols || []).slice(0, 1) : [])]).slice(0, 4);
    SCHEngine.state.counters.residue += 1;
    if (outcome === 'resolved') {
      SCHEngine.state.provinceResidues[provinceId] = { id: `residue_${SCHEngine.state.counters.residue}`, symbols: residueSymbols.slice(0, 2), truthDelta: { contradiction: 0.02, mythPressure: 0.02, ambiguity: 0.01, crystallization: 0.00 }, outcome, intensity: 0.15 };
      return;
    }
    const intensity = outcome === 'partially_resolved' ? 0.35 : 0.50;
    SCHEngine.state.provinceResidues[provinceId] = { id: `residue_${SCHEngine.state.counters.residue}`, symbols: residueSymbols, truthDelta: { contradiction: outcome === 'partially_resolved' ? 0.05 : 0.08, mythPressure: outcome === 'partially_resolved' ? 0.06 : 0.10, ambiguity: outcome === 'partially_resolved' ? 0.04 : 0.07, crystallization: outcome === 'partially_resolved' ? 0.01 : 0.02 }, outcome, intensity };
  },

  async resolveTheory(ask) {
    const activeCase = SCHEngine.getNode(SCHEngine.state.activeCase);
    if (!activeCase) { SCHEngine.narrative('No active case.'); return; }
    if (!this.canSubmitTheory(activeCase)) { SCHEngine.narrative('You do not yet have enough aligned evidence to submit a stable theory.'); return; }
    if (SCHEngine.state.player.hand.length < 3) { SCHEngine.narrative('You need three Tarot cards in hand to form a Cause / Obstacle / Outcome spread. Sleep to redraw.'); return; }
    const boardLines = (typeof InvestigationCoherence !== 'undefined' && activeCase.theoryBoard) ? InvestigationCoherence.boardSummary(activeCase).join(' / ') : '';
    SCHEngine.narrative(`=== SUBMIT THEORY ===\nCentral Question: ${activeCase.centralQuestion || 'Unrecorded'}\nNeeded Evidence: ${(activeCase.requiredEvidenceRoles || []).map(r => (typeof InvestigationCoherence !== 'undefined' ? InvestigationCoherence.roleLabels[r] || r : r)).join(', ') || 'Unrecorded'}\n${activeCase.readinessExplanation || ''}${boardLines ? `\nTheory Board: ${boardLines}` : ''}\nThe anomaly core is: [${activeCase.requiredSymbols.join(', ')}]`);
    console.log('Suspects:');
    activeCase.suspectIds.forEach((sid, i) => {
      const s = SCHEngine.getNode(sid);
      const framedMark = (SCHEngine.state.kingpin.pending.framedSuspectId === sid) ? ' [conveniently suspicious?]' : '';
      const roleText = s.role ? `, ${s.role}` : '';
      const fairLine = (typeof TheoryFairnessSystem !== 'undefined') ? TheoryFairnessSystem.preSubmitWarning(activeCase, s) : '';
      console.log(`  ${i}. ${s.name}${framedMark}${roleText} [${s.symbols.join(', ')}]${fairLine ? ` | ${fairLine}` : ''}`);
      if (s.suspectHook) console.log(`     ${s.suspectHook}`);
      else if (s.personalityLine) console.log(`     ${s.personalityLine}`);
    });
    const sChoice = parseInt(await ask('Select primary suspect (number): '), 10);
    const suspectId = activeCase.suspectIds[sChoice];
    const suspectNode = SCHEngine.getNode(suspectId);
    if (!suspectNode) { SCHEngine.narrative('Invalid suspect.'); return; }

    console.log('\nTarot Hand:');
    SCHEngine.state.player.hand.forEach((c, i) => console.log(`  ${i}. ${TarotBuilder.cardLabel(c)} [${TarotBuilder.cardEffectiveSymbols(c).join(', ')}]`));
    const causeIdx = parseInt(await ask('Choose Cause card (number): '), 10);
    const obstacleIdx = parseInt(await ask('Choose Obstacle card (number): '), 10);
    const outcomeIdx = parseInt(await ask('Choose Outcome card (number): '), 10);
    const chosenSet = [causeIdx, obstacleIdx, outcomeIdx];
    if (new Set(chosenSet).size < 3 || chosenSet.some(i => !Number.isInteger(i) || i < 0 || i >= SCHEngine.state.player.hand.length)) {
      SCHEngine.narrative('Invalid spread selection. You must choose three distinct cards.');
      return;
    }

    const sorted = [...chosenSet].sort((a, b) => b - a);
    const selected = {};
    sorted.forEach((idx) => { selected[idx] = TarotBuilder.consumeCardAt(idx); });
    const forced = SCHEngine.state.kingpin.pending.forcedReversedSlots || [];
    const spread = [
      { slot: 'cause', card: selected[causeIdx], orientation: TarotBuilder.cardOrientation(selected[causeIdx], forced, 'cause') },
      { slot: 'obstacle', card: selected[obstacleIdx], orientation: TarotBuilder.cardOrientation(selected[obstacleIdx], forced, 'obstacle') },
      { slot: 'outcome', card: selected[outcomeIdx], orientation: TarotBuilder.cardOrientation(selected[outcomeIdx], forced, 'outcome') }
    ];

    if (activeCase.mirrorPressure > 0 && Math.random() < activeCase.mirrorPressure) {
      const slot = Utils.pickRandom(spread);
      slot.orientation = 'reversed';
      activeCase.lastMirrorFlip = slot.slot;
    }

    const theoryScore = this.buildTheoryScore(activeCase, suspectNode);
    const spreadResult = this.applySpread(activeCase, suspectNode, spread);
    activeCase.truthState = spreadResult.updatedTruth;
    const t = activeCase.truthState;
    let finalConfidence = Utils.clamp01(theoryScore.coherence * 0.40 + spreadResult.resonance * 0.20 + t.confidence * 0.20 + t.crystallization * 0.10 + t.mythPressure * 0.05 - t.contradiction * 0.25);
    const argumentScore = theoryScore.argumentScore || ((typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.argumentScore(activeCase, suspectNode.id) : 0);
    const argumentBonus = theoryScore.argumentBonus || ((typeof InvestigationCoherence !== 'undefined') ? InvestigationCoherence.argumentBonus(argumentScore) : 0);
    activeCase.argumentScore = argumentScore;
    finalConfidence = Utils.clamp01(finalConfidence + argumentBonus);
    spreadResult.notes.push(`Structured argument: ${Utils.describePct(argumentScore)} (${argumentBonus >= 0 ? '+' : ''}${Math.round(argumentBonus * 100)}% confidence)`);
    if (theoryScore.framed) {
      finalConfidence = Utils.clamp01(finalConfidence - 0.08 + t.contradiction * 0.05);
      spreadResult.notes.push('The theory may have been nudged toward a convenient scapegoat.');
    }
    if (typeof NPCSystem !== 'undefined') {
      const npcAid = NPCSystem.applyTheoryInterventions(activeCase, suspectNode);
      if (npcAid.confidenceDelta) finalConfidence = Utils.clamp01(finalConfidence + npcAid.confidenceDelta);
      if (npcAid.notes && npcAid.notes.length) spreadResult.notes.push(...npcAid.notes);
    }

    // Theory Fairness Pass:
    // Aligns readiness, suspect Theory Weight, evidence-role completion, frame detection, and Tarot volatility.
    // Goal: reward coherent investigation, turn framed-suspect traps into useful partial outcomes, and reserve hard failures for weak/risky theories.
    const resolvedUniqueClueSymbols = Utils.unique(activeCase.clues.flatMap(c => c.symbols));
    const resolvedCoverage = activeCase.requiredSymbols.filter(sym => resolvedUniqueClueSymbols.includes(sym)).length / Math.max(1, activeCase.requiredSymbols.length);
    const alignedClueCount = activeCase.clues.filter(c => Utils.overlap(c.symbols || [], activeCase.requiredSymbols || []).length > 0).length;
    const submittedReadyCase = true; // resolveTheory only reaches this point after canSubmitTheory(activeCase) succeeds.

    if (MODE.name === 'Casual') {
      if (submittedReadyCase) finalConfidence = Utils.clamp01(finalConfidence + 0.05);
      if (alignedClueCount >= 2) finalConfidence = Utils.clamp01(finalConfidence + 0.08);
      if (resolvedCoverage >= 0.75) finalConfidence = Utils.clamp01(finalConfidence + 0.06);
    }

    if (typeof TheoryFairnessSystem !== 'undefined') {
      const fairness = TheoryFairnessSystem.apply(activeCase, suspectNode, finalConfidence, spreadResult, spread);
      finalConfidence = fairness.finalConfidence;
      if (fairness.notes && fairness.notes.length) spreadResult.notes.push(...fairness.notes);
    }

    spread.forEach((entry) => TarotBuilder.sendToDiscard(entry.card));
    SCHEngine.narrative(
      `Spread formed:
` +
      `- Cause: ${spread[0].card.name} (${spread[0].orientation})
` +
      `- Obstacle: ${spread[1].card.name} (${spread[1].orientation})
` +
      `- Outcome: ${spread[2].card.name} (${spread[2].orientation})` +
      `
Argument Score: ${Utils.describePct(activeCase.argumentScore || 0)}` +
      (spreadResult.notes.length ? `
Synergies / Traces: ${spreadResult.notes.join(' | ')}` : '') +
      `${activeCase.lastMirrorFlip ? `
Mirror city complication: the ${activeCase.lastMirrorFlip} slot tilts against you.` : ''}`
    );

    let outcome = 'failed';
    if (finalConfidence >= MODE.resolvedThreshold) outcome = 'resolved';
    else if (finalConfidence >= MODE.partialThreshold) outcome = 'partially_resolved';

    if (MODE.name === 'Casual' && outcome === 'partially_resolved' && !SCHEngine.state.player.luckyBreakUsed && finalConfidence >= 0.52) {
      outcome = 'resolved';
      SCHEngine.state.player.luckyBreakUsed = true;
      SCHEngine.narrative('\x1b[32m[LUCKY BREAK]\x1b[0m The province coughs up one last piece of coherence, perhaps out of shame.');
    }

    const resolutionFlavor = (typeof ResolutionFlavorSystem !== 'undefined') ? ResolutionFlavorSystem.determine(activeCase, suspectNode, outcome, finalConfidence, activeCase.argumentScore || argumentScore) : null;
    activeCase.resolutionFlavor = resolutionFlavor;

    if (outcome === 'resolved') {
      SCHEngine.narrative(`\x1b[32mSUCCESS:\x1b[0m ${suspectNode.name} is implicated. The province stabilizes—for now. ${Utils.pickRandom(FUN_STRINGS.victoryCheers)}`);
      SCHEngine.state.player.reputation = Utils.round2(Utils.clamp01(SCHEngine.state.player.reputation + MODE.reputationResolvedGain));
      SCHEngine.state.kingpin.exposure = Utils.round2(Utils.clamp01(SCHEngine.state.kingpin.exposure + MODE.exposureResolvedGain + t.mythPressure * 0.02));
    } else if (outcome === 'partially_resolved') {
      SCHEngine.narrative(`\x1b[33mPARTIAL TRUTH:\x1b[0m The accusation lands, but deeper patterns remain unresolved. ${Utils.pickRandom(FUN_STRINGS.partialCheers)}`);
      SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption + MODE.corruptionPartialGain));
      SCHEngine.state.kingpin.exposure = Utils.round2(Utils.clamp01(SCHEngine.state.kingpin.exposure + MODE.exposurePartialGain + t.mythPressure * 0.02));
    } else {
      SCHEngine.narrative(`\x1b[31mDISTORTION:\x1b[0m The theory collapses into noise. The province resists your meaning. ${Utils.pickRandom(FUN_STRINGS.failCheers)}`);
      SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption + MODE.corruptionFailGain));
      SCHEngine.state.kingpin.exposure = Utils.round2(Utils.clamp01(SCHEngine.state.kingpin.exposure + MODE.exposureFailGain + t.mythPressure * 0.02));
    }

    if (resolutionFlavor) SCHEngine.narrative(`\x1b[36m[RESOLUTION FLAVOR]\x1b[0m ${resolutionFlavor.name}: ${resolutionFlavor.text}`);
    if (typeof WhySummarySystem !== 'undefined') SCHEngine.narrative(WhySummarySystem.afterTheoryResolution(activeCase, suspectNode, outcome, finalConfidence, spreadResult));

    if (typeof LieutenantSystem !== 'undefined') {
      const resolutionSymbols = Utils.unique([...(activeCase.requiredSymbols || []), ...activeCase.clues.flatMap(c => c.symbols || []), ...(suspectNode.symbols || [])]);
      LieutenantSystem.observe(outcome === 'failed' ? 'case_failed' : 'case_resolved', resolutionSymbols, { provinceId: activeCase.provinceId, caseId: activeCase.id });
    }

    if (typeof ConspiracyReactionSystem !== 'undefined') ConspiracyReactionSystem.maybeReact('theory_submitted', { provinceId: activeCase.provinceId, caseId: activeCase.id, outcome });

    if (typeof ContentLibrary !== 'undefined' && activeCase.templateKey) {
      const resolvedTemplate = ContentLibrary.getCaseTemplate(activeCase.templateKey);
      const themeKey = outcome === 'resolved' ? 'resolved' : outcome === 'partially_resolved' ? 'partial' : 'failed';
      const themeLine = resolvedTemplate?.resolutionThemes?.[themeKey];
      if (themeLine) SCHEngine.narrative(themeLine);
    }

    activeCase.resolved = true;
    activeCase.outcome = outcome;
    activeCase.finalConfidence = Utils.round2(finalConfidence);
    activeCase.finalSuspectId = suspectNode.id;
    activeCase.finalSpread = spread.map(s => ({ slot: s.slot, cardId: s.card.instanceId, baseId: s.card.baseId, orientation: s.orientation }));
    if (typeof NPCSuspectSystem !== 'undefined') NPCSuspectSystem.applyResolutionConsequences(activeCase, suspectNode, outcome, resolutionFlavor);
    this.applyCaseCarryover(activeCase, outcome);
    SCHEngine.state.archives.resolvedCases.push(Utils.clone(activeCase));
    delete SCHEngine.state.activeCasesByProvince[SCHEngine.state.activeProvince];
    SCHEngine.state.activeCase = null;
    // Preserve the player's current province/city after resolution.
    // Solving, partially solving, or failing a case should clear only the active case,
    // not teleport the detective out of the last visited city.
    SCHEngine.state.player.temp.theoryBoost = 0;
    KingpinAI.turn('resolve');
    SCHEngine.state.isEndgame = SCHEngine.state.kingpin.exposure >= 1.0;
    SCHEngine.state.kingpin.pending.forcedReversedSlots = [];
    SCHEngine.state.kingpin.pending.framedSuspectId = null;
  },

  async dream(ask) {
    const residue = SCHEngine.state.activeProvince ? SCHEngine.state.provinceResidues[SCHEngine.state.activeProvince] : null;
    const contam = SCHEngine.state.kingpin.pending.dreamContaminationSymbols || [];
    const activeCase = SCHEngine.state.activeCase ? SCHEngine.getNode(SCHEngine.state.activeCase) : null;
    const extraHints = SCHEngine.state.player.temp.nextSleepHints + (SCHEngine.state.currentEvent?.kind === 'shared_dream' ? 1 : 0);
    const hotSymbols = Utils.unique([...(SCHEngine.getHottestSymbols(3)), ...(residue ? residue.symbols.slice(0, 1) : []), ...contam, ...(activeCase && activeCase.bellPrepared ? activeCase.requiredSymbols.slice(0,1) : [])]).slice(0, 3 + extraHints);
    SCHEngine.state.counters.dream += 1;
    const dream = {
      id: `dream_${SCHEngine.state.counters.dream}`,
      symbols: Utils.unique([...(SCHEngine.state.player.temp.lockedDreamSymbol ? [SCHEngine.state.player.temp.lockedDreamSymbol] : []), ...hotSymbols]).slice(0, 5),
      intensity: Utils.round2(0.25 + (hotSymbols.length * 0.10) + (residue ? residue.intensity * 0.20 : 0) + (contam.length * 0.05) + (SCHEngine.state.currentEvent?.kind === 'shared_dream' ? 0.08 : 0)),
      text: hotSymbols.length > 0 ? `You dream of ${hotSymbols.join(' merging with ')}.` : 'You dream of a cold and empty map.',
      contaminated: contam.length > 0
    };
    if (typeof LieutenantSystem !== 'undefined') LieutenantSystem.applyDreamPressure(dream, activeCase);
    SCHEngine.state.player.knownDreams.push(dream);
    SCHEngine.state.archives.dreams.push(dream);
    SCHEngine.narrative('You sleep. The simulation cools and recombines its excess semantic residue.');
    SCHEngine.narrative(dream.text + (dream.contaminated ? ' Something in it feels watched.' : '') + ` ${Utils.pickRandom(FUN_STRINGS.dreamCheers)}`);
    const dreamChoiceNode = (typeof DreamChoiceSystem !== 'undefined') ? await DreamChoiceSystem.offerChoice(ask, dream, activeCase) : null;
    if (typeof WhySummarySystem !== 'undefined') SCHEngine.narrative(WhySummarySystem.afterDream(dream, dreamChoiceNode));
    if (typeof LieutenantSystem !== 'undefined') LieutenantSystem.observe('dream', dream.symbols, { provinceId: SCHEngine.state.activeProvince, caseId: activeCase?.id, dreamId: dream.id });
    hotSymbols.forEach(sym => SCHEngine.adjustSymbolHeat(sym, 0.03));
    Object.keys(SCHEngine.state.symbols).forEach(sym => { SCHEngine.state.symbols[sym] *= 0.80; });

    SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption - MODE.sleepCorruptionHeal + (dream.contaminated ? MODE.sleepDreamPenalty : 0)));
    SCHEngine.state.player.insight = Utils.round2(Utils.clamp01(SCHEngine.state.player.insight + MODE.sleepInsightGain + (activeCase?.bellPrepared ? 0.02 : 0)));

    if (MODE.name !== 'Deep') {
      if (activeCase) {
        const unseen = activeCase.requiredSymbols.filter(sym => !activeCase.clues.some(c => c.symbols.includes(sym)));
        const hinted = unseen[0] || activeCase.requiredSymbols[0];
        if (hinted) {
          activeCase.truthState.confidence = Utils.round2(Utils.clamp01(activeCase.truthState.confidence + (MODE.name === 'Casual' ? 0.04 : 0.02) + (activeCase.bellPrepared ? 0.02 : 0)));
          activeCase.truthState.contradiction = Utils.round2(Utils.clamp01(activeCase.truthState.contradiction - (MODE.name === 'Casual' ? 0.02 : 0.01) - (activeCase.bellPrepared ? 0.01 : 0)));
          SCHEngine.narrative(`\x1b[32m[DREAM BONUS]\x1b[0m A lucid shard points toward [${hinted}].`);
        }
      }
      const tainted = [...SCHEngine.state.player.hand, ...SCHEngine.state.player.drawPile, ...SCHEngine.state.player.discardPile].find(c => c && c.contamination && (c.contamination.markedByKingpin || c.contamination.reversedBias > 0 || c.contamination.corruptionTax > 0 || (c.contamination.shadowSymbols || []).length > 0));
      if (tainted && (SCHEngine.state.player.temp.nextSleepCleanse || activeCase?.bellPrepared)) {
        if (tainted.contamination.corruptionTax > 0) tainted.contamination.corruptionTax = Utils.round2(Math.max(0, tainted.contamination.corruptionTax - 0.02));
        else if ((tainted.contamination.shadowSymbols || []).length > 0) tainted.contamination.shadowSymbols.pop();
        else if (tainted.contamination.reversedBias > 0) tainted.contamination.reversedBias = Utils.round2(Math.max(0, tainted.contamination.reversedBias - 0.20));
        if (tainted.contamination.reversedBias <= 0 && tainted.contamination.corruptionTax <= 0 && (tainted.contamination.shadowSymbols || []).length === 0) tainted.contamination.markedByKingpin = false;
        SCHEngine.narrative(`\x1b[32m[LUCID SAVE]\x1b[0m ${tainted.name} feels a little less cursed upon waking.`);
      }
    }

    TarotBuilder.reshuffleDiscardIntoDraw();
    TarotBuilder.redrawHand();
    SCHEngine.state.turn++;
    SCHEngine.state.player.powerUsedThisTurn = false;
    SCHEngine.state.npcShownThisTurn = false;
    SCHEngine.state.player.temp.nextSleepHints = 0;
    SCHEngine.state.player.temp.nextSleepCleanse = false;
    if (activeCase) activeCase.bellPrepared = false;
    EventSystem.tickDown();
    RumorSystem.purgeExpired();
    if (SCHEngine.state.rumors.length < 3) {
      const rumor = RumorSystem.generate(SCHEngine.state.activeProvince || null, SCHEngine.state.currentEvent?.kind === 'kingpin_broadcast' ? 'kingpin' : null);
      if (rumor) SCHEngine.narrative(`\x1b[33m[RUMOR]\x1b[0m ${rumor.text}`);
    }
    if (typeof NPCSystem !== 'undefined') NPCSystem.advanceOnSleep();
    EventSystem.maybeTrigger();
    KingpinAI.turn('sleep');
    SCHEngine.state.kingpin.pending.dreamContaminationSymbols = [];
    SCHEngine.state.isEndgame = SCHEngine.state.kingpin.exposure >= 1.0;
    await NPCSystem.maybeEncounter('sleep', ask);
    if (SCHEngine.state.isEndgame) SCHEngine.narrative(`\x1b[31m!!! WARNING !!! The Worlock's Neural Architecture has fully manifested. The Master Dream is open.\x1b[0m`);
  },

  printCaseBoard(caseNode) {
    if (!caseNode || typeof InvestigationCoherence === 'undefined') return;
    console.log(`Question: ${caseNode.centralQuestion || 'Unrecorded'}`);
    if (caseNode.requiredEvidenceRoles) console.log(`Evidence needed: ${caseNode.requiredEvidenceRoles.map(r => InvestigationCoherence.roleLabels[r] || r).join(', ')}`);
    if (caseNode.readinessExplanation) console.log(caseNode.readinessExplanation);
    if (caseNode.theoryBoard) console.log(`Theory board: ${InvestigationCoherence.boardSummary(caseNode).join(' / ')}`);
    (caseNode.clues || []).slice(-3).forEach(c => {
      const role = c.evidenceRole || c.material?.evidenceRole;
      const tags = c.tags || c.material?.tags || [];
      console.log(`- ${c.id}: ${role || 'evidence'}${tags.length ? ` [${tags.join(', ')}]` : ''}`);
    });
  },

  buildPlayerEvidenceDNA() {
    const resolvedCaseClues = SCHEngine.state.archives.resolvedCases.flatMap(c => c.clues || []);
    const clueSymbols = Utils.unique(resolvedCaseClues.flatMap(c => c.symbols || [])).slice(0, 12);
    const traceSymbols = Utils.unique((SCHEngine.state.kingpin.traces || []).map(t => t.symbol)).slice(0, 6);
    const dreamSymbols = Utils.unique(SCHEngine.state.player.knownDreams.flatMap(d => d.symbols || [])).slice(0, 6);
    const rumorSymbols = Utils.unique(SCHEngine.state.archives.rumors.flatMap(r => r.symbols || [])).slice(0, 4);
    return Utils.unique([...clueSymbols, ...traceSymbols, ...dreamSymbols, ...rumorSymbols]);
  },
  buildKingpinDNA() {
    const kp = SCHEngine.state.kingpin;
    return Utils.unique([...kp.preferredSymbols, ...SCHEngine.getHottestSymbols(4)]).slice(0, 6);
  },
  buildWorlockMaskPool(kingpinDNA, evidenceDNA) {
    const residueSymbols = Utils.unique(Object.values(SCHEngine.state.provinceResidues || {}).flatMap(r => r.symbols || []));
    const hot = SCHEngine.getHottestSymbols(8);
    const traces = Utils.unique((SCHEngine.state.kingpin.traces || []).map(t => t.symbol));
    const rumorSymbols = Utils.unique(SCHEngine.state.rumors.flatMap(r => r.symbols || []));
    const candidateDecoys = Utils.unique([...hot, ...residueSymbols, ...evidenceDNA, ...traces, ...rumorSymbols]).filter(sym => !kingpinDNA.includes(sym));
    const decoys = Utils.shuffle(candidateDecoys).slice(0, 4);
    return Utils.shuffle(Utils.unique([...kingpinDNA.slice(0, 4), ...decoys]));
  },

  async kingpinPhaseDiscern(ask, kingpinDNA, evidenceDNA) {
    const pool = this.buildWorlockMaskPool(kingpinDNA, evidenceDNA);
    SCHEngine.narrative('=== PHASE I: DISCERN THE TRUE PATTERN ===');
    SCHEngine.narrative('Some of these symbols belong to the Worlock. Some are residue, false heat, or sacrificial masks. Choose the three you believe are truly structural.');
    let revealedTrue = null;
    let revealedFalse = null;
    if (MODE.revealEndgameHints) {
      revealedTrue = Utils.pickRandom(pool.filter(sym => kingpinDNA.includes(sym)));
      revealedFalse = Utils.pickRandom(pool.filter(sym => !kingpinDNA.includes(sym)));
      if (revealedTrue) SCHEngine.narrative(`Dream hint: one TRUE Worlock symbol is [${revealedTrue}].`);
      if (revealedFalse) SCHEngine.narrative(`Dream hint: one FALSE mask is [${revealedFalse}].`);
    }
    pool.forEach((sym, i) => console.log(`  ${i}. ${sym}`));
    const input = await ask('Pick three symbol numbers, comma-separated: ');
    const picks = Utils.unique(String(input).split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isInteger(n) && n >= 0 && n < pool.length)).slice(0, 3);
    if (picks.length !== 3) {
      SCHEngine.narrative('You hesitate, and the grammar fills in the gap with noise.');
      return { discernScore: MODE.invalidDiscernScore, selectedSymbols: revealedTrue ? [revealedTrue] : [], pool, trueHits: revealedTrue ? [revealedTrue] : [], falseHits: [] };
    }
    const selectedSymbols = picks.map(i => pool[i]);
    const trueHits = selectedSymbols.filter(sym => kingpinDNA.includes(sym));
    const falseHits = selectedSymbols.filter(sym => !kingpinDNA.includes(sym));
    const supportedHits = trueHits.filter(sym => evidenceDNA.includes(sym));
    const discernScore = Utils.clamp01((trueHits.length / 3) * 0.70 + (supportedHits.length / 3) * 0.25 - (falseHits.length * (MODE.name === 'Deep' ? 0.10 : MODE.name === 'Standard' ? 0.07 : 0.05)) + (revealedTrue && selectedSymbols.includes(revealedTrue) ? 0.05 : 0));
    SCHEngine.narrative(`You name the pattern: [${selectedSymbols.join(', ')}].\nTrue structural hits: [${trueHits.join(', ') || 'none'}] | False masks: [${falseHits.join(', ') || 'none'}] | Discernment ${Utils.describePct(discernScore)}`);
    return { discernScore, selectedSymbols, pool, trueHits, falseHits };
  },

  async kingpinPhaseInterpret(ask, kingpinDNA, selectedSymbols) {
    SCHEngine.narrative('=== PHASE II: BREAK THE MASK ===');
    if (SCHEngine.state.player.hand.length < 3) { TarotBuilder.reshuffleDiscardIntoDraw(); TarotBuilder.redrawHand(); }
    if (SCHEngine.state.player.hand.length < 3) {
      SCHEngine.narrative('Your hand cycles dry. The Worlock presses its advantage.');
      return { interpretScore: 0.05, spread: [], spreadSymbols: [], notes: ['Hand failure in final duel.'] };
    }
    const forcedSlot = Utils.pickRandom(['cause', 'obstacle', 'outcome']);
    const interference = Utils.pickRandom(MODE.endgameInterference);
    console.log('\nFinal Tarot Hand:');
    SCHEngine.state.player.hand.forEach((c, i) => console.log(`  ${i}. ${TarotBuilder.cardLabel(c)} [${TarotBuilder.cardEffectiveSymbols(c).join(', ')}]`));
    const causeIdx = parseInt(await ask('Choose Cause card (number): '), 10);
    const obstacleIdx = parseInt(await ask('Choose Obstacle card (number): '), 10);
    const outcomeIdx = parseInt(await ask('Choose Outcome card (number): '), 10);
    const chosen = [causeIdx, obstacleIdx, outcomeIdx];
    if (new Set(chosen).size < 3 || chosen.some(i => !Number.isInteger(i) || i < 0 || i >= SCHEngine.state.player.hand.length)) {
      SCHEngine.narrative('Invalid final spread. The Worlock seizes the hesitation.');
      return { interpretScore: 0.05, spread: [], spreadSymbols: [], notes: ['Invalid final spread.'] };
    }
    const sorted = [...chosen].sort((a, b) => b - a);
    const selected = {};
    sorted.forEach((idx) => { selected[idx] = TarotBuilder.consumeCardAt(idx); });
    if (interference === 'shadow_injection') {
      const target = Utils.pickRandom([selected[causeIdx], selected[obstacleIdx], selected[outcomeIdx]]);
      if (target) {
        const shadow = Utils.pickRandom(SCHEngine.state.kingpin.preferredSymbols) || 'illusion';
        target.contamination.markedByKingpin = true;
        target.contamination.shadowSymbols = Utils.unique([...(target.contamination.shadowSymbols || []), shadow]).slice(0, 2);
      }
    }
    const spread = [
      { slot: 'cause', card: selected[causeIdx], orientation: forcedSlot === 'cause' || interference === 'forced_reversal' ? TarotBuilder.cardOrientation(selected[causeIdx], ['cause'], 'cause') : TarotBuilder.cardOrientation(selected[causeIdx], [], 'cause') },
      { slot: 'obstacle', card: selected[obstacleIdx], orientation: forcedSlot === 'obstacle' || interference === 'forced_reversal' ? TarotBuilder.cardOrientation(selected[obstacleIdx], ['obstacle'], 'obstacle') : TarotBuilder.cardOrientation(selected[obstacleIdx], [], 'obstacle') },
      { slot: 'outcome', card: selected[outcomeIdx], orientation: forcedSlot === 'outcome' || interference === 'forced_reversal' ? TarotBuilder.cardOrientation(selected[outcomeIdx], ['outcome'], 'outcome') : TarotBuilder.cardOrientation(selected[outcomeIdx], [], 'outcome') }
    ];
    let localTruth = { confidence: MODE.endgameBaseConfidence, contradiction: MODE.endgameBaseContradiction + (interference === 'contradiction_spike' ? MODE.endgameSpike : 0), mythPressure: 0.10, crystallization: MODE.endgameBaseCrystallization, ambiguity: MODE.endgameBaseAmbiguity };
    const spreadSymbols = Utils.unique(spread.flatMap(s => TarotBuilder.cardEffectiveSymbols(s.card)));
    const notes = [`Worlock interference: ${interference} on ${forcedSlot}.`];
    spread.forEach((entry) => {
      const effectiveSymbols = TarotBuilder.cardEffectiveSymbols(entry.card);
      const delta = this.tarotDelta(entry.card, entry.slot, entry.orientation);
      const overlapWithWorlock = Utils.jaccardSimilarity(effectiveSymbols, kingpinDNA);
      const overlapWithSelection = Utils.jaccardSimilarity(effectiveSymbols, selectedSymbols);
      localTruth.confidence += (delta.confidence || 0) + overlapWithWorlock * 0.06 + overlapWithSelection * 0.03;
      localTruth.contradiction += (delta.contradiction || 0) + (entry.orientation === 'reversed' ? 0.03 : 0);
      localTruth.mythPressure += (delta.mythPressure || 0) + overlapWithWorlock * 0.03;
      localTruth.crystallization += (delta.crystallization || 0) + (entry.slot === 'outcome' ? overlapWithWorlock * 0.04 : 0);
      localTruth.ambiguity += (delta.ambiguity || 0) + (entry.slot === 'cause' ? overlapWithSelection * 0.03 : 0);
      if (entry.card.contamination && entry.card.contamination.corruptionTax > 0) {
        SCHEngine.state.player.corruption = Utils.round2(Utils.clamp01(SCHEngine.state.player.corruption + entry.card.contamination.corruptionTax));
        notes.push(`${entry.card.name} exacts a corruption tax.`);
      }
    });
    const synergy = this.evaluateSpreadSynergy(spread);
    localTruth.confidence += synergy.confidence;
    localTruth.contradiction += synergy.contradiction;
    localTruth.mythPressure += synergy.mythPressure;
    localTruth.crystallization += synergy.crystallization;
    localTruth.ambiguity += synergy.ambiguity;
    notes.push(...synergy.notes);
    Object.keys(localTruth).forEach(k => localTruth[k] = Utils.clamp01(localTruth[k]));
    const tarotScore = Utils.jaccardSimilarity(spreadSymbols, kingpinDNA);
    const interpretScore = Utils.clamp01((tarotScore * MODE.interpretTarotWeight) + (localTruth.confidence * MODE.interpretConfidenceWeight) + (localTruth.crystallization * MODE.interpretCrystallizationWeight) - (localTruth.contradiction * MODE.interpretContradictionWeight));
    spread.forEach((entry) => TarotBuilder.sendToDiscard(entry.card));
    SCHEngine.narrative(`You form the spread:\n- Cause: ${spread[0].card.name} (${spread[0].orientation})\n- Obstacle: ${spread[1].card.name} (${spread[1].orientation})\n- Outcome: ${spread[2].card.name} (${spread[2].orientation})\nInterpretation score: ${Utils.describePct(interpretScore)} | Spread resonance: ${Utils.describePct(tarotScore)}\nNotes: ${notes.join(' | ')}`);
    return { interpretScore, spread, spreadSymbols, notes, localTruth, forcedSlot, interference };
  },

  async kingpinPhaseAssert(ask, kingpinDNA, evidenceDNA, selectedSymbols, spreadSymbols) {
    SCHEngine.narrative('=== PHASE III: ASSERT THE FINAL LOGIC ===');
    const candidatePool = Utils.unique([...selectedSymbols, ...spreadSymbols, ...kingpinDNA, ...evidenceDNA]).slice(0, 10);
    console.log('Choose which symbol to SEVER from the Worlock and which symbol to PRESERVE as the surviving truth.');
    candidatePool.forEach((sym, i) => console.log(`  ${i}. ${sym}`));
    const severIdx = parseInt(await ask('Choose symbol to sever (number): '), 10);
    const preserveIdx = parseInt(await ask('Choose symbol to preserve (number): '), 10);
    const severSym = candidatePool[severIdx];
    const preserveSym = candidatePool[preserveIdx];
    if (!severSym || !preserveSym || severIdx === preserveIdx) {
      SCHEngine.narrative('Your assertion slips. The Worlock keeps its mask intact.');
      return { assertScore: MODE.assertFallback, severSym: null, preserveSym: null };
    }
    const severGood = kingpinDNA.includes(severSym);
    const preserveGood = evidenceDNA.includes(preserveSym) || spreadSymbols.includes(preserveSym);
    const preserveNotDecoy = !SCHEngine.state.kingpin.preferredSymbols.includes(preserveSym) || preserveSym === 'truth';
    const assertScore = Utils.clamp01((severGood ? 0.45 : 0.10) + (preserveGood ? 0.35 : 0.05) + (preserveNotDecoy ? 0.10 : 0.00));
    SCHEngine.narrative(`You sever [${severSym}] and preserve [${preserveSym}].\nAssertion score: ${Utils.describePct(assertScore)}`);
    return { assertScore, severSym, preserveSym };
  },

  async confrontWorlock(ask) {
    console.clear();
    console.log('=================================================');
    console.log('        THE MASTER DREAM: FINAL TRIAL            ');
    console.log('=================================================');

    const kingpinDNA = this.buildKingpinDNA();
    const evidenceDNA = this.buildPlayerEvidenceDNA();
    const resolvedCases = SCHEngine.state.archives.resolvedCases || [];
    const dreams = SCHEngine.state.player.knownDreams || [];
    const lieutenantRecords = SCHEngine.state.archives.lieutenantConfrontations || [];
    const lieutenants = (typeof LieutenantSystem !== 'undefined') ? LieutenantSystem.all() : [];
    const courtSkin = (typeof EndgameStoryBuilder !== 'undefined') ? EndgameStoryBuilder.chooseCourtSkin(evidenceDNA, kingpinDNA, resolvedCases) : null;
    const masks = (typeof EndgameStoryBuilder !== 'undefined') ? EndgameStoryBuilder.chooseWorlockMasks(evidenceDNA, kingpinDNA, lieutenants) : [
      { id: 'debt', name: 'The Debt-Mask', symbols: ['debt', 'greed', 'wealth', 'authority'], claim: '“All obligation is ownership. Every debt is a chain that asked to be worn.”', challenge: 'Challenge the lie that debt is ownership.', defeatText: 'The Debt-Mask loses its columns.', scar: 'Some ledgers will never again be trusted.' },
      { id: 'dream', name: 'The Dream-Mask', symbols: ['dreams', 'sleep', 'hidden', 'illusion'], claim: '“Every dream was already mine.”', challenge: 'Challenge the lie that dreams belong to the strong.', defeatText: 'The Dream-Mask wakes with no master left inside it.', scar: 'Some sleepers will still lock their doors before dreaming.' },
      { id: 'mirror', name: 'The Mirror-Mask', symbols: ['illusion', 'truth', 'deception', 'mirror'], claim: '“Truth is only the reflection that survives correction.”', challenge: 'Challenge the lie that truth can always be reversed.', defeatText: 'The Mirror-Mask breaks into shards.', scar: 'Polished silver will make liars flinch.' },
      { id: 'crown', name: 'The Crown-Mask', symbols: ['authority', 'law', 'punishment', 'false_holiness'], claim: '“Law exists to excuse power.”', challenge: 'Challenge the lie that law exists to serve power.', defeatText: 'The Crown-Mask becomes ordinary metal.', scar: 'Some courts will need to relearn truth.' }
    ];

    SCHEngine.narrative(
      (courtSkin ? courtSkin.intro + '\n' + courtSkin.bench :
      'You enter the Neuro-Symbolic Twin of Cockaigne, but it no longer looks like a puzzle. It looks like a court.') + '\n' +
      'The ending has assembled itself from your cases, dreams, lieutenants, Tarot, and scars. This trial is the shape your run gave it.'
    );
    SCHEngine.narrative(
      `Your archive rises behind you: ${resolvedCases.length} resolved case${resolvedCases.length === 1 ? '' : 's'}, ` +
      `${dreams.length} recorded dream${dreams.length === 1 ? '' : 's'}, ` +
      `${lieutenantRecords.length} lieutenant confrontation${lieutenantRecords.length === 1 ? '' : 's'}.\n` +
      `Recurring evidence symbols: [${evidenceDNA.slice(0, 8).join(', ') || 'thin testimony'}].`
    );
    await ask('Press Enter to hear the Worlock’s indictment...');

    SCHEngine.narrative('The Worlock does not wear the same masks in every ending. Tonight it chooses from the symbols your run made loudest. Choose which lie your story can answer.');
    masks.forEach((mask, i) => {
      console.log(`  ${i}. ${mask.name} — ${mask.challenge}`);
      console.log(`     ${mask.claim}`);
      console.log(`     Evidence themes: [${mask.symbols.join(', ')}]`);
    });
    const maskIdx = parseInt(await ask('Choose the lie you challenge first (number): '), 10);
    const chosenMask = masks[maskIdx] || masks[0];
    const maskEvidenceOverlap = Utils.jaccardSimilarity(chosenMask.symbols, evidenceDNA);
    const maskWorlockOverlap = Utils.jaccardSimilarity(chosenMask.symbols, kingpinDNA);
    const maskScore = Utils.clamp01(0.25 + maskEvidenceOverlap * 0.45 + maskWorlockOverlap * 0.30);

    SCHEngine.narrative(`You rise against ${chosenMask.name}.\n${chosenMask.claim}\nThe court waits. The archive must answer with testimony.`);

    const buildCaseSymbols = (c) => Utils.unique([...(c.requiredSymbols || []), ...((c.clues || []).flatMap(cl => cl.symbols || [])), ...(c.symbols || [])]).filter(Boolean);
    const testimony = [];
    resolvedCases.slice(-6).forEach(c => {
      const storyText = (typeof EndgameStoryBuilder !== 'undefined') ? EndgameStoryBuilder.buildCaseTestimony(c, chosenMask) : `Case testimony: ${c.name}`;
      testimony.push({ type: 'case', label: `${c.name} — ${c.outcome || 'resolved evidence'}`, text: storyText, symbols: buildCaseSymbols(c), base: c.outcome === 'resolved' ? 0.18 : c.outcome === 'partially_resolved' ? 0.13 : 0.08 });
    });
    lieutenantRecords.slice(-5).forEach(r => {
      testimony.push({ type: 'lieutenant', label: `${r.lieutenantName} — ${r.outcome || 'confronted'}`, text: `The dossier of ${r.lieutenantName} enters evidence. Its recorded symbols are [${(r.symbols || []).slice(0, 5).join(', ')}].`, symbols: Utils.unique([...(r.symbols || []), ...(r.cardSymbols || [])]), base: r.outcome === 'defeated' ? 0.17 : r.outcome === 'weakened' ? 0.11 : 0.05 });
    });
    dreams.slice(-4).forEach(d => {
      testimony.push({ type: 'dream', label: `Dream ${d.id || ''} — [${(d.symbols || []).slice(0, 4).join(', ')}]`, text: d.text || `A dream carried [${(d.symbols || []).join(', ')}].`, symbols: d.symbols || [], base: d.contaminated ? 0.06 : 0.10 });
    });
    if (testimony.length === 0) testimony.push({ type: 'thin_archive', label: 'Thin Archive — stubborn survival', text: 'You have little formal testimony, but even a thin archive can refuse a false verdict.', symbols: evidenceDNA.length ? evidenceDNA : ['truth'], base: 0.08 });

    const rankedTestimony = testimony
      .map(t => Object.assign({}, t, { score: Utils.clamp01(t.base + Utils.jaccardSimilarity(t.symbols, chosenMask.symbols) * 0.65 + Utils.jaccardSimilarity(t.symbols, evidenceDNA) * 0.20) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    console.log('\nArchive testimony available:');
    rankedTestimony.forEach((t, i) => { console.log(`  ${i}. ${t.label}`); console.log(`     ${t.text}`); });
    const testimonyIdx = parseInt(await ask('Choose testimony to present (number): '), 10);
    const chosenTestimony = rankedTestimony[testimonyIdx] || rankedTestimony[0];
    const testimonyScore = chosenTestimony.score;
    SCHEngine.narrative(`You present: ${chosenTestimony.label}.\n${chosenTestimony.text}\n` + (testimonyScore >= 0.55 ? 'The gallery of provinces murmurs. The testimony lands cleanly.' : testimonyScore >= 0.35 ? 'The testimony holds, though the Worlock scratches at its margins.' : 'The testimony is thin, but it refuses to disappear.'));

    let lieutenantScore = 0;
    const lieutenantLines = [];
    lieutenants.forEach(lt => {
      const overlap = Utils.overlap(lt.symbols || [], chosenMask.symbols).length;
      if (lt.defeated) { lieutenantScore += overlap ? 0.08 : 0.04; lieutenantLines.push(EndgameStoryBuilder.lieutenantWitnessLine(lt, chosenMask)); }
      else if (lt.weakened) { lieutenantScore += overlap ? 0.04 : 0.02; lieutenantLines.push(EndgameStoryBuilder.lieutenantWitnessLine(lt, chosenMask)); }
      else if ((lt.exposure || 0) >= 0.60) { lieutenantScore -= overlap ? 0.04 : 0.02; lieutenantLines.push(EndgameStoryBuilder.lieutenantWitnessLine(lt, chosenMask)); }
    });
    lieutenantScore = Utils.clamp01(0.10 + lieutenantScore);
    if (lieutenantLines.length) SCHEngine.narrative('Lieutenant witnesses answer the summons:\n- ' + lieutenantLines.join('\n- '));
    else SCHEngine.narrative('No lieutenant takes the stand. The court feels emptier for it, but also less opposed.');
    if (typeof NPCSystem !== 'undefined') {
      const npcTrialLines = NPCSystem.finalTrialLines(chosenMask);
      if (npcTrialLines.length) SCHEngine.narrative('Recurring witnesses from the road enter the final record:\n- ' + npcTrialLines.join('\n- '));
    }

    const allCardZones = [...SCHEngine.state.player.hand, ...SCHEngine.state.player.drawPile, ...SCHEngine.state.player.discardPile].filter(Boolean);
    const allCards = Utils.unique(allCardZones.map(c => c.instanceId)).map(id => allCardZones.find(c => c.instanceId === id)).filter(Boolean);
    let candidatePool = allCards.slice();
    if (candidatePool.length < 5) TarotBuilder.getAllDefinitions().forEach(base => candidatePool.push(TarotBuilder.createCardInstance(base)));
    const cardScore = (card) => {
      const syms = TarotBuilder.cardEffectiveSymbols(card);
      return Utils.jaccardSimilarity(syms, chosenMask.symbols) * 0.65 + Utils.jaccardSimilarity(syms, evidenceDNA) * 0.25 + (card.arcana === 'Major' ? 0.08 : 0);
    };
    const protectedCard = candidatePool.slice().sort((a, b) => cardScore(b) - cardScore(a))[0];
    const remainder = Utils.shuffle(candidatePool.filter(c => !protectedCard || c.instanceId !== protectedCard.instanceId));
    const finalHand = Utils.unique([protectedCard, ...remainder].filter(Boolean).map(c => c.instanceId)).map(id => [protectedCard, ...remainder].find(c => c && c.instanceId === id)).filter(Boolean).slice(0, 5);

    SCHEngine.narrative('The deck refuses to let the ending depend on a weak hand. Five cards rise as witnesses; at least one has been called by the archive itself.');
    console.log('\nFinal Tarot witnesses:');
    finalHand.forEach((c, i) => {
      const syms = TarotBuilder.cardEffectiveSymbols(c);
      const maskHits = Utils.overlap(syms, chosenMask.symbols);
      const evidenceHits = Utils.overlap(syms, evidenceDNA).slice(0, 3);
      console.log(`  ${i}. ${TarotBuilder.cardLabel(c)} [${syms.join(', ')}]`);
      console.log(`     Speaks to: ${maskHits.length ? `[${maskHits.join(', ')}]` : 'the general shape of the trial'}${evidenceHits.length ? ` | Archive echo: [${evidenceHits.join(', ')}]` : ''}`);
    });
    const tarotInput = await ask('Choose three Tarot witness numbers, comma-separated: ');
    let tarotPicks = Utils.unique(String(tarotInput).split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isInteger(n) && n >= 0 && n < finalHand.length)).slice(0, 3);
    if (tarotPicks.length < 3) { SCHEngine.narrative('The selection wavers, so the archive steadies your hand and chooses the clearest witnesses.'); tarotPicks = [0, 1, 2].filter(i => i < finalHand.length); }
    const chosenCards = tarotPicks.map(i => finalHand[i]).filter(Boolean).slice(0, 3);
    const tarotScore = Utils.clamp01(chosenCards.reduce((acc, c) => acc + cardScore(c), 0) / Math.max(1, chosenCards.length) + (chosenCards.some(c => c.arcana === 'Major') ? 0.07 : 0));
    chosenCards.forEach(c => TarotBuilder.sendToDiscard(c));
    SCHEngine.narrative('The Tarot takes the witness stand:\n' + chosenCards.map(c => `- ${EndgameStoryBuilder.tarotWitnessLine(c, chosenMask, evidenceDNA)}`).join('\n') + '\n' + (tarotScore >= 0.55 ? 'The cards speak clearly enough for the court to understand.' : tarotScore >= 0.35 ? 'The cards speak in riddles, but the archive translates.' : 'The cards whisper. The archive must carry most of the verdict.'));

    console.log('\nThe Worlock’s grammar cracks. What truth do you preserve?');
    console.log('  0. Mercy — restore the provinces gently, leaving some buried corruption to be healed later.');
    console.log('  1. Reckoning — expose every lie, even where truth hurts the provinces that believed it.');
    console.log('  2. Freedom — break the grammar and let the provinces govern their own unstable meanings.');
    const verdictIdx = parseInt(await ask('Choose the surviving truth (number): '), 10);
    const verdicts = [
      { id: 'mercy', name: 'Mercy', score: 0.08, text: 'Mercy enters the record. The provinces will wake slowly, but not alone.' },
      { id: 'reckoning', name: 'Reckoning', score: 0.10, text: 'Reckoning enters the record. The lies split open; some provinces bleed daylight.' },
      { id: 'freedom', name: 'Freedom', score: 0.07, text: 'Freedom enters the record. The grammar breaks, and the provinces inherit their own dangerous voices.' }
    ];
    const verdict = verdicts[verdictIdx] || verdicts[0];
    SCHEngine.narrative(verdict.text);

    const insightBonus = SCHEngine.state.player.insight * 0.10;
    const corruptionPenalty = SCHEngine.state.player.corruption * MODE.endgameCorruptionPenalty;
    const finalScore = Utils.clamp01(0.12 + maskScore * 0.15 + testimonyScore * 0.30 + tarotScore * 0.25 + lieutenantScore + verdict.score + insightBonus - corruptionPenalty);
    const finalTier = finalScore >= MODE.trueVictory ? 'true' : finalScore >= MODE.pyrrhicVictory ? 'pyrrhic' : 'defeat';

    const verdictLines = [];
    verdictLines.push(testimonyScore >= 0.55 ? 'The archive holds.' : testimonyScore >= 0.35 ? 'The archive bends, but does not break.' : 'The archive is thin, yet stubborn.');
    verdictLines.push(lieutenantScore >= 0.16 ? 'The lieutenants cannot fully defend their master.' : 'The lieutenant network still hisses in the gallery.');
    verdictLines.push(tarotScore >= 0.55 ? 'The Tarot speaks in a language the court accepts.' : tarotScore >= 0.35 ? 'The Tarot is imperfect, but no longer opaque.' : 'The Tarot is faint; your cases do the heavier work.');
    if (corruptionPenalty > 0.07) verdictLines.push('Corruption stains the verdict, but does not erase it.');
    const aftermath = EndgameStoryBuilder.buildVerdictAftermath(verdict, finalTier, chosenMask, resolvedCases, evidenceDNA);
    SCHEngine.narrative('The final record is read:\n- ' + verdictLines.join('\n- ') + '\n\nEpilogue fragments:\n- ' + aftermath.join('\n- '));

    const epilogueNode = SCHEngine.registerNode({
      id: `endgame_epilogue_${SCHEngine.state.turn}`,
      type: 'endgame_story',
      subtype: 'epilogue',
      name: `Final Trial — ${verdict.name} / ${chosenMask.name}`,
      symbols: Utils.unique([...(chosenMask.symbols || []), verdict.id, finalTier, ...(courtSkin ? courtSkin.symbols : [])]),
      verdict: verdict.id,
      finalTier,
      chosenMask: chosenMask.id,
      courtSkin: courtSkin ? courtSkin.key : null,
      text: aftermath,
      npcHooks: ['octavia_quill_future'],
      links: Utils.unique([...(resolvedCases || []).map(c => c.id), ...(lieutenants || []).map(lt => lt.id)].filter(Boolean))
    });
    SCHEngine.state.archives.finalEpilogue = Utils.clone(epilogueNode);

    await ask('Press Enter to pronounce judgment...');
    if (finalTier === 'true') console.log(`\n\x1b[32m[TRUE VICTORY]\x1b[0m The Worlock’s grammar collapses under testimony, Tarot, and the names of the cases you carried here. The provinces wake unevenly, but awake.`);
    else if (finalTier === 'pyrrhic') console.log(`\n\x1b[33m[PYRRHIC VICTORY]\x1b[0m The Worlock is broken, but not cleanly. Some clauses of its old law remain in dreams, debts, and court records. You win, but the map will need tending.`);
    else console.log(`\n\x1b[31m[DEFEAT]\x1b[0m The Worlock survives the trial by turning too much testimony against itself. The provinces do not end; they are revised without consent.`);
    commandLine.disabled = true;
    terminal.appendChild(document.createElement('p')).textContent = '\n[Game Over - Reload page to restart]';
  }
};

// ============================================================================
// SAVE / LOAD HELPERS
// ============================================================================
async function handleSave() {
  const json = SCHEngine.saveToJSON();
  console.log('\n--- SAVE DATA (copy this somewhere safe) ---');
  console.log(json);
  console.log('--- END SAVE DATA ---\n');
  await ask('Press Enter to continue...');
}

async function handleLoad() {
  console.log('\nPaste your JSON save data, then press Enter twice:');
  const lines = [];
  while (true) {
    const line = await ask('');
    if (!line.trim()) break;
    lines.push(line);
  }
  try {
    const json = lines.join('\n');
    if (!json.trim()) { SCHEngine.narrative('Load cancelled.'); return; }
    SCHEngine.loadFromJSON(json);
    if (SCHEngine.state.gameMode && MODE_CONFIGS[SCHEngine.state.gameMode]) setMode(SCHEngine.state.gameMode);
    if (typeof LieutenantSystem !== 'undefined') LieutenantSystem.ensureState();
    SCHEngine.narrative(`Save data loaded. Mode: ${ACTIVE_MODE}.`);
  } catch (err) {
    SCHEngine.narrative(`Failed to load save data: ${err.message}`);
  }
}

// ============================================================================
// UI
// ============================================================================
function showHUD() {
  console.log('\n=================================================');
  console.log(`--- TURN ${SCHEngine.state.turn} | Mode: ${ACTIVE_MODE} | Worlock Exposure: ${Math.round(SCHEngine.state.kingpin.exposure * 100)}% ---`);
  const activeProvName = SCHEngine.state.activeProvince ? SCHEngine.getNode(SCHEngine.state.activeProvince).name : 'None';
  const activeCityNode = SCHEngine.state.activeCity ? SCHEngine.getNode(SCHEngine.state.activeCity) : null;
  const activeCityName = activeCityNode ? activeCityNode.name : 'None';
  const activeCaseNode = SCHEngine.state.activeCase ? SCHEngine.getNode(SCHEngine.state.activeCase) : null;
  console.log(`Province   : ${activeProvName} | City : ${activeCityName}${activeCityNode ? ` (${activeCityNode.cityTraitName})` : ''}`);
  if (activeCityNode) console.log(`City Effect: ${activeCityNode.cityTraitDesc}`);
  if (activeCaseNode) {
    const uniqueClueSymbols = Utils.unique(activeCaseNode.clues.flatMap(c => c.symbols));
    const coverage = activeCaseNode.requiredSymbols.filter(sym => uniqueClueSymbols.includes(sym)).length / Math.max(1, activeCaseNode.requiredSymbols.length);
    console.log(`Active Case: ${activeCaseNode.name}`);
    console.log(`Progress   : Clues ${activeCaseNode.clues.length} | Cities ${activeCaseNode.investigatedCities.length} | Coverage ${Math.round(coverage * 100)}% | Ready: ${GameLogic.canSubmitTheory(activeCaseNode) ? 'Yes' : 'No'}`);
  } else console.log('Active Case: None');
  console.log(`Insight    : ${Math.round(SCHEngine.state.player.insight * 100)}% | Corruption: ${Math.round(SCHEngine.state.player.corruption * 100)}% | Reputation: ${Math.round(SCHEngine.state.player.reputation * 100)}%`);
  console.log(`Tarot Hand : ${SCHEngine.state.player.hand.length} cards | Draw ${SCHEngine.state.player.drawPile.length} | Discard ${SCHEngine.state.player.discardPile.length} | Power Used: ${SCHEngine.state.player.powerUsedThisTurn ? 'Yes' : 'No'}`);
  if (typeof LieutenantSystem !== 'undefined') console.log(LieutenantSystem.statusLine());
  if (SCHEngine.state.currentEvent) console.log(`Rare Event : ${SCHEngine.state.currentEvent.name} (${SCHEngine.state.currentEvent.turnsLeft} turn${SCHEngine.state.currentEvent.turnsLeft === 1 ? '' : 's'} left)`);
  const visibleRumors = SCHEngine.state.rumors.slice(-2);
  visibleRumors.forEach(r => console.log(`Rumor      : ${r.text}`));
  if (SCHEngine.state.kingpin.traces.length > 0) console.log(`Worlock Trace: ${SCHEngine.state.kingpin.traces.slice(-3).map(t => t.symbol).join(', ')}`);
  console.log('-------------------------------------------------');
}

// ============================================================================
// MAIN LOOP
// ============================================================================
async function mainLoop() {
  console.clear();
  console.log('=================================================');
  console.log('      SCHLARAFFIA — SELECT YOUR MODE');
  console.log('=================================================');
  console.log('1. Casual   — fast, generous, coffee-break friendly');
  console.log('2. Standard — balanced investigative run');
  console.log('3. Deep     — harsher, more symbolic resistance');
  const modeChoice = await ask('Choose mode (1/2/3): ');
  if (String(modeChoice).trim() === '2') setMode('Standard');
  else if (String(modeChoice).trim() === '3') setMode('Deep');
  else setMode('Casual');
  console.log(`Mode selected: ${ACTIVE_MODE}`);

  TarotBuilder.build();
  WorldBuilder.build();
  LieutenantSystem.initialize();
  EventSystem.maybeTrigger();
  RumorSystem.generate(null, null);

  let isPlaying = true;
  while (isPlaying) {
    if (SCHEngine.state.isEndgame) {
      await GameLogic.confrontWorlock(ask);
      break;
    }

    showHUD();
    console.log('1. Travel Map (Select Province)');
    if (SCHEngine.state.activeProvince) console.log('2. Travel to City (Micro-Travel)');
    if (SCHEngine.state.activeProvince && !SCHEngine.state.activeCase) console.log('3. Allow Anomaly to Surface');
    if (SCHEngine.state.activeCase) {
      console.log('4. Investigate City (Risk Cognitive Friction)');
      console.log('5. Use Tarot Power');
      console.log('6. Submit Theory & Resolve Case');
    } else {
      console.log('5. Use Tarot Power');
    }
    if (typeof LieutenantSystem !== 'undefined' && LieutenantSystem.hasConfrontable()) console.log('L. Confront Exposed Lieutenant');
    console.log('7. Sleep (Dream / Rumors / Events / Tiny personal renaissance)');
    console.log('8. View Archive Summary');
    console.log('9. Save / Load');
    console.log('?. Ask for Guidance');
    console.log('0. Quit');

    const choice = await ask('\nSelect Action: ');
    switch (choice.trim()) {
      case '1': {
        const provs = WorldBuilder.getProvinces();
        console.log('\nProvinces:');
        provs.forEach((p, i) => console.log(`  ${i}. ${p.name}`));
        const pChoice = parseInt(await ask('Enter province number: '), 10);
        const selected = provs[pChoice];
        if (selected) {
          SCHEngine.state.activeProvince = selected.id;
          SCHEngine.state.activeCity = null;
          SCHEngine.state.activeCase = SCHEngine.state.activeCasesByProvince[selected.id] || null;
          SCHEngine.narrative(`You traverse the philosophical borders into ${selected.name}. ${FUN_STRINGS.provinceTags[selected.id] || ''}`);
        }
        break;
      }
      case '2': {
        if (!SCHEngine.state.activeProvince) break;
        const cities = WorldBuilder.getCitiesInProvince(SCHEngine.state.activeProvince);
        console.log('\nCities:');
        cities.forEach((c, i) => console.log(`  ${i}. ${c.name} — ${c.cityTraitName}`));
        const cChoice = parseInt(await ask('Enter city number: '), 10);
        const selected = cities[cChoice];
        if (selected) {
          SCHEngine.state.activeCity = selected.id;
          SCHEngine.narrative(`You arrive in ${selected.name}. ${CITY_TRAITS[selected.cityTrait].onEnter}\n${selected.cityTraitName}: ${selected.cityTraitDesc}`);
          await NPCSystem.maybeEncounter('city', ask);
        }
        break;
      }
      case '3':
        await GameLogic.generateCase(ask);
        break;
      case '4':
        await GameLogic.investigate(ask);
        break;
      case '5':
        await TarotBuilder.usePower(ask);
        break;
      case '6':
        if (SCHEngine.state.activeCase) await GameLogic.resolveTheory(ask);
        break;
      case 'l':
      case 'L':
        await LieutenantSystem.confront(ask);
        break;
      case '7':
        await GameLogic.dream(ask);
        break;
      case '8': {
        console.log('\n--- ARCHIVE SUMMARY ---');
        console.log(`Mode: ${ACTIVE_MODE} | Turn: ${SCHEngine.state.turn}`);
        console.log(`Resolved Cases: ${SCHEngine.state.archives.resolvedCases.length} | Dreams Recorded: ${SCHEngine.state.archives.dreams.length} | Rumors Heard: ${SCHEngine.state.archives.rumors.length}`);
        if (typeof NextMoveAdvisor !== 'undefined') { console.log('\nGuidance:'); NextMoveAdvisor.advise().forEach((x,i)=>console.log(`  ${i+1}. ${x}`)); }
        if (SCHEngine.state.archives.conspiracyReactions && SCHEngine.state.archives.conspiracyReactions.length) { console.log('Recent Conspiracy Reactions:'); SCHEngine.state.archives.conspiracyReactions.slice(-3).forEach(r=>console.log(`  ${r.text}`)); }
        if (typeof ContentLibrary !== 'undefined') console.log(`Material Content: ${ContentLibrary.caseTemplates.length} case templates | ${ContentLibrary.suspectTemplates.length} suspect archetypes | ${Object.keys(ContentLibrary.clueForms).length * ContentLibrary.clueConditions.length * ContentLibrary.clueAnomalies.length} clue permutations`);
        if (SCHEngine.state.archives.lieutenantConfrontations) {
          console.log(`Lieutenant Confrontations: ${SCHEngine.state.archives.lieutenantConfrontations.length}`);
        }
        if (typeof NPCSystem !== 'undefined') {
          const npcLines = NPCSystem.statusLines();
          if (npcLines.length) {
            console.log('\nNPC Relations:');
            npcLines.forEach(line => console.log(`  ${line}`));
            const favors = NPCSystem.activeFavors();
            if (favors.length) {
              console.log('Active Favors:');
              favors.slice(0, 5).forEach(f => console.log(`  ${f.name} — ${f.npcName}`));
            }
            const q = SCHEngine.state.npc?.quill;
            if (q && q.currentCaseId) console.log(`Octavia Thread: ${q.readyToPublish ? 'Ready to publish' : ['Not involved','Seen nearby','Has a clue','Forming theory','Ready to publish'][q.progress] || 'Moving'} on ${SCHEngine.getNode(q.currentCaseId)?.name || q.currentCaseId}`);
          }
        }
        const activeCase = SCHEngine.state.activeCase ? SCHEngine.getNode(SCHEngine.state.activeCase) : null;
        if (activeCase) {
          const uniqueClueSymbols = Utils.unique(activeCase.clues.flatMap(c => c.symbols));
          const coverage = activeCase.requiredSymbols.filter(sym => uniqueClueSymbols.includes(sym)).length / Math.max(1, activeCase.requiredSymbols.length);
          console.log(`\nCurrent Case: ${activeCase.name}`);
          if (activeCase.caseArchetypeLabel) console.log(`Case Type: ${activeCase.caseArchetypeLabel}`);
          console.log(`Progress: Clues ${activeCase.clues.length} | Cities ${activeCase.investigatedCities.length} | Coverage ${Math.round(coverage * 100)}% | Ready: ${GameLogic.canSubmitTheory(activeCase) ? 'Yes' : 'No'}`);
          const lastClue = activeCase.clues.slice(-1)[0];
          if (lastClue) console.log(`Last Clue Diagnostics: Reliability ${Utils.describePct(lastClue.reliability)} | Evidence +${Number(lastClue.evidenceDelta || 0).toFixed(2)} | Contradiction +${Number(lastClue.contradiction || 0).toFixed(2)}`);
        } else {
          console.log('\nCurrent Case: None');
        }
        const lastResolved = SCHEngine.state.archives.resolvedCases.slice(-1)[0];
        if (lastResolved) {
          console.log(`\nLast Resolved Case: ${lastResolved.name}`);
          console.log(`Outcome: ${lastResolved.outcome || 'unknown'} | Final Confidence: ${Utils.describePct(lastResolved.finalConfidence || 0)}`);
        }
        const activeEvent = SCHEngine.state.currentEvent;
        console.log(`\nCurrent Event: ${activeEvent ? `${activeEvent.name} (${activeEvent.turnsLeft} turn${activeEvent.turnsLeft === 1 ? '' : 's'} left)` : 'None'}`);
        console.log('\nActive Rumors:');
        if (SCHEngine.state.rumors.length === 0) console.log('  None');
        else SCHEngine.state.rumors.forEach((r, i) => console.log(`  ${i + 1}. ${r.text}`));
        if (typeof LieutenantSystem !== 'undefined') {
          console.log('\nLieutenant Dossiers:');
          const lieutenants = LieutenantSystem.all();
          if (lieutenants.length === 0) console.log('  None seeded');
          else lieutenants.forEach((lt, i) => {
            const status = lt.defeated ? 'Defeated' : lt.confrontationUnlocked ? 'Confrontable' : lt.exposed ? 'Named' : (lt.phase === 'hinted' ? 'Hinted' : 'Hidden');
            console.log(`  ${i + 1}. ${lt.name} — ${status} | Exposure ${Utils.describePct(lt.exposure || 0)}`);
          });
        }
        console.log('\nRecent Dreams:');
        const recentDreams = SCHEngine.state.player.knownDreams.slice(-3);
        if (recentDreams.length === 0) console.log('  None');
        else recentDreams.forEach((d, i) => console.log(`  ${i + 1}. ${d.text}`));
        console.log('\nTarot:');
        console.log(`  Hand ${SCHEngine.state.player.hand.length} | Draw ${SCHEngine.state.player.drawPile.length} | Discard ${SCHEngine.state.player.discardPile.length}`);
        SCHEngine.state.player.hand.forEach((c, i) => console.log(`  ${i}. ${TarotBuilder.cardLabel(c)} [${TarotBuilder.cardEffectiveSymbols(c).join(', ')}]`));
        await ask('Press Enter to continue...');
        break;
      }
      case '?':
        if (typeof NextMoveAdvisor !== 'undefined') NextMoveAdvisor.print();
        await ask('Press Enter to continue...');
        break;
      case '9': {
        console.log('\n1. Save Game\n2. Load Game');
        const sub = await ask('Select option: ');
        if (sub.trim() === '1') await handleSave();
        else if (sub.trim() === '2') await handleLoad();
        break;
      }
      case '0':
        console.log('Simulation terminated. Thanks for visiting the ruins.');
        isPlaying = false;
        commandLine.disabled = true;
        break;
      default:
        console.log('Invalid logical operator.');
    }
  }
}

mainLoop();
