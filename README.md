Electric Vehicle Charging Station Management App
This is a full-stack application for managing electric vehicle (EV) charging stations. It allows authenticated users to perform CRUD operations (Create, Read, Update, Delete) on charging stations, view them on an interactive OpenStreetMap, and filter stations by status or connector type. The backend is built with Node.js, Express, and MongoDB, while the frontend uses React with Bootstrap for styling and react-leaflet for map integration.
Features

User Authentication: Secure JWT-based login and registration.
Charging Station Management:
Create, read, update, and delete charging stations.
Fields: name, location (latitude/longitude), status (Active/Inactive), power output (kW), connector type.


Interactive Map: Displays stations on OpenStreetMap with clickable markers showing details.
Filters: Filter stations by status (Active/Inactive) or connector type (Type 1, Type 2, CCS, CHAdeMO).
Responsive UI: Built with Bootstrap for a mobile-friendly interface.
Protected Routes: Authentication required for accessing dashboard and managing stations.

Tech Stack

Backend:
Node.js
Express
MongoDB with Mongoose
JWT for authentication


Frontend:
React
react-leaflet for OpenStreetMap integration
Bootstrap 5 for styling
Axios for API requests


Other:
OpenStreetMap for map tiles
CORS for cross-origin requests



Prerequisites

Node.js (v18 or higher)
MongoDB (local or MongoDB Atlas)
Git for cloning the repository
NPM for package management

Installation
1. Clone the Repository
git clone https://github.com/your-username/ev-charging-station-app.git
cd ev-charging-station-app

2. Backend Setup

Navigate to the backend directory:cd backend


Install dependencies:npm install


Create a .env file in the backend directory with the following:MONGO_URI=mongodb://localhost:27017/ev-charging
JWT_SECRET=your_jwt_secret
PORT=5000


Replace MONGO_URI with your MongoDB connection string (local or Atlas).
Replace JWT_SECRET with a secure random string.


Start the backend server:npm start


The server runs at http://localhost:5000.



3. Frontend Setup

Navigate to the frontend directory:cd ../front/evasoft-frontend


Install dependencies:npm install


Create a .env.local file in the front/evasoft-frontend directory (optional, no API keys needed for OpenStreetMap).
Start the frontend development server:npm start


The app runs at http://localhost:3000.



Usage

Register/Login:
Open http://localhost:3000 in your browser.
Register a new user or log in with existing credentials.
A JWT token is stored in localStorage for authentication.


Dashboard:
Access the dashboard at /dashboard (protected route).
View all charging stations in a list and on an OpenStreetMap.
Click map markers to see station details.
Filter stations by status or connector type.


Manage Stations:
Click "Add New Station" to create a station.
Edit or delete existing stations via buttons on each station card.
Input fields: Name, Status, Power Output (kW), Connector Type, Latitude, Longitude.



API Endpoints

Base URL: http://localhost:5000/api
Authentication:
POST /auth/register: Register a new user.
POST /auth/login: Log in and receive a JWT token.


Charging Stations (most routes require Authorization: Bearer <token> in headers):
POST /stations: Create a new station (currently unprotected, consider adding auth).
GET /stations: Retrieve all stations.
PUT /stations/:id: Update a station.
DELETE /stations/:id: Delete a station.



Example Station Payload
{
  "name": "Downtown Charger",
  "status": "Active",
  "powerOutput": 75",
  "connectorType": "Type 2",
  "location": { "lat": 51.5074, "lng": -0.1278 }
}

Project Structure
ev-charging-station-app/
├── backend/
│   ├── models/
│   │   └── ChargingStation.js    # Mongoose schema
│   ├── User.js             # User schema for authentication
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── routes.js            # API routes
│   ├── index.js             # Express server setup
│   ├── routes/
│   │   └── auth.js        # Auth routes
│   └── .env              # Environment variables
├── front/
│   └── evasoft-frontend/
│       ├── src/
│       │   ├── Dashboard.js    # Main dashboard component
│       │   ├── App.js        # Root component
│       │   └── index.js      # Entry point
│       └── .env.local       # Optional environment variables
└── README.md

Deployment
Backend (e.g., Render)

Push the backend directory to a GitHub repository.
Create a new Web Service on Render.
Configure:
Runtime: Node
Build Command: npm install
Start Command: npm start
Environment Variables: MONGO_URI, JWT_SECRET, PORT


Deploy and note the Render URL (e.g., https://your-app-backend.onrender.com).

Frontend (e.g., Vercel)

Push the front/evasoft-frontend directory to a GitHub repository.
Create a new project on Vercel and import the repository.
Configure:
Framework: React
Root Directory: front/evasoft-frontend
Environment Variables: None required (OpenStreetMap needs no API key)


Deploy and note the Vercel URL (e.g., https://your-app.vercel.app).
Update frontend API requests to use the backend URL:
In Dashboard.js, replace http://localhost:5000 with your backend URL.



Troubleshooting

400 Bad Request on POST /stations:
Ensure the payload matches the schema (location.lat, location.lng).
Check browser console for Sending payload: and Error response: logs.
Check backend logs for req.body and error message.


401 Unauthorized:
Verify JWT token in localStorage.getItem('token').
Re-login to refresh token.
Ensure auth middleware is consistent (add to POST /stations if needed).


Map Issues:
Verify react-leaflet and leaflet are installed.
Check console for errors if markers are missing.


CORS Errors:
Add CORS to backend:const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' })); // or your frontend URL


Install: npm install cors



Notes

React vs. Vue.js: The frontend uses React, as per the provided code. If Vue.js is required, the per assignment, the frontend can be migrated to Vue.js.
Authentication: The POST /stations endpoint is currently unprotected, which may not be intended. Adding Add auth middleware to align with other routes:router.post('/', auth, async (req, res) => { ... });


Improvements:
Add enum for connectorType in the schema.
Enhance map features (e.g., zoom controls, clustering).
Implement form validation feedback in the UI.




