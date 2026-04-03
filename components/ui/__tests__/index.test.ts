import * as UIComponents from "@/components/ui";

describe("UI Components Index", () => {
  describe("Component Exports", () => {
    it("exports Button component", () => {
      expect(UIComponents.Button).toBeDefined();
      expect(typeof UIComponents.Button).toBe("function");
    });

    it("exports Input component", () => {
      expect(UIComponents.Input).toBeDefined();
      expect(typeof UIComponents.Input).toBe("object"); // forwardRef returns object
    });

    it("exports Textarea component", () => {
      expect(UIComponents.Textarea).toBeDefined();
      expect(typeof UIComponents.Textarea).toBe("object"); // forwardRef returns object
    });

    it("exports Select component", () => {
      expect(UIComponents.Select).toBeDefined();
      expect(typeof UIComponents.Select).toBe("object"); // forwardRef returns object
    });

    it("exports Sidebar component", () => {
      expect(UIComponents.Sidebar).toBeDefined();
      expect(typeof UIComponents.Sidebar).toBe("function");
    });

    it("exports SidebarToggle component", () => {
      expect(UIComponents.SidebarToggle).toBeDefined();
      expect(typeof UIComponents.SidebarToggle).toBe("function");
    });

    it("exports Toast component", () => {
      expect(UIComponents.Toast).toBeDefined();
      expect(typeof UIComponents.Toast).toBe("function");
    });

    it("exports Modal component", () => {
      expect(UIComponents.Modal).toBeDefined();
      expect(typeof UIComponents.Modal).toBe("function");
    });
  });

  describe("Named Imports", () => {
    it("allows individual component imports", () => {
      const {
        Button,
        Input,
        Textarea,
        Select,
        Sidebar,
        SidebarToggle,
        Toast,
        Modal,
      } = UIComponents;

      expect(Button).toBeDefined();
      expect(Input).toBeDefined();
      expect(Textarea).toBeDefined();
      expect(Select).toBeDefined();
      expect(Sidebar).toBeDefined();
      expect(SidebarToggle).toBeDefined();
      expect(Toast).toBeDefined();
      expect(Modal).toBeDefined();
    });

    it("exports all expected components", () => {
      const componentNames = Object.keys(UIComponents);

      expect(componentNames).toContain("Button");
      expect(componentNames).toContain("Input");
      expect(componentNames).toContain("Textarea");
      expect(componentNames).toContain("Select");
      expect(componentNames).toContain("Sidebar");
      expect(componentNames).toContain("SidebarToggle");
      expect(componentNames).toContain("Toast");
      expect(componentNames).toContain("Modal");
    });
  });

  describe("Component Display Names", () => {
    it("Input has displayName", () => {
      expect(UIComponents.Input.displayName).toBe("Input");
    });

    it("Textarea has displayName", () => {
      expect(UIComponents.Textarea.displayName).toBe("Textarea");
    });

    it("Select has displayName", () => {
      expect(UIComponents.Select.displayName).toBe("Select");
    });
  });

  describe("Component Consistency", () => {
    it("exports exactly 8 components", () => {
      const componentNames = Object.keys(UIComponents);

      // Button, Input, Textarea, Select, Sidebar, SidebarToggle, Toast, Modal
      expect(componentNames.length).toBe(8);
    });

    it("all exports are truthy", () => {
      const {
        Button,
        Input,
        Textarea,
        Select,
        Sidebar,
        SidebarToggle,
        Toast,
        Modal,
      } = UIComponents;

      expect(Button).toBeTruthy();
      expect(Input).toBeTruthy();
      expect(Textarea).toBeTruthy();
      expect(Select).toBeTruthy();
      expect(Sidebar).toBeTruthy();
      expect(SidebarToggle).toBeTruthy();
      expect(Toast).toBeTruthy();
      expect(Modal).toBeTruthy();
    });

    it("no exports are null or undefined", () => {
      const componentNames = Object.keys(UIComponents);

      componentNames.forEach((name) => {
        expect(UIComponents[name as keyof typeof UIComponents]).not.toBeNull();
        expect(
          UIComponents[name as keyof typeof UIComponents],
        ).not.toBeUndefined();
      });
    });
  });

  describe("Re-export Validation", () => {
    it("Button export matches direct import", async () => {
      const { Button } = await import("@/components/ui/button");

      expect(UIComponents.Button).toBe(Button);
    });

    it("Input export matches direct import", async () => {
      const { Input } = await import("@/components/ui/input");

      expect(UIComponents.Input).toBe(Input);
    });

    it("Textarea export matches direct import", async () => {
      const { Textarea } = await import("@/components/ui/textarea");

      expect(UIComponents.Textarea).toBe(Textarea);
    });

    it("Select export matches direct import", async () => {
      const { Select } = await import("@/components/ui/select");

      expect(UIComponents.Select).toBe(Select);
    });

    it("Sidebar export matches direct import", async () => {
      const { Sidebar } = await import("@/components/ui/sidebar");

      expect(UIComponents.Sidebar).toBe(Sidebar);
    });

    it("SidebarToggle export matches direct import", async () => {
      const { SidebarToggle } = await import("@/components/ui/sidebar-toggle");

      expect(UIComponents.SidebarToggle).toBe(SidebarToggle);
    });

    it("Toast export matches direct import", async () => {
      const { Toast } = await import("@/components/ui/toast");

      expect(UIComponents.Toast).toBe(Toast);
    });

    it("Modal export matches direct import", async () => {
      const { Modal } = await import("@/components/ui/modal");

      expect(UIComponents.Modal).toBe(Modal);
    });
  });
});
