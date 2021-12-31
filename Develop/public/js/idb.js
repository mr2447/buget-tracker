//create variable to hold db connection
let db;

//establish a connection to IndexDB database called 'buget_tracker' and set it to version 1
const request = indexedDB.open('buget_tracker', 1);
//this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    //save a reference to the database
    const db = event.target.result;
    //create an object store (table) called 'new_buget', set it to have an auto incrementing primry key of sorts 
    db.createObjectStore('new_buget', { autoIncrement: true });
};

//upon a successful
request.onsuccess = function(event) {
    //when db is successfully created with its object store (from onupgradeneeded event above) or simply established a connection, save reference to db in global variable 
    db = event.target.result;

    //check if app is online, if yes run uploadBuget() function to send all local db data to api
    if (navigator.online) {
        // uploadBuget()
    }
};

request.onerror = function(event) {
    //log error here
    console.log(event.target.errorCode)
};

//This function will be executed if we attempt to submit a new buget and there's no internet connection 
function saveRecord(record) {
    //open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_buget'], 'readwrite');

    //access the object store for 'new_pizza'
    const bugetObjectStore = transaction.objectStore('new_buget');

    //add record to your store with add method
    bugetObjectStore.add(record)
};

function uploadBuget() {
    //open a transaction on your db
    const transaction = db.transaction(['new_buget'], 'readwrite');

    //access your object store
    const bugetObjectStore = transaction.objectStore('new_buget');

    //get all recod from store and set to a variable 
    const getAll = bugetObjectStore.getAll();
    //upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        //if there was data in indexedDB's store, let's send it to the api server
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                  Accept: "application/json, text/plain, */*",
                  "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                  throw new Error(serverResponse);
                }
                //open one more transaction
                const transaction = db.transaction(['new_buget'], 'readwrite');
                //access the new_buget object store
                const bugetObjectStore = transaction.objectStore('new_buget')
                //clear all items in your store
                bugetObjectStore.clear();

                alert('All saved buget has been submitted!')
            })
            .catch(err => {
               console.log(err);
            }); 
        }
    }
};

//listen for app coming back online 
window.addEventListener('online', uploadBuget)