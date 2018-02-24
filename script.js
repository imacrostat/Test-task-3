
var eltSidebar = document.querySelector("#sidebar");
var options = {
	backgroundColor: getComputedStyle(document.body).backgroundColor,
	transitionDuration: getComputedStyle(eltSidebar).transitionDuration,
	fontSize: getComputedStyle(document.querySelector("p")).fontSize,
	fontFamily: getComputedStyle(document.body).fontFamily,
	fonts: ["Arial", "Courier New", "Georgia", "Lucida Sans Unicode", "Tahoma"]
};


/* --------- autorization & registration --------- */
function signIn() {
	fetch('https://test-task-3.firebaseio.com/users.json?orderBy="login"&equalTo="' + auth_login.value + '"')
	.then(response => {
		return response.json();
	})
	.then(jsonUser => {
		for (i in jsonUser) {
			var userId = i;
		}
		
		if (!userId || jsonUser[userId].password != auth_password.value) {
			alert("Wrong login or password!");
			return;
		}
		
		localStorage.setItem("userInfo", JSON.stringify(jsonUser[userId]));
		setUserInterface();
	})
	.catch(alert);
}

function signOut() {
	auth_password.value = "";
	localStorage.setItem("userInfo", "");
	setUserInterface();
}

function signUp() {
	if (register_password.value != register_confirmation.value) {
		alert("Fill out the 'Password' and 'Confirmation' fields again!");
		register_password.value = "";
		register_confirmation.value = "";
		return;
	}
	
	fetch('https://test-task-3.firebaseio.com/users.json?orderBy="login"&equalTo="' + register_login.value + '"')
	.then(response => {
		return response.json();
	})
	.then(jsonUser => {
		for (i in jsonUser) {
			var userId = i;
		}
		
		if (userId) {
			alert("Choose other login!");
			return;
		}
		
		writeCredentials();
	})
	.catch(alert);
}

function writeCredentials() {
	var newUserRef = firebase.database().ref('users').push();
	newUserRef.set({
		"login": register_login.value,
		"password": register_password.value
	})
	.then(() => {
		alert("Congratulations!\nYou've been registered successfully!");
		auth_login.value = register_login.value;
		auth_password.value = register_password.value;
		register_password.value = "";
		register_confirmation.value = "";
		signIn();
	})
	.catch(alert);
}


/* --------- interface --------- */
function setUserInterface() {
	var frmSignIn = document.querySelector("form.signin");
	var elsControls = document.querySelector("#controls").querySelectorAll("input, button");
	var eltGreeting = document.querySelector("div.greeting");
	var userInfo = localStorage.getItem("userInfo");
		
	if (userInfo) {
		frmSignIn.classList.add("hidden");
		eltGreeting.classList.remove("hidden");
		eltGreeting.querySelector("span").innerHTML = `Hello  ${JSON.parse(userInfo).login} ! `;
		
		for (i = 0; i < elsControls.length; i++) {
			elsControls[i].disabled = false;
		}
	} else {
		frmSignIn.classList.remove("hidden");
		eltGreeting.classList.add("hidden");
		
		for (i = 0; i < elsControls.length; i++) {
			elsControls[i].disabled = true;
		}
	}
	
	toggleRegistration(false);
}

function toggleRegistration(isCalledSeparately) {
	var messages = ["Sign up for free!", "Already signed up?"];
	var h = document.querySelector("ul.main-menu > li:last-child > a > b");
	
	if (isCalledSeparately) {
		// toggle the message
		h.innerHTML = messages[-(messages.indexOf(h.innerHTML) - 1)];
		document.querySelector("form.signin").classList.toggle("hidden");
		document.querySelector("form.signup").classList.toggle("hidden");
	} else {
		h.innerHTML = localStorage.getItem("userInfo") ? "" : messages[0];
		document.querySelector("form.signup").classList.add("hidden");
	}
}


