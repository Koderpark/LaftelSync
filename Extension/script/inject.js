function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}


//alert("load done");
setTimeout(() => {
    let tmp = document.querySelector("#root .App");

    let asdf = document.createElement("div");
    asdf.innerHTML = `
    <div class='chatdisplay'>
        <h1>Hello World</h1>
    </div>
    `;
    tmp.append(asdf);
},3000);
