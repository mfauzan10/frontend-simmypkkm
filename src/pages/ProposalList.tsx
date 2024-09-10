import { faEllipsisV, faEraser, faExclamationCircle, faEye, faPencilAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DateTime } from "luxon"
import { Fragment, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import APIResponse from "../interfaces/APIResponse"
import UserInterface from "../interfaces/UserInterface"
import { StoreConnector, StoreProps } from "../redux/actions"

const API_URL = process.env.REACT_APP_API_URL

export enum ProposalStatus {
  Approve = 'approve',
  Send = 'send',
  Decline = 'decline',
  Revision = 'revision'
}

export interface IKUDataInterface {
  year: number
  total: number
  ratio: number
}

export interface IKUInterface {
  code: number
  description: string
  baseline: Array<IKUDataInterface>
  target: Array<IKUDataInterface>
  realization: Array<IKUDataInterface>
}

export interface ActivityInterface {
  code: string
  title: string
  background: string
  goal: string
  mechanism: string
  partner: string
  resource: string
  indicator: string
  continuity: string
  pic: string
}

export interface SelectionInterface {
  title: string
  description: string
  leader: string
  file: string
  attachment: string
  historyFile: Array<{
    title: string,
    file: string,
    createdAt: string,
    comment: string,
    status: ProposalStatus
  }>
}

export interface ProgramPlanningInterface {
  detailProgram: {
    title: string
    code: string
    scheme: string
    submission: string
    batch: string
  }
  roadmap: string
  IKU: string[][]
  activityList: Array<ActivityInterface>
}


export interface EventInterface {
  title: string
  code: string
  activityList: Array<ActivityInterface>
}

export interface ActivityInterface {
  title: string
  code: string
  subActivityList: Array<SubActivityInterface>
  comment: string
  status: ProposalInterface
  funding: string[][]
}

export interface SubActivityInterface {
  department?: string
  title: string
  code: string
  PIC: string
  instruction: string
  startedAt: string
  finishedAt: string
  place: string
  sourcePerson: string
  participant: string
  description?: string
  funding?: number
  youtubeLink?: string
  publicationLink?: string
  documentationLink?: string
}

export interface FundDisbursementInterface {
  tableTools: string[][]
  tableIncentive: string[][]
}
export interface ReportAndSPJInterface {
  activityList: string[][]
  tableTools: string[][]
  tableIncentive: string[][]
  IKU: string[][]
}

export interface MonitoringAndEvaluationInterface {
  activityList: string[][]
  research: string
}
export interface ProposalInterface {
  _id: string
  title: string
  description: string
  department: string
  departmentId: string
  file: string
  data: any
  scores: number
  createdBy: string
  createdById: string
  createdAt: Date
  updatedAt: Date
  comment: string
  reviewer: string | Array<UserInterface>
  reviewerId: string
  status: ProposalStatus
}

function ProposalList(props: StoreProps) {
  const { token, department, urlPrefix } = props
  const [columnLayout, setColumnLayout] = useState('is-12')
  const [proposalList, setProposalList] = useState<Array<ProposalInterface>>([])
  const [reloadData, setReloadData] = useState<number>(Date.now())
  const [focusedProposal, setFocusedProposal] = useState<string>()
  const [removeProposalConfirmation, setRemoveProposalConfirmation] = useState<boolean>(false)

  const confirmRemoveProposal = (id: string) => {
    setFocusedProposal(id)
    setRemoveProposalConfirmation(true)
  }

  const removeProposal = () => {
    setRemoveProposalConfirmation(false)

    if (!focusedProposal) {
      return
    }

    const fetchInitOpt: RequestInit = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/proposal/${focusedProposal}`, fetchInitOpt)
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

    fetch(`${API_URL + urlPrefix}/proposal`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ proposals: Array<ProposalInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setProposalList(message.proposals)
      })
      .catch(err => toast(err.message, { type: 'error' }))
  }, [token, department, urlPrefix, reloadData])

  return (
    <Fragment>
      <div className="mt-3">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h4 className="title is-size-4">Daftar Proposal</h4>
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
            </div>
          </div>
        </div>
        <div className="columns is-multiline">
          {proposalList.length == 0 &&
            <div className={`column ${columnLayout}`}>
              <div className="card">
                <div className="card-content">
                  <div className="is-flex is-flex-direction-column is-align-items-center">
                    <FontAwesomeIcon className="is-size-1 mb-3" icon={faExclamationCircle} />
                    <p className="is-size-5">Proposal tidak ditemukan</p>
                  </div>
                </div>
              </div>
            </div>}
          {proposalList.map(proposal => (
            <div className={`column ${columnLayout}`}>
              <div className="card">
                <div className="card-content">
                  <div className="title">{proposal.title}</div>
                  <div className="subtitle is-size-7">{DateTime.fromJSDate(new Date(proposal.createdAt)).setLocale('id-ID').toFormat('EEEE, d LLLL yyyy')}</div>
                  <small>Departemen: {proposal.department}</small>
                </div>
                <div className="card-footer">
                  <a href={`${API_URL}${proposal.file}`} className="card-footer-item">
                    <div className="icon is-small is-left mr-1">
                      <FontAwesomeIcon icon={faEye} />
                    </div>
                    <span>Lihat</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  )
}

export default StoreConnector(ProposalList)