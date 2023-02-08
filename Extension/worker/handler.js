document.addEventListener('keydown', eventFunc);
document.addEventListener('click', eventFunc);

function eventFunc(){
    console.log("TEST");
}

/*
 *  parseVideo - 영상 정보 가져오기
 *
 *  link - 영상 주소
 *  time - 영상 현재 재생시간
 *  ispause - 정지여부
 *  speed - 배속
 */
function parseVideo(){
    let video = document.getElementsByTagName('video')[0];
    return {
        link: location.href,
        time: video.currentTime,
        ispause: video.paused,
        speed: video.playbackRate
    };
}

/*
 *  setVideo - 영상 정보 변경 및 반영
 *
 *  link - 영상 주소
 *  time - 영상 현재 재생시간
 *  ispause - 정지여부
 *  speed - 배속
 */
function setVideo(link,time,ispause,speed){
    if(location.href != link){
        location.href = link;
    }

    let video = document.getElementsByTagName('video')[0];

    if(Math.abs(video.currentTime - time) > 0.5){
        video.currentTime = time;
    }

    if(ispause) video.pause();
    else        video.play();

    if(video.playbackRate != speed){
        video.playbackRate = speed;
    }
}