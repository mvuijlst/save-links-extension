document.addEventListener('DOMContentLoaded', function() {
  let linkList = document.getElementById('linkList');
  let title = document.getElementById('title');
  let clearLinksButton = document.getElementById('clearLinksButton');
  let copyHtmlButton = document.getElementById('copyHtmlButton');

  let allTags = new Set();

  // Load the stored links
  chrome.storage.sync.get({ links: [] }, function(result) {
    const links = result.links;

    if (links.length === 0) {
      linkList.innerHTML = '<p>No links saved yet.</p>';
      return;
    }

    const sortedLinks = links.sort((a, b) => new Date(a.date) - new Date(b.date));
    let htmlContent = '';

    // Create the required HTML structure with the comments and inline styles
    sortedLinks.forEach((link, index) => {
      const tagList = link.tags.map(tag => `<a href="/tag/${tag}">${tag}</a>`).join(', ');

      htmlContent += `
        <!-- wp:group {"style":{"spacing":{"margin":{"top":"0","bottom":"var:preset|spacing|20"},"blockGap":"0.5rem"}},"layout":{"type":"flex","orientation":"vertical"}} -->
        <div class="wp-block-group" style="margin-top:0;margin-bottom:var(--wp--preset--spacing--20)">
          <!-- wp:heading {"level":4,"style":{"typography":{"fontSize":"1.4rem"}}} -->
          <h4 class="wp-block-heading" style="font-size:1.4rem"><a href="${link.url}"><strong>${link.title}</strong></a></h4>
          <!-- /wp:heading -->

          <!-- wp:paragraph -->
          <p>${link.description}</p>
          <!-- /wp:paragraph -->

          <!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"blockGap":"0"}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left","verticalAlignment":"top"}} -->
          <div class="wp-block-group" style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">
            <!-- wp:uagb/icon {"icon":"tags","iconSize":1,"iconSizeUnit":"em","iconColor":"#636363","block_id":"${generateUniqueId()}","iconAccessabilityMode":"image","iconAccessabilityDesc":"Tags"} /-->

            <!-- wp:paragraph {"fontSize":"small"} -->
            <p class="has-small-font-size">${tagList}</p>
            <!-- /wp:paragraph -->
          </div>
          <!-- /wp:group -->
        </div>
        <!-- /wp:group -->`;

      // Collect all tags for the final tags paragraph
      link.tags.forEach(tag => allTags.add(tag));
    });

    // Add the final paragraph for all tags
    htmlContent += `
      <!-- wp:paragraph -->
      <p><strong>Tags</strong>: ${Array.from(allTags).join(', ')}</p>
      <!-- /wp:paragraph -->
    `;

    linkList.innerHTML = htmlContent;

    // Set the title with the date range
    const firstDate = new Date(sortedLinks[0].date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    const lastDate = new Date(sortedLinks[sortedLinks.length - 1].date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    title.textContent = `Links van ${firstDate} tot ${lastDate}`;
  });

  // Function to generate unique IDs for icons
  function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Copy HTML content to clipboard
  copyHtmlButton.addEventListener('click', function() {
    chrome.storage.sync.get({ links: [] }, function(result) {
      const textArea = document.createElement('textarea');
      textArea.value = linkList.innerHTML;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('HTML copied to clipboard!');
    });
  });

  // Clear links when button is clicked
  clearLinksButton.addEventListener('click', function() {
    chrome.storage.sync.set({ links: [] }, function() {
      alert('All links cleared!');
      linkList.innerHTML = '<p>No links saved yet.</p>';
    });
  });
});
