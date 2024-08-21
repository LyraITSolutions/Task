
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
    $('#nav-link-prdt').addClass('active');

    await fillSelections();

    await fillProduct();

});
function clearProductControls() {

    $("#modalbody").find("input[type=text]").val("");   
    $('#cmbtype').val('');
    $('#cmbcategory').val('');
    $('#cmbbrand').val('');
    $('#cmbuom').val('');
    $('#txtprdt').on('focusin', handler);
}
function handler(event) {
}
async function createNewProduct() {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    $('#prdt-modal').modal('toggle');
    clearProductControls();
    $('#msrtName').text("Add new");
    $('#key').val("");
}
// #endregion

// variables for pagination
// #region 


var options = {
    valueNames: ['Name','Code','Category','Type','Brand'], page: 10,
    pagination: true
};
var nextPageValue = 1;
var totalItems = 0;
var hackerList;


// #endregion

// fill product by company
// #region

async function fillProduct() {

    $('.search ').val('');

    var obj = {
        'Status': null,
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'BindProduct');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    if (data.length <= 0) {

        var $tr = $('<tr />').appendTo('#prdt-tables-body');
        $('<td colspan="6" style="text-align: center;"/>').text("No data available").appendTo($tr);
        return;
    }

    var html = '';
    $('#prdt-tables-body').empty();

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        html += '<tr>';
        html += '<td class="Name py-2">' + item.Name + '</td>';
        html += '<td class="Brand py-2 px-0">' + item.BrandName + '</td>';
        html += '<td class="Type py-2 px-0">' + item.TypeName + '</td>';
        html += '<td class="Category py-2 px-0">' + item.Category + '</td>';
        html += '<td  class="Status py-2 px-0" >';
        html += '<div class="form-check form-switch">';
        if (item.Status == true) {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateProductStatus(this)"  checked id="togBtn"  class="form-check-input"/>';
        }
        else {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateProductStatus(this)"  id="togBtn" class="form-check-input" />';
        }
        html += '</div>';
        html += '<td id="' + item.ID + '" class="text-end py-2 pe-5" onclick="prdtEdit(this)">';
        html += '<div>';
        html += '<button class="btn p-0" type="button"  data-bs-placement="top" title="Edit" data-bs-toggle="modal" data-bs-target="#prdt-modal" >';
        html += '<span class="text-500 fas fa-edit" /></span></button></div></td>';

    }

    $('#prdt-tables-body').append(html);

    initializeHackerList('prdtTable');

}
// #endregion

// update product status
// #region

async function updateProductStatus(cb) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation');
        return;
    }

    var obj = {
        'Id': cb.value == "" ? 0 : parseInt(cb.value),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'ChangeProductStatus');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Product', '');
}

// #endregion

// edit brand
// #region

async function prdtEdit(str) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation');
        return;
    }

    clearProductControls();
    $('#prdt-modal').modal('toggle');
    createSpinner('modalbody');
    $('#key').val("");
    $('#msrtName').text("Edit");

    var obj = {
        'Id': $(str).attr('id') == "" ? null : parseInt($(str).attr('id')),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetProductById');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    $('#txtprdt').val(data[0].Name);
    $('#txtcode').val(data[0].Code);
    $('#cmbtype').val(data[0].ProductTypeID);
    $('#cmbcategory').val(data[0].ProductCategoryID);
    $('#cmbbrand').val(data[0].BrandID);
    $('#cmbuom').val(data[0].UOMID);
    $('#key').val(data[0].ID);

    removeSpinner();
}

// #endregion

// save product
// #region

async function saveProduct(e) {

    if (!$('.needs-validation')[0].checkValidity()) {

        return;
    }

    e.preventDefault();

    $(".needs-validation").removeClass('was-validated');   

    setButtonLoader('btnSaveProduct', 'Saving...');

    var obj = {
        'ID': $('#key').val() == "" ? 0 : parseInt($('#key').val()),
        'Name': $('#txtprdt').val().trim(),
        'Code': $('#txtcode').val().trim(),
        'ProductTypeID': parseInt($('#cmbtype').val()),
        'ProductCategoryID': parseInt($('#cmbcategory').val()),
        'UOMID': parseInt($('#cmbuom').val()),
        'BrandID': parseInt($('#cmbbrand').val()),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'SaveProduct');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Product', 'prdt-modal');

    if (result.statusCode == 201 || result.statusCode == 200) {

        fillProduct();
    }

    removeButtonLoader('btnSaveProduct', 'Save');
}

// #endregion

// fill active type, category, uom, brand
//#region
async function fillSelections() {

    var obj = {
        'Status': true,
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'BindProductType');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbtype');
    }

    result = await callPostApi(obj, 'BindProductCategory');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbcategory');
    }

    result = await callPostApi(obj, 'BindBrand');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbbrand');
    }

    result = await callPostApi(obj, 'BindUOM');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbuom');
    }
}

function fillselect(data, selectElement) {

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        $('#' + selectElement).append($("<option></option>").attr("value", item.ID).text(item.Name));
    }
}

// #endregion