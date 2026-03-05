import { useQuery } from "@tanstack/react-query";
import { BlogData } from "../types";

async function fetchBlogPosts(): Promise<BlogData[]> {
  const res = await fetch("https://handeyeco.github.io/personal-blog/feed.xml");
  const xmlText = await res.text();

  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");

  const entries = Array.from(xml.getElementsByTagName("entry"));

  return entries
    .filter((entry) => {
      const title = entry.getElementsByTagName("title")[0]?.textContent ?? "";

      // #HACK: will break if I start using a different name for blog posts
      return title.toLowerCase().includes("bandcamp friday");
    })
    .map((entry) => {
      const title = entry.getElementsByTagName("title")[0]?.textContent ?? "";

      const url =
        entry.getElementsByTagName("link")[0]?.getAttribute("href") ?? "";

      return { title, url };
    });
}

export default function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchBlogPosts,
  });
}
