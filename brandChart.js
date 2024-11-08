async function fetchBrandSales(selectedStore = '', selectedGroup = '', selectedType = '') {
    const dateScope=dateCovered.toUpperCase()
    let dataSource = './Data/DB_BRANDSALE.json';
    if (dateScope==='NOV 2024') {
        dataSource = './Data/DB_BRANDSALE.json';
    } else if ('OCT 2024') {
        dataSource = './Data/DB_BRANDSALE_OCT.json';
    } else if ('SEP 2024') {
        dataSource = './Data/DB_BRANDSALE_SEP.json';
    }
    try {
        const response = await fetch(dataSource);
        if (!response.ok) throw new Error('Network response was not ok');
        const brandData = await response.json();

        const brandMap = {};
        brandData.forEach(item => {
            const storeName = item.storname.trim(); // Trim spaces
            
            if (multiStore.length > 0 && !multiStore.includes(storeName)) {
                return; // Skip this entry if the store is not in the multiStore
            }
            if (selectedGroup && selectedGroup !== 'All Business Group' && item.storegrp !== selectedGroup) {
                return; // Skip if the group doesn't match
            }
            if (selectedStore && selectedStore !== 'All Stores' && storeName !== selectedStore) {
                return; // Skip if the selected store doesn't match
            }
            if (selectedType && selectedType !== 'All Types' && selectedType !== item.outright) {
                return; 
            }
        
            if (!brandMap[item.brandnme]) {
                brandMap[item.brandnme] = { curreamt: 0, prvyramt: 0 };
            }
            brandMap[item.brandnme].curreamt += Math.round(item.curreamt);
            brandMap[item.brandnme].prvyramt += Math.round(item.prvyramt);
        });


        let sortedBrands = Object.entries(brandMap)
            .map(([brandnme, values]) => ({ brandnme, ...values }))
            .sort((a, b) => b.curreamt - a.curreamt)
            .slice(0, 30);

        const labels = sortedBrands.map(item => item.brandnme.substring(0, 15));
        const curreamtData = sortedBrands.map(item => item.curreamt);
        const prvyramtData = sortedBrands.map(item => item.prvyramt);

        // Function to round up to the nearest multiple of step
        // const roundUpToNearest = (value, step) => {
        //     return Math.ceil(value / step) * step;
        // };

        // Function to get the magnitude of a number (e.g., 1234 -> 1000)
        const getMagnitudeStep = (value) => {
            const magnitude = Math.floor(Math.log10(value));
            return Math.pow(10, magnitude); // Returns the nearest power of 10
        };

        // Function to round up to the nearest appropriate step
        const roundUpToDynamicStep = (value) => {
            const step = getMagnitudeStep(value);
            return Math.ceil(value / step) * step;
        };


        // Calculate the maximum value for the x-axis
        const maxCurreamt = Math.max(...curreamtData);
        const maxPrvyramt = Math.max(...prvyramtData);
        const maxValue = Math.max(maxCurreamt, maxPrvyramt);

        // Round up maxValue to the nearest appropriate step
        const roundedMaxValue = roundUpToDynamicStep(maxValue);

        if (myChart3) myChart3.destroy();
        if (myChart4) myChart4.destroy();

        const getChartOptions = () => ({
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: roundedMaxValue, // Use the dynamically rounded max value for both charts
                    title: { display: false },
                    ticks: {
                        font: { family: 'Arial Narrow', size: 10 }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: { display: false },
                    ticks: {
                        autoSkip: false,
                        font: { family: 'Arial Narrow', size: 10 }
                    }
                }
            }
        });

        const ctx3 = document.getElementById('myChart3').getContext('2d');
        myChart3 = new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: new Date().getFullYear(),
                    data: curreamtData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: getChartOptions()
        });

        const ctx4 = document.getElementById('myChart4').getContext('2d');
        myChart4 = new Chart(ctx4, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: new Date().getFullYear() - 1,
                    data: prvyramtData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: getChartOptions()
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        // Add UI feedback here if needed
    }
}
