"use client";

import Link from "next/link";
import { useLanguage } from "@/components/app-providers";

export default function Hero() {
  const { copy } = useLanguage();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-6">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            Bazar.com Marketplace
          </p>
          <h1 className="font-serif text-4xl leading-tight md:text-5xl">
            {copy.heroTitle}
          </h1>
          <p className="text-[var(--muted)]">{copy.heroSubtitle}</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/search"
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black"
            >
              {copy.heroCta}
            </Link>
            <Link
              href="/signup/seller"
              className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
            >
              {copy.heroAlt}
            </Link>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
            <span>Payments: bKash, Nagad, Rocket, Card</span>
            <span>COD supported</span>
          </div>
        </div>
        <div className="rounded-[32px] border border-[var(--line)] bg-[var(--panel-strong)] p-8 shadow-[var(--shadow)]">
          <h3 className="font-serif text-2xl">Daily highlights</h3>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <li>150+ sellers verified in Dhaka.</li>
            <li>Average delivery within 2 hours.</li>
            <li>Weekly price drops on essentials.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
