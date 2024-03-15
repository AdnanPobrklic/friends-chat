import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import SignUpPage from './pages/SignUpPage'
import LogInPage from './pages/LogInPage'
import HomePage from './pages/HomePage'
import ProtectedRoute from "./components/Auth/ProtectedRoute"
import AuthenticatedRoute from "./components/Auth/AuthenticatedRoute"
import SettingsPage from "./pages/SettingsPage"
import NotFound from './pages/NotFound'
import ChatPage from './pages/ChatPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      < ProtectedRoute>
        < HomePage />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />
  },
  {
    path: "/login",
    element: (
      <AuthenticatedRoute>
        <LogInPage />
      </AuthenticatedRoute>
    )
  },
  {
    path: "/sign-up",
    element: (
      <AuthenticatedRoute>
        < SignUpPage />
      </AuthenticatedRoute>
    )
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        < SettingsPage />
      </ProtectedRoute>
    )
  },
  {
    path: "/chat/:id",
    element: (
      <ProtectedRoute>
        < ChatPage />
      </ProtectedRoute>
    )
  },
  {
    path: "/forgot-password",
    element: (
      <AuthenticatedRoute>
        < ForgotPasswordPage />
      </AuthenticatedRoute>
    )
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    < RouterProvider router={router} />
  </React.StrictMode>,
)
