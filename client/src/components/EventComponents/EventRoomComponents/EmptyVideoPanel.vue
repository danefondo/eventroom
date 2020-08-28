<template>
  <div class="videopanel empty">
    <div class="bgoverlay" style="opacity: 1; transform: none;">
      <div class="inner" style="background-image: url(&quot;/mockBg.747e21cd.png&quot;);"></div>
    </div>
    <div class="description" style="opacity: 1; transform: none;">
      <h4 class="light20@text fw-bold">Aloha! Let's get started.</h4>
      <p class="muted mt2">
        Here's your new shiny party. It looks kinda empty around here. Share the link with
        friends to bring life to the party.
      </p>
      <div class="mt2 mt8@lg">
        <a>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="none"
            viewBox="0 0 40 40"
          >
            <circle cx="19" cy="21" r="19" fill="#E3614D" />
            <path
              stroke="#fff"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M11 21h16m0 0l-5.333 5.333M27 21l-5.333-5.333"
            />
          </svg>Log in or create an account
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            height="20"
            width="20"
            stroke="currentColor"
            stroke-width="3"
            stroke-linejoin="round"
            stroke-linecap="round"
          >
            <path stroke="currentColor" d="M8 5l7 7-7 7" />
          </svg>
        </a>
        <a>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="none"
            viewBox="0 0 40 40"
          >
            <circle cx="19" cy="21" r="19" fill="#515354" />
            <path
              fill="#fff"
              d="M18.75 21.937c5.47.044 7.578 3.888 8.344 6.145.283.834-.374 1.605-1.254 1.605H11.657c-.879 0-1.537-.77-1.26-1.604.76-2.282 2.863-6.19 8.353-6.146z"
            />
            <circle cx="18.75" cy="16.375" r="4.375" fill="#fff" />
            <circle cx="32" cy="8" r="8" fill="#00C56A" />
            <path
              stroke="#fff"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M32 4v8M28 8h8"
            />
          </svg>Invite friends to join
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            height="20"
            width="20"
            stroke="currentColor"
            stroke-width="3"
            stroke-linejoin="round"
            stroke-linecap="round"
          >
            <path stroke="currentColor" d="M8 5l7 7-7 7" />
          </svg>
        </a>
        <a>
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="19" cy="21" r="19" fill="#515354" />
            <circle cx="33" cy="7" r="7" fill="#FF3D1F" />
            <rect x="11" y="14" width="13.2353" height="13.2353" rx="2.5" fill="white" />
            <path
              d="M29.75 23.183V18.0521C29.75 17.1678 28.8569 16.5631 28.0358 16.8915L24.2353 18.4117V22.8235L28.0358 24.3436C28.8569 24.6721 29.75 24.0674 29.75 23.183Z"
              fill="white"
            />
          </svg>Search for a video
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            height="20"
            width="20"
            stroke="currentColor"
            stroke-width="3"
            stroke-linejoin="round"
            stroke-linecap="round"
          >
            <path stroke="currentColor" d="M8 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "EmptyVideoPanel",
};
</script>

<style scoped>
/*! CSS Used from: https://campfire.gg/styles.04163730.css */
a {
  background-color: transparent;
}
h4 {
  margin: 0;
  font-weight: 600;
}
h4 {
  font-size: 36px;
  line-height: 48px;
}
p {
  font-size: 16px;
  line-height: 24px;
  margin: 0;
}
.light20\@text {
  color: #f6f6f6;
}
.fw-bold {
  font-weight: 700;
}
.mt2 {
  margin-top: 8px;
}
@media (min-width: 1024px) {
  .mt8\@lg {
    margin-top: 32px;
  }
}
.party .videopanel {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #000;
  border-right: 1px solid #333537;
  /* width: 100%; */
  height: 100%;
  overflow: hidden;
  position: relative;
}
.party .videopanel.empty {
  background-color: #242729;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
}
.party .videopanel.empty .bgoverlay:after {
  display: block;
  bottom: 0;
  left: 0;
  content: " ";
  position: absolute;
  width: 100%;
  height: 240px;
  background: linear-gradient(0deg, #242729, rgba(36, 39, 41, 0));
}
.party .videopanel.empty .description {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 520px;
  padding: 40px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 2;
}
.party .videopanel.empty .description > * {
  width: 100%;
}
.party .videopanel.empty .description a {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 6px;
  background-color: #333537;
  color: #f6f6f6;
  width: 100%;
  font-weight: 600;
  cursor: pointer;
  transform: scale(1);
  transition: transform 70ms ease;
  user-select: none;
}
.party .videopanel.empty .description a:not(.disabled):hover {
  background-color: #424446;
  transform: scale(1.02);
}
.party .videopanel.empty .description a:not(.disabled):active {
  transform: scale(1);
}
.party .videopanel.empty .description a svg:first-of-type {
  margin-right: 16px;
  height: 32px;
  width: 32px;
}
.party .videopanel.empty .description a svg:last-of-type {
  margin-left: auto;
  color: #8c8e8f;
}
.party .videopanel.empty .description a + a {
  margin-top: 12px;
}
@media (max-width: 1023.98px) {
  .party .videopanel {
    flex-grow: 0;
    height: 30vh;
    flex-shrink: 0;
  }
  .party .videopanel.empty .description > h4 {
    font-size: 15px;
    line-height: 22px;
  }
  .party .videopanel.empty .description > p {
    display: none;
  }
  .party .videopanel.empty .description a {
    padding: 8px;
  }
  .party .videopanel.empty .description a:first-of-type {
    display: none;
  }
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
h4 {
  font-weight: 500;
}
p {
  font-size: 15px;
  line-height: 22px;
  letter-spacing: 0;
  font-weight: 400;
}
.muted {
  color: #b9baba;
}
.bgoverlay {
  content: " ";
  display: flex;
  flex-direction: column;
  height: 30%;
  background-color: #242729;
  width: 100%;
  border-radius: 0 8px 8px 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}
.bgoverlay .inner {
  content: " ";
  width: 100%;
  animation: infiniteMove 400s linear infinite;
  height: 1200px;
  background-size: 50%;
  background-position: 50%;
  transform: perspective(1000px) rotateY(-30deg) rotateX(20deg) scale(2);
  background-repeat: repeat;
  opacity: 0.12;
}
/*! CSS Used keyframes */
@keyframes infiniteMove {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 0 1200px;
  }
  to {
    background-position: 0 0;
  }
}
</style>