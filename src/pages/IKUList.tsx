import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Typography } from '@mui/material'
import MUIDataTable from 'mui-datatables'
import { Fragment, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import APIResponse from '../interfaces/APIResponse'
import Loading from '../layouts/Loading'
import { StoreConnector, StoreProps } from '../redux/actions'
import { tableOptions } from '../utils/table'
import { ProposalInterface, ReportAndSPJInterface } from './ProposalList'

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

export interface FundDisbursementSummaryInterface {
  department: string
  baselineThisYear: number
  targetThisYear: number
  realizationThisYear: number
  targetNextYear: number
}

function IKUList(props: StoreProps) {
  const { token, urlPrefix } = props
  const [isLoading, setLoading] = useState(false)
  const [proposalList, setProposalList] = useState<Array<ProposalInterface>>([])
  const [IKUList, setIKUList] = useState<Array<FundDisbursementSummaryInterface>>([])

  const columns = [
    {
      name: "department",
      label: "Prodi",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (department: string, tableMeta: any) => {
          return <Typography>{department}</Typography>
        }
      }
    },
    {
      name: "baselineThisYear",
      label: "Rata-Rata Baseline Th. 2022 (%)",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (baselineThisYear: string, tableMeta: any) => {
          return <Typography>{baselineThisYear.toString()}</Typography>
        }
      }
    },
    {
      name: "targetThisYear",
      label: "Rata-Rata Target Th. 2022 (%)",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (targetThisYear: string, tableMeta: any) => {
          return <Typography>{targetThisYear.toString()}</Typography>
        }
      }
    },
    {
      name: "realizationThisYear",
      label: "Rata-Rata Realisasi Th. 2022 (%)",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (realizationThisYear: string, tableMeta: any) => {
          return <Typography>{realizationThisYear.toString()}</Typography>
        }
      }
    },
    {
      name: "targetNextYear",
      label: "Target Th. 2023 (%)",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (targetNextYear: string, tableMeta: any) => {
          return <Typography>{targetNextYear.toString()}</Typography>
        }
      }
    },]

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

    fetch(`${API_URL + urlPrefix}/proposal/step/4`, fetchInitOpt)
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
      let newIKUList: Array<FundDisbursementSummaryInterface> = []
      proposalList.map((proposal, index) => {
        let baselineThisYear = 0
        let targetThisYear = 0
        let realizationThisYear = 0
        let targetNextYear = 0
        let numberOfIKU = 0

        const data = proposal.data as ReportAndSPJInterface

        data.IKU.map((rowIKU) => {
          numberOfIKU++
          if (rowIKU[3]) {
            baselineThisYear += !isNaN(parseInt(rowIKU[3])) ? parseInt(rowIKU[3]) : 0
          }
          if (rowIKU[5]) {
            targetThisYear += !isNaN(parseInt(rowIKU[5])) ? parseInt(rowIKU[5]) : 0
          }
          if (rowIKU[7]) {
            targetNextYear += !isNaN(parseInt(rowIKU[7])) ? parseInt(rowIKU[7]) : 0
          }
          if (rowIKU[9]) {
            realizationThisYear += !isNaN(parseInt(rowIKU[9])) ? parseInt(rowIKU[9]) : 0
          }
        })

        newIKUList = [...newIKUList, ...[{
          department: proposal.department,
          baselineThisYear: baselineThisYear / numberOfIKU,
          targetThisYear: targetThisYear / numberOfIKU,
          realizationThisYear: realizationThisYear / numberOfIKU,
          targetNextYear: targetNextYear / numberOfIKU
        }]]
      })

      setIKUList([...newIKUList])
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
              <h4 className="title is-size-4">Daftar Ketercapaian IKU</h4><br/>
            </div>
          </div>
        </div>
        <h6 className="title is-size-6">Berdasarkan form pada tahap Laporan dan SPJ</h6>
        <div className="columns is-multiline">
          {IKUList.length == 0 &&
            <div className={`column is-12`}>
              <div className="card">
                <div className="card-content">
                  <div className="is-flex is-flex-direction-column is-align-items-center">
                    <FontAwesomeIcon className="is-size-1 mb-3" icon={faExclamationCircle} />
                    <p className="is-size-5">Ketercapaian IKU tidak ditemukan</p>
                  </div>
                </div>
              </div>
            </div>}
          <div className={`column is-12`}>
            <div className="m-2">
              {IKUList.length > 0 && <MUIDataTable
                title={''}
                data={IKUList}
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

export default StoreConnector(IKUList)
