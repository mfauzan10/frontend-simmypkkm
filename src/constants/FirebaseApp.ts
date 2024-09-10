import {initializeApp} from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyDerzt0RQcWjBC_NoMRRUyOoviru_8rKWM',
  authDomain: 'garuda-21.firebaseapp.com',
  projectId: 'garuda-21',
  storageBucket: 'garuda-21.appspot.com',
  messagingSenderId: '826890861751',
  appId: '1:826890861751:web:16492c24ce361e7dfc2132',
  measurementId: 'G-L2LD6LNF6J'
};

const firebaseApp = initializeApp(firebaseConfig)

export default firebaseApp
