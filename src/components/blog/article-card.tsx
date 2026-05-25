import { Link } from '@/navigation'
import Image from 'next/image'
import { Calendar, Clock, Eye } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ArticleWithRelations } from '@/lib/types/database'

interface ArticleCardProps {
  article: ArticleWithRelations
}

export function ArticleCard({ article }: ArticleCardProps) {
  const authorInitials = article.author?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AU'

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border border-border/50 bg-black/5 dark:bg-black/40 backdrop-blur-md h-full flex flex-col rounded-2xl hover:bg-black/10 dark:hover:bg-black/60">
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {article.cover_image_url ? (
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground bg-gradient-to-br from-primary/10 to-accent/10">
            <span className="text-4xl font-bold opacity-30">
              {article.title.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Category Badge */}
        {article.category && (
          <Badge 
            className="absolute top-3 left-3"
            style={{
              backgroundColor: `${article.category.color_hex}`,
              color: '#fff',
            }}
          >
            {article.category.name}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <Link href={`/blog/${article.slug}` as any}>
          <h3 className="text-xl font-bold text-foreground hover:text-primary dark:hover:text-[#00ffcc] transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="flex-1">
        {article.summary && (
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 font-light">
            {article.summary}
          </p>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs bg-secondary/80 hover:bg-secondary text-secondary-foreground border-none"
              >
                {tag.name}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-secondary/80 text-secondary-foreground border-none">
                +{article.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between gap-4 text-sm text-muted-foreground font-light">
        {/* Author */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={article.author?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
          </Avatar>
          <span className="truncate max-w-[100px]">
            {article.author?.full_name || 'Autor'}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3">
          {article.reading_time_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{article.reading_time_minutes} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{article.views_count}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
