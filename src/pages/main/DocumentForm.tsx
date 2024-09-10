import { faArrowCircleLeft, faCheckCircle, faCloudUploadAlt, faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router"
import { toast } from "react-toastify"
import APIResponse from "../../interfaces/APIResponse"
import FileUploader from "../../layouts/FileUploader"
import TextEditor from "../../layouts/TextEditor"
import { StoreConnector, StoreProps } from "../../redux/actions"
import { NotificationScope } from "./AnnouncementForm"

const API_URL = process.env.REACT_APP_API_URL

export enum DocumentStatus {
  Draft = 'draft',
  Publish = 'publish'
}

export interface DocumentInterface {
  _id: string
  title: string
  description: string
  url: string
  status: DocumentStatus
}

export enum NotificationCategory {
  Document = 'document',
  Assignment = 'assignment',
  StudyMaterial = 'studyMaterial',
  Article = 'Article',
  Exam = 'exam',
  Achievement = 'achievement',
  Violation = 'violation',
  Library = 'library',
  Chat = 'chat'
}

function DocumentForm(props: StoreProps) {
  const { token, department, urlPrefix } = props
  const { id } = useParams<{ id?: string }>()
  const history = useHistory()
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [document, setDocument] = useState<File>()
  const [uploadedDocument, setUploadedDocument] = useState<string>()
  const [uploadDocumentFormVisible, setUploadDocumentFormVisibility] = useState<boolean>(false)
  const [status, setStatus] = useState<DocumentStatus>(DocumentStatus.Publish)

  const submitDocument = () => {
    const form = new FormData()

    form.append('title', title)
    form.append('description', description)
    form.append('document', document!)
    form.append('status', status)

    const fetchInitOpt: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    }

    const url = new URL(`${API_URL + urlPrefix}/document`)

    if (id) {
      url.pathname = `${url.pathname}/${id}`
    }

    fetch(url.toString(), fetchInitOpt)
      .then(response => response.json())
      .then(async function (response: APIResponse) {
        const { success } = response

        if (!success) {
          toast('Gagal menyimpan data!', { type: 'error' })
          return
        }

        toast('Berhasil membuat pengumuman!', { type: 'success' })

        if (status === DocumentStatus.Publish) {
          const notificationBody = 'Link terbaru'

          await sendNotification(
            title,
            notificationBody,
            NotificationScope.All,
            '',
            NotificationCategory.Document
          )
        }

        history.goBack()
      })
      .catch(() => toast('Kegagalan jaringan!', { type: 'error' }))
  }

  const sendNotification = async function (title: string, body: string, scope: string, receiver: string | Array<string>, category: string) {
    const form = new URLSearchParams()

    form.append('title', title)
    form.append('body', body)
    form.append('scope', scope)

    if (Array.isArray(receiver)) {
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
          toast('Gagal menyimpan data!', { type: 'error' })
          return
        }
      })
      .catch(() => toast('Kegagalan jaringan!', { type: 'error' }))
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

    fetch(`${API_URL + urlPrefix}/document/${id}`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ document: DocumentInterface }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        const { document } = message

        setTitle(document.title)
        setDescription(document.description)
        setUploadedDocument(document.url)
        setStatus(document.status)
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
                <button className="button is-small is-primary" onClick={submitDocument}>
                  <div className="icon is-left is-small">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <span>Simpan</span>
                </button>
                <button className="button is-small is-default ml-1" onClick={history.goBack}>
                  <div className="icon is-left is-small">
                    <FontAwesomeIcon icon={faArrowCircleLeft} />
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
                <label htmlFor="description">Deskripsi</label>
                <div className="control">
                  <TextEditor
                    content={description}
                    onChange={val => setDescription(val)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="featuredImage">Dokumen</label>
                <div className="columns mb-0">
                  <div className="column">
                    <button className="button is-default is-fullwidth" onClick={() => setUploadDocumentFormVisibility(true)} type="button">
                      <div className="icon is-small is-left">
                        <FontAwesomeIcon icon={faCloudUploadAlt} />
                      </div>
                      <span>Upload Dokumen</span>
                    </button>
                  </div>
                </div>
                {document && <p className="has-text-info">{document.name}</p>}
                {uploadedDocument && (
                  <div className="column">
                    <button className="button is-danger is-fullwidth" type="button" onClick={() => {
                      setDocument(undefined)
                      setUploadedDocument(undefined)
                    }}>
                      <div className="icon is-small is-left">
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </div>
                      <span>Hapus</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <div className="select is-fullwidth">
                  <select name="status" id="status" value={status} onChange={ev => setStatus(ev.target.value as DocumentStatus)}>
                    <option value="draft">Draft</option>
                    <option value="publish">Terbit</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {uploadDocumentFormVisible && (
        <FileUploader
          title="Pilih Dokumen"
          onCloseRequest={() => setUploadDocumentFormVisibility(false)}
          onAcceptFiles={files => !Array.isArray(files) && setDocument(files)}
          multiple={false}
        />
      )}
    </div>
  )
}

export default StoreConnector(DocumentForm)