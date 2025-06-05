import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { useProduct } from "../src/contexts/ProductContext";
import { useCategory } from "../src/contexts/CategoryContext";
import {
  User,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../src/contexts/AuthContext";
import { Carousel } from "@material-tailwind/react";
import CategorySection from "../src/components/CategorySection";
import carouselImg1 from "../src/assets/images/fb_LandE.jpg"
import carouselImg2 from "../src/assets/images/Parteneri.png"
import carouselImg3 from "../src/assets/images/Carousel_LandE.png"
import BotpressChat from "../chatbots/BotPress";
import TidioChat from "../chatbots/Tidio";

//Custom navigation for the carousel
const renderCarouselNavigation = ({ setActiveIndex, activeIndex, length }) => (
  <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
    {new Array(length).fill("").map((_, i) => (
      <span
        key={i}
        className={`block h-1 cursor-pointer rounded-2xl transition-all ${
          activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
        }`}
        onClick={() => setActiveIndex(i)}
      />
    ))}
  </div>
);

export default function Home() {
  const { currentUser } = useAuth();
  const { products } = useProduct();
  const { categories } = useCategory();

  return (
    <>
      <header>
        <div className="flex flex-row p-8 gap-4 justify-center items-center">
          <Link to="/about" className="text-white hover:underline">
            Despre noi
          </Link>
          <div className="ml-auto flex gap-4  justify-center items-center">
            <div className="relative justify-center items-center">
              <input
                type="text"
                className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none transition-all duration-300 ease-in-out w-12 focus:w-64"
                placeholder="Căutare..."
              />
              <button
                type="submit"
                className="absolute right-0 top-0 mt-2.5 mr-4"
              >
                <Search className="text-teal-800 h-5" />
              </button>
            </div>
            {!currentUser && (
              <Link to="/sign-up">
                <li className="hover:underline text-white flex items-center gap-1">
                  <User /> Registrare
                </li>
              </Link>
            )}
          </div>
        </div>
      </header>
      <Header />
      <div className="md:w-5/6 md:h-96 w-full h-56 mx-auto my-20">
        <Carousel
          data-testid="image-carousel"
          autoplay={true}
          autoplayDelay={5000}
          loop={true}
          className="rounded-xl overflow-hidden"
          navigation={renderCarouselNavigation}
        >
          <img
            src={carouselImg1}
            alt="image 1"
            className="h-full w-full object-contain md:object-cover"
          />
          <img
            src={carouselImg2}
            alt="image 2"
            className="h-full w-full object-contain bg-white bg-opacity-80"
          />
          <img
            src={carouselImg3}
            alt="image 3"
            className="h-full w-full object-contain object-center bg-white bg-opacity-80"
          />
        </Carousel>
      </div>
      {categories.map((category) => {
        const categoryProducts = products.filter((p) => p.type === Number(category.id));
        if (categoryProducts.length < 3) return null;
        return (
          <CategorySection
            key={category.id}
            category={category}
            products={categoryProducts}
          />
        );
      })}
      {/*<BotpressChat/>*/}
      <Footer />
    </>
  );
}
