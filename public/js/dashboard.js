window.onbeforeunload = function() {
    window.scrollTo(0, 0);
  }
  
document.getElementById("home-nav").onclick = function () {
    window.location = "/";
}
document.getElementById("help-nav").onclick = function(){
    window.location ="/info";
}

//on load
document.addEventListener('DOMContentLoaded', function () { 
    //extract from database 
    fetchStudents();
    fetchEvents();
    //account information
    fetchUser();
})

function fetchEvents() {
    fetch('http://localhost:3000/getAllEvents')
        .then(response => response.json())
        .then(data => loadHTML_EventsTable(data['data']));
}

function fetchStudents() {
    fetch('http://localhost:3000/getHrStudents')
        .then(response => response.json())
        .then(data => loadHTML_Attendance(data['data']));
}

function fetchUser() {
    fetch('http://localhost:3000/getTeacher')
        .then(response => response.json())
        .then(data => loadUser(data['data']));
}

function loadUser(data) {
    data.forEach(function ({ firstName }) {
        document.getElementById("greeting").innerHTML = `Glad you're here, ${firstName}.`;
    })
}


//to track which attendance is associated with which event
var eventID;
//to detect attendance action for event
document.getElementById('eventsTable').addEventListener('click', function (event) {

    if (event.target.className === "takeAttendance") {
        eventID = event.target.id;
        document.getElementById("attendanceDock").style.visibility = "visible";
    }
});




//loading data into html tables
function loadHTML_EventsTable(data) {
    const table = document.getElementById('eventBody');
    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='6' style= 'text-align: center;'>No Events</td></tr>";
        return;
    }
   
    data.forEach(function ({ id, title, eventType, eventTime }) {
        let tableHtml = "";
        dateTime = eventTime.toLocaleString();
        timeFormatted = dateTime.substring(0, 10) + " " + dateTime.substring(11, 16);
        tableHtml += "<tr>";
        tableHtml += `<td style = "width: 30px;">${id}</td>`;
        tableHtml += `<td style = "width: 180px;">${title}</td>`;
        tableHtml += `<td>${eventType}</td>`;
        tableHtml += `<td style = "width: 150px;">${timeFormatted}</td>`;
         new Promise((resolve, reject) => {
            checkAttendance(id).then(data =>  resolve(updateHTML_att(data, id, tableHtml, table)))});
          
    });  
} 

//check whether attendance for event has been taken
function checkAttendance(eventID) {
    return new Promise((resolve, reject) => {
    fetch('http://localhost:3000/checkAttendance/' + eventID, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {resolve(parseCheckAttendance(data['data'][0]))});
    });
}
function parseCheckAttendance(data) {
    for (var key in data) {
        console.log(data[key]); // 1 or 0
        return (data[key]);
    }
}
function updateHTML_att(data, id, tableHtml, table){
    if (data == 0) {
        var cellID = id + "cell";
        tableHtml += `<td id="${cellID}"><button class="takeAttendance" id="${id}">GO</button></td>`;
    }
    else {
        tableHtml += `<td>completed</td>`;
    }
    tableHtml += "</tr>";
    table.innerHTML= tableHtml + table.innerHTML;
}

function loadHTML_Attendance(data) {
    const table = document.getElementById("attendanceBody");
    document.getElementById("attendanceDock").style.visibility = "hidden";


    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='4'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";

    //for every student
    data.forEach(function ({ firstName, lastName, studNum }) {
        tableHtml += "<tr>";
        tableHtml += `<td>${firstName}</td>`;
        tableHtml += `<td>${lastName}</td>`;
        tableHtml += `<td>${studNum}</td>`;
        var checkID = studNum.toString();
        tableHtml += `<td ><input type = "checkbox" class="attended" id= ${checkID} ></td>`;
        tableHtml += "</tr>";
    });
    table.innerHTML += tableHtml;

} 

//submitting attendance for an event
attBtn = document.getElementById("submitAttendance").onclick = function () {
    console.log(eventID);
    document.getElementById("attendanceDock").style.visibility = "hidden";
    att = document.querySelector("tbody"); //attendance come first

    for (var i = 0, row; row = att.rows[i]; i++) {
        var studNum = row.cells[2].innerHTML;
        if (document.getElementById(studNum).checked) {
            getStud(studNum, 10); //then updates points

        }
    }
    location.reload();
    window.scrollTo(0, 100);

    //record that attendace has been taken in the database
    fetch('http://localhost:3000/teachers_events/' + eventID, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
}

//updating points for students
function getStud(studNum, points) {
    fetch('http://localhost:3000/getStud/' + studNum, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => updatePoints(studNum, points, data['data']))
}

function updatePoints(studNum, points, c) {
    c.forEach(function ({ totalPoints }) {
        console.log(totalPoints);
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:3000/updatePoints");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                console.log(xhr.status);
                console.log(xhr.responseText);
            }
        };
        let data = `{
      "studNum": ${studNum},
      "points" :${points},
      "current" :${totalPoints}
    }`;
        xhr.send(data);
    });
}



