
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
    $('#nav-link-dept').addClass('active');   

    await fillDepartment();

});
function clearDeptControls() {

    $("#modalbody").find("input[type=text]").val("");   
    $('#txtdept').on('focusin', handler);
}
function handler(event) {   
}
async function createNewDept() {

    let userType = await checkUserPermission();

    if (userType == 'V') {
        
        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    $('#dept-modal').modal('toggle');
    clearDeptControls();
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

// fill department by company
// #region

async function fillDepartment() {

    $('.search ').val('');  

    var obj = {
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetDepartmentByCompanyId');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    if (data.length <= 0) {

        var $tr = $('<tr />').appendTo('#dept-tables-body');
        $('<td colspan="3" style="text-align: center;"/>').text("No data available").appendTo($tr);
        return;
    }

    var html = '';
    $('#dept-tables-body').empty();

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        html += '<tr>';
        html += '<td class="Name py-2">' + item.Name + '</td>';
        html += '<td  class="Status py-2" >';
        html += '<div class="form-check form-switch">';
        if (item.Status == true) {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateDeptStatus(this)"  checked id="togBtn"  class="form-check-input"/>';
        }
        else {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateDeptStatus(this)"  id="togBtn" class="form-check-input" />';
        }
        html += '</div>';
        html += '<td id="' + item.ID + '" class="text-end py-2 pe-5" onclick="deptEdit(this)">';
        html += '<div>';
        html += '<button class="btn p-0" type="button"  data-bs-placement="top" title="Edit" data-bs-toggle="modal" data-bs-target="#dept-modal" >';
        html += '<span class="text-500 fas fa-edit" /></span></button></div></td>';

    }

    $('#dept-tables-body').append(html);

    initializeHackerList('deptTable');
   
}
// #endregion

// update department status
// #region

async function updateDeptStatus(cb) {

    let userType = await checkUserPermission();

    if (userType == 'V') {
        
        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation');
        return;
    }

    var obj = {
        'DepartmentId': cb.value == "" ? 0 : parseInt(cb.value),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'ChangeDepartmentStatus');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Department', '');
}

// #endregion

// edit department
// #region

async function deptEdit(str) {

    let userType = await checkUserPermission();

    if (userType == 'V') {
        
        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation');
        return;
    }

    clearDeptControls();
    $('#dept-modal').modal('toggle');
    createSpinner('modalbody');
    $('#key').val("");
    $('#msrtName').text("Edit");

    var obj = {
        'DepartmentId': $(str).attr('id') == "" ? null : parseInt($(str).attr('id')),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetDepartmentById');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    $('#txtdept').val(data[0].Name);
    $('#key').val(data[0].ID);

    removeSpinner();
}

// #endregion

// save Department
// #region

async function saveDepartment(e) {

    if (!$('.needs-validation')[0].checkValidity()) {

        return;
    }

    e.preventDefault();
    $(".needs-validation").removeClass('was-validated');

    if ($('#txtdept').val().trim() == "") {
        
        showAlertDismissible('Update','Department name is required.', 'alert-subtle-warning');
        return;
    }

    setButtonLoader('btnSaveDept', 'Saving...');

    var obj = {
        'ID': $('#key').val() == "" ? 0 : parseInt($('#key').val()),
        'Name': $('#txtdept').val().trim(),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'SaveDepartment');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Department', 'dept-modal');

    if (result.statusCode == 201 || result.statusCode == 200) {

        fillDepartment();
    }

    removeButtonLoader('btnSaveDept', 'Save');
}

// #endregion