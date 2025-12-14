'use client';
import { useState } from 'react';
import Image from 'next/image';
import downIcon from '../public/Image/icons/down.svg';
import upIcon from '../public/Image/icons/up.svg';

const homeTypeMap: Record<string, string> = {
  'Single Family Residence': 'Single_Family_Residence',
  Townhouse: 'Townhouse',
  'Apartment/Condo': 'Apartment/Condo',
  'Half Duplex': 'Half_Duplex',
  'Manufactured Home': 'Manufactured_Home',
  'Manufactured On Land': 'Manufactured_On_Land',
  Duplex: 'Duplex',
  Quadruplex: 'Quadruplex',
  Recreational: 'Recreational',
  Other: 'Other',
};

const homeTypes = [
  'Single Family Residence',
  'Townhouse',
  'Apartment/Condo',
  'Half Duplex',
  'Manufactured Home',
  'Manufactured On Land',
  'Duplex',
  'Quadruplex',
  'Recreational',
  'Other',
];

type FilterType =
  | { name: string; type: 'range' }
  | { name: string; type: 'select'; options: string[] };

const filtersData: FilterType[] = [
  { name: 'Year Built', type: 'range' },
  { name: 'Area', type: 'range' },
  { name: 'Home Type', type: 'select', options: homeTypes },
  { name: 'Bath', type: 'range' },
  { name: 'Beds', type: 'range' },
  { name: 'Price', type: 'range' },
];

interface FiltersState {
  [key: string]: number | string | undefined;
}

interface FilterItemProps {
  filter: FilterType;
  openFilter: string | null;
  toggleFilter: (name: string | null) => void;
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
}

function FilterItem({
  filter,
  openFilter,
  toggleFilter,
  filters,
  setFilters,
}: FilterItemProps) {
  const isOpen = openFilter === filter.name;

  const apiKeyMap: Record<string, string> = {
    'Year Built': 'year_built',
    Area: 'area',
    Bath: 'bathrooms',
    Beds: 'rooms',
    Price: 'price',
  };

  const handleRangeChange = (
    type: 'min' | 'max',
    label: string,
    value: string
  ) => {
    const apiKey = apiKeyMap[label];
    if (!apiKey) return;

    setFilters({
      ...filters,
      [`${type}_${apiKey}`]: value ? Number(value) : undefined,
    });
  };

  const handleSelectChange = (value: string) => {
    setFilters({ ...filters, property_type: value });
    toggleFilter(null);
  };

  return (
    <div className='relative'>
      <button
        className='flex items-center font-normal leading-[28px] tracking-[0] text-[16px] gap-2 h-[48px] px-3 py-2 bg-white text-[#061B2E] rounded-[4px] cursor-pointer'
        onClick={() => toggleFilter(filter.name)}
      >
        {filter.type === 'select' && filters.property_type
          ? filters.property_type
          : filter.name}
        <Image
          src={isOpen ? upIcon : downIcon}
          alt={isOpen ? 'up arrow' : 'down arrow'}
          width={12}
          height={12}
          className='ml-6'
        />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 p-2 border rounded bg-white shadow-md w-56 max-h-60 overflow-y-auto z-50'>
          {filter.type === 'range' && (
            <div className='flex flex-col gap-3'>
              <>
                <div className='flex flex-col'>
                  <label className='text-sm text-gray-700'>
                    Min {filter.name} *
                  </label>
                  <input
                    type='number'
                    placeholder={`Enter Min ${filter.name}`}
                    onChange={(e) =>
                      handleRangeChange('min', filter.name, e.target.value)
                    }
                    value={filters[`min_${apiKeyMap[filter.name]}`] ?? ''}
                    className='w-full bg-white text-[#061B2E] border-b border-[#EBEBEB] px-0 py-1'
                  />
                </div>

                <div className='flex flex-col'>
                  <label className='text-sm text-gray-700'>
                    Max {filter.name} *
                  </label>
                  <input
                    type='number'
                    placeholder={`Enter Max ${filter.name}`}
                    onChange={(e) =>
                      handleRangeChange('max', filter.name, e.target.value)
                    }
                    value={filters[`max_${apiKeyMap[filter.name]}`] ?? ''}
                    className='w-full bg-white text-[#061B2E] border-b border-[#EBEBEB] px-0 py-1'
                  />
                </div>
              </>
            </div>
          )}

          {filter.type === 'select' && (
            <div className='flex flex-col gap-1'>
              {homeTypes.map((label) => (
                <div
                  key={label}
                  className='p-1 text-[#061B2E] font-normal hover:bg-gray-200 rounded cursor-pointer'
                  onClick={() => handleSelectChange(homeTypeMap[label])}
                >
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface FiltersProps {
  onFilterChange?: (filters: FiltersState) => void;
}

export default function Filters({ onFilterChange }: FiltersProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersState>({});

  const toggleFilter = (name: string | null) => {
    setOpenFilter(openFilter === name ? null : name);
  };

  const hasAnyValue = Object.values(filters).some(
    (v) => v !== undefined && v !== ''
  );

  const applyFilters = () => {
    if (onFilterChange) onFilterChange(filters);
  };

  return (
    <div className='w-full justify-between flex gap-1 rounded-[8px] p-5 mt-10 bg-[#4D4D4D]/10'>
      <div className='flex items-center gap-2 font-semibold'>
        <Image
          src='/Image/icons/setting-config.svg'
          width={20}
          height={20}
          alt='filter icon'
        />
        <p className='text-[16px] font-normal leading-[28px] tracking-[0]  pr-1 text-[#4D4D4D]'>Filter</p>
        <div className='flex flex-wrap gap-2'>
          {filtersData.map((filter) => (
            <FilterItem
              key={filter.name}
              filter={filter}
              openFilter={openFilter}
              toggleFilter={toggleFilter}
              filters={filters}
              setFilters={setFilters}
            />
          ))}
        </div>
      </div>

      <div className='flex items-center  gap-4'>
        <button
          disabled={!hasAnyValue}
          onClick={() => {
            setFilters({});
            if (onFilterChange) onFilterChange({});
          }}
          className={`px-3 py-3 h-[48px] font-normal leading-[28px] tracking-[0] text-white  transition
      ${
        hasAnyValue
          ? 'bg-gray-600 rounded-[4px] cursor-pointer'
          : 'bg-gray-300 rounded-[4px] cursor-not-allowed'
      }`}
        >
          Reset
        </button>
        <button
          disabled={!hasAnyValue}
          onClick={applyFilters}
          className={`px-5 py-3 h-[48px] font-normal leading-[28px] tracking-[0] text-white transition 
      ${
        hasAnyValue
          ? 'bg-[#005F82] rounded-[4px] cursor-pointer'
          : 'bg-gray-400 rounded-[4px] cursor-not-allowed'
      }`}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
