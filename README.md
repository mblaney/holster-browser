Holster-browser provides shared React components for [Holster](https://github.com/mblaney/holster) applications. It handles authentication UI, settings, and the app bar, so that apps built on Holster don't need to reimplement this infrastructure.

### Install

```
npm install @mblaney/holster-browser
```

Peer dependencies: `@mblaney/holster`, `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, and `react`.

### Usage

```jsx
import {
  Login,
  Register,
  RequestCode,
  ValidateEmail,
  ResetPassword,
  UpdatePassword,
  Settings,
  LoginCodes,
  EditCache,
  SearchAppBar,
  registerServiceWorker,
  useAccountSync,
} from "@mblaney/holster-browser"
```

Components are designed to work with [holster-router](https://github.com/mblaney/holster-router) on the server side.

#### SearchAppBar

The app bar used across all pages. Pass an `appBar` identity object with `name`, `icon`, `iconSx`, and `menuItems` to configure the app's appearance and navigation.

```jsx
const appBar = {
  name: "myapp",
  icon: MyIcon,
  iconSx: theme => ({...theme.applyStyles("dark", {color: "red"})}),
  menuItems: [
    {label: "Home", onClick: () => (window.location = "/")},
    {label: "Settings", onClick: () => (window.location = "/settings")},
  ],
}

<SearchAppBar
  {...appBar}
  mode={mode}
  setMode={setMode}
  title="Current group"
  onTitleClick={handleTitleClick}
  onHomeClick={handleHomeClick}
  onSearch={handleSearch}
  searchQuery={searchQuery}
/>
```

#### Auth components

`Login`, `Register`, `RequestCode`, `ValidateEmail`, `ResetPassword`, and `UpdatePassword` all accept `user`, `mode`, `setMode`, and `appBar` props. They render a `SearchAppBar` only when the user is already logged in.

#### Settings

A base settings page with name greeting, password change, and logout. Pass app-specific content as `children`, which renders between the greeting and password cards.

```jsx
<Settings user={user} mode={mode} setMode={setMode} appBar={appBar} buildDate={buildDate}>
  <LoginCodes user={user} host={host} code={code} />
  {/* other app-specific settings */}
</Settings>
```

#### LoginCodes

Displays available login codes for sharing with new users. Returns null when no codes are available.

#### EditCache

Displays audio and video cache contents with options to remove individual items or clear a cache entirely.

#### useAccountSync

A hook that listens to the host accounts list and keeps the user's contacts in sync. When a contact's public key changes it re-shares any encrypted data under the new key, and adds new contacts automatically when they were referred by the current user.

```jsx
const accountsReady = useAccountSync(holster, user, host, code)
```

Returns a boolean that becomes `true` once the accounts list has been received for the first time.
