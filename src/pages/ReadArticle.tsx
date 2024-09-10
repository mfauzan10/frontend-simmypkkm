import { faArrowCircleLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router"
import DepartmentTitle from "../layouts/DepartmentTitle"
import APIResponse from "../interfaces/APIResponse"
import Loading from "../layouts/Loading"
import { StoreConnector, StoreProps } from "../redux/actions"

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000'

interface ArticleInterface {
  _id: string
  createdAt: string
  writer: string
  summary: string
  title: string
  content: string
  category: string
  featuredImage?: string
}

function ArticleForm(props: StoreProps) {
  const { token, urlPrefix, department } = props
  const { id } = useParams<{id: string}>()
  const history = useHistory()
  const [article, setArticle] = useState<ArticleInterface>()
  
  useEffect(() => {
    if (!token  || !id) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL}/article/${id}`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{article: ArticleInterface}>) => {
        const { success, message } = response

        if (!success) {
          return
        }

        const { article } = message

        setArticle(article)
      })
  }, [token, urlPrefix, department, id])
  
  if (!article) {
    return (
      <Loading/>
    )
  }

  return (
    <div className="mt-3">
      <div className="columns is-centered">
        <div className="column is-12-widescreen">
          <div className="box">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h1 className="title is-size-4">Artikel</h1>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <button className="button is-small mx-1" onClick={() => history.goBack()}>
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faArrowCircleLeft} />
                    </div>
                    <span>Kembali</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="mb-4">
              <strong>{article.title}</strong><br/>
              {DateTime.fromJSDate(new Date(article.createdAt)).setLocale('id-ID').toFormat('hh:mm, d LLLL yyyy')} 
            </p>
            {article.featuredImage && (
              <img src={API_URL + article.featuredImage} alt="" className="image image-responsive card" />
            )}
            <div
              dangerouslySetInnerHTML={{__html: article.content}}
              className="content"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreConnector(ArticleForm)