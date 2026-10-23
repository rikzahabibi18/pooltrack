import { CompassIcon } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NAV_ITEMS } from '@/config/navigation'

export function NotFoundPage() {
  return (
    <Card>
      <CardContent>
        <EmptyState
          icon={CompassIcon}
          title="Halaman tidak ditemukan"
          description="Halaman yang Anda cari tidak tersedia atau sudah dipindahkan."
          action={
            <Button asChild>
              <Link to={NAV_ITEMS.dashboard.path}>Kembali ke {NAV_ITEMS.dashboard.title}</Link>
            </Button>
          }
        />
      </CardContent>
    </Card>
  )
}
