async function printToExcel(reportName) {
    switch(reportName) {
        case 'summary':
            const dataSource = "./Data/DB_SUMMARY.json";
            const cFileName1 = "RTRG Summary Sales.xlsx";
            
            const HEADER1_ROW = [
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
          
            const SUMMARY_ROWS = await fetchDataAndPopulateRows(dataSource);
            if (!SUMMARY_ROWS) return;  // Exit if there was an error
                    
            const data1 = [
                [{ type: String, value: 'RTRG Sales Report ', fontWeight: 'bold', fontFamily: 'Calibri', fontSize: 12, fontStyle: 'italic' }],
                [{ value: 'Store Sales Summary', 
                   fontStyle: 'italic', align: 'left', fontFamily: 'Times New Roman' }],
                [{ value: ''}],
                HEADER1_ROW,
                ...SUMMARY_ROWS  // Use spread operator to include DETAIL_ROWS
            ];

            printDetails(data1,cFileName1)
            break;

        case 'daily':
            const dataSource2 = './Data/DB_WEB_DATA.json';

            try {
                const dailySales = await printDailySales(dataSource2);
                console.log(dailySales);
        
                const DAILY_ROWS = await createDetailRows(dailySales);
                if (!DAILY_ROWS) return;  // Exit if there was an error

                // Create HEADER2_ROW from the keys of the first dailySales entry
                const keys = Object.keys(dailySales[0]);
                const HEADER2_ROW = keys.map(key => ({
                    value: key.toUpperCase(),  // Convert to uppercase for consistency
                    fontWeight: 'bold',
                    align: 'center',
                }));
       
                const data2 = [
                    [{ type: String, value: 'RTRG Sales Report ', fontWeight: 'bold', fontFamily: 'Calibri', fontSize: 12, fontStyle: 'italic' }],
                    [{ value: 'Daily Sales Summary', 
                       fontStyle: 'italic', align: 'left', fontFamily: 'Times New Roman' }],
                    [{ value: '' }],
                    HEADER2_ROW,
                    ...DAILY_ROWS  // Use DAILY_ROWS populated by fetchDataAndPopulateRows
                ];
        
                const cFileName2 = "RTRG Daily Sales Summary.xlsx";
                printDetails(data2, cFileName2);
            } catch (error) {
                console.error('Error fetching daily sales:', error);
            }
            break;

        default:
            alert('Procedure to print is not available yet');
            break;
      }    
}


async function printDailySales(dataSource) {
    const response = await fetch(dataSource);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const jsonData = await response.json();
    const results = {};

    // Parse data and accumulate totalamt
    jsonData.forEach(entry => {
        const { storegrp, storname, date____, totalamt } = entry;
        const dateObj = new Date(date____);
        const formattedDate = formatDateDayName(dateObj);

        if (!results[storegrp]) results[storegrp] = {};
        if (!results[storegrp][storname]) results[storegrp][storname] = { dailyTotals: {} };

        // Initialize daily totals for each store
        results[storegrp][storname].dailyTotals[formattedDate] = 
            (results[storegrp][storname].dailyTotals[formattedDate] || 0) + totalamt;
    });

    // Determine the maximum date
    const maxDate = new Date(Math.max(...jsonData.map(entry => new Date(entry.date____))));
    const startOfMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    // Calculate number of days from the 1st of the month to maxDate (inclusive)
    const numDays = Math.ceil((maxDate - startOfMonth) / (1000 * 60 * 60 * 24)) + 1;
    const finalOutput = [];
    
    // Generate output
    Object.keys(results).forEach(storegrp => {
        Object.keys(results[storegrp]).forEach(storname => {
            const dailyTotals = results[storegrp][storname].dailyTotals;
            const output = {
                storegrp,
                storname,
            };

            // Initialize totals from the 1st of the month to maxDate
            for (let i = 0; i < numDays; i++) {
                const dateKey = new Date(startOfMonth);
                dateKey.setDate(startOfMonth.getDate() + i);
                const formattedDate = formatDateDayName(dateKey);

                // Generate the key in the "MM/DD-Day" format
                const dayName = dateKey.toLocaleString('en-US', { weekday: 'short' });
                const dateWithDay = `${formattedDate}-${dayName}`;

                output[dateWithDay] = dailyTotals[formattedDate] || 0; // Default to 0 if no data
            }

            // Calculate total sum and daily average
            output.totalSum = Object.values(output).slice(2).reduce((acc, curr) => acc + curr, 0);
            output.dailyAvg = numDays ? output.totalSum / numDays : 0; // Average over the number of days

            finalOutput.push(output);
        });
    });

    // Sort finalOutput by storegrp, storname, and totalSum in descending order
    finalOutput.sort((a, b) => {
        if (a.storegrp < b.storegrp) return -1;
        if (a.storegrp > b.storegrp) return 1;
        // if (a.storname < b.storname) return -1;
        // if (a.storname > b.storname) return 1;
        return b.totalSum - a.totalSum; // Descending order for totalSum
    });    

    // console.log(finalOutput);
    return finalOutput;
}

// Helper function to format date as "MM/DD"
function formatDateDayName(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
}


async function printDetails(data,cFileName) {

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
  const columns = await createDynamicColumns(data);

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

  function createDetailRows(jsonData) {
    const DETAIL_ROWS = [];
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
