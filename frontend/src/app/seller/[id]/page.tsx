import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default function SellerPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
          <h1 className="font-serif text-3xl">FreshFish by Rahman</h1>
          <p className="mt-2 text-[var(--muted)]">
            Karwan Bazar, Dhaka | Rating 4.9 (120 reviews)
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <SellerStat label="Orders delivered" value="540" />
            <SellerStat label="On-time rate" value="98%" />
            <SellerStat label="Products" value="32" />
          </div>
        </div>
        <div className="mt-10 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="text-lg font-semibold">Latest reviews</h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <li>5 stars - Always fresh and fast.</li>
            <li>4 stars - Friendly seller.</li>
          </ul>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SellerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
