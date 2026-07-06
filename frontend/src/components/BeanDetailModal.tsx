"use client";

import type { Bean, Brew } from "@/types";

interface BeanDetailModalProps {
  bean: Bean;
  brews: Brew[];
  onClose: () => void;
  onEdit: () => void;
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-accent-roast text-card-ink-muted uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm text-accent-strong text-card-ink">{value}</p>
    </div>
  );
}

export default function BeanDetailModal({
  bean,
  brews,
  onClose,
  onEdit,
}: BeanDetailModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between text-accent-roast mb-4">
          <div>
            <h3 className="text-accent-roast font-bold text-card-ink">
              {bean.name}
            </h3>
            <p className="text-xs text-accent-strong mt-0.5">
              {[bean.roaster, bean.continent].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button
            onClick={onEdit}
            className="bg-accent-strong text-ink text-xs px-3 py-1.5 rounded-lg"
          >
            Edit
          </button>
        </div>

        {/* Bean info grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Origin" value={bean.origin} />
          <Field label="Region" value={bean.region} />
          <Field label="Farm" value={bean.farm} />
          <Field label="Variety" value={bean.variety} />
          <Field
            label="Altitude"
            value={bean.altitude ? `${bean.altitude} masl` : null}
          />
          <Field label="Process" value={bean.process} />
          <Field label="Roast date" value={bean.roast_date} />
        </div>

        {/* Notes */}
        {bean.notes && (
          <div className="border-t border-card-ink-muted/15 text-accent-strong pt-3 mb-4">
            <p className="text-xs text-card-ink-muted uppercase tracking-wide mb-1">
              Notes
            </p>
            <p className="text-sm text-card-ink">{bean.notes}</p>
          </div>
        )}

        {/* Brew history */}
        <div className="border-t border-card-ink-muted/15 pt-3">
          <p className="text-xs text-card-ink-muted text-accent-roast font-bold uppercase tracking-wide mb-2">
            Brew history ({brews.length})
          </p>
          {brews.length === 0 ? (
            <p className="text-sm text-card-ink-muted text-accent-strong">
              No brews logged yet for this bean.
            </p>
          ) : (
            <div className="flex flex-col gap-2 text-accent-roast">
              {brews.map((brew) => (
                <div
                  key={brew.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-card-ink-muted">
                    {new Date(brew.brewed_at).toLocaleDateString()}
                  </span>
                  <span className="text-card-ink">
                    {brew.water_temp_celsius
                      ? `${brew.water_temp_celsius}°C · `
                      : ""}
                    {brew.coffee_grams ?? "—"}g / {brew.water_grams ?? "—"}g
                    {brew.grind_size ? ` · ${brew.grind_size}` : ""}
                  </span>
                  <span className="font-mono font-semibold text-accent-strong">
                    {brew.rating ? `${brew.rating}/10` : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
