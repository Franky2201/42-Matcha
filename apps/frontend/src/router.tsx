import { createBrowserRouter } from "react-router-dom";
import Home from "./page/Home";
import Login from "./page/Login";
import Register from "./page/Register";
import RootWrapper from "./components/RootWrapper";
import ForgotPassword from "./page/ForgotPassword";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootWrapper />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "register",
                element: <Register />,
            },
            {
                path: "forgot-password",
                element: <ForgotPassword />
            }
        ],
    },
]);
