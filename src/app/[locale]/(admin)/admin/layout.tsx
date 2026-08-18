import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="jm-admin flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <AdminHeader user={user} />
        <main className="jm-admin__main">{children}</main>
      </div>
    </div>
  )
}
