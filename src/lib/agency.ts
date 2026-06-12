export type CategoryKey =
  | "agency_transfer"
  | "epistemic_check"
  | "focus"
  | "socratic"
  | "conditional"
  | "client_desire"
  | "reflection"
  | "coach_as_agent";

export type Lang = "en" | "he";

export interface CategoryData {
  weight: number;
  label: string;
  labelHe: string;
  color: string;
  phrases: string[];
  phrasesHe: string[];
}

export const AGENCY_CATALOG: Record<CategoryKey, CategoryData> = {
  agency_transfer: {
    weight: 2.0,
    label: "Agency Transfer",
    labelHe: "העברת שליטה",
    color: "#2563eb",
    phrases: ["up to you", "your choice", "your decision", "you're in control", "you decide", "it's your call", "you choose", "you have the power", "the decision is yours", "you're the one who", "take control", "it's your", "you lead"],
    phrasesHe: ["תלוי בך", "הבחירה שלך", "ההחלטה שלך", "אתה בשליטה", "את בשליטה", "אתה מחליט", "את מחליטה", "אתה בוחר", "את בוחרת", "בידיים שלך", "הכוח בידיך", "אתה מוביל", "את מובילה"],
  },
  epistemic_check: {
    weight: 1.5,
    label: "Epistemic Check",
    labelHe: "בדיקת מודעות",
    color: "#7c3aed",
    phrases: ["you know", "do you think", "what do you think", "are you aware", "is it clear to you", "you understand", "what's your take", "how do you see it", "what do you make of", "what's your sense", "how does it look to you", "from your perspective"],
    phrasesHe: ["אתה יודע", "את יודעת", "מה דעתך", "מה אתה חושב", "מה את חושבת", "האם ברור לך", "אתה מבין", "את מבינה", "איך אתה רואה", "איך את רואה", "מהזווית שלך", "מה התחושה שלך"],
  },
  focus: {
    weight: 1.5,
    label: "Focus",
    labelHe: "מיקוד",
    color: "#0891b2",
    phrases: ["number one", "most important", "one thing", "the main thing", "priority", "top of mind", "the key thing", "if there's one thing", "the single most", "what matters most", "first and foremost"],
    phrasesHe: ["הכי חשוב", "דבר אחד", "הדבר המרכזי", "בראש סדר העדיפויות", "עדיפות עליונה", "אם יש דבר אחד", "מה הכי משמעותי", "ראשון בחשיבות", "העיקר"],
  },
  socratic: {
    weight: 1.5,
    label: "Socratic",
    labelHe: "סוקרטי",
    color: "#059669",
    phrases: ["why would it", "what prevents", "what if", "how come", "what makes you", "what stops you", "what would happen if", "what's holding you", "what's keeping you", "why do you think"],
    phrasesHe: ["מה מונע", "מה אם", "איך זה ש", "מה גורם לך", "מה עוצר אותך", "מה היה קורה אם", "מה מחזיק אותך", "למה אתה חושב", "למה את חושבת", "מדוע"],
  },
  conditional: {
    weight: 1.0,
    label: "Conditional",
    labelHe: "תנאי",
    color: "#d97706",
    phrases: ["if you", "suppose you", "imagine you", "let's say you", "in a scenario where you", "assuming you", "what if you"],
    phrasesHe: ["אם אתה", "אם את", "נניח ש", "תאר לעצמך", "תארי לעצמך", "בוא נגיד ש", "בואי נגיד ש", "במצב שבו", "בהנחה ש"],
  },
  client_desire: {
    weight: 1.5,
    label: "Client Desire",
    labelHe: "רצון הלקוח",
    color: "#dc2626",
    phrases: ["you want", "you wish", "important to you", "you'd like", "you prefer", "what matters to you", "what you really want", "what you're hoping", "your goal is", "you're looking for", "you desire"],
    phrasesHe: ["אתה רוצה", "את רוצה", "אתה שואף", "את שואפת", "חשוב לך", "אתה מעדיף", "את מעדיפה", "מה משמעותי לך", "מה אתה באמת רוצה", "מה את באמת רוצה", "המטרה שלך", "אתה מחפש", "את מחפשת"],
  },
  reflection: {
    weight: 1.0,
    label: "Reflection",
    labelHe: "השתקפות",
    color: "#9333ea",
    phrases: ["it sounds like you", "you feel", "you're feeling", "you seem", "what i'm hearing is you", "so you're saying", "it seems like you"],
    phrasesHe: ["נשמע לי ש", "אתה מרגיש", "את מרגישה", "אתה נראה", "את נראית", "אני שומע ש", "אני שומעת ש", "אז אתה אומר", "אז את אומרת", "נדמה לי ש"],
  },
  coach_as_agent: {
    weight: -1.0,
    label: "Coach as Agent",
    labelHe: "מאמן כסוכן",
    color: "#6b7280",
    phrases: ["i think", "i believe", "in my opinion", "from my perspective", "i feel that", "i suggest", "my advice", "i recommend", "i want you to", "you should", "you need to"],
    phrasesHe: ["אני חושב", "אני חושבת", "אני מאמין", "אני מאמינה", "לדעתי", "מנקודת מבטי", "אני מציע", "אני מציעה", "ההמלצה שלי", "אני ממליץ", "אני ממליצה", "אני רוצה שתעשה", "אני רוצה שתעשי", "אתה צריך", "את צריכה", "אתה חייב", "את חייבת"],
  },
};

