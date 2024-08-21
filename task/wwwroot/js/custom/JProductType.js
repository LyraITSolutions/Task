
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
    $('#nav-link-prdttype').addClass('active');

    await fillProductType();

});
function clearPrdtTypeControls() {

    $("#modalbody").find("input[type=text]").val("");
    $('#txtprdttype').on('focusin', handler);
    var toggleButton = document.getElementById('tgl-show-qoute');
    toggleButton.checked = false;
}
function handler(event) {
}
async function createNewPrdtType() {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    $('#prdttype-modal').modal('toggle');
    clearPrdtTypeControls();
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

// fill type by company
// #region

async function fillProductType() {

    $('.search ').val('');

    var obj = {
        'Status': null,
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'BindProductType');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    if (data.length <= 0) {

        var $tr = $('<tr />').appendTo('#prdttype-tables-body');
        $('<td colspan="3" style="text-align: center;"/>').text("No data available").appendTo($tr);
        return;
    }

    var html = '';
    $('#prdttype-tables-body').empty();

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        html += '<tr>';
        html += '<td class="Name py-2">' + item.Name + '</td>';
        html += '<td  class="Status py-2" >';
        html += '<div class="form-check form-switch">';
        if (item.Status == true) {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updatePrdtTypeStatus(this)"  checked id="togBtn"  class="form-check-input"/>';
        }
        else {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updatePrdtTypeStatus(this)"  id="togBtn" class="form-check-input" />';
        }
        html += '</div>';
        html += '<td id="' + item.ID + '" class="text-end py-2 pe-5" onclick="prdtTypeEdit(this)">';
        html += '<div>';
        html += '<button class="btn p-0" type="button"  data-bs-placement="top" title="Edit" data-bs-toggle="modal" data-bs-target="#prdttype-modal" >';
        html += '<span class="text-500 fas fa-edit" /></span></button></div></td>';

    }

    $('#prdttype-tables-body').append(html);

    initializeHackerList('prdtTypeTable');

}
// #endregion

// update product type status
// #region

async function updatePrdtTypeStatus(cb) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation');
        return;
    }

    var obj = {
        'Id': cb.value == "" ? 0 : parseInt(cb.value),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'ChangeProductTypeStatus');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Product Type', '');
}

// #endregion

// edit product type
// #region

async function prdtTypeEdit(str) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation');
        return;
    }

    clearPrdtTypeControls();
    $('#prdttype-modal').modal('toggle');
    createSpinner('modalbody');
    $('#key').val("");
    $('#msrtName').text("Edit");

    var obj = {
        'Id': $(str).attr('id') == "" ? null : parseInt($(str).attr('id')),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetProductTypeById');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    $('#txtprdttype').val(data[0].Name);
    var toggleButton = document.getElementById('tgl-show-qoute');
    toggleButton.checked = data[0].ShowInquote;
    $('#key').val(data[0].ID);

    removeSpinner();
}

// #endregion

// save product type
// #region

async function saveProductType(e) {

    if (!$('.needs-validation')[0].checkValidity()) {

        return;
    }

    e.preventDefault();

    $(".needs-validation").removeClass('was-validated');

    if ($('#txtprdttype').val().trim() == "") {

        showAlertDismissible('Update', 'Product type name is required.', 'alert-subtle-warning');
        return;
    }
    var toggleButton = document.getElementById('tgl-show-qoute');

    setButtonLoader('btnSavePrdtType', 'Saving...');

    var obj = {
        'ID': $('#key').val() == "" ? 0 : parseInt($('#key').val()),
        'Name': $('#txtprdttype').val().trim(),
        'ShowInquote': toggleButton.checked,
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'SaveProductType');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Product Type', 'prdttype-modal');

    if (result.statusCode == 201 || result.statusCode == 200) {

        fillProductType();
    }

    removeButtonLoader('btnSavePrdtType', 'Save');
}

// #endregion