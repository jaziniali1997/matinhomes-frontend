'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
const _url = process.env.NEXT_PUBLIC_BASE_URL;

interface RawProperty {
  ListingKey: string;
  NewListing: boolean;
  Data?: {
    MlsStatus?: string;
    StreetNumber?: string;
    StreetName?: string;
    StreetSuffix?: string;
    City?: string;
    SubdivisionName?: string;
    PropertySubType?: string;
    BCRES_SaleOrRent?: string;
    ListingId?: string;
    BathroomsTotalInteger?: number;
    BuildingAreaTotal?: number;
    StateOrProvince?: string;
    ListPrice?: number;
    BedroomsTotal?: number;
    PropertyType?: string;
  };
  Media?: { MediaURL: string; MediaName: string }[];
}

export interface FiltersState {
  [key: string]: string | number | undefined;
}

type TableColumn = {
  key: string;
  title?: string;
  icon?: string;
  render: (p: Property) => React.ReactNode;
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
  BathroomsTotalInteger: string | number;
  BuildingAreaTotal: string | number;
  StateOrProvince: string;
  ListPrice: number;
  BedroomsTotal?: number;
  BathroomsFull?: number;
  LivingArea?: number;
  YearBuilt?: number | null;
  Media?: { MediaURL: string; Order: number }[];
}

interface Props {
  initialData: Property[];
  filters: FiltersState;
}

interface CardProps {
  property: Property;
  tableCols: TableColumn[];
}

