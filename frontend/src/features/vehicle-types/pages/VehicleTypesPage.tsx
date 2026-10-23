import { PlusIcon, SearchXIcon, TagsIcon } from 'lucide-react'
import { useState } from 'react'
import { ActiveBadge } from '@/components/ActiveBadge'
import { ActiveFilterSelect } from '@/components/ActiveFilterSelect'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { ListCard } from '@/components/ListCard'
import { PageHeader } from '@/components/PageHeader'
import { RowActions } from '@/components/RowActions'
import { SearchInput } from '@/components/SearchInput'
import { TablePagination } from '@/components/TablePagination'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS } from '@/config/navigation'
import { useListParams } from '@/hooks/useListParams'
import { VehicleTypeFormDialog } from '../components/VehicleTypeFormDialog'
import { useDeleteVehicleType, useVehicleTypes } from '../hooks'
import type { VehicleType, VehicleTypeSort } from '../types'

type FormState = { vehicleType?: VehicleType } | null

export function VehicleTypesPage() {
  const { title, description } = NAV_ITEMS.vehicleTypes
  const list = useListParams<VehicleTypeSort>({ sort: 'name', order: 'asc' })
  const vehicleTypes = useVehicleTypes(list.params)
  const deleteVehicleType = useDeleteVehicleType()

  const [formState, setFormState] = useState<FormState>(null)
  const [vehicleTypeToDelete, setVehicleTypeToDelete] = useState<VehicleType | null>(null)

  if (vehicleTypes.data) list.clampPage(vehicleTypes.data.meta.totalPages)

  const columns: DataTableColumn<VehicleType, VehicleTypeSort>[] = [
    {
      key: 'code',
      header: 'Kode',
      sortKey: 'code',
      className: 'w-32',
      cell: (vehicleType) => <span className="font-mono text-xs font-medium">{vehicleType.code}</span>,
    },
    {
      key: 'name',
      header: 'Nama',
      sortKey: 'name',
      cell: (vehicleType) => <span className="font-medium">{vehicleType.name}</span>,
    },
    { key: 'status', header: 'Status', cell: (vehicleType) => <ActiveBadge isActive={vehicleType.is_active} /> },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      cell: (vehicleType) => (
        <RowActions
          itemLabel={vehicleType.name}
          onEdit={() => setFormState({ vehicleType })}
          onDelete={() => setVehicleTypeToDelete(vehicleType)}
        />
      ),
    },
  ]

  const emptyState = list.hasActiveFilters ? (
    <EmptyState
      icon={SearchXIcon}
      title="Jenis kendaraan tidak ditemukan"
      description="Coba kata kunci atau filter lain."
      action={
        <Button variant="outline" onClick={list.resetFilters}>
          Reset filter
        </Button>
      }
    />
  ) : (
    <EmptyState icon={TagsIcon} title="Belum ada jenis kendaraan" description="Tambahkan jenis kendaraan pertama." />
  )

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={() => setFormState({})}>
            <PlusIcon />
            Tambah Jenis
          </Button>
        }
      />

      <ListCard
        toolbar={
          <>
            <SearchInput value={list.search} onChange={list.setSearch} placeholder="Cari kode atau nama…" />
            <ActiveFilterSelect value={list.filters.is_active} onChange={(value) => list.setFilter('is_active', value)} />
          </>
        }
      >
        {vehicleTypes.isError ? (
          <ErrorState error={vehicleTypes.error} onRetry={() => vehicleTypes.refetch()} />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={vehicleTypes.data?.data}
              rowKey={(vehicleType) => vehicleType.id}
              isLoading={vehicleTypes.isPending}
              isRefreshing={vehicleTypes.isPlaceholderData}
              sorting={list.sorting}
              onSort={list.toggleSort}
              emptyState={emptyState}
            />
            <TablePagination meta={vehicleTypes.data?.meta} onPageChange={list.setPage} />
          </>
        )}
      </ListCard>

      {formState && <VehicleTypeFormDialog vehicleType={formState.vehicleType} onClose={() => setFormState(null)} />}

      {vehicleTypeToDelete && (
        <ConfirmDialog
          title="Hapus jenis kendaraan?"
          description={
            <>
              Jenis <strong>{vehicleTypeToDelete.name}</strong> akan dihapus permanen. Jenis yang masih dipakai unit tidak dapat
              dihapus — nonaktifkan saja.
            </>
          }
          confirmLabel="Hapus"
          isPending={deleteVehicleType.isPending}
          onConfirm={() => deleteVehicleType.mutate(vehicleTypeToDelete.id, { onSettled: () => setVehicleTypeToDelete(null) })}
          onCancel={() => setVehicleTypeToDelete(null)}
        />
      )}
    </>
  )
}
