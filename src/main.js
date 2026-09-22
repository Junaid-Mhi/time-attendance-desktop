import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/app.css";


const app = createApp(App);

// Register plugins
app.use(createPinia());
app.use(router);

app.mount("#app");
