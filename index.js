const express = require('express');
const postDb = require('./data/helpers/postDb');
const userDb = require('./data/helpers/userDb.js');
const cors = require('cors');
const server = express();

function upperCaseUser(req, res, next) {
    if (req.body.name) {
        req.body.name = req.body.name.toUpperCase();
    }
    next(); // this needs to uppercase a username before sending 
}

server.use(express.json());
server.use(cors());
server.use(upperCaseUser);

// Posts DB //

server.get('/api/posts', (req, res) => {
    postDb.get()
    .then(posts => res.status(200).json({posts}))
    .catch(err => {
        console.log(err)
        res.status(500).json({error: "Not able to obtain post list."})
    })
})

server.get('/api/posts/:id', (req, res) => {
    const id = req.params.id;
    postDb.getById(id)
    .then(post => {
        if (post.length < 1) {
            res.status(404).json({message : "The post with the specified ID does not exist."})
        } else {
            res.status(200).json({post})
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({ error: "The posts information could not be retrieved." })
    })
})


// User DB //

server.get('/api/users', (req, res) => {
    userDb.get()
    .then(users => res.status(200).json({users}))
    .catch(err => {
        console.log(err)
        res.status(500).json({error: "Not able to obtain user list."})
    })
})

server.post('/api/users', (req, res) => {
    const user = req.body;
    if (!user.name) {
        res.status(400).json({ error: "Need user name."})
    } else {
        userDb.insert(user)
        .then(response => res.status(201).json(user))
        .catch(err => {
            console.log(err)
            res.status(500).json({error: "Failed to add user."})
        })
    }

})

server.put('/api/users/:id', (req, res) => {
    const id = req.params.id
    console.log(id)
    const user = req.body;
    if (!user.name) {
        res.status(400).json({ error: "Need user name."})
    } else {
        userDb.get(id)
        .then(users => {
            console.log(users)
            if (users.length < 1) {
                return res.status(404).json({ message: "The user with the specified ID does not exist." });
            } else {
                userDb.update(id, user)
                .then(response => res.status(200).json({user}))
                .catch(err => {
                    console.log(err);
                    res.status(400).json({error: "Failed to update--was the name not unique?"})
                })                 
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error: "Not able to obtain user list or ID does not exist."})
        })
    }
})

server.delete('/api/users/:id', (req, res) => {
    const id = req.params.id;
    userDb.getById(id)
    .then(user => {
      if (!user) {
        res.status(404).json({message: "The user with the specified ID does not exist."})
      } else {
        userDb.remove(id)
        .then(response => {
          res.status(200).json(user)
        })
        .catch(err => {
          res.status(500).json({error: "The user could not be removed."})
        })
      }
    })
    .catch(err => {
      res.status(500).json({error: "The user could not be removed."})
    })
  })

server.listen(8000, () => console.log('API running on port 8000'));
