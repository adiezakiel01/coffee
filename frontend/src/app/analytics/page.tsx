"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { beansApi, brewsApi, analyticsApi } from "@/lib/api";
import { Bean, Brew, SuggestionResult } from "@/types";

type ChartView = "ratio" | "temp";

function bucketRatio(coffee: number, water: number): string {
  const ratio = water / coffee;
  const rounded = Math.round(ratio * 2) / 2;
  return `1:${rounded}`;
}

function bucketTemp(temp: number): string {
  const rounded = Math.round(temp * 2) / 2;
  return `${rounded}°C`;
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function buildChartData(
  brews: Brew[],
  bucketFn: (brew: Brew) => string | null,
): { label: string; avg: number; count: number }[] {
  const buckets: Record<string, number[]> = {};

  for (const brew of brews) {
    if (brew.rating === null) continue;
    const bucket = bucketFn(brew);
    if (!bucket) continue;
    if (!buckets[bucket]) buckets[bucket] = [];
    buckets[bucket].push(brew.rating);
  }

  return Object.entries(buckets)
    .map(([label, ratings]) => ({
      label,
      avg: average(ratings),
      count: ratings.length,
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true }),
    );
}

function barColor(avg: number): string {
  if (avg >= 9) return "#6b3a1f";
  if (avg >= 7) return "#8b5a2b";
  return "#c89666";
}

function ColoredBar(props: any) {
  const { x, y, width, height, avg } = props;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={barColor(avg)}
      rx={3}
    />
  );
}

