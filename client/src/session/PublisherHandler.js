
function movePublisherDom(publisher, newDom) {
  console.log("@publisherhandler newdom:", newDom);
  document.getElementById(newDom).appendChild(publisher.element);
}


const PublisherHandler = {
  movePublisherDom,
}

export default PublisherHandler;