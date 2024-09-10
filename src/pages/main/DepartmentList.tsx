import {
  faCheckCircle, faPencilAlt, faPlusCircle, faTrash
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Grid} from '@mui/material';
import MUIDataTable from 'mui-datatables';
import {useEffect, useRef, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {toast} from 'react-toastify';
import Loading from '../../layouts/Loading';
import {StoreConnector, StoreProps} from '../../redux/actions';
import {tableOptions} from '../../utils/table';
import {DepartmentStatus} from './DepartmentForm';

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000'

export interface DepartmentListItemInterface {
  _id: string
  title: string
  email: string
  website: string
  status: string
}

function DepartmentList(props: StoreProps) {
  const {
    token,
    setDepartment,
    department,
    urlPrefix,
    department: focusedDepartment
  } = props

  const history = useHistory()
  const params = new URLSearchParams(window.location.search)

  const columns = ['Nama', 'Website', 'Email', 'Status', {
    name: 'action',
    label: 'Aksi',
    options: {
      customBodyRender: (value: any, tableMeta: any) => {
        const department = departmentList[tableMeta.rowIndex]
        return (<Grid container>
          <Link to={`${urlPrefix}/department/form/${department._id}`} className='button is-small mx-1'>
            <div className='icon is-small is-left'>
              <FontAwesomeIcon icon={faPencilAlt} />
            </div>
            <span>Ubah</span>
          </Link>
          <button className='button is-danger is-small mx-1' onClick={() => removeDepartment(department._id)}>
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

  const [departmentList, setDepartmentList] = useState<Array<DepartmentListItemInterface>>([])
  const [updateTimestamp, setUpdateTimestamp] = useState<number>(Date.now())

  const findField = useRef<HTMLInputElement>(null)

  const setDepartmentControl = (id: string) => {
    setDepartment(id)
    history.push(params.get('rdr') ?? '/admin/department/dashboard')
  }

  const removeDepartment = (id: string) => {
    if (window.confirm('Anda yakin akan menghapus prodi ini?')) {
      const fetchInitOpt: RequestInit = {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }

      fetch(`${API_URL}/admin/department/${id}`, fetchInitOpt)
          .then((response) => response.json())
          .then((response) => {
            const {success, message} = response

            if (!success) {
              toast(message, {type: 'error'})
              return
            }

            setUpdateTimestamp(Date.now())
          })
          .catch(() => toast('Kegagalan jaringan!', {type: 'error'}))
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

    fetch(`${API_URL}/admin/department`, fetchInitOpt)
        .then((result) => result.json())
        .then((response) => {
          if (response.success) {
            setDepartmentList(response.message.departments)
          }
        })
        .catch(() => toast('Kegagalan jaringan!', {type: 'error'}))
  }, [token, updateTimestamp])

  useEffect(() => {
    const newData: Array<Array<string>> = []
    departmentList.map((department) => {
      newData.push([department.title, department.website, department.email, department.status == DepartmentStatus.Active ? 'Aktif' : 'Tidak aktif'])
    })
    setData(newData)
  }, [departmentList])

  useEffect(() => {
    const eventHandler = (ev: KeyboardEvent) => {
      if (ev.key === '?' && ev.ctrlKey) {
        findField.current?.focus()
      }
    }

    document.addEventListener('keydown', eventHandler)

    return () => document.removeEventListener('keydown', eventHandler)
  }, [])

  if (!departmentList) {
    return <Loading />
  }

  return (
    <div className='mt-3'>
      <div className='level'>
        <div className='level-left'>
          <div className='level-item'>
            <h4 className='title is-size-4'>Daftar Prodi</h4>
          </div>
        </div>
        <div className='level-right'>
          <div className='level-item'>
            <Link to='/admin/department/form' className='button ml-1 is-small'>
              <div className='icon is-right is-small'>
                <FontAwesomeIcon icon={faPlusCircle} />
              </div>
              <span>Tambah Prodi</span>
            </Link>
          </div>
        </div>
      </div>
      <MUIDataTable
        title={'Daftar Prodi'}
        data={data}
        columns={columns}
        options={tableOptions}
      />
    </div>
  )
}

export default StoreConnector(DepartmentList)
