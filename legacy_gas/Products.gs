/* =========================
   PRODUCTS
========================= */

function getProducts(){

  const sheet =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "Products"
      );

  return sheet
    .getDataRange()
    .getValues();

}

/* =========================
   PRODUCTS LIST
========================= */

function getProductList(){

  const sheet =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "Products"
      );

  const data =

    sheet
      .getDataRange()
      .getValues();

  let products = [];

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    if(
      data[i][4] == "ACTIVE"
    ){

      products.push({

        code:
          data[i][1],

        name:
          data[i][2],

        sellingPrice:
          Number(
            data[i][3]
          )

      });

    }

  }

  return products;

}