const express = require('express');
const Datastore = require('nedb');
const app = express();

 app.listen(3000, () => console.log('listening at 3000'));
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
    console.log(request.body);
    const data = request.body;
   //  console.log(data[0])

    db.remove({type: "proposal"}, {multi:true}, function(err, numRemoved){

    })

    db.insert(data);
    db.loadDatabase();
    response.json(request.body);
 })