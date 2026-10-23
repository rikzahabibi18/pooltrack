import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FormDialog } from '@/components/FormDialog'
import { SwitchField } from '@/components/form/SwitchField'
import { TextField } from '@/components/form/TextField'
import { FieldGroup } from '@/components/ui/field'
import { applyServerErrors } from '@/lib/form'
import { useSavePartner } from '../hooks'
import { partnerFormSchema, toPartnerFormValues, type PartnerFormValues } from '../schema'
import type { Partner } from '../types'

type PartnerFormDialogProps = {
  /** Kosong = tambah mitra baru; terisi = ubah mitra tersebut. */
  partner?: Partner
  onClose: () => void
}

export function PartnerFormDialog({ partner, onClose }: PartnerFormDialogProps) {
  const formId = useId()
  const isEdit = Boolean(partner)
  const savePartner = useSavePartner()

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: toPartnerFormValues(partner),
  })
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((values) =>
    savePartner.mutate(
      { id: partner?.id, values },
      { onSuccess: onClose, onError: (error) => applyServerErrors(error, form.setError) },
    ),
  )

  return (
    <FormDialog
      title={isEdit ? 'Ubah Mitra' : 'Tambah Mitra'}
      description="Perusahaan pembiayaan (leasing) pemilik unit."
      formId={formId}
      submitLabel={isEdit ? 'Simpan perubahan' : 'Simpan'}
      isPending={savePartner.isPending}
      onClose={onClose}
    >
      <form id={formId} onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-[9rem_1fr]">
            <TextField
              label="Kode"
              isRequired
              placeholder="DMS"
              className="uppercase"
              {...form.register('code')}
              error={errors.code?.message}
            />
            <TextField
              label="Nama mitra"
              isRequired
              placeholder="PT Dana Mitra Sejahtera"
              {...form.register('name')}
              error={errors.name?.message}
            />
          </div>
          <TextField
            label="Nama kontak"
            placeholder="Nama PIC di mitra"
            {...form.register('contact_person')}
            error={errors.contact_person?.message}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Telepon"
              type="tel"
              placeholder="021-5550-1101"
              {...form.register('phone')}
              error={errors.phone?.message}
            />
            <TextField
              label="Email"
              type="email"
              placeholder="nama@perusahaan.co.id"
              {...form.register('email')}
              error={errors.email?.message}
            />
          </div>
          <Controller
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <SwitchField
                label="Mitra aktif"
                description="Mitra nonaktif tidak muncul di pilihan saat menambah unit baru."
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
