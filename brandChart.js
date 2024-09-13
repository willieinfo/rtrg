async function fetchBrandSales(selectedStore = '', selectedGroup = '') {
    const dataSource = './Data/DB_BRANDSALE.json';
    try {
        const response = await fetch(dataSource);
        if (!response.ok) throw new Error('Network response was not ok');
        const brandData = await response.json();

        const brandMap = {};

        brandData.forEach(item => {
            if (selectedGroup && selectedGroup !== 'All Business Group' && item.storegrp !== selectedGroup) return;
            if (selectedStore && selectedStore !== 'All Stores' && item.storname !== selectedStore) return;

            if (!brandMap[item.brandnme]) {
                brandMap[item.brandnme] = { curreamt: 0, prvyramt: 0 };
            }
            brandMap[item.brandnme].curreamt += item.curreamt;
            brandMap[item.brandnme].prvyramt += item.prvyramt;
        });

        let sortedBrands = Object.entries(brandMap)
            .map(([brandnme, values]) => ({ brandnme, ...values }))
            .sort((a, b) => b.curreamt - a.curreamt)
            .slice(0, 30);

        const labels = sortedBrands.map(item => item.brandnme.substring(0, 15));
        const curreamtData = sortedBrands.map(item => item.curreamt);
        const prvyramtData = sortedBrands.map(item => item.prvyramt);

        // Calculate the maximum value for the x-axis
        const maxCurreamt = Math.max(...curreamtData);
        const maxPrvyramt = Math.max(...prvyramtData);
        const maxValue = Math.max(maxCurreamt, maxPrvyramt);

        if (myChart3) myChart3.destroy();
        if (myChart4) myChart4.destroy();

        const getChartOptions = () => ({
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: maxValue, // Set the maximum value for both charts
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
