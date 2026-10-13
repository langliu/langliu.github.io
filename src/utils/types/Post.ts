import type { ContentSeo, PortableTextBlock } from 'emdash'

export type PostCategory = {
  label: string
  slug: string
}

export type PostEntry = {
  id: string
  body: string
  readingText: string
  data: {
    title: string
    description: string
    slug: string
    publishedAt: Date
    hasPublicationDate: boolean
    updatedAt: Date
    category: PostCategory
    tags: string[]
    cover?: string
    seo?: ContentSeo
    content: PortableTextBlock[]
  }
}

export type PostBlockProps = { node: PortableTextBlock }
export type PostCodeProps = { node: { code?: string; language?: string } }
export type PostContentProps = { value: PortableTextBlock[] }
export type PostListNode = PortableTextBlock & {
  _type: 'postList'
  listItem: 'number' | 'bullet'
  start: number
  items: { _key: string; content: PortableTextBlock[] }[]
}
export type PostListProps = { node: PostListNode }
