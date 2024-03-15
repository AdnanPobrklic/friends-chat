import { useState, useEffect, useContext } from "react";
import { UserContext } from "../Auth/ProtectedRoute";


export default function Chat({ socket, getReciverId, messages, setMessages, showSidebar }) {

    const {user, setUser}  = useContext(UserContext)
    const [messageValue, setMessageValue] = useState("")


    const handleMessageValueChange = e => {
        setMessageValue(e.target.value)
    }

    const handleSendMessage = () => {
        if(messageValue.trim() == "") return
        socket.emit("sedMessage", {
            sender: user._id,
            receiver: getReciverId(),
            time: Date.now(),
            username: user.username,
            content: messageValue
        })
        setMessageValue("")
    }

    const handleKeyDown = (e) => {
        if (e.code === "Enter") {
            e.preventDefault(); 
            handleSendMessage()
        }
    };

    useEffect(() => {
        const objDiv = document.querySelector(".chat-container");
        objDiv.scrollTop = objDiv.scrollHeight;
    }, [messages])

    useEffect(() => {
        if (socket) {

            socket.off("receiveMessage");

            socket.on("receiveMessage", data => {
                setMessages(prevState => [...prevState, data])
            });
            
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {

            socket.off("userJoin");

            socket.on("userJoin", data => {
                setMessages(prevState => prevState.map(message => {
                    if (message.isSeen === 0) {
                        return {...message, isSeen: 1};
                    } else {
                        return message;
                    }
                }));
                
            });
            
        }
    }, [socket]);
    

    return (
        <div className={`bg-zinc-900 ml-auto ${showSidebar ? "w-full md:w-[calc(100%-300px)]" : "grow"} flex flex-col`}>
            <ul className="h-[100%] overflow-y-auto overflow-x-hidden p-5 gap-5 lg:p-10 text-slate-200 flex flex-col chat-container">
                {messages.map( (msg, index) => {

                    const date = new Date(msg.time);
                    const formattedDate = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;

                    return(
                        <li key={index} className={`pb-2 flex items-center gap-3 ${msg.sender == user._id ? "justify-end" : "justify-start"}`}>
                            <div className={`flex flex flex-col items-start`}>
                                <div className={`flex ${msg.sender == user._id ? "hidden" : ""} items-center gap-3`}>
                                    <i className="fa-solid fa-user bg-gray-500 rounded-full px-[10px] py-[5px] text-3xl"></i>
                                    <div className={`flex items-center gap-3`}>
                                        <p className="font-black">{msg.username}</p>
                                    </div>
                                </div>
                                <p className={`relative flex ${msg.sender == user._id ? "justify-end min-w-[70px]" : "min-w-[55px]"} px-4 py-2 my-4 bg-slate-500 rounded-xl break-all`}>
                                    {msg.content}
                                    {msg.sender == user._id && <i className={`fa-solid ${msg.isSeen ? "fa-check-double" : "fa-check"} absolute bottom-[-15px] right-[0px] text-xs`}></i>}
                                    <span className="absolute bottom-[-17px] left-[0px] text-xs text-gray-500">{formattedDate}</span>
                                </p>
                            </div>                    
                        </li>
                    )
                })}
            </ul>
            <div className="w-full p-5 relative">
                <textarea onChange={handleMessageValueChange} value={messageValue} onKeyDown={handleKeyDown} className="h-[50px] w-full rounded p-2 bg-gray-500 text-black font-medium outline-none border-none font-roboto" type="text" placeholder="Message..." ></textarea>
                <i onClick={handleSendMessage} className="fa-solid fa-paper-plane text-black absolute right-[40px] top-[50%] translate-y-[-50%] cursor-pointer md:hover:opacity-50"></i>
            </div>
        </div>

    )
}
