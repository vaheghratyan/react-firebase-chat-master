import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyDbyhpHo6ApSFSswjl6xGsQlFe5z1WCtTw",
  authDomain: "nirvahe.firebaseapp.com",
  projectId: "nirvahe",
  storageBucket: "nirvahe.appspot.com",
  messagingSenderId: "1007503346576",
  appId: "1:1007503346576:web:1c7381a41417bf4b2a8115",
  measurementId: "G-RN4XHCFCYP"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <h1>Деловое общение ✉</h1>
      <header>
      <a href="main.html" target="_blank"> Новостная стрница📄</a>
        <a href="calendar.html" target="_blank">Календарь событий 📅</a>
        <SignOut />
      </header>

      <section>
      
        {user ? <ChatRoom />: <SignIn />}
        
      </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Вход через Google</button>
      
    </>
  )

}

function SignOut() {
  return auth.currentUser && (

    <button className="button-33" onClick={() => auth.signOut()}>Выход</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(100);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: new Date(),
      isRead: false,
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Напиши..." />

      <button type="submit" disabled={!formValue}>📨</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL, createdAt, isRead } = props.message;
  const isMessageSent = uid === auth.currentUser.uid;
  const sentDate = createdAt.toDate();
  const [isMessageRead, setIsMessageRead] = useState(isRead);
  const isMessageNew = new Date().getTime()/1000 - sentDate.getTime()/1000 < 2;
  const messagesRef = firestore.collection('messages');

  const reload = () => {

    messagesRef.doc(uid).update({isRead: true});
    setInterval(() => {
      setIsMessageRead(true);
    }, 5000);
  }

  const messageClass = isMessageSent ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`} onMouseOver={reload}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>
        <div>{text}</div>
        <div className='timestamp'>{`${sentDate.getHours()}:${sentDate.getMinutes()}`}</div>
        { 
          isMessageSent && <div className='readMessage'>
            {
              isMessageRead && !isMessageNew ?
                <img src={"assets/1.png"} /> : <img src={"assets/2.png"} />
            }
          </div>
        }
      </p>
    </div>
  </>)
}


export default App;
