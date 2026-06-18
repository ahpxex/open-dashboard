import { ThemeProvider } from "next-themes";
import { appConfig } from "@/config/app";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={appConfig.theme.defaultTheme}
      enableSystem={appConfig.theme.enableSystem}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
