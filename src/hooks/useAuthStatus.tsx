import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {createStore} from 'state-pool';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { usersConverter } from "../utils";

export const store = createStore();
store.setState('user', null);

export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [userType, setUserType] = store.useState('user');

  useEffect(() => {
    console.log(userType);
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
        (async function fetchUser () {
          const userDataRef = doc(db, "users", user.uid).withConverter(
            usersConverter
          );
          const querySnap = await getDoc(userDataRef);
          setUserType(querySnap.data()?.type);
        })();
      }
      setCheckingStatus(false);
    });

    return unsubscribe;
  }, [setUserType, userType]);
  return { loggedIn, checkingStatus };
};

// Protected routes in v6
// https://stackoverflow.com/questions/65505665/protected-route-with-firebase

// Fix memory leak warning
// https://stackoverflow.com/questions/59780268/cleanup-memory-leaks-on-an-unmounted-component-in-react-hooks

// React v18 is removed the memory leak warning. but it should still clean up from useEffect.
