const CN_CHARS_PER_MINUTE = 300
const EN_WORDS_PER_MINUTE = 200

/** 估算阅读时长（分钟），中文按字、英文按词，最少 1 分钟 */
export default function getReadingTimeMinutes(content: string | undefined): number {
  if (!content) {
    return 1
  }

  const cleaned = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*\|.*$/gm, ' ')
    .replace(/[#>*_~|=-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) {
    return 1
  }

  const chineseChars = cleaned.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g)?.length ?? 0
  const englishWords =
    cleaned
      .replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ')
      .match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*/g)?.length ?? 0

  const minutes = Math.ceil(chineseChars / CN_CHARS_PER_MINUTE + englishWords / EN_WORDS_PER_MINUTE)

  return Math.max(1, minutes)
}
