import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SmartDebtIntroScreen from "../app/OnboardingScreen"; // đường dẫn tới index.tsx

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

describe("Onboarding Screen", () => {
  it("renders without crashing", () => {
    const { getByText } = render(<SmartDebtIntroScreen />);
    // Check if App name is rendered
    expect(getByText("SMART DEBT")).toBeTruthy();
  });

  it("should display first page content correctly", () => {
    const { getByText } = render(<SmartDebtIntroScreen />);
    // Check first page elements
    expect(getByText("SMART DEBT")).toBeTruthy();

    expect(getByText("Quản lý chi tiêu - Nhắc nợ tự động")).toBeTruthy();

    // Check buttons on first page
    expect(getByText("BẮT ĐẦU")).toBeTruthy();
  });

  it("calls router.push when button is pressed", () => {
    const { getByText } = render(<SmartDebtIntroScreen />);

    const button = getByText("BẮT ĐẦU"); // đổi theo Text/Button 

    fireEvent.press(button);

    expect(mockPush).toHaveBeenCalledWith("/auth/AuthScreen"); // đường dẫn push
  });
});
