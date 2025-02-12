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

## Client data security framework

- CoreApp, constructor, reads deviceId from session storage
- restore, when deviceId is empty, try to restore from persisted storage, get the passphrase (encryption / decription) or remove all data keys
- initCall (everytime the application running), if passphrase is there, just return, otherwise read from serverside
- device updated will cause validataion failure. Please call initCall(undefined, true);

## Structure

### address - Address (region) related

#### AddressContinent.ts

- AddressContinent - Continent Enum

#### AddressRegion.ts

- IAddressRegion - Country or region interface
- AddressRegion - Address or region

#### AddressUtils.ts

- getRegion - Get region from regions and detected region and language

### app - Application related

#### AppSettings.ts

- IAppSettings - App settings interface

#### CoreApp.ts

- IDetectIPCallback - Detect IP callback interface
- ICoreApp - Core application interface
- CoreApp - Core application

#### ExternalSettings.ts

- IExternalSettings - External settings items

#### UserRole.ts

- Standard user roles

### bridges - Works with Electron

#### BridgeUtils.ts

- BridgeUtils - Bridge utils

#### FlutterHost.ts

- FlutterHost - Flutter JavaScript Host

#### IBridgeHost.ts

- IBridgeHost - Bridge host interface

### business - Business logics

#### BusinessTax.ts

- IBusinessTax - Business tax interface
- BusinessTax - Business tax

#### BusinessUtils.ts

- getCurrencies - Get currency collection
- getEntityStatusLabel - Get entity status's label
- getEntityStatus - Get entity status collection
- getUnitLabel - Get product unit's label
- getUnits - Get all product units
- getRepeatOptions - Get all repeat options

#### EntityStatus.ts

- EntityStatus - Standard entity status enum

#### ProductUnit.ts

- ProductUnit - Product units enum

#### RepeatOption.ts

- RepeatOption - Repeat options

### custom - Custom dynamic component rendering

#### CustomFieldData.ts

- CustomFieldSpace - Custom field space (12 columns)
- CustomFieldData - Custom field data

### def - Type definition

#### ListItem.ts

- ListItem - List item definition

### i18n - Multiple cultures

### result - API action result

#### ActionResult.ts

- ActionResult - API call action result extends IActionResult

#### ActionResultError.ts

- ActionResultError - Action result to error type

#### IActionResult.ts

- IResultData - Result data interface
- IdResultData - extends IResultData for 'id' included return data
- IResultErrors - Result errors interface
- IActionResult - Action result interface
- ActionResultId - Action result with id data

#### InitCallResultData.ts

- InitCallResultData - Init call result data
- InitCallResult - Init call result

### erp - SmartERP APIs

### state - State management

#### Culture.ts

- ICulture - Culture resources state, simple i18n solution
- ICultureGet - Culture get delegate

#### State.ts

- IState - state interface.
- IAction - state action interface

#### User.ts

- IUserData - User basic data.
- IUser - extends IState for user state
