export default function formatDate(date: Date): string {
  // 检查日期是否有效
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
    console.warn('Invalid date provided to formatDate:', date)
    return '日期无效'
  }

  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return '日期无效'
  }
}
