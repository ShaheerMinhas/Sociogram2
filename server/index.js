const express = require("express");
var cors = require('cors')
var mysql = require('mysql2');
const app = express();
const port = 5000;
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "mydatabase"
});
con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
app.use(cors())
app.use(express.json());

app.post('/adduser', (req, res) => {

  //const userinfo=req.body.data; 
  // console.log(req);
  const Squery = `INSERT INTO users (username, password, dob, email) VALUES ("${req.body.name}", "${req.body.password}","${req.body.dob}","${req.body.email}")`;
  con.query(Squery, (err, result) => {
    if (err) throw err;
    res.status(200).json({ result, status: true })
  }
  ); 
})
app.post('/addfeedback', (req, res) => {

  //const userinfo=req.body.data;
  // console.log(req);
  const Squery = `INSERT INTO feedback (email,feedback) VALUES ("${req.body.email}","${req.body.feedback}")`;
  con.query(Squery, (err, result) => {
    if (err) throw err;
    res.status(200).json({ result, status: true })
  }
  );
})
app.post('/loginuser', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const sqlQuery = `SELECT * FROM users WHERE email = "${req.body.email}" AND password = "${req.body.password}"`;

  con.query(sqlQuery, (err, result) => {
    if (err) throw err;

    if (result.length === 1) {
      res.status(200).json({ message: "Login successful", user: result[0], status: true });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

// ...

app.post('/like', (req, res) => {
  console.log({body:req.body})
  const postId = req.body.postid;
  const sqlQuery = `UPDATE post SET likes = likes + 1 WHERE id = ${postId}`;
  con.query(sqlQuery, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to like post" });
    } else {
      const getLikesQuery = `SELECT likes FROM post WHERE id = ${postId}`;
      con.query(getLikesQuery, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({ error: "Failed to get likes for post" });
        } else {
          res.status(200).json({ likes: result[0].likes });
        }
      });
    }
  });
});
 
// ...

app.post('/searchuser', (req, res) => {


  const sqlQuery = `SELECT * FROM users WHERE name = "${req.body.name}"`;

  con.query(sqlQuery, (err, result) => {
    if (err) throw err;

    if (result.length === 1) {
      res.status(200).json({ message: "Login successful", user: result[0], status: true });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

// Available Routes

app.get('/', (req, res) => {
  res.send('Hello Worlds!')

});
app.get('/fetchUser', (req, res) => {
  const username = req.query.name;
  const sqlQuery = ` SELECT * FROM customers WHERE name = ${username}`;
  con.query(sqlQuery, (err, result) => {
    if (err) throw err;
    res.status(200).json({ result })
  }
  );
});

app.post('/addpost', (req, res) => {
  const { userId, postBody, userName } = req.body;
  const uploadDate = new Date().toISOString().slice(0, 19).replace('T', ' ');


  const sqlQuery = `INSERT INTO post (userId, userName, postTxt, uploadDate, likes) VALUES (${userId}, "${userName}", "${postBody}", "${uploadDate}", 0)`;

  con.query(sqlQuery, (err, result) => {
    if (err) throw err;
    res.status(200).json({ message: "Post added successfully", status: true });
  });
});

app.get('/meetpeople/:userId', async(req, res) => {
  const userId = req.params.userId;
  const query = `SELECT username FROM users WHERE id NOT IN (SELECT followedId FROM following WHERE followerId = ${userId}) AND id != ${userId}`;
   console.log({userId});
  db.query(query, (err, result) => {
    if (err) {
      console.log('Error retrieving users:', err);
      res.sendStatus(500);
    } else {
      console.log({ result });
      const users = result.map((row) => row.username);
      res.json(users);
    }
  });
});

app.get('/friendpeople/:userId', async(req, res) => {
  const userId = req.params.userId;
  const query = `SELECT username FROM users WHERE id IN (SELECT followedId FROM following WHERE followerId = ${userId}) AND id != ${userId}`;
   console.log({userId});
  db.query(query, (err, result) => {
    if (err) {
      console.log('Error retrieving users:', err);
      res.sendStatus(500);
    } else {
      console.log({ result });
      const users = result.map((row) => row.username);
      res.json(users);
    }
  });
});



app.post('/fetchPosts', (req, res) => { 
  const { userId, startIndex } = req.body;
  console.log({userId, startIndex}); ; const friendQuery = `SELECT followedId FROM following WHERE followerid = ${userId}`;
  con.query(friendQuery, async (err, result) => {
    if (err) throw err;
    const friends = result.map((friend) => friend.followedId);
    const friendString = friends.join(',');
    const sqlQuery = `SELECT * FROM post WHERE userId IN (${friendString}) ORDER BY uploadDate DESC LIMIT ${startIndex}, 10`;
    const totalPostsQuery = `SELECT COUNT(*) AS totalPosts FROM post WHERE userId IN (${friendString})`;
  
    con.query(totalPostsQuery, (err, result) => {
      if (err) throw err;
      const totalPosts = result[0].totalPosts;
  
      con.query(sqlQuery, (err, result) => {
        if (err) throw err;
        res.status(200).json({ posts: result, totalLenght: totalPosts });
      });
    });
  }); 
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

//get post put delete



