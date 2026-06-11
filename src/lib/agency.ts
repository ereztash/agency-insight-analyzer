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

export function generateRecommendations(stats: AnalysisStats): string[] {
  const recs: string[] = [];
  const total = stats.totalCategoryWeight || 1;
  const coachAgent = Math.abs(stats.categoryTotals.coach_as_agent || 0);
  if (coachAgent / total > 0.2) {
    recs.push("Reduce 'I think'/'I believe' language. Try asking 'What do you think?' instead.");
  }

  const sorted = Object.entries(stats.categoryTotals)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
  const top3 = sorted.slice(0, 3);
  if (!top3.includes("client_desire")) {
    recs.push("Add more desire-focused questions: 'What do you want to achieve?', 'What matters most to you?'");
  }

  if ((stats.categoryTotals.reflection || 0) < 2) {
    recs.push("Add more reflection: 'It sounds like...', 'So you're saying...'");
  }

  if (stats.rawAvg > 0 && stats.scoreBeforeOwning > stats.rawAvg * 1.5) {
    recs.push("Your agency language spikes before breakthroughs – do this intentionally throughout the session.");
  }

  if (!stats.categoryTotals.agency_transfer || stats.categoryTotals.agency_transfer <= 0) {
    recs.push("Try handing control explicitly: 'It's your decision', 'You're in control here.'");
  }

  if (recs.length === 0) {
    recs.push("Strong session. Keep balancing inquiry, reflection, and agency transfer.");
  }
  return recs;
}

export function parseTextTranscript(raw: string): Turn[] {
  const lines = raw.split(/\r?\n/);
  const turns: Turn[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*(coach|client)\s*:\s*(.*)$/i);
    if (!m) continue;
    const speaker = m[1].toLowerCase() as "coach" | "client";
    const text = m[2].trim();
    if (text) turns.push({ speaker, text });
  }
  return turns;
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
