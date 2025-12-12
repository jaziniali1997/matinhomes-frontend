'use client';
import Image from 'next/image';

interface PropertyDetails {
  MlsStatus?: string;
  YearBuiltEffective?: number | string;
  PropertySubType?: string[];
  ListingContractDate?: string;
}

interface Props {
  property: PropertyDetails;
}

export default function PropertyCards({ property }: Props) {
  const cards = [
    {
      id: 1,
      title: 'Listing Status',
      value: property.MlsStatus || 'N/A',
      img: '/Image/icons/check-one.svg',
    },
    {
      id: 2,
      title: 'Built in',
      value: property.YearBuiltEffective || 'N/A',
      img: '/Image/icons/calendar-three.svg',
    },
    {
      id: 3,
      title: 'Building Type',
      value: property.PropertySubType || 'N/A',
      img: '/Image/icons/city-one.svg',
    },
    {
      id: 4,
      title: 'Builder Name',
      value: property.ListingContractDate || 'N/A',
      img: '/Image/icons/compass.svg',
    },
  ];

  return (
    <div className='my-10 w-fit grid grid-cols-2 md:grid-cols-4 gap-2'>
      {cards.map((card) => (
        <div
          key={card.id}
          className='bg-white rounded-[8px] flex flex-col items-start p-2 shadow-sm w-[160px] lg:w-[192px] h-[113px]'
        >
          <Image
            src={card.img}
            alt={card.title}
            width={24}
            height={24}
            className='mb-5'
          />
          <h2 className='text-[12px] text-[#4D4D4D]'>{card.title}</h2>
          <p className='text-[15px] mt-2 text-[#061B2E] font-semibold'>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
