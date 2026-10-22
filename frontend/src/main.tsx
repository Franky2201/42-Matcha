import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fontsource-variable/mona-sans';
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from './context/AuthContext.tsx'
import { client } from './lib/apollo.ts'
import { ApolloProvider } from '@apollo/client/react'
import { UserProvider } from './context/UserContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <UserProvider>
          <RouterProvider router={router} />
        </UserProvider>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
)
