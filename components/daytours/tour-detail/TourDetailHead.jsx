import Head from "next/head";

const TourDetailHead = ({ basicInfo = {}, productname = "", productid = "" }) => {
  const { product_description = {}, images = [] } = basicInfo;

const highlightsRaw = Array.isArray(basicInfo.product_content_highlights)
  ? basicInfo.product_content_highlights.map(item => item.name).join(", ")
  : "";
const highlightsKeywords = highlightsRaw
  .replace(/<\/?[^>]+(>|$)/g, "") // remove HTML tags if any
  .split(/[.,•\n]/) // split on dots, bullets, newlines
  .map(item => item.trim())
  .filter(Boolean)
  .join(", ");


  const formattedTitle = productname
    ? `${productname.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | Explore Singapore`
    : "Explore Singapore Tours";
  const shortDescription = product_description.short_desc?.trim() || 
    `Explore details about ${formattedTitle}. Book your adventure today!`;
  const imageUrl = images[0]?.image
    ? `https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1746530123/${images[0].image}`
    : "https://www.exploresingapore.ai/default-tour-image.jpg";
      const price = basicInfo.starting_price || "0.00";
  const currency = basicInfo.currency || "SGD";

  const pageUrl = `https://www.exploresingapore.ai/day-tours/${productname}/${productid}`;

  return (
    <Head>
      <title key="title">{formattedTitle}</title>
      <meta name="description" content={shortDescription.substring(0, 160)} />
    <meta name="keywords" content={highlightsRaw || "Singapore tours, day tours, explore singapore"} />
      <link rel="canonical" href={pageUrl} key="canonical"  />

      <meta property="og:title" content={formattedTitle} key="og:title" />
      <meta property="og:description" content={shortDescription.substring(0, 160)} key="og:description" />
      <meta property="og:type" content="website" key="og:type" />
      <meta property="og:url" content={pageUrl} key="og:url" />
      <meta property="og:image" content={imageUrl} key="og:image" />
      <meta property="og:image:alt" content={formattedTitle} key="og:image:alt" />

      <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
      <meta name="twitter:title" content={formattedTitle} key="twitter:title" />
      <meta name="twitter:description" content={shortDescription.substring(0, 160)} key="twitter:description" />
      <meta name="twitter:image" content={imageUrl} key="twitter:image" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: formattedTitle,
            description: shortDescription,
            image: imageUrl,
            url: pageUrl,
            brand: {
              "@type": "Brand",
              name: "Explore Singapore",
            },
            offers: {
              "@type": "Offer",
              priceCurrency: currency,
              price: price,
              availability: "https://schema.org/InStock",
              url: `https://www.exploresingapore.ai/day-tours/booking/${productid}`,
            },
          }),
        }}
        key="product-schema"
      />
    </Head>
  );
};

export default TourDetailHead;
