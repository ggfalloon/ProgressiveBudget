// declares a new database for holding budget database info in IndexedDB storage.
let db;
const request = window.indexedDB.open("budget", 1);

// Handles the event for a higher version than the stored database.
request.onupgradeneeded = event => {
    const db = event.target.result;
    // Creates an object store that auto increments each transaction.
    db.createObjectStore("pending", {
        autoIncrement: true
    });
};

// Opens a transaction and checks that the database is online.
request.onsuccess = (event) => {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

// console logs in case the request for opening a transaction is not successful.
request.onerror = (event) => {
    console.log("Your browser is not supporting a stable version of IndexedDB for use offline. " + event.target.errorCode);
};

// Saves to the pending database
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
}

// When database is back online, gets all records from the pending store and adds them to the online db.
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            }).then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}

window.addEventListener("online", checkDatabase);