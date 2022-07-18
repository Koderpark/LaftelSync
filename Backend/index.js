// ********* app.js 파일

// ws -> socket.io로 교체를해보아요 ㅁㄴㅇㄹ


// 디렉터리 관리를 위해 path 모듈 사용
const path = require("path");
const { Socket } = require("socket.io");


// HTTP 서버(express) 생성 및 구동
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// 2. "/" 경로 라우팅 처리
app.use("/", (req, res)=>{ res.sendFile(path.join(__dirname, './test.html')); });

const HTTPServer = http.listen(8081, ()=>{ console.log("Server is open at port:8081"); });




// 클라이언트에 부여되는 고유 ID 값 관련 함수
let clientlist = {};  // 방번호 중복 제거용
let roomList = [];    // ㄹㅇ 방번호용

function GenerateId(){ // 방 id의 생성
    while(true){
        let tmpnum = Math.floor(Math.random()*89999)+10000;
        console.log(tmpnum);
        if(!clientlist[tmpnum.toString()]){
            clientlist[tmpnum.toString()] = true;
            return tmpnum;
        }
    }
}

function FreeId(id){ // 호스트가 방을 종료함 -> 방 제거
    delete clientlist[id];
}


io.on("connection", (socket) => {
    console.log("새로운 클라이언트 접속");

    socket.on('MakePartyId', (data) => {
        let roomCode = () => {
            while(true){
                let tmpcode = Math.floor(Math.random()*89999)+10000;
                if(!roomList.includes(tmpcode)){
                    return tmpcode;
                }
            }
        }

        roomList.push(roomCode);
        socket.join(roomCode);

        io.emit("")
        console.log(roomCode + " 번호를 가진 방 생성.");
    });

    socket.on("JoinPartyId", (data) => {
        if(!roomList.includes(data.roomCode)){
            
        } 
    });
})

// connection(클라이언트 연결) 이벤트 처리
webSocketServer.on('connection', (ws)=>{

    // 2) 클라이언트에게 메시지 전송
    /*if(ws.readyState === ws.OPEN){ // 연결 여부 체크
        ws.id = GenerateId();
        //ws.send(`클라이언트[${ip}] 접속을 환영합니다 from 서버`); // 데이터 전송
        ws.send(`당신의 ID는 ${ws.id} 입니다.`);

        console.log(clientlist);
    }*/

    // 3) 클라이언트로부터 메시지 수신 이벤트 처리
    ws.on("message", (msg)=>{
        switch(msg.toString()){
            case "MakePartyId" : {
                ws.id = GenerateId(ws);
                console.log(clientlist);
                ws.send(JSON.stringify({"status": "success", "log": {"partyid" : ws.id}}));
                break;
            }
            case "JoinPartyId" : {
                ws.id = GenerateId(ws);
                console.log(clientlist);
                ws.send(JSON.stringify({"status": "success", "log": {"partyid" : ws.id}}));
                break;
            }
            default : {
                ws.send(JSON.stringify({"status": "failed", "log": "UnknownCommand"}));
                break;
            }
        }
        console.log(`클라이언트에게 수신한 메시지 : ${msg}`);
        //ws.send('메시지 잘 받았습니다! from 서버');
        
    })
    
    // 4) 에러 처러
    ws.on('error', (error)=>{
        console.log(`클라이언트 연결 에러발생 : ${error}`);
        FreeId(ws.id);
    })
    
    // 5) 연결 종료 이벤트 처리
    ws.on('close', ()=>{
        console.log(`클라이언트 웹소켓 연결 종료`);
        FreeId(ws.id);
    })
});