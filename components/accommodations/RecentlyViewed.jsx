import useRecentlyViewedStore from '@/store/useRecentlyViewedStore';
import Link from 'next/link';
import Image from 'next/image';
import { getFullImageUrl } from "@/utils/imageService";
import { slugify } from "../../utils/slugify";

const RecentlyViewed = () => {
  const { recentlyViewed } = useRecentlyViewedStore();

  if (!recentlyViewed || recentlyViewed.length === 0) return null;



  return (
    <div className="w-full pb-4 pt-4  px-4 hidden lg:block">
      <h3 className="text-lg font-bold mb-4">Recently Viewed</h3>
      <div className="grid grid-cols-1  gap-5">
        {recentlyViewed.map((item) => (
          <Link
            key={item.id}
            href={`/accommodation/${slugify(item.name)}/${item.id}?link_type_id=${item.link_type_id}`}
            passHref
          >
            <div className="flex bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={getFullImageUrl(item?.image) || '/placeholder.jpg'}
                  alt={item?.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-l-lg"
                />
              </div>
              <div className="flex-grow p-3 flex flex-col justify-between">
                <p className="font-semibold text-sm line-clamp-2">{item?.name}</p>
                <div className="flex-col items-center justify-between text-xs text-gray-600 mt-1">
                  <span>From {item?.price} SGD</span>
                  <div className="flex items-center">
                    {[...Array(item?.rating || 0)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-3 h-3 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
