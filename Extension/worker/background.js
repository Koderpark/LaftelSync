importScripts('socket.io.js');


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
 * -1인 경우 : User역할
 * 다섯자리 숫자인 경우 : Host 역할
 */
let Id = -1;


const socket = io('http://koder.myds.me:20020', {
  path: '/socket.io',
  transports: ['websocket']
});

async function hostroom(){
  const ret = await chrome.tabs.query({ active: true, currentWindow: true});
  if(Id !== -1){
    chrome.scripting.executeScript({
      target: {tabId: ret[0].id},
      func: () => { alert('이미 파티를 만드셨습니다.'); }
    });
    return {"status": "failed", "log": "AlreadyInRoom"};
  }

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

async function joinroom(Id){
  socket.emit("joinroom", Id);
  // Todo - 결과 받아오는파트 필요할듯?
  
}

/*
 * parse - Host가 자신의 영상 상태를 파싱.
 * time : 영상 현재 재생시간
 * link : 영상 현재 링크
 * ispause : 일시정지 여부 (T/F)
 */
async function parse(){
  const ret = await chrome.tabs.query({ active: true, currentWindow: true});
  
  return await new Promise(resolve => {
    chrome.scripting.executeScript({
      target: {tabId: ret[0].id},
      func: () => {
        let videotag = document.getElementsByTagName('video')[0];
        resolve({
          time: videotag.currentTime,
          link: ret[0].url,
          ispause: videotag.paused,
        });
      }
    });
  });
}


/*
 * modify - User가 자신의 플레이어를 동기화함.
 * time : 영상 현재 재생시간
 * link : 영상 현재 링크
 * ispause : 일시정지 여부 (T/F)
 */
socket.on('modify', async (data) => {
  if(Id == -1){ // User 역할체크 진행
    const ret = await chrome.tabs.query({ active: true, currentWindow: true});
    if(ret[0].url != data.link){
      // ToDo : 탭 링크 변경.
    }
    // ToDo : 영상 일시정지 및 재생시간 조정.
  }
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
  const ret = await chrome.tabs.query({ active: true, currentWindow: true});
  chrome.scripting.executeScript({
    target: {tabId: ret[0].id},
    func: () => {
      alert("parse 실행됨");
    }
  });

  console.log("CHK");

  parse().then((ret) => {
    alert(ret);
    socket.emit("propagate", {roomid: data, vid: ret});
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



  /*
  IsWatchingVideo().then((ret) => {
    console.log(ret);
    sendResponse({message: ret});
  });*/
  //sendResponse({message: "Hello World"});
  return true;
});

