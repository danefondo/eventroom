import VueRouter from "vue-router";
import auth from "./config/auth";

/* ====== EVENT PAGES ====== */
import CreateEventPage from "./pages/CreatorPages/CreateEventPage";
import EditEventPage from "./pages/CreatorPages/EditEventPage";
import EventPreviewPage from "./pages/EventPages/EventPreviewPage";
import EventRoomPage from "./pages/EventPages/EventRoomPage";
import HomePage from "./pages/CorePages/HomePage";

/* ====== AUTH PAGES ====== */
import LoginPage from "./pages/AuthPages/LoginPage";
import RegisterPage from "./pages/AuthPages/RegisterPage";
import VerificationPage from './pages/AuthPages/VerificationPage';
import RequireVerificationPage from './pages/AuthPages/RequireVerificationPage';
import SuccessPage from './pages/AuthPages/SuccessPage';

const routes = [
  { path: "/", component: HomePage },

  /* ====== AUTHENTICATION ROUTES ====== */
  { path: "/login", component: LoginPage, name: "LoginPage" },
  { path: "/register", component: RegisterPage, name: "RegisterPage",
      children: [
        { path: "success", component: SuccessPage, name: "Success"},
      ]
  },
  { path: "/verify/:token", component: VerificationPage, name: "VerificationPage" },
  { path: "/verificationRequired", component: RequireVerificationPage, name: "RequireVerificationPage" },

  /* ====== EVENT ROUTES ====== */
  {
    path: "/events/createEvent",
    component: CreateEventPage,
    meta: {
      requireAuthentication: true,
      requireVerification: true,
    },
  },
  {
    path: "/events/:id/edit",
    component: EditEventPage,
    meta: {
      requireAuthentication: true,
      requireVerification: true,
    },
  },
  { path: "/events/:id", component: EventPreviewPage },
  { path: "/events/:eventId/rooms/:roomId", component: EventRoomPage },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

const noReAuth = ["LoginPage", "RegisterPage", "ForgotPassword"];
const authenticationResult = auth.isAuthenticated();
router.beforeEach((to, from, next) => {
  //auth.isAuthenticated2();
  if (to.meta.requireAuthentication && !authenticationResult) {
    next({ name: "LoginPage" });
  } else if (noReAuth.includes(to.name) && auth.isAuthenticated()) {
    next("/");
  } else if (to.meta.requireVerification && !authenticationResult.isVerified) {
    next({ name: "RequireVerificationPage"});
  } else {
    next();
  }
}); 

export default router;
