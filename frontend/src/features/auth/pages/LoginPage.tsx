import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { TextField } from '@/components/form/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { AUTH_ROUTES } from '@/config/navigation'
import { applyServerErrors, getErrorMessage } from '@/lib/form'
import { ApiError } from '@/lib/http'
import { useAuth } from '../auth-context'
import { FormAlert } from '../components/FormAlert'
import { loginFormSchema, type LoginFormValues } from '../schema'

export function LoginPage() {
  const auth = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })
  const { errors, isSubmitting } = form.formState

  // Setelah login berhasil, <GuestOnly> otomatis memindahkan pengguna ke halaman tujuan
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await auth.login(values)
    } catch (error) {
      applyServerErrors(error, form.setError)
      const hasFieldErrors = error instanceof ApiError && error.errors.length > 0
      if (!hasFieldErrors) form.setError('root', { message: getErrorMessage(error) })
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Masuk</CardTitle>
        <CardDescription>Gunakan email dan password akun Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <FormAlert message={errors.root?.message} />
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
              autoComplete="current-password"
              {...form.register('password')}
              error={errors.password?.message}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Masuk
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link to={AUTH_ROUTES.register} className="font-medium text-foreground underline-offset-4 hover:underline">
                Daftar
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
