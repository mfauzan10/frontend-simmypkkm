import { faArrowCircleLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router"
import { toast } from "react-toastify"
import APIResponse from "../../interfaces/APIResponse"
import { StoreConnector, StoreProps } from "../../redux/actions"
import { NotificationScope } from "./AnnouncementForm"

const API_URL = process.env.REACT_APP_API_URL

export enum LinkStatus {
  Draft = 'draft',
  Publish = 'publish'
}

export interface LinkInterface {
  _id: string
  title: string
  URL: string
  writer: string
  displayDate: {
    start: string
    end: string
  }
  status: LinkStatus
}

export enum NotificationCategory {
  Link='link',
  Assignment='assignment',
  StudyMaterial='studyMaterial',
  Article='Article',
  Exam='exam',
  Achievement='achievement',
  Violation='violation',
  Library='library',
  Chat='chat'
}

function LinkForm(props: StoreProps) {
  const { token, department, urlPrefix } = props
  const { id } = useParams<{id?: string}>()
  const history = useHistory()
  const [title, setTitle] = useState<string>('')
  const [link, setLink] = useState<string>('')
  const [status, setStatus] = useState<LinkStatus>(LinkStatus.Publish)

  const submitLink = () => {
    const form = new URLSearchParams()

    form.append('title', title)
    form.append('url', link)
    form.append('status', status)

    const fetchInitOpt: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    }

    const url = new URL(`${API_URL + urlPrefix}/link`)

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

        toast('Berhasil membuat link!', {type: 'success'})

        if (status === LinkStatus.Publish) {
          const notificationBody = 'Link terbaru'
          
          await sendNotification(
            title, 
            notificationBody,
            NotificationScope.All, 
            '', 
            NotificationCategory.Link
          )
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

    fetch(`${API_URL + urlPrefix}/link/${id}`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{link: LinkInterface}>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', {type: 'error'})
          return
        }

        const { link } = message

        setTitle(link.title)
        setLink(link.URL)
        setStatus(link.status)
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
                  <h6 className="title is-size-6">Form Link</h6>
                </div>
              </div>
              <div className="level-right">
                <button className="button is-small is-primary" onClick={submitLink}>
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
                <label htmlFor="title">URL</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    value={link}
                    onChange={ev => setLink(ev.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <div className="select is-fullwidth">
                  <select name="status" id="status" value={status} onChange={ev => setStatus(ev.target.value as LinkStatus)}>
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

export default StoreConnector(LinkForm)