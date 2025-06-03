import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Alert, Spinner, Form, Button, Modal } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Get API base URL from env or fallback to localhost
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Dashboard = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterConnector, setFilterConnector] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStation, setEditStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active',
    powerOutput: '',
    connectorType: '',
    location: { lat: '', lng: '' }
  });

  // Fetch stations from API
  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }
        const { data } = await axios.get(`${API_BASE_URL}/api/stations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStations(data);
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError(err.response?.data?.error || 'Failed to load charging stations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  // Filter stations
  const filteredStations = stations.filter(station => {
    return (
      (filterStatus ? station.status === filterStatus : true) &&
      (filterConnector ? station.connectorType === filterConnector : true)
    );
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lat' || name === 'lng') {
      setFormData({ ...formData, location: { ...formData.location, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle add or edit station
  const handleSaveStation = async () => {
    setError('');
    setLoading(true);
    // Validate inputs
    if (!formData.name || !formData.powerOutput || !formData.connectorType || !formData.location.lat || !formData.location.lng) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    const powerOutput = Number(formData.powerOutput);
    const lat = Number(formData.location.lat);
    const lng = Number(formData.location.lng);
    if (isNaN(powerOutput) || powerOutput <= 0) {
      setError('Power output must be a positive number.');
      setLoading(false);
      return;
    }
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Latitude (-90 to 90) and longitude (-180 to 180) must be valid numbers.');
      setLoading(false);
      return;
    }
    // Construct payload
    const payload = {
      name: formData.name,
      status: formData.status,
      powerOutput,
      connectorType: formData.connectorType,
      location: { lat, lng }
    };
    console.log('Sending payload:', payload);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
      if (editStation) {
        const { data } = await axios.put(`${API_BASE_URL}/api/stations/${editStation._id}`, payload, config);
        setStations(stations.map(s => (s._id === editStation._id ? data : s)));
      } else {
        const { data } = await axios.post(`${API_BASE_URL}/api/stations`, payload, config);
        setStations([...stations, data]);
      }
      setShowModal(false);
      setEditStation(null);
      setFormData({ name: '', status: 'Active', powerOutput: '', connectorType: '', location: { lat: '', lng: '' } });
    } catch (err) {
      console.error('Error saving station:', err);
      console.log('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to save station. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete station
  const handleDeleteStation = async (id) => {
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }
      await axios.delete(`${API_BASE_URL}/api/stations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStations(stations.filter(s => s._id !== id));
    } catch (err) {
      console.error('Error deleting station:', err);
      setError(err.response?.data?.error || 'Failed to delete station. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open modal for add or edit
  const openModal = (station = null) => {
    setEditStation(station);
    setFormData(station ? {
      name: station.name,
      status: station.status,
      powerOutput: station.powerOutput,
      connectorType: station.connectorType,
      location: { lat: station.location.lat, lng: station.location.lng }
    } : { name: '', status: 'Active', powerOutput: '', connectorType: '', location: { lat: '', lng: '' } });
    setShowModal(true);
  };

  // Map container style
  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  // Dynamic map center
  const mapCenter = stations.length > 0
    ? [Number(stations[0].location.lat), Number(stations[0].location.lng)]
    : [0, 0];

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4 text-primary">Charging Stations Dashboard</h2>

      {/* Loading Spinner */}
      {loading && (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Form className="mb-4">
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Filter by Status</Form.Label>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Filter by Connector Type</Form.Label>
              <Form.Select value={filterConnector} onChange={(e) => setFilterConnector(e.target.value)}>
                <option value="">All</option>
                <option value="Type 1">Type 1</option>
                <option value="Type 2">Type 2</option>
                <option value="CCS">CCS</option>
                <option value="CHAdeMO">CHAdeMO</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button className="mt-3" variant="primary" onClick={() => openModal()}>
          Add New Station
        </Button>
      </Form>

      {/* Map View */}
      <div className="mb-5">
        <h3 className="text-center mb-3 text-secondary">Map View</h3>
        <MapContainer
          center={mapCenter}
          zoom={stations.length > 0 ? 10 : 2}
          style={mapContainerStyle}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredStations.map(station => (
            <Marker
              key={station._id}
              position={[Number(station.location.lat), Number(station.location.lng)]}
            >
              <Popup>
                <h5>{station.name}</h5>
                <p>Status: {station.status}</p>
                <p>Power Output: {station.powerOutput} kW</p>
                <p>Connector: {station.connectorType}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* List View */}
      <h3 className="text-center mb-4 text-secondary">List View</h3>
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredStations.length === 0 && !loading && (
          <p className="text-center">No charging stations found with current filters.</p>
        )}
        {filteredStations.map(station => (
          <Col key={station._id}>
            <Card border="primary" className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>{station.name}</Card.Title>
                <Card.Text>
                  <strong>Status:</strong> {station.status}<br />
                  <strong>Power Output:</strong> {station.powerOutput} kW<br />
                  <strong>Connector Type:</strong> {station.connectorType}<br />
                  <strong>Location:</strong> ({station.location.lat.toFixed(4)}, {station.location.lng.toFixed(4)})
                </Card.Text>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between">
                <Button variant="outline-primary" size="sm" onClick={() => openModal(station)}>
                  Edit
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteStation(station._id)}>
                  Delete
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{editStation ? 'Edit Station' : 'Add New Station'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="formStationName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter station name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPowerOutput">
              <Form.Label>Power Output (kW)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter power output"
                name="powerOutput"
                value={formData.powerOutput}
                onChange={handleInputChange}
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConnectorType">
              <Form.Label>Connector Type</Form.Label>
              <Form.Select
                name="connectorType"
                value={formData.connectorType}
                onChange={handleInputChange}
              >
                <option value="">Select connector type</option>
                <option value="Type 1">Type 1</option>
                <option value="Type 2">Type 2</option>
                <option value="CCS">CCS</option>
                <option value="CHAdeMO">CHAdeMO</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formLatitude">
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter latitude"
                name="lat"
                value={formData.location.lat}
                onChange={handleInputChange}
                step="any"
                min="-90"
                max="90"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formLongitude">
              <Form.Label>Longitude</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter longitude"
                name="lng"
                value={formData.location.lng}
                onChange={handleInputChange}
                step="any"
                min="-180"
                max="180"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveStation} disabled={loading}>
            {loading ? 'Saving...' : (editStation ? 'Update' : 'Add')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
