# StoreZen - Complete Setup Instructions

## 🚀 Quick Setup

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Install Client Dependencies  
```bash
cd client
npm install
```

### 3. Start the Backend Server
```bash
cd server
npm start
```
The server will run on: http://localhost:8000

### 4. Start the Frontend Client
```bash
cd client
npm start
```
The client will run on: http://localhost:3000

## ✅ What's Working Now:

### Main Page (`/`)
- **"I am Customer"** button → redirects to `/signup`
- **"Manager Portal"** button → redirects to `/manager` 
- **"Login"** button → redirects to `/login`

### Authentication Flow:
1. **New Customer**: Click "I am Customer" → Signup → Login → Customer Dashboard
2. **Existing Customer**: Click "Login" → Enter credentials → Customer Dashboard
3. **Manager**: Click "Manager Portal" → Manager Dashboard

### Backend API Endpoints:
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /ping` - Health check

## 🔧 Current Setup:
- ✅ MongoDB connected
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation with Joi
- ✅ CORS enabled
- ✅ Error handling improved

## 📱 Testing with Postman:

### Signup:
```
POST http://localhost:8000/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123"
}
```

### Login:
```
POST http://localhost:8000/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## 🐛 Troubleshooting:
1. Make sure MongoDB connection string is correct in `.env`
2. Check if ports 3000 and 8000 are free
3. Ensure both client and server are running
4. Check browser console for any errors

Your authentication system is now complete and ready to use! 🎉
