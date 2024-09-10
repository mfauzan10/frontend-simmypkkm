import {useEffect, useState} from 'react';
import {Redirect} from 'react-router-dom';
import {StoreConnector, StoreProps} from '../redux/actions';
import LandingPage from './LandingPage';

function Main(props: StoreProps) {
  const {
    token,
    urlPrefix,
    setUrlPrefix,
    setDepartment,
    setLogin,
  } = props;

  const [loading, setLoadingState] = useState(false);

  useEffect(() => {
    const localToken = localStorage.getItem('token');
    const localMsToken = localStorage.getItem('msToken');
    const localUrlPrefix = localStorage.getItem('urlPrefix');
    const localDepartment = localStorage.getItem('localDepartment');

    if (localToken !== null) {
      setLogin(localToken, localMsToken ?? undefined);
    }

    if (localDepartment !== null) {
      setDepartment(localDepartment);
    }

    if (localUrlPrefix !== null) {
      setUrlPrefix(localUrlPrefix);
    }

    setLoadingState(true);
  }, []);

  if (token !== null && urlPrefix !== null) {
    return (
      <Redirect to={urlPrefix} />
    );
  }

  if (loading && token === null) {
    return (
      <Redirect to="/" />
    );
  }

  return (
    <section className="section">
      <LandingPage/>
    </section>
  );
}

export default StoreConnector(Main);
