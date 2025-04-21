document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const status = document.getElementById('status');
  const rateInput = document.getElementById('rateInput');
  const savedLinksContainer = document.getElementById('saved-links');
  const clearLinksBtn = document.getElementById('clearLinks');
  
  function updateLinksDisplay(links) {
    savedLinksContainer.innerHTML = '';
    
    if (!links || links.length === 0) {
      savedLinksContainer.innerHTML = '<div class="empty-message">No saved links yet</div>';
      return;
    }
    
    links.forEach((link, index) => {
      const linkElement = document.createElement('a');
      linkElement.href = link;
      linkElement.textContent = `Job #${index + 1}: ${getJobTitle(link)}`;
      linkElement.target = '_blank';
      linkElement.title = link;
      savedLinksContainer.appendChild(linkElement);
    });
  }
  
  function getJobTitle(url) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || 'Job Link';
    } catch (e) {
      return 'Job Link';
    }
  }
  
  function loadSavedLinks() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0].url && tabs[0].url.startsWith('http')) {
        try {
          chrome.tabs.sendMessage(tabs[0].id, {action: "getSavedLinks"}, function(response) {
            if (chrome.runtime.lastError) {
              console.log("Cannot load links:", chrome.runtime.lastError.message);
              return;
            }
            
            if (response && response.links) {
              updateLinksDisplay(response.links);
            }
          });
        } catch (error) {
          console.error("Error loading saved links:", error);
        }
      }
    });
  }
  
  clearLinksBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      try {
        chrome.tabs.sendMessage(tabs[0].id, {action: "clearLinks"}, function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error clearing links:", chrome.runtime.lastError);
            return;
          }
          
          if (response && response.success) {
            updateLinksDisplay([]);
          }
        });
      } catch (error) {
        console.error("Error clearing links:", error);
      }
    });
  });
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    
    if (currentTab.url && currentTab.url.startsWith('http')) {
      try {
        chrome.tabs.sendMessage(currentTab.id, {action: "getStatus"}, function(response) {
          if (chrome.runtime.lastError) {
            console.log("Content script not yet ready:", chrome.runtime.lastError.message);
            updateUI(false);
          } else if (response && response.isRunning) {
            updateUI(true);
          } else {
            updateUI(false);
          }
          
          loadSavedLinks();
        });
      } catch (error) {
        console.error("Error checking status:", error);
        updateUI(false);
      }
    } else {
      updateUI(false, "Can't run on this page");
    }
  });
  
  startBtn.addEventListener('click', function() {
    const rateThreshold = parseInt(rateInput.value) || 90;
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      try {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "start",
          rateThreshold: rateThreshold
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error starting:", chrome.runtime.lastError);
            return;
          }
          
          if (response && response.success) {
            updateUI(true);
          }
        });
      } catch (error) {
        console.error("Error starting browsing:", error);
      }
    });
  });
  
  stopBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      try {
        chrome.tabs.sendMessage(tabs[0].id, {action: "stop"}, function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error stopping:", chrome.runtime.lastError);
            return;
          }
          
          if (response && response.success) {
            updateUI(false);
            loadSavedLinks();
          }
        });
      } catch (error) {
        console.error("Error stopping browsing:", error);
      }
    });
  });
  
  function updateUI(isRunning, message) {
    if (isRunning) {
      startBtn.disabled = true;
      stopBtn.disabled = false;
      status.textContent = "Currently active";
      status.className = "status active";
    } else {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      status.textContent = message || "Currently inactive";
      status.className = "status inactive";
    }
  }
  
  const linksRefreshInterval = setInterval(loadSavedLinks, 2000);
  
  window.addEventListener('beforeunload', function() {
    clearInterval(linksRefreshInterval);
  });
});