import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function SignUpCard({setInfoMsg, infoMsg, setApiLoader}){

    const [revealPwd, setRevealPwd] = useState(false)
    const [revealConPwd, setRevealConPwd] = useState(false)
    const [revealSlash, setRevealSlash] = useState(true)
    const [revealSlash2, setRevealSlash2] = useState(true)
    const [emailValue, setEmailValue] = useState("")
    const [usernameValue, setUsernameValue] = useState("")
    const [passwordValue, setPasswordValue] = useState("")
    const [confrimPasswordValue, setConfrimPasswordValue] = useState("")

    const handleRevealPwd = () => {
        setRevealPwd(prevState => !prevState);
        setRevealSlash(prevState => !prevState);
    }

    const handleRevealConPwd = () => {
        setRevealConPwd(prevState => !prevState);
        setRevealSlash2(prevState => !prevState);
    }

    const handleEmailChange = e => {
        setEmailValue(e.target.value)
    }
    
    const handleUsernameChange = e => {
        setUsernameValue(e.target.value)
    }

    const handlePasswordChange = e => {
        setPasswordValue(e.target.value)
    }

    const handleConfirmPasswordChange = e => {
        setConfrimPasswordValue(e.target.value)
    }

    const handleSignUp = async e => {
        
        e.preventDefault()
        setApiLoader(true)

        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
        if (!emailRegex.test(emailValue)) {
            setInfoMsg(prevState => ({
                value: "Please enter a valid email address",
                isShown: true,
                isErr: true
            }))
            return
        }

        if(passwordValue != confrimPasswordValue){
            setInfoMsg(prevState => ({
                value: "Passwords must match",
                isShown: true,
                isErr: true
            }))
            return
        }

        try{
            const payload = {email: emailValue, username: usernameValue ,password: passwordValue}
            const res = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/sign-up`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            const data = await res.json()
            setInfoMsg(prevState => ({
                value: data.message,
                isShown: true,
                isErr: res.status === 200 ? false : true
            }))

            if(res.status === 200){
                setEmailValue("")
                setUsernameValue("")
                setPasswordValue("")
                setConfrimPasswordValue("")
            }

        }catch(err){
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
                <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-semibold select-none">Create an account</h2>
                <div className="relative flex flex-col gap-1">
                    <label className="uppercase tracking-wide text-xs text-gray-500 lg:text-sm" htmlFor="email">email</label>
                    <input required className="text-slate-100 px-2 py-1 font-roboto rounded border lg:text-[17px] border-black bg-stone-950" type="email" name="email" id="email" onChange={handleEmailChange} value={emailValue}/>
                </div>
                <div className="relative flex flex-col gap-1">
                    <label className="uppercase tracking-wide text-xs text-gray-500 lg:text-sm" htmlFor="username">username</label>
                    <input required className="text-slate-100 px-2 py-1 font-roboto rounded border lg:text-[17px] border-black bg-stone-950" type="text" name="username" id="username" onChange={handleUsernameChange} value={usernameValue}/>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="uppercase tracking-wide text-xs text-gray-400 lg:text-sm" htmlFor="password">password</label>
                    <div className="w-full relative">
                        <input required className="text-slate-100 w-full px-2 py-1 font-roboto rounded border lg:text-[17px] border-black bg-stone-950" type={revealPwd ? "text" : "password"} name="password" id="password"  onChange={handlePasswordChange} value={passwordValue}/>
                        <i onClick={handleRevealPwd} className={`absolute fa-solid ${revealSlash ? "fa-eye-slash" : "fa-eye"} right-2 translate-y-1/2 text-slate-500 md:hover:opacity-50 cursor-pointer`}></i>
                    </div>            
                </div>
                <div className="flex flex-col gap-1">
                    <label className="uppercase tracking-wide text-xs text-gray-400 lg:text-sm" htmlFor="confirmPassword">confirm password</label>
                    <div className="w-full relative">
                        <input required className="text-slate-100 w-full px-2 py-1 font-roboto rounded border lg:text-[17px] border-black bg-stone-950" type={revealConPwd ? "text" : "password"} name="confirmPassword" id="confirmPassword" onChange={handleConfirmPasswordChange} value={confrimPasswordValue}/>
                        <i onClick={handleRevealConPwd} className={`absolute fa-solid ${revealSlash2 ? "fa-eye-slash" : "fa-eye"} right-2 translate-y-1/2 text-slate-500 md:hover:opacity-50 cursor-pointer`}></i>                
                    </div>
                </div>
                <button onClick={handleSignUp} className="bg-blue-500 rounded p-1 md:p-2 md:hover:opacity-70 font-bold tracking-wide text-slate-100">Continue</button>
                <Link className="md:hover:opacity-50 text-sm text-blue-500 underline" to="/login">Already have an account ?</Link>
            </form>
        </main>
    )
}

