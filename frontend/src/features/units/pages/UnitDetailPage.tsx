import { ArchiveIcon, ArrowLeftIcon, ArrowRightLeftIcon, CarFrontIcon, InfoIcon, PencilIcon, StepForwardIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { NAV_ITEMS } from '@/config/navigation'
import { formatDate } from '@/lib/format'
import { ApiError } from '@/lib/http'
import { ChangeStatusDialog } from '../components/ChangeStatusDialog'
import { MoveUnitDialog } from '../components/MoveUnitDialog'
import { UnitFormDialog } from '../components/UnitFormDialog'
import { UnitInfoCard } from '../components/UnitInfoCard'
import { UnitInspectionsCard } from '../components/UnitInspectionsCard'
import { UnitStatusTimeline } from '../components/UnitStatusTimeline'
import { useDeleteUnit, useUnit } from '../hooks'

type DialogType = 'edit' | 'status' | 'move' | 'delete' | null

const HTTP_NOT_FOUND = 404

function BackLink() {
  return (
    <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
      <Link to={NAV_ITEMS.units.path}>
        <ArrowLeftIcon />
        Daftar unit
      </Link>
    </Button>
  )
}

function UnitNotFound() {
  return (
    <Card>
      <CardContent>
        <EmptyState
          icon={CarFrontIcon}
          title="Unit tidak ditemukan"
          description="Unit mungkin sudah dihapus atau alamatnya salah."
          action={
            <Button variant="outline" asChild>
              <Link to={NAV_ITEMS.units.path}>Kembali ke daftar unit</Link>
            </Button>
          }
        />
      </CardContent>
    </Card>
  )
}

/** Halaman detail unit: info, aksi, riwayat inspeksi, dan timeline status. */
export function UnitDetailPage() {
  const params = useParams()
  const unitId = Number(params.id)
  const navigate = useNavigate()
  const unitQuery = useUnit(unitId)
  const deleteUnit = useDeleteUnit()
  const [dialog, setDialog] = useState<DialogType>(null)

  if (!Number.isInteger(unitId) || unitId <= 0) return <UnitNotFound />

  if (unitQuery.isPending) {
    return (
      <>
        <BackLink />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </>
    )
  }

  if (unitQuery.isError) {
    const isNotFound = unitQuery.error instanceof ApiError && unitQuery.error.status === HTTP_NOT_FOUND
    return (
      <>
        <BackLink />
        {isNotFound ? <UnitNotFound /> : <ErrorState error={unitQuery.error} onRetry={() => unitQuery.refetch()} />}
      </>
    )
  }

  const unit = unitQuery.data
  const { actions } = unit

  return (
    <>
      <BackLink />

      <PageHeader
        title={unit.plate_number}
        badge={<StatusBadge name={unit.status.name} color={unit.status.color} />}
        description={`${unit.brand} ${unit.model} · ${unit.year} · ${unit.partner.name} · ${unit.pool.name}`}
        actions={
          <>
            {actions.next_status && (
              <Button onClick={() => setDialog('status')} disabled={!actions.can_change_status}>
                <StepForwardIcon />
                Tandai {actions.next_status.name}
              </Button>
            )}
            {actions.can_move && (
              <Button variant="outline" onClick={() => setDialog('move')}>
                <ArrowRightLeftIcon />
                Pindah Pool
              </Button>
            )}
            {actions.can_edit && (
              <Button variant="outline" onClick={() => setDialog('edit')}>
                <PencilIcon />
                Ubah
              </Button>
            )}
            {actions.can_delete && (
              <Button variant="destructive" onClick={() => setDialog('delete')}>
                <Trash2Icon />
                Hapus
              </Button>
            )}
          </>
        }
      />

      {/* Alasan dari backend kenapa langkah berikutnya belum bisa dilakukan */}
      {actions.next_status && actions.change_status_blocked_reason && (
        <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p>
            <span className="font-medium">Langkah berikutnya: {actions.next_status.name}.</span>{' '}
            <span className="text-muted-foreground">{actions.change_status_blocked_reason}</span>
          </p>
        </div>
      )}

      {!actions.can_edit && (
        <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
          <ArchiveIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-muted-foreground">
            Unit berstatus {unit.status.name}
            {unit.released_at && ` sejak ${formatDate(unit.released_at)}`} dan disimpan sebagai arsip — datanya tidak dapat
            diubah lagi.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <UnitInfoCard unit={unit} />
          <UnitInspectionsCard unit={unit} />
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Riwayat Status</CardTitle>
          </CardHeader>
          <CardContent>
            <UnitStatusTimeline unitId={unit.id} />
          </CardContent>
        </Card>
      </div>

      {dialog === 'edit' && <UnitFormDialog unit={unit} onClose={() => setDialog(null)} />}
      {dialog === 'move' && <MoveUnitDialog unit={unit} onClose={() => setDialog(null)} />}
      {dialog === 'status' && actions.next_status && (
        <ChangeStatusDialog unit={unit} nextStatus={actions.next_status} onClose={() => setDialog(null)} />
      )}
      {dialog === 'delete' && (
        <ConfirmDialog
          title="Hapus unit?"
          description={
            <>
              Unit <strong>{unit.plate_number}</strong> beserta riwayatnya akan dihapus permanen. Gunakan hanya untuk koreksi
              salah input.
            </>
          }
          confirmLabel="Hapus"
          isPending={deleteUnit.isPending}
          onConfirm={() =>
            deleteUnit.mutate(unit.id, {
              onSuccess: () => navigate(NAV_ITEMS.units.path),
              onSettled: () => setDialog(null),
            })
          }
          onCancel={() => setDialog(null)}
        />
      )}
    </>
  )
}
