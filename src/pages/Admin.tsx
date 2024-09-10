import { faBook, faCalendar, faInfo, faSchool, faUserCheck, faUsers, faUserShield } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { Link, Redirect, Route, Switch } from 'react-router-dom'
import { toast } from 'react-toastify'
import APIResponse from '../interfaces/APIResponse'
import Dashboard from '../layouts/Dashboard'
import { StoreConnector, StoreProps } from '../redux/actions'
import ActivityList from './ActivityList'
import AnnouncementList from './AnnouncementList'
import ArticleCategoryList from './ArticleCategoryList'
import ArticleList, { ArticleInterface } from './ArticleList'
import DocumentList from './DocumentList'
import EventList from './EventList'
import FundDishbursementList from './FundDishbursementList'
import FundUsingList from './FundUsingList'
import IKUList from './IKUList'
import LinkList from './LinkList'
import AnnouncementForm, { AnnouncementInterface } from './main/AnnouncementForm'
import ArticleCategoryForm from './main/ArticleCategoryForm'
import ArticleForm from './main/ArticleForm'
import DepartmentDashboard from './main/DepartmentDashboard'
import DepartmentForm from './main/DepartmentForm'
import DepartmentList from './main/DepartmentList'
import DocumentForm from './main/DocumentForm'
import LinkForm from './main/LinkForm'
import ProposalForm from './main/ProposalForm'
import TimelineEventForm from './main/TimelineEventForm'
import TimelineForm from './main/TimelineForm'
import ParticipantTimelineEvent from './ParticipantTimelineEvent'
import ProposalList from './ProposalList'
import ProposalReview from './ProposalReview'
import ReadAnnouncement from './ReadAnnouncement'
import ReadArticle from './ReadArticle'
import ReadDocument from './ReadDocument'
import ReadTimelineEvent from './ReadTimelineEvent'
import SubActivityList from './SubActivityList'
import TimelineEventList from './TimelineEventList'
import TimelineList from './TimelineList'
import AdministratorForm from './user/AdministratorForm'
import AdministratorList from './user/AdministratorList'
import LandingPage from './user/LandingPage'
import MyAccount from './user/MyAccount'
import ReviewerForm from './user/ReviewerForm'
import ReviewerList from './user/ReviewerList'
import StaffForm from './user/StaffForm'
import StaffList from './user/StaffList'

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000'

export enum SubActivityStatus {
  Pending='pending',
  Started='started',
  Finished='finished'
}

