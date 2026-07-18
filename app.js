
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

getFirestore,
doc,
setDoc,
getDoc,
updateDoc,
collection,
addDoc,
query,
where,
getDocs,
onSnapshot,
orderBy,
serverTimestamp,
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

// // =====================================
// // DEVICE LOGIN LOCK SYSTEM
// // =====================================

const deviceKey = "womenclubLockedPhone";

function getDeviceId(){

    let id = localStorage.getItem("womenclubDeviceId");

    if(!id){

        id =
        "device_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2);

        localStorage.setItem(
            "womenclubDeviceId",
            id
        );

    }

    return id;

}

function checkDeviceAccount(phone){

    const savedPhone =
    localStorage.getItem(deviceKey);

    if(!savedPhone){
        return true;
    }

    if(savedPhone === phone){
        return true;
    }

    showLoginNotice(
        "You already have an existing account on this device. Please enter your previous phone number."
    );

    return false;

}

function saveDeviceAccount(phone){

    localStorage.setItem(
        deviceKey,
        phone
    );

    localStorage.setItem(
        "womenclubDeviceId",
        getDeviceId()
    );

}

// =====================================
// VARIABLES
// =====================================

let coverIndex = 0;

let userPhone = "";

let currentConversation = "";

let currentProfile = "";

let currentProfileData = null;

let typingTimer = null;

let unsubscribeAdminStatus = null;

let unsubscribeMessages = null;

// =====================================
// MESSAGE EDIT SYSTEM
// =====================================

let editingMessageId = "";

let editingMessageRef = null;

let longPressTimer = null;


// SPECIAL ACCESS SYSTEM

let isSpecialUser = false;

let specialContacts = [];

// =====================================
// ELEMENTS
// =====================================


const startChat =
document.getElementById("startChat");


const phoneInput =
document.getElementById("phoneInput");


const loginBox =
document.getElementById("loginBox");


const contactsContainer =
document.getElementById("contactsContainer");


const contactsList =
document.getElementById("contactsList");



// =====================================
// CONTACTS
// =====================================


// =====================================
// WOMENCLUB 84 UNIQUE PROFILES
// =====================================


const profileNames = [

"Jane Smith",
"Kane Smart",
"Johnson Wayne",
"Grace Michael",
"Paul Mike",
"Kelly Brown",
"Sarah Williams",
"Emily Johnson",
"Linda Carter",
"Sophia Brown",
"Olivia Wilson",
"Mia Anderson",
"Ava Martinez",
"Isabella Davis",
"Emma Thomas",
"Charlotte Moore",
"Amelia Taylor",
"Harper White",
"Daniel Walker",
"Natalie Green",
"Christopher Hall",
"Jessica Lewis",
"Benjamin King",
"Victoria Adams",
"Ryan Scott",
"Chloe Young",
"Nathan Cooper",
"Samantha Hill",
"Jack Roberts",

"Anna Wilson",
"Maria Johnson",
"Sophia Anderson",
"Emma Brown",
"Liam Taylor",
"Olivia Davis",
"James Wilson",
"Isabella Moore",
"Michael Clark",

"Sophia Carter",
"Olivia Martin",
"Emma Williams",
"Charlotte Brown",
"Isabella Taylor",
"Mia Wilson",
"Grace Wilson",
"Ava Thompson",
"Lily Johnson",
"Emily Davis",
"Ella Robinson",
"Chloe Walker",
"Sophie Harris",
"Jessica White",
"Ruby Green",
"Victoria Parker",
"Lucy Baker",
"Madison Clark",
"Scarlett Lewis",
"Layla Young",
"Aria King",
"Zoe Wright",
"Hannah Scott",
"Camila Hall",
"Eva Allen",
"Stella Moore",
"Nora Turner",
"Maya Collins",
"Elena Cooper",
"Anna Mitchell",
"Clara Perez",
"Maria Evans",
"Julia Edwards",
"Laura Stewart",
"Sarah Morris",
"Kate Rogers",
"Rachel Cook",
"Natalie Morgan",
"Leah Bell",
"Naomi Murphy",
"Nicole Bailey",
"Amber Rivera",
"Caroline Foster"

];



const uniqueProfileNames = [
...new Set(profileNames)
];


