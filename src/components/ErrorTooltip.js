export default function ErrorTooltip({ tip, error }) {

  return (
    <span className="error-tooltip" style={error === true ? {opacity: '1', top: '-55px'} : {}}>
      {tip}
    </span>
  )

}
