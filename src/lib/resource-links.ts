export type ResourceLink = { label: string; href: string };

/**
 * Builds real, safe lookup links for a topic. We never invent article URLs —
 * these point at each site's own search for the topic.
 */
export function resourceLinks(topic: string, context?: string | null): ResourceLink[] {
  const term = [topic, context].filter(Boolean).join(" ").trim();
  const q = encodeURIComponent(term || "study notes");
  return [
    { label: "Wikipedia", href: `https://en.wikipedia.org/w/index.php?search=${q}` },
    { label: "YouTube", href: `https://www.youtube.com/results?search_query=${q}+explained` },
    { label: "Courses", href: `https://www.coursera.org/search?query=${q}` },
    { label: "Free course", href: `https://www.khanacademy.org/search?page_search_query=${q}` },
    { label: "Web", href: `https://www.google.com/search?q=${q}` },
  ];
}