export function catLabel(cat: CategoryKey, lang: Lang): string {
  return lang === "he" ? AGENCY_CATALOG[cat].labelHe : AGENCY_CATALOG[cat].label;
}

export interface Turn {
  speaker: "coach" | "client";
  text: string;
  is_owning?: boolean;
}

export interface ScoreResult {
  score: number;
  dominantCategory: CategoryKey | null;
  categories: Record<string, number>;
  matches: string[];
}

export function computeAgencyScore(text: string): ScoreResult {
  const lower = text.toLowerCase();
  const categories: Record<string, number> = {};
  const matches: string[] = [];

  for (const [catKey, catData] of Object.entries(AGENCY_CATALOG)) {
    let catScore = 0;
    const allPhrases = [...catData.phrases, ...catData.phrasesHe];
    for (const phrase of allPhrases) {
      if (lower.includes(phrase.toLowerCase())) {
        catScore += catData.weight;
        matches.push(`${catKey}: "${phrase}"`);
      }
    }
    categories[catKey] = catScore;
  }

  const score = Object.values(categories).reduce((sum, v) => sum + v, 0);

  let dominantCategory: CategoryKey | null = null;
  let maxContribution = -Infinity;
  for (const [cat, val] of Object.entries(categories)) {
    if (val > maxContribution) {
      maxContribution = val;
      dominantCategory = cat as CategoryKey;
    }
  }
  if (maxContribution <= 0) dominantCategory = null;

  return { score, dominantCategory, categories, matches };
}

const OWNING_PATTERNS = [
  /i (realize|understand|see|got it|get it)/i,
  /i (want|wish|desire|need) to/i,
  /i (decide|decided|will|am going to|plan to)/i,
  /my (goal|plan|next step) is/i,
  /i (feel|believe) that i/i,
];

const OWNING_PATTERNS_HE = [
  /אני (מבין|מבינה|רואה|קולט|קולטת|תופס|תופסת)/,
  /אני רוצה ל/,
  /אני (צריך|צריכה|חייב|חייבת) ל/,
  /(החלטתי|אחליט|אני מחליט|אני מחליטה)/,
  /אני (אעשה|הולך לעשות|הולכת לעשות|מתכוון|מתכוונת)/,
  /(המטרה שלי|התוכנית שלי|הצעד הבא שלי)/,
  /אני מרגיש ש?אני/,
  /אני מרגישה ש?אני/,
];

export function detectOwningMoment(text: string): boolean {
  return (
    OWNING_PATTERNS.some((p) => p.test(text)) ||
    OWNING_PATTERNS_HE.some((p) => p.test(text))
  );
}

export interface CoachTurnMeta {
  index: number; // index within coach turns
  globalIndex: number; // index in full transcript
  dominantCategory: CategoryKey | null;
  score: number;
  text: string;
}

export interface Phase {
  startIndex: number;
  endIndex: number;
  category: CategoryKey | "none";
  label: string;
  turnCount: number;
}

export function segmentPhases(
  coachTurns: { index: number; dominantCategory: CategoryKey | null }[],
): Phase[] {
  if (coachTurns.length === 0) return [];

  const phases: Phase[] = [];
  let phaseStart = 0;
  let phaseCat: CategoryKey | null = coachTurns[0].dominantCategory;

  let i = 1;
  while (i < coachTurns.length) {
    const cur = coachTurns[i].dominantCategory;
    if (cur === phaseCat) {
      i++;
      continue;
    }
    // Different. Look ahead 1 turn - if next reverts, treat as interruption
    if (i + 1 < coachTurns.length && coachTurns[i + 1].dominantCategory === phaseCat) {
      i += 2;
      continue;
    }
    // Real change
    phases.push(makePhase(phaseStart, i - 1, phaseCat));
    phaseStart = i;
    phaseCat = cur;
    i++;
  }
  phases.push(makePhase(phaseStart, coachTurns.length - 1, phaseCat));
  return phases;
}

function makePhase(start: number, end: number, cat: CategoryKey | null): Phase {
  const category = cat ?? "none";
  const label = cat ? AGENCY_CATALOG[cat].label : "Neutral";
  return {
    startIndex: start,
    endIndex: end,
    category,
    label,
    turnCount: end - start + 1,
  };
}

export function phaseLabel(p: Phase, lang: Lang): string {
  if (p.category === "none") return lang === "he" ? "ניטרלי" : "Neutral";
  return catLabel(p.category as CategoryKey, lang);
}

export interface AnalysisStats {
  overallScore: number;
  rawAvg: number;
  owningMomentsCount: number;
  coachTurnsCount: number;
  topCategory: CategoryKey | null;
  scoreBeforeOwning: number;
  agencyLift: number;
  categoryTotals: Record<string, number>;
  totalCategoryWeight: number;
  coachMeta: CoachTurnMeta[];
  owningGlobalIndices: number[];
  phases: Phase[];
  turns: Turn[];
}

export function analyzeTurns(turns: Turn[]): AnalysisStats {
  const coachMeta: CoachTurnMeta[] = [];
  const categoryTotals: Record<string, number> = {};
  for (const k of Object.keys(AGENCY_CATALOG)) categoryTotals[k] = 0;

  turns.forEach((t, globalIndex) => {
    if (t.speaker !== "coach") return;
    const r = computeAgencyScore(t.text);
    for (const [k, v] of Object.entries(r.categories)) {
      categoryTotals[k] = (categoryTotals[k] || 0) + v;
    }
    coachMeta.push({
      index: coachMeta.length,
      globalIndex,
      dominantCategory: r.dominantCategory,
      score: r.score,
      text: t.text,
    });
  });

  const owningGlobalIndices: number[] = [];
  turns.forEach((t, i) => {
    if (t.speaker !== "client") return;
    const owning = t.is_owning ?? detectOwningMoment(t.text);
    if (owning) owningGlobalIndices.push(i);
  });

  const scores = coachMeta.map((m) => m.score);
  const rawAvg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const overallScore = Math.min(100, Math.max(0, rawAvg * 10));

  // Score before owning: coach turns immediately preceding owning client turns
  const before: number[] = [];
  for (const oi of owningGlobalIndices) {
    // Find latest coach turn before oi
    for (let j = oi - 1; j >= 0; j--) {
      if (turns[j].speaker === "coach") {
        const m = coachMeta.find((cm) => cm.globalIndex === j);
        if (m) before.push(m.score);
        break;
      }
    }
  }
  const scoreBeforeOwning = before.length ? before.reduce((a, b) => a + b, 0) / before.length : 0;
  const agencyLift = rawAvg > 0 ? scoreBeforeOwning / rawAvg : 0;

  const totalCategoryWeight = Object.values(categoryTotals).reduce((s, v) => s + Math.abs(v), 0);
  let topCategory: CategoryKey | null = null;
  let topVal = -Infinity;
  for (const [k, v] of Object.entries(categoryTotals)) {
    if (v > topVal) {
      topVal = v;
      topCategory = k as CategoryKey;
    }
  }
  if (topVal <= 0) topCategory = null;

  const phases = segmentPhases(
    coachMeta.map((m) => ({ index: m.index, dominantCategory: m.dominantCategory })),
  );

  return {
    overallScore,
    rawAvg,
    owningMomentsCount: owningGlobalIndices.length,
    coachTurnsCount: coachMeta.length,
    topCategory,
    scoreBeforeOwning,
    agencyLift,
    categoryTotals,
    totalCategoryWeight,
    coachMeta,
    owningGlobalIndices,
    phases,
    turns,
  };
}

