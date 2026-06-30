"use client";

import { useEffect, useState } from "react";
import { beansApi, brewsApi, brewParametersApi } from "@/lib/api";
import type { Bean, Brew, BrewCreate } from "@/types";
import WheelPicker from "@/components/SliderInput";
import NewBeanModal from "@/components/NewBeanModal";

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
};

export default function BrewsPage() {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brews, setBrews] = useState<Brew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<BrewCreate>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showNewBeanModal, setShowNewBeanModal] = useState(false);
  const [sortByRating, setSortByRating] = useState<"none" | "asc" | "desc">(
    "none",
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Brew>>({});

  const [brewType, setBrewType] = useState<"hot" | "iced">("hot");
  const [filterType, setFilterType] = useState<"cone" | "flat">("cone");
  const [iceGrams, setIceGrams] = useState<number | undefined>(undefined);

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
      };
      const newBrew = await brewsApi.create(payload);

      await brewParametersApi.create(newBrew.id, "brew_type", brewType);
      await brewParametersApi.create(newBrew.id, "filter_type", filterType);
      if (brewType === "iced" && iceGrams !== undefined) {
        await brewParametersApi.create(
          newBrew.id,
          "ice_grams",
          String(iceGrams),
        );
      }

      setBrews((prev) => [newBrew, ...prev]);
      setForm(emptyForm);
      setBrewType("hot");
      setFilterType("cone");
      setIceGrams(undefined);
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

  function toggleRatingSort() {
    setSortByRating((prev) => {
      if (prev === "none") return "desc";
      if (prev === "desc") return "asc";
      return "none";
    });
  }

  const displayedBrews = (() => {
    if (sortByRating === "none") return brews;
    const sorted = [...brews].sort((a, b) => {
      const aRating = a.rating ?? -1;
      const bRating = b.rating ?? -1;
      return sortByRating === "desc" ? bRating - aRating : aRating - bRating;
    });
    return sorted;
  })();

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
          <label className="text-xs text-accent-roast text-card-ink-muted block mb-1.5">
            Brew type
          </label>
          <div className="inline-flex rounded-lg bg-white border border-card-ink-muted/20 p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setBrewType("hot")}
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                brewType === "hot"
                  ? "bg-accent-strong text-ink"
                  : "text-card-ink-muted"
              }`}
            >
              Hot
            </button>
            <button
              type="button"
              onClick={() => setBrewType("iced")}
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                brewType === "iced"
                  ? "bg-accent-strong text-ink"
                  : "text-card-ink-muted"
              }`}
            >
              Iced
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <select
            value={form.bean_id ?? ""}
            onChange={(e) => handleBeanSelectChange(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20 text-accent"
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
            onChange={(e) => setForm({ ...form, grind_size: e.target.value })}
            className="rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20 text-accent"
          >
            <option value="">Select Grind Size</option>
            <option>coarse</option>
            <option>medium-coarse</option>
            <option>medium</option>
            <option>medium-fine</option>
            <option>fine</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="text-xs text-accent-roast text-card-ink-muted block mb-1.5">
            Filter type
          </label>
          <div className="inline-flex rounded-lg bg-white border border-card-ink-muted/20 p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setFilterType("cone")}
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                filterType === "cone"
                  ? "bg-accent-strong text-ink"
                  : "text-card-ink-muted"
              }`}
            >
              Cone
            </button>
            <button
              type="button"
              onClick={() => setFilterType("flat")}
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                filterType === "flat"
                  ? "bg-accent-strong text-ink"
                  : "text-card-ink-muted"
              }`}
            >
              Flat-bottom
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-accent-roast">
          <WheelPicker
            label="Water temp"
            value={form.water_temp_celsius}
            onChange={(v) => setForm({ ...form, water_temp_celsius: v })}
            min={0}
            max={100}
            step={0.5}
            unit="°C"
          />
          <WheelPicker
            label="Coffee"
            value={form.coffee_grams}
            onChange={(v) => setForm({ ...form, coffee_grams: v })}
            min={5}
            max={40}
            step={0.5}
            unit="g"
          />

          {/* Liquid: water + ice (when iced) grouped together */}
          <div className="col-span-2">
            <div
              className={`grid gap-3 ${brewType === "iced" ? "grid-cols-2" : "grid-cols-1"}`}
            >
              <WheelPicker
                label="Water"
                value={form.water_grams}
                onChange={(v) => setForm({ ...form, water_grams: v })}
                min={50}
                max={600}
                step={5}
                unit="g"
              />
              {brewType === "iced" && (
                <WheelPicker
                  label="Ice"
                  value={iceGrams}
                  onChange={setIceGrams}
                  min={0}
                  max={300}
                  step={10}
                  unit="g"
                />
              )}
            </div>
            {brewType === "iced" &&
              form.water_grams !== undefined &&
              iceGrams !== undefined && (
                <p className="text-xs text-card-ink-muted mt-1.5">
                  Total liquid:{" "}
                  <span className="font-mono text-card-ink">
                    {form.water_grams + iceGrams}g
                  </span>
                </p>
              )}
          </div>

          <WheelPicker
            label="Rating"
            value={form.rating}
            onChange={(v) => setForm({ ...form, rating: v })}
            min={1}
            max={10}
            step={1}
            unit="/10"
          />
          <WheelPicker
            label="Bloom time"
            value={form.bloom_time_seconds}
            onChange={(v) => setForm({ ...form, bloom_time_seconds: v })}
            min={0}
            max={90}
            step={5}
            unit="s"
          />
          <WheelPicker
            label="Total time"
            value={form.total_time_seconds}
            onChange={(v) => setForm({ ...form, total_time_seconds: v })}
            min={60}
            max={420}
            step={10}
            unit="s"
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Tasting notes"
            value={form.tasting_notes ?? ""}
            onChange={(e) =>
              setForm({ ...form, tasting_notes: e.target.value })
            }
            className="w-full rounded-lg px-3 py-2 text-sm bg-white text-card-ink border text-black border-card-ink-muted/20"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent-strong text-ink rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Logging..." : "Log Brew"}
        </button>
      </form>

      {/* Brew history table */}
      <h2 className="text-l font-medium text-ink mb-3">History</h2>
      <div className="bg-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-ink-muted/15 text-card-ink-muted text-left text-accent-roast">
              <th className="px-4 py-2.5 font-bold">Bean</th>
              <th className="px-4 py-2.5 font-bold">Temp</th>
              <th className="px-4 py-2.5 font-bold">Coffee/Water</th>
              <th className="px-4 py-2.5 font-bold">Grind</th>
              <th
                className="px-4 py-2.5 font-bold cursor-pointer select-none hover:text-card-ink"
                onClick={toggleRatingSort}
              >
                Rating
                <span className="ml-1 text-xs">
                  {sortByRating === "desc" && "↓"}
                  {sortByRating === "asc" && "↑"}
                  {sortByRating === "none" && "↕"}
                </span>
              </th>
              <th className="px-4 py-2.5 font-bold">Tasting Notes</th>
              <th className="px-4 py-2.5 font-bold"></th>
            </tr>
          </thead>
          <tbody className="text-accent">
            {displayedBrews.map((brew) => {
              const isEditing = editingId === brew.id;
              return (
                <tr
                  key={brew.id}
                  className="border-b border-card-ink-muted/10 text-card-ink"
                >
                  <td className="px-4 py-2.5">{beanName(brew.bean_id)}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {brew.water_temp_celsius
                      ? `${brew.water_temp_celsius}°C`
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {brew.coffee_grams ?? "—"}g / {brew.water_grams ?? "—"}g
                  </td>
                  <td className="px-4 py-2.5">
                    {isEditing ? (
                      <input
                        value={editForm.grind_size ?? ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            grind_size: e.target.value,
                          })
                        }
                        className="rounded px-2 py-1 text-xs bg-white border border-card-ink-muted/20 w-20"
                      />
                    ) : (
                      brew.grind_size || "—"
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {isEditing ? (
                      <WheelPicker
                        label=""
                        min={1}
                        max={10}
                        step={1}
                        unit="/10"
                        value={editForm.rating ?? undefined}
                        onChange={(v) =>
                          setEditForm({ ...editForm, rating: v })
                        }
                      />
                    ) : (
                      <span className="text-accent-strong">
                        {brew.rating ? `${brew.rating}/10` : "—"}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-card-ink-muted text-xs max-w-[180px] truncate">
                    {isEditing ? (
                      <input
                        value={editForm.tasting_notes ?? ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            tasting_notes: e.target.value,
                          })
                        }
                        className="rounded px-2 py-1 text-xs bg-white border border-card-ink-muted/20 w-full"
                      />
                    ) : (
                      brew.tasting_notes || "—"
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(brew.id)}
                          className="text-xs text-green-700 font-medium mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-card-ink-muted"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(brew)}
                          className="text-xs text-accent-strong font-medium mr-2"
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
                  </td>
                </tr>
              );
            })}
            {brews.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-card-ink-muted text-sm"
                >
                  No brews logged yet — use the form above to log your first
                  one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
