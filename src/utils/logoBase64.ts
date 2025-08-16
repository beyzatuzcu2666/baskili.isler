// Baskılı İşler logosu base64 formatında
// Bu dosya logo.png'yi base64'e çevirmek için oluşturulmuştur

export const getLogoBase64 = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Logo yüklenemedi'));
    };
    
    // Logo dosyasını yükle
    img.src = '/logo192.png'; // public klasöründeki logo
  });
};

// Baskılı İşler logosu - colorful design with paint splashes
export const getFallbackLogoBase64 = (): string => {
  const svgContent = `
<svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f97316;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Paint splashes background -->
  <circle cx="30" cy="25" r="12" fill="url(#yellowGrad)" opacity="0.8"/>
  <circle cx="45" cy="15" r="8" fill="url(#pinkGrad)" opacity="0.7"/>
  <circle cx="25" cy="40" r="6" fill="#10b981" opacity="0.6"/>
  <circle cx="50" cy="35" r="10" fill="url(#yellowGrad)" opacity="0.5"/>
  
  <!-- Main circle -->
  <circle cx="35" cy="30" r="28" fill="url(#blueGrad)" stroke="#ffffff" stroke-width="2"/>
  
  <!-- BI Text -->
  <text x="35" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">BI</text>
  
  <!-- Company name -->
  <text x="80" y="25" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1f2937">BASKILI</text>
  <text x="80" y="45" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1f2937">İŞLER</text>
  
  <!-- Decorative elements -->
  <circle cx="170" cy="20" r="4" fill="url(#pinkGrad)" opacity="0.7"/>
  <circle cx="180" cy="35" r="6" fill="url(#yellowGrad)" opacity="0.6"/>
  <circle cx="165" cy="40" r="3" fill="#10b981" opacity="0.8"/>
</svg>
  `;
  
  // UTF-8 güvenli base64 encoding
  try {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
  } catch (error) {
    // Fallback: Direct SVG data URI
    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }
};
