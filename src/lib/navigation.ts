/**
 * Navigation utilities and route configuration
 * Provides route mappings for breadcrumbs and back button navigation
 */

export interface RouteConfig {
  label: string;
  parent?: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

/**
 * Route configuration mapping
 * Maps route paths to their labels and parent routes
 */
export const routeConfig: Record<string, RouteConfig> = {
  '/': {
    label: 'Home',
  },
  '/login': {
    label: 'Login',
  },
  '/signup': {
    label: 'Sign Up',
  },
  '/profile': {
    label: 'Profile',
    parent: '/',
    requiresAuth: true,
  },
  '/profile/settings': {
    label: 'Settings',
    parent: '/profile',
    requiresAuth: true,
  },
  '/organizations': {
    label: 'Organizations',
    parent: '/',
    requiresAuth: true,
  },
  '/organizations/create': {
    label: 'Create Organization',
    parent: '/organizations',
    requiresAuth: true,
  },
  '/organizations/[id]': {
    label: 'Organization Details',
    parent: '/organizations',
    requiresAuth: true,
  },
  '/organizations/[id]/members': {
    label: 'Members',
    parent: '/organizations/[id]',
    requiresAuth: true,
  },
  '/organizations/[id]/settings': {
    label: 'Settings',
    parent: '/organizations/[id]',
    requiresAuth: true,
  },
  '/admin': {
    label: 'Admin',
    parent: '/',
    requiresAuth: true,
    requiresAdmin: true,
  },
  '/admin/users': {
    label: 'Users',
    parent: '/admin',
    requiresAuth: true,
    requiresAdmin: true,
  },
  '/admin/organizations': {
    label: 'Organizations',
    parent: '/admin',
    requiresAuth: true,
    requiresAdmin: true,
  },
  '/pricing': {
    label: 'Pricing',
    parent: '/',
    requiresAuth: true,
  },
  '/billing': {
    label: 'Billing',
    parent: '/',
    requiresAuth: true,
  },
  '/invitations': {
    label: 'Invitations',
    parent: '/',
    requiresAuth: true,
  },
};

/**
 * Get the parent path for a given route
 * @param pathname - Current route pathname
 * @returns Parent route path or undefined
 */
export function getParentPath(pathname: string): string | undefined {
  const config = routeConfig[pathname];
  return config?.parent;
}

/**
 * Get the label for a route
 * @param pathname - Route pathname
 * @param dynamicLabel - Optional dynamic label for [id] routes
 * @returns Route label
 */
export function getRouteLabel(pathname: string, dynamicLabel?: string): string {
  const config = routeConfig[pathname];

  if (dynamicLabel && pathname.includes('[id]')) {
    return dynamicLabel;
  }

  return config?.label || pathname.split('/').pop() || 'Page';
}

/**
 * Generate breadcrumb items from current pathname
 * @param pathname - Current route pathname
 * @param dynamicLabels - Map of dynamic route segments to their labels (e.g., { '[id]': 'Org Name' })
 * @returns Array of breadcrumb items with label and href
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
}

export function generateBreadcrumbs(
  pathname: string,
  dynamicLabels?: Record<string, string>
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  const segments = pathname.split('/').filter(Boolean);

  // Always start with Home
  breadcrumbs.push({ label: 'Home', href: '/' });

  // Build breadcrumbs from path segments
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Check if this is a dynamic route segment (UUID pattern)
    const isDynamic = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);

    let routePath = currentPath;
    if (isDynamic) {
      // Replace the actual ID with [id] to match our config
      routePath = currentPath.replace(segment, '[id]');

      // Use dynamic label if provided
      const label = dynamicLabels?.[segment] || getRouteLabel(routePath);
      breadcrumbs.push({ label, href: currentPath });
    } else {
      const label = getRouteLabel(routePath);
      breadcrumbs.push({ label, href: currentPath });
    }
  }

  return breadcrumbs;
}

/**
 * Main navigation menu items
 */
export interface NavItem {
  label: string;
  href: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    requiresAuth: true,
  },
  {
    label: 'Organizations',
    href: '/organizations',
    requiresAuth: true,
  },
  {
    label: 'Invitations',
    href: '/invitations',
    requiresAuth: true,
  },
  {
    label: 'Profile',
    href: '/profile',
    requiresAuth: true,
  },
  {
    label: 'Pricing',
    href: '/pricing',
    requiresAuth: true,
  },
  {
    label: 'Billing',
    href: '/billing',
    requiresAuth: true,
  },
  {
    label: 'Admin',
    href: '/admin',
    requiresAuth: true,
    requiresAdmin: true,
  },
];
