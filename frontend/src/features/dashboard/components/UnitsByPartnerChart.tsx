import { HandshakeIcon } from 'lucide-react'
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EmptyState } from '@/components/EmptyState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/format'
import type { DashboardSummary } from '../types'

type PartnerRow = DashboardSummary['units_by_partner'][number]

/** Ukuran grafik dihitung dari jumlah mitra supaya batang tidak gemuk atau berdesakan. */
const CHART = {
  ROW_HEIGHT: 44,
  BAR_SIZE: 18,
  LABEL_WIDTH: 150,
  LABEL_MAX_CHARS: 20,
  FONT_SIZE: 12,
  /** Ruang di kanan batang untuk angka nilai. */
  VALUE_LABEL_SPACE: 36,
}

const truncate = (text: string) =>
  text.length > CHART.LABEL_MAX_CHARS ? `${text.slice(0, CHART.LABEL_MAX_CHARS - 1)}…` : text

/** Label sumbu satu baris (Recharts bawaan membungkus teks panjang jadi dua baris). */
function PartnerTick({ x, y, payload }: { x?: number | string; y?: number | string; payload?: { value: string } }) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={CHART.FONT_SIZE} fill="var(--foreground)">
      {truncate(payload?.value ?? '')}
    </text>
  )
}

/**
 * Grafik batang horizontal: jumlah unit aktif per mitra (sudah diurutkan backend, terbanyak di atas).
 * Satu seri → satu warna (--series-1), tanpa legenda; judul kartu sudah menjelaskan isinya.
 * Nilai ditulis langsung di ujung batang, nama lengkap ada di tooltip,
 * dan tabel tersembunyi disediakan untuk pembaca layar.
 */
export function UnitsByPartnerChart({ data }: { data: DashboardSummary['units_by_partner'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Aktif per Mitra</CardTitle>
        <CardDescription>Jumlah unit yang masih berada di pool, per mitra leasing</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={HandshakeIcon} title="Belum ada unit aktif" />
        ) : (
          <>
            <div style={{ height: data.length * CHART.ROW_HEIGHT }} aria-hidden>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 0, right: CHART.VALUE_LABEL_SPACE, bottom: 0, left: 0 }}
                >
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={CHART.LABEL_WIDTH}
                    tick={(props) => <PartnerTick {...props} />}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--muted)' }}
                    content={({ active, payload }) => {
                      const row = payload?.[0]?.payload as PartnerRow | undefined
                      if (!active || !row) return null
                      return (
                        <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                          <p className="font-medium">{row.name}</p>
                          <p className="text-muted-foreground">{formatNumber(row.total)} unit aktif</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="total" fill="var(--series-1)" radius={[0, 4, 4, 0]} barSize={CHART.BAR_SIZE}>
                    <LabelList
                      dataKey="total"
                      position="right"
                      fontSize={CHART.FONT_SIZE}
                      fill="var(--foreground)"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <table className="sr-only">
              <caption>Unit aktif per mitra</caption>
              <thead>
                <tr>
                  <th scope="col">Mitra</th>
                  <th scope="col">Unit aktif</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  )
}
