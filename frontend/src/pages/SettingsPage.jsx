import Sidebar from "../components/HomeComponents/Sidebar";
import Footer from "../components/MainComponents/Footer";
import Header from "../components/MainComponents/Header";
import { UserContext } from "../components/Auth/ProtectedRoute";
import { createContext, useState, useEffect, useContext } from "react";
import InfoMsg from "../components/Partials/InfoMessage";
import { Link } from "react-router-dom";
import io from "socket.io-client"

export default function SettingsPage() {

    const [infoMsg, setInfoMsg] = useState({ value: "", isErr: false, isShown: false });
    const {user, setUser}  = useContext(UserContext);

    const [emailValue, setEmailValue] = useState(user.email);
    const [usernameValue, setUsernameValue] = useState(user.username);
    const [friCodeValue, setFriCodeValue] = useState(user.friCode);
    const [passwordValue, setPasswordValue] = useState(""); 
    const [confirmPasswordValue, setConfirmPasswordValue] = useState(""); 
    const [payload, setPayload] = useState({id: user._id})
    const [changeMade, setChangeMade] = useState(false)
    const [socket, setSocket] = useState(null) 

    useEffect(() => {
        const newSocket = io.connect(import.meta.env.VITE_BACKEND_DOMAIN);
        setSocket(newSocket) 

        newSocket.emit('onlineSetter', {id: user._id, friends: user.friends})
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

    const handleEmailChange = (e) => {
        setEmailValue(e.target.value);
    };

    const handleUsernameChange = (e) => {
        setUsernameValue(e.target.value);
    };

    const handleFriCodeChange = (e) => {
        setFriCodeValue(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPasswordValue(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPasswordValue(e.target.value);
    };

    useEffect(() => {

        if(emailValue != user.email || usernameValue != user.username || friCodeValue != user.friCode || passwordValue.trim() != "") setChangeMade(true)
        if(emailValue != user.email) setPayload(prevState => ({...prevState, email:emailValue}))
        if(usernameValue != user.username) setPayload(prevState => ({...prevState, username:usernameValue}))
        if(friCodeValue != user.friCode) setPayload(prevState => ({...prevState, friCode:friCodeValue}))
        if(passwordValue) setPayload(prevState => ({...prevState, password:passwordValue}))

    }, [emailValue, usernameValue, friCodeValue, passwordValue])

    const updateInfo = async e => {

        if(passwordValue.trim() != ""){

            if(passwordValue.length < 8){
                setInfoMsg((prevState) => ({
                    value: "Passwords must be longer than 7 characters",
                    isShown: true,
                    isErr: true
                }));
                return
            }

            if(passwordValue != confirmPasswordValue){
                setInfoMsg((prevState) => ({
                    value: "Passwords must match",
                    isShown: true,
                    isErr: true
                }));
                return
            }
            
        }

        if(friCodeValue.length != 4){
            setInfoMsg((prevState) => ({
                value: "friCode must be 4 characters",
                isShown: true,
                isErr: true
            }));
            return
        }

        try{
            const res = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/user/patch-settings`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                credentials: "include"
            })

            if(res.status === 200){
                setInfoMsg((prevState) => ({
                    value: "Info updated",
                    isShown: true,
                    isErr: false
                }));
            }else{
                throw new Error()
            }

        }catch(err){
            setInfoMsg((prevState) => ({
                value: "Something went wrong please try again later",
                isShown: true,
                isErr: true
            }));
        }

    }

    useEffect(() => {
        if (!infoMsg.isShown) return;

        setTimeout(() => {
            setInfoMsg((prevState) => ({
                ...prevState,
                isShown: false,
            }));
        }, 2000);
    }, [infoMsg.isShown]);

    useEffect(() => {
        if (!infoMsg.isShown) return;
    }, [infoMsg.isShown]);

    return (
        <div className="h-dvh flex flex-col">
            < InfoMsg infoMsg={infoMsg}/>
            <Header showNotif={true}/>
            <main className="grow bg-neutral-900">
                <h1 className="text-slate-400 font-black font-roboto text-3xl w-[80%] mx-auto my-5">Account settings</h1>
                <div className="font-mono w-[80%] min-w-[300px] mx-auto bg-neutral-950 h-[70%] flex rounded-xl">
                    <div className="w-[90%] text-slate-100 mt-[25px] px-10 flex flex-col gap-5 items-center lg:items-start">
                        <div className="w-[70%] min-w-[250px] flex flex-col">
                            <label htmlFor="email" className="uppercase">email</label>
                            <input type="email" id="email" name="email" value={emailValue} className="rounded text-white font-black px-2 py-1 bg-neutral-800" onChange={handleEmailChange} />
                        </div>
                        <div className="w-[70%] min-w-[250px] flex flex-col">
                            <label htmlFor="username" className="uppercase">username</label>
                            <input type="text" id="username" name="username" value={usernameValue} className="rounded text-white bg-neutral-800  font-black px-2 py-1" onChange={handleUsernameChange} />
                        </div>
                        <div className="w-[70%] min-w-[250px] flex flex-col">
                            <label htmlFor="friCode" className="uppercase">friCode</label>
                            <div className="flex">
                                <span className="px-2 py-1 bg-neutral-800 rounded-l text-white font-bold border-r-2 border-black">#</span>
                                <input type="text" id="friCode" name="friCode" value={friCodeValue} className="text-white font-black px-2 py-1 rounded-r bg-neutral-800" onChange={handleFriCodeChange} />
                            </div>
                        </div>
                        <div className="w-[70%] min-w-[250px] flex flex-col">
                            <label htmlFor="password" className="uppercase">password</label>
                            <input type="password" id="password" name="password" value={passwordValue} className="rounded text-white bg-neutral-800 font-black px-2 py-1" onChange={handlePasswordChange} />
                        </div>
                        <div className="w-[70%] min-w-[250px] flex flex-col">
                            <label htmlFor="confirmPassword" className="uppercase">confirm password</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPasswordValue} className="rounded text-white bg-neutral-800  font-black px-2 py-1" onChange={handleConfirmPasswordChange} />
                        </div>
                        <div className="flex flex-col lg:flex-row w-[70%] min-w-[250px] gap-2">
                            <Link to="/" className="bg-blue-700 p-2 text-center uppercase rounded md:hover:opacity-50 font-black">Home</Link >
                            <button onClick={changeMade ? updateInfo : null} className={`${changeMade ? "bg-green-700" : "bg-neutral-800"} p-2 uppercase rounded md:hover:opacity-50 font-black`}>Save changes</button>
                        </div>
                    </div>
                    <div className="w-[30%] min-w-[300px] hidden lg:flex justify-center items-center bg-blue-600 rounded-xl">
                        <i className="bg-white text-neutral-950 fa-solid fa-user text-8xl p-8 rounded-full"></i>
                    </div>
                </div>
            </main>
            <Footer showNotif={true}/>
        </div>
    );
}
