
function ready(docLoadfn) {
    if (document.readyState != 'loading') {
        docLoadfn();
    } else {
        document.addEventListener('DOMContentLoaded', docLoadfn);
    }
}

ready(function () {



});

// Login Functions
// #region

async function login(e) {

    $('#login-alert').addClass('d-none');

    if ($("#name").val().trim() == "") {
        return 0;
    }

    if ($("#pwd").val().trim() == "") {
        return 0;
    }

    e.preventDefault();

    setButtonLoader('btnlogin', 'Please wait ...');

    var obj = {
        'UserName': $("#name").val().trim(),
        'Password': $("#pwd").val().trim()
    };

    var result ;
    var strMsg = '';

    await axios.post(PathName + 'UserLogin', JSON.stringify(obj),
        {
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        }).then((response) => {

            result = response.data;
        },
            (error) => {
            }
    );

    if (result.statusCode == 100) {

        localStorage.setItem("LgnVls", result.items);
        removeButtonLoader('btnlogin', 'Sign In');
        window.location.href = "/Master/Users";
    }
    else if (result.statusCode == 404) {
        strMsg = 'Invalid username or password.';
    }
    else if (result.statusCode == 408) {
        strMsg = 'Your Session is active, please try again after 5 minutes.';
    }
    else {
        strMsg = 'Something went wrong.';
    }
    if (strMsg != '') {

        $('#login-alert').removeClass('d-none');
        $('#login-alert-text').text(strMsg);
    }    

    removeButtonLoader('btnlogin', 'Sign In');
}


// #endregion