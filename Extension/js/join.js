document.getElementById('joinbtn').onclick = () => {
    let idform = document.getElementById('idform').innerText;
    chrome.runtime.sendMessage({
        message: 'JoinParty',
        id : idform
    }, function(ret){
        location.href = '../page/make.html?id='+ret.message.log;
        //alert(ret.message.log);
    });
}