'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PropertyList from './PropertyList';
import FilterData from '../components/FilterData';
import { useSearchParams } from 'next/navigation';

const _url = process.env.NEXT_PUBLIC_BASE_URL;

export interface FiltersState {
  [key: string]: string | number | undefined;
}

export interface RawProperty {
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

export interface Property {
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
  BathroomsTotalInteger: number;
  BuildingAreaTotal: number;
  StateOrProvince: string;
  ListPrice: number;
  BedroomsTotal?: number;
  BathroomsFull?: number;
  LivingArea?: number;
  YearBuilt?: number | null;
  Media?: { MediaURL: string; Order: number }[];
}

export default function HomeClient() {
  const [filters, setFilters] = useState<FiltersState>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const searchParams = useSearchParams();
  const cityFromUrl = searchParams.get('city');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const initialFetchDone = useRef(false);

  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const fetchedPages = useRef<Set<number>>(new Set());

  const fetchProperties = useCallback(
    async (filters: FiltersState, pageNum: number, append = false) => {
      if (isFetchingRef.current) return;
      if (fetchedPages.current.has(pageNum)) return;

      isFetchingRef.current = true;

      try {
        if (pageNum === 1) setLoadingInitial(true);

        const params = new URLSearchParams();
        params.append('page', String(pageNum));
        params.append('page_size', '12');

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value));
          }
        });

        const baseUrl = `${_url}properties/`;
        const queryParts: string[] = [];

        if (cityFromUrl) {
          queryParts.push(`city=${encodeURIComponent(cityFromUrl)}`);
        }

        if (params.toString()) {
          queryParts.push(params.toString());
        }

        const url =
          queryParts.length > 0
            ? `${baseUrl}?${queryParts.join('&')}`
            : baseUrl;

        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        const dataRaw: RawProperty[] = Array.isArray(json?.Data)
          ? json.Data
          : [];
        setTotalPages(json?.TotalPages ?? 1);
        setCurrentPage(json?.CurrentPage ?? pageNum);
        const mapped: Property[] = dataRaw.map((p) => ({
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
              ? p.Media.map((m, idx) => ({
                  MediaURL: `${m.MediaURL}${m.MediaName}`,
                  Order: idx + 1,
                }))
              : [{ MediaURL: '/Image/default.jpg', Order: 1 }],
          MediaName: '',
        }));

        setProperties((prev) => {
          const existingKeys = new Set(prev.map((p) => p.ListingKey));
          const newProps = mapped.filter(
            (p) => !existingKeys.has(p.ListingKey)
          );
          return append ? [...prev, ...newProps] : newProps;
        });

        fetchedPages.current.add(pageNum);
        pageRef.current = pageNum;
        setHasMore(mapped.length === 12);
      } catch (err) {
        console.error(err);
        setHasMore(false);
      } finally {
        isFetchingRef.current = false;
        setLoadingInitial(false);
      }
    },
    [hasMore, cityFromUrl]
  );

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchProperties(filters, 1, false);
    }
  }, []);
  useEffect(() => {
    pageRef.current = 1;
    fetchedPages.current.clear();
    setProperties([]);
    setHasMore(true);
    setCurrentPage(1);

    fetchProperties(filters, 1, false);
  }, [filters]);

  const renderPagination = () => {
    if (totalPages <= 1 || properties.length === 0) return null;

    const maxVisible = window.innerWidth <= 768 ? 5 : 10;

    let start = Math.floor((currentPage - 1) / maxVisible) * maxVisible + 1;
    let end = Math.min(start + maxVisible - 1, totalPages);

    if (currentPage > totalPages - maxVisible) {
      start = Math.max(totalPages - maxVisible + 1, 1);
      end = totalPages;
    }

    const goPrevBlock = () => {
      const target = Math.max(currentPage - maxVisible, 1);
      fetchedPages.current.clear();
      fetchProperties(filters, target, false);
      setCurrentPage(target);
    };

    const goNextBlock = () => {
      const target = Math.min(currentPage + maxVisible, totalPages);
      fetchedPages.current.clear();
      fetchProperties(filters, target, false);
      setCurrentPage(target);
    };

    return (
      <div className='flex justify-center items-center gap-2 mt-10'>
        <button
          disabled={currentPage === 1}
          onClick={goPrevBlock}
          className='px-1 lg:px-3 py-1 border text-[12px] lg:text-[16px] text-gray-800 rounded disabled:opacity-40'
        >
          Prev
        </button>

        {start > 1 && (
  <>
    <button
      onClick={() => {
        fetchedPages.current.clear();
        fetchProperties(filters, 1, false);
        setCurrentPage(1);
      }}
      className={`hidden lg:inline px-2 lg:px-3 py-1 text-[12px] lg:text-[16px] border text-black rounded ${
        currentPage === 1
          ? 'bg-[#005F82] text-white'
          : 'bg-[#7c7777]/20 hover:bg-[#005F82]'
      }`}
    >
      1
    </button>
    <span className='hidden lg:inline px-1 lg:px-2 text-gray-500'>...</span>
  </>
)}


        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
          (page) => (
            <button
              key={page}
              onClick={() => {
                fetchedPages.current.clear();
                fetchProperties(filters, page, false);
                setCurrentPage(page);
              }}
              className={`px-2 lg:px-3 py-1 text-[12px] lg:text-[16px] border text-black rounded ${
                page === currentPage
                  ? 'bg-[#005F82] text-white'
                  : 'bg-[#7c7777]/20 hover:bg-[#005F82]'
              }`}
            >
              {page}
            </button>
          )
        )}

        {end < totalPages && (
          <>
            <span className='px-2 lg:px-2 text-gray-500'>...</span>
            <button
              onClick={() => {
                fetchedPages.current.clear();
                fetchProperties(filters, totalPages, false);
                setCurrentPage(totalPages);
              }}
              className={`px-1 lg:px-3 text-[12px] lg:text-[16px] py-1 border rounded ${
                currentPage === totalPages
                  ? 'bg-[#005F82] text-white'
                  : 'bg-[#7c7777]/20 text-black hover:bg-[#005F82]'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          disabled={currentPage === totalPages}
          onClick={goNextBlock}
          className='px-3 py-1 border text-[12px] lg:text-[16px] text-gray-800 rounded disabled:opacity-40'
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className='w-full lg:w-[1318px] flex justify-center flex-col mx-auto'>
      <FilterData onFilterChange={(newFilters) => setFilters(newFilters)} />

      {loadingInitial && properties.length === 0 && (
        <p className='text-center py-4'>Loading...</p>
      )}

      {!loadingInitial && properties.length === 0 && (
        <p className='text-center  h-[20vh] py-8 text-gray-600 text-lg'>
          No listings found based on your filters.
        </p>
      )}

      {properties.length > 0 && (
        <>
          <PropertyList initialData={properties} filters={filters} />
          {renderPagination()}
        </>
      )}
    </div>
  );
}
