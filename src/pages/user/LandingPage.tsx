import {
  faArrowCircleLeft,
  faCheckCircle,
  faFileImage,
  faKey,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Fragment, useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {toast} from 'react-toastify';
import useSWR from 'swr';
import APIResponse from '../../interfaces/APIResponse';
import FileUploader from '../../layouts/FileUploader';
import {StoreConnector, StoreProps} from '../../redux/actions';

const API_URL = process.env.REACT_APP_API_URL;

function LandingPage(props: StoreProps) {
  const {token} = props;
  const history = useHistory();

  const [achievementData, setAchievementData] = useState({
    student: '',
    lecturer: '',
    partner: '',
    mailEmail: '',
    mailPassword: '',
  });

  const [id, setId] = useState<string>();

  const [graph, setGraph] = useState<File | null>(null);

  const submitAchievement = () => {
    if (!id) {
      return;
    }
    const form = new FormData();

    if (achievementData.student) {
      form.append('student', achievementData.student);
    }

    if (achievementData.lecturer) {
      form.append('lecturer', achievementData.lecturer);
    }

    if (achievementData.partner) {
      form.append('partner', achievementData.partner);
    }

    if (achievementData.mailEmail) {
      form.append('mailEmail', achievementData.mailEmail);
    }

    if (achievementData.mailPassword) {
      form.append('mailPassword', achievementData.mailPassword);
    }

    if (graph) {
      form.append('graph', graph);
    }

    console.log(achievementData)

    const fetchInitOpt = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    };

    fetch(`${API_URL}/achievement/${id}`, fetchInitOpt)
      .then(result => result.json())
      .then(response => {
        if (response.success) {
          toast('Data berhasil disimpan!', {type: 'success'});
        } else {
          console.log(response);
          toast('Data gagal disimpan!', {type: 'error'});
        }
      });
  };

  useEffect(() => {
    if (token) {
      const fetchInitOpt = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      fetch(`${API_URL}/achievement`, fetchInitOpt)
        .then(result => result.json())
        .then(response => {
          const {success, message} = response;
          const {_id, graph, ...achievement} = message.achievements[0];
          setId(_id);
          if (success) {
            setAchievementData(achievement);
          }
        });
    }
  }, [token]);

  return (
    <Fragment>
      <div className="mt-3">
        <div className="columns is-centered is-desktop">
          <div className="column is-8">
            <div className="box">
              <div className="level">
                <div className="level-left">
                  <div className="level-item">
                    <h4 className="title is-size-4">Pengaturan</h4>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <button
                      className="button is-small"
                      onClick={() => history.goBack()}>
                      <div className="icon is-small is-left">
                        <FontAwesomeIcon icon={faArrowCircleLeft} />
                      </div>
                      <span>Kembali</span>
                    </button>
                    <button
                      className="button is-small ml-1"
                      onClick={submitAchievement}>
                      <div className="icon is-small is-left">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </div>
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="columns is-desktop">
                <div className="column is-8">
                  <div className="field">
                    <label htmlFor="">Mahasiswa</label>
                    <div className="control">
                      <input
                        type="text"
                        className="input"
                        autoComplete="off"
                        maxLength={60}
                        required
                        value={achievementData.student}
                        onChange={ev =>
                          setAchievementData({
                            ...achievementData,
                            student: ev.target.value,
                          })
                        }
                      />
                    </div>
                    <small className="is-size-7 has-text-info">
                      * Maksimal 60 huruf
                    </small>
                  </div>
                  <div className="field">
                    <label htmlFor="">Dosen</label>
                    <div className="control">
                      <input
                        type="text"
                        className="input"
                        autoComplete="off"
                        maxLength={60}
                        required
                        value={achievementData.lecturer}
                        onChange={ev =>
                          setAchievementData({
                            ...achievementData,
                            lecturer: ev.target.value,
                          })
                        }
                      />
                    </div>
                    <small className="is-size-7 has-text-info">
                      * Maksimal 60 huruf
                    </small>
                  </div>
                  <div className="field">
                    <label htmlFor="">Mitra</label>
                    <div className="control">
                      <input
                        type="text"
                        className="input"
                        autoComplete="off"
                        maxLength={60}
                        required
                        value={achievementData.partner}
                        onChange={ev =>
                          setAchievementData({
                            ...achievementData,
                            partner: ev.target.value,
                          })
                        }
                      />
                    </div>
                    <small className="is-size-7 has-text-info">
                      * Maksimal 60 huruf
                    </small>
                  </div>
                  <div className="field">
                    <label htmlFor="">Email (Mail Sender)</label>
                    <div className="control">
                      <input
                        type="text"
                        className="input"
                        autoComplete="off"
                        maxLength={60}
                        required
                        value={achievementData.mailEmail}
                        onChange={ev =>
                          setAchievementData({
                            ...achievementData,
                            mailEmail: ev.target.value,
                          })
                        }
                      />
                    </div>
                    <small className="is-size-7 has-text-info">
                      * Maksimal 60 huruf
                    </small>
                  </div>
                  <div className="field">
                    <label htmlFor="">Password (Mail Sender)</label>
                    <div className="control">
                      <input
                        type="password"
                        className="input"
                        autoComplete="off"
                        minLength={8}
                        required
                        value={achievementData.mailPassword}
                        onChange={ev =>
                          setAchievementData({
                            ...achievementData,
                            mailPassword: ev.target.value,
                          })
                        }
                      />
                    </div>
                    <small className="is-size-7 has-text-info">
                      * Minimal 8 huruf
                    </small>
                  </div>
                  <div className="field">
                    <label htmlFor="">Grafik</label>
                    <div className="control">
                      <input
                        type="file"
                        className="input"
                        required
                        onChange={ev =>
                          ev.target?.files?.[0] &&
                          setGraph(ev.target?.files?.[0])
                        }
                      />
                    </div>
                    <small className="is-size-7 has-text-info">
                      * Format file gambar (jpg, png)
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default StoreConnector(LandingPage);
