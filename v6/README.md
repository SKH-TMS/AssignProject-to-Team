# Version 6

## Production Build Fixes & Changes

During development, the project ran smoothly with `npm run dev`. However, production builds (`npm run build`) were failing because of two main issues:

1. **Static Rendering of Dynamic API Routes**  
   API routes that rely on dynamic data (such as `request.headers`) were being statically rendered by Next.js. This resulted in errors like:

   > "Dynamic server usage: Route ... couldn't be rendered statically because it used `request.headers`."

2. **Client-Side Hook Usage Without Suspense**  
   Pages that use client-side hooks (e.g., `useSearchParams()` in the App Router) were throwing errors during prerendering because they were not wrapped in a `<Suspense>` boundary.

### Changes Made

#### 1. API Route Changes

For every API route that uses dynamic request properties (such as headers), we added the following line at the **very top** of the file:

```ts
export const dynamic = "force-dynamic";
```

This change was applied to the following files:

- **/api/adminData/getAllProjectManagers/route.ts**
- **/api/adminData/getAllUsers/route.ts**
- **/api/adminData/login_admin/route.ts** (if similar issues arise; optional if no dynamic request usage)
- **/api/projectManagerData/getAllUsers/route.ts**
- **/api/projectManagerData/getTeams/route.ts**
- **/api/projectManagerData/getUnassignedProjects/route.ts**

_Why?_  
By marking these routes with `dynamic = "force-dynamic"`, we instruct Next.js to always render them on the server at runtime rather than attempting to pre-render them statically. This avoids errors stemming from dynamic server usage (e.g., when accessing `request.headers`).

#### 2. Page Component Changes

Pages using dynamic client-side hooks (like `useSearchParams()`) were causing errors during SSR or static generation. To resolve this, we refactored affected pages to include a `<Suspense>` boundary. The changes include:

- **/adminData/UpdateUsers/page.tsx**
- **/adminData/UpdatePMs/page.tsx**

The refactoring steps were as follows:

1. **Create an Inner Component:**  
   The original page code (with all hooks, data fetching, and component logic) was moved into an inner component (e.g., `UpdateUsersInner` or `UpdatePMsInner`).

2. **Wrap the Inner Component in `<Suspense>`:**  
   The default export of the page now wraps the inner component in a `<Suspense>` boundary to ensure that dynamic hooks (like `useSearchParams()`) are rendered properly:

   ```tsx
   "use client";

   import React, { Suspense } from "react";
   // ...other imports you need or you have specified before

   // Inner component containing original logic
   function UpdateUsersInner() {
     // ... original component code including useSearchParams()
     return <div>{/* content */}</div>;
   }

   // Default export wrapping inner component with Suspense
   export default function UpdateUsers() {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <UpdateUsersInner />
       </Suspense>
     );
   }
   ```

_Why?_  
Wrapping the inner component in `<Suspense>` resolves errors related to client-side hooks that depend on runtime data, ensuring a smooth transition during server-side rendering and hydration.

---

### Summary

- **API Routes:** All dynamic routes (those accessing `request.headers` or other runtime data) now begin with `export const dynamic = "force-dynamic";` to enforce dynamic server rendering.
- **Pages:** Affected pages in our case **UpdateUsers** and **UpdatePMs** were refactored to move client-side logic into an inner component that is wrapped in a `<Suspense>` boundary.

These changes ensure that the production build runs without errors and that your application handles dynamic server usage and client-side data fetching correctly.

---

For more details Read the [Next.js documentation](https://nextjs.org/docs).
