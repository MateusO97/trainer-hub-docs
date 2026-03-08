# Trainer Hub - Repositories Index

## Overview

This document lists all repositories in the Trainer Hub ecosystem with their purposes, tech stacks, and links.

**Total Repositories**: 11  
**Architecture**: Microservices  
**Last Updated**: 2024-03-08

---

## 📋 Documentation Repository

### [trainer-hub-docs](https://github.com/MateusO97/trainer-hub-docs)
**Purpose**: Centralized documentation, architecture decisions, and standards  
**Type**: Documentation  
**Status**: ✅ Active  
**Contents**:
- Phase 1: 23 architecture & standards documents
- Phase 2: Implementation plans for all services
- API Contracts: Communication patterns between services
- UI/UX Design System
- Code styling & linting standards

---

## 🔐 Backend Microservices (Kotlin/Spring Boot)

### 1. [trainer-hub-auth-service](https://github.com/MateusO97/trainer-hub-auth-service)
**Purpose**: Authentication & Authorization  
**Tech Stack**: Kotlin 1.9.22, Spring Boot 3.2.3, Spring Security, JWT, PostgreSQL, Redis  
**Status**: 🚧 In Development  
**Port**: 8081  
**Dependencies**: None (foundational service)

**Features**:
- Email + Password authentication
- JWT token generation (RS256)
- OAuth2 (Google + Apple Sign-In)
- RBAC (4 roles: USER, NUTRITIONIST, TRAINER, ADMIN)
- Password reset flow
- Token validation for other services
- Audit logging

**API Endpoints**:
```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/google
POST   /api/v1/auth/apple
POST   /api/v1/auth/password-reset/request
POST   /api/v1/auth/password-reset/confirm
POST   /api/v1/auth/validate (internal)
GET    /api/v1/auth/me
```

