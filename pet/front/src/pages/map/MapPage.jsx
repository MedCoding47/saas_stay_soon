import { useState, useEffect, useRef, useCallback } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const MAP_CENTER = { lat: 31.7917, lng: -7.0926 };
const MAP_ZOOM = 6;

function buildInfoContent(loc) {
  const name = loc.displayName || loc.companyName || loc.clinicName || '';
  const mapsUrl = loc.googleMapsUrl || `https://maps.google.com/maps?q=${loc.lat},${loc.lng}&z=15`;
  return `
    <div style="font-family: system-ui, sans-serif; padding: 4px 8px; max-width: 240px;">
      <strong style="font-size: 14px; color: #1a1a2e;">${name}</strong>
      <p style="margin: 4px 0 0; font-size: 12px; color: #666;">${loc.location || ''}</p>
      ${loc.phone ? `<p style="margin: 2px 0 0; font-size: 12px; color: #666;">📞 ${loc.phone}</p>` : ''}
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
         style="display: inline-block; margin-top: 6px; font-size: 12px; color: #8B2500; font-weight: 500; text-decoration: none;">
        View on Google Maps &rarr;
      </a>
    </div>
  `;
}

function MapView({ companies, vets, onMapReady }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
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

    const all = {};

    const make = (item, type) => {
      const id = `${type}-${item.id || item.companyName || item.clinicName || ''}`;
      if (!item.lat || !item.lng) return;
      const pos = { lat: parseFloat(item.lat), lng: parseFloat(item.lng) };

      const pin = type === 'company'
        ? 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
        : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';

      const marker = new window.google.maps.Marker({
        position: pos,
        map,
        title: item.displayName || item.companyName || item.clinicName,
        icon: { url: pin, scaledSize: new window.google.maps.Size(40, 40) },
        animation: window.google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        map.panTo(pos);
        map.setZoom(14);
        if (infoRef.current) infoRef.current.close();
        const content = buildInfoContent(item);
        infoRef.current = new window.google.maps.InfoWindow({ content });
        infoRef.current.open(map, marker);
        onMapReady?.('select', id);
      });

      all[id] = marker;
    };

    companies.forEach(c => make({ ...c, displayName: c.companyName }, 'company'));
    vets.forEach(v => make({ ...v, displayName: v.clinicName }, 'vet'));

    markersRef.current = all;
    onMapReady?.('ready', { map, markers: all, infoWindow: infoRef });

    return () => {
      Object.values(all).forEach(m => m.setMap(null));
    };
  }, [companies, vets]);

  return <div ref={containerRef} className="w-full h-full" />;
}

const renderStatus = (status) => {
  if (status === 'LOADING') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-warm">
        <LoadingSpinner />
      </div>
    );
  }
  return null;
};

export default function MapPage() {
  const [companies, setCompanies] = useState([]);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const apiRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get('/public/companies'),
      api.get('/public/veterinaires'),
    ]).then(([cRes, vRes]) => {
      if (cancelled) return;
      setCompanies(Array.isArray(cRes.data) ? cRes.data : []);
      setVets(Array.isArray(vRes.data) ? vRes.data : []);
    }).catch(() => {
      if (!cancelled) setError('Failed to load locations. Please try again.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleMapReady = useCallback((type, payload) => {
    if (type === 'ready') {
      apiRef.current = payload;
    }
  }, []);

  const focusLocation = useCallback((loc) => {
    const id = `${loc.type}-${loc.id || loc.companyName || loc.clinicName || ''}`;
    setSelectedId(id);
    const { map, markers, infoWindow } = apiRef.current || {};
    if (!map) return;
    const marker = markers?.[id];
    if (!marker) return;
    const pos = marker.getPosition();
    map.panTo(pos);
    map.setZoom(14);
    if (infoWindow.current) infoWindow.current.close();
    const content = buildInfoContent(loc);
    infoWindow.current = new window.google.maps.InfoWindow({ content });
    infoWindow.current.open(map, marker);
  }, []);

  const allLocations = [
    ...companies.map(c => ({ ...c, type: 'company', displayName: c.companyName })),
    ...vets.map(v => ({ ...v, type: 'vet', displayName: v.clinicName })),
  ];

  const filtered = allLocations.filter(loc => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (loc.displayName || '').toLowerCase().includes(q)
        || (loc.location || '').toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <PageTransition>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '64px' }}>
          <LoadingSpinner />
        </div>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <main style={{ paddingTop: '64px' }} className="min-h-screen bg-warm">
        <div className="flex">
          <aside className="w-80 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
            <div className="p-4 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search by name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input text-sm"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {error && (
                <div className="p-3 m-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}
              {filtered.length === 0 && !error && (
                <p className="text-center text-muted text-sm py-12">No locations match your search.</p>
              )}
              {filtered.map((loc, i) => {
                const id = `${loc.type}-${loc.id || loc.companyName || loc.clinicName || i}`;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => focusLocation(loc)}
                    className={`p-3 rounded-xl cursor-pointer transition-all mb-1 ${
                      selectedId === id
                        ? 'bg-coral/10 border border-coral/30'
                        : 'hover:bg-warm border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{loc.displayName}</h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
                        loc.type === 'company'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-teal-light text-teal-dark'
                      }`}>
                        {loc.type === 'company' ? 'Shelter' : 'Clinic'}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate">{loc.location}</p>
                    {loc.phone && <p className="text-xs text-muted mt-0.5 truncate">{loc.phone}</p>}
                  </motion.div>
                );
              })}
            </div>
          </aside>

          <div className="flex-1 relative" style={{ height: 'calc(100vh - 64px)' }}>
            <Wrapper
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY || ''}
              render={renderStatus}
            >
              <MapView
                companies={companies}
                vets={vets}
                onMapReady={handleMapReady}
              />
            </Wrapper>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
