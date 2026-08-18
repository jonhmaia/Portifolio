'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

function createLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t('emailInvalid')),
    password: z.string().min(6, t('passwordMin')),
  })
}

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin'
  const locale = useLocale()
  const t = useTranslations('auth.loginForm')
  const tVal = useTranslations('validation.login')
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const supabase = createClient()
  const loginSchema = useMemo(() => createLoginSchema(tVal), [locale, tVal])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (error.message === 'Invalid login credentials') {
          toast.error(t('errors.invalidCredentials'))
        } else {
          toast.error(error.message)
        }
        return
      }

      toast.success(t('success'))
      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      console.error('Login error:', error)
      toast.error(t('errors.generic'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="jm-admin-login__card">
      <CardHeader className="space-y-1 pb-4" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                className="pl-10"
                disabled={isLoading}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">{t('passwordLabel')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                className="pl-10 pr-10"
                disabled={isLoading}
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? t('hidePassword') : t('showPassword')}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('loading')}
              </>
            ) : (
              t('submit')
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
