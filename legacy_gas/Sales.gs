/* =========================
   SALES ORDERS
========================= */

function generateSONo(){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesOrders"
      );

  const data =
    sheet
      .getDataRange()
      .getValues();

  let maxNumber = 0;

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    const soNo =
      String(
        data[i][1] || ""
      );

    if(
      soNo.indexOf(
        "SO-"
      ) === 0
    ){

      const numberPart =
        Number(
          soNo.replace(
            "SO-",
            ""
          )
        );

      if(
        !isNaN(numberPart) &&
        numberPart > maxNumber
      ){

        maxNumber =
          numberPart;

      }

    }

  }

  return (
    "SO-" +
    String(
      maxNumber + 1
    ).padStart(
      6,
      "0"
    )
  );

}



function saveSalesOrder(
  customerCode,
  customerName,
  customerType,
  paymentForm,
  orderLines,
  createdBy
){

  const ss =

    SpreadsheetApp
      .getActiveSpreadsheet();

  const soSheet =

    ss.getSheetByName(
      "SalesOrders"
    );

  const detailSheet =

    ss.getSheetByName(
      "SalesOrdersDetails"
    );

  const inventorySheet =

    ss.getSheetByName(
      "InventoryMovements"
    );

  const soNo =
    generateSONo();

  const today =
    new Date();

  /* =========================
     BACKEND INVENTORY VALIDATION
  ========================= */

  const fgInventory =
    getFGAS();

  orderLines.forEach(function(line){

    const available =
      Number(
        fgInventory[
          line.productCode
        ] || 0
      );

    const requested =
      Number(
        line.quantity
      );

    if(
      requested > available
    ){

      throw new Error(

        "Insufficient inventory for " +
        line.productCode +

        "\n\nAvailable: " +
        available +

        "\nRequested: " +
        requested

      );

    }

  });

  let totalAmount = 0;

  orderLines.forEach(function(line){

    totalAmount +=
      Number(
        line.lineAmount
      );

  });

  let terms = 0;

  if(
    paymentForm ==
    "CREDIT"
  ){

    terms = 15;

  }

  let dueDate = "";

  if(
    paymentForm ==
    "CREDIT"
  ){

    dueDate =
      new Date(today);

    dueDate.setDate(

      dueDate.getDate() +
      terms

    );

  }

  soSheet.appendRow([

    "",

    soNo,

    today,

    customerCode,

    customerName,

    customerType,

    totalAmount,

    paymentForm,

    terms,

    dueDate,

    0,

    totalAmount,

    "OPEN",

    createdBy

  ]);

  orderLines.forEach(function(line){

    detailSheet.appendRow([

      "",

      soNo,

      line.productCode,

      line.productName,

      line.quantity,

      line.unitPrice,

      line.lineAmount

    ]);

    inventorySheet.appendRow([

      "",

      today,

      "SO",

      "FG",

      line.productCode,

      0,

      line.quantity,

      soNo,

      "Sales Order"

    ]);

  });

  const invoiceNo =

    createInvoice(
      soNo
    );

  return {

    soNumber:
      soNo,

    invoiceNumber:
      invoiceNo

  };

}



/* =========================
   SALES RETURN
========================= */

/* =========================
   SALES RETURN NUMBER
========================= */
function generateReturnNo(soNumber){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesReturns"
      );

  const data =
    sheet
      .getDataRange()
      .getValues();

  let count = 0;

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    if(
      data[i][3] ==
      soNumber
    ){

      count++;

    }

  }

  const sequence =
    String(
      count + 1
    ).padStart(
      3,
      "0"
    );

  return (
    "SR-" +
    soNumber +
    "-" +
    sequence
  );

}



function saveSalesReturn(
  data
){

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const returnSheet =
    ss.getSheetByName(
      "SalesReturns"
    );

  const inventorySheet =
    ss.getSheetByName(
      "InventoryMovements"
    );

  const salesDetailSheet =
    ss.getSheetByName(
      "SalesOrdersDetails"
    );

  const salesDetails =
    salesDetailSheet
      .getDataRange()
      .getValues();

  let qtySold = 0;

  for(
    let i = 1;
    i < salesDetails.length;
    i++
  ){

    if(

      salesDetails[i][1] ==
        data.soNumber &&

      salesDetails[i][2] ==
        data.productCode

    ){

      qtySold =
        Number(
          salesDetails[i][4]
        ) || 0;

      break;

    }

  }

  if(
    qtySold <= 0
  ){

    throw new Error(
      "Original sales transaction not found."
    );

  }

  const qtyAlreadyReturned =
    getTotalReturnedQty(
      data.soNumber,
      data.productCode
    );

  const qtyAvailableForReturn =
    qtySold -
    qtyAlreadyReturned;

  const requestedReturnQty =
    Number(
      data.qtyReturned
    ) || 0;

  if(
    requestedReturnQty <= 0
  ){

    throw new Error(
      "Return quantity must be greater than zero."
    );

  }

  if(
    requestedReturnQty >
    qtyAvailableForReturn
  ){

    throw new Error(

      "Invalid Return Quantity" +

      "\n\nQty Sold: " +
      qtySold +

      "\nAlready Returned: " +
      qtyAlreadyReturned +

      "\nAvailable For Return: " +
      qtyAvailableForReturn +

      "\nRequested Return: " +
      requestedReturnQty

    );

  }

  const returnNo =
    generateReturnNo(
      data.soNumber
    );

  returnSheet.appendRow([

    returnNo,

    new Date(),

    data.productName,

    data.soNumber,

    data.customerCode,

    data.customerName,

    data.productCode,

    requestedReturnQty,

    data.reason,

    data.encodedBy

  ]);

  inventorySheet.appendRow([

    "",

    new Date(),

    "SALES-RETURN",

    "FG",

    data.productCode,

    requestedReturnQty,

    0,

    returnNo,

    "Sales Return"

  ]);

  return "Sales Return Saved";

}



