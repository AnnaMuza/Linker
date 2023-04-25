import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
// import { auth } from "../firebase.config"; // for local
import { getAuth } from "firebase/auth"; // for production
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import { ReactComponent as LogoIcon } from "../assets/svg/logo.svg";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";
import { OAuth } from "../components/OAuth";

export const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    type: 'supplier'
  });
  const { name, email, password, type } = formData;

  const navigate = useNavigate();

  const onMutate = (
    e: React.ChangeEvent<HTMLInputElement> &
      React.ChangeEvent<HTMLTextAreaElement> &
      React.MouseEvent<HTMLButtonElement>
  ) => {
    let toggleFlag: boolean | null = null;

    if (e.target.value === "true") {
      toggleFlag = true;
    }
    if (e.target.value === "false") {
      toggleFlag = false;
    }

    // Text, Boolean, Number
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: toggleFlag ?? e.target.value,
    }));
  };

  const onChange = (e: { target: { id: string; value: string } }) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const auth = getAuth(); // for production

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // HELP: "if" is for auth.currentUser that is null
      if (auth.currentUser) {
        updateProfile(auth.currentUser, {
          displayName: name,
        });
      }

      const removePassword = () => {
        const { password, ...rest } = { ...formData };
        return rest;
      };
      const addTimestamp = () => {
        return { ...removePassword(), timestamp: serverTimestamp() };
      };
      const formDataCopy = addTimestamp();
      formDataCopy.type = type;

      await setDoc(doc(db, "users", user.uid), formDataCopy);

      navigate("/");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back!</p>
          <LogoIcon id="logo"/>
        </header>

        <form onSubmit={onSubmit}>
        <label className="formLabel">Account type</label>
          <div className="formButtons">
            <button
              type="button"
              className={type === "supplier" ? "formButtonActive" : "formButton"}
              id="type"
              value="supplier"
              onClick={onMutate}
            >
              Supplier
            </button>
            <button
              type="button"
              className={type === "customer" ? "formButtonActive" : "formButton"}
              id="type"
              value="customer"
              onClick={onMutate}
            >
              Customer
            </button>
          </div>

          <input
            type="text"
            className="nameInput"
            placeholder="Name"
            value={name}
            id="name"
            onChange={onChange}
          />

          <input
            type="email"
            className="emailInput"
            placeholder="Email"
            value={email}
            id="email"
            onChange={onChange}
          />

          <div className="passwordInputDiv">
            <input
              type={showPassword ? "text" : "password"}
              className="passwordInput"
              placeholder="Password"
              value={password}
              id="password"
              onChange={onChange}
            />
            <img
              src={visibilityIcon}
              alt="show password"
              className="showPassword"
              onClick={() => setShowPassword((prevState) => !prevState)}
            />
            <Link to="/forgot-password" className="forgotPasswordLink">
              Forgot Password
            </Link>
            <div className="signUpBar">
              <p className="signUpText">Sign Up</p>
              <button className="signUpButton">
                <ArrowRightIcon fill="#ffffff" width="34px" height="34px" />
              </button>
            </div>
          </div>
        </form>

        <OAuth />

        <Link to="/sign-in" className="registerLink">
          Sign In Instead
        </Link>
      </div>
    </>
  );
};
