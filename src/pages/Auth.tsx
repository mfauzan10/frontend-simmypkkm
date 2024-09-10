import { Box, Button, CssBaseline, Grid, TextField, Typography } from '@mui/material'
import { FormEvent, useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import APIResponse from '../interfaces/APIResponse'
import Loading from '../layouts/Loading'
import { StoreConnector, StoreProps } from '../redux/actions'
import { DepartmentInterface } from './main/DepartmentForm'

const APP_HOST = process.env.REACT_APP_APP_HOST ?? 'http://localhost:3000'
const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000'

function Auth(props: StoreProps): JSX.Element {
  const {
    setLogin,
    setUrlPrefix
  } = props

  const [isLoggedIn, setLoggedIn] = useState(false)
  const [endpoint, setEndpoint] = useState<string>('/')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setLoading] = useState<boolean>(false)
  const [logo, setLogo] = useState<string>('/assets/logo-01.png')

  const processLogin = (ev: FormEvent) => {
    ev.preventDefault()
    setLoading(true)
    const formData = new URLSearchParams()

    if (!email || !password) {
      toast('Informasi login tidak cocok!', { type: 'error' })
      setLoading(false)
      return
    }

    formData.append('email', email)
    formData.append('password', password)

    const fetchInitOpt = {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'origin': 'localhost:8080'
      },
      body: formData
    }

    fetch(`${API_URL}/auth`, fetchInitOpt)
      .then((result) => result.json())
      .then((response: APIResponse<{ token: string, endpoint: string }>) => {
        const { success, message } = response

        if (!success) {
          toast('Informasi login tidak cocok!', { type: 'error' })
          return
        }
        setLogin(message.token)
        setEndpoint(message.endpoint)
        setUrlPrefix(message.endpoint)
        setLoggedIn(true)
      })
      .catch(() => toast('Kesalahan jaringan!', { type: 'error' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    const { host } = window.location

    if (host === APP_HOST) {
      return
    }

    fetch(`${API_URL}/hostinfo/${host}`)
      .then((response) => response.json())
      .then((response: APIResponse<{ department: DepartmentInterface }>) => {
        const { success, message } = response

        if (!success) {
          return
        }

        const { department } = message

        setLogo(`${API_URL}/local-repo/${department._id}/assets/logo-square.png`)
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  if (isLoggedIn) {
    return (
      <Redirect to={endpoint} />
    )
  }

  if (isLoading) {
    return (
      <Loading />
    )
  }

  return (
    <Grid container direction='row' alignItems='center'>
      <img src={'/assets/bg-login.png'} style={{ height: "100vh", width: "50%", backgroundRepeat: "no-repeat", backgroundSize: "cover" }} />
      <CssBaseline />
      <Grid item alignItems='center' justifyContent='center'>
        <form action="" onSubmit={processLogin}>
          <Box ml={13} mt={3} style={{ width: "500px" }}>
            <Typography variant='h3' style={{ fontWeight: 460 }}>
              Login.
            </Typography>
            <Typography variant='subtitle1' mt={1} style={{ fontWeight: 200, fontSize: 20 }}>
              Silahkan isi from di bawah untuk melanjutkan
              ke halaman utama
            </Typography>
            <Box mb={2} mt={4}>
              <Typography variant='body2'>
                Email
              </Typography>
              <TextField
                type="email"
                className="input"
                name="email"
                id="email"
                autoComplete="off"
                placeholder="Masukkan email Anda"
                onChange={ev => setEmail(ev.target.value)}
                value={email}
                autoFocus
                fullWidth required />
            </Box>
            <Box mb={3}>
              <Typography variant='body2'>
                Password
              </Typography>
              <TextField
                type="password"
                className="input"
                name="password"
                id="password"
                placeholder="Masukkan password anda"
                onChange={ev => setPassword(ev.target.value)}
                fullWidth required />
            </Box>
            <Button type='submit' variant="contained" style={{ margin: '20px auto', backgroundColor: '#013e01' }} fullWidth>Submit</Button>
          </Box>
        </form>
      </Grid>
    </Grid>
  )
}

export default StoreConnector(Auth)
