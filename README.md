#  Debugger 🐞
An application that consumes events from a Redis service, and displays them in a React UI.

## 🏗️. Architecture overview
This application is built with a Node.js server. This server connects to and receives messages from a Redis channel via a Node.js Redis client. The server then propagates these messages to a connected client via a Socket.IO socket.

The client is built with React, leveraging the [Evergreen React UI Framework](https://github.com/segmentio/evergreen/blob/master/README.md), created by [Segment](https://segment.com/). It connects to the server via a socket and displays the events it receives in the UI. It emits pause and resume messages to the server to control the stream. It filters existing and incoming events given a search term, without requesting anything from the server.

#### Scaling
In order to scale the application to handle multiple thousands of events per second, the UI does not refresh every time an event is received. Instead, the incoming events are stored in a cache array and the UI is refreshed in batches.

This array of events is attached to the React component instance which displays the events, but it is not part of its state. Because the array of events is not in the component state, React will not automatically re-render the application every time a new event is received. Instead, when an event is received, we set the component to re-render at the next repaint by using `window.requestAnimationFrame()`. If a previous event has already caused this function to be called, we do not call it again. These events are 'batched' together and will be rendered on the next repaint.

Client and server unit tests are built with the Jest testing framework. Enzyme is used to test the React components.

## 💻  Run tests & run the project

After cloning or downloading the project...

### `make test`

Installs dependencies and runs tests.

### `make run`

Builds and starts the application, in production mode. Also starts the included docker image.

### `npm test`
Runs tests.

### `npm start`
Builds and starts the application, in production mode, without starting the docker container.

### `npm dev`
Starts the application, in production mode, without starting the docker container.

## ⏳  Time spent on each task
- Initial project set-up (eslint, babel, webpack, prod env, dev env) - **1 hour**
- Redis -> Node.js communication - **2 hours**
- Server -> Client communication with Socket.io - **3 hours**
- UI event stream behaviour & performance - **5 hours**
- UI layout - **3 hours**
- Pause/resume buttons - **1 hour**
- Search capability - **1 hour**
- UI error handling & fault tolerance - **2 hours**
- Server error handling & fault tolerance - **2 hours**
- Documentation - **2 hours**

Total: **22 hours**

## 😬  Assumptions
- Built with one client in mind. In the current implementation multiple clients can connect, but the stream controls pause & resume the stream for all clients connected to the server.
- Events do not contain any sensitive information.
- Search is not case-sensitive.
- Search will only search the event data being displayed in the UI.
- Search will not filter based on the `sentAt` timestamp or it's corresponding human-readable date. This assumption is based on the real Segment debugger.
- No event retention on page refresh or client disconnection.

## Proposal for "production" state
### More tests!
**End-to-end testing with Cypress.io:** To achieve production readiness, and for continued monitoring and maintenance in production, an end-to-end testing framework such as Cypress.io could be used. With Cypress, we could run the same test cases as in the existing unit tests, except they would be performed in a real browser with simulated actions that more closely mirror real user behavior.

**Mutation testing:** In order to test the effectiveness of tests and get a more realistic sense of the project's test coverage, mutation testing could be added to the project. With a mutator tool like [Stryker](https://stryker-mutator.io/) the effectiveness of tests could be measured by introducing 'mutations' in the source code, to see if the tests actually catch these bugs.

**Canary testing:** In production, to monitor the health of the application, we could run a service that intermittently simulates a user that connects to the application and tries to use it in some predictable way. For example, the test user would try to pause, resume, filter, and look through the pages of events. A continuous integration tool such as TeamCity could be used to run a test like this.

### Metrics
We could monitor the server in production to see how many events it receives from Redis, log when Redis is unavailable, when clients connect, and when they disconnect. On the client side we could monitor how the application is being used, browser latency, and any client side errors. These metrics would help us to better understand how the application is being used and inform us about abnormal behavior.
