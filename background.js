chrome.runtime.onInstalled.addListener(() => {
  console.log('Job Listing Browser extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "linksUpdated") {
    chrome.runtime.sendMessage(message);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.match(/upwork\.com\/search\/jobs/)) {
    console.log("Found Upwork jobs page, ensuring content script is loaded");
    
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(err => console.error("Error injecting content script:", err));
  }
});