import { useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDownload } from "@fortawesome/free-solid-svg-icons"
import { IconProp } from "@fortawesome/fontawesome-svg-core"

const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:4000"

export enum FileType {
  VIDEO = "video",
  AUDIO = "audio",
  DOCUMENT = "document",
  IMAGE = "image",
  UNKNOWN = "unknown"
}

interface FilePreviewerProps {
  file: string
  onCloseRequest: () => void
}

function FilePreviewer(props: FilePreviewerProps) {
  const { onCloseRequest, file: fileName = "" } = props

  const images = ["jpg", "jpeg", "png", "gif"]
  const documents = ["pdf", "ppt", "pptx", "xls", "xlsx", "doc", "docx"]
  const videos = ["mp4", "avi", "3gp"]
  const audios = ["mp3"]

  const escHandler = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") {
      onCloseRequest()
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", escHandler)
    return () => document.removeEventListener("keydown", escHandler)
  }, [])

  function getType() {
    const basename = fileName.split(/[\\/]/).pop()

    if (basename === undefined) {
      return FileType.UNKNOWN
    }
    
    const pos = basename?.lastIndexOf(".")

    if (documents.includes(basename.slice(pos + 1))) {
      return FileType.DOCUMENT
    } else if (images.includes(basename.slice(pos + 1))) {
      return FileType.IMAGE
    } else if (videos.includes(basename.slice(pos + 1))) {
      return FileType.VIDEO
    } else if (audios.includes(basename.slice(pos + 1))) {
      return FileType.AUDIO
    }

    return FileType.UNKNOWN
  }

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onCloseRequest}></div>
      <div className="modal-card" style={{ height: "100%"}}>
        <header className="modal-card-head">
          <p className="modal-card-title">{fileName.substring(50)}</p>
          <button className="delete" type="button" onClick={onCloseRequest}></button>
        </header>
        <div className="modal-card-body">
          {((fileType: FileType) => {
            switch (fileType) {
              case FileType.DOCUMENT:
                return (
                  <iframe
                    title="Pratinjau Dokumen"
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${API_URL + fileName}`}
                    width="100%"
                    height="100%"
                  />
                )

              case FileType.IMAGE:
                return (
                  <img alt="" src={API_URL + fileName} width="100%" height="100%"/>
                )

              case FileType.VIDEO:
                return (
                  <video width="100%" height="100%" controls>
                    <source src={API_URL + fileName} />
                  </video>
                )

              case FileType.AUDIO:
                return (
                  <audio controls>
                    <source src={API_URL + fileName} />
                  </audio>
                )

              default:
            }
          })(getType())}
        </div>
        <footer className="modal-card-foot">
          <a
            href={API_URL + fileName}
            target="_blank"
            className="is-size-7 has-text-danger ml-2"
            rel="noreferrer"
          >
            <button className="button is-primary" type="button">
              <div className="icon is-small is-left">
                <FontAwesomeIcon icon={faDownload} />
              </div>
              <span>Download</span>
            </button>
          </a>
        </footer>
      </div>
    </div>
  )
}

export default FilePreviewer
