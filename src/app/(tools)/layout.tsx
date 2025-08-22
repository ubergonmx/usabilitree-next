import PageTheme from "@/providers/page-theme";
import { ReactNode } from "react";

const ToolLayout = ({ children }: { children: ReactNode }) => {
  return <PageTheme>{children}</PageTheme>;
};

export default ToolLayout;
