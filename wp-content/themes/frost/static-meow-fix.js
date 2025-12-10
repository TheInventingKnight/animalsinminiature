// static-meow-fix.js – Forces real Meow Lightbox on every static page
(function() {
  // Block the 405 REST call forever (fake success response)
  const block405 = () => {
    const origFetch = window.fetch;
    window.fetch = function (...args) {
      if (args[0] && args[0].toString().includes('regenerate_mwl_data')) {
        console.log('Blocked Meow Lightbox 405 – static fix active');
        return Promise.resolve({ 
          ok: true, 
          status: 200, 
          json: () => Promise.resolve({ success: true, data: {} })  // Fake metadata
        });
      }
      return origFetch.apply(this, args);
    };

    // Also block XHR for older browsers
    const origXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new origXHR();
      const origOpen = xhr.open;
      xhr.open = function(method, url, ...rest) {
        if (url && url.includes('regenerate_mwl_data')) {
          console.log('Blocked Meow Lightbox XHR 405');
          return;
        }
        return origOpen.apply(this, [method, url, ...rest]);
      };
      return xhr;
    };
  };
  block405();

  // Wait for DOM, then force Meow Lightbox init
  document.addEventListener('DOMContentLoaded', function () {
    // If MeowLightbox is already loaded, init it
    if (typeof MeowLightbox !== 'undefined' && MeowLightbox.init) {
      console.log('Meow Lightbox detected – forcing init');
      MeowLightbox.init();
      return;
    }

    // Otherwise, load the real script dynamically and init
    if (!window.meowLoaded) {
      window.meowLoaded = true;
      const script = document.createElement('script');
      script.src = '/wp-content/plugins/meow-lightbox/app/lightbox.js';
      script.onload = function() {
        console.log('Manually loaded Meow Lightbox JS');
        if (typeof MeowLightbox !== 'undefined') {
          MeowLightbox.init();
        }
      };
      document.head.appendChild(script);

      // Also load PhotoSwipe CSS dynamically to silence warnings
      if (!document.querySelector('#photoswipe-css')) {
        const link1 = document.createElement('link');
        link1.rel = 'stylesheet';
        link1.id = 'photoswipe-css';
        link1.href = '/wp-content/plugins/meow-lightbox/vendor/photoswipe/photoswipe.css';
        document.head.appendChild(link1);

        const link2 = document.createElement('link');
        link2.rel = 'stylesheet';
        link2.id = 'photoswipe-skin';
        link2.href = '/wp-content/plugins/meow-lightbox/vendor/photoswipe/default-skin/default-skin.css';
        document.head.appendChild(link2);
      }
    }
  });
})();