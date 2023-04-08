/**
 * main.html 에서 실행되는 함수
 */
function currMain() {
    // 이미 방을 개설한 경우, make.html으로 이동.
    chrome.runtime.sendMessage({
        sender: 'popup',
        message: 'getMyState'
    }, function (ret) {
        if (ret.message != -1 && ret.message != 0) {
            location.href = 'make.html?id=' + ret.message;
        }
    });

    // 방을 개설한 뒤, make.html으로 이동.
    document.getElementById("makeParty").onclick = () => {
        chrome.runtime.sendMessage({
            sender: 'popup',
            message: 'hostroom'
        }, function (ret) {
            location.href = 'make.html?id=' + ret.message.log;
        });
    }

    // join.html으로 이동.
    document.getElementById("toJoinPage").onclick = () => {
        document.location = 'join.html';
    }
}

/**
 * join.html 에서 실행되는 함수
 */
function currJoin() {
    // 기존에 개설된 방에 가입.
    document.getElementById("joinToParty").onclick = () => {
        let idform = document.getElementById('join-idform').value;

        chrome.runtime.sendMessage({
            sender: 'popup',
            message: 'joinRoom',
            id: idform
        }, function (ret) {
            //alert(JSON.stringify(ret));
            self.close();
        });
    }
}

/**
 * make.html 에서 실행되는 함수
 */
function currMake(){
    let displayId = document.getElementById('displayId');
    displayId.innerHTML += new RegExp("[\\?&]id=([^&#]*)").exec(location.search)[1];
}

window.onload = () => {
    //console.log(window.location.pathname);
    if (window.location.pathname == '/popup/main.html') { currMain(); }
    if (window.location.pathname == '/popup/make.html') { currMake(); }
    if (window.location.pathname == '/popup/join.html') { currJoin(); }
}

// 플러그인 백그라운드 유지 //
(function connect() { chrome.runtime.connect({ name: 'keepAlive' }).onDisconnect.addListener(connect); })();