importScripts('socket.io.js');

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



// 플러그인 백그라운드 유지 //
const    onUpdate = (tabId, info, tab) => /^https?:/.test(info.url) && findTab([tab]);
function connect() {chrome.runtime.connect({name: 'keepAlive'}).onDisconnect.addListener(connect);}
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

async function clientAlert(msg){ // 메시지 출력.
  const currtab = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: currtab[0].id },
    args: [msg],
    func: (msg) => { alert(JSON.stringify(msg)); }
  });
}


/*
 * parse - Host가 자신의 영상 상태를 파싱.
 * time : 영상 현재 재생시간
 * link : 영상 현재 링크
 * ispause : 일시정지 여부 (T/F)
 */
async function parse() {
  const currtab = await chrome.tabs.query({ active: true, currentWindow: true });

  var res = await chrome.scripting.executeScript({
    target: { tabId: currtab[0].id },
    args: [currtab[0].url],
    func: (currlink) => {
      let videotag = document.getElementsByTagName('video')[0];
      return {
        time: videotag.currentTime,
        ispause: videotag.paused,
        link: currlink
      };
    }
  });
  return res;
}


/*
 * modify - User가 자신의 플레이어를 동기화함.
 * time : 영상 현재 재생시간
 * link : 영상 현재 링크
 * ispause : 일시정지 여부 (T/F)
 */

async function setvideo(time, ispause){
  const currtab = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: currtab[0].id },
    args: [time, ispause],
    func: (time, ispause) => {
      let videotag = document.getElementsByTagName('video')[0];
      videotag.currentTime = time;
      if(ispause) videotag.pause();
      else        videotag.play();
    }
  });
}

socket.on('modify', async (data) => {
  const currtab = await chrome.tabs.query({ active: true, currentWindow: true });

  if(currtab[0].url == data.link){
    setvideo(data.time, data.ispause);
  }
  else{
    chrome.tabs.update(currtab[0].id, { url: data.link }).then(() => {
      //setvideo(data.time, data.ispause);
      chrome.scripting.executeScript({
        target: { tabId: currtab[0].id },
        func: () => {
          let videotag = document.getElementsByTagName('video')[0];
          
        }
      });
    });
  }
  // ToDo : 링크 변경 -> 백엔드에 싱크요청 -> 영상 시간대 변경 으로 기능분리할것.
  // ToDo : 최초실행(링크변경) 뿐만아니라 중간변경도 가능하게 할것.
  // ToDo : 영상 일시정지 / 재생 기능 제작.
});


/*
 * closed - Host가 방을 폭파시킴
 * ToDo : 기존 라프텔 재생중이던 창 꺼버리면 될듯?
 */
socket.on('closed', async () => {
  clientAlert('호스트와의 연결이 끊겼습니다.')
});

socket.on('parse', async () => {
  const currtab = await chrome.tabs.query({ active: true, currentWindow: true });

  parse().then((arg) => {
    var ret = {roomid: Id, vid: arg[0].result};
    
    /*chrome.scripting.executeScript({
      target: { tabId: currtab[0].id },
      args: [ret],
      func: (ret) => {
        alert(JSON.stringify(ret));
      }
    });*/
    
    socket.emit('propagate', ret);
  })
});


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

  if (msg.message == 'hostroom') {
    host().then((ret) => {
      sendResponse({ message: ret });
    });
  }

  if (msg.message == 'joinroom') {
    join(msg.id).then((ret) => {
      sendResponse({ message: ret });
    });
  }

  if (msg.message == 'getMyState') {
    sendResponse({ message: Id });
  }
  return true;
});

async function host() {
  const currtab = await chrome.tabs.query({ active: true, currentWindow: true });

  if ((currtab[0].url).includes('laftel.net/player')) {
    try {
      socket.emit("host");

      return {
        "status": "success", "log": await new Promise(resolve => {
          socket.on('setRoomCode', (data) => {
            Id = data;
            resolve(data);
          });
        })
      };
    }
    catch (e) {
      clientAlert('서버와의 통신에 실패했습니다\n잠시뒤 시도해주세요');
      return { "status": "failed", "log": "ConnectionFailed" };
    }
  }
  else {
    clientAlert('애니메이션이 재생중일때만 파티를 만들수 있습니다');
    return { "status": "failed", "log": "NotWatchingVideo" };
  }
}


async function join(JoinId) {
  Id = 0;
  socket.emit("join", JoinId);
  // Todo - 결과 받아오는파트 필요할듯?
}