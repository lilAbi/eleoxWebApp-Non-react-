//DOM ELEMENT
//----------------------------------------------------------------------------------------------------------------------------------
//certain dom elements are cached for quick access
let homeImageElem = document.getElementsByClassName('home-image')[0];
let empListElem = document.getElementsByClassName('employee-list')[0];
let addEmpElem = document.getElementsByClassName('add-employee')[0];
let formElem = document.getElementsByClassName('addPerson')[0];

//adding listeners to for events
let sidebar = document.getElementsByClassName('sidebar-container-flex')[0];
sidebar.addEventListener('click', sidebarAction);


let submitButton = document.getElementsByClassName('formButton')[0];
submitButton.addEventListener('click',addEmployee);


//store elements that were created to be deleted when moving out of employee list;
const elemementsToBeDelete = [];

document.getElementsByClassName('welcome-text')[0].innerText = "Welcome, " + sessionStorage.username;

//utility functions
//------------------------------------------------------------------------------------------------------------------------------------
//function to return a request object literal
function makeRequestOption(methodType, headerContent, bodyContent){

    req = new Object;
    req.method = methodType;
    req.headers = headerContent;

    if(bodyContent != undefined){
        req.body = JSON.stringify(bodyContent);
    }

    return req;
}

//function to request people from the server and put it in an array
async function arrayObjectOfPeople(){
    //temp array to hold people
    let arrayObjPeople;

    //object literaly to specifiy headers
    const header = returnHTTPHeader();

    //makes a get reqestion object
    const requestObject = makeRequestOption('GET', header);

    //make a fetch call and wait until all the data is fetched so it can be stored into the temp array
    await fetch('https://eleox-interview-api-7n5su.ondigitalocean.app/people', requestObject)
    .then(response => {

        if(!response.ok){
            throw new Error;
        }
        return response.json();

   })
    .then(data =>{
        arrayObjPeople = data.people;
   });

   //return temp array
   return arrayObjPeople;
}

//return comments of a person when passed in ID
async function commentsOfPerson(id){
    //temp array to hold people
    let arrayComment = [];

    //object literaly to specifiy headers
    const header = returnHTTPHeader();

    //makes a get reqestion object
    const requestObject = makeRequestOption('GET', header);

    const url = 'https://eleox-interview-api-7n5su.ondigitalocean.app/people/'+id;

    //make a fetch call and wait until all the data is fetched so it can be stored into the temp array
    await fetch(url, requestObject)
    .then(response => {

        if(!response.ok){
            console.log("we got an error");
            throw new Error;
        }
        return response.json();

   })
    .then(data =>{
        arrayComment = data.person.comments;
   });

   //return temp array
   return arrayComment;
}

function returnHTTPHeader(){

    let header = new Object;
    header["Content-Type"] = 'application/json';
    header["Authorization"] = "Bearer " + sessionStorage.eleoxAuthToken;
    return header

}

async function deleteID(event){

    //stop whatever default actions occurs
    event.preventDefault();

    console.log("deleting");

    
    //finds the closest element to where user clicked 
    let buttonElement = event.target.closest('button');
    
    //extract ID
    let deleteID = buttonElement.personID;

    let willDelete = false;

    //confirm deleting user?
    willDelete = confirm("Are you sure you want to delete ID: "+ deleteID);

    //on false do nothing
    if(willDelete == false){
        return;
    }

    //object literaly to specifiy headers
    const header = returnHTTPHeader();

    //construct payload
    let payload = new Object;
    payload.deletedPerson = deleteID;

    //makes a DELETE request object
    const requestObject = makeRequestOption('DELETE', header, payload);

    //fetch call to delete ID
    const url = 'https://eleox-interview-api-7n5su.ondigitalocean.app/people/'+deleteID;
    await fetch(url, requestObject)
    .then(response => {

        if(!response.ok){
            console.log("we got an error");
            throw new Error;
        }
        return response.json();

   })
    .then(data =>{
        //print return to the console 
        console.log(data);

    });

    //after deleting, lets clear the content and draw the layout
    clearScreen();
    drawEmpListLayout();
}


//delete all the elements
function deleteElements(){

    for(element of elemementsToBeDelete){
        element.parentNode.removeChild(element);
    }

    elemementsToBeDelete.length =0;
}

//clear the screen 
function clearScreen(){
    deleteElements();
    homeImageElem.classList.add("hiding");
    empListElem.classList.add("hiding");
    addEmpElem.classList.add("hiding");
    formElem.classList.add("hiding");
}

//function to add time and date
function getTime() {
    //get current timestamp
    let now = new Date();
    let month= ["January","February","March","April","May","June","July","August","September","October","November","December"];
    let time = now.getHours() + ':' + now.getMinutes();

    // combine to get date
    let date = [now.getDate(), month[now.getMonth()], now.getFullYear()].join(' ');

    // set the content of the element with the ID time to the formatted string
    document.getElementsByClassName('time')[0].innerText = [date, time].join(' / ');

    //call every 1 second
    setTimeout(updateClock, 1000);
}
getTime();


//callback functions
//------------------------------------------------------------------------------------------------------------------------------

