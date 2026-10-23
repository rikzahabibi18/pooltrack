import { RefreshCwIcon, TriangleAlertIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/form'
import { EmptyState } from './EmptyState'

type ErrorStateProps = {
  error: unknown
  onRetry?: () => void
}

/** Tampilan saat data gagal dimuat (mis. backend mati), lengkap dengan tombol coba lagi. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      icon={TriangleAlertIcon}
      title="Gagal memuat data"
      description={getErrorMessage(error)}
      action={
        onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCwIcon />
            Coba lagi
          </Button>
        )
      }
    />
  )
}
