const config = {
  routes: {
    users: { basePath: "/api/users", enablePagination: true },
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 50,
  },
  middleware: [
    (req, res, next) => {
      console.log(`Request to: ${req.path}`);

      next();
    },
  ],
  filters: {
    allow: ["name", "email", "age"], // Campos permitidos para filtrar
  },
};

export default config;
