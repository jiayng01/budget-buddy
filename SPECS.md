# Project Specification: Personal Expense Tracker

## 1. Objective

Build a mobile-first personal finance tracking application from scratch. The app must allow me to record expenses, income and transfers, scan receipts using a free multimodal LLM, manage budgets and savings goals, and analyse my financial activity through interactive visualisations.

This is for personal use initially. Prioritise functional correctness, maintainability, data integrity and zero-cost development and operation within available free-tier limits.

## 2. Technical and Cost Constraints

- Use free and open-source tools wherever practical.
- Use the Gemini API with an eligible free-tier multimodal model for receipt image understanding and structured data extraction.
- Never expose the Gemini API key in frontend code. Store it in a backend environment variable.
- Do not introduce paid APIs, subscriptions or services.
- Do not use mock APIs, hardcoded sample transactions, placeholder calculations or dummy financial data.
- All dashboards, charts, totals, budgets and progress indicators must use actual persisted user data.
- Clearly document any free-tier limits or external service dependencies.
- Keep the implementation modular so that individual components can be tested and replaced independently.

Choose an appropriate mobile-first technology stack before implementation. Prefer React Native with Expo for a native mobile application, using Expo Router for navigation. If the chosen receipt-image handling, storage or charting requirements necessitate a different approach, explain the trade-off before changing the stack.

Use a database and storage design that supports persistent transactions and receipt-image references. Provide a practical local-first development workflow and a free-tier-compatible approach to cloud backup. Do not assume that a browser folder, mobile device folder and cloud storage are interchangeable.

## 3. Navigation and Main Screens

Implement the following primary screens:

1. Transactions
2. Goals
3. Analytics
4. Settings

Use a consistent mobile navigation layout. Keep the interface clean, readable and easy to operate on a phone.

## 4. Transactions

### 4.1 Transaction types

The Transactions screen must contain both outflows and inflows, including:

- Expenses and purchases
- Income and deposits
- Transfers between accounts, if account tracking is implemented

Each transaction must have an appropriate transaction type. Transfers must not be counted as income or expenditure in net cash flow when both sides of the transfer are recorded.

### 4.2 Transaction list

- Display transactions grouped by day.
- Default the date range to the current month.
- Support filtering by day, week, month and year, including past periods.
- Support filtering by category, transaction type (expense or deposit/income), and recurring status.
- Support searching by merchant, transaction description or item name where available.
- Allow sorting by date, amount and other useful fields.
- Clicking an existing transaction must open its editable transaction form, populated with its saved data.
- After saving, editing or deleting a transaction, update all affected screens and calculations immediately.

### 4.3 Adding a transaction

Provide two entry methods:

1. Scan or upload a receipt image.
2. Manually enter a transaction.

Both methods must lead to the same transaction form. The manual form starts blank or with sensible defaults; the receipt-scanning flow pre-fills recognised fields.

### 4.4 Transaction form

Common fields:
- Transaction type
- Merchant or recipient
- Transaction date and time, where available
- Description
- Category
- Total amount
- Currency, defaulting to SGD
- Recurring status, where applicable
- Notes, optional

The total amount must always be editable.

Include an optional itemised-details toggle. Its default state is OFF.

When OFF:
- Display the transaction's total amount as the main monetary input.
- Allow the user to edit the total directly.
- Do not require item or tax details.

When ON:
- Display an editable item list.
- Each item must support a name, quantity, unit price and calculated line total.
- Allow items to be added, edited and deleted.
- Display item subtotal, tax details and final total.
- Recalculate amounts whenever relevant fields change.

### 4.5 Tax handling

Allow users to configure a tax type, tax percentage and default tax settings.

- Default tax type: GST.
- Default GST rate: 9%.
- Allow the tax rate to be changed for individual transactions.
- Allow tax to be disabled or set to another type when appropriate.
- Include tax in the calculated final total.
- Clearly distinguish tax-exclusive and tax-inclusive prices to prevent double-counting.
- Validate quantities, percentages and monetary values.
- Use appropriate decimal arithmetic and rounding for currency calculations.

When a receipt is scanned, use the actual receipt totals and tax details where available. Do not automatically add 9% GST to a receipt total that already includes GST.

### 4.6 Saving and data integrity

- Validate required fields before saving.
- Persist the transaction before navigating away.
- Prevent accidental duplicate saves.
- Update the transaction list, budgets and analytics from the same source of truth.
- Ensure edits and deletions propagate to every relevant screen.
- Do not report success if persistence fails.

## 5. Receipt Scanning Using Gemini

### 5.1 Receipt image input

Allow users to capture a receipt using the device camera or upload an existing image.

