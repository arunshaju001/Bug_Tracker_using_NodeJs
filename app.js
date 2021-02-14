import express from 'express';
const MongoClient = require('mongodb').MongoClient;
import bodyParser from 'body-parser';
const port = 3000;
const app = express();
let db;
const mongourl = 'mongodb://127.0.0.1:27017/'
const col_name = 'bugtracker';

app.use(express.static(__dirname+'/public'));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', './views');

function finddays(date1){
    var date2 = new Date(); 
    var Diff_In_Time = date2.getTime() - date1.getTime(); 
    var Diff_In_Days = Math.trunc(Diff_In_Time / (1000 * 3600 * 24)); 
    // console.log(Diff_In_Days)
    if(3-Diff_In_Days<=0){
        return 0
    }
    else{
        return 3-Diff_In_Days
    }
}

// Get Data from datbase and display on index
app.get('/', (req,res)=>{
    var formatedresult ={}
    db.collection(col_name).find().toArray( async (err,result) => {
        if(err) throw err;
        formatedresult=result
        for(var i=0;i<formatedresult.length; i++){
            formatedresult[i].remday = await finddays(formatedresult[i].datetime);
        }
        res.render('index', { formatedresult})
    })
})

// Post data from ui
app.post('/addBug', (req,res) => {
    
    var datetime = new Date()
    req.body.time = datetime.toLocaleTimeString()
    req.body.date = datetime.toLocaleDateString()
    req.body.datetime=datetime
    req.body.remday=3

    console.log(req.body)
    db.collection(col_name) 
        // In Req.body we will recive the data
        // from form.
        .insertOne(req.body, (err,result) => {
            if(err) throw err;
            console.log('data.inserted');
        })
    res.redirect('/');
})


// Find user by name
app.post('/find_by_name',(req,res) => {
    let name = req.body.name;
    db.collection(col_name)
      .find({name:name})
      .toArray((err,result) => {
          if(err) throw err;
          res.send(result)
      })
});



// Opening Add User page
app.get('/addBug',(req,res) => {
    res.render('admin')
})

MongoClient.connect(mongourl,{ useUnifiedTopology: true },(err,client) => {
    if(err) throw err;
    db = client.db('Bug_Tracker')
    app.listen(port, ()=> {
        console.log(`Server running on port ${port}`)
    })
})