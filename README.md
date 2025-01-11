# Re:Books Back-End Repository

Welcome to the front-end repository for **Re:Books** — an innovative platform connecting individuals who wish to sell books from their personal libraries with those eager to purchase them. This application fosters a community-driven marketplace where users can list books for sale, browse available collections, and communicate seamlessly with each other.

[Visit Website](https://rebooksctd.netlify.app/)

This repository hosts the Back-End codebase responsible for handling API requests and connecting to the [React.js application](https://github.com/Code-the-Dream-School/hh-team6-front).

## Back-End Repository Deployment  
The back-end of the project is deployed here: [Deployment Link](https://re-books-back.onrender.com)

## Key Features

### User Registration and Account Management

- **Sign Up**: Users can register an account to buy and sell books.
- **Account Management**: Users can provide detailed profile information and manage their listed and purchased books.
- **Dashboard**: Displays sections for managing books in user's account.
- **Password Management**: Allows users to reset or update their password.

### Search, Filtering, and Sorting

- **Search Functionality**: Search for books by title, author, or ISBN.
- **Filter Options**: Narrow results by age category, genre, format, and condition.
- **Sorting and Pagination**: Organize search results for easier browsing.

### Book Viewing and Purchasing

- **List View**: View all books that are available in stock.
- **Detailed Views**: View book details, including cover, author, genre, price, and condition.
- **Purchase Books**: Users can purchase books after logging in.

### Communication System

- **Messaging**: Real-time messaging for user-to-user communication regarding books with Socket.io.
- **Notifications (Stretch Goal)**: Alerts for messages and book-related updates. 

### Stretch Goal: Online Payment for Books
- **Payment Integration**: Securely process payments with Stripe or PayPal.
- **Payment Records**: Store payment history and provide transaction details in user profiles. 


## Technologies Used

Our back-end is powered by a robust set of tools and libraries, ensuring a scalable, secure, and efficient architecture:

- **Core Frameworks:**

  - `Node.js` - A JavaScript runtime for building fast and scalable server-side applications.
  - `Express.js` - A lightweight and flexible web framework for building APIs and handling HTTP requests and routing.

- **Database Management:**

  - `MongoDB` - A NoSQL database for storing data.
  - `Mongoose` - An Object Data Modeling (ODM) library for MongoDB, simplifying database interactions and schema validation.

- **Security and Authentication:**

  - `jsonwebtoken` - For generating JWT tokens.
  - `bcryptjs` - For hashing passwords.
  - `cors` - Middleware for handling Cross-Origin Resource Sharing (CORS) in Express.js applications.

- **File Handling and Uploads:**

  - `Multer` - Middleware for handling `multipart/form-data for` file uploads.
  - `Cloudinary` - A cloud-based image and video management service, enabling easy uploads and optimized delivery.

- **Real-Time Communication:**

  - `Socket.io` - Enables real-time, bi-directional communication between clients and servers..

- **API Documentation and Testing:**

  - `Swagger JSDoc` - A library for generating OpenAPI documentation from JSDoc comments in the codebase.
  - `Swagger UI Express` - A tool to serve interactive API documentation.
  - `Postman` - A popular API testing tool used for developing, testing, and debugging API endpoints, ensuring they work as expected.

- **Email Functionality:**

  - `Nodemailer` - A library for sending emails, commonly used for transactional emails like password resets and notifications.

- **Utility Libraries:**

  - `HTTP Status Codes` - Provides descriptive HTTP response status codes.

- **Security and Authentication:**

  - `Nodemon` - Automatically restarts the server during development when file changes are detected.
  - `ESLint` - A tool for identifying and fixing JavaScript code issues.
  - `Prettier` - A code formatter to enforce consistent code styling.

## Quick Start

### Setup

1. **Clone the Repository**: Create a folder to contain both the front-end and back-end repos. Clone this back-end and [our frontend](https://github.com/Code-the-Dream-School/hh-team6-front) repositories to your local machine.
2. **Install Dependencies**: Run `npm install` to install all required dependencies for each repository separately.
3. **Start the Development Server**: Run `npm run dev` to start the development server on `localhost:5173` for the frontend or `localhost:8000` for the backend.
4. **Explore the Application**: Navigate through the application to explore its features.

### Environment Variables

To properly run this application, you need to set up environment variables. This is done by creating a `.env` file in the root directory of the backend folder with the following variables:

- **`MONGO_URI`**:  
  This is the connection string for your MongoDB database.
  ```bash
  MONGODB_URI=mongodb://username:password@localhost:27017/database_name
  ```

- **`JWT_SECRET`**:  
  This is the secret key used for signing JSON Web Tokens (JWT).
  ```bash
  JWT_SECRET=your_SECRET_key
  ```

- **`JWT_LIFETIME`**:  
  This defines the lifetime of the JSON Web Token (JWT).
  ```bash
  JWT_LIFETIME=2h
  ```

- **`CLOUDINARY_CLOUD_NAME`**:  
  This is the name of your cloud account used for image storage.
  ```bash
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  ```
  
- **`CLOUDINARY_API_KEY`**:  
  This is your API key for accessing the cloud service.
  ```bash
  CLOUDINARY_API_KEY=your_API_key
  ```

- **`CLOUDINARY_API_SECRET`**:  
  This is your secret API key for accessing the cloud service.
  ```bash
  CLOUDINARY_API_SECRET=your_secret_API
  ```

- **`DEFAULT_IMAGE_URL`**:  
  This is the default URL for the cover image used when no cover image is provided.

  ```bash
  DEFAULT_IMAGE_URL=https://example.com/default_cover_image.jpg
  ```

- **`DEFAULT_IMAGE_PUBLIC_ID`**:  
  This is the default public ID for the image stored in your cloud storage (e.g., Cloudinary). It is used to identify the default image when no other image is provided.

  ```bash
  DEFAULT_IMAGE_PUBLIC_ID=default_image_id
  ```

- **`GMAIL_USER`**:  
  The Gmail account used for sending emails from the application. Typically, this is the email address of the sender.

  ```bash
  GMAIL_USER=your_email@gmail.com
  ```

- **`GMAIL_PASS`**:  
  The password or app-specific password for the Gmail account specified in GMAIL_USER. It is used for authentication when sending emails.

  ```bash
  GMAIL_PASS=your_email_password
  ```

- **`FRONTEND_URL`**:  
  The URL of the front-end application that connects to this back-end service. It is often used for redirects or CORS configuration.

  ```bash
  FRONTEND_URL=https://example-frontend.com
  ```


## API Documentation
This project includes comprehensive API documentation generated with [Swagger](https://swagger.io/). You can explore and test the API endpoints using the Swagger UI available at: `http://localhost:8000/api-docs`. Ensure that you have the server running before accessing the documentation.

## Authors
[Valentina Rudnitskaya](https://github.com/vrudnitskaya)
[Tetiana Andriyanova](https://github.com/Tanyaa-a)