export default function AnalyticsPage() {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [allBrews, setAllBrews] = useState<Brew[]>([]);
  const [selectedBeanId, setSelectedBeanId] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestionResult | null>(null);
  const [chartView, setChartView] = useState<ChartView>("ratio");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([beansApi.list(), brewsApi.list()])
      .then(([beansData, brewsData]) => {
        setBeans(beansData);
        setAllBrews(brewsData);

        const firstWithBrews = beansData.find((b) =>
          brewsData.some((brew) => brew.bean_id === b.id),
        );
        if (firstWithBrews) setSelectedBeanId(firstWithBrews.id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedBeanId) return;
    analyticsApi
      .suggest(selectedBeanId)
      .then(setSuggestion)
      .catch(() => setSuggestion(null));
  }, [selectedBeanId]);

  const beanBrews = useMemo(
    () => allBrews.filter((b) => b.bean_id === selectedBeanId),
    [allBrews, selectedBeanId],
  );

  const stats = useMemo(() => {
    const rated = beanBrews.filter((b) => b.rating !== null);
    const avg = average(rated.map((b) => b.rating as number));
    const best =
      rated.length > 0
        ? Math.max(...rated.map((b) => b.rating as number))
        : null;
    const icedCount = beanBrews.filter((b) => b.brew_type === "iced").length;
    return { total: beanBrews.length, avg, best, iced: icedCount };
  }, [beanBrews]);

  const perBeanAverages = useMemo(() => {
    return beans
      .map((bean) => {
        const brews = allBrews.filter(
          (b) => b.bean_id === bean.id && b.rating !== null,
        );
        const avg = average(brews.map((b) => b.rating as number));
        return { id: bean.id, name: bean.name, avg, count: brews.length };
      })
      .filter((b) => b.count > 0)
      .sort((a, b) => b.avg - a.avg);
  }, [beans, allBrews]);

  const ratioChartData = useMemo(
    () =>
      buildChartData(beanBrews, (brew) => {
        if (!brew.coffee_grams || !brew.water_grams) return null;
        const coffee = parseFloat(String(brew.coffee_grams));
        const water = parseFloat(String(brew.water_grams));
        const totalWater = water + (brew.ice_grams ?? 0);
        return bucketRatio(coffee, totalWater);
      }),
    [beanBrews],
  );

  const tempChartData = useMemo(
    () =>
      buildChartData(beanBrews, (brew) => {
        if (!brew.water_temp_celsius) return null;
        return bucketTemp(parseFloat(String(brew.water_temp_celsius)));
      }),
    [beanBrews],
  );

  const chartData = chartView === "ratio" ? ratioChartData : tempChartData;

  const selectedBean = beans.find((b) => b.id === selectedBeanId);

  if (loading) return <p className="text-ink/60">Loading...</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;

  return (
    <div>
      {/* Header + bean selector */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs text-accent uppercase tracking-wide mb-1">
            analytics
          </p>
          <h1 className="text-xl font-medium">Brew insights</h1>
        </div>
        <select
          value={selectedBeanId ?? ""}
          onChange={(e) => setSelectedBeanId(Number(e.target.value))}
          className="rounded-lg px-3 py-2 text-sm bg-surface border border-accent/20 text-ink cursor-pointer"
          style={{ background: "#3d2a1f" }}
        >
          {beans
            .filter((b) => allBrews.some((brew) => brew.bean_id === b.id))
            .map((bean) => (
              <option key={bean.id} value={bean.id}>
                {bean.name}
              </option>
            ))}
        </select>
      </div>

      {!selectedBeanId ? (
        <p className="text-ink/60 text-sm">
          No brews logged yet — log a brew to see insights.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* LEFT: main chart — takes 2/3 width */}
          <div className="md:col-span-2 bg-card rounded-xl p-5">
            {/* Chart header + toggle */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-card-ink-muted text-accent-roast uppercase font-bold tracking-wide">
                  {chartView === "ratio"
                    ? "Coffee:Water ratio vs Rating"
                    : "Water temp vs Rating"}
                </p>
                <p className="text-xs text-card-ink-muted/70 text-accent-strong mt-0.5">
                  {chartView === "ratio"
                    ? "Avg rating per ratio bucket · iced brews use total liquid"
                    : "Avg rating per temperature bucket"}
                </p>
              </div>
              <div className="inline-flex rounded-lg bg-white border border-card-ink-muted/20 p-0.5 gap-0.5">
                <button
                  onClick={() => setChartView("ratio")}
                  className={`px-3 py-1 rounded-md text-xs transition-colors ${
                    chartView === "ratio"
                      ? "bg-accent-strong text-ink"
                      : "text-card-ink-muted"
                  }`}
                >
                  Ratio
                </button>
                <button
                  onClick={() => setChartView("temp")}
                  className={`px-3 py-1 rounded-md text-xs transition-colors ${
                    chartView === "temp"
                      ? "bg-accent-strong text-ink"
                      : "text-card-ink-muted"
                  }`}
                >
                  Temp
                </button>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-card-ink-muted text-sm">
                Not enough data yet for this view.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={420}>
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(139,90,43,0.12)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#6b5d50" }}
                    axisLine={{ stroke: "#c4b8aa" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    tick={{ fontSize: 11, fill: "#6b5d50" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#f0e6da",
                      border: "0.5px solid rgba(139,90,43,0.2)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#3d2a1f",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value}/10`,
                      "Avg rating",
                    ]}
                    labelFormatter={(label) =>
                      `${label} (${chartData.find((d) => d.label === label)?.count ?? 0} brew${chartData.find((d) => d.label === label)?.count !== 1 ? "s" : ""})`
                    }
                  />
                  <Bar
                    dataKey="avg"
                    shape={(props: any) => (
                      <ColoredBar {...props} avg={props.avg ?? props.value} />
                    )}
                    maxBarSize={80}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* RIGHT: stacked panels — takes 1/3 width */}
          <div className="flex flex-col gap-4">
            {/* Quick stats */}
            <div className="bg-card rounded-xl p-4">
              <p className="text-xs text-card-ink-muted text-accent-roast uppercase font-bold tracking-wide mb-3">
                {selectedBean?.name}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-card-ink-muted text-accent-roast font-semibold mb-0.5">
                    Brews
                  </p>
                  <p className="text-2xl font-semibold text-card-ink text-accent-strong font-mono">
                    {stats.total}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-card-ink-muted text-accent-roast font-semibold mb-0.5">
                    Avg
                  </p>
                  <p className="text-2xl font-semibold text-accent-strong font-mono">
                    {stats.avg > 0 ? stats.avg : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-card-ink-muted text-accent-roast font-semibold mb-0.5">
                    Best
                  </p>
                  <p className="text-2xl font-semibold text-accent-strong font-mono">
                    {stats.best !== null ? `${stats.best}/10` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-card-ink-muted text-accent-roast font-semibold mb-0.5">
                    Iced
                  </p>
                  <p className="text-2xl font-semibold text-card-ink text-accent-strong font-mono">
                    {stats.iced}
                  </p>
                </div>
              </div>
            </div>

            {/* Per-bean averages */}
            <div className="bg-card rounded-xl p-4 flex-1">
              <p className="text-xs text-card-ink-muted text-accent-roast uppercase font-bold tracking-wide mb-3">
                Avg rating per bean
              </p>
              <div className="flex flex-col gap-2.5">
                {perBeanAverages.map((bean) => (
                  <div key={bean.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-card-ink text-accent-roast truncate max-w-[120px]">
                        {bean.name}
                      </span>
                      <span className="text-xs font-mono text-accent-strong font-semibold">
                        {bean.avg}
                      </span>
                    </div>
                    <div className="bg-accent/10 rounded h-1.5">
                      <div
                        className="rounded h-1.5"
                        style={{
                          width: `${(bean.avg / 10) * 100}%`,
                          background: barColor(bean.avg),
                        }}
                      />
                    </div>
                  </div>
                ))}
                {perBeanAverages.length === 0 && (
                  <p className="text-xs text-card-ink-muted">
                    No rated brews yet.
                  </p>
                )}
              </div>
            </div>

            {/* Suggestion */}
            <div className="bg-card rounded-xl p-4">
              <p className="text-xs text-card-ink-muted text-accent-roast uppercase font-semibold tracking-wide mb-3">
                Next brew suggestion
              </p>
              {suggestion?.suggestion ? (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {suggestion.suggestion.water_temp_celsius && (
                      <div>
                        <p className="text-xs text-card-ink-muted text-accent-roast mb-0.5">
                          Temp
                        </p>
                        <p className="text-sm font-mono text-card-ink text-accent-strong">
                          {suggestion.suggestion.water_temp_celsius}°C
                        </p>
                      </div>
                    )}
                    {suggestion.suggestion.coffee_grams && (
                      <div>
                        <p className="text-xs text-card-ink-muted text-accent-roast mb-0.5">
                          Coffee
                        </p>
                        <p className="text-sm font-mono text-card-ink text-accent-strong">
                          {suggestion.suggestion.coffee_grams}g
                        </p>
                      </div>
                    )}
                    {suggestion.suggestion.water_grams && (
                      <div>
                        <p className="text-xs text-card-ink-muted text-accent-roast mb-0.5">
                          Water
                        </p>
                        <p className="text-sm font-mono text-card-ink text-accent-strong">
                          {suggestion.suggestion.water_grams}ml
                        </p>
                      </div>
                    )}
                    {suggestion.suggestion.bloom_time_seconds && (
                      <div>
                        <p className="text-xs text-card-ink-muted text-accent-roast mb-0.5">
                          Bloom
                        </p>
                        <p className="text-sm font-mono text-card-ink text-accent-strong">
                          {suggestion.suggestion.bloom_time_seconds}s
                        </p>
                      </div>
                    )}
                    {suggestion.suggestion.total_time_seconds && (
                      <div>
                        <p className="text-xs text-card-ink-muted text-accent-roast mb-0.5">
                          Total
                        </p>
                        <p className="text-sm font-mono text-card-ink text-accent-strong">
                          {suggestion.suggestion.total_time_seconds}s
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-card-ink-muted text-accent-strong leading-relaxed">
                    {suggestion.message}
                  </p>
                </>
              ) : (
                <p className="text-xs text-card-ink-muted">
                  {suggestion?.message ??
                    "Log a rated brew to get a suggestion."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
