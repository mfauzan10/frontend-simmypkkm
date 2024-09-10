import { faArrowAltCircleLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import APIResponse from "../../interfaces/APIResponse"
import { StoreConnector, StoreProps } from "../../redux/actions"

const API_URL = process.env.REACT_APP_API_URL

export enum DepartmentStatus {
  Active = 'active',
  Inactive = 'inactive'
}

export enum InfrastructureStatus {
  Available = 'available',
  Unavailable = 'unavailable',
  InContract = 'in_contract',
  UnderConstruction = 'under_construction'
}

export interface GeoLocationData {
  address: string
  lat: string
  lng: string
}

export interface DepartmentInterface {
  _id?: string
  title: string
  description: string
  NPSN: string
  NSS: string
  headquarterLocation: GeoLocationData
  logoWide?: string
  logoSquare?: string
  appIcon?: string
  accentColor?: string
  appHost?: string
  website: string
  email: string
  phone: Array<string>
  status: DepartmentStatus
  service: {
    mobileStudent: boolean
    webStudent: boolean
    attendance: boolean
    lesson: boolean
    schedule: boolean
    article: boolean
    library: boolean
    payment: boolean
  }
  storage: number
}

interface DepartmentFormParams {
  id: string
}

function DepartmentForm(props: StoreProps): JSX.Element {
  const { token, urlPrefix } = props
  const { id } = useParams<DepartmentFormParams>()
  const history = useHistory()
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [NPSN, setNPSN] = useState<string>('')
  const [NSS, setNSS] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [lat, setLat] = useState<string>('0')
  const [lng, setLng] = useState<string>('0')
  const [email, setEmail] = useState<string>('')
  const [phone1, setPhone1] = useState<string>('')
  const [phone2, setPhone2] = useState<string>('')
  const [phone3, setPhone3] = useState<string>('')
  const [website, setWebsite] = useState<string>('')
  const [status, setStatus] = useState<string>(DepartmentStatus.Inactive)

  const [appHost, setAppHost] = useState<string>()
  const [logoSquare, setLogoSquare] = useState<string>()
  const [logoWide, setLogoWide] = useState<string>()
  const [appIcon, setAppIcon] = useState<string>()
  const [accentColor, setAccentColor] = useState<string>('#DFDFDF')

  const [submittedLogoSquare, setSubmittedLogoSquare] = useState<File>()
  const [submittedLogoWide, setSubmittedLogoWide] = useState<File>()
  const [submittedAppIcon, setSubmittedAppIcon] = useState<File>()
  
  const submitDepartment = () => {
    const formEl = document.forms[0]
    
    if (!formEl.reportValidity()) {
      return
    }

    const form = submittedLogoSquare || submittedLogoWide || submittedAppIcon ? new FormData() : new URLSearchParams()

    form.append('title', title)
    form.append('description', description)
    form.append('NPSN', NPSN)
    form.append('NSS', NSS)
    form.append('address', address)
    form.append('lat', lat)
    form.append('lng', lng)
    form.append('email', email)
    form.append('phone[]', phone1)
    form.append('phone[]', phone2)
    form.append('phone[]', phone3)
    form.append('website', website)
    form.append('status', status)
    form.append('accentColor', accentColor)
    
    if (appHost) {
      form.append('appHost', appHost)
    }

    if (submittedAppIcon) {
      form.append('icon', submittedAppIcon)
    }

    if (submittedLogoSquare) {
      form.append('logoSquare', submittedLogoSquare)
    }

    if (submittedLogoWide) {
      form.append('logoWide', submittedLogoWide)
    }

    const url = new URL(`${API_URL + urlPrefix}/department`)

    if (id) {
      url.pathname = `${url.pathname}/${id}`
    }

    const fetchInitOpt: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    }

    fetch(url.toString(), fetchInitOpt)
      .then(result => result.json())
      .then((response: APIResponse) => {
        const { success, message } = response

        if (!success) {
          toast(message, {type: 'error'})
          return
        }

        toast('Data berhasil disimpan!', {type: 'success'})
      })
      .catch(() => toast('Kegagalan jaringan!', {type: 'error'}))
  }

  const logoHandler = (ev: ChangeEvent<HTMLInputElement>, callback: Dispatch<SetStateAction<string | undefined>>) => {
    const reader = new FileReader()
    const { files } = ev.target

    reader.onload = (item: ProgressEvent<FileReader>) => {
      if (!item.target) {
        return
      }

      if (typeof item.target.result !== 'string') {
        return
      }

      callback(item.target.result)
    }

    if (files?.length === 1) {
      reader.readAsDataURL(files[0])
    }
  }

  useEffect(() => {
    if (!token || !id) {
      return
    }

    const fetchInitOpt = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/department/${id}`, fetchInitOpt)
      .then(result => result.json())
      .then((response: APIResponse<{department: DepartmentInterface}>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', {type: 'error'})
          return
        }

        const { department } = message

        setTitle(department.title)
        setDescription(department.description)
        setNPSN(department.NPSN)
        setNSS(department.NSS)
        setAddress(department.headquarterLocation.address)
        setLat(department.headquarterLocation.lat)
        setLng(department.headquarterLocation.lng)
        setEmail(department.email)
        setPhone1(department.phone[0])
        setPhone2(department.phone[1])
        setPhone3(department.phone[2])
        setWebsite(department.website)
        setStatus(department.status)
        setAppHost(department.appHost)
        setAccentColor(department.accentColor ?? '#DFDFDF')

        if (department.logoWide) {
          setLogoWide(API_URL + department.logoWide)
        }

        if (department.logoSquare) {
          setLogoSquare(API_URL + department.logoSquare)
        }

        if (department.appIcon) {
          setAppIcon(API_URL + department.appIcon)
        }
      })
      .catch(() => toast('Kesalahan jaringan!', {type: 'error'}))
  }, [token, id, urlPrefix])
  
  return (
    <div className="mt-3">
      <div className="columns is-centered">
        <div className="column is-6-widescreen">
          <div className="box">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h4 className="title is-size-4">Form Instansi</h4>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <button className="button is-small mx-1" onClick={submitDepartment}>
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <span>Simpan</span>
                  </button>
                  <button className="button is-small mx-1" onClick={() => history.goBack()}>
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faArrowAltCircleLeft} />
                    </div>
                    <span>Kembali</span>
                  </button>
                </div>
              </div>
            </div>
            <form action="" name="department-form">
              <div className="field">
                <label htmlFor="title">Nama Instansi</label>
                <div className="control">
                  <input
                    type="text"
                    id="title"
                    className="input"
                    name="title"
                    required
                    value={title}
                    onChange={ev => setTitle(ev.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="description">Deskripsi</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    id="description"
                    name="description"
                    value={description}
                    onChange={ev => setDescription(ev.target.value)}
                  />
                </div>
              </div>
              <div className="columns is-multiline">
                <div className="column is-4">
                  <div className="field">
                    <label htmlFor="logoSquare">Logo Square</label>
                    <div className="control">
                      <input
                        type="file"
                        name="logoSquare"
                        id="logoSquare"
                        className="input"
                        accept="image/*"
                        onChange={ev => {
                          logoHandler(ev, setLogoSquare)
                          const file = ev.target.files

                          if (file) {
                            setSubmittedLogoSquare(file[0])
                          }
                        }}
                      />
                    </div>
                  </div>
                  {logoSquare !== undefined && (
                    <img src={logoSquare} alt="" className="image" />
                  )}
                </div>
                <div className="column is-4">
                  <div className="field">
                    <label htmlFor="logoWide">Logo Wide</label>
                    <div className="control">
                      <input
                        type="file"
                        name="logoWide"
                        id="logoWide"
                        className="input"
                        accept="image/*"
                        onChange={ev => {
                          logoHandler(ev, setLogoWide)
                          const file = ev.target.files

                          if (file) {
                            setSubmittedLogoWide(file[0])
                          }
                        }}
                      />
                    </div>
                  </div>
                  {logoWide !== undefined && (
                    <img src={logoWide} alt="" className="image" />
                  )}
                </div>
                <div className="column is-4">
                  <div className="field">
                    <label htmlFor="icon">App Icon</label>
                    <div className="control">
                      <input
                        type="file"
                        className="input"
                        id="icon"
                        name="icon"
                        accept="image/*"
                        onChange={ev => {
                          logoHandler(ev, setAppIcon)
                          const file = ev.target.files

                          if (file) {
                            setSubmittedAppIcon(file[0])
                          }
                        }}
                      />
                    </div>
                  </div>
                  {appIcon !== undefined && (
                    <img src={appIcon} alt="" className="image" />
                  )}
                </div>
                <div className="column is-4">
                  <div className="field">
                    <label htmlFor="">Warna Tema</label>
                    <div className="control">
                      <input
                        type="color"
                        className="input"
                        value={accentColor}
                        onChange={ev => setAccentColor(ev.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="field">
                <label htmlFor="NPSN">NPSN</label>
                <div className="control">
                  <input
                    type="text"
                    id="NPSN"
                    className="input"
                    name="NPSN"
                    value={NPSN}
                    onChange={ev => setNPSN(ev.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="NSS">NSS</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    id="NSS"
                    name="NSS"
                    value={NSS}
                    onChange={ev => setNSS(ev.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="address">Alamat</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    id="address"
                    name="address"
                    required
                    value={address}
                    onChange={ev => setAddress(ev.target.value)}
                  />
                </div>
              </div>
              <div className="columns">
                <div className="column is-3-widescreen is-6-mobile">
                  <div className="field">
                    <label htmlFor="lat">Latitude</label>
                    <div className="control">
                      <input
                        type="number"
                        className="input"
                        id="lat"
                        name="lat"
                        step="0.001"
                        value={lat}
                        onChange={ev => setLat(ev.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="column is-3-widescreen is-6-mobile">
                  <div className="field">
                    <label htmlFor="lng">Longitude</label>
                    <div className="control">
                      <input
                        type="number"
                        className="input"
                        id="lng"
                        name="lng"
                        step="0.001"
                        value={lng}
                        onChange={ev => setLng(ev.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="field">
                <label htmlFor="website">Website</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    id="website"
                    name="website"
                    value={website}
                    onChange={ev => setWebsite(ev.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="apphost">APP Host</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    id="apphost"
                    name="appHost"
                    value={appHost}
                    onChange={ev => setAppHost(ev.target.value)}
                  />
                </div>
              </div>
              <h5 className="title">Kontak</h5>
              <div className="field">
                <label htmlFor="email">Email</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    id="email"
                    name="email"
                    value={email}
                    onChange={ev => setEmail(ev.target.value)}
                  />
                </div>
              </div>
              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label htmlFor="phone-1">No. Telepon 1</label>
                    <div className="control">
                      <input
                        type="text"
                        className="input"
                        id="phone-1"
                        name="phone[]"
                        value={phone1}
                        onChange={ev => setPhone1(ev.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label htmlFor="phone-2">No. Telepon 2</label>
                    <div className="control">
                      <input
                        type="text"
                        className="input"
                        id="phone-2"
                        name="phone[]"
                        value={phone2}
                        onChange={ev => setPhone2(ev.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label htmlFor="phone-3">No. Telepon 3</label>
                    <div className="control">
                      <input
                        type="text"
                        className="input"
                        id="phone-3"
                        name="phone[]"
                        value={phone3}
                        onChange={ev => setPhone3(ev.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <select name="status" id="status" className="input" value={status} onChange={ev => setStatus(ev.target.value)}>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreConnector(DepartmentForm)
