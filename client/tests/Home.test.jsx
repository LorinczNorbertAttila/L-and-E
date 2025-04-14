import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from "vitest";
import Home from "../pages/Home";
import Cart from "../pages/Cart";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { useEffect } from "react";

//Navigation mock
function LocationDisplay({ onNavigate }) {
  const location = useLocation();
  useEffect(() => {
    onNavigate(location.pathname);
  }, [location, onNavigate]);
  return null;
}
const onNavigateMock = vi.fn();

//ProductContext mock
vi.mock("../src/contexts/ProductContext", () => ({
  useProduct: () => ({
    products: [
      {
        id: "1",
        name: "Produs Test 1",
        type: "Tip 1",
        mass: 100,
        price: 10,
        imageUrl: "https://example.com/test.jpg",
      },
      {
        id: "2",
        name: "Produs Test 2",
        type: "Tip 2",
        mass: 200,
        price: 20,
        imageUrl: "https://example.com/test2.jpg",
      },
    ], // Mock products array
  }),
}));

// AuthContext mock
vi.mock("../src/contexts/AuthContext", () => ({
  useAuth: () => ({
    currentUser: {}, // Mock current user object
    logout: vi.fn(), // Mock logout function
  }),
}));

// CartContext mock
let mockCart = [];

const mockAddToCart = vi.fn((id, mass, price) => {
  mockCart = [
    ...mockCart,
    {
      product: { id, mass, price },
      quantity: 1,
    },
  ];
});
vi.mock("../src/contexts/CartContext", () => ({
  useCart: () => ({
    cart: mockCart, // Mock cart
    addToCart: mockAddToCart, // Mock addToCart function
  }),
}));

// Test suite for the Home page
describe("Home Page", () => {
  // Setup before all tests
  beforeAll(() => {
    // Mock the animate function for compatibility
    Element.prototype.animate =
      Element.prototype.animate ||
      (() => ({
        finished: Promise.resolve(),
        cancel: () => {},
      }));
  });
  beforeEach(() => {
    mockCart = [];
    render(
      <MemoryRouter initialEntries={["/", "/cart"]} initialIndex={0}>
        <>
          <LocationDisplay onNavigate={onNavigateMock} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </>
      </MemoryRouter>
    );
  });
  //Mock cleanup after each test
  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  // Test case: verify carousel image changes on button click
  it("should change the carousel image on button click", async () => {
    const carousel = screen.getByTestId("image-carousel"); // Get the carousel element
    const nextButtons = within(carousel).getAllByRole("button"); // Get all buttons within the carousel
    const dots = carousel.querySelectorAll("span.rounded-2xl"); // Get the dots indicating the current image
    // Initial state: first dot is active
    expect(dots[0]).toHaveClass("w-8");
    expect(dots[1]).toHaveClass("w-4");
    expect(dots[2]).toHaveClass("w-4");
    // Click the next button and verify the second dot becomes active
    await userEvent.click(nextButtons[1]);
    expect(dots[0]).toHaveClass("w-4");
    expect(dots[1]).toHaveClass("w-8");
    expect(dots[2]).toHaveClass("w-4");
    // Click the next button again and verify the third dot becomes active
    await userEvent.click(nextButtons[1]);
    expect(dots[0]).toHaveClass("w-4");
    expect(dots[1]).toHaveClass("w-4");
    expect(dots[2]).toHaveClass("w-8");
    // Click the next button again and verify it cycles back to the first dot
    await userEvent.click(nextButtons[1]);
    expect(dots[0]).toHaveClass("w-8");
    expect(dots[1]).toHaveClass("w-4");
    expect(dots[2]).toHaveClass("w-4");
    // Click the previous button and verify the third dot becomes active again
    await userEvent.click(nextButtons[0]);
    expect(dots[0]).toHaveClass("w-4");
    expect(dots[1]).toHaveClass("w-4");
    expect(dots[2]).toHaveClass("w-8");
  });

  //Test case: products are displayed correctly
  it("should render products when products are available", async () => {
    // Wait for the products to be rendered
    await waitFor(() => {
      expect(screen.getByText("Produs Test 1")).toBeInTheDocument();
      expect(screen.getByText("Produs Test 2")).toBeInTheDocument();
    });
    //Product informations
    expect(screen.getByAltText("Produs Test 1").src).toContain(
      "https://example.com/test.jpg"
    );
    expect(screen.getByText("Tip 1")).toBeInTheDocument();
    expect(screen.getByText("100 g")).toBeInTheDocument();
    expect(screen.getByText("10 RON")).toBeInTheDocument();
    expect(screen.getByAltText("Produs Test 2").src).toContain(
      "https://example.com/test2.jpg"
    );
    expect(screen.getByText("Tip 2")).toBeInTheDocument();
    expect(screen.getByText("200 g")).toBeInTheDocument();
    expect(screen.getByText("20 RON")).toBeInTheDocument();
  });

  //Test case: product modal opens
  it("should open product modal when a product is clicked", async () => {
    // Click on the first product card
    const productCard = screen.getByText("Produs Test 1");
    await userEvent.click(productCard);
    // Wait for the modal to appear
    const modal = await screen.findByRole("dialog");
    expect(
      await within(modal).findByRole("heading", { name: "Produs Test 1" })
    ).toBeInTheDocument();
    expect(within(modal).getByText("Tip: Tip 1")).toBeInTheDocument();
    expect(within(modal).getByText("Greutate: 100 g")).toBeInTheDocument();
    expect(within(modal).getByText("Preț: 10 RON")).toBeInTheDocument();
    //Button that closes the modal
    const closeButton = within(modal).getByRole("button");
    await userEvent.click(closeButton);
    // Wait for the modal to close
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  //Test case: add product to cart after proceed to Cart page
  it("should add product to cart after navigate to Cart page", async () => {
    //Check if the cart is empty
    const cartItemCount = screen.getByTestId("cart-item-count");
    expect(cartItemCount.textContent).toEqual("0");
    const productTitle = screen.getByText("Produs Test 1");
    // Click the add to cart button
    const productCard = productTitle.closest(".bg-white");
    const addToCartButton = within(productCard).getByRole("button");
    await userEvent.click(addToCartButton);
    //Check if the cart item count changes
    await waitFor(() => {
      expect(screen.getByTestId("cart-item-count").textContent).toEqual("1");
    });
    //Click again
    await userEvent.click(addToCartButton);
    //Check if the cart item count changes
    await waitFor(() => {
      expect(screen.getByTestId("cart-item-count").textContent).toEqual("2");
    });
    //Click on the cart icon to navigate to the Cart page
    const cartIcon = screen.getByTestId("cart-item-count");
    userEvent.click(cartIcon);
    await waitFor(() => {
      expect(onNavigateMock).toHaveBeenCalledWith("/cart");
    });
  });
});
