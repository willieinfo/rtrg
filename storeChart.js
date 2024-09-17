async function setStoreChart(selectedStore = '', selectedGroup = '') {
    try {
        // Use global chartData
        const storeData = chartData; 

        // Destroy existing charts if they exist
        if (myChart6) myChart6.destroy();   
        if (myChart7) myChart7.destroy();

        // Trim whitespace from the selected filters
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

        // Sort data by date in descending order
        filteredData.sort((a, b) => new Date(b.date____) - new Date(a.date____));

        // Get the highest date in the data
        const highestDate = filteredData[0]?.date____;
        const filteredRecentData = filteredData.filter(entry => entry.date____ === highestDate);

        // Check if there's data to display
        if (filteredRecentData.length === 0) {
            console.error('No data available for the selected filters and date range.');
            return;
        }

        // Prepare data for the horizontal bar chart (Top 30 Stores)
        const topStores = filteredRecentData
            .sort((a, b) => b.totalamt - a.totalamt)
            .slice(0, 30); // Take the top 30 stores

        const storeNames = topStores.map(entry => entry.storname);
        const storeAmounts = topStores.map(entry => entry.totalamt);

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
                indexAxis: 'y', // Make it a horizontal bar chart
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
        const storeGroupTotals = filteredRecentData.reduce((acc, entry) => {
            acc[entry.storegrp] = (acc[entry.storegrp] || 0) + entry.totalamt;
            return acc;
        }, {});

        // Sort store groups by total amount in descending order
        const sortedStoreGroups = Object.entries(storeGroupTotals).sort((a, b) => b[1] - a[1]);

        const storeGroupLabels = sortedStoreGroups.map(entry => entry[0]);
        const storeGroupValues = sortedStoreGroups.map(entry => entry[1]);

        // Dynamically generate colors for each store group
        const generateRandomColor = () => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `rgba(${r}, ${g}, ${b}, 0.6)`;
        };

        const backgroundColors = storeGroupLabels.map(() => generateRandomColor());
        const borderColors = backgroundColors.map(color => color.replace('0.6', '1')); // Make border color opaque

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
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value.toLocaleString()}`;
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error processing chart data:', error);
    }
}
