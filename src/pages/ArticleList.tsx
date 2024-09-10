import { faCheckCircle, faEllipsisV, faEraser, faExclamationCircle, faEye, faList, faPencilAlt, faPlusCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import APIResponse from "../interfaces/APIResponse"
import { StoreConnector, StoreProps } from "../redux/actions"
import { ArticleCategoryInterface } from "./ArticleCategoryList"

const API_URL = process.env.REACT_APP_API_URL

export interface ArticleInterface {
  _id: string
  createdAt: string
  writer: string
  featuredImage: string
  summary: string
  title: string
  category: string
  categoryId: string
}

function ArticleList(props: StoreProps) {
  const { token, urlPrefix, department } = props
  const [columnLayout, setColumnLayout] = useState('is-12')
  const [articleList, setArticleList] = useState<Array<ArticleInterface>>([])
  const [articleCategoryList, setArticleCategoryList] = useState<Array<ArticleCategoryInterface>>([])
  const [reloadData, setReloadData] = useState<number>(0)
  const [focusedArticleCategory, setFocusedArticleCategory] = useState<string>()
  const [focusedArticle, setFocusedArticle] = useState<string>()
  const [removeArticleConfirmation, setRemoveArticleConfirmation] = useState<boolean>(false)


  const confirmRemoveArticle = (id: string) => {
    setFocusedArticle(id)
    setRemoveArticleConfirmation(true)
  }

  function removeArticle() {
    if (window.confirm('Anda yakin akan menghapus materi ini?')) {
      fetch(`${API_URL}${urlPrefix}/article/${focusedArticle}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
        .then(result => result.json())
        .then(response => {
          const { success, message } = response

          if (!success) {
            toast(message, { type: 'error' })
            return
          }

          setReloadData(reloadData + 1)
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

    fetch(`${API_URL + urlPrefix}/article-category`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ articleCategoryList: Array<ArticleCategoryInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setArticleCategoryList(message.articleCategoryList)
      })
      .catch(() => toast('Kegagalan jaringan!', { type: 'error' }))

    fetch(`${API_URL + urlPrefix}/article`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{ articles: Array<ArticleInterface> }>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', { type: 'error' })
          return
        }

        setArticleList(message.articles)
      })
      .catch(() => toast('Kegagalan jaringan!', { type: 'error' }))
  }, [token, department, urlPrefix, reloadData])

  return (
    <div className="mt-3">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h4 className="title is-size-4">Daftar Artikel</h4>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <div className="button-group is-hidden-mobile">
              <button className={`button is-small ${columnLayout == 'is-12' ? 'is-active' : null}`} onClick={() => setColumnLayout('is-12')}>
                <FontAwesomeIcon icon={faEllipsisV} /></button>
              <button className={`button is-small ${columnLayout == 'is-6' ? 'is-active' : null}`} onClick={() => setColumnLayout('is-6')}>
                <FontAwesomeIcon icon={faEllipsisV} />
                <FontAwesomeIcon icon={faEllipsisV} /></button>
              <button className={`button is-small ${columnLayout == 'is-4' ? 'is-active' : null}`} onClick={() => setColumnLayout('is-4')}>
                <FontAwesomeIcon icon={faEllipsisV} />
                <FontAwesomeIcon icon={faEllipsisV} />
                <FontAwesomeIcon icon={faEllipsisV} /></button>
            </div>
            {
              urlPrefix == '/admin' &&
              <>
                <Link
                  to={`${urlPrefix}/article-category`}
                  className="button is-small ml-1"
                >
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faList} />
                  </div>
                  <span>Kategori Artikel</span>
                </Link>
                <Link to={`${urlPrefix}/article/form`} className="button is-small is-primary ml-1">
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faPlusCircle} />
                  </div>
                  <span>Tambah Artikel</span>
                </Link>
              </>
            }
          </div>
        </div>
      </div>
      <div className="my-3">
        <button
          className={`button is-small ${focusedArticleCategory === undefined ? 'is-primary' : 'is-default'}`}
          onClick={() => setFocusedArticleCategory(undefined)}
        >
          Semua
        </button>
        {articleCategoryList.map(articleCategory => (
          <button
            className={`button is-small ${focusedArticleCategory === articleCategory._id ? 'is-primary' : 'is-default'} ml-1`}
            key={articleCategory._id}
            onClick={() => setFocusedArticleCategory(articleCategory._id)}
          >
            {articleCategory.title}
          </button>
        ))}
      </div>
      <div className="columns is-multiline">
        {articleList.length == 0 &&
          <div className={`column ${columnLayout}`}>
            <div className="card">
              <div className="card-content">
                <div className="is-flex is-flex-direction-column is-align-items-center">
                  <FontAwesomeIcon className="is-size-1 mb-3" icon={faExclamationCircle} />
                  <p className="is-size-5">Artikel tidak ditemukan</p>
                </div>
              </div>
            </div>
          </div>}
        {articleList.filter(article => focusedArticleCategory === undefined ? true : (article.categoryId === focusedArticleCategory)).map(article => (<>
          <div className={`column ${columnLayout}`}>
            <div className="card">
              <div className="card-content">
                <div className="title">{article.title}</div>
                <div className="subtitle is-size-7">{DateTime.fromJSDate(new Date(article.createdAt)).setLocale('id-ID').toFormat('dd LLLL')}</div>
                <div
                  dangerouslySetInnerHTML={{ __html: article.summary }}
                />
              </div>
              <div className="card-footer">
                <Link to={`${urlPrefix}/article/read/${article._id}`} className="card-footer-item">
                  <div className="icon is-small is-left mr-1">
                    <FontAwesomeIcon icon={faEye} />
                  </div>
                  <span>Lihat</span>
                </Link>
                {urlPrefix == '/admin' &&
                  <>
                    <Link to={`${urlPrefix}/article/form/${article._id}`} className="card-footer-item">
                      <div className="icon is-small is-left mr-1">
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </div>
                      <span>Ubah</span>
                    </Link>
                    <a href="/" className="card-footer-item" onClick={ev => { ev.preventDefault(); confirmRemoveArticle(article._id) }}>
                      <div className="icon is-small is-left mr-1">
                        <FontAwesomeIcon icon={faEraser} />
                      </div>
                      <span>Hapus</span>
                    </a>
                  </>
                }
              </div>
            </div>
          </div>
        </>
        ))}
      </div>
      {removeArticleConfirmation && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setRemoveArticleConfirmation(false)}></div>
          <div className="modal-content">
            <div className="box">
              <h4 className="title is-size-4 has-text-centered">Anda yakin akan menghapus pengumuman ini?</h4>
              <div className="has-text-centered">
                <button className="button is-danger" onClick={removeArticle}>
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <span>Lanjutkan</span>
                </button>
                <button className="button is-default ml-1" onClick={() => setRemoveArticleConfirmation(false)}>
                  <div className="icon is-small is-left">
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </div>
                  <span>Batal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreConnector(ArticleList)
