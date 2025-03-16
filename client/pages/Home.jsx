import React, { useEffect, useState } from "react";
import Header from "../src/components/Header";
import { useProduct } from "../src/contexts/ProductContext";
import {
  X,
  ShoppingCart,
  User,
  Search,
  Facebook,
  Clock,
  Phone,
  MailOpen,
  MapPinned,
} from "lucide-react";
import { useCart } from "../src/contexts/CartContext";
import { Link } from "react-router-dom";
import { useAuth } from "../src/contexts/AuthContext";
import {
  Carousel,
  IconButton,
  Card,
  CardHeader,
  CardBody,
  Dialog,
  DialogBody,
} from "@material-tailwind/react";
import BotpressChat from "../chatbots/BotPress";
import TidioChat from "../chatbots/Tidio";

export default function Home() {
  const { products, fetchProducts } = useProduct();
  const [selectedProduct, setSelectedProduct] = useState(null); // State for the selected product
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);

  const handleOpen = (product) => {
    setSelectedProduct({
      ...product,
      selectedMass: product.mass,
      selectedPrice: product.price,
      selectedQuantity: product.quantity,
    });
    setOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setOpen(!open);
  };

  // Function to prevent modal from opening when clicking the Shopping Cart button
  const handleCartClick = (e, product, mass, price) => {
    e.stopPropagation(); // Prevent click event from propagating to the card
    addToCart(product.id, mass, price);
  };

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
          autoplay={true}
          autoplayDelay={10000}
          loop={true}
          className="rounded-xl overflow-hidden"
          navigation={({ setActiveIndex, activeIndex, length }) => (
            <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
              {new Array(length).fill("").map((_, i) => (
                <span
                  key={i}
                  className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${
                    activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
                  }`}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}
        >
          <img src="../src/assets/images/fb_LandE.jpg" alt="image 1" className="h-full w-full object-contain md:object-cover" />
          <img src="../src/assets/images/Parteneri.png" alt="image 2" className="h-full w-full object-contain bg-white bg-opacity-80" />
          <img src="../src/assets/images/Carousel_LandE.png" alt="image 3" className="h-full w-full object-contain object-center bg-white bg-opacity-80" />
        </Carousel>
      </div>
      <div className="flex flex-wrap md:justify-start justify-center p-10 gap-16 intersect ? animate-fade-up">
        {products.map((product) => (
          <Card
            key={product.id}
            className="bg-white bg-opacity-50 cursor-pointer md:w-64 w-48 h-auto"
            onClick={() => handleOpen(product)} // Select the product and its details
          >
            <CardHeader className="md:h-48 h-32 flex justify-center">
              <img
                src={product.imageUrl || ""}
                alt={product.name}
                className="object-contain h-full"
              />
            </CardHeader>
            <CardBody className="relative">
              <h1 className="text-xl font-bold leading-tight text-gray-900">
                {product.name}
              </h1>
              <p className="mt-2 text-gray-800">{product.type}</p>
              <p className="mt-2 text-gray-800">{product.mass} g</p>
              <p className="mt-2 text-teal-800 font-extrabold">
                {product.price} RON
              </p>
              <IconButton
                onClick={(e) =>
                  handleCartClick(e, product, product.mass, product.price)
                } // Don't open modal when clicking this button
                className="!absolute bottom-2 right-2 bg-green-100 hover:bg-teal-600"
              >
                <ShoppingCart className="text-teal-800" />
              </IconButton>
            </CardBody>
          </Card>
        ))}
      </div>
      {/*<BotpressChat/>*/}
      <footer className="bg-black">
        <div className="bg-teal-900 bg-opacity-55 flex flex-col md:flex-row items-center justify-between p-4 gap-6 md:gap-10">
          <img
            src="../src/assets/images/lande_white.png"
            className="w-20 h-20 md:w-24 md:h-24"
            alt="Logo"
          />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
            <div className="flex flex-col gap-4 text-center md:text-left">
              <div className="flex flex-row gap-2 items-center">
                <Phone className="text-white" />
                <a
                  href="tel:0740068455"
                  className="text-white text-sm md:text-base"
                >
                  +40 (740) 068 455
                </a>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <MailOpen className="text-white" />
                <a
                  href="mailto:leagroteamsrl@gmail.com"
                  className="text-white text-sm md:text-base"
                >
                  {" "}
                  leagroteamsrl@gmail.com{" "}
                </a>
              </div>
              <div className="flex flex-row gap-4 items-center justify-center md:justify-start">
                <Facebook
                  onClick={() =>
                    window.open(
                      "https://www.facebook.com/profile.php?id=100047988926318",
                      "_blank"
                    )
                  }
                  className="text-white cursor-pointer"
                />
                <MapPinned
                  onClick={() =>
                    window.open(
                      "https://www.google.com/maps/place/Fitofarmacie+L%26E+AgroTeam+srl/@47.0328083,23.9118688,17z/data=!3m1!4b1!4m6!3m5!1s0x4749bd6fb2248211:0xadfe2fd24dd28334!8m2!3d47.0328083!4d23.9118688!16s%2Fg%2F11f6165fjn?entry=ttu&g_ep=EgoyMDI1MDMxOS4yIKXMDSoASAFQAw%3D%3D",
                      "_blank"
                    )
                  }
                  className="text-white cursor-pointer"
                />
              </div>
            </div>
            <div className="flex flex-col text-center md:text-left gap-4">
              <h1 className="text-white font-semibold">Program:</h1>
              <div className="flex flex-row gap-2">
                <Clock className="text-white rounded-full" />
                <div>
                  <h2 className="text-white text-sm md:text-base">
                    Luni-vineri: 8:00-18:00
                  </h2>
                  <h2 className="text-white text-sm md:text-base">
                    Sâmbătă: 8:00-12:00
                  </h2>
                  <h2 className="text-white text-sm md:text-base">
                    Duminică: Închis
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {selectedProduct && (
        <Dialog open={open} handler={closeModal}>
          <DialogBody>
            <IconButton
              variant="text"
              onClick={closeModal}
              className="!absolute top-2 right-2 text-teal-800"
            >
              <X />
            </IconButton>
            <h2 className="text-2xl font-bold mb-4 text-center">
              {selectedProduct.name}
            </h2>
            <p className="text-lg mb-2">Tip: {selectedProduct.type}</p>
            <p className="text-lg mb-2">
              Greutate: {selectedProduct.selectedMass} g
            </p>
            <p className="text-lg mb-2">
              Preț: {selectedProduct.selectedPrice} RON
            </p>
          </DialogBody>
        </Dialog>
      )}
    </>
  );
}
