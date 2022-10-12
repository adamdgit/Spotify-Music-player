import { useContext, useState } from "react"
import { GlobalContext } from "./login";
import { getDevices } from "../api/getDevices"
import { transferPlayback } from "../api/transferPlayback";

export default function PlaybackDevices() {

  const { token } = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)

  const [devices, setDevices] = useState([])
  const [devicesAreHidden, setDevicesAreHidden] = useState(true)
  const [isLoading, setLoading] = useState(false)

  const transferDevice = async (deviceID) => {
    try {
      setLoading(true)
      const { errorMsg } = await transferPlayback(token, deviceID)
      if (errorMsg === false) setMessage({msg: 'Playback transferred', needsUpdate: true})
      else throw errorMsg
    }
    catch(err) { console.error(err) }
    finally { setLoading(false) }
  }

  const getAvailableDevices = async () => {
    try {
      setLoading(true)
      setDevices([])
      const {errorMsg, devices} = await getDevices(token)
      if (errorMsg === false) setDevices(devices)
      else throw errorMsg
    }
    catch(err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <div className="devices-wrap">
      <button 
        className="devices-btn" 
        onClick={() => {
          setDevicesAreHidden(!devicesAreHidden)
          getAvailableDevices()
          }
        }>
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" fill="currentColor" viewBox="0 0 576 512"><path d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64H240l-10.7 32H160c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H346.7L336 416H512c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM512 64V352H64V64H512z"/></svg>
      </button>
      <ul style={devicesAreHidden === true ? {display: 'none'} : {display: 'grid'}}
        className="device-list">
        <div style={{fontWeight: 'bold', fontSize: '1.2rem', margin: '.7rem 0'}}>Transfer playback</div>
        <div className="triangle"></div>
        {isLoading === true ? <p>Loading devices..</p> : <></>}
        {
          devices?
          devices.map(device => {
            return <li 
              key={device.id} 
              style={device.is_active === true ? {color: '#23ff73'} : {} }
              onClick={() => transferDevice(device.id)}>
              {device.name}
            </li>
          })
          : <></>
        }
      </ul>
    </div>
  )

}