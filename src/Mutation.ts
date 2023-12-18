export class Mutation<MutantType, EventType> {
	constructor(
		public readonly mutant: MutantType,
		public readonly events: EventType[],
	) {}
}
