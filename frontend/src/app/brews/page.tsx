"use client";

import { useEffect, useState, useMemo } from "react";
import { beansApi, brewsApi } from "@/lib/api";
import type { Bean, Brew, BrewCreate } from "@/types";
import WheelPicker from "@/components/SliderInput";
import NewBeanModal from "@/components/NewBeanModal";
import { Snowflake } from "lucide-react";

const GRIND_SIZES = [
  "Extra-fine",
  "Fine",
  "Medium-fine",
  "Medium",
  "Medium-coarse",
  "Coarse",
  "Extra-coarse",
];

const emptyForm: BrewCreate = {
  bean_id: null,
  grind_size: "",
  water_temp_celsius: undefined,
  coffee_grams: undefined,
  water_grams: undefined,
  bloom_time_seconds: undefined,
  total_time_seconds: undefined,
  rating: undefined,
  tasting_notes: "",
  brew_type: "hot",
  filter_type: "cone",
  ice_grams: null,
};

interface BrewEditForm {
  rating?: number | null;
  tasting_notes?: string | null;
  grind_size?: string | null;
  water_temp_celsius?: number;
  coffee_grams?: number;
  water_grams?: number;
}

type SortOption = "newest" | "oldest" | "rating_desc" | "rating_asc";
type BrewTypeFilter = "all" | "hot" | "iced";

