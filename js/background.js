// 브라우저 익스텐션이 라프텔 사이트 내에서만 활성화되도록 허용.
chrome.runtime.onInstalled.addListener(function() {
  chrome.action.disable();
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostSuffix: 'laftel.net'},
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

// IsWatchingVideo : 비디오태그가 있는 경우 true, 없으면 false를 반환.
async function IsWatchingVideo(){
  let [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  let val   = await chrome.scripting.executeScript({
    target: {tabId : tab.id},
    function: () => {
      return (document.getElementsByTagName('video').length != 0);
    }
  });
  return val[0].result;
}

chrome.runtime.onMessage.addListener( async (msg,sender,sendResponse) => {
  if(msg.message == 'ChkWatching'){
    let test = await IsWatchingVideo();
    console.log(test);
    sendResponse({message: test});
  }
  sendResponse({ message: 'asdfasdf' });
});