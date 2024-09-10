import {faCalendar, faCheckCircle, faEllipsisV, faEraser, faExclamationCircle, faPencilAlt, faPlusCircle, faTimesCircle} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {DateTime} from 'luxon'
import {Fragment, useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {toast} from 'react-toastify'
import APIResponse from '../interfaces/APIResponse'
import Loading from '../layouts/Loading'
import {StoreConnector, StoreProps} from '../redux/actions'

const API_URL = process.env.REACT_APP_API_URL

export enum TimelineStatus {
  Draft = 'draft',
  Publish = 'publish'
}

export enum TimelineParticipantType {
  Person = 'person',
  Department = 'department'
}

export interface TimelineInterface {
  _id: string
  title: string
  description: string
  createdAt: Date
  participantType: TimelineParticipantType
  status: TimelineStatus
}

function TimelineList(props: StoreProps) {
  const {token, department, urlPrefix} = props
  const [isLoading, setLoading] = useState(false)
  const [columnLayout, setColumnLayout] = useState('is-12')
  const [timelineList, setTimelineList] = useState<Array<TimelineInterface>>([])
  const [reloadData, setReloadData] = useState<number>(Date.now())
  const [focusedTimeline, setFocusedTimeline] = useState<string>()
  const [removeTimelineConfirmation, setRemoveTimelineConfirmation] = useState<boolean>(false)

  const confirmRemoveTimeline = (id: string) => {
    setFocusedTimeline(id)
    setRemoveTimelineConfirmation(true)
  }

  const removeTimeline = () => {
    setRemoveTimelineConfirmation(false)

    if (!focusedTimeline) {
      return
    }

    const fetchInitOpt: RequestInit = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/timeline/${focusedTimeline}`, fetchInitOpt)
        .then((response) => response.json())
        .then((response: APIResponse) => {
          const {success} = response

          if (!success) {
            toast('Gagal mengahapus data!', {type: 'error'})
            return
          }

          toast('Data berhasil dihapus!', {type: 'success'})
          setReloadData(Date.now())
        })
        .catch(() => toast('Kegagalan jaringan!', {type: 'error'}))
  }

  useEffect(() => {
    if (!token) {
      return
    }

    setLoading(true)

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/timeline`, fetchInitOpt)
        .then((response) => response.json())
        .then((response: APIResponse<{ timelines: Array<TimelineInterface> }>) => {
          const {success, message} = response

          if (!success) {
            toast('Gagal mengambil data!', {type: 'error'})
            return
          }

          setTimelineList(message.timelines)
          setLoading(false)
        })
        .catch((err) => toast(err.message, {type: 'error'}))
  }, [token, department, urlPrefix, reloadData])

  if (isLoading) {
    return (
      <Loading />
    )
  }

  return (
    <Fragment>
      <div className="mt-3">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h4 className="title is-size-4">Daftar Periode</h4>
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
                <Link to={`${urlPrefix}/timeline/form`} className="button is-small is-right ml-1">
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faPlusCircle} />
                  </div>
                  <span>Tambah Periode</span>
                </Link>
              }
            </div>
          </div>
        </div>
        <div className="columns is-multiline">
          {timelineList.length == 0 &&
            <div className={`column ${columnLayout}`}>
              <div className="card">
                <div className="card-content">
                  <div className="is-flex is-flex-direction-column is-align-items-center">
                    <FontAwesomeIcon className="is-size-1 mb-3" icon={faExclamationCircle} />
                    <p className="is-size-5">Periode tidak ditemukan</p>
                  </div>
                </div>
              </div>
            </div>}
          {timelineList.map((timeline) => (
            <div className={`column ${columnLayout}`}>
              <div className="card">
                <div className="card-content">
                  <div className="title">{timeline.title}</div>
                  <div className="subtitle is-size-7">{DateTime.fromJSDate(new Date(timeline.createdAt)).setLocale('id-ID').toFormat('EEEE, d LLLL yyyy')}</div>
                  <p
                  >{timeline.description}</p>
                  <small>Peserta: {timeline.participantType === TimelineParticipantType.Department? 'Prodi' : 'Individu'}</small><br/>
                  <small>Status: {timeline.status === TimelineStatus.Publish ? 'Diterbitkan' : 'Draft'}</small>
                </div>
                <div className="card-footer">
                  <Link to={`${urlPrefix}/timeline/${timeline._id}/event`} className="card-footer-item">
                    <div className="icon is-small is-left mr-1">
                      <FontAwesomeIcon icon={faCalendar} />
                    </div>
                    <span>Tahap</span>
                  </Link>
                  {urlPrefix == '/admin' &&
                    <>
                      <Link to={`${urlPrefix}/timeline/form/${timeline._id}`} className="card-footer-item">
                        <div className="icon is-small is-left mr-1">
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </div>
                        <span>Ubah</span>
                      </Link>
                      <a href="/" className="card-footer-item" onClick={(ev) => {
                        ev.preventDefault(); setFocusedTimeline(timeline._id); confirmRemoveTimeline(timeline._id)
                      }}>
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
      {removeTimelineConfirmation && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setRemoveTimelineConfirmation(false)}></div>
          <div className="modal-content">
            <div className="box">
              <h4 className="title is-size-4 has-text-centered">Anda yakin akan menghapus periode ini?</h4>
              <div className="has-text-centered">
                <button className="button is-danger" onClick={removeTimeline}>
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <span>Lanjutkan</span>
                </button>
                <button className="button is-default ml-1" onClick={() => setRemoveTimelineConfirmation(false)}>
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

export default StoreConnector(TimelineList)
