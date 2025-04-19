// Global state
let isRunning = false;
let processor = null;

// Original script logic - modified to work with extension
const waitForElement = (selector, timeout) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const checkElem = () => {
      current_sel = document.querySelector(selector);
      if (current_sel) {
        return resolve(current_sel);
      } else if (Date.now() - startTime > timeout) {
        return resolve(null);
      }
      setTimeout(checkElem, 100);
    };
    checkElem();
  });
};

const nextBtn = () => {
  let nextPageBtn = document.querySelector('button[data-test="next-page"]');
  if (nextPageBtn && !nextPageBtn.disabled) {
    nextPageBtn.click();
    return true;
  } else {
    return false;
  }
};

const processJobTitles = async () => {
  if (!isRunning) return;
  
  try {
    do {
      if (!isRunning) break;
      
      await waitForElement('.card-list-container .job-tile', 5000);
      const current_page = document.querySelectorAll('.card-list-container .job-tile');
      
      for (let x of current_page) {
        if (!isRunning) break;
        
        x.click();
        const back_button = await waitForElement('.air3-slider-prev-btn', 3000);
        
        if (back_button) {
          console.log("Going to another instance");
          back_button.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } while (isRunning && nextBtn());
    
    if (isRunning) {
      console.log("Done with all pages!");
    } else {
      console.log("Process stopped by user");
    }
  } catch (error) {
    console.error("Error in job processing:", error);
  }
  
  isRunning = false;
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start") {
    if (!isRunning) {
      isRunning = true;
      processJobTitles();
      sendResponse({success: true});
    } else {
      sendResponse({success: false, message: "Already running"});
    }
    return true;
  } 
  
  else if (request.action === "stop") {
    isRunning = false;
    sendResponse({success: true});
    return true;
  }
  
  else if (request.action === "getStatus") {
    sendResponse({isRunning: isRunning});
    return true;
  }
});