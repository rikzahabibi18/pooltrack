import { useId } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RequiredMark } from './RequiredMark'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type SelectFieldProps = {
  label: string
  placeholder: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  description?: string
  isRequired?: boolean
  isLoading?: boolean
}

/** Dropdown yang opsinya dari API (mitra, pool, grade, …). Dipakai lewat <Controller>. */
export function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  description,
  isRequired,
  isLoading,
}: SelectFieldProps) {
  const id = useId()

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>
        {label}
        {isRequired && <RequiredMark />}
      </FieldLabel>
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger id={id} aria-invalid={Boolean(error)} className="w-full">
          <SelectValue placeholder={isLoading ? 'Memuat pilihan…' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  )
}
