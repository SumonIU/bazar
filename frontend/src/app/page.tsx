"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Section from "@/components/section";
import RecentProducts from "@/components/recent-products";
import Hero from "@/components/hero";
import LocationSelector from "@/components/location-selector";
import { apiFetch } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");

  useEffect(() => {
    let isMounted = true;

    apiFetch<{ user: { role: string } }>("auth/me")
      .then(({ user }) => {
        if (!isMounted) {
          return;
        }
        setUserRole(user.role);
        setIsCheckingAuth(false);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setUserRole(null);
        setIsCheckingAuth(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isCheckingAuth) {
    return null;
  }

  if (userRole === "admin") {
    router.replace("/admin");
    return null;
  }

  if (userRole === "seller") {
    router.replace("/dashboard/seller");
    return null;
  }

  const handleNearestSearch = () => {
    const params = new URLSearchParams();
    const trimmedDivision = division.trim();
    const trimmedDistrict = district.trim();
    const trimmedArea = area.trim();

    if (trimmedDivision) {
      params.set("division", trimmedDivision);
    }
    if (trimmedDistrict) {
      params.set("district", trimmedDistrict);
    }
    if (trimmedArea) {
      params.set("area", trimmedArea);
    }

    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : "/search");
  };

  return (
    <div>
      <SiteHeader />
      <main>
        <Hero />
        {userRole === "customer" ? (
          <Section
            title="Nearest products"
            subtitle="Filter by division, district, and area to explore nearby items."
          >
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-[var(--muted)]">
                  Add your location to surface the closest sellers first.
                </p>
                <button
                  type="button"
                  onClick={handleNearestSearch}
                  className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Find nearest
                </button>
              </div>
              <div className="mt-6">
                <LocationSelector
                  division={division}
                  district={district}
                  area={area}
                  onDivisionChange={setDivision}
                  onDistrictChange={setDistrict}
                  onAreaChange={setArea}
                />
              </div>
            </div>
          </Section>
        ) : null}
        <Section
          title="Recent products"
          subtitle="Just posted from nearby sellers."
        >
          <RecentProducts />
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
