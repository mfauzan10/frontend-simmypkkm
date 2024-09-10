import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faCheckCircle, faTimesCircle, faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import Dropzone from 'react-dropzone'

interface FileUploaderProps {
  title: string
  acceptedFileType?: string
  multiple?: boolean
  onCloseRequest: () => void
  onAcceptFiles: (files: File|Array<File>) => void
}

function FileUploader(props: FileUploaderProps) {
  const {
    onCloseRequest,
    onAcceptFiles,
    acceptedFileType = '*',
    title,
    multiple = true
  } = props

  const [fileList, setFileList] = useState<Array<File>>([])
  const [imagePreviewMode, setImagePreviewMode] = useState(false)
  const [imagePreviewData, setImagePreviewData] = useState<string>()

  const dropHandler = (files: Array<File>) => {
    if (!multiple) {
      setFileList([files[0]])
    } else {
      setFileList([...fileList, ...files])
    }
  }

  const acceptFiles = () => {
    if (fileList.length > 0) {
      onAcceptFiles(multiple ? fileList : fileList[0])
      onCloseRequest()
    }
  }

  const previewImage = (img: File) => {
    const reader = new FileReader()
    
    reader.onload = file => {
      if (!file.target || !file.target.result) {
        return
      }

      setImagePreviewMode(true)
      setImagePreviewData(file.target.result.toString())
    }

    reader.readAsDataURL(img)
  }

  const escHandler = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') {
      onCloseRequest()
    }
  }

  const removeFile = (idx: number) => {
    const data = [...fileList]
    data.splice(idx, 1)
    setFileList(data)
    setImagePreviewMode(false)
    setImagePreviewData(undefined)
  }

  useEffect(() => {
    document.addEventListener('keydown', escHandler)
    return () => document.removeEventListener('keydown', escHandler)
  }, [])

  useEffect(() => {
    if (fileList.length > 0 && !multiple && fileList[0].type.match(/image\//i) !== null) {
      previewImage(fileList[0])
    }
  }, [fileList, multiple])

  useEffect(() => {
    if (!imagePreviewMode) {
      setImagePreviewData(undefined)
    }
  }, [imagePreviewMode])

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onCloseRequest}></div>
      <div className="modal-card p-3">
        <header className="modal-card-head">
          <span className="modal-card-title">{title}</span>
          <button className="delete" type="button" onClick={onCloseRequest}></button>
        </header>
        <div className="modal-card-body">
          <Dropzone onDrop={dropHandler} multiple={multiple}>
            {({getRootProps, getInputProps}) => (
              <div className="box has-background-grey-light" {...getRootProps()}>
                <input {...getInputProps()} accept={acceptedFileType}/>
                <div className="columns is-centered">
                  <div className="column">
                    <h3 className="title has-text-centered">
                      <FontAwesomeIcon icon={faUpload } className="mr-2"/>
                      Upload file di sini.
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </Dropzone>
          {fileList.length > 0 && (
            <div className="columns is-multiline">
              {fileList.map((file, idx) => (
                <div className="column is-4" key={idx}>
                  <div className="card">
                    <div className="card-content">
                      {file.name}
                    </div>
                    <div className="card-footer">
                      <a href="/" className="card-footer-item has-text-danger" onClick={ev => {ev.preventDefault(); removeFile(idx)}}>
                        Hapus
                      </a>
                      {file.type.match(/image\//i) !== null && (
                        <a href="/" className="card-footer-item" onClick={ev => {ev.preventDefault(); previewImage(file)}}>
                          Pratinjau
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {imagePreviewMode && imagePreviewData && (
            <img
              src={imagePreviewData}
              alt=""
              onClick={() => {
                if (multiple) {
                  setImagePreviewMode(false)
                  setImagePreviewData(undefined)
                }
              }}
            />
          )}
        </div>
        <footer className="modal-card-foot">
          <button className="button is-primary" type="button" onClick={acceptFiles} disabled={fileList.length < 1}>
            <div className="icon is-small is-left">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <span>Simpan</span>
          </button>
          <button className="button" onClick={onCloseRequest} type="button">
            <div className="icon is-small is-left">
              <FontAwesomeIcon icon={faTimesCircle} />
            </div>
            <span>Batal</span>
          </button>
        </footer>
      </div>
    </div>
  )
}

export default FileUploader