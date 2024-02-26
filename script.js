let comments = [];
const addedCommentHashes = new Set(); // Use a Set to keep track of unique author+comment hashes
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scrollToElement = async (selector) => {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView();
    await delay(1000); // Wait a bit for any dynamic content to react
  }
};

const generateHash = (author, comment) => `${author}+${comment}`;

const extractComments = () => {
  document
    .querySelectorAll("ytd-comment-thread-renderer")
    .forEach((commentThread) => {
      const commentElement = commentThread.querySelector("#content-text");
      const authorElement = commentThread.querySelector("#author-text");
      if (commentElement && authorElement) {
        const commentText = commentElement.textContent.trim();
        const authorName = authorElement.textContent.trim();
        const hash = generateHash(authorName, commentText);

        if (!addedCommentHashes.has(hash)) {
          comments.push({
            username: authorName,
            commentText: commentText,
          });
          addedCommentHashes.add(hash); // Add the hash to the Set
        }
      }
    });
};

const scrollToBottom = async () => {
  let lastHeight = document.body.scrollHeight,
    newHeight = 0,
    attempts = 0;
  while (attempts < 3 && comments.length < 100) {
    window.scrollTo(
      0,
      document.documentElement.scrollHeight || document.body.scrollHeight
    );
    await delay(2000); // Wait longer to ensure comments are loaded
    extractComments(); // Extract comments after each scroll
    newHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;
    if (lastHeight === newHeight) {
      attempts++; // No new comments were loaded, increment the attempt counter
    } else {
      attempts = 0; // Reset attempts counter if new comments are found
    }
    lastHeight = newHeight;
  }
};

const downloadComments = () => {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(comments, null, 2));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "youtube_comments.json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

(async () => {
  await scrollToElement("#comments"); // Scroll to the comments section first
  await scrollToBottom(); // Then, scroll through all comments and stop when no new comments are found
  console.log(JSON.stringify(comments)); // Output comments as JSON in console
})();
