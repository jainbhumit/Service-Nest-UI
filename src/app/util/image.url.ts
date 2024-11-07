export function GetServiceImage(serviceName: string): string {
  // Map service names to images (adjust as needed)
  const images: { [key: string]: string } = {
    Cleaning: 'assets/images/Cleaning.jpg',
    Electrical: 'assets/images/Electrician.jpg',
    Gardening: 'assets/images/Gardening.jpg',
    Plumbing: 'assets/images/Plumber.jpg'
  };
  return images[serviceName] || 'assets/default.jpg';
}