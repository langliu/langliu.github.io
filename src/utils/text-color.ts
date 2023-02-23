export function textColor(text: string) {
  let str = 0
  Array.from(text).forEach((item) => {
    const code = item.charCodeAt(0)
    str += code
  })
  const color = parseInt(str.toString(), 16)

  return `#${Array.from(color.toString()).slice(0, 6).join('')}`
}
