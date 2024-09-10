import {ActionType} from '../redux/actionsTypes'

export default interface ActionInterface<T = {[title: string]: any}|null> {
  type: ActionType,
  payload: T
}
