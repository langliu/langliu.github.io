import type { ContentSeo, PortableTextBlock } from 'emdash'
import type { Block } from 'emdash/ui'

export type PostCategory = {
  label: string
  slug: string
}

export type PostEntry = {
  id: string
  body: string
  readingText: string
  data: {
    id: string
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

// 渲染器传入的 block 节点与 emdash/ui 的 Block 类型保持一致（_key 可选）
export type PostBlockProps = { node: Block }
// headingId 为 emdash 渲染时注入的标题锚点，类型声明中不存在
export type PostHeadingBlock = Block & { headingId?: string }
export type PostCommentsProps = { contentId: string; publishedAt: Date }
export type PostCodeProps = { node: { code?: string; language?: string } }
export type PostContentProps = { value: PortableTextBlock[] }
export type PostListNode = PortableTextBlock & {
  _type: 'postList'
  listItem: 'number' | 'bullet'
  start: number
  items: { _key: string; content: PortableTextBlock[] }[]
}
export type PostListProps = { node: PostListNode }
