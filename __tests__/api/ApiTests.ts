import { UpdateModel } from "../../src";

test("Tests for UpdateModel", () => {
  interface Entity extends UpdateModel {
    name: string;
    age: number;
  }

  const data: Entity = {
    id: 1,
    name: "Tom",
    age: 20,
    changedFields: ["name", "age"]
  };

  expect(data.id).toBe(1);
});
