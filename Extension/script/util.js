// 웹소켓 연결이 유지되도록 함.
const onUpdate = (tabId, info, tab) => (/^https?:/.test(info.url) && findTab([tab]));
function connect() { chrome.runtime.connect({ name: 'keepAlive' }).onDisconnect.addListener(connect); }
findTab();
chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'keepAlive') {
        setTimeout(() => port.disconnect(), 250e3);
        port.onDisconnect.addListener(() => findTab());
    }
});
async function findTab(tabs) {
    if (chrome.runtime.lastError) { /* tab was closed before setTimeout ran */ }
    for (const { id: tabId } of tabs || await chrome.tabs.query({ url: '*://*/*' })) {
        try {
            await chrome.scripting.executeScript({ target: { tabId }, func: connect });
            chrome.tabs.onUpdated.removeListener(onUpdate);
            return;
        } catch (e) { }
    }
    chrome.tabs.onUpdated.addListener(onUpdate);
}

// 브라우저 익스텐션이 라프텔 사이트 내에서만 활성화되도록 허용.
chrome.runtime.onInstalled.addListener(function () {
    chrome.action.disable();
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostSuffix: 'laftel.net' },
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

/**
 * 브라우저창에 alert() 를 띄워주는 함수.
 * @param {object} msg
 */
async function clientAlert(msg){
    if(!debug) return;
    const currtab = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: currtab[0].id },
        args: [msg],
        func: (msg) => { alert(JSON.stringify(msg)); }
    });
}
/**
 * 브라우저창에 console.log() 을 찍어주는 함수.
 * @param {object} msg
 */
async function clientLog(...msg){
    if(!debug) return;
    const currtab = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: currtab[0].id },
        args: [...msg],
        func: (...msg) => { console.log(...msg) }
    });
}