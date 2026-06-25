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

  if (loading) return <main className="p-8">Loading...</main>;
  if (error) return <main className="p-8 text-red-600">Error: {error}</main>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Beans</h1>
      <ul className="space-y-2">
        {beans.map((bean) => (
          <li key={bean.id} className="border rounded p-3">
            <p className="font-semibold">{bean.name}</p>
            <p className="text-sm text-gray-600">
              {bean.origin} · {bean.process}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
