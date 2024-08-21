
var quoteDetailsArray = [];

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
    $('#nav-link-newlead').addClass('active');

    let localValue = JSON.parse(localStorage.getItem('LgnVls'));
    $('.lgnstaffname').text(localValue[0].Name);

    setDate();

    await fillLeads();

    await fillDitrict();

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
async function createNewLead() {

    let userType = await checkUserPermission();

    if (userType == 'V') {

        showAlertDismissible('Update', 'Sorry, you do not have permission to perform this operation.', 'alert-subtle-warning');
        return;
    }

    clearLeadControls();
    $('#newlead-modal').modal('toggle');
}
function clearLeadControls() {

    $('#txtcust').val('');
    $('#txtemail').val('');
    $('#txtmobile').val('');
    $('#txtphone').val('');
    $('#txtpincode').val('');
    $('#txtksebno').val('');
    $('#txtaddress').val('');
    $('#cmbsource').val('');
    $('#cmbrooftype').val('');
    $('#cmbdistrict').val('');
    $('#cmbprojecttype').val('');
    $('#cmblocation').val('');
    $('#txtcapacity').val('');
    $('#txtsqarefeet').val('');
    $('#txtsqarefeet').val('');
    $('#txtremarks').val('');

}

function setDate() {

    var now = new Date();

    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);

    var shortYear = now.getFullYear();

    var twoDigitYear = shortYear.toString().substr(-2);

    var today = (day) + "-" + (month) + "-" + twoDigitYear;

    $('#leaddate').val(today);

}
// #endregion

// save lead
// #region

async function saveLead(e) {

    if (!$('.needs-validation')[0].checkValidity()) {

        return;
    }

    e.preventDefault();

    $(".needs-validation").removeClass('was-validated');

    setButtonLoader('btnSaveLead', 'Saving...');

    var obj = {
        'CustomerName': $('#txtcust').val().trim(),
        'Mobile': $('#txtmobile').val().trim(),
        'Address': $('#txtaddress').val().trim(),
        'Pincode': $('#txtpincode').val().trim(),
        'Phone': $('#txtphone').val().trim(),
        'ConsumerNo': $('#txtksebno').val().trim(),
        'Email': $('#txtemail').val().trim(),
        'LeadSource': $('#cmbsource').val(),
        'RoofType': $('#cmbrooftype').val(),
        'ProjectType': $('#cmbprojecttype').val(),
        'Capacity': parseInt($('#txtcapacity').val()),
        'LocationId': parseInt($('#cmblocation').val()),
        'Squarefeet': parseInt($('#txtsqarefeet').val()),
        'Remarks': $('#txtremarks').val().trim(),
        'Token': getToken()
    };

    const result = await callPostApi(obj, 'SaveLead');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Lead', 'newlead-modal');

    if (result.statusCode == 201 || result.statusCode == 200) {

        fillLeads();
    }

    removeButtonLoader('btnSaveLead', 'Save');
}

// #endregion

// fill district and location
// #region

async function fillDitrict() {

    var obj = {
        'StateID': parseInt(13),
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'BindDistrictByStateID');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbdistrict');
    }

}

async function fillLocationByDistrictID() {

    $('#cmblocation option:not(:first)').remove();

    if ($('#cmbdistrict').val() == '') {

        return;
    }

    var obj = {
        'Id': parseInt($('#cmbdistrict').val()),
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'BindLocationByDistrictID');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmblocation');
    }
}

function fillselect(data, selectElement) {

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        $('#' + selectElement).append($("<option></option>").attr("value", item.ID).text(item.Name));
    }
}

// #endregion

// fill lead details
// #region

async function fillLeads() {

    var selectedFromdate = getSelectedDate(1, $('#leaddate').val());
    var selectedTodate = getSelectedDate(2, $('#leaddate').val());

    var obj = {
        'Fromdate': selectedFromdate,
        'ToDate': selectedTodate,
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'GetLeads');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    document.getElementById('lead-today-cnt').innerHTML = data.length.toString() + ' <span class="fs-8 text-body lh-lg">Lead(s) Today</span>';
    document.getElementById('lead-week-cnt').innerHTML = data.length.toString() + ' <span class="fs-8 text-body lh-lg">This Week</span>';

    if (data.length <= 0) {

        var $tr = $('<tr />').appendTo('#lead-tables-body');
        $('<td colspan="7" style="text-align: center;"/>').text("No data available").appendTo($tr);
        return;
    }

    $('#lead-tables-body').empty();


    var totalcases = 0;
    let leadWorker = new Worker('/js/worker/JLeadWorker.js');

    leadWorker.postMessage(data);

    leadWorker.onmessage = await function (retArray) {

        $(retArray.data.row).appendTo('#lead-tables-body');

        totalcases += 1;

        if (totalcases == data.length) {

            initializeHackerList('leadsTable');
        }

    }


}

