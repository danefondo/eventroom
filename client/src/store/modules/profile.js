const state = {
  // General information
  profileUserId: "",
  bioText: "",
  isUserFollowed: false,

  // Follower information
  numberOfFollowers: 0,
  numberOfFollowing: 0,
  followers: [],
  following: [],

  // Follower loading information
  nrOfLoadedFollowerProfiles: 0,
  nrOfLoadedFollowingProfiles: 0,
  allFollowersLoaded: false,
  allFollowingLoaded: false,
};

const getters = {
  /**
   * Checks whether the profile belongs to the logged in user
   * @return true if the id-s of logged in user and profile user match, false otherwise.
   */
  profileBelongsToCurrentUser(state, getters, rootState) {
    if (!rootState.auth.user || state.profileUserId == "") {
      return false;
    }
    const user_id = rootState.auth.user._id;
    console.log("@getter userId", user_id);
    console.log("@getter profileuserId", state.profileUserId);
    return user_id === state.profileUserId;
  },
};

const mutations = {
  /**
   * Sets all the values in profile store to their default values
   */
  clearProfileState(state) {
    state.profileUserId = "";
    state.bioText = "";
    state.numberOfFollowers = 0;
    state.numberOfFollowing = 0;
    state.followers = [];
    state.following = [];
    state.nrOfLoadedFollowerProfiles = 0;
    state.nrOfLoadedFollowingProfiles = 0;
    state.allFollowersLoaded = false;
    state.allFollowingLoaded = false;
  },
  setProfileUserId(state, newId) {
    state.profileUserId = newId;
  },
  setBioText(state, newBioText) {
    state.bioText = newBioText;
  },
  setIsUserFollowed(state, followedStatus) {
    state.isUserFollowed = followedStatus;
  },
  setNumberOfFollowers(state, newFollowerCount) {
    state.numberOfFollowers = newFollowerCount;
  },
  setNumberOfFollowing(state, newFollowingCount) {
    state.numberOfFollowing = newFollowingCount;
  },
  /**
   * Concatenates new follower array to the available follower array
   * @param {*} newFollowersArray new follower array NB! has to be an array 
   */
  addFollowers(state, newFollowersArray) {
    state.followers = state.followers.concat(newFollowersArray);
  },
  /**
   * Concatenates new following array to the available following array
   * @param {*} newFollowingArray new following array NB! has to be an array 
   */
  addFollowing(state, newFollowingArray) {
    console.log("@addfollowing new ", newFollowingArray);
    console.log("@addfollowing old ", state.following);
    state.following = state.following.concat(newFollowingArray);
    console.log("@addfollowing after: ", state.following);
  },
  /**
   * Removes one follower from the follower list. 
   * If the follower is not present, changes nothing
   * @param {*} followerUsername follower username to remove.
   */
  removeFollower(state, followerUsername) {
    const indexToRemove = state.followers.findIndex(e => e.username === followerUsername);
    if (indexToRemove >= 0) {
      state.followers.splice(indexToRemove, 1);
    }
  },
  /**
   * Removes one following from the following list. 
   * If the following is not present, changes nothing
   * @param {*} followingUsername following username to remove.
   */
  removeFollowing(state, followingUsername) {
    const indexToRemove = state.following.findIndex(e => e.username === followingUsername);
    if (indexToRemove >= 0) {
      state.following.splice(indexToRemove, 1);
    }
  },
  setNrOfLoadedFollowerProfiles(state, newNrOfLoadedFollowerProfiles) {
    state.nrOfLoadedFollowerProfiles = newNrOfLoadedFollowerProfiles;
  },
  setNrOfLoadedFollowingProfiles(state, newNrOfLoadedFollowingProfiles) {
    state.nrOfLoadedFollowingProfiles = newNrOfLoadedFollowingProfiles;
  },
  setAllFollowersLoaded(state, followerLoadingStatus) {
    state.allFollowersLoaded = followerLoadingStatus;
  },
  setAllFollowingLoaded(state, followingLoadingStatus) {
    state.allFollowingLoaded = followingLoadingStatus;
  }
};

const actions = {
  setInitialData({ commit }, data) {
    commit('setProfileUserId', data.profileUserId);
    commit('setBioText', data.bioText);
    commit('setNumberOfFollowers', data.numberOfFollowers);
    commit('setNumberOfFollowing', data.numberOfFollowing);
    commit('setIsUserFollowed', data.isUserFollowed);
  },
  clearProfileState({ commit }) {
    commit('clearProfileState');
  },
  followThisUser({ state, getters, commit }) {
    // If it is possible to follow this user
    if (state.profileUserId !== "" && !getters.profileBelongsToCurrentUser ) {
      commit('setIsUserFollowed', true);
      commit('setNumberOfFollowers', state.numberOfFollowers + 1);
    }
  },
  unfollowThisUser({ state, getters, commit }) {
    // If it is possible to follow this user
    if (state.profileUserId !== "" && !getters.profileBelongsToCurrentUser ) {
      commit('setIsUserFollowed', false);
      commit('setNumberOfFollowers', state.numberOfFollowers - 1);
    }
  },
  loadAdditionalFollowers({ state, commit }, obj) {
    if (state.profileUserId !== "") {
      commit('addFollowers', obj.loadedProfiles);
      commit('setNrOfLoadedFollowerProfiles', state.nrOfLoadedFollowerProfiles+obj.nrOfLoadedProfiles);
      if (state.allFollowersLoaded != obj.allLoaded) {
        commit('setAllFollowersLoaded', obj.allLoaded);
      }
    }
  },
  loadAdditionalFollowing({ state, commit }, obj) {
    if (state.profileUserId !== "" ) {
      commit('addFollowing', obj.loadedProfiles);
      commit('setNrOfLoadedFollowingProfiles', state.nrOfLoadedFollowingProfiles+obj.nrOfLoadedProfiles);
      if (state.allFollowingLoaded != obj.allLoaded) {
        commit('setAllFollowingLoaded', obj.allLoaded);
      }
    }
  },
};

const profile = {
  namespaced: true,
  
  state,
  getters,
  mutations,
  actions
};

export default profile;