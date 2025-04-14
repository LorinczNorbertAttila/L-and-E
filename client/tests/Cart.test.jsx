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
import Cart from "../pages/Cart";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { useEffect } from "react";
import Home from "../pages/Home";

//Navigation mock
function LocationDisplay({ onNavigate }) {
  const location = useLocation();
  useEffect(() => {
    onNavigate(location.pathname);
  }, [location, onNavigate]);
  return null;
}
const onNavigateMock = vi.fn();

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

const mockUpdateCartItemQuantity = vi.fn((productId, difference) => {
  mockCart = mockCart.map((item) =>
    item.product.id === productId
      ? { ...item, quantity: item.quantity + difference }
      : item
  );
});

const mockRemoveFromCart = vi.fn((productId) => {
  mockCart = mockCart.filter((item) => item.product.id !== productId);
});

const mockPlaceOrder = vi.fn(() => Promise.resolve());

vi.mock("../src/contexts/CartContext", () => ({
  useCart: () => ({
    cart: mockCart, // Mock cart
    addToCart: mockAddToCart, // Mock addToCart function
    updateCartItemQuantity: mockUpdateCartItemQuantity, // Mock updateCartItemQuantity function
    removeFromCart: mockRemoveFromCart, // Mock removeFromCart function
    placeOrder: mockPlaceOrder, // Mock placeOrder function
  }),
}));

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

// Test suite for the Home page
describe("Cart Component", () => {
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
    mockCart = [
      {
        product: {
          id: "1",
          name: "Produs Test 1",
          type: "Tip 1",
          mass: 100,
          price: 10,
          imageUrl: "https://example.com/test.jpg",
        },
        quantity: 1,
      },
    ];
    render(
      <MemoryRouter initialEntries={["/", "/cart"]} initialIndex={1}>
        <>
          <LocationDisplay onNavigate={onNavigateMock} />
          <Routes>
            <Route path="/cart" element={<Cart />} />
            <Route path="/" element={<Home />} />
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

  //Test case: Increase item quantity in cart
  it("should increase quantity when arrow up is pressed", async () => {
    expect(screen.getByText("Produs Test 1")).toBeInTheDocument(); // Verify product is displayed
    const quantityInput = screen.getByDisplayValue("1");
    await userEvent.type(quantityInput, "{arrowup}");
    await waitFor(() => {
      expect(mockUpdateCartItemQuantity).toHaveBeenCalledWith("1", 1); // új value 2 - régi 1 = 1
    });
    await userEvent.type(quantityInput, "{arrowup}");
    await waitFor(() => {
      expect(mockUpdateCartItemQuantity).toHaveBeenCalledWith("1", 1); // új value 3 - régi 2 = 1
    });
  });

  //Test case: Decrease item quantity in cart
  it("should decrease quantity when arrow up is pressed", async () => {
    expect(screen.getByText("Produs Test 1")).toBeInTheDocument(); // Verify product is displayed
    const quantityInput = screen.getByDisplayValue("1");
    await userEvent.type(quantityInput, "{arrowdown}");
    await waitFor(() => {
      expect(mockRemoveFromCart).toHaveBeenCalledWith("1"); // Verify item removed
    });
    expect(mockCart.length).toBe(0); // Verify cart is empty
  });

  //Test case: Handle the purchase after going to the main page
  it("should place the order successfully and show alert", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    expect(screen.getByText("Produs Test 1")).toBeInTheDocument(); // Verify product is displayed
    const purchaseButton = screen.getByRole("button", {
      name: "Trimite comanda",
    });
    await userEvent.click(purchaseButton);
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Comanda ta a fost plasată cu succes!" // Verify alert message
      );
    });
    alertMock.mockRestore();  
    const logo = screen.getByAltText("Home");
    expect(logo).toBeDefined(); // Verify logo exists
    await userEvent.click(logo); 
    await waitFor(() => {
      expect(onNavigateMock).toHaveBeenCalledWith("/"); // Verify navigation to home
    });
  });
});
