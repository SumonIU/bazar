type FormStatusProps = {
  tone?: "success" | "error" | "neutral";
  message?: string;
};

export default function FormStatus({ tone, message }: FormStatusProps) {
  if (!message) {
    return null;
  }

  const toneClasses =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "error"
        ? "bg-rose-50 text-rose-700"
        : "bg-zinc-100 text-zinc-700";

  return (
    <div className={`rounded-2xl px-4 py-3 text-sm ${toneClasses}`}>
      {message}
    </div>
  );
}
