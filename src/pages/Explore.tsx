import { Link } from "react-router-dom";
import clothingImage from "../assets/jpg/clothing.jpg";
import foodImage from "../assets/jpg/food.jpg";
import medicinesImage from "../assets/jpg/medicines.jpg";
import transportationImage from "../assets/jpg/transportation.jpeg";
import { ReactComponent as LogoIcon } from "../assets/svg/logo.svg";
import { Slider } from "../components/Slider";

export const Explore = () => {
  return (
    <div className="explore">
      <header>
        <p className="pageHeader">Explore</p>
        <LogoIcon id="logo"/>
      </header>
      <main>
        <Slider />

        <p className="exploreCategoryHeading">Categories</p>

        <div className="exploreCategories">
          <Link to="/category/clothing">
            <img
              style={{objectPosition: 'top'}}
              src={clothingImage}
              alt="rent"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Clothing</p>
          </Link>

          <Link to="/category/food">
            <img
              src={foodImage}
              alt="sell"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Food</p>
          </Link>
        </div>

        <div className="exploreCategories">
          <Link to="/category/medicines">
            <img
              src={medicinesImage}
              alt="sell"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Medicines</p>
          </Link>

          <Link to="/category/transportation">
            <img
              src={transportationImage}
              alt="sell"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Transportation</p>
          </Link>
        </div>
      </main>
    </div>
  );
};