function getSalesOrderNumbers(){

  const data =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesOrders"
      )
      .getDataRange()
      .getValues();

  let result = [];

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    result.push({

      soNumber:
        data[i][1]

    });

  }

  return result;

}



function getSalesReturnSO(
  soNumber
){

  const data =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesOrders"
      )
      .getDataRange()
      .getValues();

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    if(
      data[i][1] ==
      soNumber
    ){

      return {

        customerCode:
          data[i][3],

        customerName:
          data[i][4]

      };

    }

  }

  return null;

}



function testSOData(){

  const sheet =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesOrders"
      );

  const data =

    sheet
      .getDataRange()
      .getValues();

  Logger.log(
    JSON.stringify(data)
  );

}



function getSalesOrderProducts(
  soNumber
){

  const data =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesOrdersDetails"
      )
      .getDataRange()
      .getValues();

  let products = [];

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    if(
      data[i][1] ==
      soNumber
    ){

      products.push({

        productCode:
          data[i][2],

        productName:
          data[i][3],

        qtySold:
          data[i][4]

      });

    }

  }

  return products;

}

/* =========================
   TOTAL RETURNED QUANTITY
========================= */

function getTotalReturnedQty(
  soNumber,
  productCode
){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesReturns"
      );

  const data =
    sheet
      .getDataRange()
      .getValues();

  let returnedQty = 0;

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    if(
      data[i][3] == soNumber &&
      data[i][6] == productCode
    ){

      returnedQty +=
        Number(
          data[i][7]
        ) || 0;

    }

  }

  return returnedQty;

}

/* =========================
   COLLECTIONS
========================= */

function generateCollectionNo(){

  return (

    "COL-" +

    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyyMMddHHmmss"
    )

  );

}



function getCollectionSO(
  soNumber
){

  const sheet =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesOrders"
      );

  const data =

    sheet
      .getDataRange()
      .getValues();

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    if(
      data[i][1] ==
      soNumber
    ){

      return {

        soNumber:
          data[i][1],

        customerCode:
          data[i][3],

        customerName:
          data[i][4],

        orderAmount:
          data[i][6],

        balance:
          data[i][11]

      };

    }

  }

  return null;

}



function getSalesOrdersList(){

  const sheet =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesOrders"
      );

  const data =

    sheet
      .getDataRange()
      .getValues();

  let result = [];

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    if(
      data[i][12] !=
      "PAID"
    ){

      result.push({

        soNumber:
          data[i][1]

      });

    }

  }

  return result;

}



function saveCollection(
  data
){

  const ss =

    SpreadsheetApp
      .getActiveSpreadsheet();

  const collectionSheet =

    ss.getSheetByName(
      "Collections"
    );

  const soSheet =

    ss.getSheetByName(
      "SalesOrders"
    );

  const collectionNo =
    generateCollectionNo();

  const soData =

    soSheet
      .getDataRange()
      .getValues();

  for(
    let i = 1;
    i < soData.length;
    i++
  ){

    if(

      soData[i][1] ==
      data.soNumber

    ){

      const orderAmount =

        Number(
          soData[i][6]
        );

      const currentCollected =

        Number(
          soData[i][10]
        );

      const currentBalance =

        Number(
          soData[i][11]
        );

      const collectionAmount =

        Number(
          data.amountCollected
        );

      if(
        collectionAmount <= 0
      ){

        throw new Error(
          "Collection amount must be greater than zero."
        );

      }

      if(
        collectionAmount >
        currentBalance
      ){

        throw new Error(

          "Collection amount exceeds outstanding balance." +

          "\n\nBalance: " +
          currentBalance +

          "\nCollection: " +
          collectionAmount

        );

      }

      const newCollected =

        currentCollected +
        collectionAmount;

      const newBalance =

        orderAmount -
        newCollected;

      let paymentStatus =
        "PARTIAL";

      if(
        newBalance <= 0
      ){

        paymentStatus =
          "PAID";

      }

      collectionSheet.appendRow([

        collectionNo,

        new Date(),

        data.customerCode,

        data.customerName,

        data.soNumber,

        data.amountCollected,

        data.paymentMethod,

        data.referenceNo,

        data.remarks,

        data.encodedBy

      ]);

      soSheet
        .getRange(
          i + 1,
          11
        )
        .setValue(
          newCollected
        );

      soSheet
        .getRange(
          i + 1,
          12
        )
        .setValue(
          newBalance
        );

      soSheet
        .getRange(
          i + 1,
          13
        )
        .setValue(
          paymentStatus
        );

      return
        "Collection Saved";

    }

  }

  return
    "Sales Order Not Found";

}


/* =========================
   INVOICE NUMBER
========================= */

function generateInvoiceNo(){

  const sheet =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesInvoices"
      );

  const today =

    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyyMMdd"
    );

  const data =

    sheet
      .getDataRange()
      .getValues();

  let count = 0;

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    const invoiceNo =

      String(
        data[i][0] || ""
      );

    if(

      invoiceNo.indexOf(
        "INV-" + today
      ) === 0

    ){

      count++;

    }

  }

  const sequence =

    String(
      count + 1
    )
    .padStart(
      5,
      "0"
    );

  return (

    "INV-" +
    today +
    sequence

  );

}