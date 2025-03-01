import { createContext, useContext, useEffect, useState } from "react";

// Initial state for the device type context
const initialDeviceTypeState = {
  deviceType: "desktop",
  setDeviceType: () => {},
};

// Create the context
const DeviceTypeContext = createContext(initialDeviceTypeState);

// DeviceTypeProvider component
export function DeviceTypeProvider({ children }) {
  const [deviceType, setDeviceType] = useState("desktop"); // desktop, androidTab, iPad, android, iPhone 

   // phone: 365 x 667
   // desktop: 1024 x 768

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all device type classes
    root.classList.remove("mobile", "tablet", "desktop");

    // Add the current device type class
    root.classList.add(deviceType);
  }, [deviceType]);

  const value = {
    deviceType,
    setDeviceType,
  };

  return (
    <DeviceTypeContext.Provider value={value}>
      {children}
    </DeviceTypeContext.Provider>
  );
}

// Custom hook to use the device type context
export const useDeviceType = () => {
  const context = useContext(DeviceTypeContext);

  if (context === undefined) {
    throw new Error("useDeviceType must be used within a DeviceTypeProvider");
  }

  return context;
};
