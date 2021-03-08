let db;
const request = window.indexedDB.open("budget", 1);

// Create schema
request.onupgradeneeded = event => {
    const db = event.target.result;
    // Creates an object store with a listID keypath that can be used to query on.
    db.createObjectStore("pending", {
        autoIncrement: true
    });
};

// Opens a transaction, accesses the toDoList objectStore and statusIndex.
request.onsuccess = (event) => {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};
