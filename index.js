const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
//const dotenv = require('dotenv');
const mysql = require('mysql');
const session = require('express-session'); //multiple users

let instance = null;
//dotenv.config(); //access when needed

const app = express();
const port = '3000';

//for different users
app.use(session({
  secret: 'fblaxmgci123',
  resave: true,
  saveUninitialized: false,
  cookie: {
 
    // Session expires after 1 min of inactivity.
    expires: 60000
}
}));

app.use(bodyParser.json());// to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.use(express.json());// to support JSON-encoded bodies
app.use(express.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.use(cors()); //incoming api call blocked to send data to backend


//static files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));

//pages
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');

});

app.get('/info', (req, res) => {
  res.sendFile(__dirname + '/public/html/info.html');
})

app.get('/manage_school', (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(__dirname + '/public/html/manage-school.html');
  } else {
    // Not logged in
    res.send('Please login to view this page!');
  }
})

app.get('/teacher_dashboard', function (req, res) {
  // If the user is loggedin
  if (req.session.loggedin) {
    res.sendFile(__dirname + '/public/html/teacher-dashboard.html');
  } else {
    // Not logged in
    res.send('Please login to view this page!');
  }
});


//LOGIN

app.post('/teacher_login', function (req, res) {
  username = req.body.idStaff;
  password = req.body.passwordStaff;
  if (username && password) {
    db.query(`SELECT (password) FROM teachers WHERE emplNum = ? AND password = ?`, [username, password], function (error, results) {
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        req.session.loggedin = true;
        req.session.username = username;
        if (username == 102360) { //master admin
          res.redirect('/manage_school');

        }
        else { //redirect to account
          res.redirect('/teacher_dashboard');
        }
      } else {
        res.send('Incorrect Username and/or Password!'); //error message
      }
    });
  } else {
    res.render('Please enter Username and Password!'); //error message
  }
});



//SQL DB
const db = mysql.createPool({ //connect sql database 
  host: '127.0.0.1', //localhost
  user: 'root',
  password: '',
  database: 'mgci'
  //this can also be encoded using dotenv
});
db.getConnection((err) => {
  if (err) {
    throw err;
  }
  console.log("mysql pool connected");
});