**GitHub Issues**: 11 created ([View Issues](https://github.com/MateusO97/trainer-hub-auth-service/issues))

---

### 2. [trainer-hub-user-service](https://github.com/MateusO97/trainer-hub-user-service)
**Purpose**: User profiles, preferences & settings management  
**Tech Stack**: Kotlin, Spring Boot, PostgreSQL  
**Status**: 📝 Not Started  
**Port**: 8082  
**Dependencies**: Auth Service (token validation)

**Features**:
- User profile management (personal info, physical data)
- User preferences (diet type, restrictions, allergies)
- Goals & targets configuration
- Notification preferences
- Activity level tracking

**Key Entities**:
- User Profiles (birthDate, gender, height, weight, activityLevel)
- User Preferences (dietType, restrictions, allergies, dislikedFoods)
- User Goals (weight loss, muscle gain, maintenance)

**API Endpoints**:
```
GET    /api/v1/users/{userId}
PATCH  /api/v1/users/{userId}
GET    /api/v1/users/{userId}/preferences
PATCH  /api/v1/users/{userId}/preferences
GET    /api/v1/users/{userId}/goals
POST   /api/v1/users/{userId}/goals
```

---

### 3. [trainer-hub-food-db-service](https://github.com/MateusO97/trainer-hub-food-db-service)
**Purpose**: Comprehensive food database & nutritional information  
**Tech Stack**: Kotlin, Spring Boot, PostgreSQL (with full-text search)  
**Status**: 📝 Not Started  
**Port**: 8083  
**Dependencies**: Auth Service

**Features**:
- Food database (USDA, TACO, custom foods)
- Advanced search (name, brand, category, barcode)
- Nutritional information (macros, micros, vitamins, minerals)
- Multiple serving units support
- User-created custom foods
- Food verification system

**Key Entities**:
- Foods (name, brand, category, servingSize, nutrition)
- Food Categories (GRAINS, PROTEIN, VEGETABLES, FRUITS, etc.)
- Alternative Units (conversion between g, ml, pieces, cups)
- Custom Foods (user-created entries)

**API Endpoints**:
```
GET    /api/v1/foods/search?q={query}&limit={limit}
GET    /api/v1/foods/{foodId}
GET    /api/v1/foods/barcode/{barcode}
GET    /api/v1/foods/categories
POST   /api/v1/foods/custom (create user food)
GET    /api/v1/foods/user/{userId} (custom foods)
```

---

### 4. [trainer-hub-meal-service](https://github.com/MateusO97/trainer-hub-meal-service)
**Purpose**: Meal logging, planning & tracking  
**Tech Stack**: Kotlin, Spring Boot, PostgreSQL, RabbitMQ  
**Status**: 📝 Not Started  
**Port**: 8084  
**Dependencies**: Auth Service, User Service, Food DB Service

**Features**:
- Meal logging (breakfast, lunch, dinner, snacks)
- Photo upload & attachment
- Meal plans (created by nutritionists)
- Meal templates & favorites
- Quick logging from recent meals
- Scheduled meal reminders

**Key Entities**:
- Meals (userId, mealType, consumedAt, foods, totalNutrition)
- Meal Plans (userId, createdBy, dailyTargets, meals)
- Meal Templates (reusable meal configurations)
- Favorite Meals

**API Endpoints**:
```
POST   /api/v1/meals
GET    /api/v1/meals?userId={userId}&date={date}
GET    /api/v1/meals/{mealId}
PATCH  /api/v1/meals/{mealId}
DELETE /api/v1/meals/{mealId}
GET    /api/v1/meal-plans/{userId}/current
POST   /api/v1/meal-plans
GET    /api/v1/meals/templates
POST   /api/v1/meals/favorites
```

**Events Published**:
- `meal.logged` → Nutrition Service, Tracking Service, AI Service
- `meal.reminder` → Notification Service

---

### 5. [trainer-hub-nutrition-service](https://github.com/MateusO97/trainer-hub-nutrition-service)
**Purpose**: Nutritional analysis, goals calculation & daily summaries  
**Tech Stack**: Kotlin, Spring Boot, PostgreSQL, Redis (caching)  
**Status**: 📝 Not Started  
**Port**: 8085  
**Dependencies**: Auth Service, User Service, Meal Service

**Features**:
- Nutritional goals calculation (BMR, TDEE, macros)
- Daily nutritional summaries
- Weekly/monthly reports
- Macro distribution analysis
- Adherence tracking
- Micronutrient analysis

**Key Entities**:
- Nutrition Goals (userId, bmr, tdee, recommendedCalories, macros)
- Daily Summaries (date, consumed, targets, remaining, percentages)
- Weekly Reports (averages, trends, adherence)

**API Endpoints**:
```
POST   /api/v1/nutrition/calculate-goals
GET    /api/v1/nutrition/goals/{userId}
GET    /api/v1/nutrition/summary?userId={userId}&date={date}
GET    /api/v1/nutrition/weekly?userId={userId}&startDate={date}
GET    /api/v1/nutrition/adherence?userId={userId}&period={period}
```

**Events Consumed**:
- `meal.logged` → Update daily summaries

---

### 6. [trainer-hub-tracking-service](https://github.com/MateusO97/trainer-hub-tracking-service)
**Purpose**: Weight tracking, body measurements & progress reporting  
**Tech Stack**: Kotlin, Spring Boot, PostgreSQL, RabbitMQ  
**Status**: 📝 Not Started  
**Port**: 8086  
**Dependencies**: Auth Service, User Service

**Features**:
- Weight logging with trends
- Body measurements (waist, chest, arms, etc.)
- Progress photos
- Goal progress tracking
- Streaks & achievements
- Progress reports & charts

**Key Entities**:
- Weight Logs (userId, weight, unit, measuredAt, difference, trend)
- Body Measurements (userId, measurements, measuredAt)
- Progress Photos (userId, photoUrl, weight, date)
- Progress Snapshots (weekly/monthly summaries)

**API Endpoints**:
```
POST   /api/v1/tracking/weight
GET    /api/v1/tracking/weight?userId={userId}&limit={limit}
POST   /api/v1/tracking/measurements
GET    /api/v1/tracking/measurements/{userId}
POST   /api/v1/tracking/photos
GET    /api/v1/tracking/progress?userId={userId}&startDate={date}&endDate={date}
GET    /api/v1/tracking/streaks/{userId}
```

**Events Published**:
- `weight.logged` → AI Service, Notification Service

---

### 7. [trainer-hub-ai-service](https://github.com/MateusO97/trainer-hub-ai-service)
**Purpose**: AI-powered recommendations & food photo recognition  
**Tech Stack**: Python 3.11, FastAPI, TensorFlow/PyTorch, PostgreSQL  
**Status**: 📝 Not Started  
**Port**: 8087  
**Dependencies**: Auth Service, User Service, Food DB Service, Meal Service, Tracking Service

**Features**:
- Meal recommendations (personalized suggestions)
- Food photo recognition (ML models)
- Portion size estimation
- Goal achievement predictions
- Nutritional pattern analysis
- Anomaly detection (unusual eating patterns)

**Key Entities**:
- Recommendations (userId, type, recommendation, confidence)
- Photo Analyses (photoAnalysisId, detectedFoods, confidence)
- ML Models (food recognition, portion estimation)

**API Endpoints**:
```
POST   /api/v1/ai/recommendations
POST   /api/v1/ai/analyze-photo
GET    /api/v1/ai/predictions/{userId}
GET    /api/v1/ai/insights/{userId}
```

**Events Consumed**:
- `meal.logged` → Update recommendation models
- `weight.logged` → Adjust predictions
- `goal.achieved` → Reinforce patterns

**Events Published**:
- `goal.achieved` → Notification Service

---

### 8. [trainer-hub-notification-service](https://github.com/MateusO97/trainer-hub-notification-service)
**Purpose**: Push notifications, emails & SMS delivery  
**Tech Stack**: Kotlin, Spring Boot, PostgreSQL, Redis, RabbitMQ, Firebase Cloud Messaging  
**Status**: 📝 Not Started  
**Port**: 8088  
**Dependencies**: Auth Service, User Service

**Features**:
- Push notifications (iOS, Android via FCM)
- Email notifications (SendGrid/AWS SES)
- SMS notifications (Twilio)
- Notification scheduling
- Notification history & read receipts
- User notification preferences
- Meal reminders (scheduled jobs)

**Key Entities**:
- Notifications (notificationId, userId, type, title, body, channels)
- Notification Preferences (userId, channels, enabled, schedule)
- Device Tokens (userId, deviceToken, platform)

**API Endpoints**:
```
POST   /api/v1/notifications (internal)
GET    /api/v1/notifications?userId={userId}
PATCH  /api/v1/notifications/{notificationId}/read
GET    /api/v1/notifications/preferences/{userId}
PATCH  /api/v1/notifications/preferences/{userId}
POST   /api/v1/notifications/devices (register FCM token)
```

**Events Consumed**:
- `meal.reminder` → Send reminder notification
- `weight.logged` → Send congratulations
- `goal.achieved` → Send achievement notification

---

## 🌐 API Gateway

### [trainer-hub-gateway](https://github.com/MateusO97/trainer-hub-gateway)
**Purpose**: Single entry point, routing & authentication  
**Tech Stack**: Kotlin, Spring Cloud Gateway, Spring Security, Redis  
**Status**: 📝 Not Started  
**Port**: 8080  
**Dependencies**: Auth Service (token validation)

**Features**:
- API routing to backend microservices
- JWT token validation (via Auth Service)
- Rate limiting (per user, per IP)
- CORS configuration
- Request/response logging
- Circuit breaker (Resilience4j)
- API versioning support

**Routing Configuration**:
```
/api/v1/auth/**      → Auth Service (8081)
/api/v1/users/**     → User Service (8082)
/api/v1/foods/**     → Food DB Service (8083)
/api/v1/meals/**     → Meal Service (8084)
/api/v1/nutrition/** → Nutrition Service (8085)
/api/v1/tracking/**  → Tracking Service (8086)
/api/v1/ai/**        → AI Service (8087)
/api/v1/notifications/** → Notification Service (8088)
```

**Security**:
- Public endpoints: `/api/v1/auth/login`, `/api/v1/auth/google`, `/api/v1/auth/apple`
- Protected endpoints: All others (require JWT)
- Rate limit: 1000 req/hour per user

---

## 📱 Mobile Application

### [trainer-hub-mobile](https://github.com/MateusO97/trainer-hub-mobile)
**Purpose**: Cross-platform mobile app (iOS & Android)  
**Tech Stack**: React Native 0.73, TypeScript, Redux Toolkit, React Navigation  
**Status**: 📝 Not Started  
**Dependencies**: Gateway Service (all API calls)

**Features**:
- User authentication (email, Google, Apple Sign-In)
- Profile management
- Food search & database
- Meal logging with camera
- AI food recognition
- Nutritional goals & tracking
- Weight tracking with charts
- Progress photos
- Push notifications
- Meal reminders
- Dark mode support
- Offline mode (cached data)

**Key Libraries**:
- React Native Camera (food photos)
- React Native Charts (progress visualization)
- Redux Persist (offline support)
- React Native Push Notification (FCM)
- React Native Biometrics (fingerprint/face login)

**Screens**:
```
Auth Flow:
- Login Screen
- Signup Screen
- OAuth Screen
- Onboarding Wizard

Main Tabs:
- Home (daily summary, quick log)
- Meals (meal logging, history)
- Progress (weight, measurements, charts)
- Profile (settings, preferences)

Secondary Screens:
- Food Search
- Food Details
- Meal Details
- AI Food Recognition
- Weight Log
- Measurements
- Progress Photos
- Notifications
- Settings
```

---

## 🗂️ Communication Patterns

### Synchronous (REST APIs)
- Mobile App → Gateway → Backend Services
- Gateway → Auth Service (token validation)
- Services → Services (via internal APIs)

### Asynchronous (RabbitMQ Events)
- Meal Service → Nutrition Service, Tracking Service, AI Service
- Tracking Service → AI Service, Notification Service
- AI Service → Notification Service

### Service Discovery
- Kubernetes DNS: `service-name.namespace.svc.cluster.local`
- Local dev: Docker Compose with service names

---

## 📊 Development Status

| Repository | Status | Issues | PRs | Last Commit |
|-----------|--------|--------|-----|-------------|
| trainer-hub-docs | ✅ Active | - | - | 2024-03-08 |
| trainer-hub-auth-service | 🚧 In Dev | 11 | 0 | 2024-03-08 |
| trainer-hub-user-service | 📝 Not Started | 0 | 0 | - |
| trainer-hub-food-db-service | 📝 Not Started | 0 | 0 | - |
| trainer-hub-meal-service | 📝 Not Started | 0 | 0 | - |
| trainer-hub-nutrition-service | 📝 Not Started | 0 | 0 | - |
| trainer-hub-tracking-service | 📝 Not Started | 0 | 0 | - |
| trainer-hub-ai-service | 📝 Not Started | 0 | 0 | - |
| trainer-hub-notification-service | 📝 Not Started | 0 | 0 | - |
| trainer-hub-gateway | 📝 Not Started | 0 | 0 | - |
| trainer-hub-mobile | 📝 Not Started | 0 | 0 | - |

---

## 🎯 Implementation Roadmap

### Phase 2 - Wave 1 (Weeks 1-2)
**Foundational Services** - No dependencies
- ✅ Auth Service (in development)
- 🔲 User Service
- 🔲 Food DB Service

### Phase 2 - Wave 2 (Weeks 3-5)
**Core Business Logic** - Depends on Wave 1
- 🔲 Meal Service
- 🔲 Nutrition Service
- 🔲 Tracking Service

### Phase 2 - Wave 3 (Weeks 6-8)
**Advanced Features** - Depends on Waves 1 & 2
- 🔲 AI Service
- 🔲 Notification Service

### Phase 2 - Wave 4 (Weeks 9-10)
**Infrastructure & Integration** - Depends on all backend services
- 🔲 Gateway Service

### Phase 2 - Wave 5 (Weeks 11-15)
**Client Application** - Depends on Gateway
- 🔲 Mobile App

---

## 🔗 Quick Links

### Documentation
- [Architecture Overview](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/01-VISION.md)
- [Microservices Spec](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/05-MICROSERVICES.md)
- [API Contracts](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/API-CONTRACTS.md)
- [UI/UX Design System](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/UI-UX-DESIGN-SYSTEM.md)
- [Code Styling Guide](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/CODE-STYLING-LINTING.md)

### GitHub Organization
- All repositories: [MateusO97](https://github.com/MateusO97?tab=repositories&q=trainer-hub)

### CI/CD
- GitHub Actions workflows in each repository
- Docker images: `ghcr.io/mateuso97/trainer-hub-*-service`

---

## 🤝 Contributing

Each repository has its own contribution guidelines. General standards:
- Follow conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- All PRs require code review
- CI/CD must pass (linting, tests, build)
- Minimum 80% test coverage
- OpenAPI documentation updated

---

## 📄 License

All repositories: MIT License

---

**Last Updated**: 2024-03-08  
**Maintainer**: Mateus de Oliveira Barbosa (@MateusO97)
