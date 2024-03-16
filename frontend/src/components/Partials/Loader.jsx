import CircleLoader from "react-spinners/CircleLoader" ;

export default function Loader(){
    return(
        <div className="w-full h-dvh bg-stone-950 flex flex-col gap-5 justify-center items-center">
            <CircleLoader color="rgb(59 130 246)" />
            <p className="mx-[10px] text-slate-500 font-semibold text-center text-xs md:text-sm">Since we are using free hosting, this might take longer</p>
        </div>
    )
}