import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState, useMemo } from "react";
import AddFriend from "./AddFriend";
import { UserContext } from "../Auth/ProtectedRoute";
import { NavLink , Link} from "react-router-dom";

export default function Sidebar({ setInfoMsg, infoMsg, socket, setMessages, showSidebar }) {

    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [friends, setFriends] = useState(user.friends || []);
    const [searchQuery, setSearchQuery] = useState("");

    const handleShowModal = () => {
        setShowModal(true);
    };

    const handleShowFOptions = e => {
        e.target.nextElementSibling.classList.toggle("hidden")
    };

    useEffect(() => {
        setFriends(user.friends || []);
    }, [user.friends]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/chat/get-unread`, {
                    credentials: "include"
                });

                if (res.status !== 200 && res.status !== 404) throw new Error();
                if (res.status === 200) {
                    const data = await res.json();
                    setFriends((prevFriends) => {
                        let tempFriends = [...prevFriends];
                        data.messagesUnread.forEach((msg) => {
                            let index = tempFriends.findIndex((friend) => friend._id === msg);
                            if (index !== -1 && tempFriends[index]._id !== getReceiverId()) tempFriends[index].unreadMessage = 1;
                        });

                        return tempFriends;
                    });
                }
            } catch (err) {
                console.log(err);
                setInfoMsg((prevState) => ({
                    value: "Something went wrong while fetching your unread messages",
                    isShown: true,
                    isErr: true,
                }));
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        if (socket) {
            const handleFriendDC = (data) => {
                setFriends((prevFriends) => {
                    let tempFriends = [...prevFriends];
                    tempFriends.forEach((friend) => {
                        if (friend._id === data.id) {
                            friend.isOnline = 0;
                            return;
                        }
                    });
                    return tempFriends;
                });
            };

            const handleFriendCN = (data) => {
                setFriends((prevFriends) => {
                    let tempFriends = [...prevFriends];
                    tempFriends.forEach((friend) => {
                        if (friend._id === data.id) {
                            friend.isOnline = 1;
                            return;
                        }
                    });
                    return tempFriends;
                });
            };
            
            socket.on("friendDC", handleFriendDC);
            socket.on("friendCN", handleFriendCN);

            return () => {
                socket.off("friendDC", handleFriendDC);
                socket.off("friendCN", handleFriendCN);
            };
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.off("messageNotification");

            socket.on("messageNotification", (data) => {
                const friendIndex = friends.findIndex((obj) => obj._id === data.id);

                if (friendIndex !== -1) {
                    const updatedFriends = [...friends];
                    updatedFriends[friendIndex] = { ...updatedFriends[friendIndex], unreadMessage: 1 };
                    setFriends(updatedFriends);
                }
            });
        }
    }, [socket, friends]);

    useEffect(() => {
        if (socket) {
            socket.off("friendsUpdate");

            socket.on("friendsUpdate", (data) => {
                console.log(data)
                setFriends(data.friends);
                setUser((prevState) => ({ ...prevState, friends: data.friends }));
            });
        }
    }, [socket]);

    const handleLogOut = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/log-out`, {
                method: "POST",
                credentials: "include",
            });

            if (res.status === 200) {
                navigate(0);
            } else {
                throw new Error();
            }
        } catch (err) {
            console.log(err);
            setInfoMsg((prevState) => ({
                value: "Something went wrong, please try again later",
                isShown: true,
                isErr: true,
            }));
        }
    };

    const copyLinkToClipboard = (e) => {
        e.target.classList.remove("fa-copy");
        e.target.classList.add("fa-check");
        setTimeout(() => {
            e.target.classList.add("fa-copy");
            e.target.classList.remove("fa-check");
        }, 500);
        const copyText = `${user.username}#${user.friCode}`;
        navigator.clipboard.writeText(copyText);
    };

    const handleDeleteFriend = async (e) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/friends/delete-friend`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uId1: e.target.value, uId2: user._id }),
            });

            if (res.status === 200) {
                if(getReceiverId() === e.target.value) navigate(0)
                setInfoMsg((prevState) => ({
                    value: "Friend deleted",
                    isShown: true,
                    isErr: false,
                }));

                setFriends((prevFriends) => prevFriends.filter((friend) => friend._id !== e.target.value));
            } else {
                throw new Error();
            }
        } catch (err) {
            console.log(err);
            setInfoMsg((prevState) => ({
                value: "Something went wrong, please try again later",
                isShown: true,
                isErr: true,
            }));
        }
    };

    const handleClearChat = async (e) => {
        console.log(e.target.value)
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/chat/clear-chat?id1=${user._id}&id2=${e.target.value}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ byUser: user._id })
            });

            if (res.status === 200) {
                if(setMessages) setMessages([])
                setInfoMsg((prevState) => ({
                    value: "Messages cleared",
                    isShown: true,
                    isErr: false,
                }));
            } else {
                throw new Error();
            }
        } catch (err) {
            console.log(err);
            setInfoMsg((prevState) => ({
                value: "Something went wrong, please try again later",
                isShown: true,
                isErr: true,
            }));
        }
    };

    const getRoomName = (id1, id2) => {
        let arr = [id1, id2];
        arr = arr.sort();
        return `${arr[0]}-${arr[1]}`;
    };

    const getReceiverId = () => {
        const id1 = window.location.href.substring(window.location.href.lastIndexOf("/chat") + 6, window.location.href.lastIndexOf("-"))
        const id2 = window.location.href.substring(window.location.href.lastIndexOf("-") + 1)

        if (id1 !== user._id) {
            return id1
        } else {
            return id2
        }
    }

    const filteredFriends = useMemo(() => {
        if(searchQuery.trim() === "") return friends
        return friends.filter((friend) => {
            const fullName = `${friend.username.toLowerCase()}#${friend.friCode.toLowerCase()}`;
            return fullName.includes(searchQuery.toLowerCase());
        });
    }, [friends, searchQuery]);

    return (
        <div className={`z-10 fixed flex flex-col bg-neutral-950 w-[300px] h-[calc(100%-100px)] overflow-x-auto ${showSidebar ? "block" : "hidden"}`}>
            <div className="w-full h-[75px] flex justify-center items-center mb-1">
                {friends.length > 0 && (
                    <input
                        className="w-[80%] rounded px-2 py-1 bg-neutral-900 text-slate-200 outline-none border-none font-mono"
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                )}
            </div>

            <ul className={`text-slate-100 w-full min-w-72 flex flex-col select-none overflow-y-auto grow `}>
                
                {friends.length < 1 && <li className="self-center">No friends made yet</li>}

                {filteredFriends.length === 0 && friends.length > 0  ? (
                    <p className="text-center text-sm pt-[50%]">No matching friends found</p>
                ) : (
                    filteredFriends.map((friend, index) => (
                        <li key={friend._id} className={`flex gap-5 items-center px-2 ${(friend.unreadMessage && friend._id != getReceiverId()) ? "bg-blue-950" : "bg-neutral-950"} hover:bg-zinc-900 transition-all cursor-pointer border-b-4 border-neutral-900`}>
                            <NavLink
                                to={`/chat/${getRoomName(user._id, friend._id)}`}
                                className="grow flex items-center gap-5 p-2 pl-3 text-center"
                            >
                                <div className="relative">
                                    <i className="fa-solid fa-user text-2xl"></i>
                                    <span className={`absolute top-[5px] right-[-15px] ${friend.isOnline === 1 ? "text-lime-500" : "text-gray-500"} text-4xl`}>•</span>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-semibold">{friend.username}</p>
                                    <p className="text-xs font-semibold">#{friend.friCode}</p>
                                </div>
                            </NavLink>
                            {(friend.unreadMessage && friend._id != getReceiverId()) && <p className="font-black text-blue-500">!</p>}
                            <div className="text-gray-200 font-black relative text-end text-[15px]">
                                <i className="fa-solid fa-gear md:hover:opacity-50" onClick={handleShowFOptions}></i>
                                <div className={`z-20 hidden absolute right-[0px] bg-gray-700 rounded flex flex-col`}>
                                    <button
                                        onClick={handleDeleteFriend}
                                        value={friend._id}
                                        className="md:hover:bg-neutral-500 w-full px-10 py-1"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={handleClearChat}
                                        value={friend._id}
                                        className="md:hover:bg-neutral-500 w-full py-1"
                                    >
                                        Clear chat
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))
                )}
            </ul>

            <AddFriend setShowModal={setShowModal} showModal={showModal} user={user} infoMsg={infoMsg} setInfoMsg={setInfoMsg} />

            <div className="h-[75px] mt-auto text-slate-200 flex items-center p-2 justify-between bg-neutral-900 font-roboto user-info-div">
                <div className="flex items-center gap-5 text-center">
                    <i className="fa-solid fa-user text-2xl"></i>
                    <div className="flex flex-col ">
                        <p className="text-[15px] font-semibold">{user.username}</p>
                        <span className="flex gap-2 items-center justify-center">
                            <p className="text-[14px] font-black">#{user.friCode}</p>
                            <i
                                onClick={copyLinkToClipboard}
                                className="fa-solid fa-copy text-[12px] md:hover:opacity-50 cursor-pointer"
                            ></i>
                        </span>
                    </div>
                </div>

                <div className="flex gap-5 items-center">
                    <Link to="/settings">
                        <i className="fa-solid fa-gears text-xl md:hover:opacity-50"></i>
                    </Link>
                    <i onClick={handleShowModal} className="fa-solid fa-user-plus text-base md:hover:opacity-50 cursor-pointer"></i>
                    <i onClick={handleLogOut} className="fa-solid fa-right-from-bracket text-xl text-slate-300 md:hover:opacity-50 cursor-pointer transition-all"></i>
                </div>
            </div>
        </div>
    );
}
