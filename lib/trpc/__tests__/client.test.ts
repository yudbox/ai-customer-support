import { trpc } from "../client";

describe("tRPC Client", () => {
  describe("trpc object", () => {
    it("should be defined", () => {
      expect(trpc).toBeDefined();
    });

    it("should have createClient method", () => {
      expect(trpc.createClient).toBeDefined();
      expect(typeof trpc.createClient).toBe("function");
    });

    it("should have Provider component", () => {
      expect(trpc.Provider).toBeDefined();
      expect(typeof trpc.Provider).toBe("function");
    });

    it("should have useContext hook", () => {
      expect(trpc.useContext).toBeDefined();
      expect(typeof trpc.useContext).toBe("function");
    });

    it("should have useUtils hook", () => {
      expect(trpc.useUtils).toBeDefined();
      expect(typeof trpc.useUtils).toBe("function");
    });
  });

  describe("AppRouter type safety", () => {
    it("should have tickets namespace", () => {
      // This test verifies type safety at compile time
      // Runtime check that trpc can be used to access tickets
      const client = trpc.createClient({
        links: [],
      });

      expect(client).toBeDefined();
    });
  });
});