function sidebarAction(event){
    //stop whatever default actions occurs
    event.preventDefault();

    //finds the closest element to where user clicked 
    let closestElem = event.target.closest('a');


    //clearContent area
    clearScreen();


    //test if the element if found
    if(closestElem !== null) {
        //based on what has been clicked perform said action
        switch(closestElem){
            case sidebar.children[0]: //home
                console.log(closestElem.innerHTML);
                drawHomeLayout();
            break;

            case sidebar.children[1]: //employeelist
                console.log(closestElem.innerHTML);
                drawEmpListLayout();
            break;

            case sidebar.children[2]: //add Employee
                console.log(closestElem.innerHTML);
                addEmpLayout();
            break;

            case sidebar.children[3]: //logout
                console.log(closestElem.innerHTML);
                doLogoutAction();
            break;
        }


    } else {
        //if clicked outside of the "buttons" make sure nothing happens
        return;
    }
}


function drawHomeLayout(elem){
    homeImageElem.classList.remove("hiding");

}

//Employee List creation related functions
//------------------------------------------------------------------------------------------
async function createCommentBox(event){
    //stop whatever default actions occurs
    event.preventDefault();

    //array to hold comments
    let array;

    //finds the closest element to where user clicked 
    let buttonElement = event.target.closest('button');

    //extract ID
    let id = buttonElement.personID;

    //get the parent nodes
    let parentNode = event.target.closest('button').parentNode;

    //wait for array to come back FILLED
    await commentsOfPerson(id).then(result => array = result);

    //loop through array and create comments
    for(comment of array){

        let commentBox = document.createElement("p");
        commentBox.className = "commentBox";

        commentBox.innerHTML = String(`
            ID:${comment.id} <br/>
            Comment: ${comment.comment} <br/>
            `);

        elemementsToBeDelete.push(commentBox);
        parentNode.insertAdjacentElement('afterend',commentBox);
    }
}

async function drawEmpListLayout(){
    //hide other elements within the windon content
    empListElem.classList.remove("hiding");

    //fill array with data from the server
    let arrayObjPeople;
    await arrayObjectOfPeople().then(array => arrayObjPeople = array);

    for(personObj of arrayObjPeople){
        
        //to make a whole "textbox element"
        let textboxElem = document.createElement("div");
        textboxElem.className = "textBox";

        //elements that will be childen of textbox elements
        let avatar = document.createElement("img");
        avatar.className = "text-box-img";

        let text = document.createElement("p");
        text.className = "personInfo";

        let commentButton = document.createElement("button");
        commentButton.className = "button-comment";

        let deleteButton = document.createElement("button");
        deleteButton.className = "button-delete";


        //construct the hierarchy
        textboxElem.appendChild(avatar);
        textboxElem.appendChild(text);
        textboxElem.appendChild(commentButton);
        textboxElem.appendChild(deleteButton);
        empListElem.appendChild(textboxElem);

        //set elements need
        avatar.setAttribute('src', String(personObj.avatar));
        text.innerHTML = String(`
            Name: ${personObj.first_name} ${personObj.last_name} <br/>
            ID: ${personObj.id} <br/>
            Email: ${personObj.email} <br/>
            Job Title: ${personObj.job_title}
            `);

        commentButton.innerHTML = "Show comments";
        deleteButton.innerHTML = "Delete";

        //added event listener to get commments
        commentButton.addEventListener('click', createCommentBox);
        commentButton.personID = personObj.id;

        //added event listener to delete USERS
        deleteButton.addEventListener('click', deleteID);
        deleteButton.personID = personObj.id;


        
        //add newly constructed elements to be later deleted
        elemementsToBeDelete.push(textboxElem);
    }

}

//Adding Employess related code
//----------------------------------------------------------------------------------------

function addEmployee(event){
    //prevent inital action
    event.preventDefault();

    //extract data from the form
    const firstName = document.getElementById('fromFName').value;
    const lastName = document.getElementById('fromLName').value;
    const email = String(document.getElementById('formEmail').value);
    const jobTitle = document.getElementById('formJob').value;
    const avatar = document.getElementById('formAvatar').value;

    //check if there is a valid email
    if(!email.includes('@')){
        alert("Not a valid email");
        return;
    }

    //contruct the payload to send to server
    const payload = new Object;
    payload.first_name = firstName;
    payload.last_name = lastName;
    payload.email = email;
    payload.job_title = jobTitle;

    //test for avatar link
    if(avatar == ""){
        payload.avatar = "null";
    } else {
        payload.avatar = avatar
    }

    console.log(payload)

    //object literal to specifiy headers
    const header = returnHTTPHeader();

    //makes a POST request object
    const requestObject = makeRequestOption('POST', header, payload);

    //fetch call galore
    const url = 'https://eleox-interview-api-7n5su.ondigitalocean.app/people';
    fetch(url, requestObject)
    .then(response => {

        if(!response.ok){
            console.log("we got an error");
            throw new Error;
        }
        return response.json();

   })
    .then(data =>{
        //print return to the console 
        console.log(data);

    });
}

function addEmpLayout(){
    //remove the "hiding" class to reveal the form
    addEmpElem.classList.remove("hiding");
    formElem.classList.remove("hiding");
}

function doLogoutAction(){
    //delete session data
    sessionStorage.clear();
    //delete local storage
    localStorage.clear(); 

    //return to the login page
    location.href = "../index.html";
}




