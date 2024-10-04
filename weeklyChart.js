function setWeeklyChart(selectedStore = '', selectedGroup = '') {
    const ctx = document.getElementById('myChart2').getContext('2d');
    if (myChart2) myChart2.destroy();

    // Helper function to parse date string into Date object
    function parseDate(dateStr) {
        const [month, day, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
    }

    // Helper function to get week ranges based on dynamic starting point
    function getWeekRange(startDate, daysOffset) {
        const startOfWeek = new Date(startDate);
        startOfWeek.setDate(startDate.getDate() - daysOffset); // Dynamically move back daysOffset days
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Add 6 days for the week range

        return {
            start: startOfWeek,
            end: endOfWeek
        };
    }

    // Helper function to format date as 'MMM DD-MMM DD'
    function formatWeekRange(startDate, endDate) {
        const options = { month: 'short', day: 'numeric' };
        return `${startDate.toLocaleDateString('en-US', options)}-${endDate.toLocaleDateString('en-US', options)}`;
    }

    // Parse dates and find the earliest date in the dataset
    const filteredData = chartData.filter(entry => {
        if (multiStore.length > 0) {
            if (!multiStore.includes(entry.storname.trim())) return 
        }
        return (!selectedGroup || selectedGroup === 'All Business Group' || entry.storegrp === selectedGroup) &&
               (!selectedStore || selectedStore === 'All Stores' || entry.storname === selectedStore);
    });

    if (filteredData.length === 0) return;

    // Find the minimum date in the filtered data
    let minDate = filteredData.reduce((min, entry) => {
        const entryDate = parseDate(entry.date____);
        return entryDate < min ? entryDate : min;
    }, parseDate(filteredData[0].date____));

    // Calculate the number of days offset based on the minDate
    let currentWeekStart = minDate;
    const weekRanges = {};

    // Iterate through the filtered data and group into weeks
    filteredData.forEach(entry => {
        const date = parseDate(entry.date____);

        // Calculate the week range based on the current week's start date
        const daysOffset = Math.floor((date - currentWeekStart) / (1000 * 60 * 60 * 24)) % 7;
        const { start, end } = getWeekRange(date, daysOffset);

        // Create a week label based on the date range
        const weekLabel = formatWeekRange(start, end);

        if (!weekRanges[weekLabel]) {
            weekRanges[weekLabel] = { startDate: start, total2024: 0, total2023: 0, total2019: 0 };
        }

        // Accumulate totals
        weekRanges[weekLabel].total2024 += entry.totalamt;
        weekRanges[weekLabel].total2023 += entry.lastamt_;
        weekRanges[weekLabel].total2019 += entry.prevamt_;
    });

    // Convert weekRanges to an array and sort by start date
    const sortedWeekRanges = Object.keys(weekRanges).map(label => ({
        label: label,
        ...weekRanges[label]
    })).sort((a, b) => a.startDate - b.startDate);

    // Prepare data for chart
    const aLabels = sortedWeekRanges.map(range => range.label);
    const aTotal2024 = sortedWeekRanges.map(range => range.total2024);
    const aTotal2023 = sortedWeekRanges.map(range => range.total2023);
    const aTotal2019 = sortedWeekRanges.map(range => range.total2019);

    const oData2024 = {
        label: '2024',
        data: aTotal2024,
        borderWidth: 0.5,
        tension: 0.2,
        type: 'line'
    };
    const oData2023 = {
        label: '2023',
        data: aTotal2023,
        borderWidth: 0.5,
        tension: 0.2,
        type: 'line'
    };
    const oData2019 = {
        label: '2019',
        data: aTotal2019,
        borderWidth: 0.5,
        tension: 0.2,
        type: 'line'
    };

    myChart2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: aLabels,
            datasets: [oData2024, oData2023, oData2019]
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
                    text: "Weekly Sales Trend - Last 6 weeks",
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
