# Base Nuxt Layer
[![E2E Tests](https://github.com/NisuSan/base-nuxt-layer/actions/workflows/e2e.js.yml/badge.svg)](https://github.com/NisuSan/base-nuxt-layer/actions/workflows/e2e.js.yml)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://github.com/NisuSan/base-nuxt-layer/actions/workflows/code_quality.js.yml)

The **Base Nuxt Layer** is a foundational setup designed to enhance development efficiency for Nuxt.js applications. It provides a structured architecture, pre-configured modules, and utilities to streamline common development tasks, making it easier to focus on building features rather than setting up boilerplate code.

## Key Features

- **Modular Design**: Includes pre-built modules for API generation, theme management icons integration and so on.
- **Theme System**: Supports light and dark themes with customizable styles via SCSS and Tailwind CSS.
- **API Generation**: Automates the creation of composables for server-side endpoints, ensuring type-safe API calls.
- **Pisma ORM**: Ready to use Prisma setup with predefined User related tables.
- **Docker**: Ready to use setup for local databases like `pgsql` and `mysql`.
- **Icons Engine**: Simplifies icon usage with Iconify and `unplugin-icons` for dynamic imports.
- **Components and Composables**: Provides reusable components and handy composables.

## Use Cases
This layer is best suited for developers who:

- Want a robust starting point for Nuxt.js projects.
- Need type-safe and automated API integration.
- Require consistent theming across light and dark modes.
- Seek a pre-configured testing environment.
- Prefer modular and scalable project setups.

By leveraging this base layer, developers can save time and reduce the complexity of initial project setup, focusing on delivering high-quality features efficiently.

## Installation
Setting up this layer is straightforward by connecting it directly from the Git repository.

1. **Add the Layer**: Extend the layer in `nuxt.config.ts` by adding it from GitHub:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    ['github:nisusan/base-nuxt-layer', { install: true }]
  ]
});
```

2. **Install Sass-Embedded**: Required for project styling.

```css
pnpm add -D sass-embedded
```

3. **Prepare the Nuxt Layer**: Set up the layer with the following command:

```css
nuxt prepare
```

4. **Configure app.vue**: Wrap your application with the `NaiveUIWrapper` component:

```vue
<template>
  <NaiveUIWrapper>
    <NuxtPage />
  </NaiveUIWrapper>
</template>
```

## Modules

### Expose Module
It serves as a utility to generate and expose predefined folders, files, and configurations for seamless project setup. This module provides options to create a consistent environment by exposing theme, Prisma, and Docker configurations based on project requirements.\

The module dynamically generates:
 - Theme-related folders and files.
 - Prisma configurations.
 - Docker setup for development.

#### Module Options
The following options can be configured in the `baseLayerExpose: Recprd<string, unknown>` module:
 - `exposeTheme: boolean`: creates a `theme` folder in the root directory, containing predefined theme configurations. Default: `true`
 - `exposePrisma: boolean`: creates a `prisma` folder in the root directory, including a base schema and necessary configuration files. Default: `false`
 - `exposeDocker: object | boolean`: creates a `docker` folder in the root directory for development purposes. Default: `false`.  Accepts the following sub-options:
   - `name`: Specifies the name of the Docker container. Default is `'auto'`.
   - `databases`: Configures supported database services (e.g., PostgreSQL, MySQL). Default is `['pgsql', 'mysql']`.
   - `writeEnv`: Writes necessary environment variables to `.env` and `.env.example` files. Default is `true`.

#### Example Configuration
Below is an example of how to configure the module in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  baseLayerExpose: {
    exposeTheme: true,
    exposePrisma: true,
    exposeDocker: {
      name: 'my-app-container',
      databases: ['pgsql'],
      writeEnv: true,
    },
  },
});
```

#### Generated Outputs
The module generates the following outputs based on the configuration:
 - `app/theme/`: theme configuration files for managing application styles.
 - `prisma/`: base schema for Prisma, seed and instance files for database initialization and shared client usage.
 - `docker/`: `Dockerfile`, `docker-compose.yml`, `.env` and `.env.example`

> [!NOTE]
> We will examine each of the mentioned options in detail in the following paragraphs. 

### API Generation Module
It simplifies API calls by automatically generating composables from files in the `server/api` directory. Instead of using `useFetch` with string routes, you can use a generated composable like `api().auth.login({ login, password })`. It ensures type safety through `ts-morph`, which infers input and output types.

