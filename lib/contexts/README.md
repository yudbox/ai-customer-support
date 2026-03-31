/\*\*

- Toast System - Global Toast Notifications
-
- Example usage in any client component:
-
- ```tsx

  ```
- "use client";
-
- import { useToast } from "@/lib/contexts/ToastContext";
-
- export function MyComponent() {
- const { showToast } = useToast();
-
- const handleSuccess = () => {
-     showToast({
-       message: "Success!",
-       description: "Operation completed successfully",
-       variant: "success",
-       duration: 5000,
-     });
- };
-
- const handleWarning = () => {
-     showToast({
-       message: "Warning",
-       description: "This action requires confirmation",
-       variant: "warning",
-       duration: 7000,
-     });
- };
-
- const handleInfo = () => {
-     showToast({
-       message: "Information",
-       description: "Here's something you should know",
-       variant: "info",
-     });
- };
-
- return (
-     <div>
-       <button onClick={handleSuccess}>Show Success Toast</button>
-       <button onClick={handleWarning}>Show Warning Toast</button>
-       <button onClick={handleInfo}>Show Info Toast</button>
-     </div>
- );
- }
- ```

  ```
-
- Toast variants:
- - success: Green gradient (📧 Email & Slack)
- - warning: Orange gradient (🚨 Priority Alert)
- - info: Blue gradient (📬 Email)
-
- Props:
- - message: Main title (required)
- - description: Optional detailed text
- - variant: Visual style (default: "info")
- - duration: Auto-dismiss time in ms (default: 5000)
    \*/

export {};
