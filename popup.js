document.addEventListener('DOMContentLoaded', function() {
  let titleInput = document.getElementById('title');
  let descriptionInput = document.getElementById('description');
  let tagInput = document.getElementById('tagInput');
  let tagSuggestionsDiv = document.getElementById('tagSuggestions');
  let postForm = document.getElementById('postForm');
  let linkCount = document.getElementById('linkCount');
  let viewLinksButton = document.getElementById('viewLinksButton');

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let tab = tabs[0];
    let url = tab.url;  // Get the actual page URL

    // Prefill the title and description
    titleInput.value = tab.title;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString() || document.querySelector('meta[name="description"]')?.content || 'No description available'
    }, (results) => {
      descriptionInput.value = results[0].result;
    });

    // Check if the link already exists
    chrome.storage.sync.get({ links: [] }, function(result) {
      let existingLink = result.links.find(link => link.url === url);
      if (existingLink) {
        // Prefill the form with existing link data
        titleInput.value = existingLink.title;
        descriptionInput.value = existingLink.description;
        tagInput.value = existingLink.tags.join(', ');
      }
    });
  });

  // Handle autocomplete for tags
  chrome.storage.sync.get({ tags: [] }, function(result) {
    let savedTags = result.tags;
    let suggestions = [...new Set(savedTags)];

    tagInput.addEventListener('input', function() {
      const input = tagInput.value.toLowerCase();
      tagSuggestionsDiv.innerHTML = '';

      if (input) {
        const filteredTags = suggestions.filter(tag => tag.toLowerCase().includes(input));
        filteredTags.forEach(tag => {
          const suggestion = document.createElement('div');
          suggestion.textContent = tag;
          suggestion.onclick = function() {
            tagInput.value = tag;
            tagSuggestionsDiv.innerHTML = '';
          };
          tagSuggestionsDiv.appendChild(suggestion);
        });
      }
    });
  });

  // Submit the form
  postForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = titleInput.value;
    const description = descriptionInput.value;
    const tags = tagInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      let tab = tabs[0];
      const url = tab.url;
      const date = new Date().toISOString();

      chrome.storage.sync.get({ links: [], tags: [] }, function(result) {
        let updatedLinks = result.links.filter(link => link.url !== url);  // Remove old link if exists
        const newLink = { title, description, url, date, tags };
        updatedLinks.push(newLink);

        const updatedTags = [...new Set([...result.tags, ...tags])]; // Save new tags

        chrome.storage.sync.set({ links: updatedLinks, tags: updatedTags }, function() {
          chrome.action.setBadgeText({ text: updatedLinks.length.toString() });
          window.close();  // Close the popup window
        });
      });
    });
  });

  // Update link count and badge text when the popup opens
  chrome.storage.sync.get({ links: [] }, function(result) {
    const linkCount = result.links.length;
    updateLinkCount(linkCount);
    chrome.action.setBadgeText({ text: linkCount.toString() });
  });

  // Open the list of links in a new tab
  viewLinksButton.addEventListener('click', function() {
    chrome.tabs.create({ url: 'view-links.html' });
  });

  function updateLinkCount(count) {
    linkCount.textContent = `You have ${count} saved links.`;
  }
});
