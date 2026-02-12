import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default function ProductPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
            <div className="h-64 rounded-2xl bg-[var(--accent-soft)]"></div>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="font-serif text-3xl">Hilsa 1.2kg</h1>
            <p className="text-lg font-semibold">BDT 1200</p>
            <p className="text-sm text-[var(--muted)]">
              Nutrition info: high protein, omega-3 rich.
            </p>
            <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
              <p className="text-sm font-medium">Seller: FreshFish by Rahman</p>
              <p className="text-xs text-[var(--muted)]">Rating 4.9</p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black">
                Add to cart
              </button>
              <button className="rounded-full border border-[var(--line)] px-5 py-3 text-sm">
                Call seller
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="text-lg font-semibold">Reviews</h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <li>5 stars - Great quality and fast delivery.</li>
            <li>4 stars - Fresh fish, reasonable price.</li>
          </ul>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
