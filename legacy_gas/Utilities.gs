/* =========================
   RECIPES
========================= */

function getRecipe(productCode){

  const sheet =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "Recipes"
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
      data[i][1] == productCode
    ){

      return {

        oilCode:
          data[i][3],

        oilML:
          Number(data[i][4]),

        easyBlendML:
          Number(data[i][5]),

        bottleCode:
          data[i][6],

        bottleQty:
          Number(data[i][7]),

        bottleStickerCode:
          data[i][8],

        bottleStickerQty:
          Number(data[i][9]),

        boxCode:
          data[i][10],

        boxQty:
          Number(data[i][11]),

        boxStickerCode:
          data[i][12],

        boxStickerQty:
          Number(data[i][13]),

        shrinkCode:
          data[i][14],

        shrinkQty:
          Number(data[i][15])

      };

    }

  }

  return null;

}

/* =========================
   SYSTEM SETTINGS
========================= */

function getSetting(settingName){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "SystemSettings"
      );

  const data =
    sheet
      .getDataRange()
      .getValues();

  for(let i = 1; i < data.length; i++){

    if(
      data[i][0] ==
      settingName
    ){

      return data[i][1];

    }

  }

  return null;

}


function toNumber(value){

  return Number(value) || 0;

}
