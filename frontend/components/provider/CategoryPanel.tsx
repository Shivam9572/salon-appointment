"use client";
import React, { useState } from "react";
import { apiFetch } from "../../lib/api";
import CategoryHistory from "./CategoryHistory";

interface Category {
  id: number;
  name: string;
}

interface CategoryPanelProps {
  categories: Category[];
  providerCategories: any[];
  onCategoryAdded: () => void;
  onError: (msg: string) => void;
}

export default function CategoryPanel({
  categories,
  providerCategories,
  onCategoryAdded,
  onError,
}: CategoryPanelProps) {
  const [selected, setSelected] = useState<string | number>("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!selected) return;
    setLoading(true);
    try {
      await apiFetch(`/provider/categories/${selected}`, { method: "POST" });
      setSelected("");
      onCategoryAdded();
    } catch (err: any) {
      let msg = err?.message || "Failed to add category";
      try { msg = JSON.parse(msg)?.message || msg; } catch {}
      onError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "white", padding: 16, borderRadius: 8 }}>
      <h2 style={{ margin: "0 0 12px" }}>Categories</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={loading || !selected}
          style={{
            background: "var(--gold, #f59e0b)", border: "none",
            padding: "8px 12px", borderRadius: 8,
            cursor: loading || !selected ? "not-allowed" : "pointer",
            fontWeight: 600, opacity: loading || !selected ? 0.6 : 1,
          }}
        >
          {loading ? "Adding…" : "Add"}
        </button>
      </div>

      <div style={{ marginTop: 16, maxHeight: 360, overflowY: "auto" }}>
        <CategoryHistory items={providerCategories} />
      </div>
    </div>
  );
}