const contacts = uniqueProfileNames.map((name,index)=>{


return {


name:name,


image:
"./" + (index + 1) + ".jpeg",


bio:
"Available for conversations, friendship and meeting new people.",


hobbies:[

"Music",
"Travel",
"Movies",
"Fashion"

],

status:
Math.random() < 0.35
?
"online"
:
"offline",


lastSeen:null,


coverPhotos:[

"https://picsum.photos/500/300?random="+index,

"https://picsum.photos/500/300?random="+(index+200)

]


};


});




// =====================================
// LOAD USER CONTACTS
// =====================================


async function getUserContacts(){


    if(isSpecialUser && specialContacts.length){


        return specialContacts;


    }


    return contacts;


}

// =====================================
// CONTACT ONLINE/OFFLINE SYSTEM
// =====================================


function getRandomLastSeen(){

    const now = new Date();

    const randomMinutes =
        Math.floor(Math.random() * 720) + 1; 
        // random 1 minute - 12 hours ago


    now.setMinutes(
        now.getMinutes() - randomMinutes
    );


    return now.toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit"

    });

}



// CREATE REALISTIC STATUS

function createStatus(profile){


const random = Math.random();


if(random < 0.35){

profile.status="online";

profile.lastSeen=null;


}else{


profile.status="offline";

profile.lastSeen=getRandomLastSeen();


}


}

// INITIAL STATUS

async function initializeContactStatus(){

const userContacts =
await getUserContacts();


userContacts.forEach(profile=>{

createStatus(profile);

});


}


initializeContactStatus();


function randomStatusChange(){

async function changeStatus(){

const userContacts = await getUserContacts();

const profile =
userContacts[
Math.floor(Math.random()*userContacts.length)
];


if(profile.status === "online"){

profile.status = "offline";
profile.lastSeen = getRandomLastSeen();

}else{

profile.status = "online";
profile.lastSeen = null;

}


loadContacts();


if(currentProfileData &&
currentProfileData.name === profile.name){

updateChatHeaderStatus();

}

}


changeStatus();

}


setInterval(()=>{

    randomStatusChange();

},70000);

async function checkSpecialNumber(number){

const specialRef =
doc(
db,
"specialNumbers",
number
);


const specialSnap =
await getDoc(specialRef);



if(specialSnap.exists()){


const data =
specialSnap.data();


if(data.active === true){


isSpecialUser = true;



if(data.contacts){


specialContacts =
data.contacts;


}



return true;


}


}



return false;


}

let contactsLoading = false;

async function loadContacts(){

    if(contactsLoading){
        return;
    }

    contactsLoading = true;

    contactsList.innerHTML = "";

    const userContacts = [
        ...new Map(
            (await getUserContacts())
            .map(item => [item.name, item])
        ).values()
    ];

    for(const profile of userContacts){

        const conversationId =
        userPhone + "_" + profile.name;

        let unreadCount = 0;
        let lastMessage = "";

        try{

            const snap = await getDoc(
                doc(
                    db,
                    "conversations",
                    conversationId
                )
            );

            if(snap.exists()){

                const data = snap.data();

              // Only count unread ADMIN messages
            unreadCount = data.lastSender === "admin"
           ? (data.unread || 0)
           : 0;


            lastMessage = data.lastMessage || "";

            }

        }catch(error){

            console.log(error);

        }

        const item = document.createElement("div");

        item.className = "contact-item";
item.innerHTML = `
<div class="contact-image">
    <img src="${profile.image}" onerror="fixImageError(this)">
</div>

<div class="contact-details">
    <h3>${profile.name}</h3>

    <p class="${
        profile.status === "online"
        ? "online-text"
        : "offline-text"
    }">
        ${
            profile.status === "online"
            ? "Online"
            : "Last seen today at " + profile.lastSeen
        }
    </p>

    ${
        lastMessage
        ? `<p class="last-message">${lastMessage}</p>`
        : ""
    }
</div>

${
    unreadCount > 0
    ? `<div class="unread-badge">${unreadCount}</div>`
    : ""
}
`;

        item.onclick = () => {

            openConversation(profile);

        };

        contactsList.appendChild(item);

    }

    contactsLoading = false;

}

// CONTACT GOES ONLINE

function makeOnline(profile){


profile.status="online";


profile.lastSeen=null;



loadContacts();


updateChatHeaderStatus();



clearTimeout(profile.statusTimer);



profile.statusTimer=setTimeout(()=>{


makeOffline(profile);


},


Math.floor(Math.random()*180000)+120000

);



}




