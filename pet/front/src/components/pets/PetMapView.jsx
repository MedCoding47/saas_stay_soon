import { useEffect, useRef, useMemo } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import LoadingSpinner from '../ui/LoadingSpinner';

const MAP_CENTER = { lat: 31.7917, lng: -7.0926 };
const MAP_ZOOM = 6;

function clusterPets(pets) {
  const map = {};
  pets.forEach(pet => {
    const lat = pet.companyProfile?.lat ?? pet.lat;
    const lng = pet.companyProfile?.lng ?? pet.lng;
    if (lat == null || lng == null) return;
    const key = `${lat},${lng}`;
    if (!map[key]) map[key] = { lat: parseFloat(lat), lng: parseFloat(lng), pets: [] };
    map[key].pets.push(pet);
  });
  return Object.values(map);
}

function PetMapInner({ clusters }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !window.google?.maps) return;

    const map = new window.google.maps.Map(containerRef.current, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapRef.current = map;

    const bounds = new window.google.maps.LatLngBounds();
    const markers = [];

    clusters.forEach(cluster => {
      const pos = { lat: cluster.lat, lng: cluster.lng };
      bounds.extend(pos);

      if (cluster.pets.length > 1) {
        const marker = new window.google.maps.Marker({
          position: pos,
          map,
          label: { text: `${cluster.pets.length}`, color: 'white', fontSize: '12px', fontWeight: 'bold' },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillColor: '#8B2500',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 3,
          },
        });

        marker.addListener('click', () => {
          map.panTo(pos);
          map.setZoom(14);
          if (infoRef.current) infoRef.current.close();
          const listHtml = cluster.pets.map(p => `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #eee;cursor:pointer" onclick="window.location.href='/pets/${p.id}'">
              ${p.imageUrl
                ? `<img src="${p.imageUrl}" style="width:40px;height:40px;border-radius:6px;object-fit:cover" />`
                : '<div style="width:40px;height:40px;border-radius:6px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:18px">🐾</div>'}
              <div><strong style="font-size:13px">${p.name}</strong><br/><span style="font-size:11px;color:#666">${p.breed || ''}</span></div>
            </div>
          `).join('');
          infoRef.current = new window.google.maps.InfoWindow({
            content: `<div style="font-family:system-ui,sans-serif;max-height:220px;overflow-y:auto;min-width:180px"><strong style="font-size:13px;color:#8B2500">${cluster.pets.length} pets</strong>${listHtml}</div>`
          });
          infoRef.current.open(map, marker);
        });

        markers.push(marker);
      } else {
        const pet = cluster.pets[0];
        const marker = new window.google.maps.Marker({
          position: pos,
          map,
          label: { text: '\u{1F43E}', fontSize: '14px' },
          animation: window.google.maps.Animation.DROP,
        });

        marker.addListener('click', () => {
          map.panTo(pos);
          map.setZoom(14);
          if (infoRef.current) infoRef.current.close();
          const statusColor = pet.status === 'Available' ? '#d1fae5' : '#fef3c7';
          const statusTextColor = pet.status === 'Available' ? '#065f46' : '#92400e';
          const content = `
            <div style="font-family:system-ui,sans-serif;min-width:200px">
              <div style="display:flex;gap:12px">
                ${pet.imageUrl
                  ? `<img src="${pet.imageUrl}" style="width:80px;height:80px;border-radius:8px;object-fit:cover" />`
                  : '<div style="width:80px;height:80px;border-radius:8px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:28px">🐾</div>'}
                <div>
                  <strong style="color:#8B2500;font-size:14px">${pet.name}</strong>
                  <p style="margin:2px 0;font-size:12px;color:#666">${[pet.breed, pet.age ? `${pet.age} yrs` : ''].filter(Boolean).join(' · ')}</p>
                  <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:500;background:${statusColor};color:${statusTextColor}">${pet.status || 'Available'}</span>
                </div>
              </div>
              <a href="/pets/${pet.id}" style="display:block;margin-top:8px;font-size:12px;color:#8B2500;font-weight:500;text-decoration:none">View Profile →</a>
            </div>
          `;
          infoRef.current = new window.google.maps.InfoWindow({ content });
          infoRef.current.open(map, marker);
        });

        markers.push(marker);
      }
    });

    markersRef.current = markers;

    if (clusters.length > 0) {
      map.fitBounds(bounds, 50);
    }

    return () => {
      markers.forEach(m => m.setMap(null));
    };
  }, [clusters]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

function renderStatus(status) {
  if (status === 'LOADING') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
        <LoadingSpinner text="Loading map..." />
      </div>
    );
  }
  if (status === 'FAILURE') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
        <p className="text-sm text-muted">Failed to load map. Please try again.</p>
      </div>
    );
  }
  return null;
}

export default function PetMapView({ pets }) {
  const clusters = useMemo(() => clusterPets(pets), [pets]);

  if (clusters.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: 'calc(100vh - 280px)' }}>
        <p className="text-muted text-sm">No location data available for these pets</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-warm-dark" style={{ height: 'calc(100vh - 280px)' }}>
      <Wrapper
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY || ''}
        render={renderStatus}
      >
        <PetMapInner clusters={clusters} />
      </Wrapper>
    </div>
  );
}
