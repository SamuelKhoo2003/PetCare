import React, { createContext, useState, useEffect, useContext } from 'react';
import { saveUserToStorage, loadUserFromStorage } from '../utils/storage';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Load user from storage when the app starts
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await loadUserFromStorage();
      if (userData) {
        const { id, name, email, token } = userData;
        setCurrentUser(new User(id, name, email, token));
      }
    };
    fetchUser();
  }, []);

  // Save user to storage when currentUser changes
  useEffect(() => {
    if (currentUser) {
      saveUserToStorage(currentUser);
    }
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
