import React from "react";
import { Title, Meta, Link } from "react-head";
import { useLocation } from "react-router-dom";

export default function SeoManager({ title, description, image }) {
  const location = useLocation(); 
  const baseUrl = "https://lamiani.ge";
  const currentPath = location.pathname; 
  
  
  const fullUrl = `${baseUrl}${currentPath}`;

  return (
    <>
      <Title>{title}</Title>
      <Meta name="description" content={description} />
      
      {/* Hreflang Tags - აქ ვიყენებთ fullUrl-ს ან კომბინაციას */}
      <Link rel="alternate" hrefLang="ka" href={`${fullUrl}?lang=GE`} />
      <Link rel="alternate" hrefLang="en" href={`${fullUrl}?lang=EN`} />
      <Link rel="alternate" hrefLang="ru" href={`${fullUrl}?lang=RU`} />
      <Link rel="alternate" hrefLang="x-default" href={`${fullUrl}?lang=EN`} />
      
      {/* Canonical URL */}
      <Link rel="canonical" href={fullUrl} />

      {/* Social Media Tags (Open Graph) */}
      <Meta property="og:title" content={title} />
      <Meta property="og:description" content={description} />
      {image && <Meta property="og:image" content={image} />}
      <Meta property="og:url" content={fullUrl} />
      <Meta property="og:type" content="website" />
    </>
  );
}