// CONTACT GOES OFFLINE

function makeOffline(profile){


profile.status="offline";


profile.lastSeen=getRandomLastSeen();


loadContacts();


updateChatHeaderStatus();

}


if(startChat){

startChat.onclick = async()=>{


const phone = phoneInput.value.trim();
const cleanPhone = phone.replace(/\D/g,"");

if(cleanPhone.length === 0){
    showLoginNotice("Please enter your phone number.");
    return;
}

if(cleanPhone.length < 10 || cleanPhone.length > 11){
    showLoginNotice("Please enter your 10 digits or 11 digits phone number.");
    return;
}



// // CHECK DEVICE LOGIN OWNERSHIP

// if(!checkDeviceAccount(cleanPhone)){

// return;

// }


// userPhone = cleanPhone;


// // SAVE FIRST SUCCESSFUL LOGIN

// saveDeviceAccount(cleanPhone);


if(!checkDeviceAccount(cleanPhone)){
    return;
}

userPhone = cleanPhone;

saveDeviceAccount(cleanPhone);

localStorage.setItem(
    "womenclubPhone",
    cleanPhone
);


// CHECK SPECIAL NUMBER FIRST

await checkSpecialNumber(phone);

await setDoc(
doc(db,"users",phone),

{

phone:phone,

online:true,

updatedAt:serverTimestamp()

},

{

merge:true

}

);

loginBox.style.display="none";

contactsContainer.style.display="flex";

loadContacts();

listenUnreadMessages();

};

}

function updateChatHeaderStatus() {

    if (!currentProfileData) return;

    const status =
    document.getElementById("chatProfileStatus");

    if (!status) return;


    if(currentProfileData.status === "online"){


        status.textContent = "Online";

        status.style.color = "#25d366";


    }else{


        status.textContent =
        "Last seen today at " + currentProfileData.lastSeen;


        status.style.color = "#8696a0";


    }

}

// =====================================
// CHANGE STATUS AUTOMATICALLY
// =====================================



// =====================================
// FIND OR CREATE CONVERSATION
// =====================================


async function openConversation(profile){


currentProfile = profile.name;

currentProfileData = profile;

currentProfileData.status = "online";
currentProfileData.lastSeen = null;

updateChatHeaderStatus();

const conversations =
collection(db,"conversations");



const q =
query(

conversations,

where("phone","==",userPhone),

where("profile","==",profile.name)

);



const result =
await getDocs(q);



if(!result.empty){


currentConversation =
result.docs[0].id;


}

else{


const conversationId =
userPhone + "_" + profile.name;



await setDoc(

doc(
db,
"conversations",
conversationId
),

{

phone:userPhone,

profile:profile.name,

profileImage:profile.image,

lastMessage:"",

unread:0,

updatedAt:serverTimestamp(),

createdAt:serverTimestamp()

},

{

merge:true

}

);



currentConversation =
conversationId;

await setDoc(

doc(
db,
"conversations",
currentConversation
),

{

unread:0,

lastRead:true,

lastOpenedAt:serverTimestamp()

},

{

merge:true

}

);

}



// OPEN CHAT SCREEN

contactsContainer.style.display="none";


document.getElementById("chatContainer").style.display="flex";


document.getElementById("chatTop").style.display="flex";



// document.getElementById("chatProfileName").innerHTML =
// profile.name;


const chatImg =
document.getElementById("chatProfileImage");


if(profile.image){

chatImg.src = profile.image;

}

updateChatHeaderStatus();

loadMessages();

markMessagesAsRead();

listenForAdminStatus();

listenFreeUserStatus();

listenAdminTyping();

}

function listenForAdminStatus(){

if(unsubscribeAdminStatus){
unsubscribeAdminStatus();
}

if(!currentConversation) return;


unsubscribeAdminStatus = onSnapshot(
doc(db,"conversations",currentConversation),
(snapshot)=>{

const data = snapshot.data();

if(!data) return;


if(data.adminReply === true){

currentProfileData.status="online";
currentProfileData.lastSeen=null;

updateChatHeaderStatus();

}


if(data.adminReply === false){

currentProfileData.status="offline";
currentProfileData.lastSeen=getRandomLastSeen();

updateChatHeaderStatus();

}

}

);

}


const messages =
document.getElementById("messages");


