import {combineReducers, createStore} from 'redux'
import authentication from './reducer/authentication'
import userData from './reducer/userData'
import department from './reducer/department'
import urlPrefix from './reducer/urlPrefix'

const reducer = combineReducers({
  authentication,
  userData,
  department,
  urlPrefix
})

export default createStore(reducer)
