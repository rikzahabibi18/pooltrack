import { EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'

type RowActionsProps = {
  /** Nama data di baris ini, untuk label aksesibilitas, mis. "PT Dana Mitra". */
  itemLabel: string
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

/** Tombol aksi di ujung kanan setiap baris tabel. */
export function RowActions({ itemLabel, onView, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      {onView && (
        <Button variant="ghost" size="icon-sm" onClick={onView} aria-label={`Detail ${itemLabel}`} title="Detail">
          <EyeIcon />
        </Button>
      )}
      {onEdit && (
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Ubah ${itemLabel}`} title="Ubah">
          <PencilIcon />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label={`Hapus ${itemLabel}`}
          title="Hapus"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2Icon />
        </Button>
      )}
    </div>
  )
}
