import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightIcon } from 'lucide-react'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { FormDialog } from '@/components/FormDialog'
import { TextareaField } from '@/components/form/TextareaField'
import { StatusBadge } from '@/components/StatusBadge'
import { FieldGroup } from '@/components/ui/field'
import { applyServerErrors } from '@/lib/form'
import { useChangeUnitStatus } from '../hooks'
import { changeStatusFormSchema, type ChangeStatusFormValues } from '../schema'
import type { Unit } from '../types'

type ChangeStatusDialogProps = {
  unit: Unit
  /** Status tujuan = langkah berikutnya yang ditentukan backend (unit.actions.next_status). */
  nextStatus: NonNullable<Unit['actions']['next_status']>
  onClose: () => void
}

export function ChangeStatusDialog({ unit, nextStatus, onClose }: ChangeStatusDialogProps) {
  const formId = useId()
  const changeStatus = useChangeUnitStatus()
  const form = useForm<ChangeStatusFormValues>({
    resolver: zodResolver(changeStatusFormSchema),
    defaultValues: { note: '' },
  })

  const onSubmit = form.handleSubmit(({ note }) =>
    changeStatus.mutate(
      { id: unit.id, toStatusId: nextStatus.id, note },
      { onSuccess: onClose, onError: (error) => applyServerErrors(error, form.setError) },
    ),
  )

  return (
    <FormDialog
      title={`Tandai ${nextStatus.name}`}
      description={`Perubahan status unit ${unit.plate_number} tercatat di riwayat dan tidak dapat dibatalkan.`}
      formId={formId}
      submitLabel={`Ubah ke ${nextStatus.name}`}
      isPending={changeStatus.isPending}
      onClose={onClose}
    >
      <form id={formId} onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <div className="flex items-center justify-center gap-3 rounded-lg bg-muted/50 p-4">
            <StatusBadge name={unit.status.name} color={unit.status.color} />
            <ArrowRightIcon className="size-4 text-muted-foreground" aria-hidden />
            <StatusBadge name={nextStatus.name} color={nextStatus.color} />
          </div>
          <TextareaField
            label="Catatan"
            rows={3}
            placeholder="Opsional, mis. lolos pemeriksaan akhir"
            {...form.register('note')}
            error={form.formState.errors.note?.message}
          />
        </FieldGroup>
      </form>
    </FormDialog>
  )
}
