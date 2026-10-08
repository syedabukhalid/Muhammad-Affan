import { createApp } from "vue";
import PortfolioBorders from "./components/PortfolioBorders.vue";
import StrokeText from "./components/StrokeText.vue";
import "./tailwind.css";

for (const heading of document.querySelectorAll<HTMLElement>("[data-stroke-text]")) {
  const text = heading.textContent?.trim();
  const trigger = heading.dataset.strokeTrigger;

  if (!text) {
    throw new Error("A StrokeText heading must contain text.");
  }
  if (trigger !== "mount" && trigger !== "scroll") {
    throw new Error(`Invalid StrokeText trigger "${trigger}" on heading "${text}".`);
  }

  createApp(StrokeText, {
    text,
    trigger,
    ...(trigger === "mount"
      ? { fillColor: "transparent", fillMode: "none" }
      : { strokeColor: "none", strokeWidth: 0, fillMode: "fade" }),
  }).mount(heading);
}

const root = document.createElement("div");
root.id = "portfolio-electric-borders";
root.hidden = true;
document.body.append(root);

createApp(PortfolioBorders).mount(root);
