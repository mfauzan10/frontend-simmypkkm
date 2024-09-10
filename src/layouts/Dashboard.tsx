import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  AccountCircle as AccountCircleButton,
  Close as CloseIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon, Fullscreen as FullscreenIcon, Logout as LogoutIcon,
  Menu as MenuIcon,
  Search as SearchIcon
} from "@mui/icons-material"
import {
  AppBar,
  Box,
  Button,
  Chip, Collapse, CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer, FormControl, Grid, Hidden,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
  Paper, Toolbar,
  Typography
} from "@mui/material"
import { getMessaging, onMessage } from "firebase/messaging"
import { getMessaging as swMessaging } from "firebase/messaging/sw"
import { useEffect, useRef, useState } from "react"
import addNotification from 'react-push-notification'
import { Link, Redirect, useLocation } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.min.css"
import firebaseApp from "../constants/FirebaseApp"
import APIResponse from "../interfaces/APIResponse"
import { DepartmentInterface } from "../pages/main/DepartmentForm"
import { setDepartment, StoreConnector, StoreProps } from "../redux/actions"
//import "./dashboard.sass"

const APP_HOST = process.env.REACT_APP_APP_HOST ?? "http://localhost:3000"
const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:4000"

export interface SubmenuListInterface {
  path: string
  title: string
}

export interface MenuListInterface {
  label: string
  icon?: IconDefinition
  links: Array<SubmenuListInterface>
}


interface MenuItemComponentProps {
  menu: MenuListInterface
  open?: boolean
  onClose: () => void
}

