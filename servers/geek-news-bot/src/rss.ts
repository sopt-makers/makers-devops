import Parser from "rss-parser";

export interface GeekNewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
}
const parser = new Parser();

const GEEK_NEWS_RSS_URL = "https://news.hada.io/rss/news";

export const fetchGeekNews = async (): Promise<GeekNewsItem[]> => {
  const feed = await parser.parseURL(GEEK_NEWS_RSS_URL);

  return feed.items.map(
    (item): GeekNewsItem => ({
      id: item.guid ?? "",
      title: item.title ?? "",
      link: item.link ?? "",
      pubDate: item.pubDate ?? "",
      content: item.content ?? "",
    }),
  );
};
