import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import prisma from "./prisma";
import router from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { apiRateLimiter } from "./middlewares/rate-limit.middleware";
import { sanitizeRequest } from "./middlewares/sanitize.middleware";
import { env } from "./utils/env";
import { logger } from "./utils/logger";

const app = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(sanitizeRequest);
app.use(apiRateLimiter);
app.use("/api", router);

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "BlueCrab API",
    version: "1.0.0",
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, "BlueCrab API started");
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutdown requested");

  server.close(async () => {
    await prisma.$disconnect();
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled rejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  process.exit(1);
});

export default app;