const REC_MESSAGES = {
  en: {
    reduceI: "Reduce 'I think'/'I believe' language. Try asking 'What do you think?' instead.",
    addDesire: "Add more desire-focused questions: 'What do you want to achieve?', 'What matters most to you?'",
    addReflection: "Add more reflection: 'It sounds like...', 'So you're saying...'",
    spike: "Your agency language spikes before breakthroughs – do this intentionally throughout the session.",
    handControl: "Try handing control explicitly: 'It's your decision', 'You're in control here.'",
    strong: "Strong session. Keep balancing inquiry, reflection, and agency transfer.",
  },
  he: {
    reduceI: "צמצם שימוש בביטויים כמו 'אני חושב' / 'אני מאמין'. נסה לשאול 'מה דעתך?' במקום.",
    addDesire: "הוסף יותר שאלות שמכוונות לרצון: 'מה אתה רוצה להשיג?', 'מה הכי חשוב לך?'",
    addReflection: "הוסף יותר השתקפות: 'נשמע לי ש...', 'אז אתה אומר ש...'",
    spike: "שפת השליטה שלך מזנקת לפני פריצות דרך – עשה זאת באופן יזום לאורך כל הסשן.",
    handControl: "נסה להעביר שליטה במפורש: 'ההחלטה שלך', 'אתה בשליטה כאן.'",
    strong: "סשן חזק. המשך לאזן בין שאלות, השתקפות והעברת שליטה.",
  },
};

export function generateRecommendations(stats: AnalysisStats, lang: Lang = "en"): string[] {
  const m = REC_MESSAGES[lang];
  const recs: string[] = [];
  const total = stats.totalCategoryWeight || 1;
  const coachAgent = Math.abs(stats.categoryTotals.coach_as_agent || 0);
  if (coachAgent / total > 0.2) recs.push(m.reduceI);

  const sorted = Object.entries(stats.categoryTotals)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
  const top3 = sorted.slice(0, 3);
  if (!top3.includes("client_desire")) recs.push(m.addDesire);

  if ((stats.categoryTotals.reflection || 0) < 2) recs.push(m.addReflection);

  if (stats.rawAvg > 0 && stats.scoreBeforeOwning > stats.rawAvg * 1.5) recs.push(m.spike);

  if (!stats.categoryTotals.agency_transfer || stats.categoryTotals.agency_transfer <= 0) {
    recs.push(m.handControl);
  }

  if (recs.length === 0) recs.push(m.strong);
  return recs;
}

const SPEAKER_ALIASES: Record<string, "coach" | "client"> = {
  coach: "coach",
  client: "client",
  מאמן: "coach",
  מאמנת: "coach",
  מטפל: "coach",
  מטפלת: "coach",
  לקוח: "client",
  לקוחה: "client",
  מטופל: "client",
  מטופלת: "client",
};

