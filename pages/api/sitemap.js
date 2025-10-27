import { apiRequest } from "@/lib/clientApi";

const slugify = (text) =>
  text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");

export default async function handler(req, res) {
  try {
    const productsResponse = await apiRequest({
      endpoint: "getcitiespax/1/2",
      method: "GET",
    });

    const products = productsResponse?.data?.products || [];
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airporttransfers.ai";

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    sitemap += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    products.forEach((product) => {
      if (product.title && product.id) {
        const productSlug = slugify(product.title);
        sitemap += `  <url>\n    <loc>${baseUrl}/day-tours/${productSlug}/${product.id}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      }
    });

    sitemap += `</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
}
