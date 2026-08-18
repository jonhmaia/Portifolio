import { cn } from '@/lib/utils'

interface AdminPageHeaderProps {
  index?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function AdminPageHeader({
  index,
  title,
  description,
  action,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn('jm-admin__page-header', className)}>
      <div>
        {index ? <p className="jm-admin__page-kicker">{index}</p> : null}
        <h1 className="jm-admin__page-title">{title}</h1>
        {description ? <p className="jm-admin__page-desc">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
