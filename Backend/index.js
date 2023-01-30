// require
const e = require("express");
const path = require("path");
const { Socket } = require("socket.io");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// 서버생성
app.use("/", (req, res)=>{ res.sendFile(path.join(__dirname, './test.html')); });
const HTTPServer = http.listen(8081, ()=>{ console.log("Server is open at port:8081"); });

let roomList = []; // 열린 방 목록

function GenerateId(){ // 중복없는 방번호 생성함수.
    while(true){
        let tmpcode = Math.floor(Math.random()*89999)+10000;
        if(!roomList.includes(tmpcode)) return tmpcode;
    }
}


io.on("connection", (socket) => {
    // %임시% 매 초 parse 시키는 부분 //
    setInterval(() => {
        roomList.forEach(e => {
            socket.to("HOST"+e).emit("parse");
        });
    }, 10000);


    /*
     * propagate - Host에서 User으로 영상정보를 전송함.
     * vid/time : 영상 현재 재생시간
     * vid/link : 영상 현재 링크
     * vid/ispause : 일시정지 여부 (T/F)
     */
    socket.on('propagate', (data) => {
        console.log("propagate 명령 수행.");
        console.log(JSON.stringify(data));
        socket.to("USER"+data.roomid).emit("modify", data.vid);
    });

    /*
     * query - User가 Host에게 영상정보를 물어봄.
     */
    socket.on('query', (data) => {
        socket.to("HOST"+data.roomid).emit("parse");
    });

    /*
     * host - Host가 방을 열기를 원함
     * 결과로써 방을 생성하고 Host에게 방번호 전달
     */
    socket.on('host', () => { // 방 생성후 setRoomCode 이벤트 호출.
        let roomCode = GenerateId();

        roomList.push(roomCode);
        socket.join("HOST"+roomCode);
        
        socket.emit("setRoomCode", roomCode);
        console.log(roomCode + " 방 생성.");
        console.log(roomList);
    });

    socket.on('join', (data) => { // 유저를 방에 넣고 parse 이벤트 호출
        if(roomList.includes(parseInt(data))){
            socket.join("USER"+data);
            console.log(data + " 방에 유저 접속");
            socket.to("HOST"+data).emit("parse");
        }
    });

    socket.on('disconnecting', () => { // 누군가가 퇴장. HOST일경우 USER에게 closed 이벤트호출
        let roomarr = [...(socket.rooms)];
        let roomcode = roomarr.filter(s => s.includes("HOST"));
        if(roomcode.length != 0){
            let id = roomcode[0].replace("HOST", "");
            console.log(id + " 번호를 가진 방이 닫혔습니다."); // 파괴된 방 번호
            socket.to("USER"+id).emit("closed");
            roomList.pop(id);
        }
    });
});
