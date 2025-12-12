import PropertyList from './PropertyList';
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

async function fetchProperties(page = 1) {
  const url =
    page === 1 ? `${_url}properties/` : `${_url}properties/?page=${page}`;

  const res = await fetch(url, { cache: 'no-store' });
  const text = await res.text();

  let data: RawProperty[];
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error('JSON Parse Error! Response is not JSON.');
    throw err;
  }

  return data.map((p) => ({
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
        ? p.Media.map((m, index) => ({
            MediaURL: `${m.MediaURL}${m.MediaName}`,
            Order: index + 1,
            RealURL: `${m.MediaURL}${m.MediaName}`,
          }))
        : [{ MediaURL: '/Image/default.jpg', Order: 1 }],
    MediaName: p.Media?.[0]?.MediaName ?? 'default.jpg',
  }));
}

export default async function Home() {
  const initialData = await fetchProperties(1);
  return <PropertyList initialData={initialData} />;
}
