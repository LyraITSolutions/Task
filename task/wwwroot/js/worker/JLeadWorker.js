

// create td elements
// #region

function createCustomerSection(custName, location) {

    var tdsel = '<td class="name align-middle white-space-nowrap ps-0 border-end py-1">';
    tdsel += ' <div class="form-check mb-0 fs-8">';
    tdsel += '<div class="d-flex align-items-center">';
    tdsel += '<div>';
    tdsel += '<a class="fs-8 fw-bold" href="#!">' + custName + '</a>'
    tdsel += '<div class="d-flex align-items-center">';
    tdsel += '<p class="mb-0 text-body-highlight fw-semibold fs-9 me-2">' + location + '</p><span class="badge badge-phoenix badge-phoenix-primary">new lead</span>'
    tdsel += '</div>';
    tdsel += '</div>';
    tdsel += '</div>';
    tdsel += '</td>';

    return tdsel;
}

function createtdSection(email, phone, createddate, options) {

    var td = '';

    if (options == 1) {
        td = '<td class="email align-middle white-space-nowrap fw-semibold ps-4 border-end border-translucent"><a class="text-body-highlight" href="mailto:' + email + '">' + email + '</a></td>'
    }
    else if (options == 2) {
        td = '<td class="phone align-middle white-space-nowrap fw-semibold ps-4 border-end border-translucent"><a class="text-body-highlight" href="tel:' + phone + '">' + phone + '</a></td>'
    }
    else if (options == 3) {
        td = '<td class="date align-middle white-space-nowrap text-body-tertiary text-opacity-85 ps-4 text-body-tertiary">' + createddate + '</td>'
    }

    return td;
}

function createCapacityTypeSection(capacity, type) {

    var tdsel = '<td class="name align-middle white-space-nowrap ps-0 border-end">';
    tdsel += ' <div class="form-check mb-0 fs-8">';
    tdsel += '<div class="d-flex align-items-center">';
    tdsel += '<div>';
    tdsel += '<div class="d-flex align-items-center">';
    tdsel += '<span class="badge badge-phoenix badge-phoenix-primary me-1">' + capacity + ' KWP</span><span class="badge badge-phoenix badge-phoenix-primary">' + type + '</span>'
    tdsel += '</div>';
    tdsel += '</div>';
    tdsel += '</div>';
    tdsel += '</td>';

    return tdsel;
}

function createDetailsSection(sqareft, roof) {

    var tdsel = '<td class="name align-middle white-space-nowrap ps-0 border-end">';
    tdsel += ' <div class="form-check mb-0 fs-8">';
    tdsel += '<div class="d-flex align-items-center">';
    tdsel += '<div>';
    tdsel += '<div class="d-flex align-items-center">';
    tdsel += '<p class="mb-0 text-body-highlight fw-semibold fs-9 me-2">' + sqareft + ' Sqft</p><p class="mb-0 text-body-highlight fw-semibold fs-9 me-2">' + roof + ' roof</p>'
    tdsel += '</div>';
    tdsel += '</div>';
    tdsel += '</div>';
    tdsel += '</td>';

    return tdsel;
}

function createOptionsSections(leadid,customer, capacity, customerid) {

    var td = '<td class="align-middle white-space-nowrap text-end pe-0 ps-4">';
    td += '<div class="btn-reveal-trigger position-static">';
    td += '<button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><span class="fas fa-ellipsis-h fs-10"></span></button>';
    td += '<div class="dropdown-menu dropdown-menu-end py-2">';
    td += '<a class="dropdown-item" href="#!">View</a><a class="dropdown-item" onclick="createQuote(' + leadid + ',' + customer + ',' + capacity + ',' + customerid +')" href="#!">Generate Quote</a>';
    td += '<div class="dropdown-divider"></div><a class="dropdown-item text-danger" href="#!">Update Grid Balance</a>'
    td += '</div>';
    td += '</div>';
    td += '</td>';

    return td;

}

// #endregion

onmessage = function (leadArray) {

    for (var i = 0; i < leadArray.data.length; i++) {

        var tr = '<tr class="hover-actions-trigger btn-reveal-trigger position-static">'
        var item = leadArray.data[i];
        var customer = "'" + item.Customer + "'";

        tr += createCustomerSection(item.Customer, item.LeadLocation);
        tr += createtdSection(item.EmaiL, '', '', 1);
        tr += createtdSection('', item.MobileNo, '', 2);
        tr += createCapacityTypeSection(item.Capcity, item.ProjectType);
        tr += createDetailsSection(item.Squarefeet, item.RoofType);
        tr += createtdSection('', '', item.AddedDate, 3);
        tr += createOptionsSections(item.ID, customer, item.Capcity, item.CustomerID);
        tr += '</tr>';

        self.postMessage({
            row: tr
        });


    }

}