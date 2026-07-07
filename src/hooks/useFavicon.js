import { useEffect } from 'react';

/**
 * Hook to dynamically update the document favicon from site config
 */
export const useFavicon = () => {
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
        const response = await fetch(`${apiBaseUrl}/siteconfig`);
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) return;

          const result = await response.json();
          if (result.success && result.data?.branding) {
            const { faviconUrl, siteName, name } = result.data.branding;
            
            // Dynamically update document title
            document.title = siteName || name || "Ecomus";

            if (faviconUrl) {
              // Get or create favicon link element
              let link = document.querySelector("link[rel~='icon']");
              if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
              }
              
              // Update favicon href
              const backendBase = apiBaseUrl.replace('/api', '');
              const fullUrl = faviconUrl.startsWith('http') 
                ? faviconUrl 
                : `${backendBase}${faviconUrl}`;
              link.href = fullUrl;
              
              // Also update the type if it's an SVG
              if (faviconUrl.endsWith('.svg')) {
                link.type = 'image/svg+xml';
              } else if (faviconUrl.endsWith('.png')) {
                link.type = 'image/png';
              } else if (faviconUrl.endsWith('.ico')) {
                link.type = 'image/x-icon';
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load favicon from site config:', error);
      }
    };

    loadFavicon();
  }, []);
};
