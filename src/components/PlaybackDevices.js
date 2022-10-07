import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "./login";
import { getDevices } from "./api/getDevices"
import { transferPlayback } from "./api/transferPlayback";

export default function PlaybackDevices({currentDeviceID}) {

  const { token } = useContext(GlobalContext)
  const [devices, setDevices] = useState([])
  const [devicesAreHidden, setDevicesAreHidden] = useState(true)

  const transferDevice = (deviceID) => {
    transferPlayback(token, deviceID)
    .then(result => {
      if (result === false) console.log('playback transfered')
      else console.error(result)
    })
  }

  return (
    <div className="devices-wrap">
      <button 
        className="devices-btn" 
        onClick={() => {
          setDevicesAreHidden(!devicesAreHidden)
          if (devicesAreHidden === false) return
          getDevices(token)
            .then(result => {
              if (result.errorMsg === false) setDevices(result.devices)
              else console.error(result.errorMsg)
            })
          }
        }>
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" fill="currentColor" viewBox="0 0 576 512"><path d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64H240l-10.7 32H160c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H346.7L336 416H512c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM512 64V352H64V64H512z"/></svg>
      </button>
      <ul style={devicesAreHidden === true ? {display: 'none'} : {display: 'grid'}}
        className="device-list">
        <div style={{fontWeight: 'bold', fontSize: '1.2rem', margin: '.7rem 0'}}>Transfer playback</div>
        <div className="triangle"></div>
        {
          devices?
          devices.map(device => {
            if (currentDeviceID === device.id) {
              return (
              <span>
                Current device:
                <li 
                  key={device.id} 
                  style={currentDeviceID === device.id ? {color: '#23ff73'} : {} }
                  onClick={() => transferDevice(device.id)}>
                    {device.name}
                </li>
              </span>
              )
            }
            return <li 
            key={device.id} 
            style={currentDeviceID === device.id ? {color: '#23ff73'} : {} }
            onClick={() => transferDevice(device.id)}>{device.name}</li>
          })
          : <></>
        }
      </ul>
    </div>
  )

}