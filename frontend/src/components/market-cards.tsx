type CardProps = {
  title: string;
  subtitle: string;
  meta: string;
};

export function BazarCard({ title, subtitle, meta }: CardProps) {
  return (
    <article className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
        Bazar
      </p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
      <p className="mt-4 text-xs text-[var(--accent-strong)]">{meta}</p>
    </article>
  );
}

export function SellerCard({ title, subtitle, meta }: CardProps) {
  return (
    <article className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
        Seller
      </p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
      <p className="mt-4 text-xs text-[var(--accent-strong)]">{meta}</p>
    </article>
  );
}

export function ProductCard({ title, subtitle, meta }: CardProps) {
  return (
    <article className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
        Product
      </p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
      <p className="mt-4 text-xs text-[var(--accent-strong)]">{meta}</p>
    </article>
  );
}
