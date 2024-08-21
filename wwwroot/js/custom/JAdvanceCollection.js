// variables for pagination
// #region 


var options = {
    valueNames: ['Customer', 'Mobile', 'Source'], page: 10,
    pagination: true
};

var nextPageValue = 1;
var totalItems = 0;
var hackerList;


// #endregion

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
    $('#nav-link-accounts').addClass('active');

    let localValue = JSON.parse(localStorage.getItem('LgnVls'));
    $('.lgnstaffname').text(localValue[0].Name);

    await fillAccountsCollection();

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


// #endregion

// fill lead details
// #region

async function fillAccountsCollection() {



var obj = {
    
    'Token': getToken()
};

    var result = await callPostApi(obj, 'GetApprovedQuotations');

if (result == null) { return; }
if (result.statusCode != 200) { return; }

var data = JSON.parse(result.items);

    $('#account-tables-body').empty();

if (data.length <= 0) {

    var $tr = $('<tr />').appendTo('#account-tables-body');
    $('<td colspan="7" style="text-align: center;"/>').text("No data available").appendTo($tr);
    return;
}



var totalcases = 0;
    let quotationWorker = new Worker('/js/worker/JAccountCollectionWorker.js');

    quotationWorker.postMessage(data);

    quotationWorker.onmessage = await function (retArray) {

        $(retArray.data.row).appendTo('#account-tables-body');

    totalcases += 1;

    if (totalcases == data.length) {

        initializeHackerList('accountsTable');
    }

}


}

// #endregion

// add account details
// #region
async function AddAccountDetails(quoteid, customer) {

    clearAccountControls();

    $('#msrtName').text(customer);
    $('#QuoteID').val(quoteid);  
    $('#adamount').val("25,000");  
    
    $('#advance-modal').modal('toggle');
}
function clearAccountControls() {

    $("#modalbody").find("input[type=text]").val("");
    $("#modalbody").find("input[type=number]").val("");
    
    $('#QuoteID').val('');
    removeButtonLoader('btnSaveAdvance', 'Save');

    var form = $('form.needs-validation');
    form.removeClass('was-validated');
    form[0].reset(); // Reset the form fields
}
async function AddAdvanceDetails(e) {

    if (!$('.needs-validation')[0].checkValidity()) {

        return;
    }

    e.preventDefault();

    $(".needs-validation").removeClass('was-validated');

    setButtonLoader('btnSaveAdvance', 'Saving...');

    var obj = {

        'PaymentMode': $("input[name='paymentMode']:checked").val(),
        'ImagePath': "",
        'Amount': parseFloat($('#adamount').val()),
        'Remark': $('#rmk').val().trim(),
        'QuoteId': parseInt($('#QuoteID').val()),     
        'Token': getToken()
    };
    
    const result = await callPostApi(obj, 'AddAdvanceDetails');

    if (result == null) { return; }
   
    showToastByStatusCode(result.statusCode, 'Accounts', '');
    if (result.statusCode == 201) {


        $('#advance-modal').modal('toggle');
    }

  
}
// #endregion
