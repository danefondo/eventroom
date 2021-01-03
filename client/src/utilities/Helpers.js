/**
 * 
 * @todo Explore ways to sort without removing
 * as currently UX-wise it looks bad when it
 * flashes due to the removes.
 * 
 */
export const applyDrag = (arr, dragResult) => {
  const { removedIndex, addedIndex, payload } = dragResult;
  if (removedIndex === null && addedIndex === null) return arr;

  const result = [...arr];
  let itemToAdd = payload;

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0];
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd);
  }

  return result;
};

export const updatePriorities = (preferences) => {
  for (var i = 0; i < preferences.length; i++) {
    let preference = preferences[i];
    preference.priority = i;
  }

  return preferences;
};
