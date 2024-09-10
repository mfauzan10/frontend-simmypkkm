import { faCalendar, faInfo, faUserShield } from '@fortawesome/free-solid-svg-icons'
import { useEffect } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import Dashboard from '../layouts/Dashboard'
import { StoreConnector, StoreProps } from '../redux/actions'
import ActivityList from './ActivityList'
import AnnouncementList from './AnnouncementList'
import ArticleCategoryList from './ArticleCategoryList'
import ArticleList from './ArticleList'
import DocumentList from './DocumentList'
import EventList from './EventList'
import FundDishbursementList from './FundDishbursementList'
import FundUsingList from './FundUsingList'
import IKUList from './IKUList'
import LinkList from './LinkList'
import ArticleForm from './main/ArticleForm'
import DepartmentDashboard from './main/DepartmentDashboard'
import DepartmentForm from './main/DepartmentForm'
import LinkForm from './main/LinkForm'
import ProposalForm from './main/ProposalForm'
import TimelineEventForm from './main/TimelineEventForm'
import TimelineForm from './main/TimelineForm'
import ProposalList from './ProposalList'
import ProposalReview from './ProposalReview'
import ReadAnnouncement from './ReadAnnouncement'
import ReadArticle from './ReadArticle'
import ReadDocument from './ReadDocument'
import StaffReadTimelineEvent from './StaffReadTimelineEvent'
import SubActivityList from './SubActivityList'
import TimelineEventList from './TimelineEventList'
import TimelineList from './TimelineList'
import MyAccount from './user/MyAccount'

const API_URL = process.env.REACT_APP_API_URL

function Staff(props: StoreProps) {
  const { token, setDepartment, urlPrefix, setUserData } = props

  useEffect(() => {
    if (!token) {
      return
    }

    fetch(`${API_URL}/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(result => result.json())
      .then(response => {
        if (response.success) {
          setUserData(response.message.user)
          setDepartment(response.message.user.meta.department)
        }
      })
  }, [token])

  const menuList = [
    {
      label: 'Data Prodi',
      icon: faUserShield,
      links: [
        {
          path: '/staff',
          title: 'Dashboard Prodi'
        },
      ],
    },
    {
      label: 'Kegiatan',
      icon: faCalendar,
      links: [
        {
          path: '/staff/timeline',
          title: 'Periode'
        },
        {
          path: '/staff/activity',
          title: 'Aktivitas',
        },
        {
          path: '/staff/fund-disbursement',
          title: 'Pencairan Dana',
        },
        {
          path: '/staff/fund-using',
          title: 'Penggunaan Dana',
        },
        {
          path: '/staff/iku',
          title: 'IKU',
        },
      ]
    },
    {
      label: 'Informasi',
      icon: faInfo,
      links: [
        {
          path: '/staff/announcement',
          title: 'Pengumuman'
        },
        {
          path: '/staff/article',
          title: 'Berita'
        },
      ]
    }
  ]

  if (urlPrefix !== '/' && urlPrefix !== '/staff') {
    return (
      <Redirect to={urlPrefix} />
    )
  }

  return (

    <Dashboard menuList={menuList}>
      <Switch>
        <Route path={['/staff/department/form/:id', '/staff/department/form']}>
          <DepartmentForm />
        </Route>
        <Route path={['/staff/article/form/:id', '/staff/article/form']}>
          <ArticleForm />
        </Route>
        <Route path={'/staff/article/read/:id'}>
          <ReadArticle />
        </Route>
        <Route path='/staff/article'>
          <ArticleList />
        </Route>
        <Route path='/staff/article-category'>
          <ArticleCategoryList />
        </Route>
        <Route path={['/staff/announcement/read/:id']}>
          <ReadAnnouncement />
        </Route>
        <Route path='/staff/announcement'>
          <AnnouncementList />
        </Route>
        <Route path={['/staff/document/read/:id']}>
          <ReadDocument />
        </Route>
        <Route path='/staff/document'>
          <DocumentList />
        </Route>
        <Route path="/staff/activity/:proposalId/:activityId">
          <SubActivityList />
        </Route>
        <Route path="/staff/activity/:proposalId">
          <ActivityList />
        </Route>
        <Route path="/staff/activity">
          <EventList />
        </Route>
        <Route path="/staff/fund-disbursement">
          <FundDishbursementList />
        </Route>
        <Route path="/staff/fund-using">
          <FundUsingList />
        </Route>
        <Route path="/staff/iku">
          <IKUList />
        </Route>
        <Route path={['/staff/link/form/:id', '/staff/link/form']}>
          <LinkForm />
        </Route>
        <Route path='/staff/link'>
          <LinkList />
        </Route>
        <Route path={['/staff/proposal/form/:id', '/staff/proposal/form']}>
          <ProposalForm />
        </Route>
        <Route path={['/staff/proposal/review/:id']}>
          <ProposalReview />
        </Route>
        <Route path='/staff/proposal'>
          <ProposalList />
        </Route>
        <Route path='/staff/timeline/:idTimeline/event/read/:id'>
          <StaffReadTimelineEvent />
        </Route>
        <Route path={['/staff/timeline/:idTimeline/event/form/:id', '/staff/timeline/:idTimeline/event/form']}>
          <TimelineEventForm />
        </Route>
        <Route path='/staff/timeline/:idTimeline/event'>
          <TimelineEventList />
        </Route>
        <Route path={['/staff/timeline/form/:id', '/staff/timeline/form']}>
          <TimelineForm />
        </Route>
        <Route path='/staff/timeline'>
          <TimelineList />
        </Route>
        <Route path='/staff/my-account'>
          <MyAccount />
        </Route>
        <Route path='/staff' exact>
          <DepartmentDashboard />
        </Route>
      </Switch>
    </Dashboard>
  )
}

export default StoreConnector(Staff)