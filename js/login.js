//get element related to the submit button on the login page
let submitButton = document.getElementsByClassName("login-form");
//add an eventlistener that looks for a submit call
submitButton[0].addEventListener('submit', loginAction)

//function to return a request object literal
function makeRequestOption(methodType, headerContent, bodyContent){
    return {
        method: methodType,
        headers: headerContent,
        body: JSON.stringify(bodyContent),
    }
}

//function that handles the login action
async function loginAction(e){
    //dont reload the page u goof
    e.preventDefault();

    //create a data literal object to hold contents of our body for a request
    const data = new Object;
    data.username = document.getElementById('loginEmail').value;
    data.password = document.getElementById('loginPass').value;

    //store username in sessionstorage to be used late
    sessionStorage.username = data.username;

    //add in error checking for email

    //create a request 
    let requestOption = makeRequestOption('POST', {'Content-Type': 'application/json'}, data);

    //login flag 
    let login = true;

    //variable to tempaorary hold the token
    let authenticationToken;
    
    //make a request to server for a authentication code
    await fetch('https://eleox-interview-api-7n5su.ondigitalocean.app/login',requestOption)
    .then(response => {

        if(!response.ok){
            login = false;
            throw new Error;
        }

        return response.json();
    })
    .then(data => {
        //extract the authentication Token
        authenticationToken = data.access_token;
        console.log(authenticationToken);
    })
    .catch(error => {
        console.error("LOGIN REPONSE HAS FAILED", error);
    });

    //store autherization code in local browser storage
    if(login == false){
        //add code above above the form that says login failed
        alert("Login Attempt has failed");
    } else {
        //store the authenzation token in the browser and then redirect the page
        sessionStorage.eleoxAuthToken = authenticationToken;

        //move to the home portal link
        location.href = "/common/homeportal.html";
    }




}


