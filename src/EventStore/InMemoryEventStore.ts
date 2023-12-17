import { type EventStore } from "../EventStore"

export class InMemoryEventStore<EventType> implements EventStore<EventType> {
	private currentPosition = 0

	constructor(private events: EventType[]) {}

	public async append(events: EventType[]): Promise<void> {
		this.events = [...this.events, ...events]

		await Promise.resolve()
	}

	public async flush(): Promise<number> {
		this.currentPosition += this.events.length

		return await Promise.resolve(this.currentPosition)
	}
}
