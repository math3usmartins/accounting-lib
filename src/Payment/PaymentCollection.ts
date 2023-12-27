import * as E from "fp-ts/lib/Either"
import type { Payment } from "../Payment"
import { PaymentAlreadyFoundError } from "./Error/PaymentAlreadyFoundError"

export class PaymentCollection {
	constructor(private readonly _items: Payment[]) {}

	public items = (): Payment[] => this._items

	public contains(item: Payment): boolean {
		const alreadyExistingIndex = this._items.findIndex((v) =>
			v.id.isEqualTo(item.id),
		)

		return alreadyExistingIndex >= 0
	}

	public with = (
		payment: Payment,
	): E.Either<PaymentAlreadyFoundError, PaymentCollection> =>
		this.contains(payment)
			? E.left(new PaymentAlreadyFoundError(payment.id))
			: E.right(new PaymentCollection([...this._items, payment]))

	public total = (): number =>
		this._items.reduce(
			(sum: number, current: Payment) => sum + current.amount.cents,
			0,
		)
}
