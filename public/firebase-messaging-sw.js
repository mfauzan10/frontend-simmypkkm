importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

var firebaseConfig = {
    apiKey: "AIzaSyDerzt0RQcWjBC_NoMRRUyOoviru_8rKWM",
    authDomain: "garuda-21.firebaseapp.com",
    projectId: "garuda-21",
    storageBucket: "garuda-21.appspot.com",
    messagingSenderId: "826890861751",
    appId: "1:826890861751:web:16492c24ce361e7dfc2132",
    measurementId: "G-L2LD6LNF6J"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
    };

    self.registration.showNotification(notificationTitle,
        notificationOptions);
});