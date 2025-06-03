function MapView({ stations }) {
    const mapRef = React.useRef(null);
    const [map, setMap] = React.useState(null);
  
    React.useEffect(() => {
      if (!mapRef.current) return;
      const L = window.L;
      const mapInstance = L.map(mapRef.current).setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);
      setMap(mapInstance);
      return () => mapInstance.remove();
    }, []);
  
    React.useEffect(() => {
      if (!map || !stations.length) return;
      const L = window.L;
      stations.forEach(station => {
        L.marker([station.location.lat, station.location.lng])
          .addTo(map)
          .bindPopup(`
            <b>${station.name}</b><br>
            Status: ${station.status}<br>
            Power: ${station.powerOutput} kW<br>
            Connector: ${station.connectorType}
          `);
      });
    }, [map, stations]);
  
    return <div ref={mapRef} className="h-96 w-full rounded shadow" />;
  }