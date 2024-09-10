import ActionInterface from '../../interfaces/ActionInterface'
import {ActionType} from '../actionsTypes'

interface AuthenticationInterface {
  token: string|null
  msToken: string|null
}

const defaultState: AuthenticationInterface = {
  token: null,
  msToken: null
}

export default function authentication(state = defaultState, action: ActionInterface): AuthenticationInterface {
  switch (action.type) {
    case ActionType.LOGIN:
      console.log(action.payload)
      console.log('--payload')
      localStorage.setItem('token', action.payload?.token)

      if (action.payload?.msToken) {
        localStorage.setItem('msToken', action.payload?.msToken)
      }

      return {
        ...state,
        token: action.payload?.token,
        msToken: action.payload?.msToken ?? null
      }

    case ActionType.RESTORE_TOKEN:
      return {
        ...state,
        token: action.payload?.token,
        msToken: action.payload?.msToken
      }

    case ActionType.LOGOUT:
      localStorage.clear()

      return {
        ...state,
        token: null
      }

    default:
      return state
  }
}
