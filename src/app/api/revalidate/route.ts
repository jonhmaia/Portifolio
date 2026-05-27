import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// POST /api/revalidate - Triggers cache revalidation for a specific tag (Authenticated only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin/user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')

    if (!tag) {
      return NextResponse.json({ error: 'Tag parameter is required' }, { status: 400 })
    }

    revalidateTag(tag, 'default')
    console.log(`[Cache Revalidation] Instantly revalidated tag: "${tag}"`)

    return NextResponse.json({ revalidated: true, tag, now: Date.now() })
  } catch (error: any) {
    console.error('Error in revalidation route:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// GET /api/revalidate - Standard route fallback for simple triggers
export async function GET(request: NextRequest) {
  return POST(request)
}
