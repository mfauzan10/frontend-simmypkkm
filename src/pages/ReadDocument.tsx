import { faArrowCircleLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router"
import { toast } from "react-toastify"
import DepartmentTitle from "../layouts/DepartmentTitle"
import APIResponse from "../interfaces/APIResponse"
import Loading from "../layouts/Loading"
import { StoreConnector, StoreProps } from "../redux/actions"

const API_URL = process.env.REACT_APP_API_URL

export type DocumentStatus = 'draft'|'publish'

export interface DocumentInterface {
  _id: string
  title: string
  content: string
  writer: string
  displayDate: {
    start: string
    end: string
  }
  status: DocumentStatus
}

function DocumentForm(props: StoreProps) {
  const { token, department, urlPrefix } = props
  const { id } = useParams<{id?: string}>()
  const history = useHistory()
  const [document, setDocument] = useState<DocumentInterface>()
  
  useEffect(() => {
    if (!token  || !id) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL}/document/${id}`, fetchInitOpt)
      .then(response => response.json())
      .then((response: APIResponse<{document: DocumentInterface}>) => {
        const { success, message } = response

        if (!success) {
          toast('Gagal mengambil data!', {type: 'error'})
          return
        }

        const { document } = message

        setDocument(document)
      })
  }, [token, department, urlPrefix, id])

  if (!document) {
    return (
      <Loading/>
    )
  }

  return (
    <div className="mt-3">
      <div className="columns is-centered">
        <div className="column is-12-widescreen">
        <div className="box">
          <h6 className="title is-size-6">
            <DepartmentTitle />
          </h6>
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h1 className="title is-size-4">Pengumuman</h1>
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
            <strong>{document.title}</strong><br/>
            {DateTime.fromJSDate(new Date(document.displayDate.start)).setLocale('id-ID').toFormat('hh:mm, d LLLL yyyy')} 
          </p>
          <div
            dangerouslySetInnerHTML={{__html: document.content}}
            className="content"
          />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreConnector(DocumentForm)