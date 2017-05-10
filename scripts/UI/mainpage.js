function quit() {
    window.open('', '_self', ''); window.close();
}

function startGame() {
    document.getElementById("progress").style.visibility="visible";
    document.getElementById("mainMenu").style.visibility="hidden";
    initialize();
}