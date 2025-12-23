import { createApp } from "vue";
import App from "./App.vue";
import "./assets/style.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./assets/element-plus-overrides.css";

createApp(App).use(ElementPlus).mount("#app");
