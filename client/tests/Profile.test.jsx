import { cleanup, render, screen, waitFor } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from "vitest";
import Profile from "../pages/Profile";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/vitest";

// Mock functions for AuthContext
let currentUserMock = {
  uid: "123456",
  name: "Test User",
  email: "test@example.com",
  tel: "",
  address: "",
  img: "https://example.com/test.jpg",
  cart: [],
};

// updates the currentUserMock
const mockSetCurrentUser = vi.fn((newUser) => {
  currentUserMock = { ...currentUserMock, ...newUser };
});

// Mock setField function to simulate updating user fields
const mockSetField = vi
  .fn()
  .mockImplementation((collection, uid, field, value) => {
    if (collection === "users" && uid === currentUserMock.uid) {
      currentUserMock = { ...currentUserMock, [field]: value };
    }
    return Promise.resolve();
  });

// Mock logout
const mockLogout = vi.fn();

// AuthContext mock
vi.mock("../src/contexts/AuthContext", () => ({
  useAuth: () => ({
    currentUser: currentUserMock,
    logout: mockLogout,
    setField: mockSetField,
    setCurrentUser: mockSetCurrentUser,
  }),
}));

// Mock the CartContext to provide test-specific behavior
vi.mock("../src/contexts/CartContext", () => ({
  useCart: () => ({
    cart: [], // Mock cart
  }),
}));

// Mock external JSON data for testing
vi.mock("../src/assets/json/judete.json", () => ({
  default: {
    judete: [
      {
        auto: "CJ", // Mock county code
        nume: "Cluj", // Mock county name
        localitati: [{ nume: "Cluj-Napoca" }, { nume: "Gherla" }], // Mock cities
      },
    ],
  },
}));

