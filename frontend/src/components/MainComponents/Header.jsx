import logo from "/chatfri-logo.png"
import Notifications from "../Partials/Notifications"

export default function Header({ showNotif, socket, showToggle, setShowSidebar }){

    const handleSidebarAction = () => {
        setShowSidebar(prevState => !prevState)
    }

    return(
        <header className={`h-[60px] relative ${showNotif ? "bg-neutral-950" : "bg-zinc-900"} select-none font-roboto font-semibold text-slate-500 py-5 flex items-center px-12`}>
            {showToggle && <i onClick={handleSidebarAction} className="fa-solid fa-bars text-xl md:hover:opacity-50 cursor-pointer"></i>}
            <div className="flex items-center gap-2 mx-auto">
                <img src={logo} alt="chatfri logo"/>
                <span className="text-blue-400 text-2xl tracking-wider">ChatFri</span>
            </div>
            {showNotif && < Notifications socket={socket}/>}
        </header>
    )
}

