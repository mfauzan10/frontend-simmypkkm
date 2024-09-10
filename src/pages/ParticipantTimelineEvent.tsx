import { faArrowCircleLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DateTime } from 'luxon';
import MUIDataTable, { MUIDataTableOptions } from 'mui-datatables';
import { ChangeEvent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import APIResponse from '../interfaces/APIResponse';
import UserInterface from '../interfaces/UserInterface';
import Loading from '../layouts/Loading';
import { StoreConnector, StoreProps } from '../redux/actions';
import { tableOptions } from '../utils/table';
import { DepartmentInterface } from './main/DepartmentForm';
import { TimelineEventInterface } from './TimelineEventList';
import { TimelineInterface, TimelineParticipantType } from './TimelineList';

const API_URL = process.env.REACT_APP_API_URL;

function TimelineEventParticipant(props: StoreProps) {
  const {token, department, urlPrefix} = props;
  const {id, idTimeline} = useParams<{ id?: string, idTimeline?: string }>();
  const history = useHistory();
  const [timeline, setTimeline] = useState<TimelineInterface>();
  const [timelineEvent, setTimelineEvent] = useState<TimelineEventInterface>();
  const [userList, setUserList] = useState<Array<UserInterface | DepartmentInterface>>([]);
  const [markedUserList, setMarkedUserList] = useState<Array<string>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [data, setData] = useState<Array<Array<string>>>([]);
  const [selectedData, setSelectedData] = useState<Array<number>>([])
  const columns = ['Nama', 'Email'];
  const customTableOptions: MUIDataTableOptions = {
    ...tableOptions,
    onRowSelectionChange: (rows) => {
      rows.map((row) => {
        updateUserMark(row.index)
      })
    },
    rowsSelected: selectedData
  }

  const markAllUser = (ev: ChangeEvent<HTMLInputElement>) => {
    if (ev.target.checked) {
      const markedUser = userList.map((user) => user._id);
      if (markedUser) {
        setMarkedUserList(markedUser as Array<string>);
      } else {
        setMarkedUserList([]);
      }
    } else {
      setMarkedUserList([]);
    }
  };

  const updateUserMark = (index: number) => {
    const foundIndex = markedUserList.findIndex((user) => user === userList[index]._id);
    let copyMarkedUserList = [...markedUserList];

    if (foundIndex > -1) {
      copyMarkedUserList.splice(foundIndex, 1);
    } else {
      copyMarkedUserList = [...copyMarkedUserList, userList[index]!._id!];
    }

    setMarkedUserList(copyMarkedUserList);
  };

  const submitTimelineEvent = () => {
    const form = new URLSearchParams();

    markedUserList.map((userId, idx) => form.append(`participants[${idx}]`, userId));

    const fetchInitOpt: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: form,
    };

    const url = new URL(`${API_URL + urlPrefix}/timeline-event?timeline=${idTimeline}`);

    if (id) {
      url.pathname = `${url.pathname}/${id}`;
    }

    fetch(url.toString(), fetchInitOpt)
        .then((response) => response.json())
        .then(async function(response: APIResponse) {
          const {success} = response;

          if (!success) {
            toast('Gagal menyimpan data!', {type: 'error'});
            return;
          }

          toast('Berhasil memperbarui Tahapan!', {type: 'success'});

          history.goBack();
        })
        .catch(() => toast('Kegagalan jaringan!', {type: 'error'}));
  };

  useEffect(() => {
    if (!token || !id) {
      return;
    }
    const fetchInitOpt = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    try {
      const tasks = [
        `/timeline/${idTimeline}`,
        `/timeline-event/${id}?timeline=${idTimeline}`,
      ];

      Promise.all(tasks.map((task) => fetch(API_URL + urlPrefix + task, fetchInitOpt)))
          .then(async (responses) => await Promise.all([responses[0].json(), responses[1].json()]))
          .then((results) => {
            const [timelineResult, timelineEventResult] = results;

            if (timelineResult.success) {
              setTimeline(timelineResult.message.timeline);
            }

            if (timelineEventResult.success) {
              setTimelineEvent(timelineEventResult.message.timelineEvent);

              if (timelineEventResult.message.timelineEvent.participants) {
                setMarkedUserList(timelineEventResult.message.timelineEvent.participants);
              }
            }
          });
    } catch (err) {
      toast('Terjadi kesalahan jaringan!', {
        type: 'error',
      });
    }
  }, [token, department, urlPrefix, id]);

  useEffect(() => {
    if (!timelineEvent) {
      return;
    }

    const fetchInitOpt: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    const url = new URL(`${API_URL + urlPrefix}`);

    if (timeline?.participantType == TimelineParticipantType.Department) {
      url.pathname = `${url.pathname}/department`;
    } else {
      url.pathname = `${url.pathname}/staff`;
    }

    fetch(url.toString(), fetchInitOpt)
        .then((response) => response.json())
        .then((response: APIResponse<{ staffs: Array<UserInterface>, departments: Array<UserInterface> }>) => {
          const {success, message} = response;

          if (!success) {
            toast('Gagal mengambil data!', {type: 'error'});
            return;
          }

          if (timeline?.participantType == TimelineParticipantType.Department) {
            setUserList(message.departments);
          } else {
            setUserList(message.staffs);
          }

          setLoading(false);
        });
  }, [timelineEvent]);

  useEffect(() => {
    const newData: Array<Array<string>> = []
    const newMarkedUserList: Array<string> = []
    userList.map((user) => {
      newMarkedUserList.push()
      newData.push([timeline?.participantType == TimelineParticipantType.Person ? (user as UserInterface).fullname : (user as DepartmentInterface).title, user.email])
    })
    setData(newData)
  }, [userList])

  useEffect(() => {
    if (userList.length > 0 && markedUserList.length > 0) {
      setSelectedData(markedUserList.map((markedUserId) => userList.findIndex((user) => user._id == markedUserId)))
    }
  }, [userList, markedUserList])

  if (!timelineEvent) {
    return (
      <Loading />
    );
  }

  return (
    <div className="mt-3">
      <div className="columns is-centered">
        <div className="column is-12-widescreen">
          <div className="box p-5">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h1 className="title is-size-4">Tahapan</h1>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <button className="button is-small is-primary" type="button" onClick={() => submitTimelineEvent()}>
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <span>Simpan</span>
                  </button>
                </div>
                <div className="level-item">
                  <button className="button is-small mx-1" onClick={() => history.goBack()}>
                    <div className="icon is-small is-left">
                      <FontAwesomeIcon icon={faArrowCircleLeft} />
                    </div>
                    <span>Kembali</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="mb-4">
              <strong>{timelineEvent.title}</strong><br />
              <p
              >{timelineEvent.description}</p>
              {DateTime.fromJSDate(new Date(timelineEvent.startedAt)).setLocale('id-ID').toFormat('EEEE, d LLLL yyyy')} - &nbsp;
              {DateTime.fromJSDate(new Date(timelineEvent.finishedAt)).setLocale('id-ID').toFormat('EEEE, d LLLL yyyy')}
            </p>
          </div>
          <MUIDataTable
            title={`Daftar Peserta`}
            data={data}
            columns={columns}
            options={customTableOptions}
          />
        </div>
      </div>
    </div>
  );
}

export default StoreConnector(TimelineEventParticipant);
