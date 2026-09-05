/* =========================
   CUSTOMER MAINTENANCE
========================= */

function generateCustomerCode(){

  const sheet =

    SpreadsheetApp

      .getActiveSpreadsheet()

      .getSheetByName(
        "Customers"
      );

  const lastRow =
    sheet.getLastRow();

  const runningNo =
    lastRow;

  return (

    "C" +

    String(runningNo)

      .padStart(4,"0")

  );

}



function saveCustomer(customer){

  const sheet =

    SpreadsheetApp

      .getActiveSpreadsheet()

      .getSheetByName(
        "Customers"
      );

  sheet.appendRow([

    '',
    customer.customerCode,
    customer.customerName,
    customer.customerType,
    customer.creditTerms,
    Number(customer.creditLimit),
    0,
    'N',
    '',
    'ACTIVE'

  ]);

  return "Customer Saved Successfully";

}



function getCustomerNames(){

  const sheet =

    SpreadsheetApp

      .getActiveSpreadsheet()

      .getSheetByName(
        "Customers"
      );

  const data =

    sheet

      .getDataRange()

      .getValues();

  let customers = [];

  for(

    let i = 1;

    i < data.length;

    i++

  ){

    if(

      data[i][9] ==

      "ACTIVE"

    ){

      customers.push({

        code:
          data[i][1],

        name:
          data[i][2],

        type:
          data[i][3],

        terms:
          data[i][4]

      });

    }

  }

  return customers;

}



/* =========================
   CUSTOMER SALES ANALYTICS
========================= */

function getCustomerSalesAnalytics(
  month,
  year
){

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const soSheet =
    ss.getSheetByName(
      "SalesOrders"
    );

  const detailSheet =
    ss.getSheetByName(
      "SalesOrdersDetails"
    );

  const soData =
    soSheet.getDataRange().getValues();

  const detailData =
    detailSheet.getDataRange().getValues();

  let customers = {};

  let grandTotal = 0;

  for(
    let i = 1;
    i < soData.length;
    i++
  ){

    const soDate =
      new Date(
        soData[i][2]
      );

    if(

      soDate.getMonth() + 1 != month ||

      soDate.getFullYear() != year

    ){

      continue;

    }

    const customer =
      soData[i][4];

    const sales =
      Number(
        soData[i][6]
      ) || 0;

    grandTotal += sales;

    if(
      !customers[customer]
    ){

      customers[customer] = {

        bottles: 0,

        amount: 0

      };

    }

    customers[customer].amount +=
      sales;

  }

  let customerLookup = {};

  for(
    let i = 1;
    i < soData.length;
    i++
  ){

    customerLookup[
      soData[i][1]
    ] =

      soData[i][4];

  }

  for(
    let i = 1;
    i < detailData.length;
    i++
  ){

    const customer =

      customerLookup[
        detailData[i][1]
      ];

    if(
      !customer
    ){
      continue;
    }

    if(
      !customers[customer]
    ){
      continue;
    }

    customers[customer].bottles +=

      Number(
        detailData[i][4]
      ) || 0;

  }

  Object.keys(
    customers
  )

  .forEach(function(customer){

    customers[customer].percent =

      grandTotal === 0

      ? 0

      :

      (

        customers[customer].amount /

        grandTotal

      ) * 100;

  });

  return customers;

}