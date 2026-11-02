export const SITE_ORIGIN = 'https://docs.epocanvas.com';

/** Resolve a site link against the route that contains it, preserving query and fragment. */
export function resolveSiteUrl(href, currentRoute) {
  return new URL(href, new URL(currentRoute, SITE_ORIGIN));
}

export function decodeFragment(fragment) {
  try {
    return decodeURIComponent(fragment);
  } catch {
    return null;
  }
}