const messageInput =
document.getElementById("messageInput");


const sendMessage =
document.getElementById("sendMessage");




// =====================================
// LOAD CURRENT CONVERSATION
// =====================================


function loadMessages(){


if(!currentConversation){

return;

}



const q = query(

collection(

db,

"conversations",

currentConversation,

"messages"

),

orderBy("time")

);



if(unsubscribeMessages){
    unsubscribeMessages();
}

unsubscribeMessages = onSnapshot(q,(snapshot)=>{


messages.innerHTML = `


<div class="security-notice">


🔒 Messages and calls are end-to-end encrypted.
Only people in this chat can read, listen to, or share them.


</div>



<div class="start-conversation">


Start Conversation


</div>


`;



snapshot.forEach((item)=>{


const messageId = item.id;


const data =
item.data();



const bubble =
document.createElement("div");



if(data.sender==="user"){


bubble.className =
"message sent";


}

else{


bubble.className =
"message received";


}



bubble.innerHTML = `

${data.text}

${
data.edited
?
`
<span class="edited-label">
edited
</span>
`
:
""
}


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


${
data.sender==="user"

?

`
<span class="ticks ${
data.read ? "blue-ticks" : ""
}">
✓✓
</span>
`

:

""

}


</span>


`;



messages.appendChild(bubble);


// =====================================
// HOLD MESSAGE TO EDIT
// =====================================

if(data.sender === "user"){


bubble.addEventListener(
"mousedown",
()=>{


longPressTimer = setTimeout(()=>{


showEditOption(
messageId,
data.text
);


},700);


}
);



bubble.addEventListener(
"mouseup",
()=>{

clearTimeout(longPressTimer);

}
);



bubble.addEventListener(
"mouseleave",
()=>{

clearTimeout(longPressTimer);

}
);



bubble.addEventListener(
"touchstart",
()=>{


longPressTimer = setTimeout(()=>{


showEditOption(
messageId,
data.text
);


},700);


}
);



bubble.addEventListener(
"touchend",
()=>{

clearTimeout(longPressTimer);

}
);


}



});



messages.scrollTop =
messages.scrollHeight;



});


}


// =====================================
// SEND MESSAGE + BALANCE LIMIT SYSTEM
// =====================================


async function checkMessageBalanceLimit(){

if(!currentConversation){

return false;

}


const snap =
await getDoc(

doc(
db,
"conversations",
currentConversation
)

);


const data =
snap.data() || {};



const messagesSnap =
await getDocs(

collection(

db,

"conversations",

currentConversation,

"messages"

)

);



let userMessages = 0;



messagesSnap.forEach(item=>{


if(
item.data().sender==="user"
){

userMessages++;

}


});




// FIRST FREE PERIOD

if(!data.freeGranted){


if(userMessages >= 8){

    return true;

}


return false;


}




// AFTER ADMIN UNLOCK

if(userMessages >= 18){

    await updateDoc(

        doc(db,"conversations",currentConversation),

        {

            freeGranted:false,

            freeUser:false,

            rechargeLocked:true,

            unlockedMessages:0

        }

    );

    return true;

}



return false;


}


function showBalanceRecharge(){

    if(!currentConversation){
        return;
    }

    getDoc(doc(db,"conversations",currentConversation))
    .then((snap)=>{

        const data = snap.data() || {};

        // DON'T SHOW IF ADMIN HAS UNLOCKED USER
        if(data.freeGranted === true || data.freeUser === true){
            return;
        }

        const oldBalance =
        document.querySelector(".balance-message");

        if(oldBalance){
            oldBalance.style.display = "block";
            return;
        }

        const balanceBox =
        document.createElement("div");

        balanceBox.className =
        "balance-message";

        balanceBox.innerHTML = `

        <div>Your Balance</div>

        <h2>NGN 0.00</h2>

        <button onclick="showRechargeCard()">
        Recharge
        </button>

        `;

        messages.appendChild(balanceBox);

        messages.scrollTop =
        messages.scrollHeight;

    });

}

