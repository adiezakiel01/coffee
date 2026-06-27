"use client";

import { useEffect, useState } from "react";
import { beansApi } from "@/lib/api";
import type { Bean } from "@/types";

export default function Home() {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    beansApi
      .list()
      .then(setBeans)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-ink/60">Loading...</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;

  return (
    <div>
      <p className="text-xs text-accent uppercase tracking-wide mb-1">beans</p>
      <h1 className="text-xl font-medium mb-6">Your beans</h1>

      <div className="grid grid-cols-2 gap-3">
        {beans.map((bean) => (
          <div key={bean.id} className="bg-card rounded-xl p-4">
            <p className="font-medium text-card-title">{bean.name}</p>
            <p className="text-sm text-card-muted">
              {bean.origin || "unknown origin"} ·{" "}
              {bean.process || "unknown process"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
