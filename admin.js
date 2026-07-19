
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

getFirestore,
collection,
onSnapshot,
query,
orderBy,
doc,
addDoc,
setDoc,
serverTimestamp,
getDocs,
getDoc,
updateDoc,
deleteDoc,
increment

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";




// =====================================
// FIREBASE CONFIG
// =====================================


const firebaseConfig = {

apiKey: "AIzaVoKXn4LgW6Wp0q4ml4IoexDKDteNSAI",

authDomain: "womenclub-dfd51.firebaseapp.com",

projectId: "womenclub-dfd51",

storageBucket: "womenclub-dfd51.firebasestorage.app",

messagingSenderId: "187221841102",

appId: "1:187221841102:web:e53f569e052bf8209b6c9f",

measurementId: "G-81V3KTYX8C"

};



const app = initializeApp(firebaseConfig);


const db = getFirestore(app);




// =====================================
// ELEMENTS
// =====================================


const usersList =
document.getElementById("usersList");


const adminMessages =
document.getElementById("adminMessages");


const customerName =
document.getElementById("customerName");


const customerPhone =
document.getElementById("customerPhone");


const customerImage =
document.getElementById("customerImage");



// =====================================
// VARIABLES
// =====================================


let selectedConversation = "";

let adminEditingMessageRef = null;
let adminLongPressTimer = null;

// =====================================
// LOAD ALL CONVERSATIONS
// =====================================


if(usersList){



const q = query(

collection(db,"conversations"),

orderBy("updatedAt","desc")

);



onSnapshot(q,(snapshot)=>{



usersList.innerHTML="";



if(snapshot.empty){


usersList.innerHTML=`

<div class="empty">

Waiting for messages...

</div>

`;

return;


}




snapshot.forEach((item)=>{



const data =
item.data();



const id =
item.id;



const card =
document.createElement("div");



card.className =
"user-card";



card.innerHTML = `


<div style="
display:flex;
align-items:center;
gap:12px;
padding:12px;
cursor:pointer;
">


<img

src="${data.profileImage}"

style="
width:55px;
height:55px;
border-radius:50%;
object-fit:cover;
"

>


<div>


<h3 style="
margin:0;
color:white;
">

${data.profile}

</h3>


<p style="
margin:5px 0 0;
color:#9aa5ab;
">

${data.phone}

</p>



<p style="
margin:5px 0 0;
color:#aaa;
font-size:13px;
">

${data.lastMessage || "No messages"}

</p>

${
data.freeGranted
?
`
<span class="free-user-active">

Unlocked

</span>
`
:
`
<button
class="free-user-btn"
data-id="${id}"
>
Free User
</button>
`
}i.


${
data.unread > 0

?

`

<div class="message-badge">

${data.unread}

</div>

`

:

""

}


</div>


</div>


`;





card.onclick = async()=>{

selectedConversation = id;

customerName.textContent =
data.profile;

customerPhone.textContent =
data.phone;

customerImage.src =
data.profileImage;



await setDoc(

doc(db,"conversations",id),

{

unread:0

},

{

merge:true

}

);

await markMessagesRead(id);

loadAdminMessages(id);

};




usersList.appendChild(card);

const freeBtn =
card.querySelector(".free-user-btn");

if(freeBtn){

freeBtn.onclick = async(e)=>{

e.stopPropagation();


await unlockFreeUser(id);


// REMOVE CARD IMMEDIATELY

const balance =
document.querySelector(".balance-message");


if(balance){

balance.remove();

}


// CHANGE BUTTON

freeBtn.textContent =
"Unlocked";


freeBtn.classList.add(
"free-unlocked"
);

// AFTER SHORT TIME RETURN TO FREE USER

};

}

});



});



}


// =====================================
// WOMENCLUB ADMIN ENGINE
// ADMIN.JS
// DROP 2/3
// OPEN CONVERSATION + LOAD MESSAGES
// =====================================



const adminInput =
document.getElementById("adminMessageInput");


const adminSend =
document.getElementById("adminSend");




// =====================================
// LOAD SELECTED CONVERSATION
// =====================================

async function markMessagesRead(conversationId){

    const snapshot = await getDocs(
        collection(
            db,
            "conversations",
            conversationId,
            "messages"
        )
    );

    for(const message of snapshot.docs){

        const data = message.data();

        if(data.sender==="user" && data.read===false){

            await updateDoc(message.ref,{
                read:true
            });

        }

    }

}


let unsubscribeAdminMessages = null;

