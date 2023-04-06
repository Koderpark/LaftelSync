/*
 *  parseVideo - 영상 정보 가져오기 -> [bg] updateVideo 호출
 *
 *  link - 영상 주소
 *  time - 영상 현재 재생시간
 *  ispause - 정지여부
 *  speed - 배속
 */
function parseVideo(){
    console.log("Hello");
    let video = document.getElementsByTagName('video')[0];
    chrome.runtime.sendMessage({
        from: 'injectHost',
        message: 'updateVideo',
        vidData : {
            link: location.href,
            time: video.currentTime,
            ispause: video.paused,
            speed: video.playbackRate
        }
    });
}

alert("injected");
document.addEventListener('keydown', parseVideo);
document.addEventListener('click', parseVideo);
setInterval(parseVideo, 10000);