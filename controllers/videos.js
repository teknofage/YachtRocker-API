const User = require('../models/user');
const Video = require('../models/videos');
// const Comment = require('../models/comment');

module.exports = (app) => {

    // NEW VIDEO
    app.get('/videos/new', (req, res) => {
        var currentUser = req.user;
        return res.render("videos-new", { currentUser });
    });


    // CREATE
    app.post("/videos/new", (req, res) => {
        if (req.user) {
            var video = new Video(req.body);
            video.author = req.user._id;
            video.upVotesYacht = [];
            video.downVotesYacht = [];
            video.voteScoreYacht = 0; 
            
            video.upVotesRocker = [];
            video.downVotesRocker = [];
            video.voteScoreRocker = 0; 

            video
                .save()
                .then(video => {
                    return User.findById(req.user._id);
                })
                .then(user => {
                    user.videos.unshift(video);
                    user.save();
                    // REDIRECT TO THE NEW video
                    res.redirect(`/videos/${video._id}`);
                })
                .catch(err => {
                    console.log(err.message);
                });
        } else {
            return res.status(401); // UNAUTHORIZED
        }
    });
    
  
    // SHOW
    app.get("/videos/:id", function (req, res) {
        var currentUser = req.user;
        Video.findById(req.params.id).populate('comments').lean()
            .then(video => {
                res.render("videos-show", { video, currentUser });  
            })
            .catch(err => {
                console.log(err.message);
            });
    });

// INDEX
    app.get('/', (req, res) => {
        var currentUser = req.user;
        Video.find({}).lean().populate('author')
            .then(videos => {
                res.render('videos-index', { videos, currentUser });
                console.log(videos)
            }).catch(err => {
                console.log(err.message);
            })
    })

    // GET UPDATE VIDEO
    app.get('/videos/:id/edit', (req, res) => {
        console.log('/videos/:id/edit')
        console.log(req.user)
        var currentUser = req.user;
        if (req.user) {                            
            Video.findById(req.params.id).populate('comments').lean()
            .then(video => {
                console.log("User: ", req.user, "Video: ", video)

                console.log(req.user.username.toString() == video.author.username)
                if (req.user.username == video.author.username) {
                    return res.render("videos-edit", { video: video, currentUser });
                } else {
                    console.log("Cannot edit posts that aren't yours.")
                }
            }).catch(err => {
                console.log(err.message);
            })  
        } else {
            return res.render("login")
        }  
    })

    // UPDATE
    app.post('/videos/:id/edit', (req, res) => {
        console.log('/videos/:id/edit-post')
        var currentUser = req.user;
        
            Video.findOneAndUpdate(
                {id:req.params.id}, 
                {...req.body},
            )
            .then((video) => {
                res.redirect(`/videos/${req.params.id}`);  
            })
            .catch(error => console.error(error))
        
    })



    // DELETE
    app.get('/videos/:id/delete', (req, res) => {
        if (req.user) {                            
            Video.findById(req.params.id).populate('comments').lean()
            .then(video => {
                console.log("User: ", req.user, "Video: ", video)

                console.log(req.user.username.toString() == video.author.username)
                if (req.user.username == video.author.username) {
                    Video
                    .deleteOne({video: req.params.id })
                    .then(console.log("Successfully deleted.")    
                    )
                    .catch(err => {
                        console.log(err.message);
                    })  
                    return res.render('videos-index')              
                } else {
                    console.log("Cannot delete posts that aren't yours.")
                    }
            }).catch(err => {
                console.log(err.message);
            })  
        } else {
            return res.render("login")
        }
    //     var currentUser = req.user;
    //     Video
    //     .deleteOne({video._id: req.params.id })
    //     .then(console.log("Successfully deleted.");)
    //     .catch(err => {
    //         console.log(err.message);
    //     })
    // } else {
    //     console.log("Cannot delete posts that aren't yours.")
    //     }
    })

    // GENRE
    app.get("/n/:genre", function (req, res) {
        var currentUser = req.user;
        Video.find({ genre: req.params.genre }).lean()
            .then(videos => {
                res.render("videos-index", { videos, currentUser });
            })
            .catch(err => {
                console.log(err);
            });
    });

    // FETCH USER
    app.get("/users/:username", (req, res) => {
        const currentUser = req.user;
        User.findOne({username:req.params.username}).populate("videos")
        .then(user => {
            const videos = user.videos;
            return res.render("videos-index", { videos })
        })
        .catch(err => {
            console.log(err);
        });
    
    })

    // UP YACHT VOTE videos
    app.put("/videos/:id/yacht-vote-up", function(req, res) {
        Video.findById(req.params.id).exec(function(err, video) {
          video.upVotesYacht.push(req.user._id);
          video.voteScoreYacht = video.voteScoreYacht + 1;
          video.save();
      
          res.status(200);
        });
      });
      
    //   DOWN YACHT VOTE videos
      app.put("/videos/:id/yacht-vote-down", function(req, res) {
        Video.findById(req.params.id).exec(function(err, video) {
          video.downVotesYacht.push(req.user._id);
          video.voteScoreYacht = video.voteScoreYacht - 1;
          video.save();
      
          res.status(200);
        });
      });

          // UP ROCKER VOTE videos
    app.put("/videos/:id/rocker-vote-up", function(req, res) {
        Video.findById(req.params.id).exec(function(err, video) {
          video.upVotesRocker.push(req.user._id);
          video.voteScoreRocker = video.voteScoreRocker + 1;
          video.save();
      
          res.status(200);
        });
      });
      
    //   DOWN ROCKER VOTE videos
      app.put("/videos/:id/rocker-vote-down", function(req, res) {
        Video.findById(req.params.id).exec(function(err, video) {
          video.downVotesRocker.push(req.user._id);
          video.voteScoreRocker = video.voteScoreRocker - 1;
          video.save();
      
          res.status(200);
        });
      });
};