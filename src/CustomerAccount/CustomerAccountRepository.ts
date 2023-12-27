import { type TaskEither } from "fp-ts/lib/TaskEither"
import { type CustomerAccount } from "../CustomerAccount"
import { type CustomerAccountId } from "./CustomerAccountId"

export interface CustomerAccountRepository {
	getById: (
		CustomerAccountId: CustomerAccountId,
	) => TaskEither<Error, CustomerAccount>
}
