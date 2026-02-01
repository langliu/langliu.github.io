export default function removeTrailingSlash(pathname: string) {
  // 更简单的逻辑：匹配以斜杠结尾的任意字符串（根路径除外）
  if (pathname.endsWith('/') && pathname.length > 1) {
    return pathname.slice(0, -1)
  }
  return pathname
}
