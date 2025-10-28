// js/router.js
export function initRouter({ defaultRoute = 'home', mountSelector = '#app', screensDir = './screens' } = {}) {
  const mount = document.querySelector(mountSelector);

  async function load(route) {
    try {
      const url = `${screensDir}/${route}.html`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Missing screen: ${route}`);
      const html = await res.text();
      mount.innerHTML = html;
      runInlineModuleScripts(mount);
      // Focus first heading if present for a11y
      const h = mount.querySelector('h1,h2,h3');
      if (h) h.setAttribute('tabindex','-1'), h.focus();
    } catch (err) {
      mount.innerHTML = `<section class="screen"><h2>Not Found</h2><p>${escapeHtml(err.message)}</p></section>`;
    }
  }

  function currentRoute() {
    const hash = window.location.hash || `#/${defaultRoute}`;
    const [, route = defaultRoute] = hash.split('#/');
    return route || defaultRoute;
  }

  function onRouteChange() { load(currentRoute()); }

  window.addEventListener('hashchange', onRouteChange);
  if (!window.location.hash) window.location.hash = `#/${defaultRoute}`;
  onRouteChange();
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function runInlineModuleScripts(root) {
  const scripts = root.querySelectorAll('script[type="module"]');
  scripts.forEach((s) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = s.textContent;
    for (const attr of s.attributes) script.setAttribute(attr.name, attr.value);
    s.replaceWith(script);
  });
}
