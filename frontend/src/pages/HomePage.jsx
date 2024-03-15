import { UserContext } from "../components/Auth/ProtectedRoute";
import Sidebar from "../components/HomeComponents/Sidebar";
import Footer from "../components/MainComponents/Footer";
import Header from "../components/MainComponents/Header";
import InfoMsg from "../components/Partials/InfoMessage";
import { createContext, useState, useEffect, useContext } from "react";
import io from "socket.io-client"


export const InfoMsgContext = createContext()

export default function HomePage() {
    
    const [infoMsg, setInfoMsg] = useState({value: "", isErr: false, isShown: false})
    const {user, setUser} = useContext(UserContext)
    const [apiLoader, setApiLoader] = useState(false)
    const [socket, setSocket] = useState(null) 
    const [showSidebar, setShowSidebar] = useState(true)

    useEffect(() => {

        const newSocket = io.connect(import.meta.env.VITE_BACKEND_DOMAIN);
        setSocket(newSocket) 

        newSocket.emit('onlineSetter', {id: user._id, friends: user.friends})
        newSocket.emit('ReloadSession', {user});

        setInterval(() => {
            newSocket.emit('ping', {id: user._id})
        }, 1000)
    
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
        
    }, [])

    useEffect(() => {

        if(!infoMsg.isShown) return

        setTimeout(() => {
            setInfoMsg(prevState => ({
                ...prevState,
                isShown: false,
            }))
        }, 2000)

    }, [infoMsg.isShown])

    useEffect(() => {
        if(!infoMsg.isShown) return
        setApiLoader(false)
    }, [infoMsg.isShown])

    return (
        <div className="h-dvh flex flex-col">
            < InfoMsg infoMsg={infoMsg} apiLoader={apiLoader}/>
            <Header showNotif={true} socket={socket} showToggle={true} setShowSidebar={setShowSidebar}/>
            <main className="flex-grow bg-neutral-900 flex overflow-hidden">
                < Sidebar setUser={setUser} infoMsg={infoMsg} setInfoMsg={setInfoMsg} setApiLoader={setApiLoader} socket={socket} showSidebar={showSidebar}/>
            </main>
            <Footer showNotif={true}/>
        </div>
    )
}
