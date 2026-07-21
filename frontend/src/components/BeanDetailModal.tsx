"use client";
import { useEffect, useState } from "react";
import { bagsApi } from "@/lib/api";
import type { Bean, Brew, BagWithStats } from "@/types";
import NewBagModal from "@/components/NewBagModal";

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

function formatRoastDate(dateStr: string | null): string {
  if (!dateStr) return "Unknown roast date";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BeanDetailModal({
  bean,
  brews,
  onClose,
  onEdit,
}: BeanDetailModalProps) {
  const [bags, setBags] = useState<BagWithStats[]>([]);
  const [loadingBags, setLoadingBags] = useState(true);
  const [selectedBagId, setSelectedBagId] = useState<number | null>(null);
  const [showNewBagModal, setShowNewBagModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingBags(true);
    bagsApi
      .listForBean(bean.id)
      .then((data) => {
        if (cancelled) return;
        setBags(data);
        if (data.length > 0) setSelectedBagId(data[0].id);
      })
      .catch(() => {
        if (!cancelled) setBags([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBags(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bean.id]);

  function handleBagCreated(
    bag:
      | BagWithStats
      | {
          id: number;
          bean_id: number;
          roast_date: string | null;
          created_at: string;
        },
  ) {
    const withStats: BagWithStats = {
      ...bag,
      brew_count: 0,
      avg_rating: null,
    };
    setBags((prev) => [withStats, ...prev]);
    setSelectedBagId(bag.id);
    setShowNewBagModal(false);
  }

  const unassignedBrews = brews.filter((b) => b.bag_id === null);

  const brewsForSelectedBag =
    selectedBagId !== null
      ? brews.filter((b) => b.bag_id === selectedBagId)
      : unassignedBrews;

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
            <h3 className="text-accent-roast font-display font-bold text-card-ink">
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
        </div>
        {/* Notes */}
        {bean.tasting_notes && (
          <div className="border-t border-card-ink-muted/15 text-accent-strong pt-3 mb-4">
            <p className="text-xs text-card-ink-muted uppercase text-accent-roast font-bold tracking-wide mb-1">
              Tasting Notes
            </p>
            <p className="text-sm text-card-ink">{bean.tasting_notes}</p>
          </div>
        )}

        {/* Bags */}
        <div className="border-t border-card-ink-muted/15 pt-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-card-ink-muted text-accent-roast font-bold uppercase tracking-wide">
              Bags
            </p>
            <button
              onClick={() => setShowNewBagModal(true)}
              className="text-xs bg-accent-strong rounded-lg px-2 py-1 text-ink font-medium"
            >
              + Add bag
            </button>
          </div>

          {loadingBags ? (
            <p className="text-sm text-card-ink-muted">Loading bags...</p>
          ) : bags.length === 0 ? (
            <p className="text-xs text-card-ink-muted text-accent-strong">
              No bags logged for this bean yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {bags.map((bag) => {
                const isSelected = selectedBagId === bag.id;
                return (
                  <button
                    key={bag.id}
                    onClick={() => setSelectedBagId(bag.id)}
                    className={`text-left rounded-lg px-3 py-2 text-xs transition-colors ${
                      isSelected
                        ? "bg-accent-strong text-ink"
                        : "bg-white/50 text-card-ink hover:bg-white/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {formatRoastDate(bag.roast_date)}
                      </span>
                      <span className="font-mono">
                        {bag.brew_count} brew{bag.brew_count !== 1 ? "s" : ""}
                        {bag.avg_rating !== null
                          ? ` · ${bag.avg_rating}/10 avg`
                          : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Brew history for selected bag (or unassigned brews if no bags) */}
        <div className="border-t border-card-ink-muted/15 pt-3">
          <p className="text-xs text-card-ink-muted text-accent-roast font-bold uppercase tracking-wide mb-2">
            {bags.length > 0
              ? `Brews from this bag (${brewsForSelectedBag.length})`
              : `Brew history (${brews.length})`}
          </p>
          {brewsForSelectedBag.length === 0 ? (
            <p className="text-sm text-card-ink-muted text-accent-strong">
              No brews logged for this bag yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2 text-accent-roast">
              {brewsForSelectedBag.map((brew) => (
                <div
                  key={brew.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-sans text-card-ink-muted">
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

          {bags.length > 0 && unassignedBrews.length > 0 && (
            <p className="text-xs text-card-ink-muted mt-3">
              {unassignedBrews.length} brew
              {unassignedBrews.length !== 1 ? "s" : ""} logged without a bag
              assigned.
            </p>
          )}
        </div>
      </div>

      {showNewBagModal && (
        <NewBagModal
          beanId={bean.id}
          beanName={bean.name}
          onClose={() => setShowNewBagModal(false)}
          onCreated={handleBagCreated}
        />
      )}
    </div>
  );
}
