function getParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

window.onload = () => {
    let tmp = document.getElementById('displayId');
    let tmp2 = getParameter('id');
    console.log(tmp2);
    tmp.innerHTML += tmp2;
}