'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import PropertyCards from '@/components/PropertyCards';
import PropertyMap from '@/components/PropertyMap';
const _url = process.env.NEXT_PUBLIC_BASE_URL;

interface MediaItem {
  MediaURL: string;
}
interface Property {
  ListingKey: string;
  StreetNumber: string;
  StreetName: string;
  StreetSuffix: string;
  City?: string;
  StateOrProvince?: string;
  ListPrice?: number;
  Media?: MediaItem[];
  YearBuilt?: number;
  BedroomsTotal?: number;
  BathroomsFull?: number;
  BathroomsTotalInteger?: number;
  LivingArea?: number;
  BuildingAreaTotal?: number;
  PublicRemarks?: string;
  SubdivisionName?: string;
  MlsStatus?: string;
  Levels?: string[];
  ExteriorFeatures?: string[];
  ListingId?: number;
  ParkingTotal?: number;
  PropertySubType?: string;
  Latitude?: number;
  Longitude?: number;
}
interface PropertyDetails {
  MlsStatus?: string;
  YearBuiltEffective?: number | string;
  PropertySubType?: string[];
  ListingContractDate?: string;
}

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [propertyData, setPropertyData] = useState<PropertyDetails>({
    MlsStatus: '---',
    YearBuiltEffective: '---',
    PropertySubType: ['---'],
    ListingContractDate: '---',
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${_url}properties/${id}`);
        const data = await res.json();

        setProperty({
          ListingKey: data.ListingKey,
          StreetName: data.Data.StreetName,
          StreetNumber: data.Data.StreetNumber,
          StreetSuffix: data.Data.StreetSuffix,
          City: data.Data.City,
          StateOrProvince: data.Data.StateOrProvince,
          ListPrice: data.Data.ListPrice,
          YearBuilt: data.Data.YearBuilt,
          BedroomsTotal: data.Data.BedroomsTotal,
          BathroomsFull: data.Data.BathroomsTotalInteger,
          BathroomsTotalInteger: data.Data.BathroomsTotalInteger,
          BuildingAreaTotal: data.Data.BuildingAreaTotal,
          LivingArea: data.Data.BuildingAreaTotal,
          PublicRemarks: data.Data.PublicRemarks,
          SubdivisionName: data.Data.SubdivisionName,
          MlsStatus: data.Data.MlsStatus,
          Levels: data.Data.Levels,
          ExteriorFeatures: data.Data.ExteriorFeatures,
          ListingId: data.Data.ListingId,
          ParkingTotal: data.Data.ParkingTotal,
          PropertySubType: data.Data.PropertySubType,
          Latitude: data.Data.Latitude,
          Longitude: data.Data.Longitude,
        });

        setPropertyData({
          MlsStatus: data.Data.MlsStatus || '---',
          YearBuiltEffective: data.Data.YearBuilt || '---',
          PropertySubType: data.Data.PropertySubType
            ? data.Data.PropertySubType
            : ['---'],
          ListingContractDate: data.Data.ListingContractDate || '---',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='w-10 h-10 border-4 border-gray-300 border-t-[#005F82] rounded-full animate-spin'></div>
      </div>
    );
  }

  if (!property)
    return <p className='text-center h-[20vh] mt-10'>Property not found.</p>;

  return (
    <main className='bg-[#EBEBEB] min-h-screen'>
      <div className='md:max-w-[1318px] mx-auto rounded-lg'>
        <div className='max-w-[768px]'>
          <div className=' '>
            <div className='flex  flex-wrap items-center gap-2 text-gray-700 text-sm'>
              <span className='bg-[#fff] flex items-center w-fit h-[32px] rounded-[4px] px-2 py-1'>
                <Image
                  src='/Image/icons/ruler.svg'
                  alt='Ruler icon'
                  width={20}
                  height={20}
                  className='mr-2'
                />
                <p className='text-[14px] font-semibold leading-[100%] tracking-[0]'>
                  {property.BuildingAreaTotal
                    ? property.BuildingAreaTotal.toLocaleString()
                    : '---'}{' '}
                  sqft
                </p>
              </span>

              <span className='bg-[#fff] flex items-center w-fit h-[32px] px-2 py-1 rounded-lg'>
                <Image
                  src='/Image/icons/single-bed.svg'
                  alt='Bed icon'
                  width={20}
                  height={20}
                  className='mr-2'
                />
                <p className='text-[14px] font-semibold leading-[100%] tracking-[0]'>
                  {property.BathroomsTotalInteger ?? '---'}
                </p>
              </span>

              <span className='bg-[#fff] flex items-center w-fit h-[32px] px-2 py-1 rounded-lg'>
                <Image
                  src='/Image/icons/shower-head.svg'
                  alt='Shower icon'
                  width={20}
                  height={20}
                  className='mr-2'
                />
                <p className='text-[14px] font-semibold leading-[100%] tracking-[0]'>
                  {property.BathroomsFull ?? '---'}
                </p>
              </span>
            </div>

            <div className='mt-10 space-y-3'>
              <h1
                className='lg:text-[40px] font-semibold leading-[100%] tracking-[0] text-[28px]'
                style={{
                  background: 'linear-gradient(90deg, #061B2E 0%, #005F82 20%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {property.StreetNumber} {property.StreetName}{' '}
                {property.StreetSuffix}
              </h1>
              <p className='text-[#4d4d4d]  font-normal leading-[32px] tracking-[0] text-[16px] lg:text-[20px]'>
                {property.SubdivisionName} {property.City}
              </p>

              <p className='text-[20px] font-bold  leading-[100%] tracking-[0] lg:text-[24px] flex items-center text-[#005F82]'>
                $
                {property.ListPrice
                  ? property.ListPrice.toLocaleString('en-CA')
                  : '---'}
              </p>
            </div>
          </div>
          <PropertyCards property={propertyData} />

          <div className='flex w-fit flex-col'>
            <h2
              className='text-[26px] mb-10 leading-[100%] tracking-[0] font-semibold lg:text-[40px] '
              style={{
                background: 'linear-gradient(90deg, #061B2E 0%, #005F82 20%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Overview
            </h2>
            <p className='text-[14px]  leading-[28px] font-normal tracking-[0] lg:text-[16px] text-[#4d4d4d]'>
              {' '}
              {property.PublicRemarks || 'No legal description available'}
            </p>
          </div>

          <div className='py-10'>
            <h2
              className='text-[26px] mb-10 leading-[100%] font-semibold tracking-[0] lg:text-[40px]'
              style={{
                background: 'linear-gradient(90deg, #061B2E 0%, #005F82 20%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Location
            </h2>
            {property?.Latitude != null && property?.Longitude != null && (
              <PropertyMap
                lat={Number(property.Latitude)}
                lng={Number(property.Longitude)}
              />
            )}
          </div>

          <div>
            <h2
              className='text-[26px] font-semibold leading-[100%] mb-10 tracking-[0] lg:text-[40px]'
              style={{
                background: 'linear-gradient(90deg, #061B2E 0%, #005F82 20%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Additional information
            </h2>

            <div className='flex gap-4'>
              <div className='flex-1'>
                {[
                  {
                    title: 'Name',
                    value:
                      property.StreetNumber &&
                      property.StreetName &&
                      property.StreetSuffix
                        ? `${property.StreetNumber} ${property.StreetName} ${property.StreetSuffix}`
                        : '---',
                  },
                  { title: 'City', value: property.City ?? '---' },
                  {
                    title: 'Subarea',
                    value: property.SubdivisionName ?? '---',
                  },
                  {
                    title: 'Price',
                    value: property.ListPrice
                      ? `$${property.ListPrice.toLocaleString()}`
                      : '---',
                  },
                  {
                    title: 'Levels',
                    value:
                      property.Levels && property.Levels.length > 0
                        ? property.Levels.join(', ')
                        : '---',
                  },
                  {
                    title: 'Exterior Features',
                    value:
                      property.ExteriorFeatures &&
                      property.ExteriorFeatures.length > 0
                        ? property.ExteriorFeatures.join(', ')
                        : '---',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className='flex flex-col justify-between py-2 border-b border-gray-300'
                  >
                    <span className='text-[#4D4D4D]  font-normal leading-[28px] tracking-[0] pb-2 text-[16px]'>
                      {item.title}
                    </span>
                    <span className='text-[#061B2E]  leading-[28px] tracking-[0] text-[16px] font-semibold'>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className='flex-1'>
                {[
                  {
                    title: 'Listing Status',
                    value: property.MlsStatus ?? '---',
                  },
                  {
                    title: 'Bathrooms',
                    value: property.BathroomsTotalInteger ?? '---',
                  },
                  { title: 'Bedrooms', value: property.BedroomsTotal ?? '---' },
                  {
                    title: 'Building Type',
                    value: property.PropertySubType ?? '---',
                  },
                  {
                    title: 'ParkingTotal',
                    value: property.ParkingTotal ?? '---',
                  },
                  { title: 'ListingId', value: property.ListingId ?? '---' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className='flex flex-col justify-between py-2 border-b border-gray-300'
                  >
                    <span className='text-[#4D4D4D] tracking-[0] leading-[28px] pb-2 text-[16px]'>
                      {item.title}
                    </span>
                    <span className='text-[#061B2E] tracking-[0] leading-[28px] text-[16px] font-semibold'>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
