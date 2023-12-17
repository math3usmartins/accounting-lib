import assert from "assert"
import "mocha"
import { Timestamp } from "./Timestamp"

describe("Timestamp", (): void => {
	interface Scenario {
		name: string
		a: Timestamp
		b: Timestamp
		expected: boolean
	}

	const isEqualToScenarios = [
		{
			name: "same values",
			a: new Timestamp(1),
			b: new Timestamp(1),
			expected: true,
		},
		{
			name: "different values",
			a: new Timestamp(1),
			b: new Timestamp(2),
			expected: false,
		},
	]

	isEqualToScenarios.forEach((scenario: Scenario) => {
		it(`isEqualTo: ${scenario.name}`, (): void => {
			const actual = scenario.a.isEqualTo(scenario.b)
			assert.equal(actual, scenario.expected)
		})
	})

	const isEarlierThanScenarios = [
		{
			name: "same values",
			a: new Timestamp(1),
			b: new Timestamp(1),
			expected: false,
		},
		{
			name: "earlier",
			a: new Timestamp(1),
			b: new Timestamp(2),
			expected: true,
		},
		{
			name: "not earlier",
			a: new Timestamp(2),
			b: new Timestamp(1),
			expected: false,
		},
	]

	isEarlierThanScenarios.forEach((scenario: Scenario) => {
		it(`isEarlierThan: ${scenario.name}`, (): void => {
			const actual = scenario.a.isEarlierThan(scenario.b)
			assert.equal(actual, scenario.expected)
		})
	})
})
