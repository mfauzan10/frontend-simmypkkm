import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import MUIDataTable from 'mui-datatables'
import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import APIResponse from '../interfaces/APIResponse'
import Loading from '../layouts/Loading'
import { StoreConnector, StoreProps } from '../redux/actions'
import { tableOptions } from '../utils/table'
import { ActivityInterface, EventInterface, ProposalInterface } from './ProposalList'

const API_URL = process.env.REACT_APP_API_URL

export interface EventSummaryInterface {
  department: string
  departmentId: string
  numberOfActivity: number
  numberOfSubActivity: number
}

function EventList(props: StoreProps) {
  const { token, urlPrefix } = props
  const [isLoading, setLoading] = useState(false)
  const [proposalList, setProposalList] = useState<Array<ProposalInterface>>([])
  const [eventSummaryList, setActivitySummaryList] = useState<Array<EventSummaryInterface>>([])

  const columns = [{
    name: "department",
    label: "Prodi",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "numberOfActivity",
    label: "Jumlah aktivitas",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "numberOfSubActivity",
    label: "Jumlah subaktivitas",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "action",
    label: "Aksi",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (data: string, tableMeta: any) => {
        const proposal = proposalList[tableMeta.rowIndex]
        return <Link to={`${urlPrefix}/activity/${proposal._id}`} className='button is-small mx-1'>
          <span>Lihat</span>
        </Link>
      }
    }
  }]

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    setLoading(true)

    fetch(`${API_URL + urlPrefix}/proposal/step/2`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ proposals: Array<ProposalInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setProposalList(message.proposals.filter((proposal) => proposal))
        setLoading(false)
      })
      .catch(err => toast(err.message, { type: 'error' }))
  }, [token, urlPrefix])

  useEffect(() => {
    if (proposalList.length > 0) {
      const newActivitySummaryList: Array<EventSummaryInterface> = []

      let numberOfSubActivity = 0
      proposalList.map((proposal) => {
        const eventData = proposal.data as EventInterface

        (proposal.data as EventInterface).activityList.map((activity: ActivityInterface) => {
          numberOfSubActivity += activity.subActivityList.length
        })

        newActivitySummaryList.push({
          department: proposal.department,
          departmentId: proposal.departmentId,
          numberOfActivity: eventData.activityList.length,
          numberOfSubActivity: numberOfSubActivity
        })

        numberOfSubActivity = 0
      })
      setActivitySummaryList(newActivitySummaryList)
    }
  }, [proposalList])

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
              <h4 className="title is-size-4">Daftar Prodi</h4>
            </div>
          </div>
        </div>
        <h6 className="title is-size-6">Berdasarkan form pada tahap Aktivitas</h6>
        <div className="columns is-multiline">
          {eventSummaryList.length == 0 &&
            <div className={`column is-12`}>
              <div className="card">
                <div className="card-content">
                  <div className="is-flex is-flex-direction-column is-align-items-center">
                    <FontAwesomeIcon className="is-size-1 mb-3" icon={faExclamationCircle} />
                    <p className="is-size-5">Aktivitas tidak ditemukan</p>
                  </div>
                </div>
              </div>
            </div>}
          <div className={`column is-12`}>
            <div className="m-2">
              {eventSummaryList.length > 0 &&
                <MUIDataTable
                  title={''}
                  data={eventSummaryList}
                  columns={columns}
                  options={tableOptions}
                />
              }
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default StoreConnector(EventList)
