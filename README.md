# Eventify 🎉

### College Event & Club Management System for SLIET

> Transforming campus life through a centralized digital platform that connects students, clubs, and administrators for seamless event management and enhanced engagement.

---

## 📌 Problem Statement

As students of SLIET, managing event records, participation history, certificates, registrations, and club activities across multiple WhatsApp groups, posters, and platforms often becomes confusing and stressful.

From searching old certificates at the last moment to missing important event updates and handling manual attendance, the entire process lacks a centralized and efficient system.

To solve this real-world campus problem, we built **Eventify** — a unified platform for managing college events, club activities, student participation, and announcements in one place.

---

## 🚀 Features

### 🎯 Event Management

* Create, update, and manage college events
* Event categorization and filtering
* Capacity management for events
* Event scheduling with conflict detection

### 📝 Smart Registration System

* Online event registration
* One-click participation system
* Real-time participant tracking

### 📷 QR-Based Attendance

* Smart attendance system using QR codes
* Fast and secure check-in process
* Automated attendance records

### 🏆 Leaderboard & Gamification

* Participation points tracking
* Leaderboards for active students
* Badges and achievements system

### 📢 Real-Time Notifications

* Event announcements
* Instant updates using Socket.io
* Important reminders and notifications

### 🧾 Automated Certificates

* Online certificate generation
* Downloadable participation certificates
* Digital certificate management

### 🧠 Club Recruitment Workflow

* Online recruitment drives
* Quiz/Test-based selection process
* Performance analysis system

### 🔐 Secure Authentication

* JWT-based authentication & authorization
* Role-based dashboards:

  * Student
  * Organizer
  * Admin

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Redux Toolkit
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Real-Time Communication

* Socket.io

### Authentication

* JWT (JSON Web Token)

### Architecture

* Microservices Architecture

---

## 🏗️ System Architecture

Eventify follows a scalable MERN-based architecture with modular services for authentication, events, attendance, notifications, and certificates.

```bash
Client (React.js)
       ↓
REST APIs + Socket.io
       ↓
Node.js + Express.js
       ↓
MongoDB Database
```

---

## 📸 Modules Included

* Landing Page
* User Authentication
* Organizer Dashboard
* Event Creation & Management
* Event Calendar View
* QR Attendance System
* Notifications & Announcements
* Leaderboard & Gamification
* Reviews & Feedback
* Certificate Management
* Recruitment Test Hub

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/dhiruXDev/Eventify.git
cd Eventify
```

### 2️⃣ Install Dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd server
npm install
```

---

### 3️⃣ Configure Environment Variables

Create a `.env` file in the backend directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

---

### 4️⃣ Run the Project

#### Start Backend

```bash
npm run server
```

#### Start Frontend

```bash
npm start
```

---

## 🌟 Future Enhancements

* AI-based event recommendations
* Mobile application support
* Advanced analytics dashboard
* Payment gateway integration
* Attendance facial recognition
* College-wide community forums

---

## 👨‍💻 Developed By

* Dhiraj Kumar
* Nikita Gupta
* Abhishek Anand

Under the guidance of **Dr. Manoj Sachan**
Professor, Department of CSE, SLIET

---

## 📌 GitHub Repository

[https://github.com/dhiruXDev/Eventify](https://github.com/dhiruXDev/Eventify)
