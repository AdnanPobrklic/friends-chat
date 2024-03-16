import { useState, useContext } from "react"
import { InfoMsgContext } from "../../pages/HomePage"


export default function AddFriend({showModal, setShowModal, user, setInfoMsg}){

    const [friendValue, setFriendValue] = useState("")

    const handleCloseModal = () => {
        setShowModal(false)
    }

    const handleFriendValueChange = e => [
        setFriendValue(e.target.value)
    ]


    const handleAddFriends = async () => {
        if(!friendValue.trim()) return;
        let hashIndex = friendValue.lastIndexOf("#")
        const fUsername = friendValue.substring(0, hashIndex)
        const fFriTag = friendValue.substring(hashIndex + 1) 
        const payload = {from: user._id, fUsername, fFriTag}
    
        try{
            const res = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/friends/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if(res.status === 200){
                setInfoMsg(prevState => ({
                    value: data.message,
                    isShown: true,
                    isErr: false
                }))
            }else{
                setInfoMsg(prevState => ({
                    value: data.message,
                    isShown: true,
                    isErr: true
                }))
            }
            setFriendValue("")
        }catch(err){
            console.log(err)
            setInfoMsg(prevState => ({
                value: "Something went wrong, please try again later",
                isShown: true,
                isErr: true
            }))
        }
    }

    return (
        <div className={`${showModal ? "block" : "hidden"} relative bg-neutral-900  text-slate-200 text-center flex flex-col justify-center items-center gap-4 pt-10`}>

            <div className="flex justify-center  w-[85%]">
                <input onChange={handleFriendValueChange} value={friendValue} type="text" placeholder="username#12345" className="rounded-l outline-none border-none bg-neutral-950 w-[100%] p-2 text-sm" />
                <button onClick={handleAddFriends} className="text-sm bg-neutral-950 p-2 text-center border-l-2 border-slate-500 rounded-r md:hover:opacity-50">add</button>
            </div>

            <span className="text-[12px] text-center font-mono select-none w-[90%]">
                To add a friend enter his username followed by his chatfri code, like this username#12345 
            </span>

            <span onClick={handleCloseModal} className="absolute top-[0px] right-[15px] text-red-500 text-2xl cursor-pointer md:hover:opacity-50 select-none ">x</span>
        </div>
    )
}