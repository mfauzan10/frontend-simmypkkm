import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import MUIDataTable from 'mui-datatables'
import { Fragment, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import APIResponse from '../interfaces/APIResponse'
import Loading from '../layouts/Loading'
import { StoreConnector, StoreProps } from '../redux/actions'
import { tableOptions } from '../utils/table'
import { formatRupiah } from './FundDishbursementList'
import { DepartmentInterface } from './main/DepartmentForm'
import { EventInterface, ProposalInterface } from './ProposalList'

const API_URL = process.env.REACT_APP_API_URL

export interface ActivitySummaryInterface {
  proposalId: string
  activityId: string
  title: string
  code: string
  funding: string
  numberOfSubActivity: number
  numberOfSubActivityPlan: number
  numberOfSubActivityStarted: number
  numberOfSubActivityFinished: number
}

function ActivityList(props: StoreProps) {
  const { token, urlPrefix } = props
  const { proposalId } = useParams() as { proposalId: string }
  const [isLoading, setLoading] = useState(false)
  const [proposalData, setProposalData] = useState<ProposalInterface>()
  const [departmentData, setDepartmentData] = useState<DepartmentInterface>()
  const [activitySummaryList, setActivitySummaryList] = useState<Array<ActivitySummaryInterface>>([])

  const columns = [{
    name: "code",
    label: "Kode",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "title",
    label: "Judul",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "funding",
    label: "Jumlah anggaran",
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
    name: "numberOfSubActivityPlan",
    label: "Jumlah subaktivitas belum dimulai",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "numberOfSubActivityStarted",
    label: "Jumlah subaktivitas berlangsung",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "numberOfSubActivityFinished",
    label: "Jumlah subaktivitias selesai",
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
        return <Link to={`${urlPrefix}/activity/${proposalData._id}/${tableMeta.rowIndex}`} className='button is-small mx-1'>
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

    fetch(`${API_URL + urlPrefix}/proposal/${proposalId}`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ proposal: ProposalInterface }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setProposalData(message.proposal)
        setLoading(false)
      })
      .catch(err => toast(err.message, { type: 'error' }))
  }, [token, urlPrefix])

  useEffect(() => {
    if (!proposalData) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    setLoading(true)

    fetch(`${API_URL + urlPrefix}/department/${proposalData.department}`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ department: DepartmentInterface }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setDepartmentData(message.department)
        setLoading(false)
      })
      .catch(err => toast(err.message, { type: 'error' }))
  }, [proposalData])

  useEffect(() => {
    if(!proposalData) {
      return
    }

    const eventData: EventInterface = proposalData.data as EventInterface
    const newActivitySummaryList: Array<ActivitySummaryInterface> = []

    let numberOfSubActivity = 0
    eventData.activityList.map((activity, index) => {
      let funding = 0 

      activity.funding.map((rowFunding)=>{
        const pkkm = rowFunding[3] ? parseInt(rowFunding[3]) : 0
        const pt = rowFunding[4] ? parseInt(rowFunding[4]) : 0
        const partner = rowFunding[5] ? parseInt(rowFunding[5]) : 0

        funding += !isNaN(pkkm) ? pkkm : 0
        funding += !isNaN(pt) ? pt : 0
        funding += !isNaN(partner) ? partner : 0
      })

      newActivitySummaryList.push({
        proposalId: proposalData._id,
        activityId: index.toString(),
        title: activity.title,
        code: activity.code,
        funding: formatRupiah(funding.toString()),
        numberOfSubActivity: activity.subActivityList.length,
        numberOfSubActivityPlan: activity.subActivityList.filter((subActivity)=>new Date(subActivity.startedAt) > new Date()).length,
        numberOfSubActivityStarted: activity.subActivityList.filter((subActivity)=>new Date(subActivity.startedAt) <= new Date() && new Date(subActivity.finishedAt) >= new Date()).length,
        numberOfSubActivityFinished: activity.subActivityList.filter((subActivity)=>new Date(subActivity.finishedAt) > new Date()).length
      })

      numberOfSubActivity = 0
    })
    setActivitySummaryList(newActivitySummaryList)
  }, [proposalData])

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
              <h4 className="title is-size-4">Daftar Aktivitas</h4>
            </div>
          </div>
        </div>
        <h6 className="title is-size-6">Prodi {departmentData?.title}</h6>
        <div className="columns is-multiline">
          {activitySummaryList.length == 0 &&
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
              {activitySummaryList.length > 0 &&
                <MUIDataTable
                  title={''}
                  data={activitySummaryList}
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

export default StoreConnector(ActivityList)
