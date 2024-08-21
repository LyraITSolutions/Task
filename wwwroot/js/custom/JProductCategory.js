
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
    $('#nav-link-prdtcategory').addClass('active');

    await fillProductCategory();

});
function clearPrdtCategoryControls() {

    $("#modalbody").find("input[type=text]").val("");
    $('#txtprdtcategory').on('focusin', handler);
}
function handler(event) {
}
async function createNewPrdtCategory() {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    $('#prdtcategory-modal').modal('toggle');
    clearPrdtCategoryControls();
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

// fill product category
// #region

async function fillProductCategory() {

    $('.search ').val('');

    var obj = {
        'Status': null,
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'BindProductCategory');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    if (data.length <= 0) {

        var $tr = $('<tr />').appendTo('#prdtcategory-tables-body');
        $('<td colspan="3" style="text-align: center;"/>').text("No data available").appendTo($tr);
        return;
    }

    var html = '';
    $('#prdtcategory-tables-body').empty();

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        html += '<tr>';
        html += '<td class="Name py-2">' + item.Name + '</td>';
        html += '<td  class="Status py-2" >';
        html += '<div class="form-check form-switch">';
        if (item.Status == true) {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updatePrdtCategoryStatus(this)"  checked id="togBtn"  class="form-check-input"/>';
        }
        else {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updatePrdtCategoryStatus(this)"  id="togBtn" class="form-check-input" />';
        }
        html += '</div>';
        html += '<td id="' + item.ID + '" class="text-end py-2 pe-5" onclick="prdtCategoryEdit(this)">';
        html += '<div>';
        html += '<button class="btn p-0" type="button"  data-bs-placement="top" title="Edit" data-bs-toggle="modal" data-bs-target="#prdtcategory-modal" >';
        html += '<span class="text-500 fas fa-edit" /></span></button></div></td>';

    }

    $('#prdtcategory-tables-body').append(html);

    initializeHackerList('prdtTypeTable');

}
// #endregion

// update product category status
// #region

async function updatePrdtCategoryStatus(cb) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation');
        return;
    }

    var obj = {
        'Id': cb.value == "" ? 0 : parseInt(cb.value),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'ChangeProductCategoryStatus');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Product Category', '');
}

// #endregion

// edit product category
// #region

async function prdtCategoryEdit(str) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation');
        return;
    }

    clearPrdtCategoryControls();
    $('#prdtcategory-modal').modal('toggle');
    createSpinner('modalbody');
    $('#key').val("");
    $('#msrtName').text("Edit");

    var obj = {
        'Id': $(str).attr('id') == "" ? null : parseInt($(str).attr('id')),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetProductCategoryById');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    $('#txtprdtcategory').val(data[0].Name);
    $('#key').val(data[0].ID);

    removeSpinner();
}

// #endregion

// save product category
// #region

async function saveProductCategory(e) {

    if (!$('.needs-validation')[0].checkValidity()) {

        return;
    }

    e.preventDefault();
    $(".needs-validation").removeClass('was-validated');

    if ($('#txtprdtcategory').val().trim() == "") {

        showAlertDismissible('Update', 'Product type name is required.', 'alert-subtle-warning');
        return;
    }

    setButtonLoader('btnSavePrdtCategory', 'Saving...');

    var obj = {
        'ID': $('#key').val() == "" ? 0 : parseInt($('#key').val()),
        'Name': $('#txtprdtcategory').val().trim(),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'SaveProductCategory');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Product Category', 'prdtcategory-modal');

    if (result.statusCode == 201 || result.statusCode == 200) {

        fillProductCategory();
    }

    removeButtonLoader('btnSavePrdtCategory', 'Save');
}

// #endregion