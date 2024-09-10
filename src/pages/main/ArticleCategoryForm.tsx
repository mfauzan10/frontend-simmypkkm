import { faArrowCircleLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Fragment, useEffect, useState } from "react"
import { useHistory, useParams } from "react-router"
import { toast } from "react-toastify"
import APIResponse from "../../interfaces/APIResponse"
import { ArticleCategoryInterface } from "../ArticleCategoryList"
import { StoreConnector, StoreProps } from "../../redux/actions"

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000'

function ArticleCategoryForm(props: StoreProps) {
  const { token, urlPrefix, department } = props
  const { id } = useParams<{id: string}>()
  const history = useHistory()
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [status, setStatus] = useState<string>('publish')

  const submitArticleCategory = () => {
    const el = document.forms[0]

    if (!el.reportValidity()) {
      return
    }

    const form = new FormData()
    
    form.append('title', title)
    form.append('description', description)
    form.append('status', status)
    
    const fetchInitOpt: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    }

    const url = new URL(`${API_URL + urlPrefix}/article-category`)

    if (id) {
      url.pathname = `${url.pathname}/${id}`
    }
    
    fetch(url.toString(), fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse) => {
        const { success } = response
        
        if (!success) {
          toast('Gagal upload data!', {type: 'error'})
          return
        }

        toast('Berhasil simpan data!', {type: 'success'})
        history.goBack()
      })
      .catch(() => toast('Kegagalan jaringan!', {type: 'error'}))
  }

  useEffect(() => {
    if (!token  || !id) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    interface ArticleCategoryInterface {
      title: string
      description: string
      status: string
      featuredImage?: string
    }

    fetch(`${API_URL + urlPrefix}/article-category/${id}`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{articleCategory: ArticleCategoryInterface}>) => {
        const { success, message } = response
        
        if (!success) {
          return
        }

        const { articleCategory } = message
        setTitle(articleCategory.title)
        setDescription(articleCategory.description)
        setStatus(articleCategory.status)
      })
  }, [token, urlPrefix, department, id])
  
  return (
    <Fragment>
      <div className="mt-3">
        <div className="columns is-centered">
          <div className="column is-12">
            <div className="box">
              <div className="level">
                <div className="level-left">
                  <div className="level-item">
                    <h6 className="title is-size-6">Form Kategori Artikel</h6>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <button className="button is-small is-primary" onClick={submitArticleCategory}>
                      <div className="icon is-small is-left">
                        <FontAwesomeIcon icon={faCheckCircle}/>
                      </div>
                      <span>Simpan</span>
                    </button>
                    <button className="button is-small is-default ml-1" onClick={() => history.goBack()}>
                      <div className="icon is-small is-left">
                        <FontAwesomeIcon icon={faArrowCircleLeft}/>
                      </div>
                      <span>Kembali</span>
                    </button>
                  </div>
                </div>
              </div>
              <form action="">
                <div className="field">
                  <label htmlFor="title">Judul</label>
                  <div className="control">
                    <input type="text" className="input" id="title" name="title"
                      value={title} onChange={ev => setTitle(ev.target.value)} required/>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="summary">Keterangan Singkat</label>
                  <div className="control">
                    <textarea name="summary" id="summary" className="textarea" onChange={ev => setDescription(ev.target.value)} value={description}/>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="status">Status</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select name="status" id="status" value={status} onChange={ev => setStatus(ev.target.value)}>
                        <option value="draft">Draft</option>
                        <option value="publish">Tampilkan</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      </Fragment>
  )
}

export default StoreConnector(ArticleCategoryForm)