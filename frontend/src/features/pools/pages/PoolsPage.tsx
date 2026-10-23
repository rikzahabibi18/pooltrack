import { MapPinIcon, PlusIcon, SearchXIcon } from 'lucide-react'
import { useState } from 'react'
import { ActiveBadge } from '@/components/ActiveBadge'
import { ActiveFilterSelect } from '@/components/ActiveFilterSelect'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { ListCard } from '@/components/ListCard'
import { OccupancyBar } from '@/components/OccupancyBar'
import { PageHeader } from '@/components/PageHeader'
import { RowActions } from '@/components/RowActions'
import { SearchInput } from '@/components/SearchInput'
import { TablePagination } from '@/components/TablePagination'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS } from '@/config/navigation'
import { useListParams } from '@/hooks/useListParams'
import { PoolFormDialog } from '../components/PoolFormDialog'
import { useDeletePool, usePools } from '../hooks'
import type { Pool, PoolSort } from '../types'

type FormState = { pool?: Pool } | null

export function PoolsPage() {
  const { title, description } = NAV_ITEMS.pools
  const list = useListParams<PoolSort>({ sort: 'name', order: 'asc' })
  const pools = usePools(list.params)
  const deletePool = useDeletePool()

  const [formState, setFormState] = useState<FormState>(null)
  const [poolToDelete, setPoolToDelete] = useState<Pool | null>(null)

  if (pools.data) list.clampPage(pools.data.meta.totalPages)

  const columns: DataTableColumn<Pool, PoolSort>[] = [
    {
      key: 'code',
      header: 'Kode',
      sortKey: 'code',
      className: 'w-24',
      cell: (pool) => <span className="font-mono text-xs font-medium">{pool.code}</span>,
    },
    {
      key: 'name',
      header: 'Pool',
      sortKey: 'name',
      cell: (pool) => (
        <div className="flex flex-col">
          <span className="font-medium">{pool.name}</span>
          <span className="text-xs text-muted-foreground">{pool.city}</span>
        </div>
      ),
    },
    {
      key: 'occupancy',
      header: 'Okupansi',
      sortKey: 'occupied',
      className: 'w-56',
      cell: (pool) => <OccupancyBar occupied={pool.occupied} capacity={pool.capacity} />,
    },
    { key: 'status', header: 'Status', cell: (pool) => <ActiveBadge isActive={pool.is_active} /> },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      cell: (pool) => (
        <RowActions itemLabel={pool.name} onEdit={() => setFormState({ pool })} onDelete={() => setPoolToDelete(pool)} />
      ),
    },
  ]

  const emptyState = list.hasActiveFilters ? (
    <EmptyState
      icon={SearchXIcon}
      title="Pool tidak ditemukan"
      description="Coba kata kunci atau filter lain."
      action={
        <Button variant="outline" onClick={list.resetFilters}>
          Reset filter
        </Button>
      }
    />
  ) : (
    <EmptyState icon={MapPinIcon} title="Belum ada pool" description="Tambahkan lokasi penyimpanan pertama." />
  )

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={() => setFormState({})}>
            <PlusIcon />
            Tambah Pool
          </Button>
        }
      />

      <ListCard
        toolbar={
          <>
            <SearchInput value={list.search} onChange={list.setSearch} placeholder="Cari kode, nama, kota…" />
            <ActiveFilterSelect value={list.filters.is_active} onChange={(value) => list.setFilter('is_active', value)} />
          </>
        }
      >
        {pools.isError ? (
          <ErrorState error={pools.error} onRetry={() => pools.refetch()} />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={pools.data?.data}
              rowKey={(pool) => pool.id}
              isLoading={pools.isPending}
              isRefreshing={pools.isPlaceholderData}
              sorting={list.sorting}
              onSort={list.toggleSort}
              emptyState={emptyState}
            />
            <TablePagination meta={pools.data?.meta} onPageChange={list.setPage} />
          </>
        )}
      </ListCard>

      {formState && <PoolFormDialog pool={formState.pool} onClose={() => setFormState(null)} />}

      {poolToDelete && (
        <ConfirmDialog
          title="Hapus pool?"
          description={
            <>
              <strong>{poolToDelete.name}</strong> akan dihapus permanen. Pool yang pernah menampung unit tidak dapat dihapus —
              nonaktifkan saja.
            </>
          }
          confirmLabel="Hapus"
          isPending={deletePool.isPending}
          onConfirm={() => deletePool.mutate(poolToDelete.id, { onSettled: () => setPoolToDelete(null) })}
          onCancel={() => setPoolToDelete(null)}
        />
      )}
    </>
  )
}
