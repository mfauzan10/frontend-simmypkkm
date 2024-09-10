import { createTheme, ThemeProvider } from '@mui/material'
import { grey } from '@mui/material/colors'
import 'katex/dist/katex.min.css'
import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { toast } from 'react-toastify'
import APIResponse from './interfaces/APIResponse'
import Loading from './layouts/Loading'
import LandingPage from './pages/LandingPage'
import { DepartmentInterface } from './pages/main/DepartmentForm'

const APP_HOST = process.env.REACT_APP_APP_HOST ?? 'http://localhost:3000'
export const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000'

const Admin = lazy(() => import('./pages/Admin'))
const Auth = lazy(() => import('./pages/Auth'))
const Staff = lazy(() => import('./pages/Staff'))
const Reviewer = lazy(() => import('./pages/Reviewer'))

function Main(): JSX.Element {
  const [isLoading, setLoading] = useState<boolean>(true)

  const theme = createTheme({
    palette: {
      primary: {
        main: '#013C01',
        dark: '#013C01',
        light: '#013C01',
        contrastText: '#FFFFFF'
      },
      background: {
        default: grey[100]
      }
    }
  })

  useEffect(() => {
    const { host } = window.location
    const links = document.getElementsByTagName('link')

    const modifyArray: Array<string> = [
      'favicon.ico',
      'favicon-192x192.png',
      'favicon-32x32.png',
      'favicon-96x96.png',
      'favicon-16x16.png',
    ]

    if (host === APP_HOST) {
      return
    }

    fetch(`${API_URL}/hostinfo/${host}`)
      .then((response) => response.json())
      .then((response: APIResponse<{ department: DepartmentInterface }>) => {
        const { success, message } = response

        if (!success) {
          document.title = 'MYPKKM UMY'
          return
        }

        const { department } = message
        const microsoftIcon = document.getElementsByTagName('meta').item(5)

        if (microsoftIcon !== null) {
          microsoftIcon.content = `${API_URL}/local-repo/${department._id}/icon/ms-icon-144x144.png`
        }

        document.title = department.title

        modifyArray.map((key, index) => {
          const link = links.item(index)

          if (link === null) {
            return undefined
          }

          link.href = `${API_URL}/local-repo/${department._id}/icon/${key}`
          return undefined
        })
      })
      .catch(() => toast('Gagal mengambil data instansi!', { type: 'error' }))
      .finally(() => setLoading(false))
  }, [])

  if (isLoading) {
    return (
      <Loading />
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route path="/auth">
            <Suspense fallback={<Loading />}>
              <Auth />
            </Suspense>
          </Route>
          <Route path="/staff">
            <Suspense fallback={<Loading />}>
              <Staff />
            </Suspense>
          </Route>
          <Route path="/reviewer">
            <Suspense fallback={<Loading />}>
              <Reviewer />
            </Suspense>
          </Route>
          <Route path="/admin">
            <Suspense fallback={<Loading />}>
              <Admin />
            </Suspense>
          </Route>
          <Route path={['/index.html', '/']} exact>
            <Suspense fallback={<Loading />}>
              <LandingPage />
            </Suspense>
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  )
}

export default Main
