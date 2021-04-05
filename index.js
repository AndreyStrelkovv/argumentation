

const { response } = require('express');
const express = require('express');
const Datastore = require('nedb');
const app = express();

// if no url then use port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});


app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

// create or load the database
const db = new Datastore('database.db');
db.loadDatabase();

// const db_users = new Datastore('database_users.db');
// db_users.loadDatabase();


// app.post('/login_user', (request, response) =>{
   
//    username = request.body.name;
//    password = request.body.pw;

//    db_users.find({ name : username }, (err, data) => {
//       if (err) {
//          response.json({test: "err"});
//          return;
//       }

//       if (data.length > 0){
//          user = data[0];
//          if (password == user.pw){
//             response.json([data[0], {result: "login"}]);
//          } else {
//             response.json([data[0], {result: "wrong_password"}]);
//          }
//       } else if(data.length == 0) {
//          db_users.insert(request.body);
//          response.json([request.body, {result: "new_user"}]);
//       } else {
//          response.json([request.body, {result: "user_not_found"}]);
//       }
//    })
//  })



//                               Proposal Database Methods

/**
 * Send all the proposals
 */
app.get('/api', (request, response) => {
   // fetch all from database
   db.find({}, (err, data) => {
      if (err) {
         response.json({test: "err"});
         return;
      }
      // send all
      response.json({data});
   })
})

/**
 * Clear the database; delete all from databse
 */
app.post('/clear', (request, response)=> {
   //remove all
   db.remove({type: "proposal"}, {multi:true}, function(err, numRemoved){})
   // reload database
   db.loadDatabase();
   response.json({info: 'cleared'});
})

/**
 * Insert the proposal into the database
 */
app.post('/proposal', (request, response) =>{
   db.find({}, (err, data) => {
      if (err) {
         response.json({test: "err"});
         return;
      }

      // set id and title
      const thread = request.body;
      thread._id = "" + (data.length + 1);
      thread.title += (data.length + 1);

      // insert proposal into the database
      db.insert(thread);
      response.json(thread);
   })
})

/**
 * Send the requested proposal to client
 */
app.post('/get_proposal', (request, response) =>{

   // get proposal id from request
   thread_id = "" + request.body.thread_id;

   // find proposal in database using given id
   db.find({_id : thread_id }, (err, data) => {
      if (err) {
         response.json({test: "err"});
         return;
      }
      // send proposal to client
      response.json(data[0]);
   })
})

/**
 * Update proposal according to requested action
 */
app.post('/update_proposal', (request, response) =>{
   if(request.body[2].action == "comment"){
      response.json(add_comment(request));
   } else if (request.body[2].action == "vote"){
      response.json(vote(request));
   } else if (request.body[2].action == "vote_proposal"){
      response.json(vote_proposal(request));
   }
})

/**
 * Add an argument to a proposal discussion
 * @param request 
 * @returns 
 */
function add_comment(request){
   // get proposal
   const thread = request.body[0];

   // get comment
   const comment = request.body[1];

   // get parent comment
   const parent_comment_id = comment.parent_id;
   var parent_comment = find_comment(thread, ""+parent_comment_id, thread._id.length + 1);

   // set id of the new comment
   var new_comment_id;
   if(parent_comment == null){
           new_comment_id = "" + thread._id + (thread.comments.length + 1);
   } else {
           new_comment_id = "" + parent_comment._id + (parent_comment.comments.length + 1);
   }
   comment._id = new_comment_id;

   // remove old proposal 
   db.remove({_id: thread._id}, {}, function(err, numRemoved){})

   // attach comment to the parent comment
   if(parent_comment != null && parent_comment.comments != null){
      parent_comment.comments.push(comment);
   } else {
      thread.comments.push(comment);
   }

   // insert updated proposal into the database
   db.insert(thread);
   return [thread, comment];
 }



/**
 * Change vote score of a comment in the discussion
 * @param request 
 * @returns 
 */
function vote(request){

   // get proposal
   const thread = request.body[0];

   // get comment
   const comment_id = "" + request.body[1].com_id;
   var comment = find_comment(thread, comment_id, thread._id.length + 1);

   // get the change that needs to be made to the score
   const diff = request.body[3].diff

   // set new score of the proposal
   if(diff > 0){
      comment.upvote += diff;
   } else {
      comment.downvote += Math.abs(diff);
   }
   comment.score = comment.upvote - comment.downvote;

   // remove old version of the proposal
   db.remove({_id: thread._id}, {}, function(err, numRemoved){})
   // insert new version of the proposal
   db.insert(thread);
   return thread;
}


/**
 * Increase vote score of the proposal
 * @param request 
 * @returns 
 */
function vote_proposal(request){

   // get proposal
   const thread = request.body[0];

   // get proposal id
   const thread_id = '' + request.body[1].thread_id;

   // update score of the proposal in the database
   var new_score = thread.score + 1;
   db.update({ _id : thread_id }, { $set: {score : new_score} }, {}, function(err, data) {})
   return thread;
}

/**
 * Recursive method to find comment in the discussion tree
 * @param thread 
 * @param comment_id 
 * @param depth 
 * @returns 
 */
function find_comment(thread, comment_id, depth){
   // for every child comment of a thread (a comment or a proposal)
   for (let comment of thread.comments){
      // if comment that is found is at the right depth then return comment
      // else repeat the method with the found comment
      if(comment._id == comment_id.slice(0, depth)){
         if(comment_id.length == depth){
            return comment;
         } else {
            return find_comment(comment, comment_id, depth+1);
         }
      }
   }
}