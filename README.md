# AppScript
**TypeScript application scripts shared by different frameworks.**

## Installing

Using npm:

```bash
$ npm install @etsoo/appscript
```

Using yarn:

```bash
$ yarn add @etsoo/appscript
```

## Structure

### app - Application related

### bridges - Works with Electron

#### ElectronBridge.ts ####
-   AppRuntime - Action result to error type.

#### IAppData.ts ####
-   IAppData - App data interface.

#### IBridge.ts ####
-   IBridgeUnsubscribe - Bridge unsubscribe interface.
-   IBridgeListener - Bridge listener interface.
-   IBridge - Bridge interface.

### result - API action result

#### ActionResult.ts ####
-   ActionResult - API call action result extends IActionResult.

#### ActionResultError.ts ####
-   ActionResultError - Action result to error type.

#### IActionResult.ts ####
-   IResultData - Result data interface.
-   IdResultData - extends IResultData for 'id' included return data.
-   IResultErrors - Result errors interface.
-   IActionResult - Action result interface.

### state - State management

#### Language.ts ####
-   LanguageLabels - Language labels, indexable, for simple i18n solution.
-   ILanguage - extends IState for language state.

#### State.ts ####
-   IState - state interface.
-   IAction - state action interface.

#### User.ts ####
-   IUserData - User basic data.
-   IUser - extends IState for user state.