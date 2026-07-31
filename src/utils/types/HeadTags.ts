export type HeadTags = {
  title?: string
  description?: string
  noindex?: boolean
  og?: {
    title?: string
    type?: string
    description?: string
    image?: string
    alt?: string
  }
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
}
