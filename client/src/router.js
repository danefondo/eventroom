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
import LogoutPage from "./pages/AuthPages/LogoutPage";
import RegisterPage from "./pages/AuthPages/RegisterPage";
import VerificationPage from './pages/AuthPages/VerificationPage';
import RequireVerificationPage from './pages/AuthPages/RequireVerificationPage';
import SuccessPage from './pages/AuthPages/SuccessPage';

const routes = [
  { path: "/", component: HomePage },

  /* ====== AUTHENTICATION ROUTES ====== */
  { path: "/login", component: LoginPage, name: "LoginPage" },
  { path: "/logout", component: LogoutPage, name: "LogoutPage" },
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
router.beforeEach(async (to, from, next) => {
  if (to.meta || noReAuth.includes(to.name)) {
    console.log("@router, need auth or noreauth")
    // SHOULD BE CALLED JUST ONCE, expensive operation
    const authenticationResult = await auth.isAuthenticated();     
    
    const success = authenticationResult.success
    const user = success ? authenticationResult.response.user : null; 

    let nextHasBeenCalled = false;

    if (to.meta.requireAuthentication && !success) {
      console.log("@router go login")
      nextHasBeenCalled = true;
      next({ name: "LoginPage" });  // TODO proper error page/error code or smth
    } 
    if (to.meta.requireVerification && user && !user.isVerified && !nextHasBeenCalled) {
      nextHasBeenCalled = true;
      console.log("here: ", authenticationResult.response);
      next({ name: "RequireVerificationPage"});
    }
    if (noReAuth.includes(to.name) && success && !nextHasBeenCalled) {
      nextHasBeenCalled = true;
      next("/");
    }
    if (!nextHasBeenCalled) {
      next();
    }
  } else {
    next();
  }
}); 

export default router;
