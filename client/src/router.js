import VueRouter from "vue-router";
import store from "./store/index";

/* ====== DASHBOARD PAGES ====== */
import DashboardPage from "./pages/DashboardPages/DashboardPage";

/* ====== PRE-EVENT PAGES ====== */
import MediaDeviceCheckPage from "./pages/MediaDevicePages/MediaDeviceCheckPage";

/* ====== ROOM PAGES ====== */
import RoomPage from "./pages/RoomPages/Room";

/* ====== EVENT PAGES ====== */
import CreateEventPage from "./pages/CreatorPages/CreateEventPage";
import EditEventPage from "./pages/CreatorPages/EditEventPage";
import EventPreviewPage from "./pages/EventPages/EventPreviewPage";
import EventRoomPage from "./pages/EventPages2/EventRoomPage";
import TemporaryFix from "./pages/EventPages2/TemporaryFix";
import HomePage from "./pages/CorePages/HomePage";

/* ====== AUTH PAGES ====== */
import LoginPage from "./pages/AuthPages/LoginPage";
import LogoutPage from "./pages/AuthPages/LogoutPage";
import RegisterPage from "./pages/AuthPages/RegisterPage";
import VerificationPage from "./pages/AuthPages/VerificationPage";
import RequireVerificationPage from "./pages/AuthPages/RequireVerificationPage";
import SuccessPage from "./pages/AuthPages/SuccessPage";
import PassResetPage from "./pages/AuthPages/PassResetPage";
import PassResetRedirect from "./pages/AuthPages/PassResetRedirect";

/* ====== PROFILE PAGES ====== */
import ProfilePage from "./pages/UserPages/ProfilePage";

const routes = [
  { path: "/discover/home", component: HomePage },

  /* ====== DASHBOARD ROUTES ====== */

  {
    path: "/",
    component: DashboardPage,
    name: "DashboardPage",
  },

  /* ====== PRE-EVENT ROUTES ====== */

  {
    path: "/:eventroomName/check",
    component: MediaDeviceCheckPage,
    name: "MediaDeviceCheckPage",
  },

  /* ====== EVENTROOM ROUTES ====== */

  { path: "/:eventroomName", component: RoomPage, name: "RoomPage" },



  /* ====== AUTHENTICATION ROUTES ====== */
  { path: "/account/login", component: LoginPage, name: "LoginPage" },
  { path: "/account/logout", component: LogoutPage, name: "LogoutPage" },
  {
    path: "/account/register",
    component: RegisterPage,
    name: "RegisterPage",
    children: [{ path: "success", component: SuccessPage, name: "Success" }],
  },
  {
    path: "/account/verify/:token",
    component: VerificationPage,
    name: "VerificationPage",
  },
  {
    path: "/account/verificationRequired",
    component: RequireVerificationPage,
    name: "RequireVerificationPage",
  },
  { path: "/account/resetpassword/:token", component: PassResetRedirect },
  { path: "/account/resetpassword", component: PassResetPage },

  /* ====== PROFILE ROUTES ====== */
  {
    path: "/profile/:username",
    component: ProfilePage,
    name: "ProfilePage",
    meta: {
      requireAuthentication: true,
    },
  },

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
  { path: "/temp/fix", component: TemporaryFix },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

const noReAuth = ["LoginPage", "RegisterPage", "ForgotPassword"];
router.beforeEach(async (to, from, next) => {
  if (!store.state.auth.ready) {
    try {
      await store.dispatch("auth/authenticate");
    } catch (err) {
      console.log("@router err: ", err);
    }
  }
  if (to.meta || noReAuth.includes(to.name)) {
    // console.log("@router, need auth or noreauth")
    const user = store.state.auth.user;
    const authenticationStatus = store.state.auth.authenticationStatus;

    let nextHasBeenCalled = false;

    if (to.meta.requireAuthentication && !authenticationStatus) {
      console.log("@router go login");
      nextHasBeenCalled = true;
      next({ name: "LoginPage" }); // TODO proper error page/error code or smth
    }
    if (
      to.meta.requireVerification &&
      user &&
      !user.isVerified &&
      !nextHasBeenCalled
    ) {
      nextHasBeenCalled = true;
      next({ name: "RequireVerificationPage" });
    }
    if (
      noReAuth.includes(to.name) &&
      authenticationStatus &&
      !nextHasBeenCalled
    ) {
      console.log("@router noreauth");
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
