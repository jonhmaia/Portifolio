import { Code2 } from 'lucide-react'
import styles from './home-experience.module.css'

type SkillIconSource = {
  icon_type?: 'url' | 'embed' | 'upload' | null
  icon_value?: string | null
  name: string
}

const SIMPLE_ICONS: Record<string, { slug: string; color: string }> = {
  python: { slug: 'python', color: '3776AB' },
  javascript: { slug: 'javascript', color: 'F7DF1E' },
  django: { slug: 'django', color: '44B78B' },
  nodejs: { slug: 'nodedotjs', color: '339933' },
  html5: { slug: 'html5', color: 'E34F26' },
  css3: { slug: 'css', color: '1572B6' },
  postgresql: { slug: 'postgresql', color: '4169E1' },
  docker: { slug: 'docker', color: '2496ED' },
  n8n: { slug: 'n8n', color: 'EA4B71' },
  bubbleio: { slug: 'bubble', color: '1364FA' },
  bubble: { slug: 'bubble', color: '1364FA' },
  supabase: { slug: 'supabase', color: '3FCF8E' },
  c: { slug: 'c', color: 'A8B9CC' },
  cc: { slug: 'cplusplus', color: '00599C' },
  cplusplus: { slug: 'cplusplus', color: '00599C' },
  sql: { slug: 'postgresql', color: '4169E1' },
  github: { slug: 'github', color: 'EFEFEF' },
  git: { slug: 'git', color: 'F05032' },
  flutter: { slug: 'flutter', color: '02569B' },
  bootstrap: { slug: 'bootstrap', color: '7952B3' },
}

function normalizeSkillName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function getSimpleIcon(name: string) {
  const key = normalizeSkillName(name)
  if (SIMPLE_ICONS[key]) return SIMPLE_ICONS[key]
  if (key.includes('cplusplus') || key === 'cc++' || key === 'cpp') return SIMPLE_ICONS.cplusplus
  if (key.includes('node')) return SIMPLE_ICONS.nodejs
  if (key.includes('postgres')) return SIMPLE_ICONS.postgresql
  if (key.includes('html')) return SIMPLE_ICONS.html5
  if (key.includes('css')) return SIMPLE_ICONS.css3
  if (key.includes('n8n')) return SIMPLE_ICONS.n8n
  if (key.includes('bubble')) return SIMPLE_ICONS.bubble
  return null
}

export function SkillIcon({ name, icon_type, icon_value }: SkillIconSource) {
  if (icon_type === 'embed' && icon_value) {
    return (
      <span
        className={styles.stackIcon}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: icon_value }}
      />
    )
  }

  if ((icon_type === 'url' || icon_type === 'upload') && icon_value) {
    return (
      <img
        src={icon_value}
        alt=""
        className={styles.stackIconImage}
        width={18}
        height={18}
      />
    )
  }

  const icon = getSimpleIcon(name)
  if (icon) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${icon.slug}/${icon.color}`}
        alt=""
        className={styles.stackIconImage}
        width={18}
        height={18}
      />
    )
  }

  return <Code2 className={styles.stackIconImage} size={16} aria-hidden="true" />
}
