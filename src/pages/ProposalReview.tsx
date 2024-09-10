/* eslint-disable react/jsx-key */
import { faArrowCircleLeft, faSave } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Checkbox } from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router"
import { toast } from "react-toastify"
import APIResponse from "../interfaces/APIResponse"
import Loading from "../layouts/Loading"
import TextEditor from "../layouts/TextEditor"
import { StoreConnector, StoreProps } from "../redux/actions"
import { formatRupiah } from "./FundDishbursementList"
import { EventInterface, FundDisbursementInterface, ProgramPlanningInterface, ProposalInterface, ProposalStatus, SelectionInterface } from "./ProposalList"
import { FundDisbursementSummaryInterface } from "./StaffReadTimelineEvent"
import { TimelineEventInterface, TimelineEventType } from "./TimelineEventList"
import { TimelineInterface } from "./TimelineList"

const API_URL = process.env.REACT_APP_API_URL

function ProposalReview(props: StoreProps) {
  const { token, department, urlPrefix, userData } = props
  const { id, idTimeline, idTimelineEvent } = useParams<{ id?: string, idTimeline?: string, idTimelineEvent?: string }>()
  const history = useHistory()
  const [timeline, setTimeline] = useState<TimelineInterface>();
  const [timelineEvent, setTimelineEvent] = useState<TimelineEventInterface>();
  const [proposal, setProposal] = useState<ProposalInterface>()
  const [proposalFileName, setProposalFileName] = useState<string>('')
  const [leader, setLeader] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attachmentFileName, setAttachmentFileName] = useState<string>('')
  const [comment, setComment] = useState<string>('')
  const [status, setStatus] = useState<string>(ProposalStatus.Send)
  const [scores, setScores] = useState<string>('')
  const [fundDisbursementSummaryInterface, setFundDisbursementSummaryInterface] = useState<FundDisbursementSummaryInterface>()
  const [loading, setLoading] = useState<boolean>(false)

  const [dataProgramPlanning, setDataProgramPlanning] =
    useState<ProgramPlanningInterface>({
      detailProgram: {
        title: '',
        code: '',
        scheme: '',
        submission: '',
        batch: '',
      },
      roadmap: '',
      IKU: [],
      activityList: [],
    });
  const [ikuPreviewList, setIkuPreviewList] = useState<Array<Array<string>>>(
    [],
  );
  const [tableToolsPreviewList, setTableToolsPreviewList] = useState<string[][]>(
    [],
  );
  const [tableIncentivePreviewList, setTableIncentivePreviewList] = useState<string[][]>([]);

  // Event
  const [dataEvent, setDataEvent] = useState<EventInterface>({
    title: '',
    code: '',
    activityList: []
  })

  useEffect(() => {
    if (!token || !id) {
      return;
    }
    const fetchInitOpt = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const tasks = [
        `/timeline/${idTimeline}`,
        `/timeline-event/${idTimelineEvent}?timeline=${idTimeline}`,
      ];

      Promise.all(
        tasks.map(task => fetch(API_URL + urlPrefix + task, fetchInitOpt)),
      )
        .then(
          async responses =>
            await Promise.all([responses[0].json(), responses[1].json()]),
        )
        .then(results => {
          const [timelineResult, timelineEventResult] = results;

          if (timelineResult.success) {
            setTimeline(timelineResult.message.timeline);
          }

          if (timelineEventResult.success) {
            setTimelineEvent(timelineEventResult.message.timelineEvent);
          }
        });
    } catch (err) {
      toast('Terjadi kesalahan jaringan!', {
        type: 'error',
      });
    }
  }, [token, department, urlPrefix, id]);


  useEffect(() => {
    if (!token || !id) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/proposal/${id}`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ proposal: ProposalInterface }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setProposal(message.proposal)
        setComment(message.proposal.comment)
        setScores(message.proposal.scores ? message.proposal.scores.toString() : '0')
        setStatus(message.proposal.status)
      })
  }, [])

  useEffect(() => {
    if (!timeline || !timelineEvent || !proposal) {
      return;
    }

    switch (timelineEvent.step) {
      case TimelineEventType.Selection:
        const dataSelection = proposal.data as SelectionInterface
        if (dataSelection.file) {
          const parsedFileName = dataSelection.file.split('/');
          const fileName = parsedFileName[parsedFileName.length - 1];
          setProposalFileName(fileName);
        }
        if (dataSelection.attachment) {
          const parsedFileName = dataSelection.attachment.split('/');
          const fileName = parsedFileName[parsedFileName.length - 1];
          setAttachmentFileName(fileName);
        }
        setDescription(dataSelection.description);
        setLeader(dataSelection.leader);
        break;
      case TimelineEventType.ProgramPlanning:
        setDataProgramPlanning(proposal.data as ProgramPlanningInterface)
        setIkuPreviewList((proposal.data as ProgramPlanningInterface).IKU)
        break;
      case TimelineEventType.Event:
        setDataEvent(proposal.data as EventInterface)
        break;
      case TimelineEventType.FundDisbursement:
        setTableIncentivePreviewList((proposal.data as FundDisbursementInterface).tableIncentive)
        setTableToolsPreviewList((proposal.data as FundDisbursementInterface).tableTools)
        break;
      case TimelineEventType.ReportAndSPJ:
        setIkuPreviewList((proposal.data as ProgramPlanningInterface).IKU)
        setTableIncentivePreviewList((proposal.data as FundDisbursementInterface).tableIncentive)
        setTableToolsPreviewList((proposal.data as FundDisbursementInterface).tableTools)
        break;
      case TimelineEventType.MonitoringAndEvaluation:
        setIkuPreviewList((proposal.data as ProgramPlanningInterface).IKU)
        setTableIncentivePreviewList((proposal.data as FundDisbursementInterface).tableIncentive)
        setTableToolsPreviewList((proposal.data as FundDisbursementInterface).tableTools)
        break;
    }

  }, [proposal, timeline, timelineEvent])

  const submitProposal = () => {
    setLoading(true)
    const form = new FormData()

    switch (timelineEvent.step) {
      case TimelineEventType.FundDisbursement: {
        form.append('tableTools', JSON.stringify(tableToolsPreviewList));
        form.append('tableIncentive', JSON.stringify(tableIncentivePreviewList));
        break;
      }
    }


    form.append(`comment`, comment)
    form.append(`status`, status)
    form.append(`scores`, scores)

    const fetchInitOpt = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    }

    const url = new URL(`${API_URL + urlPrefix}/proposal`)

    if (id) {
      url.pathname = `${url.pathname}/${id}`
    }

    fetch(url.toString(), fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse) => {
        const { success } = response

        if (!success) {
          toast('Gagal menyimpan data!', { type: 'error' })
          return
        }

        toast('Berhasil menyimpan data!', { type: 'success' })
        history.goBack()
      })
      .catch(() => toast('Gagal Mengupload data!', { type: 'error' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!timelineEvent) {
      return
    }

    if (timelineEvent.step !== TimelineEventType.FundDisbursement) {
      return
    }

    let fundingProposalTools = 0
    let fundingProposalIncentive = 0
    let fundingAcceptedTools = 0
    let fundingAcceptedIncentive = 0
    let numberOfComponentAcceptedTools = 0
    let numberOfComponentAcceptedIncentive = 0
    let numberOfComponentProposalTools = 0
    let numberOfComponentProposalIncentive = 0

    tableToolsPreviewList.map((rowTools) => {
      if (rowTools[8]) {
        fundingProposalTools += !isNaN(parseInt(rowTools[8])) ? parseInt(rowTools[8]) : 0
      }
      if (rowTools[9]) {
        if (rowTools[9] === '1') {
          fundingAcceptedTools += !isNaN(parseInt(rowTools[8])) ? parseInt(rowTools[8]) : 0
          numberOfComponentAcceptedTools++
        }
      }
      numberOfComponentProposalTools++
    })

    tableIncentivePreviewList.map((rowIncentive) => {
      if (rowIncentive[10]) {
        fundingProposalIncentive += !isNaN(parseInt(rowIncentive[10])) ? parseInt(rowIncentive[10]) : 0
      }
      if (rowIncentive[11]) {
        if (rowIncentive[11] === '1') {
          fundingAcceptedIncentive += !isNaN(parseInt(rowIncentive[10])) ? parseInt(rowIncentive[10]) : 0
          numberOfComponentAcceptedIncentive++
        }
      }
      numberOfComponentProposalIncentive++
    })

    setFundDisbursementSummaryInterface({
      fundingProposalTools: fundingProposalTools.toString(),
      fundingProposalIncentive: fundingProposalIncentive.toString(),
      fundingAcceptedTools: fundingAcceptedTools.toString(),
      fundingAcceptedIncentive: fundingAcceptedIncentive.toString(),
      numberOfComponentAcceptedTools: numberOfComponentAcceptedTools.toString(),
      numberOfComponentAcceptedIncentive: numberOfComponentAcceptedIncentive.toString(),
      numberOfComponentProposalTools: numberOfComponentProposalTools.toString(),
      numberOfComponentProposalIncentive: numberOfComponentProposalIncentive.toString(),
      totalAcceptedToolsPercentage: (fundingAcceptedTools / fundingProposalTools * 100).toFixed(2),
      totalAcceptedIncentivePercentage: (fundingAcceptedIncentive / fundingProposalIncentive * 100).toFixed(2)
    })
  }, [tableToolsPreviewList, tableIncentivePreviewList])

  const convertProposalStatus = (status: string) => {
    switch (status) {
      case ProposalStatus.Send:
        return "Belum dikonfirmasi"

      case ProposalStatus.Approve:
        return "Diterima"

      case ProposalStatus.Decline:
        return "Ditolak"

      case ProposalStatus.Revision:
        return "Revisi"

      default:
        return "Tidak valid"
    }
  }

  if (!proposal || !timelineEvent) {
    return (
      <>
        <Loading />
      </>
    )
  }

  return (
    <div className="mt-3">
      <div className="columns is-centered">
        <div className="column is-12-widescreen">
          <div className="box p-5">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h1 className="title is-size-4">{timelineEvent.title}</h1>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <button
                    className="button is-small is-primary"
                    onClick={() => submitProposal()}
                  >
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faSave} />
                    </div>
                    <span>Simpan</span>
                  </button>
                </div>
                <div className="level-item">
                  <button className="button is-small mx-1" onClick={() => history.goBack()}>
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faArrowCircleLeft} />
                    </div>
                    <span>Kembali</span>
                  </button>
                </div>
              </div>
            </div>
            {timelineEvent.step === TimelineEventType.Selection && (
              <>
                <h1 className="title is-size-4">Proposal</h1>
                <div className="field">
                  <strong>Judul</strong>
                  <p>{proposal.title}</p>
                </div>
                <div className="field">
                  <strong>Ringkasan</strong>
                  <div className="field" dangerouslySetInnerHTML={{ __html: description }} />
                </div>
                <div className="field">
                  <strong>Ketua</strong>
                  <p>{leader}</p>
                </div>
                {proposal.file && <div className="mt-5">
                  <strong>Proposal yang sudah diupload:</strong>
                  <div className="columns is-multiline mt-1">
                    <div className="column is-4">
                      <div className="card">
                        <div className="card-content">
                          <div className="title is-size-6">{proposalFileName}</div>
                          <div className="subtitle is-size-6">Status: {convertProposalStatus(proposal.status!)}</div>
                        </div>
                        <div className="card-footer">
                          <a
                            href={API_URL + proposal.file}
                            target="_blank"
                            className="card-footer-item"
                            rel="noreferrer"
                          >
                            Unduh
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                }
                {attachmentFileName && <div className="mt-5">
                  <strong>Lampiran yang sudah diupload:</strong>
                  <div className="columns is-multiline mt-1">
                    <div className="column is-4">
                      <div className="card">
                        <div className="card-content">
                          <div className="title is-size-6">{attachmentFileName}</div>
                        </div>
                        <div className="card-footer">
                          <a
                            href={API_URL + proposal.file}
                            target="_blank"
                            className="card-footer-item"
                            rel="noreferrer"
                          >
                            Unduh
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                }</>
            )}

            {timelineEvent.step == TimelineEventType.ProgramPlanning && (
              <div className="columns">
                <div className="column" style={{ overflowX: 'auto' }}>
                  <div className="card mb-4">
                    <div className="card-content">
                      <h1 className="title is-size-4">1. Detail Program</h1>
                      <div className="field">
                        <label htmlFor="title">
                          <strong>Judul</strong>
                        </label>
                        <div className="control">
                          <p>{dataProgramPlanning.detailProgram.title}</p>
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="code">
                          <strong>Kode Program</strong>
                        </label>
                        <p>{dataProgramPlanning.detailProgram.code}</p>
                      </div>
                      <div className="field">
                        <label htmlFor="code">
                          <strong>Skema Pengajuan</strong>
                        </label>
                        <p>{dataProgramPlanning.detailProgram.scheme}</p>
                      </div>
                      <div className="field">
                        <label htmlFor="code">
                          <strong>Pengajuan</strong>
                        </label>
                        <p>{dataProgramPlanning.detailProgram.submission}</p>
                      </div>
                      <div className="field">
                        <label htmlFor="code">
                          <strong>Batch</strong>
                        </label>
                        <p>{dataProgramPlanning.detailProgram.batch}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card mb-4">
                    <div className="card-content">
                      <h1 className="title is-size-4">2. Roadmap</h1>
                      <div className="field" dangerouslySetInnerHTML={{ __html: dataProgramPlanning.roadmap }} />
                    </div>
                  </div>
                  <div className="card mb-4">
                    <div className="card-content">
                      <h1 className="title is-size-4">3. IKU</h1>
                      <div className="field">
                      </div>
                      {ikuPreviewList.length > 0 && (
                        <div
                          className="modal-card-body"
                          style={{ overflowX: 'auto' }}>
                          <table
                            className="table is-bordered is-fullwidth"
                            style={{ whiteSpace: 'nowrap' }}>
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>IKU</th>
                                <th colSpan={2}>Baseline</th>
                                <th colSpan={2}>Target</th>
                                <th colSpan={2}>Realisasi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ikuPreviewList.map((studentData, idx) => (
                                <tr key={idx}>
                                  {studentData.map((text, dataIdx) => (
                                    <td key={dataIdx}>{text}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card mb-4">
                    <div className="card-content">
                      <h1 className="title is-size-4">4. Aktivitas</h1>
                      {dataProgramPlanning.activityList.map(
                        (activity, index) => (
                          <div className="card mb-4">
                            <div className="card-content">
                              <h1 className="title is-size-5">
                                Aktivitas {index + 1}
                              </h1>
                              <div className="field">
                                <label htmlFor="title">
                                  <strong>Judul</strong>
                                </label>
                                <div className="control">
                                  <p>{activity.title}</p>
                                </div>
                              </div>
                              <div className="field">
                                <label htmlFor="title">
                                  <strong>
                                    a. Latar belakang dan Rasional
                                  </strong>
                                </label>
                                <div
                                  dangerouslySetInnerHTML={{ __html: activity.background }}
                                />
                              </div>
                              <div className="field">
                                <label htmlFor="title">
                                  <strong>b. Tujuan</strong>
                                </label>
                                <div
                                  dangerouslySetInnerHTML={{ __html: activity.goal }}
                                />
                              </div>
                              <div className="field">
                                <label htmlFor="title">
                                  <strong>
                                    c. Mekanisme dan Tahapan Pelaksanaan
                                  </strong>
                                </label>
                                <div
                                  dangerouslySetInnerHTML={{ __html: activity.mechanism }}
                                />
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {timelineEvent.step == TimelineEventType.Event && (
              <div className="columns">
                <div className="column" style={{ overflowX: 'auto' }}>
                  <div className="card mb-4">
                    <div className="card-content">
                      <div className="field">
                        <label htmlFor="title">
                          <strong>Judul</strong>
                        </label>
                        <div className="control">
                          <p>{dataEvent.title}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card mb-4">
                    <div className="card-content">
                      <h1 className="title is-size-4">Daftar Aktivitas</h1>
                      {dataEvent.activityList.map(
                        (activity, index) => (
                          <div className="card mb-4">
                            <div className="card-content">
                              <h1 className="title is-size-5">
                                Aktivitas {index + 1}
                              </h1>
                              <div className="field">
                                <label htmlFor="title">
                                  <strong>Judul</strong>
                                </label>
                                <div className="control">
                                  <p>{activity.title}</p>
                                </div>
                              </div>
                              <div className="field">
                                <label htmlFor="title">
                                  <strong>Kode</strong>
                                </label>
                                <div className="control">
                                  <p>{activity.code}</p>
                                </div>
                              </div>
                              <div className="field">
                                <label htmlFor="title">
                                  <strong>Daftar Sub Aktivitas</strong>
                                  {dataEvent.activityList[index].subActivityList.map(
                                    (subActivity, subIndex) => (
                                      <div className="card mt-2 mb-4">
                                        <div className="card-content">
                                          <h1 className="title is-size-5">
                                            Sub Aktivitas {subIndex + 1}
                                          </h1>
                                          <div className="field">
                                            <label htmlFor="title">
                                              <strong>Judul</strong>
                                            </label>
                                            <div className="control">
                                              <p>{subActivity.title}</p>
                                            </div>
                                          </div>
                                          <div className="field">
                                            <label htmlFor="title">
                                              <strong>PIC</strong>
                                            </label>
                                            <div className="control">
                                              <p>{subActivity.PIC}</p>
                                            </div>
                                          </div>
                                          <div className="field">
                                            <label htmlFor="title">
                                              <strong>Kode</strong>
                                            </label>
                                            <div className="control">
                                              <p>{subActivity.code}</p>
                                            </div>
                                          </div>
                                          <div className="field">
                                            <label htmlFor="title">
                                              <strong>Tempat</strong>
                                            </label>
                                            <div className="control">
                                              <p>{subActivity.place}</p>
                                            </div>
                                          </div>
                                          <div className="field">
                                            <label htmlFor="title">
                                              <strong>Arahan</strong>
                                            </label>
                                            <div className="control">
                                              <p>{subActivity.instruction}</p>
                                            </div>
                                          </div>
                                          <div className="columns">
                                            <div className="column">
                                              <div className="field">
                                                <label htmlFor="title">
                                                  <strong>Mulai</strong>
                                                </label>
                                                <div className="control">
                                                  <p>{subActivity.startedAt}</p>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="column">
                                              <div className="field">
                                                <label htmlFor="title">
                                                  <strong>Selesai</strong>
                                                </label>
                                                <div className="control">
                                                  <p>{subActivity.finishedAt}</p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="field">
                                            <label htmlFor="title">
                                              <strong>Nara Sumber</strong>
                                            </label>
                                            <div className="control">
                                              <p>{subActivity.sourcePerson}</p>
                                            </div>
                                          </div>
                                          <div className="field">
                                            <label htmlFor="title">
                                              <strong>Peserta</strong>
                                            </label>
                                            <div className="control">
                                              <p>{subActivity.participant}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </label>
                              </div>
                              <div className="field mt-2">
                                <h1 className="title is-size-4">Anggaran</h1>
                                {activity.funding.length > 0 && (
                                  <div style={{ overflowX: 'auto' }}>
                                    <table
                                      className="table is-bordered"
                                      style={{
                                        whiteSpace: 'nowrap',
                                      }}>
                                      <thead>
                                        <tr>
                                          <th>Kode Subaktivitas</th>
                                          <th>Subaktivitas</th>
                                          <th>Komponen Biaya Anggaran</th>
                                          <th>PK-KM</th>
                                          <th>Perguruan Tinggi</th>
                                          <th>Mitra</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {activity.funding.map(
                                          (rowData, idx) => (
                                            <tr key={idx}>
                                              {rowData.map((text, dataIdx) => (
                                                <td key={dataIdx}>{text}</td>
                                              ))}
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {timelineEvent.step == TimelineEventType.FundDisbursement && (
              <div className="columns">
                <div className="column" style={{ overflowX: 'auto' }}>
                  <div className="card mb-4">
                    <div className="card-content">
                      <h1 className="title is-size-4">1. Tabel Spesifikasi Rinci Peralatan</h1>
                      {(tableToolsPreviewList.length > 0 && fundDisbursementSummaryInterface) && <div className="columns">
                        <div className="column">
                          <p className="is-size-5">Total usulan anggaran : <b>{formatRupiah(fundDisbursementSummaryInterface.fundingProposalTools)}</b> ({fundDisbursementSummaryInterface.numberOfComponentProposalTools} Komponen)</p>
                          <p className="is-size-5">Total anggaran diterima : <b>{formatRupiah(fundDisbursementSummaryInterface.fundingAcceptedTools)}</b> ({fundDisbursementSummaryInterface.numberOfComponentProposalTools} Komponen)</p>
                          <p className="is-size-5">Presentase penerimanaan : <b>{fundDisbursementSummaryInterface.totalAcceptedToolsPercentage} %</b></p>
                        </div>
                      </div>}
                      {tableToolsPreviewList.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                          <table
                            className="table is-bordered"
                            style={{
                              whiteSpace: 'nowrap',
                            }}>
                            <thead>
                              <tr>
                                <th>No</th>
                                <th>IKU</th>
                                <th>Kode Subaktivitas</th>
                                <th>IKU Sasaran</th>
                                <th>Nama Alat</th>
                                <th>Spesifikasi Teknis</th>
                                <th>Jumlah</th>
                                <th>Harga Satuan</th>
                                <th>Prakiraan Biaya</th>
                                <th rowSpan={2}>Status Pencairan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tableToolsPreviewList.map(
                                (studentData, idx) => (
                                  <tr key={idx}>
                                    {studentData.map((text, dataIdx) => (
                                      <td key={dataIdx}>{dataIdx === 9 ?
                                        <Checkbox
                                          checked={text === '1'}
                                          onChange={() => {
                                            let newTableToolsPreviewList = tableToolsPreviewList
                                            newTableToolsPreviewList[idx][dataIdx] = text === '1' ? '0' : '1'
                                            setTableToolsPreviewList([...newTableToolsPreviewList])
                                          }}
                                          inputProps={{ 'aria-label': 'controlled' }}
                                        /> : text}</td>
                                    ))}
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card mb-4">
                    <div className="card-content">
                      <h1 className="title is-size-4">2. Tabel Rincian Usulan Bantuan/Insentif</h1>
                      {(tableIncentivePreviewList.length > 0 && fundDisbursementSummaryInterface) && <div className="columns">
                        <div className="column">
                          <p className="is-size-5">Total usulan anggaran : <b>{formatRupiah(fundDisbursementSummaryInterface.fundingProposalIncentive)}</b> ({fundDisbursementSummaryInterface.numberOfComponentProposalIncentive} Komponen)</p>
                          <p className="is-size-5">Total anggaran diterima : <b>{formatRupiah(fundDisbursementSummaryInterface.fundingAcceptedIncentive)}</b> ({fundDisbursementSummaryInterface.numberOfComponentAcceptedIncentive} Komponen)</p>
                          <p className="is-size-5">Presentase penerimanaan : <b>{fundDisbursementSummaryInterface.totalAcceptedIncentivePercentage} %</b></p>
                        </div>
                      </div>}
                      {tableIncentivePreviewList.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                          <table
                            className="table is-bordered"
                            style={{
                              whiteSpace: 'nowrap',
                              textAlign: 'center',
                            }}>
                            <thead>
                              <tr>
                                <th rowSpan={2}>No</th>
                                <th rowSpan={2}>Prodi</th>
                                <th rowSpan={2}>Kode Subaktivitas</th>
                                <th rowSpan={2}>IKU Sasaran</th>
                                <th rowSpan={2}>Nama Kegiatan</th>
                                <th rowSpan={2}>Jumlah Peserta</th>
                                <th rowSpan={2}>Luaran</th>
                                <th colSpan={3}>
                                  Prakiraan Biaya (Ribu Rp)
                                </th>
                                <th rowSpan={2}>Total</th>
                                <th rowSpan={2}>Status Pencairan</th>
                              </tr>
                              <tr>
                                <th>PK-KM</th>
                                <th>PT</th>
                                <th>Mitra</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tableIncentivePreviewList.map(
                                (studentData, idx) => (
                                  <tr key={idx}>
                                    {studentData.map((text, dataIdx) => (
                                      <td key={dataIdx}>{dataIdx == 11 ?
                                        <Checkbox
                                          checked={text === '1'}
                                          onChange={() => {
                                            let newTableIncentivePreviewList = tableIncentivePreviewList
                                            newTableIncentivePreviewList[idx][dataIdx] = text === '1' ? '0' : '1'
                                            setTableIncentivePreviewList([...newTableIncentivePreviewList])
                                          }}
                                          inputProps={{ 'aria-label': 'controlled' }}
                                        /> : text}</td>
                                    ))}
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="field mt-5">
              <label htmlFor="title"><strong>Komentar</strong></label>
              <div className="my-2">
                <TextEditor
                  content={comment ?? ''}
                  onChange={HTMLResult => setComment(HTMLResult)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="title"><strong>Nilai</strong></label>
              <div className="control">
                <input
                  type="text"
                  className="input"
                  value={scores}
                  onChange={ev => setScores(ev.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="status"><strong>Status</strong></label>
              <div className="select is-fullwidth">
                <select name="status" id="status" value={status} onChange={ev => setStatus(ev.target.value as ProposalStatus)}>
                  <option value={ProposalStatus.Send}>{convertProposalStatus(ProposalStatus.Send)}</option>
                  <option value={ProposalStatus.Approve}>{convertProposalStatus(ProposalStatus.Approve)}</option>
                  <option value={ProposalStatus.Decline}>{convertProposalStatus(ProposalStatus.Decline)}</option>
                  <option value={ProposalStatus.Revision}>{convertProposalStatus(ProposalStatus.Revision)}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreConnector(ProposalReview)