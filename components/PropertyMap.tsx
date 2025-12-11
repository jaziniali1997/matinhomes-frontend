'use client';

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useCallback, useState } from 'react';

interface Props {
  lat: number;
  lng: number;
}

export default function PropertyMap({ lat, lng }: Props) {
  const [mapLoaded, setMapLoaded] = useState(false);

  const containerStyle = {
    width: '100%',
    height: '200px',
  };

  const center = { lat, lng };

  const handleLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={handleLoad}
      >
        {mapLoaded && (
          <Marker
            position={{ lat, lng }}
            icon={{
              url: '/Image/icons/pin.svg',
              scaledSize: new google.maps.Size(40, 40),
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}
