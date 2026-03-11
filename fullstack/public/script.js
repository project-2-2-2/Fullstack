const API = "http://localhost:3000"

// ---------------- REGISTER ----------------

async function register(){

const name=document.getElementById("name").value
const email=document.getElementById("email").value
const password=document.getElementById("password").value

await fetch(API+"/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({name,email,password})

})

alert("Registered")
}

// ---------------- LOGIN ----------------

async function login(){

const email=document.getElementById("email").value
const password=document.getElementById("password").value

const res=await fetch(API+"/login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({email,password})

})

const data=await res.json()

if(data.success)
window.location="dashboard.html"
else
alert("Invalid Login")

}

// ---------------- STUDENTS ----------------

async function loadStudents(){

const res=await fetch(API+"/students")
const students=await res.json()

const table=document.getElementById("studentTable")
table.innerHTML=""

students.forEach(s=>{

const row=document.createElement("tr")

row.innerHTML=`
<td>${s.name}</td>
<td>${s.email}</td>
<td>${s.course}</td>

<td>
<button onclick="deleteStudent('${s._id}')">Delete</button>
</td>
`

table.appendChild(row)

})

}

async function addStudent(){

const name=document.getElementById("sname").value
const email=document.getElementById("semail").value
const course=document.getElementById("scourse").value

await fetch(API+"/students",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({name,email,course})

})

loadStudents()

}

async function deleteStudent(id){

await fetch(API+"/students/"+id,{
method:"DELETE"
})

loadStudents()

}

// ---------------- FEEDBACK ----------------

async function addFeedback(){

const name=document.getElementById("fname").value
const message=document.getElementById("fmsg").value

await fetch(API+"/feedback",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({name,message})

})

loadFeedback()

}

async function loadFeedback(){

const res=await fetch(API+"/feedback")
const data=await res.json()

const list=document.getElementById("feedbackList")
list.innerHTML=""

data.forEach(f=>{

const li=document.createElement("li")
li.innerText=f.name+" : "+f.message

list.appendChild(li)

})

}

if(document.getElementById("studentTable")){
loadStudents()
loadFeedback()
}