function loadAdminMessages(conversationId){

    if(unsubscribeAdminMessages){
        unsubscribeAdminMessages();
    }

// MARK CHAT AS READ

setDoc(

doc(
db,
"conversations",
conversationId
),

{

unread:0,

updatedAt:serverTimestamp()

},

{

merge:true

}

);

const q = query(


collection(

db,

"conversations",

conversationId,

"messages"

),


orderBy("time")



);



onSnapshot(q,(snapshot)=>{



adminMessages.innerHTML="";



snapshot.forEach((item)=>{



const data =
item.data();



const bubble =
document.createElement("div");



if(data.sender==="admin"){


bubble.className =
"message sent";


}

else{


bubble.className =
"message received";


}



bubble.innerHTML = `


${data.text}


<span class="message-time">


${

data.time ?

data.time.toDate().toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

})

:

""

}


</span>


`;



adminMessages.appendChild(bubble);

bubble.addEventListener("mousedown",()=>{

    adminLongPressTimer = setTimeout(()=>{

        showAdminEditOption(
            item.id,
            data.text
        );

    },700);

});

bubble.addEventListener("mouseup",()=>{

    clearTimeout(adminLongPressTimer);

});

bubble.addEventListener("mouseleave",()=>{

    clearTimeout(adminLongPressTimer);

});

bubble.addEventListener("touchstart",()=>{

    adminLongPressTimer = setTimeout(()=>{

        showAdminEditOption(
            item.id,
            data.text
        );

    },700);

});

bubble.addEventListener("touchend",()=>{

    clearTimeout(adminLongPressTimer);

});

});



adminMessages.scrollTop =
adminMessages.scrollHeight;



});



}



// =====================================
// ADMIN SEND REPLY
// =====================================


if(adminSend){



adminSend.onclick = async()=>{

    const text =
    adminInput.value.trim();

    if(!text || !selectedConversation){

        return;

    }

  await addDoc(
collection(
db,
"conversations",
selectedConversation,
"messages"
),
{
    sender:"admin",
    text:text,
    time:serverTimestamp(),
    read:false,
    delivered:true
}
);

    const conversationRef =
    doc(
        db,
        "conversations",
        selectedConversation
    );

    const conversationSnap =
    await getDoc(conversationRef);

    const conversation =
    conversationSnap.data();

   if(conversation.freeGranted){


const messageSnapshot =
await getDocs(

collection(
db,
"conversations",
selectedConversation,
"messages"

)

);


let userCount = 0;


messageSnapshot.forEach(doc=>{


if(doc.data().sender==="user"){

userCount++;

}


});



if(userCount >= 20){

await updateDoc(

conversationRef,

{

freeGranted:false,

freeUser:false,

rechargeLocked:true,

unlockedMessages:0

}

);

}

}

   await setDoc(

conversationRef,

{

lastMessage:text,

lastSender:"admin",

lastRead:false,

lastTime:serverTimestamp(),

updatedAt:serverTimestamp(),

adminReply:true,

adminTyping:false,

unread:increment(1)

},

{

merge:true

}

);

    adminInput.value="";

};



}


// =====================================
// WOMENCLUB ADMIN ENGINE
// ADMIN.JS
// DROP 3/3
// SEARCH + UNREAD + LIVE UPDATE POLISH
// =====================================



const searchUsers =
document.getElementById("searchUsers");



// =====================================
// SEARCH CONVERSATIONS
// =====================================


if(searchUsers){



searchUsers.addEventListener(

"input",

()=>{



const value =
searchUsers.value.toLowerCase();



document
.querySelectorAll(".user-card")
.forEach(card=>{



const text =
card.innerText.toLowerCase();



if(text.includes(value)){


card.style.display="block";


}

else{


card.style.display="none";


}



});



});


}




// =====================================
// MARK CONVERSATION ACTIVE
// =====================================


document.addEventListener(

"click",

(e)=>{



const card =
e.target.closest(".user-card");



if(!card){

return;

}



document
.querySelectorAll(".user-card")
.forEach(item=>{


item.classList.remove(
"active-chat"
);


});



card.classList.add(
"active-chat"
);



}

);





// =====================================
// ADMIN ONLINE STATUS
// =====================================


setInterval(()=>{


setDoc(

doc(

db,

"admins",

"main"

),

{


online:true,

lastSeen:serverTimestamp()


},


{


merge:true

}


);


},30000);





// =====================================
// AUTO SCROLL CHAT
// =====================================


function scrollAdminBottom(){


if(adminMessages){


adminMessages.scrollTop =
adminMessages.scrollHeight;


}


}

// =====================================
// SPECIAL NUMBER MANAGEMENT SYSTEM
// =====================================


// ELEMENTS

const specialNumberInput =
document.getElementById("specialNumberInput");


const addSpecialNumber =
document.getElementById("addSpecialNumber");


