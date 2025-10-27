export async function getServerSideProps({ res }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airporttransfers.ai";

  const apiRes = await fetch(`${baseUrl}/api/sitemap`);
  const sitemap = await apiRes.text();

  res.setHeader("Content-Type", "application/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
