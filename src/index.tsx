import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import './styles/css/style.css';
import Main from './Main';
import store from './redux/store';
import reportWebVitals from './reportWebVitals';
import {SWRConfig} from 'swr';

ReactDOM.render(
  <Provider store={store}>
    <SWRConfig
      value={{
        fetcher: (resource, init?: RequestInit) =>
          fetch(resource, init).then(res => res.json()),
      }}>
      <Main />
    </SWRConfig>
  </Provider>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
