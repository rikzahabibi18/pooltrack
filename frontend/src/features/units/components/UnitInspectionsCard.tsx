import { ClipboardCheckIcon, GaugeIcon, PencilIcon, PlusIcon, Trash2Icon, UserIcon } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { GradeBadge } from '@/components/GradeBadge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { InspectionFormDialog } from '@/features/inspections/components/InspectionFormDialog'
import { useDeleteInspection, useUnitInspections } from '@/features/inspections/hooks'
import type { Inspection } from '@/features/inspections/types'
import { formatDate, formatNumber } from '@/lib/format'
import type { Unit } from '../types'

const NOTE_LABELS = [
  ['exterior_notes', 'Eksterior'],
  ['interior_notes', 'Interior'],
  ['engine_notes', 'Mesin'],
  ['notes', 'Catatan'],
] as const

type DialogState = { type: 'form'; inspection?: Inspection } | { type: 'delete'; inspection: Inspection } | null

/** Daftar hasil inspeksi di halaman detail unit, terbaru di atas. */
export function UnitInspectionsCard({ unit }: { unit: Unit }) {
  const inspections = useUnitInspections(unit.id)
  const deleteInspection = useDeleteInspection()
  const [dialog, setDialog] = useState<DialogState>(null)
  const canManage = unit.actions.can_inspect
  /** Unit tanpa inspeksi: inspeksi pertama mengubah status ke langkah berikutnya (nama dari backend). */
  const statusAfterFirstInspection = unit.inspection_count === 0 ? unit.actions.next_status?.name : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hasil Inspeksi ({inspections.data?.length ?? unit.inspection_count})</CardTitle>
        {canManage && (
          <CardAction>
            <Button size="sm" onClick={() => setDialog({ type: 'form' })}>
              <PlusIcon />
              Tambah Inspeksi
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {inspections.isPending && <Skeleton className="h-24 w-full" />}
        {inspections.isError && <ErrorState error={inspections.error} onRetry={() => inspections.refetch()} />}
        {inspections.data?.length === 0 && (
          <EmptyState
            icon={ClipboardCheckIcon}
            title="Belum ada inspeksi"
            description={
              statusAfterFirstInspection &&
              `Inspeksi pertama akan mengubah status unit menjadi ${statusAfterFirstInspection}.`
            }
          />
        )}

        <ul className="space-y-3">
          {inspections.data?.map((inspection) => (
            <li key={inspection.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{formatDate(inspection.inspection_date)}</span>
                    <GradeBadge code={inspection.grade.code} name={inspection.grade.name} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <UserIcon className="size-3.5" aria-hidden />
                      {inspection.inspector_name}
                    </span>
                    {inspection.odometer_km != null && (
                      <span className="inline-flex items-center gap-1">
                        <GaugeIcon className="size-3.5" aria-hidden />
                        {formatNumber(inspection.odometer_km)} km
                      </span>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Ubah inspeksi"
                      title="Ubah"
                      onClick={() => setDialog({ type: 'form', inspection })}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Hapus inspeksi"
                      title="Hapus"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDialog({ type: 'delete', inspection })}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                )}
              </div>

              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {NOTE_LABELS.filter(([field]) => inspection[field]).map(([field, label]) => (
                  <div key={field}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="whitespace-pre-line">{inspection[field]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </CardContent>

      {dialog?.type === 'form' && (
        <InspectionFormDialog
          unitId={unit.id}
          plateNumber={unit.plate_number}
          receivedAt={unit.received_at}
          statusAfterFirstInspection={statusAfterFirstInspection}
          inspection={dialog.inspection}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog?.type === 'delete' && (
        <ConfirmDialog
          title="Hapus inspeksi?"
          description={
            <>
              Inspeksi tanggal <strong>{formatDate(dialog.inspection.inspection_date)}</strong> akan dihapus. Inspeksi
              satu-satunya milik unit tidak dapat dihapus — ubah datanya jika salah input.
            </>
          }
          confirmLabel="Hapus"
          isPending={deleteInspection.isPending}
          onConfirm={() => deleteInspection.mutate(dialog.inspection.id, { onSettled: () => setDialog(null) })}
          onCancel={() => setDialog(null)}
        />
      )}
    </Card>
  )
}