function listenFreeUserStatus(){

    if(!currentConversation){
        return;
    }

    onSnapshot(

        doc(db,"conversations",currentConversation),

        (snapshot)=>{

            if(!snapshot.exists()){
                return;
            }

            const data = snapshot.data();

            const balance =
            document.querySelector(".balance-message");

            const recharge =
            document.getElementById("rechargeOverlay");

            if(data.freeGranted === true || data.freeUser === true){

                if(balance){
                    balance.remove();
                }

                if(recharge){
                    recharge.style.display="none";
                }

                messageInput.disabled = false;
                sendMessage.disabled = false;

                return;
            }

            if(data.rechargeLocked === true){

                showBalanceRecharge();

            }

        }

    );

}

if(sendMessage){



sendMessage.onclick = async()=>{



const text =
messageInput.value.trim();



if(
!text ||
!currentConversation
){

return;

}




// CHECK IF USER HAS FINISHED FREE MESSAGES


const balanceLocked =
await checkMessageBalanceLimit();



if(balanceLocked){



// KEEP MESSAGE INSIDE INPUT


showBalanceRecharge();



return;


}





// SEND MESSAGE


await addDoc(


collection(

db,

"conversations",

currentConversation,

"messages"

),


{


sender:"user",


text:text,


time:serverTimestamp(),


delivered:true,


read:false


}


);


await setDoc(

doc(
db,
"conversations",
currentConversation
),

{

lastMessage:text,

lastSender:"user",

lastRead:false,

lastTime:serverTimestamp(),

updatedAt:serverTimestamp(),

adminReply:false,

unread:0

},

{

merge:true

}

);

const conversationRef =
doc(db,"conversations",currentConversation);

const conversationSnap =
await getDoc(conversationRef);

if(conversationSnap.exists()){

    const data =
    conversationSnap.data();

    if(data.freeGranted){


await updateDoc(

conversationRef,

{

unlockedMessages:
increment(1)

}

);


}

}

messageInput.value="";

};



}

// =====================================
// ENTER KEY SEND
// =====================================


if(messageInput){


messageInput.addEventListener(

"keypress",

(e)=>{


if(e.key==="Enter"){

sendMessage.click();

}


}

);

// =====================================
// USER TYPING STATUS
// =====================================

messageInput.addEventListener("input", async()=>{


if(!currentConversation){
return;
}


await updateDoc(

doc(
db,
"conversations",
currentConversation
),

{

userTyping:true

}

);



clearTimeout(typingTimer);



typingTimer=setTimeout(async()=>{


await updateDoc(

doc(
db,
"conversations",
currentConversation
),

{

userTyping:false

}

);



},1500);



});

}

const savedPhone =
localStorage.getItem("womenclubPhone");


// Remove automatic login

if(loginBox){

loginBox.style.display="flex";

}


if(contactsContainer){

contactsContainer.style.display="none";

}


// Keep saved phone only for checking ownership
// Do NOT enter automatically




// =====================================
// SAVE LOGIN SESSION
// =====================================

// =====================================
// EMOJI SYSTEM
// =====================================


const emojiButton =
document.getElementById("emojiButton");


const emojiPanel =
document.getElementById("emojiPanel");



const emojis = [

"😀","😃","😄","😁","😂",
"😊","😍","🥰","😘",
"😎","🤩","🥳",
"😢","😭","😡",

"❤️","🧡","💛","💚",
"💙","💜","🖤",

"👍","👏","🙏","👌",

"🔥","⭐","✨","💯",

"🌹","🌸","🌺",

"🎵","🎶","🎧",

"☕","🍕",

"🚗","✈️",

"🐶","🐱",

"💬","📞","🔒","✅"

];




if(emojiButton && emojiPanel){



emojiButton.onclick = ()=>{



emojiPanel.innerHTML="";



emojis.forEach(icon=>{



const emoji =
document.createElement("span");



emoji.textContent = icon;



emoji.onclick = ()=>{


messageInput.value += icon;


emojiPanel.style.display="none";


};



emojiPanel.appendChild(emoji);



});



emojiPanel.style.display =

emojiPanel.style.display==="grid"

?

"none"

:

"grid";



};



}





// =====================================
// BACK TO CONTACTS
// =====================================


window.openContacts = ()=>{


document.getElementById("chatContainer").style.display="none";


document.getElementById("chatTop").style.display="none";


contactsContainer.style.display="flex";


};

const backToContacts =
document.getElementById("backToContacts");

if(backToContacts){

backToContacts.onclick = ()=>{

document.getElementById("chatContainer").style.display = "none";

document.getElementById("chatTop").style.display = "none";

contactsContainer.style.display = "flex";

};

}

