'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

const homeTypes = Object.keys(homeTypeMap);

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

interface DropdownPortalProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  children: React.ReactNode;
}

function DropdownPortal({ anchorRef, children }: DropdownPortalProps) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [isReady, setIsReady] = useState(false);
  const [anchorWidth, setAnchorWidth] = useState(150);

  useEffect(() => {
    function updatePosition() {
      if (!anchorRef.current) return;

      const rect = anchorRef.current.getBoundingClientRect();

      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });

      setAnchorWidth(anchorRef.current.offsetWidth);

      setIsReady(true);
    }

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef]);

  if (!isReady) return null;

  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: coords.top,
        left: coords.left,
        zIndex: 9999,
        minWidth: anchorWidth, 
      }}
    >
      {children}
    </div>,
    document.body
  );
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
  const buttonRef = useRef<HTMLButtonElement | null>(null);

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
        ref={buttonRef}
        className='flex items-center font-normal leading-[28px] tracking-[0] text-[12px] lg:text-[16px] gap-2 h-[32px] lg:h-[48px] px-3 py-2 bg-white text-[#061B2E] rounded-[4px] cursor-pointer'
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
          className='ml-4 mr-2 lg:mr-0 lg:ml-6'
        />
      </button>

      {isOpen && (
        <DropdownPortal anchorRef={buttonRef}>
          <div className='p-2 border rounded bg-white shadow-md w-56 max-h-60 overflow-y-auto'>
            {filter.type === 'range' && (
              <div className='flex flex-col gap-3'>
                <div className='flex flex-col'>
                  <label className='text-[12px] lg:text-[16px] text-gray-700'>
                    Min {filter.name}
                  </label>
                  <input
                    type='number'
                    placeholder={`Enter Min ${filter.name}`}
                    onChange={(e) =>
                      handleRangeChange('min', filter.name, e.target.value)
                    }
                    value={filters[`min_${apiKeyMap[filter.name]}`] ?? ''}
                    className='w-full bg-white text-[#061B2E] border-b border-[#EBEBEB] px-0 py-1 placeholder:text-[12px] lg:placeholder:text-[16px]'
                  />
                </div>
                <div className='flex flex-col'>
                  <label className='text-[12px] lg:text-[16px] text-gray-700'>
                    Max {filter.name}
                  </label>
                  <input
                    type='number'
                    placeholder={`Enter Max ${filter.name}`}
                    onChange={(e) =>
                      handleRangeChange('max', filter.name, e.target.value)
                    }
                    value={filters[`max_${apiKeyMap[filter.name]}`] ?? ''}
                    className='w-full placeholder:text-[12px] lg:placeholder:text-[16px] bg-white text-[#061B2E] border-b border-[#EBEBEB] px-0 py-1'
                  />
                </div>
              </div>
            )}

            {filter.type === 'select' && (
              <div className='flex flex-col gap-1'>
                {homeTypes.map((label) => (
                  <div
                    key={label}
                    className='p-1 text-[#061B2E] text-[12px] lg:text-[16px] font-normal hover:bg-gray-200 rounded cursor-pointer'
                    onClick={() => handleSelectChange(homeTypeMap[label])}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DropdownPortal>
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

  const toggleFilter = (name: string | null) =>
    setOpenFilter(openFilter === name ? null : name);
  const hasAnyValue = Object.values(filters).some(
    (v) => v !== undefined && v !== ''
  );

  const applyFilters = () => onFilterChange?.(filters);

  return (
    <div className='w-full whitespace-nowrap flex-nowrap justify-between flex gap-1 rounded-[8px] p-5 bg-[#4D4D4D]/10 overflow-x-auto lg:overflow-x-visible'>
      <div className='flex items-center gap-2 font-semibold'>
        <Image
          src='/Image/icons/setting-config.svg'
          width={20}
          height={20}
          alt='filter icon'
        />
        <p className='text-[12px] lg:text-[16px] font-normal leading-[28px] tracking-[0] pr-1 text-[#4D4D4D]'>
          Filter
        </p>
        <div className='flex gap-2 z-50'>
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

      <div className='flex ml-10 lg:ml-0 items-center gap-2 lg:gap-4'>
        <button
          disabled={!hasAnyValue}
          onClick={() => {
            setFilters({});
            onFilterChange?.({});
          }}
          className={`px-3 flex items-center h-[32px] lg:h-[48px] font-normal leading-[28px] tracking-[0] text-white text-[12px] lg:text-[16px] transition
            ${
              hasAnyValue
                ? 'bg-gray-800 rounded-[4px] cursor-pointer'
                : 'bg-gray-400 rounded-[4px] cursor-not-allowed'
            }`}
        >
          <p>
          Reset
          </p>
        </button>
        <button
          disabled={!hasAnyValue}
          onClick={applyFilters}
          className={`px-5 flex items-center  h-[32px] lg:h-[48px] font-normal leading-[28px] tracking-[0]  text-[12px] lg:text-[16px] transition
            ${
              hasAnyValue
                ? ' rounded-[4px] bg-[#005F82] text-white cursor-pointer'
                : 'border-[#005F82] border border-3 text-[#005F82] rounded-[4px] cursor-not-allowed'
            }`}
        >
          <p>
          Apply
          </p>
        </button>
      </div>
    </div>
  );
}
