document.getElementById('joinbtn').onclick = () => {
    let idform = document.getElementById('idform').value;
    chrome.runtime.sendMessage({
        sender : 'action',
        message: 'joinroom',
        id : idform
    }, function(ret){
        //alert(JSON.stringify(ret));
        self.close();
    });
}