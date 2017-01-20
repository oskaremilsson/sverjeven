var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static('public'))

var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
      /* Keeping for future use */
        exists: function(variable, options) {
          console.log(variable);
            if (typeof variable !== 'undefined' && variable !== "") {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        }
    },
    defaultLayout: 'main'
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');



/**
 * The {{#exists}} helper checks if a variable is defined.
 *
exphbs.registerHelper('exists',
});*/

app.get("/", function (req, res) {
    res.render("home");
});

app.post('/', function (req, res) {

  saveInputToTempFile(req.body.text);

  var python = require('child_process').spawn(
     'python3',
     // second argument is array of parameters, e.g.:
     [__dirname + "/bad_scripts/sverje_ven.py", "input.txt"]
     );
  /*python.stdout.on('data', function(data){
      output += data;
    });*/

  python.on('close', function(code){
       if (code !== 0 && code != 57) {
         res.send(500, code);
         //res.render('home');
       }
       else {
         output = readInputTempFile();
         output.then(function(data) {
           //data recieved render it
           res.render('home', {
             text: req.body.text,
             output: data,
             done: true
           });
         })
         .catch(function(err) {
           res.sendStatus(500);
         });

      }
     });

  //res.send(output);
});

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});

function saveInputToTempFile(data) {
  fs.writeFile("input.txt", data, "utf8", function(err) {
    if(err) {
        return console.log(err);
    }
  });
}

function readInputTempFile() {
  return new Promise(function(resolve, reject) {
      fs.readFile('bad_scripts/out.txt', function (err,data) {
      if (err) {
        //return console.log(err);
        reject(err);
      }
      resolve(data);
    });
  });
}
