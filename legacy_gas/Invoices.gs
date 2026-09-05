/* =========================
   SALES INVOICES
========================= */

function createInvoice(
  soNumber
){

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const soSheet =
    ss.getSheetByName(
      "SalesOrders"
    );

  const soDetailSheet =
    ss.getSheetByName(
      "SalesOrdersDetails"
    );

  const invoiceSheet =
    ss.getSheetByName(
      "SalesInvoices"
    );

  const invoiceDetailSheet =
    ss.getSheetByName(
      "SalesInvoiceDetails"
    );

  const invoiceNo =
    generateInvoiceNo();

  const soData =
    soSheet
      .getDataRange()
      .getValues();

  let header = null;

  for(
    let i = 1;
    i < soData.length;
    i++
  ){

    if(
      soData[i][1] ==
      soNumber
    ){

      header =
        soData[i];

      break;

    }

  }

  if(!header){

    throw new Error(
      "Sales Order not found."
    );

  }

  const invoiceDate =
    new Date();

  const invoiceTime =
    Utilities.formatDate(
      invoiceDate,
      Session.getScriptTimeZone(),
      "hh:mm:ss a"
    );

  invoiceSheet.appendRow([

    invoiceNo,          // A InvoiceNo

    invoiceDate,        // B InvoiceDate

    invoiceTime,        // C InvoiceTime

    header[1],          // D SONumber

    header[3],          // E CustomerCode

    header[4],          // F CustomerName

    header[6],          // G TotalAmount

    header[7],          // H PaymentForm

    header[8],          // I Terms

    header[9],          // J DueDate

    header[13],         // K PreparedBy

    "ACTIVE"            // L InvoiceStatus

  ]);

  const detailData =
    soDetailSheet
      .getDataRange()
      .getValues();

  for(
    let i = 1;
    i < detailData.length;
    i++
  ){

    if(
      detailData[i][1] ==
      soNumber
    ){

      invoiceDetailSheet.appendRow([

        invoiceNo,

        detailData[i][2],

        detailData[i][3],

        detailData[i][4],

        detailData[i][5],

        detailData[i][6]

      ]);

    }

  }

  return invoiceNo;

}



/* =========================
   UNINVOICED SALES ORDERS
========================= */

function getUninvoicedSOs(){

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const soSheet =
    ss.getSheetByName(
      "SalesOrders"
    );

  const invoiceSheet =
    ss.getSheetByName(
      "SalesInvoices"
    );

  const soData =
    soSheet
      .getDataRange()
      .getValues();

  const invoiceData =
    invoiceSheet
      .getDataRange()
      .getValues();

  let existingInvoices =
    {};

  for(
    let i = 1;
    i < invoiceData.length;
    i++
  ){

    existingInvoices[
      invoiceData[i][3]
    ] =
      invoiceData[i][0];

  }

  let result = [];

  for(
    let i = 1;
    i < soData.length;
    i++
  ){

    const soNumber =
      soData[i][1];

    if(
      soNumber &&
      !existingInvoices[
        soNumber
      ]
    ){

      result.push({

        soNumber:
          soNumber

      });

    }

  }

  return result;

}



/* =========================
   GET INVOICE HEADER
   AND DETAILS
========================= */

function getInvoice(
  invoiceNo
){

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const invoiceSheet =
    ss.getSheetByName(
      "SalesInvoices"
    );

  const detailSheet =
    ss.getSheetByName(
      "SalesInvoiceDetails"
    );

  if(!invoiceSheet){

    throw new Error(
      "SalesInvoices sheet not found."
    );

  }

  if(!detailSheet){

    throw new Error(
      "SalesInvoiceDetails sheet not found."
    );

  }

  const invoices =
    invoiceSheet
      .getDataRange()
      .getValues();

  let header =
    null;

  for(
    let i = 1;
    i < invoices.length;
    i++
  ){

    if(
      invoices[i][0] ==
      invoiceNo
    ){

      header =
        invoices[i];

      break;

    }

  }

  if(!header){

    throw new Error(
      "Invoice not found : " +
      invoiceNo
    );

  }

  const details =
    detailSheet
      .getDataRange()
      .getValues();

  let lines = [];

  for(
    let i = 1;
    i < details.length;
    i++
  ){

    if(
      details[i][0] ==
      invoiceNo
    ){

      lines.push({

        productCode:
          details[i][1],

        productName:
          details[i][2],

        quantity:
          details[i][3],

        unitPrice:
          details[i][4],

        lineAmount:
          details[i][5]

      });

    }

  }

  return {

    header:
      header,

    lines:
      lines

  };

}



/* =========================
   GET INVOICE BY
   SALES ORDER
========================= */

function getInvoiceBySO(
  soNumber
){

  const invoices =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesInvoices"
      )
      .getDataRange()
      .getValues();

  for(
    let i = 1;
    i < invoices.length;
    i++
  ){

    if(
      invoices[i][3] ==
      soNumber
    ){

      return invoices[i][0];

    }

  }

  return null;

}



/* =========================
   INVOICE LIST
========================= */

function getInvoiceList(){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesInvoices"
      );

  const data =
    sheet
      .getDataRange()
      .getValues();

  let invoices = [];

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    if(
      !data[i][0]
    ){
      continue;
    }

    invoices.push({

      invoiceNo:
        data[i][0],

      invoiceDate:
        data[i][1],

      invoiceTime:
        data[i][2],

      soNumber:
        data[i][3],

      customerCode:
        data[i][4],

      customerName:
        data[i][5],

      totalAmount:
        data[i][6],

      paymentForm:
        data[i][7],

      terms:
        data[i][8],

      dueDate:
        data[i][9],

      preparedBy:
        data[i][10],

      invoiceStatus:
        data[i][11]

    });

  }

  return invoices;

}