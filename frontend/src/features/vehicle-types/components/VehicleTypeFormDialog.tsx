import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FormDialog } from '@/components/FormDialog'
import { SwitchField } from '@/components/form/SwitchField'
import { TextField } from '@/components/form/TextField'
import { FieldGroup } from '@/components/ui/field'
import { applyServerErrors } from '@/lib/form'
import { useSaveVehicleType } from '../hooks'
import { toVehicleTypeFormValues, vehicleTypeFormSchema, type VehicleTypeFormValues } from '../schema'
import type { VehicleType } from '../types'

type VehicleTypeFormDialogProps = {
  vehicleType?: VehicleType
  onClose: () => void
}

export function VehicleTypeFormDialog({ vehicleType, onClose }: VehicleTypeFormDialogProps) {
  const formId = useId()
  const isEdit = Boolean(vehicleType)
  const saveVehicleType = useSaveVehicleType()

  const form = useForm<VehicleTypeFormValues>({
    resolver: zodResolver(vehicleTypeFormSchema),
    defaultValues: toVehicleTypeFormValues(vehicleType),
  })
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((values) =>
    saveVehicleType.mutate(
      { id: vehicleType?.id, values },
      { onSuccess: onClose, onError: (error) => applyServerErrors(error, form.setError) },
    ),
  )

  return (
    <FormDialog
      title={isEdit ? 'Ubah Jenis Kendaraan' : 'Tambah Jenis Kendaraan'}
      description="Kategori kendaraan, mis. motor, mobil, truk."
      formId={formId}
      submitLabel={isEdit ? 'Simpan perubahan' : 'Simpan'}
      isPending={saveVehicleType.isPending}
      onClose={onClose}
    >
      <form id={formId} onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-[9rem_1fr]">
            <TextField
              label="Kode"
              isRequired
              placeholder="MOBIL"
              className="uppercase"
              {...form.register('code')}
              error={errors.code?.message}
            />
            <TextField label="Nama" isRequired placeholder="Mobil" {...form.register('name')} error={errors.name?.message} />
          </div>
          <Controller
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <SwitchField
                label="Jenis kendaraan aktif"
                description="Jenis nonaktif tidak muncul di pilihan saat menambah unit baru."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </FieldGroup>
      </form>
    </FormDialog>
  )
}
