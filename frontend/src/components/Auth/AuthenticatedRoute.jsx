import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import CircleLoader from "react-spinners/CircleLoader" ;

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
            return (
                <div className="w-full h-dvh bg-stone-950 flex justify-center items-center">
                    <CircleLoader color="rgb(59 130 246)" />
                </div>
            )
    }

}