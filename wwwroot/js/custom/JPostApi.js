

async function callPostApi(obj, apiName) {

    var result = null;

    await axios.post(PathName + apiName, JSON.stringify(obj),
        {
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        }).then((response) => {

            result = response.data;
        },
            (error) => {
                showAlertDismissible('Error', 'Connection error.', 'alert-subtle-danger');
            }            
    );

    if (result.statusCode == 408) {

        showAlertDismissible('Session', 'Session expired.', 'alert-subtle-danger');
        window.location.href = "/Home/Login";
        return null;
    }

    return result;
}

function getToken() {

    const lgnValues = JSON.parse(localStorage.getItem('LgnVls'));

    return lgnValues[0].Token;
}

function checkLocalStorageValue(key) {

    const value = localStorage.getItem('LgnVls');

    // Check if the value is null or undefined
    if (value === null || value === undefined) {
        window.location.href = "/Home/Login";
        return false;
    } else {
        return true;
    }
}

function showToastByStatusCode(statusCode, strMsg, modalId) {

    switch (statusCode) {
        case 201:
            showAlertDismissible('Great', strMsg + ' saved successfully.', 'alert-subtle-success');           
            if (modalId != '') { $('#' + modalId).modal('toggle'); }
            break;
        case 202:
            showAlertDismissible('Ok', strMsg + ' status changed successfully.', 'alert-subtle-primary'); 
            break;
        case 200:
            showAlertDismissible('Accepted', strMsg + ' updated successfully.', 'alert-subtle-success');
            if (modalId != '') { $('#' + modalId).modal('toggle'); }
            break;
        case 208:
            if (strMsg == 'User') {
                showAlertDismissible('Sorry','The user already exists with the same mobile number or username.', 'alert-subtle-warning'); 
            }
            else {
                showAlertDismissible('Sorry', strMsg + ' already exist.', 'alert-subtle-warning'); 
            }                       
            break;
        case 404:
            showAlertDismissible('Warning', strMsg + ' not found.', 'alert-subtle-warning');
            break;
        case 429:            
            showAlertDismissible('Warning', strMsg + ' limit reached, Please purchase.', 'alert-subtle-warning');
            break;
        default:
            showAlertDismissible('Error', 'Something went wrong.', 'alert-subtle-danger');
    }
}