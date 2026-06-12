import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { Check, FileJson, Loader2, Upload } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AGENCY_CATALOG,
  type AnalysisStats,
  applyRoleMap,
  buildDefaultRoleMap,
  type CategoryKey,
  detectLang,
  distinctSpeakers,
  type Lang,
  normalizeRawTurns,
  parseConversationText,
  type RawTurn,
  resolveSpeakerAlias,
  type SpeakerRole,
  type Turn,
  UI_STRINGS,
  analyzeTurns,
  catLabel,
  generateRecommendations,
  phaseLabel,
  SAMPLE_TRANSCRIPT,
  SAMPLE_TRANSCRIPT_HE,
} from "@/lib/agency";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agency Debrief — Coaching Transcript Analyzer" },
      {
        name: "description",
        content:
          "Analyze coaching conversation transcripts in your browser. Hebrew & English supported. All processing client-side.",
      },
      { property: "og:title", content: "Agency Debrief" },
      {
        property: "og:description",
        content: "Privacy-first agency analysis for coaches in Hebrew and English.",
      },
    ],
  }),
  component: Index,
});

type Stage = "upload" | "looking" | "ready" | "report";

function Index() {
  const [lang, setLang] = useState<Lang>("en");
  const [pasteText, setPasteText] = useState("");
  const [rawTurns, setRawTurns] = useState<RawTurn[]>([]);
  const [roleMap, setRoleMap] = useState<Record<string, SpeakerRole>>({});
  const [stage, setStage] = useState<Stage>("upload");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const t = UI_STRINGS[lang];
  const isRtl = lang === "he";

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [isRtl, lang]);

  const speakers = useMemo(() => distinctSpeakers(rawTurns), [rawTurns]);

  const turns = useMemo<Turn[]>(() => applyRoleMap(rawTurns, roleMap), [rawTurns, roleMap]);

  const stats = useMemo<AnalysisStats | null>(
    () => (turns.length === 0 ? null : analyzeTurns(turns)),
    [turns],
  );

  // The mapping panel only adds value when speakers aren't plainly coach/client.
  const needsRoleMapping = useMemo(
    () => speakers.length > 2 || speakers.some((s) => resolveSpeakerAlias(s) === null),
    [speakers],
  );

  // Drive the gentle "Looking… → ready check → report" reveal.
  useEffect(() => {
    if (stage === "looking") {
      const id = setTimeout(() => setStage("ready"), 900);
      return () => clearTimeout(id);
    }
    if (stage === "ready") {
      const id = setTimeout(() => setStage("report"), 700);
      return () => clearTimeout(id);
    }
  }, [stage]);

  const beginAnalysis = (parsed: RawTurn[], detectFrom: string) => {
    setLang(detectLang(detectFrom));
    setRawTurns(parsed);
    setRoleMap((prev) => buildDefaultRoleMap(parsed, prev));
    setStage("looking");
  };

  const handlePaste = () => {
    const parsed = parseConversationText(pasteText);
    if (parsed.length === 0) {
      toast.error(t.errNoTurns);
      return;
    }
    beginAnalysis(parsed, pasteText);
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = normalizeRawTurns(JSON.parse(text));
      if (parsed.length === 0) throw new Error("no-turns");
      beginAnalysis(parsed, parsed.map((r) => r.text).join(" "));
    } catch {
      toast.error(t.jsonError);
    }
  };

  const loadSample = () => {
    const useHe = lang === "he";
    const sample = useHe ? SAMPLE_TRANSCRIPT_HE : SAMPLE_TRANSCRIPT;
    const coachWord = useHe ? "מאמן" : "Coach";
    const clientWord = useHe ? "לקוח" : "Client";
    const raws: RawTurn[] = sample.map((tt) => ({
      speaker: tt.speaker === "coach" ? coachWord : clientWord,
      text: tt.text,
    }));
    setPasteText(raws.map((tt) => `${tt.speaker}: ${tt.text}`).join("\n"));
    beginAnalysis(raws, sample.map((s) => s.text).join(" "));
  };

  const handleStartOver = () => {
    setRawTurns([]);
    setRoleMap({});
    setPasteText("");
    setOptionsOpen(true);
    setStage("upload");
  };

  const setSpeakerRole = (speaker: string, role: SpeakerRole) =>
    setRoleMap((prev) => ({ ...prev, [speaker]: role }));

  const handleExport = () => window.print();

  const toggleLang = () => setLang((l) => (l === "en" ? "he" : "en"));

  const showReport = stage === "report" && !!stats;

  return (
    <div className="min-h-screen bg-background text-foreground" dir={isRtl ? "rtl" : "ltr"}>
      <Toaster richColors position="top-right" />

      <header className="border-b border-border print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={toggleLang} aria-label="Toggle language">
              {lang === "en" ? "עברית" : "English"}
            </Button>
            <Button variant="outline" onClick={loadSample}>
              {t.loadSample}
            </Button>
            <Button onClick={handleExport} disabled={!showReport}>
              {t.exportPdf}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {stage === "upload" && (
          <UploadFlow
            lang={lang}
            optionsOpen={optionsOpen}
            onOpenOptions={() => setOptionsOpen(true)}
            pasteText={pasteText}
            onPasteChange={setPasteText}
            onPaste={handlePaste}
            onFile={handleFile}
          />
        )}

        {(stage === "looking" || stage === "ready") && (
          <AnalyzingCard lang={lang} done={stage === "ready"} />
        )}

        {showReport && (
          <div className="space-y-8">
            <div className="flex justify-end print:hidden">
              <Button variant="outline" onClick={handleStartOver}>
                {t.analyzeAnother}
              </Button>
            </div>

            {needsRoleMapping && (
              <SpeakerRolesPanel
                speakers={speakers}
                rawTurns={rawTurns}
                roleMap={roleMap}
                onChange={setSpeakerRole}
                lang={lang}
              />
            )}

            <Report stats={stats} lang={lang} />

            <ConsentBanner lang={lang} />
          </div>
        )}

        {stage === "report" && !stats && (
          <div className="space-y-8">
            <div className="flex justify-end print:hidden">
              <Button variant="outline" onClick={handleStartOver}>
                {t.analyzeAnother}
              </Button>
            </div>
            <SpeakerRolesPanel
              speakers={speakers}
              rawTurns={rawTurns}
              roleMap={roleMap}
              onChange={setSpeakerRole}
              lang={lang}
            />
            <EmptyState text={t.errNoCoach} />
          </div>
        )}
      </main>
    </div>
  );
}

