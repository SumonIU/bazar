type FieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

export default function FormField({
  label,
  name,
  type,
  placeholder,
  required,
}: FieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type ?? "text"}
        placeholder={placeholder}
        required={required}
        className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
      />
    </label>
  );
}
