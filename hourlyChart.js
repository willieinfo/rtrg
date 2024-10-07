// Function to set up the hourly chart
function setHourlyChart(selectedStore = '', selectedGroup = '') {
    let aHourLabel = [
        '12am', '01am', '02am', '03am', '04am', '05am', '06am', '07am', '08am', '09am', '10am', '11am',
        '12pm', '01pm', '02pm', '03pm', '04pm', '05pm', '06pm', '07pm', '08pm', '09pm', '10pm', '11pm'
    ];
    
    // Initialize an empty array for hourly sales totals
    let aHourSales = new Array(aHourLabel.length).fill(0);

    let dataSource3 = './Data/DB_HOURSALES.json';
    if (dateScope==='OCT 2024') {
        dataSource3 = './Data/DB_HOURSALES.json';
    } else {
        dataSource3 = './Data/DB_HOURSALES_SEP.json';
    }
    
    // Fetch the JSON data
    fetch(dataSource3)
        .then(response => response.json())
        .then(data => {
            // Trim whitespace from the selected filters
            const trimmedSelectedStore = selectedStore.trim();
            const trimmedSelectedGroup = selectedGroup.trim();

            // Filter data based on selectedGroup and selectedStore
            const filteredData = data.filter(entry => {

                if (multiStore.length > 0) {
                    if (!multiStore.includes(entry.storname.trim())) return 
                }
                
                const trimmedStoreName = entry.storname.trim();
                const trimmedGroupName = entry.storegrp.trim();
                const groupMatch = !trimmedSelectedGroup || trimmedSelectedGroup === 'All Business Group' || trimmedGroupName === trimmedSelectedGroup;
                const storeMatch = !trimmedSelectedStore || trimmedSelectedStore === 'All Stores' || trimmedStoreName === trimmedSelectedStore;
                return groupMatch && storeMatch;
            });

            // Aggregate the transaction counts per hour
            filteredData.forEach(entry => {
                const hourIndex = parseInt(entry.hourtime, 10);
                if (hourIndex >= 0 && hourIndex < aHourSales.length) {
                    aHourSales[hourIndex] += entry.trxcount;
                }
            });

            // Create or update the Chart.js chart
            const ctx = document.getElementById('myChart5').getContext('2d');
            if (myChart5) myChart5.destroy();

            myChart5 = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: aHourLabel,
                    datasets: [{
                        label: 'Hourly Sales',
                        data: aHourSales,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.4,
                        fill: true,
                        spanGaps: true,
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Transaction Count',
                                font: {
                                    family: 'Times New Roman',
                                    style: 'italic',
                                    size: 14  // You can adjust the font size if needed
                                }
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: "Hourly Transactions",
                            font: {
                                size: 14
                            }
                        },
                        legend: {
                            display: false
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}
