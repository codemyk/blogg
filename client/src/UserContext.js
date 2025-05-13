import React from 'react';
import { createContext } from 'react';


const UserContext = React.createContext();

export const UserProvider = UserContext.Provider;

export default UserContext;