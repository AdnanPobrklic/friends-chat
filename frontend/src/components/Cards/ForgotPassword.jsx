import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import logoLG from "/icon-lg.png"

export default function LogInCard({setInfoMsg, infoMsg, setApiLoader}){

    const [emailValue, setEmailValue] = useState("")

    const handleEmailValueChange = e => {
        setEmailValue(e.target.value)
    }

    const handlePasswordReset = async e => {
        setApiLoader(true)
        e.preventDefault()
    
        try{
            const payload = {email: emailValue}
            const res = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/user/password-reset`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(payload),
                credentials: "include"
            })
    
            console.log(res)
            const data = await res.json()
    
            if(res.status === 200){
                setInfoMsg(prevState => ({
                    value: data.message,
                    isShown: true,
                    isErr: false
                }))
            }else{
                throw new Error()
            }

        }catch(err){
            console.log(err)
            setInfoMsg(prevState => ({
                value: "Something went wrong please try again later",
                isShown: true,
                isErr: true
            }))
        }
    }  

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

    return(
        <main className="grow flex items-center justify-center">
            <form className="bg-neutral-900 flex flex-col gap-5 text-slate-300 font-roboto p-8 rounded-xl w-full mx-2 sm:w-[500px] lg:w-[700px]">
                <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-semibold select-none">Reset your password</h2>
                <div className="flex flex-col gap-1">
                    <label className="uppercase tracking-wide text-xs text-gray-400 lg:text-sm" htmlFor="username">email</label>
                    <input onChange={handleEmailValueChange} value={emailValue} className="text-slate-100 px-2 py-1 font-roboto rounded border-2 border-black bg-stone-950" type="text" name="username" id="username" />
                </div>
                <button onClick={handlePasswordReset} className="bg-blue-500 rounded p-1 md:p-2 md:hover:opacity-70 font-bold tracking-wide text-slate-100">Reset</button>
                <div className="flex justify-between items-center gap-2 flex-col sm:flex-row">
                    <Link className="md:hover:opacity-50 text-sm text-blue-500 underline" to="/login">Already have an account ?</Link>
                    <Link className="md:hover:opacity-50 text-sm text-blue-500 underline" to="/sign-up">Dont have an account ?</Link>
                </div>
            </form>
        </main>
    )
}
