import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = "Parkéé City - Smart Vehicle Protection & Emergency Services", 
  description = "Secure your vehicle with Parkéé City's smart QR-based Emergency Cards. Get 24/7 roadside assistance, highway engine repair, and instant contact access.", 
  keywords = "smart parking, vehicle protection, emergency repair, highway assistance, QR card, Parkéé City, roadside help",
  image = "https://parka-frontend.vercel.app/og-image.png",
  url = "https://parka-frontend.vercel.app/",
  type = "website"
}) {
  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}
