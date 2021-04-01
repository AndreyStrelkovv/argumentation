// https://stackoverflow.com/questions/37437805/convert-map-to-json-object-in-javascript

const { response } = require('express');
const express = require('express');
const Datastore = require('nedb');
const app = express();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});

// setInterval(() => {
//   http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
// }, 280000);

 // app.listen(3000, () => console.log('listening at 3000'));
 app.use(express.static('public'));
 app.use(express.json({limit: '1mb'}));

//  app.listen(3000, () => console.log('listening at 3000'));

const db = new Datastore('database.db');
db.loadDatabase();

const db_users = new Datastore('database_users.db');
db_users.loadDatabase();


app.post('/login_user', (request, response) =>{
   
   username = request.body.name;
   password = request.body.pw;

   db_users.find({ name : username }, (err, data) => {
      if (err) {
         response.json({test: "err"});
         return;
      }

      if (data.length > 0){
         user = data[0];
         if (password == user.pw){
            response.json([data[0], {result: "login"}]);
         } else {
            response.json([data[0], {result: "wrong_password"}]);
         }
      } else if(data.length == 0) {
         db_users.insert(request.body);
         response.json([request.body, {result: "new_user"}]);
      } else {
         response.json([request.body, {result: "user_not_found"}]);
      }
   })
 })



// Proposal Database Methods

app.get('/api', (request, response) => {
   db.find({}, (err, data) => {
      if (err) {
         response.json({test: "err"});
         return;
      }
      response.json({data});
   })
})

app.post('/clear', (request, response)=> {
   db.remove({type: "proposal"}, {multi:true}, function(err, numRemoved){

   })
   db.loadDatabase();
   response.json({info: 'cleared'});
})

 app.post('/proposal', (request, response) =>{
   db.find({}, (err, data) => {
      if (err) {
         response.json({test: "err"});
         return;
      }
      const thread = request.body;
      thread._id = "" + (data.length + 1);
      thread.title += (data.length + 1);

      db.insert(thread);

      response.json(thread);
   })
 })

 app.post('/get_proposal', (request, response) =>{
   
   thread_id = request.body.thread_id;

   db.find({_id : thread_id }, (err, data) => {
      if (err) {
         response.json({test: "err"});
         return;
      }
      response.json(data[0]);
   })
 })


 app.post('/update_proposal', (request, response) =>{
   if(request.body[2].action == "comment"){
      response.json(add_comment(request));
   } else if (request.body[2].action == "vote"){
      response.json(vote(request));
   } else if (request.body[2].action == "vote_proposal"){
      response.json(vote_proposal(request));
   }
})

function add_comment(request){
   const thread = request.body[0];
   const comment = request.body[1];
   const parent_comment_id = comment.parent_id;

   var parent_comment_intree = find_comment(thread, ""+parent_comment_id, thread._id.length + 1);
   // console.log(parent_comment_id);
   var new_comment_id;
   if(parent_comment_intree == null){
           new_comment_id = "" + thread._id + (thread.comments.length + 1);
   } else {
           new_comment_id = "" + parent_comment_intree._id + (parent_comment_intree.comments.length + 1);
   }
   comment._id = new_comment_id;

   db.remove({_id: thread._id}, {}, function(err, numRemoved){})

   if(parent_comment_intree != null && parent_comment_intree.comments != null){
      // console.log(parent_comment_intree);
      parent_comment_intree.comments.push(comment);
   } else {
      thread.comments.push(comment);
   }

   db.insert(thread);
   return [thread, comment];
 }

function vote(request){
   const thread = request.body[0];
   const comment_id = "" + request.body[1].com_id;
   const diff = request.body[3].diff

   var comment_intree = find_comment(thread, comment_id, thread._id.length + 1);
   
   if(diff > 0){
      comment_intree.upvote += diff;
   } else {
      comment_intree.downvote += Math.abs(diff);
   }
   
   comment_intree.score = comment_intree.upvote - comment_intree.downvote;

   db.remove({_id: thread._id}, {}, function(err, numRemoved){})
   db.insert(thread);
   return thread;
}

function vote_proposal(request){
   const thread = request.body[0];
   const thread_id = '' + request.body[1].thread_id;
   var new_score = thread.score + 1;

   db.update({ _id : thread_id }, { $set: {score : new_score} }, {}, function(err, data) {
      // console.log(data);
   })
   return thread;
}

function find_comment(thread, comment_id, depth){
   for (let comment of thread.comments){
      if(comment._id == comment_id.slice(0, depth)){
         if(comment_id.length == depth){
            return comment;
         } else {
            return find_comment(comment, comment_id, depth+1);
         }
      }
   }
}