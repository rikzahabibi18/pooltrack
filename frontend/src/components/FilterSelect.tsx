import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

/** Nilai khusus "tidak difilter" (Radix Select tidak menerima string kosong sebagai item). */
const ALL = 'all'

type FilterSelectProps = {
  value: string | undefined
  /** undefined = tidak difilter */
  onChange: (value: string | undefined) => void
  allLabel: string
  options: { value: string; label: string }[]
  ariaLabel: string
}

/** Dropdown filter di toolbar halaman list. */
export function FilterSelect({ value, onChange, allLabel, options, ariaLabel }: FilterSelectProps) {
  return (
    <Select value={value ?? ALL} onValueChange={(next) => onChange(next === ALL ? undefined : next)}>
      <SelectTrigger className="w-full sm:w-44" aria-label={ariaLabel}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
