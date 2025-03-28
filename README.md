# Court Reservation Web Application

A full-featured web application built with Express.js and MySQL for managing sports court reservations, including user authentication, admin functionalities, image uploads, and dynamic views using EJS templates.

Note: The user interface is in Hungarian.

## Technology Stack

- Backend: Node.js + Express
- Frontend (view engine): EJS
- Database: MySQL
- Session Handling: express-session
- Validation: Joi
- Password Security: bcrypt
- File Uploads: multer
- Logging: morgan

## Features

### User Features

- Register and log in
- Manage personal data:
  - Change email address
  - Change username
  - Change password
  - Delete profile
- Browse and filter courts by name and hourly rate
- View court details and available reservation slots
- Make new reservations
- View or cancel existing reservations
- View uploaded court images

### Admin Features

- Approve new user registrations
- Add new courts with full metadata (name, hourly rate, address, description, opening hours)
- Upload images for courts
- Manage (delete) users and their reservations

### Image Management

- Upload images in .jpg, .png, etc. formats
- Images are stored on the server filesystem
- MIME type validation is performed

## Validation and Security

- Input validation using Joi (e.g., email format, time ranges, required fields)
- Passwords are stored securely with bcrypt
- Image files are validated for correct MIME type
- Sessions restrict access to authenticated users and admins
- Protected routes for critical operations like bookings

## Usage Notes

- A new user must be approved by an admin before accessing full features
- Booking logic prevents overlapping time slots and respects court opening hours
- Admins have full control over users and courts
- Each court can have multiple uploaded images

## Example Use Cases

- A guest can browse court listings
- A registered user can reserve a court, manage their profile
- An admin can approve users, manage courts, and handle user data
