/* =========================
   PRODUCT COSTING
========================= */

function getProductCostingReport(){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "ProductCosting"
      );

  return sheet
    .getDataRange()
    .getValues();

}



function getCustomerProductBreakdown(
  customerName,
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

  let validSOs = {};

  for(let i = 1; i < soData.length; i++){

    const soDate =
      new Date(soData[i][2]);

    if(
      soDate.getMonth() + 1 != month ||
      soDate.getFullYear() != year
    ){
      continue;
    }

    if(
      soData[i][4] === customerName
    ){

      validSOs[
        soData[i][1]
      ] = true;

    }

  }

  let products = {};

  for(let i = 1; i < detailData.length; i++){

    const soNo =
      detailData[i][1];

    if(!validSOs[soNo]){
      continue;
    }

    const product =
      detailData[i][3];

    const qty =
      Number(
        detailData[i][4]
      ) || 0;

    if(!products[product]){

      products[product] = 0;

    }

    products[product] += qty;

  }

  return products;

}



function getCustomerProductPurchases(
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

  let soLookup = {};

  for(let i = 1; i < soData.length; i++){

    const soDate =
      new Date(soData[i][2]);

    if(
      soDate.getMonth() + 1 == month &&
      soDate.getFullYear() == year
    ){

      soLookup[
        soData[i][1]
      ] = {

        customer:
          soData[i][4]

      };

    }

  }

  let result = {};

  for(let i = 1; i < detailData.length; i++){

    const soNo =
      detailData[i][1];

    if(!soLookup[soNo]){
      continue;
    }

    const key =

      soLookup[soNo].customer +

      "|" +

      detailData[i][3];

    if(!result[key]){

      result[key] = {

        customer:
          soLookup[soNo].customer,

        product:
          detailData[i][3],

        bottles: 0,

        amount: 0

      };

    }

    result[key].bottles +=
      Number(detailData[i][4]) || 0;

    result[key].amount +=
      Number(detailData[i][6]) || 0;

  }

  return Object.values(result);

}



function getProductVelocityReport(){

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

  let soDates = {};

  for(let i = 1; i < soData.length; i++){

    const soNo =
      String(
        soData[i][1]
      ).trim();

    soDates[soNo] =
      new Date(
        soData[i][2]
      );

  }

  const today =
    new Date();

  let report = {};

  for(let i = 1; i < detailData.length; i++){

    const soNo =
      String(
        detailData[i][1]
      ).trim();

    const product =
      detailData[i][3];

    const qty =
      Number(
        detailData[i][4]
      ) || 0;

    const transDate =
      soDates[soNo];

    if(!transDate){
      continue;
    }

    if(!report[product]){

      report[product] = {

        week1: 0,
        week2: 0,
        week3: 0,
        month1: 0,
        month2: 0,
        month3: 0,
        status: ""

      };

    }

    const diffDays =

      Math.floor(

        (
          today.getTime() -
          transDate.getTime()
        )

        /

        (1000 * 60 * 60 * 24)

      );

    if(diffDays <= 7)
      report[product].week1 += qty;

    if(diffDays <= 14)
      report[product].week2 += qty;

    if(diffDays <= 21)
      report[product].week3 += qty;

    if(diffDays <= 30)
      report[product].month1 += qty;

    if(diffDays <= 60)
      report[product].month2 += qty;

    if(diffDays <= 90)
      report[product].month3 += qty;

  }

  Object.keys(report)

    .forEach(function(product){

      const qty =
        report[product].month3;

      if(qty >= 100){

        report[product].status =
          "FAST MOVING";

      }
      else if(qty >= 30){

        report[product].status =
          "MODERATE";

      }
      else if(qty > 0){

        report[product].status =
          "SLOW MOVING";

      }
      else{

        report[product].status =
          "DORMANT";

      }

    });

  return report;

}



/* =========================
   ACCOUNTS RECEIVABLES
========================= */

