import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Handle Web Share Target POST requests (images/screenshots shared from other apps)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname !== '/share-target' || event.request.method !== 'POST') return;

  event.respondWith(
    (async () => {
      try {
        const formData = await event.request.formData();
        const file = formData.get('media') as File | null;
        const sharedUrl =
          (formData.get('url') as string | null) ||
          (formData.get('text') as string | null) ||
          '';

        if (file && file.size > 0) {
          const cache = await caches.open('foodbase-share-v1');
          await cache.put(
            '/shared-image',
            new Response(file, { headers: { 'Content-Type': file.type } })
          );
          return Response.redirect('/?shared=image', 303);
        }

        if (sharedUrl.trim()) {
          return Response.redirect(
            `/?share_url=${encodeURIComponent(sharedUrl.trim())}`,
            303
          );
        }
      } catch {
        // fall through to home
      }
      return Response.redirect('/', 303);
    })()
  );
});
