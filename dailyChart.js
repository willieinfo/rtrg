// Function to set up the daily chart
function setDailyChart(selectedStore = '',selectedGroup = '') {
    const dateTotals = {};
    const backgroundColors = [];
    const borderWidth = [];
    const borderColor = [];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const ctx = document.getElementById('myChart1').getContext('2d');

    if (myChart1) myChart1.destroy();

    // Dates and totals
    const dates = chartData.map(entry => new Date(entry.date____));
    const maxDate = new Date(Math.max(...dates));
    const minDate = new Date(maxDate);
    minDate.setDate(minDate.getDate() - 31);

    const filteredData = chartData.filter(entry => {
        const entryDate = new Date(entry.date____);
        return entryDate >= minDate && entryDate <= maxDate;
    });

    console.log(multiStore)
    filteredData.forEach(entry => {
        const dayName = new Date(entry.date____);
        const dayOfWeek = dayNames[dayName.getDay()];
        const date = entry.date____.substring(0, 5) + ' ' + dayOfWeek;
        const total = Math.round(entry.totalamt);


        // Check if multiStore is populated and if the store is included
        if (multiStore.length > 0 && !multiStore.includes(entry.storname.trim())) {
            return; // Skip this entry if the store is not in the multiStore
        }
        // Apply filters based on selectedGroup and selectedStore
        if (selectedGroup && selectedGroup !== 'All Business Group' && entry.storegrp !== selectedGroup) {
            return; // Skip if the group doesn't match
        }
        if (selectedStore && selectedStore !== 'All Stores' && entry.storname !== selectedStore) {
            return; // Skip if the selected store doesn't match
        }


        if (!dateTotals[date]) {
            dateTotals[date] = 0;
        }
        dateTotals[date] += total;

        backgroundColors.push(dayName.getDay() === 0 ? 'rgba(255,0,0,0.2)' : 'rgba(75, 192, 192, 0.2)');
        // borderWidth.push(dayName.getDate() === 1 ? 2 : 1);
        borderWidth.push(dayName.getDate() === 1 ? 1 : 1);
        borderColor.push(dayName.getDate() === 1 ? 'rgb(0,0,0)' : 'rgba(75, 192, 192, 1)');
    });

    const aLabels = Object.keys(dateTotals).sort();
    const aTotals = aLabels.map(date => dateTotals[date]);

    const oDataSetBar = {
        label: 'Day Total',
        data: aTotals,
        backgroundColor: backgroundColors,
        borderColor: borderColor,
        borderWidth: borderWidth,
        type: 'bar'
    };

    const oDataSetLine = {
        label: 'Day Total',
        data: aTotals,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderWidth: 0.5,
        tension: 0.2,
        type: 'line'
    };

    myChart1 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: aLabels,
            datasets: [oDataSetBar, oDataSetLine]
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
                    text: "Daily Store Sale Totals",
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
}
