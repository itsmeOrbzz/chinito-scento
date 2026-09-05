function getRawMaterials(){

  const sheet =

    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "RawMaterials"
      );

  const data =

    sheet
      .getDataRange()
      .getValues();

  let materials = [];

  for(
    let i = 1;
    i < data.length;
    i++
  ){

    if(
      data[i][8] == "ACTIVE"
    ){

      materials.push({
  code: data[i][1],
  description: data[i][2],
  category: data[i][3],
  unit: data[i][6]
});

    }

  }

  return materials;

}
