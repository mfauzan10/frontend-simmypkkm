import id from 'date-fns/locale/id';
import { formatInTimeZone } from 'date-fns-tz';

export const formatDateStrId = (
  date: string,
  format = 'dd/MM/yyyy HH:mm zzz'
) => {
  return formatInTimeZone(date, 'Asia/Jakarta', format, { locale: id });
};

export default formatDateStrId;
