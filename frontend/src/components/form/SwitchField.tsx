import { useId } from 'react'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

type SwitchFieldProps = {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

/** Switch on/off, dipakai lewat <Controller> React Hook Form. */
export function SwitchField({ label, description, checked, onCheckedChange }: SwitchFieldProps) {
  const id = useId()

  return (
    <Field orientation="horizontal" className="rounded-lg border p-3">
      <FieldContent>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </Field>
  )
}
