import express from "express";

const app = express();
const port = process.env.API_PORT;

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => console.log(`Running on port ${port}`));
