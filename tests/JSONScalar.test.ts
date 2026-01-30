import { describe, it, expect } from "vitest";
import {
  BooleanValueNode,
  FloatValueNode,
  IntValueNode,
  Kind,
  ListValueNode,
  NullValueNode,
  ObjectValueNode,
  StringValueNode,
} from "graphql";
import { isJSONValue, JSONScalar, type JSONValue } from "../src/index";

describe("JSONScalar", () => {
  describe("serialize", () => {
    it("should serialize strings", () => {
      expect(JSONScalar.serialize("hello")).toBe("hello");
    });

    it("should serialize numbers", () => {
      expect(JSONScalar.serialize(42)).toBe(42);
      expect(JSONScalar.serialize(3.14)).toBe(3.14);
    });

    it("should serialize booleans", () => {
      expect(JSONScalar.serialize(true)).toBe(true);
      expect(JSONScalar.serialize(false)).toBe(false);
    });

    it("should serialize null", () => {
      expect(JSONScalar.serialize(null)).toBe(null);
    });

    it("should serialize arrays", () => {
      expect(JSONScalar.serialize([1, 2, 3])).toEqual([1, 2, 3]);
      expect(JSONScalar.serialize(["a", "b", "c"])).toEqual(["a", "b", "c"]);
      expect(JSONScalar.serialize([true, false, null])).toEqual([
        true,
        false,
        null,
      ]);
    });

    it("should serialize objects", () => {
      const obj = { a: 1, b: "test", c: true };
      expect(JSONScalar.serialize(obj)).toEqual(obj);
    });

    it("should serialize nested structures", () => {
      const nested = {
        a: 1,
        b: {
          c: [1, 2, { d: "test" }],
          e: null,
        },
        f: [true, false],
      };
      expect(JSONScalar.serialize(nested)).toEqual(nested);
    });

    it("should convert Date objects to ISO strings", () => {
      const date = new Date("2023-01-01T00:00:00.000Z");
      expect(JSONScalar.serialize(date)).toBe("2023-01-01T00:00:00.000Z");
    });

    it("should reject functions", () => {
      expect(() => JSONScalar.serialize(() => {})).toThrow(TypeError);
    });

    it("should reject symbols", () => {
      expect(() => JSONScalar.serialize(Symbol("test"))).toThrow(TypeError);
    });

    it("should reject undefined", () => {
      expect(() => JSONScalar.serialize(undefined)).toThrow(TypeError);
    });

    it("should reject class instances", () => {
      class TestClass {}
      expect(() => JSONScalar.serialize(new TestClass())).toThrow(TypeError);
    });

    it("should reject RegExp", () => {
      expect(() => JSONScalar.serialize(/test/)).toThrow(TypeError);
    });

    it("should reject Error objects", () => {
      expect(() => JSONScalar.serialize(new Error("test"))).toThrow(TypeError);
    });
  });

  describe("parseValue", () => {
    it("should parse strings", () => {
      expect(JSONScalar.parseValue("hello")).toBe("hello");
    });

    it("should parse numbers", () => {
      expect(JSONScalar.parseValue(42)).toBe(42);
      expect(JSONScalar.parseValue(3.14)).toBe(3.14);
    });

    it("should parse booleans", () => {
      expect(JSONScalar.parseValue(true)).toBe(true);
      expect(JSONScalar.parseValue(false)).toBe(false);
    });

    it("should parse null", () => {
      expect(JSONScalar.parseValue(null)).toBe(null);
    });

    it("should parse arrays", () => {
      expect(JSONScalar.parseValue([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("should parse objects", () => {
      const obj = { a: 1, b: "test" };
      expect(JSONScalar.parseValue(obj)).toEqual(obj);
    });

    it("should convert Date objects to ISO string", () => {
      const date = new Date("2023-01-01T00:00:00.000Z");
      expect(JSONScalar.parseValue(date)).toBe("2023-01-01T00:00:00.000Z");
    });

    it("should reject invalid values", () => {
      expect(() => JSONScalar.parseValue(undefined)).toThrow(TypeError);
      expect(() => JSONScalar.parseValue(() => {})).toThrow(TypeError);
      expect(() => JSONScalar.parseValue(Symbol("test"))).toThrow(TypeError);
    });
  });

  describe("parseLiteral", () => {
    it("should parse StringValue", () => {
      const ast: StringValueNode = {
        kind: Kind.STRING,
        value: "hello",
      };
      expect(JSONScalar.parseLiteral(ast, {})).toBe("hello");
    });

    it("should parse IntValue", () => {
      const ast: IntValueNode = {
        kind: Kind.INT,
        value: "42",
      };
      expect(JSONScalar.parseLiteral(ast, {})).toBe(42);
    });

    it("should parse FloatValue", () => {
      const ast: FloatValueNode = {
        kind: Kind.FLOAT,
        value: "3.14",
      };
      expect(JSONScalar.parseLiteral(ast, {})).toBe(3.14);
    });

    it("should parse BooleanValue", () => {
      const trueAst: BooleanValueNode = {
        kind: Kind.BOOLEAN,
        value: true,
      };
      const falseAst: BooleanValueNode = {
        kind: Kind.BOOLEAN,
        value: false,
      };
      expect(JSONScalar.parseLiteral(trueAst, {})).toBe(true);
      expect(JSONScalar.parseLiteral(falseAst, {})).toBe(false);
    });

    it("should parse NullValue", () => {
      const ast: NullValueNode = {
        kind: Kind.NULL,
      };
      expect(JSONScalar.parseLiteral(ast, {})).toBe(null);
    });

    it("should parse ListValue", () => {
      const ast: ListValueNode = {
        kind: Kind.LIST,
        values: [
          { kind: Kind.INT, value: "1" },
          { kind: Kind.INT, value: "2" },
          { kind: Kind.INT, value: "3" },
        ],
      };
      expect(JSONScalar.parseLiteral(ast, {})).toEqual([1, 2, 3]);
    });

    it("should parse ObjectValue", () => {
      const ast: ObjectValueNode = {
        kind: Kind.OBJECT,
        fields: [
          {
            kind: Kind.OBJECT_FIELD,
            name: { kind: Kind.NAME, value: "a" },
            value: { kind: Kind.INT, value: "1" },
          },
          {
            kind: Kind.OBJECT_FIELD,
            name: { kind: Kind.NAME, value: "b" },
            value: { kind: Kind.STRING, value: "test" },
          },
        ],
      };
      expect(JSONScalar.parseLiteral(ast, {})).toEqual({ a: 1, b: "test" });
    });

    it("should parse nested ObjectValue", () => {
      const ast: ObjectValueNode = {
        kind: Kind.OBJECT,
        fields: [
          {
            kind: Kind.OBJECT_FIELD,
            name: { kind: Kind.NAME, value: "a" },
            value: {
              kind: Kind.OBJECT,
              fields: [
                {
                  kind: Kind.OBJECT_FIELD,
                  name: { kind: Kind.NAME, value: "b" },
                  value: { kind: Kind.INT, value: "2" },
                },
              ],
            },
          },
        ],
      };
      expect(JSONScalar.parseLiteral(ast, {})).toEqual({ a: { b: 2 } });
    });

    it("should parse nested ListValue", () => {
      const ast: ListValueNode = {
        kind: Kind.LIST,
        values: [
          {
            kind: Kind.LIST,
            values: [
              {
                kind: Kind.INT,
                value: "1",
              },
              {
                kind: Kind.INT,
                value: "2",
              },
            ],
          },
        ],
      };
      expect(JSONScalar.parseLiteral(ast, {})).toEqual([[1, 2]]);
    });

    it("should throw on unsupported AST node types", () => {
      const ast = {
        kind: Kind.ENUM,
        value: "TEST",
      } as any;
      expect(() => JSONScalar.parseLiteral(ast, {})).toThrow(TypeError);
    });
  });

  describe("consistency", () => {
    it("should have consistent behavior across serialize, parseValue, and parseLiteral", () => {
      const value = { a: 1, b: "test", c: [1, 2, 3] };

      const serialized = JSONScalar.serialize(value);
      const parsed = JSONScalar.parseValue(value);
      const literal = JSONScalar.parseLiteral(
        {
          kind: Kind.OBJECT,
          fields: [
            {
              kind: Kind.OBJECT_FIELD,
              name: { kind: Kind.NAME, value: "a" },
              value: { kind: Kind.INT, value: "1" },
            },
            {
              kind: Kind.OBJECT_FIELD,
              name: { kind: Kind.NAME, value: "b" },
              value: { kind: Kind.STRING, value: "test" },
            },
            {
              kind: Kind.OBJECT_FIELD,
              name: { kind: Kind.NAME, value: "c" },
              value: {
                kind: Kind.LIST,
                values: [
                  { kind: Kind.INT, value: "1" },
                  { kind: Kind.INT, value: "2" },
                  { kind: Kind.INT, value: "3" },
                ],
              },
            },
          ],
        },
        {},
      );
      expect(serialized).toEqual(value);
      expect(parsed).toEqual(value);
      expect(literal).toEqual({ a: 1, b: "test", c: [1, 2, 3] });
    });
  });

  describe("isJSONValue", () => {
    it("should accept valid JSON primitives", () => {
      expect(isJSONValue("string")).toBe(true);
      expect(isJSONValue(42)).toBe(true);
      expect(isJSONValue(3.14)).toBe(true);
      expect(isJSONValue(true)).toBe(true);
      expect(isJSONValue(false)).toBe(true);
      expect(isJSONValue(null)).toBe(true);
    });

    it("should accept valid arrays", () => {
      expect(isJSONValue([1, 2, 3])).toBe(true);
      expect(isJSONValue(["a", "b"])).toBe(true);
      expect(isJSONValue([true, false, null])).toBe(true);
    });

    it("should accept valid objects", () => {
      expect(isJSONValue({})).toBe(true);
      expect(isJSONValue({ a: 1, b: "test" })).toBe(true);
    });

    it("should accept nested structures", () => {
      expect(isJSONValue({ a: { b: [1, 2] } })).toBe(true);
    });

    it("should reject undefined", () => {
      expect(isJSONValue(undefined)).toBe(false);
    });

    it("should reject functions", () => {
      expect(isJSONValue(() => {})).toBe(false);
    });

    it("should reject symbols", () => {
      expect(isJSONValue(Symbol("test"))).toBe(false);
    });

    it("should reject Date objects", () => {
      expect(isJSONValue(new Date())).toBe(false);
    });

    it("should reject RegExp", () => {
      expect(isJSONValue(/test/)).toBe(false);
    });

    it("should reject Error objects", () => {
      expect(isJSONValue(new Error("test"))).toBe(false);
    });

    it("should reject class instances", () => {
      class TestClass {}
      expect(isJSONValue(new TestClass())).toBe(false);
    });

    it("should reject arrays with invalid values", () => {
      expect(isJSONValue([1, undefined, 3])).toBe(false);
      expect(isJSONValue([1, () => {}, 3])).toBe(false);
    });

    it("should reject objects with invalid values", () => {
      expect(isJSONValue({ a: 1, b: undefined })).toBe(false);
      expect(isJSONValue({ a: 1, b: () => {} })).toBe(false);
    });
  });

  describe("JSONValue type", () => {
    it("should be usable as a type annotation", () => {
      const value: JSONValue = { a: 1, b: "test" };
      expect(value).toBeDefined();
    });
  });
});
