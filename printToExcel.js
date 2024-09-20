function printToExcel(reportName) {
    switch(reportName) {
        case 'summary':
            const dataSource = "./Data/DB_SUMMARY.json";
            const cFileName = "RTRG Summary Sales.xlsx";
            
            const HEADER_ROW = [
                { value: 'Business Unit', fontWeight: 'bold', align: 'center' },
                { value: 'Store Name', fontWeight: 'bold', align: 'center' },
                { value: 'TRX', fontWeight: 'bold', align: 'center' },
                { value: 'Net Sales', fontWeight: 'bold', align: 'center' },
                { value: 'Cost', fontWeight: 'bold', align: 'center' },
                { value: 'GP', fontWeight: 'bold', align: 'center' },
                { value: 'PrevYear', fontWeight: 'bold', align: 'center' },
                { value: 'PrevMonth', fontWeight: 'bold', align: 'center' },
                { value: 'PrePandemic', fontWeight: 'bold', align: 'center' }
            ];
          
            printDetails(dataSource,cFileName,HEADER_ROW)
            break;
        case 'daily':
            alert('Procedure to print daily is not available yet');
            break;
        default:
            alert('Procedure to print is not available yet');
            break;
      }    
}


async function printDetails(dataSource,cFileName,HEADER_ROW) {

  const DETAIL_ROWS = await fetchDataAndPopulateRows(dataSource);
  if (!DETAIL_ROWS) return;  // Exit if there was an error

  const data = [
      [{ type: String, value: 'RTRG Sales Report ', fontWeight: 'bold', fontFamily: 'Calibri', fontSize: 12, fontStyle: 'italic' }],
      [{ type: Date, value: '', 
         fontStyle: 'italic', align: 'left', fontFamily: 'Times New Roman' }],
      HEADER_ROW,
      ...DETAIL_ROWS  // Use spread operator to include DETAIL_ROWS
  ];

//   const columns = [
//       { width: 20 },
//       { width: 20 },
//       { width: 16 },
//       { width: 16 },
//       { width: 16 },
//       { width: 16 },
//       { width: 16 },
//       { width: 16 },
//       { width: 16 }
//   ];

  // Or dynamically create columns based on the data
  const columns = createDynamicColumns(data);
  console.log(columns)

  writeXlsxFile(data, {
      fileName: cFileName,
      fontFamily: 'Calibri',
      fontSize: 11,
      columns
  });
}


async function fetchDataAndPopulateRows(dataSource) {
    const DETAIL_ROWS = [];
  
    try {
        const response = await fetch(dataSource);
        const jsonData = await response.json();
  
        // Ensure jsonData is an array and has at least one item to get keys
        if (Array.isArray(jsonData) && jsonData.length > 0) {
            const keys = Object.keys(jsonData[0]); // Get keys from the first item
  
            // Populate DETAIL_ROWS from jsonData using the dynamically determined keys
            jsonData.forEach(item => {
                const row = keys.map(key => {
                    const value = item[key];
  
                    // Determine the type and formatting for numeric values
                    if (typeof value === 'number') {
                        return { type: Number, value: value, format: '#,##0.00' };
                    } else {
                        return { value: value };
                    }
                });
  
                DETAIL_ROWS.push(row);
            });
        }
  
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Could not load data for the report.");
        return null;  // Return null in case of error
    }
  
    return DETAIL_ROWS;  // Return the populated DETAIL_ROWS
  }
  

  function createDynamicColumns(data) {
    const columns = [];

    // Get the number of columns from the first row of data
    const numberOfColumns = data[0].length;

    // Initialize an array to hold the max widths for each column
    const maxWidths = new Array(numberOfColumns).fill(0);

    data.forEach(row => {
        row.forEach((cell, index) => {
            let cellValue = cell.value;

            // Handle the value based on its type
            if (typeof cellValue === 'number') {
                cellValue = cellValue.toString();
            } else if (typeof cellValue === 'string') {
                cellValue = cellValue.trim();
            } else {
                cellValue = ''; // Default for undefined or other types
            }
            // console.log(`Row: ${JSON.stringify(row)}, Index: ${index}, Cell Value: '${cellValue}', Length: ${cellValue.length}`);
            // Check if cellValue is a valid string and update max width
            if (cellValue && typeof cellValue === 'string') {
                maxWidths[index] = Math.max(maxWidths[index], cellValue.length);
            }
        });
    });

    // Create the columns array with calculated widths, ensuring no NaN
    maxWidths.forEach(width => {
        columns.push({ width: width > 0 ? width + 2 : 16 }); // Default to 16 if width is 0
    });

    return columns;
}