// #endregion

// generate quote
// #region
async function createQuote(leadid, customer, capacity, customerid) {

    clearQuoteControls();

    $('#msrtName').text(customer);
    $('#LeadID').val(leadid);
    $('#CustomerID').val(customerid);
    var quoteno = await generateQuoteNo();
    await bindProductType();
    await bindUOM();
    $('#txtquoteno').val(quoteno);
    $('#txthead').val('Proposal for Design, Supply, Installation, Testing & Commissioning of ' + capacity + ' KWP Grid Connected Solar Power Plant');

    await getQuotationDetails(leadid); // get previous quotation details already saved aganist this lead

    $('#quote-modal').modal('toggle');
}

function clearQuoteControls() {

    $("#modalbody").find("input[type=text]").val("");
    $("#modalbody").find("input[type=number]").val("");
    $('#cmbtype').val('');
    $('#txtproduct').val('');
    $('#cmbuom').val('');
    $('#hd_table').empty();
    $('#LeadID').val('');
    $('#CustomerID').val('');
    removeButtonLoader('btnSaveQuote', 'Save');
    quoteDetailsArray = [];
}
async function generateQuoteNo() {

    var obj = {
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'GenerateQuotationNumber');

    if (result != null) {

        var data = JSON.parse(result.items);

        return data[0].QuoteNo;
    }

    return '1';
}
async function bindProductType() {

    $('#cmbtype option:not(:first)').remove();

    var obj = {
        'Status': true,
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'BindProductType');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbtype');
    }
}
async function bindUOM() {

    $('#cmbuom option:not(:first)').remove();

    var obj = {
        'Status': true,
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'BindUOM');

    if (result != null) {

        var data = JSON.parse(result.items);
        fillselect(data, 'cmbuom');
    }
}
async function bindProducts() {

    $('#product-list').empty();

    if ($('#cmbtype').val() == '') {

        return;
    }

    var obj = {
        'Id': parseInt($('#cmbtype').val()),
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'BindProductByTypeID');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    for (var i = 0; i < data.length; i++) {

        var item = data[i];
        $('#product-list').append($("<option></option>").attr("value", item.Name).attr("data-id", item.ID));
    }

}

// #endregion

// fill latest quote details
// #region

async function getQuotationDetails(leadId) {

    var obj = {
        'Id': parseInt(leadId),
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'GetQuotationByLeadId');

    if (result == null || result == undefined) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);
    if (data.length <= 0) { return; }

    const lstQuote = data[data.length - 1];

    $('#txtquoteno').val(lstQuote.QuoteNo);
    $('#txthead').val(lstQuote.TopHead);
    $('#txtannualgen').val(lstQuote.ExpAnnualGen);
    $('#txtsystemprice').val(lstQuote.SystemPrice);
    $('#txtksebregfee').val(lstQuote.KsebRegFee);
    $('#txtthreephase').val(lstQuote.MeterThreePhase);
    $('#txtsinglephase').val(lstQuote.MeterSinglePhase);

    if (lstQuote.QuoteDetails != null) {

        for (var i = 0; i < lstQuote.QuoteDetails.length; i++) {

            var item = lstQuote.QuoteDetails[i];

            var obj = {
                'ProductID': parseInt(item.ProductID),
                'Qty': parseFloat(item.Qty),
                'QuoteQty': parseFloat(item.Quantity),
                'UOMID': parseInt(item.UOMID)
            };

            quoteDetailsArray.push(obj);

            $tr = $('<tr>').appendTo('#hd_table');
            $('<td id="slno" style="text-align:left"/>').text(quoteDetailsArray.length).appendTo($tr);
            $('<td/>').text(item.Item).appendTo($tr);
            $('<td/>').text(item.Specification).appendTo($tr);
            $('<td/>').text(item.Qty).appendTo($tr);
            $td3 = $('<td>').appendTo($tr);
            $('<span style="cursor:pointer" class="text-500 me-2 fas fa-minus" onclick="removeRow(this,' + item.ProductID + ')"/>').appendTo($td3);
        }
    }
}

// #endregion

