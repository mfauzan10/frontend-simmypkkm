import { faArrowCircleLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import SuperAdminPinForm from "../../layouts/SuperAdminPinForm"
import { StoreConnector, StoreProps } from "../../redux/actions"

const API_URL = process.env.REACT_APP_API_URL

interface AdministratorInterface {
  id?: string
  fullname: string
  email: string
  password: string
  status: string
}

function AdministratorForm(props: StoreProps) {
  const { token } = props
  const { id } = useParams<{id?: string}>()
  const history = useHistory()
  const [administratorData, setAdministratorData] = useState<AdministratorInterface>({
    fullname: '',
    email: '',
    password: '',
    status: 'active'
  })
  const [pin, setPin] = useState<string>('')
  const [pinFormVisible, setPinFormVisibility] = useState<boolean>(true)

  const submitAdministrator = () => {
    const formEl = document.forms[0]
    
    if (formEl.reportValidity()) {
      const form = new URLSearchParams()
      form.append('fullname', administratorData.fullname)
      form.append('email', administratorData.email)
      form.append('password', administratorData.password)
      form.append('status', administratorData.status)
      form.append('pin', pin)

      let url = `${API_URL}/admin/administrator`

      if (id) {
        url = `${url}/${id}`
      }

      fetch(url, {method: 'POST', headers: {'Authorization': `Bearer ${token}`}, body: form})
        .then(result => result.json())
        .then(response => {
          if (response.success) {
            history.goBack()
          } else {
            toast(response.message)
          }
        })
    }
  }

  useEffect(() => {
    if (token && id) {
      fetch(`${API_URL}/admin/administrator/${id}`, {headers: {'Authorization': `Bearer ${token}`}})
        .then(result => result.json())
        .then(response => {
          if (response.success) {
            setAdministratorData({...response.message.administrator, password: ''})
          }
        })
    }
  }, [token, id])

  return (
    <div className="mt-3">
      <div className="columns is-centered">
        <div className="column is-6-widescreen">
          <div className="box">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h4 className="title is-size-4">Form Administrator</h4>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <button className="button is-small mx-1" onClick={submitAdministrator}>
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <span>Simpan</span>
                  </button>
                  <button className="button is-small mx-1" onClick={() => history.goBack()}>
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faArrowCircleLeft} />
                    </div>
                    <span>Kembali</span>
                  </button>
                </div>
              </div>
            </div>
           <form action="" name="administrator-form">
              <div className="field">
                <label htmlFor="fullname">Nama Lengkap</label>
                <div className="control">
                  <input type="text" className="input" id="fullname" name="fullname" required value={administratorData?.fullname} onChange={ev => setAdministratorData({...administratorData, fullname: ev.target.value})}/>
                </div>
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <div className="control">
                  <input type="text" className="input" id="email" name="email" required value={administratorData?.email} onChange={ev => setAdministratorData({...administratorData, email: ev.target.value})}/>
                </div>
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="control">
                  <input type="password" className="input" id="password" name="password" minLength={4} onChange={ev => setAdministratorData({...administratorData, password: ev.target.value})}/>
                </div>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <div className="control">
                  <select name="status" id="status" className="input" value={administratorData?.status} onChange={ev => setAdministratorData({...administratorData, status: ev.target.value})}>
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak aktif</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <SuperAdminPinForm
        visible={pinFormVisible}
        onCloseRequest={() => setPinFormVisibility(false)}
        onPinChanged={val => setPin(val)}
      />
    </div>
  )
}

export default StoreConnector(AdministratorForm)