export default function PropertyList({ initialData, filters }: Props) {
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
      render: (p) => p.ListingId ?? '---',
    },
    {
      key: 'BedroomsTotal',
      icon: '/Image/icons/single-bed.svg',
      render: (p) => p.BedroomsTotal ?? '---',
    },
    {
      key: 'BathroomsTotalInteger',
      icon: '/Image/icons/shower-head.svg',
      render: (p) => p.BathroomsTotalInteger ?? '---',
    },
    {
      key: 'BuildingAreaTotal',
      title: 'Floor',
      render: (p) => `${p.BuildingAreaTotal} sq. ft.`,
    },
  ];

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('page_size', '12');

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });

      const url = `${_url}properties/?${params.toString()}`;
      console.log('FETCH MORE →', url);

      const res = await fetch(url);
      const dataRaw: RawProperty[] = await res.json();

      const data: Property[] = dataRaw.map((p) => ({
        ListingKey: p.ListingKey,
        NewListing: p.NewListing,
        MlsStatus: p.Data?.MlsStatus ?? '',
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
            ? p.Media.map((m, index) => ({
                MediaURL: `${m.MediaURL}${m.MediaName}`,
                Order: index + 1,
              }))
            : [{ MediaURL: '/Image/default.jpg', Order: 1 }],
        MediaName: '',
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
  }, [loading, hasMore, page, filters]);

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
  }, [fetchMore]);

  return (
    <main className='flex min-h-screen bg-[#EBEBEB] py-6'>
      <div className='max-w-[1318px] mx-auto'>
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
  const titleRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

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

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    setIsOverflow(el.scrollHeight > el.clientHeight);
  }, [
    p.StreetNumber,
    p.StreetName,
    p.StreetSuffix,
    p.City,
    p.SubdivisionName,
    p.PropertySubType,
    p.BCRES_SaleOrRent,
  ]);

  return (
    <div className='group bg-white rounded-[8px] shadow-sm  hover:shadow-md transition lg:w-[100%] h-fit w-full p-[12px]'>
      <Link
        href={`${process.env.NEXT_PUBLIC_LISTING_URL}?ListingKey=${p.ListingKey}`}
      >
        <div
          ref={titleRef}
          className='
      relative
      overflow-hidden
      leading-[28px]
      text-[#061b2e]
      font-medium
      text-[18px]
      max-h-[84px]
      min-h-[84px]
    '
          style={{ fontFamily: 'Red Hat Display' }}
        >
          <p>
            {p.StreetNumber} {p.StreetName} {p.StreetSuffix} in {p.City}
          </p>

          <p>
            {p.SubdivisionName} {p.PropertySubType} {p.BCRES_SaleOrRent} in{' '}
            {p.SubdivisionName}: MLS®#
          </p>

          {isOverflow && (
            <span className='absolute bottom-0 right-0 bg-white pl-1'>…</span>
          )}
        </div>
      </Link>
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
            className='absolute top-[84px] left-[-22px] z-20 bg-[#061B2ECC]/80 text-white  flex items-center justify-center'
            style={{
              width: '150px',
              height: '32px',
              transform: 'rotate(-45deg)',
              transformOrigin: 'top left',
            }}
          >
            <p className='text-[11px] font-semibold tracking-[0px] leading-[100%]'>
              NEW LISTING
            </p>
          </div>
        )}

        <div className='absolute top-2 right-2 flex items-center gap-2 z-30'>
          <button className='bg-[#00AD62]/50 border border-[#00AD62] text-white px-3 rounded-t-[12px] rounded-b-[16.5px] w-[55px] h-[24px] text-sm hover:bg-[#0294cc] transition  backdrop-blur-[8px]'>
            <p
              className='text-[12px] font-semibold  leading-[100%] tracking-[0]
              '
              style={{ fontFamily: 'Red Hat Display' }}
            >
              Open
            </p>
          </button>

          <button className='w-[32px] h-[24px] p-2 rounded-[4px] overflow-hidden bg-white shadow flex items-center justify-center hover:shadow-md transition'>
            <Image
              src='/Image/icons/call.svg'
              alt='icon'
              width={20}
              height={20}
            />{' '}
          </button>
        </div>

        <div className='absolute flex font-semibold leading-[100%] tracking-[0] justify-center items-center bottom-4 left-0 z-30 bg-[#005F82CC]/80 text-white px-3  rounded-tr-[16.5px] rounded-br-[16.5px] text-[12px] w-fit h-[32px] backdrop-blur-[4px]'>
          {p.PropertyType}
        </div>

        <div className='absolute font-black leading-[100%] tracking-[0] flex justify-center items-center bottom-4 right-0 z-30 bg-[#00AD6280]/50 rounded-tl-[16.5px] rounded-bl-[16.5px] text-white px-3 py-1 text-[14px] w-fit h-[32px] backdrop-blur-[4px]'>
          ${p.ListPrice?.toLocaleString()}
        </div>
      </div>

      <div className='mt-4 w-full rounded-[4px] border border-[#EBEBEB] overflow-hidden'>
        <table className='w-full border-separate border-spacing-0 text-center'>
          <thead className='bg-[#fff]'>
            <tr>
              {tableCols.map((col, index) => (
                <th
                  key={col.key}
                  className={`h-[28px] font-normal leading-[100%] tracking-[0] text-[12px] text-[#4D4D4D]  border-b border-[#EBEBEB] ${
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
                    <Image
                      src={col.icon}
                      alt=''
                      className='mx-auto opacity-80'
                      width={20}
                      height={20}
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
                  className={`h-[28px]  leading-[100%] tracking-[0] text-[#061B2E] text-[12px] font-bold border-b border-[#EBEBEB] ${
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
          <button className='bg-[#005F82]  cursor-pointer  rounded-[4px] px-5 py-2'>
            <p className='leading-[28px] tracking-[0] font-medium text-white text-[14px]'>
              Details
            </p>
          </button>
        </Link>

        <div className='relative overflow-visible' ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            className='bg-[#EBEBEB] hover:bg-[#B4E7FA] font-medium leading-[28px] tracking-[0] rounded-[4px] px-5 py-2 text-[16px] text-black transition-colors'
          >
            More...
          </button>

          {open && (
            <div className='absolute top-full mt-2 right-0 w-56 text-[#061B2E] bg-white rounded shadow-lg border border-gray-200 z-50'>
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  className='w-full text-[16px] text-left border border-b border-[#EBEBEB] px-4 py-2 hover:bg-blue-100'
                  style={{
                    background:
                      'linear-gradient(90deg, #061B2E 0%, #005F82 60%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
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
