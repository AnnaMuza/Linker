import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { toast } from "react-toastify";
import { FormDataType, ListingsItemDataType } from "../type";
import { ListingForm, categories } from "../components/ListingForm";
import { deleteObject, getStorage, ref } from "firebase/storage";
import { storeImage } from "../utils";
import { ReactComponent as LogoIcon } from "../assets/svg/logo.svg";
import { Option } from "react-dropdown";
import {store} from '../hooks/useAuthStatus'

const initialFormState: FormDataType = {
  name: "",
  type: categories[0],
  description: '',
  timeCosts: '',
  timeBound: false,
  address: "",
  userRef: "",
  latitude: 0,
  longitude: 0,
  offer: true
};

const storage = getStorage();
// handle geolocation input is not implemented
const geolocationEnabled = true;

export const CreateListing = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataType>(initialFormState);
  const [uploadedImages, setUploadedImages] = useState<
    ListingsItemDataType["imgUrls"]
  >([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const { address, latitude, longitude } =
    formData;

  const auth = getAuth();
  const navigate = useNavigate();
  const userType = store.useState('user')[0];
  formData.offer = userType === 'supplier';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData({ ...initialFormState, userRef: user.uid });
      } else {
        navigate("/sign-in");
      }
    });

    return unsubscribe;
  }, [auth, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedImages.length) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);

    if (uploadedImages.length > 6) {
      setLoading(false);
      toast.error("Maximum 6 images allowed");
      return;
    }

    const _geolocation = {
      lat: latitude,
      lng: longitude,
    };

    if (geolocationEnabled) {
      await fetch(
        `https://us1.locationiq.com/v1/search?key=${process.env.REACT_APP_GEOCODING_KEY}&q=${address}&format=json`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error("Geolocation not found");
            setLoading(false);
            toast.error("Please enter a correct address");
            return;
          }
          // data[0] is the first result. It would be the most accurate geolocation.
          _geolocation.lat = parseFloat(data[0].lat);
          _geolocation.lng = parseFloat(data[0].lon);
        })
        .catch((error) => {
          console.error(error);
        });
    }

    const formDataCopy = {
      ...formData,
      imgUrls: uploadedImages,
      geolocation: _geolocation,
      timestamp: serverTimestamp(),
    };

    formDataCopy.location = address;
    delete formDataCopy.address;

    const docRef = await addDoc(collection(db, "listings"), formDataCopy);
    setLoading(false);
    toast.success("Listing created");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

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

  const onDropdown = (e: Option) => {
    formData.type = e.value;
  };

  const getType = () => {
    return formData.type;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    setLoading(true);

    const urls = await Promise.all(
      Array.from(fileList).map((image) => storeImage(image))
    ).catch(() => {
      console.error("Error uploading images");
      setLoading(false);
      return;
    });

    if (urls) {
      setUploadedImages((prevState) => {
        return [...prevState, ...urls];
      });
    }
    setLoading(false);
  };

  const handleUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    inputRef.current?.click();
  };

  const handleDeleteImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setLoading(true);

    const targetUrl = e.currentTarget.dataset.url;
    const targetImageRef = ref(storage, targetUrl);

    deleteObject(targetImageRef)
      .then(() => {
        setUploadedImages((prevState) =>
          prevState.filter((url) => url !== targetUrl)
        );
        console.log("File deleted successfully");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Uh-oh, an error occurred!");
        setLoading(false);
      });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Create {userType === 'supplier' ? 'offer' : 'request'}</p>
        <LogoIcon id="logo"/>
      </header>
      <main>
        <ListingForm
          formData={formData}
          onMutate={onMutate}
          onDropdown={onDropdown}
          getType={getType}
          onSubmit={onSubmit}
          handleChange={handleChange}
          handleUpload={handleUpload}
          handleDeleteImage={handleDeleteImage}
          uploadedImages={uploadedImages}
          inputRef={inputRef}
          geolocationEnabled={geolocationEnabled}
        />
      </main>
    </div>
  );
};
