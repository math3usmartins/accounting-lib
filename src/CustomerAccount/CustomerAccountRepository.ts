import { type CustomerAccount } from "../CustomerAccount"
import { type CustomerAccountId } from "./CustomerAccountId"

export interface CustomerAccountRepository {
	getById: (CustomerAccountId: CustomerAccountId) => Promise<CustomerAccount>
}
