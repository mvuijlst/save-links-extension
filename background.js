// Update badge text with the number of saved links when the extension starts
chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.get({ links: [] }, function(result) {
    const linkCount = result.links.length;
    chrome.action.setBadgeText({ text: linkCount.toString() });
  });
});
