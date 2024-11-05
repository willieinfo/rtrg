async function setYTDChart(selectedStore = '', selectedGroup = '') {
    const dataSource = "./Data/DB_YTD_CHART.json";
    if (myChart8) myChart8.destroy();

    const response = await fetch(dataSource);
    const dataFormat = await response.json();
    
    let nTotalAmt=0

    const totals = {
        jan_amt_: 0, jan_amt1: 0, jan_amt2: 0,
        feb_amt_: 0, feb_amt1: 0, feb_amt2: 0,
        mar_amt_: 0, mar_amt1: 0, mar_amt2: 0,
        apr_amt_: 0, apr_amt1: 0, apr_amt2: 0,
        may_amt_: 0, may_amt1: 0, may_amt2: 0,
        jun_amt_: 0, jun_amt1: 0, jun_amt2: 0,
        jul_amt_: 0, jul_amt1: 0, jul_amt2: 0,
        aug_amt_: 0, aug_amt1: 0, aug_amt2: 0,
        sep_amt_: 0, sep_amt1: 0, sep_amt2: 0,
        oct_amt_: 0, oct_amt1: 0, oct_amt2: 0,
        nov_amt_: 0, nov_amt1: 0, nov_amt2: 0,
        dec_amt_: 0, dec_amt1: 0, dec_amt2: 0
    };

    dataFormat.forEach(item => {
        if (multiStore.length > 0) {
            if (!multiStore.includes(item.storname.trim())) return 
        }

        if ((selectedStore && item.storname !== selectedStore) || 
            (selectedGroup && item.storegrp !== selectedGroup)) {
            return;
        }

        for (let key of Object.keys(totals)) {
            // totals[key] += item[key];

            // Always populate totals (no filter for totals)
            if (item[key] != null) {  // Check if the value is not null or undefined
                totals[key] += item[key];
            }

            // Only sum '_amt_' keys for nTotalAmt (filter for _amt_ keys)
            if (key.includes('_amt_') && item[key] != null) {
                nTotalAmt += item[key]; // Full YTD total for the current year (only '_amt_' keys)
            }            

        }

        
    });

    // Round nTotalAmt to remove decimals
    nTotalAmt = Math.round(nTotalAmt); // Rounding off to the nearest integer
    // Format the total sales with thousands separators
    let formattedTotalAmt = new Intl.NumberFormat().format(nTotalAmt);
    // Set the total sales to the element with ID 'YTDTotal'
    document.getElementById('YTDTotal').innerHTML =  formattedTotalAmt;    

    const aLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const datasets = [];

    // Bar datasets for 2024, 2023, 2019
    datasets.push({
        label: '2024',
        data: aLabels.map((_, index) => totals[`${aLabels[index].toLowerCase()}_amt_`]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        type: 'bar'
    });

    datasets.push({
        label: '2023',
        data: aLabels.map((_, index) => totals[`${aLabels[index].toLowerCase()}_amt2`]),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        type: 'bar'
    });

    datasets.push({
        label: '2019',
        data: aLabels.map((_, index) => totals[`${aLabels[index].toLowerCase()}_amt1`]),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        type: 'bar'
    });

    //Line datasets for 2024, 2023
    // datasets.push({
    //     // label: '2024 Line',
    //     data: aLabels.map((_, index) => totals[`${aLabels[index].toLowerCase()}_amt_`] || null),
    //     borderColor: 'rgba(75, 192, 192, 1)',
    //     fill: false,
    //     type: 'line',
    //     tension: 0.2,
    //     spanGaps: true,
    //     borderWidth: 0.5,
    // });

    // datasets.push({
    //     // label: '2023 Line',
    //     data: aLabels.map((_, index) => totals[`${aLabels[index].toLowerCase()}_amt2`] || null),
    //     borderColor: 'rgba(255, 99, 132, 1)',
    //     fill: false,
    //     type: 'line',
    //     tension: 0.2,
    //     spanGaps: true,
    //     borderWidth: 0.5,
    // });

    const ctx = document.getElementById('myChart8').getContext('2d');
    myChart8 = new Chart(ctx, {
        type: 'bar',  // Use 'bar' for the main chart type
        data: {
            labels: aLabels,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: false,
                    text: "Monthly Sales Trend",
                    font: {
                        size: 14
                    }
                },
                legend: {
                    display: true,
                    position: 'right'
                }
            }
        }
    });

    return;
}
