import {connect, ConnectedProps} from 'react-redux'
import UserInterface from '../interfaces/UserInterface'
import {ActionType} from './actionsTypes'
import store from './store'

export const setLogin = (token: string, msToken?: string) => ({
  type: ActionType.LOGIN,
  payload: {
    token: token,
    msToken: msToken
  }
})

export const setUserData = (userData: UserInterface) => ({
  type: ActionType.SET_USERDATA,
  payload: {
    ...userData
  }
})

export const restoreToken = (token: string|null, msToken: string|null) => ({
  type: ActionType.RESTORE_TOKEN,
  payload: {
    token: token,
    msToken: msToken
  }
})

export const setLogout = () => ({
  type: ActionType.LOGOUT
})

export const setUrlPrefix = (prefix: string) => ({
  type: ActionType.SET_URL_PREFIX,
  payload: prefix
})

export const setDepartment = (departmentId: string) => ({
  type: ActionType.SET_DEPARTMENT,
  payload: {
    id: departmentId
  }
})

export const resetDepartment = () => ({
  type: ActionType.RESET_DEPARTMENT
})

export const mapStateToProps = (state: ReturnType<typeof store.getState>) => ({
  token: state.authentication.token,
  msToken: state.authentication.msToken,
  userData: state.userData,
  department: state.department.id,
  urlPrefix: state.urlPrefix,
})

export const mapDispatchToProps = {
  setLogin,
  setUserData,
  restoreToken,
  setLogout,
  setDepartment,
  resetDepartment,
  setUrlPrefix,
}

export const StoreConnector = connect(mapStateToProps, mapDispatchToProps)
export type StoreProps = ConnectedProps<typeof StoreConnector>