#### API File Requirements:
- Place all API endpoint files in the `server/api` directory.
- Use snake_case or a single word to represent HTTP methods in filenames (e.g., `login.post.ts` for POST, `users.get.ts` for GET).
- Include a `QueryArgs` type in each file to define input. If omitted, an empty object `{}` is assumed.
- Nested folders in the `api` directory are supported and will map to nested objects in the generated composable.

#### Usage Example:

**API Directory Structure:**
```css
/server
 └── /api
      └── /auth
          └── login.get.ts
          └── signup.post.ts
```

**Sample API File Content (login.post.ts):**
```typescript
export default defineEventHandler<_, { login: string, password: string }>(async (event) => {
  return {
    name: 'User 1',
    role: 'admin',
    privileges: [1, 2, 3, 4, 5, 6],
  };
});
```

**Usage in a Vue Component:**
```typescript
const info = api().auth.login({ login, password });
// info is type AsyncData<{ name: string; role: string; privileges: number[] }, Error>

// or
const info = api().auth.loginAsync({ login, password });
// info is type { name: string; role: string; privileges: number[] }
```

> [!TIP]
>  Use `async` if you need to await the response; otherwise, use the synchronous method.

---

#### useNonSSRFetch Composable
The composable is a utility designed to facilitate client-side-only data fetching. It ensures that fetch operations are executed exclusively in the browser, avoiding potential conflicts with server-side rendering (SSR). This composable supports various configurations, enabling flexibility for dynamic data retrieval through reactive inputs and customizable options.

**Parameters:**
- `input (string | Ref<string> | () => string)`:  
  Specifies the endpoint for the fetch request. Accepted formats include:
  - A static string representing the URL (e.g., `"https://example.com"`).
  - A reactive `Ref` object containing the URL as its value.
  - A function that dynamically generates and returns the URL as a string.

- `options (UseNonSSRFetchOptions<T>)`:  
  An optional configuration object that includes:
  - `query (Record<string, unknown>)`: An object defining query parameters to append to the URL.
  - `body (Record<string, unknown> | BodyInit | null)`: The request payload, suitable for methods like `POST` or `PUT`.
  - `headers (Record<string, string>)`: Custom HTTP headers to include in the request.
  - `method (string)`: The HTTP method to use (default: `"GET"`).
  - `transform ((input: unknown) => T`): A function to process and transform the response data before storing it in the `data` property.
  - `default (() => T)`: A function providing default data to initialize the `data` property while awaiting a response.
  - `immediate (boolean)`: Determines whether the fetch operation should execute immediately upon initialization (default: `true`).
  - `watch** (WatchSource<unknown> | WatchSource<unknown>[])`: A reactive dependency or array of dependencies that trigger the fetch operation when they change.

**Returns:**
An object containing the following reactive properties and methods:
- `data (Ref<T | null>)`: A reactive reference to the fetched data or the default value.
- `error (Ref<Error | null>)`: A reactive reference to an error object if the fetch operation fails.
- `isFetching (Ref<boolean>)`: A reactive boolean indicating whether the fetch operation is currently in progress.
- `execute (() => Promise<void>)`: A method to manually trigger the fetch operation.
- `refresh (() => Promise<void>)`: An alias for `execute`, providing semantic clarity for refreshing the data.

```vue
<template>
  <div>
    <p v-if="isFetching">Fetching data...</p>
    <p v-else-if="error">Error: {{ error.message }}</p>
    <p v-else>Data: {{ data }}</p>
    <button @click="refresh">Refresh</button>
  </div>
</template>

<script setup lang="ts">
import { useNonSSRFetch } from '@/composables';

const { data, error, isFetching, refresh } = useNonSSRFetch('https://api.example.com/data', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' },
  transform: (response) => response.items,
  default: () => [],
});
</script>
```

### Theme Module

The theme module provides a flexible, organized approach to managing application themes. It includes the following files:
- `theme.colors.css`: Defines CSS variables for themes (e.g., light and dark).
- `theme.utils.scss`: Contains SCSS utilities such as mixins and functions.
- `tw.base.css`: Configures TailwindCSS.
- `theme.scss`: Defines global styles for buttons, inputs, and other UI components.

> [!IMPORTANT]
> Tailwind 4 is using inside the projet

#### CSS Themes (theme.colors.css)
Define color variables for themes. For example:

```css
/* Light Theme */
[theme='light'] {
  --background-color: #ffffff;
  --text-color: #000000;
  --main-brand: #3498db;
}

/* Dark Theme */
[theme='dark'] {
  --background-color: #1e1e1e;
  --text-color: #f0f0f0;
  --main-brand: #2980b9;
}
```

