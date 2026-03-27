# 📚 NEU Library System

The **NEU Library System** is a modern, web-based platform designed to streamline library operations for students and administrators. Built with **React 19**, **Vite**, and **Firebase**, the system provides real-time book tracking, secure user management, and detailed analytics.

---

## 🌟 Key Features

### 👨‍🎓 For Students (Users)

- **Interactive Dashboard**  
  A personalized experience showing account status, upcoming events, and quick actions.

- **Book Catalog & Search**  
  Browse the library collection with real-time availability status and a powerful integrated search bar.

- **Borrowing System**
  - **Detailed Information**: View book details, authors, and ISBNs via an interactive modal.
  - **3-Book Limit**: Automated enforcement ensures no student has more than three active borrows at a time.
  - **Request Flow**: Students can specify pickup dates, times, and borrowing durations.

- **Personal Tracking**  
  A dedicated **"My Borrowed Books"** section to monitor active borrows, due dates, and status badges.

---

### 🛠️ For Administrators

- **Advanced Analytics**  
  Real-time visitor statistics, including daily/weekly/monthly counts and common visit reasons, visualized using **Chart.js**.

- **User Moderation & Security**
  - **Blocking System**: Instantly block or unblock users to manage library access.
  - **Role-Based Access**: Only authorized administrators can access management tools.

- **Inventory Management**  
  Full control over the book collection and library events.

- **Overdue Tracking**  
  A specialized dashboard to identify past-due items and process returns manually.

---

## 🛠️ Tech Stack

### Frontend
- React 19 (Vite)
- React Router DOM v7
- Chart.js

### Backend & Infrastructure
- **Firebase Authentication** – Secure Google-based login  
- **Cloud Firestore** – Real-time NoSQL database for users, books, and checkouts  
- **Cloud Functions** – Serverless logic for QR generation and audit logging  
- **Firebase Hosting** – Scalable production hosting  

### Data Visualization
- react-chartjs-2

---

## 📂 Project Structure

```plaintext
├── frontend-react/          # Main React application
│   ├── src/
│   │   ├── components/      # UI components (Navbar, Modals, Layouts)
│   │   ├── pages/           # Route components (Dashboard, AdminDashboard)
│   │   ├── services/        # Logic for Firestore and API interactions
│   │   ├── styles/          # Custom CSS for the design system
│   │   └── firebase/        # Firebase initialization and configuration
├── functions/               # Firebase Cloud Functions (Node.js 24)
├── firestore.rules          # Security rules for data protection
└── firebase.json            # Deployment configuration for Firebase
```

---

## 🚀 Getting Started

### ✅ Prerequisites

- **Node.js** – Version 24 is recommended (especially for Cloud Functions)
- **Firebase CLI** – Install via:
  ```bash
  npm install -g firebase-tools
  ```

---

### ⚙️ Setup Instructions

1. **Clone the Repository**

2. **Install Frontend Dependencies**
   ```bash
   cd frontend-react
   npm install
   ```

3. **Configure Firebase**
   - Create a project in the Firebase Console
   - Enable:
     - Authentication
     - Firestore
     - Cloud Functions
   - Add your Firebase config to:
     ```
     frontend-react/src/firebase/firebase.js
     ```

4. **Deploy Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

> ⚠️ **Note:** Ensure your admin email is registered in `src/config/adminConfig.js` for administrative access.

5. **Run Locally**
   ```bash
   npm run dev
   ```

---

## 🔒 Security & Moderation

The system features **multi-layered security**:

- **Database Level**  
  Firestore Security Rules enforce data isolation so users only access their own records.

- **Application Level**  
  `ProtectedRoute` components prevent unauthorized access to administrative pages based on user roles.

- **Moderation System**  
  The `isBlocked` field in the user profile allows admins to instantly revoke library access.

---

## 📌 Notes

- Designed for scalability and real-time performance
- Optimized for both student usability and admin control
- Built with modern web technologies for maintainability and speed

---

## 👨‍💻 Author

Developed as part of a modern web systems project.
