/* eslint-disable react/jsx-key */
import {
  faArrowCircleLeft,
  faDownload,
  faExclamationCircle, faFileDownload, faPlus,
  faSave,
  faTrash,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox } from '@mui/material';
import Excel, { Style, Workbook } from 'exceljs';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver'
import APIResponse from '../interfaces/APIResponse';
import UserInterface from '../interfaces/UserInterface';
import FilePreviewer from '../layouts/FilePreviewer';
import FileUploader from '../layouts/FileUploader';
import Loading from '../layouts/Loading';
import TextEditor from '../layouts/TextEditor';
import { StoreConnector, StoreProps } from '../redux/actions';
import {
  EventInterface,
  FundDisbursementInterface,
  MonitoringAndEvaluationInterface,
  ProgramPlanningInterface,
  ProposalInterface,
  ProposalStatus,
  ReportAndSPJInterface,
  SelectionInterface
} from './ProposalList';
import { TimelineEventInterface, TimelineEventType } from './TimelineEventList';
import { TimelineInterface, TimelineParticipantType } from './TimelineList';
import { formatRupiah } from './FundDishbursementList';

const API_URL = process.env.REACT_APP_API_URL;
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;
export interface FundDisbursementSummaryInterface {
  fundingProposalTools: string
  fundingProposalIncentive: string
  fundingAcceptedTools: string
  fundingAcceptedIncentive: string
  numberOfComponentAcceptedTools: string
  numberOfComponentAcceptedIncentive: string
  numberOfComponentProposalTools: string
  numberOfComponentProposalIncentive: string
  totalAcceptedToolsPercentage: string
  totalAcceptedIncentivePercentage: string
}

