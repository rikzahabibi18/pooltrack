import { HandshakeIcon, PlusIcon, SearchXIcon } from 'lucide-react'
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
import { formatText } from '@/lib/format'
import { PartnerFormDialog } from '../components/PartnerFormDialog'
import { useDeletePartner, usePartners } from '../hooks'
import type { Partner, PartnerSort } from '../types'

/** null = dialog tertutup; { partner: undefined } = tambah; { partner } = ubah. */
type FormState = { partner?: Partner } | null

export function PartnersPage() {
  const { title, description } = NAV_ITEMS.partners
  const list = useListParams<PartnerSort>({ sort: 'name', order: 'asc' })
  const partners = usePartners(list.params)
  const deletePartner = useDeletePartner()

  const [formState, setFormState] = useState<FormState>(null)
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)

  if (partners.data) list.clampPage(partners.data.meta.totalPages)

  const columns: DataTableColumn<Partner, PartnerSort>[] = [
    {
      key: 'code',
      header: 'Kode',
      sortKey: 'code',
      className: 'w-28',
      cell: (partner) => <span className="font-mono text-xs font-medium">{partner.code}</span>,
    },
    {
      key: 'name',
      header: 'Nama Mitra',
      sortKey: 'name',
      cell: (partner) => <span className="font-medium">{partner.name}</span>,
    },
    {
      key: 'contact',
      header: 'Kontak',
      cell: (partner) => (
        <div className="flex flex-col">
          <span>{formatText(partner.contact_person)}</span>
          <span className="text-xs text-muted-foreground">
            {[partner.phone, partner.email].filter(Boolean).join(' · ') || '—'}
          </span>
        </div>
      ),
    },
    { key: 'status', header: 'Status', cell: (partner) => <ActiveBadge isActive={partner.is_active} /> },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      cell: (partner) => (
        <RowActions
          itemLabel={partner.name}
          onEdit={() => setFormState({ partner })}
          onDelete={() => setPartnerToDelete(partner)}
        />
      ),
    },
  ]

  const emptyState = list.hasActiveFilters ? (
    <EmptyState
      icon={SearchXIcon}
      title="Mitra tidak ditemukan"
      description="Coba kata kunci atau filter lain."
      action={
        <Button variant="outline" onClick={list.resetFilters}>
          Reset filter
        </Button>
      }
    />
  ) : (
    <EmptyState icon={HandshakeIcon} title="Belum ada mitra" description="Tambahkan mitra leasing pertama." />
  )

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={() => setFormState({})}>
            <PlusIcon />
            Tambah Mitra
          </Button>
        }
      />

      <ListCard
        toolbar={
          <>
            <SearchInput value={list.search} onChange={list.setSearch} placeholder="Cari kode, nama, kontak, email…" />
            <ActiveFilterSelect value={list.filters.is_active} onChange={(value) => list.setFilter('is_active', value)} />
          </>
        }
      >
        {partners.isError ? (
          <ErrorState error={partners.error} onRetry={() => partners.refetch()} />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={partners.data?.data}
              rowKey={(partner) => partner.id}
              isLoading={partners.isPending}
              isRefreshing={partners.isPlaceholderData}
              sorting={list.sorting}
              onSort={list.toggleSort}
              emptyState={emptyState}
            />
            <TablePagination meta={partners.data?.meta} onPageChange={list.setPage} />
          </>
        )}
      </ListCard>

      {formState && <PartnerFormDialog partner={formState.partner} onClose={() => setFormState(null)} />}

      {partnerToDelete && (
        <ConfirmDialog
          title="Hapus mitra?"
          description={
            <>
              Mitra <strong>{partnerToDelete.name}</strong> akan dihapus permanen. Mitra yang masih tercatat pada unit
              tidak dapat dihapus — nonaktifkan saja.
            </>
          }
          confirmLabel="Hapus"
          isPending={deletePartner.isPending}
          onConfirm={() => deletePartner.mutate(partnerToDelete.id, { onSettled: () => setPartnerToDelete(null) })}
          onCancel={() => setPartnerToDelete(null)}
        />
      )}
    </>
  )
}
