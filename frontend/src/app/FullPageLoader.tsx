import { Loader2Icon } from 'lucide-react'

/** Ditampilkan sebentar saat aplikasi memeriksa token login yang tersimpan. */
export function FullPageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
      <Loader2Icon className="size-4 animate-spin" aria-hidden />
      Memeriksa sesi…
    </div>
  )
}
