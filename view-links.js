document.addEventListener('DOMContentLoaded', function() {
  let linkList = document.getElementById('linkList');
  let title = document.getElementById('title');
  let clearLinksButton = document.getElementById('clearLinksButton');

  // Load the stored links
  chrome.storage.sync.get({ links: [] }, function(result) {
    const links = result.links;

    if (links.length === 0) {
      linkList.innerHTML = '<p>No links saved yet.</p>';
      return;
    }

    // Sort links by date
    const sortedLinks = links.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Create HTML for the link list
    sortedLinks.forEach(link => {
      let linkHtml = `<p><a href="${link.url}"><strong>${link.title}</strong></a><br>${link.description}</p>`;
      linkList.innerHTML += linkHtml;
    });

    // Get the start and end dates
    const firstDate = new Date(sortedLinks[0].date);
    const lastDate = new Date(sortedLinks[sortedLinks.length - 1].date);

    // Format the title dynamically
    const titleText = formatDateRange(firstDate, lastDate);
    title.textContent = titleText;
  });

  // Clear links when button is clicked
  clearLinksButton.addEventListener('click', function() {
    chrome.storage.sync.set({ links: [] }, function() {
      alert('All links cleared!');
      linkList.innerHTML = '<p>No links saved yet.</p>';
    });
  });

  function formatDateRange(firstDate, lastDate) {
    const dayOptions = { day: 'numeric' };
    const monthYearOptions = { month: 'long', year: 'numeric' };

    const firstDay = firstDate.toLocaleDateString('nl-NL', dayOptions);
    const lastDay = lastDate.toLocaleDateString('nl-NL', dayOptions);
    const firstMonthYear = firstDate.toLocaleDateString('nl-NL', monthYearOptions);
    const lastMonthYear = lastDate.toLocaleDateString('nl-NL', monthYearOptions);

    if (firstMonthYear === lastMonthYear && firstDay === lastDay) {
      return `Links voor ${firstDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else if (firstMonthYear === lastMonthYear) {
      return `Links van ${firstDay} tot ${lastDay} ${firstMonthYear}`;
    } else if (firstDate.getFullYear() === lastDate.getFullYear()) {
      const firstMonth = firstDate.toLocaleDateString('nl-NL', { month: 'long' });
      const lastMonth = lastDate.toLocaleDateString('nl-NL', { month: 'long' });
      return `Links van ${firstDay} ${firstMonth} tot ${lastDay} ${lastMonth} ${firstDate.getFullYear()}`;
    } else {
      const fullFirstDate = firstDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
      const fullLastDate = lastDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
      return `Links van ${fullFirstDate} tot ${fullLastDate}`;
    }
  }
});
