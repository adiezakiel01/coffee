"use client";
import { useState } from "react";
import { bagsApi } from "@/lib/api";
import type { Bag } from "@/types";

interface NewBagModalProps {
  beanId: number;
  beanName: string;
  onClose: () => void;
  onCreated: (bag: Bag) => void;
}

export default function NewBagModal({
  beanId,
  beanName,
  onClose,
  onCreated,
}: NewBagModalProps) {
  const [roastDate, setRoastDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const bag = await bagsApi.create({
        bean_id: beanId,
        roast_date: roastDate || null,
      });
      onCreated(bag);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bag");
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
        className="bg-card rounded-xl p-5 w-[90vw] max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-card-ink font-medium mb-1 text-accent-roast">
          New bag
        </h3>
        <p className="text-sm text-accent-strong mb-3">{beanName}</p>
        {error && <p className="text-red-700 text-xs mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <div>
            <label className="text-xs text-accent-roast block mb-1">
              Roast date
            </label>
            <input
              type="date"
              value={roastDate}
              onChange={(e) => setRoastDate(e.target.value)}
              autoFocus
              className="w-full rounded-lg px-3 py-2 text-sm bg-white text-card-ink text-accent-roast border border-card-ink-muted/20"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-accent-strong text-ink rounded-lg py-2 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-red-600 text-card-ink rounded-lg py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
