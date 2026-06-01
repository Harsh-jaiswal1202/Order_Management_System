# Inventory & Order Management System

A production-ready, full-stack Inventory and Order Management System designed to help businesses efficiently manage their products, customers, and orders. The platform provides a beautiful, responsive dashboard with real-time stock deductions, order handling, and low-stock alerts.

## 🚀 Features

- **Product Management:** Full CRUD operations for products. Ensures unique SKUs and prevents negative inventory.
- **Customer Management:** Full CRUD operations for customers. Ensures unique email addresses.
- **Order Processing:** Create orders by linking customers to products. Automatically calculates totals and deducts stock. Built-in validations prevent ordering out-of-stock items.
- **Interactive Dashboard:** Premium UI to monitor business health, view total products, customers, orders, and quickly spot low-stock items.
- **Secure Authentication:** JWT-based authentication for secure access.
- **Fully Containerized:** Easy to deploy with Docker and Docker Compose.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React + Vite
- **Routing:** React Router v6
- **Styling:** Custom CSS (Premium Glass-morphism & Dark Mode support)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **HTTP Client:** Axios

### Backend
- **Framework:** Python + FastAPI
- **Database ORM:** SQLAlchemy
- **Data Validation:** Pydantic
- **Authentication:** JWT (JSON Web Tokens) + Passlib (Bcrypt)

### Infrastructure
- **Database:** PostgreSQL
- **Containerization:** Docker & Docker Compose

## ⚙️ Prerequisites

To run this project locally, you will need:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🏃‍♂️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Order_Management_System
   ```

2. **Configure Environment Variables:**
   The project requires a `.env` file at the root directory for Docker Compose. Ensure it looks like this:
   ```env
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=securepassword123
   POSTGRES_DB=order_management
   DATABASE_URL=postgresql://admin:securepassword123@db:5432/order_management
   ```

3. **Build and Run with Docker Compose:**
   Run the following command from the root directory to build the images and start the services:
   ```bash
   docker-compose up --build -d
   ```

4. **Access the Application:**
   - **Frontend UI:** [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new admin account
- `POST /api/auth/login` - Authenticate and get JWT
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/me` - Update email and password

### Products
- `GET /api/products/` - Retrieve all products
- `POST /api/products/` - Add a new product
- `GET /api/products/{id}` - Retrieve a product by ID
- `PUT /api/products/{id}` - Update a product
- `DELETE /api/products/{id}` - Delete a product

### Customers
- `GET /api/customers/` - Retrieve all customers
- `POST /api/customers/` - Add a new customer
- `GET /api/customers/{id}` - Retrieve a customer by ID
- `DELETE /api/customers/{id}` - Delete a customer

### Orders
- `GET /api/orders/` - Retrieve all orders
- `POST /api/orders/` - Create a new order (deducts stock)
- `GET /api/orders/{id}` - Retrieve an order by ID
- `DELETE /api/orders/{id}` - Cancel an order (restores stock)

### Dashboard
- `GET /api/dashboard/summary` - Retrieve system metrics and low stock alerts

## 🛡️ License
This project is open-source and available under the MIT License.
