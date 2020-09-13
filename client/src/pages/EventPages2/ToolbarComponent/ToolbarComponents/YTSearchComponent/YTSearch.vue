<template>
  <div>
    This is youtube search
    <div class="eventroom-panel">
      <SearchForm v-on:search="search" />
      <NoVideosText v-if="videos" />
      <SearchResults
        v-if="videos.length > 0"
        v-bind:videos="videos"
        v-bind:reformattedSearchString="reformattedSearchString"
      />
      <Pagination
        v-if="videos.length > 0"
        v-bind:prevPageToken="api.prevPageToken"
        v-bind:nextPageToken="api.nextPageToken"
        v-on:prev-page="prevPage"
        v-on:next-page="nextPage"
      />
    </div>
  </div>
</template>

<script>
import { requestWithAuthentication } from "../../../../../config/api";

import NoVideosText from "./NoVideosText";
import SearchForm from "./SearchForm";
import SearchResults from "./SearchResults";
import Pagination from "./Pagination";


export default {
  name: "YTSearch",
  components: {
    NoVideosText,
    SearchForm,
    SearchResults,
    Pagination,
  },

  data() {
    return {
      videos: [],
      reformattedSearchString: "",
      api: {
        q: "",
        prevPageToken: "",
        nextPageToken: "",
      },
    }
  },

  methods: {
    search(searchParams) {
      this.reformattedSearchString = searchParams.join(" ");
      this.api.q = searchParams.join("+");
      const { baseUrl, part, type, order, maxResults, q } = this.api;
      const apiUrl = `${baseUrl}part=${part}&type=${type}&order=${order}&q=${q}&maxResults=${maxResults}`;
      this.getData(apiUrl);
    },
    async getData() {
      try {
        let query = this.api.q;
        console.log("qq", query);
        let queryData = { query };
        const { data } = await requestWithAuthentication('post',
          `/api/events/getYouTubeQuery`,
          queryData
        );
        console.log("data", data);
        this.videos = data.videos;
        // this.videos = res.data.items;
        // this.api.prevPageToken = res.data.prevPageToken;
        // this.api.nextPageToken = res.data.nextPageToken;
      } catch (error) {
        console.log("err", error);
      }
    },
    prevPage() {
      const {
        baseUrl,
        part,
        type,
        order,
        maxResults,
        q,
        key,
        prevPageToken,
      } = this.api;
      const apiUrl = `${baseUrl}part=${part}&type=${type}&order=${order}&q=${q}&maxResults=${maxResults}&key=${key}&pageToken=${prevPageToken}`;
      this.getData(apiUrl);
    },
    nextPage() {
      const {
        baseUrl,
        part,
        type,
        order,
        maxResults,
        q,
        key,
        nextPageToken,
      } = this.api;
      const apiUrl = `${baseUrl}part=${part}&type=${type}&order=${order}&q=${q}&maxResults=${maxResults}&key=${key}&pageToken=${nextPageToken}`;
      this.getData(apiUrl);
    },
  }
}
</script>