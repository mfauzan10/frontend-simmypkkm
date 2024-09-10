import {faPencilAlt, faPlusCircle, faTrash} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Grid} from '@mui/material'
import MUIDataTable from 'mui-datatables'
import {Fragment, useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {toast} from 'react-toastify'
import DepartmentTitle from '../../layouts/DepartmentTitle'
import {StoreConnector, StoreProps} from '../../redux/actions'
import {tableOptions} from '../../utils/table'
import {ReviewerInterface} from './ReviewerForm'

const API_URL = process.env.REACT_APP_API_URL

function ReviewerList(props: StoreProps): JSX.Element {
  const {token, urlPrefix} = props
  const [reviewerList, setReviewerList] = useState<Array<ReviewerInterface>>([])
  const [reloadData, setReloadData] = useState(0)

  const [data, setData] = useState<Array<Array<string>>>([]);
  const columns = ['Nama', 'Email', 'Status', {
    name: 'action',
    label: 'Aksi',
    options: {
      customBodyRender: (value: any, tableMeta: any) => {
        const reviewer = reviewerList[tableMeta.rowIndex]
        return (<Grid container>
          <Link to={`${urlPrefix}/reviewer/form/${reviewer._id}`} className='button is-small mx-1'>
            <div className='icon is-small is-left'>
              <FontAwesomeIcon icon={faPencilAlt} />
            </div>
            <span>Ubah</span>
          </Link>
          <button className='button is-danger is-small mx-1' onClick={() => removeReviewer(reviewer._id as string)}>
            <div className='icon is-small is-left'>
              <FontAwesomeIcon icon={faTrash} />
            </div>
            <span>Hapus</span>
          </button>
        </Grid>);
      },
    },
  }];

  const removeReviewer = (id: string) => {
    if (window.confirm('Anda yakin akan menghapus reviewer ini?')) {
      fetch(`${API_URL}${urlPrefix}/reviewer/${id}`, {method: 'DELETE', headers: {'Authorization': `Bearer ${token}`}})
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
    if (token) {
      fetch(`${API_URL}${urlPrefix}/reviewer`, {headers: {'Authorization': `Bearer ${token}`}})
          .then((result) => result.json())
          .then((response) => {
            if (response.success) {
              setReviewerList(response.message.reviewers)
            }
          })
    }
  }, [token, urlPrefix, reloadData])

  useEffect(() => {
    const newData: Array<Array<string>> = []
    reviewerList.map((reviewer) => {
      newData.push([reviewer.fullname, reviewer.email, reviewer.status === 'active' ? 'Aktif' : 'Tidak aktif'])
    })
    setData(newData)
  }, [reviewerList])

  return (
    <Fragment>
      <div className="mt-3">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h4 className="title is-size-4">Daftar Reviewer</h4>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <Link to={`${urlPrefix}/reviewer/form`} className="button is-small mx-1">
                <div className="icon is-left is-small">
                  <FontAwesomeIcon icon={faPlusCircle} />
                </div>
                <span>Tambah Reviewer</span>
              </Link>
            </div>
          </div>
        </div>
        <MUIDataTable
          title={'Daftar Admin'}
          data={data}
          columns={columns}
          options={tableOptions}
        />
      </div>
    </Fragment>
  )
}

export default StoreConnector(ReviewerList)
