import store from "../../index";

function updateUserID() {
  return store.getters["auth/getUserID"];
}

let currentUserID = updateUserID();

function userIsInArray(array) {
  if (!array) return -1;
  if (!currentUserID) currentUserID = updateUserID();
  if (array[0] && array[0].metadata && array[0].metadata.ID && array[0].metadata.ID === currentUserID) return 0;
  if (array[1] && array[1].metadata && array[1].metadata.ID && array[1].metadata.ID === currentUserID) return 1;
  return -1;
}
function getIDsInArray(array) {
  if (!array) return [];
  let IDs = [];
  if (array[0] && array[0].metadata && array[0].metadata.ID) IDs.push(0);
  if (array[1] && array[1].metadata && array[1].metadata.ID) IDs.push(1);
  return IDs; 
}

export default {
  userIsInArray,
  getIDsInArray,
}; 