'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
const _url = process.env.NEXT_PUBLIC_BASE_URL;

interface MediaItem {
  MediaURL: string;
  MediaName: string;
}

interface Property {
  ListingKey: string;
  StreetName?: string;
  City?: string;
  StateOrProvince?: string;
  ListPrice?: number;
  Media?: MediaItem[];
  YearBuilt?: number;
  BedroomsTotal?: number;
  BathroomsFull?: number;
  LivingArea?: number;
  PublicRemarks?: string;
}

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${_url}properties/${id}`);
        const data = await res.json();

        setProperty(data);
        const imgs: string[] = data?.MediaNames?.length
          ? data.MediaNames.map(
              (name: string) => `${data.MediaURL ?? ''}${name}`
            )
          : ['/Image/default.jpg'];

        setImages(imgs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id]);

  useEffect(() => {
    if (showGallery) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';

    const handleKey = (e: KeyboardEvent) => {
      if (!showGallery) return;
      if (e.key === 'Escape') setShowGallery(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [showGallery, images.length, next, prev]);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='w-10 h-10 border-4 border-gray-300 border-t-[#005F82] rounded-full animate-spin'></div>
      </div>
    );
  }

  if (!property)
    return <p className='text-center mt-10'>Property not found.</p>;

  const photosCount = images.length;

  return (
    <main className='bg-[#EBEBEB] min-h-screen '>
      <div className='max-w-[1318px] mx-auto rounded-lg'>
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <div
            className='relative w-[328px] h-[217px] sm:w-[793px] sm:h-[523px] rounded-lg overflow-hidden cursor-pointer'
            onClick={() => {
              setCurrent(0);
              setShowGallery(true);
            }}
          >
            <Image
              src={images[0] || '/Image/default.jpg'}
              alt={property.StreetName || ''}
              fill
              className='object-cover'
              priority
            />
            {/* {property.YearBuilt && (
              <span className='absolute top-3 left-3 z-10 w-[88px] h-[24px] p-1 bg-[#061b2e] text-white rounded-[16px] flex items-center justify-center text-[12px]'>
                Move in {property.YearBuilt}
              </span>
            )} */}
            <div
              onClick={() => {
                setCurrent(0);
                setShowGallery(true);
              }}
              className='absolute bottom-3 right-3 flex items-center font-bold sm:hidden shadow-md bg-[#fff] text-[#005F82] px-3 py-2 rounded-[4px] hover:brightness-75 transition text-sm'
            >
              <Image
                className='mr-1'
                src='/Image/icons/new-picture.svg'
                alt=''
                width={16}
                height={16}
              />
              {photosCount} Photos
            </div>
          </div>

          <div className='flex-col gap-4 hidden md:flex'>
            <div
              className='relative w-[386px] h-[251px] rounded-[8px] overflow-hidden cursor-pointer'
              onClick={() => {
                setCurrent(1);
                setShowGallery(true);
              }}
            >
              <Image
                src={images[1] || '/Image/default.jpg'}
                alt={property.StreetName || ''}
                fill
                className='object-cover'
                priority={false}
                loading='lazy'
              />
            </div>

            <div
              className='relative w-[386px] h-[251px] rounded-[8px] overflow-hidden cursor-pointer'
              onClick={() => {
                setCurrent(2);
                setShowGallery(true);
              }}
            >
              <Image
                src={images[2] || '/Image/default.jpg'}
                alt={property.StreetName || ''}
                fill
                className='object-cover'
                priority={false}
                loading='lazy'
              />
              <div
                onClick={() => {
                  setCurrent(2);
                  setShowGallery(true);
                }}
                className='absolute cursor-pointer hidden lg:flex items-center font-bold bottom-3 right-3 shadow-md bg-[#fff] text-[#005F82] px-3 py-2 rounded-[4px] hover:brightness-75 transition text-sm'
              >
                <Image
                  src='/Image/icons/new-picture.svg'
                  alt='New picture icon'
                  width={16}
                  height={16}
                  className='mr-1'
                />
                {photosCount} Photos
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGallery && (
        <div className='fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center'>
          <button
            onClick={() => setShowGallery(false)}
            className='absolute top-6 right-6 text-white text-3xl'
          >
            ✕
          </button>

          <div className='absolute top-6 left-6 text-white text-sm bg-black/40 px-3 py-1 rounded-lg'>
            {current + 1} / {photosCount}
          </div>

          <div className='relative w-full h-[85vh] max-w-[1000px] flex items-center justify-center'>
            <Image
              src={images[current]}
              alt={`Photo ${current + 1}`}
              fill
              className='object-contain rounded-lg'
              priority={false}
              loading='lazy'
            />
          </div>

          <button
            onClick={prev}
            className='absolute left-6 text-white text-5xl font-bold hover:text-gray-300 select-none'
          >
            ‹
          </button>
          <button
            onClick={next}
            className='absolute right-6 text-white text-5xl font-bold hover:text-gray-300 select-none'
          >
            ›
          </button>
        </div>
      )}
    </main>
  );
}
