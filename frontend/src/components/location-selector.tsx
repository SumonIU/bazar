"use client";

import { useState } from "react";

type LocationSelectorProps = {
  division?: string;
  district?: string;
  area?: string;
  onDivisionChange?: (value: string) => void;
  onDistrictChange?: (value: string) => void;
  onAreaChange?: (value: string) => void;
};

export default function LocationSelector({
  division,
  district,
  area,
  onDivisionChange,
  onDistrictChange,
  onAreaChange,
}: LocationSelectorProps) {
  const [localDivision, setLocalDivision] = useState("");
  const [localDistrict, setLocalDistrict] = useState("");
  const [localArea, setLocalArea] = useState("");
  const resolvedDivision = division ?? localDivision;
  const resolvedDistrict = district ?? localDistrict;
  const resolvedArea = area ?? localArea;

  return (
    <div className="grid gap-4 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)] md:grid-cols-3">
      <div>
        <label className="text-sm font-medium">Division</label>
        <input
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
          placeholder="Dhaka"
          value={resolvedDivision}
          onChange={(event) => {
            const value = event.target.value;
            if (onDivisionChange) {
              onDivisionChange(value);
            } else {
              setLocalDivision(value);
            }
          }}
        />
      </div>
      <div>
        <label className="text-sm font-medium">District / Upazila</label>
        <input
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
          placeholder="Gulshan"
          value={resolvedDistrict}
          onChange={(event) => {
            const value = event.target.value;
            if (onDistrictChange) {
              onDistrictChange(value);
            } else {
              setLocalDistrict(value);
            }
          }}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Area</label>
        <input
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
          placeholder="Banani"
          value={resolvedArea}
          onChange={(event) => {
            const value = event.target.value;
            if (onAreaChange) {
              onAreaChange(value);
            } else {
              setLocalArea(value);
            }
          }}
        />
      </div>
    </div>
  );
}
