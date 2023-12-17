import { CustomerAccountRepository } from "../CustomerAccountRepository"
import { CustomerAccount } from "../../CustomerAccount"
import { CustomerAccountId } from "../CustomerAccountId"

export class InMemoryCustomerAccountRepository
	implements CustomerAccountRepository
{
	constructor(private items: CustomerAccount[]) {}

	public getById = (
		accountId: CustomerAccountId,
	): Promise<CustomerAccount> => {
		const account = this.items.find((account) =>
			account.id.isEqualTo(accountId),
		)

		return account === undefined
			? Promise.reject(`Customer account ${accountId.value} not found`)
			: Promise.resolve(account)
	}
}
