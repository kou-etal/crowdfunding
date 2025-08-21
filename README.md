# Crowdfunding Platform

A full-stack crowdfunding platform built with **Laravel 12** (API) and **React 18** (frontend).  
This platform allows researchers, students, and creators to launch crowdfunding projects, receive financial support, and manage payouts securely.

---

## 🚀 Overview

Key features include:

- Multi-payment support (**PayPal** / **Stripe**)
- Secure user authentication with email verification
- Identity verification system
- Project management dashboard
- Real-time progress tracking
- Admin panel for project approvals and payouts

---

## 🛠️ Tech Stack

| Layer       | Technology |
|------------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Shadcn UI |
| **Backend**  | Laravel 12 (REST API) |
| **Database** | MySQL 8 |
| **Auth**     | Laravel Sanctum, Email Verification |
| **Payments** | PayPal SDK, Stripe Checkout |
| **Deployment** | ConoHa VPS, Nginx, PM2 |
| **Others**   | WebSocket (Pusher), Slack Notifications |

---

## ✨ Main Features

### For Users
- 🔹 **User Registration & Login** with email verification  
- 🔹 **Identity Verification** (face image + supervisor info)  
- 🔹 **Create Projects** with goals, deadlines, and images  
- 🔹 **Support Projects** via Stripe / PayPal  
- 🔹 **Real-time Progress Tracking** with dynamic charts  

### For Admins
- 🛠 **Project Approval & Rejection**
- 💳 **Payout Management**
- 📊 **User & Project Dashboard**

## ⚡️ Getting Started

### 1. Clone the Repository

git clone https://github.com/<your-username>/<repo>.git
cd crowdfunding-app

### 2. Setup Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve

### 3. Setup Frontend

cd frontend
cp .env.example .env
npm install
npm run dev
