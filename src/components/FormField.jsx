export default function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div className={error ? 'field has-error' : 'field'}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <small className="field-error">{error}</small> : hint && <small className="field-hint">{hint}</small>}
    </div>
  )
}
