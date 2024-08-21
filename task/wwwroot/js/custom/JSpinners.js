function createSpinner(parentDiv) {
    var spinnerDiv = document.createElement('div');
    spinnerDiv.className = "text-center";
    spinnerDiv.id = "spinnerTop";
    spinnerDiv.innerHTML = '<div class="spinner-border text-primary" role = "status" ><span class="visually-hidden">Loading...</span></div>'

    document.getElementById(parentDiv).append(spinnerDiv)
}
function removeSpinner() {

    const element = document.getElementById("spinnerTop");
    element.remove();
}

function createLoader() {
    var spinnerDiv = document.createElement('div');
    spinnerDiv.className = "text-center";
    spinnerDiv.id = "loader-wrapper";
    spinnerDiv.innerHTML = '<div id="loader"></div>'
    document.body.appendChild(spinnerDiv);
}

function removeLoader() {

    const element = document.getElementById("loader-wrapper");
    element.remove();
}

// Set or Remove Button Loader

function removeButtonLoader(btnid, text) {

    const loginbtn = document.getElementById(btnid);
    loginbtn.disabled = false;
    loginbtn.innerHTML = '';

    $('#' + btnid).text(text);
}

function setButtonLoader(btnid, msg) {

    const loginbtn = document.getElementById(btnid);
    loginbtn.disabled = true;
    loginbtn.innerHTML = '';

    $('#' + btnid).text('');

    $('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>').appendTo('#' + btnid);
    $('<span>' + msg + '</span>').appendTo('#' + btnid);
}