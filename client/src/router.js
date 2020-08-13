import VueRouter from "vue-router";
import auth from "./config/auth";
import CreateEventPage from "./pages/CreatorPages/CreateEventPage";
import EditEventPage from "./pages/CreatorPages/EditEventPage";
import EventPreviewPage from "./pages/EventPages/EventPreviewPage";
import HomePage from "./pages/CorePages/HomePage";

/* ====== AUTH PAGES ====== */
import LoginPage from "./pages/AuthPages/LoginPage";
import RegisterPage from "./pages/AuthPages/RegisterPage";

const routes = [
  { path: "/", component: HomePage },
  { path: "/login", component: LoginPage, name: "LoginPage" },
  { path: "/register", component: RegisterPage, name: "RegisterPage" },
  {
    path: "/events/createEvent",
    component: CreateEventPage,
    meta: {
      requireAuthentication: true,
    },
  },
  {
    path: "/events/:id/edit",
    component: EditEventPage,
    meta: {
      requireAuthentication: true,
    },
  },
  { path: "/events/:id", component: EventPreviewPage },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

const noReAuth = ["Login", "Register", "ForgotPassword"];
router.beforeEach((to, from, next) => {
  if (to.meta.requireAuthentication && !auth.isAuthenticated()) {
    next({ name: "Login" });
  } else if (noReAuth.includes(to.name) && auth.isAuthenticated()) {
    next("/");
  } else {
    next();
  }
});

export default router;
