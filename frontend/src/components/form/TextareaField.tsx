import { useId, type ComponentProps } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { RequiredMark } from './RequiredMark'

type TextareaFieldProps = ComponentProps<typeof Textarea> & {
  label: string
  error?: string
  description?: string
  isRequired?: boolean
}

export function TextareaField({ label, error, description, isRequired, id, ...textareaProps }: TextareaFieldProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={textareaId}>
        {label}
        {isRequired && <RequiredMark />}
      </FieldLabel>
      <Textarea id={textareaId} aria-invalid={Boolean(error)} {...textareaProps} />
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  )
}
