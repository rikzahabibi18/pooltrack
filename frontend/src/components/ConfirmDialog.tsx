import { Loader2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

type ConfirmDialogProps = {
  title: string
  description: ReactNode
  confirmLabel: string
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Dialog konfirmasi untuk aksi berisiko (hapus, ubah status).
 * Selama proses berjalan dialog tidak bisa ditutup, supaya user melihat hasilnya.
 */
export function ConfirmDialog({ title, description, confirmLabel, isPending, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <AlertDialog open onOpenChange={(open) => !open && !isPending && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2Icon className="animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
