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
import { FundDisbursementInterface, ProposalInterface } from './ProposalList'

export const formatRupiah = (value) => {
  let numberString = value.replace(/[^,\d]/g, '').toString()
  let split = numberString.split(',')
  let rest = split[0].length % 3
  let rupiah = split[0].substr(0, rest)
  let thousand = split[0].substr(rest).match(/\d{3}/gi)

  if(thousand){
    const separator = rest ? '.' : '';
    rupiah += separator + thousand.join('.');
  }

  rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
  return 'Rp. ' + rupiah
}

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
  numberOfComponentProposal: number
  fundingProposalTools: number
  fundingProposalIncentive: number
  fundingProposal: number
  fundingAccepted: number
  acceptedPercentage: string
}

function FundingList(props: StoreProps) {
  const { token, urlPrefix } = props
  const [isLoading, setLoading] = useState(false)
  const [proposalList, setProposalList] = useState<Array<ProposalInterface>>([])
  const [fundingList, setFundingList] = useState<Array<FundDisbursementSummaryInterface>>([])

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
      name: "numberOfComponentProposal",
      label: "Jumlah Komponen Anggaran",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (numberOfComponentProposal: string, tableMeta: any) => {
          return <Typography>{numberOfComponentProposal}</Typography>
        }
      }
    },
    {
      name: "fundingProposalTools",
      label: "Dana Peralatan Diusulkan",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (fundingProposalTools: string, tableMeta: any) => {
          return <Typography>{formatRupiah(fundingProposalTools.toString())}</Typography>
        }
      }
    },
    {
      name: "fundingProposalIncentive",
      label: "Dana Insentif Diusulkan",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (fundingProposalIncentive: string, tableMeta: any) => {
          return <Typography>{formatRupiah(fundingProposalIncentive.toString())}</Typography>
        }
      }
    },
    {
      name: "fundingProposal",
      label: "Total Dana Diusulkan",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (fundingProposal: string, tableMeta: any) => {
          return <Typography>{formatRupiah(fundingProposal.toString())}</Typography>
        }
      }
    },
    {
      name: "fundingAccepted",
      label: "Total Dana Cair",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (fundingAccepted: string, tableMeta: any) => {
          return <Typography>{formatRupiah(fundingAccepted.toString())}</Typography>
        }
      }
    },
    {
      name: "acceptedPercentage",
      label: "Prosentase Pencairan (%)",
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

    fetch(`${API_URL + urlPrefix}/proposal/step/3`, fetchInitOpt)
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
      let newFundingList: Array<FundDisbursementSummaryInterface> = []
      proposalList.map((proposal, index) => {
        let fundingProposalTools = 0
        let fundingProposalIncentive = 0
        let numberOfComponentProposal = 0
        let fundingProposal = 0
        let fundingAccepted = 0

        const data = proposal.data as FundDisbursementInterface

        data.tableTools.map((rowTools) => {
          if (rowTools[8]) {
            fundingProposalTools += !isNaN(parseInt(rowTools[8])) ? parseInt(rowTools[8]) : 0
            numberOfComponentProposal++
          }
          if (rowTools[9]) {
            if (rowTools[9] === '1') {
              fundingAccepted += !isNaN(parseInt(rowTools[8])) ? parseInt(rowTools[8]) : 0
            }
          }
        })

        data.tableIncentive.map((rowIncentive) => {
          if (rowIncentive[10]) {
            fundingProposalIncentive += !isNaN(parseInt(rowIncentive[10])) ? parseInt(rowIncentive[10]) : 0
            numberOfComponentProposal++
          }
          if (rowIncentive[11]) {
            if (rowIncentive[11] === '1') {
              fundingAccepted += !isNaN(parseInt(rowIncentive[10])) ? parseInt(rowIncentive[10]) : 0
            }
          }
        })

        fundingProposal = fundingProposalTools + fundingProposalIncentive

        console.log(fundingProposalTools)
        console.log(fundingProposal)

        newFundingList = [...newFundingList, ...[{
          department: proposal.department,
          numberOfComponentProposal: numberOfComponentProposal,
          fundingProposalTools: fundingProposalTools,
          fundingProposalIncentive: fundingProposalIncentive,
          fundingProposal: fundingProposal,
          fundingAccepted: fundingAccepted,
          acceptedPercentage: (fundingAccepted / fundingProposal * 100).toFixed(2)
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
              <h4 className="title is-size-4">Daftar Pencairan Dana</h4><br />
            </div>
          </div>
        </div>
        <h6 className="title is-size-6">Berdasarkan form pada tahap Pencairan Dana</h6>
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
