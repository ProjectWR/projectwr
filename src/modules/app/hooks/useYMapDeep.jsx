import { useEffect, useState } from "react";
  
const useYMapDeep = (yMapReference) => {
  const [yMapState, setYMapState] = useState(yMapReference);

  useEffect(() => {
    const updateState = () => {
      setYMapState(yMapReference);
    };

    yMapReference.observeDeep(updateState);

    return () => {
      yMapReference.unobserve(updateState);
    };
  }, [yMapReference]);

  return yMapState;
};

export default useYMapDeep;