/* =========================
   PURCHASES
========================= */

function savePurchase(purchase) {

  const purchaseSheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("Purchases");

  const inventorySheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("InventoryMovements");

  const purchaseNo = generatePurchaseNo();

  let grandTotal = 0;

  purchase.items.forEach(function(item) {
    grandTotal += Number(item.totalCost);
  });

  let interestAmount = 0;
  let interestRate = 0;
  let totalAP = 0;
  let apBalance = 0;
  let apStatus = "PAID";

  if (purchase.paymentType === "CREDIT") {

    apStatus = "OPEN";

    if (purchase.paymentMode === "INSTALLMENT") {

      totalAP =
        Number(purchase.monthlyAmortization) *
        Number(purchase.installmentMonths);

    } else {

      totalAP =
        Number(purchase.totalAmountDue);

    }

    interestAmount = totalAP - grandTotal;

    interestRate =
      grandTotal > 0
        ? (interestAmount / grandTotal) * 100
        : 0;

    apBalance = totalAP;
  }

  // Save each purchased item
  purchase.items.forEach(function(item) {

    let qtyReceived = 0;

    if (item.unit === "ml") {

      qtyReceived =
        Number(item.quantityPurchased) *
        Number(item.volume);

    } else {

      qtyReceived =
        Number(item.quantityPurchased);

    }

    // Save to Purchases sheet
    purchaseSheet.appendRow([
      '',
      purchaseNo,
      purchase.purchaseDate,
      purchase.supplier,
      item.materialCode,
      item.volume,
      item.quantityPurchased,
      qtyReceived,
      item.unit,
      item.unitCost,
      item.totalCost,
      purchase.invoiceNo,
      purchase.remarks,
      purchase.paymentType,
      purchase.paymentMode,
      purchase.creditor,
      purchase.creditStartDate,
      purchase.installmentMonths,
      purchase.monthlyAmortization,
      purchase.totalAmountDue,
      interestAmount,
      interestRate,
      0,
      apBalance,
      apStatus
    ]);

    // Save inventory movement
    inventorySheet.appendRow([
      '',
      purchase.purchaseDate,
      'PURCHASE',
      'RAW',
      item.materialCode,
      qtyReceived,
      0,
      purchaseNo,
      'Purchase Entry'
    ]);

  });

  return "Purchase Saved Successfully";
}

/* =========================
   GENERATE PURCHASES NUMBER
========================= */


function generatePurchaseNo(){

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

  const today =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyy-MMdd"
    );

  let running = 0;

  for(let i=1;i<data.length;i++){

    const po =
      String(data[i][1]);

    if(
      po.startsWith(
        "PO-" + today + "-"
      )
    ){

      const parts =
        po.split("-");

      const currentNo =
        Number(parts[3]);

      if(currentNo > running){

        running = currentNo;

      }

    }

  }

  running++;

  return (
    "PO-" +
    today +
    "-" +
    String(running)
      .padStart(4,'0')
  );

}


