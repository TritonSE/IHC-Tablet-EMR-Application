export function formatDate(date) {
  let monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December'
  ];

  let day = date.getDate();
  let monthIndex = date.getMonth();
  let year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

// Convert yyyymmdd to mm/dd/yy
export function shortDate(date) {
  return date.slice(4,6) + '/' + date.slice(6) + '/' + date.slice(2,4);
}

// Given a Date object, returns string in format yyyymmdd
// We use strings as dates to make equality checks easier
// i.e. if the date is 20180301
// Otherwise the normal date object equality check includes hours and minutes
// etc. I think
export function stringDate(dateObj) {
  // Month appears to be 0 indexed, so add 1
  // Date appears to be 1 indexed, so don't add 1
  const month = dateObj.getMonth()+1 < 10 ? '0' + (dateObj.getMonth()+1) : dateObj.getMonth()+1;
  const date = dateObj.getDate() < 10 ? '0' + dateObj.getDate() : dateObj.getDate();
  return `${dateObj.getFullYear()}/${month}/${date}`;
}

export function getYear(strDate) {
  console.log("Date is ", strDate);
  return parseInt(strDate.slice(0,4));
}

export function getMonth(strDate) {
  return parseInt(strDate.slice(4,6));
}

export function getDay(strDate) {
  return parseInt(strDate.slice(6));
}
