# Version 5

## Changes

Added the ZOD integration for the Server Side Validation. Now if any error occurs during Server Side  the error will be directed to the frontend and client or user will be able to see the error and its occuring reason.

### Changes in File Structure

I have added the "Schemas" folder in "src" folder.

1. "adminSchema.ts"
2. "assignedProjectLogSchema.ts"
3. "projectSchema.ts"
4. "teamSchema.ts"
5. "userSchema.ts"

### Changes in the routes

1. assignProject/route.ts
2. createProject/route.ts
3. createTeam/route.ts

## Fixing


1. Fixed Deadline format now all the pages "CreateProject","CreateTeam"and"AssignProject" will store the deadline in the similer format.
2. Fixed Regx value of the Models before the id would not be able to excede the 10 but with the updated regex the id can be anywhere between 0 to infinty.
