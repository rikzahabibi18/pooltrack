import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { TextField } from '@/components/form/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { PASSWORD_RULES } from '@/config/constants'
import { AUTH_ROUTES } from '@/config/navigation'
import { ApiError } from '@/lib/http'
import { applyServerErrors, getErrorMessage } from '@/lib/form'
import { useAuth } from '../auth-context'
import { FormAlert } from '../components/FormAlert'
import { registerFormSchema, type RegisterFormValues } from '../schema'

export function RegisterPage() {
  const auth = useAuth()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', email: '', password: '', confirm_password: '' },
  })
  const { errors, isSubmitting } = form.formState

  // Setelah register, backend langsung memberi token → pengguna otomatis masuk,
  // lalu <GuestOnly> memindahkannya ke dashboard
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await auth.register(values)
    } catch (error) {
      applyServerErrors(error, form.setError)
      // Kalau error sudah tampil di field (mis. email terdaftar), tidak perlu pesan umum lagi
      const hasFieldErrors = error instanceof ApiError && error.errors.length > 0
      if (!hasFieldErrors) form.setError('root', { message: getErrorMessage(error) })
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Daftar akun</CardTitle>
        <CardDescription>Buat akun untuk mengakses dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <FormAlert message={errors.root?.message} />
            <TextField
              label="Nama"
              autoComplete="name"
              placeholder="Nama lengkap"
              {...form.register('name')}
              error={errors.name?.message}
            />
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="nama@perusahaan.co.id"
              {...form.register('email')}
              error={errors.email?.message}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="new-password"
              description={`Minimal ${PASSWORD_RULES.MIN_LENGTH} karakter.`}
              {...form.register('password')}
              error={errors.password?.message}
            />
            <TextField
              label="Ulangi password"
              type="password"
              autoComplete="new-password"
              {...form.register('confirm_password')}
              error={errors.confirm_password?.message}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Daftar
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link to={AUTH_ROUTES.login} className="font-medium text-foreground underline-offset-4 hover:underline">
                Masuk
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