const openProfile =
document.getElementById("openProfile");


const profileViewer =
document.getElementById("profileViewer");


const closeProfile =
document.getElementById("closeProfile");



if (openProfile) {

    openProfile.onclick = () => {

        if (!currentProfileData) return;

        const profileHolder =
            document.getElementById("chatProfileImage");

        // Don't create another one
        if (document.getElementById("chatProfileZoom")) return;

        const rect =
            profileHolder.getBoundingClientRect();

        const zoom =
            document.createElement("div");

        zoom.id = "chatProfileZoom";

        zoom.innerHTML = `
            <img src="${currentProfileData.image}">
            <div class="zoom-status">
                ${currentProfileData.status === "online"
                    ? "Online"
                    : "Last seen today at " + currentProfileData.lastSeen}
            </div>
        `;

        document.body.appendChild(zoom);

        // Start exactly from the profile picture
        zoom.style.left = rect.left + "px";
        zoom.style.top = rect.top + "px";
        zoom.style.width = rect.width + "px";
        zoom.style.height = rect.height + "px";

        requestAnimationFrame(() => {

            zoom.classList.add("active");

        });

        const closeZoom = () => {

            zoom.classList.remove("active");

            setTimeout(() => {

                zoom.remove();

            }, 250);

            document.removeEventListener("mouseup", closeZoom);
            document.removeEventListener("touchend", closeZoom);

        };

        document.addEventListener("mouseup", closeZoom);
        document.addEventListener("touchend", closeZoom);

    };

}

if(closeProfile){

closeProfile.onclick=()=>{

profileViewer.style.display="none";

};

}

// =====================================
// FULL PROFILE IMAGE VIEWER
// =====================================

const mainDisplayImage =
document.getElementById("mainDisplayImage");


const imageViewer =
document.getElementById("imageViewer");


const fullImage =
document.getElementById("fullProfileImage");



if(mainDisplayImage){

mainDisplayImage.onclick = ()=>{


if(!currentProfileData || !currentProfileData.image){

return;

}


if(imageViewer && fullImage){


fullImage.src =
currentProfileData.image;


imageViewer.style.display="flex";


}


};

}


// CLOSE FULL IMAGE

const closeImageViewer =
document.getElementById("closeImageViewer");


if(closeImageViewer){


closeImageViewer.onclick = ()=>{


imageViewer.style.display="none";


};


}

function contactReplied(profile){


profile.status="online";

profile.lastSeen=null;


loadContacts();


updateChatHeaderStatus();



clearTimeout(profile.replyTimer);



profile.replyTimer=setTimeout(()=>{


profile.status="offline";


profile.lastSeen=getRandomLastSeen();


loadContacts();


updateChatHeaderStatus();



},180000);

}

async function markMessagesAsRead(){

    if(!currentConversation){
        return;
    }


    // GET ALL UNREAD ADMIN MESSAGES

    const q = query(

        collection(
            db,
            "conversations",
            currentConversation,
            "messages"
        ),

        where("sender","==","admin"),

        where("read","==",false)

    );


    const snapshot = await getDocs(q);



    // MARK ADMIN MESSAGES AS READ

    for(const item of snapshot.docs){

        await updateDoc(

            item.ref,

            {
                read:true
            }

        );

    }



    // REMOVE WHATSAPP STYLE BADGE

  await updateDoc(

doc(
db,
"conversations",
currentConversation
),

{

unread:0,

lastRead:true,

lastOpenedAt:serverTimestamp()

}

);


}

let foreignLayerCount = 0;

