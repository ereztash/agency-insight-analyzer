import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  type CategoryKey,
  type Turn,
  analyzeTurns,
  generateRecommendations,
  parseTextTranscript,
  SAMPLE_TRANSCRIPT,
} from "@/lib/agency";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agency Debrief — Coaching Transcript Analyzer" },
      {
        name: "description",
        content:
          "Analyze coaching conversation transcripts in your browser and get an agency report with phase map, owning moments, and recommendations.",
      },
      { property: "og:title", content: "Agency Debrief" },
      {
        property: "og:description",
        content: "Privacy-first agency analysis for coaches. All processing client-side.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [rawText, setRawText] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);

  const stats = useMemo<AnalysisStats | null>(() => {
    if (turns.length === 0) return null;
    return analyzeTurns(turns);
  }, [turns]);

  const handleAnalyzeText = () => {
    const parsed = parseTextTranscript(rawText);
    if (parsed.length === 0) {
      toast.error("No turns found. Use lines like 'Coach: ...' and 'Client: ...'");
      return;
    }
    setTurns(parsed);
    toast.success(`Analyzed ${parsed.length} turns`);
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("Expected an array");
      const cleaned: Turn[] = data
        .filter(
          (t: unknown): t is Turn =>
            !!t &&
            typeof t === "object" &&
            "speaker" in t &&
            "text" in t &&
            ((t as Turn).speaker === "coach" || (t as Turn).speaker === "client") &&
            typeof (t as Turn).text === "string",
        )
        .map((t) => ({ speaker: t.speaker, text: t.text, is_owning: t.is_owning }));
      if (cleaned.length === 0) throw new Error("No valid turns");
      setTurns(cleaned);
      toast.success(`Loaded ${cleaned.length} turns`);
    } catch (e) {
      toast.error(`Could not load JSON: ${(e as Error).message}`);
    }
  };

  const loadSample = () => {
    setTurns(SAMPLE_TRANSCRIPT);
    setRawText(
      SAMPLE_TRANSCRIPT.map(
        (t) => `${t.speaker === "coach" ? "Coach" : "Client"}: ${t.text}`,
      ).join("\n"),
    );
    toast.success("Sample conversation loaded");
  };

  const handleExport = () => window.print();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-right" />

      <header className="border-b border-border print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Agency Debrief</h1>
            <p className="text-sm text-muted-foreground">
              Private, in-browser analysis of coaching conversations.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSample}>
              Load sample
            </Button>
            <Button onClick={handleExport} disabled={!stats}>
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Card className="mb-8 print:hidden">
          <CardHeader>
            <CardTitle>Input transcript</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent">
                Upload JSON
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
                or paste below as <code className="rounded bg-muted px-1">Coach:</code> /{" "}
                <code className="rounded bg-muted px-1">Client:</code> lines
              </span>
            </div>
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={"Coach: What's most important today?\nClient: I want to figure out my next step."}
              className="min-h-[160px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleAnalyzeText}>Analyze</Button>
              {stats && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTurns([]);
                    setRawText("");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {stats ? <Report stats={stats} /> : <EmptyState />}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border p-12 text-center">
      <p className="text-muted-foreground">
        Upload a transcript or load the sample to see the agency report.
      </p>
    </div>
  );
}

function Report({ stats }: { stats: AnalysisStats }) {
  const recs = useMemo(() => generateRecommendations(stats), [stats]);
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="print:hidden">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="phases">Phase Map</TabsTrigger>
        <TabsTrigger value="recs">Recommendations</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 print:block">
        <OverviewTab stats={stats} />
      </TabsContent>
      <TabsContent value="timeline" className="space-y-6 print:block">
        <TimelineTab stats={stats} />
      </TabsContent>
      <TabsContent value="phases" className="space-y-6 print:block">
        <PhaseTab stats={stats} />
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

function OverviewTab({ stats }: { stats: AnalysisStats }) {
  const topLabel = stats.topCategory ? AGENCY_CATALOG[stats.topCategory].label : "—";
  const chartData = Object.entries(stats.categoryTotals).map(([k, v]) => ({
    key: k,
    label: AGENCY_CATALOG[k as CategoryKey].label,
    value: Number(v.toFixed(2)),
    color: AGENCY_CATALOG[k as CategoryKey].color,
  }));

  return (
    <div className="space-y-6">
      <Card className="border-2" style={{ borderColor: "#2563eb" }}>
        <CardContent className="py-8 text-center">
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            Overall Agency Score
          </p>
          <p className="mt-2 text-6xl font-bold" style={{ color: "#2563eb" }}>
            {stats.overallScore.toFixed(0)}
            <span className="text-2xl text-muted-foreground">/100</span>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Owning moments" value={stats.owningMomentsCount} />
        <StatCard label="Coach turns" value={stats.coachTurnsCount} />
        <StatCard label="Top category" value={topLabel} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agency lift</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Score before owning:{" "}
            <span className="font-semibold text-foreground">
              {stats.scoreBeforeOwning.toFixed(2)}
            </span>{" "}
            | Overall:{" "}
            <span className="font-semibold text-foreground">{stats.rawAvg.toFixed(2)}</span> |
            Lift:{" "}
            <span className="font-semibold text-foreground">
              {stats.agencyLift ? `${stats.agencyLift.toFixed(2)}x` : "—"}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 30 }}>
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

function TimelineTab({ stats }: { stats: AnalysisStats }) {
  const lineData = stats.coachMeta.map((m) => ({
    index: m.index + 1,
    score: Number(m.score.toFixed(2)),
    globalIndex: m.globalIndex,
  }));

  // Coach turns immediately followed by an owning client moment
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
      // Find the client turn after meta.globalIndex
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
        category: meta.dominantCategory
          ? AGENCY_CATALOG[meta.dominantCategory].label
          : "—",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agency score over time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" label={{ value: "Coach turn #", position: "insideBottom", offset: -4 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
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
          <CardTitle>Top owning moments</CardTitle>
        </CardHeader>
        <CardContent>
          {owningRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No owning moments detected.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turn #</TableHead>
                  <TableHead>Coach text (before)</TableHead>
                  <TableHead>Client text</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Category</TableHead>
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

function PhaseTab({ stats }: { stats: AnalysisStats }) {
  const total = stats.coachTurnsCount || 1;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Phase map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-14 w-full overflow-hidden rounded-md border border-border">
            {stats.phases.map((p, i) => {
              const color =
                p.category === "none"
                  ? "#cbd5e1"
                  : AGENCY_CATALOG[p.category as CategoryKey].color;
              const width = `${(p.turnCount / total) * 100}%`;
              return (
                <div
                  key={i}
                  className="flex items-center justify-center px-2 text-xs font-medium text-white"
                  style={{ width, backgroundColor: color }}
                  title={`${p.label} — ${p.turnCount} turns`}
                >
                  <span className="truncate">{p.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phase details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Category</TableHead>
                <TableHead># Turns</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.phases.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.startIndex + 1}</TableCell>
                  <TableCell>{p.endIndex + 1}</TableCell>
                  <TableCell>{p.label}</TableCell>
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
