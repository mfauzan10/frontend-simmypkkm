import {DepartmentInterface} from '../pages/main/DepartmentForm'

export enum Privilege {
  Admin = 'admin',
  Staff = 'staff',
  Reviewer = 'reviewer',
}
export default interface UserInterface {
  _id: string
  fullname: string
  email: string
  password: string
  photo?: string
  department?: DepartmentInterface
  meta: {
    NIK?: string
    NPWP?: string
    address?: string
    gender?: string
    religion?: string
    department?: string
    NIP?: string
    NUPTK?: string
    NIPD?: string
    NISN?: string
    SKHUN?: string
    employmentGroup?: string
    fieldOfStudy?: string
    actionResearch?: string
    birthDate?: string
    birthPlace?: string
    parent?: string
    batchYear?: number
    specialNeeds?: string
    phone: Array<string>
  }
  privilege: Privilege
  status: string
}
