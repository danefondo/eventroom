var adjectives = require("./adjectives.json"),
  animals = require("./animals.json");

var NUM_ADJECTIVES = adjectives.length,
  NUM_ANIMALS = animals.length;

//- https://stackoverflow.com/questions/16017657/how-do-i-generate-a-randomly-selected-word-or-phrase-from-a-previously-selecte
//- https://github.com/veltman/BriefMemorableSlug

export const slug = function() {
  let slugWord = generate().join("-");
  let AAA = /^([a-z]+){3}$/;
  slugWord = slugWord.toLowerCase();
  slugWord.match(AAA);
  return slugWord;
};

function generate() {
  var i = Math.floor(Math.random() * NUM_ADJECTIVES),
    k = Math.floor(Math.random() * NUM_ANIMALS);
  return [adjectives[i], animals[k]];
}
