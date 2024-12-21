export function getHeadingInView(headingElements: Element[]): string | null {
  const headingPositions = headingElements.map(heading => ({
    id: heading.id,
    top: heading.getBoundingClientRect().top
  }));

  // Find the first heading that's either at the top or just above the viewport
  const activeHeading = headingPositions.find((heading, index) => {
    const nextHeading = headingPositions[index + 1];
    if (!nextHeading) return false;

    return (heading.top <= 100 && nextHeading.top > 100);
  });

  return activeHeading?.id || null;
}