function getAccountsReceivableSummary(
  reportType,
  month,
  year,
  asOfDate
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

  let result = {};

  for(let i = 1; i < data.length; i++){

    const soDate =
      new Date(data[i][2]);

    let include = false;

    if(reportType == "MONTH"){

      include =

        soDate.getMonth() + 1 ==
        Number(month)

        &&

        soDate.getFullYear() ==
        Number(year);

    }

    if(reportType == "ASOF"){

      include =

        soDate <=
        new Date(asOfDate);

    }

    if(!include){
      continue;
    }

    const balance =
      Number(data[i][11]) || 0;

    if(balance <= 0){
      continue;
    }

    const customer =
      data[i][4];

    if(!result[customer]){

      result[customer] = {

        customer:
          customer,

        amountDue:
          0,

        soCount:
          0

      };

    }

    result[customer].amountDue +=
      balance;

    result[customer].soCount++;

  }

  return Object.values(result);

}



function getCustomerARBreakdown(
  customerName
){

  const soSheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SalesOrders"
      );

  const data =
    soSheet
      .getDataRange()
      .getValues();

  let result = [];

  const today =
    new Date();

  for(let i = 1; i < data.length; i++){

    if(
      data[i][4] != customerName
    ){
      continue;
    }

    const balance =
      Number(data[i][11]) || 0;

    if(balance <= 0){
      continue;
    }

    const dueDate =
      new Date(data[i][9]);

    const daysUnpaid =

      Math.floor(

        (
          today -
          dueDate
        )

        /

        (1000 * 60 * 60 * 24)

      );

    result.push({

      soNumber:
        data[i][1],

      soDate:
        data[i][2],

      originalAmount:
        data[i][6],

      amountCollected:
        data[i][10],

      balance:
        data[i][11],

      dueDate:
        data[i][9],

      daysUnpaid:
        daysUnpaid

    });

  }

  return result;

}


/* =========================
   ACCOUNTS PAYABLE SUMMARY
========================= */

/* =========================
   ACCOUNTS PAYABLE SUMMARY
========================= */
function getAccountsPayableSummary(
  reportType,
  month,
  year,
  asOfDate
){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "Purchases"
      );

  const data =
    sheet
      .getDataRange()
      .getValues();

  let result = {};

  let processedPurchases = {};

  const today =
    new Date();

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    const purchaseNo =
      data[i][1];

    if(
      processedPurchases[
        purchaseNo
      ]
    ){
      continue;
    }

    processedPurchases[
      purchaseNo
    ] = true;

    const purchaseDate =
      new Date(
        data[i][2]
      );

    let include = false;

    if(
      reportType == "MONTH"
    ){

      include =
        purchaseDate.getMonth() + 1 ==
          Number(month)
        &&
        purchaseDate.getFullYear() ==
          Number(year);

    }

    if(
      reportType == "ASOF"
    ){

      include =
        purchaseDate <=
        new Date(asOfDate);

    }

    if(!include){
      continue;
    }

    const balance =
      Number(
        data[i][23]
      ) || 0;

    if(balance <= 0){
      continue;
    }

    const creditor =
      data[i][15];

    const creditStartDate =
      new Date(
        data[i][16]
      );

    const daysDue =
      Math.floor(
        (
          today -
          creditStartDate
        )
        /
        (
          1000 *
          60 *
          60 *
          24
        )
      );

    if(
      !result[creditor]
    ){

      result[creditor] = {

        creditor:
          creditor,

        transactions:
          0,

        amountDue:
          0,

        maxDaysDue:
          0

      };

    }

    result[creditor]
      .transactions++;

    result[creditor]
      .amountDue +=
        balance;

    if(
      daysDue >
      result[creditor]
        .maxDaysDue
    ){

      result[creditor]
        .maxDaysDue =
          daysDue;

    }

  }

  return Object.values(
    result
  );

}