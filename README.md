# Hospital Bed Management System

A full-stack web application for managing hospital bed availability, patient admissions, and staff management. Built with Node.js/Express backend and React frontend with real-time updates via Socket.IO.

---

## 📋 Project Overview

This application helps hospital administrators and staff:

- **Track bed availability** across different wards (ICU, General, Emergency)
- **Manage patient admissions** and bed assignments
- **Monitor real-time updates** of bed status changes
- **Control staff access** with role-based permissions (Admin, Staff)
- **Register and manage staff members**

---

## 🏗️ Project Structure

```
Bed/
├── backend/                 # Express.js REST API server
│   ├── src/
│   │   ├── server.js       # Main server entry point
│   │   ├── config/
│   │   │   └── db.js       # MongoDB connection
│   │   ├── controllers/    # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── bedController.js
│   │   │   └── patientController.js
│   │   ├── models/         # MongoDB schemas
│   │   │   ├── Bed.js
│   │   │   ├── Patient.js
│   │   │   ├── User.js
│   │   │   └── Ward.js
│   │   ├── routes/         # API endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── bedRoutes.js
│   │   │   └── patientRoutes.js
│   │   └── middleware/     # Express middleware
│   │       └── authMiddleware.js
│   ├── scripts/
│   │   └── createAdmin.js  # Script to create admin user
│   └── package.json
│
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx        # React entry point
│   │   ├── App.jsx         # Main app component
│   │   ├── api/
│   │   │   └── api.js      # Axios API client
│   │   ├── pages/          # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Beds.jsx
│   │   │   ├── AdmitPatient.jsx
│   │   │   ├── AddBed.jsx
│   │   │   ├── ManageBeds.jsx
│   │   │   ├── RegisterStaff.jsx
│   │   │   └── TransferModal.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env` file in the backend folder:**

   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/hospital-bed-management
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   ```

4. **Start the server:**

   ```bash
   # Development with auto-reload
   npm run dev

   # Production
   npm start
   ```

   Server will run on `http://localhost:5001`

5. **Create admin user (optional):**
   ```bash
   node scripts/createAdmin.js
   ```

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env.development` file:**

   ```env
   VITE_API_URL=http://localhost:5001
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

---

## 🗄️ Database Models

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  role: String (enum: "admin", "staff", default: "staff"),
  createdAt: Date,
  updatedAt: Date
}
```

### Bed Model

```javascript
{
  bedNumber: String (required, unique),
  ward: String (required),
  type: String (enum: "General", "ICU", "Emergency"),
  status: String (enum: "Available", "Occupied", "Maintenance"),
  patientId: ObjectId (ref: Patient),
  createdAt: Date,
  updatedAt: Date
}
```

### Patient Model

```javascript
{
  name: String (required),
  age: Number (required),
  disease: String,
  bedId: ObjectId (ref: Bed),
  createdAt: Date,
  updatedAt: Date
}
```

### Ward Model

```javascript
{
  wardName: String (required, unique),
  capacity: Number,
  type: String (enum: "ICU", "General", "Emergency")
}
```

---

## 🔐 Authentication & Authorization

### JWT Authentication

- Users login with email and password
- JWT token is returned and stored in localStorage
- Token is sent in `Authorization: Bearer <token>` header for protected routes
- Token expiration and refresh handled by `authMiddleware`

### Role-Based Access Control (RBAC)

**Admin** can:

- Add new beds
- Manage existing beds (edit, delete)
- Register staff members
- View all patients and beds
- Access management dashboard

**Staff** can:

- Admit patients
- View bed availability
- Transfer patients between beds
- View patient information

### Protected Routes

```
GET    /api/beds          - List all beds (admin, staff)
POST   /api/beds          - Create bed (admin only)
PUT    /api/beds/:id      - Update bed (admin only)
DELETE /api/beds/:id      - Delete bed (admin only)

GET    /api/patients      - List all patients (admin, staff)
POST   /api/patients      - Admit patient (admin, staff)
PUT    /api/patients/:id  - Update patient (admin, staff)
DELETE /api/patients/:id  - Delete patient (admin only)

