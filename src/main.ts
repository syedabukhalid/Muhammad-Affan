import { createApp } from "vue";
import PortfolioBorders from "./components/PortfolioBorders.vue";
import "./tailwind.css";

const root = document.createElement("div");
root.id = "portfolio-electric-borders";
root.hidden = true;
document.body.append(root);

createApp(PortfolioBorders).mount(root);
