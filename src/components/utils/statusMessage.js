import { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../login";

export default function StatusMessage() {

  const [showMsg, setShowMsg] = useState(false)
  const { message } = useContext(GlobalContext)

  // when global message state changs, show message for 1.5secs
  useEffect(() => {

    console.log(message)

    if (message.needsUpdate === true) {
      setShowMsg(true)
      setTimeout(() => {
        setShowMsg(false)
      }, 1500)
    }

  },[message])

  return (
    <div className={
      showMsg === true ? "playlist-update-message show" 
      : "playlist-update-message"}
    >
      <h3>{message.msg}</h3>
      <span className="triangle"></span>
    </div>
  )

}