import { Link } from "react-router-dom"

export default function NotFound(){

    return(
        <div className="w-full h-dvh bg-stone-950 flex flex-col justify-center items-center text-slate-400 gap-5">
            <i className="fa-solid fa-ban text-red-500 text-4xl"></i>
            <p className="text-2xl">Sorry this route does not exist</p>
            <Link className="underline text-2xl hover:opacity-50" >Return to home</Link>
      </div>
    )
}