/** A turn that keeps its original speaker label, before it is mapped to a role. */
export interface RawTurn {
  speaker: string;
  text: string;
  is_owning?: boolean;
}

/** A speaker label can be mapped to a coaching role, or excluded from analysis. */
export type SpeakerRole = "coach" | "client" | "ignore";

/** Resolve a free-text speaker label to a known role, if it matches an alias. */
export function resolveSpeakerAlias(name: string): "coach" | "client" | null {
  return SPEAKER_ALIASES[name.trim().toLowerCase()] ?? null;
}

/**
 * Parse a transcript into raw turns, accepting ANY speaker label before the
 * first colon (e.g. "Sarah:", "Dr. Cohen:", "Speaker 1:"). Labels are kept
 * as-is so the user can later map each one to a coach/client role.
 */
export function parseRawTranscript(raw: string): RawTurn[] {
  const lines = raw.split(/\r?\n/);
  const turns: RawTurn[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*([^:]{1,40}?)\s*:\s*(.+)$/);
    if (!m) continue;
    const speaker = m[1].trim();
    const text = m[2].trim();
    // Require a letter in the label so timestamps like "12:30 - note" are not
    // treated as a speaker, and skip URLs where the text begins with "//".
    if (!/[A-Za-z\u0590-\u05FF]/.test(speaker)) continue;
    if (text.startsWith("//")) continue;
    if (text) turns.push({ speaker, text });
  }
  return turns;
}

/** Distinct speaker labels, in order of first appearance. */
export function distinctSpeakers(rawTurns: RawTurn[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of rawTurns) {
    if (!seen.has(t.speaker)) {
      seen.add(t.speaker);
      out.push(t.speaker);
    }
  }
  return out;
}

/**
 * Build a default role mapping for the speakers in `rawTurns`, preserving any
 * assignments already present in `existing`. Known aliases win; otherwise the
 * first unassigned speaker becomes the coach, the second the client, and any
 * further speakers are ignored. The user can override all of it.
 */
export function buildDefaultRoleMap(
  rawTurns: RawTurn[],
  existing: Record<string, SpeakerRole> = {},
): Record<string, SpeakerRole> {
  const map: Record<string, SpeakerRole> = { ...existing };
  let coachTaken = Object.values(map).includes("coach");
  let clientTaken = Object.values(map).includes("client");

  for (const name of distinctSpeakers(rawTurns)) {
    if (map[name]) continue;
    const alias = resolveSpeakerAlias(name);
    if (alias === "coach" && !coachTaken) {
      map[name] = "coach";
      coachTaken = true;
    } else if (alias === "client" && !clientTaken) {
      map[name] = "client";
      clientTaken = true;
    } else if (!coachTaken) {
      map[name] = "coach";
      coachTaken = true;
    } else if (!clientTaken) {
      map[name] = "client";
      clientTaken = true;
    } else {
      map[name] = "ignore";
    }
  }
  return map;
}

/** Apply a role mapping to raw turns, dropping any speaker mapped to "ignore". */
export function applyRoleMap(rawTurns: RawTurn[], roleMap: Record<string, SpeakerRole>): Turn[] {
  const turns: Turn[] = [];
  for (const t of rawTurns) {
    const role = roleMap[t.speaker];
    if (role === "coach" || role === "client") {
      turns.push({ speaker: role, text: t.text, is_owning: t.is_owning });
    }
  }
  return turns;
}

/** Legacy helper: parse + auto-map known aliases in one step. */
export function parseTextTranscript(raw: string): Turn[] {
  const raws = parseRawTranscript(raw);
  return applyRoleMap(raws, buildDefaultRoleMap(raws));
}

export const SAMPLE_TRANSCRIPT: Turn[] = [
  { speaker: "coach", text: "What's the most important thing you want to focus on today?" },
  { speaker: "client", text: "I want to figure out my next career move." },
  { speaker: "coach", text: "What do you think is holding you back right now?" },
  { speaker: "client", text: "Fear, mostly. I'm afraid I'll choose wrong." },
  { speaker: "coach", text: "It sounds like you're feeling a lot of pressure. What would happen if you took a small step?" },
  { speaker: "client", text: "I realize I haven't even tried talking to anyone in the field." },
  { speaker: "coach", text: "I think you should just start networking. I believe that's the answer." },
  { speaker: "client", text: "Okay, maybe." },
  { speaker: "coach", text: "What matters most to you in this next role?" },
  { speaker: "client", text: "Autonomy. I want to be in control of my work." },
  { speaker: "coach", text: "It's your decision how you move forward. You're in control here. What's one thing you'll do this week?" },
  { speaker: "client", text: "I decided I'll reach out to three people by Friday." },
  { speaker: "coach", text: "What stops you from doing it today?" },
  { speaker: "client", text: "Nothing, actually. I will send the first message tonight." },
];

export const SAMPLE_TRANSCRIPT_HE: Turn[] = [
  { speaker: "coach", text: "מה הדבר הכי חשוב שאתה רוצה להתמקד בו היום?" },
  { speaker: "client", text: "אני רוצה להבין מה המהלך הבא בקריירה שלי." },
  { speaker: "coach", text: "מה אתה חושב שמחזיק אותך כרגע?" },
  { speaker: "client", text: "בעיקר פחד. אני חושש שאבחר לא נכון." },
  { speaker: "coach", text: "נשמע לי שאתה מרגיש המון לחץ. מה היה קורה אם היית עושה צעד קטן?" },
  { speaker: "client", text: "אני מבין שאפילו לא ניסיתי לדבר עם אף אחד בתחום." },
  { speaker: "coach", text: "אני חושב שאתה צריך פשוט להתחיל לעשות נטוורקינג. אני מאמין שזו התשובה." },
  { speaker: "client", text: "אוקיי, אולי." },
  { speaker: "coach", text: "מה הכי משמעותי לך בתפקיד הבא?" },
  { speaker: "client", text: "אוטונומיה. אני רוצה להיות בשליטה על העבודה שלי." },
  { speaker: "coach", text: "ההחלטה שלך איך להתקדם. אתה בשליטה כאן. מה דבר אחד שתעשה השבוע?" },
  { speaker: "client", text: "החלטתי שאצור קשר עם שלושה אנשים עד יום שישי." },
  { speaker: "coach", text: "מה עוצר אותך מלעשות את זה היום?" },
  { speaker: "client", text: "כלום בעצם. אני אשלח את ההודעה הראשונה הערב." },
];

