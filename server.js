/*jshint -W069 */
var io   = require('socket.io'),
    url  = require('url'),
    express = require('express');

var path = require('path');
var bodyParser = require('body-parser');
var crypto = require('crypto');

var fs = require('fs');

var app = express();

//to be updated everytime the user changes level, so not necessary a post for reset_code
var max_n_levels = 9;
//var username = null;
var username = 'ale';
var level = 1;

var levels_keys = ['level1', 'level-2', 'Level3', 'LEVEL4', 'LeVel5', 'level6', 'l-evel7', 'l8', 'L-e-v-e-l9'];
var levels_hash_keys = [];

var score = {};
var levels_completed = [];

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
	  extended: true
}));

app.use(bodyParser.json());
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

function
make_levels_keys() {
for(var i = 0; i < max_n_levels; i++) {
		levels_hash_keys.push(levels_keys[i]);
//		levels_hash_keys.push(crypto.createHash('md5').update(username+levels_keys[i]).digest("hex").substring(0,8));
	}
}

app.post('/login', function(req, res){
	console.log('body: ' + JSON.stringify(req.body));
	body = req.body;
	username = body.username;
	level_hash_key = body.level_hash_key;
	console.log(level_hash_key);
	make_levels_keys();
	score = {};

	if(level_hash_key !== "" && levels_hash_keys.indexOf(level_hash_key) > -1) {
		level = levels_hash_keys.indexOf(level_hash_key) + 1;
		res.send({ status: 'OK', 'redirect':'/index', 'level': level});
		console.log('level: '+ level);
	} else if(level_hash_key === ""){
		level = 1;
		res.send({ status: 'OK', 'redirect':'/index', 'level': level});
	} else {
		res.send({ status: 'ERROR'});
	}
});

app.post('/score', function(req, res){
	console.log('body: ' + JSON.stringify(req.body));
	body = req.body;
	d = new Date();
	n = d.getTime();
	diff_time = n - body['start_time'];
	score['diff_time'] = diff_time;
	score['levels_completed'] = body["levels_completed"];
	score['username'] = username;
	score['level'] = level;

	res.send({ status: 'OK', 'redirect':'/score', 'diff': diff_time});
});

app.get('/get_score', function(req, res){
	res.send(score);
});

app.get('/reset_code', function(req, res){
		console.log('level: '+ level);
	console.log("reset_code");
//  console.log('body: ' + JSON.stringify(req.body));
	code = return_level_code(level);
  if(code !== null) {
	res.send({ 'status': 'SUCCESS', 'body': code });
	} else {
		res.send({ 'status': 'ERROR', 'what': "file for level reset not found"});
	}
});



app.post('/get_level', function(req, res){

	make_levels_keys();
	console.log('body: ' + JSON.stringify(req.body));
	req_level = parseInt(req.body.level);
	if(req_level != -1)
		level = req_level;
	console.log(level);
	dialogs = return_level_dialog(level);
	code = return_level_code(level);
	console.log(code);
	//collect keys to send
	tmp_keys = [];
	for(i = 0; i < level; i++) {
		tmp_keys.push(levels_hash_keys[i]);
		console.log(levels_hash_keys[i]);
	}
	if(code !== null) {
		res.send ({
			'status': 'SUCCESS',
			'username': username,
			'body': code,
			'dialogs': dialogs,
			'level': level,
			'keys': tmp_keys
		});
	} else {
		res.send({ 'status': 'ERROR', 'what': "file for level not found"});
	}
});


app.post('/check_key', function(req, res){
	console.log('body: ' + JSON.stringify(req.body));

	hash_key = req.body.level_hash_key;

	lev = levels_hash_keys.indexOf(hash_key) + 1;
	if(lev === 0) {
		res.send({ 'status': 'ERROR', 'what': "key not found"});

	} else {
		res.send({ 'status': 'OK', 'level': lev});
	}
});

app.get('/', function(req, res){
	res.render('login');
	//res.render('index');
});
app.get('/score', function(req, res){
	res.render('score');
	//res.render('index');
});

app.get('/index', function(req, res){

	make_levels_keys();
	l = req.query.l;
	console.log(l);
	l = levels_hash_keys.indexOf(l)+1;
	if(l > 0) {
		level = l;
	}
	res.render('index');
});

function
return_level_code(what) {
	code_level = null;
	code_level = fs.readFileSync( __dirname + '/public/levels/level'+what+'.js', 'utf8');
//	console.log(code_level);
	return code_level;

}

function
return_level_dialog(what) {
	dialogs = {};
	var obj = {};
	obj = JSON.parse(fs.readFileSync('public/static/dialog_level'+what+'.json', 'utf8'));
	/*
	dialogs['colonel'] = [];
	dialogs['assistant'] = [];
	dialogs['crazy_doctor'] = [];
	if('colonel' in obj) {
		if(what in obj['colonel']) {
			dialogs['colonel'] = obj['colonel'][what];
		}
	}
	if('assistant' in obj) {
		if(what in obj['assistant']) {
				dialogs['assistant'] = obj['assistant'][what];
		}
	}
	if('crazy_doctor' in obj) {
		if(what in obj['crazy_doctor']) {
			dialogs['crazy_doctor'] = obj['crazy_doctor'][what];
		}
	}
*/
	return obj;


}

app.listen(8000);
