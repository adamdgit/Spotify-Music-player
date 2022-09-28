import { useEffect, useState } from "react"
import { convertTime } from "./utils/convertTime"

export default function Timeline({ ...props }) {

  const timelineSeek = (e) => {
    const rect = e.target.getBoundingClientRect()
    const percent = Math.min(Math.max(0, e.pageX - rect.x), rect.width) / rect.width
    // seek requires value in milliseconds
    props.player.seek(props.songLength * percent).then(() => {
      console.log('Changed position!');
    });
  }

  useEffect(() => {

    if (props.is_paused === false) {
      if (props.loading === true) props.setPos(0)
      const timelineUpdate = setInterval(() => {
        props.setPos(value => value +=1000)
      }, 1000)
      return () => clearInterval(timelineUpdate)
    }

  }, [props.is_paused])

  return (
    <div className="timeline-seek">
      <span>{convertTime(props.currentTrackPos)}</span>
        <span className="timeline" onClick={(e) => timelineSeek(e)}>
          <span className="timeline-thumb" style={{'--progress': `-${100 - (props.currentTrackPos / props.songLength * 100)}%`}}>
            <span className="thumb-indicator"></span>
          </span>
        </span>
      <span>{convertTime(props.songLength)}</span>
    </div>
  )
}