// components/common/LocalizedLink.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import useLanguageStore from '@/store/useLanguageStore';
import { withEventPath } from '@/lib/eventRouting';
import { useEventRouteSlug } from '@/lib/EventRouteContext';

export default function LocalizedLink({ href, children, ...props }) {
  const { currentLocale } = useLanguageStore();
  const router = useRouter();
  const routeEventSlug = useEventRouteSlug();
  const eventHref = withEventPath(
    href,
    routeEventSlug ? `/${encodeURIComponent(routeEventSlug)}` : router.asPath,
    router.locale,
    router.defaultLocale
  );
  return (
    <Link href={eventHref} locale={currentLocale} {...props}>
      {children}
    </Link>
  );
}
