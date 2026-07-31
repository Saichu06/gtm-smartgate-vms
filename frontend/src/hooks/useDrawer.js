/**
 * useDrawer — Custom hook for managing slide-over drawer state.
 */
import { useState, useCallback } from 'react';

const useDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerData, setDrawerData] = useState(null);

  const openDrawer = useCallback((data = null) => {
    setDrawerData(data);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setDrawerData(null);
  }, []);

  return { isOpen, drawerData, openDrawer, closeDrawer };
};

export default useDrawer;
