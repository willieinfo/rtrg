async function fetchBrandSales(selectedStore = '', selectedGroup = '') {
    const dataSource = './Data/DB_BRANDSALE.json'; // Replace with actual path to your JSON file
    try {
        const response = await fetch(dataSource);
        const brandData = await response.json();

        // Process the data
        const brandMap = {};

        // Group by brand and sum the values
        brandData.forEach(item => {
            // Apply filters based on selectedGroup and selectedStore
            if (selectedGroup && selectedGroup !== 'All Business Group' && item.storegrp !== selectedGroup) return;
            if (selectedStore && selectedStore !== 'All Stores' && item.storname !== selectedStore) return;

            if (!brandMap[item.brandnme]) {
                brandMap[item.brandnme] = {
                    curreamt: 0,
                    prvyramt: 0
                };
            }
            brandMap[item.brandnme].curreamt += item.curreamt;
            brandMap[item.brandnme].prvyramt += item.prvyramt;
        });

        // Convert the object to an array and sort by curreamt in descending order
        let sortedBrands = Object.entries(brandMap)
            .map(([brandnme, values]) => ({ brandnme, ...values }))
            .sort((a, b) => b.curreamt - a.curreamt)
            .slice(0, 30); // Get the top 30 brands

        // Prepare the labels and datasets for Chart.js
        const labels = sortedBrands.map(item => item.brandnme.substring(0, 15));
        const curreamtData = sortedBrands.map(item => item.curreamt);
        const prvyramtData = sortedBrands.map(item => item.prvyramt);

        // Destroy existing charts if they exist
        if (myChart3) myChart3.destroy();
        if (myChart4) myChart4.destroy();

        // Create the chart for current year
        const ctx3 = document.getElementById('myChart3').getContext('2d');
        myChart3 = new Chart(ctx3, {
            type: 'bar', // Type is 'bar' but with horizontal orientation
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '2024',
                        data: curreamtData,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: false,
                            text: 'Amount',
                            font: {
                                family: 'Arial',
                                size: 10,
                                weight: 'bold',
                                style: 'italic'
                            }
                        },
                        ticks: {
                            font: {
                                family: 'Arial Narrow',
                                size: 10,
                                weight: 'normal',
                                style: 'normal'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: false,
                            text: 'Brand Name'
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                family: 'Arial Narrow',
                                size: 10,
                                weight: 'normal',
                                style: 'normal'
                            }
                        }
                    }
                }
            }
        });

        // Create the chart for previous year
        const ctx4 = document.getElementById('myChart4').getContext('2d');
        myChart4 = new Chart(ctx4, {
            type: 'bar', // Type is 'bar' but with horizontal orientation
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '2019',
                        data: prvyramtData,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: false,
                            text: 'Amount',
                            font: {
                                family: 'Arial',
                                size: 10,
                                weight: 'bold',
                                style: 'italic'
                            }
                        },
                        ticks: {
                            font: {
                                family: 'Arial',
                                size: 10,
                                weight: 'normal',
                                style: 'normal'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: false,
                            text: 'Brand Name'
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                family: 'Arial Narrow',
                                size: 10,
                                weight: 'normal',
                                style: 'normal'
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
