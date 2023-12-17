export interface EventStore<EventType> {
	append: (events: EventType[]) => Promise<void>
	flush: () => Promise<number>
}
