import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryDocumentSnapshot,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import { Spinner } from "../components/Spinner";
import { ListingItem } from "../components/ListingItem";
import { ListingsItemType } from "../type";
import { listingsItemConverter } from "../utils";
import { ReactComponent as LogoIcon } from "../assets/svg/logo.svg";
import {store} from '../hooks/useAuthStatus'

export const Offers = () => {
  const [listings, setListings] = useState<ListingsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] =
    useState<QueryDocumentSnapshot>();
  const [isListedAll, setIsListedAll] = useState(true); // FIXME: when the last listing is fetched, set this to false
  const userType = store.useState('user')[0];
  const value = userType ? (userType === 'supplier' ? 'requests' : 'offers') : 'listings';

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingRef = collection(db, "listings").withConverter(
          listingsItemConverter
        );
        let q;
        if (userType) {
          q = query(
            listingRef,
            where("offer", "==", userType === 'customer'),
            orderBy("timestamp", "desc"),
            limit(10));
        } else {
          q = query(
            listingRef,
            orderBy("timestamp", "desc"),
            limit(10));
        }
        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastVisible);
        const listings = querySnap.docs.map((doc) => doc.data());

        setListings(listings);
        setIsListedAll(querySnap.empty);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listings");
      }
    };
    fetchListings();
  }, [userType]);

  // Pagination Load More
  const onFetchMoreListings = async () => {
    try {
      const listingRef = collection(db, "listings").withConverter(
        listingsItemConverter
      );
      const q = query(
        listingRef,
        where("offer", "==", userType === 'customer'),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(10)
      );
      const querySnap = await getDocs(q);

      const lastVisible = querySnap.docs[querySnap.docs.length - 1];

      setLastFetchedListing(lastVisible);

      const listings = querySnap.docs.map((doc) => doc.data());

      setListings((prevListings) => [...prevListings, ...listings]);
      setIsListedAll(querySnap.empty);
      setLoading(false);
    } catch (error) {
      toast.error("Could not fetch listings");
    }
  };

  return (
    <div className="category">
      <header>
        <p className="pageHeader">{value}</p>
        <LogoIcon id="logo"/>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem key={listing.id} listing={listing} />
              ))}
            </ul>
          </main>

          <br />
          <br />

          {isListedAll ? (
            <p>No more {value}</p>
          ) : (
            <p className="loadMore" onClick={onFetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>There are no current {value}</p>
      )}
    </div>
  );
};
