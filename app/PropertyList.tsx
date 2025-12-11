'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
const _url = process.env.NEXT_PUBLIC_BASE_URL;

type TableColumn = {
  key: string;
  title?: string;
  icon?: string;
  render: (p: Property) => any;
};

interface Property {
  ListingKey: string;
  StreetNumber: string;
  StreetName: string;
  StreetSuffix: string;
  City: string;
  SubdivisionName: string;
  PropertySubType: string;
  BCRES_SaleOrRent: string;
  NewListing: boolean;
  MlsStatus: string;
  ListingId: string;
  MediaName: string;
  PropertyType: string;
  BathroomsTotalInteger: string;
  BuildingAreaTotal: string;
  StateOrProvince: string;
  ListPrice: number;
  BedroomsTotal?: number;
  BathroomsFull?: number;
  LivingArea?: number;
  YearBuilt?: number;
  Media?: { MediaURL: string; Order: number }[];
}

interface Props {
  initialData: Property[];
}

interface CardProps {
  property: Property;
  tableCols: TableColumn[];
}

export default function PropertyList({ initialData }: Props) {
  const [properties, setProperties] = useState<Property[]>(initialData);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const tableCols: TableColumn[] = [
    {
      key: 'MlsStatus',
      title: 'Status',
      render: (p) => p.MlsStatus,
    },
    {
      key: 'ListingId',
      title: 'MLS®#',
      render: (p) => p.ListingId ?? 'N/A',
    },
    {
      key: 'BedroomsTotal',
      icon: '/Image/icons/single-bed.svg',
      render: (p) => p.BedroomsTotal ?? 'N/A',
    },
    {
      key: 'BathroomsTotalInteger',
      icon: '/Image/icons/shower-head.svg',
      render: (p) => p.BathroomsTotalInteger ?? 'N/A',
    },
    {
      key: 'BuildingAreaTotal',
      title: 'Floor',
      render: (p) => `${p.BuildingAreaTotal} sq. ft.`,
    },
  ];

  const fetchMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`${_url}properties/?page=${page}`);
      const dataRaw = await res.json();

      const data = dataRaw.map((p: any) => ({
        ListingKey: p.ListingKey,
        MlsStatus: p.Data?.MlsStatus ?? '',
        NewListing: p.NewListing,
        StreetNumber: p.Data?.StreetNumber ?? '',
        StreetName: p.Data?.StreetName ?? '',
        StreetSuffix: p.Data?.StreetSuffix ?? '',
        City: p.Data?.City ?? '',
        SubdivisionName: p.Data?.SubdivisionName ?? '',
        PropertySubType: p.Data?.PropertySubType ?? '',
        BCRES_SaleOrRent: p.Data?.BCRES_SaleOrRent ?? '',
        ListingId: p.Data?.ListingId ?? '',
        BathroomsTotalInteger: p.Data?.BathroomsTotalInteger ?? 0,
        BuildingAreaTotal: p.Data?.BuildingAreaTotal ?? 0,
        StateOrProvince: p.Data?.StateOrProvince ?? '',
        ListPrice: p.Data?.ListPrice ?? 0,
        BedroomsTotal: p.Data?.BedroomsTotal ?? 0,
        PropertyType: p.Data?.PropertyType ?? '',
        BathroomsFull: p.Data?.BathroomsTotalInteger ?? 0,
        LivingArea: p.Data?.BuildingAreaTotal ?? 0,
        YearBuilt: null,
        Media:
          Array.isArray(p.Media) && p.Media.length > 0
            ? p.Media.map((m: any, index: number) => ({
                MediaURL: `${m.MediaURL}${m.MediaName}`,
                Order: index + 1,
                RealURL: `${m.MediaURL}${m.MediaName}`,
              }))
            : [{ MediaURL: '/Image/default.jpg', Order: 1 }],
      }));

      if (data.length === 0) setHasMore(false);
      else {
        setProperties((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        fetchMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, loading, hasMore]);

  return (
    <main className='min-h-screen bg-[#EBEBEB] p-6'>
      <div className='max-w-[1200px] mx-auto'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {properties.map((p) => (
            <PropertyCard
              key={p.ListingKey}
              property={p}
              tableCols={tableCols}
            />
          ))}

          {loading && (
            <div className='col-span-3 flex justify-center py-4'>
              <div className='w-8 h-8 border-4 border-gray-300 border-t-[#005F82] rounded-full animate-spin'></div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
function PropertyCard({ property: p, tableCols }: CardProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    'View Photos',
    'Schedule viewing / Email',
    'Send listing',
    'View on map',
    'Mortgage calculator',
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='group bg-white rounded-[8px] shadow-sm  hover:shadow-md transition w-[328px] h-fit sm:w-[384px] p-[12px]'>
      <div className='pb-4 leading-[28px] min-h-[100px]'>
        <p className='text-[#061b2e] text-[18px]'>
          {p.StreetNumber} {p.StreetName} {p.StreetSuffix} in {p.City}
        </p>
        <p className='text-[#061b2e] text-[18px]'>
          {p.SubdivisionName} {p.PropertySubType} {p.BCRES_SaleOrRent} in{' '}
          {p.SubdivisionName}: MLS®#
        </p>
      </div>

      <div className='relative w-full h-60 overflow-hidden rounded-[4px]'>
        <Image
          key={`${p.MediaName}`}
          src={p.Media?.[0]?.MediaURL || '/Image/default.jpg'}
          alt={`${p.StreetNumber} ${p.StreetName}`}
          fill
          className='object-cover'
          sizes='(max-width: 768px) 328px, 384px'
          priority
        />

        {p.NewListing && (
          <div
            className='absolute top-[84px] left-[-22px] z-20 bg-[#061B2ECC]/80 text-white font-semibold tracking-wide flex items-center justify-center'
            style={{
              width: '150px',
              height: '32px',
              transform: 'rotate(-45deg)',
              transformOrigin: 'top left',
            }}
          >
            <p className='text-[11px]'>NEW LISTING</p>
          </div>
        )}

        <div className='absolute top-2 right-2 flex items-center gap-2 z-30'>
          <button className='bg-[#00AD62]/50 border border-[#00AD62] text-white px-3 rounded-t-[12px] rounded-b-[16.5px] w-[55px] h-[24px] text-sm hover:bg-[#0294cc] transition'>
            <p className='text-[12px]'>Open</p>
          </button>

          <button className='w-[32px] h-[24px] p-2 rounded-[4px] overflow-hidden bg-white shadow flex items-center justify-center hover:shadow-md transition'>
            <img src='/Image/icons/call.svg' alt='icon' className='w-5 h-5' />
          </button>
        </div>

        <div className='absolute flex justify-center items-center bottom-4 left-0 z-30 bg-[#005F82CC]/80 text-white px-3  rounded-tr-[16.5px] rounded-br-[16.5px] text-[11px] w-fit h-[32px]'>
          {p.PropertyType}
        </div>

        <div className='absolute  flex justify-center items-center bottom-4 right-0 z-30 bg-[#00AD6280]/50 rounded-tl-[16.5px] rounded-bl-[16.5px] text-white px-3 py-1  text-[11px] w-fit h-[32px]'>
          ${p.ListPrice}
        </div>
      </div>

      <div className='mt-4 w-full rounded-[4px] border border-[#EBEBEB] overflow-hidden'>
        <table className='w-full border-separate border-spacing-0 text-center'>
          <thead className='bg-[#fff]'>
            <tr>
              {tableCols.map((col, index) => (
                <th
                  key={col.key}
                  className={`h-[28px] text-[12px] text-[#4D4D4D] font-semibold border-b border-[#EBEBEB] ${
                    index === 0 ? 'rounded-tl-[4px]' : ''
                  } ${
                    index === tableCols.length - 1 ? 'rounded-tr-[4px]' : ''
                  } ${
                    index !== tableCols.length - 1
                      ? 'border-r border-[#EBEBEB]'
                      : ''
                  }`}
                >
                  {col.icon ? (
                    <img
                      src={col.icon}
                      alt=''
                      className='mx-auto w-5 h-5 opacity-80'
                    />
                  ) : (
                    col.title
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              {tableCols.map((col, index) => (
                <td
                  key={col.key}
                  className={`h-[28px] text-[#061B2E] text-[12px] font-bold border-b border-[#EBEBEB] ${
                    index !== tableCols.length - 1
                      ? 'border-r border-[#EBEBEB]'
                      : ''
                  } ${index === 0 ? 'rounded-bl-[4px]' : ''} ${
                    index === tableCols.length - 1 ? 'rounded-br-[4px]' : ''
                  }`}
                >
                  {col.render(p)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className='flex mt-6 justify-between items-center overflow-visible'>
        <Link href={`/properties/photos/${p.ListingKey}`}>
          <button className='bg-[#005F82] cursor-pointer text-white text-[16px] rounded-[4px] px-5 py-2'>
            Details
          </button>
        </Link>

        <div className='relative overflow-visible' ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            className='bg-[#EBEBEB] rounded-[4px] px-5 py-2 text-[16px] text-black transition-colors'
          >
            More...
          </button>

          {open && (
            <div className='absolute top-full mt-2 right-0 w-48 text-[#061B2E] bg-white rounded shadow-lg border border-gray-200 z-50'>
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  className='w-full text-[16px] text-left border border-b border-[#EBEBEB] px-4 py-2 hover:bg-blue-100'
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
