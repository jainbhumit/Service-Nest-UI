export function GetServiceImage(serviceName: string): string {
  // Map service names to images (adjust as needed)
  const images: { [key: string]: string } = {
    Cleaning: 'https://res.cloudinary.com/dcsr8r5jg/image/upload/v1731069858/Cleaning1_sbrgzp.jpg',
    Electrical: 'https://res.cloudinary.com/dcsr8r5jg/image/upload/v1731069984/Electrician1_hnttyk.jpg',
    Gardening: 'https://res.cloudinary.com/dcsr8r5jg/image/upload/v1731069986/Gardening1_oxa5as.jpg',
    Plumbing: 'https://res.cloudinary.com/dcsr8r5jg/image/upload/v1731069985/Plumber1_le6c46.jpg'
  };
  return images[serviceName] || 'assets/default.jpg';
}