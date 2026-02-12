import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import SearchPanel from "@/components/search-panel";

export default function SearchPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <h1 className="font-serif text-3xl">Search products</h1>
        <p className="mt-2 text-[var(--muted)]">
          Filter by division, district, bazar name, seller name, or item name.
        </p>
        <div className="mt-8">
          <SearchPanel />
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <ResultCard title="Hilsa 1.2kg" subtitle="FreshFish by Rahman" />
          <ResultCard title="Deshi Tomato" subtitle="GreenHarvest" />
          <ResultCard title="Organic Honey" subtitle="SpiceHouse" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ResultCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <article className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
      <button className="mt-4 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-black">
        View item
      </button>
    </article>
  );
}
