import { getCollection } from 'astro:content';

function escapeXml(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

export async function GET(context) {
	const site = context.site?.toString().replace(/\/$/, '') ?? '';
	const posts = (await getCollection('blog')).sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf()
	);

	const items = posts
		.map((post) => {
			const url = `${site}/blog/${post.id}/`;
			return `
    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <description>${escapeXml(post.data.description)}</description>
    </item>`;
		})
		.join('');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>mattm.dev</title>
    <link>${site}/</link>
    <description>Notes on networking and security.</description>${items}
  </channel>
</rss>`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
}
