export default interface TimelineEventsInterface {
  _id: string;
  createdAt: string;
  description: string;
  finishedAt: string;
  startedAt: string;
  status: string;
  stepIndex: number;
  timeline: string;
  title: string;
}
