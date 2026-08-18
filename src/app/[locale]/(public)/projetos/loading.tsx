import editorial from '@/components/blog/editorial.module.css'
import { GallerySkeleton } from '@/components/portfolio/gallery-skeleton'

export default function Loading() {
  return (
    <main className={editorial.blogPage}>
      <div className={editorial.shell}>
        <GallerySkeleton />
      </div>
    </main>
  )
}
