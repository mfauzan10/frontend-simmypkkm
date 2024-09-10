import ActionInterface from '../../interfaces/ActionInterface'
import {ActionType} from '../actionsTypes'

type urlPrefixType = '/' | '/admin' | '/student' | '/teacher' | '/staff'

export default function urlPrefix(state: urlPrefixType = '/', action: ActionInterface): string {
  switch (action.type) {
    case ActionType.SET_URL_PREFIX:
      localStorage.setItem('urlPrefix', String(action.payload))
      return String(action.payload)

    default:
      return state
  }
}
