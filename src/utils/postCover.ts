import { z } from 'astro/zod'

// 官方接口移除本地媒体的 src；封面同时兼容旧导入值和媒体引用。
export const postCoverSchema = z
  .union([
    z.object({ src: z.string() }),
    z
      .object({
        id: z.string().min(1),
        provider: z.literal('local'),
        meta: z.object({ storageKey: z.string().min(1).optional() }).optional(),
      })
      .transform((cover) => ({
        src: `/_emdash/api/media/file/${cover.meta?.storageKey ?? cover.id}`,
      })),
  ])
  .nullish()
