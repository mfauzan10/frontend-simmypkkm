import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { faCheck, faMinus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DateTime } from "luxon"
import { useEffect } from "react"
import { Fragment, useState } from "react"
import { useMemo } from "react"

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000'

export enum AttendanceType {
  CheckIn = 'check_in',
  CheckOut = 'check_out',
  Subject = 'subject'
}

export enum AttendanceSubType {
  Attend = 'attend',
  Permission = 'permission',
  Sick = 'sick'
}

export enum AttendanceTypeByLocation {
  PJJ= 'PJJ',
  PTM = 'PTM'
}

export interface AttendanceInterface {
  attendanceType: AttendanceType
  attendanceSubType: AttendanceSubType
  attendanceTypeByLocation: AttendanceTypeByLocation
  photo: string
  date: string
  time: string
}

export interface MemberAttendanceInterface {
  _id: string
  fullname: string
  attendance: Array<AttendanceInterface>
}

interface AttendanceTableProps {
  year: string
  month: string
  memberAttendance: Array<MemberAttendanceInterface>
}

function AttendanceTable(props: AttendanceTableProps): JSX.Element {
  const {
    year,
    month,
    memberAttendance
  } = props

  const dayTotal = useMemo(() => DateTime.fromISO(`${year}-${month}`).daysInMonth, [year, month])
  const [dataModal, setDataModal] = useState<boolean>(false)
  const [attendanceData, setAttendanceData] = useState<MemberAttendanceInterface['attendance'][0]>()

  const displayDetail = (data: MemberAttendanceInterface['attendance'][0]) => {
    setDataModal(true)
    setAttendanceData(data)
  }

  const getPresenceColor = (foundPresence: AttendanceInterface) => {
    switch (foundPresence.attendanceTypeByLocation) {
      case AttendanceTypeByLocation.PTM:
        return 'is-success'

      case AttendanceTypeByLocation.PJJ:
        return 'is-primary'

      default:
    }

    switch (foundPresence.attendanceSubType) {
      case AttendanceSubType.Permission:
        return 'is-info'

      case AttendanceSubType.Sick:
        return 'is-warning'

      default:
        return 'is-primary'
    }
  }

  useEffect(() => {
    if (!dataModal) {
      setAttendanceData(undefined)
    }
  }, [dataModal])

  if (!dayTotal) {
    return (
      <div>
        <h4 className="title is-size-4 has-text-centered">Data Error!</h4>
      </div>
    )
  }
  
  return (
    <Fragment>
      <div style={{overflowX: 'auto'}}>
        <table className="table is-bordered is-fullwidth" style={{whiteSpace: 'nowrap'}}>
          <thead>
            <tr>
              <th rowSpan={2} className="has-text-centered" style={{verticalAlign: 'middle'}}>No</th>
              <th rowSpan={2} className="has-text-centered" style={{verticalAlign: 'middle'}}>Nama</th>
              <th colSpan={dayTotal} className="has-text-centered">Tanggal</th>
            </tr>
            <tr>
              {[...Array(dayTotal).keys()].map(key => key + 1).map(day => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {memberAttendance.map((data,index) => (
              <tr key={data._id}>
                <td>{(index+1).toString()}</td>
                <td>{data.fullname}</td>
                {[...Array(dayTotal).keys()].map(key => key + 1).map(day => {
                  const date = DateTime.fromObject({year: Number(year), month: Number(month), day: day})
                  const foundPresence = data.attendance.find(attendance => attendance.date === date.toISO().substr(0, 10))

                  return (
                    <td key={day}>
                      <button
                        className={`button is-small ${!!foundPresence ? getPresenceColor(foundPresence) : 'is-light'}`}
                        onClick={() => !!foundPresence ? displayDetail(foundPresence) : null}
                      >
                        <div className="icon is-small">
                          <FontAwesomeIcon icon={!!foundPresence ? faCheck : faMinus}/>
                        </div>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
            {memberAttendance.length < 1 && (
              <tr>
                <td colSpan={dayTotal + 1} className="has-text-centered">Belum ada data absensi!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {dataModal && attendanceData && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setDataModal(false)}></div>
          <div className="modal-content">
            <div className="box">
              <img className="image is-fullwidth" src={API_URL + attendanceData.photo} alt=""/>
              <h6 className="title is-size-6 has-text-centered">{attendanceData.date} {attendanceData.time}</h6>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  )
}

export default AttendanceTable