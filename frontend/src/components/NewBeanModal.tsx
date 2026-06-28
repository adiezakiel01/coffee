"use client";

import { useState } from "react";
import { beansApi } from "@/lib/api";
import type { Bean } from "@/types";

interface NewBeanModalProps {
  onClose: () => void;
  onCreated: (bean: Bean) => void;
}

export default function NewBeanModal({
  onClose,
  onCreated,
}: NewBeanModalProps) {
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [process, setProcess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Bean name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const bean = await beansApi.create({
        name: name.trim(),
        origin: origin || null,
        process: process || null,
      });
      onCreated(bean);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bean");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl p-5 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-card-ink font-medium mb-3 text-accent-roast">
          New bean
        </h3>

        {error && <p className="text-red-700 text-xs mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <input
            type="text"
            placeholder="Name (required)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="rounded-lg px-3 py-2 text-sm bg-white text-card-ink text-black border border-card-ink-muted/20"
          />
          <input
            type="text"
            placeholder="Origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm bg-white text-card-ink text-black border border-card-ink-muted/20"
          />
          <input
            type="text"
            placeholder="Process (washed, natural, etc.)"
            value={process}
            onChange={(e) => setProcess(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm bg-white text-card-ink text-black border border-card-ink-muted/20"
          />

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
