import { faArrowCircleLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router"
import { toast } from "react-toastify"
import APIResponse from "../../interfaces/APIResponse"
import TextEditor from "../../layouts/TextEditor"
import { StoreConnector, StoreProps } from "../../redux/actions"

const API_URL = process.env.REACT_APP_API_URL

export enum AnnouncementStatus {
  Draft = 'draft',
  Publish = 'publish'
}

export interface AnnouncementInterface {
  _id: string
  title: string
  content: string
  writer: string
  displayDate: {
    start: string
    end: string
  }
  status: AnnouncementStatus
}

export enum NotificationCategory {
  Announcement='announcement',
  Document='document',
  Proposal='proposal',
  Article='Article',
  Link='link',
  Timeline='timeline',
  TimelineEvent='timeline_event',
}

export enum NotificationScope {
  All = 'all',
  Department = 'department',
  Personal = 'personal'
}

function AnnouncementForm(props: StoreProps) {
  const { token, department, urlPrefix } = props
  const { id } = useParams<{id?: string}>()
  const history = useHistory()
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [dateStart, setDateStart] = useState<string>(DateTime.now().toFormat('yyyy-MM-dd'))
  const [dateEnd, setDateEnd] = useState<string>(DateTime.now().toFormat('yyyy-MM-dd'))
  const [status, setStatus] = useState<AnnouncementStatus>(AnnouncementStatus.Publish)

  const submitAnnouncement = () => {
    const form = new URLSearchParams()

    form.append('title', title)
    form.append('content', content)
    form.append('start', dateStart)
    form.append('dateStart', dateStart)
    form.append('dateEnd', dateEnd)
    form.append('status', status)

    const fetchInitOpt: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    }

    const url = new URL(`${API_URL + urlPrefix}/announcement`)

    if (id) {
      url.pathname = `${url.pathname}/${id}`
    }

    fetch(url.toString(), fetchInitOpt)
      .then(response => response.json())
      .then(async function (response: APIResponse) {
        const { success } = response

        if (!success) {
          toast('Gagal menyimpan data!', {type: 'error'})
          return
        }

        toast('Berhasil membuat pengumuman!', {type: 'success'})

        if (status === AnnouncementStatus.Publish) {
          const notificationBody = 'Pengumuman terbaru'
          
         
        }

        history.goBack()
      })
      .catch(() => toast('Kegagalan jaringan!', {type: 'error'}))
  }

  const sendNotification = async function (title: string, body: string, scope: string, receiver: string | Array<string>, category: string) {
    const form = new URLSearchParams()

    form.append('title', title)
    form.append('body', body)
    form.append('scope', scope)
    
    if(Array.isArray(receiver)) {
      receiver.map(data => form.append('receiver[]', data))
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
      .then(response => response.json())
      .then((response: APIResponse) => {
        const { success } = response

        if (!success) {
          toast('Gagal menyimpan data!', {type: 'error'})
          return
        }
      })
      .catch(() => toast('Kegagalan jaringan!', {type: 'error'}))
  }

  useEffect(() => {
    if (!token  || !id) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/announcement/${id}`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{announcement: AnnouncementInterface}>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', {type: 'error'})
          return
        }

        const { announcement } = message

        setTitle(announcement.title)
        setContent(announcement.content)
        setDateStart(DateTime.fromJSDate(new Date(announcement.displayDate.start)).toFormat('yyyy-MM-dd'))
        setDateEnd(DateTime.fromJSDate(new Date(announcement.displayDate.end)).toFormat('yyyy-MM-dd'))
        setStatus(announcement.status)
      })
  }, [token, department, urlPrefix, id])

  return (
    <div className="mt-3">
      <div className="columns is-centered">
        <div className="column is-12">
          <div className="box">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h6 className="title is-size-6">Form Pengumuman</h6>
                </div>
              </div>
              <div className="level-right">
                <button className="button is-small is-primary" onClick={submitAnnouncement}>
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
                    onChange={ev => setTitle(ev.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="content">Konten</label>
                <div className="control">
                  <TextEditor
                    content={content}
                    onChange={val => setContent(val)}
                  />
                </div>
              </div>
              <div className="columns">
                <div className="column">
                  <label htmlFor="start">Mulai Penayangan</label>
                  <div className="control">
                    <input type="date" className="input" value={dateStart} onChange={ev => setDateStart(ev.target.value)}/>
                  </div>
                </div>
                <div className="column">
                  <label htmlFor="end">Selesai Penayangan</label>
                  <div className="control">
                    <input type="date" className="input" value={dateEnd} onChange={ev => setDateEnd(ev.target.value)}/>
                  </div>
                </div>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <div className="select is-fullwidth">
                  <select name="status" id="status" value={status} onChange={ev => setStatus(ev.target.value as AnnouncementStatus)}>
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

export default StoreConnector(AnnouncementForm)