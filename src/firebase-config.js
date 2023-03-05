
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const config = {
  apiKey: "AIzaSyBZ83SAYYYr-7d2txapr-9utl_KNYNeHto",
  authDomain: "healthcare-erp-4b646.firebaseapp.com",
  projectId: "healthcare-erp-4b646",
  storageBucket: "healthcare-erp-4b646.appspot.com",
  messagingSenderId: "516216448641",
  appId: "1:516216448641:web:26879e4622fa47f91ccf80",
  measurementId: "G-GD1580P5ET"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}
