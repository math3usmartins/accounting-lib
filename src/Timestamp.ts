export class Timestamp {
	constructor(public readonly value: number) {}

	public isEqualTo = (another: Timestamp): boolean =>
		another.value === this.value

	public isEarlierThan = (another: Timestamp): boolean =>
		this.value < another.value
}
