/* =========================
   BATCH NUMBER GENERATOR
========================= */

function generateBatchNo(
  productCode,
  dateMixed
){

  const sheet =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "ProductionBatches"
      );

  const data =

    sheet
      .getDataRange()
      .getValues();

  const date =

    Utilities.formatDate(

      new Date(dateMixed),

      Session.getScriptTimeZone(),

      "yyyyMMdd"

    );

  let count = 0;

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    if(
      data[i][2] == productCode
    ){

      count++;

    }

  }

  count++;

  const series =

    String(count)
      .padStart(3,'0');

  return (

    productCode +

    "-" +

    date +

    "-" +

    series

  );

}

/* =========================
   BATCH PRODUCTION
========================= */
function saveBatch(batch){

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const batchSheet =
    ss.getSheetByName(
      "ProductionBatches"
    );

  const inventorySheet =
    ss.getSheetByName(
      "InventoryMovements"
    );

  const recipe =
    getRecipe(
      batch.productCode
    );

 if(!recipe){
  return {
    success: false,
    message: "Recipe not found."
  };
}

  const expected =
    Number(batch.expectedBottles);

  const requiredOil =
    recipe.oilML * expected;

  const requiredEasy =
    recipe.easyBlendML * expected;

  const requiredBottle =
    recipe.bottleQty * expected;

  const requiredBottleSticker =
    recipe.bottleStickerQty * expected;

  const requiredBox =
    recipe.boxQty * expected;

  const requiredBoxSticker =
    recipe.boxStickerQty * expected;

  const requiredShrink =
    recipe.shrinkQty * expected;

  const validations = [

    {
      code: recipe.oilCode,
      qty: requiredOil
    },

    {
      code: "EASY",
      qty: requiredEasy
    },

    {
      code: recipe.bottleCode,
      qty: requiredBottle
    },

    {
      code: recipe.bottleStickerCode,
      qty: requiredBottleSticker
    },

    {
      code: recipe.boxCode,
      qty: requiredBox
    },

    {
      code: recipe.boxStickerCode,
      qty: requiredBoxSticker
    },

    {
      code: recipe.shrinkCode,
      qty: requiredShrink
    }

  ];

  let shortages = [];

for(let i=0;i<validations.length;i++){

  const stock =
    getCurrentStock(
      validations[i].code
    );

  if(stock < validations[i].qty){

    shortages.push(
      validations[i].code +
      " | Available: " +
      stock +
      " | Required: " +
      validations[i].qty
    );

  }

}

if(shortages.length > 0){

  return {
    success:false,
    message:
      "Insufficient Inventory:\n\n" +
      shortages.join("\n")
  };

}
  

  const batchNo =
    generateBatchNo(
      batch.productCode,
      batch.dateMixed
    );

  const macerationDays =
    Number(
      getSetting(
        "MacerationDays"
      )
    );

  let readyDate =
    new Date(
      batch.dateMixed
    );

  readyDate.setDate(
    readyDate.getDate() +
    macerationDays
  );

  batchSheet.appendRow([

    "",
    batchNo,
    batch.productCode,
    batch.dateMixed,
    macerationDays,
    readyDate,
    expected,
    "",
    "",
    "",
    "Macerating",
    "",
    "",
    "",
    ""

  ]);

  const consumptions = [

    [recipe.oilCode,requiredOil,"Oil Consumption"],
    ["EASY",requiredEasy,"EasyBlend Consumption"],
    [recipe.bottleCode,requiredBottle,"Bottle Consumption"],
    [recipe.bottleStickerCode,requiredBottleSticker,"Bottle Sticker Consumption"],
    [recipe.boxCode,requiredBox,"Box Consumption"],
    [recipe.boxStickerCode,requiredBoxSticker,"Box Sticker Consumption"],
    [recipe.shrinkCode,requiredShrink,"Shrink Wrap Consumption"]

  ];

  consumptions.forEach(function(item){

    inventorySheet.appendRow([

      "",
      batch.dateMixed,
      "PRODUCTION-USE",
      "RAW",
      item[0],
      0,
      item[1],
      batchNo,
      item[2]

    ]);

  });


  return {
  success: true,
  message: "Batch Saved Successfully",
  batchNo: batchNo,
  readyDate: Utilities.formatDate(
    readyDate,
    Session.getScriptTimeZone(),
    "MMM dd, yyyy"
  )
};

}

function getReadyBatches(){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "ProductionBatches"
      );

  const data =
    sheet
      .getDataRange()
      .getValues();

  let batches = [];

  const today = new Date();

  today.setHours(
    0,0,0,0
  );

  for(let i=1;i<data.length;i++){

    const readyDate =
      new Date(data[i][5]);

    readyDate.setHours(
      0,0,0,0
    );

    let status =
      String(
        data[i][10] || ""
      ).trim();

    // Auto-update status
    if(
      readyDate <= today &&
      status === "Macerating"
    ){

      sheet.getRange(
        i + 1,
        11
      ).setValue(
        "Ready"
      );

      status = "Ready";

    }

    // Add to dropdown
    if(status === "Ready"){

      batches.push({

        row: i + 1,

        batchNo:
          data[i][1],

        productCode:
          data[i][2],

        expectedBottles:
          data[i][6]

      });

    }

  }

  return batches;

}



function getBatchTag(batchNo){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "ProductionBatches"
      );

  const data =
    sheet
      .getDataRange()
      .getValues();

  for(let i=1;i<data.length;i++){

    if(data[i][1] == batchNo){

      return {

        batchNo:data[i][1],

        productCode:data[i][2],

        dateMixed:data[i][3],

        macerationDays:data[i][4],

        readyDate:data[i][5],

        expectedBottles:data[i][6],

        status:data[i][10]

      };

    }

  }

  return null;

}

function completeBatch(
  rowNumber,
  actualBottles,
  completedBy,
  remarks
){

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const batchSheet =
    ss.getSheetByName(
      "ProductionBatches"
    );

  const inventorySheet =
    ss.getSheetByName(
      "InventoryMovements"
    );

  const row =
    Number(rowNumber);

  const data =
    batchSheet
      .getRange(row,1,1,15)
      .getValues()[0];

  const batchNo =
    data[1];

  const productCode =
    data[2];

  const expectedBottles =
    Number(data[6]);

  const variance =
    actualBottles -
    expectedBottles;

  batchSheet.getRange(
    row,
    8
  ).setValue(
    actualBottles
  );

  batchSheet.getRange(
    row,
    9
  ).setValue(
    variance
  );

  batchSheet.getRange(
    row,
    10
  ).setValue(
    completedBy
  );

  batchSheet.getRange(
    row,
    11
  ).setValue(
    "Released"
  );

  batchSheet.getRange(
    row,
    12
  ).setValue(
    remarks
  );

  batchSheet.getRange(
    row,
    15
  ).setValue(
    new Date()
  );

  inventorySheet.appendRow([

    "",

    new Date(),

    "PRODUCTION-COMPLETE",

    "FG",

    productCode,

    actualBottles,

    0,

    batchNo,

    "Finished Goods Produced"

  ]);

  return (
    "✅ Batch Completed Successfully<br><br>" +
    "Batch No: " +
    batchNo +
    "<br>" +
    "Actual Bottles: " +
    actualBottles +
    "<br>" +
    "Variance: " +
    variance
  );

}

