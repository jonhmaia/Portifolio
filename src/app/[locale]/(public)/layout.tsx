import { Header, Footer } from '@/components/layout'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div id="top" className="relative flex min-h-screen flex-col overflow-hidden bg-[#090a09]">
      <Header />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </div>
  )
}
