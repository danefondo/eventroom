<template>
  <div class="pt5 ph5">
    <form class="input">
      <div class="icon">
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
          <path
            stroke="currentColor"
            d="M15.33 15.5a7.273 7.273 0 1 0-5.056 2.046c1.964 0 3.747-.78 5.055-2.046zm0 0L21 21"
          />
        </svg>
      </div>
      <input
        v-model="searchString"
        type="search"
        @keydown.13.prevent="parseSearchString"
        placeholder="Search for a video"
      />
    </form>
  </div>
</template>

<script>
export default {
  name: "SearchForm",
  data() {
    return {
      searchString: "",
    };
  },
  methods: {
    parseSearchString() {
      // Trim search string
      const trimmedSearchString = this.searchString.trim();

      if (trimmedSearchString !== "") {
        // Split search string
        const searchParams = trimmedSearchString.split(/\s+/);
        // Emit event
        this.$emit("search", searchParams);
        // Reset input field
        this.searchString = "";
      }
    },
  },
};
</script>

<style scoped>
input {
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}
input {
  overflow: visible;
}
[type="search"] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
}
.pt5 {
  padding-top: 20px;
}
.ph5 {
  padding-right: 20px;
  padding-left: 20px;
}
.input {
  background-color: #424446;
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  position: relative;
  transition: background-color 70ms ease;
}
.input > .icon {
  color: #8c8e8f;
  display: flex;
  flex-shrink: 0;
  margin-right: 8px;
}
.input input {
  appearance: none;
  background-color: transparent;
  border: 0;
  outline: 0;
  padding: 12px 0;
  font-size: 15px;
  line-height: 20px;
  width: 100%;
  font-weight: 400;
  color: #f6f6f6;
  min-width: 80px;
}
.input input::placeholder {
  color: #aaabac;
  font-weight: 400;
}
.input input:disabled {
  background-color: #333537;
  color: #7d7f80;
}
.input input:disabled::placeholder {
  color: #7d7f80;
}
.input.clickable {
  cursor: pointer;
}
.input.clickable input {
  pointer-events: none;
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
</style>