import {
  faArrowCircleLeft,
  faExclamationCircle,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {DateTime} from 'luxon';
import {useEffect, useState} from 'react';
import {useHistory, useParams} from 'react-router';
import {Link} from 'react-router-dom';
import {toast} from 'react-toastify';
import APIResponse from '../interfaces/APIResponse';
import Loading from '../layouts/Loading';
import {StoreConnector, StoreProps} from '../redux/actions';
import {ProposalInterface, ProposalStatus} from './ProposalList';
import {TimelineEventInterface} from './TimelineEventList';

const API_URL = process.env.REACT_APP_API_URL;

function TimelineEventForm(props: StoreProps) {
  const {token, department, urlPrefix, userData} = props;
  const {id, idTimeline, idTimelineEvent} = useParams<{id?: string; idTimeline?: string; idTimelineEvent?: string}>();
  const history = useHistory();
  const [timelineEvent, setTimelineEvent] = useState<TimelineEventInterface>();
  const [proposals, setProposals] = useState<Array<ProposalInterface>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const convertProposalStatus = (status: string) => {
    switch (status) {
      case ProposalStatus.Send:
        return 'Belum dikonfirmasi';

      case ProposalStatus.Approve:
        return 'Diterima';

      case ProposalStatus.Decline:
        return 'Ditolak';

      default:
        return 'tidak valid';
    }
  };

  useEffect(() => {
    if (!token || !id) {
      return;
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    fetch(
      `${API_URL}${urlPrefix}/timeline-event/${id}?timeline=${idTimeline}`,
      fetchInitOpt,
    )
      .then(response => response.json())
      .then(
        (response: APIResponse<{timelineEvent: TimelineEventInterface}>) => {
          const {success, message} = response;

          if (!success) {
            toast('Gagal mengambil data!', {type: 'error'});
            return;
          }

          const {timelineEvent} = message;

          setTimelineEvent(timelineEvent);
        },
      );
  }, [token, department, urlPrefix, id]);

  useEffect(() => {
    if (!timelineEvent) {
      return;
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    fetch(
      `${API_URL}${urlPrefix}/proposal/event/${timelineEvent._id}`,
      fetchInitOpt,
    )
      .then(response => response.json())
      .then((response: APIResponse<{proposals: Array<ProposalInterface>}>) => {
        const {success, message} = response;

        if (!success) {
          toast('Gagal mengambil data!', {type: 'error'});
          return;
        }

        setProposals(message.proposals);
      });
  }, [timelineEvent]);

  if (!timelineEvent) {
    return <Loading />;
  }
  
  return (
    <div className="mt-3">
      <div className="columns is-centered">
        <div className="column is-12-widescreen">
          <div className="box p-5">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h1 className="title is-size-4">{timelineEvent.title}</h1>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <button
                    className="button is-small mx-1"
                    onClick={() => history.goBack()}>
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faArrowCircleLeft} />
                    </div>
                    <span>Kembali</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="mb-4">
              <strong>Tanggal Pelaksanaan</strong>
              <br />
              {DateTime.fromJSDate(new Date(timelineEvent.startedAt))
                .setLocale('id-ID')
                .toFormat('EEEE, d LLLL yyyy')}{' '}
              - &nbsp;
              {DateTime.fromJSDate(new Date(timelineEvent.finishedAt))
                .setLocale('id-ID')
                .toFormat('EEEE, d LLLL yyyy')}
            </p>
            <div className="columns">
              <div className="column">
                <div className="card mb-4">
                  <div className="card-content">
                    <h1 className="title is-size-4">
                      Daftar Pengumpulan
                    </h1>
                    {proposals.length == 0 && (
                      <div className="is-flex is-flex-direction-column is-align-items-center">
                        <FontAwesomeIcon
                          className="is-size-1 mb-3"
                          icon={faExclamationCircle}
                        />
                        <p className="is-size-5">Pengumpulan tidak ditemukan</p>
                      </div>
                    )}
                    {proposals.length > 0 && (
                      <table
                        className="table is-bordered is-fullwidth"
                        style={{whiteSpace: 'nowrap'}}>
                        <thead>
                          <tr>
                            <th>Prodi</th>
                            <th>Pengunggah</th>
                            <th>Status</th>
                            <th style={{width: 275}}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proposals.map(proposal => (
                            <tr key={proposal._id}>
                              <td>{proposal.department}</td>
                              <td>{proposal.createdBy}</td>
                              <td>{convertProposalStatus(proposal.status)}</td>
                              <td>
                                <Link
                                  to={`${urlPrefix}/proposal/review/${idTimeline}/event/${id}/proposal/${proposal._id}`}
                                  className="button is-small mx-1">
                                  <div className="icon is-small is-left">
                                    <FontAwesomeIcon icon={faEye} />
                                  </div>
                                  <span>Lihat</span>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreConnector(TimelineEventForm);
