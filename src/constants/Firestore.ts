import firebaseApp from './FirebaseApp'
import {initializeFirestore} from 'firebase/firestore'

const firestore = initializeFirestore(firebaseApp, {})

export default firestore
