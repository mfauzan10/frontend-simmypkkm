import { IconProp } from "@fortawesome/fontawesome-svg-core"
import {
  faFile,
  faSearch
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import katex from "katex"
// @ts-ignore
import QuillImageResize from 'quill-image-resize-module-react'
import {
  Fragment,
  KeyboardEvent,
  useEffect, useState
} from "react"
import ReactQuill, { Quill } from "react-quill"
import "react-quill/dist/quill.snow.css"
import { StoreConnector, StoreProps } from "../redux/actions"
import FileUploader from "./FileUploader"

window.katex = katex
Quill.register('modules/imageResize', QuillImageResize)

interface MSFileListInterface {
  id: string
  name: string
  webUrl: string
}

interface TextEditorProps extends StoreProps {
  content: string
  height?: number
  onChange?: (val: string) => void
  headless?: boolean
}

function TextEditor(props: TextEditorProps) {
  const {
    content,
    onChange,
    msToken
  } = props

  const [uploadImageForm, setUploadImageForm] = useState(false)
  const [fileSearchQuery, setFileSearchQuery] = useState('')
  const [fileSearchResult, setFileSearchResult] = useState<Array<MSFileListInterface>>([])
  const [searchFileModalVisible, setSearchFileModalVisibility] = useState(false)

  const insertFileLink = (title: string, url: string) => {
    setSearchFileModalVisibility(false)
    setFileSearchQuery('')
    setFileSearchResult([])
    
    if (onChange) {
      const link = document.createElement('a')
      link.href = url
      link.innerText = title
      link.target = '_blank'

      onChange(content + link.outerHTML)
    }
  }

  const escHandler = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') {
      setSearchFileModalVisibility(false)
    }
  }

  const insertImage = (image: File) => {
    
  }

  useEffect(() => {
    // @ts-ignore
    document.addEventListener('keydown', escHandler)

    //@ts-ignore
    return () => document.removeEventListener('keydown', escHandler)
  }, [])

  useEffect(() => {
    if (fileSearchQuery.length < 3 || !msToken) {
      return
    }

    const fetchInitOptions: RequestInit = {
      headers: {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json'
      }
    }

    fetch(`https://graph.microsoft.com/v1.0/me/drive/root/search(q='${fileSearchQuery}')`, fetchInitOptions)
      .then(result => result.json())
      .then(response => {
        if (response.error) {
          return
        }

        setFileSearchResult(response.value)
      })
  }, [fileSearchQuery, msToken])

  return (
    <Fragment>
      <ReactQuill
        style={{
          background: '#ffffff'
        }}
        modules={{
          toolbar: [
            [{header: [1, 2, 3, 4, 5, 6, false]}],
            ['bold', 'italic', 'underline','strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            ['formula', 'link', 'image'],
            ['clean']
          ],
          imageResize: {
            parchment: Quill.import('parchment'),
            module: ['Resize', 'DisplaySize']
          }
        }}
        formats={[
          'header',
          'bold', 'italic', 'underline', 'strike', 'blockquote',
          'list', 'bullet', 'indent',
          'link', 'image', 'formula'
        ]}
        value={content}
        onChange={data => onChange ? onChange(data) : null}
      />
      {msToken && (
        <button className="button is-small is-primary my-1" onClick={() => setSearchFileModalVisibility(true)} type="button">
          <div className="icon is-small is-left">
            <FontAwesomeIcon icon={faFile}/>
          </div>
          <span>File Office</span>
        </button>
      )}
      {uploadImageForm && (
        <FileUploader
          title="Pilih Gambar"
          acceptedFileType="image/*"
          onCloseRequest={() => setUploadImageForm(false)}
          onAcceptFiles={files => !Array.isArray(files) && insertImage(files)}
          multiple={false}
        />
      )}
      {searchFileModalVisible && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setSearchFileModalVisibility(false)}></div>
          <div className="modal-content">
            <div className="panel has-background-white">
              <div className="panel-heading">
                Cari File Office
              </div>
              <div className="panel-block">
                <p className="control has-icons-left">
                  <input
                    className="input"
                    type="text"
                    placeholder="Cari file di sini"
                    onChange={ev => setFileSearchQuery(ev.target.value)}
                    value={fileSearchQuery}
                  />
                  <span className="icon is-left">
                    <FontAwesomeIcon icon={faSearch } />
                  </span>
                </p>
              </div>
              {fileSearchResult.map(file => (
                <a
                  key={file.id}
                  href="/"
                  className="panel-block"
                  onMouseDown={ev => {ev.preventDefault(); insertFileLink(file.name, file.webUrl)}}
                >
                  <span className="panel-icon">
                    <FontAwesomeIcon icon={faFile} />
                  </span>
                  {file.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  )
}

export default StoreConnector(TextEditor)