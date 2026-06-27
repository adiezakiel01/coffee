"use client";

import { useEffect, useState } from "react";
import { beansApi, brewsApi } from "@/lib/api";
import type { Bean, Brew, BrewCreate } from "@/types";

const emptyForm BrewCreate = {
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

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Brew>>({});

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
      await brewsApi.delete(brewId):
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
      <form
        onSubmit={handleCreate}
        className="bg-card rounded-xl p-5 mb-8 grid grid-cols-4 gap-3"
      >
        <select
          value={form.bean_id ?? ""}
          onChange={(e) =>
            setForm({ ...form, bean_id: e.target.value ? Number(e.target.value) : null })
          }
          className="col-span-2 rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20"
        >
          <option value="">No bean selected</option>
          {beans.map((bean) => (
            <option key={bean.id} value={bean.id}>
              {bean.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Grind size"
          value={form.grind_size ?? ""}
          onChange={(e) => setForm({ ...form, grind_size: e.target.value })}
          className="col-span-2 rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20"
        />

        <input
          type="number"
          step="0.1"
          placeholder="Water temp (°C)"
          value={form.water_temp_celsius ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              water_temp_celsius: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20"
        />
        <input
          type="number"
          step="0.1"
          placeholder="Coffee (g)"
          value={form.coffee_grams ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              coffee_grams: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20"
        />
        <input
          type="number"
          step="0.1"
          placeholder="Water (g)"
          value={form.water_grams ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              water_grams: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20"
        />
        <input
          type="number"
          placeholder="Rating (1-10)"
          min={1}
          max={10}
          value={form.rating ?? ""}
          onChange={(e) =>
            setForm({ ...form, rating: e.target.value ? Number(e.target.value) : undefined })
          }
          className="rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20"
        />

        <input
          type="number"
          placeholder="Bloom time (s)"
          value={form.bloom_time_seconds ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              bloom_time_seconds: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20"
        />
        <input
          type="number"
          placeholder="Total time (s)"
          value={form.total_time_seconds ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              total_time_seconds: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20"
        />
        <input
          type="text"
          placeholder="Tasting notes"
          value={form.tasting_notes ?? ""}
          onChange={(e) => setForm({ ...form, tasting_notes: e.target.value })}
          className="col-span-2 rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20"
        />

        <button
          type="submit"
          disabled={submitting}
          className="col-span-4 mt-1 bg-accent-strong text-ink rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Logging..." : "Log brew"}
        </button>
      </form>

      {/* Brew history table */}
      <h2 className="text-sm font-medium text-ink/70 mb-3">History</h2>
      <div className="bg-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-ink-muted/15 text-card-ink-muted text-left">
              <th className="px-4 py-2.5 font-normal">Bean</th>
              <th className="px-4 py-2.5 font-normal">Temp</th>
              <th className="px-4 py-2.5 font-normal">Coffee/Water</th>
              <th className="px-4 py-2.5 font-normal">Grind</th>
              <th className="px-4 py-2.5 font-normal">Rating</th>
              <th className="px-4 py-2.5 font-normal">Notes</th>
              <th className="px-4 py-2.5 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {brews.map((brew) => {
              const isEditing = editingId === brew.id;
              return (
                <tr key={brew.id} className="border-b border-card-ink-muted/10 text-card-ink">
                  <td className="px-4 py-2.5">{beanName(brew.bean_id)}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {brew.water_temp_celsius ? `${brew.water_temp_celsius}°C` : "—"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {brew.coffee_grams ?? "—"}g / {brew.water_grams ?? "—"}g
                  </td>
                  <td className="px-4 py-2.5">
                    {isEditing ? (
                      <input
                        value={editForm.grind_size ?? ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, grind_size: e.target.value })
                        }
                        className="rounded px-2 py-1 text-xs bg-white border border-card-ink-muted/20 w-20"
                      />
                    ) : (
                      brew.grind_size || "—"
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {isEditing ? (
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={editForm.rating ?? ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, rating: Number(e.target.value) })
                        }
                        className="rounded px-2 py-1 text-xs bg-white border border-card-ink-muted/20 w-14"
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
                          setEditForm({ ...editForm, tasting_notes: e.target.value })
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
                <td colSpan={7} className="px-4 py-6 text-center text-card-ink-muted text-sm">
                  No brews logged yet — use the form above to log your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
