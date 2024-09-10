import { Fragment, useEffect, useState } from "react"
import { toast } from "react-toastify"
import APIResponse from "../interfaces/APIResponse"
import { StoreConnector, StoreProps } from "../redux/actions"

const API_URL = process.env.REACT_APP_API_URL

function DepartmentTitle(props: StoreProps): JSX.Element {
  interface DepartmentResponse {
    title: string
  }

  const {
    token,
    department
  } = props

  const [departmentData, setDepartmentData] = useState<DepartmentResponse>({title: ''})

  useEffect(() => {
    if (!token ) {
      return
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL}/department/${department}`, fetchInitOpt)
      .then(result => result.json())
      .then((response: APIResponse<{department: DepartmentResponse}>) => {
        const { success, message } = response

        if (!success) {
          return
        }

        setDepartmentData(message.department)
      })
      .catch(() => toast('Gagal mengambil data instansi!', {type: 'error'}))
  }, [token, department])

  return (
    <Fragment>
      {departmentData.title}
    </Fragment>
  )
}

export default StoreConnector(DepartmentTitle)