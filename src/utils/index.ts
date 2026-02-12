export function getHeadingInView(headingElements: Element[]): string | null {
  const headingPositions = headingElements.map((heading) => ({
    id: heading.id,
    top: heading.getBoundingClientRect().top,
  }))

  if (headingPositions.length === 0) {
    return null
  }

  let activeHeadingId = headingPositions[0].id

  for (const heading of headingPositions) {
    if (heading.top <= 100) {
      activeHeadingId = heading.id
      continue
    }
    break
  }

  return activeHeadingId
}
