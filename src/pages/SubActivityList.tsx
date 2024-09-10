import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Box, Grid, Typography } from '@mui/material'
import { blue, green, yellow } from '@mui/material/colors'
import { DateTime } from 'luxon'
import MUIDataTable from 'mui-datatables'
import { Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import APIResponse from '../interfaces/APIResponse'
import Loading from '../layouts/Loading'
import { StoreConnector, StoreProps } from '../redux/actions'
import { tableOptions } from '../utils/table'
import { SubActivityStatus } from './Admin'
import { DepartmentInterface } from './main/DepartmentForm'
import { ActivityInterface, EventInterface, ProposalInterface, SubActivityInterface } from './ProposalList'

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
  code: string
  title: string
  description: string
  createdAt: Date
  participantType: TimelineParticipantType
  status: TimelineStatus
}

function SubActivityList(props: StoreProps) {
  const { token, urlPrefix } = props
  const { proposalId, activityId } = useParams() as { proposalId: string, activityId: string }
  const [isLoading, setLoading] = useState(false)
  const [proposalData, setProposalData] = useState<ProposalInterface>()
  const [activityData, setActivityData] = useState<ActivityInterface>()
  const [departmentData, setDepartmentData] = useState<DepartmentInterface>()
  const [subActivityList, setSubSubActivityList] = useState<Array<SubActivityInterface>>([])

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
    name: "department",
    label: "Prodi",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "place",
    label: "Tempat",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "startedAt",
    label: "Tanggal mulai",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (date: string, tableMeta: any) => {
        return <Typography>{DateTime.fromJSDate(new Date(date)).setLocale('id-ID').toFormat('EEEE, d LLLL yyyy')}</Typography>
      }
    }
  },
  {
    name: "finishedAt",
    label: "Tanggal berakhir",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (date: string, tableMeta: any) => {
        return <Typography>{DateTime.fromJSDate(new Date(date)).setLocale('id-ID').toFormat('EEEE, d LLLL yyyy')}</Typography>
      }
    }
  },
  {
    name: "Status",
    label: "Status",
    options: {
      filter: true,
      sort: true,
      customBodyRender: (_: string, tableMeta: any) => {
        const subActivity = subActivityList[tableMeta.rowIndex]
        const startedAt = new Date(subActivity.startedAt)
        const finishedAt = new Date(subActivity.finishedAt)
        const now = new Date()
        let status = SubActivityStatus.Pending
        if (now < startedAt) {
          status = SubActivityStatus.Pending
        } else if (now < finishedAt) {
          status = SubActivityStatus.Started
        } else {
          status = SubActivityStatus.Finished
        }
        return (<Grid container>
          {status == SubActivityStatus.Pending && <Box sx={{ backgroundColor: yellow[100], borderRadius: 3, padding: 1 }}><Typography color={yellow[500]}></Typography>Belum dimulai</Box>}
          {status == SubActivityStatus.Started && <Box sx={{ backgroundColor: green[100], borderRadius: 3, padding: 1 }}><Typography color={green[500]}></Typography>Sedang berlangsung</Box>}
          {status == SubActivityStatus.Finished && <Box sx={{ backgroundColor: blue[100], borderRadius: 3, padding: 1 }}><Typography color={blue[500]}>Selesai</Typography></Box>}
        </Grid>);
      },
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

  useEffect(()=>{
    if(!proposalData) {
      return
    }

    setActivityData((proposalData.data as EventInterface).activityList[parseInt(activityId)])
  }, [proposalData])

  useEffect(() => {
    if (!activityData) {
      return
    }

    const newSubSubActivityList: Array<SubActivityInterface> = []

    activityData.subActivityList.map((subActivity) => {
      newSubSubActivityList.push({
        department: proposalData.department,
        ...subActivity
      })
    })

    setSubSubActivityList(newSubSubActivityList)
  }, [activityData])

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
              <h4 className="title is-size-4">Daftar Sub Aktivitas Dari Aktivitas {activityData?.code}</h4>
            </div>
          </div>
        </div>
        <h6 className="title is-size-6">Prodi {departmentData?.title}</h6>
        <div className="columns is-multiline">
          {subActivityList.length == 0 &&
            <div className={`column is-12`}>
              <div className="card">
                <div className="card-content">
                  <div className="is-flex is-flex-direction-column is-align-items-center">
                    <FontAwesomeIcon className="is-size-1 mb-3" icon={faExclamationCircle} />
                    <p className="is-size-5">Sub Aktivitas tidak ditemukan</p>
                  </div>
                </div>
              </div>
            </div>}
          <div className={`column is-12`}>
            <div className="m-2">
              {subActivityList.length > 0 &&
                <MUIDataTable
                  title={''}
                  data={subActivityList}
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

export default StoreConnector(SubActivityList)
