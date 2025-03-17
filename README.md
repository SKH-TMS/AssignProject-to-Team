# Assign Project to a Team - byProjectManager

## version 0

- Create "Assign Project" button on PM's profile page.
- Create route for "Assign Project".
- When click on assign Project button this will open a page on which you can assign a Project to a Team.
- On new page, when click on "Assign Project", then "project" collection will be updated.
  - assignedTeam attribute of this collection will be updated.
  - assignedTeam will contain team's information

#### Issue in v0

1. Before assigning project, we will have to create both project and team. while both project-creation and team-creation are on two different pages. we will have to move to two different URLs.
   **This issue is solved in v1**
2. the "project" collection shouldn't be updated. But a new collection should be create that will represent relationship between "project" and "team" collection.
   **This issue is solved in v2**

## Version 1

### Assign Project during both Team-Creation and Project-Creation

- When you click on "Create Team" on project page, then a new page will be opened. On this page, list of all "projects" will also be available. By selecting project, you can assign project to this newly creating team.
  - It means you don't need to go new page (Create Project) and then Assign Project.
- Similar work for "Creat Project" as "Create Team" (explain above).

### More Improvements to Repo # T24

1. When click on "Assign Project" on Project page, then PM can select Time now during the Project Creation. Time can also be in AM and PM.

### Issue in this v1

1. the "project" collection shouldn't be updated. But a new collection should be create that will represent relationship between "project" and "team" collection.
   **This issue is solved in v4**

## Version 2 - Outdated | Remove

- a new collection named as "AssignedProjectLogs" which will represent relationship between "team" and "project" using primary and foriegn keys.

**But this version requires many changes, that are updated in v4. Therefore, don't use this version. Use its updated version (v4)**

I have updated the v2 to include the AssignedProjectLogs
this includes the

1.  AssignProjectId. // Unique Assignment ID
2.  projectId. // The project being assigned
3.  teamId. // The team assigned to the project
4.  teamName. // The name of the team
5.  assignedBy. // Project Manager who assigned the project
6.  deadline: Date.

I have removed the deadline field from the Project and included it in the AssignedProjectLogs
I have added the assignedLog in the Project to track rather the project is assignoed to any team or not

## Version 3 - Should be in Separate Repo

### Error Handeling and Alert System

1. Redirecting to userData/Loginuser if unautherized access.
2. Most of simpple-alerts have been removed
3. Use **react-hot-toast** for display alerts.
   a. in case of error toast.error
   b. In case of Sucess toast.sucess

## Version 4

1. Create a collection named as "assigned_project_2_team". this collection will reprsent relationship between "team" and "project"
2. Now when assigning the Project we first seacrh for all the projectIDs in the Project and then compare then to assigned_project_2_team. if the id exists, then it means the project is assigned.
3. The assigned-project cannot be assigned to another team.

## Version 5 - Server Side Errors are sent to FrontEnd

### Changes

Added the ZOD integration for the Server Side Validation. Now if any error occurs during Server Side the error will be directed to the frontend and client or user will be able to see the error and its occuring reason.

#### Changes in File Structure

I have added the "Schemas" folder in "src" folder.

1. "adminSchema.ts"
2. "assignedProjectLogSchema.ts"
3. "projectSchema.ts"
4. "teamSchema.ts"
5. "userSchema.ts"

#### Changes in the routes

1. assignProject/route.ts
2. createProject/route.ts
3. createTeam/route.ts

### Fixing

1. Fixed Deadline format now all the pages "CreateProject","CreateTeam"and"AssignProject" will store the deadline in the similer format.
2. Fixed Regx value of the Models before the id would not be able to excede the 10 but with the updated regex the id can be anywhere between 0 to infinty.

## Version 6

Below is a detailed section you can add to your README that summarizes all the changes made across your API route files and page components:

---

### Production Build Fixes & Changes

During development, the project ran smoothly with `npm run dev`. However, production builds (`npm run build`) were failing because of two main issues:

1. **Static Rendering of Dynamic API Routes**  
   API routes that rely on dynamic data (such as `request.headers`) were being statically rendered by Next.js. This resulted in errors like:

   > "Dynamic server usage: Route ... couldn't be rendered statically because it used `request.headers`."

2. **Client-Side Hook Usage Without Suspense**  
   Pages that use client-side hooks (e.g., `useSearchParams()` in the App Router) were throwing errors during prerendering because they were not wrapped in a `<Suspense>` boundary.

#### Changes Made

##### 1. API Route Changes

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

##### 2. Page Component Changes

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

#### Summary

- **API Routes:** All dynamic routes (those accessing `request.headers` or other runtime data) now begin with `export const dynamic = "force-dynamic";` to enforce dynamic server rendering.
- **Pages:** Affected pages in our case **UpdateUsers** and **UpdatePMs** were refactored to move client-side logic into an inner component that is wrapped in a `<Suspense>` boundary.

These changes ensure that the production build runs without errors and that your application handles dynamic server usage and client-side data fetching correctly.

---

For more details Read the [Next.js documentation](https://nextjs.org/docs).

