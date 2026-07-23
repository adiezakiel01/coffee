"use client";

import { useEffect, useState } from "react";
import { beansApi, brewsApi } from "@/lib/api";
import type { Bean, Brew } from "@/types";
import BeanDetailModal from "@/components/BeanDetailModal";
import BeanEditModal from "@/components/BeanEditModal";
import NewBeanModal from "@/components/NewBeanModal";

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingBean, setDeletingBean] = useState<Bean | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    Promise.all([beansApi.list(), brewsApi.list()])
      .then(([beansData, brewsData]) => {
        setBeans(beansData);
        setBrews(brewsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Group beans by continent
  const grouped = CONTINENT_ORDER.reduce<Record<string, Bean[]>>(
    (acc, continent) => {
      const matches = beans.filter(
        (b) => (b.continent || "Unknown") === continent,
      );
      if (matches.length > 0) acc[continent] = matches;
      return acc;
    },
    {},
  );

  // Catch-all for any continent not in the CONTINENT_ORDER list
  const knownContinents = new Set(CONTINENT_ORDER);
  const others = beans.filter(
    (b) => !b.continent || !knownContinents.has(b.continent),
  );
  if (others.length > 0 && !grouped["Unknown"]) {
    grouped["Unknown"] = others;
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

  function handleBeanCreated(bean: Bean) {
    setBeans((prev) => [...prev, bean]);
    setShowAddModal(false);
  }

  async function handleDeleteConfirm() {
    if (!deletingBean) return;
    setDeleteLoading(true);
    try {
      await beansApi.delete(deletingBean.id);
      setBeans((prev) => prev.filter((b) => b.id !== deletingBean.id));
      if (selectedBean?.id === deletingBean.id) setSelectedBean(null);
      setDeletingBean(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete bean");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) return <p className="text-ink/60">Loading...</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-accent uppercase tracking-wide mb-1">
            beans
          </p>
          <h1 className="text-xl font-display font-medium">Your beans</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-accent-strong text-ink text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Add bean
        </button>
      </div>

      {/* Main List */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-ink/60 text-sm">
          No beans yet — add one using the button above.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([continent, continentBeans]) => (
            <div key={continent}>
              <p className="text-xs text-accent-strong uppercase tracking-widest mb-3">
                {continent}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
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
                    <div key={bean.id} className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingBean(bean);
                        }}
                        className="absolute top-2.5 right-2.5 z-10 text-accent text-card-ink-muted hover:text-red-700 hover:bg-red-50 rounded px-1.5 py-0.5 text-sm transition-colors"
                        title="Delete bean"
                      >
                        ✕
                      </button>
                      <button
                        onClick={() => setSelectedBean(bean)}
                        className="w-full rounded-xl p-4 bg-card text-left hover:shadow-md transition-shadow pr-8"
                      >
                        <p className="font-semibold text-accent-roast text-card-ink">
                          {bean.name}
                        </p>
                        <p className="text-xs text-accent-strong text-card-ink-muted mt-0.5">
                          {[bean.origin, bean.region]
                            .filter(Boolean)
                            .join(", ")}
                          {bean.process ? ` · ${bean.process}` : ""}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className="text-xs text-accent-roast text-card-ink-muted whitespace-nowrap">
                            {beanBrews.length} brew
                            {beanBrews.length !== 1 ? "s" : ""}
                          </span>
                          {bestRating !== null && (
                            <span className="font-mono text-xs text-accent-strong font-semibold whitespace-nowrap">
                              {bestRating}/10 best
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedBean && !editingBean && (
        <BeanDetailModal
          bean={selectedBean}
          brews={brewsForBean(selectedBean.id)}
          onClose={() => setSelectedBean(null)}
          onEdit={() => setEditingBean(selectedBean)}
        />
      )}

      {/* Edit modal */}
      {editingBean && (
        <BeanEditModal
          bean={editingBean}
          onClose={() => setEditingBean(null)}
          onSaved={handleBeanSaved}
        />
      )}

      {/* Add bean modal */}
      {showAddModal && (
        <NewBeanModal
          onClose={() => setShowAddModal(false)}
          onCreated={handleBeanCreated}
        />
      )}

      {/* Delete confirmation modal */}
      {deletingBean && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeletingBean(null)}
        >
          <div
            className="bg-card rounded-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-card-ink mb-2">
              Delete bean?
            </h3>
            <p className="text-sm text-accent-strong text-card-ink-muted mb-1">
              <span className="font-medium text-accent-roast text-card-ink">
                {deletingBean.name}
              </span>{" "}
              will be permanently deleted.
            </p>
            <p className="text-sm text-accent-strong text-card-ink-muted mb-5">
              Brews logged against this bean will not be deleted, but they will
              no longer be associated with it.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 bg-red-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={() => setDeletingBean(null)}
                className="flex-1 bg-card-ink-muted/15 text-card-ink rounded-lg py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
