import { faArrowCircleLeft, faCheckCircle, faEllipsisV, faEraser, faExclamationCircle, faEye, faPencilAlt, faPlusCircle, faTimesCircle, faUserEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DateTime } from 'luxon'
import { Fragment, useEffect, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import APIResponse from '../interfaces/APIResponse'
import { StoreConnector, StoreProps } from '../redux/actions'

const API_URL = process.env.REACT_APP_API_URL

export enum TimelineEventStatus {
  Publish = 'publish',
  Draft = 'draft'
}

export enum TimelineEventType {
  Selection = 'selection',
  ProgramPlanning = 'program_planning',
  Event = 'event',
  FundDisbursement = 'fund_disbursement',
  ReportAndSPJ = 'report_and_spj',
  MonitoringAndEvaluation = 'monitoring_and_evaluation',
  AchievementIKU = 'achievement_iku'
}


export interface TimelineEventInterface {
  _id: string
  timeline: string
  step: TimelineEventType
  participants: Array<string>
  title: string
  description: string
  createdAt: Date
  startedAt: Date
  finishedAt: Date
  stepIndex: number
  status: TimelineEventStatus
}

function TimelineEventList(props: StoreProps) {
  const history = useHistory()
  const { token, department, urlPrefix } = props
  const { idTimeline } = useParams<{ idTimeline: string }>()
  const [columnLayout, setColumnLayout] = useState('is-12')
  const [timelineEventList, setTimelineEventList] = useState<Array<TimelineEventInterface>>([])
  const [reloadData, setReloadData] = useState<number>(Date.now())
  const [focusedTimelineEvent, setFocusedTimelineEvent] = useState<string>()
  const [removeTimelineEventConfirmation, setRemoveTimelineEventConfirmation] = useState<boolean>(false)

  const confirmRemoveTimelineEvent = (id: string) => {
    setFocusedTimelineEvent(id)
    setRemoveTimelineEventConfirmation(true)
  }

  const removeTimelineEvent = () => {
    setRemoveTimelineEventConfirmation(false)

    if (!focusedTimelineEvent) {
      return
    }

    const fetchInitOpt: RequestInit = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/${idTimeline}/event${focusedTimelineEvent}`, fetchInitOpt)
      .then((response) => response.json())
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

    fetch(`${API_URL + urlPrefix}/timeline-event?timeline=${idTimeline}`, fetchInitOpt)
      .then((response) => response.json())
      .then((response: APIResponse<{ timelineEvents: Array<TimelineEventInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setTimelineEventList(message.timelineEvents.filter((timelineEvent)=>timelineEvent.stepIndex != 5 && timelineEvent.stepIndex != 6))
      })
      .catch((err) => toast(err.message, { type: 'error' }))
  }, [token, department, urlPrefix, reloadData])

  return (
    <Fragment>
      <div className="mt-3">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h4 className="title is-size-4">Daftar Tahapan</h4>
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
                <Link to={`${urlPrefix}/timeline/${idTimeline}/event/form`} className="button is-small is-right ml-1">
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faPlusCircle} />
                  </div>
                  <span>Tambah Tahapan</span>
                </Link>
              }
              <button className="button is-small is-default ml-1" onClick={() => history.goBack()}>
                <div className="icon is-small is-left">
                  <FontAwesomeIcon icon={faArrowCircleLeft} />
                </div>
                <span>Kembali</span>
              </button>
            </div>
          </div>
        </div>
        <div className="columns is-multiline">
          {timelineEventList.length == 0 &&
            <div className={`column ${columnLayout}`}>
              <div className="card">
                <div className="card-content">
                  <div className="is-flex is-flex-direction-column is-align-items-center">
                    <FontAwesomeIcon className="is-size-1 mb-3" icon={faExclamationCircle} />
                    <p className="is-size-5">Tahapan tidak ditemukan</p>
                  </div>
                </div>
              </div>
            </div>}
          {timelineEventList.sort((prev, next) => prev.stepIndex - next.stepIndex).map((timelineEvent) => (
            <div key={timelineEvent._id} className={`column ${columnLayout}`}>
              <div className="card">
                <div className="card-content">
                  <div className="title">{timelineEvent.title}</div>
                  <div className="subtitle is-size-7">{DateTime.fromJSDate(new Date(timelineEvent.startedAt)).setLocale('id-ID').toFormat('EEEE, d LLLL yyyy')} - {DateTime.fromJSDate(new Date(timelineEvent.finishedAt)).setLocale('id-ID').toFormat('EEEE, d LLLL yyyy')}</div>
                  <p>{timelineEvent.description}</p>
                </div>
                <div className="card-footer">
                  <Link to={`${urlPrefix}/timeline/${idTimeline}/event/read/${timelineEvent._id}`} className="card-footer-item">
                    <div className="icon is-small is-left mr-1">
                      <FontAwesomeIcon icon={faEye} />
                    </div>
                    <span>Lihat</span>
                  </Link>
                  {urlPrefix == '/admin' &&
                    <>
                      <Link to={`${urlPrefix}/timeline/${idTimeline}/event/participant/${timelineEvent._id}`} className="card-footer-item">
                        <div className="icon is-small is-left mr-1">
                          <FontAwesomeIcon icon={faUserEdit} />
                        </div>
                        <span>Peserta</span>
                      </Link>
                      <Link to={`${urlPrefix}/timeline/${idTimeline}/event/form/${timelineEvent._id}`} className="card-footer-item">
                        <div className="icon is-small is-left mr-1">
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </div>
                        <span>Ubah</span>
                      </Link>
                      <a href="/" className="card-footer-item" onClick={(ev) => {
                        ev.preventDefault(); setFocusedTimelineEvent(timelineEvent._id); confirmRemoveTimelineEvent(timelineEvent._id)
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
      {removeTimelineEventConfirmation && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setRemoveTimelineEventConfirmation(false)}></div>
          <div className="modal-content">
            <div className="box">
              <h4 className="title is-size-4 has-text-centered">Anda yakin akan menghapus event ini?</h4>
              <div className="has-text-centered">
                <button className="button is-danger" onClick={removeTimelineEvent}>
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <span>Lanjutkan</span>
                </button>
                <button className="button is-default ml-1" onClick={() => setRemoveTimelineEventConfirmation(false)}>
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

export default StoreConnector(TimelineEventList)
