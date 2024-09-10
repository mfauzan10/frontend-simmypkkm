import { faArrowCircleLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Privilege } from '../../interfaces/UserInterface'
import { StoreConnector, StoreProps } from '../../redux/actions'

const API_URL = process.env.REACT_APP_API_URL

export interface ReviewerInterface {
  _id?: string
  email: string
  fullname: string
  password?: string
  meta: {
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

function ReviewerForm(props: StoreProps) {
  const { token, urlPrefix } = props
  const { id } = useParams<{ id?: string }>()
  const history = useHistory()

  const [reviewerData, setReviewerData] = useState<ReviewerInterface>({
    email: '',
    fullname: '',
    status: 'active',
    meta: {
      phone: ['', '']
    },
    privilege: 'teacher'
  })


  const submitReviewer = () => {
    const formEl = document.forms[0]

    if (formEl.reportValidity()) {
      const url = new URL(`${API_URL + urlPrefix}/reviewer`)

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

      form.append('privilege', Privilege.Reviewer)

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
            history.goBack()
          } else {
            toast(message, { type: 'error' })
          }
        }).catch(() => {
          toast('Connection error!', { type: 'error' })
        })
    }
  }

  useEffect(() => {
    if (token && id) {
      fetch(`${API_URL}${urlPrefix}/reviewer/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then((result) => result.json())
        .then((response) => {

          if (response.success) {
            setReviewerData({ ...response.message.reviewer, password: '' })
          }
        })
    }
  }, [token, urlPrefix, id])

  return (
    <section className="section">
      <div className="columns is-centered">
        <div className="column is-12-widescreen">
          <div className="box">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h4 className="title is-size-4">Form Reviewer</h4>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <button className="button is-small mx-1" onClick={submitReviewer}>
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
            <form action="" name="reviewer-form">
              <div className="field">
                <label htmlFor="fullname">Nama Lengkap</label>
                <div className="control">
                  <input type="text" className="input" id="fullname" name="fullname" required value={reviewerData?.fullname ?? ''} onChange={(ev) => setReviewerData({ ...reviewerData, fullname: ev.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <div className="control">
                  <input type="text" className="input" id="email" name="email" required value={reviewerData?.email ?? ''} onChange={(ev) => setReviewerData({ ...reviewerData, email: ev.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="control">
                  <input type="password" className="input" id="password" name="password" minLength={4} onChange={(ev) => setReviewerData({ ...reviewerData, password: ev.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <div className="control">
                  <select name="status" id="status" className="input" value={reviewerData?.status ?? 'inactive'} onChange={(ev) => setReviewerData({ ...reviewerData, status: ev.target.value })}>
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

export default StoreConnector(ReviewerForm)