POST   /api/auth/register - Register staff (admin only)
POST   /api/auth/login    - Login user
```

---

## 🔌 Real-Time Updates with Socket.IO

The application uses Socket.IO for real-time bed availability updates:

**Server Events:**

```javascript
io.on("connection", (socket) => {
  // Socket connections are logged
  // Broadcasts bed status changes to all connected clients
});
```

**Client Integration:**

- Connected to server at `VITE_API_URL`
- Listens for bed status updates
- Auto-refreshes UI when beds change status

---

## 📦 Dependencies

### Backend

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **socket.io** - Real-time communication

### Frontend

- **react** - UI library
- **react-router-dom** - Routing
- **axios** - HTTP client
- **socket.io-client** - Real-time client
- **jwt-decode** - JWT decoding
- **react-hot-toast** - Toast notifications
- **tailwindcss** - Styling
- **vite** - Build tool

---

## 🛠️ Development

### Running Both Servers Locally

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Then visit `http://localhost:5173` in your browser.

### Building for Production

**Backend:**

```bash
# Already optimized for production with npm start
```

**Frontend:**

```bash
npm run build
```

Generates optimized build in `dist/` folder.

---

## 📝 API Endpoints Summary

| Method | Endpoint             | Protected | Role         | Description    |
| ------ | -------------------- | --------- | ------------ | -------------- |
| POST   | `/api/auth/login`    | No        | -            | User login     |
| POST   | `/api/auth/register` | Yes       | Admin        | Register staff |
| GET    | `/api/beds`          | Yes       | Admin, Staff | List all beds  |
| POST   | `/api/beds`          | Yes       | Admin        | Create bed     |
| PUT    | `/api/beds/:id`      | Yes       | Admin        | Update bed     |
| DELETE | `/api/beds/:id`      | Yes       | Admin        | Delete bed     |
| GET    | `/api/patients`      | Yes       | Admin, Staff | List patients  |
| POST   | `/api/patients`      | Yes       | Admin, Staff | Admit patient  |
| PUT    | `/api/patients/:id`  | Yes       | Admin, Staff | Update patient |
| DELETE | `/api/patients/:id`  | Yes       | Admin        | Delete patient |

---

## 🔍 Middleware

### `authMiddleware.js`

**`protect` middleware:**

- Validates JWT tokens
- Fetches authenticated user
- Attaches user to request

**`restrictTo` middleware:**

- Role-based access control
- Checks if user has required role

---

## 📂 Frontend Pages

| Page           | Route             | Access    | Features                          |
| -------------- | ----------------- | --------- | --------------------------------- |
| Login          | `/login`          | Public    | User authentication               |
| Dashboard/Beds | `/`               | Protected | View all beds, real-time status   |
| Admit Patient  | `/admit`          | Protected | Add new patient and assign bed    |
| Add Bed        | `/add-bed`        | Admin     | Create new hospital bed           |
| Manage Beds    | `/manage-beds`    | Admin     | Edit/delete beds                  |
| Register Staff | `/register-staff` | Admin     | Create new staff accounts         |
| Transfer Modal | Modal             | Protected | Transfer patient to different bed |

---

## 🚨 Error Handling

- **400** - Bad Request (validation errors)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **500** - Server Error

---

## 📌 Environment Variables

### Backend (.env)

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/hospital-bed-management
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Frontend (.env.development)

```
VITE_API_URL=http://localhost:5001
```

---

## 🐛 Troubleshooting

**Port Already in Use:**

```bash
# Kill process on port 5001 (macOS/Linux)
lsof -ti:5001 | xargs kill -9

# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

**MongoDB Connection Failed:**

- Ensure MongoDB is running locally or check Atlas connection string
- Verify `MONGODB_URI` in `.env`

**CORS Errors:**

- Check that backend is running on correct port
- Verify `VITE_API_URL` matches backend URL

---

## 📄 License

ISC

---

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📧 Support

For issues or questions, please open an issue in the repository.