function StaffReadTimelineEvent(props: StoreProps) {
  const { token, department, urlPrefix, userData } = props;
  const { id, idTimeline } = useParams<{ id?: string; idTimeline?: string }>();
  const history = useHistory();
  const [timeline, setTimeline] = useState<TimelineInterface>();
  const [timelineEvent, setTimelineEvent] = useState<TimelineEventInterface>();

  // General
  const [submittingStatus, setSubmittingStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [proposalId, setProposalId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [leader, setLeader] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [comment, setComment] = useState<string>();
  const [scores, setScores] = useState<number>();
  const [reviewer, setReviewer] = useState<Array<UserInterface>>([]);
  const [status, setStatus] = useState<string>();
  const [started, setStarted] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [joined, setJoiningStatus] = useState<boolean>(false);

  // Selection
  const [proposalFile, setProposalFile] = useState<string>('');
  const [proposalFileName, setProposalFileName] = useState<string>('');
  const [previewFile, setPreviewFile] = useState<string>();
  const [uploadedFile, setUploadedFile] = useState<File | null>();
  const [uploadProposalModalVisible, setUploadProposalModalVisibility] =
    useState<boolean>(false);
  const [previewModalVisible, setPreviewModalVisibility] =
    useState<boolean>(false);
  const [attachmentFile, setAttachmentFile] = useState<string>('');
  const [attachmentFileName, setAttachmentFileName] = useState<string>('');
  const [previewAttachmentFile, setPreviewAttachmentFile] = useState<string>();
  const [uploadedAttachmentFile, setUploadedAttachmentFile] = useState<File | null>();
  const [uploadAttachmentModalVisible, setUploadAttachmentModalVisibility] =
    useState<boolean>(false);
  const [previewAttachmentModalVisible, setPreviewAttachmentModalVisibility] =
    useState<boolean>(false);

  // Program Planning
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
  const [tableIkuPreviewList, setTableIkuPreviewList] = useState<Array<Array<string>>>(
    [],
  );

  const [uploadIkuModalVisible, setUploadIkuModalVisibility] =
    useState<boolean>(false);
  const [ikuFile, setIkuFile] = useState<File>();

  // Event
  const [dataEvent, setDataEvent] = useState<EventInterface>({
    title: '',
    code: '',
    activityList: []
  })
  const [uploadTableFundingModalVisible, setUploadTableFundingModalVisibility] =
    useState<boolean>(false);
  const [focusedActivity, setFocusedActivity] = useState(0);

  // Fund Disbursement
  const [fundDisbursementSummaryInterface, setFundDisbursementSummaryInterface] = useState<FundDisbursementSummaryInterface>()
  const [uploadTableToolsModalVisible, setUploadTableToolsModalVisibility] =
    useState<boolean>(false);
  const [tableToolsPreviewList, setTableToolsPreviewList] = useState<string[][]>(
    [],
  );
  const [uploadTableIncentiveModalVisible, setUploadTableIncentiveModalVisibility] =
    useState<boolean>(false);
  const [tableIncentivePreviewList, setTableIncentivePreviewList] = useState<string[][]>([]);
  const [uploadTableActivityModalVisible, setUploadTableActivityModalVisibility] =
    useState<boolean>(false);
  const [tableActivityPreviewList, setTableActivityPreviewList] = useState<string[][]>(
    [],
  );

  // Report and SPJ
  const [activityPreviewList, setActivityPreviewList] = useState<Array<Array<string>>>(
    [],
  );

  // Monitoring and Evaluation
  const [dataMonitoringAndEvaluation, setDataMonitoringAndEvaluation] =
    useState<MonitoringAndEvaluationInterface>({
      activityList: [],
      research: ''
    });

  const doUpload = () => {
    setUploadProposalModalVisibility(true);
  };

  const doAttachmentUpload = () => {
    setUploadAttachmentModalVisibility(true);
  };

  const doPreview = (file: string) => {
    setPreviewFile(file);
    setPreviewModalVisibility(true);
  };

  const doAttachmentPreview = (file: string) => {
    setPreviewAttachmentFile(file);
    setPreviewModalVisibility(true);
  };

  const onAcceptFile = (file: File | Array<File>) => {
    setUploadedFile(Array.isArray(file) ? file[0] : file);
  };

  const onAcceptAttachmentFile = (file: File | Array<File>) => {
    setUploadedAttachmentFile(Array.isArray(file) ? file[0] : file);
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const removeAttachmentFile = () => {
    setUploadedAttachmentFile(null);
  };

  const submitProposal = () => {
    if (!timelineEvent) {
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append(`timelineEvent`, id!);

    switch (timelineEvent.step) {
      case TimelineEventType.Selection:
        if (!uploadedFile) {
          return;
        }
        form.append(`proposal`, uploadedFile);
        form.append(`title`, title);
        form.append(`description`, description);
        form.append(`leader`, leader);

        if (uploadedAttachmentFile) {
          form.append(`attachment`, uploadedAttachmentFile);
        }
        break;
      case TimelineEventType.ProgramPlanning: {
        form.append(`detailProgram`, JSON.stringify(dataProgramPlanning.detailProgram));
        form.append(`roadmap`, dataProgramPlanning.roadmap);
        form.append(`IKU`, JSON.stringify(dataProgramPlanning.IKU));
        form.append(`activityList`, JSON.stringify(dataProgramPlanning.activityList));
        break;
      }
      case TimelineEventType.Event: {
        form.append(`title`, dataEvent.title);
        form.append(`activityList`, JSON.stringify(dataEvent.activityList));
        break;
      }
      case TimelineEventType.FundDisbursement: {
        form.append('tableTools', JSON.stringify(tableToolsPreviewList));
        form.append('tableIncentive', JSON.stringify(tableIncentivePreviewList));
        break;
      }
      case TimelineEventType.ReportAndSPJ: {
        form.append(`activityList`, JSON.stringify(tableActivityPreviewList));
        form.append('tableTools', JSON.stringify(tableToolsPreviewList));
        form.append('tableIncentive', JSON.stringify(tableIncentivePreviewList));
        form.append(`IKU`, JSON.stringify(tableIkuPreviewList));
        break;
      }
      case TimelineEventType.MonitoringAndEvaluation: {
        form.append(`activityList`, JSON.stringify(dataProgramPlanning.IKU));
        form.append(`research`, dataMonitoringAndEvaluation.research)
        break;
      }
    }

    const fetchInitOpt = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    };

    const url = new URL(`${API_URL + urlPrefix}/proposal`);

    if (proposalId) {
      url.pathname = `${url.pathname}/${proposalId}`;
    }

    fetch(url.toString(), fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse) => {
        const { success } = response;

        if (!success) {
          toast('Gagal menyimpan data!', { type: 'error' });
          return;
        }

        toast('Berhasil menyimpan data!', { type: 'success' });
        //history.goBack();
      })
      .catch(() => toast('Gagal Mengupload data!', { type: 'error' }))
      .finally(() => setLoading(false));
  };

  const previewIkuList = (file: File | Array<File>) => {
    if (Array.isArray(file)) {
      setIkuFile(file[0]);
    } else {
      setIkuFile(file);
    }

    const reader = new FileReader();

    reader.onload = ev => {
      if (!ev.target?.result) {
        return;
      }

      if (typeof ev.target.result === 'string') {
        return;
      }

      const workbook = new Excel.Workbook();

      workbook.xlsx.load(ev.target.result).then(loadedWorkbook => {
        const workSheet = loadedWorkbook.getWorksheet(1);
        const valArray = [];

        for (let i = 3; i <= workSheet.rowCount; i++) {
          const row = workSheet.getRow(i);
          const tmpArray = [];

          for (let j = 1; j <= row.actualCellCount; j++) {
            tmpArray.push(workSheet.getRow(i).getCell(j).text);
          }

          if (workSheet.getRow(i).getCell(5).text !== '') {
            valArray.push(tmpArray);
          }
        }

        setTableIkuPreviewList(valArray);
        setDataProgramPlanning({
          ...dataProgramPlanning,
          IKU: valArray
        })
      });
    };

    if (Array.isArray(file)) {
      reader.readAsArrayBuffer(file[0]);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const previewTableActivityList = (file: File | File[]) => {
    const reader = new FileReader();

    reader.onload = ev => {
      if (!ev.target?.result || typeof ev.target.result === 'string') {
        return;
      }

      const workbook = new Excel.Workbook();

      workbook.xlsx.load(ev.target.result).then(loadedWorkbook => {
        const workSheet = loadedWorkbook.getWorksheet(1);
        const valArray = [];
        let found = false;
        for (let i = 1; i <= workSheet.actualRowCount; i++) {
          const tmpArray = [];
          const row = workSheet.getRow(i);
          if (
            row.getCell(1).value !== Excel.ValueType.Null &&
            row.getCell(1).text === '1'
          ) {
            found = true;
          }
          if (!found) continue;
          for (let j = 1; j <= row.actualCellCount; j++) {
            tmpArray.push(row.getCell(j).text);
          }
          if (tmpArray.length > 0) {
            valArray.push(tmpArray);
          }
        }

        setTableActivityPreviewList(valArray);
      });
    };

    reader.readAsArrayBuffer(Array.isArray(file) ? file[0] : file);
  };


  const previewTableToolsList = (file: File | File[]) => {
    const reader = new FileReader();

    reader.onload = ev => {
      if (!ev.target?.result || typeof ev.target.result === 'string') {
        return;
      }

      const workbook = new Excel.Workbook();

      workbook.xlsx.load(ev.target.result).then(loadedWorkbook => {
        const workSheet = loadedWorkbook.getWorksheet(1);
        const valArray = [];
        let found = false;
        for (let i = 1; i <= workSheet.actualRowCount; i++) {
          const tmpArray = [];
          const row = workSheet.getRow(i);
          if (
            row.getCell(1).value !== Excel.ValueType.Null &&
            row.getCell(1).text === '1'
          ) {
            found = true;
          }
          if (!found) continue;
          for (let j = 1; j <= row.actualCellCount + 1; j++) {
            tmpArray.push(j <= row.actualCellCount ? row.getCell(j).text : '0');
          }
          if (tmpArray.length > 0) {
            valArray.push(tmpArray);
          }
        }

        setTableToolsPreviewList(valArray);
      });
    };

    reader.readAsArrayBuffer(Array.isArray(file) ? file[0] : file);
  };

  const previewTableIncentiveList = (file: File | File[]) => {
    const reader = new FileReader();
    reader.onload = ev => {
      if (!ev.target?.result || typeof ev.target.result === 'string') {
        return;
      }

      const workbook = new Excel.Workbook();

      workbook.xlsx.load(ev.target.result).then(loadedWorkbook => {
        const workSheet = loadedWorkbook.getWorksheet(1);
        const valArray = [];
        let found = false;
        for (let i = 1; i <= workSheet.actualRowCount; i++) {
          const tmpArray = [];
          const row = workSheet.getRow(i);
          if (
            row.getCell(1).value !== Excel.ValueType.Null &&
            row.getCell(1).text === '1'
          ) {
            found = true;
          }
          if (!found) continue;
          for (let j = 1; j <= row.actualCellCount + 1; j++) {
            tmpArray.push(j <= row.actualCellCount ? row.getCell(j).text : '0');
          }
          if (tmpArray.length > 0) {
            valArray.push(tmpArray);
          }
        }

        setTableIncentivePreviewList(valArray);
      });
    };

    reader.readAsArrayBuffer(Array.isArray(file) ? file[0] : file);
  };

  const previewTableFundingList = (file: File | File[]) => {
    const reader = new FileReader();

    reader.onload = ev => {
      if (!ev.target?.result || typeof ev.target.result === 'string') {
        return;
      }

      const workbook = new Excel.Workbook();

      workbook.xlsx.load(ev.target.result).then(loadedWorkbook => {
        const workSheet = loadedWorkbook.getWorksheet(1);
        const valArray = [];

        for (let i = 3; i <= workSheet.actualRowCount; i++) {
          const tmpArray = [];
          const row = workSheet.getRow(i);
          for (let j = 1; j <= row.actualCellCount; j++) {
            console.log(workSheet.getRow(i).getCell(1))
            tmpArray.push(row.getCell(j) ? row.getCell(j).text : '-');
          }
          if (tmpArray.length > 0) {
            valArray.push(tmpArray);
          }
        }

        const newActivityList = dataEvent.activityList;
        newActivityList[focusedActivity] = {
          ...newActivityList[focusedActivity],
          funding: valArray
        };

        setDataEvent({
          ...dataEvent,
          activityList: newActivityList,
        } as EventInterface);
      });
    };

    reader.readAsArrayBuffer(Array.isArray(file) ? file[0] : file);
  };


  const convertProposalStatus = (status: string) => {
    switch (status) {
      case ProposalStatus.Send:
        return 'belum dikonfirmasi';

      case ProposalStatus.Approve:
        return 'diterima';

      case ProposalStatus.Decline:
        return 'ditolak';

      default:
        return 'tidak valid';
    }
  };

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
        `/timeline-event/${id}?timeline=${idTimeline}`,
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
    if (!timelineEvent) {
      return;
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    fetch(
      `${API_URL}${urlPrefix}/proposal/event/${timelineEvent._id}`,
      fetchInitOpt,
    )
      .then(response => response.json())
      .then((response: APIResponse<{ proposals: Array<ProposalInterface> }>) => {
        const { success, message } = response;

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' });
          return;
        }

        const proposal = message.proposals[0];

        if (!proposal) {
          return;
        }

        setProposalId(proposal._id)
        setTitle(proposal.title);
        setDescription(proposal.description);
        setReviewer(proposal.reviewer as Array<UserInterface>);
        setComment(proposal.comment);
        setScores(proposal.scores);
        setStatus(proposal.status);

        switch (timelineEvent.step) {
          case TimelineEventType.Selection:
            const dataSelection = proposal.data as SelectionInterface
            if (dataSelection.file) {
              const parsedFileName = dataSelection.file.split('/');
              const fileName = parsedFileName[parsedFileName.length - 1];
              setProposalFileName(fileName);
              setProposalFile(dataSelection.file);
            }
            if (dataSelection.attachment) {
              const parsedFileName = dataSelection.attachment.split('/');
              const fileName = parsedFileName[parsedFileName.length - 1];
              setAttachmentFileName(fileName);
              setAttachmentFile(dataSelection.attachment);
            }
            setDescription(dataSelection.description);
            setLeader(dataSelection.leader);
            break;
          case TimelineEventType.ProgramPlanning:
            setDataProgramPlanning({
              ...proposal.data as ProgramPlanningInterface
            })
            setTableIkuPreviewList((proposal.data as ProgramPlanningInterface).IKU)
            break;
          case TimelineEventType.Event:
            setDataEvent(proposal.data as EventInterface)
            break;
          case TimelineEventType.FundDisbursement:
            setTableToolsPreviewList((proposal.data as FundDisbursementInterface).tableTools ?? [[]])
            setTableIncentivePreviewList((proposal.data as FundDisbursementInterface).tableIncentive ?? [[]])
            break;
          case TimelineEventType.ReportAndSPJ:
            setTableActivityPreviewList((proposal.data as ReportAndSPJInterface).activityList)
            setTableIkuPreviewList((proposal.data as ReportAndSPJInterface).IKU)
            setTableIncentivePreviewList((proposal.data as ReportAndSPJInterface).tableIncentive ?? [[]])
            setTableToolsPreviewList((proposal.data as ReportAndSPJInterface).tableTools ?? [[]])
            break;
          case TimelineEventType.MonitoringAndEvaluation:
            setActivityPreviewList((proposal.data as MonitoringAndEvaluationInterface).activityList)
            setDataMonitoringAndEvaluation(proposal.data as MonitoringAndEvaluationInterface)
            break;
        }
      });
  }, [timelineEvent]);

  useEffect(() => {
    if (timelineEvent) {
      const now = new Date();
      const startedAt = new Date(timelineEvent?.startedAt);
      const finishedAt = new Date(timelineEvent?.finishedAt);

      now.setHours(0);
      now.setMinutes(0);
      now.setSeconds(0);

      startedAt.setHours(0);
      startedAt.setMinutes(0);
      startedAt.setSeconds(0);

      finishedAt.setHours(0);
      finishedAt.setMinutes(0);
      finishedAt.setSeconds(0);

      setStarted(now > startedAt);
      setFinished(now > finishedAt);

      if (timeline?.participantType == TimelineParticipantType.Department) {
        setJoiningStatus(
          timelineEvent.participants.includes(userData!.meta!.department!),
        );
      } else {
        setJoiningStatus(timelineEvent.participants.includes(userData!._id));
      }

      setSubmittingStatus(proposalFile != '');
      setStarted(true);
      setJoiningStatus(true);
      setFinished(false);
    }
  }, [timelineEvent]);

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

  const exportTableTools = () => {
    const workbook = new Workbook()
    const sheet = workbook.addWorksheet()

    const headerStyle: Partial<Style> = {
      alignment: {
        horizontal: 'center',
        vertical: 'middle'
      },
      font: {
        bold: true
      }
    }

    const columns = timelineEvent.step === TimelineEventType.FundDisbursement ? [
      { header: 'No.', key: 'no', width: 3.45 },
      { header: 'Prodi', key: 'iku', width: 30 },
      { header: 'Kode SubAktivitas', key: 'kode_subaktivitas', width: 10 },
      { header: 'IKU Sasaran', key: 'iku_sasaran', width: 20 },
      { header: 'Nama Alat', key: 'nama_alat', width: 20 },
      { header: 'Spesifikasi Tekniks', key: 'spesifikasi_teknis', width: 20 },
      { header: 'Jumlah', key: 'jumlah', width: 20 },
      { header: 'Harga Satuan', key: 'harga_satuan', width: 14 },
      { header: 'Prakiraan Biaya', key: 'prakiraan_biaya', width: 14 }
    ] : [
      { header: 'No.', key: 'no', width: 3.45 },
      { header: 'Prodi', key: 'iku', width: 30 },
      { header: 'Kode SubAktivitas', key: 'kode_subaktivitas', width: 10 },
      { header: 'IKU Sasaran', key: 'iku_sasaran', width: 20 },
      { header: 'Nama Alat', key: 'nama_alat', width: 20 },
      { header: 'Spesifikasi Tekniks', key: 'spesifikasi_teknis', width: 20 },
      { header: 'Jumlah', key: 'jumlah', width: 20 },
      { header: 'Harga Satuan', key: 'harga_satuan', width: 14 },
      { header: 'Prakiraan Biaya', key: 'prakiraan_biaya', width: 14 },
      { header: 'Dana Cair', key: 'dana_cair', width: 14 },
      { header: 'Dana Digunakan', key: 'dana_digunakan', width: 14 }
    ]

    sheet.columns = columns

    sheet.getRow(1).font = headerStyle.font ?? {}
    sheet.getRow(1).alignment = headerStyle.alignment ?? {}

    sheet.columns.forEach(col => {
      if (col.eachCell) {
        col.eachCell(cell => {
          if (cell.value && typeof (cell.value) === 'string' && parseInt(cell.col) === 5 && parseInt(cell.row) > 1) {
            cell.value = parseFloat(cell.value)
          }
        })
      }
    })

    tableToolsPreviewList.map((rowTools) => {
      if (timelineEvent.step === TimelineEventType.FundDisbursement) {
        sheet.addRow(rowTools.splice(0, 9))
      } else {
        sheet.addRow(rowTools)
      }
    })

    workbook.xlsx.writeBuffer()
      .then(result => {
        const file = new File([result], `Tabel Spesifikasi Rinci Peralatan.xlsx`)
        saveAs(file)
      })
  }

  const exportTableIncentive = () => {
    const workbook = new Workbook()
    const sheet = workbook.addWorksheet()

    const headerStyle: Partial<Style> = {
      alignment: {
        horizontal: 'center',
        vertical: 'middle'
      },
      font: {
        bold: true
      }
    }

    const columns = timelineEvent.step === TimelineEventType.FundDisbursement ? [
      { header: 'No.', key: 'no', width: 3.45 },
      { header: 'IKU', key: 'iku', width: 30 },
      { header: 'Kode SubAktivitas', key: 'kode_subaktivitas', width: 10 },
      { header: 'IKU Sasaran', key: 'iku_sasaran', width: 20 },
      { header: 'Nama Alat', key: 'nama_alat', width: 20 },
      { header: 'Spesifikasi Tekniks', key: 'spesifikasi_teknis', width: 20 },
      { header: 'Jumlah', key: 'jumlah', width: 20 },
      { header: 'Harga Satuan', key: 'harga_satuan', width: 14 },
      { header: 'Prakiraan Biaya', key: 'prakiraan_biaya', width: 14 }
    ] : [
      { header: 'No.', key: 'no', width: 3.45 },
      { header: 'IKU', key: 'iku', width: 30 },
      { header: 'Kode SubAktivitas', key: 'kode_subaktivitas', width: 10 },
      { header: 'IKU Sasaran', key: 'iku_sasaran', width: 20 },
      { header: 'Nama Alat', key: 'nama_alat', width: 20 },
      { header: 'Spesifikasi Tekniks', key: 'spesifikasi_teknis', width: 20 },
      { header: 'Jumlah', key: 'jumlah', width: 20 },
      { header: 'Harga Satuan', key: 'harga_satuan', width: 14 },
      { header: 'Prakiraan Biaya', key: 'prakiraan_biaya', width: 14 },
      { header: 'Dana Cair', key: 'dana_cair', width: 14 },
      { header: 'Dana Digunakan', key: 'dana_digunakan', width: 14 }
    ]

    sheet.columns = columns

    sheet.getRow(1).font = headerStyle.font ?? {}
    sheet.getRow(1).alignment = headerStyle.alignment ?? {}

    sheet.columns.forEach(col => {
      if (col.eachCell) {
        col.eachCell(cell => {
          if (cell.value && typeof (cell.value) === 'string' && parseInt(cell.col) === 5 && parseInt(cell.row) > 1) {
            cell.value = parseFloat(cell.value)
          }
        })
      }
    })

    tableIncentivePreviewList.map((rowTools) => {
      if (timelineEvent.step === TimelineEventType.FundDisbursement) {
        sheet.addRow(rowTools.splice(0, 10))
      } else {
        sheet.addRow(rowTools)
      }
    })

    workbook.xlsx.writeBuffer()
      .then(result => {
        const file = new File([result], `Tabel Spesifikasi Rinci Peralatan.xlsx`)
        saveAs(file)
      })
  }

  if (!timelineEvent || !reviewer) {
    return <Loading />;
  }

  return (
    <div className="mt-3">
      <div className="columns is-centered">
        <div className="column is-12-widescreen">
          <div className="box p-5">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h1 className="title is-size-4">Tahap</h1>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  {started && !finished && (
                    <button
                      className="button is-small is-primary"
                      onClick={() => submitProposal()}>
                      <div className="icon is-small is-left">
                        <FontAwesomeIcon icon={faSave} />
                      </div>
                      <span>Simpan</span>
                    </button>
                  )}
                </div>
                <div className="level-item">
                  <button
                    className="button is-small mx-1"
                    onClick={() => history.goBack()}>
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faArrowCircleLeft} />
                    </div>
                    <span>Kembali</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="mb-4">
              <strong>{timelineEvent.title}</strong>
              <br />
              {DateTime.fromJSDate(new Date(timelineEvent.startedAt))
                .setLocale('id-ID')
                .toFormat('EEEE, d LLLL yyyy')}{' '}
              - &nbsp;
              {DateTime.fromJSDate(new Date(timelineEvent.finishedAt))
                .setLocale('id-ID')
                .toFormat('EEEE, d LLLL yyyy')}
            </p>
            {reviewer!.length > 0 && (
              <div className="columns">
                <div className="column is-12">
                  <div className="card mb-4">
                    <div className="card-content">
                      <h1 className="title is-size-4">Hasil Review</h1>
                      <h3 className="is-size-6 has-text-weight-bold">
                        Reviewer
                      </h3>
                      <p>{reviewer[0]}</p>
                      <h3 className="is-size-6 mt-3 has-text-weight-bold">
                        Komentar
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{ __html: comment! }}
                      />
                      <h3 className="is-size-6 mt-3 has-text-weight-bold">
                        Status
                      </h3>
                      {status == ProposalStatus.Approve && <p>Disetujui</p>}
                      {status == ProposalStatus.Send && <p>Dikirim</p>}
                      {status == ProposalStatus.Decline && <p>Ditolak</p>}
                      {status == ProposalStatus.Revision && <p>Revisi</p>}
                      <h3 className="is-size-6 mt-3 has-text-weight-bold">
                        Nilai
                      </h3>
                      <p>{scores}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!started && (
              <div className="columns">
                <div className="column">
                  <div className="card  mb-4">
                    <div className="card-content">
                      <div className="is-flex is-flex-direction-column is-align-items-center">
                        <FontAwesomeIcon
                          className="is-size-1 mb-3"
                          icon={faExclamationCircle}
                        />
                        <p className="is-size-5">Belum dimulai</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {started && !joined && (
              <div className="columns">
                <div className="column">
                  <div className="card  mb-4">
                    <div className="card-content">
                      <div className="is-flex is-flex-direction-column is-align-items-center">
                        <FontAwesomeIcon
                          className="is-size-1 mb-3"
                          icon={faExclamationCircle}
                        />
                        <p className="is-size-5">Tidak mengikuti</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {started && joined && (
              <>
                {timelineEvent.step === TimelineEventType.Selection && (
                  <div className="columns">
                    <div className="column">
                      <div className="card  mb-4">
                        <div className="card-content">
                          <h1 className="title is-size-4">Proposal</h1>
                          <div className="field">
                            <label htmlFor="title">
                              <strong>Judul</strong>
                            </label>
                            <div className="control">
                              <input
                                type="text"
                                className="input my-2"
                                value={title}
                                onChange={ev => setTitle(ev.target.value)}
                                disabled={finished}
                              />
                            </div>
                          </div>
                          <div className="field">
                            <label htmlFor="title">
                              <strong>Ringkasan</strong>
                            </label>
                            <div className="my-2">
                              {!finished && (
                                <TextEditor
                                  content={description ?? ''}
                                  onChange={HTMLResult =>
                                    setDescription(HTMLResult)
                                  }
                                />
                              )}
                              {finished && (
                                <div
                                  className="content"
                                  dangerouslySetInnerHTML={{
                                    __html: description,
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          <div className="field">
                            <label htmlFor="title">
                              <strong>Ketua Tim Task Force</strong>
                            </label>
                            <div className="control">
                              <input
                                type="text"
                                className="input my-2"
                                value={leader}
                                onChange={ev => setLeader(ev.target.value)}
                                disabled={finished}
                              />
                            </div>
                          </div>
                          {!finished && (
                            <>
                              <div className="columns mt-3">
                                <button
                                  className="button is-small is-primary"
                                  onClick={() => doUpload()}>
                                  <div className="icon is-small is-left">
                                    <FontAwesomeIcon icon={faUpload} />
                                  </div>
                                  <span>Pilih Proposal</span>
                                </button>
                              </div>
                            </>
                          )}
                          {proposalFile && (
                            <div className="mt-5">
                              <strong>Proposal yang sudah diupload:</strong>
                              <div className="columns is-multiline mt-1">
                                <div className="column is-4">
                                  <div className="card">
                                    <div className="card-content">
                                      <div className="title is-size-6">
                                        {proposalFileName}
                                      </div>
                                      <div className="subtitle is-size-6">
                                        Status: {convertProposalStatus(status!)}
                                      </div>
                                    </div>
                                    <div className="card-footer">
                                      <a
                                        href="/"
                                        onClick={ev => {
                                          ev.preventDefault();
                                          doPreview(proposalFile);
                                        }}
                                        className="card-footer-item">
                                        Buka
                                      </a>
                                      <a
                                        href={API_URL + proposalFile}
                                        target="_blank"
                                        className="card-footer-item"
                                        rel="noreferrer">
                                        Unduh
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {uploadedFile && (
                            <div className="mt-5">
                              <strong>Proposal akan diupload:</strong>
                              <div className="columns is-multiline mt-1">
                                <div className="column is-4">
                                  <div className="card">
                                    <div className="card-content">
                                      {uploadedFile?.name}
                                    </div>
                                    <div className="card-footer">
                                      <a
                                        href="/"
                                        className="card-footer-item"
                                        onClick={ev => {
                                          ev.preventDefault();
                                          removeFile();
                                        }}>
                                        Hapus
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {!finished &&
                            <div className="columns">
                              <button
                                className="button is-small is-primary mt-3"
                                onClick={() => doAttachmentUpload()}>
                                <div className="icon is-small is-left">
                                  <FontAwesomeIcon icon={faUpload} />
                                </div>
                                <span>Pilih Lampiran</span>
                              </button>
                            </div>}
                          {attachmentFile && (
                            <div className="mt-5">
                              <strong>Lampiran yang sudah diupload:</strong>
                              <div className="columns is-multiline mt-1">
                                <div className="column is-4">
                                  <div className="card">
                                    <div className="card-content">
                                      <div className="title is-size-6">
                                        {attachmentFileName}
                                      </div>
                                    </div>
                                    <div className="card-footer">
                                      <a
                                        href="/"
                                        onClick={ev => {
                                          ev.preventDefault();
                                          doAttachmentPreview(attachmentFile);
                                        }}
                                        className="card-footer-item">
                                        Buka
                                      </a>
                                      <a
                                        href={API_URL + attachmentFile}
                                        target="_blank"
                                        className="card-footer-item"
                                        rel="noreferrer">
                                        Unduh
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {uploadedAttachmentFile && (
                            <div className="mt-5">
                              <strong>Lampiran akan diupload:</strong>
                              <div className="columns is-multiline mt-1">
                                <div className="column is-4">
                                  <div className="card">
                                    <div className="card-content">
                                      {uploadedAttachmentFile?.name}
                                    </div>
                                    <div className="card-footer">
                                      <a
                                        href="/"
                                        className="card-footer-item"
                                        onClick={ev => {
                                          ev.preventDefault();
                                          removeAttachmentFile();
                                        }}>
                                        Hapus
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* 2 */}
                {timelineEvent.step == TimelineEventType.ProgramPlanning && dataProgramPlanning.detailProgram && (
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
                              <input
                                type="text"
                                className="input my-2"
                                value={
                                  dataProgramPlanning.detailProgram.title
                                }
                                onChange={ev =>
                                  setDataProgramPlanning({
                                    ...dataProgramPlanning,
                                    detailProgram: {
                                      ...dataProgramPlanning.detailProgram,
                                      title: ev?.target.value,
                                    },
                                  } as ProgramPlanningInterface)
                                }
                                disabled={finished}
                              />
                            </div>
                          </div>
                          <div className="field">
                            <label htmlFor="code">
                              <strong>Kode Program</strong>
                            </label>
                            <input
                              type="text"
                              className="input my-2"
                              value={
                                dataProgramPlanning?.detailProgram.code ?? ''
                              }
                              onChange={ev =>
                                setDataProgramPlanning({
                                  ...dataProgramPlanning,
                                  detailProgram: {
                                    ...dataProgramPlanning.detailProgram,
                                    code: ev?.target.value,
                                  },
                                } as ProgramPlanningInterface)
                              }
                              disabled={finished}
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="code">
                              <strong>Skema Pengajuan</strong>
                            </label>
                            <input
                              type="text"
                              className="input my-2"
                              value={
                                dataProgramPlanning?.detailProgram.scheme ?? ''
                              }
                              onChange={ev =>
                                setDataProgramPlanning({
                                  ...dataProgramPlanning,
                                  detailProgram: {
                                    ...dataProgramPlanning.detailProgram,
                                    scheme: ev?.target.value,
                                  },
                                } as ProgramPlanningInterface)
                              }
                              disabled={finished}
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="code">
                              <strong>Pengajuan</strong>
                            </label>
                            <input
                              type="text"
                              className="input my-2"
                              value={
                                dataProgramPlanning?.detailProgram.submission ??
                                ''
                              }
                              onChange={ev =>
                                setDataProgramPlanning({
                                  ...dataProgramPlanning,
                                  detailProgram: {
                                    ...dataProgramPlanning.detailProgram,
                                    submission: ev?.target.value,
                                  },
                                } as ProgramPlanningInterface)
                              }
                              disabled={finished}
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="code">
                              <strong>Batch</strong>
                            </label>
                            <input
                              type="text"
                              className="input my-2"
                              value={
                                dataProgramPlanning?.detailProgram.batch ?? ''
                              }
                              onChange={ev =>
                                setDataProgramPlanning({
                                  ...dataProgramPlanning,
                                  detailProgram: {
                                    ...dataProgramPlanning.detailProgram,
                                    batch: ev?.target.value,
                                  },
                                } as ProgramPlanningInterface)
                              }
                              disabled={finished}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="card mb-4">
                        <div className="card-content">
                          <h1 className="title is-size-4">2. Roadmap</h1>
                          <div className="field">
                            <TextEditor
                              onChange={val =>
                                setDataProgramPlanning({
                                  ...dataProgramPlanning,
                                  roadmap: val,
                                } as ProgramPlanningInterface)
                              }
                              content={dataProgramPlanning?.roadmap ?? ''}
                              height={500}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="card mb-4">
                        <div className="card-content">
                          <h1 className="title is-size-4">3. IKU</h1>
                          <div className="field">
                            <button
                              className="button is-small is-primary"
                              onClick={() => setUploadIkuModalVisibility(true)}>
                              <div className="icon is-small is-left">
                                <FontAwesomeIcon icon={faUpload} />
                              </div>
                              <span>Pilih File IKU</span>
                            </button>
                            <a href={`${FRONTEND_URL}/assets/documents/2.1.xlsx`}>
                              <button
                                className="button is-small is-primary ml-3">
                                <div className="icon is-small is-left ml-2">
                                  <FontAwesomeIcon icon={faDownload} />
                                </div>
                                <span>Unduh Format IKU</span>
                              </button>
                            </a>
                          </div>
                          {tableIkuPreviewList.length > 0 && (
                            <div
                              className="modal-card-body"
                              style={{ overflowX: 'auto' }}>
                              <table
                                className="table is-bordered is-fullwidth"
                                style={{ whiteSpace: 'nowrap' }}>
                                <thead>
                                  <tr>
                                    <th rowSpan={2}>NO</th>
                                    <th rowSpan={2}>IKU</th>
                                    <th colSpan={2}>Baseline 2022</th>
                                    <th colSpan={2}>Target 2022</th>
                                    <th colSpan={2}>Target 2023</th>
                                  </tr>
                                  <tr>
                                    <th>Jumlah</th>
                                    <th>Rasio (%)</th>
                                    <th>Jumlah</th>
                                    <th>Rasio (%)</th>
                                    <th>Jumlah</th>
                                    <th>Rasio (%)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableIkuPreviewList.map((rowData, idx) => (
                                    <tr key={idx}>
                                      {rowData.map((text, dataIdx) => (
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
                                      <input
                                        type="text"
                                        className="input my-2"
                                        value={activity.title}
                                        onChange={ev => {
                                          const newActivityList =
                                            dataProgramPlanning.activityList;
                                          newActivityList[index] = {
                                            ...activity,
                                            title: ev.target.value,
                                          };
                                          setDataProgramPlanning({
                                            ...dataProgramPlanning,
                                            activityList: newActivityList,
                                          } as ProgramPlanningInterface);
                                        }}
                                        disabled={finished}
                                      />
                                    </div>
                                  </div>
                                  <div className="field">
                                    <label htmlFor="title">
                                      <strong>
                                        a. Latar belakang dan Rasional
                                      </strong>
                                    </label>
                                    <TextEditor
                                      onChange={val => {
                                        const newActivityList =
                                          dataProgramPlanning.activityList;
                                        newActivityList[index] = {
                                          ...activity,
                                          background: val,
                                        };
                                        setDataProgramPlanning({
                                          ...dataProgramPlanning,
                                          activityList: newActivityList,
                                        } as ProgramPlanningInterface);
                                      }}
                                      content={activity.background ?? ''}
                                      height={500}
                                    />
                                  </div>
                                  <div className="field">
                                    <label htmlFor="title">
                                      <strong>b. Tujuan</strong>
                                    </label>
                                    <TextEditor
                                      onChange={val => {
                                        const newActivityList =
                                          dataProgramPlanning.activityList;
                                        newActivityList[index] = {
                                          ...activity,
                                          goal: val,
                                        };
                                        setDataProgramPlanning({
                                          ...dataProgramPlanning,
                                          activityList: newActivityList,
                                        } as ProgramPlanningInterface);
                                      }}
                                      content={activity.goal ?? ''}
                                      height={500}
                                    />
                                  </div>
                                  <div className="field">
                                    <label htmlFor="title">
                                      <strong>
                                        c. Mekanisme dan Tahapan Pelaksanaan
                                      </strong>
                                    </label>
                                    <TextEditor
                                      onChange={val => {
                                        const newActivityList =
                                          dataProgramPlanning.activityList;
                                        newActivityList[index] = {
                                          ...activity,
                                          mechanism: val,
                                        };
                                        setDataProgramPlanning({
                                          ...dataProgramPlanning,
                                          activityList: newActivityList,
                                        } as ProgramPlanningInterface);
                                      }}
                                      content={activity.mechanism ?? ''}
                                      height={500}
                                    />
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                          <button
                            className="button is-small is-primary"
                            onClick={() =>
                              setDataProgramPlanning({
                                ...dataProgramPlanning,
                                activityList: [
                                  ...(dataProgramPlanning?.activityList ?? []),
                                  ...[
                                    {
                                      code: '',
                                      title: '',
                                      background: '',
                                      goal: '',
                                      mechanism: '',
                                      partner: '',
                                      resource: '',
                                      indicator: '',
                                      continuity: '',
                                      pic: '',
                                    },
                                  ],
                                ],
                              } as ProgramPlanningInterface)
                            }>
                            <div className="icon is-small is-left">
                              <FontAwesomeIcon icon={faPlus} />
                            </div>
                            <span>Tambah</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* 3 */}
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
                              <input
                                type="text"
                                className="input my-2"
                                value={
                                  dataEvent.title ?? ''
                                }
                                onChange={ev =>
                                  setDataEvent({
                                    ...dataEvent,
                                    title: ev.target.value
                                  } as EventInterface)
                                }
                                disabled={finished}
                              />
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
                                      <input
                                        type="text"
                                        className="input my-2"
                                        value={activity.title}
                                        onChange={ev => {
                                          const newActivityList =
                                            dataEvent.activityList;
                                          newActivityList[index] = {
                                            ...activity,
                                            title: ev.target.value,
                                          };
                                          setDataEvent({
                                            ...dataEvent,
                                            activityList: newActivityList,
                                          } as EventInterface);
                                        }}
                                        disabled={finished}
                                      />
                                    </div>
                                  </div>
                                  <div className="field">
                                    <label htmlFor="title">
                                      <strong>Kode</strong>
                                    </label>
                                    <div className="control">
                                      <input
                                        type="text"
                                        className="input my-2"
                                        value={activity.code}
                                        onChange={ev => {
                                          const newActivityList =
                                            dataEvent.activityList;
                                          newActivityList[index] = {
                                            ...activity,
                                            code: ev.target.value,
                                          };
                                          setDataEvent({
                                            ...dataEvent,
                                            activityList: newActivityList,
                                          } as EventInterface);
                                        }}
                                        disabled={finished}
                                      />
                                    </div>
                                  </div>
                                  <div className="field">
                                    <label htmlFor="title">
                                      <strong>Daftar Sub Aktivitas</strong>
                                      {dataEvent.activityList[index].subActivityList.map(
                                        (subActivity, subIndex) => (
                                          <div className="card mt-2 mb-4">
                                            <div className="card-content">
                                              <div className="is-flex is-flex-direction-row is-justify-content-space-between	">
                                                <h1 className="title is-size-5">
                                                  Sub Aktivitas {subIndex + 1}
                                                </h1>
                                                <button
                                                  className="button is-small is-primary"
                                                  onClick={() => {
                                                    const newActivityList = dataEvent.activityList;
                                                    newActivityList[index] = {
                                                      ...newActivityList[index],
                                                      subActivityList: [
                                                        ...newActivityList[index].subActivityList.filter((subActivity) => JSON.stringify(subActivity) !== JSON.stringify(newActivityList[index].subActivityList[subIndex])),
                                                      ],
                                                    };
                                                    setDataEvent({
                                                      ...dataEvent,
                                                      activityList: newActivityList,
                                                    } as EventInterface);
                                                  }
                                                  }>
                                                  <div className="icon is-small is-left">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                  </div>
                                                  <span>Hapus</span>
                                                </button>
                                              </div>
                                              <div className="field">
                                                <label htmlFor="title">
                                                  <strong>Judul</strong>
                                                </label>
                                                <div className="control">
                                                  <input
                                                    type="text"
                                                    className="input my-2"
                                                    value={subActivity.title}
                                                    onChange={ev => {
                                                      const newSubActivityList = dataEvent.activityList[index].subActivityList;
                                                      newSubActivityList[subIndex] = {
                                                        ...subActivity,
                                                        title: ev.target.value,
                                                      };
                                                      const newActivityList = dataEvent.activityList;
                                                      newActivityList[index] = {
                                                        ...activity,
                                                        subActivityList: newSubActivityList
                                                      };
                                                      setDataEvent({
                                                        ...dataEvent,
                                                        activityList: newActivityList,
                                                      } as EventInterface);
                                                    }}
                                                    disabled={finished}
                                                  />
                                                </div>
                                              </div>
                                              <div className="field">
                                                <label htmlFor="title">
                                                  <strong>PIC</strong>
                                                </label>
                                                <div className="control">
                                                  <input
                                                    type="text"
                                                    className="input my-2"
                                                    value={subActivity.PIC}
                                                    onChange={ev => {
                                                      const newSubActivityList = dataEvent.activityList[index].subActivityList;
                                                      newSubActivityList[subIndex] = {
                                                        ...subActivity,
                                                        PIC: ev.target.value,
                                                      };
                                                      const newActivityList = dataEvent.activityList;
                                                      newActivityList[index] = {
                                                        ...activity,
                                                        subActivityList: newSubActivityList
                                                      };
                                                      setDataEvent({
                                                        ...dataEvent,
                                                        activityList: newActivityList,
                                                      } as EventInterface);
                                                    }}
                                                    disabled={finished}
                                                  />
                                                </div>
                                              </div>
                                              <div className="field">
                                                <label htmlFor="title">
                                                  <strong>Kode</strong>
                                                </label>
                                                <div className="control">
                                                  <input
                                                    type="text"
                                                    className="input my-2"
                                                    value={subActivity.code}
                                                    onChange={ev => {
                                                      const newSubActivityList = dataEvent.activityList[index].subActivityList;
                                                      newSubActivityList[subIndex] = {
                                                        ...subActivity,
                                                        code: ev.target.value,
                                                      };
                                                      const newActivityList = dataEvent.activityList;
                                                      newActivityList[index] = {
                                                        ...activity,
                                                        subActivityList: newSubActivityList
                                                      };
                                                      setDataEvent({
                                                        ...dataEvent,
                                                        activityList: newActivityList,
                                                      } as EventInterface);
                                                    }}
                                                    disabled={finished}
                                                  />
                                                </div>
                                              </div>
                                              <div className="field">
                                                <label htmlFor="title">
                                                  <strong>Tempat</strong>
                                                </label>
                                                <div className="control">
                                                  <input
                                                    type="text"
                                                    className="input my-2"
                                                    value={subActivity.place}
                                                    onChange={ev => {
                                                      const newSubActivityList = dataEvent.activityList[index].subActivityList;
                                                      newSubActivityList[subIndex] = {
                                                        ...subActivity,
                                                        place: ev.target.value
                                                      };
                                                      const newActivityList = dataEvent.activityList;
                                                      newActivityList[index] = {
                                                        ...activity,
                                                        subActivityList: newSubActivityList
                                                      };
                                                      setDataEvent({
                                                        ...dataEvent,
                                                        activityList: newActivityList,
                                                      } as EventInterface);
                                                    }}
                                                    disabled={finished}
                                                  />
                                                </div>
                                              </div>
                                              <div className="field">
                                                <label htmlFor="title">
                                                  <strong>Arahan</strong>
                                                </label>
                                                <div className="control">
                                                  <input
                                                    type="text"
                                                    className="input my-2"
                                                    value={subActivity.instruction}
                                                    onChange={ev => {
                                                      const newSubActivityList = dataEvent.activityList[index].subActivityList;
                                                      newSubActivityList[subIndex] = {
                                                        ...subActivity,
                                                        instruction: ev.target.value,
                                                      };
                                                      const newActivityList = dataEvent.activityList;
                                                      newActivityList[index] = {
                                                        ...activity,
                                                        subActivityList: newSubActivityList
                                                      };
                                                      setDataEvent({
                                                        ...dataEvent,
                                                        activityList: newActivityList,
                                                      } as EventInterface);
                                                    }}
                                                    disabled={finished}
                                                  />
                                                </div>
                                              </div>
                                              <div className="columns">
                                                <div className="column">
                                                  <div className="field">
                                                    <label htmlFor="title">
                                                      <strong>Mulai</strong>
                                                    </label>
                                                    <div className="control">
                                                      <input type="date" className="input" value={subActivity.startedAt} onChange={(ev) => {
                                                        const newSubActivityList = dataEvent.activityList[index].subActivityList;
                                                        newSubActivityList[subIndex] = {
                                                          ...subActivity,
                                                          startedAt: ev.target.value
                                                        };
                                                        const newActivityList = dataEvent.activityList;
                                                        newActivityList[index] = {
                                                          ...activity,
                                                          subActivityList: newSubActivityList
                                                        };
                                                        setDataEvent({
                                                          ...dataEvent,
                                                          activityList: newActivityList,
                                                        } as EventInterface)
                                                      }} />
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="column">
                                                  <div className="field">
                                                    <label htmlFor="title">
                                                      <strong>Selesai</strong>
                                                    </label>
                                                    <div className="control">
                                                      <input type="date" className="input" value={subActivity.finishedAt} onChange={(ev) => {
                                                        const newSubActivityList = dataEvent.activityList[index].subActivityList;
                                                        newSubActivityList[subIndex] = {
                                                          ...subActivity,
                                                          finishedAt: ev.target.value
                                                        };
                                                        const newActivityList = dataEvent.activityList;
                                                        newActivityList[index] = {
                                                          ...activity,
                                                          subActivityList: newSubActivityList
                                                        };
                                                        setDataEvent({
                                                          ...dataEvent,
                                                          activityList: newActivityList,
                                                        } as EventInterface)
                                                      }} />
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="field">
                                                <label htmlFor="title">
                                                  <strong>Nara Sumber</strong>
                                                </label>
                                                <div className="control">
                                                  <input
                                                    type="text"
                                                    className="input my-2"
                                                    value={subActivity.sourcePerson}
                                                    onChange={ev => {
                                                      const newSubActivityList = dataEvent.activityList[index].subActivityList;
                                                      newSubActivityList[subIndex] = {
                                                        ...subActivity,
                                                        sourcePerson: ev.target.value
                                                      };
                                                      const newActivityList = dataEvent.activityList;
                                                      newActivityList[index] = {
                                                        ...activity,
                                                        subActivityList: newSubActivityList
                                                      };
                                                      setDataEvent({
                                                        ...dataEvent,
                                                        activityList: newActivityList,
                                                      } as EventInterface);
                                                    }}
                                                    disabled={finished}
                                                  />
                                                </div>
                                              </div>
                                              <div className="field">
                                                <label htmlFor="title">
                                                  <strong>Peserta</strong>
                                                </label>
                                                <div className="control">
                                                  <input
                                                    type="text"
                                                    className="input my-2"
                                                    value={subActivity.participant}
                                                    onChange={ev => {
                                                      const newSubActivityList = dataEvent.activityList[index].subActivityList;
                                                      newSubActivityList[subIndex] = {
                                                        ...subActivity,
                                                        participant: ev.target.value
                                                      };
                                                      const newActivityList = dataEvent.activityList;
                                                      newActivityList[index] = {
                                                        ...activity,
                                                        subActivityList: newSubActivityList
                                                      };
                                                      setDataEvent({
                                                        ...dataEvent,
                                                        activityList: newActivityList,
                                                      } as EventInterface);
                                                    }}
                                                    disabled={finished}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </label>
                                    <div className="control">
                                      <button
                                        className="button is-small is-primary"
                                        onClick={() => {
                                          const newActivityList = dataEvent.activityList;
                                          newActivityList[index] = {
                                            ...newActivityList[index],
                                            subActivityList: [
                                              ...newActivityList[index].subActivityList,
                                              ...[{
                                                title: '',
                                                code: '',
                                                PIC: '',
                                                instruction: '',
                                                startedAt: '',
                                                finishedAt: '',
                                                place: '',
                                                sourcePerson: '',
                                                participant: '',
                                                description: '',
                                                funding: 0,
                                                youtubeLink: '',
                                                publicationLink: '',
                                                documentationLink: '',
                                              }]
                                            ],
                                          };
                                          setDataEvent({
                                            ...dataEvent,
                                            activityList: newActivityList,
                                          } as EventInterface);
                                        }
                                        }>
                                        <div className="icon is-small is-left">
                                          <FontAwesomeIcon icon={faPlus} />
                                        </div>
                                        <span>Tambah</span>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="field mt-2">
                                    <h1 className="title is-size-4">Anggaran</h1>
                                    <div className="field">
                                      <button
                                        className="button is-small is-primary"
                                        onClick={() => {
                                          setFocusedActivity(index)
                                          setUploadTableFundingModalVisibility(true)
                                        }
                                        }>
                                        <div className="icon is-small is-left">
                                          <FontAwesomeIcon icon={faUpload} />
                                        </div>
                                        <span>Pilih File Tabel Anggaran</span>
                                      </button>
                                      <a href={`${FRONTEND_URL}/assets/documents/3.1.xlsx`}>
                                        <button
                                          className="button is-small is-primary ml-3"
                                        >
                                          <div className="icon is-small is-left ml-2">
                                            <FontAwesomeIcon icon={faDownload} />
                                          </div>
                                          <span>Unduh Format Tabel Anggaran</span>
                                        </button>
                                      </a>
                                    </div>
                                    {activity.funding.length > 0 && (
                                      <div style={{ overflowX: 'auto' }}>
                                        <table
                                          className="table is-bordered"
                                          style={{
                                            whiteSpace: 'nowrap',
                                          }}>
                                          <thead>
                                            <tr>
                                              <th rowSpan={2}>Kode Subaktivitas</th>
                                              <th rowSpan={2}>Subaktivitas</th>
                                              <th rowSpan={2}>Komponen Biaya Anggaran</th>
                                              <th colSpan={3}>Prakiraan Biaya (Rp)</th>
                                            </tr>
                                            <tr>
                                              <th>PK-KM</th>
                                              <th>PT</th>
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
                          <button
                            className="button is-small is-primary"
                            onClick={() =>
                              setDataEvent({
                                ...dataEvent,
                                activityList: [
                                  ...(dataEvent?.activityList ?? []),
                                  ...[
                                    {
                                      subActivityList: [],
                                      comment: '',
                                      funding: [],
                                      code: '',
                                      title: '',
                                      background: '',
                                      goal: '',
                                      mechanism: '',
                                      partner: '',
                                      resource: '',
                                      indicator: '',
                                      continuity: '',
                                      pic: '',
                                    },
                                  ],
                                ],
                              } as EventInterface)
                            }>
                            <div className="icon is-small is-left">
                              <FontAwesomeIcon icon={faPlus} />
                            </div>
                            <span>Tambah</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* 4 */}
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
                          <div className="field">
                            <button
                              className="button is-small is-primary"
                              onClick={() =>
                                setUploadTableToolsModalVisibility(true)
                              }>
                              <div className="icon is-small is-left">
                                <FontAwesomeIcon icon={faUpload} />
                              </div>
                              <span>Pilih File Tabel Spesifikasi Rinci Peralatan</span>
                            </button>
                            <a href={`${FRONTEND_URL}/assets/documents/4.1.xlsx`}>
                              <button
                                className="button is-small is-primary ml-3"
                              >
                                <div className="icon is-small is-left ml-2">
                                  <FontAwesomeIcon icon={faDownload} />
                                </div>
                                <span>Unduh Format Tabel Spesifikasi Rinci Peralatan</span>
                              </button>
                            </a>
                          </div>
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
                                    <th>Prodi</th>
                                    <th>Kode Subaktivitas</th>
                                    <th>IKU Sasaran</th>
                                    <th>Nama Alat</th>
                                    <th>Spesifikasi Teknis</th>
                                    <th>Jumlah</th>
                                    <th>Harga Satuan</th>
                                    <th>Prakiraan Biaya</th>
                                    <th>Status Pencairan</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableToolsPreviewList.map(
                                    (rowData, idx) => (
                                      <tr key={idx}>
                                        {rowData.map((text, dataIdx) => (
                                          <td key={dataIdx}>{dataIdx === 9 ? <Checkbox
                                            checked={text === '1'}
                                            disabled={true}
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
                              {/*<button
                                className="button is-small is-primary ml-3"
                                onClick={() => exportTableTools()}
                              >
                                <div className="icon is-small is-left ml-2">
                                  <FontAwesomeIcon icon={faFileDownload} />
                                </div>
                                <span>Ekspor Tabel Spesifikasi Rinci Peralatan</span>
                                </button>*/}
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
                          <div className="field">
                            <button
                              className="button is-small is-primary"
                              onClick={() =>
                                setUploadTableIncentiveModalVisibility(true)
                              }>
                              <div className="icon is-small is-left">
                                <FontAwesomeIcon icon={faUpload} />
                              </div>
                              <span>Pilih File Tabel Rincian Usulan Bantuan/Insentif</span>
                            </button>

                            <a href={`${FRONTEND_URL}/assets/documents/4.2.xlsx`}>
                              <button
                                className="button is-small is-primary ml-3">
                                <div className="icon is-small is-left ml-2">
                                  <FontAwesomeIcon icon={faDownload} />
                                </div>
                                <span>Unduh Format Tabel Rincian Usulan Bantuan/Insentif</span>
                              </button>
                            </a>
                          </div>
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
                                    (rowData, idx) => (
                                      <tr key={idx}>
                                        {rowData.map((text, dataIdx) => (
                                          <td key={dataIdx}>{dataIdx == 11 ?
                                            <Checkbox
                                              checked={text === '1'}
                                              disabled={true}
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
                              {/*<button
                                className="button is-small is-primary ml-3"
                                onClick={() => exportTableIncentive()}
                              >
                                <div className="icon is-small is-left ml-2">
                                  <FontAwesomeIcon icon={faFileDownload} />
                                </div>
                                <span>Ekspor Tabel Rincian Usulan Bantuan/Insentif</span>
                              </button>*/}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* 5 */}
                {timelineEvent.step == TimelineEventType.ReportAndSPJ && (
                  <div className="columns">
                    <div className="column" style={{ overflowX: 'auto' }}>
                      <div className="card mb-4">
                        <div className="card-content">
                          <h1 className="title is-size-4">1. Tabel Aktivitas</h1>
                          <div className="field">
                            <button
                              className="button is-small is-primary"
                              onClick={() =>
                                setUploadTableActivityModalVisibility(true)
                              }>
                              <div className="icon is-small is-left">
                                <FontAwesomeIcon icon={faUpload} />
                              </div>
                              <span>Pilih File Tabel Aktivitas</span>
                            </button>

                            <a href={`${FRONTEND_URL}/assets/documents/5.1.xlsx`}>
                              <button
                                className="button is-small is-primary ml-3"
                              >
                                <div className="icon is-small is-left ml-2">
                                  <FontAwesomeIcon icon={faDownload} />
                                </div>
                                <span>Unduh Format Tabel Aktivitias</span>
                              </button>
                            </a>
                          </div>
                          {tableActivityPreviewList.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                              <table
                                className="table is-bordered"
                                style={{
                                  whiteSpace: 'nowrap',
                                }}>
                                <thead>
                                  <tr>
                                    <th>No</th>
                                    <th>Kode Subaktivitas</th>
                                    <th>Program</th>
                                    <th>Aktivitas</th>
                                    <th>Subaktivitas</th>
                                    <th>Link Youtube</th>
                                    <th>Link Publikasi Media</th>
                                    <th>Link Dokumentasi Foto</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableActivityPreviewList.map(
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
                      <div className="card mb-4">
                        <div className="card-content">
                          <h1 className="title is-size-4">2. Tabel Spesifikasi Rinci Peralatan</h1>
                          <div className="field">
                            <button
                              className="button is-small is-primary"
                              onClick={() =>
                                setUploadTableToolsModalVisibility(true)
                              }>
                              <div className="icon is-small is-left">
                                <FontAwesomeIcon icon={faUpload} />
                              </div>
                              <span>Pilih File Tabel Spesifikasi Rinci Peralatan</span>
                            </button>

                            <a href={`${FRONTEND_URL}/assets/documents/5.2.xlsx`}>
                              <button
                                className="button is-small is-primary ml-3"
                              >
                                <div className="icon is-small is-left ml-2">
                                  <FontAwesomeIcon icon={faDownload} />
                                </div>
                                <span>Unduh Format Tabel Spesifikasi Rinci Peralatan</span>
                              </button>
                            </a>
                          </div>
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
                                    <th>Dana Cair</th>
                                    <th>Dana Digunakan</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableToolsPreviewList.map(
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
                              {/*<button
                                className="button is-small is-primary ml-3"
                                onClick={() => exportTableTools()}
                              >
                                <div className="icon is-small is-left ml-2">
                                  <FontAwesomeIcon icon={faFileDownload} />
                                </div>
                                <span>Ekspor Tabel Spesifikasi Rinci Peralatan</span>
                              </button>*/}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="card mb-4">
                        <div className="card-content">
                          <h1 className="title is-size-4">3. Tabel Rincian Usulan Bantuan/Insentif</h1>
                          <div className="field">
                            <button
                              className="button is-small is-primary"
                              onClick={() =>
                                setUploadTableIncentiveModalVisibility(true)
                              }>
                              <div className="icon is-small is-left">
                                <FontAwesomeIcon icon={faUpload} />
                              </div>
                              <span>Pilih File Tabel Rincian Usulan Bantuan/Insentif</span>
                            </button>
                            <a href={`${FRONTEND_URL}/assets/documents/5.3.xlsx`}>
                              <button
                                className="button is-small is-primary ml-3"
                              >
                                <div className="icon is-small is-left ml-2">
                                  <FontAwesomeIcon icon={faDownload} />
                                </div>
                                <span>Unduh Format Tabel Rincian Usulan Bantuan/Insentif</span>
                              </button>
                            </a>
                          </div>
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
                                    <th rowSpan={2}>Dana Cair</th>
                                    <th rowSpan={2}>Dana Digunakan</th>
                                  </tr>
                                  <tr>
                                    <th>PK-KM</th>
                                    <th>PT</th>
                                    <th>Mitra</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableIncentivePreviewList.map(
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
                      <div className="card mb-4">
                        <div className="card-content">
                          <h1 className="title is-size-4">4. IKU</h1>
                          <div className="field">
                            <button
                              className="button is-small is-primary"
                              onClick={() =>
                                setUploadIkuModalVisibility(true)
                              }>
                              <div className="icon is-small is-left">
                                <FontAwesomeIcon icon={faUpload} />
                              </div>
                              <span>Pilih File Tabel Spesifikasi Rinci Peralatan</span>
                            </button>

                            <a href={`${FRONTEND_URL}/assets/documents/5.4.xlsx`}>
                              <button
                                className="button is-small is-primary ml-3"
                              >
                                <div className="icon is-small is-left ml-2">
                                  <FontAwesomeIcon icon={faDownload} />
                                </div>
                                <span>Unduh Format Tabel Spesifikasi Rinci Peralatan</span>
                              </button>
                            </a>
                          </div>
                          {tableIkuPreviewList.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                              <table
                                className="table is-bordered"
                                style={{
                                  whiteSpace: 'nowrap',
                                }}>
                                <thead>
                                  <tr>
                                    <th rowSpan={2}>NO</th>
                                    <th rowSpan={2}>IKU</th>
                                    <th colSpan={2}>Baseline 2022</th>
                                    <th colSpan={2}>Target 2022</th>
                                    <th colSpan={2}>Target 2023</th>
                                    <th colSpan={2}>Realisasi 2022</th>
                                  </tr>
                                  <tr>
                                    <th>Jumlah</th>
                                    <th>Rasio (%)</th>
                                    <th>Jumlah</th>
                                    <th>Rasio (%)</th>
                                    <th>Jumlah</th>
                                    <th>Rasio (%)</th>
                                    <th>Jumlah</th>
                                    <th>Rasio (%)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableIkuPreviewList.map(
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
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {uploadProposalModalVisible && (
        <FileUploader
          title={`Pilih file untuk proposal`}
          onAcceptFiles={onAcceptFile}
          onCloseRequest={() => setUploadProposalModalVisibility(false)}
        />
      )}
      {uploadAttachmentModalVisible && (
        <FileUploader
          title={`Pilih file untuk lampiran`}
          onAcceptFiles={onAcceptAttachmentFile}
          onCloseRequest={() => setUploadAttachmentModalVisibility(false)}
        />
      )}
      {uploadIkuModalVisible && (
        <FileUploader
          title={`Pilih file untuk data IKU`}
          onCloseRequest={() => setUploadIkuModalVisibility(false)}
          onAcceptFiles={file => previewIkuList(file)}
        />
      )}
      {uploadTableToolsModalVisible && (
        <FileUploader
          title={`Pilih file untuk data Tabel Spesifikasi Rinci Peralatan`}
          onCloseRequest={() => setUploadTableToolsModalVisibility(false)}
          onAcceptFiles={file => previewTableToolsList(file)}
        />
      )}
      {uploadTableIncentiveModalVisible && (
        <FileUploader
          title={`Pilih file untuk data Tabel Rincian Usulan Bantuan/Insentif`}
          onCloseRequest={() => setUploadTableIncentiveModalVisibility(false)}
          onAcceptFiles={file => previewTableIncentiveList(file)}
        />
      )}
      {uploadTableFundingModalVisible && (
        <FileUploader
          title={`Pilih file untuk data Tabel Anggaran`}
          onCloseRequest={() => setUploadTableFundingModalVisibility(false)}
          onAcceptFiles={file => previewTableFundingList(file)}
        />
      )}
      {uploadTableActivityModalVisible && (
        <FileUploader
          title={`Pilih file untuk data Tabel aktivitias`}
          onCloseRequest={() => setUploadTableActivityModalVisibility(false)}
          onAcceptFiles={file => previewTableActivityList(file)}
        />
      )}
      {previewModalVisible && previewFile && (
        <FilePreviewer
          file={previewFile}
          onCloseRequest={() => setPreviewModalVisibility(false)}
        />
      )}
      {previewAttachmentModalVisible && previewAttachmentFile && (
        <FilePreviewer
          file={previewAttachmentFile}
          onCloseRequest={() => setPreviewAttachmentModalVisibility(false)}
        />
      )}
    </div>
  );
}

export default StoreConnector(StaffReadTimelineEvent);
