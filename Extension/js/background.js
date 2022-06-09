/*function message(event){
  console.log(`서버측 리턴값 : ${event.data}`);
  function getsocket(){
    return event;
  }
  return getsocket();
}

var result = new Promise();
var websocket = new WebSocket("ws://116.127.164.3:21100");
websocket.onopen  = ()    => { console.log("웹소켓 연결 성공"); };
websocket.onclose = ()    => { console.log("웹소켓 연결 종료"); };
websocket.onerror = (err) => { console.log(`웹소켓 에러 : ${err}`); };
websocket.onmessage = (event) => {
  
};*/

let Id = -1;

// 웹소켓 서버와 연결 -> 객체 리턴.
function connect(){
  return new Promise((resolve,reject) => {
    var websocket = new WebSocket("ws://116.127.164.3:21100");
    websocket.onopen  = ()    => { console.log("웹소켓 연결 성공");     resolve(websocket); };
    websocket.onerror = (err) => { console.log(`웹소켓 에러 : ${err}`); reject(err); };
    websocket.onclose = ()    => { console.log("웹소켓 연결 종료"); };
  });
}

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


// MakeParty : 비디오태그가 있는 경우 방번호, 없으면 failed를 반환.
async function MakeParty(){
  const ret = await chrome.tabs.query({ active: true, currentWindow: true });
  if((ret[0].url).includes('laftel.net/player')){
    try{
      let websocket = await connect();
      
      websocket.send("MakePartyId");
      let PartyId = new Promise((resolve) => {
        websocket.onmessage = (event) => {
          let tmp = JSON.parse(event.data).log;
          Id = tmp.partyid;
          resolve(tmp.partyid);
        }
      });

      return {"status": "success", "log": await PartyId};
    }
    catch(e){
      chrome.scripting.executeScript({
        target: {tabId: ret[0].id},
        func: () => { alert('서버와의 통신에 실패했습니다\n잠시뒤 시도해주세요'); }
      });
      return {"status": "failed", "log": "ConnectionFailed"};
    }
  }
  else{
    chrome.scripting.executeScript({
      target: {tabId: ret[0].id},
      func: () => { alert('애니메이션이 재생중일때만 파티를 만들수 있습니다'); }
    });
    return {"status": "failed", "log": "NotWatchingVideo"};
  }
}

async function JoinParty(){
  
}

chrome.runtime.onMessage.addListener( function (msg,sender,sendResponse){
  if(msg.message == 'MakingParty'){
    MakeParty().then((ret) => {
      sendResponse({message: ret});
    });
  }

  if(msg.message == 'JoinParty'){
    MakeParty().then((ret) => {
      sendResponse({message: ret});
    });
  }
  /*
  IsWatchingVideo().then((ret) => {
    console.log(ret);
    sendResponse({message: ret});
  });*/
  //sendResponse({message: "Hello World"});
  return true;
});

