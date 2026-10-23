import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatText } from '@/lib/format'
import type { Unit } from '../types'

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words">{children}</dd>
    </div>
  )
}

export function UnitInfoCard({ unit }: { unit: Unit }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Unit</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <InfoItem label="Nomor plat">{unit.plate_number}</InfoItem>
          <InfoItem label="Merek / Model">
            {unit.brand} {unit.model}
          </InfoItem>
          <InfoItem label="Tahun">{unit.year}</InfoItem>
          <InfoItem label="Jenis kendaraan">{unit.vehicle_type.name}</InfoItem>
          <InfoItem label="Warna">{formatText(unit.color)}</InfoItem>
          <InfoItem label="Mitra">{unit.partner.name}</InfoItem>
          <InfoItem label="Pool">{unit.pool.name}</InfoItem>
          <InfoItem label="Tanggal masuk">{formatDate(unit.received_at)}</InfoItem>
          <InfoItem label="Tanggal keluar">{formatDate(unit.released_at)}</InfoItem>
          <InfoItem label="Nomor rangka">{formatText(unit.chassis_number)}</InfoItem>
          <InfoItem label="Nomor mesin">{formatText(unit.engine_number)}</InfoItem>
        </dl>
        {unit.notes && (
          <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
            <p className="text-xs text-muted-foreground">Catatan</p>
            <p className="whitespace-pre-line">{unit.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
