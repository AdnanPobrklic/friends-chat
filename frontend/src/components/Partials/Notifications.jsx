import { useState, useContext, useEffect } from "react"
import { UserContext } from "../Auth/ProtectedRoute"

export default function Notifications({socket}){

    const [showNotif, setShowNotif] = useState(false)
    const {user, setUser}  = useContext(UserContext)
    const [notifications, setNotifications] = useState(user.notifications);

    const handleShowNotif = () => {
        setShowNotif(prevState => !prevState)
    }

    useEffect(() => {
        if (socket) {
            socket.off("notification");
    
            socket.on("notification", data => {
                setNotifications(prevState => [...prevState, data])
            });
        }
    }, [socket]);

    const handleSubmit = async e => {
        e.preventDefault();
        const uId2 = e.nativeEvent.submitter.value;
        const accepted = e.nativeEvent.submitter.name === "1" ? 1 : 0
    
        const updatedNotifications = notifications.filter(notification => notification.from._id != uId2);
        setNotifications(updatedNotifications); 
    
        try{
            const res = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/friends/accept-request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({uId1: user._id, uId2, accepted}),
                credentials: "include"
            })
    
            if(res.status != 200) throw new Error()
            
        }catch(err){
            console.log(err)
            alert("Something went wrong")
            // Ako se dogodi greška, vratite originalno stanje
            setNotifications(notifications);
        }
    };
    

    return(
        <>
            <span className="relative">
                <span className="px-1 font-bold text-xs rounded-full bg-blue-500 text-white absolute top-[-5px] right-[-15px]">{notifications.length}</span>
                <i onClick={handleShowNotif} className="fa-solid fa-bell text-blue-500 text-xl md:hover:opacity-50 cursor-pointer"></i>
            </span>
            <ul className={`${showNotif ? "absolute block" : "hidden"} z-20 right-[10px] top-[60px] max-h-[150px] overflow-auto rounded bg-neutral-950 flex flex-col gap-2`}>
                {notifications.length === 0 ?
                    <span className="p-4 text-slate-300">Nothing new here !</span>
                    :
                    notifications.map((notification, index) => (
                        <li className="flex flex-col border-b-2 border-slate-50 p-4" key={index}>
                            <div className="flex gap-3">
                                <span>{notification.from.username} sent you friend request</span>
                                <form onSubmit={handleSubmit} className="flex gap-3">
                                    <button type="submit" value={notification.from._id} name="1"><i className="fa-solid fa-check text-green-500 md:hover:opacity-50"></i></button>
                                    <button type="submit" value={notification.from._id} name="0"><i className="fa-solid fa-close text-red-500 md:hover:opacity-50"></i></button>
                                </form>
                            </div>
                            <span className="text-center text-xs">{new Date(notification.time).toLocaleTimeString()}</span>
                        </li> 
                    ))
                }
            </ul>
        </>
    )
}