import { type Currency } from "./Currency"

export class Money {
	constructor(
		public readonly currency: Currency,
		public readonly cents: number,
	) {}

	public add = (cents: number): Money =>
		new Money(this.currency, this.cents + cents)

	public subtract = (cents: number): Money =>
		new Money(this.currency, this.cents - cents)

	public deductible(another: Money): Money {
		if (another.currency !== this.currency) {
			return this.zero()
		}

		const cap = Math.min(this.cents, another.cents)

		return new Money(this.currency, cap)
	}

	public zero(): Money {
		return new Money(this.currency, 0)
	}
}
