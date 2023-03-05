import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  where
} from 'firebase/firestore';
import { getFirebaseConfig } from './firebase-config.js';

//intialize firebase and firestore
const firebaseApp = initializeApp(getFirebaseConfig());
const db = getFirestore();



/*--- Class(es) to Manage reapated behaviours ---*/
class FirestoreDataManager {
  constructor(db, collectionName, sectionName, formId, deleteFunction = null) {
    this.db = db;
    this.sectionName = sectionName;
    this.form = document.querySelector(`section#${formId} form#${formId}`) || false;
    this.table = document.querySelector(`section#${sectionName} table tbody`);
    this.deleteFunction = deleteFunction;

    if (this.form) {
      this.form.querySelector('input[type="submit"]').onclick = async (e) => {
        e.preventDefault();
        const doc = await addFormDataToFirestore(db, collectionName, this.form, this.table);
        if (doc) {
          //reset the form to add new data
          this.form.reset();
        }
      };
    }

    loadDataFromFirestore(db, collectionName, this.table, (data) => {
      const sortedData = sortDataByColumns(getTableHeaderIds(this.table), data);
      return createRow(...sortedData);
    }, this.deleteFunction);
  }
}


/*--- Declaring Instances ---*/
const patientsManager = new FirestoreDataManager(db,'patients' ,'patient-list', 'add-patient', deleteData);
const appointmentsManager = new FirestoreDataManager(db, 'appointments', 'appointment-list', 'booking', deleteData);
const employeesManager = new FirestoreDataManager(db, 'employees', 'employee-list', 'add-employee', deleteData);
const inventoryManager = new FirestoreDataManager(db, 'inventory', 'inventory-list', 'add-item', deleteData);
const invoicesManager = new FirestoreDataManager(db, 'invoices', 'payments-list', 'patient-invoice', deleteData);





/*--- Support Functions ---*/
//Add data to Firestore Collection
async function addFormDataToFirestore(db, collectionName, formElement, tableElement, createRowCallback, onDeleteCallback) {
  // Get a reference to the Firestore collection
  const collectionRef = collection(db, collectionName);

  // Get all the input elements from the form
  const inputElements = formElement.querySelectorAll('input:not([type="submit"])');

  // Create an object to store the form data
  const formData = {};

  // Loop through each input element and add its value to the formData object
  inputElements.forEach((inputElement) => {
    const id = inputElement.id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    formData[id] = inputElement.value;
  });

  // Add the formData object as a new document to the Firestore collection
  try {
    const docRef = await addDoc(collectionRef, formData);
    console.log('Document written with ID: ', docRef.id);

    const sortedData = sortDataByColumns(getTableHeaderIds(tableElement), formData);
    var row =  createRow(...sortedData);
    const buttonTD = document.createElement('td');
    const delButton = document.createElement('input');
    delButton.setAttribute('type', 'button');
    delButton.setAttribute('value', 'X');
    delButton.addEventListener('click', (e) => onDeleteCallback(e,collectionName));
    buttonTD.appendChild(delButton);
    row.appendChild(buttonTD);

    // Add the table row to the table element
    row.setAttribute('id',`${docRef.id}`)
    tableElement.appendChild(row);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    return false;
  }
}

//Get data from Firestore Collection
async function loadDataFromFirestore(db, collectionName, tableElement, createRowCallback, onDeleteCallback) {
  // Clear the existing table rows
  //tableElement.innerHTML = '';

  // Get a reference to the Firestore collection
  const collectionRef = collection(db, collectionName);

  // Query all the documents from the collection
  const querySnapshot = await getDocs(collectionRef);

  // Loop through each document and display its data in a table row
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const row = createRowCallback(data);

    // Add a delete button to the table row
    const buttonTD = document.createElement('td');
    const delButton = document.createElement('input');
    delButton.setAttribute('type', 'button');
    delButton.setAttribute('value', 'X');
    delButton.addEventListener('click', (e) => onDeleteCallback(e,collectionName));
    buttonTD.appendChild(delButton);
    row.appendChild(buttonTD);

    // Add the table row to the table element
    row.setAttribute('id',`${doc.id}`)
    tableElement.appendChild(row);
  });
}

//delete row and data
async function deleteData(e,collectionName) {
  //find the row
  var elem = e.target;
  while(elem.tagName != 'TR') {
    elem = elem.parentElement;
  }
  //delete the document from firestore
  await deleteDoc(doc(db, collectionName, elem.id));
  console.log(`Document ${elem.id} deleted.`);
  //delete the row
  elem.parentElement.removeChild(elem);
}

//create row element
function createRow(...columns) {
  var row = document.createElement('tr');
  columns.forEach((column) => {
    var col = document.createElement('td');
    col.textContent = column;
    row.appendChild(col);
  });
  return row;
}

//sort data wrt headers array
function sortDataByColumns(headers, data) {
  const sortedData = [];
  headers.forEach((header) => {
    const value = data[header];
    sortedData.push(value);
  });
  return sortedData;
}

//get the id of all table headers for sorting the data by columns
function getTableHeaderIds(tableElement) {
  const headerIds = [];
  const headerCells = tableElement.querySelectorAll('th');
  headerCells.forEach((cell) => {
    const kebabCaseId = cell.getAttribute('id');
    if (kebabCaseId) {
      const camelCaseId = kebabCaseId.replace(/-([a-z])/g, (match, letter) => {
        return letter.toUpperCase();
      });
      headerIds.push(camelCaseId);
    }
  });
  return headerIds;
}
