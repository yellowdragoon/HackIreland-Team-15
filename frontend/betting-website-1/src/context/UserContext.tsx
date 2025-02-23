'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  userPassport: string;
  setUserPassport: (password: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userName, setUserName] = useState('');
  const [userPassport, setUserPassport] = useState('');

  return (
    <UserContext.Provider value={{ userName, setUserName, userPassport, setUserPassport }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
