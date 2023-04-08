importScripts('../lib/socket.io.js');
importScripts('util.js');
const socket = io('http://koder.myds.me:20020', { path: '/socket.io', transports: ['websocket'] });

/*
 * Id - 접속 클라이언트가 가지는 고유값
 * -1인 경우 : 역할이 할당되지 않음.
 *  0인 경우 : User 역할.
 * 다섯자리 숫자인 경우 : Host 역할
 */
let Id = -1;

//debug 모드 true/false 스위치. 
const debug = false;

/*
 * modify - User가 자신의 플레이어를 동기화함.
 * time : 영상 현재 재생시간
 * link : 영상 현재 링크
 * ispause : 일시정지 여부 (T/F)
 */

async function setvideo(time, ispause) {
    const currtab = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: currtab[0].id },
        args: [time, ispause],
        func: (time, ispause) => {
            let videotag = document.getElementsByTagName('video')[0];
            console.log("curr -> " + videotag.currentTime);
            console.log("serv -> " + time);
            if (Math.abs(videotag.currentTime - time) > 0.5) {
                videotag.currentTime = time;
            }
            if (ispause) videotag.pause();
            else videotag.play();
        }
    });
}



/*socket.on("modify", async (data) => {
    
    console.log(JSON.stringify(data));

    const currtab = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: currtab[0].id },
        args: [data],
        func: (data) => {
            setVideo(data);
        }
    });
});*/

socket.on('modify', async (data) => {
    console.log(JSON.stringify(data));

    const currtab = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: currtab[0].id },
        args: [data],
        func: (data) => {
            setVideo(data);
        }
    });
});

/*
async function injectScript(id){
    await chrome.scripting.registerContentScripts([{
        id: id,
        js: ["worker/"+id+".js"],
        matches: ["*://laftel.net/*"]
    }])

    let scriptList = await chrome.scripting.getRegisteredContentScripts();

    clientAlert(scriptList);
    /*
    if(scriptList.includes()){
        chrome.scripting.registerContentScripts([{
            id: id,
            js: ["worker/"+id+".js"],
            matches: ["*://laftel.net/*"]
        }])
    }
    else{
        chrome.scripting.updateContentScripts([{
            id: id,
            js: ["worker/"+id+".js"],
            matches: ["*://laftel.net/*"]
        }])
    }
}
*/
async function hostRoom(callback) {
    const currtab = await chrome.tabs.query({ active: true, currentWindow: true });
    if ((currtab[0].url).includes('laftel.net/player')) {
        try {
            socket.emit("host", (data) => {
                chrome.scripting.executeScript({
                    target: { tabId : currtab[0].id },
                    func: () => {startEvent();}
                })
                Id = data.roomCode;
                callback({ "status": "success", "log": data.roomCode });
            });
        }
        catch (e) {
            clientAlert('서버와의 통신에 실패했습니다\n잠시뒤 시도해주세요');
            callback({ "status": "success", "log": "ConnectionFailed" });
        }
    }
    else {
        clientAlert('애니메이션이 재생중일때만 파티를 만들수 있습니다');
        callback({ "status": "success", "log": "NotWatchingVideo" });
    }
}



/*
 * closed - Host가 방을 폭파시킴
 * ToDo : 기존 라프텔 재생중이던 창 꺼버리면 될듯?
 */
socket.on('closed', async () => {
    clientAlert('호스트와의 연결이 끊겼습니다.');
});

socket.on('parse', async () => {
    const currtab = await chrome.tabs.query({ active: true, currentWindow: true });
    if (currtab[0].url.includes("laftel")) {
        await chrome.scripting.executeScript({
            target: { tabId: currtab[0].id },
            func: () => { return parseVideo(); }
        });
    }
});


/**
 * 익스텐션 클릭시 나타나는 팝업창으로부터의 메시지를 처리합니다.
 * @param {object} msg 받은 메시지
 * @param {function} sendResponse 결과값을 전송할 콜백함수
 */
async function fromPopup(msg,sendResponse){
    switch (msg.message) {
        case 'getMyState': {
            sendResponse({ message: Id });
            break;
        }

        case 'joinRoom': {
            //clientAlert(msg.id);
            Id = 0;
            socket.emit("join", msg.id);
            sendResponse({ message: undefined }); //ToDo - 모종의 결과 보내기.
            break;
        }

        case 'hostroom': {
            clientAlert("curr -> HOST");
            hostRoom((data) => {
                sendResponse({ message: data });
            });
            break;
        }
    }
}

/**
 * 웹페이지 상에 삽입된 host.js로부터의 메시지를 처리합니다.
 * @param {object} msg 받은 메시지
 * @param {function} sendResponse 결과값을 전송할 콜백함수
 */
async function fromHost(msg,sendResponse){
    console.log(JSON.stringify(msg));
    switch (msg.message) {
        case 'updateVideo': {
            msg.vidData.roomid = Id;
            socket.emit('propagate', msg.vidData);
            break;
        }
    }
}

/**
 * 웹페이지 상에 삽입된 user.js로부터의 메시지를 처리합니다.
 * @param {object} msg 받은 메시지
 * @param {function} sendResponse 결과값을 전송할 콜백함수
 */
async function fromUser(msg,sendResponse){

}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if(msg.sender == 'popup') fromPopup(msg,sendResponse);
    if(msg.sender == 'host') fromHost(msg,sendResponse);
    if(msg.sender == 'user') fromUser(msg,sendResponse);
    return true;
});