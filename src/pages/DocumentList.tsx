import { faCheckCircle, faEllipsisV, faEraser, faExclamationCircle, faEye, faPencilAlt, faPlusCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Fragment, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import APIResponse from "../interfaces/APIResponse"
import { StoreConnector, StoreProps } from "../redux/actions"

const API_URL = process.env.REACT_APP_API_URL

enum DocumentStatus {
  Draft = 'draft',
  Publish = 'publish'
}

interface DocumentInterface {
  _id: string
  title: string
  description: string
  file: string
  createdAt: Date
  status: DocumentStatus
}

function DocumentList(props: StoreProps) {
  const { token, department, urlPrefix } = props
  const [columnLayout, setColumnLayout] = useState('is-12')
  const [documentList, setDocumentList] = useState<Array<DocumentInterface>>([])
  const [reloadData, setReloadData] = useState<number>(Date.now())
  const [focusedDocument, setFocusedDocument] = useState<string>()
  const [removeDocumentConfirmation, setRemoveDocumentConfirmation] = useState<boolean>(false)

  const confirmRemoveDocument = (id: string) => {
    setFocusedDocument(id)
    setRemoveDocumentConfirmation(true)
  }

  const removeDocument = () => {
    setRemoveDocumentConfirmation(false)

    if (!focusedDocument) {
      return
    }

    const fetchInitOpt: RequestInit = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/document/${focusedDocument}`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse) => {
        const { success } = response

        if (!success) {
          toast('Gagal mengahapus data!', { type: 'error' })
          return
        }

        toast('Data berhasil dihapus!', { type: 'success' })
        setReloadData(Date.now())
      })
      .catch(() => toast('Kegagalan jaringan!', { type: 'error' }))
  }

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/document`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ documents: Array<DocumentInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setDocumentList(message.documents)
      })
      .catch(err => toast(err.message, { type: 'error' }))
  }, [token, department, urlPrefix, reloadData])

  return (
    <Fragment>
      <div className="mt-3">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h4 className="title is-size-4">Daftar Dokumen</h4>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <div className="button-group is-hidden-mobile">
                <button className={`button is-small ${columnLayout == 'is-12' ? 'is-active' : null}`} onClick={() => setColumnLayout('is-12')}>
                  <FontAwesomeIcon icon={faEllipsisV} /></button>
                <button className={`button is-small ${columnLayout == 'is-6' ? 'is-active' : null}`} onClick={() => setColumnLayout('is-6')}>
                  <FontAwesomeIcon icon={faEllipsisV} />
                  <FontAwesomeIcon icon={faEllipsisV} /></button>
                <button className={`button is-small ${columnLayout == 'is-4' ? 'is-active' : null}`} onClick={() => setColumnLayout('is-4')}>
                  <FontAwesomeIcon icon={faEllipsisV} />
                  <FontAwesomeIcon icon={faEllipsisV} />
                  <FontAwesomeIcon icon={faEllipsisV} /></button>
              </div>
              {
                urlPrefix == '/admin' &&
                <Link to={`${urlPrefix}/document/form`} className="button is-small is-right ml-1">
                  <div className="icon is-small is-left">
                    {/*<FontAwesomeIcon icon={faPlusCircle} />*/}
                  </div>
                  <span>Tambah Dokumen</span>
                </Link>
              }
            </div>
          </div>
        </div>
        <div className="columns is-multiline">
          {documentList.length == 0 &&
            <div className={`column ${columnLayout}`}>
              <div className="card">
                <div className="card-content">
                  <div className="is-flex is-flex-direction-column is-align-items-center">
                    <FontAwesomeIcon className="is-size-1 mb-3" icon={faExclamationCircle} />
                    <p className="is-size-5">Dokumen tidak ditemukan</p>
                  </div>
                </div>
              </div>
            </div>}
          {documentList.map(document => (
            <div className={`column ${columnLayout}`}>
              <div className="card">
                <div className="card-content">
                  <div className="title">{document.title}</div>
                  <div
                    className="content"
                    dangerouslySetInnerHTML={{ __html: document.description }}
                  />
                  <small className={`has-text-${document.status === DocumentStatus.Draft ? 'warning' : 'primary'}`}>Status: {document.status === DocumentStatus.Publish ? 'Diterbitkan' : 'Draft'}</small>
                </div>
                <div className="card-footer">
                  <a href={`${API_URL}${document.file}`} className="card-footer-item">
                    <div className="icon is-small is-left mr-1">
                      <FontAwesomeIcon icon={faEye} />
                    </div>
                    <span>Lihat</span>
                  </a>
                  {urlPrefix == '/admin' &&
                    <>
                      <Link to={`${urlPrefix}/document/form/${document._id}`} className="card-footer-item">
                        <div className="icon is-small is-left mr-1">
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </div>
                        <span>Ubah</span>
                      </Link>
                      <a href="/" className="card-footer-item" onClick={ev => { ev.preventDefault(); setFocusedDocument(document._id); confirmRemoveDocument(document._id) }}>
                        <div className="icon is-small is-left mr-1">
                          <FontAwesomeIcon icon={faEraser} />
                        </div>
                        <span>Hapus</span>
                      </a>
                    </>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {removeDocumentConfirmation && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setRemoveDocumentConfirmation(false)}></div>
          <div className="modal-content">
            <div className="box">
              <h4 className="title is-size-4 has-text-centered">Anda yakin akan menghapus document ini?</h4>
              <div className="has-text-centered">
                <button className="button is-danger" onClick={removeDocument}>
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <span>Lanjutkan</span>
                </button>
                <button className="button is-default ml-1" onClick={() => setRemoveDocumentConfirmation(false)}>
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </div>
                  <span>Batal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  )
}

export default StoreConnector(DocumentList)