async function setStoreChart(selectedStore = '', selectedGroup = '') {
    try {
        const storeData = chartData;

        // Destroy existing charts if they exist
        if (myChart6) myChart6.destroy();   
        if (myChart7) myChart7.destroy();

        const trimmedSelectedStore = selectedStore.trim();
        const trimmedSelectedGroup = selectedGroup.trim();

        // Filter data based on selectedGroup and selectedStore
        const filteredData = storeData.filter(entry => {
            const trimmedStoreName = entry.storname.trim();
            const trimmedGroupName = entry.storegrp.trim();
            const groupMatch = !trimmedSelectedGroup || trimmedSelectedGroup === 'All Business Group' || trimmedGroupName === trimmedSelectedGroup;
            const storeMatch = !trimmedSelectedStore || trimmedSelectedStore === 'All Stores' || trimmedStoreName === trimmedSelectedStore;
            return groupMatch && storeMatch;
        });

        // Check if there's any filtered data
        if (filteredData.length === 0) {
            console.error('No data available for the selected filters and date range.');
            return;
        }

        // Get the highest date
        const highestDate = new Date(Math.max(...filteredData.map(entry => new Date(entry.date____))));
        
        // Define the start date (for example, 15 days back from the highest date)
        const startDate = new Date(highestDate);
        startDate.setDate(highestDate.getDate() - 14); // Adjust this range as needed

        // Filter data by the date range
        const dateFilteredData = filteredData.filter(entry => {
            const entryDate = new Date(entry.date____);
            return entryDate >= startDate && entryDate <= highestDate;
        });

        // Aggregate totalamt per storname
        const storeTotals = dateFilteredData.reduce((acc, entry) => {
            const totalAmount = parseFloat(entry.totalamt) || 0;
            const storeName = entry.storname.trim(); // Ensure store name is trimmed

            // Accumulate total amounts by store name
            acc[storeName] = (acc[storeName] || 0) + totalAmount;
            return acc;
        }, {});

        // Convert aggregated data into an array for charting
        const topStores = Object.entries(storeTotals)
            .sort((a, b) => b[1] - a[1]) // Sort by totalamt in descending order
            .slice(0, 30); // Take the top 30 stores

        const storeNames = topStores.map(entry => entry[0]); // Store names
        const storeAmounts = topStores.map(entry => entry[1]); // Total amounts

        // console.log(storeNames);
        // console.log(storeAmounts);

        // Create the horizontal bar chart (myChart6)
        const ctx1 = document.getElementById('myChart6').getContext('2d');
        myChart6 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: storeNames,
                datasets: [{
                    label: 'Top 30 Stores',
                    data: storeAmounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        ticks: {
                            font: {
                                family: 'Arial Narrow',
                                size: 10
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                    }
                }
            }
        });

        // Prepare data for the doughnut chart (Contribution to Total Sales by store group)
        const storeGroupTotals = dateFilteredData.reduce((acc, entry) => {
            const totalAmount = parseFloat(entry.totalamt) || 0;
            const storeGroup = entry.storegrp.trim(); // Ensure group name is trimmed
            acc[storeGroup] = (acc[storeGroup] || 0) + totalAmount;
            return acc;
        }, {});

        // Sort store groups by total amount in descending order
        const sortedStoreGroups = Object.entries(storeGroupTotals).sort((a, b) => b[1] - a[1]);

        const storeGroupLabels = sortedStoreGroups.map(entry => entry[0]);
        const storeGroupValues = sortedStoreGroups.map(entry => entry[1]);

        const totalSales = Object.values(storeGroupTotals).reduce((acc, value) => acc + value, 0); // Calculate total sales
        const storeGroupPercentages = storeGroupValues.map(value => (value / totalSales * 100).toFixed(2)); // Calculate percentages

        const generateRandomColor = () => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `rgba(${r}, ${g}, ${b}, 0.6)`;
        };

        const backgroundColors = storeGroupLabels.map(() => generateRandomColor());
        const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

        // Create the doughnut chart (myChart7)
        const ctx2 = document.getElementById('myChart7').getContext('2d');
        myChart7 = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: storeGroupLabels,
                datasets: [{
                    label: 'Contribution to Total Sales',
                    data: storeGroupValues,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: 'Arial Narrow',
                                size: 10
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = storeGroupPercentages[context.dataIndex]; // Get the percentage for the corresponding label
                                const value = context.raw || 0;
                                // return `${value.toLocaleString()} ${percentage}%`; 
                                return `${percentage}%`; 
                            }
                        }
                    },

                    // Display percentage on the chart itself
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        formatter: (value, context) => {
                            const percentage = storeGroupPercentages[context.dataIndex]; // Get the percentage for the corresponding value
                            return `${percentage}%`;
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: '10'
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error processing chart data:', error);
    }
}
