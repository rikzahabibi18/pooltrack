import { zodResolver } from '@hookform/resolvers/zod'
import { useId, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FormDialog } from '@/components/FormDialog'
import { SelectField } from '@/components/form/SelectField'
import { TextareaField } from '@/components/form/TextareaField'
import { TextField } from '@/components/form/TextField'
import { FieldGroup, FieldSeparator } from '@/components/ui/field'
import { useInspectionGrades } from '@/features/references/hooks'
import { todayISO } from '@/lib/date'
import { applyServerErrors } from '@/lib/form'
import { useSaveInspection } from '../hooks'
import {
  createInspectionFormSchema,
  toInspectionFormInput,
  type InspectionFormInput,
  type InspectionFormValues,
} from '../schema'
import type { Inspection } from '../types'

type InspectionFormDialogProps = {
  /** Unit yang diinspeksi (wajib untuk tambah). */
  unitId: number
  plateNumber: string
  /** Tanggal unit masuk; inspeksi tidak boleh sebelum tanggal ini. */
  receivedAt?: string
  /** Kosong = tambah inspeksi; terisi = ubah inspeksi tersebut. */
  inspection?: Inspection
  onClose: () => void
}

export function InspectionFormDialog({ unitId, plateNumber, receivedAt, inspection, onClose }: InspectionFormDialogProps) {
  const formId = useId()
  const isEdit = Boolean(inspection)
  const saveInspection = useSaveInspection()
  const grades = useInspectionGrades()
  const schema = useMemo(() => createInspectionFormSchema(receivedAt), [receivedAt])

  const form = useForm<InspectionFormInput, unknown, InspectionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toInspectionFormInput(inspection),
  })
  const { errors } = form.formState

  const gradeOptions = (grades.data ?? []).map((grade) => ({
    value: String(grade.id),
    label: `${grade.code} — ${grade.name}`,
  }))

  const onSubmit = form.handleSubmit((values) =>
    saveInspection.mutate(
      inspection ? { mode: 'update', inspectionId: inspection.id, values } : { mode: 'create', unitId, values },
      { onSuccess: onClose, onError: (error) => applyServerErrors(error, form.setError) },
    ),
  )

  return (
    <FormDialog
      title={isEdit ? `Ubah Inspeksi ${plateNumber}` : `Inspeksi ${plateNumber}`}
      description={
        isEdit
          ? 'Perbaiki hasil inspeksi yang salah input.'
          : 'Inspeksi pertama otomatis mengubah status unit Masuk menjadi Diinspeksi.'
      }
      formId={formId}
      submitLabel={isEdit ? 'Simpan perubahan' : 'Simpan inspeksi'}
      isPending={saveInspection.isPending}
      onClose={onClose}
      wide
    >
      <form id={formId} onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Tanggal inspeksi"
              isRequired
              type="date"
              min={receivedAt}
              max={todayISO()}
              {...form.register('inspection_date')}
              error={errors.inspection_date?.message}
            />
            <TextField
              label="Nama inspektor"
              isRequired
              placeholder="Agus Santoso"
              {...form.register('inspector_name')}
              error={errors.inspector_name?.message}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Odometer (km)"
              inputMode="numeric"
              placeholder="85000"
              {...form.register('odometer_km')}
              error={errors.odometer_km?.message}
            />
            <Controller
              control={form.control}
              name="grade_id"
              render={({ field }) => (
                <SelectField
                  label="Grade"
                  isRequired
                  placeholder="Pilih grade kondisi"
                  options={gradeOptions}
                  isLoading={grades.isPending}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.grade_id?.message}
                />
              )}
            />
          </div>
          <FieldSeparator />
          <TextareaField
            label="Kondisi eksterior"
            rows={2}
            placeholder="mis. Baret halus di pintu kiri"
            {...form.register('exterior_notes')}
            error={errors.exterior_notes?.message}
          />
          <TextareaField
            label="Kondisi interior"
            rows={2}
            placeholder="mis. Jok bersih, dashboard utuh"
            {...form.register('interior_notes')}
            error={errors.interior_notes?.message}
          />
          <TextareaField
            label="Kondisi mesin"
            rows={2}
            placeholder="mis. Mesin halus, tidak ada rembesan"
            {...form.register('engine_notes')}
            error={errors.engine_notes?.message}
          />
          <TextareaField label="Catatan lain" rows={2} {...form.register('notes')} error={errors.notes?.message} />
        </FieldGroup>
      </form>
    </FormDialog>
  )
}
