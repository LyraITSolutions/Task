

// variables for pagination
// #region 


var options = {
    valueNames: ['Name'], page: 10,
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
    $('#nav-link-dsgn').addClass('active');

    await fillDesignation();

    $('.search').on('keyup', function () {
        nextPageValue = 1;
        $('.paginationDetails').empty();
        if ($('.search').val() != "") {

            hackerList.search($('.search').val(), ['Name']);
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
function clearDsgnControls() {

    $("#modalbody").find("input[type=text]").val("");    
    $('#txtdsgn').on('focusin', handler);
}
function handler(event) {
}
async function createNewDsgn() {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    $('#dsgn-modal').modal('toggle');
    clearDsgnControls();
    $('#msrtName').text("Add new");
    $('#key').val("");
}
// #endregion

// fill designation by company
// #region

async function fillDesignation() {

    $('.search ').val('');
    createSpinner('tableDsgn');

    var obj = {
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetDesignationByCompanyId');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    if (data.length <= 0) {

        var $tr = $('<tr />').appendTo('#dsgntn-tables-body');
        $('<td colspan="3" style="text-align: center;"/>').text("No data available").appendTo($tr);
        return;
    }

    var html = '';
    $('#dsgntn-tables-body').empty();
    for (var i = 0; i < data.length; i++) {

        var item = data[i];
        html += '<tr>';
        html += '<td class="Name">' + item.Name + '</td>';
        html += '<td  class="Status" >';
        html += '<div class="form-check form-switch">';
        if (item.Status == true) {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateDsgnStatus(this)"  checked id="togBtn"  class="form-check-input"/>';
        }
        else {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateDsgnStatus(this)"  id="togBtn" class="form-check-input" />';
        }
        html += '</div>';
        html += '<td id="' + item.ID + '" class="text-end pe-5" onclick="dsgnEdit(this)">';
        html += '<div>';
        html += '<button class="btn p-0" type="button"  data-bs-placement="top" title="Edit" data-bs-toggle="modal" data-bs-target="#dsgn-modal" >';
        html += '<span class="text-500 fas fa-edit" /></span></button></div></td>';
    }

    $('#dsgntn-tables-body').append(html);

    initializeHackerList('tableDsgn');

    removeSpinner();
}

// #endregion

// update designation status
// #region

async function updateDsgnStatus(cb) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    var obj = {
        'DesignationId': cb.value == "" ? 0 : parseInt(cb.value),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'ChangeDesignationStatus');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Designation');
}

// #endregion

// edit department
// #region

async function dsgnEdit(str) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    clearDsgnControls();
    $('#dsgn-modal').modal('toggle');
    createSpinner('modalbody');
    $('#key').val("");
    $('#msrtName').text("Edit");

    var obj = {
        'DesignationId': $(str).attr('id') == "" ? null : parseInt($(str).attr('id')),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetDesignationById');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    $('#txtdsgn').val(data[0].Name);
    $('#key').val(data[0].ID);

    removeSpinner();
}

// #endregion

// save Department
// #region

async function saveDesignation(e) {

    if (!$('.needs-validation')[0].checkValidity()) {

        return;
    }

    e.preventDefault();

    $(".needs-validation").removeClass('was-validated');

    if ($('#txtdsgn').val().trim() == "") {
       
        showAlertDismissible('Update', 'Designation name is required.', 'alert-subtle-warning');
        return;
    }

    setButtonLoader('btnSaveDsgn', 'Saving...')

    var obj = {
        'ID': $('#key').val() == "" ? 0 : parseInt($('#key').val()),
        'Name': $('#txtdsgn').val().trim(),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'SaveDesignation');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Designation', 'dsgn-modal');

    if (result.statusCode == 201 || result.statusCode == 200) {

        fillDesignation();
    }

    removeButtonLoader('btnSaveDsgn', 'Save');
}

// #endregion