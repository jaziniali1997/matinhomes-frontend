'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import PropertyCards from '@/components/PropertyCards';
import { GoogleMap } from '@react-google-maps/api';
import PropertyMap from '@/components/PropertyMap';
const _url = process.env.NEXT_PUBLIC_BASE_URL;

interface MediaItem {
  MediaURL: string;
}
interface Card {
  id: number;
  title: string;
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
  const [showGallery, setShowGallery] = useState(false);
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [propertyData, setPropertyData] = useState<PropertyDetails>({
    MlsStatus: 'N/A',
    YearBuiltEffective: 'N/A',
    PropertySubType: ['N/A'],
    ListingContractDate: 'N/A',
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

        const imgs = (data.MediaNames || []).map(
          (name: string) => `${data.MediaURL}${name}`
        );

        setImages(imgs);

        setPropertyData({
          MlsStatus: data.Data.MlsStatus || 'N/A',
          YearBuiltEffective: data.Data.YearBuilt || 'N/A',
          PropertySubType: data.Data.PropertySubType
            ? data.Data.PropertySubType
            : ['N/A'],
          ListingContractDate: data.Data.ListingContractDate || 'N/A',
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
    return <p className='text-center mt-10'>Property not found.</p>;

  const photosCount = images.length;

  return (
    <main className='bg-[#EBEBEB] min-h-screen px-[16px] lg:px-[120px]'>
      <div className='max-w-[1200px] mx-auto rounded-lg'>
        <div className='max-w-[793px]'>
          <div className=' '>
            <div className='flex pt-5 flex-wrap items-center gap-2 text-gray-700 text-sm'>
              <span className='bg-[#fff] flex items-center w-fit h-[32px] rounded-[4px] px-2 py-1'>
                <img className='mr-2' src='/Image/icons/ruler.svg' alt='' />
                {property.BuildingAreaTotal
                  ? property.BuildingAreaTotal.toLocaleString()
                  : 'N/A'}{' '}
                sqft
              </span>

              <span className='bg-[#fff] flex items-center w-fit h-[32px] px-2 py-1 rounded-lg'>
                <img
                  className='mr-2'
                  src='/Image/icons/single-bed.svg'
                  alt=''
                />
                {property.BathroomsTotalInteger ?? 'N/A'}
              </span>

              <span className='bg-[#fff] flex items-center w-fit h-[32px] px-2 py-1 rounded-lg'>
                <img
                  className='mr-2'
                  src='/Image/icons/shower-head.svg'
                  alt=''
                />
                {property.BathroomsFull ?? 'N/A'}
              </span>
            </div>

            <div className='mt-10 space-y-3'>
              <h1
                className='lg:text-[40px] text-[26px] font-bold'
                style={{
                  background:
                    'linear-gradient(90deg, #061B2E 0%, #005F82 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {property.StreetNumber} {property.StreetName}{' '}
                {property.StreetSuffix}
              </h1>
              <p className='text-[#4d4d4d] text-[16px] lg:text-[20px]'>
                {property.SubdivisionName} {property.City}
              </p>

              <p className='text-[20px] lg:text-[24px] flex items-center text-[#005F82]'>
                {/* <span className='text-[#4d4d4d] mr-2 font-bold text-[14px] lg:text-[16px]'>
                  Last listed from
                </span> */}
                $
                {property.ListPrice
                  ? property.ListPrice.toLocaleString('en-CA')
                  : 'N/A'}
              </p>
            </div>
          </div>
          <PropertyCards property={propertyData} />

          <div className='flex w-fit flex-col'>
            <h2
              className='text-[26px] lg:text-[40px] '
              style={{
                background: 'linear-gradient(90deg, #061B2E 0%, #005F82 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Overview
            </h2>
            <p className='text-[14px] lg:text-[16px] text-[#4d4d4d]'>
              {' '}
              {property.PublicRemarks || 'No legal description available'}
            </p>
          </div>

          <div className='py-10'>
            <h2
              className='text-[26px] lg:text-[40px]'
              style={{
                background: 'linear-gradient(6deg, #061B2E 10%, #005F82 100%)',
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
              className='text-[26px] lg:text-[40px] mb-4'
              style={{
                background: 'linear-gradient(90deg, #061B2E 0%, #005F82 100%)',
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
                    value: property.ListPrice ?? '---',
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
                    <span className='text-[#4D4D4D] pb-2 text-[16px]'>
                      {item.title}
                    </span>
                    <span className='text-[#061B2E] text-[16px] font-semibold'>
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
                    <span className='text-[#4D4D4D] pb-2 text-[16px]'>
                      {item.title}
                    </span>
                    <span className='text-[#061B2E] text-[16px] font-semibold'>
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
