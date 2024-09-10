import ActionInterface from '../../interfaces/ActionInterface'
import UserInterface from '../../interfaces/UserInterface'
import {ActionType} from '../actionsTypes'

export default function userData(state: UserInterface|null = null, action: ActionInterface<UserInterface>): UserInterface|null {
  switch (action.type) {
    case ActionType.SET_USERDATA:
      localStorage.setItem('userData', JSON.stringify(action.payload))
      return action.payload

    default:
      return state
  }
}
