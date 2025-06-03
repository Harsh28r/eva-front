function ChargerList({ stations, setStations, token, filters, setFilters }) {
    const [newStation, setNewStation] = React.useState({
      name: '', location: { lat: 0, lng: 0 }, status: 'Active', powerOutput: 0, connectorType: ''
    });
    const [editId, setEditId] = React.useState(null);
  
    const handleAdd = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(newStation),
        });
        const data = await res.json();
        setStations([...stations, data]);
        setNewStation({ name: '', location: { lat: 0, lng: 0 }, status: 'Active', powerOutput: 0, connectorType: '' });
      } catch (error) {
        console.error(error);
      }
    };
  
    const handleUpdate = async (id) => {
      try {
        const res = await fetch(`http://localhost:5000/api/stations/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(newStation),
        });
        const data = await res.json();
        setStations(stations.map(s => s._id === id ? data : s));
        setEditId(null);
        setNewStation({ name: '', location: { lat: 0, lng: 0 }, status: 'Active', powerOutput: 0, connectorType: '' });
      } catch (error) {
        console.error(error);
      }
    };
  
    const handleDelete = async (id) => {
      try {
        await fetch(`http://localhost:5000/api/stations/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setStations(stations.filter(s => s._id !== id));
      } catch (error) {
        console.error(error);
      }
    };
  
    const filteredStations = stations.filter(s =>
      (filters.status ? s.status === filters.status : true) &&
      (filters.powerOutput ? s.powerOutput >= Number(filters.powerOutput) : true) &&
      (filters.connectorType ? s.connectorType === filters.connectorType : true)
    );
  
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-4">Charger List</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Status (Active/Inactive)"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Min Power Output (kW)"
            value={filters.powerOutput}
            onChange={(e) => setFilters({ ...filters, powerOutput: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Connector Type"
            value={filters.connectorType}
            onChange={(e) => setFilters({ ...filters, connectorType: e.target.value })}
            className="p-2 border rounded"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={newStation.name}
            onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Latitude"
            value={newStation.location.lat}
            onChange={(e) => setNewStation({ ...newStation, location: { ...newStation.location, lat: Number(e.target.value) } })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Longitude"
            value={newStation.location.lng}
            onChange={(e) => setNewStation({ ...newStation, location: { ...newStation.location, lng: Number(e.target.value) } })}
            className="p-2 border rounded"
          />
          <select
            value={newStation.status}
            onChange={(e) => setNewStation({ ...newStation, status: e.target.value })}
            className="p-2 border rounded"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <input
            type="number"
            placeholder="Power Output (kW)"
            value={newStation.powerOutput}
            onChange={(e) => setNewStation({ ...newStation, powerOutput: Number(e.target.value) })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Connector Type"
            value={newStation.connectorType}
            onChange={(e) => setNewStation({ ...newStation, connectorType: e.target.value })}
            className="p-2 border rounded"
          />
          <button
            onClick={editId ? () => handleUpdate(editId) : handleAdd}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {editId ? 'Update' : 'Add'} Station
          </button>
        </div>
        <ul className="space-y-2">
          {filteredStations.map(station => (
            <li key={station._id} className="p-4 bg-gray-50 rounded shadow flex justify-between">
              <div>
                <p><strong>Name:</strong> {station.name}</p>
                <p><strong>Location:</strong> {station.location.lat}, {station.location.lng}</p>
                <p><strong>Status:</strong> {station.status}</p>
                <p><strong>Power:</strong> {station.powerOutput} kW</p>
                <p><strong>Connector:</strong> {station.connectorType}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setNewStation(station); setEditId(station._id); }}
                  className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(station._id)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }