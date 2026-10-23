import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiResponse } from '@/lib/http'
import { getErrorMessage } from '@/lib/form'

type Options<TVariables, TData> = {
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>
  /** Query yang harus dimuat ulang setelah berhasil, mis. [['partners']]. */
  invalidateKeys: QueryKey[]
}

/**
 * Mutation standar: toast sukses/gagal memakai pesan dari backend,
 * lalu data terkait di-refresh otomatis.
 */
export function useApiMutation<TVariables, TData>({ mutationFn, invalidateKeys }: Options<TVariables, TData>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: async (response) => {
      toast.success(response.message)
      await Promise.all(invalidateKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
