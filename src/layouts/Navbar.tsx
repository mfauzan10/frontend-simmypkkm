import { faArrowRight, faBars, faDownload, faHome, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
interface NavbarProps {
  toggleSidebar: () => void
  minimize: () => void
  onLogout: () => void
  urlPrefix: string
}

function Navbar(props: NavbarProps) {
  const logo = '/assets/logo.png'
  const { minimize, toggleSidebar, onLogout, urlPrefix } = props

  return (<div className="nav position-sticky">
    <div className="columns is-mobile">
      <div className="column is-hidden-desktop is-hidden-tablet">
        <div className="px-4 pt-4">
          <img className="logo-mobile" src={logo} alt="Logo" />
        </div>
      </div>
      <div className="column is-1 is-mobile p-0 m-0 is-hidden-desktop is-hidden-tablet">
        <div className="columns">
          <div className="column is-4 m-0 p-0 pt-3">
            <div className="link is-flex py-5 px-4 is-hovered is-clickable" onClick={() => toggleSidebar()}>
              <FontAwesomeIcon className="is-size-5 mt-1" icon={faBars} />
            </div>
          </div>
        </div>
      </div>
      <div className="column is-10 is-flex flex-direction-row p-0 m-0 is-hidden-mobile">
        <div className="link is-flex is-vcentered px-5 is-hovered is-clickable" onClick={() => minimize()}>
          <FontAwesomeIcon className="ml-2 mt-1" icon={faBars} />
        </div>
        <div className="link is-flex is-vcentered px-4 is-hovered is-clickable">
          <FontAwesomeIcon className="ml-2 mt-1" icon={faHome} />
          <p className="ml-2">Halaman Utama</p>
        </div>
        <div className="link is-flex is-vcentered px-4 is-hovered is-clickable">
          <FontAwesomeIcon className="ml-2 mt-1" icon={faDownload} />
          <p className="ml-2">Unduh penggunaan aplikasi</p>
        </div>
      </div>
      <div className="column is-mobile p-0 m-0 is-hidden-mobile">
        <div className="columns">
          <div className="column m-0 p-0 pt-3">
            <Link to={`${urlPrefix}/my-account`} className="has-text-black">
              <div className="link is-flex px-4 is-hovered is-clickable" onClick={() => minimize()}>
                <FontAwesomeIcon className="is-size-5 mt-1 ml-3" icon={faUser} />
              </div>
            </Link>
          </div>
          <div className="column m-0 p-0 pt-3">
            <div className="link is-flex px-4 is-hovered is-clickable" onClick={() => onLogout()} >
              <FontAwesomeIcon className="is-size-5 mt-1" icon={faArrowRight} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>)
}

export default Navbar