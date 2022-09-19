# Navigator Learner
This project was generated with [Ionic CLI](https://ionicframework.com/docs/cli) and ionic framework version 4.11.7.
## Prerequisites
* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Ionic](https://ionicframework.com/docs/cli),
* [Angular](https://cli.angular.io/),
* [Cordova](https://cordova.apache.org/docs/en/latest/guide/cli/),
* [Capacitor](https://capacitor.ionicframework.com/docs/getting-started/),
* [Android studio](https://developer.android.com/studio/install)
## Project Structure
This project follows the project structure suggested by Ionic CLI
## Browser Installation
* `git clone https://github.com/Gooru/navigator-mobile.git` this repository
* Install dependencies `yarn install` or `npm install`
* `ionic serve` to start the ionic project. Navigate to `http://localhost:8101/`
## Build in android
Run `ionic cordova platform add android` to add android platform and run `ionic cordova build android` to generate APK.
## Build in ios
Run `ionic cordova platform add ios` to add android platform and run `ionic cordova build ios` to generate APK.
## Further help
To get more help on the Ionic CLI use `ionic help` or go check out the [Ionic CLI README](https://github.com/ionic-team/ionic-cli/blob/develop/README.md).
# Navigator Guardian Shared Modules
To push the shared modules to new branch.

`git subtree push --prefix=src/app/shared/ https://github.com/Gooru/navigator-mobile.git BRANCH_NAME --squash` 
