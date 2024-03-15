import Footer from "../components/MainComponents/Footer";
import Header from "../components/MainComponents/Header";
import LogInCard from "../components/Cards/LogInCard";
import { useState } from "react";
import InfoMsg from "../components/Partials/InfoMessage";

export default function LogInPage(){

    const [infoMsg, setInfoMsg] = useState({value: "", isErr: false, isShown: false})
    const [apiLoader, setApiLoader] = useState(false)

    return(
        <div className="h-dvh flex flex-col bg-neutral-950">
            < Header showNotif={false} />
            < InfoMsg infoMsg={infoMsg} apiLoader={apiLoader}/>
            < LogInCard setInfoMsg={setInfoMsg} infoMsg={infoMsg} setApiLoader={setApiLoader}/>
            < Footer showNotif={false} />
        </div>
    )
}