- Show the actual selected or captured image, not a generic placeholder.
- Display the receipt image within the transaction form alongside the extracted fields.
- Provide a way to replace the image or remove it.
- Display loading, success and error states during processing.

### 5.2 AI processing

Use a free-tier-eligible Gemini multimodal model to process the receipt image directly.

Do not implement a separate OCR engine unless it becomes necessary as a fallback. The LLM should perform image understanding, text recognition, field extraction and initial expense categorisation.

Request structured JSON containing, where available:
- Merchant name
- Transaction date
- Currency
- Item names
- Quantities
- Unit prices
- Line totals
- Subtotal
- Tax type and tax amount
- Final amount payable
- Suggested expense category
- Any ambiguity or missing information

The backend must validate the model's response against a defined schema before passing it to the frontend.

### 5.3 Parsing rules

- Use the receipt's amount payable as the preferred final total when clearly identifiable.
- Distinguish subtotal, discounts, tax, amount paid and change.
- Do not treat every number on the receipt as an item price.
- Do not invent unreadable item names, dates, quantities or amounts.
- Leave uncertain fields blank or mark them as requiring review.
- Do not assume every receipt uses SGD or includes GST.
- Use the AI's suggested category as a default that the user can change.
- Handle malformed JSON, model errors, timeouts, rate limits and unavailable API access gracefully.

### 5.4 Review before saving

AI-extracted information must never be saved automatically without user confirmation.

After processing:
1. Show the receipt image.
2. Pre-fill the common transaction form.
3. Populate item and tax details when the itemised-details toggle is ON.
4. Allow the user to edit all extracted fields.
5. Require the user to confirm and save.

If Gemini is unavailable or extraction fails, allow manual entry without losing the selected receipt image.

### 5.5 Receipt storage

Support receipt-image persistence and backup.

- Store receipt images separately from transaction metadata.
- Store a reference to the image with the corresponding transaction.
- Allow the user to view the image later.
- Avoid embedding large image files directly in database records.
- Do not assume that saving an image in browser storage provides a permanent local file.

## 6. Goals: Budgets, Savings and Recurring Transactions

The Goals screen must be a single page without nested tabs.

### 6.1 Total budget

- Display the total budget prominently at the top.
- Provide an edit button.
- Support setting a total budget for a selected month.
- Show actual spending, remaining budget and percentage used.
- Support viewing budgets and progress for previous months.

### 6.2 Category budgets

- Allow optional budget allocations for individual expense categories.
- The sum of category budgets must not exceed the total budget.
- Prevent invalid allocations and explain validation errors.
- Show spending, remaining budget and percentage used for each category.
- Allow users to view progress by month.
- Reflect transaction additions, edits, deletions and category changes immediately.

Spending against the total budget must use all qualifying expenses, including expenses in categories without an individual budget.

### 6.3 Savings goals

Allow users to create and manage savings goals, including:
- Goal name
- Target amount
- Current saved amount
- Optional target date
- Progress percentage
- Remaining amount

Clearly distinguish manually tracked savings from savings calculated from actual account balances. Do not assume that unspent budget automatically equals money saved.

### 6.4 Recurring transactions

Provide a recurring status filter on the Transactions screen.

Support creating recurring income and expenses with:
- Amount and transaction type
- Category
- Frequency
- Start date
- Optional end date
- Next scheduled occurrence
- Active or paused status

Recurring schedules must be stored and editable. Do not silently create duplicate transactions when the app is reopened. If automatic generation requires a backend scheduler that is not available within the free-tier architecture, document this limitation and provide a reliable manual or app-triggered alternative.

## 7. Analytics

All analytics must be calculated from actual saved transactions.

### 7.1 Financial overview

Display:
- Total inflow
- Total outflow
- Net cash flow
- Spending by category
- Spending trends over time
- Budget utilisation
- Savings-goal progress where relevant

Net cash flow is calculated as qualifying inflows minus qualifying outflows, excluding internal transfers.

Use consistent terminology:
- Expenses become Outflow.
- Income becomes Inflow.
- Net cash flow = Inflow minus Outflow.

### 7.2 Interactive date ranges

- Allow users to select a date range or useful presets.
- Ensure all charts and totals reflect the selected range.
- Provide sensible default date ranges.
- Support historical comparisons where sufficient data exists.

### 7.3 Spending by category

Show a chart of spending by category for the selected period.

When a category is selected:
- Update the visualisation to highlight the selected category.
- Display the transactions contributing to that category's total.
- Allow the user to open a transaction and edit it.
- Ensure the chart and totals refresh after changes.

### 7.4 Spending trend

Provide a line chart comparing current-month spending with the previous month's spending.

- Align the two series by day of month.
- Show a reference line representing average monthly spending over the previous six completed months.
- Calculate the average using the same definition of spending for each month.
- Handle incomplete historical data and months with no transactions transparently.
- Allow users to select a point or period to inspect the corresponding transactions.

