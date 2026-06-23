require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const homeRoutes = require("./routes/home.routes");
const modelsRoutes = require("./routes/models.routes");
const modelSectionRoutes = require("./routes/model-section.routes");
const tagsRoutes = require("./routes/tags.routes");
const tagSectionRoutes = require("./routes/tag-section.routes");
const channelsRoutes = require("./routes/channels.routes");
const channelSectionRoutes = require("./routes/channel-section.routes");
const watchRoutes = require("./routes/watch.routes");
const relatedRoutes = require("./routes/related.routes");
const myanmarRoutes = require("./routes/myanmar.routes");
const errorHandler = require("./middleware/error-handler");
const notFound = require("./middleware/not-found");
const corsMiddleware = require("./middleware/cors");
const requireApiKey = require("./middleware/require-api-key");
const { apiLimiter } = require("./middleware/rate-limiter");
const logger = require("./utils/logger");
const { assertEnvOrExit } = require("./utils/validate-env");

assertEnvOrExit();

const app = express();
const PORT = process.env.PORT || 3000;

/** Security headers */
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);

app.disable("x-powered-by");
app.use(corsMiddleware);
app.use(express.json({ limit: "16kb" }));

/** Optional API key (set API_KEY in .env to enable) */
app.use(requireApiKey);

/** Rate limiting on all /api routes */
app.use("/api", apiLimiter);

/** Health check for VPS / PM2 monitoring */
app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

/** API routes */
app.use("/api/home", homeRoutes);
app.use("/api/models", modelsRoutes);
app.use("/api/model-section", modelSectionRoutes);
app.use("/api/tags", tagsRoutes);
app.use("/api/tag-section", tagSectionRoutes);
app.use("/api/channels", channelsRoutes);
app.use("/api/channel-section", channelSectionRoutes);
app.use("/api/watch", watchRoutes);
app.use("/api/related", relatedRoutes);
app.use("/api/myanmar", myanmarRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info("Scraper API started", { port: PORT, env: process.env.NODE_ENV });
});

module.exports = app;