export const UI_STRINGS = {
  en: {
    title: "Agency Debrief",
    subtitle: "Private, in-browser analysis of coaching conversations.",
    loadSample: "Load sample",
    exportPdf: "Export PDF",
    inputTitle: "Input transcript",
    uploadJson: "Upload JSON",
    pasteHint: "or paste below as",
    analyze: "Analyze",
    clear: "Clear",
    emptyState: "Upload a transcript or load the sample to see the agency report.",
    overview: "Overview",
    timeline: "Timeline",
    phases: "Phase Map",
    recs: "Recommendations",
    overallScore: "Overall Agency Score",
    owningMoments: "Owning moments",
    coachTurns: "Coach turns",
    topCategory: "Top category",
    agencyLift: "Agency lift",
    scoreBefore: "Score before owning",
    overall: "Overall",
    lift: "Lift",
    categoryBreakdown: "Category breakdown",
    scoreOverTime: "Agency score over time",
    coachTurnAxis: "Coach turn #",
    topOwning: "Top owning moments",
    noOwning: "No owning moments detected.",
    turnNum: "Turn #",
    coachTextBefore: "Coach text (before)",
    clientText: "Client text",
    score: "Score",
    category: "Category",
    phaseMap: "Phase map",
    phaseDetails: "Phase details",
    start: "Start",
    end: "End",
    numTurns: "# Turns",
    placeholder:
      "Use any speaker names, one turn per line, e.g.\nSarah: What's most important today?\nDanny: I want to figure out my next step.",
    errNoTurns: "No turns found. Use lines like 'Name: ...' (any speaker name before the colon).",
    errBadJson: "Could not load JSON",
    loaded: "Loaded",
    turnsWord: "turns",
    sampleLoaded: "Sample conversation loaded",
    analyzed: "Analyzed",
    langLabel: "EN / עב",
    speakerRoles: "Speaker roles",
    speakerRolesHint:
      "We detected these speakers. Map each one to a role — the analysis scores the coach's turns and looks for the client's owning moments.",
    roleCoach: "Coach",
    roleClient: "Client",
    roleIgnore: "Ignore",
    role: "Role",
    speaker: "Speaker",
    turnsCol: "Turns",
    errNoCoach: "Map at least one speaker to Coach to run the analysis.",
  },
  he: {
    title: "ניתוח שליטה בשיחה",
    subtitle: "ניתוח פרטי בדפדפן של שיחות אימון.",
    loadSample: "טען דוגמה",
    exportPdf: "ייצוא PDF",
    inputTitle: "הכנסת תמליל",
    uploadJson: "העלאת JSON",
    pasteHint: "או הדבק למטה בפורמט",
    analyze: "נתח",
    clear: "נקה",
    emptyState: "העלה תמליל או טען דוגמה כדי לראות את הדוח.",
    overview: "סקירה",
    timeline: "ציר זמן",
    phases: "מפת שלבים",
    recs: "המלצות",
    overallScore: "ציר שליטה כולל",
    owningMoments: "רגעי בעלות",
    coachTurns: "תורות מאמן",
    topCategory: "קטגוריה מובילה",
    agencyLift: "הרמת שליטה",
    scoreBefore: "ציון לפני בעלות",
    overall: "כולל",
    lift: "הרמה",
    categoryBreakdown: "פילוח קטגוריות",
    scoreOverTime: "ציון שליטה לאורך זמן",
    coachTurnAxis: "מס׳ תור מאמן",
    topOwning: "רגעי בעלות מובילים",
    noOwning: "לא זוהו רגעי בעלות.",
    turnNum: "מס׳ תור",
    coachTextBefore: "טקסט המאמן (לפני)",
    clientText: "טקסט הלקוח",
    score: "ציון",
    category: "קטגוריה",
    phaseMap: "מפת שלבים",
    phaseDetails: "פירוט שלבים",
    start: "התחלה",
    end: "סוף",
    numTurns: "מס׳ תורות",
    placeholder:
      "השתמש בכל שם דובר, תור אחד בכל שורה, למשל:\nשרה: מה הכי חשוב היום?\nדני: אני רוצה להבין מה הצעד הבא שלי.",
    errNoTurns: "לא נמצאו תורות. השתמש בשורות כמו 'שם: ...' (כל שם דובר לפני הנקודתיים).",
    errBadJson: "לא ניתן לטעון את ה-JSON",
    loaded: "נטענו",
    turnsWord: "תורות",
    sampleLoaded: "שיחת דוגמה נטענה",
    analyzed: "נותחו",
    langLabel: "עב / EN",
    speakerRoles: "תפקידי הדוברים",
    speakerRolesHint:
      "זיהינו את הדוברים הבאים. מפה כל אחד לתפקיד — הניתוח מדרג את תורות המאמן ומחפש רגעי בעלות של הלקוח.",
    roleCoach: "מאמן",
    roleClient: "לקוח",
    roleIgnore: "התעלם",
    role: "תפקיד",
    speaker: "דובר",
    turnsCol: "תורות",
    errNoCoach: "מפה לפחות דובר אחד לתפקיד מאמן כדי להריץ את הניתוח.",
  },
} as const;
