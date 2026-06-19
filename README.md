# 📚 Enterprise Scholarship Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Enterprise-Grade Scholarship Portal** - Production-ready full-stack application with advanced features, security, analytics, and deployment automation.

---

## 🚀 **Project Overview**

A comprehensive **Scholarship Management System** built with modern enterprise architecture:
- ✅ **Backend**: Spring Boot 3.4.2 + Spring Security + JWT Authentication
- ✅ **Frontend**: React 19 + React Router 7 + Bootstrap 5 + Recharts
- ✅ **Database & Cache**: MySQL 8 with JPA/Hibernate ORM + Embedded Redis
- ✅ **Event-Driven**: Embedded Kafka (KRaft) for async processing with DLQ and Idempotency
- ✅ **Features**: 150+ enterprise features including dark mode, analytics, file uploads, audit logs, saved scholarships
- ✅ **Observability**: Spring Boot Actuator + Prometheus metrics
- ✅ **Deployment**: Docker-ready with production configurations and zero-dependency local mode

---

## 📋 **Table of Contents**

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Docker Deployment](#docker-deployment)
8. [API Documentation](#api-documentation)
9. [Testing](#testing)
10. [Production Deployment](#production-deployment)
11. [Security](#security)
12. [Troubleshooting](#troubleshooting)

---

## ✨ **Features**

### 🎯 **Core Features**
- **User Management**: Role-based access (Admin/Student) with JWT authentication
- **Scholarship Management**: CRUD operations with soft delete support
- **Application Processing**: Submit, review, approve/reject applications
- **Saved Scholarships**: Bookmark/save scholarships for later with robust backend management
- **Eligibility Engine**: Advanced filtering based on GPA, income, category
- **Notifications**: Real-time asynchronous notifications for status updates via Kafka
- **File Uploads**: Document management with validation (5MB limit, multiple formats)

### 🏢 **Enterprise Features**

#### Backend Enhancements
- ✅ **Zero-Dependency Local Infra**: Programmatic bootstrapping of Embedded Kafka (KRaft) and Embedded Redis (`LocalInfraBootstrap`) for seamless local development
- ✅ **Advanced Event-Driven Architecture**: Kafka consumers with Dead Letter Queues (DLQ) and Idempotency for reliable event processing
- ✅ **Distributed Caching & Concurrency**: Redis-backed distributed locking and rate-limiting to prevent API abuse and race conditions
- ✅ **Observability**: Spring Boot Actuator and Prometheus endpoints for comprehensive system monitoring
- ✅ **Exception Handling**: Global exception handler (`@RestControllerAdvice`) with structured error responses and Bean Validation
- ✅ **Logging & Monitoring**: SLF4J logging at INFO/WARN/ERROR levels with correlation IDs
- ✅ **Audit Trail**: Complete Kafka-based audit log for all critical operations
- ✅ **Soft Delete**: Data preservation with isDeleted flag
- ✅ **Email Notifications**: Service layer for welcome/approval/rejection emails (console mode)
- ✅ **Application History**: Track all status changes with timestamps
- ✅ **Analytics API**: Comprehensive admin dashboard with statistics
- ✅ **Database Optimization**: Indexed queries, repository enhancements, API response wrappers
- ✅ **Production Config**: Externalized environment-based configuration with `.env` secrets

#### Frontend Enhancements
- ✅ **Error Boundary**: React error boundary for graceful error handling
- ✅ **API Interceptor**: Auto-logout on 401, global error handling, request/response logging
- ✅ **Dark Mode**: Theme toggle with localStorage persistence
- ✅ **Charts & Analytics**: Recharts integration for data visualization
- ✅ **Search & Filter**: Advanced scholarship search with category/amount filters
- ✅ **Pagination**: Reusable pagination component with ellipsis
- ✅ **Skeleton Loading**: Loading placeholders instead of spinners
- ✅ **Accessibility**: ARIA labels, keyboard navigation, focus styles
- ✅ **Toast Notifications**: Real-time feedback for user actions
- ✅ **Responsive Design**: Mobile-first Bootstrap 5 layout

---

## 🛠️ **Technology Stack**

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 21 | Programming Language |
| **Spring Boot** | 3.4.2 | Application Framework |
| **Spring Security** | 6.x | Authentication & Authorization |
| **Spring Data JPA** | 3.x | ORM & Database Access |
| **Hibernate** | 6.x | JPA Implementation |
| **Kafka (Embedded)** | 3.x | Async Messaging & Event-Driven Architecture |
| **Redis (Embedded)** | 7.x | Caching, Rate Limiting & Distributed Locks |
| **JWT** | io.jsonwebtoken | Token-based Authentication |
| **MySQL** | 8.0+ | Relational Database |
| **Actuator & Prometheus**| Latest | Health Checks & Metrics |
| **SLF4J/Logback** | Latest | Logging Framework |
| **Maven** | 3.9+ | Build Tool |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.4 | UI Library |
| **React Router** | 7.13.1 | Client-side Routing |
| **Bootstrap** | 5.3.8 | CSS Framework |
| **Recharts** | 2.12.7 | Charting Library |
| **Axios** | 1.13.6 | HTTP Client |
| **React Icons** | 5.5.0 | Icon Library |
| **React Toastify** | 11.0.5 | Notifications |

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **Git** - Version Control
- **npm** - Frontend Package Manager

---

## 📦 **Prerequisites**

Ensure you have the following installed:

- **Java 21** - [Download](https://www.oracle.com/java/technologies/downloads/#java21)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/mysql/)
- **Maven 3.9+** - [Download](https://maven.apache.org/download.cgi)
- **Docker** (Optional) - [Download](https://www.docker.com/products/docker-desktop)

---

## 🔧 **Installation**

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/scholarship-management-system.git
cd scholarship-management-system
```

### 2. Database Setup
```sql
-- Create database
CREATE DATABASE scholarship_portal;

-- Create user (optional)
CREATE USER 'scholaruser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON scholarship_portal.* TO 'scholaruser'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend Setup
```bash
cd Scholarship_Portal_for_Students-main

# Configure application.properties
# Edit src/main/resources/application.properties
# Update database credentials:
spring.datasource.url=jdbc:mysql://localhost:3306/scholarship_portal
spring.datasource.username=root
spring.datasource.password=yourpassword

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend will start on **http://localhost:8080**

### 4. Frontend Setup
```bash
cd scholarship-portal-frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will start on **http://localhost:3000**

---

## ⚙️ **Configuration**

### Backend Configuration (application.properties)
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/scholarship_portal
spring.datasource.username=root
spring.datasource.password=password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Secret
jwt.secret=your-256-bit-secret-key-change-in-production

# File Upload
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
file.upload.dir=uploads/

# Logging
logging.level.root=INFO
logging.level.com.scholarship=DEBUG
logging.file.name=logs/application.log
```

### Frontend Configuration (.env)
```bash
REACT_APP_API_URL=http://localhost:8080
```

---

## 🏃 **Running the Application**

### Development Mode

**Option 1: Separate Terminals**
```bash
# Terminal 1 - Backend
cd Scholarship_Portal_for_Students-main
mvn spring-boot:run

# Terminal 2 - Frontend
cd scholarship-portal-frontend
npm start
```

**Option 2: Docker Compose**
```bash
docker-compose up --build
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html (if configured)

### Default Credentials
```
Admin:
Username: admin@example.com
Password: admin123

Student:
Username: student@example.com
Password: student123
```

---

## 🐳 **Docker Deployment**

### Backend Dockerfile
```dockerfile
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: scholarship_portal
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./Scholarship_Portal_for_Students-main
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/scholarship_portal
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: rootpassword

  frontend:
    build: ./scholarship-portal-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

---

## 📚 **API Documentation**

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |

### Scholarship Endpoints (Student)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/scholarships` | Get all active scholarships |
| GET | `/scholarships/{id}` | Get scholarship by ID |
| GET | `/scholarships/eligible` | Get eligible scholarships |

### Application Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/applications` | Submit application |
| GET | `/applications/my` | Get my applications |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/scholarships` | Create scholarship |
| PUT | `/admin/scholarships/{id}` | Update scholarship |
| DELETE | `/admin/scholarships/{id}` | Soft delete scholarship |
| GET | `/admin/applications` | Get all applications |
| PUT | `/admin/applications/{id}/approve` | Approve application |
| PUT | `/admin/applications/{id}/reject` | Reject application |
| GET | `/admin/analytics` | Get analytics data |

### File Upload Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents/upload` | Upload student document |
| GET | `/documents/my` | Get my documents |

---

## 🧪 **Testing**

### Backend Tests
```bash
cd Scholarship_Portal_for_Students-main
mvn test
```

### Frontend Tests
```bash
cd scholarship-portal-frontend
npm test
```

---

## 🌐 **Production Deployment**

### 1. Environment Variables
Create `.env.production`:
```bash
DB_URL=jdbc:mysql://production-db:3306/scholarship_portal
DB_USERNAME=produser
DB_PASSWORD=securepassword
JWT_SECRET=production-secret-key-256-bits
```

### 2. Build Production Artifacts
```bash
# Backend
cd Scholarship_Portal_for_Students-main
mvn clean package -DskipTests

# Frontend
cd scholarship-portal-frontend
npm run build
```

### 3. Deploy to Cloud
- **AWS**: Elastic Beanstalk, EC2, RDS
- **Azure**: App Service, Database for MySQL
- **Heroku**: Web dynos + ClearDB MySQL
- **DigitalOcean**: Droplets + Managed Databases

---

## 🔒 **Security Features**

- ✅ JWT-based authentication with token expiration
- ✅ Password encoding with BCrypt
- ✅ Role-based access control (RBAC)
- ✅ CORS configuration for frontend-backend communication
- ✅ SQL injection prevention with JPA
- ✅ XSS protection with Content Security Policy
- ✅ HTTPS enforcement in production
- ✅ Auto-logout on token expiration
- ✅ Audit logging for compliance

---

## 🐛 **Troubleshooting**

### Backend Issues
**Issue**: `Connection refused to MySQL`
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify credentials in application.properties
```

**Issue**: `Port 8080 already in use`
```bash
# Find and kill process
lsof -ti:8080 | xargs kill -9
```

### Frontend Issues
**Issue**: `Module not found`
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: `CORS error`
```java
// Add to SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.addAllowedOrigin("http://localhost:3000");
    config.addAllowedMethod("*");
    config.addAllowedHeader("*");
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

---

## 📝 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 **Contributors**

- **Your Name** - *Full Stack Developer* - [GitHub](https://github.com/yourusername)

---

## 🙏 **Acknowledgments**

- Spring Boot Team
- React Community
- Bootstrap Contributors
- Recharts Library
- All open-source contributors

---

## 📧 **Contact**

For questions or support:
- **Email**: your.email@example.com
- **LinkedIn**: [Your Profile](https://linkedin.com/in/yourprofile)
- **GitHub**: [Your GitHub](https://github.com/yourusername)

---

**⭐ If this project helped you, please give it a star!**
