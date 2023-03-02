import { DATE_FORMATTER } from '~/config.mjs'

const formatter =
  DATE_FORMATTER ||
  new Intl.DateTimeFormat('zh-Hans-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

/* eslint-disable no-mixed-spaces-and-tabs */
export const getFormattedDate = (date: Date) => (date ? formatter.format(date) : '')

export const trim = (str = '', ch?: string) => {
  let start = 0,
    end = str.length || 0
  while (start < end && str[start] === ch) ++start
  while (end > start && str[end - 1] === ch) --end
  return start > 0 || end < str.length ? str.substring(start, end) : str
}