/* --------- sidebar initialization & animation --------- */
function initializeSidebar() {
	document.querySelector("#fontsize").value = parseInt(options.fontSize);
	document.querySelector("#bgcolor").value = toHexColor(options.backgroundColor);
	document.querySelector("#remover").disabled = false;
	
	setBurgerArrow();
	insertRadioInput();
	
	function toHexColor(c) {
		c = c.match(/(\d+), (\d+), (\d+)/);
		return ("#" + (+c[1]).toString(16) + (+c[2]).toString(16) + (+c[3]).toString(16));
	}
	
	function insertRadioInput() {
		var htmlRadio = "", arrFonts = options.fonts;
		
		// add the default font family into the array and sort it
		var defFont = options.fontFamily.replace(/"/g, "'");
		arrFonts.push(defFont);
		
		for (i in arrFonts) {
			if (arrFonts[i].indexOf("'") < 0) {
				arrFonts[i] = "'" + arrFonts[i] + "'";
			}
		}
		arrFonts.sort();

		// build an html code for the radio control
		for (i in arrFonts) {
			var c = (arrFonts[i].replace(/'/g, "") == defFont.replace(/'/g, "")) ? " checked" : ""; 
			htmlRadio += 
				'<input type="radio" name="fontfamily" value="' + arrFonts[i] + '" onchange="changeFontFamily()"' + c + '></input>' +
				'<span style="font-family: ' + arrFonts[i] + '">' + arrFonts[i].split(" ")[0].replace(/'/g, "") + '</span><br>\n';
		}

		window.document.querySelector("#controls > div:nth-last-child(2) > label").insertAdjacentHTML("afterEnd", htmlRadio);
	}
}

function toggleSidebar() {
	eltSidebar.classList.toggle("folded");
		
	setTimeout('setBurgerArrow();', getHiddenTimeout(false));
	setTimeout('document.querySelector("#controls").classList.toggle("hidden");', getHiddenTimeout(true));
}

function setBurgerArrow() {
	const tUp = "∧", tRt = ">", tDn = "∨", tLt = "<";
	// adjust for a narrow width
	var m = document.documentElement.clientWidth < 460;
	burger.innerHTML = (eltSidebar.classList.contains("folded")) ? (m ? tDn : tRt) : (m ? tUp : tLt);
}

function getHiddenTimeout(isControlsTimeout) {
	var transDuration = parseFloat(options.transitionDuration) * 1000;
	return isControlsTimeout ? !(eltSidebar.classList.contains("folded")) * transDuration: transDuration * 0.9;
}


/* --------- content style customization --------- */
function changeFontSize() {
	var eltFontSize = document.querySelector("#fontsize");
	var fontSize = eltFontSize.value;
	
	if (!fontSize.trim().match(/^\d{1,2}$/)) {
		// default message displayed
		return;
	}
	
	fontSize = +fontSize;
	if (fontSize < +eltFontSize.min || fontSize > +eltFontSize.max) {
		alert("The font size should lie between " + eltFontSize.min + " and " + eltFontSize.max + "!");
		return;
	}
	
	var elsP = document.querySelectorAll("p");
	for (i = 0; i < elsP.length; i++) {
		elsP[i].style.fontSize = fontSize + "px";
	}
}

function changeBackgroundColor() {
	document.querySelector("div.content").style.backgroundColor = document.querySelector("#bgcolor").value;
}

function changeFontFamily() {
	var elsRadio = document.getElementsByName("fontfamily");
	
	for (i = 0; i < elsRadio.length; i++) {
		if (elsRadio[i].checked) {
			document.querySelector("div.content").style.fontFamily = elsRadio[i].value;
			break;
		}
	}
}

function removeLastP() {
	document.querySelector("div.content > p:last-of-type").remove();
	
	if (!document.querySelector("div.content > p:last-of-type")) {
		document.querySelector("#remover").disabled = true;
	}
}


/* --------- window functions --------- */
window.onload = function() {
	initializeSidebar();
	setUserInterface();
}

window.onresize = setBurgerArrow;
