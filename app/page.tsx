import PropertyList from './PropertyList';
const _url = process.env.NEXT_PUBLIC_BASE_URL;

async function fetchProperties(page = 1) {
  const res = await fetch(
    page === 1 ? `${_url}properties/` : `${_url}properties/?page=${page}`
  );

  const data = await res.json();

  return data.map((p: any) => ({
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
}

export default async function Home() {
  const initialData = await fetchProperties(1);
  return <PropertyList initialData={initialData} />;
}
