import { useState, useEffect } from 'react';

export function useScrollToTop() {
  const [hasScrolled, setHasScrolled] = useState(false); // State to track if scrolling has occurred

  useEffect(() => {
    if (hasScrolled) {
      // If it's not the first render, apply smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If it's the first render, just scroll to the top without smooth scrolling
      window.scrollTo(0, 0);
      setHasScrolled(true); // Mark as scrolled after the first render
    }
  }, [hasScrolled]); // Only trigger the effect when `hasScrolled` state changes
}
