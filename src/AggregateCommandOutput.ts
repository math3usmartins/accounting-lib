export class AggregateCommandOutput<AggregateType, EventType> {
	constructor(
		public readonly aggregate: AggregateType,
		public readonly events: EventType[],
	) {}
}
