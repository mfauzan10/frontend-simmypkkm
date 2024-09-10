import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { faCheckCircle, faEllipsisV, faEraser, faExclamationCircle, faEye, faPencilAlt, faPlusCircle, faTimesCircle, faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DateTime } from "luxon"
import { Fragment, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import APIResponse from "../interfaces/APIResponse"
import { StoreConnector, StoreProps } from "../redux/actions"

const API_URL = process.env.REACT_APP_API_URL

enum AnnouncementStatus {
  Draft = 'draft',
  Publish = 'publish'
}

interface AnnouncementInterface {
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

function AnnouncementList(props: StoreProps) {
  const { token, department, urlPrefix } = props
  const [columnLayout, setColumnLayout] = useState('is-12')
  const [announcementList, setAnnouncementList] = useState<Array<AnnouncementInterface>>([])
  const [reloadData, setReloadData] = useState<number>(Date.now())
  const [focusedAnnouncement, setFocusedAnnouncement] = useState<string>()
  const [removeAnnouncementConfirmation, setRemoveAnnouncementConfirmation] = useState<boolean>(false)

  const confirmRemoveAnnouncement = (id: string) => {
    setFocusedAnnouncement(id)
    setRemoveAnnouncementConfirmation(true)
  }

  const removeAnnouncement = () => {
    setRemoveAnnouncementConfirmation(false)

    if (!focusedAnnouncement) {
      return
    }

    const fetchInitOpt: RequestInit = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/announcement/${focusedAnnouncement}`, fetchInitOpt)
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

    fetch(`${API_URL + urlPrefix}/announcement`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ announcements: Array<AnnouncementInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setAnnouncementList(message.announcements)
      })
      .catch(err => toast(err.message, { type: 'error' }))
  }, [token, department, urlPrefix, reloadData])

  return (
    <Fragment>
      <div className="mt-3">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h4 className="title is-size-4">Daftar Pengumuman</h4>
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
                <Link to={`${urlPrefix}/announcement/form`} className="button is-small is-right ml-1">
                  <div className="icon is-small is-left">
                    {/*<FontAwesomeIcon icon={faPlusCircle} />*/}
                  </div>
                  <span>Tambah Pengumuman</span>
                </Link>
              }
            </div>
          </div>
        </div>
        <div className="columns is-multiline">
          {announcementList.length == 0 &&
            <div className={`column ${columnLayout}`}>
              <div className="card">
                <div className="card-content">
                  <div className="is-flex is-flex-direction-column is-align-items-center">
                    <FontAwesomeIcon className="is-size-1 mb-3" icon={faExclamationCircle} />
                    <p className="is-size-5">Pengumuman tidak ditemukan</p>
                  </div>
                </div>
              </div>
            </div>}
          {announcementList.map(announcement => (
            <div className={`column ${columnLayout}`}>
              <div className="card">
                <div className="card-content">
                  <div className="title">{announcement.title}</div>
                  <div className="subtitle is-size-7">{DateTime.fromJSDate(new Date(announcement.displayDate.start)).setLocale('id-ID').toFormat('dd LLLL')} - {DateTime.fromJSDate(new Date(announcement.displayDate.end)).setLocale('id-ID').toFormat('dd LLLL yyyy')}</div>
                  <div
                    className="content"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  />
                  <small className={`has-text-${announcement.status === AnnouncementStatus.Draft ? 'warning' : 'primary'}`}>Status: {announcement.status === AnnouncementStatus.Publish ? 'Diterbitkan' : 'Draft'}</small>
                </div>
                <div className="card-footer">
                  <Link to={`${urlPrefix}/announcement/read/${announcement._id}`} className="card-footer-item">
                    <div className="icon is-small is-left mr-1">
                      <FontAwesomeIcon icon={faEye} />
                    </div>
                    <span>Lihat</span>
                  </Link>
                  {urlPrefix == '/admin' &&
                    <>
                      <Link to={`${urlPrefix}/announcement/form/${announcement._id}`} className="card-footer-item">
                        <div className="icon is-small is-left mr-1">
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </div>
                        <span>Ubah</span>
                      </Link>
                      <a href="/" className="card-footer-item" onClick={ev => { ev.preventDefault(); setFocusedAnnouncement(announcement._id); confirmRemoveAnnouncement(announcement._id) }}>
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
      {removeAnnouncementConfirmation && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setRemoveAnnouncementConfirmation(false)}></div>
          <div className="modal-content">
            <div className="box">
              <h4 className="title is-size-4 has-text-centered">Anda yakin akan menghapus pengumuman ini?</h4>
              <div className="has-text-centered">
                <button className="button is-danger" onClick={removeAnnouncement}>
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <span>Lanjutkan</span>
                </button>
                <button className="button is-default ml-1" onClick={() => setRemoveAnnouncementConfirmation(false)}>
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faTimesCircle } />
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

export default StoreConnector(AnnouncementList)