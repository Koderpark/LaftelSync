// USER PART //

/*
 *  setVideo - 영상 정보 변경 및 반영
 *
 *  link - 영상 주소
 *  time - 영상 현재 재생시간
 *  ispause - 정지여부
 *  speed - 배속
 */
function setVideo(vidData){

    if(location.href != vidData.link){
        location.href = vidData.link;
    }

    let video = document.getElementsByTagName('video')[0];

    if(Math.abs(video.currentTime - vidData.time) > 0.5){
        video.currentTime = vidData.time;
    }

    if(vidData.ispause) video.pause();
    else                video.play();

    if(video.playbackRate != vidData.speed){
        video.playbackRate = vidData.speed;
    }
}

