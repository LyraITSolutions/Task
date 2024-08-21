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
    $('#nav-link-newquote').addClass('active');

    let localValue = JSON.parse(localStorage.getItem('LgnVls'));
    $('.lgnstaffname').text(localValue[0].Name);

    setDate();

    await fillQuotation();

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



function setDate() {

    var now = new Date();

    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);

    var shortYear = now.getFullYear();

    var twoDigitYear = shortYear.toString().substr(-2);

    var today = (day) + "-" + (month) + "-" + twoDigitYear;

    $('#quotedate').val(today);

}
// #endregion

// fill lead details
// #region

async function fillQuotation() {

    var selectedFromdate = getSelectedDate(1, $('#quotedate').val());
    var selectedTodate = getSelectedDate(2, $('#quotedate').val());

var obj = {
    'Fromdate': selectedFromdate,
    'ToDate': selectedTodate,
    'Token': getToken()
};

var result = await callPostApi(obj, 'GetQuotations');

if (result == null) { return; }
if (result.statusCode != 200) { return; }

var data = JSON.parse(result.items);

    $('#quote-tables-body').empty();

if (data.length <= 0) {

    var $tr = $('<tr />').appendTo('#quote-tables-body');
    $('<td colspan="7" style="text-align: center;"/>').text("No data available").appendTo($tr);
    return;
}



var totalcases = 0;
    let quotationWorker = new Worker('/js/worker/JQuotationWorker.js');

    quotationWorker.postMessage(data);

    quotationWorker.onmessage = await function (retArray) {

    $(retArray.data.row).appendTo('#quote-tables-body');

    totalcases += 1;

    if (totalcases == data.length) {

        initializeHackerList('quoteTable');
    }

}


}

// #endregion


// generate Change Quote Status
// #region
async function ChangeQuoteStatus(qid,status) {

  

    var obj = {
     
        'Id': parseInt(qid),
        'Status':"AP",
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'ChangeQuotationStatus');

    if (result == null) { return; }
    console.log(result);
    showToastByStatusCode(result.statusCode, 'Quotation', '');

    if (result.statusCode == 202) {

        fillQuotation();
    }
}
// #endregion