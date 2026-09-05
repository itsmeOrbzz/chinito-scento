/* =========================
   CURRENT STOCK
========================= */

function getCurrentStock(itemCode){

  const sheet =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "InventoryMovements"
      );

  const data =

    sheet
      .getDataRange()
      .getValues();

  let stock = 0;

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    if(
      data[i][4] == itemCode
    ){

      stock +=
        Number(data[i][5]) || 0;

      stock -=
        Number(data[i][6]) || 0;

    }

  }

  return stock;

}
/* =========================
   RAW MATERIAL INVENTORY
========================= */

function getRawMaterialInventory(){

  const sheet =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "InventoryMovements"
      );

  const data =

    sheet
      .getDataRange()
      .getValues();

  let inventory = {};

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    const itemCode =
      data[i][4];

    const qtyIn =
      Number(data[i][5]) || 0;

    const qtyOut =
      Number(data[i][6]) || 0;

    if(
      !inventory[itemCode]
    ){

      inventory[itemCode] = 0;

    }

    inventory[itemCode] += qtyIn;

    inventory[itemCode] -= qtyOut;

  }

  return inventory;

}

/* =========================
   INVENTORY AS OF REPORT
========================= */

function getInventoryAsOf(reportDate){

  const inventorySheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "InventoryMovements"
      );

  const rawSheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "RawMaterials"
      );

  const inventoryData =
    inventorySheet
      .getDataRange()
      .getValues();

  const materials =
    rawSheet
      .getDataRange()
      .getValues();

  let stock = {};

  const asOfDate =
    new Date(reportDate);

  for(let i = 1; i < inventoryData.length; i++){

    const transactionDate =
      new Date(
        inventoryData[i][1]
      );

    if(transactionDate > asOfDate){
      continue;
    }

    const itemCode =
      inventoryData[i][4];

    const qtyIn =
      Number(inventoryData[i][5]) || 0;

    const qtyOut =
      Number(inventoryData[i][6]) || 0;

    if(!stock[itemCode]){
      stock[itemCode] = 0;
    }

    stock[itemCode] += qtyIn;
    stock[itemCode] -= qtyOut;

  }

  let result = {};

  for(let i = 1; i < materials.length; i++){

    const category =
      materials[i][3];

    const itemCode =
      materials[i][1];

    const unit =
      materials[i][6];

    if(!result[category]){
      result[category] = [];
    }

    result[category].push({

      code: itemCode,

      stock:
        stock[itemCode] || 0,

      unit:
        unit

    });

  }

  return result;

}

/* =========================
   FG INVENTORY AS OF
========================= */

function getFinishedGoodsInventoryAsOf(
  reportDate
){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "InventoryMovements"
      );

  const data =
    sheet
      .getDataRange()
      .getValues();

  const asOfDate =
    new Date(reportDate);

  let inventory = {};

  for(let i = 1; i < data.length; i++){

    const transactionDate =
      new Date(
        data[i][1]
      );

    if(transactionDate > asOfDate){
      continue;
    }

    if(data[i][3] != "FG"){
      continue;
    }

    const itemCode =
      data[i][4];

    const qtyIn =
      Number(data[i][5]) || 0;

    const qtyOut =
      Number(data[i][6]) || 0;

    if(!inventory[itemCode]){

      inventory[itemCode] = 0;

    }

    inventory[itemCode] += qtyIn;
    inventory[itemCode] -= qtyOut;

  }

  return inventory;

}

/* =========================
   INVENTORY CHECK
========================= */

function hasEnoughInventory(
  itemCode,
  requiredQty
){

  const availableQty =
    getCurrentStock(
      itemCode
    );

  return (
    availableQty >= requiredQty
  );

}
function getInventoryBalance(
  itemCode
){

  return getCurrentStock(
    itemCode
  );

}

/* =========================
   FG AVAILABLE FOR SALE
========================= */

function getFGAS(){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "InventoryMovements"
      );

  const data =
    sheet
      .getDataRange()
      .getValues();

  let inventory = {};

  for(let i = 1; i < data.length; i++){

    if(data[i][3] != "FG"){
      continue;
    }

    const itemCode =
      data[i][4];

    const qtyIn =
      Number(data[i][5]) || 0;

    const qtyOut =
      Number(data[i][6]) || 0;

    if(!inventory[itemCode]){

      inventory[itemCode] = 0;

    }

    inventory[itemCode] += qtyIn;
    inventory[itemCode] -= qtyOut;

  }

  return inventory;

}

