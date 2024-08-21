
let editedUserId = 0;
let currentTab = 0;

// variables for pagination
// #region 


var options = {
    valueNames: ['Staff', 'Mobile', 'Department', 'Designation'], page: 10,
    pagination: true
};

var nextPageValue = 1;
var totalItems = 0;
var hackerList;


// #endregion

// ready functions
// #region
function refreshPage() {
    location.reload();
}
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
    $('#nav-link-users').addClass('active');

    let localValue = JSON.parse(localStorage.getItem('LgnVls'));
    $('.lgnstaffname').text(localValue[0].Name);

    await fillUser();

    await fillSelections();

    $('.search').on('keyup', function () {
        nextPageValue = 1;
        $('.paginationDetails').empty();
        if ($('.search').val() != "") {

            hackerList.search($('.search').val(), ['Staff', 'Mobile', 'Department', 'BranchName']);
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
async function createNewUser() {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    $('#userlist_tab').addClass('d-none');
    $('#addUser-Tab').removeClass('d-none');

    clearUserControls();
}
function clearUserControls() {

    editedUserId = 0;
    currentTab = 0;
    $('#txtname').val('');
    $('#txtemail').val('');
    $('#cmbcountry').val('');
    $('#txtwhatsAppNo').val('');
    $('#txtusername').val('');
    $('#txtpassword').val('');
    $('#txtcnfrmpswrd').val('');
    document.getElementById('chkaccpttrms').checked = false;

    $('#cmbbranch').val('');
    $('#cmbdepartment').val('');
    $('#cmbdesignation').val('');
    $('#txtsaveConfirm').val('');

    document.getElementById('radadmin').checked = false;
    document.getElementById('radeditor').checked = false;
    document.getElementById('radviewer').checked = true;
}
// #endregion

// fill user 
// #region

async function fillUser() {

    $('.search ').val('');
    createSpinner('tableUser');

    var obj = {
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetStaffByCompanyId');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    if (data.length <= 0) {

        var $tr = $('<tr />').appendTo('#users-tables-body');
        $('<td colspan="3" style="text-align: center;"/>').text("No data available").appendTo($tr);
        return;
    }

    var html = '';
    $('#users-tables-body').empty();

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        html += '<tr>';
        html += '<td class="Staff">' + item.Staff + '</td>';
        html += '<td class="Mobile px-0">' + item.Mobile + '</td>';
        html += '<td class="Department px-0">' + item.Department + '</td>';
        html += '<td class="BranchName px-0">' + item.Designation + '</td>';
        html += '<td  class="Status text-center" >';
        html += '<div class="form-check form-switch">';
        if (item.Status == true) {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateUserStatus(this)"  checked id="togBtn"  class="form-check-input"/>';
        }
        else {
            html += '<input value="' + item.ID + '" type="checkbox" onchange="updateUserStatus(this)"  id="togBtn" class="form-check-input" />';
        }
        html += '</div>';
        html += '<td id="' + item.ID + '" class="text-end pe-5" onclick="userEdit(this)">';
        html += '<div>';
        html += '<button class="btn p-0" type="button"  data-bs-placement="top" title="Edit" >';
        html += '<span class="text-500 fas fa-edit" /></span></button></div></td>';

    }

    $('#users-tables-body').append(html);

    initializeHackerList('tableUser');

    removeSpinner();
}
// #endregion

// fill department, designation and branch
// #region

async function fillSelections() {

    var obj = {
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'BindCountry');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbcountry');
    }

    result = await callPostApi(obj, 'BindBranchByCompanyID');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbbranch');
    }

    result = await callPostApi(obj, 'BindDepartmentByCompanyID');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbdepartment');
    }

    result = await callPostApi(obj, 'BindDesignationByCompanyID');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbdesignation');
    }
}

function fillselect(data, selectElement) {

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        $('#' + selectElement).append($("<option></option>").attr("value", item.ID).text(item.Name));
    }
}

// #endregion

// submit User
// #region
function previousTab() {

    currentTab = 0;

}
function submitForm(event) {

    event.preventDefault();

    setTimeout(function () {

        let secontab = document.getElementById('bootstrap-wizard-validation-tab2');
        // Check if the element exists first
        if (secontab) {
            // Check if the element has the class 'active'
            if (secontab.classList.contains('active')) {
                $('#bootstrap-wizard-validation-tab1').removeClass('active');
                return;
            }
        }

        if (currentTab == 1) {

            if ($('#txtsaveConfirm').val() == '') {

                saveUser();
            }
            return;
        }

        const tabContent = document.querySelector('#personal-nav-item');

        if (tabContent.classList.contains('done')) {

            currentTab = 1;
        }
    }, 100);
}
async function saveUser() {

    setButtonLoader('next-btn-form', 'Saving...');

    var userPermission = '';

    if (document.getElementById('radadmin').checked) {

        userPermission = 'A';
    }
    else if (document.getElementById('radeditor').checked) {

        userPermission = 'E';
    }
    else if (document.getElementById('radviewer').checked) {

        userPermission = 'V';
    }

    var obj = {
        'ID': editedUserId,
        'Name': $('#txtname').val(),
        'DepartmentID': parseInt($('#cmbdepartment').val()),
        'Mobile': $('#txtwhatsAppNo').val(),
        'EmailID': $('#txtemail').val(),
        'DesignationID': parseInt($('#cmbdesignation').val()),
        'BranchID': parseInt($('#cmbbranch').val()),
        'UserName': $('#txtusername').val(),
        'Password': $('#txtpassword').val(),
        'UserPermission': userPermission,
        'CountryID': parseInt($('#cmbcountry').val()),
        'Address': $('#txtaddress').val(),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'SaveStaff');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'User', '');
    removeButtonLoader('next-btn-form', 'Next');

    if (result.statusCode == 201 || result.statusCode == 200) {

        console.log('saved');

        $('#txtsaveConfirm').val('Ok');
        let button = document.getElementById('next-btn-form');
        button.click();
    }
}

// #endregion

// update user status
// #region

async function updateUserStatus(cb) {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    var obj = {
        'StaffId': cb.value == "" ? 0 : parseInt(cb.value),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'ChangeStaffStatus');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'User', '');
}

// #endregion

// edit user
// #region

async function userEdit(str) {

    createNewUser();

    var obj = {
        'StaffId': $(str).attr('id') == "" ? null : parseInt($(str).attr('id')),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'GetStaffById');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    if (data.length <= 0) { return; }

    editedUserId = parseInt(data[0].ID);

    $('#txtname').val(data[0].Name);
    $('#txtemail').val(data[0].EmailID);
    $('#cmbcountry').val(data[0].CountryID);
    $('#txtwhatsAppNo').val(data[0].Mobile);
    $('#txtusername').val(data[0].UserName);
    $('#txtpassword').val(data[0].Password);
    $('#txtcnfrmpswrd').val(data[0].Password);
    document.getElementById('chkaccpttrms').checked = true;

    $('#cmbbranch').val(parseInt(data[0].BranchID));
    $('#cmbdepartment').val(parseInt(data[0].DepartmentID));
    $('#cmbdesignation').val(parseInt(data[0].DesignationID));
    $('#txtaddress').val(data[0].Address);
    switch (data[0].UserPermission) {

        case 'A':
            document.getElementById('radadmin').checked = true;
            break;
        case 'V':
            document.getElementById('radviewer').checked = true;
            break;
        case 'E':
            document.getElementById('radeditor').checked = true;
            break;
    }
}

// #endregion


