# faster-crud

**Version**: 1.0.1
**Author**: Mauro Ciappina

## Description

A dynamic CRUD library for Mongoose with CLI support

## Features

- Dynamic CRUD operations using Mongoose
- Command Line Interface (CLI) for easy setup and operations
- Supports advanced configuration via `crud.config.js`
- Includes middleware support (e.g., rate limiting, input sanitization)
- Automatically generates API documentation using Swagger

## Installation

To install the library, run:

```bash
npm install faster-crud
```

## Usage

### Import the Library

```javascript
import fasterCrud from "faster-crud";
// Initialize the library
fasterCrud.initialize();
```

### Running the CLI

The library provides a CLI for easier management:

```bash
faster-crud
```

## Dependencies

The library uses the following dependencies:
{
"@faker-js/faker": "^8.4.1",
"axios": "^1.7.9",
"dotenv": "^16.4.7",
"express": "^4.21.2",
"express-mongo-sanitize": "^2.2.0",
"express-rate-limit": "^7.5.0",
"helmet": "^8.0.0",
"inquirer": "^9.3.7",
"joi": "^17.13.3",
"mongoose": "^6.13.8",
"swagger-ui-express": "^5.0.1"
}

### Development Dependencies

{
"jest": "^29.7.0",
"supertest": "^7.0.0"
}

## API Documentation

API documentation is auto-generated using Swagger. Access it at `/api-docs` when running your
application.

## License

This project is licensed under the MIT License.
