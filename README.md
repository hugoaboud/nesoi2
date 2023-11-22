# Nesoi 2

`Nesoi` is a TypeScript declarative engine for modern API development.
It's framework agnostic, but has native support to AdonisJS.

## What does it do?

`Nesoi` has 2 main abstractions:
- `Resources`: Statecharts which read and write data to a given data source
- `Jobs`: Queuable methods with strong input validation

Both abstractions can be used to build simple and complex APIs, with very low boilerplate code.

This is achieved through the extensive use of the `Builder Pattern` along with strong typing, and a declarative syntax which makes the code be readrable somewhat like English.

## The Engine

The `Nesoi` engine has 2 main parts, which run separately:
- `Queue`: a process responsible for running methods from events stored in a queue
- `Controllers`: a set of entrypoints for events, which validate and queue methods
- `Views`: a set of schemas for returning data from the API

### Queue

After the controller validated/sanitized the event, the following happens:
- A `job_uuid` is created
- If it's a job, the job name is used as the `context`
    - Else, if it's a resource transition, the resource name is used as the `context`
- If it requires a transaction, a `trans_uuid` is created
- The data above, along with the event data, is put at the end of the queue
- The entry is marked as `queued`

When time comes, the queue reads this entry and the following happens:
- The event is sent to the context
- The validations marked as post-queue are run again
- The method is run with the event
- If it runs succesfully, it's marked as `done`
    - Else, if it fails, it's marked as `failed`
        - If it has a `trans_uuid`:
            - Mark all other jobs on the queue with the same `trans_uuid` as `halted`
            - Rollback this and all other jobs for the same transaction that already ran, and mark them as `rolled_back`

You can create a promise to listen for the completion of a Queue Job or a Queue Transaction.

- When a Job ends, it _might_ return some data.
    - This data is stored on the `job_logs` database.
- It's associated with both the `job_uuid` and `trans_uuid`, and the input event
