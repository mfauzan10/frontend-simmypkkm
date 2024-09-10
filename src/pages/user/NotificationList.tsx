import { faEye } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DateTime } from "luxon"
import { Fragment, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import APIResponse from "../../interfaces/APIResponse"
import UserInterface from "../../interfaces/UserInterface"
import Loading from "../../layouts/Loading"
import { StoreConnector, StoreProps } from "../../redux/actions"

const API_URL = process.env.REACT_APP_API_URL

export enum NotificationCategory {
  Article='article',
  Announcement='announcement',
  StudyMaterial='studyMaterial',
  Assignment='assignment',
  Exam='exam',
  Achievement='achievement',
  Violation='violation',
  Library='library',
  Chat='chat'
}

export interface NotificationInterface {
  _id: string
  department: string
  title: string
  body: string
  category: NotificationCategory
  data: any
  receiverList: Array<string>
  readList: Array<string>
  createdAt: Date
  sender: string
}

function NotificationList(props: StoreProps): JSX.Element {
  const {
    token,
    department,
    urlPrefix
  } = props
  
  const [notificationList, setNotificationList] = useState<Array<NotificationInterface >>([])
  const [isLoading, setLoading] = useState<boolean>(false)

  const [userData, setUserData] = useState({
    _id: '',
    fullname: '',
    email: '',
    photo: 'https://via.placeholder.com/200x200?text=Sample Photo',
    meta: {
      address: ''
    }
  })
  
  useEffect(() => {
    if (token && department) {
      fetch(`${API_URL + urlPrefix}/notification/read`, {headers: {'Authorization': `Bearer ${token}`}})
        .then(result => result.json())
        .then((response: APIResponse<{notifications: Array<NotificationInterface>}>) => {
          const { success, message } = response

          if (success) {
            setNotificationList(message.notifications)
          }
        })
        .catch(() => toast('Kegagalan jaringan!', {type: 'error'}))
        .finally(() => setLoading(false))
    }
  }, [token, urlPrefix, department])

  
  useEffect(() => {
    if (token) {
      const fetchInitOpt = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }

      fetch(`${API_URL}/me`, fetchInitOpt)
        .then(result => result.json())
        .then(response => {
          const { success, message } = response

          if (success) {
            setUserData({
              ...message.user,
              photo: API_URL + message.user.photo
            })
          }
        })
    }
  }, [token])

  const getCategoryName = (notification: NotificationInterface) =>{
    switch(notification.category) {
      case NotificationCategory.StudyMaterial:
        return "Materi"
      break;
      case NotificationCategory.Assignment:
        return "Tugas"
      break;
      case NotificationCategory.Exam:
        return "Ujian"
      break;
      case NotificationCategory.Article:
        return "Berita"
      break;
      case NotificationCategory.Announcement:
        return "Pengumuman"
      break;
      default: 
      return "-"
    }
  }

  const getLink = (notification: NotificationInterface) =>{
    switch(notification.category) {
      case NotificationCategory.StudyMaterial:
        return `${urlPrefix}/study-material`
      case NotificationCategory.Assignment:
        return `${urlPrefix}/assignment`
      case NotificationCategory.Exam:
        return `${urlPrefix}/exam`
      case NotificationCategory.Article:
        return `${urlPrefix}/article`
      case NotificationCategory.Announcement:
        return `${urlPrefix}/announcement`
      default: 
        return `-`
    }
  }
  
  if (!notificationList || userData._id == '') {
    return (
      <Loading/>
    )
  }
  return (
    <Fragment>
      <div className="mt-3">
        <div className="box">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h4 className="title is-size-4">Notifikasi</h4>
              </div>
            </div>
          </div>
          <div className="content">
            {isLoading && (
              <h6 className="title is-size-6 has-text-centered">
                Sedang memuat...
              </h6>
            )}
            {!isLoading && (
              <div style={{overflowX: 'auto'}}>
                <table className="table is-bordered is-fullwidth" style={{whiteSpace: 'nowrap'}}>
                  <thead>
                    <tr>
                      <th>Judul</th>
                      <th>Isi</th>
                      <th>Kategori</th>
                      <th>Tanggal</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notificationList.map(notification => (
                      <tr className={notification.readList.includes(userData._id) ? "has-background-white-ter" : "has-background-white"} key={notification._id}>
                        <td>{notification.title}</td>
                        <td>{notification.body}</td>
                        <td>{getCategoryName(notification)}</td>
                        <td>{DateTime.fromISO(notification.createdAt.toString()).setLocale('id-ID').toLocaleString(DateTime.DATE_FULL)}</td>
                        <td>
                          <Link to={getLink(notification) as string} className="button is-small mx-1">
                            <div className="icon is-small is-left">
                              <FontAwesomeIcon icon={faEye} />
                            </div>
                            <span>Lihat</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {notificationList.length === 0 && (
                      <tr>
                        <td colSpan={9} className="has-text-centered">
                          Belum ada notifikasi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {!department && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-content">
            <div className="box has-text-centered">
              <p>Anda harus pilih instansi terlebih dahulu. Pilih instansi <Link to="/admin/department?rdr=/admin/notification">di sini</Link>.</p>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  )
}

export default StoreConnector(NotificationList)