document.getElementById('makebtn').onclick = () => {
  chrome.runtime.sendMessage({
    message: 'ChkWatching'
  }, (response) => {
    alert(response.message);
  });
}