function generateForeignContacts(amount){

const foreignNames = [

"Kayla Richardson",
"Melanie Ward",
"Vanessa Torres",
"Angela Peterson",
"Rebecca Gray",
"Danielle Ramirez",
"Christina Flores",
"Jessica Morgan",
"Elizabeth Scott",
"Victoria Adams",
"Lucy Baker",
"Madison Clark",
"Scarlett Lewis",
"Layla Young",
"Aria King",
"Zoe Wright",
"Hannah Scott",
"Camila Hall",
"Eva Allen",
"Stella Moore",
"Nora Turner",
"Maya Collins",
"Elena Cooper",
"Anna Mitchell",
"Clara Perez",
"Maria Evans",
"Julia Edwards",
"Laura Stewart",
"Sarah Morris",
"Kate Rogers",
"Rachel Cook",
"Natalie Morgan",
"Leah Bell",
"Naomi Murphy",
"Nicole Bailey",
"Amber Rivera",
"Caroline Foster"

];


let list=[];


for(let i=0;i<amount;i++){


let randomName;


do{

randomName =
foreignNames[
Math.floor(
Math.random()*foreignNames.length
)
];


}
while(
contacts.some(
item=>item.name===randomName
)
||
list.some(
item=>item.name===randomName
)
);



list.push({

name:randomName,

image:
"./" + (((i+46)%84)+1) + ".jpeg",

bio:
"Available for international conversations.",

status:
Math.random()<0.5
?
"online"
:
"offline",

lastSeen:null,

hobbies:[

"Travel",
"Music",
"Movies",
"Culture"

],

coverPhotos:[

"https://picsum.photos/500/300?random="+(i+500),

"https://picsum.photos/500/300?random="+(i+600)

]


});


}


return list;


}

function openCountryPurchase(){

moreUsersClickCount++;


// FIRST TIME LOAD USERS

if(!foreignUsersLoaded){

generatedForeignUsers = generateForeignContacts(47);

foreignUsersLoaded = true;

}



// SHOW USERS

if(moreUsersClickCount === 1){


contactsList.innerHTML="";


const title =
document.createElement("div");

title.className="contacts-title";

title.innerHTML="Users";


contactsList.appendChild(title);



generatedForeignUsers.forEach(profile=>{


if(profile.status==="offline" && !profile.lastSeen){

profile.lastSeen=getRandomLastSeen();

}



const item =
document.createElement("div");


item.className="contact-item";


item.innerHTML=`


<div class="contact-image">

<img src="${profile.image}">

</div>


<div class="contact-details">

<h3>${profile.name}</h3>


<p class="${
profile.status==="online"
?
"online-text"
:
"offline-text"
}">

${
profile.status==="online"
?
"Online"
:
"Last seen today at "+profile.lastSeen
}

</p>


</div>


`;



item.onclick=()=>{

openConversation(profile);

};



contactsList.appendChild(item);



});



}



// AFTER ALL USERS ARE SHOWN

else{


const stream =
document.createElement("div");


stream.className="coming-soon-stream";


stream.innerHTML=
"Available Users Coming Soon";


contactsList.appendChild(stream);



setTimeout(()=>{

stream.remove();

},2500);



}



}


window.openCountryPurchase =
openCountryPurchase;
// =====================================
// FOREIGN NUMBER OFFICIAL CHAT
// =====================================


async function createForeignNumberChat(country,city){


const conversationId =
userPhone+"_WomenClubOfficial";



await setDoc(

doc(
db,
"conversations",
conversationId
),

{

phone:userPhone,

profile:"WomenClub Official Account",

profileImage:
"./45.jpeg",

type:"foreign-number",

country:country,

city:city,

lastMessage:
"Your foreign number?",

lastSender:"admin",

createdAt:
serverTimestamp(),

updatedAt:
serverTimestamp()

},

{

merge:true

}

);



// CREATE FIRST MESSAGE


await addDoc(

collection(
db,
"conversations",
conversationId,
"messages"

),

{

sender:"admin",

text:
"Your foreign number?",

time:
serverTimestamp(),

read:false

}

);



currentConversation =
conversationId;



currentProfileData={


name:
"WomenClub Official Account",


image:
"./45.jpeg",


status:
"online",


lastSeen:null


};



// OPEN CHAT


contactsContainer.style.display="none";


document.getElementById("chatContainer").style.display="flex";


document.getElementById("chatTop").style.display="flex";



document.getElementById("chatProfileName").innerHTML =

"Official Account";



document.getElementById("chatProfileImage").src =

"https://i.pravatar.cc/100?img=12";



loadMessages();

}

window.showRechargeCard = async function(){

    const snap = await getDoc(
        doc(db,"conversations",currentConversation)
    );

    const data = snap.data() || {};

    if(data.freeGranted || data.freeUser){
        return;
    }

    document.getElementById("rechargeOverlay").style.display="flex";

    const balance =
    document.querySelector(".balance-message");

    if(balance){
        balance.style.display="none";
    }

}

window.closeRechargeCard = function () {

    document.getElementById("rechargeOverlay").style.display = "none";

    const notice = document.querySelector(".balance-message");

    if(notice){
        notice.style.display = "block";
    }

}

