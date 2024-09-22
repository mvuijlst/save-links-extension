# Save Links Chrome Extension

**Save Links** is a simple Chrome extension that allows you to save and manage links with associated titles, descriptions, and tags. You can view all your saved links and export them as HTML for easy integration into your blog posts or websites.

## Features

- **Save Links**: Automatically capture the title and description of the current page. You can also manually edit the title and description.
- **Tagging System**: Add tags to each link to categorize and organize them. The extension supports tag suggestions based on previously used tags and offers easy tag management.
- **View Saved Links**: See a list of all the saved links, categorized by the dates they were added.
- **Copy HTML to Clipboard**: Export your saved links as Gutenberg-compatible HTML, ready to be pasted into a WordPress post or other websites.
- **Clear Links**: Easily clear all the saved links once you’re done.

## Installation

1. **Download the code**: Clone or download this repository to your computer.
2. **Load the extension**:
    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable **Developer Mode** (toggle is in the top right corner).
    - Click **Load unpacked** and select the folder containing the extension files.
3. **Start using the extension**: The extension icon will appear next to the Chrome address bar. Click the icon to open the popup and start saving links.

## How It Works

1. **Saving Links**:
    - Click the extension icon while on any webpage.
    - The extension will prefill the title and description from the webpage. You can edit these manually.
    - Add tags to organize your links. Use the `Tab` or `Enter` key to add tags, and remove them by clicking the “x” next to each tag.
    - Click **Save Link** to store the link.
2. **Viewing Saved Links**:
    - Click the **View Saved Links** button in the popup to open a new tab with a list of all your saved links.
    - Links will be displayed with their titles, descriptions, and tags.
    - You can copy the HTML representation of your saved links to the clipboard or clear all saved links.
3. **Copy HTML**:
    - The **Copy HTML to Clipboard** button on the saved links page generates and copies Gutenberg-compatible HTML for easy pasting into WordPress or other websites.

## Development

To modify the extension or contribute:

1. Clone the repository:

```
git clone https://github.com/mvuijlst/save-links-extension.git
cd save-links-extension
````

2. Open the extension folder and modify the HTML, JavaScript, or CSS files as needed.
3. Reload the extension in Chrome (`chrome://extensions/`) to see your changes.

## License

This project is licensed under the MIT License.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.