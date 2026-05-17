// router.jsx — hash router

function parseHash() {
  const h = (location.hash || '#/').slice(1);
  const [path, query = ''] = h.split('?');
  const segments = path.split('/').filter(Boolean);
  return { path, segments, query };
}

function useRoute() {
  const [route, setRoute] = React.useState(parseHash);
  React.useEffect(() => {
    const update = () => setRoute(parseHash());
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return route;
}

function nav(path) {
  if (location.hash === '#' + path) {
    setTimeout(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
  } else {
    location.hash = '#' + path;
  }
}

function Link({ to, children, className, style, onClick }) {
  return (
    <a href={'#' + to}
      className={className} style={style}
      onClick={(e) => { e.preventDefault(); if (onClick) onClick(e); nav(to); }}>
      {children}
    </a>
  );
}

Object.assign(window, { useRoute, nav, Link, parseHash });