### 7.5 Interactive visualisations

Charts must respond to user interaction.

For example, selecting a month or bar should update related charts, totals and transaction lists to reflect the selection.

Changing the date range must update all relevant analytics consistently. Do not implement charts that merely look interactive but do not affect the underlying views.

### 7.6 Recommendations and warnings

Provide useful rule-based insights, including:
- Approaching or exceeded budget limits
- Categories with unusually high spending
- Changes in spending compared with previous months
- Savings-goal progress
- Significant changes in net cash flow

Base recommendations on actual transaction history and configured goals. Do not generate misleading warnings when there is insufficient data. Clearly distinguish calculated facts from AI-generated suggestions.

## 8. Settings

Provide settings for:
- Default currency, initially SGD
- Default tax type and rate, initially GST at 9%
- Default receipt-storage location
- Cloud-backup destination and status
- Data export and backup
- Relevant application preferences

Local storage and cloud backup must be implemented according to the actual platform's permissions and capabilities.

On mobile, use supported file-system and document-picker APIs. Do not claim that the app can freely write to an arbitrary local folder if the operating system does not permit it.

Clearly distinguish:
- The device-local receipt location
- The application's internal storage
- The cloud backup destination
- The database holding transaction metadata

Provide clear backup success and failure states. Never imply that data is backed up unless the operation succeeds.

## 9. Data Model and Consistency

Design a consistent data model for:
- Transactions
- Transaction line items
- Tax details
- Categories
- Monthly budgets and category allocations
- Savings goals
- Recurring transaction rules
- Receipt-image references
- Application settings

Use stable identifiers and appropriate relationships between records.

Use a single source of truth for financial data. Transactions must not be stored separately in each screen or maintained as independent dummy arrays.

Derived values, including totals, category spending, cash flow and budget progress, must be calculated consistently from persisted data.

Use appropriate database transactions or equivalent safeguards when saving related records such as a transaction and its line items.

## 10. Error Handling, Privacy and Security

- Keep API keys and credentials out of frontend code and source control.
- Validate incoming data on the backend.
- Avoid unnecessary collection or transmission of personal information.
- Explain that receipt images are sent to Gemini for processing.
- Do not log full receipt contents or sensitive financial data unnecessarily.
- Handle failed saves, network errors, unavailable services and invalid responses.
- Do not silently discard user input.
- Provide a way to export financial records and maintain a usable backup.
- Document the limitations of the chosen free services.

## 11. Testing and Acceptance Criteria

The app is not considered complete merely because the screens render.

Verify the following end-to-end scenarios:

1. Manually create an expense and confirm it appears in Transactions, Goals and Analytics wherever applicable.
2. Scan a real receipt and verify that Gemini returns extracted fields rather than dummy data.
3. Confirm that the receipt image appears in the transaction form.
4. Edit an AI-extracted amount or category and save it.
5. Confirm that the saved values persist after restarting the app.
6. Verify item quantities, prices, subtotal, tax and total calculations.
7. Verify that GST is not added twice when the receipt total already includes tax.
8. Create income and confirm that net cash flow updates correctly.
9. Record a transfer and confirm that it does not inflate income or expenditure.
10. Delete or edit a transaction and verify that all affected charts and budgets recalculate.
11. Verify date-range, category, transaction-type and recurring filters.
12. Verify category-budget validation and historical budget views.
13. Test receipt parsing failure and confirm that manual entry remains available.
14. Test cloud backup and restore if implemented.
15. Confirm that no dummy transactions, hardcoded financial totals or fake success messages remain.

Use automated tests where practical and provide a concise manual testing checklist.

## 12. Implementation Workflow

Build the application in milestones:

Milestone 1: Project setup, navigation and screen structure.

Milestone 2: Data model, persistence and manual transaction CRUD.

Milestone 3: Transaction itemisation, tax calculations and validation.

Milestone 4: Gemini receipt-image parsing and confirmation workflow.

Milestone 5: Budgets, category allocations, savings goals and recurring rules.

Milestone 6: Analytics, interactive charts and recommendations.

Milestone 7: Settings, receipt storage, export and cloud backup.

Milestone 8: Integration testing, bug fixes and documentation.

At the end of each milestone:
- Run the relevant tests.
- Verify that existing functionality still works.
- Summarise the files changed and features completed.
- List known issues and remaining work.
- Do not proceed if a critical failure prevents the current milestone from working.

Do not replace functioning features with placeholders to claim a milestone is complete.

## 13. Initial Instruction

Begin by proposing the technology stack, project structure, data model and milestone implementation plan.

Then implement Milestone 1 and verify that the application runs. Do not attempt to implement every feature in one large change.