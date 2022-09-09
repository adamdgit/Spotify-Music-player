import { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../login";

export default function StatusMessage() {

  const [showMsg, setShowMsg] = useState(false)
  const { message } = useContext(GlobalContext)

  // when global message state changs, show message for 1.5secs
  useEffect(() => {

    setShowMsg(true)
    setTimeout(() => {
      setShowMsg(false)
    }, 1500)

  },[message])

  return (
    <div className={
      showMsg === true ? "playlist-update-message show" 
      : "playlist-update-message"}
    >
      <h3>{message}</h3>
      <span className="triangle"></span>
    </div>
  )

}