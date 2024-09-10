import { faBook, faPencilAlt, faUsers } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Box, Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from "@mui/material"
import { yellow, green, blue } from "@mui/material/colors"
import { DateTime } from "luxon"
import MUIDataTable from "mui-datatables"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import APIResponse from "../../interfaces/APIResponse"
import UserInterface, { Privilege } from "../../interfaces/UserInterface"
import { StoreConnector, StoreProps } from "../../redux/actions"
import { tableOptions } from "../../utils/table"
import { SubActivityStatus } from "../Admin"
import { ArticleInterface } from "../ArticleList"
import { EventInterface, ProposalInterface, SubActivityInterface } from "../ProposalList"
import { TimelineEventInterface, TimelineEventType } from "../TimelineEventList"
import { AnnouncementInterface } from "./AnnouncementForm"
import { DepartmentInterface } from "./DepartmentForm"

const API_URL = process.env.REACT_APP_API_URL

interface SummaryInterface {
  studentTotal: number
  proposalTotal: number
  staffTotal: number
  assignmentTotal: number
  studyMaterialTotal: number
  gradeTotal: number
  majorTotal: number
  subjectTotal: number
  levels: Array<number>
}

function DepartmentDashbaord(props: StoreProps) {
  const { token, department, urlPrefix } = props

  const [summary, setSummary] = useState<SummaryInterface>({
    studentTotal: 0,
    proposalTotal: 0,
    staffTotal: 0,
    assignmentTotal: 0,
    studyMaterialTotal: 0,
    gradeTotal: 0,
    majorTotal: 0,
    subjectTotal: 0,
    levels: []
  })

  const [departmentData, setDepartmentData] = useState<DepartmentInterface>()
  const [userData, setUserData] = useState<UserInterface>()
  const [articleList, setArticleList] = useState<Array<ArticleInterface>>([])
  const [announcementList, setAnnouncementList] = useState<Array<AnnouncementInterface>>([])
  const [proposalList, setProposalList] = useState<Array<ProposalInterface>>([])
  const [timelineEventList, setTimelineEventList] = useState<Array<TimelineEventInterface>>([])
  const [subActivityList, setSubActivityList] = useState<Array<SubActivityInterface>>([])

  const [statistic, setStatistic] = useState({
    departmentTotal: 0,
    adminTotal: 0,
    reviewerTotal: 0,
    staffTotal: 0,
    timelineTotal: 0,
    proposalTotal: 0
  })

  const columns = [{
    name: "title",
    label: "Aktivitas",
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
        if(now < startedAt) {
          status = SubActivityStatus.Pending
        } else if(now < finishedAt) {
          status = SubActivityStatus.Started
        } else {
          status = SubActivityStatus.Finished
        }
        return (<Grid container>
          {status ==  SubActivityStatus.Pending && <Box sx={{backgroundColor: yellow[100], borderRadius: 3, padding: 1}}><Typography color={yellow[500]}></Typography>Belum dimulai</Box>}
          {status ==  SubActivityStatus.Started && <Box sx={{backgroundColor: green[100], borderRadius: 3, padding: 1}}><Typography color={green[500]}></Typography>Sedang berlangsung</Box>}
          {status ==  SubActivityStatus.Finished && <Box sx={{backgroundColor: blue[100], borderRadius: 3, padding: 1}}><Typography color={blue[500]}>Selesai</Typography></Box>}
        </Grid>);
      },
    }
  }]

  useEffect(() => {
    if (!token || !department) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/department/dashboard/${department}`, fetchInitOpt)
      .then(result => result.json())
      .then((response: APIResponse<{ currentUserData: UserInterface, summary: SummaryInterface, department: DepartmentInterface }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setUserData(message.currentUserData)
        setSummary(message.summary)
        setDepartmentData(message.department)
      })
      .catch(() => toast('Kegagalan jaringan!', { type: 'error' }))
  }, [token, department, urlPrefix])

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/article`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ articles: Array<ArticleInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setArticleList(message.articles)
      })
      .catch(() => toast('Kegagalan jaringan!', { type: 'error' }))
  }, [token, urlPrefix])

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/announcement`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ announcements: Array<AnnouncementInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setAnnouncementList(message.announcements)
      })
      .catch(err => toast(err.message, { type: 'error' }))
  }, [token, urlPrefix])

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/proposal/step/2`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ proposals: Array<ProposalInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setProposalList(message.proposals.filter((proposal) => proposal))
      })
      .catch(err => toast(err.message, { type: 'error' }))
  }, [token, urlPrefix])

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/timeline-event`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ timelineEvents: Array<TimelineEventInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setTimelineEventList(message.timelineEvents.filter((timelineEvent) => timelineEvent.step == TimelineEventType.Event))
      })
      .catch(err => toast(err.message, { type: 'error' }))
  }, [token, urlPrefix])

  useEffect(() => {
    if (proposalList.length > 0) {
      const newSubActivityList: Array<SubActivityInterface> = []
      proposalList.map((proposal, index) => {
        const activity = proposal.data as EventInterface
        activity.activityList.map((activity, index) => {
          activity.subActivityList.map((subActivity) => {
            newSubActivityList.push({
              department: proposal.department,
              ...subActivity
            })
          })
        })
      })
      setSubActivityList(newSubActivityList)
    }
  }, [proposalList])


  if (!department) {
    return (
      <div className="modal is-active">
        <div className="modal-background"></div>
        <div className="modal-content">
          <div className="box has-text-centered">
            <p>Anda harus pilih prodi terlebih dahulu. Pilih prodi <Link to="/admin/department?rdr=/admin/department/dashboard">di sini</Link>.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <Typography gutterBottom variant="h4">
        <Box fontWeight={550}>Selamat datang {userData?.fullname}</Box>
      </Typography>
      <div className="columns">
        <div className="column is-4">
          <div className="box">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h6 className="title is-size-6">Data Prodi</h6>
                </div>
              </div>
              <div className="level-right">
                {[Privilege.Admin.toString(), Privilege.Staff.toString()].indexOf(userData?.privilege ?? '') > -1 && (
                  <Link to={`${urlPrefix}/department/form/${department}`} className="button is-small is-primary is-rounded">
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </div>
                    <span>Ubah Data</span>
                  </Link>
                )}
              </div>
            </div>
            <img src={`${API_URL}/local-repo/${department}/assets/logo-square.png`} alt="" className="image" style={{ width: '70%', height: 200, objectFit: 'contain' }} />
            <table>
              <tbody>
                <tr>
                  <td style={{ width: 90 }}>Nama</td>
                  <td style={{ width: 5 }}>:</td>
                  <th>{departmentData?.title}</th>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>:</td>
                  <td>{departmentData?.email}</td>
                </tr>
                <tr>
                  <td>Website</td>
                  <td>:</td>
                  <td>{departmentData?.website}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="column">
          <div className="columns is-multiline">
            <div className="column is-4">
              <div className="box  has-text-centered">
                <FontAwesomeIcon className="is-size-2 " icon={faUsers} />
                <h4 className="is-size-4 has-text-centered mt-2">
                  {summary?.staffTotal} Staff Prodi
                </h4>
              </div>
            </div>
            <div className="column is-4">
              <div className="box  has-text-centered">
                <FontAwesomeIcon className="is-size-2 " icon={faBook} />
                <h4 className="is-size-4 has-text-centered mt-2">
                  {summary?.proposalTotal} Laporan
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="columns">
        <div className="column is-12 is-12-mobile">
          <div className="is-flex is-flex-direction-row is-justify-content-space-between">
            <div className="h4 title is-size-4">Daftar Pengumuman</div>
            <Link to={`${urlPrefix}/announcement`}>Lihat semua</Link>
          </div>
          {
            announcementList.map((announcement) => (
              <Link key={announcement._id} to={`${urlPrefix}/announcement/${announcement._id}`}>
                <div className="card mb-2">
                  <div className="card-content">
                    <div className="media">
                      <div className="media-content">
                        <p className="title is-4">{announcement.title}</p>
                        <p className="subtitle is-6">{announcement.writer}</p>
                      </div>
                    </div>
                    <div >
                      {DateTime.fromJSDate(new Date(announcement.displayDate.start)).setLocale('id-ID').toFormat('dd LLLL')} - {DateTime.fromJSDate(new Date(announcement.displayDate.end)).setLocale('id-ID').toFormat('dd LLLL yyyy')}
                      <br />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          }
        </div>
      </div>
      <div className="columns">
        <div className="column is-12 is-12-mobile">
          <div className="is-flex is-flex-direction-row is-justify-content-space-between">
            <Typography gutterBottom variant="h5">
              <Box fontWeight={550}>Daftar Aktivitas</Box>
            </Typography>
            {/*<Link to={`${urlPrefix}/activity`}>
                  <Typography gutterBottom variant="body1">Lihat semua</Typography>
            </Link>*/}
          </div>
          <MUIDataTable
            title={''}
            data={subActivityList}
            columns={columns}
            options={tableOptions}
          />
        </div>
      </div>
      <div className="columns">
        <div className="column is-12 is-12-mobile">
          <div className="is-flex is-flex-direction-row is-justify-content-space-between">
            <div className="h4 title is-size-4">Daftar Berita</div>
            <Link to={`${urlPrefix}/article`}>Lihat semua</Link>
          </div>
        </div>
      </div>
      {articleList.length > 0 && <div className="columns">
        <div className="column is-6 is-12-mobile">
          <Link to={`${urlPrefix}/article/${articleList[0]._id}`}>
            <Card>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image={`${API_URL + articleList[0].featuredImage}`}
                  alt="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {articleList[0].title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {articleList[0].summary}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {articleList[0].writer}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </div>
        <div className="column is-6 is-12-mobile">
          {articleList.length > 1 && articleList.slice(0, 3).map((article) => <Link key={article._id} to={`${urlPrefix}/article/${article._id}`}>
            <Card sx={{ display: 'flex', mb: 2 }}>
              <CardMedia
                component="img"
                sx={{ width: 151 }}
                image={`${API_URL + article.featuredImage}`}
                alt="Live from space album cover"
              />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component="div" variant="h5">
                    {article.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" component="div">
                    {article.summary}
                  </Typography>
                </CardContent>
              </Box>
            </Card>
          </Link>)}
        </div>
      </div>}
    </div>
  )
}

export default StoreConnector(DepartmentDashbaord)
