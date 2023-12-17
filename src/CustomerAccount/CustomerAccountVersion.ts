export class CustomerAccountVersion {
	constructor(public readonly value: number) {}

	public next = (): CustomerAccountVersion => new CustomerAccountVersion(this.value + 1)
}
