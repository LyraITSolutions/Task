

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

    var quoteId = localStorage.getItem('QVal');

    if (quoteId == null || quoteId == undefined) {

        window.location.href = "/Home/Login";
        return;
    }

    await getQuoteValues(quoteId);

});
// #endregion

// get quotation values
// #region
async function getQuoteValues(quoteId) {

    var obj = {
        'Id': parseInt(quoteId),
        'Token': getToken()
    };

    var result = await callPostApi(obj, 'GetQuotationPrintByID');

    if (result == null) { return; }
    if (result.statusCode != 200) { return; }

    var data = JSON.parse(result.items);

    if (data.length <= 0) { return; }

    $('#quote-no').text(data[0].QuoteNo);
    $('#quote-date').text(data[0].QuoteDate);
    $('#quote-custname').text(data[0].Customer);
    $('#quote-custmobile').text(data[0].Mobile);
    $('#quote-custaddress').text(data[0].CustAddress);
    $('#quote-custpincode').text(data[0].Pincode);

    $('#quote-head').text(data[0].TopHead);

    $('#quote-location').text(data[0].LocationName);
    $('#quote-capacity').text(data[0].Capcity + ' KWP');
    $('#quote-type').text(data[0].ProjectType);
    $('#quote-sqft').text(data[0].Squarefeet + ' Sq. Ft.');
    $('#quote-rooftype').text(data[0].RoofType);
    $('#quote-annual').text('**' + data[0].ExpAnnualGen + ' Unit');

    var quotedetails = data[0].QuoteDetails;

    $('#table-qtdtls').empty();

    var html = '';
    for (var i = 0; i < quotedetails.length; i++) {

        html += '<tr>';
        html += '<td class="border-0"></td>';
        html += '<td class="align-middle ps-2 p-0 m-0 text-body-highlight">' + (i + 1).toString() + '</td>';
        html += '<td class="align-middle ps-2 p-0 m-0 text-body-highlight">' + quotedetails[i].Item + '</td>';
        html += '<td class="align-middle ps-5 p-0 m-0 text-body-highlight">' + quotedetails[i].Specification + '</td>';
        html += '<td class="align-middle ps-5 p-0 m-0 text-body-highlight">' + quotedetails[i].Make + '</td>';
        html += '<td class="align-middle ps-5 p-0 m-0 text-body-highlight">' + quotedetails[i].Quantity + ' ' + quotedetails[i].Unit + '</td>';
        html += '<td class="border-0 p-0 m-0"></td>';
        html += '</tr>';
    }

    $(html).appendTo('#table-qtdtls');

    $('#td-system-price').text('Rs ' + parseFloat(data[0].SystemPrice).toFixed(2));

    $('#quote-subsidy').text('*Rs. ' + parseFloat(data[0].Subsidy).toFixed(2) + '/- MNRE Subsidy credited into customer’s account.');
    $('#quote-tdkseb').text('Rs. ' + parseFloat(data[0].KsebRegFee).toFixed(2));
    $('#quote-threephase').text('Rs. ' + parseFloat(data[0].MeterThreePhase).toFixed(2));
    $('#quote-singlephase').text('Rs. ' + parseFloat(data[0].MeterSinglePhase).toFixed(2));


}

// #endregion

function convertPdf() {

    const element = document.getElementById('mainprintdiv');
    html2pdf().from(element).save();
}