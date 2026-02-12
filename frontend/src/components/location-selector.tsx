export default function LocationSelector() {
  return (
    <div className="grid gap-4 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)] md:grid-cols-3">
      <div>
        <label className="text-sm font-medium">Division</label>
        <select className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm">
          <option>Dhaka</option>
          <option>Chattogram</option>
          <option>Khulna</option>
          <option>Rajshahi</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">District / Upazila</label>
        <select className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm">
          <option>Gulshan</option>
          <option>Mirpur</option>
          <option>Narayanj</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Area</label>
        <select className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm">
          <option>Banani</option>
          <option>Uttara</option>
          <option>Dhanmondi</option>
        </select>
      </div>
    </div>
  );
}
