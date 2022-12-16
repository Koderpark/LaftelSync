////// Init Server //////

const path = require("path");
const { Socket } = require("socket.io");

const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use("/", (req, res)=>{ res.sendFile(path.join(__dirname, './test.html')); });

const HTTPServer = http.listen(8081, ()=>{ console.log("Server is open at port:8081"); });



let roomList = []; // 방번호 중복제거용

function GenerateId(){
    while(true){
        let tmpcode = Math.floor(Math.random()*89999)+10000;
        if(!roomList.includes(tmpcode)){
            return tmpcode;
        }
    }
}

io.on("connection", (socket) => {
    /*
     * propagate - Host에서 User으로 영상정보를 전송함.
     * roomid : 영상정보를 전달하고자 하는 방번호
     * vid/time : 영상 현재 재생시간
     * vid/link : 영상 현재 링크
     * vid/ispause : 일시정지 여부 (T/F)
     */
    socket.on('propagate', (data) => {
        console.log("propagate 명령 수행.");
        console.log(data);
        socket.to("USER"+data.roomid).emit("modify", data.vid);
    });

    /*
     * query - User가 Host에게 영상정보를 물어봄.
     * roomid : Host측이 연 방의 방번호.
     */
    socket.on('query', (data) => {
        socket.to("HOST"+data.roomid).emit("parse");
    });

    /*
     * hostroom - Host가 방을 열기를 원함
     * 결과로써 방을 생성하고 Host에게 방번호 전달
     */
    socket.on('hostroom', () => {
        let roomCode = GenerateId();

        roomList.push(roomCode);
        socket.join("HOST"+roomCode);
        
        socket.emit("setcode", roomCode);
        console.log(roomCode + " 번호를 가진 방 생성.");
        console.log(roomList);
    });

    /*
     * joinroom - User가 방에 들어오기를 원함
     * 결과로써 방에 접속함
     */
    socket.on('joinroom', (data) => {
        if(roomList.includes(parseInt(data))){
            socket.join("USER"+data);
            console.log(data + " 번호를 가진 방에 유저 접속");

            socket.to("HOST"+data).emit("parse");
        }
    });

    /*
     * disconnecting - Host / User가 모종의 이유로 퇴장.
     * Host일때는 방 폭파 이벤트 destroy 를 User에게 전송
     */
    socket.on('disconnecting', () => {

        let roomarr = [...(socket.rooms)];
        let roomcode = roomarr.filter(s => s.includes("HOST"));

        if(roomcode.length != 0){
            let id = roomcode[0].replace("HOST", "");
            console.log(id + " 번호를 가진 방이 닫혔습니다."); // 파괴된 방 번호

            socket.to("USER"+id).emit("destroy");

            roomList.pop(id);
        }
    });
});

/*
webSocketServer.on('connection', (ws)=>{

    // 2) 클라이언트에게 메시지 전송
    /*if(ws.readyState === ws.OPEN){ // 연결 여부 체크
        ws.id = GenerateId();
        //ws.send(`클라이언트[${ip}] 접속을 환영합니다 from 서버`); // 데이터 전송
        ws.send(`당신의 ID는 ${ws.id} 입니다.`);

        console.log(clientlist);
    }

    // 3) 클라이언트로부터 메시지 수신 이벤트 처리
    ws.on("message", (msg)=>{
        switch(msg.toString()){
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
});*/
