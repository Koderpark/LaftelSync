document.getElementById('makebtn').onclick = () => {
  chrome.runtime.sendMessage({
    message: 'hostroom'
  }, function(ret){
    location.href = '../page/make.html?id='+ret.message.log;
    //alert(ret.message.log);
  });
}

document.getElementById('joinbtn').onclick = () => {
  document.location = '../page/join.html';
}