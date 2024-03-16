import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Loader from "../Partials/Loader";

export default function AuthenticatedRoute({ children }){

    const [signedIn, setSignedIn] = useState(null)

    useEffect(() => {

        const fetchData = async () => { 
            const response = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/check-auth`, {
                credentials: "include"
            })

            if (response.status === 200) {
                setSignedIn(true);
            } else {
                setSignedIn(false);
            }
        }

        fetchData();
    }, [])

    switch(signedIn){
        case true:
            return < Navigate to="/" />
        case false:
            return children
        case null:
            return < Loader />
    }
}