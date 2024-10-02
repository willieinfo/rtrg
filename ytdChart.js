async function setYTDChart(selectedStore = '', selectedGroup = '') {
    const dataSource = "./Data/DB_YTD_CHART.json";
    if (myChart8) myChart8.destroy();   

    // Fetch the data from the source
    const response = await fetch(dataSource);
    const dataFormat = await response.json();

    // Initialize totals for the chart
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

    // Loop through the data to aggregate totals
    dataFormat.forEach(item => {
        // If filters are applied, check against them
        if ((selectedStore && item.storname !== selectedStore) || 
            (selectedGroup && item.storegrp !== selectedGroup)) {
            return;
        }

        // Aggregate the amounts
        for (let key of Object.keys(totals)) {
            totals[key] += item[key];
        }
    });

    // Prepare the labels and datasets
    const aLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const datasets = [];

    // Prepare data for the single aggregated dataset
    datasets.push({
        label: '2024',
        data: aLabels.map((_, index) => totals[`${aLabels[index].toLowerCase()}_amt_`]),
        // backgroundColor: 'rgba(75, 192, 192, 0.6)',
    });

    datasets.push({
        label: '2019',
        data: aLabels.map((_, index) => totals[`${aLabels[index].toLowerCase()}_amt1`]),
        // backgroundColor: 'rgba(153, 102, 255, 0.6)',
    });

    datasets.push({
        label: '2023',
        data: aLabels.map((_, index) => totals[`${aLabels[index].toLowerCase()}_amt2`]),
        // backgroundColor: 'rgba(255, 99, 132, 0.6)',
    });

    // Create the chart
    const ctx = document.getElementById('myChart8').getContext('2d'); // Ensure you have a canvas with id 'myChart'
    myChart8 = new Chart(ctx, {
        type: 'bar',
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
                    display: true,
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
