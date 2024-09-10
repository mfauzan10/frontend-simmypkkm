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
import { formatRupiah } from './FundDishbursementList'
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

export interface FundUsingSummaryInterface {
  department: string
  numberOfComponentAccepted: number
  fundingAcceptedTools: number
  fundingAcceptedIncentive: number
  fundingAccepted: number
  fundingUsed: number
  usedPercentage: string
}

function FundingList(props: StoreProps) {
  const { token, urlPrefix } = props
  const [isLoading, setLoading] = useState(false)
  const [proposalList, setProposalList] = useState<Array<ProposalInterface>>([])
  const [fundingList, setFundingList] = useState<Array<FundUsingSummaryInterface>>([])

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
      name: "numberOfComponentAccepted",
      label: "Jumlah Komponen Anggaran",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (numberOfComponentAccepted: string, tableMeta: any) => {
          return <Typography>{numberOfComponentAccepted}</Typography>
        }
      }
    },
    {
      name: "fundingAccepted",
      label: "Dana Peralatan Diterima",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (fundingAccepted: string, tableMeta: any) => {
          return <Typography>{formatRupiah(fundingAccepted.toString())}</Typography>
        }
      }
    },
    {
      name: "fundingAcceptedIncentive",
      label: "Dana Insentif Diterima",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (fundingAcceptedIncentive: string, tableMeta: any) => {
          return <Typography>{formatRupiah(fundingAcceptedIncentive.toString())}</Typography>
        }
      }
    },
    {
      name: "fundingAccepted",
      label: "Total Dana Diterima",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (fundingAcceptedIncentive: string, tableMeta: any) => {
          return <Typography>{formatRupiah(fundingAcceptedIncentive.toString())}</Typography>
        }
      }
    },
    {
      name: "fundingUsed",
      label: "Total Dana Digunakan",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (fundingAccepted: string, tableMeta: any) => {
          return <Typography>{formatRupiah(fundingAccepted.toString())}</Typography>
        }
      }
    },
    {
      name: "usedPercentage",
      label: "Prosentase Penggunaan (%)",
      options: {
        filter: true,
        sort: false,
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
      let newFundingList: Array<FundUsingSummaryInterface> = []
      proposalList.map((proposal, index) => {
        let fundingAcceptedTools = 0
        let fundingAcceptedIncentive = 0
        let numberOfComponentAccepted = 0
        let fundingAccepted = 0
        let fundingUsed = 0

        const data = proposal.data as ReportAndSPJInterface

        data.tableTools.map((rowTools) => {
          if (rowTools[9]) {
            fundingAccepted += !isNaN(parseInt(rowTools[8])) ? parseInt(rowTools[8]) : 0
            fundingAcceptedTools += !isNaN(parseInt(rowTools[8])) ? parseInt(rowTools[8]) : 0
            numberOfComponentAccepted++
          }
          if (rowTools[10]) {
            fundingUsed += !isNaN(parseInt(rowTools[8])) ? parseInt(rowTools[8]) : 0
          }
        })

        data.tableIncentive.map((rowIncentive) => {
          if (rowIncentive[11]) {
            fundingAccepted += !isNaN(parseInt(rowIncentive[11])) ? parseInt(rowIncentive[11]) : 0
            fundingAcceptedIncentive += !isNaN(parseInt(rowIncentive[11])) ? parseInt(rowIncentive[11]) : 0
            numberOfComponentAccepted++
          }
          if (rowIncentive[12]) {
            fundingUsed += !isNaN(parseInt(rowIncentive[12])) ? parseInt(rowIncentive[12]) : 0
          }
        })

        newFundingList = [...newFundingList, ...[{
          department: proposal.department,
          numberOfComponentAccepted: numberOfComponentAccepted,
          fundingAcceptedTools: fundingAcceptedTools,
          fundingAcceptedIncentive: fundingAcceptedIncentive,
          fundingAccepted: fundingAccepted,
          fundingUsed: fundingUsed,
          usedPercentage: (fundingUsed / fundingAccepted * 100).toFixed(2)
        }]]
      })

      setFundingList([...newFundingList])
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
              <h4 className="title is-size-4">Daftar Pencairan Dana</h4><br/>
            </div>
          </div>
        </div>
        <h6 className="title is-size-6">Berdasarkan form pada tahap Laporan dan SPJ</h6>
        <div className="columns is-multiline">
          {fundingList.length == 0 &&
            <div className={`column is-12`}>
              <div className="card">
                <div className="card-content">
                  <div className="is-flex is-flex-direction-column is-align-items-center">
                    <FontAwesomeIcon className="is-size-1 mb-3" icon={faExclamationCircle} />
                    <p className="is-size-5">Pencairan dana tidak ditemukan</p>
                  </div>
                </div>
              </div>
            </div>}
          <div className={`column is-12`}>
            <div className="m-2">
              {fundingList.length > 0 && <MUIDataTable
                title={''}
                data={fundingList}
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

export default StoreConnector(FundingList)