function Main(props: StoreProps) {
  const { token, urlPrefix, setUserData } = props
  const [myName, setMyName] = useState('')
  const [articleList, setArticleList] = useState<Array<ArticleInterface>>([])
  const [announcementList, setAnnouncementList] = useState<Array<AnnouncementInterface>>([])

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

      fetch(`${API_URL}${urlPrefix}`, fetchInitOpt)
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

    fetch(`${API_URL}/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(result => result.json())
      .then(response => {
        if (response.success) {
          setUserData(response.message.user)
        }
      })
  }, [token])

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
    </div>
  )
}

export const MainComponent = StoreConnector(Main);

function Admin(props: StoreProps) {
  const { urlPrefix } = props;

  const menuList = [
    {
      label: 'Master Data',
      icon: faUserShield,
      links: [
        {
          path: '/admin',
          title: 'Dashboard',
        },
        {
          path: '/admin/department',
          title: 'Prodi',
        },
        {
          path: '/admin/setting',
          title: 'Pengaturan',
        },
      ],
    },
    {
      label: 'Data Pengguna',
      icon: faUsers,
      links: [
        {
          path: '/admin/administrator',
          title: 'Administrator',
        },
        {
          path: '/admin/reviewer',
          title: 'Reviewer',
        },
        {
          path: '/admin/staff',
          title: 'Staff Prodi',
        },
      ],
    },
    {
      label: 'Kegiatan',
      icon: faCalendar,
      links: [
        {
          path: '/admin/timeline',
          title: 'Periode',
        },
        {
          path: '/admin/activity',
          title: 'Aktivitas',
        },
        {
          path: '/admin/fund-disbursement',
          title: 'Pencairan Dana',
        },
        {
          path: '/admin/fund-using',
          title: 'Penggunaan Dana',
        },
        {
          path: '/admin/iku',
          title: 'IKU',
        },
      ],
    },
    {
      label: 'Informasi',
      icon: faInfo,
      links: [
        {
          path: '/admin/announcement',
          title: 'Pengumuman',
        },
        {
          path: '/admin/article',
          title: 'Berita',
        },
      ],
    },
  ];

  if (urlPrefix !== "/" && urlPrefix !== "/admin") {
    return <Redirect to={urlPrefix} />;
  }

  return (
    <Dashboard menuList={menuList}>
      <Switch>
        <Route path={'/admin/article/read/:id'}>
          <ReadArticle />
        </Route>
        <Route path={['/admin/article/form/:id', '/admin/article/form']}>
          <ArticleForm />
        </Route>
        <Route path="/admin/article">
          <ArticleList />
        </Route>
        <Route
          path={[
            '/admin/article-category/form/:id',
            '/admin/article-category/form',
          ]}>
          <ArticleCategoryForm />
        </Route>
        <Route path="/admin/article-category">
          <ArticleCategoryList />
        </Route>
        <Route path={['/admin/announcement/read/:id']}>
          <ReadAnnouncement />
        </Route>
        <Route
          path={['/admin/announcement/form/:id', '/admin/announcement/form']}>
          <AnnouncementForm />
        </Route>
        <Route path="/admin/announcement">
          <AnnouncementList />
        </Route>
        <Route path={['/admin/document/read/:id']}>
          <ReadDocument />
        </Route>
        <Route path={['/admin/document/form/:id', '/admin/document/form']}>
          <DocumentForm />
        </Route>
        <Route path="/admin/document">
          <DocumentList />
        </Route>
        <Route path={['/admin/link/form/:id', '/admin/link/form']}>
          <LinkForm />
        </Route>
        <Route path="/admin/link">
          <LinkList />
        </Route>
        <Route path={"/admin/proposal/review/:idTimeline/event/:idTimelineEvent/proposal/:id"}>
          <ProposalReview />
        </Route>
        <Route path={["/admin/proposal/form/:id", "/admin/proposal/form"]}>
          <ProposalForm />
        </Route>
        <Route path="/admin/proposal">
          <ProposalList />
        </Route>
        <Route path="/admin/timeline/:idTimeline/event/read/:id">
          <ReadTimelineEvent />
        </Route>
        <Route path={['/admin/timeline/:idTimeline/event/participant/:id']}>
          <ParticipantTimelineEvent />
        </Route>
        <Route
          path={[
            '/admin/timeline/:idTimeline/event/form/:id',
            '/admin/timeline/:idTimeline/event/form',
          ]}>
          <TimelineEventForm />
        </Route>
        <Route path="/admin/timeline/:idTimeline/event">
          <TimelineEventList />
        </Route>
        <Route path={['/admin/timeline/form/:id', '/admin/timeline/form']}>
          <TimelineForm />
        </Route>
        <Route path="/admin/timeline">
          <TimelineList />
        </Route>
        <Route path="/admin/activity/:proposalId/:activityId">
          <SubActivityList />
        </Route>
        <Route path="/admin/activity/:proposalId">
          <ActivityList />
        </Route>
        <Route path="/admin/activity">
          <EventList />
        </Route>
        <Route path="/admin/fund-disbursement">
          <FundDishbursementList />
        </Route>
        <Route path="/admin/fund-using">
          <FundUsingList />
        </Route>
        <Route path="/admin/iku">
          <IKUList />
        </Route>
        <Route path={['/admin/reviewer/form/:id', '/admin/reviewer/form']}>
          <ReviewerForm />
        </Route>
        <Route path="/admin/reviewer">
          <ReviewerList />
        </Route>
        <Route path={['/admin/staff/form/:id', '/admin/staff/form']}>
          <StaffForm />
        </Route>
        <Route path="/admin/staff">
          <StaffList />
        </Route>
        <Route path={['/admin/department/form/:id', '/admin/department/form']}>
          <DepartmentForm />
        </Route>
        <Route path="/admin/department/dashboard">
          <DepartmentDashboard />
        </Route>
        <Route path="/admin/department">
          <DepartmentList />
        </Route>
        <Route
          path={['/admin/administrator/form/:id', '/admin/administrator/form']}>
          <AdministratorForm />
        </Route>
        <Route path="/admin/administrator">
          <AdministratorList />
        </Route>
        <Route path="/admin/my-account">
          <MyAccount />
        </Route>
        <Route path="/admin/setting">
          <LandingPage />
        </Route>
        <Route path="/admin" exact>
          <MainComponent />
        </Route>
      </Switch>
    </Dashboard>
  );
}

export default StoreConnector(Admin)
