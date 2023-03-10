window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

document.getElementById("home-nav").onclick = function () {
    window.location = "/";
}
document.getElementById("help-nav").onclick = function () {
    window.location = "/info";
}

document.getElementById("showAddEvents").onclick = function () {
    window.scrollTo(0, 500);
}
document.getElementById("showLeaderboard").onclick = function () {
    window.scrollTo(0, 1100);
}



//on load
document.addEventListener('DOMContentLoaded', function () {
    //extract from database
    fetchEvents();
    fetchLeaderboard();
})

//to detect deletion of event
document.querySelector('#eventBody').addEventListener('click', function (event) {
    if (event.target.className === "delete-row-btn") {
        deleteRowById(event.target.dataset.id);
    }
});

function fetchEvents() {
    fetch('http://localhost:3000/getAllEvents')
        .then(response => response.json())
        .then(data => loadHTML_EventsTable(data['data']));
}

function fetchLeaderboard() {
    fetch('http://localhost:3000/getAllStudents')
        .then(response => response.json())
        .then(data => loadHTML_Leaderboard(data['data']));
}

//to delete event from database
function deleteRowById(id) {
    fetch('http://localhost:3000/delete/' + id, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
                window.scroll(0,500);
            }
        });
}

//to submit event and add to database
document.getElementById('submitEvent').onclick = function () {
    const titleInput = document.getElementById('eventTitle');
    const title = titleInput.value;
    const eventTypeInput = document.getElementById('eventTypeDropdown');
    const eventType = eventTypeInput.value;
    const eventTimeInput = document.getElementById('eventTime');
    const eventTime = eventTimeInput.value;

    if (title == "" || eventType == "" || eventTime == "") {
        document.getElementById("formError").style.visibility = "visible";
    }
    else {
        fetch('http://localhost:3000/insertNewEvent', {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ title: title, eventType: eventType, eventTime: eventTime })
        })
            .then(response => response.json())
            .then(data => insertRowIntoEvents(data['data']));

        titleInput.value = "";
        eventTypeInput.value = "";
        eventTimeInput.value = "";
    }


}

//load data into html table
function insertRowIntoEvents(data) {
    const table = document.getElementById('eventBody');
    const isTableData = table.querySelector('.no-data');
    dateTime = data.eventTime.toLocaleString();
    timeFormatted = dateTime.substring(0, 10) + " " + dateTime.substring(11, 16);

    let tableHtml = "<tr>";
    tableHtml += `<td style = "width: 150px;">${data.title}</td>`;
    tableHtml += `<td>${data.eventType}</td>`;
    tableHtml += `<td style = "width: 150px;">${timeFormatted}</td>`;
    tableHtml += `<td><button class="delete-row-btn" data-id=${id}>Delete</td>`;
    tableHtml += "</tr>";

    if (isTableData) { //to remove "no events"
        table.innerHTML = tableHtml;
    } else {
        const newRow = table.insertRow();
        newRow.innerHTML = tableHtml;
    }
}

function loadHTML_EventsTable(data) {
    const table = document.getElementById('eventBody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='5' style= 'text-align: center;'>No Events</td></tr>";
        return;
    }

    let tableHtml = "";

    data.forEach(function ({id, title, eventType, eventTime }) {
        dateTime = eventTime.toLocaleString();
        timeFormatted = dateTime.substring(0, 10) + " " + dateTime.substring(11, 16);
        tableHtml += "<tr>";
        tableHtml += `<td style = "width: 150px;">${title}</td>`;
        tableHtml += `<td>${eventType}</td>`;
        tableHtml += `<td style = "width: 150px;">${timeFormatted}</td>`;
        tableHtml += `<td><button class="delete-row-btn" data-id=${id}">Delete</td>`;
        tableHtml += "</tr>";
    });
    table.innerHTML = table.innerHTML + tableHtml;
    ;

}

