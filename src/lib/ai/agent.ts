import { ChatOpenAI } from '@langchain/openai'
import { tool } from '@langchain/core/tools'
import { SystemMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'
import { z } from 'zod'
import { slugify } from '@/lib/utils/slugify'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Technology, Tag } from '@/lib/types/database'

export function createAgentTools(supabase: SupabaseClient) {
  const createTechnologyTool = tool(
    async ({ name, category, colorHex }) => {
      try {
        const slug = slugify(name)

        // Verifica se a tecnologia com o mesmo slug já existe
        const { data: existing } = await supabase
          .from('technologies')
          .select('id, name')
          .eq('slug', slug)
          .maybeSingle()

        if (existing) {
          return JSON.stringify({
            status: 'already_exists',
            message: `A tecnologia '${existing.name}' já existe com ID ${existing.id}`,
            id: existing.id,
          })
        }

        const { data: newTech, error } = await supabase
          .from('technologies')
          .insert({
            name,
            slug,
            color_hex: colorHex || '#4f46e5',
            category: category || 'other',
            is_active: true,
          })
          .select()
          .single()

        if (error) {
          throw new Error(error.message)
        }

        return JSON.stringify({
          status: 'created',
          message: `Tecnologia '${name}' criada com sucesso`,
          data: newTech,
        })
      } catch (err: any) {
        return JSON.stringify({ status: 'error', message: err.message })
      }
    },
    {
      name: 'create_technology',
      description: 'Cria uma nova tecnologia (ex: TypeScript, React, PostgreSQL) no banco de dados.',
      schema: z.object({
        name: z.string().describe('Nome limpo da tecnologia, ex: Solidity ou Next.js'),
        category: z.enum(['language', 'framework', 'lib', 'db', 'tool', 'other']).describe('Categoria da tecnologia'),
        colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).describe('Código de cor hexadecimal elegante e vibrante que combine com a marca da tecnologia (ex: #61dafb para React). Evite preto ou branco genérico.'),
      }),
    }
  )

  const createTagTool = tool(
    async ({ namePt, nameEn, colorHex }) => {
      try {
        const slug = slugify(namePt)

        // Verifica se a tag com o mesmo slug já existe
        const { data: existing } = await supabase
          .from('tags')
          .select('id, name')
          .eq('slug', slug)
          .maybeSingle()

        if (existing) {
          return JSON.stringify({
            status: 'already_exists',
            message: `A tag '${existing.name}' já existe com ID ${existing.id}`,
            id: existing.id,
          })
        }

        // Insere a tag base com o nome em português
        const { data: newTag, error } = await supabase
          .from('tags')
          .insert({
            name: namePt,
            slug,
            color_hex: colorHex || '#10b981',
          })
          .select()
          .single()

        if (error) {
          throw new Error(error.message)
        }

        const tagId = (newTag as any).id

        // Insere traduções
        await supabase.from('tag_translations').insert({
          tag_id: tagId,
          language: 'pt-BR',
          name: namePt,
        })

        if (nameEn) {
          await supabase.from('tag_translations').insert({
            tag_id: tagId,
            language: 'en',
            name: nameEn,
          })
        }

        return JSON.stringify({
          status: 'created',
          message: `Tag '${namePt}' criada com sucesso`,
          data: newTag,
        })
      } catch (err: any) {
        return JSON.stringify({ status: 'error', message: err.message })
      }
    },
    {
      name: 'create_tag',
      description: 'Cria uma nova tag de assunto ou taxonomia (ex: Web3, E-commerce, UX/UI) no banco de dados.',
      schema: z.object({
        namePt: z.string().describe('Nome da tag em português, ex: Inteligência Artificial ou Segurança'),
        nameEn: z.string().describe('Nome da tag traduzido para inglês, ex: Artificial Intelligence ou Security'),
        colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).describe('Código de cor hexadecimal personalizado para o tema da tag (ex: #10b981)'),
      }),
    }
  )

  return [createTechnologyTool, createTagTool]
}

interface AgentResult {
  technology_ids: number[]
  tag_ids: number[]
  new_technologies: Technology[]
  new_tags: Tag[]
}

