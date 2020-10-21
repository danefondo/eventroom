import VueRouter from "vue-router";
import store from "./store/index";
import axios from "axios";
import { BASE_PATH } from "./constants";

const http = axios.create({
  baseURL: BASE_PATH,
});

/* ====== ROUTE SPLITTING & LAZY LOADING OPTIMIZATION!!! ====== */
/* https://vueschool.io/articles/vuejs-tutorials/vue-js-router-performance/ */

/* DO NOT IMPORT OUTSIDE ACCESSING ROUTE UNLESS VERY VERY GOOD REASON
SEEK BEST POSSIBLE OPTIMIZATION, ALWAYS, OR I WILL HAUNT YOU IN YOUR SLEEP. */

/* ====== AUTH PAGES ====== */
// import SuccessPage from "./pages/AuthPages/SuccessPage";

const routes = [
  {
    path: "/discover/home",
    component: () => import("./pages/CorePages/HomePage"),
  },

  /* ====== COFOCUS BOOKING ROUTES ====== */
  {
    path: "/dashboard/booking",
    component: () => import("./pages/BookingPages/BookingDashboard"),
    name: "BookingDashboard",
    meta: {
      requireAuthentication: true,
    },
  },

  /* ====== COFOCUS SESSION ROUTES ====== */

  {
    path: "/session/:sessionName",
    component: () => import("./pages/RoomPages/Room"),
    name: "RoomPage",
    meta: { hideNavigation: true },
    beforeEnter(to, from, next) {
      let eventroomName = to.params.sessionName;
      console.log("Session name:", eventroomName);
      let routeData = {
        eventroomName: eventroomName,
      };
      console.log("routeDATA", routeData);
      http
        .post(`/api/eventroom/checkIfEventroomExistsByName`, routeData)
        .then((response) => {
          console.log("responssss", response);
          if (!response.data.result.alreadyExists) {
            router.push("/");
            // Room Not Found Page
          } else {
            next();
          }
        })
        .catch((err) => console.log("error", err));
    },
  },

  /* ====== DASHBOARD ROUTES ====== */

  {
    path: "/",
    component: () => import("./pages/LandingPages/LandingPage"),
    meta: { landingPage: true },
    name: "LandingPage",
  },

  /* ====== PRE-EVENT ROUTES ====== */

  {
    path: "/:eventroomName/check",
    component: () => import("./pages/MediaDevicePages/MediaDeviceCheckPage"),
    name: "MediaDeviceCheckPage",
  },

  /* ====== EVENTROOM ROUTES ====== */

  {
    path: "/:eventroomName",
    component: () => import("./pages/RoomPages/Room"),
    name: "RoomPage",
    meta: { hideNavigation: true },
    beforeEnter(to, from, next) {
      let eventroomName = to.params.eventroomName;
      console.log("eventroomNAIM", eventroomName);
      let routeData = {
        eventroomName: to.params.eventroomName,
      };
      console.log("routeDATA", routeData);
      http
        .post(`/api/eventroom/checkIfEventroomExistsByName`, routeData)
        .then((response) => {
          console.log("responssss", response);
          if (!response.data.result.alreadyExists) {
            router.push("/");
            // Room Not Found Page
          } else {
            next();
          }
        })
        .catch((err) => console.log("error", err));
    },
  },

  /* ====== DASHBOARD ROUTES ====== */
  {
    path: "/account/dashboard",
    component: () => import("./pages/DashboardPages/DashboardPage"),
    name: "DashboardPage",
    meta: {
      requireAuthentication: true,
    },
  },

  {
    path: "/account/settings",
    component: () => import("./pages/DashboardPages/AccountSettings"),
    name: "AccountSettings",
    meta: {
      requireAuthentication: true,
    },
  },

  {
    path: "/account/settings/preferences",
    component: () => import("./pages/DashboardPages/AccountPreferences"),
    name: "AccountPreferences",
    meta: {
      requireAuthentication: true,
    },
  },

  {
    path: "/account/settings/password",
    component: () => import("./pages/DashboardPages/AccountPassword"),
    name: "AccountPassword",
    meta: {
      requireAuthentication: true,
    },
  },

  {
    path: "/account/settings/danger",
    component: () => import("./pages/DashboardPages/AccountDangerZone"),
    name: "AccountDangerZone",
    meta: {
      requireAuthentication: true,
    },
  },

  /* ====== AUTHENTICATION ROUTES ====== */
  {
    path: "/account/login",
    component: () => import("./pages/AuthPages/LoginPage"),
    name: "LoginPage",
  },
  {
    path: "/account/logout",
    component: () => import("./pages/AuthPages/LogoutPage"),
    name: "LogoutPage",
  },
  {
    path: "/account/register",
    component: () => import("./pages/AuthPages/RegisterPage"),
    name: "RegisterPage",
    // children: [{ path: "success", component: SuccessPage, name: "Success" }],
  },
  {
    path: "/account/verify/:token",
    component: () => import("./pages/AuthPages/VerificationPage"),
    name: "VerificationPage",
  },
  {
    path: "/account/verificationRequired",
    component: () => import("./pages/AuthPages/RequireVerificationPage"),
    name: "RequireVerificationPage",
  },
  {
    path: "/account/resetpassword/:token",
    component: () => import("./pages/AuthPages/PassResetRedirect"),
  },
  {
    path: "/account/resetpassword",
    component: () => import("./pages/AuthPages/PassResetPage"),
  },

  /* ====== PROFILE ROUTES ====== */
  {
    path: "/profile/:username",
    component: () => import("./pages/UserPages/ProfilePage"),
    name: "ProfilePage",
    meta: {
      requireAuthentication: true,
    },
  },

  /* ====== ROOM ROUTES ====== */

  {
    path: "/account/rooms",
    component: () => import("./pages/RoomPages/RoomsList/RoomsList"),
    name: "RoomsList",
    meta: {
      requireAuthentication: true,
    },
  },

  {
    path: "/account/rooms/:eventroomName",
    component: () => import("./pages/RoomPages/RoomEditor/RoomEditor"),
    name: "RoomEditor",
    meta: {
      requireAuthentication: true,
    },
  },

  /* ====== EVENT ROUTES ====== */
  {
    path: "/events/createEvent",
    component: () => import("./pages/CreatorPages/CreateEventPage"),
    meta: {
      requireAuthentication: true,
      requireVerification: true,
    },
  },
  {
    path: "/events/:id/edit",
    component: () => import("./pages/CreatorPages/EditEventPage"),
    meta: {
      requireAuthentication: true,
      requireVerification: true,
    },
  },
  {
    path: "/events/:id",
    component: () => import("./pages/EventPages/EventPreviewPage"),
  },
  {
    path: "/events/:eventId/rooms/:roomId",
    component: () => import("./pages/EventPages2/EventRoomPage"),
  },
  {
    path: "/temp/fix",
    component: () => import("./pages/EventPages2/TemporaryFix"),
  },

  /* ====== ERROR ROUTES ====== */

  {
    path: "/errors/eventroomNotFound",
    name: "RoomNotFound",
    component: () => import("./pages/RoomPages/RoomNotFound"),
  },

  {
    path: "/errors/404",
    name: "Error404Page",
    component: () => import("./pages/ErrorPages/Error404Page"),
  },

  { path: "*", redirect: "/errors/404" },
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
