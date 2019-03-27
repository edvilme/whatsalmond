const express = require('express');
const app = express();
const https = require('https');
const url = require('url')
var access_token

var reqTokenOptions = {
    host: "almond.stanford.edu",
    path: "/me/api/oauth2/token",
    port: 443,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "origin": "http://localhost"
    }
}

var reqTokenBody = {
    "grant_type": "authorization_code",
    "client_id": "e296adf4ee85476f",
	"client_secret": "968ce8ec5d084c3c921662217e57b564e42aec434de7d2b6e76d6b440b9feb85",
	"code": "",
	"redirect_uri": "https://edvilme.github.io/Auto"
}

app.get("/", function(req, res){
	res.type('.html');  
	var reqToken = https.request(reqTokenOptions, function(resToken){
		resToken.on("data", function(data){
			if(JSON.parse(data.toString())['access_token'] != undefined){
				access_token=JSON.parse(data.toString())['access_token']
			}else{
				res.redirect(301, 'https://almond.stanford.edu/me/api/oauth2/authorize?response_type=code&client_id=e296adf4ee85476f&scope=user-exec-command&redirect_uri=https://edvilme.github.io/Auto');
			}
			res.write(`
			<html>
				<head>
					<title>Auto Assistant</title>
					<style>
						document, body{
							width: 100%;
							heigth: 100%;
							padding: 0;
							margin: 0;
							display: flex;
							flex-direction: column;
							justify-content: center; 
							align-items: center  
						}
						.chat_cont{
							padding: 16px;
							display: flex;
							flex-direction: column;
							max-width: 720px;
							width: 100%;
							
							box-sizing: border-box;
						}
						.message, .chat-input{
							font-family: 'Arial', sans-serif;
							font-weight: 600;
							font-size: 24;
							margin: 8px;
							padding: 16px;
							width: auto 
						}
						.message{
							border-radius: 16px;
						}
						.message-user{
							align-self: flex-end;
							font-size: 20;
							background-color: rgb(240,240,240)
						}
						.message-almond{
							align-self: flex-start;
							border: 1px solid rgb(200,200,200);                            
						}
						.message-button, .message-link{
							font-size: 16px;
							/*background: rgb(240,240,240);*/
							font-weight: 400;
							color: rgb(0,122,255);
							border: 1px solid rgb(0, 122, 255);
							text-decoration: none;
						}
						.message-img{
							width: 80%
						}
						.cont_message-button{
							display: flex;
							flex-wrap: wrap
						}
						.message-rdl a{
							text-transform: none;
							text-decoration: none;
							color: black;
						}
						.message-rdl_title{
							margin-bottom: 8px;
						}
						.message-rdl_text{
							font-size: 16px;
							font-weight: 400;
						}
						
						.chat-input{
							-webkit-appearance: none;
							border: none;
							background: transparent;
							padding: 32px;
							max-width: 720px;
							width: 100%;
							margin: 0;
							box-sizing: border-box
						}


						.header{
							display: flex;
							flex-direction: row;
							align-items: center;
							align-content: center;
							position: fixed; 
							position: -webkit-sticky;
							margin: 0;
							width: 100%;
							padding: 0px;
							font-family: 'Arial';
							font-size: 16;
							top: 0; 
							box-sizing: border-box;
							justify-content: space-between;
							flex-wrap: wrap;
							-webkit-app-region: drag;
							background: white
						  }
						  .header>*{
							display: flex;
							text-align: center;
							align-items: center;
							margin: 8px;
							padding: 8px;
						  }
						  .header-top{
							  display: flex;
							  flex-direction: row;
							  margin-right: 8px; /* --this is an exception*/
						  }
						  .logo{
							  height: 48px;
						  }
						  .header-toolbar{
							display: flex;
							flex-direction: row;
							flex: 1;
							justify-content: space-between;
							width: 100%;
							/*max-width: 658px; --this is an exception */
							padding: 8px; /* --this is an exception*/
							margin: 0px; /* --this is an exception*/ 
							box-sizing: border-box;
							background-color: white;
						  }
					</style>
				</head>
				<body>
					<div class="header">
						<div class="header-top">
							<a href="http://ctrl-alt-tec.github.io/Website" style="margin-right: 8px"><img src=" " height="48px"></a>
							<img class="logo" src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/320/apple/155/robot-face_1f916.png">
						</div>
						<div class="header-toolbar" style="display: flex;"></div>
					</div>
					<div class="chat_cont"></div>
					<input type="text" class="chat-input" placeholder="What can I help you with?"></input>
					<script>
						var access_token="${access_token}";
						var ws;  
						var wasOpen=false;
						var reconnectTimeout;
						var history = [];
						history_index = [];
						function connect(){
							ws=new WebSocket("wss://almond.stanford.edu/me/api/conversation?access_token="+access_token);
							ws.onmessage=function(e){
								if(!wasOpen){
									wasOpen=true;
									reconnectTimeout=100;
								}
								//console.log(e.data);
								onWebsocketMessage(e)
							}
							ws.onclose=function(){
								if(wasOpen){
									setTimeout(connect, 100);
								}else{
									reconnectTimeout*=1.5;
									setTimeout(connect, reconnectTimeout);
								}
							}
							ws.onerror=function(e){
								console.error(e)
							}
							//console.log("gi")
						}
						connect()
						function onWebsocketMessage(e){
							var parsed = JSON.parse(e.data);
							/*switch(parsed['type']){
								case 'text':
									textMessage(parsed.text, parsed.icon);
									break;
							}*/
							var message= document.createElement("div");
								message.classList.add("message")
								message.classList.add("message-almond")
							if(parsed.type=="text"){
								//var message= document.createElement("div");
								//message.classList.add("message")
								//message.classList.add("message-almond")
								message.innerText = parsed.text;
								document.querySelector(".chat_cont").append(message);
							}else if(parsed.type=="button" || parsed.type=="choice"){
								messageButton(parsed, message)                                    
								//document.querySelector(".chat_cont").append(message);
							} else if(parsed.type=="link"){
								message.classList.add("message-link");
								message.innerHTML = "<a href='https://almond.stanford.edu/me"+parsed.url+"'>"+parsed.title+"</a>";
								document.querySelector(".chat_cont").append(message);
							} else if(parsed.type=="picture"){
								var img = document.createElement("img");
								img.classList.add("message")
								img.classList.add("message-img")
								img.classList.add("message-almond")
								img.src=parsed.url;
								document.querySelector(".chat_cont").append(img);
							} else if(parsed.type=="rdl"){
								message.classList.add("message-rdl");
								message.innerHTML= "<a href='"+parsed.rdl.webCallback+"'>"+
									"<div class='message-rdl_title'>"+parsed.rdl.displayTitle+"</div>"+
									"<div class='message-rdl_text'>"+parsed.rdl.displayText+"</div>"+
								"</a>";
								document.querySelector(".chat_cont").append(message);
							}
							
							
							else if(parsed.type=="askSpecial"){
								if(parsed.ask=="yesno"){
									var message_yes = message.cloneNode();
									var message_no = message.cloneNode();
									message_yes.classList.add("message-button"); message_no.classList.add("message-button");
									message_yes.innerText = "Yes"; message_no.innerText = "No";
									messageButton({"type": "choice", "title": "Yes"}, message_yes);
									messageButton({"type": "choice", "title": "No"}, message_no);
									//document.querySelector(".chat_cont").append(message_yes);
									//document.querySelector(".chat_cont").append(message_no);
								}
							}
						}
						function messageButton(parsed, element){
							element.classList.add("message-button")
							element.innerText = parsed.title;
							element.addEventListener("click", function(e){
								if(!element.classList.contains("message-button_clicked")){
									if(parsed.type=="button"){
										ws.send(JSON.stringify({
											"type": "parsed",
											"json": parsed.json
										}))
									}else if(parsed.type=="choice"){
										ws.send(JSON.stringify({
											"type": "command",
											"text": parsed.title
										}))
									}
									element.classList.add("message-button_clicked");
									element.classList.add("message-user")
									element.classList.remove("message-almond");
									element.classList.remove("message-button");
									//var cloneButton = element.cloneNode()

									document.querySelector(".chat_cont").replaceChild(element, document.querySelector(".cont_message-button"))

									/*document.querySelectorAll(".message-button:not(.message-button_clicked)").forEach(function(l){
										document.querySelector(".cont_message-button").removeChild(l)
									});*/
								}
							})
							if(document.querySelector(".chat_cont").lastElementChild.classList.contains("cont_message-button")){
								document.querySelector(".chat_cont").lastElementChild.append(element)
							}else{
								var cont_messageButton = document.createElement("div");
								cont_messageButton.classList.add("cont_message-button");
								cont_messageButton.append(element);
								document.querySelector(".chat_cont").append(cont_messageButton)
							}

						}
						document.querySelector(".chat-input").addEventListener("keypress", function(e){
							var query = document.querySelector(".chat-input").value;
							//document.addEventListener("")
							if(e.key === "Enter"){
								if(query=="clear"){
									window.location.reload()
								}
								ws.send(JSON.stringify({"type": "command", "text": query}))
								var message= document.createElement("div");
								message.classList.add("message")
								message.classList.add("message-user")
								message.innerText = query;
								document.querySelector(".chat_cont").append(message);
								document.querySelector(".chat-input").value=""
							}
						})
					</script>
				</body>
			</html>
			`);
			res.end()
		})
	}) 
	if(url.parse(req.url, true).query.code != undefined){
        reqTokenBody['code'] = url.parse(req.url, true).query.code;
		reqToken.write(JSON.stringify(reqTokenBody))
		reqToken.end()
    }else{
		res.redirect(301, 'https://almond.stanford.edu/me/api/oauth2/authorize?response_type=code&client_id=e296adf4ee85476f&scope=user-exec-command&redirect_uri=https://edvilme.github.io/Auto');		
		//res.end()
	}
})
app.listen(process.env.PORT || 4000, function(){
	console.log("Your node js server is running")
})
