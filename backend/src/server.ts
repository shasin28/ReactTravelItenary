import dotenv from "dotenv";
import express from "express";

dotenv.config();

const PORT = process.env.PORT || 3000;

export const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "OK" });
});

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
