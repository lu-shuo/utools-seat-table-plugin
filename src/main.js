import { createApp } from "vue";
import "./styles/tailwind.css";
// 导入 Element Plus 样式（用于 MessageBox、Notification 等组件）
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/message-box/style/css";
import "element-plus/es/components/notification/style/css";
import App from "./App.vue";

createApp(App).mount("#app");
