
let shouldStop=false;

window.addEventListener('keydown',e=>{
    if (e.key==='q'){
        shouldStop=true;
    }
    console.warn("Kill switch activated ");
})


const nextBtn= ()=>{
    let nextPageBtn = document.querySelector('button[data-test="next-page"]');
    if (nextPageBtn && !nextPageBtn.disabled){
        nextPageBtn.click();
        return true;
    }
    else{
        return false;
    }
}
const waitforElement = (selector, timeout)=> {
    return new Promise((resolve)=>{
        const startTime = Date.now();
        const checkElem=()=>{
            current_sel = document.querySelector(selector)
            if (current_sel){
                return resolve(current_sel);
            }
            else if(Date.now()-startTime > timeout){
                return resolve(null);
            }
                setTimeout(checkElem,100);
            };
            checkElem();
        });
};

const processJobTitles = async()=>{
    do {
        await waitforElement('.card-list-container .job-tile',5000);
        const current_page = document.querySelectorAll('.card-list-container .job-tile');
        for (let x of current_page){
            if (shouldStop) break;
            x.click(); 
            const back_button = await waitforElement('.air3-slider-prev-btn',3000);
            if (back_button){
                console.log("Going to another instance ")
                back_button.click();
                await new Promise(resolve => setTimeout(resolve, 1000)); 
            }
        }
    }while(nextBtn());
}
processJobTitles().then(()=>{
    console.log("Done all the pages!");
});
