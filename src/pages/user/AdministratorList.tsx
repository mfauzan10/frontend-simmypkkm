import {faCheckCircle, faExclamationTriangle, faKey, faPencilAlt, faPlusCircle, faTrash} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Grid} from '@mui/material'
import MUIDataTable from 'mui-datatables'
import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import SuperAdminPinForm from '../../layouts/SuperAdminPinForm'
import {StoreConnector, StoreProps} from '../../redux/actions'
import {tableOptions} from '../../utils/table'

const API_URL = process.env.REACT_APP_API_URL

interface AdministratorItem {
  _id: string
  email: string
  fullname: string
  status: string
}

function AdministratorList(props: StoreProps) {
  const {token, urlPrefix} = props
  const [administratorList, setAdministratorList] = useState<Array<AdministratorItem>>([])
  const [reloadData, setReloadData] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)
  const [pin, setPin] = useState('')
  const [pinFormVisible, setPinFormVisibility] = useState(false)

  const columns = ['Nama', 'Email', 'Status', {
    name: 'action',
    label: 'Aksi',
    options: {
      customBodyRender: (value: any, tableMeta: any) => {
        const administrator = administratorList[tableMeta.rowIndex]
        return (<Grid container>
          <Link to={`${urlPrefix}/administrator/form/${administrator._id}`} className='button is-small mx-1'>
            <div className='icon is-small is-left'>
              <FontAwesomeIcon icon={faPencilAlt} />
            </div>
            <span>Ubah</span>
          </Link>
          <button className='button is-danger is-small mx-1' onClick={() => removeAdministrator(administrator._id)}>
            <div className='icon is-small is-left'>
              <FontAwesomeIcon icon={faTrash} />
            </div>
            <span>Hapus</span>
          </button>
        </Grid>);
      },
    },
  }];
  const [data, setData] = useState<Array<Array<string>>>([]);


  const removeAdministrator = (id: string) => {
    if (window.confirm('Anda yakin akan menghapus admin ini?')) {
      fetch(`${API_URL}/admin/administrator/${id}?pin=${pin}`, {method: 'DELETE', headers: {'Authorization': `Bearer ${token}`}})
          .then((result) => result.json())
          .then((response) => {
            if (response.success) {
              setReloadData(reloadData + 1)
              setErrorMessage(null)
            } else {
              setErrorMessage(response.message)
            }
          })
    }
  }

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL}/admin/administrator`, fetchInitOpt)
        .then((result) => result.json())
        .then((response) => {
          if (response.success) {
            setAdministratorList(response.message.administrators)
          }
        })
  }, [token, reloadData])

  useEffect(() => {
    const newData: Array<Array<string>> = []
    administratorList.map((administrator) => {
      newData.push([administrator.fullname, administrator.email, administrator.status === 'active' ? 'Aktif' : 'Tidak aktif'])
    })
    setData(newData)
  }, [administratorList])

  return (
    <div className="mt-3">
      <div className="columns is-centered">
        <div className="column is-12-widescreen">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h4 className="title is-size-4">
                    Daftar Administrator
                </h4>
              </div>
            </div>
            <div className="level-right level-item">
              <button className="button is-small is-warning" onClick={() => setPinFormVisibility(true)}>
                <div className="icon is-left is-small">
                  <FontAwesomeIcon icon={faKey} />
                </div>
                <span>PIN SuperAdmin</span>
              </button>
              <Link to="/admin/administrator/form" className="button is-small ml-1">
                <div className="icon is-small is-left">
                  {/* <FontAwesomeIcon icon={faPlusCircle} />*/}
                </div>
                <span>Tambah Administrator</span>
              </Link>
            </div>
          </div>
          {errorMessage && (
            <div className="notification has-text-centered is-danger">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />{errorMessage}
            </div>
          )}
          <MUIDataTable
            title={'Daftar Admin'}
            data={data}
            columns={columns}
            options={tableOptions}
          />
        </div>
\      </div>
      <SuperAdminPinForm
        visible={pinFormVisible}
        onCloseRequest={() => setPinFormVisibility(false)}
        onPinChanged={(val) => setPin(val)}
      />
    </div>
  )
}

export default StoreConnector(AdministratorList)
