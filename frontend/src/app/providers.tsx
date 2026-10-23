import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TOAST_POSITION } from '@/config/constants'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { queryClient } from '@/lib/query-client'

/** Semua provider global dikumpulkan di sini supaya main.tsx tetap bersih. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* AuthProvider di dalam QueryClientProvider: saat logout, cache query dikosongkan */}
      <AuthProvider>
        <TooltipProvider>
          {children}
          <Toaster position={TOAST_POSITION} richColors closeButton />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
