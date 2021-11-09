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

### address - Address (region) related

#### AddressContinent.ts ####
-   AddressContinent - Continent Enum

#### AddressRegion.ts ####
-   IAddressRegion - Country or region interface
-   AddressRegion - Address or region

#### AddressUtils.ts ####
-   getContinents - Get all continents
-   getRegion - Get region from regions and detected region and language

### app - Application related

#### AppSettings.ts ####
-   IAppSettings - App settings interface

#### CoreApp.ts ####
-   IDetectIPCallback - Detect IP callback interface
-   ICoreApp - Core application interface
-   CoreApp - Core application

#### ExternalSettings.ts ####
-   IExternalSettings - External settings items
-   IExternalSettingsHost - External settings host passed by external script

### bridges - Works with Electron

#### ElectronBridge.ts ####
-   AppRuntime - Action result to error type.

#### IAppData.ts ####
-   IAppData - App data interface.

#### IBridge.ts ####
-   IBridgeUnsubscribe - Bridge unsubscribe interface
-   IBridgeListener - Bridge listener interface
-   IBridge - Bridge interface

### business - Business logics

#### BusinessTax.ts ####
-   IBusinessTax - Business tax interface
-   BusinessTax - Business tax

#### BusinessUtils.ts ####
-   addIdLabelBlankItem - Add blank item to id/label data array
-   getUnitLabel - Get product unit's label
-   getUnits - Get all product units

#### ProductUnit.ts ####
-   ProductUnit - Product units enum

### dto - Data transfer object

#### IdDto.ts ####
-   IdDto - Dto with id field

#### IdLabelDto.ts ####
-   IdLabelDto - Dto with id and label field

#### UpdateDto.ts ####
-   UpdateDto - Dto with id and changedFields

### i18n - Multiple cultures

### result - API action result

#### ActionResult.ts ####
-   ActionResult - API call action result extends IActionResult

#### ActionResultError.ts ####
-   ActionResultError - Action result to error type.

#### IActionResult.ts ####
-   IResultData - Result data interface
-   IdResultData - extends IResultData for 'id' included return data
-   IResultErrors - Result errors interface
-   IActionResult - Action result interface
-   ActionResultId - Action result with id data

### state - State management

#### Culture.ts ####
-   ICulture - Culture resources state, simple i18n solution
-   ICultureGet - Culture get delegate

#### State.ts ####
-   IState - state interface.
-   IAction - state action interface

#### User.ts ####
-   IUserData - User basic data.
-   IUser - extends IState for user state