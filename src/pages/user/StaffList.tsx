import {
  faPencilAlt,
  faPlusCircle,
  faTrash
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Grid} from '@mui/material'
import MUIDataTable from 'mui-datatables'
import {Fragment, useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {toast} from 'react-toastify'
import UserInterface from '../../interfaces/UserInterface'
import DepartmentTitle from '../../layouts/DepartmentTitle'
import {StoreConnector, StoreProps} from '../../redux/actions'
import {tableOptions} from '../../utils/table'

const API_URL = process.env.REACT_APP_API_URL

function StaffList(props: StoreProps): JSX.Element {
  const {token, department, urlPrefix} = props
  const [staffList, setStaffList] = useState<Array<UserInterface>>([])
  const [reloadData, setReloadData] = useState(0)

  const [data, setData] = useState<Array<Array<string>>>([]);
  const columns = urlPrefix != '/admin' ? ['Nama', 'Email', 'Prodi', 'Status', {
    name: 'action',
    label: 'Aksi',
    options: {
      customBodyRender: (value: any, tableMeta: any) => {
        const reviewer = staffList[tableMeta.rowIndex]
        return (<Grid container>
          <Link to={`${urlPrefix}/staff/form/${reviewer._id}`} className='button is-small mx-1'>
            <div className='icon is-small is-left'>
              <FontAwesomeIcon icon={faPencilAlt} />
            </div>
            <span>Ubah</span>
          </Link>
          <button className='button is-danger is-small mx-1' onClick={() => removeStaff(reviewer._id as string)}>
            <div className='icon is-small is-left'>
              <FontAwesomeIcon icon={faTrash} />
            </div>
            <span>Hapus</span>
          </button>
        </Grid>);
      },
    },
  }] : ['Nama', 'Email', 'Status', {
    name: 'action',
    label: 'Aksi',
    options: {
      customBodyRender: (value: any, tableMeta: any) => {
        const reviewer = staffList[tableMeta.rowIndex]
        return (<Grid container>
          <Link to={`${urlPrefix}/staff/form/${reviewer._id}`} className='button is-small mx-1'>
            <div className='icon is-small is-left'>
              <FontAwesomeIcon icon={faPencilAlt} />
            </div>
            <span>Ubah</span>
          </Link>
          <button className='button is-danger is-small mx-1' onClick={() => removeStaff(reviewer._id as string)}>
            <div className='icon is-small is-left'>
              <FontAwesomeIcon icon={faTrash} />
            </div>
            <span>Hapus</span>
          </button>
        </Grid>);
      },
    },
  }];

  const removeStaff = (id: string) => {
    if (window.confirm('Anda yakin akan menghapus staff ini?')) {
      fetch(`${API_URL}${urlPrefix}/staff/${id}`, {method: 'DELETE', headers: {'Authorization': `Bearer ${token}`}})
          .then((result) => result.json())
          .then((response) => {
            if (response.success) {
              setReloadData(reloadData + 1)
            } else {
              toast(response.message, {type: 'error'})
            }
          })
    }
  }

  useEffect(() => {
    if (!token) {
      return
    }

    let url = `${API_URL}${urlPrefix}/staff`
    if (department) {
      url = `${url}?department=${department}`
    }
    fetch(url, {headers: {'Authorization': `Bearer ${token}`}})
        .then((result) => result.json())
        .then((response) => {
          if (response.success) {
            setStaffList(response.message.staffs)
          }
        })
  }, [token, urlPrefix, department, reloadData])

  useEffect(() => {
    const newData: Array<Array<string>> = []
    staffList.map((reviewer) => {
      newData.push([reviewer.fullname, reviewer.email, reviewer.status === 'active' ? 'Aktif' : 'Tidak aktif'])
    })
    setData(newData)
  }, [staffList])

  return (
    <Fragment>
      <div className="mt-3">
        {urlPrefix == '/staff' &&  <strong><DepartmentTitle /></strong>}
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h4 className="title is-size-4">Daftar Staff</h4>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <Link to={`${urlPrefix}/staff/form`} className="button is-small mx-1">
                <div className="icon is-left is-small">
                  <FontAwesomeIcon icon={faPlusCircle} />
                </div>
                <span>Tambah Staff</span>
              </Link>
            </div>
          </div>
        </div>
        <MUIDataTable
          title={'Daftar Staff'}
          data={data}
          columns={columns}
          options={tableOptions}
        />
      </div>
      {!department && urlPrefix != '/admin' && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-content">
            <div className="box has-text-centered">
              <p>Anda harus pilih Prodi terlebih dahulu. Pilih Prodi <Link to="/admin/department?rdr=/admin/staff">di sini</Link>.</p>
            </div>
          </div>
        </div>
      )}
      {!department && urlPrefix != '/admin' && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-content">
            <div className="box has-text-centered">
              <p>Anda harus pilih Prodi terlebih dahulu. Pilih Prodi <Link to="/admin/instance?rdr=/admin/staff">di sini</Link>.</p>
            </div>
          </div>
        </div>
      )}

    </Fragment>
  )
}

export default StoreConnector(StaffList)
