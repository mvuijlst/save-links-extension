document.addEventListener('DOMContentLoaded', function() {
  let titleInput = document.getElementById('title');
  let descriptionInput = document.getElementById('description');
  let postForm = document.getElementById('postForm');
  let linkCount = document.getElementById('linkCount');
  let viewLinksButton = document.getElementById('viewLinksButton');

  // Prefill title and description
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let tab = tabs[0];
    titleInput.value = tab.title;

    // Attempt to get selected text or meta description from the page
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString() || document.querySelector('meta[name="description"]')?.content || 'No description available'
    }, (results) => {
      descriptionInput.value = results[0].result;
    });
  });

  // Submit the link and save it to storage
  postForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = titleInput.value;
    const description = descriptionInput.value;
    const url = window.location.href;

    const date = new Date().toISOString();  // Save the date in ISO format

    chrome.storage.sync.get({ links: [] }, function(result) {
      const newLink = { title, description, url, date };
      const updatedLinks = result.links.concat(newLink);

      // Save the updated list of links and update the badge count
      chrome.storage.sync.set({ links: updatedLinks }, function() {
        chrome.action.setBadgeText({ text: updatedLinks.length.toString() }); // Update badge count
        window.close();  // Close the popup window
      });
    });
  });

  // Update link count and badge text when the popup opens
  chrome.storage.sync.get({ links: [] }, function(result) {
    const linkCount = result.links.length;
    updateLinkCount(linkCount);
    chrome.action.setBadgeText({ text: linkCount.toString() }); // Set badge count
  });

  // Open the list of links in a new tab
  viewLinksButton.addEventListener('click', function() {
    chrome.tabs.create({ url: 'view-links.html' });
  });

  // Update link count display in the popup
  function updateLinkCount(count) {
    linkCount.textContent = `You have ${count} saved links.`;
  }
});
