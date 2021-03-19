// https://stackoverflow.com/questions/37437805/convert-map-to-json-object-in-javascript

const { response } = require('express');
const express = require('express');
const Datastore = require('nedb');
const app = express();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});

// const port = process.env.PORT;
// app.listen(port, () => {
//   console.log(`Starting server at ${port}`);
// });

// setInterval(() => {
//   http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
// }, 280000);

 // app.listen(3000, () => console.log('listening at 3000'));
 app.use(express.static('public'));
 app.use(express.json({limit: '1mb'}));

//  app.listen(3000, () => console.log('listening at 3000'));
 app.use(express.static('public'));
 app.use(express.json({limit: '1mb'}));

const db = new Datastore('database.db');
db.loadDatabase();

app.get('/api', (request, response)=> {
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

 app.post('/api', (request, response)=> {
   //  console.log(request.body);
    const data = request.body;
   //  console.log(data[0])

    db.remove({type: "proposal"}, {multi:true}, function(err, numRemoved){

    })

    db.insert(data);
    db.loadDatabase();
    response.json(request.body);
 })

 app.post('/proposal', (request, response) =>{
   db.find({}, (err, data) => {
      if (err) {
         response.json({test: "err"});
         return;
      }
      const thread = request.body;
      thread.id = "" + (data.length + 1);
      thread.title += (data.length + 1);
      // console.log(thread);
      db.insert(thread);
      // response.json(request.body);


      response.json(thread);
   })
 })

 app.get('/proposal', (request, response) =>{
   db.find({}, (err, data) => {
      if (err) {
         response.json({test: "err"});
         return;
      }
      response.json(thread);
   })
 })

 app.post('/update_proposal', (request, response) =>{

   if(request.body[2].action == "comment"){
      response.json(add_comment(request));
   } else if (request.body[2].action == "vote"){
      response.json(vote(request));
   }
})

 function add_comment(request){
   const thread = request.body[0];
   const comment = request.body[1];
   const parent_comment_id = comment.parent_id;
   // console.log(thread);
   // console.log(comment);

   var parent_comment;
    for(var com of thread.comments){
        if(com.id == parent_comment_id){
            parent_comment = com;
        }
    }

   var parent_comment_intree = find_comment(thread, ""+parent_comment_id, 2);
   // console.log(parent_comment_intree);

   var new_comment_id;
   if(parent_comment == null){
           new_comment_id = "" + thread.id + (thread.comments.length + 1);
   } else {
           new_comment_id = "" + parent_comment.id + (parent_comment.comments.length + 1);
   }
   comment.id = new_comment_id;

   db.remove({_id: thread._id}, {}, function(err, numRemoved){})

   if(parent_comment != null && parent_comment_intree.comments != null){
      // parent_comment.comments.push(comment);
      parent_comment_intree.comments.push(comment);
   }
   thread.comments.push(comment);

   db.insert(thread);
   return [thread, comment];
   // response.json([thread, comment]);
 }

function vote(request){
   const thread = request.body[0];
   const comment_id = "" + request.body[1].com_id;
   const diff = request.body[3].diff

   var comment_intree = find_comment(thread, comment_id, 2);
   comment_intree.score += diff;

   // console.log(thread.comments);

   db.remove({_id: thread._id}, {}, function(err, numRemoved){})
   db.insert(thread);
   return thread;
   //  response.json(thread);
}


function find_comment(thread, comment_id, depth){
   for (let comment of thread.comments){
      if(comment.id == comment_id.slice(0, depth)){
         if(comment_id.length == depth){
            // console.log(comment);
            return comment;
         } else {
            return find_comment(comment, comment_id, depth+1);
         }
      }
   }
}