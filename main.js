const express = require('express');
const app = express();

app.get("/", function(req, res){
	res.write("hi")
	res.end()
})
app.listen(process.env.PORT || 4000, function(){
	console.log("Your node js server is running")
})
