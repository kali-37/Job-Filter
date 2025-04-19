document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const status = document.getElementById('status');
    
    // Check if script is already running when popup opens
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getStatus"}, function(response) {
        if (response && response.isRunning) {
          updateUI(true);
        } else {
          updateUI(false);
        }
      });
    });
    
    startBtn.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "start"}, function(response) {
          if (response && response.success) {
            updateUI(true);
          }
        });
      });
    });
    
    stopBtn.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "stop"}, function(response) {
          if (response && response.success) {
            updateUI(false);
          }
        });
      });
    });
    
    function updateUI(isRunning) {
      if (isRunning) {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        status.textContent = "Currently active";
        status.className = "status active";
      } else {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        status.textContent = "Currently inactive";
        status.className = "status inactive";
      }
    }
  });