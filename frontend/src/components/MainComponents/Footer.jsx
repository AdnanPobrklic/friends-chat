export default function Footer({showNotif}){
    return(
        <footer className={`h-[40px] ${showNotif ? "bg-neutral-950" : "bg-zinc-900"} select-none font-roboto font-semibold text-slate-500 p-2 flex items-center justify-center gap-2`}>
            &copy; frichat 2024
        </footer>
    )
}