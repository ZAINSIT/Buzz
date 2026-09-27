import React, { createContext, useState, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { login, register } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const signIn = async (email, password) => {
    const data = await login(email, password);
    if (data.token) {
      await SecureStore.setItemAsync("token", data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const signUp = async (email, password, name) => {
    const data = await register(email, password, name);
    if (data.token) {
      await SecureStore.setItemAsync("token", data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
