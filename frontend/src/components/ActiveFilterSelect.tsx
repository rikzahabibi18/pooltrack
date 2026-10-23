import { ACTIVE_FILTER_OPTIONS } from '@/config/constants'
import { FilterSelect } from './FilterSelect'

type ActiveFilterSelectProps = {
  value: string | undefined
  onChange: (value: string | undefined) => void
}

/** Filter aktif/nonaktif untuk halaman master data. */
export function ActiveFilterSelect({ value, onChange }: ActiveFilterSelectProps) {
  return (
    <FilterSelect
      value={value}
      onChange={onChange}
      allLabel="Semua status"
      options={ACTIVE_FILTER_OPTIONS}
      ariaLabel="Filter status aktif"
    />
  )
}
