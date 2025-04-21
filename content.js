let isRunning = false;
let savedLinks = [];


const waitForElement = (selector, timeout) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const checkElem = () => {
      const current_sel = document.querySelector(selector);
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

const processJobTitles = async (rateThreshold) => {
  if (!isRunning) return;
  
  try {
    do {
      if (!isRunning) break;
      
      await waitForElement('.card-list-container .job-tile', 5000);
      const current_page = document.querySelectorAll('.card-list-container .job-tile');
      console.log(`Processing ${current_page.length} job listings...`);
      
      for (let x of current_page) {
        if (!isRunning) break;
        
        x.click();
        const back_button = await waitForElement('.air3-slider-prev-btn', 3000);
        let hire_rate = await waitForElement('.cfe-ui-job-about-client', 3000);
        
        if (hire_rate) {
          hire_rate = hire_rate.textContent;
          const rateMatch = hire_rate.match(/(\d+)%\s+hire rate/i);
          
          if (rateMatch && rateMatch[1]) {
            const rate = parseInt(rateMatch[1]);
            if (rate >= rateThreshold) {
              console.log(`Found job with ${rate}% hire rate - above threshold of ${rateThreshold}%`);
              const hrefElement = document.querySelector(".air3-link.d-none.d-md-flex.air3-btn-link");
              const href_url = hrefElement ? hrefElement.href : null;
              
              if (href_url && !savedLinks.includes(href_url)) {
                savedLinks.push(href_url);
                localStorage.setItem("currentSessionLinks", JSON.stringify(savedLinks));
                console.log(`Saved job URL: ${href_url}`);
              }
            }
          }
        }
        
        if (back_button) {
          back_button.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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

function notifyPopupOfLinks() {
  chrome.runtime.sendMessage({
    action: "linksUpdated",
    links: savedLinks
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);
  
  if (request.action === "start") {
    if (!isRunning) {
      isRunning = true;
      const rateThreshold = request.rateThreshold || 90;
      processJobTitles(rateThreshold);
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
  
  else if (request.action === "getSavedLinks") {
    sendResponse({links: savedLinks});
    return true;
  }
  
  else if (request.action === "clearLinks") {
    savedLinks = [];
    localStorage.removeItem("currentSessionLinks");
    sendResponse({success: true});
    return true;
  }
});

setInterval(notifyPopupOfLinks, 1000);

console.log("Job Listing Browser content script loaded");