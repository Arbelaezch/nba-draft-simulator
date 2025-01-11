// Height calculation utilities
const convertHeightToInches = (heightStr) => {
    try {
      const [feet, inches] = heightStr
        .split("'")
        .map((num) => parseInt(num.trim()));
      return feet * 12 + (inches || 0); // Handle cases where inches might be missing
    } catch (error) {
      console.error(`Error parsing height: ${heightStr}`);
      return 72; // Default to 6'0" if parsing fails
    }
  };


  export { convertHeightToInches };