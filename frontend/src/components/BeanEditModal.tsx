"use client";

import { useState } from "react";
import { beansApi } from "@/lib/api";
import type { Bean, BeanUpdate } from "@/types";

const CONTINENTS = [
  "Africa",
  "Asia-Pacific",
  "Central America",
  "South America",
  "North America",
  "Middle East",
];

interface BeanEditModalProps {
  bean: Bean;
  onClose: () => void;
  onSaved: (bean: Bean) => void;
}

export default function BeanEditModal({
  bean,
  onClose,
  onSaved,
}: BeanEditModalProps) {
  const [form, setForm] = useState<BeanUpdate>({
    name: bean.name,
    roaster: bean.roaster,
    continent: bean.continent,
    origin: bean.origin,
    region: bean.region,
    farm: bean.farm,
    variety: bean.variety,
    altitude: bean.altitude,
    process: bean.process,
    notes: bean.notes,
    roast_date: bean.roast_date,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function field(
    key: keyof BeanUpdate,
    label: string,
    type: string = "text",
    span2 = false,
  ) {
    return (
      <div className={span2 ? "col-span-2" : ""}>
        <label className="text-xs text-card-ink-muted uppercase tracking-wide block mb-1">
          {label}
        </label>
        <input
          type={type}
          value={(form[key] as string | number | null) ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              [key]:
                type === "number"
                  ? e.target.value
                    ? Number(e.target.value)
                    : null
                  : e.target.value || null,
            })
          }
          className="w-full rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20"
        />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) {
      setError("Bean name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const updated = await beansApi.update(bean.id, form);
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-accent-roast text-card-ink mb-4">
          Edit bean
        </h3>

        {error && <p className="text-red-700 text-xs mb-3">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 text-accent gap-3 mb-4">
            {field("name", "Name", "text", true)}
            {field("roaster", "Roaster")}

            {/* Continent — dropdown since options are fixed */}
            <div>
              <label className="text-xs text-card-ink-muted uppercase tracking-wide block mb-1">
                Continent
              </label>
              <select
                value={form.continent ?? ""}
                onChange={(e) =>
                  setForm({ ...form, continent: e.target.value || null })
                }
                className="w-full rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20"
              >
                <option value="">—</option>
                {CONTINENTS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {field("origin", "Origin")}
            {field("region", "Region")}
            {field("farm", "Farm")}
            {field("variety", "Variety")}
            {field("altitude", "Altitude (masl)", "number")}
            {field("process", "Process")}
            {field("roast_date", "Roast date", "date")}

            {/* Notes — textarea, full width */}
            <div className="col-span-2">
              <label className="text-xs text-card-ink-muted uppercase tracking-wide block mb-1">
                Notes
              </label>
              <textarea
                value={form.notes ?? ""}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value || null })
                }
                rows={3}
                className="w-full rounded-lg px-3 py-2 text-sm bg-white text-card-ink border border-card-ink-muted/20 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-accent-strong text-ink rounded-lg py-2 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-card-ink-muted/15 text-card-ink rounded-lg py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
