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
  doc,
  where
} from 'firebase/firestore';
import { getFirebaseConfig } from './firebase-config.js';

//intialize firebase and firestore
const firebaseApp = initializeApp(getFirebaseConfig());
const db = getFirestore();
//load data
loadEmployee();
loadDepartment();

document.querySelector('section#employee-detail div').onclick = ()=>{addEmployee()}
document.querySelector('section#employee-detail table tr.:not([class="input"]) td button').onclick = ()=>{alert('no update function')}

function onDelete() {
  console.log('delete clicked');
}

//get services from Firestore
async function loadEmployee() {
  var table = document.querySelector('section#employee-detail table tbody');
  var buttonTD = document.createElement('td');
  var delButton = document.createElement('input');
  delButton.setAttribute('type','button');
  delButton.setAttribute('onlick','onDelete()');
  delButton.textContent = 'Del';
  buttonTD.appendChild(delButton);
  //Query all the details from collection
  const employeeQuery = query(collection(getFirestore(), 'employee'));
  const querySnapshot = await getDocs(employeeQuery);
  querySnapshot.forEach((doc) => {
    var employee = doc.data();
    var row = createRow(employee.name, employee.department, employee.position, employee.hours);
    row.appendChild(buttonTD);
    table.appendChild(row);
  });
};

async function loadDepartment() {
  var table = document.querySelector('section#department-detail table tbody');
  var delButton = document.createElement('input');
  //Query all the details from collection
  const departmentQuery = query(collection(getFirestore(), 'department'));
  const querySnapshot = await getDocs(departmentQuery);
  querySnapshot.forEach((doc) => {
    var department = doc.data();
    var row = createRow(department.name, department.phone, department.location);
    table.appendChild(row);
  });
};

async function addEmployee() {
  var inputRow = document.querySelector('section#employee-detail table tr.input');
  try {
    const doc = await addDoc(collection(db, "employee"), {
      name: inputRow.querySelector("td input#name").value, //failSafe
      department: inputRow.querySelector("td input#department").value,
      position: inputRow.querySelector("td input#position").value,
      hours: inputRow.querySelector("td input#hours").value,
    });
    var row = createRow(
      inputRow.querySelector("td input#name").value,
      inputRow.querySelector("td input#department").value,
      inputRow.querySelector("td input#position").value,
      inputRow.querySelector("td input#hours").value
    );
    row.appendChild(delButton);
    document.querySelector('section#department-detail table tbody').appendChild(row);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

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
