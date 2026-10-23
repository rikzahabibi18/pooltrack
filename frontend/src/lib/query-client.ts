import { QueryClient } from '@tanstack/react-query'
import { QUERY_DEFAULTS } from '@/config/constants'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_DEFAULTS.STALE_TIME_MS,
      retry: QUERY_DEFAULTS.RETRY,
      refetchOnWindowFocus: false,
    },
  },
})