// add quote details
// #region
function addToTable() {

    if ($('#cmbtype').val() == '') {

        showAlertDismissible('Warning', 'Please select the product type.', 'alert-subtle-warning');
        return;
    }

    if ($('#txtproduct').val().trim() == '') {

        showAlertDismissible('Warning', 'Please select the product.', 'alert-subtle-warning');
        return;
    }

    if ($('#txtqty').val().trim() == '') {

        showAlertDismissible('Warning', 'Please select the product qty.', 'alert-subtle-warning');
        return;
    }

    if ($('#txtQtyInQuote').val().trim() == '') {

        showAlertDismissible('Warning', 'Please select the product net qty.', 'alert-subtle-warning');
        return;
    }

    if ($('#cmbuom').val().trim() == '') {

        showAlertDismissible('Warning', 'Please select the net qty Unit.', 'alert-subtle-warning');
        return;
    }

    var productId = $("#product-list option[value='" + $('#txtproduct').val().trim() + "']").attr('data-id');

    if (typeof productId === 'undefined') {

        showAlertDismissible('Warning', 'Please select the product from the list.', 'alert-subtle-warning');
        return;
    }

    if (isProductInArray(productId, quoteDetailsArray)) {

        showAlertDismissible('Warning', 'This product is already added to the list.', 'alert-subtle-warning');
        return;
    }

    var obj = {
        'ProductID': productId,
        'Qty': parseFloat($('#txtqty').val()),
        'QuoteQty': parseFloat($('#txtQtyInQuote').val()),
        'UOMID': parseInt($('#cmbuom').val())
    };

    quoteDetailsArray.push(obj);

    $tr = $('<tr>').appendTo('#hd_table');
    $('<td id="slno" style="text-align:left"/>').text(quoteDetailsArray.length).appendTo($tr);
    $('<td/>').text($("#cmbtype option:selected").text()).appendTo($tr);
    $('<td/>').text($('#txtproduct').val().trim()).appendTo($tr);
    $('<td/>').text($('#txtqty').val()).appendTo($tr);
    $td3 = $('<td>').appendTo($tr);
    $('<span style="cursor:pointer" class="text-500 me-2 fas fa-minus" onclick="removeRow(this,' + productId + ')"/>').appendTo($td3);

    clearQuoteDetails();
}
function removeRow(obj, prdtId) {

    quoteDetailsArray = quoteDetailsArray.filter(function (obj) {
        return !(obj.ProductID == prdtId);
    });

    var incr = 0;
    $(obj).closest('tr').remove();
    $('#hd_table tr').each(function (index, tr) {
        incr += 1;
        $(tr).find('#slno').text(incr);
    });
}
function isProductInArray(productId, array) {
    return array.filter(function (item) {
        return item.ProductID === productId;
    }).length > 0;
}
function clearQuoteDetails() {

    $('#cmbtype').val('');
    $('#txtproduct').val('');
    $('#product-list').empty();
    $('#txtqty').val('');
    $('#txtQtyInQuote').val('');
    $('#cmbuom').val('');
}

// #endregion

// save quotation
// #region
async function saveQuote(e) {

    if (!$('.needs-validation')[1].checkValidity()) {

        return;
    }

    e.preventDefault();

    $(".needs-validation").removeClass('was-validated');

    if (quoteDetailsArray.length <= 0) {

        showAlertDismissible('Warning', 'Please add products to table.', 'alert-subtle-warning');
        return;
    }

    setButtonLoader('btnSaveQuote', 'Saving...');

    var leadid = $('#LeadID').val();
    var custid = $('#CustomerID').val();

    var obj = {
        'Subsidy': parseFloat(78000),
        'RefNo': $('#txtquoteno').val(),
        'LeadId': parseInt(leadid),
        'CustomerId': parseInt(custid),
        'AnnualGen': parseFloat($('#txtannualgen').val()),
        'TopHead': $('#txthead').val(),
        'Token': getToken(),
        'SystemPrice': parseFloat($('#txtsystemprice').val()),
        'Discount': parseFloat(0),
        'KSEBFee': parseFloat($('#txtksebregfee').val()),
        'ThreePhase': parseFloat($('#txtthreephase').val()),
        'SinglePhase': parseFloat($('#txtsinglephase').val()),
        'QuotationDetails': quoteDetailsArray
    };

    const result = await callPostApi(obj, 'SaveQuotation');

    if (result == null) { return; }

    showToastByStatusCode(result.statusCode, 'Quotation', 'quote-modal');

    if (result.statusCode == 201 || result.statusCode == 200) {

        fillLeads();

        console.log(result.items);

        var quoteId = result.items;
        localStorage.setItem('QVal', quoteId);
        window.location.href = "/Sales/ViewQuote";
    }

    removeButtonLoader('btnSaveQuote', 'Save');

}

// #endregion