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
  const [deviceType, setDeviceType] = useState("desktop");

  useEffect(() => {
    // Function to determine the device type based on screen width
    const determineDeviceType = () => {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        // true for mobile device
        console.log("mobile device");
      } else {
        // false for not mobile device
        console.log("not mobile device");
      }

      setDeviceType("mobile");
    };

    // Determine the device type on initial load
    determineDeviceType();

  }, []);

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
