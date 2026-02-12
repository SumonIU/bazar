export default function SearchPanel() {
  return (
    <div className="grid gap-4 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] md:grid-cols-2">
      <div>
        <label className="text-sm font-medium">Search by item or seller</label>
        <input
          placeholder="Hilsa, vegetables, seller name"
          className="mt-2 w-full rounded-2xl border border-[var(--line)] px-4 py-3 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Filter by price or date</label>
        <input
          placeholder="Under 500 or today"
          className="mt-2 w-full rounded-2xl border border-[var(--line)] px-4 py-3 text-sm"
        />
      </div>
    </div>
  );
}
