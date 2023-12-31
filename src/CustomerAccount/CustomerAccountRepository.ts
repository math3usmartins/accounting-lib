import { type TaskEither } from "fp-ts/lib/TaskEither"
import { type CustomerAccount } from "../CustomerAccount"
import { type CustomerAccountId } from "./CustomerAccountId"
import { type CustomerAccountEvent } from "./CustomerAccountEvent"

export interface CustomerAccountRepository {
	getById: (
		CustomerAccountId: CustomerAccountId,
	) => TaskEither<Error, CustomerAccount>

	append: (
		accountId: CustomerAccountId,
		events: CustomerAccountEvent[],
	) => TaskEither<Error, number>
}
