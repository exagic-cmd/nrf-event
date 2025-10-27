// components/common/LocalizedLink.js
import Link from 'next/link';
import useLanguageStore from '@/store/useLanguageStore';

export default function LocalizedLink({ href, children, ...props }) {
  const { currentLocale } = useLanguageStore();
  return (
    <Link href={href} locale={currentLocale} {...props}>
      {children}
    </Link>
  );
}
