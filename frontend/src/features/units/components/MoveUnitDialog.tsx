import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FormDialog } from '@/components/FormDialog'
import { SelectField, type SelectOption } from '@/components/form/SelectField'
import { TextareaField } from '@/components/form/TextareaField'
import { FieldGroup } from '@/components/ui/field'
import { usePoolOptions } from '@/features/pools/hooks'
import { applyServerErrors } from '@/lib/form'
import { useMoveUnit } from '../hooks'
import { moveUnitFormSchema, type MoveUnitFormInput, type MoveUnitFormValues } from '../schema'
import type { Unit } from '../types'

type MoveUnitDialogProps = {
  unit: Unit
  onClose: () => void
}

export function MoveUnitDialog({ unit, onClose }: MoveUnitDialogProps) {
  const formId = useId()
  const moveUnit = useMoveUnit()
  const pools = usePoolOptions()

  const form = useForm<MoveUnitFormInput, unknown, MoveUnitFormValues>({
    resolver: zodResolver(moveUnitFormSchema),
    defaultValues: { pool_id: '', note: '' },
  })
  const { errors } = form.formState

  // Pool saat ini tidak ditawarkan; pool penuh terlihat tetapi tidak bisa dipilih.
  const poolOptions: SelectOption[] = (pools.data ?? [])
    .filter((pool) => pool.id !== unit.pool.id)
    .map((pool) => {
      const isFull = pool.occupied >= pool.capacity
      return {
        value: String(pool.id),
        label: `${pool.name} — ${pool.occupied}/${pool.capacity}${isFull ? ' (penuh)' : ''}`,
        disabled: isFull,
      }
    })

  const onSubmit = form.handleSubmit((values) =>
    moveUnit.mutate(
      { id: unit.id, values },
      { onSuccess: onClose, onError: (error) => applyServerErrors(error, form.setError) },
    ),
  )

  return (
    <FormDialog
      title="Pindah Pool"
      description={`Pindahkan ${unit.plate_number} dari ${unit.pool.name}. Status unit tidak berubah; perpindahan tercatat di riwayat.`}
      formId={formId}
      submitLabel="Pindahkan"
      isPending={moveUnit.isPending}
      onClose={onClose}
    >
      <form id={formId} onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Controller
            control={form.control}
            name="pool_id"
            render={({ field }) => (
              <SelectField
                label="Pool tujuan"
                isRequired
                placeholder="Pilih pool tujuan"
                description="Angka menunjukkan unit aktif / kapasitas."
                options={poolOptions}
                isLoading={pools.isPending}
                value={field.value}
                onChange={field.onChange}
                error={errors.pool_id?.message}
              />
            )}
          />
          <TextareaField
            label="Catatan"
            rows={3}
            placeholder="Opsional, mis. Pool Tangerang padat"
            {...form.register('note')}
            error={errors.note?.message}
          />
        </FieldGroup>
      </form>
    </FormDialog>
  )
}
