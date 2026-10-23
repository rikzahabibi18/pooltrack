import { useId, type ComponentProps } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RequiredMark } from './RequiredMark'

type TextFieldProps = ComponentProps<typeof Input> & {
  label: string
  error?: string
  description?: string
  /** Menampilkan tanda * (validasi tetap oleh Zod, bukan atribut HTML). */
  isRequired?: boolean
}

/**
 * Input teks + label + pesan error. Dipakai dengan React Hook Form:
 * <TextField label="Nama" {...register('name')} error={errors.name?.message} />
 */
export function TextField({ label, error, description, isRequired, id, ...inputProps }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={inputId}>
        {label}
        {isRequired && <RequiredMark />}
      </FieldLabel>
      <Input id={inputId} aria-invalid={Boolean(error)} {...inputProps} />
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  )
}
