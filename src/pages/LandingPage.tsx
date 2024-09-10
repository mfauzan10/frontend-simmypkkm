import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import {Box, Button, Grid, IconButton, Paper, Typography} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import {useEffect, useState} from 'react';
import {intervalToDuration} from 'date-fns';
import 'react-toastify/dist/ReactToastify.min.css';
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import useSWR from 'swr';
import APIResponse from '../interfaces/APIResponse';
import ArticleInterface from '../interfaces/ArticleInterface';
import Loading from '../layouts/Loading';
import {API_URL} from '../Main';
import {StoreConnector, StoreProps} from '../redux/actions';
import '../styles/css/LandingPage.css';
import {TimelineEventInterface} from './TimelineEventList';
import formatDateStrId from '../utils/formatDateStrId';
import TimelineEventsInterface from '../interfaces/TimelineInterface';

type AchievementType = {
  lecturer: string;
  student: string;
  partner: string;
  graph: string;
};

const calculateTimeLeft = (endDate: Date) =>
  intervalToDuration({
    start: new Date(),
    end: endDate,
  });

function LandingPage(props: StoreProps): JSX.Element {
  const {data: articles} = useSWR<APIResponse<{articles: ArticleInterface[]}>>(
    `${API_URL}/article`,
  );

  const {data: timelineEvents} = useSWR<
    APIResponse<{timelineEvents: TimelineEventsInterface[]}>
  >(`${API_URL}/timeline-event/now`);

  const {data: achievements} = useSWR<
    APIResponse<{achievements: AchievementType[]}>
  >(`${API_URL}/achievement`);

  const [timeLeft, setTimeLeft] = useState<Duration>();

  useEffect(() => {
    if (timelineEvents?.message.timelineEvents.length == 0) {
      return;
    }
    if (timelineEvents?.message.timelineEvents[0].finishedAt) {
      setInterval(() => {
        setTimeLeft(
          calculateTimeLeft(
            new Date(timelineEvents?.message.timelineEvents[0].finishedAt),
          ),
        );
      }, 500);
    }
  }, [timelineEvents]);

  useEffect(() => {
    if (timelineEvents?.message.timelineEvents.length == 0) {
      return;
    }
    if (timelineEvents?.message.timelineEvents[0].finishedAt) {
      setTimeLeft(
        calculateTimeLeft(
          new Date(timelineEvents?.message.timelineEvents[0].finishedAt),
        ),
      );
    }
  }, [timelineEvents]);

  if (!timelineEvents?.message.timelineEvents) {
    return <Loading />;
  }

  return (
    <div className="body">
      <div className="header">
        <nav className="navbar" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <div className="media-left ml-5 pt-2 pl-5">
              <Stack className="ml-2">
                <Avatar
                  alt="Universitas Muhammadiyah Yogyakarta"
                  src="assets/image.png"
                />
              </Stack>
            </div>
            <a href="#beranda">
              <Typography
                variant="caption"
                className="has-text-black navbar-item mt-3"
                sx={{fontWeight: 'bold'}}>
                UNIVERSITAS MUHAMMADIYAH YOGYAKARTA
              </Typography>
            </a>

            <a
              role="button"
              className="navbar-burger"
              aria-label="menu"
              aria-expanded="false"
              data-target="navbarBasicExample">
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>

          <div id="navbarBasicExample" className="navbar-menu">
            <div className="navbar-end title is-5 mr-5 pr-6">
              <a href="">
                <Typography
                  variant="caption"
                  className="navbar-item has-text-black py-4 px-5"
                  sx={{fontWeight: 'bold'}}>
                  Beranda
                </Typography>
              </a>
              <a href="">
                <Typography
                  variant="caption"
                  className="navbar-item has-text-black py-4 px-5"
                  sx={{fontWeight: 'bold'}}>
                  Tentang
                </Typography>
              </a>
              <a href="">
                <Typography
                  variant="caption"
                  className="navbar-item has-text-black py-4 px-5"
                  sx={{fontWeight: 'bold'}}>
                  Program Kampus Merdeka
                </Typography>
              </a>
              <a href="auth">
                <Typography
                  variant="caption"
                  className="navbar-item py-4 px-5 has-background has-text-white"
                  sx={{fontWeight: 'bold'}}>
                  Masuk
                </Typography>
              </a>
            </div>
          </div>
        </nav>

        <Grid container spacing={2}>
          <Grid item lg={6}>
            <div className="hero-section pt-3">
              <Typography
                variant="h2"
                className="has-text-black ml-2 pt-6 pl-6"
                sx={{fontWeight: 'bold'}}>
                Tenggat Waktu <br /> Pengumpulan <br />
                <span className="color-green">Proposal</span>
              </Typography>

              <Typography variant="subtitle1" className="ml-2 pt-3 pl-6">
                Ayo segera kumpulkan proposalmu sebelum jatuh tempo! <br />
                dengan mengikuti program ini, kamu dapat membantu <br />{' '}
                memajukan mutu pendidikan di Indonesia lho.
              </Typography>
            </div>

            {timelineEvents.message.timelineEvents.length > 0 && (
              <div className="pt-5 pl-6">
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    '& > :not(style)': {
                      m: 1,
                      width: 80,
                      height: 80,
                      textAlign: 'center',
                    },
                  }}>
                  <Paper
                    elevation={2}
                    className="has-background-black has-text-white p-3">
                    <Typography variant="h5">
                      {timelineEvents?.message.timelineEvents[0].finishedAt
                        ? formatDateStrId(
                            timelineEvents?.message.timelineEvents[0]
                              .finishedAt,
                            'dd',
                          )
                        : 0}
                    </Typography>
                    <Typography sx={{fontWeight: 'bold'}}>
                      {timelineEvents?.message.timelineEvents[0].finishedAt
                        ? formatDateStrId(
                            timelineEvents?.message.timelineEvents[0]
                              .finishedAt,
                            'MMMM',
                          )
                        : 'Januari'}
                    </Typography>
                  </Paper>
                  <Paper
                    elevation={2}
                    className="has-background has-text-white p-3"
                    sx={{backgroundColor: '#013e01'}}>
                    <Typography variant="h5">{timeLeft?.days ?? 0}</Typography>
                    <Typography sx={{fontWeight: 'bold'}}>Hari</Typography>
                  </Paper>
                  <Paper
                    elevation={2}
                    className="has-background has-text-white p-3"
                    sx={{backgroundColor: '#013e01'}}>
                    <Typography variant="h5">{timeLeft?.hours ?? 0}</Typography>
                    <Typography sx={{fontWeight: 'bold'}}>Jam</Typography>
                  </Paper>
                  <Paper
                    elevation={2}
                    className="has-background has-text-white p-3"
                    sx={{backgroundColor: '#013e01'}}>
                    <Typography variant="h5">
                      {timeLeft?.minutes ?? 0}
                    </Typography>
                    <Typography sx={{fontWeight: 'bold'}}>Menit</Typography>
                  </Paper>
                  <Paper
                    elevation={2}
                    className="has-background has-text-white p-3"
                    sx={{backgroundColor: '#013e01'}}>
                    <Typography variant="h5">
                      {timeLeft?.seconds ?? 0}
                    </Typography>
                    <Typography sx={{fontWeight: 'bold'}}>Detik</Typography>
                  </Paper>
                </Box>
              </div>
            )}

            <div className="mt-2 ml-2 pt-5 pl-6">
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  size="large"
                  className="py-2 px-6"
                  sx={{Color: '#000000', outlinedColor: '#000000'}}>
                  <a href="" className="px-5">
                    {' '}
                    FAQ{' '}
                  </a>
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  className="py-2 px-5"
                  sx={{
                    backgroundColor: '#0A0A0A',
                    textTransform: 'capitalize',
                  }}>
                  Buku Panduan
                </Button>
              </Stack>
            </div>
          </Grid>

          <Grid item lg={6}>
            <div className="content pt-6 pr-6">
              <figure className="pt-3">
                <img className="mySlides" src="assets/image3.png" />
              </figure>
            </div>
          </Grid>
        </Grid>
      </div>

      <div className="discripsion has-background-white-ter">
        <div className="mt-6 mb-6 pt-5 pl-5">
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              '& > :not(style)': {
                m: 2,
                p: 3,
                width: 405,
                height: 405,
              },
            }}>
            <Paper
              elevation={5}
              className="pt-6 has-background-black has-text-white">
              <Stack>
                <Avatar
                  alt=""
                  src="assets/bi_info-lg.png"
                  sx={{width: 56, height: 56}}
                />
              </Stack>
              <Typography
                variant="h4"
                className="pt-5"
                sx={{fontWeight: 'bold'}}>
                Apa itu PK-KM ?
              </Typography>
              <Typography variant="h6" className="pt-5">
                Program Kompetisi Kampus Merdeka (PK-KM) merupakan program
                kompetisi terbuka, dengan sistem seleksi berkelompok (tiered
                system).
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              className="pt-6 has-background has-text-black"
              sx={{backgroundColor: '#F9F9F9'}}>
              <Stack>
                <Avatar
                  alt=""
                  src="assets/ant-design_star-outlined.png"
                  sx={{width: 56, height: 56}}
                />
              </Stack>
              <Typography
                variant="h4"
                className="pt-5"
                sx={{fontWeight: 'bold'}}>
                Apa manfaat PK-KM ?
              </Typography>
              <Typography variant="h6" className="pt-5">
                Meningkatnya kualitas lulusan pendidikan tinggi, meningkatkan
                kualitas dosen pendidikan tinggi, dan meningkatkan kualitas
                kurikulum dan pembelajaran.
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              className="pt-6 has-background has-text-black"
              sx={{backgroundColor: '#F9F9F9'}}>
              <Stack>
                <Avatar
                  alt=""
                  src="assets/ic_baseline-app-registration.png"
                  sx={{width: 56, height: 56}}
                />
              </Stack>
              <Typography
                variant="h4"
                className="pt-5"
                sx={{fontWeight: 'bold'}}>
                Alur Seleksi
              </Typography>
              <Typography variant="h6" className="pt-5">
                Pertama, proposal akan dikumpulkan oleh perwakilan prodi pada
                setiap jurusan kemudian akan dikirimkan ke pihak universitas
                guna dilakukan pengecekan kelengkapan.
              </Typography>
            </Paper>
          </Box>
        </div>

        <div id="timeline" className="timelane has-background-white">
          <Grid container spacing={2}>
            <Grid item lg={6}>
              <div className="media-left mb-6 pl-6">
                <Typography
                  variant="h3"
                  className="has-text-black pt-6"
                  sx={{fontWeight: 'bold'}}>
                  Timeline PK-KM
                </Typography>

                <Typography variant="h6" className="pt-3">
                  Jadwal dapat berubah berdasarkan <br /> keputusan Panitia,
                  dalam hal ini Kementerian <br />
                  Riset, Teknologi, dan Pendidikan Tinggi <br />{' '}
                  (Kemenristekdikti).
                </Typography>

                <div className="pt-6">
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      className="color-green py-3 px-6"
                      sx={{
                        backgroundColor: '#013E01',
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                      }}>
                      Bantuan
                    </Button>
                  </Stack>
                </div>
              </div>
            </Grid>

            <Grid item lg={6}>
              <div className="App pt-6">
                <VerticalTimeline layout={'1-column'}>
                  <VerticalTimelineElement
                    className="vertical-timeline-element--work"
                    date="14 Maret 2022"
                    iconStyle={{
                      background: '#013E01',
                      color: '#fff',
                      width: 55,
                      height: 55,
                    }}
                    icon={
                      <Typography sx={{m: 3, mt: 2, fontWeight: 'bold'}}>
                        1
                      </Typography>
                    }>
                    <Typography
                      variant="h6"
                      className="vertical-timeline-element-title"
                      sx={{fontWeight: 'bold'}}>
                      Pengumuman Undangan Pemasukan Proposal
                    </Typography>
                  </VerticalTimelineElement>
                  <VerticalTimelineElement
                    className="vertical-timeline-element--work"
                    date="14 Maret - 29 April 2022"
                    iconStyle={{
                      background: '#013E01',
                      color: '#fff',
                      width: 55,
                      height: 55,
                    }}
                    icon={
                      <Typography sx={{m: 3, mt: 2, fontWeight: 'bold'}}>
                        2
                      </Typography>
                    }>
                    <Typography
                      variant="h6"
                      className="vertical-timeline-element-title"
                      sx={{fontWeight: 'bold'}}>
                      Pengusul dan Pemasukan Proposal
                    </Typography>
                  </VerticalTimelineElement>
                  <VerticalTimelineElement
                    className="vertical-timeline-element--work"
                    date="14 Maret - 8 Mei 2022"
                    iconStyle={{
                      background: '#013E01',
                      color: '#fff',
                      width: 55,
                      height: 55,
                    }}
                    icon={
                      <Typography sx={{m: 3, mt: 2, fontWeight: 'bold'}}>
                        3
                      </Typography>
                    }>
                    <Typography
                      variant="h6"
                      className="vertical-timeline-element-title"
                      sx={{fontWeight: 'bold'}}>
                      Seleksi Administratif Proposal
                    </Typography>
                  </VerticalTimelineElement>
                  <VerticalTimelineElement
                    className="vertical-timeline-element--work"
                    date="9 Mei - 27 Mei 2022"
                    iconStyle={{
                      background: '#A4A4A4',
                      color: '#fff',
                      width: 55,
                      height: 55,
                    }}
                    icon={
                      <Typography sx={{m: 3, mt: 2, fontWeight: 'bold'}}>
                        4
                      </Typography>
                    }>
                    <Typography
                      variant="h6"
                      className="vertical-timeline-element-title"
                      sx={{fontWeight: 'bold'}}>
                      Seleksi Substansi dan Verifikasi Kelayakan Proposal 2022
                    </Typography>
                  </VerticalTimelineElement>
                  <VerticalTimelineElement
                    className="vertical-timeline-element--work"
                    date="30 Mei 2022"
                    iconStyle={{
                      background: '#A4A4A4',
                      color: '#fff',
                      width: 55,
                      height: 55,
                    }}
                    icon={
                      <Typography sx={{m: 3, mt: 2, fontWeight: 'bold'}}>
                        5
                      </Typography>
                    }>
                    <Typography
                      variant="h6"
                      className="vertical-timeline-element-title"
                      sx={{fontWeight: 'bold'}}>
                      Pengumuman Penerima PK-KM
                    </Typography>
                  </VerticalTimelineElement>
                </VerticalTimeline>
              </div>
            </Grid>
          </Grid>
        </div>

        <div className="capaian has-background">
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              '& > :not(style)': {
                width: 40,
                height: 40,
              },
            }}>
            <Paper elevation={0} sx={{backgroundColor: '#00000080'}}></Paper>
          </Box>
          <Grid sx={{display: 'flex', flexWrap: 'wrap'}}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                '& > :not(style)': {
                  width: 40,
                  height: 40,
                },
              }}>
              <Paper elevation={0} sx={{backgroundColor: '#013E01'}}></Paper>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                '& > :not(style)': {
                  width: 30,
                  height: 30,
                },
              }}>
              <Paper elevation={0} sx={{backgroundColor: '#FFFFFFE5'}}></Paper>
            </Box>
          </Grid>

          <div id="capaian" className="has-text-white pl-6">
            <Grid
              container
              spacing={2}
              className="pt-3 pl-6"
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                letteSpacing: -1,
              }}>
              <Grid item lg={8}>
                <Typography variant="h2" className="" sx={{fontWeight: 'bold'}}>
                  Capaian
                </Typography>
                <Typography variant="h6" className="pt-4">
                  Program Kompetisi Kampus Merdeka telah menghasilkan <br />{' '}
                  pengaruh di beberapa Indikator Kinerja Utama dan juga luaran{' '}
                  <br /> yang dapat mendorong penerapan Merdeka Belajar Kampus
                  <br /> Merdeka
                </Typography>
                <div className="pt-6">
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                    }}>
                    <Grid item lg={4}>
                      <Typography
                        variant="h5"
                        className=""
                        sx={{fontWeight: 'bold'}}>
                        {achievements?.message.achievements[0].student}{' '}
                        Mahasiswa
                      </Typography>
                      <Typography variant="body1" className="pt-3">
                        Terlibat dalam kegiatan dan <br /> pengembangan
                      </Typography>
                    </Grid>
                    <Grid item lg={4}>
                      <Typography
                        variant="h5"
                        className=""
                        sx={{fontWeight: 'bold'}}>
                        {achievements?.message.achievements[0].lecturer} Dosen
                      </Typography>
                      <Typography variant="body1" className="pt-3">
                        Terlibat dalam kegiatan dan <br /> pengembangan
                      </Typography>
                    </Grid>
                    <Grid item lg={4}>
                      <Typography
                        variant="h5"
                        className=""
                        sx={{fontWeight: 'bold'}}>
                        {achievements?.message.achievements[0].partner} Mitra
                      </Typography>
                      <Typography variant="body1" className="pt-3">
                        Dunia usaha sebagai mitra <br /> kegiatan dan
                        pengembangan
                      </Typography>
                    </Grid>
                  </Grid>
                </div>
              </Grid>
              <Grid item lg={4}>
                <div className="navbar-end pr-6">
                  <figure className="image mt-2 pt-3 pr-3 pl-3 ">
                    <img
                      src={
                        achievements?.message.achievements[0].graph
                          ? API_URL +
                            achievements?.message.achievements[0].graph
                          : 'assets/Frame 2992.png'
                      }
                      alt="Image"
                    />
                  </figure>
                </div>
              </Grid>
            </Grid>
          </div>

          <Grid sx={{display: 'flex', flexWrap: 'wrap'}}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                '& > :not(style)': {
                  width: 50,
                  height: 50,
                },
              }}>
              <Paper elevation={0} sx={{backgroundColor: '#00000080'}}></Paper>
            </Box>
          </Grid>
          <Grid sx={{display: 'flex', flexWrap: 'wrap'}}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                '& > :not(style)': {
                  width: 50,
                  height: 50,
                },
              }}>
              <Paper elevation={0} sx={{backgroundColor: '#013E01'}}></Paper>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                '& > :not(style)': {
                  width: 50,
                  height: 50,
                },
              }}>
              <Paper elevation={0} sx={{backgroundColor: '#FFFFFF80'}}></Paper>
            </Box>
          </Grid>
        </div>

        <div className="berita p-6">
          <Grid container spacing={2}>
            <Grid item lg={8}>
              <Typography
                variant="h2"
                className="has-text-black"
                sx={{fontWeight: 'bold'}}>
                Berita
              </Typography>
              <Typography variant="h6" className="pt-4">
                Ikuti terus perkembangan dari kami melalui <br /> berita yang
                selalu up to date, ringan, dan <br /> yang pasti dapat menemani
                kamu kapanpun <br /> dan di manapun
              </Typography>
            </Grid>
            <Grid item lg={4}>
              <div className="navbar-end">
                <Button
                  variant="contained"
                  className="color-green py-3 px-6"
                  sx={{backgroundColor: '#013E01', fontWeight: 'bold'}}>
                  {' '}
                  Lihat semua berita
                </Button>
              </div>
            </Grid>
          </Grid>
        </div>

        <div className="sliderGallery pl-5 pb-6">
          <Grid
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
            }}>
            {articles?.message.articles.map(article => (
              <div
                className="gallery has-background-grey-lighter m-3"
                key={article._id}>
                <a target="_blank" href="img_5terre.jpg">
                  <img
                    src={API_URL + article.featuredImage}
                    alt={article.title}
                    width="300"
                    height="275"
                  />
                </a>
                <div className="desc p-4">
                  <Typography sx={{fontWeight: 'bold'}}>
                    {article.title}
                  </Typography>
                  <Typography className="pt-3">{article.summary}</Typography>
                </div>
              </div>
            ))}
          </Grid>
        </div>

        {/* Footer */}
        <div className="footer pl-6 has-text-white">
          <Grid container spacing={2}>
            <Grid item lg={5}>
              <Typography variant="h5" className="" sx={{fontWeight: 'bold'}}>
                Alamat
              </Typography>

              <Typography variant="body1" className="pt-5">
                Kampus Terpadu UMY
                <br />
                Jl. Brawijaya, Kasihan, Bantul, Yogyakarta 55183
              </Typography>

              <div className="pt-5">
                <IconButton>
                  <TwitterIcon className="has-text-white" sx={{fontSize: 30}} />
                </IconButton>
                <IconButton>
                  <FacebookIcon
                    className="has-text-white"
                    sx={{fontSize: 30}}
                  />
                </IconButton>
                <IconButton>
                  <YouTubeIcon className="has-text-white" sx={{fontSize: 30}} />
                </IconButton>
                <IconButton>
                  <InstagramIcon
                    className="has-text-white"
                    sx={{fontSize: 30}}
                  />
                </IconButton>
              </div>
            </Grid>

            <Grid item lg={7}>
              <Grid container spacing={3} className="navbar-end has-text-white">
                <Grid item lg={4} className="pl-6">
                  <Typography
                    variant="h5"
                    className="has-text-white"
                    sx={{fontWeight: 'bold'}}>
                    Pintasan
                  </Typography>
                  <a href="">
                    <Typography variant="body1" className="has-text-white pt-5">
                      Beranda
                    </Typography>
                  </a>
                  <a href="">
                    <Typography variant="body1" className="has-text-white pt-4">
                      Tentang
                    </Typography>
                  </a>
                  <a href="">
                    <Typography variant="body1" className="has-text-white pt-4">
                      Program Kampus Merdeka
                    </Typography>
                  </a>
                </Grid>

                <Grid item lg={4} className="pl-6">
                  <Typography
                    variant="h5"
                    className="has-text-white"
                    sx={{fontWeight: 'bold'}}>
                    Situs Terkait
                  </Typography>
                  <a href="">
                    <Typography variant="body1" className="has-text-white pt-5">
                      UMY
                    </Typography>
                  </a>
                  <a href="">
                    <Typography variant="body1" className="has-text-white pt-4">
                      Kemenristekdikti
                    </Typography>
                  </a>
                  <a href="">
                    <Typography variant="body1" className="has-text-white pt-4">
                      LRI UMY
                    </Typography>
                  </a>
                  <a href="">
                    <Typography variant="body1" className="has-text-white pt-4">
                      LPKA UMY
                    </Typography>
                  </a>
                </Grid>

                <Grid item lg={4} className="pl-6">
                  <Typography
                    variant="h5"
                    className="has-text-white"
                    sx={{fontWeight: 'bold'}}>
                    Informasi
                  </Typography>
                  <a href="">
                    <Typography variant="body1" className="has-text-white pt-5">
                      Bantuan
                    </Typography>
                  </a>
                  <a href="">
                    <Typography variant="body1" className="has-text-white pt-4">
                      FAQ
                    </Typography>
                  </a>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Typography variant="body1" className="has-text-white pt-6">
            &copy; 2022 Universitas Muhammadiyah Yogyakarta
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default StoreConnector(LandingPage);
