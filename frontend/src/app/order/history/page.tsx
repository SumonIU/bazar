import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default function OrderHistoryPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="font-serif text-3xl">Order history</h1>
        <div className="mt-6 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <ul className="space-y-3 text-sm text-[var(--muted)]">
            <li>Order #BZ-2031 - Completed - BDT 1450</li>
            <li>Order #BZ-2030 - In delivery - BDT 720</li>
          </ul>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
