importScripts('socket.io.js');

// 플러그인 유지를 위한 주기적 통신 //
const onUpdate = (tabId, info, tab) => /^https?:/.test(info.url) && findTab([tab]);
findTab();
chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'keepAlive') {
    setTimeout(() => port.disconnect(), 250e3);
    port.onDisconnect.addListener(() => findTab());
  }
});
async function findTab(tabs) {
  if (chrome.runtime.lastError) { /* tab was closed before setTimeout ran */ }
  for (const {id: tabId} of tabs || await chrome.tabs.query({url: '*://*/*'})) {
    try {
      await chrome.scripting.executeScript({target: {tabId}, func: connect});
      chrome.tabs.onUpdated.removeListener(onUpdate);
      return;
    } catch (e) {}
  }
  chrome.tabs.onUpdated.addListener(onUpdate);
}
function connect() {
  chrome.runtime.connect({name: 'keepAlive'})
    .onDisconnect.addListener(connect);
}



/*
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
*/
/*
 * Id - 접속 클라이언트가 가지는 고유값
 * -1인 경우 : 역할이 할당되지 않음.
 *  0인 경우 : User 역할.
 * 다섯자리 숫자인 경우 : Host 역할
 */
let Id = -1;


const socket = io('http://koder.myds.me:20020', {
  path: '/socket.io',
  transports: ['websocket']
});

async function hostroom(){
  const ret = await chrome.tabs.query({ active: true, currentWindow: true});

  if((ret[0].url).includes('laftel.net/player')){
    try{
      socket.emit("hostroom");

      return {"status": "success", "log": await new Promise(resolve => {
        socket.on('setcode', (data) => {
          Id = data;
          resolve(data);
        });
      })};
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

async function joinroom(JoinId){
  Id = 0;
  socket.emit("joinroom", JoinId);
  // Todo - 결과 받아오는파트 필요할듯?
  
}

/*
 * parse - Host가 자신의 영상 상태를 파싱.
 * time : 영상 현재 재생시간
 * link : 영상 현재 링크
 * ispause : 일시정지 여부 (T/F)
 */
async function parse(data){
  const ret = await chrome.tabs.query({ active: true, currentWindow: true});
  
  var val = await new Promise(resolve => {
    chrome.scripting.executeScript({
      target: {tabId: ret[0].id},
      func: () => {
        let videotag = document.getElementsByTagName('video')[0];
        alert(videotag.currentTime);
        resolve({
          time: videotag.currentTime,
          ispause: videotag.paused,
        });
      }
    });
  });

  socket.emit("propagate", {roomid: data, vid: {link : ret[0].url, time: val.time, ispause: val.ispause}});
  return;
}


/*
 * modify - User가 자신의 플레이어를 동기화함.
 * time : 영상 현재 재생시간
 * link : 영상 현재 링크
 * ispause : 일시정지 여부 (T/F)
 */
socket.on('modify', async (data) => {
  const ret = await chrome.tabs.query({ active: true, currentWindow: true});
  chrome.scripting.executeScript({
    target: {tabId: ret[0].id},
    func: () => {
      alert("MODIFY 명령 수행.");
    }
  });
  chrome.tabs.update(ret[0].id, { url: data.link });
  // ToDo : 영상 일시정지 및 재생시간 조정.
});

/*
 * destroy - Host가 방을 폭파시킴
 * alert문 출력하고
 * 기존 라프텔 재생중이던 창 꺼버리면 될듯?
 */
socket.on('destroy', async () => {
  const ret = await chrome.tabs.query({ active: true, currentWindow: true});
  chrome.scripting.executeScript({
    target: {tabId: ret[0].id},
    func: () => {
      alert("방 폭파됨 ㅅㄱ");
    }
  });
});

socket.on('parse', async (data) => {
  //Todo - 파싱 제대로 안됨.
  const ret = await chrome.tabs.query({ active: true, currentWindow: true});
  parse(data);
  
  chrome.scripting.executeScript({
    target: {tabId: ret[0].id},
    func: () => {
      alert("parse 실행됨");
    }
  });
});


chrome.runtime.onMessage.addListener( function (msg,sender,sendResponse){

  // test code start
  if(msg.message == 'TEST'){
    parse().then((ret) => {
      sendResponse({message: ret});
    });
  }
  // test code end


  if(msg.message == 'hostroom'){
    hostroom().then((ret) => {
      sendResponse({message: ret});
    });
  }

  if(msg.message == 'joinroom'){
    joinroom(msg.id).then((ret) => {
      sendResponse({message: ret});
    });
  }

  if(msg.message == 'getMyState'){
    sendResponse({message:Id});
  }

  /*
  IsWatchingVideo().then((ret) => {
    console.log(ret);
    sendResponse({message: ret});
  });*/
  //sendResponse({message: "Hello World"});
  return true;
});

