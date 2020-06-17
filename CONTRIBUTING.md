# Contributing Guide

Contributing to `checkmarx-github-action` is fairly easy. This document shows you how to
get the project, run all provided tests and generate a production-ready build.

It also covers provided grunt tasks that help you develop with `checkmarx-github-action`.

## Dependencies

To make sure that the following instructions work, please install the following dependencies
on you machine:

- Node.js (comes with a bundles npm)
- Git

## Installation

To get the source of `checkmarx-github-action`, clone the git repository via:

````
$ git clone https://github.com/checkmarx-ts/checkmarx-github-action
````

This will clone the complete source to your local machine. Navigate to the project folder
and install all needed dependencies via **npm**:

````
$ npm install
````

This commands installs everything which is required for building and testing the project.

## Dependencies Updates

In order to update the dependencies used by `checkmarx-github-action`, you need to run the following command:

````
$ npm update
````

## Testing

### Source linting: `npm run lint`
`npm run lint` performs a lint for all, also part of `test`.

### Unit testing: `npm run test`
`npm run test` executes the unit tests, which are located
in `tests`. The task uses **mocha** testing framework.

### Testing Coverage: `npm run cov`
`npm run cov` executes (as you might think) the coverage of unit tests, which are located
in `tests`. The task uses **nyc** test coverage framework.

## Contributing/Submitting changes

- Check out a new branch based on <code>master</code> and name it to what you intend to do:
  - Example:
    ````
    $ git checkout -b BRANCH_NAME origin/master
    ````
    If you get an error, you may need to fetch master first by using
    ````
    $ git remote update && git fetch
    ````
  - Use one branch per fix/feature
- Make your changes
  - Make sure to provide a spec for unit tests.
  - Run your tests
  - When all tests pass, everything's fine.
- Commit your changes
  - Please provide a git message that explains what you've done.
  - Commit to the forked repository.
- Make a pull request
  - Make sure you send the PR to the <code>master</code> branch.

If you follow these instructions, your PR will land pretty safely in the main repo!