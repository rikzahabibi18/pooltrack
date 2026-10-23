import { zodResolver } from '@hookform/resolvers/zod'
import { useId, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FormDialog } from '@/components/FormDialog'
import { SwitchField } from '@/components/form/SwitchField'
import { TextareaField } from '@/components/form/TextareaField'
import { TextField } from '@/components/form/TextField'
import { FieldGroup } from '@/components/ui/field'
import { applyServerErrors } from '@/lib/form'
import { formatNumber } from '@/lib/format'
import { useSavePool } from '../hooks'
import { createPoolFormSchema, toPoolFormInput, type PoolFormInput, type PoolFormValues } from '../schema'
import type { Pool } from '../types'

type PoolFormDialogProps = {
  pool?: Pool
  onClose: () => void
}

export function PoolFormDialog({ pool, onClose }: PoolFormDialogProps) {
  const formId = useId()
  const isEdit = Boolean(pool)
  const savePool = useSavePool()
  const schema = useMemo(() => createPoolFormSchema(pool?.occupied), [pool?.occupied])

  const form = useForm<PoolFormInput, unknown, PoolFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toPoolFormInput(pool),
  })
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((values) =>
    savePool.mutate(
      { id: pool?.id, values },
      { onSuccess: onClose, onError: (error) => applyServerErrors(error, form.setError) },
    ),
  )

  return (
    <FormDialog
      title={isEdit ? 'Ubah Pool' : 'Tambah Pool'}
      description="Lokasi penyimpanan unit beserta kapasitasnya."
      formId={formId}
      submitLabel={isEdit ? 'Simpan perubahan' : 'Simpan'}
      isPending={savePool.isPending}
      onClose={onClose}
    >
      <form id={formId} onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-[9rem_1fr]">
            <TextField
              label="Kode"
              isRequired
              placeholder="TGR"
              className="uppercase"
              {...form.register('code')}
              error={errors.code?.message}
            />
            <TextField
              label="Nama pool"
              isRequired
              placeholder="Pool Tangerang"
              {...form.register('name')}
              error={errors.name?.message}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
            <TextField label="Kota" isRequired placeholder="Tangerang" {...form.register('city')} error={errors.city?.message} />
            <TextField
              label="Kapasitas"
              isRequired
              inputMode="numeric"
              placeholder="50"
              {...form.register('capacity')}
              error={errors.capacity?.message}
            />
          </div>
          {pool && (
            <p className="-mt-2 text-sm text-muted-foreground">
              Saat ini terisi <strong>{formatNumber(pool.occupied)} unit aktif</strong>; kapasitas tidak boleh di bawah angka ini.
            </p>
          )}
          <TextareaField
            label="Alamat"
            rows={3}
            placeholder="Alamat lengkap pool"
            {...form.register('address')}
            error={errors.address?.message}
          />
          <Controller
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <SwitchField
                label="Pool aktif"
                description="Pool nonaktif tidak muncul di pilihan saat menambah atau memindahkan unit."
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
