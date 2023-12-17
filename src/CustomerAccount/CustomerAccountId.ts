export class CustomerAccountId {
	constructor(public readonly value: string) {}

	public isEqualTo = (another: CustomerAccountId): boolean =>
		this.value === another.value
}
