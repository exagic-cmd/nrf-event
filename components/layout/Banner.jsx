import MelvinChatStrap from '@/components/layout/MelvinChatStrap';
export default function Banner() {
    // const router = useRouter();
    return (
   <>
        <section className="bg-[#FE6F4F] w-full pt-10 px-4 md:px-8 relative max-h-full md:max-h-full lg:max-h-[556px] flex flex-col md:flex-row items-center justify-center mt-8">
            <div className="container mx-auto flex flex-col md:flex-row items-center text-center md:text-left">
             
                {/* Left Content */}
                <div className="md:w-1/2 xl:px-8 lg:px-4 md:px-2 px-0 ">
                    <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                        Craft Unforgettable Itineraries with AI Trip Planner
                    </h1>
                    <p className="text-base sm:text-lg mt-4 text-white">
                        Your personal trip planner and travel curator, creating custom itineraries tailored to your interests and budget.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                    </div>
                    
<div className='absolute bottom-2 left-2 md:bottom-4 md:left-12 lg:bottom-6 lg:left-16 xl:bottom-6 xl:left-20 z-10'>
    <MelvinChatStrap />
</div>
                </div>
                <div className="md:w-1/2 md:mt-2 mt-4 flex justify-center relative">
                    <img
                        src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1744973735/External%20Links/fajvtmcexqcequ2jw0ib.svg"
                       alt="Illustration of AI travel planner for Singapore"
                        className="block sm:hidden"
                        width={2000}
                        height={2000}
                    />
                    <img
                        src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1743665326/External%20Links/s0xu2tzpohho94zmvmru.svg"
                      alt="Illustration of AI travel planner for Singapore"
                        className="hidden sm:block"
                    />
                    <div className="hidden md:hidden lg:block absolute top-4 left-0">
                        <img src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1743665429/External%20Links/gvdtuzdjigjgdjqnzchp.svg" alt="hotline" />
                    </div>
                    <div className="hidden md:hidden lg:block absolute bottom-4 right-0 md:right-20">
                        <img src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1747127096/External%20Links/xitzdvx70fpat1j2qv6z.svg" alt="hotline2" />
                    </div>
                </div>
            </div>

            <div className="absolute top-[5] left-[50%] transform -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                <img src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1744797482/External%20Links/pcrzo75z5womwynfwpih.svg" alt="Sparkle Large" className="h-24 w-24 " />
            </div>
         
        </section>
{/*  
        <section>
  <div className="w-full h-auto py-2 px-4 text-center text-xs sm:text-sm md:text-base lg:text-lg font-medium text-white bg-[#D54626]">
    Get 20% off tours and essentials with code <strong className="font-semibold">ES14846</strong>. <span className="underline"> T&Cs Apply</span>
  </div>
</section> */}




        </>
    );
}