import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import { Spinner } from "../components/Spinner";
import { ListingItem } from "../components/ListingItem";
import { ListingsItemType } from "../type";
import { listingsItemConverter } from "../utils";
import { ReactComponent as LogoIcon } from "../assets/svg/logo.svg";

export const Category = () => {
  const [listings, setListings] = useState<ListingsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] =
    useState<QueryDocumentSnapshot>();

  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingRef = collection(db, "listings").withConverter(
          listingsItemConverter
        );
        const q = query(
          listingRef,
          where("type", "==", params.categoryName),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        const querySnap = await getDocs(q);

        const lastVisible = querySnap.docs[querySnap.docs.length - 1];

        setLastFetchedListing(lastVisible);

        const listings = querySnap.docs.map((doc) => doc.data());

        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listings");
      }
    };
    fetchListings();
  }, [params.categoryName]);

  // Pagination Load More
  const onFetchMoreListings = async () => {
    try {
      const listingRef = collection(db, "listings").withConverter(
        listingsItemConverter
      );
      const q = query(
        listingRef,
        where("type", "==", params.categoryName),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(10)
      );
      const querySnap = await getDocs(q);

      const lastVisible = querySnap.docs[querySnap.docs.length - 1];

      setLastFetchedListing(lastVisible);

      const listings = querySnap.docs.map((doc) => doc.data());

      setListings((prevListings) => [...prevListings, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error("Could not fetch listings");
    }
  };

  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          {params.categoryName === "rent"
            ? "Places for rent"
            : "Places for sale"}
        </p>
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
          {lastFetchedListing && (
            <p className="loadMore" onClick={onFetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  );
};