var num = 1;
function loadHTML_Leaderboard(data) {
    const table = document.getElementById('leaderboardBody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";
    data.forEach(function ({ studNum, grade, firstName, lastName, totalPoints }) {
        tableHtml += "<tr>";
        tableHtml += `<td style = "width: 20px;">${num}</td>`;
        tableHtml += `<td>${firstName}</td>`;
        tableHtml += `<td>${lastName}</td>`;
        tableHtml += `<td>${studNum}</td>`;
        tableHtml += `<td>${grade}</td>`;
        tableHtml += `<td>${totalPoints}</td>`;
        tableHtml += "</tr>";
        num += 1;
    });
    table.innerHTML = tableHtml;
}

//to generate the quarterly report
document.getElementById("generateReport").onclick = function () {
    generateReport(num); //generate report with number of students
}
function generateReport(num) {
    const report = document.getElementById('reportBody');
    const leaderboardBody = document.querySelector('tbody'); //leaderboard comes first
    var chosen9 = false;
    var chosen10 = false;
    var chosen11 = false;
    var chosen12 = false;
    let tableHtml = "";
    tableHtml += "<tr>";

    while (!(chosen9 && chosen10 && chosen11 && chosen12)) {
        let x = Math.floor((Math.random() * (num - 1))); //random student
        var row = leaderboardBody.rows[x]
        var studGrade = row.cells[4].innerHTML;
        var points = row.cells[5].innerHTML;
        if (studGrade == 9 && !chosen9) { //if a grade 9 winner has not been chosen
            tableHtml += `<td style = "width: 150px;">Grade 9 Draw Winner</td>`;//student number
            tableHtml += `<td style = "width: 150px;">${row.cells[1].innerHTML} ${row.cells[2].innerHTML}</td>`;//full name
            tableHtml += `<td>${row.cells[3].innerHTML}</td>`;//student number
            tableHtml += `<td>${row.cells[5].innerHTML}</td>`;//points

            var prize = ""
            if (points > 200) {
                prize = "IPad Mini";
            }
            else if (points > 100) {
                prize = "Stationary or Arts Kit";
            }
            else if (points > 50) {
                prize = "Bubble Tea & Self-Care Basket";
            }
            else {
                prize = "MGCI Tote Bag";
            }
            tableHtml += `<td>${prize}</td>`;//points
            chosen9 = true;
        }
        //gr 10
        if (studGrade == 10 && !chosen10) {
            tableHtml += `<td style = "width: 150px;">Grade 10 Draw Winner</td>`;//student number
            tableHtml += `<td style = "width: 150px;">${row.cells[1].innerHTML} ${row.cells[2].innerHTML}</td>`;//full name
            tableHtml += `<td>${row.cells[3].innerHTML}</td>`;//student number
            tableHtml += `<td>${row.cells[5].innerHTML}</td>`;//points

            var prize = ""
            if (points > 200) {
                prize = "IPad Mini";
            }
            else if (points > 100) {
                prize = "Stationary or Arts Kit";
            }
            else if (points > 50) {
                prize = "Bubble Tea & Self-Care Basket";
            }
            else {
                prize = "MGCI Tote Bag";
            }
            tableHtml += `<td>${prize}</td>`;//points
            chosen10 = true;
        }
        //gr 11
        if (studGrade == 11 && !chosen11) {
            tableHtml += `<td style = "width: 150px;">Grade 11 Draw Winner</td>`;//student number
            tableHtml += `<td  style = "width: 150px;">${row.cells[1].innerHTML} ${row.cells[2].innerHTML}</td>`;//full name
            tableHtml += `<td>${row.cells[3].innerHTML}</td>`;//student number
            tableHtml += `<td>${row.cells[5].innerHTML}</td>`;//points

            var prize = ""
            if (points > 200) {
                prize = "IPad Mini";
            }
            else if (points > 100) {
                prize = "Stationary or Arts Kit";
            }
            else if (points > 50) {
                prize = "Bubble Tea & Self-Care Basket";
            }
            else {
                prize = "MGCI Tote Bag";
            }
            tableHtml += `<td>${prize}</td>`;//points
            chosen11 = true;

        }
        //gr 12
        if (studGrade == 12 && !chosen12) {
            tableHtml += `<td style = "width: 150px;">Grade 12 Draw Winner</td>`;//student number
            tableHtml += `<td style = "width: 150px;">${row.cells[1].innerHTML} ${row.cells[2].innerHTML}</td>`;//full name
            tableHtml += `<td>${row.cells[3].innerHTML}</td>`;//student number
            tableHtml += `<td>${row.cells[5].innerHTML}</td>`;//points

            var prize = ""
            if (points > 200) {
                prize = "IPad Mini";
            }
            else if (points > 100) {
                prize = "Stationary or Arts Kit";
            }
            else if (points > 50) {
                prize = "Bubble Tea & Self-Care Basket";
            }
            else {
                prize = "MGCI Tote Bag";
            }
            tableHtml += `<td>${prize}</td>`;//prize
            chosen12 = true;
        }
        tableHtml += "</tr>";
    }//end of while loop
    //Highest Scorer
    var winner = leaderboardBody.rows[0];
    var winnerGrade = winner.cells[4].innerHTML;
    tableHtml += `<td style = "width: 150px;">GRAND WINNER</td>`;//student number
    tableHtml += `<td style = "width: 150px;">${winner.cells[1].innerHTML} ${winner.cells[2].innerHTML} (Gr. ${winnerGrade})</td>`;//full name + grade
    tableHtml += `<td>${winner.cells[3].innerHTML}</td>`;//student number
    tableHtml += `<td>${winner.cells[5].innerHTML}</td>`;//points
    tableHtml += `<td>Choice</td>`;//prize

    report.innerHTML = tableHtml;

}


//reset points for ALL students to 0
document.getElementById("resetAll").onclick = function () {
   var proceed = confirm("Are you sure you would like to reset points for ALL students to 0? This action cannot be undone.");
   if(proceed){
    console.log("proceed");
    fetch('http://localhost:3000/resetAll', {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
                window.scroll(0,1100);
            }
        });

   }
}
