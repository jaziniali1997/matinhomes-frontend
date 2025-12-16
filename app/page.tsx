'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PropertyList from './PropertyList';
import FilterData from '../components/FilterData';

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

export default function Home() {
  const [filters, setFilters] = useState<FiltersState>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const fetchedPages = useRef<Set<number>>(new Set());

  const fetchProperties = useCallback(
    async (filters: FiltersState, pageNum: number, append = false) => {
      if (isFetchingRef.current) return; 
      if (fetchedPages.current.has(pageNum)) return;
      if (!hasMore && append) return;

      isFetchingRef.current = true;

      try {
        if (pageNum === 1) setLoadingInitial(true);
        else setLoadingMore(true);

        const params = new URLSearchParams();
        params.append('page', String(pageNum));
        params.append('page_size', '12');

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value));
          }
        });

        const url =
          pageNum === 1 && Object.keys(filters).length === 0
            ? `${_url}properties/`
            : `${_url}properties/?${params.toString()}`;

        console.log('FETCH →', url);

        const res = await fetch(url, { cache: 'no-store' });
        const text = await res.text();

        let dataRaw: RawProperty[] = [];
        try {
          dataRaw = JSON.parse(text);
        } catch {
          console.error('Response was NOT JSON!');
        }

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
          const newProps = mapped.filter((p) => !existingKeys.has(p.ListingKey));
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
        setLoadingMore(false);
      }
    },
    [filters, hasMore]
  );

  useEffect(() => {
    pageRef.current = 1;
    fetchedPages.current.clear();
    setProperties([]);
    setHasMore(true);
    fetchProperties(filters, 1, false);
  }, [filters, fetchProperties]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !loadingMore &&
        !isFetchingRef.current &&
        hasMore
      ) {
        fetchProperties(filters, pageRef.current + 1, true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filters, loadingMore, hasMore, fetchProperties]);

  return (
    <div className='w-full lg:w-[1318px] flex justify-center flex-col mx-auto'>
      <FilterData onFilterChange={(newFilters) => setFilters(newFilters)} />

      {loadingInitial && properties.length === 0 && (
        <p className='text-center py-4'>Loading...</p>
      )}

      {!loadingInitial && properties.length === 0 && (
        <p className='text-center h-full py-8 text-gray-600 text-lg'>
          No listings found based on your filters.
        </p>
      )}

      {properties.length > 0 && (
        <PropertyList initialData={properties} filters={filters} />
      )}

      {loadingMore && (
        <div className='text-center py-4'>
          <div className='w-8 h-8 border-4 border-gray-300 border-t-[#005F82] rounded-full animate-spin mx-auto'></div>
        </div>
      )}
    </div>
  );
}
