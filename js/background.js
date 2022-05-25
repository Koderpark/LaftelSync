async function getCurrentTab(){
    let queryOptions = { active: true, lastFocusedWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log(tab);
    return tab;
}
  
  chrome.tabs.onActivated.addListener((tabId, changeInfo, tab) => {
    //return getCurrentTab();
  });