# COSC2769 FullStack Group Project

## Brief Introduction

This project is a full-stack application developed as the COSC2769 group project. It features a frontend built with Vite, React, and TypeScript, and a backend powered by Express.js and TypeScript. The application is designed to provide a seamless user experience for customers, vendors, and shippers. Additionally, it uses `zod` in both the frontend and backend for input validation, ensuring data integrity and type safety across the application.

## Features

- **Frontend**: Modern UI with React, Redux Toolkit, and Tailwind CSS.
- **Backend**: RESTful API with Express.js, TypeScript, and role-based authentication.
- **State Management**: Redux with persistence for `auth` and `cart` slices.
- **Role-Specific Dashboards**: Separate flows for customers, vendors, and shippers.
- **Docker Support**: Easy setup with Docker Compose.
- **API Documentation**: Comprehensive API details for developers.

For more details, refer to the [Features and Architecture](docs/FRONTEND_ARCHITECTURE.md).

## Prerequisite

- Node.js (v22 or higher) - **Recommended**
- npm (Node Package Manager)
- Docker Desktop (optional, for Docker setup)

## Set up and Installation

### Option 1: Using Node.js (Recommended)

1. Install dependencies:
   ```bash
   npm run install:all
   ```
2. Start the backend and frontend:
   ```bash
   npm run dev:all
   ```

### Option 2: Using Docker (Optional)

1. Build and start the application:
   ```bash
   docker-compose up --build
   ```
2. Open Docker Desktop to manage containers.

For detailed setup instructions, refer to the [File Structure](docs/FILE_STRUCTURE.md).

## Usage Instruction

- Access the frontend at `http://localhost:3000`.
- API base URL: `http://localhost:5000/api`.
- Role-based access:
  - Customers: Browse products, manage cart, and checkout.
  - Vendors: Manage products and view orders.
  - Shippers: Handle order deliveries.

For API details, see the [API System Overview](docs/API_SYSTEM.md).

### Hosted Application

You can access the hosted version of the application at: https://cosc-2769-full-stack-group-project-17tlek8eb.vercel.app

## Contribution

This project is a group assignment. All team members share the same contribution score of `five`. Below are the detailed contributions of each member:

- **Name**: Truong Ba An  
  **Student ID**: s3999568  
  **Jobs**: 
  + Code:  
    - Initialized and configured GitHub repository for backend  
    - Scheduled and divided work among team members  
    - Designed and maintained PostgreSQL database schema and relations (Supabase)  
    - Structured backend project (router, controller, service layers)  
    - Implemented backend functionality for User, Customer, Shipper, and Vendor modules, including login, registration, authentication, and authorization for all roles.
    - Developed utility functions for JSON responses, password handling, and an image service for retrieving and reusing images from the database.
    - Reviewed, guided, and merged backend code from team members; resolved conflicts  
    - Performed manual black-box and white-box testing on frontend to detect bugs/UI issues  
    - Deployed both frontend and backend servers  
    - Configured Dockerfile to simplify local development setup  
  + Report:  
    - Wrote the **Project Description**, **Development Process**, and **Known Issues or Limitations** sections of the project report  

- **Name**: Tran Hoang Linh  
  **Student ID**: s4043097\
  **Jobs**:

  - Code: FE implmentation (I wrote the whole frontend folder by myself)
  - Report: Container (Architecture) Diagram, Sequence Diagrams, Frontend Implementation, UI/UX Design, FE Tools and Package Selection

- **Name**: Nguyen Vo Truong Toan  
  **Student ID**: s3979056  
  **Jobs**:  
  + Code: Validation Middleware & Controllers/ Routes/ Services for Products Management Features:  
             - Pagination  
             - All users (including Guests) can view all products, filter products by price range, search products by name and category.  
             - Customers and Vendors can View Details of a specific product.  
             - Vendors can view all their own products.  
             - Vendors can add and update products.  
  + Report: Introduction, ERD, Backend Implementation, Backend Tools & Package Selection, Visual Demonstration, Feature Checklist, and Evaluation  
  + Video: 

- **Name**: Nguyen The Anh  
  **Student ID**: s3975844  
  **Jobs**:
  - Code: Controllers/ Routes/ Services for shopping cart, add product to cart, order management, and order item list
  - Report: Introduction, ERD, Backend Implementation, Backend Tools & Package Selection, Visual Demonstration, Feature Checklist, and Evaluation
  - Video:

For Redux-related contributions, refer to the [Redux Architecture Guide](docs/REDUX.md).

---

For more information, explore the `docs` folder for detailed documentation on various aspects of the project.