// Test suite for the Profile component
describe("Profile Component", () => {
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
  // Setup before each test
  beforeEach(() => {
    currentUserMock = {
      uid: "123456",
      name: "Test User",
      email: "test@example.com",
      tel: "",
      address: "",
      img: "https://example.com/test.jpg",
      cart: [],
    };
    //render the Profile component before each test
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
  });
  //Mock cleanup after each test
  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  // Test case: Renders the user's information
  it("renders the user's information", async () => {
    // Check if the profile image is rendered correctly
    const image = screen.getByAltText("profile");
    expect(image.src).toContain("https://example.com/test.jpg");
    // Check if the user's name and email are displayed
    expect(await screen.findByText(/Test User/i)).toBeInTheDocument();
    expect(await screen.findByText(/test@example.com/i)).toBeInTheDocument();
  });

  // Test case: Calls logout when the logout button is clicked
  it("calls logout when the logout button is clicked", async () => {
    // Find and click the logout button
    const logoutButton = await screen.findByRole("button", {
      name: /log out/i,
    });
    await userEvent.click(logoutButton);
    // Verify that the logout function was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  //Test case: Incorrect phone number format
  it("shows error message for incorrect phone number format", async () => {
    // Find and click the "Pencil" button
    const modifyPhoneButton = screen.getByTestId("modify-phone");
    await userEvent.click(modifyPhoneButton);
    // Find the phone input field and type an invalid phone number
    const phoneInput = await screen.findByRole("textbox");
    await userEvent.type(phoneInput, "074476");
    // Find and click the "Modify" button
    const saveButton = screen.getByRole("button", { name: /modifică/i });
    await userEvent.click(saveButton);
    // Verify that setField was not called
    expect(mockSetField).not.toHaveBeenCalled();
    // Verify that an error message is displayed
    expect(
      await screen.findByText(
        /Numărul de telefon trebuie să conțină exact 10 cifre./i
      )
    ).toBeInTheDocument();
  });

  // Test case: Modifies the user's phone number
  it("modifies the user's phone number", async () => {
    // Find and click the "Pencil" button
    const modifyPhoneButton = screen.getByTestId("modify-phone");
    await userEvent.click(modifyPhoneButton);
    // Find the phone input field and type a new phone number
    const phoneInput = await screen.findByRole("textbox");
    await userEvent.type(phoneInput, "1234567890");
    // Find and click the "Modify" button
    const saveButton = screen.getByRole("button", { name: /modifică/i });
    await userEvent.click(saveButton);
    // Verify that setField was called with the correct arguments
    await waitFor(() => {
      expect(mockSetField).toHaveBeenCalledWith(
        "users",
        "123456",
        "tel",
        "1234567890"
      );
    });
    // Verify that setCurrentUser was called with the updated phone number
    expect(mockSetCurrentUser).toHaveBeenCalledWith(
      expect.objectContaining({
        tel: "1234567890",
      })
    );
    // Verify that the new phone number is displayed
    expect(await screen.findByText(/1234567890/i)).toBeInTheDocument();
  });

  //Test case: The user's didn't choose a county
  it("shows error message when the user didn't choose a county", async () => {
    // Find and click the "Add Address" button
    const addAddressButton = screen.getByRole("button", {
      name: /adaugă adresă/i,
    });
    await userEvent.click(addAddressButton);
    // Fill in the address text area
    const textarea = screen.getByLabelText(/adresă/i);
    await userEvent.type(textarea, "Str.Test nr.1");
    // Find and click the "Save" button without selecting a county
    const saveBtn = screen.getByRole("button", { name: /salvează/i });
    await userEvent.click(saveBtn);
    // Verify that setField was not called
    expect(mockSetField).not.toHaveBeenCalled();
    // Verify that an error message is displayed
    expect(
      await screen.findByText(/Vă rugăm să selectați un județ!/i)
    ).toBeInTheDocument();
  });

  //Test case: The user chose a county but not a city
  it("shows error message when the user didn't choose a city", async () => {
    // Find and click the "Add Address" button
    const addAddressButton = screen.getByRole("button", {
      name: /adaugă adresă/i,
    });
    await userEvent.click(addAddressButton);
    // Interact with the dropdowns to select a county and no city
    const selecButtons = screen.getAllByRole("combobox");
    await userEvent.click(selecButtons[0]);
    const countyOption = await screen.findByText("Cluj");
    await userEvent.click(countyOption);
    // Fill in the address text area
    const textarea = screen.getByLabelText(/adresă/i);
    await userEvent.type(textarea, "Str.Test nr.1");
    // Find and click the "Save" button without selecting a county
    const saveBtn = screen.getByRole("button", { name: /salvează/i });
    await userEvent.click(saveBtn);
    // Verify that setField was not called
    expect(mockSetField).not.toHaveBeenCalled();
    // Verify that an error message is displayed
    expect(
      await screen.findByText(/Vă rugăm să selectați un oraș!/i)
    ).toBeInTheDocument();
  });

  //Test case: The user chose a county and city but didn't fill the address
  it("shows error message when the user didn't fill the address field", async () => {
    // Find and click the "Add Address" button
    const addAddressButton = screen.getByRole("button", {
      name: /adaugă adresă/i,
    });
    await userEvent.click(addAddressButton);
    // Interact with the dropdowns to select a county and no city
    const selecButtons = screen.getAllByRole("combobox");
    await userEvent.click(selecButtons[0]);
    const countyOption = await screen.findByText("Cluj");
    await userEvent.click(countyOption);
    await userEvent.click(selecButtons[1]);
    const cityOption = await screen.findByText("Gherla");
    await userEvent.click(cityOption);
    // Find and click the "Save" button without selecting a county
    const saveBtn = screen.getByRole("button", { name: /salvează/i });
    await userEvent.click(saveBtn);
    // Verify that setField was not called
    expect(mockSetField).not.toHaveBeenCalled();
    // Verify that an error message is displayed
    expect(
      await screen.findByText(
        /Adresa trebuie să conțină cel puțin 5 caractere./i
      )
    ).toBeInTheDocument();
  });

  // Test case: Handles the add address logic
  it("handles the add address logic", async () => {
    // Find and click the "Add Address" button
    const addAddressButton = screen.getByRole("button", {
      name: /adaugă adresă/i,
    });
    await userEvent.click(addAddressButton);
    // Interact with the dropdowns to select a county and city
    const selecButtons = screen.getAllByRole("combobox");
    await userEvent.click(selecButtons[0]);
    const countyOption = await screen.findByText("Cluj");
    await userEvent.click(countyOption);
    await userEvent.click(selecButtons[1]);
    const cityOption = await screen.findByText("Gherla");
    await userEvent.click(cityOption);
    // Fill in the address text area
    const textarea = screen.getByLabelText(/adresă/i);
    await userEvent.type(textarea, "Str.Test nr.1");
    // Click the save button
    const saveBtn = screen.getByRole("button", { name: /salvează/i });
    await userEvent.click(saveBtn);
    // Verify that the setField function was called with the correct arguments
    await waitFor(() => {
      expect(mockSetField).toHaveBeenCalledWith(
        "users",
        "123456",
        "address",
        "Str.Test nr.1, Gherla, jud. Cluj"
      );
    });
    // Verify that the setCurrentUser function was called with the updated address
    expect(mockSetCurrentUser).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "Str.Test nr.1, Gherla, jud. Cluj",
      })
    );
    expect(
      await screen.findByText(/Str.Test nr.1, Gherla, jud. Cluj/i)
    ).toBeInTheDocument();
  });
});
