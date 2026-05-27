'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ViewCounterProps {
  id: number | string
  type: 'project' | 'article'
}

export function ViewCounter({ id, type }: ViewCounterProps) {
  const incremented = useRef(false)

  useEffect(() => {
    // Only increment once per component mount (strict mode safety)
    if (incremented.current) return
    incremented.current = true

    const supabase = createClient()
    
    const increment = async () => {
      try {
        const rpcName = type === 'project' ? 'increment_project_views' : 'increment_article_views'
        const argName = type === 'project' ? 'project_id' : 'article_id'
        
        await (supabase.rpc as any)(rpcName, { [argName]: id })
      } catch (err) {
        console.error(`Failed to increment ${type} views:`, err)
      }
    }

    increment()
  }, [id, type])

  return null
}
