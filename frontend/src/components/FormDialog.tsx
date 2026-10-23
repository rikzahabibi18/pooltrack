import { Loader2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type FormDialogProps = {
  title: string
  description?: string
  /** id elemen <form> di dalam children, supaya tombol Simpan di footer bisa submit. */
  formId: string
  submitLabel: string
  isPending: boolean
  onClose: () => void
  /** Dialog lebih lebar untuk form dengan banyak kolom (mis. form unit). */
  wide?: boolean
  children: ReactNode
}

/** Kerangka dialog form tambah/ubah yang dipakai semua fitur. */
export function FormDialog({ title, description, formId, submitLabel, isPending, onClose, wide, children }: FormDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className={wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="-mx-4 max-h-[65vh] overflow-y-auto px-4 py-1">{children}</div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending && <Loader2Icon className="animate-spin" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
