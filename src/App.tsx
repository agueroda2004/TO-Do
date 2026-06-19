import { Toaster } from "sonner";
import { CategoryProvider } from "./context/CategoryContext";
import { TaskProvider } from "./context/TaskContext";
import { ThemeProvider } from "./context/ThemeContext";
import { DashboardPage } from "./pages/DashboardPage";

export default function App() {
  return (
    <ThemeProvider>
      <CategoryProvider>
        <TaskProvider>
          <DashboardPage />
          <Toaster
            richColors
            closeButton
            position="bottom-right"
            toastOptions={{
              duration: 3500,
            }}
          />
        </TaskProvider>
      </CategoryProvider>
    </ThemeProvider>
  );
}