import {
  faArrowCircleLeft,
  faCheckCircle,
  faFileImage,
  faKey
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Fragment, useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { toast } from "react-toastify"
import FileUploader from "../../layouts/FileUploader"
import { StoreConnector, StoreProps } from "../../redux/actions"

const API_URL = process.env.REACT_APP_API_URL

function MyAccount(props: StoreProps) {
  const { token } = props
  const history = useHistory()

  const [userData, setUserData] = useState({
    fullname: '',
    email: '',
    photo: 'https://via.placeholder.com/200x200?text=Sample Photo',
    meta: {
      address: ''
    }
  })

  const [updatePassword, setUpdatePassword] = useState(false)
  
  const [newPassword, setNewPassword] = useState({
    value: '',
    verify: ''
  })

  const [uploadedPhoto, setUPloadedPhoto] = useState<File>()
  const [uploadPhotoVisible, setUploadPhotoVisibility] = useState(false)

  const submitProfile = () => {
    const formData = new FormData()
    const urlencodedData = new URLSearchParams()
    const form = uploadedPhoto !== undefined ? formData : urlencodedData

    form.append('fullname', userData.fullname)
    form.append('address', userData.meta.address)
    
    if (newPassword.value.length > 4) {
      form.append('password', newPassword.value)
    }

    if (uploadedPhoto !== undefined) {
      form.append('photo', uploadedPhoto)
    }

    const fetchInitOpt = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    }

    fetch(`${API_URL}/me`, fetchInitOpt)
      .then(result => result.json())
      .then(response => {
        if (response.success) {
          toast('Data berhasil disimpan!', {type: 'success'})
        } else {
          toast('Data gagal disimpan!', {type: 'error'})
        }
      })
  }

  useEffect(() => {
    if (token) {
      const fetchInitOpt = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }

      fetch(`${API_URL}/me`, fetchInitOpt)
        .then(result => result.json())
        .then(response => {
          const { success, message } = response

          if (success) {
            setUserData({
              ...message.user,
              photo: API_URL + message.user.photo
            })
          }
        })
    }
  }, [token])

  useEffect(() => {
    if (uploadedPhoto === undefined) {
      return
    }

    const reader = new FileReader()
    
    reader.onload = ev => {
      if (!ev.target?.result) {
        return
      }

      setUserData({
        ...userData,
        photo: ev.target.result.toString()
      })
    }

    reader.readAsDataURL(uploadedPhoto)
  }, [uploadedPhoto, userData])

  return (
    <Fragment>
      <div className="mt-3">
        <div className="columns is-centered is-desktop">
          <div className="column is-8">
            <div className="box">
              <div className="level">
                <div className="level-left">
                  <div className="level-item">
                    <h4 className="title is-size-4">Akun Saya</h4>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <button className="button is-small" onClick={() => history.goBack()}>
                      <div className="icon is-small is-left">
                        <FontAwesomeIcon icon={faArrowCircleLeft}/>
                      </div>
                      <span>Kembali</span>
                    </button>
                    <button className="button is-small ml-1" onClick={submitProfile}>
                      <div className="icon is-small is-left">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </div>
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="columns is-desktop">
                <div className="column is-4">
                  <figure className="image">
                    <img
                      className="is-rounded"
                      src={userData.photo ?? 'https://via.placeholder.com/200x200?text=Sample Photo'}
                      alt=""
                    />
                  </figure>
                </div>
                <div className="column is-8">
                  <div className="field">
                    <label htmlFor="">Nama Lengkap</label>
                    <div className="control">
                      <input
                        type="text"
                        className="input"
                        autoComplete="off"
                        maxLength={60}
                        required
                        value={userData.fullname}
                        onChange={ev => setUserData({...userData, fullname: ev.target.value})}
                      />
                    </div>
                    <small className="is-size-7 has-text-info">* Maksimal 60 huruf</small>
                  </div>
                  <div className="field">
                    <label htmlFor="">Email</label>
                    <div className="control">
                      <input type="text" className="input" value={userData.email} disabled/>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="">Alamat</label>
                    <div className="control">
                      <textarea
                        style={{
                          height: 120,
                          resize: 'none'
                        }}
                        className="input"
                        autoComplete="off"
                        maxLength={400}
                        value={userData.meta.address}
                        onChange={ev => setUserData({
                          ...userData,
                          meta: {
                            ...userData.meta,
                            address: ev.target.value
                          }
                        })}
                      />
                    </div>
                    <small className="is-size-7 has-text-info">* Maksimal 400 huruf</small>
                  </div>
                  <button className="button is-small" onClick={() => setUploadPhotoVisibility(true)}>
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faFileImage} />
                    </div>
                    <span>Ganti Foto</span>
                  </button>
                  <button className="button is-small ml-1" onClick={() => setUpdatePassword(!updatePassword)}>
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faKey} />
                    </div>
                    <span>Ganti Password</span>
                  </button>
                  {updatePassword && (
                    <Fragment>
                      <hr/>
                      <div className="field">
                        <label htmlFor="">Password Baru</label>
                        <div className="control">
                          <input
                            type="password"
                            className="input"
                            onChange={ev => setNewPassword({
                              ...newPassword,
                              value: ev.target.value
                            })}
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="">Konfirmasi Password Baru</label>
                        <div className="control">
                          <input
                            type="password"
                            className="input"
                            onChange={ev => setNewPassword({
                              ...newPassword,
                              verify: ev.target.value
                            })}
                          />
                        </div>
                      </div>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {uploadPhotoVisible && (
        <FileUploader
          title="Pilih foto"
          acceptedFileType="image/*"
          multiple={false}
          onCloseRequest={() => setUploadPhotoVisibility(false)}
          onAcceptFiles={file => !Array.isArray(file) && setUPloadedPhoto(file)}
        />
      )}
    </Fragment>
  )
}

export default StoreConnector(MyAccount)