window.copyAccountNumber = async function () {

    const account =
        document.getElementById("accountNumber").textContent.trim();

    try {

        await navigator.clipboard.writeText(account);

        const btn =
            document.querySelector(".copy-btn");

       btn.textContent = "Copied";

     setTimeout(() => {

     btn.textContent = "Copy";

     }, 1500);

    } catch {

        alert("Unable to copy account number.");

    }

};

// =====================================
// MESSAGE EDIT POPUP
// =====================================


function showEditOption(messageId,text){


const oldEdit =
document.querySelector(".edit-message-box");


if(oldEdit){

oldEdit.remove();

}



const box =
document.createElement("div");


box.className =
"edit-message-box";


box.innerHTML = `


<div class="edit-title">

Edit Message

</div>



<input 
id="editMessageInput"
value="${text}"
>



<button id="saveEditedMessage">

Save

</button>



<button id="cancelEditMessage">

Cancel

</button>


`;



document.body.appendChild(box);



editingMessageId =
messageId;



editingMessageRef =
doc(

db,

"conversations",

currentConversation,

"messages",

messageId

);





document
.getElementById("cancelEditMessage")
.onclick = ()=>{


box.remove();


editingMessageId="";

editingMessageRef=null;


};





document
.getElementById("saveEditedMessage")
.onclick = async()=>{


const newText =
document
.getElementById("editMessageInput")
.value
.trim();



if(!newText){

return;

}




await updateDoc(

editingMessageRef,

{

text:newText,

edited:true,

editedAt:serverTimestamp()

}

);




box.remove();



editingMessageId="";

editingMessageRef=null;


};

}

function fixImageError(img){

    img.onerror = function(){

        this.style.display="none";

    };

}

const subscribeContinue =
document.querySelector(".payment-done");


const rechargeCard =
document.querySelector(".recharge-card");


if(subscribeContinue && rechargeCard){


subscribeContinue.onclick = ()=>{


rechargeCard.classList.remove("shake-card");


void rechargeCard.offsetWidth;


rechargeCard.classList.add("shake-card");


};


}

// =====================================
// ADMIN TYPING LISTENER
// =====================================

function listenAdminTyping(){

if(!currentConversation){
return;
}


onSnapshot(

doc(
db,
"conversations",
currentConversation
),

(snapshot)=>{


const data = snapshot.data();


const status =
document.getElementById("chatProfileStatus");


if(!status){
return;
}


if(data && data.adminTyping === true){

status.innerHTML = `
<span style="
color:#25d366;
font-weight:500;
">
Typing...
</span>
`;

return;

}else{

updateChatHeaderStatus();


}


}

);


}

function showLoginNotice(message){

    const oldNotice =
    document.querySelector(".login-notice");

    if(oldNotice){
        oldNotice.remove();
    }


    const notice =
    document.createElement("div");


    notice.className =
    "login-notice";


    notice.innerHTML = `

        <div class="notice-box">

            <p>${message}</p>

            <button id="noticeOk">
                OK
            </button>

        </div>

    `;


    document.body.appendChild(notice);



    document
    .getElementById("noticeOk")
    .onclick = ()=>{

        notice.classList.add("hide");


        setTimeout(()=>{

            notice.remove();

        },300);

    };


}

// =====================================
// REAL TIME UNREAD BADGE LISTENER
// =====================================

function listenUnreadMessages(){

    if(!userPhone) return;

    const q = query(
        collection(db,"conversations"),
        where("phone","==",userPhone)
    );

    onSnapshot(q,(snapshot)=>{

        snapshot.forEach((docSnap)=>{

            const data = docSnap.data();

            const cards =
            document.querySelectorAll(".contact-item");

            cards.forEach(card=>{

                const name =
                card.querySelector("h3");

                if(!name) return;

                if(name.textContent !== data.profile) return;

                let badge =
                card.querySelector(".unread-badge");

                const count =
                data.lastSender === "admin"
                    ? (data.unread || 0)
                    : 0;

                if(count > 0){

                    if(!badge){

                        badge =
                        document.createElement("div");

                        badge.className =
                        "unread-badge";

                        card.appendChild(badge);

                    }

                    badge.textContent = count;

                }else{

                    if(badge){
                        badge.remove();
                    }

                }

            });

        });

    });

}