const specialNumbersList =
document.getElementById("specialNumbersList");




// =====================================
// CREATE SPECIAL NUMBER
// =====================================


if(addSpecialNumber){


addSpecialNumber.onclick = async()=>{


const number =
specialNumberInput.value.trim();



if(!number){

alert("Enter phone number");

return;

}





// CHECK IF EXISTS

const existing =
await getDoc(
doc(
db,
"specialNumbers",
number
)
);



if(existing.exists()){

alert("Number already exists");

return;

}






await setDoc(

doc(
db,
"specialNumbers",
number
),

{


number:number,

active:true,

createdAt:serverTimestamp()


}

);





specialNumberInput.value="";



};

}



// =====================================
// LOAD SPECIAL NUMBERS
// =====================================


function loadSpecialNumbers(){



if(!specialNumbersList){

return;

}




const q =
query(

collection(
db,
"specialNumbers"
)

);





onSnapshot(q,(snapshot)=>{



specialNumbersList.innerHTML="";



if(snapshot.empty){


specialNumbersList.innerHTML=`

<div class="empty">

No special numbers

</div>

`;

return;

}





snapshot.forEach((item)=>{



const data =
item.data();



const div =
document.createElement("div");



div.className =
"special-number-item";



div.innerHTML = `


<div>


<strong>

${data.number}

</strong>


<p>

${data.active ? "Active Access" : "Removed"}

</p>


</div>




<button class="remove-special">

${

data.active

?

"Remove"

:

"Deleted"

}

</button>


`;





const button =
div.querySelector(".remove-special");





if(data.active){



button.onclick = async()=>{



await updateDoc(

doc(
db,
"specialNumbers",
item.id
),

{


active:false,


deletedAt:serverTimestamp()


}

);



};



}




specialNumbersList.appendChild(div);



});



});



}



loadSpecialNumbers();

async function unlockFreeUser(conversationId){

    await updateDoc(

        doc(db,"conversations",conversationId),

        {

            freeGranted:true,

            freeUser:true,

            rechargeLocked:false,

            unlockedMessages:0,

            adminUnlockedAt:serverTimestamp()

        }

    );

}

// =====================================
// ADMIN TYPING STATUS
// =====================================

let adminTypingTimer = null;


if(adminInput){


adminInput.addEventListener("input", async()=>{


if(!selectedConversation){
    return;
}



await updateDoc(

doc(
db,
"conversations",
selectedConversation
),

{

adminTyping:true

}

);



clearTimeout(adminTypingTimer);



adminTypingTimer = setTimeout(async()=>{


await updateDoc(

doc(
db,
"conversations",
selectedConversation
),

{

adminTyping:false

}

);



},1500);



});


}

function showAdminEditOption(messageId,text){

    const old =
    document.querySelector(".admin-edit-message-box");

    if(old){
        old.remove();
    }

    const box =
    document.createElement("div");

    box.className =
    "edit-message-box admin-edit-message-box";

    box.innerHTML = `

        <div class="edit-title">
            Edit Message
        </div>

        <input
        id="adminEditInput"
        value="${text}"
        >

        <button id="adminSaveEdit">
            Save
        </button>

        <button id="adminDeleteMessage">
            Delete
        </button>

        <button id="adminCancelEdit">
            Cancel
        </button>

    `;

    document.body.appendChild(box);

    adminEditingMessageRef = doc(
        db,
        "conversations",
        selectedConversation,
        "messages",
        messageId
    );

    document.getElementById("adminSaveEdit").onclick = async()=>{

        const value =
        document.getElementById("adminEditInput")
        .value.trim();

        if(!value){
            return;
        }

        await updateDoc(
            adminEditingMessageRef,
            {
                text:value,
                edited:true,
                editedAt:serverTimestamp()
            }
        );

        box.remove();

    };

    document.getElementById("adminDeleteMessage").onclick = async()=>{

    await deleteDoc(adminEditingMessageRef);

    const snap = await getDocs(
        query(
            collection(
                db,
                "conversations",
                selectedConversation,
                "messages"
            ),
            orderBy("time","desc")
        )
    );

    if(!snap.empty){

        const last = snap.docs[0].data();

        await updateDoc(
            doc(db,"conversations",selectedConversation),
            {
                lastMessage:last.text,
                lastSender:last.sender,
                updatedAt:serverTimestamp()
            }
        );

    }else{

        await updateDoc(
    doc(db,"conversations",selectedConversation),
    {
        lastMessage:"",
        lastSender:"",
        updatedAt:serverTimestamp()
    }
);

    }

    box.remove();

};

    document.getElementById("adminCancelEdit").onclick = ()=>{

        box.remove();

    };

}