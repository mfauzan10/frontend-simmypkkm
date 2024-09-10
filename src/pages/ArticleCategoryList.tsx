import { IconProp } from "@fortawesome/fontawesome-svg-core"
import {
  faArrowCircleLeft,
  faPencilAlt,
  faPlusCircle,
  faTrashAlt
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { useHistory } from "react-router"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import APIResponse from "../interfaces/APIResponse"
import { StoreConnector, StoreProps } from "../redux/actions"

const API_URL = process.env.REACT_APP_API_URL

export interface ArticleCategoryInterface {
  _id: string
  createdAt: string
  description: string
  title: string
}

function ArticleCategoryList(props: StoreProps) {
  const { token, urlPrefix, department } = props
  const history = useHistory()
  const [articleCategoryList, setArticleCategoryList] = useState<Array<ArticleCategoryInterface>>([])
  const [reloadData, setReloadData] = useState<number>(0)

  function removeArticleCategory(id: string) {
    if (window.confirm('Anda yakin akan menghapus materi ini?')) {
      fetch(`${API_URL}${urlPrefix}/article-category/${id}`, {method: 'DELETE', headers: {'Authorization': `Bearer ${token}`}})
        .then(result => result.json())
        .then(response => {
          const { success, message } = response

          if (!success) {
            toast(message, {type: 'error'})
            return
          }

          setReloadData(reloadData + 1)
        })
    }
  }

  useEffect(() => {
    if (!token ) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL + urlPrefix}/article-category`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{articleCategoryList: Array<ArticleCategoryInterface>}>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', {type: 'error'})
          return
        }

        setArticleCategoryList(message.articleCategoryList)
      })
  }, [token, department, urlPrefix, reloadData])

  return (
    <div className="mt-3">
      <div className="box">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h6 className="title is-size-6">Daftar Kategori Artikel</h6>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <Link to={`${urlPrefix}/article-category/form`} className="button is-small is-primary">
                <div className="icon is-small is-left">
                  <FontAwesomeIcon icon={faPlusCircle}/>
                </div>
                <span>Tambah Kategori Artikel</span>
              </Link>
                <button className="button is-small is-default ml-1" onClick={() => history.goBack()}>
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faArrowCircleLeft}/>
                  </div>
                  <span>Kembali</span>
                </button>
            </div>
          </div>
        </div>
        <div style={{overflowX: 'auto'}}>
          <table className="table is-fullwidth is-bordered" style={{whiteSpace: 'nowrap'}}>
            <thead>
              <tr>
                <th>Judul</th>
                <th>Deskripsi</th>
                <th>Tanggal</th>
                <th style={{width: 150}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {articleCategoryList.map(articleCategory => (
                <tr key={articleCategory._id}>
                  <td>{articleCategory.title}</td>
                  <td>{articleCategory.description ? articleCategory.description : '-'}</td>
                  <td>{DateTime.fromISO(articleCategory.createdAt).setLocale('id-ID').toLocaleString(DateTime.DATE_FULL)}</td>
                  <td>
                    <Link to={`${urlPrefix}/article-category/form/${articleCategory._id}`} className="button is-small is-primary ml-1">
                      <div className="icon is-small is-left">
                        <FontAwesomeIcon icon={faPencilAlt}/>
                      </div>
                      <span>Edit</span>
                    </Link>
                    <button className="button is-small is-danger ml-1"  onClick={() => removeArticleCategory(articleCategory._id)}>
                      <div className="icon is-small is-left">
                        <FontAwesomeIcon icon={faTrashAlt}/>
                      </div>
                      <span>Hapus</span>
                    </button>
                  </td>
                </tr>
              ))}
              {articleCategoryList.length === 0 && (
                <tr>
                  <td colSpan={6}>Belum ada kategori artikel</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StoreConnector(ArticleCategoryList)
