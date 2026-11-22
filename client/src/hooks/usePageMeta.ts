import { useEffect } from 'react';
import { SITE_NAME, BASE_URL, fullTitle as makeTitle, ROUTE_META } from '@shared/routeMeta';

interface PageMeta {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
}


export function usePageMeta({ title: t, description: d, canonical, ogType = 'website' }: PageMeta) {
  const route = canonical && !canonical.startsWith('http') ? ROUTE_META[canonical] : undefined;
  const title = t ?? route?.title ?? SITE_NAME;
  const description = d ?? route?.description ?? '';
  useEffect(() => {
    const fullTitle = makeTitle(title);

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
    if (canonical) setMeta('og:url', canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical}`, 'property');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);

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
