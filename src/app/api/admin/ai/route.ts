import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ChatOpenAI } from '@langchain/openai'
import { runSuggestTagsAgent } from '@/lib/ai/agent'

// POST /api/admin/ai - Endpoint para operações de Inteligência Artificial no Admin
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Verificar autenticação do usuário
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 2. Verificar chave de API da OpenAI
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Chave de API da OpenAI (OPENAI_API_KEY) não configurada no arquivo .env.local' 
      }, { status: 500 })
    }

    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json({ error: 'Ação não informada' }, { status: 400 })
    }

    // Inicializar o modelo GPT da OpenAI usando LangChain
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      apiKey,
      temperature: 0.1,
    })

    // 3. Executar a ação correspondente
    if (action === 'translate') {
      const { text, targetLanguage = 'en' } = body
      if (!text) {
        return NextResponse.json({ error: 'Texto não informado para tradução' }, { status: 400 })
      }

      const prompt = `Traduza o seguinte texto de forma natural, profissional e fluida para o idioma ${
        targetLanguage === 'en' ? 'Inglês (Estados Unidos)' : 'Português (Brasil)'
      }. Mantenha qualquer marcação de formatação Markdown ou HTML intacta. 
Retorne APENAS a tradução resultante direta, sem introduções, sem aspas adicionais nas pontas e sem explicações.

Texto a ser traduzido:
${text}`

      const result = await model.invoke(prompt)
      const translatedText = result.content.toString().trim()

      return NextResponse.json({ data: translatedText })
    }

    if (action === 'generate_seo') {
      const { title, description } = body
      if (!title || !description) {
        return NextResponse.json({ error: 'Título e descrição são obrigatórios para gerar SEO' }, { status: 400 })
      }

      const prompt = `Com base no título e na descrição de um projeto/artigo fornecidos abaixo, gere metadados para SEO.
Você DEVE responder estritamente com um objeto JSON válido. Não inclua blocos de código Markdown (como \`\`\`json ... \`\`\`), não adicione nenhuma explicação. A resposta deve conter exatamente esta estrutura:
{
  "short_description": "descrição resumida e chamativa de até 150 caracteres para exibição em cards",
  "meta_description": "meta descrição focada em SEO com no máximo 160 caracteres contendo palavras-chave",
  "meta_keywords": ["array", "de", "palavras", "chave", "relevantes", "ate 8 itens"]
}

Informações do projeto:
Título: ${title}
Descrição: ${description}

Retorne apenas o JSON:`

      const result = await model.invoke(prompt)
      const rawText = result.content.toString().trim()
      
      // Limpar possíveis formatações de bloco de código do modelo
      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```$/, '').trim()

      try {
        const seoData = JSON.parse(cleanJson)
        return NextResponse.json({ data: seoData })
      } catch (parseError) {
        console.error('Erro ao analisar JSON retornado pela OpenAI:', rawText, parseError)
        return NextResponse.json({ 
          error: 'Falha ao processar o formato da resposta gerada pela IA. Tente novamente.',
          raw: rawText
        }, { status: 500 })
      }
    }

    if (action === 'suggest_tags') {
      const { title, description } = body
      if (!title || !description) {
        return NextResponse.json({ error: 'Título e descrição são obrigatórios para sugestão de tecnologias/tags' }, { status: 400 })
      }

      try {
        const agentResult = await runSuggestTagsAgent(supabase, title, description)
        return NextResponse.json({ data: agentResult })
      } catch (agentError) {
        console.error('Erro no agente LangChain ao sugerir e criar tags:', agentError)
        return NextResponse.json({ 
          error: agentError instanceof Error ? agentError.message : 'Falha ao processar sugestão do agente de IA' 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Ação não suportada' }, { status: 400 })
  } catch (error) {
    console.error('Erro no processamento da rota de IA:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