function MenuItemComponent(props: MenuItemComponentProps) {
  const { menu, open = false, onClose } = props
  const [subMenuOpen, setSubMenuOpen] = useState<boolean>(false)
  const location = useLocation()

  useEffect(() => {
    setSubMenuOpen(open)
  }, [open])

  return (
    <List>
      <ListItemButton onClick={() => setSubMenuOpen(!subMenuOpen)}>
        {menu.icon && (
          <ListItemIcon sx={{ minWidth: 32 }}>
            <FontAwesomeIcon icon={menu.icon} />
          </ListItemIcon>
        )}
        <ListItemText primary={menu.label} />
        <ListItemIcon sx={{ minWidth: 32 }}>
          {subMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemIcon>
      </ListItemButton>
      <Collapse in={subMenuOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {menu.links.map(link => (
            <ListItemButton
              component={Link}
              to={link.path}
              onClick={() => onClose()}
              selected={location.pathname === link.path}
            >
              <ListItemText primary={link.title} sx={{ ml: 4 }} />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </List>
  )
}

interface DashboardProps extends StoreProps {
  menuList: Array<MenuListInterface>
  children: JSX.Element
}

function Dashboard(props: DashboardProps): JSX.Element {
  const {
    children,
    menuList,
    token,
    urlPrefix,
    setLogout,
    restoreToken,
    setUrlPrefix,
  } = props

  const [logo, setLogo] = useState<string>('/favicon.ico')
  const [setStoredToken, setStoredTokenStatus] = useState(false)
  const [desktopSidebarVisible, setDesktopSidebarVisibility] = useState<boolean>(true)
  const [mobileSidebarVisible, setMobileSidebarVisibility] = useState(false)
  const [findQuery, setFindQuery] = useState<string>('')
  const [findMenuModalDialog, setFindMenuModalDialog] = useState<boolean>(false)
  const [showLogoutConfirmation, setLogoutConfirmationVisible] = useState<boolean>(false)

  const findField = useRef<HTMLInputElement>(null)
  const findMenuRef = useRef<HTMLInputElement>(null)

  const logout = () => {
    setLogout()
  }

  swMessaging(firebaseApp)
  const messaging = getMessaging()

  onMessage(messaging, (payload) => {
    console.log('React: Message received. ', payload)
    addNotification({
      title: 'Message',
      subtitle: 'This is a subtitle',
      message: 'This is a very long message',
      theme: 'darkblue',
      native: true // when using native, your OS will handle theming.
    })
  })

  const drawerContainer = window !== undefined ? () => window.document.body : undefined
  const drawerWidth = 250

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const showFindMenuDialog = () => {
    setMobileSidebarVisibility(false)
    setFindMenuModalDialog(true)
    findMenuRef.current?.focus()
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedMsToken = localStorage.getItem('msToken')
    const storedUrlPrefix = localStorage.getItem('urlPrefix')
    const storedDepartment = localStorage.getItem('department')

    if (storedToken !== null) {
      restoreToken(storedToken, storedMsToken)
    }

    if (storedUrlPrefix !== null) {
      setUrlPrefix(storedUrlPrefix)
    }

    if (storedDepartment !== null) {
      setDepartment(storedDepartment)
    }

    setStoredTokenStatus(true)
  }, [])

  useEffect(() => {
    const { host } = window.location

    if (host === APP_HOST) {
      return
    }

    fetch(`${API_URL}/hostinfo/${host}`)
      .then(response => response.json())
      .then((response: APIResponse<{ department: DepartmentInterface }>) => {
        const { success, message } = response

        if (!success) {
          return
        }

        const { department } = message

        setLogo(`${API_URL}/local-repo/${department._id}/assets/logo-wide.png`)
      })
      .catch((err) => toast('Terjadi kegagaln jaringan!', { type: 'error' }))
  }, [])

  useEffect(() => {
    const keyboardHandler = (ev: KeyboardEvent) => {
      if (ev.key === '/' && ev.ctrlKey) {
        findField.current?.focus()
      }
    }

    document.addEventListener('keydown', keyboardHandler)

    return () => document.removeEventListener('keydown', keyboardHandler)
  }, [])

  if (setStoredToken && token === null) {
    return <Redirect to="/auth" />
  }
  const drawer = (
    <div>
      <Hidden smDown>
        <Toolbar>
          <Link to={urlPrefix}>
            <img src={logo} alt="" height={40} width={80} style={{ objectFit: 'fill', margin: 0 }} />
          </Link>
        </Toolbar>
      </Hidden>
      <Hidden smUp>
        <Toolbar>
          <Typography variant="h6" flexGrow={1}>
            Menu
          </Typography>
          <IconButton onClick={showFindMenuDialog}>
            <SearchIcon />
          </IconButton>
          <IconButton onClick={() => setMobileSidebarVisibility(false)}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </Hidden>
      <Divider />
      {menuList.map((menu, menuIndex) => (
        <MenuItemComponent
          menu={menu}
          onClose={() => setMobileSidebarVisibility(false)}
        />
      ))}
    </div>
  )

  return (
    <>
      <Box minHeight="100vh" >
        <CssBaseline />
        <AppBar
          position="fixed"
          color="inherit"
          sx={{
            width: {
              sm: `calc(100% - ${desktopSidebarVisible ? drawerWidth : 0}px)`
            },
            ml: {
              sml: `${desktopSidebarVisible ? drawerWidth : 0}px`
            }
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileSidebarVisibility(!mobileSidebarVisible)}
              sx={{ mr: 1, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Hidden smUp>
              <Link to={urlPrefix}>
                <img src={logo} alt="" width={120} height={64} style={{ objectFit: 'contain', margin: 0 }} />
              </Link>
            </Hidden>
            <Hidden smDown>
              <IconButton title="Tampilkan/sembunyikan menu" onClick={() => setDesktopSidebarVisibility(!desktopSidebarVisible)}>
                <MenuIcon />
              </IconButton>
              <IconButton title="Fullscreen" onClick={toggleFullScreen}>
                <FullscreenIcon />
              </IconButton>
            </Hidden>
            <Box flexGrow={1}></Box>
            <Hidden smDown>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<SearchIcon />}
                sx={{ mr: 1 }}
                onClick={showFindMenuDialog}
              >
                Cari Menu
                <Chip label="CTRL + /" variant="outlined" size="small" sx={{ ml: 2 }} />
              </Button>
              <Button
                component={Link}
                to={`${urlPrefix}/my-account`}
                color="inherit"
                sx={{ mr: 1 }}
                startIcon={
                  <AccountCircleButton />
                }
              >
                Akun
              </Button>
              <Button
                color="inherit"
                startIcon={
                  <LogoutIcon />
                }
                onClick={() => setLogoutConfirmationVisible(true)}
              >
                Keluar
              </Button>
            </Hidden>
            <Hidden smUp>
              <IconButton
                component={Link}
                to={`${urlPrefix}/my-account`}
                color="inherit"
                sx={{ mr: 1 }}
              >
                <AccountCircleButton />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={() => setLogoutConfirmationVisible(true)}
              >
                <LogoutIcon />
              </IconButton>
            </Hidden>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{
            width: {
              sm: drawerWidth
            },
            flexShrink: {
              sm: 0
            }
          }}
        >
          <Drawer
            variant="temporary"
            container={drawerContainer}
            open={mobileSidebarVisible}
            onClose={() => setMobileSidebarVisibility(false)}
            ModalProps={{
              keepMounted: true
            }}
            sx={{
              display: {
                xs: 'block',
                sm: 'none'
              },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth
              }
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="persistent"
            open={desktopSidebarVisible}
            sx={{
              display: {
                xs: 'none',
                sm: 'block',
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: drawerWidth
                }
              }
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: {
              sm: `calc(100% - ${desktopSidebarVisible ? drawerWidth : 0}px)`
            },
            ml: {
              sm: `${desktopSidebarVisible ? drawerWidth : 0}px`
            },
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
      <Dialog open={showLogoutConfirmation} onClose={() => setLogoutConfirmationVisible(false)}>
        <DialogTitle>Konfirmasi Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Anda yakin akan menghapus sesi web di device ini?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={logout}>
            Keluar
          </Button>
          <Button onClick={() => setLogoutConfirmationVisible(false)}>
            Batal
          </Button>
        </DialogActions>
      </Dialog>
      <Modal
        open={findMenuModalDialog}
        onClose={() => setFindMenuModalDialog(false)}
        disableEnforceFocus
        disableAutoFocus
      >
        <Grid container justifyContent="center" sx={{ mt: 4 }}>
          <Grid item sm={4} xs={11}>
            <Paper>
              <FormControl fullWidth sx={{ p: 2 }}>
                <Input
                  inputRef={findMenuRef}
                  endAdornment={<SearchIcon />}
                  placeholder="Cari Menu"
                  value={findQuery}
                  onChange={ev => setFindQuery(ev.target.value)}
                />
              </FormControl>
              {findQuery && (
                <Box sx={{ p: 2 }}>
                  {menuList.map(menu => (
                    <List>
                      <ListItem>
                        {menu.icon && (
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <FontAwesomeIcon icon={menu.icon} />
                          </ListItemIcon>
                        )}
                        <ListItemText primary={menu.label} />
                      </ListItem>
                      <List component="div" disablePadding>
                        {menu.links.filter(link => link.title.match(new RegExp(findQuery, 'ig'))).map(link => (
                          <ListItemButton
                            component={Link}
                            to={link.path}
                            onClick={() => setFindMenuModalDialog(false)}
                          >
                            <ListItemText primary={link.title} sx={{ ml: 4 }} />
                          </ListItemButton>
                        ))}
                      </List>
                    </List>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Modal>
      <ToastContainer /></>)
}

export default StoreConnector(Dashboard)