#### SCSS Utilities (theme.utils.scss)
- **`themed` Mixin**: Apply theme-specific styles to selectors.

```scss
@mixin themed($selector, $theme) { }

// Example:
@include themed('.button', 'light') {
  background-color: var(--main-brand);
}
```

- **`ch` Function**: Conditional color values based on active themes.

```scss
@function ch($light, $dark) { }

// Example:
.button {
  color: ch(#000000, #ffffff);
}
```

#### theme.scss
This file contains global styles for reusable UI components such as buttons, inputs, and other elements.

#### useTheme Composable
A composable for managing and toggling themes, specifically designed to integrate with Naive UI for theme-based styling overrides. It offers a flexible setup for controlling themes within a Nuxt 3 application, with built-in support for dark and light modes.

**Parameters**
- `options (ptional)`: An object containing:
  - `naiveUIStyles`: An object of type `GlobalThemeOverrides` for custom Naive UI style overrides.

**Returns**
- `toggleTheme`: Toggles between light and dark themes.
- `setTheme`: Sets a specific theme by name.
- `themeName`: Current theme name.
- `nextThemeName`: Next theme name.
- `themeUI`: Computed object of predefined and custom styles for Naive UI.

```vue
<template>
  <n-config-provider :theme-overrides="themeUI">
    <!-- app content -->
  </n-config-provider>
</template>

<script setup lang="ts">
const styles = {};
const { themeUI } = useTheme({ naiveUIStyles: styles });
</script>
```

---

#### useColorChooser Composable
A utility composable for dynamically selecting colors based on the active theme. Designed to support applications with multiple themes (e.g., light, dark) and provides a reactive way to resolve theme-specific colors.

**Parameters**
The returned function accepts:
- `light (string | Layer.Color)`: The color to use in the light theme.
- `dark (string | Layer.Color)`: The color to use in the dark theme.
- `<some_theme> (string | Layer.Color)`: The color to use in a custom theme.

**Returns**
A function with the following signature:
- `(light: Layer.Color, dark: Layer.Color) => ComputedRef<string>`
- `(light: string, dark: Layer.Color) => ComputedRef<string>`
- `(light: Layer.Color, dark: string) => ComputedRef<string>`
- `(light: string, dark: string) => ComputedRef<string>`

```vue
<template>
  <div :style="{ color: textColor.value }">Dynamic Theme Color</div>
</template>

<script setup lang="ts">
const chooseColor = useColorChooser();

// Example with string values
const textColor = chooseColor('#ffffff', '#000000');

// Example with Layer.Color values
const backgroundColor = chooseColor('primary', 'primary-disabled');
</script>
```

---

#### colors Utility Function
A utility function to dynamically resolve color values based on either direct color codes (e.g., `#hex`, `rgb(...)`) or CSS custom properties (e.g., `--variable-name`).

**Parameters:**
- `name`: The name of the color. This can either be:
  - A valid CSS color value (e.g., `#ffffff`, `rgb(255, 255, 255)`).
  - A string referring to a CSS custom property (e.g., `primary`, `secondary`).

**Returns:**
- `string`: The resolved color value as a valid CSS color string. Throws an error if the color is not found.

```typescript
import { colors } from '@/utils';
import { Layer } from '@/constants';

// Example 1: Resolving a direct color code
const whiteColor = colors('#ffffff');
console.log(whiteColor); // Output: '#ffffff'

// Example 2: Resolving a color from CSS custom properties
document.documentElement.style.setProperty('--primary', '#505690');
const primaryColor = colors('primary');
console.log(primaryColor); // Output: '#505690'
```

> [!CAUTION]
> An error is thrown if the color is not found.

---

#### useThemeNames Composable
A simple composable that returns an array of available theme names for the application. Useful for dynamically managing or displaying theme options.

**Returns:**
- `string[]`: An array of theme names as strings.

```typescript
const themeNames = useThemeNames();

console.log(themeNames); 
// Output: ["light", "dark"]
```

### Auth Module
Provides a comprehensive solution for managing authentication in the application. It includes client-side utilities, server-side middleware, and API endpoints to handle common authentication tasks such as login, signup, signout, and session validation.

