function printDailySales() {
    const dataSource = './data/DB_WEB_DATA.json';

    fetch(dataSource)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(jsonData => {
            const results = {};
    
            // Parse data and accumulate totalamt
            jsonData.forEach(entry => {
                const { storegrp, storname, date____, totalamt } = entry;
                const dateObj = new Date(date____);

                if (!results[storegrp]) results[storegrp] = {};
                if (!results[storegrp][storname]) results[storegrp][storname] = {};

                // Initialize daily totals for each store
                if (!results[storegrp][storname].dailyTotals) {
                    results[storegrp][storname].dailyTotals = {};
                }
                results[storegrp][storname].dailyTotals[formatDateDayName(dateObj)] = 
                (results[storegrp][storname].dailyTotals[formatDateDayName(dateObj)] || 0) + totalamt;

            });

            // Determine the maximum date
            const maxDate = new Date(Math.max(...jsonData.map(entry => new Date(entry.date____))));
            const startOfMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

            // Calculate number of days from the 1st of the month to maxDate (inclusive)
            const numDays = Math.ceil((maxDate - startOfMonth) / (1000 * 60 * 60 * 24)) + 1;
            const finalOutput = [];
        
            //Generate output
            Object.keys(results).forEach(storegrp => {
                Object.keys(results[storegrp]).forEach(storname => {
                    const dailyTotals = results[storegrp][storname].dailyTotals;
                    const output = {
                        storegrp,
                        storname,
                        dailyAvg: 0,
                        totalSum: 0,
                    };

                    // Initialize totals from the 1st of the month to maxDate
                    for (let i = 0; i < numDays; i++) {
                        const dateKey = new Date(startOfMonth);
                        dateKey.setDate(startOfMonth.getDate() + i); // No need to set date again
                        const formattedDate =formatDateDayName(dateKey)
                        //console.log(formattedDate);

                        output[formattedDate] = dailyTotals[formattedDate] || 0; // Default to 0 if no data
                    }

                    // Calculate total sum and daily average
                    output.totalSum = Object.values(output).slice(2).reduce((acc, curr) => acc + curr, 0); // Sum from date fields
                    output.dailyAvg = output.totalSum / numDays; // Average over the number of days

                    finalOutput.push(output);
                });
            });

            
                // Print or use the final output as needed
               console.log(finalOutput);
               return finalOutput
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
        });
}

function formatDateDayName(date) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const dayOfWeek = dayNames[date.getDay()];
    return `${month}/${day}-${dayOfWeek}`;// Outputs MM-DD-dayNames
}

// function formatDateToISOString(date) {
//     const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
//     return localDate.toISOString().split('T')[0]; // Outputs YYYY-MM-DD
// }

// function formatDateToMMDDYYYY(date) {
//     const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
//     const day = String(date.getDate()).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${month}/${day}/${year}`;
// }

