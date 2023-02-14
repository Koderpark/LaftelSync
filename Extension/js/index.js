document.getElementById('makebtn').onclick = () => {
  chrome.runtime.sendMessage({
    sender:'action',
    message: 'hostroom'
  }, function(ret){
    location.href = '../page/make.html?id='+ret.message.log;
    //alert(ret.message.log);
  });
}

document.getElementById('joinbtn').onclick = () => {
  document.location = '../page/join.html';
}

async function getMyState(){
  var test = await new Promise(function(resolve){
    chrome.runtime.sendMessage({
      sender: 'action',
      message: 'getMyState'
    }, function(ret){
      resolve(ret.message);
    });
  });
  if(test != -1 && test != 0){
    location.href = '../page/make.html?id='+test;
  }
  if(test == 0){
    
  }
}
getMyState();



// 플러그인 백그라운드 유지 //
(function connect(){chrome.runtime.connect({name: 'keepAlive'}).onDisconnect.addListener(connect);})();