function UploadFlow({
  lang,
  optionsOpen,
  onOpenOptions,
  pasteText,
  onPasteChange,
  onPaste,
  onFile,
}: {
  lang: Lang;
  optionsOpen: boolean;
  onOpenOptions: () => void;
  pasteText: string;
  onPasteChange: (v: string) => void;
  onPaste: () => void;
  onFile: (f: File) => void;
}) {
  const t = UI_STRINGS[lang];
  const isRtl = lang === "he";

  if (!optionsOpen) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-24 text-center">
        <Button
          onClick={onOpenOptions}
          className="h-auto gap-2 bg-blue-600 px-8 py-4 text-base text-white hover:bg-blue-700"
        >
          <Upload className="h-5 w-5" />
          {t.uploadCta}
        </Button>
        <p className="text-sm text-muted-foreground">{t.uploadCtaSub}</p>
        <p className="text-xs text-muted-foreground">{t.noSignup}</p>
      </div>
    );
  }

  return (
    <div className="grid animate-in fade-in slide-in-from-bottom-2 gap-6 duration-300 md:grid-cols-2">
      <JsonDropCard lang={lang} onFile={onFile} />
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>{t.uploadCardPasteTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={pasteText}
            onChange={(e) => onPasteChange(e.target.value)}
            placeholder={t.pastePlaceholder}
            className="min-h-[180px] font-mono text-sm"
            dir={isRtl ? "rtl" : "ltr"}
          />
          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={onPaste}
            disabled={!pasteText.trim()}
          >
            {t.analyze}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function JsonDropCard({ lang, onFile }: { lang: Lang; onFile: (f: File) => void }) {
  const t = UI_STRINGS[lang];
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <Card className="print:hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-blue-600" />
          {t.uploadCardJsonTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onFile(f);
          }}
          className={cn(
            "flex min-h-[180px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging ? "border-blue-600 bg-blue-50" : "border-input hover:bg-accent",
          )}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t.uploadCardJsonHint}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </CardContent>
    </Card>
  );
}

