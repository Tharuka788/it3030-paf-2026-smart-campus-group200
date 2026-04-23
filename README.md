# 🏫 Smart Campus Management System

A full-stack web application for managing campus resources, facility bookings, maintenance tickets, and user notifications. Built with **Spring Boot** (backend) and **React + Vite** (frontend).

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## ✨ Features

### 🔐 Authentication & Authorization
- Google OAuth2 login integration via Firebase
- Role-based access control (User, Admin, Technician)
- Secure password hashing with BCrypt
- User profile management and sync

### 📅 Facility Booking System
- Browse and search campus facilities (Rooms, Labs, Lecture Halls)
- Real-time availability checking with 30-minute buffer validation
- Seat selection for lecture halls
- Booking approval/rejection workflow for admins
- Booking history and status tracking

### 🎫 Maintenance Ticket System
- Create support tickets with file attachments
- Categorized tickets with priority and impact levels
- Admin and technician ticket management
- Status tracking (Open → In Progress → Resolved → Closed)
- Admin comments and feedback

### 🔔 Notification System
- Real-time notifications for booking and ticket updates
- Unread notification count and badge
- Mark as read / Mark all as read functionality
- Notification categorization (Bookings, Tickets, System)

### 📧 Email Notifications
- Automated email on booking confirmation and cancellation
- Ticket creation and status update emails
- Professional HTML email templates

### 📊 Admin Dashboard
- Overview statistics and charts
- Booking distribution analytics
- User management with role assignment
- Facility management (CRUD operations)

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 17+ | Programming Language |
| Spring Boot 3.x | Application Framework |
| Spring Security | Authentication & Authorization |
| Spring Data MongoDB | Database Access |
| Spring Mail | Email Service |
| Lombok | Boilerplate Reduction |
| Maven | Build Tool |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI Library |
| Vite | Build Tool & Dev Server |
| Axios | HTTP Client |
| Firebase | Google Auth Provider |
| CSS3 | Styling |

### Database
| Technology | Purpose |
|---|---|
| MongoDB | Primary Database |

## 📁 Project Structure

```
smart-campus/
├── backend/
│   └── src/main/java/com/smartcampus/
│       ├── config/          # Security, CORS, MongoDB config
│       ├── controller/      # REST API controllers
│       ├── dto/             # Data Transfer Objects
│       ├── exception/       # Global exception handling
│       ├── model/           # MongoDB document models
│       │   └── enums/       # Enumerations (Priority, Impact)
│       ├── repository/      # MongoDB repositories
│       └── service/         # Business logic services
├── frontend/
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Application pages
│       ├── services/        # API service layer
│       └── styles/          # CSS stylesheets
└── README.md
```

## 📋 Prerequisites

- **Java 17** or higher
- **Node.js 18** or higher
- **MongoDB** (local or Atlas)
- **Maven 3.8+**

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Tharuka788/it3030-paf-2026-smart-campus-group200.git
cd it3030-paf-2026-smart-campus-group200
```

### 2. Backend Setup
```bash
cd backend

# Configure application.properties with your MongoDB URI and mail settings
# See Environment Variables section below

# Run the application
./mvnw spring-boot:run
```
The backend server starts on `http://localhost:8080`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend dev server starts on `http://localhost:5173`

## 🔗 API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/register` | Register a new user |
| POST | `/api/v1/users/login` | Login with email/password |
| POST | `/api/v1/users/sync` | Sync OAuth user data |
| GET | `/api/v1/users/me?email=` | Get current user profile |
| PATCH | `/api/v1/users/admin/users/{id}/role` | Update user role (Admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/bookings` | Create a new booking |
| GET | `/api/v1/bookings` | Get all bookings |
| GET | `/api/v1/bookings/user/{email}` | Get bookings by user |
| GET | `/api/v1/bookings/{id}` | Get booking by ID |
| PATCH | `/api/v1/bookings/{id}/status` | Update booking status |
| DELETE | `/api/v1/bookings/{id}` | Delete a booking |
| GET | `/api/v1/bookings/resource/{id}` | Get bookings by resource |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/tickets` | Create a ticket (multipart) |
| GET | `/api/v1/tickets` | Get all tickets |
| GET | `/api/v1/tickets/user/{email}` | Get tickets by user |
| PATCH | `/api/v1/tickets/{id}/status` | Update ticket status |
| DELETE | `/api/v1/tickets/{id}` | Delete a ticket |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications?userId=` | Get user notifications |
| GET | `/api/v1/notifications/unread?userId=` | Get unread notifications |
| GET | `/api/v1/notifications/unread-count?userId=` | Get unread count |
| PATCH | `/api/v1/notifications/{id}/read` | Mark as read |
| PATCH | `/api/v1/notifications/read-all?userId=` | Mark all as read |
| DELETE | `/api/v1/notifications/{id}` | Delete notification |
| DELETE | `/api/v1/notifications?userId=` | Delete all notifications |

### Facilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/facilities` | Get all facilities |
| GET | `/api/v1/facilities/{id}` | Get facility by ID |
| POST | `/api/v1/facilities` | Create facility (Admin) |
| PUT | `/api/v1/facilities/{id}` | Update facility (Admin) |
| DELETE | `/api/v1/facilities/{id}` | Delete facility (Admin) |

## ⚙️ Environment Variables

### Backend (`application.properties`)
```properties
# MongoDB
spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster.mongodb.net/smartcampus

# Mail Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# OAuth2 (optional)
spring.security.oauth2.client.registration.google.client-id=your-client-id
spring.security.oauth2.client.registration.google.client-secret=your-client-secret
```

### Frontend (`firebase.js`)
Configure your Firebase project credentials for Google OAuth.

## 👥 Contributing

1. Create a feature branch from `Dev`
2. Make your changes
3. Submit a pull request to `Dev`

### Branch Naming Convention
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/description` - Code refactoring

## 📄 License

This project is developed as part of the IT3030 - PAF module at SLIIT.

---

**Group 200** | Smart Campus Management System | 2026