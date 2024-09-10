const leadingZero = (value: number): string => {
  const str = value.toString()

  if (str.length < 2) {
    return `0${str}`
  } else if (str.length === 2) {
    return str
  } else {
    return '00'
  }
}

export const timeToMinute = (time: string): number => {
  const [hourStr, minuteStr] = time.split(':')
  const hour = Number(hourStr)
  const minute = Number(minuteStr)

  return (hour * 60) + minute
}

export const minuteToTime = (time: number): string => {
  const hour = Math.floor(time / 60)
  const minute = time % 60

  return `${leadingZero(hour)}:${leadingZero(minute)}`
}
