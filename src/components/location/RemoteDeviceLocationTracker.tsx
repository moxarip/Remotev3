import React, { useState, useEffect, useRef } from 'react';
import { useClouvea } from '../../context/ClouveaContext';
import {
  MapPin,
  Navigation,
  Compass,
  Radio,
  RotateCw,
  ExternalLink,
  Copy,
  Check,
  BellRing,
  Battery,
  BatteryCharging,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Layers,
  Smartphone,
  Server,
  Share2
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Haversine formula to calculate distance in meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatDistance(meters: number, language: string): string {
  if (meters < 1000) {
    return language === 'ar' ? `${meters} متر` : `${meters} m`;
  }
  const km = (meters / 1000).toFixed(2);
  return language === 'ar' ? `${km} كم` : `${km} km`;
}

export const RemoteDeviceLocationTracker: React.FC = () => {
  const {
    activeNode,
    devices,
    setActiveNodeId,
    controllerDevice,
    requestDeviceLocation,
    toggleLiveTracking,
    isTrackingActive,
    ringDevice,
    stopRinging,
    isRingingDeviceId,
    t,
    language,
    showToast
  } = useClouvea();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const targetMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const controllerMarkerRef = useRef<L.Marker | null>(null);
  const connectionLineRef = useRef<L.Polyline | null>(null);

  const [copiedCoords, setCopiedCoords] = useState(false);
  const [mapStyle, setMapStyle] = useState<'dark' | 'street'>('dark');
  const [tileLayerRef, setTileLayerRef] = useState<L.TileLayer | null>(null);

  const nodeLocation = activeNode.location || {
    latitude: 24.7178,
    longitude: 46.6792,
    accuracy: 8,
    altitude: 615,
    speed: 0,
    heading: 120,
    timestamp: Date.now(),
    source: 'gps' as const
  };

  const controllerLocation = controllerDevice?.location || {
    latitude: 24.7136,
    longitude: 46.6753,
    accuracy: 5,
    timestamp: Date.now(),
    source: 'gps' as const
  };

  const distanceMeters = calculateDistanceMeters(
    controllerLocation.latitude,
    controllerLocation.longitude,
    nodeLocation.latitude,
    nodeLocation.longitude
  );

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [nodeLocation.latitude, nodeLocation.longitude],
        zoom: 16,
        zoomControl: true,
        attributionControl: false
      });

      // Dark style tile layer (CartoDB Dark Matter)
      const tileUrl =
        mapStyle === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tiles = L.tileLayer(tileUrl, {
        maxZoom: 19
      }).addTo(map);

      setTileLayerRef(tiles);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Custom Target Node Marker (Glowing Radar Icon)
    const nodeIcon = L.divIcon({
      className: 'custom-node-pin',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; background: rgba(29, 153, 243, 0.35); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 28px; height: 28px; background: #1d99f3; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    if (targetMarkerRef.current) {
      targetMarkerRef.current.setLatLng([nodeLocation.latitude, nodeLocation.longitude]);
    } else {
      targetMarkerRef.current = L.marker([nodeLocation.latitude, nodeLocation.longitude], {
        icon: nodeIcon
      }).addTo(map);
    }

    // Accuracy Circle
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng([nodeLocation.latitude, nodeLocation.longitude]);
      accuracyCircleRef.current.setRadius(nodeLocation.accuracy || 15);
    } else {
      accuracyCircleRef.current = L.circle([nodeLocation.latitude, nodeLocation.longitude], {
        radius: nodeLocation.accuracy || 15,
        color: '#3daee9',
        fillColor: '#1d99f3',
        fillOpacity: 0.18,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map);
    }

    // Controller Marker
    const controllerIcon = L.divIcon({
      className: 'custom-controller-pin',
      html: `
        <div style="width: 24px; height: 24px; background: #10b981; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 3px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
          <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    if (controllerMarkerRef.current) {
      controllerMarkerRef.current.setLatLng([controllerLocation.latitude, controllerLocation.longitude]);
    } else {
      controllerMarkerRef.current = L.marker([controllerLocation.latitude, controllerLocation.longitude], {
        icon: controllerIcon
      }).addTo(map);
    }

    // Connection Polyline between Controller and Node
    const polylineCoords: [number, number][] = [
      [controllerLocation.latitude, controllerLocation.longitude],
      [nodeLocation.latitude, nodeLocation.longitude]
    ];

    if (connectionLineRef.current) {
      connectionLineRef.current.setLatLngs(polylineCoords);
    } else {
      connectionLineRef.current = L.polyline(polylineCoords, {
        color: '#38bdf8',
        weight: 2,
        dashArray: '6, 8',
        opacity: 0.75
      }).addTo(map);
    }

    // Smoothly pan to target position
    map.panTo([nodeLocation.latitude, nodeLocation.longitude], { animate: true, duration: 0.8 });
  }, [nodeLocation, controllerLocation, mapStyle]);

  const handleCopyCoords = () => {
    const text = `${nodeLocation.latitude.toFixed(6)}, ${nodeLocation.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    showToast(language === 'ar' ? 'تم نسخ الإحداثيات الجغرافية بنجاح' : 'Coordinates copied to clipboard');
    setTimeout(() => setCopiedCoords(false), 2200);
  };

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${nodeLocation.latitude},${nodeLocation.longitude}`;
    window.open(url, '_blank');
  };

  const handleShareLocation = () => {
    const text = `موقع هاتف ${activeNode.name}: https://www.google.com/maps?q=${nodeLocation.latitude},${nodeLocation.longitude}`;
    if (navigator.share) {
      navigator.share({
        title: `موقع ${activeNode.name}`,
        text
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast(language === 'ar' ? 'تم نسخ رابط الموقع' : 'Location link copied');
    }
  };

  const accuracyBadgeText =
    nodeLocation.accuracy <= 10
      ? language === 'ar' ? 'دقة ممتازة (±' + nodeLocation.accuracy + 'م)' : `Excellent (±${nodeLocation.accuracy}m)`
      : nodeLocation.accuracy <= 25
      ? language === 'ar' ? 'دقة جيدة (±' + nodeLocation.accuracy + 'م)' : `Good (±${nodeLocation.accuracy}m)`
      : language === 'ar' ? 'دقة تقريبية (±' + nodeLocation.accuracy + 'م)' : `Approx (±${nodeLocation.accuracy}m)`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/70 via-[#131c26] to-emerald-950/70 border border-slate-700/80 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1d99f3] to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 shrink-0">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {t.locationTracker}
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live GPS Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {t.locationTrackerDesc}
            </p>
          </div>
        </div>

        {/* Node selector dropdown */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/90 p-1.5 rounded-xl text-xs">
          <Smartphone className="w-4 h-4 text-sky-400 ml-1" />
          <span className="text-slate-400 font-medium">الهاتف المُستهدف:</span>
          <select
            value={activeNode.id}
            onChange={e => setActiveNodeId(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
          >
            {devices.filter(d => d.role === 'node').map(node => (
              <option key={node.id} value={node.id} className="bg-slate-900 text-slate-100">
                {node.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Telemetry Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Viewport Card (8 cols) */}
        <div className="lg:col-span-8 bg-[#141a22] border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          {/* Map Toolbar */}
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span className="font-bold text-white font-mono">
                {activeNode.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                {accuracyBadgeText}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => requestDeviceLocation(activeNode.id)}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                title="إرسال طلب قراءة إحداثيات فورية للهاتف"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{t.requestLocationPing}</span>
              </button>

              <button
                onClick={() => toggleLiveTracking(activeNode.id, !isTrackingActive)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  isTrackingActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isTrackingActive ? t.stopLiveTracking : t.startLiveTracking}</span>
              </button>

              <button
                onClick={handleOpenGoogleMaps}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700"
                title={t.openInGoogleMaps}
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{t.openInGoogleMaps}</span>
              </button>
            </div>
          </div>

          {/* Map Canvas */}
          <div className="relative w-full h-[460px] bg-slate-950">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Radar Pulsing Overlay when Continuous Live Tracking is Active */}
            {isTrackingActive && (
              <div className="absolute top-4 right-4 z-20 bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 px-3 py-1.5 rounded-xl font-mono text-[11px] flex items-center gap-2 shadow-lg backdrop-blur-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>رادار البث الحي المستمر نشط (P2P Stream)</span>
              </div>
            )}

            {/* Distance HUD Overlay */}
            <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 border border-slate-700 text-white p-3 rounded-2xl shadow-2xl backdrop-blur-md space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">المسافة بين الهاتفين:</span>
              <div className="text-base font-extrabold text-sky-400 font-mono flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>{formatDistance(distanceMeters, language)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry & Quick Remote Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coordinates HUD Card */}
          <div className="p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>بيانات الموقع الجغرافي (Coordinates Telemetry)</span>
            </h3>

            {/* Coordinates Display */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">الإحداثيات الحالية:</span>
                <button
                  onClick={handleCopyCoords}
                  className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
                  title={t.copyCoordinates}
                >
                  {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCoords ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>

              <div className="font-mono text-sm font-black text-sky-400 tracking-wide select-all bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                {nodeLocation.latitude.toFixed(6)}, {nodeLocation.longitude.toFixed(6)}
              </div>

              <div className="text-[11px] text-slate-400 font-mono pt-1">
                {nodeLocation.addressLabel || 'الموقع: المملكة العربية السعودية / الرياض'}
              </div>
            </div>

            {/* Hardware Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">{t.gpsAccuracy}</span>
                <span className="font-bold text-emerald-400">± {nodeLocation.accuracy} m</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">{t.speedKmh}</span>
                <span className="font-bold text-white">{nodeLocation.speed || 0} km/h</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">{t.altitudeMeters}</span>
                <span className="font-bold text-white">{nodeLocation.altitude ? `${nodeLocation.altitude} m` : '615 m'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">البطارية</span>
                <span className="font-bold text-sky-400 flex items-center gap-1">
                  {activeNode.isCharging ? <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> : <Battery className="w-3.5 h-3.5" />}
                  {activeNode.batteryLevel}%
                </span>
              </div>
            </div>

            {/* Remote Finding Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => isRingingDeviceId ? stopRinging() : ringDevice(activeNode.id)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isRingingDeviceId
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-bounce'
                    : 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800'
                }`}
              >
                <BellRing className="w-4 h-4" />
                <span>{isRingingDeviceId ? 'إيقاف رنين الطوارئ' : t.ringDeviceToLocate}</span>
              </button>

              <button
                onClick={handleShareLocation}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Share2 className="w-4 h-4 text-sky-400" />
                <span>مشاركة إحداثيات ورابط الموقع</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
