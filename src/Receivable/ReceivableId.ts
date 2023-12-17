export class ReceivableId {
	constructor(public readonly value: string) {}

	public equals = (another: ReceivableId): boolean =>
		this.value === another.value
}
