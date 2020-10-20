const events = [
    {
        startDate: "2020-02-17",
        startTime: "10:25",
        endDate: "2020-02-17",
        endtime: "15:00",
        title: "The infinity war was before End game",
        image: "https://images.unsplash.com/photo-1457449940276-e8deed18bfff?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2700&q=80/x_8oJhYU31k"
    },
    {
        startDate: "2020-02-19",
        startTime: "12:00",
        endDate: "2020-02-19",
        endtime: "13:30",
        title: "event 2"
    },
    {
        startDate: "2020-02-22",
        startTime: "13:00",
        endDate: "2020-02-22",
        endtime: "13:45",
        title: "event 3",
        image: "https://images.unsplash.com/photo-1457449940276-e8deed18bfff?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2700&q=80.com/photos/x_8oJhYU31k"
    },
    {
        startDate: "2020-02-22",
        startTime: "12:00",
        endDate: "2020-02-22",
        endtime: "13:30",
        title: "event 4"
    },
    {
        startDate: "2020-03-01",
        startTime: "09:00",
        endDate: "2020-03-01",
        endtime: "11:30",
        title: "march event"
    },
    {
        startDate: "2020-03-03",
        startTime: "13:00",
        endDate: "2020-03-03",
        endtime: "13:45",
        title: "March for all nations",
        image: "https://images.unsplash.com/photo-1457449940276-e8deed18bfff?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2700&q=80.com/photos/x_8oJhYU31k"
    },
];
const interval = 60;
const minimumTime = '08:00';
const maximumTime = '16:00';
const height = 70;

const getDates = (startOfWeek) => {
    const dates = [
        {
            date: startOfWeek.format("DD"),
            day: startOfWeek.format("ddd"),
            month: startOfWeek.format("MMM"),
            monthInNum: startOfWeek.format("MM"),
            year: startOfWeek.format("YYYY")
        }
    ];
    for(let i = 1; i < 7; i++) {
        const nextDay = startOfWeek.add(1, 'd')
        dates.push({
            date: nextDay.format("DD"),
            day: nextDay.format("ddd"),
            month: nextDay.format("MMM"),
            monthInNum: nextDay.format("MM"),
            year: startOfWeek.format("YYYY")
        });
    }
    return dates;
}

const renderHTMLDateRow = (dates) => {
    let html = '<tr><th></th>';
    dates.forEach((eachDate, index) => {
        html += `<th data-index="${index + 1}" data-date="${eachDate.date}" data-year="${eachDate.year}" data-month="${eachDate.monthInNum}"><span class="day">${eachDate.day}</span><br /><span class="date">${eachDate.date}</span></th>`;
    })
    html += '</tr>';
    return html;
}

const getTimes = (min, max, interval) => {
    const time = moment(min, 'HH:mm');
    const maximumTime = moment(max, 'HH:mm');
    const times = [];
    do {
        times.push(time.format('HH:mm'));
        time.add(interval, 'minutes');
    } while(time.isSameOrBefore(maximumTime))
    return times;
}

const renderGrid = () => {
    let grid = '';
    getTimes(minimumTime, maximumTime, interval).forEach(each => {
        grid += `<tr><td>${each}</td>`
        for (let i = 0; i < 7; i++) {
            grid += `<td class="each-day"><div style="line-height: ${height}px; height: ${height-20}px" class="add-highlight">+</div></td>`;
        }
        grid += '</tr>';
    });
    return grid;
}

const generateEventTag = (event) => {
    let imageTag = ''
    if (event.image) {
        imageTag = `<img src="${event.image}" />`;
    }
    return `<div class="event">${imageTag}${event.title}</div>`;
}

const clearAllEvents = () => {
    const allEvents = document.querySelectorAll('.event');
    for (eachEvent of allEvents) {
        eachEvent.parentNode.removeChild(eachEvent)
    }
}

const plotEvents = (events) => {
    clearAllEvents();
    events.forEach(eachEvent => {
        const diffMinutes = moment(eachEvent.startTime, 'HH:mm').diff(moment(minimumTime, 'HH:mm'), 'minutes');
        // this will fail for events that transcend a day
        const eventLength = moment(eachEvent.endtime, 'HH:mm').diff(moment(eachEvent.startTime, 'HH:mm'), 'minutes');
        const rowIndex = Math.floor(diffMinutes / interval);
        const diffMinutesInTimeFrame = diffMinutes - (rowIndex * interval)
        const date = eachEvent.startDate.split('-');
        const column = document.querySelector(`[data-date="${date[2]}"]`);
        if (column && column.dataset.month === date[1]) {
            const columnIndex = parseInt(column.dataset.index);
            const eventHtml = generateEventTag(eachEvent)
            const cell = document.querySelector(`tbody tr:nth-of-type(${rowIndex + 1}) td:nth-of-type(${columnIndex + 1})`)
            cell.innerHTML = eventHtml;
            cell.children[0].style.height = `${(eventLength / interval) * height}px`
            //console.log(minute, ((minute % interval) / interval) * height)
            cell.children[0].style.top = `${(diffMinutesInTimeFrame / interval) * height}px`;
        }
    });
}

