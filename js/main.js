document.getElementById('makebtn').onclick = () => {
  chrome.runtime.sendMessage({
    message: 'ChkWatching'
  }, function(ret){
    console.log(ret);
  });
}