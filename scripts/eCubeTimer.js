function resizeText() {
    let element = $("#scramble");
    element.style.fontSize = "300px"

    while (isOverflowedX($("#scramble"))) {
        currentSize = parseInt(document.getElementById("result").style.fontSize)
        newSize = currentSize - 10
        element.style.fontSize = newSize + "px"
        element.style.height = newSize + "px"
        element.style.lineHeight = newSize + "px"
    }
}

function isOverflowedX(element) {
    return element.scrollWidth > element.clientWidth;
}

resizeText();
