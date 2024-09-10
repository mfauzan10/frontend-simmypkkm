import { useEffect, useState } from "react"

export interface SuperAdminProps {
  onCloseRequest: () => void
  onPinChanged: (pin: string) => void
  visible: boolean
}

function SuperAdminPinForm(props: SuperAdminProps) {
  const { onCloseRequest, onPinChanged, visible } = props
  const [pin, setPin] = useState('')

  function hideModal() {
    onCloseRequest()
  }

  useEffect(() => {
    onPinChanged(pin)
  }, [pin])

  return (
    <div className={`modal ${visible ? 'is-active' : null}`}>
      <div className="modal-background" onClick={() => onCloseRequest()}></div>
      <div className="modal-content">
        <div className="box">
          <div className="field has-text-centered">
            <label htmlFor="pin">Masukkan PIN super admin Anda</label>
            <div className="control">
              <input type="password" className="input has-text-centered" id="pin" name="pin" onChange={ev => setPin(ev.target.value)}/>
            </div>
          </div>
          <button className="button is-small is-warning is-fullwidth" onClick={() => hideModal()}>
            Terapkan PIN
          </button>
          <hr/>
          <div className="has-text-centered">
            <span className="is-size-7 has-text-danger">** Lewati langkah ini bila tidak memiliki PIN.</span>
          </div>
        </div>
      </div>
      <button className="modal-close is-large" aria-label="close" onClick={() => hideModal()}></button>
    </div>
  )
}

export default SuperAdminPinForm