import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
}

const SITE_NAME = 'BitcoinBytes';
const BASE_URL = 'https://xbitcoinbytes.com';

export function usePageMeta({ title, description, canonical, ogType = 'website' }: PageMeta) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

    document.title = fullTitle;

    function setMeta(name: string, content: string, attr = 'name') {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    }

    setMeta('description', description);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', ogType, 'property');
    if (canonical) setMeta('og:url', canonical, 'property');

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical}`;
    }
  }, [title, description, canonical, ogType]);
}
