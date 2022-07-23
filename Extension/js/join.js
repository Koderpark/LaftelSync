document.getElementById('joinbtn').onclick = () => {
    let idform = document.getElementById('idform').innerText;
    chrome.runtime.sendMessage({
        message: 'TEST',
        id : idform
    }, function(ret){
        //location.href = '../page/make.html?id='+ret;
        alert(JSON.stringify(ret));
    });
}