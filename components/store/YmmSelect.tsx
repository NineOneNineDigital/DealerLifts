export interface Option {
  label: string;
  value: string;
}

export function YmmSelect({
  compact = false,
  disabled,
  onChange,
  options,
  placeholder,
  value,
}: {
  compact?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  value: string;
}) {
  return (
    <select
      className={`w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] disabled:opacity-50 ${
        compact ? "px-2 py-1.5 text-xs" : "px-3 py-2.5 text-sm"
      }`}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      value={value}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
