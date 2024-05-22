const { createProxyMiddleware } = require("http-proxy-middleware");

const { API_HOST, API_PORT } = process.env;

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: `http://${API_HOST}:${API_PORT}/api`,
      changeOrigin: true,
    })
  );
};
