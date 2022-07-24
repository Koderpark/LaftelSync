document.getElementById('joinbtn').onclick = () => {
    let idform = document.getElementById('idform').value;
    chrome.runtime.sendMessage({
        message: 'joinroom',
        id : idform
    }, function(ret){
        //alert(JSON.stringify(ret));
        self.close();
    });
}