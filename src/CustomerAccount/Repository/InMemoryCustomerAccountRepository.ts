import { CustomerAccountRepository } from "../CustomerAccountRepository"
import { CustomerAccount } from "../../CustomerAccount"
import { CustomerAccountId } from "../CustomerAccountId"
import { CustomerAccountNotFoundError } from "./Error/CustomerAccountNotFoundError"
import { TaskEither as TTaskEither } from "fp-ts/lib/TaskEither"
import * as TaskEither from "fp-ts/lib/TaskEither"
import * as Option from "fp-ts/lib/Option"
import * as fp from "fp-ts/function"

export class InMemoryCustomerAccountRepository
	implements CustomerAccountRepository
{
	constructor(private items: CustomerAccount[]) {}

	public getById = (
		accountId: CustomerAccountId,
	): TTaskEither<CustomerAccountNotFoundError, CustomerAccount> =>
		fp.pipe(
			this.items.find((account) => account.id.isEqualTo(accountId)),
			Option.fromNullable,
			TaskEither.fromOption(() =>
				CustomerAccountNotFoundError.fromId(accountId),
			),
		)
}
