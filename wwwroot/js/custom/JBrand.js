
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
    $('#nav-link-brand').addClass('active');

    await fillBrand();

});
function clearBrandControls() {

    $("#modalbody").find("input[type=text]").val("");
    $('#txtbrnd').on('focusin', handler);
}
function handler(event) {
}
async function createNewBrand() {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    $('#brnd-modal').modal('toggle');
    clearBrandControls();
    $('#msrtName').text("Add new");
    $('#key').val("");
}
// #endregion

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

// fill brand by company
// #region

async function fillBrand() {

    $('.search ').val('');

    var obj = {
        'Status': null,
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'BindBrand');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    if (data.length <= 0) {

        var $tr = $('<tr />').appendTo('#brnd-tables-body');
        $('<td colspan="3" style="text-align: center;"/>').text("No data available").appendTo($tr);
        return;
    }

    var html = '';
    $('#brnd-tables-body').empty();

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        html += '<tr>';
        html += '<td class="Name py-2">' + item.Name + '</td>';
        html += '<td  class="Status py-2" >';
        html += '<div class="form-check form-switch">';
        if (item.Status == true) {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateBrandStatus(this)"  checked id="togBtn"  class="form-check-input"/>';
        }
        else {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateBrandStatus(this)"  id="togBtn" class="form-check-input" />';
        }
        html += '</div>';
        html += '<td id="' + item.ID + '" class="text-end py-2 pe-5" onclick="brndEdit(this)">';
        html += '<div>';
        html += '<button class="btn p-0" type="button"  data-bs-placement="top" title="Edit" data-bs-toggle="modal" data-bs-target="#brnd-modal" >';
        html += '<span class="text-500 fas fa-edit" /></span></button></div></td>';

    }

    $('#brnd-tables-body').append(html);

    initializeHackerList('brndTable');

}
// #endregion

// update brand status
// #region

async function updateBrandStatus(cb) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation');
        return;
    }

    var obj = {
        'Id': cb.value == "" ? 0 : parseInt(cb.value),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'ChangeBrandStatus');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Brand', '');
}

// #endregion

// edit brand
// #region

async function brndEdit(str) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation');
        return;
    }

    clearBrandControls();
    $('#brnd-modal').modal('toggle');
    createSpinner('modalbody');
    $('#key').val("");
    $('#msrtName').text("Edit");

    var obj = {
        'Id': $(str).attr('id') == "" ? null : parseInt($(str).attr('id')),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetBrandById');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    $('#txtbrnd').val(data[0].Name);
    $('#key').val(data[0].ID);

    removeSpinner();
}

// #endregion

// save product type
// #region

async function saveBrand(e) {

    if (!$('.needs-validation')[0].checkValidity()) {

        return;
    }

    e.preventDefault();
    $(".needs-validation").removeClass('was-validated');

    if ($('#txtbrnd').val().trim() == "") {

        showAlertDismissible('Update', 'Brand name is required.', 'alert-subtle-warning');
        return;
    }

    setButtonLoader('btnSaveBrand', 'Saving...');

    var obj = {
        'ID': $('#key').val() == "" ? 0 : parseInt($('#key').val()),
        'Name': $('#txtbrnd').val().trim(),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'SaveBrand');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Brand', 'brnd-modal');

    if (result.statusCode == 201 || result.statusCode == 200) {

        fillBrand();
    }

    removeButtonLoader('btnSaveBrand', 'Save');
}

// #endregion