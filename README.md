# quick-crud

A dynamic CRUD library for Mongoose with CLI support, designed to streamline the creation of robust and efficient CRUD operations in Node.js applications.

---

## Features

- **Easy Setup:** Quickly integrate CRUD functionality into your project.
- **CLI Support:** Automate tasks and manage configurations effortlessly.
- **Mongoose Integration:** Simplifies working with MongoDB.
- **Custom Middleware:** Easily apply global and route-specific middleware.
- **Dynamic Configuration:** Customize behavior via `crud.config.js`.

---

## Installation

Install the library via NPM:

```bash
npm install quick-crud

```

Basic Setup 1. Import the library in your project:
import quickCRUD from 'quick-crud';

2. Configure your CRUD operations in crud.config.js:
   export default {
   models: ["user", "product"],
   middleware: [(req, res, next) => { console.log("Middleware applied"); next(); }],
   };

   3.Start the server:

   import express from 'express';
   import quickCRUD from 'quick-crud';

const app = express();

quickCRUD(app);

app.listen(3000, () => {
console.log('Server is running on port 3000');
});
CLI Commands

Run the following commands for streamlined operations:
• Initialize Configuration
quick-crud init

Generate Models

quick-crud generate modelName
Configuration

The crud.config.js file allows you to define the behavior of your CRUD operations:

export default {
databaseUrl: "mongodb://localhost:27017/quick-crud",
models: ["user", "product", "order"],
middleware: [],
};

Fields:
• databaseUrl: MongoDB connection string.
• models: Array of model names to generate.
• middleware: Array of middleware functions to apply globally.

Dependencies

This library uses the following dependencies:
• express: HTTP framework.
• mongoose: MongoDB object modeling.
• inquirer: CLI prompts.
• axios: For HTTP requests.
• @faker-js/faker: Generate fake data for testing.

Contributing

Feel free to fork this project and submit pull requests. All contributions are welcome!

License

This project is licensed under the MIT License. See the LICENSE file for details.

Author

Mauro Ciappina
