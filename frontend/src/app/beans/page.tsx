"use client";

import { useEffect, useState } from "react";
import { beansApi, brewsApi } from "@/lib/api";
import type { Bean, Brew } from "@/types";
import BeanDetailModal from "@/components/BeanDetailModal";
import BeanEditModal from "@/components/BeanEditModal";

const CONTINENT_ORDER = [
  "Africa",
  "Asia-Pacific",
  "Central America",
  "South America",
  "North America",
  "Middle East",
  "Unknown",
];

export default function BeansPage() {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brews, setBrews] = useState<Brew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBean, setSelectedBean] = useState<Bean | null>(null);
  const [editingBean, setEditingBean] = useState<Bean | null>(null);

  useEffect(() => {
    Promise.all([beansApi.list(), brewsApi.list()])
      .then(([beansData, brewsData]) => {
        setBeans(beansData);
        setBrews(brewsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Group beans by continent, preserving a sensible display order
  const grouped = CONTINENT_ORDER.reduce<Record<string, Bean[]>>(
    (acc, continent) => {
      const matches = beans.filter(
        (b) => (b.continent ?? "Unknown") === continent,
      );
      if (matches.length > 0) acc[continent] = matches;
      return acc;
    },
    {},
  );

  // Beans with no continent set fall into "Unknown"
  const unassigned = beans.filter((b) => !b.continent);
  if (unassigned.length > 0) {
    grouped["Unknown"] = unassigned;
  }

  function brewsForBean(beanId: number): Brew[] {
    return brews
      .filter((b) => b.bean_id === beanId)
      .sort(
        (a, b) =>
          new Date(b.brewed_at).getTime() - new Date(a.brewed_at).getTime(),
      );
  }

  function handleBeanSaved(updated: Bean) {
    setBeans((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelectedBean(updated);
    setEditingBean(null);
  }

  if (loading) return <p className="text-ink/60">Loading...</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;

  return (
    <div>
      <p className="text-xs text-accent uppercase tracking-wide mb-1">beans</p>
      <h1 className="text-xl font-medium mb-6">Your beans</h1>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-ink/60 text-sm text-accent">
          No beans yet — add one from the brews page.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([continent, continentBeans]) => (
            <div key={continent}>
              <p className="text-xs text-accent-strong uppercase tracking-widest mb-3">
                {continent}
              </p>
              <div className="grid grid-cols-2 gap-3 text-accent-roast">
                {continentBeans.map((bean) => {
                  const beanBrews = brewsForBean(bean.id);
                  const bestRating = beanBrews.reduce<number | null>(
                    (best, b) =>
                      b.rating !== null && (best === null || b.rating > best)
                        ? b.rating
                        : best,
                    null,
                  );

                  return (
                    <button
                      key={bean.id}
                      onClick={() => setSelectedBean(bean)}
                      className="rounded-xl p-4 bg-card text-left text-accent hover:shadow-md transition-shadow"
                    >
                      <p className="font-semibold text-card-ink text-accent-roast">
                        {bean.name}
                      </p>
                      <p className="text-xs text-card-ink-muted mt-0.5">
                        {[bean.origin, bean.region].filter(Boolean).join(", ")}
                        {bean.process ? ` · ${bean.process}` : ""}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-accent-roast text-card-ink-muted">
                          {beanBrews.length} brew
                          {beanBrews.length !== 1 ? "s" : ""}
                        </span>
                        {bestRating !== null && (
                          <span className="font-mono text-xs text-accent-strong font-semibold">
                            {bestRating}/10 best
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBean && !editingBean && (
        <BeanDetailModal
          bean={selectedBean}
          brews={brewsForBean(selectedBean.id)}
          onClose={() => setSelectedBean(null)}
          onEdit={() => setEditingBean(selectedBean)}
        />
      )}

      {editingBean && (
        <BeanEditModal
          bean={editingBean}
          onClose={() => setEditingBean(null)}
          onSaved={handleBeanSaved}
        />
      )}
    </div>
  );
}
