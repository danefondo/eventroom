export const BASE_PATH =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : window.location.origin;

export const VUE_APP_COFOCUS =
  process.env.VUE_APP_COFOCUS === "OHMYTHISISCOFOCUSYES"
    ? process.env.VUE_APP_COFOCUS
    : "OHMYTHISISCOFOCUSYES";
