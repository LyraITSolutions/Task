

// variables for pagination
// #region 


var options = {
    valueNames: ['BranchName', 'BranchCode'], page: 10,
    pagination: true
};
var nextPageValue = 1;
var totalItems = 0;
var hackerList;


// #endregion

// ready functions
// #region
function ready(docLoadfn) {
    if (document.readyState != 'loading') {
        docLoadfn();
    } else {
        if (!checkLocalStorageValue()) { return; }
        document.addEventListener('DOMContentLoaded', docLoadfn);
    }
}
ready(async function () {

    preventSpaceEventReg();

    $('.nav-item a').removeClass('active');
    $('#nav-link-brnch').addClass('active');

    await fillBranch();

    $('.search').on('keyup', function () {
        nextPageValue = 1;
        $('.paginationDetails').empty();
        if ($('.search').val() != "") {

            hackerList.search($('.search').val(), ['BranchName', 'BranchCode']);
            totalItems = hackerList.matchingItems.length;
        }
        else {

            hackerList.search();
            totalItems = hackerList.items.length;
        }
        if (totalItems > options.page) {
            $('.pagerclass button').removeClass('disabled');
            $('.pagerclass').removeClass('d-none');
            $('.pagerclass button').removeAttr('disabled');
            $('.paginationDetails').text('Showing 1 to ' + options.page + ' of ' + totalItems);
        }
        else {
            $('.pagerclass button').addClass('disabled');
            $('.pagerclass').addClass('d-none');
        }
    });

});
function clearBrnchControls() {

    $("#modalbody").find("input[type=text]").val("");   
    $('#txtbrName').on('focusin', handler);
}
function handler(event) {
}
async function createNewBrnch() {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    $('#brnch-modal').modal('toggle');
    clearBrnchControls();
    $('#msrtName').text("Add new");
    $('#key').val("");
}
// #endregion

// fill branch by company
// #region

async function fillBranch() {

    $('.search ').val('');
    createSpinner('tableBrnch');

    var obj = {
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetBranchByCompanyId');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    if (data.length <= 0) {

        var $tr = $('<tr />').appendTo('#brnch-tables-body');
        $('<td colspan="3" style="text-align: center;"/>').text("No data available").appendTo($tr);
        return;
    }

    var html = '';
    $('#brnch-tables-body').empty();

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        html += '<tr>';
        html += '<td class="BranchName">' + item.BranchName + '</td>';
        html += '<td class="BranchCode">' + item.BranchCode + '</td>';
        html += '<td  class="Status" >';
        html += '<div class="form-check form-switch">';
        if (item.Status == true) {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateBrnchStatus(this)"  checked id="togBtn"  class="form-check-input"/>';
        }
        else {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateBrnchStatus(this)"  id="togBtn" class="form-check-input" />';
        }
        html += '</div>';
        html += '<td id="' + item.ID + '" class="text-end pe-5" onclick="brnchEdit(this)">';
        html += '<div>';
        html += '<button class="btn p-0" type="button"  data-bs-placement="top" title="Edit" data-bs-toggle="modal" data-bs-target="#brnch-modal" >';
        html += '<span class="text-500 fas fa-edit" /></span></button></div></td>';

    }

    $('#brnch-tables-body').append(html);

    initializeHackerList('tableBrnch');

    removeSpinner();
}
// #endregion

// update department status
// #region

async function updateBrnchStatus(cb) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    var obj = {
        'BranchId': cb.value == "" ? 0 : parseInt(cb.value),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'ChangeBranchStatus');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Branch', '');
}

// #endregion

// edit branch
// #region

async function brnchEdit(str) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    clearBrnchControls();
    $('#brnch-modal').modal('toggle');
    createSpinner('modalbody');
    $('#key').val("");
    $('#msrtName').text("Edit");

    var obj = {
        'BranchId': $(str).attr('id') == "" ? null : parseInt($(str).attr('id')),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetBranchById');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    $('#txtbrName').val(data[0].BranchName);
    $('#txtbrCode').val(data[0].BranchCode);
    $('#txtbraddress').val(data[0].Address);
    $('#txtbrphone').val(data[0].PhoneNumber);
    $('#txtbremail').val(data[0].EmailID);
    $('#key').val(data[0].ID);

    removeSpinner();
}

// #endregion

// save Branch
// #region

async function saveBranch(e) {

    if (!$('.needs-validation')[0].checkValidity()) {

        return;
    }

    e.preventDefault();
    $(".needs-validation").removeClass('was-validated');

    setButtonLoader('btnSaveBrnch', 'Saving...')

    var obj = {
        'ID': $('#key').val() == "" ? 0 : parseInt($('#key').val()),
        'BranchName': $('#txtbrName').val().trim(),
        'BranchCode': $('#txtbrCode').val().trim(),
        'Address': $('#txtbraddress').val().trim(),
        'PhoneNumber': $('#txtbrphone').val().trim(),
        'EmailID': $('#txtbremail').val().trim(),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'SaveBranch');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Branch', 'brnch-modal');

    if (result.statusCode == 201 || result.statusCode == 200) {

        fillBranch();
    }

    removeButtonLoader('btnSaveBrnch', 'Save');
}

// #endregion
