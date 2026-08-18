'use client'

import { User } from '@supabase/supabase-js'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/navigation'

interface AdminHeaderProps {
  user: User
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('admin.header')

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error(t('signOutError'))
      return
    }

    toast.success(t('signOutSuccess'))
    router.push('/auth/login')
    router.refresh()
  }

  const initials =
    user.email?.split('@')[0].slice(0, 2).toUpperCase() || 'AD'

  return (
    <header className="jm-admin__header">
      <div className="jm-admin__header-inner">
        <div className="flex items-center gap-4 lg:ml-0 ml-14">
          <h2 className="jm-admin__header-title">{t('title')}</h2>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-none p-0">
                <Avatar className="h-9 w-9 rounded-none">
                  <AvatarImage
                    src={user.user_metadata?.avatar_url}
                    alt={user.email || ''}
                  />
                  <AvatarFallback className="rounded-none font-mono text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-none">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user.user_metadata?.full_name || 'Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
