import {faArrowCircleLeft, faCheckCircle} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {DateTime} from 'luxon'
import {useEffect, useState} from 'react'
import {useHistory, useParams} from 'react-router'
import {toast} from 'react-toastify'
import APIResponse from '../../interfaces/APIResponse'
import {StoreConnector, StoreProps} from '../../redux/actions'

const API_URL = process.env.REACT_APP_API_URL

export enum TimelineEventStatus {
  Draft = 'draft',
  Publish = 'publish'
}

export interface TimelineEventInterface {
  _id: string
  title: string
  description: string
  stepIndex: number
  startedAt: Date
  finishedAt: Date
  status: TimelineEventStatus
}

function TimelineEventForm(props: StoreProps) {
  const {token, department, urlPrefix} = props
  const {id, idTimeline} = useParams<{ id?: string, idTimeline?: string }>()
  const history = useHistory()
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [stepIndex, setStepIndex] = useState<string>('1')
  const [startedAt, setDateStart] = useState<string>(DateTime.now().toFormat('yyyy-MM-dd'))
  const [finishedAt, setDateEnd] = useState<string>(DateTime.now().toFormat('yyyy-MM-dd'))
  const [status, setStatus] = useState<TimelineEventStatus>(TimelineEventStatus.Publish)

  const submitTimelineEvent = () => {
    const form = new URLSearchParams()

    form.append('title', title)
    form.append('description', description)
    form.append('stepIndex', stepIndex)
    form.append('startedAt', startedAt)
    form.append('finishedAt', finishedAt)
    form.append('status', status)

    const fetchInitOpt: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    }

    const url = new URL(`${API_URL + urlPrefix}/timeline-event`)

    if (id) {
      url.pathname = `${url.pathname}/${id}`
    }

    url.searchParams.append('timeline', idTimeline!)

    fetch(url.toString(), fetchInitOpt)
        .then((response) => response.json())
        .then(async function(response: APIResponse) {
          const {success} = response

          if (!success) {
            toast('Gagal menyimpan data!', {type: 'error'})
            return
          }

          toast('Berhasil menyimpan Tahapan!', {type: 'success'});

          history.goBack()
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

    fetch(`${API_URL + urlPrefix}/timeline-event/${id}?timeline=${idTimeline}`, fetchInitOpt)
        .then((response) => response.json())
        .then((response: APIResponse<{ timelineEvent: TimelineEventInterface }>) => {
          const {success, message} = response

          if (!success) {
            toast('Gagal mengambil data!', {type: 'error'})
            return
          }

          const {timelineEvent} = message

          setTitle(timelineEvent.title)
          setStepIndex(timelineEvent.stepIndex.toString())
          setDescription(timelineEvent.description)
          setDateStart(DateTime.fromJSDate(new Date(timelineEvent.startedAt)).toFormat('yyyy-MM-dd'))
          setDateEnd(DateTime.fromJSDate(new Date(timelineEvent.finishedAt)).toFormat('yyyy-MM-dd'))
          setStatus(timelineEvent.status)
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
                  <h6 className="title is-size-6">Form Tahap</h6>
                </div>
              </div>
              <div className="level-right">
                <button className="button is-small is-primary" onClick={submitTimelineEvent}>
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
                    onChange={(ev) => setTitle(ev.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="description">Deskripsi</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    value={description}
                    onChange={(ev) => setDescription(ev.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="stepIndex">Tahap ke</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    value={stepIndex}
                    onChange={(ev) => setStepIndex(ev.target.value)}
                  />
                </div>
              </div>
              <div className="columns">
                <div className="column">
                  <label htmlFor="start">Mulai</label>
                  <div className="control">
                    <input type="date" className="input" value={startedAt} onChange={(ev) => setDateStart(ev.target.value)} />
                  </div>
                </div>
                <div className="column">
                  <label htmlFor="end">Selesai</label>
                  <div className="control">
                    <input type="date" className="input" value={finishedAt} onChange={(ev) => setDateEnd(ev.target.value)} />
                  </div>
                </div>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <div className="select is-fullwidth">
                  <select name="status" id="status" value={status} onChange={(ev) => setStatus(ev.target.value as TimelineEventStatus)}>
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

export default StoreConnector(TimelineEventForm)