#### Components and Files

 - `/app/pages/auth.vue`: handles the user interface for authentication, such as login and signup forms. It is the primary entry point for user interactions related to authentication.
   - Displays forms for user login and signup.
   - Validates user input before submission.
   - Integrates with the `useAuth` composable for API calls.

 - `/app/composables/useAuth.ts`: manages authentication logic on the client side, providing reactive methods and properties for seamless integration into components.
   - `login(credentials: Layer.SignIn)`: Handles user login and manages session storage.
   - `signup(userInfo: Layer.SignUp)`: Calls the signup API to create a new user.
   - `logout()`: Clears user session and redirects to the login page.
   - Reactive properties like `isAuthenticated` and `user` for tracking authentication state.

 - `/app/middleware/auth.global.ts`: a global middleware file that ensures authentication is enforced for protected routes.
   - Redirects unauthenticated users to the login page.
   - Validates the user session before allowing access to protected pages.

 - `/server/api/auth/signup.post.ts`: an API endpoint for user signup, designed to handle new user registration.
   - Accepts a `POST` request with `Layer.SignUp` payload.
   - Validates input and stores hashed passwords in the database.
   - Returns a success message or an error response.

 - `/server/api/auth/signin.post.ts`: an API endpoint for user login, designed to authenticate existing users.
   - Accepts a `POST` request with `Layer.SignIn` payload.
   - Validates user credentials and returns a session token on success.

 - `/server/api/auth/signout.post.ts`: an API endpoint for user logout, designed to invalidate user sessions.
   - Accepts a `POST` request to log out the user.
   - Clears session tokens and returns a confirmation message.

 - `/server/api/auth/session.get.ts`: an API endpoint for validating user sessions.
   - Accepts a `GET` request to check the validity of a session token.
   - Returns user information if the session is valid.

 - `/server/middleware/authServer.ts`: server-side middleware for validating user sessions and handling authentication logic.
   - Checks for valid session tokens in incoming requests.
   - Attaches user information to the request object for use in downstream handlers.
   - Returns a `401 Unauthorized` response if the session is invalid.

 - `/server/utils/auth.ts`: utility functions for server-side authentication tasks, such as token generation and validation.
   - `generateToken(user: Layer.User)`: Creates a secure token for the user session.
   - `validateToken(token: string)`: Verifies the authenticity and validity of a session token.
   - `hashPassword(password: string)`: Hashes passwords for secure storage.
   - `comparePasswords(inputPassword: string, hashedPassword: string)`: Compares user input with the stored hash.

#### Nuxt Config Options

 - `runtimeConfig.baseLayer.auth`: private runtime configuration for authentication, intended for server-side use only.
   - `jwtSecret`: A secret key for signing JWTs. Default: `'local_value_should_be_overridden_with_env_var_1'`.
   - `signupKind`: Defines the signup behavior or strategy. Default: `'base'`.
   - `sesionPrivateKey`: A private key for session encryption. Default: `'local_value_should_be_overridden_with_env_var_2'`.

 - `runtimeConfig.public.baseLayer.auth`: public runtime configuration for authentication, accessible on both client and server.
   - `enabled`: Enables or disables authentication. Default: `false`.
   - `jwtExpiresIn`: Expiration time for JWTs (in seconds). Default: `60 * 60 * 24` (1 day).
   - `unprotectedRoutes`: A list of routes that bypass authentication. Default: `['auth']`.
   - `fallbackRoute`: The route to redirect unauthenticated users. Default: `'/auth'`.

#### Workflow

1. **Signup**:
   - User fills out the signup form in `/app/pages/auth.vue`.
   - The `signUp` method in `useAuth` sends a `POST` request to `/server/api/auth/signup.post.ts`.
   - The API endpoint validates the input, hashes the password, and stores user data.

2. **Signin**:
   - User enters credentials on the login form.
   - The `signIn` method in `useAuth` sends a request to `/server/api/auth/signin.post.ts`.
   - On success, a token is stored in the client session.

3. **Signout**:
   - The `signOut` method in `useAuth` sends a request to `/server/api/auth/signout.post.ts`.
   - The session token is invalidated.

4. **Protected Routes**:
   - `auth.global.ts` middleware ensures the user is authenticated before accessing protected pages.
   - `authServer.ts` middleware validates session tokens on server-side requests.

5. **Session Validation**:
   - The client or server can call `/server/api/auth/session.get.ts` to validate the session and retrieve user details.

**Example**
```typescript
const { signIn, isAuthenticated, user } = useAuth();

await signIn({ login: 'john', password: 'password123' });

if (isAuthenticated.value) {
  console.log(`Welcome, ${user.value.name}`);
}
```

## Features

