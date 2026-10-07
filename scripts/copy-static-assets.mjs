import { cpSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = resolve(root, "dist");
const directories = [
  "Badges",
  "Certificates",
  "Fiverr",
  "Logos",
  "Projects",
  "Project_Shoaib_Arif",
  "Project_Zubair_Alam",
  "QR codes",
  "Testimonials",
];
const files = ["profile.jpg", "script.js"];

mkdirSync(output, { recursive: true });

for (const directory of directories) {
  cpSync(resolve(root, directory), resolve(output, directory), {
    recursive: true,
  });
}

for (const file of files) {
  cpSync(resolve(root, file), resolve(output, file));
}
