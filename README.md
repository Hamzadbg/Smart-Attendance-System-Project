# Smart Attendance Management System

A web-based **Smart Attendance Management System using Face Recognition** that helps automate attendance tracking through a webcam. The application includes separate admin and user dashboards, face enrollment, attendance records, and attendance reports.

## Features

### Admin Dashboard
- Manage registered users.
- Enroll users' faces using a webcam.
- Capture and store face descriptors for recognition.
- View attendance records and reports.
- Export attendance data in supported formats, including CSV and Excel, and generate PDF reports.

### User Dashboard
- Mark attendance using face recognition.
- View personal attendance history.
- Filter attendance records by date range.
- View attendance statistics and percentage.

### Authentication and Security
- Separate admin and user login and registration.
- Password hashing using `bcryptjs`.
- JWT-based authentication.
- Role-based access control for protected pages and API routes.
- Duplicate daily attendance prevention.

### Face Recognition
- Webcam-based face capture.
- Face detection and descriptor extraction using `face-api.js`.
- Face matching using Euclidean distance.
- Support for storing multiple face descriptors for a user.

## Tech Stack

**Frontend**
- React
- Vite
- React Router
- Axios
- face-api.js
- react-webcam
- Zustand

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs

**Reporting and Utilities**
- ExcelJS
- PDFKit
- json2csv
- Day.js

## Project Structure

```text
smart_attendence_project/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── utils/
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.mjs
│   ├── public/
│   │   └── models/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── face/
│       ├── pages/
│       ├── state/
│       └── styles.css
│
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB running locally or a MongoDB connection URI
- A modern web browser with webcam support

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd smart_attendence_project
```

Replace `YOUR_USERNAME` and `YOUR_REPOSITORY` with your GitHub details.

### 2. Configure the backend

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder using `.env.example` as a template.

Example configuration:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_attendance
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

Make sure MongoDB is running and replace the example JWT secret with a strong, private value.

Start the backend:

```bash
npm run dev
```

The backend API runs on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 3. Configure the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend in your browser:

```text
http://localhost:3000
```

The Vite development server proxies `/api` requests to the backend running on port `5000`.

## How to Use

1. Start MongoDB and run both the backend and frontend.
2. Open the application in your browser.
3. Register the first administrator account.
4. Log in to the admin dashboard.
5. Register or manage users.
6. Enroll each user's face using the webcam.
7. Log in as a user and capture your face to mark attendance.
8. View attendance records and statistics from the available dashboards.

**Note:** The backend allows public administrator registration only while no administrator account exists. After the first admin is created, additional administrator registration is blocked by the application logic.

## API Overview

The backend exposes the following main API groups:

| Endpoint | Purpose |
|---|---|
| `/api/health` | Check API status |
| `/api/auth` | Authentication and registration |
| `/api/admin` | Administrative operations |
| `/api/users` | User attendance and related operations |

Specific operations are defined in the backend route files.

## Face Recognition Models

The required face recognition model files are included in:

```text
frontend/public/models/
```

The frontend loads these models for face detection and descriptor extraction. Allow webcam access when prompted by your browser.

## Important Security Notes

- Never commit your real `.env` file, database credentials, or JWT secrets.
- Keep `.env.example` in the repository with placeholder values only.
- Face descriptors are biometric-related data. Obtain appropriate consent and protect stored data.
- Face recognition can make incorrect matches; review the matching threshold and test under different lighting conditions.
- Use HTTPS and suitable access controls when deploying outside a local development environment.

## Future Improvements

- Add automated tests for authentication and attendance workflows.
- Improve audit logs and administrative reporting.
- Add deployment configuration and production monitoring.
- Strengthen biometric data protection and recognition safeguards.

## License

This project declares the MIT License in its backend package configuration. Add a root-level `LICENSE` file if you intend to distribute the project under the MIT License.
