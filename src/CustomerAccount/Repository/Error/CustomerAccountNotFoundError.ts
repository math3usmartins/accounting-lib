import { CustomerAccountId } from "../../CustomerAccountId"

export class CustomerAccountNotFoundError extends Error {
	public static fromId = (
		id: CustomerAccountId,
	): CustomerAccountNotFoundError =>
		new CustomerAccountNotFoundError(
			`Customer account ${id.value} not found`,
		)
}
