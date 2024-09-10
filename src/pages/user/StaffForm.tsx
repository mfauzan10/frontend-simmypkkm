import { faArrowCircleLeft, faCheckCircle, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import DepartmentTitle from '../../layouts/DepartmentTitle'
import { StoreConnector, StoreProps } from '../../redux/actions'
import { DepartmentListItemInterface } from '../main/DepartmentList'

const API_URL = process.env.REACT_APP_API_URL

export interface StaffInterface {
  _id?: string
  email: string
  additionalEmails: Array<string>
  fullname: string
  password?: string
  meta: {
    department?: string
    phone: Array<string>
    gender?: string
    religion?: string
    address?: string
    NIK?: string
    NIP?: string
    NUPTK?: string
    fieldOfStudy?: string
    actionResearch?: string
    employmentStatus?: string
    employmentGroup?: string
    maritalStatus?: string
    NPWP?: string
  }
  privilege: string
  status: string
}

function StaffForm(props: StoreProps) {
  const { token, urlPrefix } = props
  const { id } = useParams<{ id?: string }>()
  const history = useHistory()

  const [departmentList, setDepartmentList] = useState<Array<DepartmentListItemInterface>>([])
  const [staffData, setStaffData] = useState<StaffInterface>({
    email: '',
    additionalEmails: [],
    fullname: '',
    status: 'active',
    meta: {
      phone: ['', '']
    },
    privilege: 'staff'
  })

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL}${urlPrefix}/department`, fetchInitOpt)
      .then((result) => result.json())
      .then((response) => {
        if (response.success) {
          setDepartmentList(response.message.departments)
        }
      })
      .catch(() => toast('Kegagalan jaringan!', { type: 'error' }))
  }, [token])

  const submitStaff = () => {
    const formEl = document.forms[0]

    if (formEl.reportValidity()) {
      const url = new URL(`${API_URL + urlPrefix}/staff`)

      if (id) {
        url.pathname = `${url.pathname}/${id}`
      }

      const form = new URLSearchParams()

      for (let i = 0; i < formEl.length; i++) {
        // @ts-ignore
        const { name, value } = formEl[i]

        if (value) {
          form.append(name, value)
        }
      }

      const fetchInitOpt = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      }

      fetch(url.toString(), fetchInitOpt)
        .then((result) => result.json())
        .then((response) => {
          const { success, message } = response

          if (success) {
            toast('Data berhasil disimpan!', { type: 'success' })
            //history.goBack()
          } else {
            toast(message, { type: 'error' })
          }
        }).catch(() => {
          toast('Connection error!', { type: 'error' })
        })
    }
  }

  useEffect(() => {
    if (token) {
      if (id) {
        fetch(`${API_URL}${urlPrefix}/staff/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
          .then((result) => result.json())
          .then((response) => {
            if (response.success) {
              setStaffData({ ...response.message.staff, password: '', additionalEmails: response.message.staff.additionalEmails ?? [] })
            }
          })
      }
    }
  }, [token, urlPrefix, id])

  return (
    <section className="section">
      <div className="columns is-centered">
        <div className="column is-12">
          <div className="box">
            <strong><DepartmentTitle /></strong>
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h4 className="title is-size-4">Form Staff</h4>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <button className="button is-small mx-1" onClick={submitStaff}>
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
            <form action="" name="staff-form">
              <div className="field">
                <label htmlFor="fullname">Nama Lengkap</label>
                <div className="control">
                  <input type="text" className="input" id="fullname" name="fullname" required value={staffData?.fullname ?? ''} onChange={(ev) => setStaffData({ ...staffData, fullname: ev.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <div className="control">
                  <input type="text" className="input" id="email" name="email" required value={staffData?.email ?? ''} onChange={(ev) => setStaffData({ ...staffData, email: ev.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="email">Email tambahan</label>
                {staffData.additionalEmails.map((additionalEmail, index) => <div key={index} className="control">
                  <div className="columns">
                    <div className="column is-10">
                      <input type="text" className="input mb-2" id={`additionalEmails[${index}]`} name={`additionalEmails[${index}]`} required value={additionalEmail ?? ''} onChange={(ev) => {
                        const newAdditionalEmails = staffData.additionalEmails
                        newAdditionalEmails[index] = ev.target.value
                        setStaffData({ ...staffData, additionalEmails: newAdditionalEmails })
                      }} />
                    </div>
                    <div className="column is-2">
                      <button
                        className="button is-small is-primary mb-3"
                        onClick={() => {
                          setStaffData({
                            ...staffData,
                            additionalEmails: [...staffData.additionalEmails.slice(0, staffData.additionalEmails.length - 1)]
                          })
                        }}>
                        <div className="icon is-small is-left">
                          <FontAwesomeIcon icon={faTrash} />
                        </div>
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>)}
              </div>
              <button
                className="button is-small is-primary mb-3"
                onClick={() => {
                  setStaffData({
                    ...staffData,
                    additionalEmails: [...staffData.additionalEmails, '']
                  })
                }}>
                <div className="icon is-small is-left">
                  <FontAwesomeIcon icon={faPlus} />
                </div>
                <span>Tambah</span>
              </button>
              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="control">
                  <input type="password" className="input" id="password" name="password" minLength={4} onChange={(ev) => setStaffData({ ...staffData, password: ev.target.value })} />
                </div>
              </div>
              {urlPrefix == '/admin' &&
                <div className="field">
                  <label htmlFor="department">Prodi</label>
                  <div className="control">
                    <select name="department" id="department" className="input" value={staffData?.meta.department ?? ''} onChange={(ev) => setStaffData({ ...staffData, meta: { ...staffData.meta, department: ev.target.value } })}>
                      <option value="" disabled>Pilih prodi</option>
                      {departmentList.map((department) => <option value={department._id}>{department.title}</option>)}
                    </select>
                  </div>
                </div>}
              <div className="field">
                <label htmlFor="status">Status</label>
                <div className="control">
                  <select name="status" id="status" className="input" value={staffData?.status ?? 'inactive'} onChange={(ev) => setStaffData({ ...staffData, status: ev.target.value })}>
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak aktif</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StoreConnector(StaffForm)
