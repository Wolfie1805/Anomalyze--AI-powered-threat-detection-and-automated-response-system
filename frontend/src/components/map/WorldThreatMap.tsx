import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import GlassCard from '../ui/GlassCard';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const markers = [
  { markerOffset: -15, name: "Moscow, RU", coordinates: [37.6173, 55.7558], size: 20 },
  { markerOffset: 25, name: "Beijing, CN", coordinates: [116.4074, 39.9042], size: 15 },
  { markerOffset: -15, name: "Pyongyang, KP", coordinates: [125.7543, 39.0392], size: 10 },
];

const WorldThreatMap: React.FC = () => {
  return (
    <GlassCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 className="orbitron" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>LIVE THREAT MAP</h3>
      <div style={{ flex: 1, position: 'relative' }}>
        <ComposableMap projection="geoMercator" style={{ width: '100%', height: '100%' }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(255,255,255,0.05)"
                  stroke="rgba(0,245,255,0.2)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: "rgba(0,245,255,0.2)", outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
          {markers.map(({ name, coordinates, size, markerOffset }) => (
            <Marker key={name} coordinates={coordinates as [number, number]}>
              <circle r={size / 2} fill="#ff1744" opacity={0.5} className="pulse-critical" />
              <circle r={2} fill="#fff" />
              <text textAnchor="middle" y={markerOffset} style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', fill: 'white' }}>
                {name}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </GlassCard>
  );
};

export default WorldThreatMap;
