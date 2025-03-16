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
