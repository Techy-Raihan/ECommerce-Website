# 🛍 ShopNest — Full-Stack E-Commerce Platform

A production-grade ecommerce platform with **Microservices Architecture** using Java Spring Boot + React + TypeScript.

## 🏗 Architecture

```
Client (React)
     │
     ▼
API Gateway (port 8080)  ← JWT validation, routing, CORS, rate limiting
     │
     ├─▶ Auth Service    (8081) ← JWT + BCrypt + Redis blacklist
     ├─▶ User Service    (8082) ← Profile + Addresses
     ├─▶ Product Service (8083) ← Products + Categories + Redis cache
     ├─▶ Cart Service    (8084) ← Cart + Cart Items
     ├─▶ Order Service   (8085) ← Orders + Kafka producer
     ├─▶ Payment Service (8086) ← Simulated payments + Kafka producer
     ├─▶ Inventory Svc   (8087) ← Stock + Kafka consumer (deducts on payment)
     ├─▶ Notification    (8088) ← Kafka consumer (logs email notifications)
     └─▶ Admin Service   (8089) ← Dashboard stats

Infrastructure:
  Eureka Server (8761)  ← Service registry
  MySQL                 ← Per-service databases
  Redis                 ← Token blacklist + product caching
  Kafka + Zookeeper     ← Async event streaming
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- 8 GB RAM recommended

### 1. Clone / open the project
```bash
cd C:\Users\Raihan Raza\.gemini\antigravity\scratch\ecommerce-platform
```

### 2. Start all services
```bash
docker-compose up --build
```
> First build takes 5-10 minutes (Maven downloads dependencies). Subsequent builds are fast.

### 3. Access the application
| Service | URL |
|---------|-----|
| Frontend (React) | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |

## 🔧 Development (without Docker)

### Backend (each service)
```bash
cd backend/auth-service
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
> The Vite dev server proxies `/api` requests to `http://localhost:8080`

## 🔐 Authentication

| Action | Endpoint |
|--------|----------|
| Register | `POST /api/auth/register` |
| Login | `POST /api/auth/login` |
| Refresh Token | `POST /api/auth/refresh` |
| Logout | `POST /api/auth/logout` |

Default admin credentials (seed via API):
```json
{ "name": "Admin", "email": "admin@shopnest.com", "password": "Admin1234!" }
```
Then update the role in the database: `UPDATE users SET role='ADMIN' WHERE email='admin@shopnest.com';`

## 📦 API Examples

### Create a product (Admin)
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Latest Apple flagship smartphone",
    "price": 999.99,
    "categoryId": 1,
    "brand": "Apple",
    "stockQuantity": 50,
    "imageUrls": ["https://placehold.co/400x400"]
  }'
```

### Add to Cart
```bash
curl -X POST http://localhost:8080/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "productName": "iPhone 15 Pro", "price": 999.99, "quantity": 1}'
```

### Simulate Payment Success (Webhook)
```bash
curl -X POST http://localhost:8080/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"orderId": "YOUR_ORDER_ID"}'
```

## 🎯 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| State | Redux Toolkit |
| HTTP | Axios (JWT interceptor + refresh) |
| Styling | Vanilla CSS (dark-mode premium) |
| Backend | Java 21 + Spring Boot 3.2 |
| API Gateway | Spring Cloud Gateway |
| Discovery | Netflix Eureka |
| Auth | JWT (JJWT 0.12) + BCrypt |
| Database | MySQL 8.0 (per-service) |
| Cache | Redis 7 |
| Messaging | Apache Kafka |
| Build | Maven 3.9 |
| Container | Docker + Docker Compose |

## 📂 Project Structure

```
ecommerce-platform/
├── backend/
│   ├── eureka-server/        ← Service registry
│   ├── api-gateway/          ← Routes + JWT filter
│   ├── auth-service/         ← JWT + BCrypt + Redis blacklist
│   ├── user-service/         ← User profiles + addresses
│   ├── product-service/      ← Products + categories + Redis cache
│   ├── cart-service/         ← Shopping cart
│   ├── order-service/        ← Orders + Kafka producer
│   ├── payment-service/      ← Simulated payments + Kafka
│   ├── inventory-service/    ← Stock + Kafka consumer
│   ├── notification-service/ ← Email events via Kafka
│   └── admin-service/        ← Dashboard aggregation
├── frontend/                 ← React + TypeScript (Vite)
│   ├── src/
│   │   ├── api/              ← Axios + service modules
│   │   ├── components/       ← Navbar, UI components
│   │   ├── pages/            ← 9 route-level pages
│   │   ├── store/            ← Redux Toolkit slices
│   │   └── types/            ← TypeScript interfaces
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## ☁️ Production Deployment

1. **AWS**: Push to ECR, deploy to ECS or EKS
2. **Database**: Use AWS RDS (MySQL)  
3. **Redis**: Use AWS ElastiCache
4. **Kafka**: Use AWS MSK or Confluent Cloud
5. **CI/CD**: GitHub Actions → Docker build → ECR push → deploy

## 📊 Monitoring

- Spring Boot Actuator at `/actuator/health` on each service
- Eureka dashboard: http://localhost:8761
- Redis CLI: `docker exec -it shopnest-redis redis-cli KEYS "*"`
- Kafka topics: `docker exec -it shopnest-kafka kafka-topics.sh --list --bootstrap-server localhost:9092`
