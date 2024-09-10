import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import APIResponse from "../interfaces/APIResponse";
import { DepartmentInterface } from "../pages/main/DepartmentForm";
import { MenuListInterface, SubmenuListInterface } from "./Dashboard";

const APP_HOST = process.env.REACT_APP_APP_HOST ?? "http://localhost:3000"
const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:4000"

interface SidebarInterface {
  menuList: Array<MenuListInterface>
  minimize: boolean
  toggleSidebar: () => void
}

function Sidebar(props: SidebarInterface) {
  const location = useLocation()
  const [logo, setLogo] = useState<string>('/favicon.ico')
  const { menuList, minimize, toggleSidebar } = props
  const [selectedMenu, setSelectedMenu] = useState<number>(-1)
  const [selectedSubmenu, setSelectedSubmenu] = useState<number>(-1)

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
      .catch(() => toast('Terjadi kegagaln jaringan!', { type: 'error' }))
  }, [])

  const isParent = (menu: MenuListInterface) => {
    return menu.links.length > 0
  }

  const isSelectedMenu = (menu: MenuListInterface, idx: number) => {
    let selected = false
    if (selectedMenu == idx) {
      selected = true
    }
    return selected
  }

  const isSelectedSubmenu = (submenu: SubmenuListInterface, idx: number) => {
    let selected = false
    if (selectedSubmenu == idx) {
      selected = true
    }
    return selected
  }

  useEffect(() => {
    menuList.map((menu, menuIdx) => {
      menu.links.map((submenu, submenuIdx) => {
        if (location.pathname.includes(submenu.path)) {
          setSelectedMenu(menuIdx)
          setSelectedSubmenu(submenuIdx)
        }
      })
    })
  }, [location])

  return (<nav className={`sidebar ${minimize ? `sidebar-minimize` : null}`} >
    <div className="px-4 pt-4 is-hidden-mobile">
      <Link className="logo" to="/">
        <img src={logo} alt="Logo"/>
      </Link>
    </div>
    <hr className="has-text-primary has-background-primary is-hidden-mobile" />
    <ul className="menu-container">
      {menuList.map((menu, menuIdx) => (
        <div key={`menu-${menuIdx}`} >
          <li onClick={() => {
            setSelectedMenu(selectedMenu != menuIdx ? menuIdx : -1)
            setSelectedSubmenu(-1)
          }} className={`menu ${isParent(menu) ? isSelectedMenu(menu, menuIdx) ? 'selected' : 'unselected' : ''}`}>
            {menu.icon && <div className="menu-icon"><FontAwesomeIcon icon={menu.icon} /></div>}
            {
              !minimize && <>
                {
                  menu.links.length > 0 && <p>{menu.label}</p>
                }
                {
                  menu.links.length == 0 && <Link to={menu.label}><p>{menu.label}</p></Link>
                }
              </>
            }
          </li>
          {selectedMenu == menuIdx && !minimize &&
            <ul key={`submenu-container-${menuIdx}`} className="submenu-container">
              {
                menu.links.map((submenu, submenuIdx) => (
                  <li key={`menu-${menuIdx}-submenu-${submenuIdx}`} className={`submenu ${isSelectedSubmenu(submenu, submenuIdx) ? 'selected' : 'unselected'}`}>
                    <Link onClick={() => {
                      setSelectedSubmenu(submenuIdx)
                      toggleSidebar()
                    }
                    } to={submenu.path}><p>{submenu.title}</p></Link>
                  </li>
                ))
              }
            </ul>}
        </div>
      ))}
    </ul>
  </nav>);
}

export default Sidebar