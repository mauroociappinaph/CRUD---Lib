import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 solicitudes
  message: {
    message:
      "Demasiadas solicitudes desde esta IP, inténtalo de nuevo más tarde.",
  },
});

export default limiter;
// In the previous code, we have created a rate limiter middleware using the express-rate-limit package. This middleware limits the number of requests that can be made to the server from a single IP address. The configuration options for the rate limiter are as follows:
