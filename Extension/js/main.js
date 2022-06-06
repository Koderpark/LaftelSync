document.getElementById('makebtn').onclick = () => {
  chrome.runtime.sendMessage({
    message: 'MakingParty'
  }, function(ret){
    console.log(ret);
  });
}