import { CarFrontIcon, PlusIcon, SearchXIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { FilterSelect } from '@/components/FilterSelect'
import { ListCard } from '@/components/ListCard'
import { PageHeader } from '@/components/PageHeader'
import { RowActions } from '@/components/RowActions'
import { SearchInput } from '@/components/SearchInput'
import { StatusBadge } from '@/components/StatusBadge'
import { TablePagination } from '@/components/TablePagination'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS, unitDetailPath } from '@/config/navigation'
import { usePartnerOptions } from '@/features/partners/hooks'
import { usePoolOptions } from '@/features/pools/hooks'
import { useUnitStatuses } from '@/features/references/hooks'
import { useVehicleTypeOptions } from '@/features/vehicle-types/hooks'
import { useListParams } from '@/hooks/useListParams'
import { formatDate } from '@/lib/format'
import { UnitFormDialog } from '../components/UnitFormDialog'
import { useDeleteUnit, useUnits } from '../hooks'
import type { Unit, UnitSort } from '../types'

type FormState = { unit?: Unit } | null

const toFilterOptions = (items: { id: number; name: string }[] | undefined) =>
  (items ?? []).map((item) => ({ value: String(item.id), label: item.name }))

export function UnitsPage() {
  const { title, description } = NAV_ITEMS.units
  const navigate = useNavigate()
  const list = useListParams<UnitSort>({ sort: 'received_at', order: 'desc' })
  const units = useUnits(list.params)
  const deleteUnit = useDeleteUnit()

  // Filter memakai SEMUA master (termasuk nonaktif) supaya unit lama tetap bisa dicari.
  const statuses = useUnitStatuses()
  const pools = usePoolOptions({ activeOnly: false })
  const partners = usePartnerOptions({ activeOnly: false })
  const vehicleTypes = useVehicleTypeOptions({ activeOnly: false })

  const [formState, setFormState] = useState<FormState>(null)
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)

  if (units.data) list.clampPage(units.data.meta.totalPages)

  const columns: DataTableColumn<Unit, UnitSort>[] = [
    {
      key: 'plate',
      header: 'Unit',
      sortKey: 'plate_number',
      cell: (unit) => (
        <Link to={unitDetailPath(unit.id)} className="group flex flex-col">
          <span className="font-semibold group-hover:underline">{unit.plate_number}</span>
          <span className="text-xs text-muted-foreground">
            {unit.brand} {unit.model} · {unit.year}
          </span>
        </Link>
      ),
    },
    { key: 'type', header: 'Jenis', cell: (unit) => unit.vehicle_type.name },
    { key: 'partner', header: 'Mitra', cell: (unit) => unit.partner.name },
    { key: 'pool', header: 'Pool', sortKey: 'pool', cell: (unit) => unit.pool.name },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      cell: (unit) => <StatusBadge name={unit.status.name} color={unit.status.color} />,
    },
    {
      key: 'received_at',
      header: 'Tgl Masuk',
      sortKey: 'received_at',
      cell: (unit) => <span className="whitespace-nowrap">{formatDate(unit.received_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-28',
      cell: (unit) => (
        <RowActions
          itemLabel={unit.plate_number}
          onView={() => navigate(unitDetailPath(unit.id))}
          onEdit={unit.actions.can_edit ? () => setFormState({ unit }) : undefined}
          onDelete={unit.actions.can_delete ? () => setUnitToDelete(unit) : undefined}
        />
      ),
    },
  ]

  const emptyState = list.hasActiveFilters ? (
    <EmptyState
      icon={SearchXIcon}
      title="Unit tidak ditemukan"
      description="Coba kata kunci atau filter lain."
      action={
        <Button variant="outline" onClick={list.resetFilters}>
          Reset filter
        </Button>
      }
    />
  ) : (
    <EmptyState icon={CarFrontIcon} title="Belum ada unit" description="Catat unit pertama yang masuk ke pool." />
  )

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={() => setFormState({})}>
            <PlusIcon />
            Unit Masuk
          </Button>
        }
      />

      <ListCard
        toolbar={
          <>
            <SearchInput value={list.search} onChange={list.setSearch} placeholder="Cari plat, merek, model…" />
            <FilterSelect
              value={list.filters.status_id}
              onChange={(value) => list.setFilter('status_id', value)}
              allLabel="Semua status"
              options={toFilterOptions(statuses.data)}
              ariaLabel="Filter status"
            />
            <FilterSelect
              value={list.filters.pool_id}
              onChange={(value) => list.setFilter('pool_id', value)}
              allLabel="Semua pool"
              options={toFilterOptions(pools.data)}
              ariaLabel="Filter pool"
            />
            <FilterSelect
              value={list.filters.partner_id}
              onChange={(value) => list.setFilter('partner_id', value)}
              allLabel="Semua mitra"
              options={toFilterOptions(partners.data)}
              ariaLabel="Filter mitra"
            />
            <FilterSelect
              value={list.filters.vehicle_type_id}
              onChange={(value) => list.setFilter('vehicle_type_id', value)}
              allLabel="Semua jenis"
              options={toFilterOptions(vehicleTypes.data)}
              ariaLabel="Filter jenis kendaraan"
            />
            {list.hasActiveFilters && (
              <Button variant="ghost" onClick={list.resetFilters}>
                Reset
              </Button>
            )}
          </>
        }
      >
        {units.isError ? (
          <ErrorState error={units.error} onRetry={() => units.refetch()} />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={units.data?.data}
              rowKey={(unit) => unit.id}
              isLoading={units.isPending}
              isRefreshing={units.isPlaceholderData}
              sorting={list.sorting}
              onSort={list.toggleSort}
              emptyState={emptyState}
            />
            <TablePagination meta={units.data?.meta} onPageChange={list.setPage} />
          </>
        )}
      </ListCard>

      {formState && <UnitFormDialog unit={formState.unit} onClose={() => setFormState(null)} />}

      {unitToDelete && (
        <ConfirmDialog
          title="Hapus unit?"
          description={
            <>
              Unit <strong>{unitToDelete.plate_number}</strong> beserta riwayatnya akan dihapus permanen. Gunakan hanya untuk
              koreksi salah input.
            </>
          }
          confirmLabel="Hapus"
          isPending={deleteUnit.isPending}
          onConfirm={() => deleteUnit.mutate(unitToDelete.id, { onSettled: () => setUnitToDelete(null) })}
          onCancel={() => setUnitToDelete(null)}
        />
      )}
    </>
  )
}
