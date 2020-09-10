<template>
  <div class="container mb-3">
    <div v-if="!videos" class="results">
      <div class="align-self-center" style="width: 440px;">
        <div class="emptystate tac flex flex-column items-center justify-center">
          <p class="fw-medium light20@text">Find a video</p>
          <p
            class="mt2 muted"
          >Start typing to search for a video, or paste a YouTube link to add it to the party playlist.</p>
        </div>
      </div>
      <div class="tip dark90@bg ph5 pv3">
        <small>
          <strong>Pro Tip:</strong> Press
          <code class="fw-bold light20@text">A</code> to quickly get here again
        </small>
      </div>
    </div>

    <div class="d-flex mb-3">
      <div class="mr-auto">
        <h3>Search Results for "{{ reformattedSearchString }}"</h3>
      </div>
      <div class="btn-group ml-auto" role="group">
        <button
          @click="changeDisplayMode('grid')"
          type="button"
          class="btn btn-outline-secondary"
          v-bind:class="{ active: displayMode === 'grid' }"
        >
          <i class="fas fa-th"></i>
        </button>
        <button
          @click="changeDisplayMode('list')"
          type="button"
          class="btn btn-outline-secondary"
          v-bind:class="{ active: displayMode === 'list' }"
        >
          <i class="fas fa-list"></i>
        </button>
      </div>
    </div>

    <div class="card-columns" v-if="displayMode === 'grid'">
      <div class="card" v-bind:key="video.id.videoId" v-for="video in videos">
        <VideoGridItem v-bind:video="video" />
      </div>
    </div>
    <div v-else>
      <div class="card mb-2" v-bind:key="video.id.videoId" v-for="video in videos">
        <VideoListItem v-bind:video="video" />
      </div>
    </div>
  </div>
</template>

<script>
import VideoListItem from "./VideoListItem";
import VideoGridItem from "./VideoGridItem";

export default {
  name: "SearchResults",
  components: {
    VideoListItem,
    VideoGridItem,
  },
  data() {
    return {
      title: "Search Results",
      displayMode: "grid",
    };
  },
  methods: {
    changeDisplayMode(displayMode) {
      this.displayMode = displayMode;
    },
  },
  props: ["videos", "reformattedSearchString"],
};
</script>

<style scoped>
button:focus {
  box-shadow: none !important;
}

/*! CSS Used from: https://campfire.gg/styles.04163730.css */
strong {
  font-weight: bolder;
}
code {
  font-family: monospace, monospace;
  font-size: 1em;
}
small {
  font-size: 80%;
}
p {
  font-size: 16px;
  line-height: 24px;
  margin: 0;
}
small {
  font-size: 10px;
  line-height: 16px;
  margin: 0;
}
strong {
  font-weight: 700;
}
.dark90\@bg {
  background-color: #424446;
}
.light20\@text {
  color: #f6f6f6;
}
.fw-medium {
  font-weight: 500;
}
.fw-bold {
  font-weight: 700;
}
.mt2 {
  margin-top: 8px;
}
.pv3 {
  padding-top: 12px;
  padding-bottom: 12px;
}
.ph5 {
  padding-right: 20px;
  padding-left: 20px;
}
.flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.align-self-center {
  align-self: center;
}
.justify-center {
  justify-content: center;
}
.tac {
  text-align: center;
}
.search .results {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  width: 100%;
  background-color: #333537;
  border: 1px solid #424446;
  margin-top: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.44);
  pointer-events: all;
  flex-shrink: 1;
  overflow: hidden;
}
.search .tip {
  border-radius: 0 0 10px 10px;
}
@media (max-width: 1023.98px) {
  .search .results {
    border: 0;
    box-shadow: none;
    margin: 0;
  }
  .search > .results {
    height: 100%;
  }
  .search .tip {
    display: none;
  }
}
.emptystate {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 10px;
  padding: 72px 48px;
  width: 100%;
  height: 100%;
}
.tip strong {
  margin-right: 2px;
  color: #00c56a;
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
p {
  font-size: 15px;
  line-height: 22px;
  letter-spacing: 0;
  font-weight: 400;
}
small {
  font-size: 12px;
  line-height: 20px;
  letter-spacing: 0.2px;
}
strong {
  font-weight: 600;
}
.muted,
.tip {
  color: #b9baba;
}
</style>