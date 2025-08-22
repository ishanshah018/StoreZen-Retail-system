# 🛍️ StoreZen - Smart Retail Management System

A comprehensive retail management system with intelligent features including inventory management, customer analytics, smart shopping assistant, and integrated payment processing.

## 🌟 Features

- **Smart Inventory Management**: Real-time stock tracking and automated alerts
- **Customer Analytics**: Advanced insights and purchase behavior analysis
- **Payment Integration**: Secure Razorpay payment processing
- **Smart Shopping Assistant**: AI-powered product recommendations
- **Coupon & Loyalty System**: Smart coins and discount management
- **WhatsApp Integration**: Automated notifications via Twilio
- **Multi-platform**: React frontend, Node.js API, Django backend

## 🏗️ Architecture

```
StoreZen/
├── client/           # React.js Frontend
├── server/           # Node.js API Server
├── django_backend/   # Django Backend (Inventory & Payments)
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- MongoDB Atlas account
- Razorpay account (for payments)
- Twilio account (for SMS/WhatsApp)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/StoreZen-Retail-system.git
cd StoreZen-Retail-system
```

### 2. Environment Setup

#### Backend (Django)
```bash
cd django_backend
cp .env.example .env
# Edit .env with your actual API keys
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

#### API Server (Node.js)
```bash
cd server
cp .env.example .env
# Edit .env with your actual credentials
npm install
npm start
```

#### Frontend (React)
```bash
cd client
npm install
npm start
```

### 3. Configure Environment Variables

#### Django Backend (.env)
```env
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_FROM=whatsapp:+1415XXXXXXX
SECRET_KEY=your_django_secret_key
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
DEBUG=True
```

#### Node.js Server (.env)
```env
PORT=8080
MONGO_CONN=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_jwt_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

## 🔐 Security Features

- ✅ Environment variables for all sensitive data
- ✅ JWT authentication
- ✅ Payment signature verification
- ✅ CORS configuration
- ✅ Input validation and sanitization

## 🧪 Demo Mode

The application includes demo/test modes:
- **Razorpay Test Mode**: Uses test API keys for safe payment testing
- **Sample Data**: Pre-populated inventory and customer data
- **Test Cards**: Razorpay provides test card numbers for development

### Test Payment Cards
- **Success**: 2305 3242 5784 8228
- **UPI Success**: success@razorpay
- **UPI Failure**: failure@razorpay

## 📱 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /manager/auth/login` - Manager login

### Inventory
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product

### Payments
- `POST /payment/create-order/` - Create Razorpay order
- `POST /payment/verify/` - Verify payment signature

## 🛠️ Development

### Running Tests
```bash
# Backend tests
cd django_backend && python manage.py test

# Frontend tests  
cd client && npm test

# API tests
cd server && npm test
```

### Code Style
- Frontend: ESLint + Prettier
- Backend: PEP 8 (Python)
- API: ESLint

## 🚀 Deployment

### Production Checklist
- [ ] Set `DEBUG=False` in Django settings
- [ ] Use production MongoDB cluster
- [ ] Configure production Razorpay keys
- [ ] Set up SSL certificates
- [ ] Configure CORS for production domains
- [ ] Set secure environment variables

### Recommended Hosting
- **Frontend**: Vercel, Netlify
- **API**: Railway, Heroku
- **Backend**: Railway, PythonAnywhere
- **Database**: MongoDB Atlas

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React.js team for the amazing frontend framework
- Django team for the robust backend framework
- Razorpay for payment gateway integration
- Twilio for communication services

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

---

**⚡ Built with passion for modern retail solutions**