export default function BrewsPage() {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brews, setBrews] = useState<Brew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<BrewCreate>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showNewBeanModal, setShowNewBeanModal] = useState(false);

  const [beanFilter, setBeanFilter] = useState<string>("all");
  const [brewTypeFilter, setBrewTypeFilter] = useState<BrewTypeFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<BrewEditForm>({});

  /*const [brewType, setBrewType] = useState<"hot" | "iced">("hot");
  const [filterType, setFilterType] = useState<"cone" | "flat">("cone");
  const [iceGrams, setIceGrams] = useState<number | undefined>(undefined);
  const [brewParameters, setBrewParameters] = useState<
    Record<number, Record<string, string>>
  >({});*/

  async function loadData() {
    try {
      const [beansData, brewsData] = await Promise.all([
        beansApi.list(),
        brewsApi.list(),
      ]);
      setBeans(beansData);
      setBrews(brewsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function beanName(beanId: number | null): string {
    if (beanId === null) return "-";
    return beans.find((b) => b.id === beanId)?.name ?? "unknown bean";
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function computeRatio(brew: Brew): string {
    if (!brew.coffee_grams) return "-";
    const coffee = parseFloat(String(brew.coffee_grams));
    const water = parseFloat(String(brew.water_grams ?? 0));
    const ice = brew.ice_grams ?? 0;
    const total = water + ice;
    if (total === 0) return "-";
    return `1:${(total / coffee).toFixed(1)}`;
  }

  function totalWater(brew: Brew): string {
    const water = brew.water_grams ? parseFloat(String(brew.water_grams)) : 0;
    const ice = brew.ice_grams ?? 0;
    const total = water + ice;
    return total > 0 ? `${total}ml` : "—";
  }

  const displayedBrews = useMemo(() => {
    let filtered = [...brews];

    if (beanFilter !== "all") {
      filtered = filtered.filter((b) => String(b.bean_id) === beanFilter);
    }

    if (brewTypeFilter !== "all") {
      filtered = filtered.filter(
        (b) => (b.brew_type ?? "hot") === brewTypeFilter,
      );
    }

    filtered.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.brewed_at).getTime() - new Date(a.brewed_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.brewed_at).getTime() - new Date(b.brewed_at).getTime()
          );
        case "rating_desc":
          if (a.rating === null && b.rating === null) return 0;
          if (a.rating === null) return 1;
          if (b.rating === null) return -1;
          return b.rating - a.rating;
        case "rating_asc":
          if (a.rating === null && b.rating === null) return 0;
          if (a.rating === null) return 1;
          if (b.rating === null) return -1;
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [brews, beanFilter, brewTypeFilter, sortOption]);

  function handleBeanSelectChange(value: string) {
    if (value === "__new__") {
      setShowNewBeanModal(true);
      return;
    }
    setForm({ ...form, bean_id: value ? Number(value) : null });
  }

  function handleBeanCreated(bean: Bean) {
    setBeans((prev) => [...prev, bean]);
    setForm({ ...form, bean_id: bean.id });
    setShowNewBeanModal(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: BrewCreate = {
        ...form,
        bean_id: form.bean_id || null,
        grind_size: form.grind_size || null,
        tasting_notes: form.tasting_notes || null,
        brew_type: form.brew_type,
        filter_type: form.filter_type,
        ice_grams: form.brew_type === "iced" ? form.ice_grams : null,
      };
      const newBrew = await brewsApi.create(payload);
      setBrews((prev) => [newBrew, ...prev]);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create brew");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(brew: Brew) {
    setEditingId(brew.id);
    setEditForm({
      rating: brew.rating,
      tasting_notes: brew.tasting_notes,
      grind_size: brew.grind_size,
      water_temp_celsius: brew.water_temp_celsius
        ? parseFloat(brew.water_temp_celsius)
        : undefined,
      coffee_grams: brew.coffee_grams
        ? parseFloat(brew.coffee_grams)
        : undefined,
      water_grams: brew.water_grams ? parseFloat(brew.water_grams) : undefined,
    });
  }
  async function saveEdit(brewId: number) {
    try {
      const updated = await brewsApi.update(brewId, editForm);
      setBrews((prev) => prev.map((b) => (b.id === brewId ? updated : b)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update brew");
    }
  }

  async function handleDelete(brewId: number) {
    if (!confirm("Delete this brew? This cannot be undone.")) return;
    try {
      await brewsApi.delete(brewId);
      setBrews((prev) => prev.filter((b) => b.id !== brewId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete brew");
    }
  }

  if (loading) return <p className="text-ink/60">Loading...</p>;

  return (
    <div>
      <p className="text-xs text-accent uppercase tracking-wide mb-1">brews</p>
      <h1 className="text-xl font-medium mb-6">Log a brew</h1>

      {error && (
        <p className="text-red-400 text-sm mb-4 bg-red-950/30 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Brew logger form */}
      <form onSubmit={handleCreate} className="bg-card rounded-xl p-5 mb-8">
        {/* Brew type toggle */}
        <div className="mb-4">
          <label className="text-xs text-card-ink-muted block text-accent-roast font-semibold mb-1.5">
            Brew type
          </label>
          <div className="inline-flex rounded-lg bg-white border border-card-ink-muted/20 p-0.5 gap-0.5">
            {(["hot", "iced"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setForm({ ...form, brew_type: type, ice_grams: null })
                }
                className={`px-4 py-1.5 rounded-md text-sm capitalize transition-colors ${
                  form.brew_type === type
                    ? "bg-accent-strong text-ink"
                    : "text-card-ink-muted"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Bean + grind */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <select
            value={form.bean_id ?? ""}
            onChange={(e) => handleBeanSelectChange(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm bg-white text-accent-roast text-card-ink border border-card-ink-muted/20"
          >
            <option value="">No bean selected</option>
            {beans.map((bean) => (
              <option key={bean.id} value={bean.id}>
                {bean.name}
              </option>
            ))}
            <option value="__new__">+ New bean...</option>
          </select>

          <select
            value={form.grind_size ?? ""}
            onChange={(e) =>
              setForm({ ...form, grind_size: e.target.value || null })
            }
            className="rounded-lg px-3 py-2 text-sm bg-white text-accent-roast text-card-ink border border-card-ink-muted/20"
          >
            <option value="">Select grind size</option>
            {GRIND_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Filter type toggle */}
        <div className="mb-4">
          <label className="text-xs text-card-ink-muted text-accent-roast font-semibold block mb-1.5">
            Filter type
          </label>
          <div className="inline-flex rounded-lg bg-white border border-card-ink-muted/20 p-0.5 gap-0.5">
            {(
              [
                ["cone", "Cone"],
                ["flat", "Flat-bottom"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, filter_type: value })}
                className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                  form.filter_type === value
                    ? "bg-accent-strong text-ink"
                    : "text-card-ink-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Numeric fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 text-accent-roast font-semibold gap-4 mb-4">
          <WheelPicker
            label="Water temp"
            value={form.water_temp_celsius ?? undefined}
            onChange={(v) => setForm({ ...form, water_temp_celsius: v })}
            min={80}
            max={98}
            step={0.5}
            unit="°C"
          />
          <WheelPicker
            label="Coffee"
            value={form.coffee_grams ?? undefined}
            onChange={(v) => setForm({ ...form, coffee_grams: v })}
            min={5}
            max={40}
            step={0.5}
            unit="g"
          />

          {/* Liquid: water + ice grouped */}
          <div className="col-span-2">
            <label className="text-xs text-card-ink-muted block mb-1.5">
              Liquid
            </label>
            <div
              className={`grid gap-3 ${form.brew_type === "iced" ? "grid-cols-2" : "grid-cols-1"}`}
            >
              <WheelPicker
                label="Water"
                value={form.water_grams ?? undefined}
                onChange={(v) => setForm({ ...form, water_grams: v })}
                min={50}
                max={600}
                step={5}
                unit="ml"
              />
              {form.brew_type === "iced" && (
                <WheelPicker
                  label="Ice"
                  value={form.ice_grams ?? undefined}
                  onChange={(v) => setForm({ ...form, ice_grams: v ?? null })}
                  min={0}
                  max={300}
                  step={10}
                  unit="g"
                />
              )}
            </div>
            {form.brew_type === "iced" &&
              form.water_grams !== undefined &&
              form.ice_grams !== null &&
              form.ice_grams !== undefined && (
                <p className="text-xs text-card-ink-muted mt-1.5">
                  Total liquid:{" "}
                  <span className="font-mono text-card-ink">
                    {(form.water_grams ?? 0) + (form.ice_grams ?? 0)}ml
                  </span>
                </p>
              )}
          </div>

          <WheelPicker
            label="Rating"
            value={form.rating ?? undefined}
            onChange={(v) => setForm({ ...form, rating: v })}
            min={1}
            max={10}
            step={1}
            unit="/10"
          />
          <WheelPicker
            label="Bloom time"
            value={form.bloom_time_seconds ?? undefined}
            onChange={(v) => setForm({ ...form, bloom_time_seconds: v })}
            min={0}
            max={90}
            step={5}
            unit="s"
          />
          <WheelPicker
            label="Total time"
            value={form.total_time_seconds ?? undefined}
            onChange={(v) => setForm({ ...form, total_time_seconds: v })}
            min={60}
            max={420}
            step={10}
            unit="s"
          />
        </div>

        <input
          type="text"
          placeholder="Tasting notes"
          value={form.tasting_notes ?? ""}
          onChange={(e) => setForm({ ...form, tasting_notes: e.target.value })}
          className="w-full rounded-lg px-3 py-2 text-sm bg-white text-card-ink border text-accent-roast border-card-ink-muted/20 mb-4"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent-strong text-ink rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Logging..." : "Log brew"}
        </button>
      </form>

      {/* History header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-ink/70">
          History
          <span className="ml-2 text-ink/40 font-normal">
            {displayedBrews.length} brew{displayedBrews.length !== 1 ? "s" : ""}
          </span>
        </h2>
      </div>

      {/* Filter + sort bar */}
      <div className="bg-card rounded-xl border border-card-ink-muted/10 p-3 mb-4 flex flex-wrap gap-2 items-center">
        {/* Bean filter */}
        <select
          value={beanFilter}
          onChange={(e) => setBeanFilter(e.target.value)}
          className="rounded-lg px-2.5 py-1.5 text-xs bg-white text-accent text-card-ink border border-card-ink-muted/20 flex-1 min-w-[120px]"
        >
          <option value="all">All beans</option>
          {beans.map((bean) => (
            <option key={bean.id} value={String(bean.id)}>
              {bean.name}
            </option>
          ))}
        </select>

        {/* Brew type filter */}
        <div className="inline-flex rounded-lg bg-white border border-card-ink-muted/20 p-0.5 gap-0.5">
          {(["all", "hot", "iced"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setBrewTypeFilter(type)}
              className={`px-3 py-1 rounded-md text-xs capitalize transition-colors ${
                brewTypeFilter === type
                  ? "bg-accent-strong text-ink"
                  : "text-card-ink-muted"
              }`}
            >
              {type === "all" ? "All" : type === "hot" ? "Hot" : "❄ Iced"}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="rounded-lg px-2.5 py-1.5 text-xs bg-white text-accent text-card-ink border border-card-ink-muted/20 flex-1 min-w-[120px]"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="rating_desc">Rating ↓</option>
          <option value="rating_asc">Rating ↑</option>
        </select>
      </div>

      {/* Brew cards */}
      <div className="flex flex-col gap-3">
        {displayedBrews.length === 0 && (
          <p className="text-center text-card-ink-muted text-sm py-8">
            {brews.length === 0
              ? "No brews logged yet — use the form above to log your first one."
              : "No brews match the current filters."}
          </p>
        )}

        {displayedBrews.map((brew) => {
          const isEditing = editingId === brew.id;
          const isIced = brew.brew_type === "iced";
          const filterLabel =
            brew.filter_type === "cone"
              ? "Cone"
              : brew.filter_type === "flat"
                ? "Flat-bottom"
                : null;

          return (
            <div key={brew.id} className="bg-card rounded-xl p-4">
              {/* Top row: bean + badges + rating */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-accent-roast text-card-ink">
                    {beanName(brew.bean_id)}
                  </span>
                  {isIced && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-accent/15 text-accent-strong inline-flex items-center gap-1">
                      <Snowflake size={12} className="shrink-0" />
                      iced
                    </span>
                  )}
                  {filterLabel && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-card-ink-muted/10 text-accent-strong text-card-ink-muted">
                      {filterLabel}
                    </span>
                  )}
                </div>
                {brew.rating && (
                  <span className="font-mono font-semibold text-accent-strong ml-2 flex-shrink-0">
                    {brew.rating}/10
                  </span>
                )}
              </div>

              {/* Parameters grid */}
              {isEditing ? (
                <div className="grid grid-cols-2 text-accent-roast gap-3 mb-3">
                  <WheelPicker
                    label="Water temp"
                    compact
                    min={80}
                    max={98}
                    step={0.5}
                    unit="°C"
                    value={editForm.water_temp_celsius}
                    onChange={(v) =>
                      setEditForm({ ...editForm, water_temp_celsius: v })
                    }
                  />
                  <div className="flex items-end gap-1">
                    <WheelPicker
                      label="Coffee"
                      compact
                      min={5}
                      max={40}
                      step={0.5}
                      unit="g"
                      value={editForm.coffee_grams}
                      onChange={(v) =>
                        setEditForm({ ...editForm, coffee_grams: v })
                      }
                    />
                    <span className="text-card-ink-muted text-sm mb-1">/</span>
                    <WheelPicker
                      label="Water"
                      compact
                      min={50}
                      max={600}
                      step={5}
                      unit="g"
                      value={editForm.water_grams}
                      onChange={(v) =>
                        setEditForm({ ...editForm, water_grams: v })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-card-ink-muted block mb-1">
                      Grind
                    </label>
                    <select
                      value={editForm.grind_size ?? ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          grind_size: e.target.value || null,
                        })
                      }
                      className="w-full rounded-lg px-2 py-1.5 text-xs bg-white border border-card-ink-muted/20 text-card-ink"
                    >
                      <option value="">—</option>
                      {GRIND_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                  <WheelPicker
                    label="Rating"
                    compact
                    min={1}
                    max={10}
                    step={1}
                    unit="/10"
                    value={editForm.rating ?? undefined}
                    onChange={(v) => setEditForm({ ...editForm, rating: v })}
                  />
                  <div className="col-span-2">
                    <label className="text-xs text-card-ink-muted block mb-1">
                      Tasting notes
                    </label>
                    <input
                      value={editForm.tasting_notes ?? ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          tasting_notes: e.target.value,
                        })
                      }
                      className="w-full rounded-lg px-2 py-1.5 text-xs bg-white border border-card-ink-muted/20 text-card-ink"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <p className="text-xs font-semibold text-accent-roast text-card-ink-muted">
                        Temp
                      </p>
                      <p className="text-xs font-mono text-accent-strong text-card-ink">
                        {brew.water_temp_celsius
                          ? `${brew.water_temp_celsius}°C`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-accent-roast text-card-ink-muted">
                        Coffee/Water
                      </p>
                      <p className="text-xs font-mono text-accent-strong text-card-ink">
                        {brew.coffee_grams ?? "—"}g / {totalWater(brew)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-accent-roast text-card-ink-muted">
                        Ratio
                      </p>
                      <p className="text-xs font-mono text-accent-strong text-card-ink">
                        {computeRatio(brew)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-accent-roast text-card-ink-muted">
                        Grind
                      </p>
                      <p className="text-xs text-accent-strong text-card-ink">
                        {brew.grind_size || "—"}
                      </p>
                    </div>
                    {brew.bloom_time_seconds && (
                      <div>
                        <p className="text-xs font-semibold text-accent-roast text-card-ink-muted">
                          Bloom
                        </p>
                        <p className="text-xs font-mono text-accent-strong text-card-ink">
                          {brew.bloom_time_seconds}s
                        </p>
                      </div>
                    )}
                    {brew.total_time_seconds && (
                      <div>
                        <p className="text-xs font-semibold text-accent-roast text-card-ink-muted">
                          Total time
                        </p>
                        <p className="text-xs font-mono text-accent-strong text-card-ink">
                          {brew.total_time_seconds}s
                        </p>
                      </div>
                    )}
                  </div>

                  {brew.tasting_notes && (
                    <p className="text-xs text-accent-roast text-card-ink-muted italic mb-2">
                      &ldquo;{brew.tasting_notes}&rdquo;
                    </p>
                  )}
                </>
              )}

              {/* Footer: date + actions */}
              <div className="flex items-center justify-between pt-2 border-t border-card-ink-muted/10">
                <span className="text-xs text-accent text-card-ink-muted font-mono">
                  {formatDate(brew.brewed_at)}
                </span>
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(brew.id)}
                        className="text-xs text-green-700 font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-red-700"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(brew)}
                        className="text-xs text-accent-strong font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(brew.id)}
                        className="text-xs text-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showNewBeanModal && (
        <NewBeanModal
          onClose={() => setShowNewBeanModal(false)}
          onCreated={handleBeanCreated}
        />
      )}
    </div>
  );
}
