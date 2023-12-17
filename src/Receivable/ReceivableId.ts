export class ReceivableId {
	constructor(public readonly value: string) {}

	public isEqualTo = (another: ReceivableId): boolean =>
		this.value === another.value
}
