 

// create td elements
// #region

function createCustomerSection(custName, mob) {

    var tdsel = '<td class="name align-middle white-space-nowrap ps-0 border-end py-1">';
    tdsel += ' <div class="form-check mb-0 fs-8">';
    tdsel += '<div class="d-flex align-items-center">';
    tdsel += '<div>';
    tdsel += '<a class="fs-8 fw-bold" href="#!">' + custName + '</a>'
    tdsel += '<div class="d-flex align-items-center">';
    tdsel += '<p class="mb-0 text-body-highlight fw-semibold fs-9 me-2"><span class="badge badge-phoenix badge-phoenix-primary"><a class="text-body-highlight fs-9 fw-bold" href="tel:' + mob + '">'+mob+'</a></span></p>'
    tdsel += '</div>';
    tdsel += '</div>';
    tdsel += '</div>';
    tdsel += '</td>';

    return tdsel;
}

function createtdSection(QuoteNo, RefNo, createddate, options,quotationstatus) {

    var td = '';

    if (options == 1) {
        td = '<td class="quoteno align-middle white-space-nowrap fw-semibold ps-4 border-end border-translucent me-2">' + QuoteNo + " " +'<span class="badge badge-phoenix badge-phoenix-primary">   ' + quotationstatus +'</span></td>'
    }
    else if (options == 2) {
        td = '<td class="refno align-middle white-space-nowrap fw-semibold ps-4 border-end border-translucent">' + RefNo + '</td>'
    }
    else if (options == 3) {
        td = '<td class="date align-middle white-space-nowrap text-body-tertiary text-opacity-85 ps-4 text-body-tertiary">' + createddate + '</td>'
    }

    return td;
}

function createPriceDetailsSection(annualexp, systemprice,discount,subsidy) {
    var tdsel = '<td class="name align-middle white-space-nowrap ps-0 border-end">';
    tdsel += ' <div class="form-check mb-0 fs-8">';
    tdsel += '<div>';
    tdsel += '<p>Annual Exp: <span class="badge badge-phoenix badge-phoenix-primary me-1">' + annualexp + '</span></p>';
    tdsel += '<p>System Price: <span class="badge badge-phoenix badge-phoenix-primary">' + systemprice + '</span></p>';
    tdsel += '<p>Discount: <span class="badge badge-phoenix badge-phoenix-primary me-1">' + discount + '</span></p>';
    tdsel += '<p>Subsidy: <span class="badge badge-phoenix badge-phoenix-primary">' + subsidy + '</span></p>';
    tdsel += '</div>';
    tdsel += '</div>';
    tdsel += '</td>';
    return tdsel;


}

function createProductDetailsSection(quotationdetails) {

    var tdsel = '<td class="name align-middle white-space-nowrap ps-0 border-end">';
    tdsel += ' <div class="form-check mb-0 fs-8">';
    tdsel += '<div>';

    for (var i = 0; i < quotationdetails.length; i++) {
        tdsel += '<p>';
        tdsel += 'Product:<span class="badge badge-phoenix badge-phoenix-primary me-1">' + quotationdetails[i].Product + '</span> '  
        tdsel += 'Brand: <span class="badge badge-phoenix badge-phoenix-primary me-1">' + quotationdetails[i].Brand + '</span> ' 
        tdsel += 'Quantity:<span class="badge badge-phoenix badge-phoenix-primary me-1">' + quotationdetails[i].Qty + '</span> ';
        tdsel += '</p>';
    }
    tdsel += '</div>';
    tdsel += '</td>';

    return tdsel;

}

function createOptionsSections(customer,quoteid) {

    var td = '<td class="align-middle white-space-nowrap text-end pe-0 ps-4">';
    td += '<div class="btn-reveal-trigger position-static">';
    td += '<button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>';
    td += '<div class="dropdown-menu dropdown-menu-end py-2">';   
    td += '<a class="dropdown-item text-success" onclick="AddAccountDetails(' + quoteid + ',' + customer + ')" href="#!">Add Details</a>';   
    td += '</div>';
    td += '</div>';
    td += '</td>';

    return td;

}

// #endregion

onmessage = function (quotationArray) {

    for (var i = 0; i < quotationArray.data.length; i++) {
       
        var tr = '<tr class="hover-actions-trigger btn-reveal-trigger position-static">'
        var item = quotationArray.data[i];
        var customer = "'" + item.Customer + "'";

        tr += createCustomerSection(item.Customer, item.MobileNo);
        tr += createtdSection(item.QuoteNo, '', '', 1, item.QuotationStatus);
        tr += createtdSection('', item.RefNo, '', 2,'');
        tr += createPriceDetailsSection(item.AnnualExp, item.SystemPrice, item.Discount, item.Subsidy);
        tr += createProductDetailsSection(item.QuotationDetails);       
        tr += createtdSection('', '', item.AddedDate, 3,'');
        tr += createOptionsSections(customer,item.ID);
        tr += '</tr>';

        self.postMessage({
            row: tr
        });


    }

}