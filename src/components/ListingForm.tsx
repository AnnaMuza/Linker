import { FormDataType, ListingsItemDataType } from "../type";
import Dropdown, { Option } from 'react-dropdown';
import 'react-dropdown/style.css';

type PropsType = {
  formData: FormDataType;
  onSubmit: (e: React.FormEvent) => void;
  onMutate: (
    e: React.ChangeEvent<HTMLInputElement> &
      React.ChangeEvent<HTMLTextAreaElement> &
      React.MouseEvent<HTMLButtonElement>
  ) => void;
  onDropdown: (e: Option) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleDeleteImage: (e: React.MouseEvent<HTMLButtonElement>) => void;
  uploadedImages: ListingsItemDataType["imgUrls"];
  inputRef: React.RefObject<HTMLInputElement>;
  geolocationEnabled: boolean;
};

export const categories: string[] = ['Clothing', 'Medicines', 'Transportation', 'Food'].sort((a, b) => a.localeCompare(b));

export const ListingForm = ({
  formData,
  onSubmit,
  onMutate,
  onDropdown,
  handleChange,
  handleUpload,
  handleDeleteImage,
  uploadedImages,
  inputRef,
  geolocationEnabled,
}: PropsType) => {
  const {
    name,
    description,
    timeCosts,
    timeBound,
    address,
    latitude,
    longitude,
  } = formData;

  return (
    <form onSubmit={onSubmit}>
      <label className="formLabel">Name</label>
      <input
        className="formInputName"
        type="text"
        id="name"
        value={name}
        onChange={onMutate}
        maxLength={32}
        minLength={5}
        required
      />

      <label className="formLabel">Category</label>
      <Dropdown
        options={categories}
        onChange={onDropdown}
        value={categories[0]}
        placeholder="Select a category"
      />

      <label className="formLabel">Description</label>
      <textarea
        className="formInputAddress"
        id="description"
        value={description}
        onChange={onMutate}
        maxLength={1000}
        minLength={10}
        required
      />

      <label className="formLabel">Address</label>
      <textarea
        className="formInputAddress"
        id="address"
        value={address}
        onChange={onMutate}
        required
      />

      <label className="formLabel">Time costs</label>
      <input
        className="formInputName"
        type="text"
        id="timeCosts"
        value={timeCosts}
        onChange={onMutate}
        maxLength={20}
        minLength={1}
        required
      />

      <label className="formLabel">Time-bound</label>
      <div className="formButtons">
        <button
          type="button"
          className={timeBound ? "formButtonActive" : "formButton"}
          id="timeBound"
          value="true"
          onClick={onMutate}
        >
          True
        </button>
        <button
          type="button"
          className={!timeBound ? "formButtonActive" : "formButton"}
          id="timeBound"
          value="false"
          onClick={onMutate}
        >
          False
        </button>
      </div>

      {!geolocationEnabled && (
        <div className="formLatLng flex">
          <div>
            <label className="formLabel">Latitude</label>
            <input
              className="formInputSmall"
              type="number"
              id="latitude"
              value={latitude}
              onChange={onMutate}
              required
            />
          </div>
          <div>
            <label className="formLabel">Longitude</label>
            <input
              className="formInputSmall"
              type="number"
              id="longitude"
              value={longitude}
              onChange={onMutate}
              required
            />
          </div>
        </div>
      )}

      <label className="formLabel">Images</label>
      <p className="imagesInfo">
        The first image will be the cover (max 6)
        <br />
        Each image must be under 10MB
      </p>

      <input
        type="file"
        onChange={handleChange}
        max="6"
        accept=".jpg,.png,.jpeg"
        multiple
        ref={inputRef}
        hidden
      />
      <button
        type="button"
        onClick={handleUpload}
        style={{
          backgroundColor: "black",
          color: "white",
          fontSize: "16px",
          padding: "10px 60px",
          borderRadius: "5px",
          margin: "10px 0px",
          cursor: "pointer",
        }}
      >
        Upload files
      </button>
      {uploadedImages && (
        <ul
          style={{
            listStyle: "none",
            padding: "0px",
          }}
        >
          {uploadedImages.map((url, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1em",
              }}
            >
              <img
                src={url}
                alt=""
                width="200"
                height="200"
                loading="lazy"
                style={{ objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={handleDeleteImage}
                data-url={url}
                style={{
                  backgroundColor: "black",
                  color: "white",
                  fontSize: "13px",
                  padding: "10px",
                  borderRadius: "5px",
                  margin: "10px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="submit" className="primaryButton createListingButton">
        Submit
      </button>
    </form>
  );
};
