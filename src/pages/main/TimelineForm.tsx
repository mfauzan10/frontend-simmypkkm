import {faArrowCircleLeft, faCheckCircle} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {useEffect, useState} from 'react'
import {useHistory, useParams} from 'react-router'
import {toast, ToastContainer} from 'react-toastify'
import APIResponse from '../../interfaces/APIResponse'
import {StoreConnector, StoreProps} from '../../redux/actions'
import {TimelineInterface, TimelineParticipantType, TimelineStatus} from '../TimelineList'
import {NotificationCategory, NotificationScope} from './AnnouncementForm'

const API_URL = process.env.REACT_APP_API_URL

function TimelineForm(props: StoreProps) {
  const {token, department, urlPrefix} = props
  const {id} = useParams<{id?: string}>()
  const history = useHistory()
  const [title, setTitle] = useState<string>('')
  const [participantType, setParticipantType] = useState<string>(TimelineParticipantType.Department)
  const [description, setDescription] = useState<string>('')
  const [status, setStatus] = useState<TimelineStatus>(TimelineStatus.Publish)

  const submitTimeline = () => {
    const form = new URLSearchParams()

    form.append('title', title)
    form.append('description', description)
    form.append('participantType', participantType)
    form.append('status', status)

    const fetchInitOpt: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    }

    const url = new URL(`${API_URL + urlPrefix}/timeline`)

    if (id) {
      url.pathname = `${url.pathname}/${id}`
    }

    fetch(url.toString(), fetchInitOpt)
        .then((response) => response.json())
        .then(async function(response: APIResponse) {
          const {success} = response

          if (!success) {
            toast('Gagal menyimpan data!', {type: 'error'})
            return
          }

          toast('Berhasil membuat timeline!', {type: 'success'})

          if (status === TimelineStatus.Publish) {
            const notificationBody = 'Timeline terbaru'

            await sendNotification(
                title,
                notificationBody,
                NotificationScope.All,
                department ?? '',
                NotificationCategory.Timeline
            )
          }

          history.goBack()
        })
        .catch(() => toast('Kegagalan jaringan!', {type: 'error'}))
  }

  const sendNotification = async function(title: string, body: string, scope: string, receiver: string | Array<string>, category: string) {
    const form = new URLSearchParams()

    form.append('title', title)
    form.append('body', body)
    form.append('scope', scope)

    if (Array.isArray(receiver)) {
      receiver.map((data) => form.append('receiver[]', data))
    } else {
      form.append('receiver', receiver)
    }

    form.append('category', category)
    form.append('status', status)

    const fetchInitOpt: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    }

    const url = new URL(`${API_URL + urlPrefix}/notification`)

    if (id) {
      url.pathname = `${url.pathname}/${id}`
    }

    fetch(url.toString(), fetchInitOpt)
        .then((response) => response.json())
        .then((response: APIResponse) => {
          const {success} = response

          if (!success) {
            toast('Gagal menyimpan data!', {type: 'error'})
            return
          }
        })
        .catch(() => toast('Kegagalan jaringan!', {type: 'error'}))
  }

  useEffect(() => {
    if (!token || !id) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/timeline/${id}`, fetchInitOpt)
        .then((response) => response.json())
        .then((response: APIResponse<{timeline: TimelineInterface}>) => {
          const {success, message} = response

          if (!success) {
            toast('Gagal mengambil data!', {type: 'error'})
            return
          }

          const {timeline} = message

          setTitle(timeline.title)
          setDescription(timeline.description)
          setStatus(timeline.status)
        })
  }, [token, department, urlPrefix, id])

  return (
    <div className="mt-3">
      <ToastContainer />
      <div className="columns is-centered">
        <div className="column is-12">
          <div className="box">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h6 className="title is-size-6">Form Periode</h6>
                </div>
              </div>
              <div className="level-right">
                <button className="button is-small is-primary" onClick={submitTimeline}>
                  <div className="icon is-left is-small">
                    <FontAwesomeIcon icon={faCheckCircle}/>
                  </div>
                  <span>Simpan</span>
                </button>
                <button className="button is-small is-default ml-1" onClick={history.goBack}>
                  <div className="icon is-left is-small">
                    <FontAwesomeIcon icon={faArrowCircleLeft}/>
                  </div>
                  <span>Batal</span>
                </button>
              </div>
            </div>
            <form action="">
              <div className="field">
                <label htmlFor="title">Judul</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    value={title}
                    onChange={(ev) => setTitle(ev.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="description">Deskripsi</label>
                <div className="control"><input
                  type="text"
                  className="input"
                  value={description}
                  onChange={(ev) => setDescription(ev.target.value)}
                />
                </div>
              </div>
              <div className="field">
                <label htmlFor="type">Peserta</label>
                <div className="select is-fullwidth">
                  <select name="type" id="type" value={participantType} onChange={(ev) => setParticipantType(ev.target.value as TimelineStatus)}>
                    <option value={TimelineParticipantType.Department}>Prodi</option>
                    <option value={TimelineParticipantType.Person}>Individu</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <div className="select is-fullwidth">
                  <select name="status" id="status" value={status} onChange={(ev) => setStatus(ev.target.value as TimelineStatus)}>
                    <option value="draft">Draft</option>
                    <option value="publish">Terbit</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreConnector(TimelineForm)