function AnalyzingCard({ lang, done }: { lang: Lang; done: boolean }) {
  const t = UI_STRINGS[lang];
  return (
    <Card className="print:hidden">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        {done ? (
          <div className="flex h-14 w-14 animate-in zoom-in-50 items-center justify-center rounded-full bg-blue-600 text-white duration-300">
            <Check className="h-7 w-7" strokeWidth={3} />
          </div>
        ) : (
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        )}
        <p className="text-lg font-medium">{done ? t.ready : t.lookingAt}</p>
      </CardContent>
    </Card>
  );
}

const CONSENT_KEY = "agency_insight_consent";
const CONSENT_AT_KEY = "agency_insight_consent_at";
const CONSENT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function hasRecentConsent(): boolean {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    if (value !== "granted" && value !== "denied") return false;
    const at = Number(localStorage.getItem(CONSENT_AT_KEY) ?? "0");
    return Number.isFinite(at) && Date.now() - at < CONSENT_TTL_MS;
  } catch {
    return false;
  }
}

function writeConsent(value: "granted" | "denied") {
  try {
    localStorage.setItem(CONSENT_KEY, value);
    localStorage.setItem(CONSENT_AT_KEY, String(Date.now()));
  } catch {
    /* storage unavailable — fail silently */
  }
}