class DBService {
  static getDbServiceInstance() {
    return instance ? instance : new DBService();
  }
  //gets the teacher through emplNum
  async getTeacherData() {
    try {
      const res = await new Promise((resolve, reject) => {
        const sql = "SELECT * FROM teachers WHERE emplNum = ?";
        db.query(sql, [username], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results)
        })
      });
      console.log(res);
      return (res);
    }
    catch (error) {
      console.log(error);
    }
  }
  //add new club event
  async insertNewEvent(title, eventType, eventTime) {
    try {
      const res = await new Promise((resolve, reject) => {
        const sql = "INSERT INTO events (id, title, eventType, eventTime) VALUES (NULL, ?, ?, ?);";

        db.query(sql, [title, eventType, eventTime], (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        })
      });
      return {
        title: title,
        eventTime: eventTime,
        eventType: eventType,
      };
    } catch (error) {
      console.log(error);
    }
  }
  //updates students points
  async updatePoints(stud, points, currentPoints) {
    var newPoints = points + currentPoints;
    try {
      const response = await new Promise((resolve, reject) => {
        const sql = "UPDATE students SET totalPoints = ? WHERE studNum = ?;";

        db.query(sql, [newPoints, stud], (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        })
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  //resets points for ALL students
  async resetPoints() {
    try {
      const response = await new Promise((resolve, reject) => {
        const sql = "UPDATE students SET totalPoints = ?;"; //RESETS ALL
        db.query(sql, [0], (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        })
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  //get student by student number
  async getStud(stud) {
    try {
      const response = await new Promise((resolve, reject) => {
        const sql = "SELECT * FROM students WHERE studNum = ?;";

        db.query(sql, [stud], (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        })
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  //get hrStudents by teacher's employee number
  async getStudents(id) {
    try {
      const res = await new Promise((resolve, reject) => {
        const sql = "SELECT * FROM students WHERE (hrTeacher) = ?;";

        db.query(sql, [id], (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        })
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }
  //get all events
  async getAllEvents() {
    try {
      const res = await new Promise((resolve, reject) => {
        const sql = "SELECT * FROM events";
        db.query(sql, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results)
        })
      });
      console.log(res);
      return (res);
    }
    catch (error) {
      console.log(error);
    }
  }
  //delete an event (master admin)
  async deleteRowById(id) {
    try {
      const response = await new Promise((resolve, reject) => {
        const sql = "DELETE FROM events WHERE id = ?";

        db.query(sql, [id], (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        })
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

//get leaderboard (master admin)
async getStudentsPointsOrdered() {
    try {
      const res = await new Promise((resolve, reject) => {
        const sql = "SELECT * FROM students ORDER BY (totalPoints) DESC;";

        db.query(sql, (err, result) => {
          if (err) reject(new Error(err.message))
          resolve(result);
        })
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  //update attendance record for an event under one teacher
  async teachers_events(teacherID, eventID) {
    try {
      const res = await new Promise((resolve, reject) => {
        const sql = "INSERT INTO teachers_events (teacherID, eventID) VALUES (?, ?);";

        db.query(sql, [teacherID, eventID], (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        })
      });
      return {
        teacherID: teacherID,
        eventID: eventID,
      };
    } catch (error) {
      console.log(error);
    }
  }
  //check if attendance for event has been taken
  async checkAttendance(teacherID, eventID) {
    try {
      const res = await new Promise((resolve, reject) => {
        const sql = "SELECT COUNT(1) FROM teachers_events WHERE teacherID = ? AND eventID = ?";

        db.query(sql, [teacherID, eventID], (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result);
        })
      });
      console.log(res);
      return res;
    } catch (error) {
      console.log(error);
    }
  }
}


//POST
//add event in table
app.post('/insertNewEvent', (req, res) => {
  const { title, eventType, eventTime } = req.body;
  const obj = DBService.getDbServiceInstance();

  const result = obj.insertNewEvent(title, eventType, eventTime);

  result
    .then(data => res.json({ data: data }))
    .catch(err => console.log(err));
});
//update a students points
app.post('/updatePoints', (req, res) => {
  const { studNum, points, current } = req.body;
  const obj = DBService.getDbServiceInstance();
  const result = obj.updatePoints(studNum, points, current);
  result
    .then(data => res.json({ data: data }))
    .catch(err => console.log(err));
});
//reset points for ALL students to 0
app.post('/resetAll', (req, res) => {
  const obj = DBService.getDbServiceInstance();
  const result = obj.resetPoints();
  result
    .then(data => res.json({ data: data }))
    .catch(err => console.log(err));
});
//update attendance for event under one teacher
app.post('/teachers_events/:eventID', (req, res) => {
  const { eventID } = req.params;
  const obj = DBService.getDbServiceInstance();
  const result = obj.teachers_events(req.session.username, eventID);
  result
    .then(data => res.json({ data: data }))
    .catch(err => console.log(err));
});


//GET
//get student by student number
app.get('/getStud/:studNum', (req, res) => {
  const { studNum } = req.params;
  const object = DBService.getDbServiceInstance();
  const result = object.getStud(studNum);
  result
    .then(data => res.json({ data: data }))
    .catch(err => console.log(err));
});
//get user data
app.get('/getTeacher', (req, res) => {
  const object = DBService.getDbServiceInstance();
  const result = object.getTeacherData();
  result
    .then(data => res.json({ data: data }))
    .catch(err => console.log(err));
});
//get all students of one teacher
app.get('/getHrStudents', (req, res) => {
  const obj = DBService.getDbServiceInstance();
  const result = obj.getStudents(username);

  result
    .then(data => res.json({ data: data }))
    .catch(err => console.log(err));
});
//get all students for leaderboard
app.get('/getAllStudents', (req, res) => {
  const obj = DBService.getDbServiceInstance();
  const result = obj.getStudentsPointsOrdered();

  result
    .then(data => res.json({ data: data }))
    .catch(err => console.log(err));
});
//get all events for table
app.get('/getAllEvents', (req, res) => {
  const obj = DBService.getDbServiceInstance();
  const result = obj.getAllEvents();

  result
    .then(data => res.json({ data: data }))
    .catch(err => console.log(err));
});
//check attendance for an event under one teacher
app.get('/checkAttendance/:eventID', (req, res) => {
  const { eventID } = req.params;
  const obj = DBService.getDbServiceInstance();
  const result = obj.checkAttendance(username, eventID);
  result
    .then(data => res.json({ data: data }))
    .catch(err => console.log(err));
});

//delete event
app.delete('/delete/:id', (request, response) => {
  const { id } = request.params;
  const obj = DBService.getDbServiceInstance();

  const result = obj.deleteRowById(id);

  result
    .then(data => response.json({ success: data }))
    .catch(err => console.log(err));
});



//listen on port 3000
app.listen(port, () => console.info('Listening on port ' + port));




