import { Link } from "react-router-dom";
import { ReactComponent as DeleteIcon } from "../assets/svg/deleteIcon.svg";
import { ReactComponent as EditIcon } from "../assets/svg/editIcon.svg";
import fireIcon from "../assets/svg/fire.svg";
import { ListingsItemType } from "../type";

type PropsType = {
  listing: ListingsItemType;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, name: string) => void;
  notLogged?: boolean;
};

export const ListingItem = ({ listing, onEdit, onDelete, notLogged }: PropsType) => {
  return (
    <li className="categoryListing">
      <Link
        to={`/category/${listing.data.type}/${listing.id}`}
        className="categoryListingLink"
      >
        <img
          src={String(listing.data.imgUrls[0])}
          alt={listing.data.name}
          className="categoryListingImg"
        />

        <div className="categoryListingDetails">
          {notLogged && <p className="listingType">{listing.data.offer ? 'offer' : 'request'}</p>}
          {listing.data.timeBound && <img
            src={fireIcon}
            alt={listing.data.timeBound ? 'hot' : ''}
            className="categoryListingFire"
          />}
          <p className="categoryListingLocation">{listing.data.location}</p>
          <p className="categoryListingName">{listing.data.name}</p>
        </div>
      </Link>

      {onDelete && (
        <DeleteIcon
          className="removeIcon"
          fill="rgb(231, 76,60)"
          onClick={() => onDelete(listing.id, listing.data.name)}
        />
      )}

      {onEdit && (
        <EditIcon className="editIcon" onClick={() => onEdit(listing.id)} />
      )}
    </li>
  );
};
