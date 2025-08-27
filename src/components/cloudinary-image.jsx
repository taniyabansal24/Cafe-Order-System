// components/cloudinary-image.jsx
import Image from 'next/image';

export default function CloudinaryImage({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  quality = 80,
  ...props 
}) {
  if (!src) {
    return <div className={`bg-gray-100 ${className}`} style={{ width, height }} />;
  }

  // Check if this is a Cloudinary image
  const isCloudinary = src.includes('res.cloudinary.com');

  // Apply Cloudinary transformations if needed
  const imageUrl = isCloudinary
    ? src.replace(
        /upload\//, 
        `upload/c_fill,w_${width},h_${height},q_${quality}/`
      )
    : src;

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized={!isCloudinary} // Only optimize Cloudinary images
      {...props}
    />
  );
}