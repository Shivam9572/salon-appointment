"use client";
import React from "react";

type Item = {
  id: string;
  provider_id?: string;
  category_id?: string;
  createdAt?: string;
  updatedAt?: string;
  Category?: { id: string; name: string } | null;
};

export default function CategoryHistory({ items }: { items: Item[] }) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-gray-500">No category history yet.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold">Category History</h4>
        <span className="text-xs text-gray-400">Recent</span>
      </div>

      <ul className="divide-y divide-gray-100 max-h-64 overflow-auto">
        {items.map((it) => {
          const name = it?.Category?.name || "Unknown";
          return (
            <li key={it.id} className="py-3 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-white" style={{backgroundColor: 'var(--gold)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c1.657 0 3-1.567 3-3.5S13.657 1 12 1 9 2.567 9 4.5 10.343 8 12 8zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{name}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
