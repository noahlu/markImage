chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.info == 'getLocalStorage') {
        sendResponse(localStorage);
    } else if(request.key) {
        localStorage[request.key] = request.val;
        sendResponse({info: "storage done!"});
    }
});