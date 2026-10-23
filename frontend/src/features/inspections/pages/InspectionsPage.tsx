import { ClipboardCheckIcon, SearchXIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { FilterSelect } from '@/components/FilterSelect'
import { GradeBadge } from '@/components/GradeBadge'
import { ListCard } from '@/components/ListCard'
import { PageHeader } from '@/components/PageHeader'
import { RowActions } from '@/components/RowActions'
import { SearchInput } from '@/components/SearchInput'
import { TablePagination } from '@/components/TablePagination'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS, unitDetailPath } from '@/config/navigation'
import { usePoolOptions } from '@/features/pools/hooks'
import { useInspectionGrades } from '@/features/references/hooks'
import { useListParams } from '@/hooks/useListParams'
import { formatDate, formatNumber } from '@/lib/format'
import { InspectionFormDialog } from '../components/InspectionFormDialog'
import { useDeleteInspection, useInspections } from '../hooks'
import type { Inspection, InspectionSort } from '../types'

/**
 * Daftar semua inspeksi lintas unit.
 * Menambah inspeksi dilakukan dari halaman detail unit, karena inspeksi selalu milik satu unit.
 */
export function InspectionsPage() {
  const { title, description } = NAV_ITEMS.inspections
  const navigate = useNavigate()
  const list = useListParams<InspectionSort>({ sort: 'inspection_date', order: 'desc' })
  const inspections = useInspections(list.params)
  const deleteInspection = useDeleteInspection()
  const grades = useInspectionGrades()
  const pools = usePoolOptions({ activeOnly: false })

  const [inspectionToEdit, setInspectionToEdit] = useState<Inspection | null>(null)
  const [inspectionToDelete, setInspectionToDelete] = useState<Inspection | null>(null)

  if (inspections.data) list.clampPage(inspections.data.meta.totalPages)

  const columns: DataTableColumn<Inspection, InspectionSort>[] = [
    {
      key: 'date',
      header: 'Tanggal',
      sortKey: 'inspection_date',
      cell: (inspection) => <span className="whitespace-nowrap">{formatDate(inspection.inspection_date)}</span>,
    },
    {
      key: 'unit',
      header: 'Unit',
      sortKey: 'plate_number',
      cell: (inspection) => (
        <Link to={unitDetailPath(inspection.unit.id)} className="group flex flex-col">
          <span className="font-semibold group-hover:underline">{inspection.unit.plate_number}</span>
          <span className="text-xs text-muted-foreground">
            {inspection.unit.brand} {inspection.unit.model}
          </span>
        </Link>
      ),
    },
    { key: 'pool', header: 'Pool', cell: (inspection) => inspection.unit.pool.name },
    { key: 'inspector', header: 'Inspektor', cell: (inspection) => inspection.inspector_name },
    {
      key: 'odometer',
      header: 'Odometer',
      className: 'text-right',
      cell: (inspection) => (inspection.odometer_km != null ? `${formatNumber(inspection.odometer_km)} km` : '—'),
    },
    {
      key: 'grade',
      header: 'Grade',
      sortKey: 'grade',
      cell: (inspection) => <GradeBadge code={inspection.grade.code} name={inspection.grade.name} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-28',
      cell: (inspection) => (
        <RowActions
          itemLabel={`inspeksi ${inspection.unit.plate_number}`}
          onView={() => navigate(unitDetailPath(inspection.unit.id))}
          onEdit={() => setInspectionToEdit(inspection)}
          onDelete={() => setInspectionToDelete(inspection)}
        />
      ),
    },
  ]

  const emptyState = list.hasActiveFilters ? (
    <EmptyState
      icon={SearchXIcon}
      title="Inspeksi tidak ditemukan"
      description="Coba kata kunci atau filter lain."
      action={
        <Button variant="outline" onClick={list.resetFilters}>
          Reset filter
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={ClipboardCheckIcon}
      title="Belum ada inspeksi"
      description="Tambahkan hasil inspeksi dari halaman detail unit."
    />
  )

  return (
    <>
      <PageHeader title={title} description={description} />

      <ListCard
        toolbar={
          <>
            <SearchInput value={list.search} onChange={list.setSearch} placeholder="Cari plat atau nama inspektor…" />
            <FilterSelect
              value={list.filters.grade_id}
              onChange={(value) => list.setFilter('grade_id', value)}
              allLabel="Semua grade"
              options={(grades.data ?? []).map((grade) => ({ value: String(grade.id), label: `${grade.code} — ${grade.name}` }))}
              ariaLabel="Filter grade"
            />
            <FilterSelect
              value={list.filters.pool_id}
              onChange={(value) => list.setFilter('pool_id', value)}
              allLabel="Semua pool"
              options={(pools.data ?? []).map((pool) => ({ value: String(pool.id), label: pool.name }))}
              ariaLabel="Filter pool"
            />
            {list.hasActiveFilters && (
              <Button variant="ghost" onClick={list.resetFilters}>
                Reset
              </Button>
            )}
          </>
        }
      >
        {inspections.isError ? (
          <ErrorState error={inspections.error} onRetry={() => inspections.refetch()} />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={inspections.data?.data}
              rowKey={(inspection) => inspection.id}
              isLoading={inspections.isPending}
              isRefreshing={inspections.isPlaceholderData}
              sorting={list.sorting}
              onSort={list.toggleSort}
              emptyState={emptyState}
            />
            <TablePagination meta={inspections.data?.meta} onPageChange={list.setPage} />
          </>
        )}
      </ListCard>

      {inspectionToEdit && (
        <InspectionFormDialog
          unitId={inspectionToEdit.unit.id}
          plateNumber={inspectionToEdit.unit.plate_number}
          inspection={inspectionToEdit}
          onClose={() => setInspectionToEdit(null)}
        />
      )}

      {inspectionToDelete && (
        <ConfirmDialog
          title="Hapus inspeksi?"
          description={
            <>
              Inspeksi <strong>{inspectionToDelete.unit.plate_number}</strong> tanggal{' '}
              {formatDate(inspectionToDelete.inspection_date)} akan dihapus. Inspeksi satu-satunya milik unit tidak dapat
              dihapus — ubah datanya jika salah input.
            </>
          }
          confirmLabel="Hapus"
          isPending={deleteInspection.isPending}
          onConfirm={() => deleteInspection.mutate(inspectionToDelete.id, { onSettled: () => setInspectionToDelete(null) })}
          onCancel={() => setInspectionToDelete(null)}
        />
      )}
    </>
  )
}
