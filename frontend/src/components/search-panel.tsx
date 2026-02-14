"use client";

import { useState } from "react";

type SearchPanelProps = {
  query?: string;
  filter?: string;
  onQueryChange?: (value: string) => void;
  onFilterChange?: (value: string) => void;
  onSearch?: () => void;
  isSearching?: boolean;
};

export default function SearchPanel({
  query,
  filter,
  onQueryChange,
  onFilterChange,
  onSearch,
  isSearching = false,
}: SearchPanelProps) {
  const [localQuery, setLocalQuery] = useState("");
  const [localFilter, setLocalFilter] = useState("");
  const resolvedQuery = query ?? localQuery;
  const resolvedFilter = filter ?? localFilter;

  return (
    <form
      className="grid gap-4 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] md:grid-cols-[1fr_1fr_auto] md:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch?.();
      }}
    >
      <div>
        <label className="text-sm font-medium">Search by item or seller</label>
        <input
          placeholder="Hilsa, vegetables, seller name"
          className="mt-2 w-full rounded-2xl border border-[var(--line)] px-4 py-3 text-sm"
          value={resolvedQuery}
          onChange={(event) => {
            const value = event.target.value;
            if (onQueryChange) {
              onQueryChange(value);
            } else {
              setLocalQuery(value);
            }
          }}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Filter by price or date</label>
        <input
          placeholder="Under 500 or today"
          className="mt-2 w-full rounded-2xl border border-[var(--line)] px-4 py-3 text-sm"
          value={resolvedFilter}
          onChange={(event) => {
            const value = event.target.value;
            if (onFilterChange) {
              onFilterChange(value);
            } else {
              setLocalFilter(value);
            }
          }}
        />
      </div>
      <div className="flex md:justify-end">
        <button
          type="submit"
          disabled={isSearching}
          className="mt-2 w-full rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 md:mt-0 md:w-auto"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
}
