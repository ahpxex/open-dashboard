import { useCommandMenu } from "@/stores/command-menu";
import { CommandMenu } from "./CommandMenu";

export function CommandMenuProvider() {
  const isOpen = useCommandMenu((state) => state.isOpen);
  const close = useCommandMenu((state) => state.close);
  const open = useCommandMenu((state) => state.open);

  const handleOpenChange = (value: boolean) => {
    if (value) {
      open();
    } else {
      close();
    }
  };

  return <CommandMenu open={isOpen} onOpenChange={handleOpenChange} />;
}
