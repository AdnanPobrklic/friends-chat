import Sidebar from "../components/HomeComponents/Sidebar";
import Footer from "../components/MainComponents/Footer";
import Header from "../components/MainComponents/Header";
import InfoMsg from "../components/Partials/InfoMessage";
import Chat from "../components/MainComponents/Chat"
import { createContext, useContext, useState, useEffect } from "react";
import { UserContext } from "../components/Auth/ProtectedRoute";
import io from "socket.io-client"

export default function ChatPage() {

    const {user, setUser}  = useContext(UserContext)
    const [infoMsg, setInfoMsg] = useState({value: "", isErr: false, isShown: false})
    const [apiLoader, setApiLoader] = useState(false)
    const [socket, setSocket] = useState(null) 
    const [messages, setMessages] = useState([])
    const [showSidebar, setShowSidebar] = useState(window.innerWidth > 700);

    useEffect(() => {
        const handleResize = () => {
            setShowSidebar(window.innerWidth > 500);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try{
                const res = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/chat/get-messages?id1=${user._id}&id2=${getReciverId()}`, {
                    method: "GET",
                    credentials: "include",
                })
    
                if(res.status === 200){
                    const data = await res.json()
                    setMessages(data.messages)
                }else if(res.status === 500){
                    throw new Error()
                }
    
            }catch(err){
                setInfoMsg((prevState) => ({
                    value: "Something went wrong, please try again later",
                    isShown: true,
                    isErr: true,
                }));
            }
        }
    
        fetchData()
    }, [])

    useEffect(() => {
        
        const newSocket = io.connect(import.meta.env.VITE_BACKEND_DOMAIN);
        setSocket(newSocket) 

        newSocket.emit('onlineSetter', {id: user._id, friends: user.friends})
        newSocket.emit('joinChatRoom', {id1: user._id, id2: getReciverId()});
        newSocket.emit('ReloadSession', {user});

        setInterval(() => {
            newSocket.emit('ping', {id: user._id})
        }, 10000)
    
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

    const getReciverId = () => {
        const id1 = window.location.href.substring(window.location.href.lastIndexOf("/chat") + 6, window.location.href.lastIndexOf("-"))
        const id2 = window.location.href.substring(window.location.href.lastIndexOf("-") + 1)

        if(id1 != user._id){
            return id1
        }else{
            return id2
        }
    }

    return (
        <div className="h-dvh flex flex-col">
            < InfoMsg infoMsg={infoMsg} apiLoader={apiLoader}/>
            <Header showNotif={true} showToggle={true} setShowSidebar={setShowSidebar}/>
            <main className="flex-grow bg-neutral-900 flex overflow-hidden">
                < Sidebar  socket={socket} setMessages={setMessages} setInfoMsg={setInfoMsg} showSidebar={showSidebar}/>
                < Chat  socket={socket} getReciverId={getReciverId} messages={messages} setMessages={setMessages} showSidebar={showSidebar}/>
            </main>
            <Footer showNotif={true}/>
        </div>
    )
}
