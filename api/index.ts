import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const filePath = path.join(process.cwd(), "frontend.html");
    const html = fs.readFileSync(filePath, "utf-8");

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send("Failed to load frontend.html");
  }
}