export async function runSuggestTagsAgent(
  supabase: SupabaseClient,
  title: string,
  description: string
): Promise<AgentResult> {
  // 1. Busca os registros existentes no banco de dados para a IA comparar e evitar duplicados
  const [{ data: dbTechs }, { data: dbTags }] = await Promise.all([
    supabase.from('technologies').select('*').eq('is_active', true),
    supabase.from('tags').select('*'),
  ])

  const techList = (dbTechs || []).map((t) => `${t.id}: ${t.name} (slug: ${t.slug})`).join('\n')
  const tagList = (dbTags || []).map((t) => `${t.id}: ${t.name} (slug: ${t.slug})`).join('\n')

  // 2. Inicializa o modelo GPT usando o LangChain OpenAI
  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.1,
  })

  const tools = createAgentTools(supabase)
  const modelWithTools = model.bindTools(tools)

  // Rastreia itens criados durante a execução
  const newlyCreatedTechs: Technology[] = []
  const newlyCreatedTags: Tag[] = []

  // Encapsula a invocação das ferramentas para coletar dados criados
  const wrappedTools = tools.map((originalTool) => {
    return {
      name: originalTool.name,
      description: originalTool.description,
      schema: originalTool.schema,
      invoke: async (args: any) => {
        const rawRes = await (originalTool as any).invoke(args)
        try {
          const resObj = JSON.parse(rawRes)
          if (resObj.status === 'created') {
            if (originalTool.name === 'create_technology') {
              newlyCreatedTechs.push(resObj.data)
            } else if (originalTool.name === 'create_tag') {
              newlyCreatedTags.push(resObj.data)
            }
          } else if (resObj.status === 'already_exists') {
            // Se já foi cadastrada anteriormente no banco durante uma chamada concorrente
            // ou se o slug bate
            // Adiciona como selecionado
          }
        } catch (e) {
          console.error('Erro ao analisar resultado da ferramenta:', e)
        }
        return rawRes
      },
    }
  })

  // Prompt do Sistema detalhando persona e regras
  const systemPrompt = `Você é um agente especialista em taxonomia de portfólio.
Sua tarefa é analisar o título e a descrição de um projeto e retornar quais tecnologias e tags correspondem a ele.

Regras importantes:
1. Veja as listas de tecnologias e tags cadastradas abaixo. Se alguma tecnologia ou tag adequada já existir nas listas, você DEVE usar o ID dela! Não crie duplicatas.
2. Se o projeto utiliza tecnologias ou tags relevantes que NÃO estão cadastradas de forma alguma na lista, você DEVE usar as ferramentas 'create_technology' ou 'create_tag' para criá-las imediatamente.
3. Após executar as ferramentas para criar as tecnologias/tags em falta, você deve usar os IDs dessas tecnologias/tags recém-criadas na sua resposta final.
4. No final de todo o processo de chamadas de ferramentas, você deve fornecer o resultado final estritamente no seguinte formato JSON. Não inclua blocos de código markdown nem explicações adicionais, retorne APENAS o JSON no seguinte formato:
{
  "technology_ids": [lista final de ids de tecnologias selecionadas],
  "tag_ids": [lista final de ids de tags selecionadas]
}

Tecnologias Cadastradas Disponíveis (ID: Nome (slug)):
${techList || 'Nenhuma tecnologia cadastrada ainda.'}

Tags Cadastradas Disponíveis (ID: Nome (slug)):
${tagList || 'Nenhuma tag cadastrada ainda.'}
`

  const messages: any[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage(`Título do Projeto: ${title}\nDescrição do Projeto: ${description}`),
  ]

  let response = await modelWithTools.invoke(messages)

  let iterations = 0
  // Permite até 10 voltas de chamadas de ferramentas
  while (response.tool_calls && response.tool_calls.length > 0 && iterations < 10) {
    iterations++
    messages.push(response)

    for (const toolCall of response.tool_calls) {
      const selectedTool = wrappedTools.find((t) => t.name === toolCall.name)
      if (selectedTool) {
        const result = await selectedTool.invoke(toolCall.args)
        messages.push(
          new ToolMessage({
            content: result,
            tool_call_id: toolCall.id || '',
          })
        )
      }
    }

    response = await modelWithTools.invoke(messages)
  }

  const content = response.content.toString().trim()
  const cleanJson = content.replace(/^```json\s*/i, '').replace(/```$/, '').trim()

  try {
    const finalData = JSON.parse(cleanJson)
    return {
      technology_ids: finalData.technology_ids || [],
      tag_ids: finalData.tag_ids || [],
      new_technologies: newlyCreatedTechs,
      new_tags: newlyCreatedTags,
    }
  } catch (error) {
    console.error('Falha ao processar o JSON final do agente de IA:', content, error)
    // Fallback retornando o que conseguimos criar
    return {
      technology_ids: [],
      tag_ids: [],
      new_technologies: newlyCreatedTechs,
      new_tags: newlyCreatedTags,
    }
  }
}
