export class PaymentId {
	constructor(public readonly value: string) {}

	public isEqualTo = (another: PaymentId): boolean =>
		this.value === another.value
}
