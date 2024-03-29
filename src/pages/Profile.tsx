import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, updateEmail, updateProfile } from "firebase/auth";
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc
} from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import homeIcon from "../assets/svg/localOfferIcon.svg";
import { ReactComponent as LogoIcon } from "../assets/svg/logo.svg";
import { listingsItemConverter } from "../utils";
import { ListingsItemType } from "../type";
import { ListingItem } from "../components/ListingItem";
import {store} from '../hooks/useAuthStatus'

type formDataType = {
  name: string;
  email: string;
};

export const Profile = () => {
  const auth = getAuth();
  const userType = store.useState('user')[0];
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<ListingsItemType[]>([]);
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState<formDataType>({
    name: auth.currentUser?.displayName || "",
    email: auth.currentUser?.email || ""
  });

  const { name, email } = formData;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = collection(db, "listings").withConverter(
        listingsItemConverter
      );
      const q = query(
        listingsRef,
        where("userRef", "==", auth.currentUser?.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);

      const listings = querySnap.docs.map((doc) => doc.data());

      setListings(listings);
      setLoading(false);
    };
    fetchListings();
  }, [auth.currentUser?.uid]);

  const onLogout = () => {
    auth.signOut();
    navigate("/");
  };

  // FIXME: these functions are not necessary here?
  const onEdit = (id: string) => {
    navigate(`/edit-listing/${id}`);
  };

  const onDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const storage = getStorage();
      const imagesToDelete = listings.filter((listing) => listing.id === id);
      const imageUrls = imagesToDelete[0].data.imgUrls;
      Array.from(imageUrls).forEach(async (image) => {
        try {
          const desertRef = ref(storage, String(image));
          await deleteObject(desertRef);
        } catch (error) {
          console.error(error);
        }
      });

      await deleteDoc(doc(db, "listings", id));
      const updatedListings = listings.filter((listing) => listing.id !== id);
      setListings(updatedListings);
      toast.success("Successfully deleted listing");
    }
  };

  const onSubmit = async () => {
    try {
      if (!auth.currentUser) return alert("User not logged in");
      const userRef = doc(db, "users", auth.currentUser.uid);

      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, { displayName: name });
        await updateDoc(userRef, { displayName: name });
        toast.success("Name updated");
      }
      if (auth.currentUser.email !== email) {
        await updateEmail(auth.currentUser, email);
        await updateDoc(userRef, { email });
        toast.success("E-mail updated");
      }
    } catch (error) {
      toast.error("Could not update profile details");
    }
  };

  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    const element = e.currentTarget || e.target; // HELP: Is this O.K.?
    setFormData((prevState) => ({
      ...prevState,
      [element.id]: element.value,
    }));
  };

  return (
    <div className="profile">
      <header className="profileHeader">
        <div id='pair'>
          <p className="pageHeader">My Profile </p>
          <button type="button" className="logOut" onClick={onLogout}>
            Logout
          </button>
        </div>
        <LogoIcon id="logo"/>
      </header>

      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <button
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
            type="button"
          >
            {changeDetails ? "done" : "change"}
          </button>
        </div>

        <div className="profileCard">
          <form>
            <input
              type="text"
              id="name"
              className={!changeDetails ? "profileName" : "profileNameActive"}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type="email"
              id="email"
              className={!changeDetails ? "profileEmail" : "profileEmailActive"}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
            <p id='accType'>{userType}</p>
          </form>
        </div>

        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="home" />
          <p>{userType === 'customer' ? 'Create new request' : 'Create new offer'}</p>
          <img src={arrowRight} alt="arrow right" />
        </Link>

        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">{userType === 'customer' ? 'Your requests' : 'Your offers'}</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};
