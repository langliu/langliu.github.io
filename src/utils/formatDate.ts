export default function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }).format(date)
}
