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

server.post('/api/posts', (req, res) => {
    console.log(req.body)
    const post = req.body;
    if (!post || post.length < 1) {
        res.status(400).json({ error: "No post! Please provide text and userId for the post." });
    }
    if (post.text && post.userId) {
        console.log("yes it has")
        const id = post.userId; // Interesting. README says user_id, but the database says userId. 
        userDb.getById(id)
        .then(user => {
            console.log("now we can put in the post")
            postDb.insert(post)
            .then(response => {
                // Wait, but what happens if a user gets created, we make ap ost by that user, and then we delete the user?
                postDb.getById(response.id)
                .then(post => res.status(201).json(post))
                .catch(err => res.status(500).json({ message: "Insert successful but unable to find id in database after insert.", error: err}))
                })
            .catch(err => {
                console.log(err)
                res.status(500).json({ error: "There was an error while saving the post to the database" })
            });
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error: "Please provide a userId of an existing user."})
        })
    } else {
        res.status(400).json({ error: "Please provide text and userId for the post." });
    }
})

server.delete('/api/posts/:id', (req, res) => {
    const id = req.params.id;
    postDb.remove(id)
    .then(response => {
        res.status(200).json({message: `Successfully deleted id: ${id}`})
    })
    .catch(err => {
        res.status(500).json({error: "Delete failed."})
    })
})

server.put('/api/posts/:id', (req, res) => {
    const id = req.params.id;
    const post = req.body;
    if (!post || post.length < 1) {
        res.status(400).json({ error: "No post! Please provide text and userId for the post." });
    }
    if (post.text && post.userId) {
        postDb.update(id, post)
        .then(response => {
            res.status(200).json({message: "Successfully edited post!"})
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: "Update failed."})
        })
    }
    else {
        res.status(500).json({ error: "Please provide text and userId for the post."})
    }
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

server.get('/api/users/:id', (req, res) => {
    const id = req.params.id;
    userDb.getById(id)
    .then(user => res.status(200).json(user))
    .catch(err => {
        console.log(err)
        res.status(500).json({error: "Could not find user."})
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
