import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--panel)]/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row">
        <div>
          <p className="text-lg font-semibold">Bazar.com</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Built for local sellers, loved by local shoppers.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/search">Browse</Link>
          <Link href="/signup/customer">Customer</Link>
          <Link href="/signup/seller">Seller</Link>
          <Link href="/admin">Admin</Link>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Powered by Bazar.com marketplace stack.
        </p>
      </div>
    </footer>
  );
}
