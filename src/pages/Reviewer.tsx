import { faBook, faCalendar, faInfo, faSchool, faUserCheck, faUsers, faUserShield } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Box, Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@mui/material'
import { yellow, green, blue } from '@mui/material/colors'
import { DateTime } from 'luxon'
import MUIDataTable from 'mui-datatables'
import { useEffect, useState } from 'react'
import { Link, Redirect, Route, Switch } from 'react-router-dom'
import { toast } from 'react-toastify'
import APIResponse from '../interfaces/APIResponse'
import Dashboard from '../layouts/Dashboard'
import { StoreConnector, StoreProps } from '../redux/actions'
import { tableOptions } from '../utils/table'
import ActivityList from './ActivityList'
import { SubActivityStatus } from './Admin'
import AnnouncementList from './AnnouncementList'
import ArticleCategoryList, { ArticleCategoryInterface } from './ArticleCategoryList'
import ArticleList, { ArticleInterface } from './ArticleList'
import DocumentList from './DocumentList'
import EventList from './EventList'
import FundDishbursementList from './FundDishbursementList'
import FundUsingList from './FundUsingList'
import IKUList from './IKUList'
import LinkList from './LinkList'
import ArticleForm from './main/ArticleForm'
import LinkForm from './main/LinkForm'
import ProposalForm from './main/ProposalForm'
import TimelineEventForm from './main/TimelineEventForm'
import TimelineForm from './main/TimelineForm'
import ProposalList, { EventInterface, ProposalInterface, SubActivityInterface } from './ProposalList'
import ProposalReview from './ProposalReview'
import ReadAnnouncement, { AnnouncementInterface } from './ReadAnnouncement'
import ReadArticle from './ReadArticle'
import ReadDocument from './ReadDocument'
import ReadTimelineEvent from './ReadTimelineEvent'
import SubActivityList from './SubActivityList'
import TimelineEventList, { TimelineEventInterface, TimelineEventType } from './TimelineEventList'
import TimelineList from './TimelineList'
import MyAccount from './user/MyAccount'

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000'

