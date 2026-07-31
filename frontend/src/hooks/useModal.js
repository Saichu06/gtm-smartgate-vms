/**
 * useModal — Custom hook for managing modal open/close state.
 */
import { useState, useCallback } from 'react';

const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  const open = useCallback((d = null) => {
    setData(d);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return { isOpen, data, open, close };
};

export default useModal;