function ConsentBanner({ lang }: { lang: Lang }) {
  const t = UI_STRINGS[lang];
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [thanks, setThanks] = useState(false);

  // Read storage only on the client to avoid SSR/hydration mismatch.
  useEffect(() => {
    if (!hasRecentConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  const handleYes = () => {
    writeConsent("granted");
    setThanks(true);
    setTimeout(() => setVisible(false), 1800);
  };

  const handleNo = () => {
    writeConsent("denied");
    setVisible(false);
  };

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 border-border/70 bg-muted/40 duration-500 print:hidden">
      <CardContent className="py-5">
        {thanks ? (
          <p className="animate-in fade-in text-center text-sm font-medium text-blue-700">
            {t.consentThanks}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold">{t.consentTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.consentBody}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleYes} className="bg-blue-600 text-white hover:bg-blue-700">
                {t.consentYes}
              </Button>
              <Button variant="ghost" onClick={handleNo}>
                {t.consentNo}
              </Button>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {t.consentWhat}
              </button>
            </div>
            {expanded && (
              <p className="animate-in fade-in rounded-md bg-background/70 p-3 text-xs leading-relaxed text-muted-foreground">
                {t.consentExplain}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-12 text-center">
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

function SpeakerRolesPanel({
  speakers,
  rawTurns,
  roleMap,
  onChange,
  lang,
}: {
  speakers: string[];
  rawTurns: RawTurn[];
  roleMap: Record<string, SpeakerRole>;
  onChange: (speaker: string, role: SpeakerRole) => void;
  lang: Lang;
}) {
  const tt = UI_STRINGS[lang];
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const turn of rawTurns) c[turn.speaker] = (c[turn.speaker] ?? 0) + 1;
    return c;
  }, [rawTurns]);

  const roleLabels: Record<SpeakerRole, string> = {
    coach: tt.roleCoach,
    client: tt.roleClient,
    ignore: tt.roleIgnore,
  };

  return (
    <Card className="mb-8 print:hidden">
      <CardHeader>
        <CardTitle>{tt.speakerRoles}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{tt.speakerRolesHint}</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tt.speaker}</TableHead>
              <TableHead>{tt.turnsCol}</TableHead>
              <TableHead className="w-40">{tt.role}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {speakers.map((sp) => (
              <TableRow key={sp}>
                <TableCell className="font-medium">{sp}</TableCell>
                <TableCell className="text-muted-foreground">{counts[sp] ?? 0}</TableCell>
                <TableCell>
                  <Select
                    value={roleMap[sp] ?? "ignore"}
                    onValueChange={(v) => onChange(sp, v as SpeakerRole)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coach">{roleLabels.coach}</SelectItem>
                      <SelectItem value="client">{roleLabels.client}</SelectItem>
                      <SelectItem value="ignore">{roleLabels.ignore}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Report({ stats, lang }: { stats: AnalysisStats; lang: Lang }) {
  const t = UI_STRINGS[lang];
  const recs = useMemo(() => generateRecommendations(stats, lang), [stats, lang]);
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="print:hidden">
        <TabsTrigger value="overview">{t.overview}</TabsTrigger>
        <TabsTrigger value="timeline">{t.timeline}</TabsTrigger>
        <TabsTrigger value="phases">{t.phases}</TabsTrigger>
        <TabsTrigger value="recs">{t.recs}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 print:block">
        <OverviewTab stats={stats} lang={lang} />
      </TabsContent>
      <TabsContent value="timeline" className="space-y-6 print:block">
        <TimelineTab stats={stats} lang={lang} />
      </TabsContent>
      <TabsContent value="phases" className="space-y-6 print:block">
        <PhaseTab stats={stats} lang={lang} />
      </TabsContent>
      <TabsContent value="recs" className="space-y-6 print:block">
        <RecsTab recs={recs} />
      </TabsContent>
    </Tabs>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ stats, lang }: { stats: AnalysisStats; lang: Lang }) {
  const t = UI_STRINGS[lang];
  const topLabel = stats.topCategory ? catLabel(stats.topCategory, lang) : "—";
  const chartData = Object.entries(stats.categoryTotals).map(([k, v]) => ({
    key: k,
    label: catLabel(k as CategoryKey, lang),
    value: Number(v.toFixed(2)),
    color: AGENCY_CATALOG[k as CategoryKey].color,
  }));

  return (
    <div className="space-y-6">
      <Card className="border-2" style={{ borderColor: "#2563eb" }}>
        <CardContent className="py-8 text-center">
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            {t.overallScore}
          </p>
          <p className="mt-2 text-6xl font-bold" style={{ color: "#2563eb" }}>
            {stats.overallScore.toFixed(0)}
            <span className="text-2xl text-muted-foreground">/100</span>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t.owningMoments} value={stats.owningMomentsCount} />
        <StatCard label={t.coachTurns} value={stats.coachTurnsCount} />
        <StatCard label={t.topCategory} value={topLabel} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.agencyLift}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t.scoreBefore}:{" "}
            <span className="font-semibold text-foreground">
              {stats.scoreBeforeOwning.toFixed(2)}
            </span>{" "}
            | {t.overall}:{" "}
            <span className="font-semibold text-foreground">{stats.rawAvg.toFixed(2)}</span> |{" "}
            {t.lift}:{" "}
            <span className="font-semibold text-foreground">
              {stats.agencyLift ? `${stats.agencyLift.toFixed(2)}x` : "—"}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.categoryBreakdown}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 30, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="label" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="value">
                  {chartData.map((d) => (
                    <Cell key={d.key} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineTab({ stats, lang }: { stats: AnalysisStats; lang: Lang }) {
  const t = UI_STRINGS[lang];
  const lineData = stats.coachMeta.map((m) => ({
    index: m.index + 1,
    score: Number(m.score.toFixed(2)),
    globalIndex: m.globalIndex,
  }));

  const owningCoachIndices = new Set<number>();
  for (const oi of stats.owningGlobalIndices) {
    for (let j = oi - 1; j >= 0; j--) {
      if (stats.turns[j].speaker === "coach") {
        const m = stats.coachMeta.find((cm) => cm.globalIndex === j);
        if (m) owningCoachIndices.add(m.index);
        break;
      }
    }
  }

  const owningRows = Array.from(owningCoachIndices)
    .map((idx) => {
      const meta = stats.coachMeta[idx];
      let clientText = "";
      for (let j = meta.globalIndex + 1; j < stats.turns.length; j++) {
        if (stats.turns[j].speaker === "client") {
          clientText = stats.turns[j].text;
          break;
        }
      }
      return {
        turn: meta.index + 1,
        coach: meta.text,
        client: clientText,
        score: meta.score,
        category: meta.dominantCategory ? catLabel(meta.dominantCategory, lang) : "—",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.scoreOverTime}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="index"
                  label={{ value: t.coachTurnAxis, position: "insideBottom", offset: -4 }}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                {Array.from(owningCoachIndices).map((idx) => (
                  <ReferenceDot
                    key={idx}
                    x={idx + 1}
                    y={lineData[idx]?.score ?? 0}
                    r={6}
                    fill="#dc2626"
                    stroke="#dc2626"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.topOwning}</CardTitle>
        </CardHeader>
        <CardContent>
          {owningRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noOwning}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.turnNum}</TableHead>
                  <TableHead>{t.coachTextBefore}</TableHead>
                  <TableHead>{t.clientText}</TableHead>
                  <TableHead>{t.score}</TableHead>
                  <TableHead>{t.category}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {owningRows.map((r) => (
                  <TableRow key={r.turn}>
                    <TableCell className="font-medium">{r.turn}</TableCell>
                    <TableCell className="max-w-xs text-sm">{r.coach}</TableCell>
                    <TableCell className="max-w-xs text-sm">{r.client}</TableCell>
                    <TableCell>{r.score.toFixed(1)}</TableCell>
                    <TableCell>{r.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PhaseTab({ stats, lang }: { stats: AnalysisStats; lang: Lang }) {
  const t = UI_STRINGS[lang];
  const total = stats.coachTurnsCount || 1;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.phaseMap}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-14 w-full overflow-hidden rounded-md border border-border">
            {stats.phases.map((p, i) => {
              const color =
                p.category === "none"
                  ? "#cbd5e1"
                  : AGENCY_CATALOG[p.category as CategoryKey].color;
              const width = `${(p.turnCount / total) * 100}%`;
              const label = phaseLabel(p, lang);
              return (
                <div
                  key={i}
                  className="flex items-center justify-center px-2 text-xs font-medium text-white"
                  style={{ width, backgroundColor: color }}
                  title={`${label} — ${p.turnCount}`}
                >
                  <span className="truncate">{label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.phaseDetails}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.start}</TableHead>
                <TableHead>{t.end}</TableHead>
                <TableHead>{t.category}</TableHead>
                <TableHead>{t.numTurns}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.phases.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.startIndex + 1}</TableCell>
                  <TableCell>{p.endIndex + 1}</TableCell>
                  <TableCell>{phaseLabel(p, lang)}</TableCell>
                  <TableCell>{p.turnCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function RecsTab({ recs }: { recs: string[] }) {
  return (
    <div className="grid gap-4">
      {recs.map((r, i) => (
        <Card key={i}>
          <CardContent className="flex gap-4 pt-6">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {i + 1}
            </div>
            <p className="text-sm leading-relaxed">{r}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
