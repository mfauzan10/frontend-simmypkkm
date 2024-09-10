import { faCheckCircle, faEllipsisV, faEraser, faExclamationCircle, faEye, faPencilAlt, faPlusCircle, faTimesCircle, faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DateTime } from "luxon"
import { Fragment, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import APIResponse from "../interfaces/APIResponse"
import { StoreConnector, StoreProps } from "../redux/actions"

const API_URL = process.env.REACT_APP_API_URL

enum LinkStatus {
  Draft = 'draft',
  Publish = 'publish'
}

interface LinkInterface {
  _id: string
  title: string
  description: string
  url: string
  writer: string
  status: LinkStatus
}

function LinkList(props: StoreProps) {
  const { token, department, urlPrefix } = props
  const [columnLayout, setColumnLayout] = useState('is-12')
  const [linkList, setLinkList] = useState<Array<LinkInterface>>([])
  const [reloadData, setReloadData] = useState<number>(Date.now())
  const [focusedLink, setFocusedLink] = useState<string>()
  const [removeLinkConfirmation, setRemoveLinkConfirmation] = useState<boolean>(false)

  const confirmRemoveLink = (id: string) => {
    setFocusedLink(id)
    setRemoveLinkConfirmation(true)
  }

  const removeLink = () => {
    setRemoveLinkConfirmation(false)

    if (!focusedLink) {
      return
    }

    const fetchInitOpt: RequestInit = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/link/${focusedLink}`, fetchInitOpt)
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

    fetch(`${API_URL + urlPrefix}/link`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ links: Array<LinkInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setLinkList(message.links)
      })
      .catch(err => toast(err.message, { type: 'error' }))
  }, [token, department, urlPrefix, reloadData])

  return (
    <Fragment>
      <div className="mt-3">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h4 className="title is-size-4">Daftar Link</h4>
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
                <Link to={`${urlPrefix}/link/form`} className="button is-small is-right ml-1">
                  <div className="icon is-small is-left">
                    {/*<FontAwesomeIcon icon={faPlusCircle} />*/}
                  </div>
                  <span>Tambah Link</span>
                </Link>
              }
            </div>
          </div>
        </div>
        <div className="columns is-multiline">
          {linkList.length == 0 &&
            <div className={`column ${columnLayout}`}>
              <div className="card">
                <div className="card-content">
                  <div className="is-flex is-flex-direction-column is-align-items-center">
                    <FontAwesomeIcon className="is-size-1 mb-3" icon={faExclamationCircle} />
                    <p className="is-size-5">Link tidak ditemukan</p>
                  </div>
                </div>
              </div>
            </div>}
          {linkList.map(link => (
            <div className={`column ${columnLayout}`}>
              <div className="card">
                <div className="card-content">
                  <div className="title">{link.title}</div>
                  <div
                    className="content"
                    dangerouslySetInnerHTML={{ __html: link.description}}
                  />
                </div>
                <div className="card-footer">
                  <a href={`${link.url}`} className="card-footer-item">
                    <div className="icon is-small is-left mr-1">
                      <FontAwesomeIcon icon={faEye} />
                    </div>
                    <span>Buka</span>
                  </a>
                  {urlPrefix == '/admin' &&
                    <>
                      <Link to={`${urlPrefix}/link/form/${link._id}`} className="card-footer-item">
                        <div className="icon is-small is-left mr-1">
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </div>
                        <span>Ubah</span>
                      </Link>
                      <a href="/" className="card-footer-item" onClick={ev => { ev.preventDefault(); setFocusedLink(link._id); confirmRemoveLink(link._id) }}>
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
      {removeLinkConfirmation && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setRemoveLinkConfirmation(false)}></div>
          <div className="modal-content">
            <div className="box">
              <h4 className="title is-size-4 has-text-centered">Anda yakin akan menghapus link ini?</h4>
              <div className="has-text-centered">
                <button className="button is-danger" onClick={removeLink}>
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <span>Lanjutkan</span>
                </button>
                <button className="button is-default ml-1" onClick={() => setRemoveLinkConfirmation(false)}>
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

export default StoreConnector(LinkList)