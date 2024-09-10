export default function YoutubeIDExtract(youtubeLink: string): string|null {
  try {
    const url = new URL(youtubeLink)
    const ytID = url.searchParams.get('v')
    let id: string|null = ''

    switch (url.host) {
      case 'www.youtube.com':
        if (!ytID) {
          id = null
        }

        id = ytID
        break

      case 'youtu.be':
        id = url.pathname.substring(1)
        break

      default:
    }

    return id
  } catch (err) {
    return youtubeLink
  }
}
