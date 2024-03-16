import ScaleLoader from "react-spinners/ScaleLoader" ;

export default function InfoMsg({ infoMsg, apiLoader }){
    return(
        <>
            <div className={`z-30 fixed top-16 right-[25px] ${apiLoader ? "" : "hidden"} p-3 rounded-xl font-semibold text-white tracking-wide font-mono`}>
                <ScaleLoader color="#ffffff" />
            </div>
            <div className={`z-30 fixed top-16 right-[25px] ${infoMsg.isErr ? "bg-red-700" : "bg-lime-700"} ${infoMsg.isShown ? "" : "hidden"} p-3 rounded-xl font-semibold text-white tracking-wide font-mono`}>
                {infoMsg.value}
            </div>
        </>
    )
}