import { faArrowCircleLeft, faCheckCircle, faCloudUploadAlt, faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Fragment, useEffect, useState } from "react"
import { useHistory, useParams } from "react-router"
import { toast } from "react-toastify"
import APIResponse from "../../interfaces/APIResponse"
import FileUploader from "../../layouts/FileUploader"
import TextEditor from "../../layouts/TextEditor"
import { StoreConnector, StoreProps } from "../../redux/actions"
import { ArticleCategoryInterface } from "../ArticleCategoryList"
import { NotificationScope } from "./AnnouncementForm"

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000'

export enum ArticleStatus {
  Draft = 'draft',
  Publish = 'publish'
}

export enum NotificationCategory {
  Assignment='assignment',
  StudyMaterial='studyMaterial',
  Article='Article',
  Exam='exam',
  Achievement='achievement',
  Violation='violation',
  Library='library',
  Chat='chat'
}

function ArticleForm(props: StoreProps) {
  const { token, urlPrefix } = props
  const { id } = useParams<{id: string}>()
  const history = useHistory()
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [summary, setSummary] = useState<string>('')
  const [featuredImage, setFeaturedImage] = useState<File>()
  const [status, setStatus] = useState<string>('publish')
  const [displayedImage, setDisplayedImage] = useState<string>()
  const [uploadImageFormVisible, setUploadImageFormVisibility] = useState<boolean>(false)
  const [articleCategoryList, setArticleCategoryList] = useState<Array<ArticleCategoryInterface>>([])
  const [articleCategory, setArticleCategory] = useState<string>()

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
  }, [token, urlPrefix])

  const submitArticle = () => {
    const el = document.forms[0]

    if (!el.reportValidity()) {
      return
    }

    const form = featuredImage !== undefined ? new FormData() : new URLSearchParams()
    
    form.append('title', title)

    if (articleCategory) {
      form.append('category', articleCategory)
    } else if(articleCategoryList.length > 0) {
      form.append('category', articleCategoryList[0]._id)
    }

    form.append('content', content)
    form.append('summary', summary)
    form.append('status', status)
    
    if (featuredImage) {
      form.append('featuredImage', featuredImage)
    }
    
    const fetchInitOpt: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    }

    const url = new URL(`${API_URL + urlPrefix}/article`)

    if (id) {
      url.pathname = `${url.pathname}/${id}`
    }
    
    fetch(url.toString(), fetchInitOpt)
      .then(response => response.json())
      .then(async function (response: APIResponse)  {
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

  const sendNotification = async function (title: string, body: string, scope: string, receiver: string | Array<string>, category: string) {
    const form = new URLSearchParams()
    
    form.append('title', title)
    form.append('body', body)
    form.append('scope', scope)

    if(Array.isArray(receiver)) {
      const receiverList = receiver
      receiverList.map(receiver => form.append('receiver', receiver))
    } else {
      form.append('receiver', receiver)
    }
    
    form.append('category', category)
    form.append('status', status)

    const fetchInitOpt: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    }

    const url = new URL(`${API_URL + urlPrefix}/notification`)

    if (id) {
      url.pathname = `${url.pathname}/${id}`
    }

    fetch(url.toString(), fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse) => {
        const { success } = response

        if (!success) {
          toast('Gagal menyimpan data!', {type: 'error'})
          return
        }
        
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

    interface ArticleInterface {
      title: string
      category: string
      summary: string
      content: string
      status: string
      featuredImage?: string
    }

    fetch(`${API_URL + urlPrefix}/article/${id}`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{article: ArticleInterface}>) => {
        const { success, message } = response

        if (!success) {
          return
        }

        const { article } = message

        setTitle(article.title)
        setArticleCategory(article.category)
        setSummary(article.summary)
        setContent(article.content)
        setStatus(article.status)
        setDisplayedImage(API_URL + article.featuredImage)
      })
  }, [token, urlPrefix, id])

  useEffect(() => {
    if (!featuredImage) {
      return
    }

    const reader = new FileReader()

    reader.onload = ev => {
      const { target } = ev

      if (!target || typeof target.result !== 'string') {
        return
      }

      setDisplayedImage(target.result)
    }

    reader.readAsDataURL(featuredImage)
  }, [featuredImage])

  return (
    <Fragment>
      <div className="mt-3">
        <div className="columns is-centered">
          <div className="column is-12">
            <div className="box">
              <div className="level">
                <div className="level-left">
                  <div className="level-item">
                    <h6 className="title is-size-6">Form Artikel</h6>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <button className="button is-small is-primary" onClick={submitArticle}>
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
                  <label htmlFor="">Kategori</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select
                          value={articleCategory}
                          onChange={ev => setArticleCategory(ev.target.value)}
                          required
                        >
                          <option value="" disabled>Pilih kategori</option>
                          {articleCategoryList.map(articleCategory => (
                            <option value={articleCategory._id} key={articleCategory._id}>{articleCategory.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                <div className="field">
                  <label htmlFor="summary">Keterangan Singkat</label>
                  <div className="control">
                    <textarea name="summary" id="summary" className="textarea" onChange={ev => setSummary(ev.target.value)} required value={summary}/>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="featuredImage">Gambar Utama</label>
                  <div className="columns mb-0">
                    <div className="column">
                      <button className="button is-default is-fullwidth" onClick={() => setUploadImageFormVisibility(true)} type="button">
                        <div className="icon is-small is-left">
                          <FontAwesomeIcon icon={faCloudUploadAlt}/>
                        </div>
                        <span>Upload Gambar</span>
                      </button>
                    </div>
                    {displayedImage && (
                      <div className="column">
                        <button className="button is-danger is-fullwidth" type="button" onClick={() => {
                          setFeaturedImage(undefined)
                          setDisplayedImage(undefined)
                        }}>
                          <div className="icon is-small is-left">
                            <FontAwesomeIcon icon={faTrashAlt}/>
                          </div>
                          <span>Hapus</span>
                        </button>
                      </div>
                    )}
                  </div>
                  {displayedImage && (
                    <img src={displayedImage} alt="" className="image image-responsive card" />
                  )}
                </div>
                <div className="field">
                  <label htmlFor="content">Konten</label>
                  <input type="hidden" name="content" value={content} required/>
                  <TextEditor onChange={val => setContent(val)} content={content} height={500}/>
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
      {uploadImageFormVisible && (
        <FileUploader
          title="Pilih Gambar"
          acceptedFileType="image/*"
          onCloseRequest={() => setUploadImageFormVisibility(false)}
          onAcceptFiles={files => !Array.isArray(files) && setFeaturedImage(files)}
          multiple={false}
        />
      )}
    </Fragment>
  )
}

export default StoreConnector(ArticleForm)