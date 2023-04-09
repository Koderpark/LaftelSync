/**
 * 영상 정보를 가져와 반환하는 함수.
 * @returns {link, time, ispause, speed} 영상 링크, 재생시간, 일시정지여부, 배속
 */
function parseVideo() {
    setTimeout(() => {
        let video = document.getElementsByTagName('video')[0];
        chrome.runtime.sendMessage({
            sender: 'host',
            message: 'updateVideo',
            vidData: {
                link: location.href,
                time: video.currentTime,
                ispause: video.paused,
                speed: video.playbackRate
            }
        });
    }, 100);
}

/**
 * 사용자의 상태가 HOST임을 확정짓고, 
 * parseVideo 함수 호출을 위한 이벤트핸들러를 추가.
 */
function startEvent() {
    alert("set status to HOST");
    document.getElementsByTagName('video')[0].addEventListener('keydown', parseVideo);
    document.addEventListener('keydown', parseVideo);
    document.addEventListener('click', parseVideo);
    setInterval(parseVideo, 10000);
}

setInterval(() => {
    chrome.runtime.sendMessage({
        sender: 'host',
        message: 'keepAlive'
    });
}, 5000);