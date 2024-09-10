import ActionInterface from '../../interfaces/ActionInterface'
import {ActionType} from '../actionsTypes'

interface DepartmentInterface {
  id: string|null
}

const defaultState: DepartmentInterface = {
  id: null
}

export default function department(state = defaultState, action: ActionInterface): DepartmentInterface {
  switch (action.type) {
    case ActionType.SET_DEPARTMENT:
      if (action.payload?.id) {
        localStorage.setItem('department', action.payload.id)
      }

      return {
        id: action.payload?.id
      }

    case ActionType.RESET_DEPARTMENT:
      localStorage.removeItem('department')

      return {
        id: null
      }

    default:
      return state
  }
}
