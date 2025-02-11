// validation.js
export const validateNumber = (value) => {
    return !isNaN(value) && isFinite(value);
  };
  
  export const validateColor = (value) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(value);
  };