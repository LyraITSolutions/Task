

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
    $('#nav-link-loc').addClass('active');

    await fillLocation();

    await fillState();

});
function clearLocationControls() {

    $("#modalbody").find("input[type=text]").val("");
    $('#txtlocname').on('focusin', handler);
    $('#cmbstate').val('');
    $('#cmbdistrict').val('');
}
function handler(event) {
}
async function createNewLocation() {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    $('#loc-modal').modal('toggle');
    clearLocationControls();
    $('#msrtName').text("Add new");
    $('#key').val("");
}
// #endregion

// variables for pagination
// #region 


var options = {
    valueNames: ['Name','State','District'], page: 10,
    pagination: true
};
var nextPageValue = 1;
var totalItems = 0;
var hackerList;


// #endregion

// fill location
// #region

async function fillLocation() {

    $('.search ').val('');

    var obj = {
        'Status': null,
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'BindLocation');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    if (data.length <= 0) {

        var $tr = $('<tr />').appendTo('#loc-tables-body');
        $('<td colspan="5" style="text-align: center;"/>').text("No data available").appendTo($tr);
        return;
    }

    var html = '';
    $('#loc-tables-body').empty();

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        html += '<tr>';
        html += '<td class="Name py-2">' + item.LocationName + '</td>';
        html += '<td class="State py-2 px-0">' + item.District + '</td>';
        html += '<td class="District py-2 px-0">' + item.StateName + '</td>';
        html += '<td  class="Status py-2 px-0" >';
        html += '<div class="form-check form-switch">';
        if (item.Status == true) {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateLocationStatus(this)"  checked id="togBtn"  class="form-check-input"/>';
        }
        else {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateLocationStatus(this)"  id="togBtn" class="form-check-input" />';
        }
        html += '</div>';
        html += '<td id="' + item.ID + '" class="text-end py-2 pe-5" onclick="locationEdit(this)">';
        html += '<div>';
        html += '<button class="btn p-0" type="button"  data-bs-placement="top" title="Edit" data-bs-toggle="modal" data-bs-target="#loc-modal" >';
        html += '<span class="text-500 fas fa-edit" /></span></button></div></td>';

    }

    $('#loc-tables-body').append(html);

    initializeHackerList('locTable');

}
// #endregion

// update location
// #region

async function updateLocationStatus(cb) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation');
        return;
    }

    var obj = {
        'Id': cb.value == "" ? 0 : parseInt(cb.value),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'ChangeLocationStatus');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Location', '');
}

// #endregion

// edit location
// #region

async function locationEdit(str) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation');
        return;
    }

    clearLocationControls();
    $('#loc-modal').modal('toggle');
    createSpinner('modalbody');
    $('#key').val("");
    $('#msrtName').text("Edit");

    var obj = {
        'Id': $(str).attr('id') == "" ? null : parseInt($(str).attr('id')),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetLocationById');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    $('#txtlocname').val(data[0].Name);
    $('#cmbstate').val(data[0].StateID);
    await fillDistrict();
    $('#cmbdistrict').val(data[0].DistrictID);
    $('#key').val(data[0].ID);

    removeSpinner();
}

// #endregion

// save location
// #region

async function saveLocation(e) {

    if (!$('.needs-validation')[0].checkValidity()) {

        return;
    }

    e.preventDefault();

    $(".needs-validation").removeClass('was-validated');   

    setButtonLoader('btnSaveLocation', 'Saving...');

    var obj = {
        'ID': $('#key').val() == "" ? 0 : parseInt($('#key').val()),
        'Name': $('#txtlocname').val().trim(),
        'DistrictID': parseInt($('#cmbdistrict').val()),       
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'SaveLocation');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Location', 'loc-modal');

    if (result.statusCode == 201 || result.statusCode == 200) {

        fillLocation();
    }

    removeButtonLoader('btnSaveLocation', 'Save');
}

// #endregion

// fill state, district
// #region

async function fillState() {

    var obj = {        
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'BindState');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbstate');
    }
}

async function fillDistrict() {

    $('#cmbdistrict option:not(:first)').remove();

    if ($('#cmbstate').val() == '') {

        return;
    }

    var obj = {
        'StateID': parseInt($('#cmbstate').val()),
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'BindDistrictByStateID');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbdistrict');
    }
}


function fillselect(data, selectElement) {

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        $('#' + selectElement).append($("<option></option>").attr("value", item.ID).text(item.Name));
    }
}
// #endregion