export const BRAND_COLOR_HEX = '#4da3ff'

export const projectStatusClass: Record<string, string> = {
  dev: 'jm-admin__status jm-admin__status--signal',
  concluido: 'jm-admin__status jm-admin__status--paper',
  pausado: 'jm-admin__status jm-admin__status--muted',
  arquivado: 'jm-admin__status jm-admin__status--muted',
}

export const articleStatusClass: Record<string, string> = {
  draft: 'jm-admin__status jm-admin__status--muted',
  published: 'jm-admin__status jm-admin__status--signal',
}

export function getProjectStatusClass(status: string) {
  return projectStatusClass[status] ?? 'jm-admin__status jm-admin__status--muted'
}

export function getArticleStatusClass(status: string) {
  return articleStatusClass[status] ?? 'jm-admin__status jm-admin__status--muted'
}
