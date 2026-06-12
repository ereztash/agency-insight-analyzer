import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
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
  distinctSpeakers,
  type Lang,
  parseRawTranscript,
  type RawTurn,
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

function Index() {
  const [lang, setLang] = useState<Lang>("en");
  const [rawText, setRawText] = useState("");
  const [rawTurns, setRawTurns] = useState<RawTurn[]>([]);
  const [roleMap, setRoleMap] = useState<Record<string, SpeakerRole>>({});
  const t = UI_STRINGS[lang];
  const isRtl = lang === "he";

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [isRtl, lang]);

  const speakers = useMemo(() => distinctSpeakers(rawTurns), [rawTurns]);

  const turns = useMemo<Turn[]>(() => applyRoleMap(rawTurns, roleMap), [rawTurns, roleMap]);

  const stats = useMemo<AnalysisStats | null>(() => {
    if (turns.length === 0) return null;
    return analyzeTurns(turns);
  }, [turns]);

  const loadRawTurns = (parsed: RawTurn[]) => {
    setRawTurns(parsed);
    setRoleMap((prev) => buildDefaultRoleMap(parsed, prev));
  };

  const handleAnalyzeText = () => {
    const parsed = parseRawTranscript(rawText);
    if (parsed.length === 0) {
      toast.error(t.errNoTurns);
      return;
    }
    loadRawTurns(parsed);
    toast.success(`${t.analyzed} ${parsed.length} ${t.turnsWord}`);
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("Expected an array");
      const cleaned: RawTurn[] = data
        .filter(
          (x: unknown): x is { speaker: string; text: string; is_owning?: boolean } =>
            !!x &&
            typeof x === "object" &&
            "speaker" in x &&
            "text" in x &&
            typeof (x as { speaker: unknown }).speaker === "string" &&
            typeof (x as { text: unknown }).text === "string",
        )
        .map((x) => ({ speaker: x.speaker.trim(), text: x.text, is_owning: x.is_owning }))
        .filter((x) => x.speaker && x.text);
      if (cleaned.length === 0) throw new Error("No valid turns");
      loadRawTurns(cleaned);
      toast.success(`${t.loaded} ${cleaned.length} ${t.turnsWord}`);
    } catch (e) {
      toast.error(`${t.errBadJson}: ${(e as Error).message}`);
    }
  };

  const loadSample = () => {
    const sample = lang === "he" ? SAMPLE_TRANSCRIPT_HE : SAMPLE_TRANSCRIPT;
    const coachWord = lang === "he" ? "מאמן" : "Coach";
    const clientWord = lang === "he" ? "לקוח" : "Client";
    const raws: RawTurn[] = sample.map((tt) => ({
      speaker: tt.speaker === "coach" ? coachWord : clientWord,
      text: tt.text,
    }));
    loadRawTurns(raws);
    setRawText(raws.map((tt) => `${tt.speaker}: ${tt.text}`).join("\n"));
    toast.success(t.sampleLoaded);
  };

  const handleClear = () => {
    setRawTurns([]);
    setRoleMap({});
    setRawText("");
  };

  const setSpeakerRole = (speaker: string, role: SpeakerRole) =>
    setRoleMap((prev) => ({ ...prev, [speaker]: role }));

  const handleExport = () => window.print();

  const toggleLang = () => setLang((l) => (l === "en" ? "he" : "en"));

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
            <Button onClick={handleExport} disabled={!stats}>
              {t.exportPdf}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Card className="mb-8 print:hidden">
          <CardHeader>
            <CardTitle>{t.inputTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent">
                {t.uploadJson}
                <input
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>
              <span className="text-sm text-muted-foreground">
                {t.pasteHint}{" "}
                <code className="rounded bg-muted px-1">{lang === "he" ? "שם:" : "Name:"}</code>{" "}
                {lang === "he" ? "(כל שם דובר)" : "(any speaker name)"}
              </span>
            </div>
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={t.placeholder}
              className="min-h-[160px] font-mono text-sm"
              dir={isRtl ? "rtl" : "ltr"}
            />
            <div className="flex gap-2">
              <Button onClick={handleAnalyzeText}>{t.analyze}</Button>
              {rawTurns.length > 0 && (
                <Button variant="ghost" onClick={handleClear}>
                  {t.clear}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {speakers.length > 0 && (
          <SpeakerRolesPanel
            speakers={speakers}
            rawTurns={rawTurns}
            roleMap={roleMap}
            onChange={setSpeakerRole}
            lang={lang}
          />
        )}

        {stats ? (
          <Report stats={stats} lang={lang} />
        ) : (
          <EmptyState text={speakers.length > 0 ? t.errNoCoach : t.emptyState} />
        )}
      </main>
    </div>
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
