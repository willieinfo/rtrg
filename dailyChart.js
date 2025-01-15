// Function to set up the daily chart
function setDailyChart(selectedStore = '', selectedGroup = '') {
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
    minDate.setDate(minDate.getDate() - 31); // 31 days before maxDate

    // console.log('Max Date: ', maxDate.toLocaleDateString('en-US'));
    // console.log('Min Date: ', minDate.toLocaleDateString('en-US'));

    // Dynamically update the dateScope innerText first option
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const maxDateString = maxDate.toLocaleDateString('en-US', options);
    const displayText = `${maxDateString.split(' ')[0]} ${1}-${maxDate.getDate()}, ${maxDate.getFullYear()}`;
    const selectElement = document.getElementById('dateScope');
    if (selectElement.options.length > 0) {
        selectElement.options[0].text = displayText; // Change the first option's text
    }

    // Filter data between minDate and maxDate
    const filteredData = chartData.filter(entry => {
        const entryDate = new Date(entry.date____);
        return entryDate >= minDate && entryDate <= maxDate;
    });

    filteredData.forEach(entry => {
        const dayName = new Date(entry.date____);
        const dayOfWeek = dayNames[dayName.getDay()];
        const date = entry.date____.substring(0, 5) + ' ' + dayOfWeek;
        const total = Math.round(entry.totalamt);

        // Apply filters based on selectedGroup and selectedStore
        if (multiStore.length > 0 && !multiStore.includes(entry.storname.trim())) {
            return; // Skip this entry if the store is not in the multiStore
        }
        if (selectedGroup && selectedGroup !== 'All Business Group' && entry.storegrp !== selectedGroup) {
            return; // Skip if the group doesn't match
        }
        if (selectedStore && selectedStore !== 'All Stores' && entry.storname !== selectedStore) {
            return; // Skip if the selected store doesn't match
        }

        // Accumulate totals by date
        if (!dateTotals[date]) {
            dateTotals[date] = 0;
        }
        dateTotals[date] += total;

        // Set background color for weekends
        backgroundColors.push(dayName.getDay() === 0 ? 'rgba(255,0,0,0.2)' : 'rgba(75, 192, 192, 0.2)');
        borderWidth.push(dayName.getDate() === 1 ? 2 : 1); // Emphasize first day
        borderColor.push(dayName.getDate() === 1 ? 'rgb(0,0,0)' : 'rgba(75, 192, 192, 1)');
        // borderColor.push(dayName.getDate() === 1 ? 'rgba(75, 192, 192, 1)' : 'rgba(75, 192, 192, 1)');
    });

    // Sort the date labels and format them as '12/12-Th', '13/12-Fr', etc.
    const aLabels = Object.keys(dateTotals).sort((a, b) => new Date(a) - new Date(b));
    const aTotals = aLabels.map(date => dateTotals[date]);

    // Create datasets
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

    // Initialize chart with sorted labels
    myChart1 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: aLabels, // X-axis labels sorted chronologically
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
