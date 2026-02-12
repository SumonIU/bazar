import { ReactNode } from "react";

type SectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function Section({ title, subtitle, children }: SectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="font-serif text-3xl text-[var(--fg)]">{title}</h2>
        {subtitle ? <p className="text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
