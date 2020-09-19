<template>
  <div class="menu upwards rightwards" style="bottom: 60px; right: 392px; transform: none;">
    <div class="title" style="opacity: 1;">Choose a layout</div>
    <div class="option selected" style="opacity: 1;">
      <svg
        class="icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        height="20"
        width="20"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      >
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          fill="currentColor"
          fill-opacity="0.4"
          d="M2 6C2 3.79086 3.79086 2 6 2H7V12V22H6C3.79086 22 2 20.2091 2 18V6Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          fill="currentColor"
          fill-opacity="0.4"
          d="M22 6C22 3.79086 20.2091 2 18 2H17V12V22H18C20.2091 22 22 20.2091 22 18V6Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <div class="label">Full View</div>
      <div class="check" style="opacity: 1; transform: none;">
        <svg
          class="icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          height="16"
          width="16"
          stroke="currentColor"
          stroke-width="3"
          stroke-linejoin="round"
          stroke-linecap="round"
        >
          <path stroke="currentColor" d="M6 13l4 4 8-9" />
        </svg>
      </div>
    </div>
    <div class="option" style="opacity: 1;">
      <svg
        class="icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        height="20"
        width="20"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      >
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          fill="currentColor"
          fill-opacity="0.4"
          d="M2 6C2 3.79086 3.79086 2 6 2H7V12V22H6C3.79086 22 2 20.2091 2 18V6Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <div class="label">Playlist View</div>
      <div class="shortcut" style="opacity: 1; transform: none;">2</div>
    </div>
    <div class="option" style="opacity: 1;">
      <svg
        class="icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        height="20"
        width="20"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      >
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          fill="currentColor"
          fill-opacity="0.4"
          d="M22 6C22 3.79086 20.2091 2 18 2H17V12V22H18C20.2091 22 22 20.2091 22 18V6Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <div class="label">Chat View</div>
      <div class="shortcut" style="opacity: 1; transform: none;">3</div>
    </div>
    <div class="option" style="opacity: 1;">
      <svg
        class="icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        height="20"
        width="20"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      >
        <rect
          x="22"
          y="2"
          width="20"
          height="20"
          rx="4"
          transform="rotate(90 22 2)"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          fill="currentColor"
          fill-opacity="0.4"
          d="M18 22C20.2091 22 22 20.2091 22 18L22 17L12 17L2 17L2 18C2 20.2091 3.79086 22 6 22L18 22Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <div class="label">Cinema View</div>
      <div class="shortcut" style="opacity: 1; transform: none;">4</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LayoutSelector"
};
</script>

<style scoped>
.menu {
  position: absolute;
  background-color: #333537;
  border-radius: 6px;
  padding: 8px;
  z-index: 1400;
  transition: opacity 0.14s ease;
  box-shadow: 0 1px 2px rgba(21, 24, 26, 0.2), 0 2px 12px rgba(21, 24, 26, 0.64);
  border: 1px solid #424446;
  min-width: 220px;
  transform-origin: top left;
  color: #f6f6f6;
}
.menu.upwards {
  transform-origin: bottom inherit;
}
.menu.rightwards {
  transform-origin: top right;
}
.menu.upwards.rightwards {
  transform-origin: bottom right;
}
.menu .option {
  font-weight: 400;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  user-select: none;
  color: #f6f6f6;
}
.menu .option .label {
  display: flex;
  padding: 0 8px 0 0;
}
.menu .option > .icon {
  color: #9b9c9d;
  margin-left: -4px;
  margin-right: 8px;
}
.menu .option .shortcut {
  width: 20px;
  border-radius: 4px;
  text-align: center;
  height: 100%;
  font-family: Overpass Mono;
  color: #b9baba;
  margin-left: auto;
  margin-right: -4px;
}
.menu .option .check {
  display: flex;
  color: #00c56a;
  margin-left: auto;
  margin-right: -2px;
}
.menu .option:not(.disabled):hover {
  cursor: pointer;
  background-color: #515354;
}
.menu .option:not(.disabled):hover .shortcut,
.menu .option:not(.disabled):hover > .icon {
  color: #e5e5e5;
}
.menu .title {
  cursor: default;
  padding: 4px 8px;
  display: flex;
  line-height: 20px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 600;
  color: #8c8e8f;
}
* {
  box-sizing: border-box;
}
::-webkit-scrollbar {
  -webkit-appearance: none;
}
::-webkit-scrollbar-track {
  background-color: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.25);
}
/*! CSS Used fontfaces */
@font-face {
  font-family: "Overpass Mono";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local("Overpass Mono SemiBold"), local("OverpassMono-SemiBold"),
    url(https://fonts.gstatic.com/s/overpassmono/v5/_Xm3-H86tzKDdAPa-KPQZ-AC3vCQo_6XBlRc4EUk4A.woff2)
      format("woff2");
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
    U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Overpass Mono";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local("Overpass Mono SemiBold"), local("OverpassMono-SemiBold"),
    url(https://fonts.gstatic.com/s/overpassmono/v5/_Xm3-H86tzKDdAPa-KPQZ-AC3vCQo_CXBlRc4EU.woff2)
      format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}
</style>