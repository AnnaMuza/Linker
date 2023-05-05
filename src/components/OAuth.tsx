import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import googleIcon from "../assets/svg/googleIcon.svg";
import { useState } from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';

export const OAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [accType, setAccType] = useState('supplier');
  const auth = getAuth();

  const saveDoc = async () => {
    const user = auth.currentUser;
    setVisible(false);
    await setDoc(doc(db, "users", user!.uid), {
      name: user!.displayName,
      email: user!.email,
      timestamp: serverTimestamp(),
      type: accType
    });
    navigate("/profile");
  }

  const onGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const docRef = doc(db, "users", user.uid);
      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) setVisible(true);
      else navigate("/profile");
    } catch (error) {
      toast.error("Could not sign in with Google");
    }
  };

  const footerContent = (
    <div>
        <Button label="done" onClick={saveDoc} className="dialog-button" autoFocus />
    </div>
);

  return (
    <>
    <div className="socialLogin">
      <p>Sign {location.pathname === "/sign-up" ? "up" : "in"} with </p>
      <button className="socialIconDiv" onClick={onGoogleClick}>
        <img className="socialIconImg" src={googleIcon} alt="google" />
      </button>
    </div>
    <div>
      <Dialog header="Please choose account type:" visible={visible} className="dialog" onHide={() => setVisible(false)} footer={footerContent}>
      <div className="formButtons">
        <button
          type="button"
          className={accType === 'supplier' ? "formButtonActive" : "formButton"}
          onClick={() => setAccType('supplier')}
        >
          Supplier
        </button>
        <button
          type="button"
          className={accType === 'customer' ? "formButtonActive" : "formButton"}
          onClick={() => setAccType('customer')}
        >
          Customer
        </button>
      </div>
      </Dialog>
    </div>
    </>
  );
};