### Icons Engine
Provides streamlined icon usage with **[Iconify](https://icon-sets.iconify.design/)** and `unplugin-icons`, automatically downloading and importing icons based on usage.

```vue
<template>
  <i-mdi-home />
</template>
```

#### Icon Naming Convention:
For auto-installing and importing, `unplugin-icons` requires a prefix `i` for every icon name:
- `mdi-home` becomes `<i-mdi-home />` or `<IMdiHome />`.
- `fa-solid:star` becomes `<i-fa-solid-star />` or `<IFaSolidStar />`.

### Components

#### c-form Component
A wrapper for organizing input elements and managing validation details.

**Key Features:**
- Validation Feedback: Exposes `formErrors` and `status` through `v-slot`.
- Centralizes error handling and validation state.

```vue
<c-form v-slot="{ formErrors, status }">
    <c-input type="string" validation="string-cyrillic"/>
    <c-input type="string" validation="string-cyrillic"/>
    <c-input type="string" validation="string-cyrillic"/>
</c-form>
```

---

#### c-input Component
A versatile input component supporting multiple types and validation rules.

**Supported Types:**
- `string`
- `number`
- `checkbox`
- `dropdown`
- `date`
- `datetime`

**Supported Validators:**
- `string`
- `number`
- `string-cyrillic`
- `string-latin`
- `number-positive`
- `Custom` **[Joi](https://joi.dev/api/)** validation rules.

```vue
<c-input type="string" validation="string-cyrillic" />
<c-input type="number" validation="number-positive" />
<c-input type="date" />
```

---

#### NaiveUIWrapper Component
A wrapper for the `n-config-provider` from Naive UI. Provides centralized setup for localization, theme overrides, and dialog management.

**Props**
- `locale (optional)`: Locale settings, defaulting to `ukUA`.
- `dateLocale (optional)`: Date locale settings, defaulting to `ukUA`.
- `theme (optional)`: Theme overrides, defaulting to the theme from `useTheme`.
- `ssrLoadingBarColor (optional)`: Color for the SSR loading spinner, defaulting to `#6067B1`.

```vue
<NaiveUIWrapper :locale="locale" :date-locale="dateLocale" :theme="customTheme" :ssrLoadingBarColor="'#FF5733'">
  <YourComponent />
</NaiveUIWrapper>
```

### Helper Composables - Client

#### useControlTabs
It simplifies the management of tab-based navigation within a Nuxt application. It enables reactive tab states synchronized with the route query parameters and provides utility methods for tab-related logic.

**Parameters**
 - `defaultTab: string`: Specifies the default tab to activate if no `tab` query parameter is present.
 - `executableFunction: Record<string, () => void> (optional)`: a record of tab names mapped to callback functions. The corresponding function is executed when its tab becomes active.

**Returns**
- `activeTab: Ref<string>`: a reactive reference representing the currently active tab. The value is synchronized with the `tab` query parameter in the URL.
- `onTabChange: () => void`: updates the route query to reflect the current `activeTab` value. Executes the corresponding function from `executableFunction` if defined.
- `whenQuery: (val: string) => boolean`: checks if the current `tab` query parameter matches the given value.
- `whenParam: (val: string) => boolean`: checks if the current `tab` in the route parameters matches the given value.

```typescript
import { useControlTabs } from '@/composables/useControlTabs';

const tabActions = {
  home: () => console.log('Home tab activated'),
  settings: () => console.log('Settings tab activated'),
  profile: () => console.log('Profile tab activated'),
};

const { activeTab, onTabChange } = useControlTabs('home', tabActions);

onMounted(() => {
  onTabChange(); // Executes the action for the default or current tab
});
```

> [!IMPORTANT]
> This composable heavily relies on Vue Router's `useRouter` and `useRoute`.\
> Ensure that your routes include a `tab` query parameter to fully utilize this composable.

### Helper Composables - Sever

#### useData 
It retrieves and validates data from the current request context.

**Parameters**
 - `kind: RequestTypes`: specifies the type of data to retrieve (`body`, `query`, or `params`).
 - `validators?: Validators<T>`: a Joi schema for validating the data. Optional.

**Returns**
 - The validated data if `validators` is provided.
 - The raw data if `validators` is not provided.

**Throws**
- A `NuxtError` with a status code of `422` if validation fails.

**Example**
```typescript
const data = await useData('body', {
  name: Joi.string().required(),
  age: Joi.number().min(18),
});
console.log(data.name, data.age);
```

---

#### usePrisma
Provides access to the shared Prisma Client instance.

**Returns**
  - The Prisma Client instance.

**Example**:
```typescript
const prisma = usePrisma();
const users = await prisma.user.findMany();
console.log(users);
```

---

#### setSession
Sets or updates the user session data.

**Parameters**
  - `data: Layer.SessionData`: The session data to set or update.

**Returns**
  - The result of the session update operation.

**Example**:
```typescript
await setSession({
  userId: 1,
  roles: ['admin'],
});
```

---

#### getUser
Retrieves the current user's session data.

**Returns**
  - The user's session data, if available.

**Example**
```typescript
const user = await getUser();
if (user) {
  console.log(`User ID: ${user.userId}`);
}
```

---

> [!IMPORTANT]
> **Error Handling**: Ensure proper error handling when using these utilities, especially for `useData` and `setSession`.
> **Session Management**: The `setSession` and `getUser` functions rely on runtime configuration and session handling middleware.

### Prisma

It serves as the primary ORM (Object-Relational Mapping) tool, enabling efficient interaction with the database. The schema is defined in the `prisma` folder and managed through the Prisma CLI.\
Prisma simplifies database management by:
 - Providing a strongly-typed API for database queries.
 - Automatically generating TypeScript types based on the schema.
 - Supporting migrations to evolve the database schema over time.

#### Files in the `prisma` Folder:
 - `schema.prisma`: the main configuration file where the database schema is defined. Specifies the data models, relationships, and database provider.
   - `Datasource`: Configures the database provider (e.g., PostgreSQL) and connection URL.
   - `Generator`: Specifies the generation of the Prisma Client.
   - `Models`: Define the entities and their fields, including relationships and constraints.
 
 - `instance.ts`: contains a shared instance of the Prisma Client to be reused throughout the application.
   - Prevents multiple Prisma Client instances from being created.
   - Use this instance wherever Prisma Client operations are needed to ensure a single database connection pool.

 - `seed.ts`: the script for populating the database with initial or test data; useful for setting up the development environment or creating demo data.

#### Workflow

1. Define the Schema
Edit `schema.prisma` to define or update your data models. Use Prisma’s rich data modeling capabilities to define relationships, constraints, and indexes.

2. Apply Migrations
Use the Prisma CLI to create and apply migrations that synchronize the database with your schema:

```bash
pnpx prisma migrate dev --name <migration_name>
```

3. Generate the Prisma Client
Run the following command to generate the TypeScript client:

```bash
pnpx prisma generate
```

4. Query the Database
Use the Prisma Client to perform database operations in a type-safe manner.

```typescript
async function main() {
  const user = await usePrisma().user.create({
    data: { email: 'john.doe@example.com', name: 'John Doe' },
  });
  console.log(user);
}
```

#### NPM Scripts
The following npm scripts related to Prisma are defined in `package.json`:
 - `prisma-generate`: generates the Prisma Client based on the `schema.prisma` file.
 - `prisma-migrate-dev`: creates a new migration and applies it to the development database.
 - `prisma-seed`: executes the seed script located in `prisma/seed.ts` to populate the database with initial data.

> [!IMPORTANT]
> Ensure the `DATABASE_URL` in the `.env` file is correctly configured for the database connection.\
> Regularly run `prisma generate` to keep the client up-to-date with schema changes.\
> Use Prisma migrations to manage schema evolution systematically.

### Docker
The **Dockerfile** for this project is dynamically generated by the `expose` module. It provides a robust containerized environment tailored for development purposes, supporting both application and database configurations.\
The `exposeDocker` option in the `baseLayerExpose` module enables the following capabilities:

 - `Docker Folder Creation`: when enabled, the `exposeDocker` option generates a Docker setup within the project directory, including Docker-related files such as `Dockerfile` and `docker-compose.yml`. This setup is optimized for development.
 - `Configuration Options`: 
   - `name`: specifies the name of the Docker container. Default: `'auto'` - set name from `package.json`.
   - `databases`: configures database services to be included in the Docker setup. Default: `['pgsql', 'mysql']`.
   - `writeEnv`: writes necessary environment variables to `.env` and `.env.example` files. Default: `true`.

### Example Configuration in `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  baseLayerExpose: {
    exposeDocker: {
      name: 'my-app-container',
      databases: ['pgsql'],
      writeEnv: true,
    },
  },
});
```

> [!NOTE]
> The generated setup is intended for development use.\
> Modify the `docker-compose.yml` file to add custom configurations as needed.\
> Ensure the `.env` file contains valid database credentials if database services are enabled.\
