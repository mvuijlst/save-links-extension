document.addEventListener('DOMContentLoaded', function() {
  let linkList = document.getElementById('linkList');
  let title = document.getElementById('title');
  let clearLinksButton = document.getElementById('clearLinksButton');
  let copyHtmlButton = document.getElementById('copyHtmlButton');

  let allTags = new Set();
  let clipboardHtml = '';  // For storing Gutenberg HTML 

  // Load the stored links
  chrome.storage.sync.get({ links: [] }, function(result) {
    const links = result.links;

    if (links.length === 0) {
      linkList.innerHTML = '<p>No links saved yet.</p>';
      return;
    }

    const sortedLinks = links.sort((a, b) => new Date(a.date) - new Date(b.date));
    let displayHtml = '';

    // Generate HTML for display and Gutenberg HTML for clipboard
    sortedLinks.forEach((link, index) => {
    const tagList = link.tags.map(tag => tag).join(', ');

    // Display HTML (simplified)
        displayHtml += `
            <p><strong><a href="${link.url}">${link.title}</a></strong></p>
            ${link.description}
            <p style="margin-top: 6px"><small><em>Tags:</em> ${link.tags.map(tag => `<a href="/tag/${slugify(tag)}">${tag}</a>`).join(', ')}</small></p>`;

        // Gutenberg HTML for clipboard
        clipboardHtml += `
            <!-- wp:group {"style":{"spacing":{"margin":{"top":"0","bottom":"var:preset|spacing|20"},"blockGap":"0.5rem"}},"layout":{"type":"flex","orientation":"vertical"}} -->
            <div class="wp-block-group" style="margin-top:0;margin-bottom:var(--wp--preset--spacing--20)">
            <!-- wp:heading {"level":4,"style":{"typography":{"fontSize":"1.4rem"}}} -->
            <h4 class="wp-block-heading" style="font-size:1.4rem"><a href="${link.url}"><strong>${link.title}</strong></a></h4>
            <!-- /wp:heading -->

            <!-- wp:paragraph -->
            ${link.description}
            <!-- /wp:paragraph -->

            <!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"blockGap":"0"}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left","verticalAlignment":"top"}} -->
            <div class="wp-block-group" style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">
                <!-- wp:uagb/icon {"icon":"tags","iconSize":1,"iconSizeUnit":"em","iconColor":"#636363","block_id":"${generateUniqueId()}","iconAccessabilityMode":"image","iconAccessabilityDesc":"Tags"} /-->

                <!-- wp:paragraph {"fontSize":"small"} -->
                <p class="has-small-font-size">${link.tags.map(tag => `<a href="/tag/${slugify(tag)}">${tag}</a>`).join(', ')}</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
            </div>
            <!-- /wp:group -->`;

        // Collect all tags for the final tags paragraph
        link.tags.forEach(tag => allTags.add(tag));
    });

    // Add the final paragraph with all tags
    clipboardHtml += `
    <!-- wp:paragraph -->
    <p><strong>Tags</strong>: ${Array.from(allTags).map(tag => `<a href="/tag/${slugify(tag)}">${tag}</a>`).join(', ')}</p>
    <!-- /wp:paragraph -->
    `;


    linkList.innerHTML = displayHtml;

    // Date formatting logic for the title
    const firstDate = new Date(sortedLinks[0].date);
    const lastDate = new Date(sortedLinks[sortedLinks.length - 1].date);

    const firstDay = firstDate.toLocaleDateString('nl-NL', { day: 'numeric' });
    const lastDay = lastDate.toLocaleDateString('nl-NL', { day: 'numeric' });
    const firstMonthYear = firstDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
    const lastMonthYear = lastDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });

    if (firstMonthYear === lastMonthYear && firstDay === lastDay) {
      // Case when the start and end dates are the same
      title.textContent = `Links voor ${firstDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else if (firstMonthYear === lastMonthYear) {
      // Case when start and end are in the same month but different days
      title.textContent = `Links van ${firstDay} tot ${lastDay} ${firstMonthYear}`;
    } else if (firstDate.getFullYear() === lastDate.getFullYear()) {
      // Case when start and end are in different months but the same year
      const firstMonth = firstDate.toLocaleDateString('nl-NL', { month: 'long' });
      const lastMonth = lastDate.toLocaleDateString('nl-NL', { month: 'long' });
      title.textContent = `Links van ${firstDay} ${firstMonth} tot ${lastDay} ${lastMonth} ${firstDate.getFullYear()}`;
    } else {
      // Case when start and end are in different years
      title.textContent = `Links van ${firstDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })} tot ${lastDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
  });

  // Function to generate unique IDs for icons
  function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Function to sanitize tag links
  function slugify(str) {
    return str
        .toString()
        .normalize('NFD')                   // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '')     // Remove accents
        .toLowerCase()                       // Convert to lowercase
        .trim()                              // Remove whitespace from both sides
        .replace(/[^a-z0-9 -]/g, '')         // Remove all non-alphanumeric characters except spaces and hyphens
        .replace(/\s+/g, '-')                // Replace spaces with hyphens
        .replace(/-+/g, '-');                // Replace multiple hyphens with a single hyphen
    }

  
    // Copy Gutenberg HTML content to clipboard
  copyHtmlButton.addEventListener('click', function() {
    const textArea = document.createElement('textarea');
    textArea.value = clipboardHtml;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('HTML copied to clipboard!');
  });

  // Clear links when button is clicked
  clearLinksButton.addEventListener('click', function() {
    chrome.storage.sync.set({ links: [] }, function() {
      alert('All links cleared!');
      linkList.innerHTML = '<p>No links saved yet.</p>';
    });
  });
});
 