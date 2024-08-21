
// pagination next and prev

function goNext() {

    if (nextPageValue + parseInt(options.page) <= totalItems) {
        $('.paginationDetails').empty();
        nextPageValue = nextPageValue + parseInt(options.page);
        hackerList.show(nextPageValue, parseInt(options.page));
        var pageStartRange = nextPageValue;
        var pageEndRange = (parseInt(pageStartRange) + parseInt(options.page)) - 1;
        if (pageEndRange <= totalItems) {
            $('.paginationDetails').text('Showing ' + pageStartRange + ' to ' + pageEndRange + ' of ' + totalItems);
        }
        else {
            $('.paginationDetails').text('Showing ' + pageStartRange + ' to ' + totalItems + ' of ' + totalItems);
        }
    }
}
function goPrev() {

    if (nextPageValue > 1) {
        $('.paginationDetails').empty();
        nextPageValue = nextPageValue - parseInt(options.page);

        hackerList.show(nextPageValue, parseInt(options.page));
        var pageStartRange = nextPageValue;
        var pageEndRange = (parseInt(pageStartRange) + parseInt(options.page)) - 1;
        $('.paginationDetails').text('Showing ' + pageStartRange + ' to ' + pageEndRange + ' of ' + totalItems);
    }
}

function initializeHackerList(tableName) {

    hackerList = new List(tableName, options);

    totalItems = hackerList.items.length;
    $('.paginationDetails').empty();
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
}