function Main(props: StoreProps) {
  const { token, urlPrefix } = props
  const [myName, setMyName] = useState('')
  const [articleList, setArticleList] = useState<Array<ArticleInterface>>([])
  const [articleCategoryList, setArticleCategoryList] = useState<Array<ArticleCategoryInterface>>([])
  const [announcementList, setAnnouncementList] = useState<Array<AnnouncementInterface>>([])
  const [proposalList, setProposalList] = useState<Array<ProposalInterface>>([])
  const [timelineEventList, setTimelineEventList] = useState<Array<TimelineEventInterface>>([])

  const [statistic, setStatistic] = useState({
    departmentTotal: 0,
    adminTotal: 0,
    reviewerTotal: 0,
    staffTotal: 0,
    timelineTotal: 0,
    proposalTotal: 0
  })

  useEffect(() => {
    if (token) {
      const fetchInitOpt = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      fetch(`${API_URL}/reviewer`, fetchInitOpt)
        .then((result) => result.json())
        .then((response) => {
          if (response.success) {
            setStatistic(response.message.statistic);
            setMyName(response.message.currentUserData.fullname);
          }
        });
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/article-category`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ articleCategoryList: Array<ArticleCategoryInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setArticleCategoryList(message.articleCategoryList)
      })
      .catch(() => toast('Kegagalan jaringan!', { type: 'error' }))

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


  return (
    <div className="mt-3">
      <Typography gutterBottom variant="h4">
        <Box fontWeight={550}>Selamat datang {myName}</Box>
      </Typography>
      <div className="columns">
        <div className="column">
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FontAwesomeIcon className="is-size-2 " icon={faSchool} />
              <Typography gutterBottom variant="h5" sx={{ mt: 1 }}>
                {statistic?.departmentTotal} Prodi
              </Typography>
            </CardContent>
          </Card>
        </div>
        <div className="column">
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FontAwesomeIcon className="is-size-2 " icon={faUserShield} />
              <Typography gutterBottom variant="h5" sx={{ mt: 1 }}>
                {statistic?.adminTotal} Administrator
              </Typography>
            </CardContent>
          </Card>
        </div>
        <div className="column">
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FontAwesomeIcon className="is-size-2 " icon={faUserCheck} />
              <Typography gutterBottom variant="h5" sx={{ mt: 1 }}>
                {statistic?.reviewerTotal} Reviewer
              </Typography>
            </CardContent>
          </Card>
        </div>
        <div className="column">
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FontAwesomeIcon className="is-size-2 " icon={faUsers} />
              <Typography gutterBottom variant="h5" sx={{ mt: 1 }}>
                {statistic?.staffTotal} Staff Prodi
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="columns">
        <div className="column is-3">
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FontAwesomeIcon className="is-size-2 " icon={faCalendar} />
              <Typography gutterBottom variant="h5" sx={{ mt: 1 }}>
                {statistic?.timelineTotal} Timeline
              </Typography>
            </CardContent>
          </Card>
        </div>
        <div className="column is-3">
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FontAwesomeIcon className="is-size-2 " icon={faBook} />
              <Typography gutterBottom variant="h5" sx={{ mt: 1 }}>
                {statistic?.proposalTotal} Laporan
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="columns">
        <div className="column is-12 is-12-mobile">
          <div className="is-flex is-flex-direction-row is-justify-content-space-between">
            <Typography gutterBottom variant="h5">
              <Box fontWeight={550}>Daftar Pengumuman</Box>
            </Typography>
            <Link to={`${urlPrefix}/announcement`}>
              <Typography gutterBottom variant="body1">Lihat semua</Typography>
            </Link>
          </div>
          {
            announcementList.slice(0, 3).map((announcement) => (
              <Link key={announcement._id} to={`${urlPrefix}/announcement/${announcement._id}`}>
                <Card sx={{ display: 'flex', mb: 2, p: 1 }}>
                  <CardContent>
                    <Typography variant="h6"><Box fontWeight={550}>{announcement.title}</Box></Typography>
                    <Typography variant="body1">{announcement.writer}</Typography>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                      {DateTime.fromJSDate(new Date(announcement.displayDate.start)).setLocale('id-ID').toFormat('dd LLLL')} - {DateTime.fromJSDate(new Date(announcement.displayDate.end)).setLocale('id-ID').toFormat('dd LLLL yyyy')}
                    </Typography>
                  </CardContent>

                </Card>
              </Link>
            ))
          }
        </div>
      </div>
      <div className="columns">
        <div className="column is-12 is-12-mobile">
          <div className="is-flex is-flex-direction-row is-justify-content-space-between">
            <Typography gutterBottom variant="h5">
              <Box fontWeight={550}>Daftar Berita</Box>
            </Typography>
            <Link to={`${urlPrefix}/article`}>
              <Typography gutterBottom variant="body1">Lihat semua</Typography>
            </Link>
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
                    <Box fontWeight={550}>
                      {articleList[0].title}
                    </Box>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {articleList[0].summary}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {articleList[0].writer}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    {DateTime.fromJSDate(new Date(articleList[0].createdAt)).setLocale('id-ID').toFormat('dd LLLL yyyy')}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </div>
        <div className="column is-6 is-12-mobile">
          {articleList.length > 1 && articleList.slice(1, 3).map((article) => <Link key={article._id} to={`${urlPrefix}/article/${article._id}`}>
            <Card sx={{ display: 'flex', mb: 2 }}>
              <CardMedia
                component="img"
                sx={{ width: 151 }}
                image={`${API_URL + article.featuredImage}`}
                alt="Live from space album cover"
              />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component="div" variant="h6">
                    <Box fontWeight={550}>{article.title}</Box>
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" component="div">
                    {article.summary}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    {DateTime.fromJSDate(new Date(articleList[0].createdAt)).setLocale('id-ID').toFormat('dd LLLL yyyy')}
                  </Typography>
                </CardContent>
              </Box>
            </Card>
          </Link>)}
        </div>
      </div>}
    </div >
  )
}

const MainComponent = StoreConnector(Main);

function Reviewer(props: StoreProps) {
  const { urlPrefix } = props;

  const menuList = [
    {
      label: "Data Prodi",
      icon: faUserShield,
      links: [
        {
          path: '/reviewer',
          title: 'Dashboard'
        },
      ],
    },
    {
      label: "Kegiatan",
      icon: faCalendar,
      links: [
        {
          path: '/reviewer/timeline',
          title: 'Periode'
        },
        {
          path: '/reviewer/activity',
          title: 'Aktivitas',
        },
        {
          path: '/reviewer/fund-disbursement',
          title: 'Pencairan Dana',
        },
        {
          path: '/reviewer/fund-using',
          title: 'Penggunaan Dana',
        },
        {
          path: '/reviewer/iku',
          title: 'IKU',
        },
      ]
    },
    {
      label: "Informasi",
      icon: faInfo,
      links: [
        {
          path: '/reviewer/announcement',
          title: 'Pengumuman'
        },
        {
          path: '/reviewer/article',
          title: 'Berita'
        },
      ]
    }
  ]

  if (urlPrefix !== "/" && urlPrefix !== "/reviewer") {
    return <Redirect to={urlPrefix} />;
  }

  return (
    <Dashboard menuList={menuList}>
      <Switch>
        <Route path={["/reviewer/article/form/:id", "/reviewer/article/form"]}>
          <ArticleForm />
        </Route>
        <Route path={"/reviewer/article/read/:id"}>
          <ReadArticle />
        </Route>
        <Route path="/reviewer/article">
          <ArticleList />
        </Route>
        <Route path="/reviewer/article-category">
          <ArticleCategoryList />
        </Route>
        <Route path={["/reviewer/announcement/read/:id"]}>
          <ReadAnnouncement />
        </Route>
        <Route path="/reviewer/announcement">
          <AnnouncementList />
        </Route>
        <Route path={["/reviewer/document/read/:id"]}>
          <ReadDocument />
        </Route>
        <Route path="/reviewer/document">
          <DocumentList />
        </Route>
        <Route path={["/reviewer/link/form/:id", "/reviewer/link/form"]}>
          <LinkForm />
        </Route>
        <Route path="/reviewer/link">
          <LinkList />
        </Route>
        <Route path="/reviewer/activity/:proposalId/:activityId">
          <SubActivityList />
        </Route>
        <Route path="/reviewer/activity/:proposalId">
          <ActivityList />
        </Route>
        <Route path="/reviewer/activity">
          <EventList />
        </Route>
        <Route path="/reviewer/fund-disbursement">
          <FundDishbursementList />
        </Route>
        <Route path="/reviewer/fund-using">
          <FundUsingList />
        </Route>
        <Route path="/reviewer/iku">
          <IKUList />
        </Route>
        <Route path={"/reviewer/proposal/review/:idTimeline/event/:idTimelineEvent/proposal/:id"}>
          <ProposalReview />
        </Route>
        <Route path={["/reviewer/proposal/form/:id", "/reviewer/proposal/form"]}>
          <ProposalForm />
        </Route>
        <Route path="/reviewer/proposal">
          <ProposalList />
        </Route>
        <Route path="/reviewer/timeline/:idTimeline/event/read/:id">
          <ReadTimelineEvent />
        </Route>
        <Route path={["/reviewer/timeline/:idTimeline/event/form/:id", "/reviewer/timeline/:idTimeline/event/form"]}>
          <TimelineEventForm />
        </Route>
        <Route path="/reviewer/timeline/:idTimeline/event">
          <TimelineEventList />
        </Route>
        <Route path={["/reviewer/timeline/form/:id", "/reviewer/timeline/form"]}>
          <TimelineForm />
        </Route>
        <Route path="/reviewer/timeline">
          <TimelineList />
        </Route>
        <Route path='/reviewer/my-account'>
          <MyAccount />
        </Route>
        <Route path='/reviewer' exact>
          <MainComponent />
        </Route>
      </Switch>
    </Dashboard>
  )
}

export default StoreConnector(Reviewer)
