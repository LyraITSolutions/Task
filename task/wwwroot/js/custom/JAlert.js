
// Show different types of toast msg 

function showAlertDismissible(strongContent, spanContent, className) {   

    showAlert(strongContent, spanContent, className);
}

function showAlert(strongText, spanText, className) {
    // Create the alert element
    const alert = document.createElement('div');
    alert.className = 'alert alert-dismissible ' + className + ' fade show';
    alert.role = 'alert';
    alert.style.zIndex = 9999;
    alert.style.position = 'fixed';
    alert.style.top = '0';
    alert.style.left = '0';
    alert.style.width = '100%';
    alert.style.margin = '0';
    alert.style.borderRadius = '0';

    // Create the strong text element
    const strong = document.createElement('strong');
    strong.id = 'alertstrong';
    strong.textContent = strongText + ' ';

    // Create the span text element
    const span = document.createElement('span');
    span.id = 'alertspan';
    span.textContent = spanText;

    // Create the close button element
    const button = document.createElement('button');
    button.className = 'btn-close';
    button.type = 'button';
    button.dataset.bsDismiss = 'alert';
    button.ariaLabel = 'Close';

    // Append the elements to the alert
    alert.appendChild(strong);
    alert.appendChild(span);
    alert.appendChild(button);

    // Append the alert to the alert container
    document.getElementById('alert-container').appendChild(alert);
}


// prevent space at start index on input boxes

// #region
function preventLeadingSpace(event) {

    var input = event.target;
    if (input.value.startsWith(' ')) {
        input.value = input.value.trimStart();
    }
}

function preventSpaceEventReg() {

    var inputBoxes = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    inputBoxes.forEach(function (input) {

        input.addEventListener('input', preventLeadingSpace);
    });

    const value = localStorage.getItem('LgnVls');
    var jsonObject = JSON.parse(value);
    $('.lgnstaffname').text(jsonObject[0].Name);
}

// #endregion


// get date picker value
// #region
function getSelectedDate(selType, selectedDateValue) {

    var dateValues = selectedDateValue.split('to');

    var retDate;

    if (selType == 1) { // Call for from date          

        if (dateValues.length == 1) {

            var splitDate = selectedDateValue.split('-');

            retDate = '20' + splitDate[2].trim() + '-' + splitDate[1].trim() + '-' + splitDate[0].trim();

        }
        else {

            var splitDate = dateValues[0].split('-');

            retDate = '20' + splitDate[2].trim() + '-' + splitDate[1].trim() + '-' + splitDate[0].trim();
        }
    }
    else {

        if (dateValues.length == 1) {

            var splitDate = selectedDateValue.split('-');

            retDate = '20' + splitDate[2].trim() + '-' + splitDate[1].trim() + '-' + splitDate[0].trim();
        }
        else {

            var splitDate = dateValues[0].split('-');

            splitDate = dateValues[1].split('-');

            retDate = '20' + splitDate[2].trim() + '-' + splitDate[1].trim() + '-' + splitDate[0].trim();
        }

    }

    return retDate;

}

// #endregion


