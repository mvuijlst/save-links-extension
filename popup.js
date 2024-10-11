document.addEventListener('DOMContentLoaded', function() {
  let titleInput = document.getElementById('title');
  let descriptionInput = document.getElementById('description');
  let tagInput = document.getElementById('tagInput');
  let tagContainer = document.getElementById('tagContainer');
  let tagSuggestionsDiv = document.getElementById('tagSuggestions');
  let postForm = document.getElementById('postForm');
  let viewLinksButton = document.getElementById('viewLinksButton');
  let tags = [];
  let originalDate = null;  

  // Prefill title and description from the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let tab = tabs[0];
    titleInput.value = tab.title;

    // Check if the link already exists in storage
    chrome.storage.local.get({ links: [] }, function(result) {
      let existingLink = result.links.find(link => link.url === tab.url);
      
      if (existingLink) {
        // If the link exists, prefill the saved description and tags
        descriptionInput.value = unformatDescription(existingLink.description);
        tags = existingLink.tags || [];
        originalDate = existingLink.date || null;  // Preserve the original date if available
        renderTags();
        isLinkExisting = true; // Mark that the link already exists
      } else {
        // If the link doesn't exist, fetch the page description
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.getSelection().toString() || document.querySelector('meta[name="description"]')?.content || 'No description available'
        }, (results) => {
          descriptionInput.value = results[0].result;
        });
        isLinkExisting = false; // Mark that the link is new
      }
    });
  });

  // Render tag pills
  function renderTags() {
    tagContainer.innerHTML = '';
    tags.forEach((tag, index) => {
      const pill = document.createElement('div');
      pill.className = 'tag-pill';
      pill.innerHTML = `${tag} <span class="remove-tag" data-index="${index}">&times;</span>`;
      tagContainer.appendChild(pill);
    });

    document.querySelectorAll('.remove-tag').forEach(element => {
      element.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        tags.splice(index, 1);
        renderTags();
      });
    });
  }

// Function to format the description for saving
function formatDescription(description) {
  // Trim whitespace at the start and end
  description = description.trim();

  // Replace double line breaks with <p> tags, and single line breaks with <br />
  let formattedDescription = description
    .split(/\n\s*\n/)   // Split by double newlines (paragraph breaks)
    .map(line => line.trim().replace(/\n/g, '<br />'))  // Replace single newlines with <br /> within paragraphs
    .map(line => `<p>${line}</p>`)   // Wrap each paragraph with <p> tags
    .join('');  // Join without additional spaces

  return formattedDescription;
}


// Function to unformat the description for display or editing
function unformatDescription(description) {
  // Replace </p><p> with double newlines and <br> with single newlines
  description = description
    .replace(/<\/p><p>/g, '\n\n')   // Convert adjacent <p> tags back to double newlines (paragraphs)
    .replace(/<br>/g, '\n');        // Convert <br> tags back to single newlines

  // Remove outer <p> tags if present (not nested)
  if (description.startsWith('<p>') && description.endsWith('</p>')) {
    description = description.slice(3, -4);  // Remove outermost <p> and </p>
  }

  return description.trim();  // Trim any extra spaces
}


  // Handle tag input with Tab and Enter
  tagInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && tagInput.value.trim() !== '') {
      e.preventDefault(); // Prevent form submission on Enter
      const newTag = tagInput.value.trim();

      if (newTag && !tags.includes(newTag)) {
        tags.push(newTag);
        renderTags();
      }
      tagInput.value = '';
    } else if (e.key === 'Tab' && tagInput.value.trim() !== '') {
      e.preventDefault(); // Prevent moving out of input field with Tab
      const newTag = tagInput.value.trim();

      if (newTag && !tags.includes(newTag)) {
        tags.push(newTag);
        renderTags();
      }
      tagInput.value = '';
    }
  });

  // Get existing tags for autocomplete
  chrome.storage.local.get({ tags: [] }, function(result) {
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
            if (!tags.includes(tag)) {
              tags.push(tag);
              renderTags();
            }
            tagInput.value = '';
            tagSuggestionsDiv.innerHTML = '';
          };
          tagSuggestionsDiv.appendChild(suggestion);
        });
      }
    });
  });

  // Submit the form and save the link
  postForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = titleInput.value;
    const description = formatDescription(descriptionInput.value);;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      let tab = tabs[0];
      const url = tab.url;
      const date = originalDate || new Date().toISOString();  // Use original date if it exists

      chrome.storage.local.get({ links: [], tags: [] }, function(result) {
        let updatedLinks = result.links.filter(link => link.url !== url);  // Remove old link if exists
        const newLink = { title, description, url, date, tags };
        updatedLinks.push(newLink);

        const updatedTags = [...new Set([...result.tags, ...tags])]; // Save new tags

        chrome.storage.local.set({ links: updatedLinks, tags: updatedTags }, function() {
          chrome.action.setBadgeText({ text: updatedLinks.length.toString() });
          window.close();  // Close the popup window
        });
      });
    });
  });

  // Handle view links button click
  viewLinksButton.addEventListener('click', function() {
    chrome.tabs.create({ url: 'view-links.html' });
  });
});