const dateSwitcher = (start, end) => {
    let calendarCaption = `${start.month}, ${start.date} - `;
    if (start.month == end.month) {
        calendarCaption += end.date;
    } else {
        calendarCaption += `${end.month}, ${end.date}`;
    }
    return `
        <div class="today">
            Today
        </div>
        <div class="date-range">
            <div data-type="back" class="arrow"> < </div>
            <div class="current">${calendarCaption}</div>
            <div data-type="forward" class="arrow"> > </div>
        </div>
        <div class="calendar-view">
            <div class="active">Week</div>
            <div>Day</div>
        </div>
    `;
}

const handleClick = (event) => {
    const type = event.target.dataset.type;
    if (type === 'forward') {
        currentStart.add('1', 'week');
    } else {
        currentStart.subtract('1', 'week');
    }
    calendar(currentStart);
}

const navigationHandler = () => {
    const arrows = document.querySelectorAll('.arrow');
    for (const arrow of arrows) {
        arrow.addEventListener('click', handleClick)
    }
}

const toggleHighlight = (hoverObj) => {
    let highlight = hoverObj.children('.add-highlight');
    let display = highlight.css('display');
    if (display === 'flex') {
        return highlight.css('display', 'none');
    }
    return highlight.css('display', 'flex');
}

const highlightCellsOnHover = () => {
    const cells = $('.each-day');
    cells.hover(function(){
        let hoverObj = $(this);
        toggleHighlight(hoverObj);
    }, function() {
        let hoverObj = $(this);
        toggleHighlight(hoverObj);
    });
    $('.add-highlight').on('click', function() {
        const column = $(this).parents('td').index();
        const row = $(this).parents('tr').index();
        const month = $('thead tr th').eq(column).data('month')
        const year = $('thead tr th').eq(column).data('year')
        const date = $('thead tr th').eq(column).data('date')
        const start = $('tbody tr').eq(row).find('td').eq(0).text()
        const end = $('tbody tr').eq(row + 1).find('td').eq(0).text()
        selectEvent(start, end, date, month, year);
    });
}

// const highlightCellsOnHover = () => {
//     const cells = document.querySelectorAll('.each-day');
//     for (const cell of cells) {
//         cell.addEventListener('mouseenter', toggleHighlight)
//         cell.addEventListener('mouseleave', toggleHighlight)
//     }
// }

const selectEvent = (start, end, date, month, year) => {
    console.log(start, end, date, month, year);
    //const prompt = confirm('Do you want to add an event');
    if (true) {
        $('.modal-body input[name="start-time"]').val(start);
        $('.modal-body input[name="end-time"]').val(end);
        $('.modal-body input[name="date"]').val(`${year}-${month}-${date}`);
        $('.modal').animate({
            right: '0'
        }, 500);
    }
}

// 1. Here it gets .switcher and does dateSwitcher(start, end) and replaces .switcher innerHTML with dateSwitcher return; and dateSwitcher just generates an HTML block with caption inside it
    // --> IN Vue.js this translates to just swapping the start & end value for the calendarCaption generator

// 2. Then it takes .calendar table thead and replaces its innerHTML with the return value of renderHTMLDateRow(allDates)
    // --> In VUE.js this means just changing the 'dates' variable value which it uses for rendering information;

// IF GRID DOES NOT YET EXIST IN HTML VERSION, it first creates <tbody>renderGrid()</tbody></table>, it takes SWITCHER html, adds table to it, inside table is thead containing DATEROW html, and to that is added the tbody inside which is renderGrid, then tbody is closed with the table

/*

SWITCHER
TABLE
    THEAD
        DATEROW
    /THEAD
    TBODY
        RENDERGRID
    /TBODY
TABLE

 */

const calendar = (startOfPeriod) => {
    let newStart = new moment(startOfPeriod);
    const allDates = getDates(newStart);
    const grid = document.querySelector('.calendar tbody');
    let html = '';
    if (grid) {
        document.querySelector('.switcher').innerHTML = dateSwitcher(allDates[0], allDates[allDates.length - 1]);
        document.querySelector('.calendar table thead').innerHTML = renderHTMLDateRow(allDates);
    } else {
        const html = `<div class="switcher">${dateSwitcher(allDates[0], allDates[allDates.length - 1])}</div><table><thead>${renderHTMLDateRow(allDates)}</thead><tbody>${renderGrid()}</tbody></table>`
        document.querySelector('.calendar').innerHTML = html
        highlightCellsOnHover();
    }
    
    
    navigationHandler();
    plotEvents(events);
}
const currentStart = moment().startOf('isoWeek');

calendar(currentStart);
