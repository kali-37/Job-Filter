let shouldStop = false;
let isRunning = false;

const clickNextPage = () => {
    const btn = document.querySelector('button[data-test="next-page"]');
    if (btn && !btn.disabled) {
    btn.click();
    return true;
}
    return false;
};

const waitForElement = (selector, timeout = 3000) => {
return new Promise(resolve => {
    const start = Date.now();
    const check = () => {
    if (shouldStop) return resolve(null);
        const el = document.querySelector(selector);
    if (el) return resolve(el);
    if (Date.now() - start > timeout) return resolve(null);
        setTimeout(check, 100);
    };
        check();
});
};

async function processJobTitles() {
isRunning = true;
do {
    if (shouldStop) break;

    await waitForElement('.card-list-container .job-card', 5000);
    if (shouldStop) break;
    const cards = document.querySelectorAll('.card-list-container .job-card');
    for (let card of cards) {
      if (shouldStop) break;
      card.click();

  const backBtn = await waitForElement('.air3-slider-prev-btn', 3000);
  if (backBtn && !shouldStop) {
    backBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }
}

if (shouldStop) break;

} while (clickNextPage());

isRunning = false;
console.log(shouldStop ? '⚠️ Stopped by user' : '✅ Done processing');
}

chrome.runtime.onMessage.addListener((msg) => {
if (msg.action === 'start' && !isRunning) {
    shouldStop = false;
    processJobTitles();
}
if (msg.action === 'stop') {
    shouldStop = true;
}
});
