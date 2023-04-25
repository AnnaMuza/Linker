import { FieldValue } from "firebase/firestore";

export type ListingsItemDataType = {
  name: string,
  type: string,
  description: string,
  timeCosts: string,
  timeBound: boolean,
  offer: boolean,
  userRef: string;
  location: string;
  geolocation: {
    lat: number;
    lng: number;
  };
  imgUrls: string[];
  timestamp: FieldValue;
};

export type ListingsItemType = {
  id: string;
  data: ListingsItemDataType;
};

export type UsersType = {
  displayName?: string;
  email: string;
  name: string;
  timestamp: string;
  type: string;
};

export type FormDataType = Omit<
  ListingsItemDataType,
  "geolocation" | "imgUrls" | "timestamp" | "location"
> & {
  address?: string;
  latitude: ListingsItemDataType["geolocation"]["lat"];
  longitude: ListingsItemDataType["geolocation"]["lng"];
  location?: ListingsItemDataType["location"];
};
