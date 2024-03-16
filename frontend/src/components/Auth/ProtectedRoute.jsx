import { createContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import CircleLoader from "react-spinners/CircleLoader" ;
import Loader from "../Partials/Loader";

export const UserContext = createContext(null)

export default function ProtectedRoute({ children }){

    const [signedIn, setSignedIn] = useState(null)
    const [user, setUser] = useState(null)

    useEffect(() => {

        const fetchData = async () => { 
            const response = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/check-auth`, {
                credentials: "include"
            })

            if (response.status === 200) {
                const data = await response.json()
                setSignedIn(true);
                setUser(data.user)
            } else {
                setSignedIn(false);
            }
        }

        fetchData();
    }, [])

    switch(signedIn){
        case true:
            return (
                <UserContext.Provider value={{ user, setUser }}>
                    {children}
                </UserContext.Provider>
            )
        case false:
            return < Navigate to="/login" />
        case null:
            return < Loader />
    }
}