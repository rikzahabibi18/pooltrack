import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FormDialog } from '@/components/FormDialog'
import { SelectField, type SelectOption } from '@/components/form/SelectField'
import { TextareaField } from '@/components/form/TextareaField'
import { TextField } from '@/components/form/TextField'
import { FieldGroup, FieldSeparator } from '@/components/ui/field'
import { usePartnerOptions } from '@/features/partners/hooks'
import { usePoolOptions } from '@/features/pools/hooks'
import { useUnitStatuses } from '@/features/references/hooks'
import { useVehicleTypeOptions } from '@/features/vehicle-types/hooks'
import { todayISO } from '@/lib/date'
import { applyServerErrors } from '@/lib/form'
import { useSaveUnit } from '../hooks'
import { toUnitFormInput, unitFormSchema, type UnitFormInput, type UnitFormValues } from '../schema'
import type { Unit } from '../types'

type UnitFormDialogProps = {
  /** Kosong = unit baru masuk; terisi = ubah data unit. */
  unit?: Unit
  onClose: () => void
}

type Named = { id: number; name: string }

/**
 * Opsi dropdown dari master aktif. Saat edit, master lama yang kini nonaktif
 * tetap disertakan supaya nilai unit tidak "hilang" dari dropdown.
 */
function toOptions(items: Named[] | undefined, current?: Named): SelectOption[] {
  const options = (items ?? []).map((item) => ({ value: String(item.id), label: item.name }))
  if (current && !options.some((option) => option.value === String(current.id))) {
    options.push({ value: String(current.id), label: `${current.name} (nonaktif)` })
  }
  return options
}

export function UnitFormDialog({ unit, onClose }: UnitFormDialogProps) {
  const formId = useId()
  const isEdit = Boolean(unit)
  const saveUnit = useSaveUnit()

  const partners = usePartnerOptions()
  const vehicleTypes = useVehicleTypeOptions()
  const pools = usePoolOptions()
  // API mengurutkan status berdasarkan `sequence`, jadi elemen pertama = status awal unit baru.
  const initialStatus = useUnitStatuses().data?.[0]

  const form = useForm<UnitFormInput, unknown, UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: toUnitFormInput(unit),
  })
  const { errors } = form.formState

  // Pool penuh tetap terlihat tetapi tidak bisa dipilih (aturan bisnis 2).
  const poolOptions: SelectOption[] = (pools.data ?? []).map((pool) => {
    const isFull = pool.occupied >= pool.capacity
    return {
      value: String(pool.id),
      label: `${pool.name} — ${pool.occupied}/${pool.capacity}${isFull ? ' (penuh)' : ''}`,
      disabled: isFull,
    }
  })

  const onSubmit = form.handleSubmit((values) =>
    saveUnit.mutate(
      { id: unit?.id, values },
      { onSuccess: onClose, onError: (error) => applyServerErrors(error, form.setError) },
    ),
  )

  return (
    <FormDialog
      title={isEdit ? `Ubah Unit ${unit?.plate_number}` : 'Unit Masuk'}
      description={
        isEdit
          ? 'Pool dan status tidak diubah di sini — gunakan tombol Pindah Pool atau Ubah Status.'
          : initialStatus
            ? `Unit baru akan berstatus ${initialStatus.name} dan tercatat di riwayat.`
            : 'Unit baru akan tercatat di riwayat.'
      }
      formId={formId}
      submitLabel={isEdit ? 'Simpan perubahan' : 'Simpan unit'}
      isPending={saveUnit.isPending}
      onClose={onClose}
      wide
    >
      <form id={formId} onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Nomor plat"
              isRequired
              placeholder="B 1234 XYZ"
              className="uppercase"
              description="Spasi boleh dikosongkan, mis. B1234XYZ"
              {...form.register('plate_number')}
              error={errors.plate_number?.message}
            />
            <TextField
              label="Tanggal masuk"
              isRequired
              type="date"
              max={todayISO()}
              {...form.register('received_at')}
              error={errors.received_at?.message}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-[1fr_1fr_6rem]">
            <TextField label="Merek" isRequired placeholder="Toyota" {...form.register('brand')} error={errors.brand?.message} />
            <TextField label="Model" isRequired placeholder="Avanza 1.3 G" {...form.register('model')} error={errors.model?.message} />
            <TextField
              label="Tahun"
              isRequired
              inputMode="numeric"
              placeholder="2019"
              {...form.register('year')}
              error={errors.year?.message}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="vehicle_type_id"
              render={({ field }) => (
                <SelectField
                  label="Jenis kendaraan"
                  isRequired
                  placeholder="Pilih jenis"
                  options={toOptions(vehicleTypes.data, unit?.vehicle_type)}
                  isLoading={vehicleTypes.isPending}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.vehicle_type_id?.message}
                />
              )}
            />
            <TextField label="Warna" placeholder="Hitam" {...form.register('color')} error={errors.color?.message} />
          </div>

          <Controller
            control={form.control}
            name="partner_id"
            render={({ field }) => (
              <SelectField
                label="Mitra"
                isRequired
                placeholder="Pilih mitra pemilik unit"
                options={toOptions(partners.data, unit?.partner)}
                isLoading={partners.isPending}
                value={field.value}
                onChange={field.onChange}
                error={errors.partner_id?.message}
              />
            )}
          />

          {!isEdit && (
            <Controller
              control={form.control}
              name="pool_id"
              render={({ field }) => (
                <SelectField
                  label="Pool tujuan"
                  isRequired
                  placeholder="Pilih pool"
                  description="Angka menunjukkan unit aktif / kapasitas."
                  options={poolOptions}
                  isLoading={pools.isPending}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.pool_id?.message}
                />
              )}
            />
          )}

          <FieldSeparator />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Nomor rangka"
              placeholder="MHKM1CA4JJK104521"
              {...form.register('chassis_number')}
              error={errors.chassis_number?.message}
            />
            <TextField
              label="Nomor mesin"
              placeholder="2NRF215487"
              {...form.register('engine_number')}
              error={errors.engine_number?.message}
            />
          </div>
          <TextareaField label="Catatan" rows={3} {...form.register('notes')} error={errors.notes?.message} />
        </FieldGroup>
      </form>
    </FormDialog>
  )
}
