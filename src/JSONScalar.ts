import { GraphQLScalarType, Kind, ValueNode } from "graphql";
import { JSONValue, isJSONValue } from "./types";

/**
 * Serializes a value to a JSON-compatible format.
 * Converts Dates to ISO strings and validates the result
 */
function serialize(value: unknown): JSONValue {
  /* Handle Date objects by converting to ISO string */
  if (value instanceof Date) {
    return value.toISOString();
  }

  /* Validate that the value is a valid JSONValue */
  if (!isJSONValue(value)) {
    throw new TypeError(
      `JSON cannot represent value: ${String(value)}.` +
        "Only plain objects, arrays, and primitives are supported.",
    );
  }

  return value;
}

/**
 * Parses a value from a GraphQL variable or argument
 */
function parseValue(value: unknown): JSONValue {
  /* Handle Date Objects */
  if (value instanceof Date) {
    return value.toISOString();
  }

  /* Validate the value */
  if (!isJSONValue(value)) {
    throw new TypeError(
      `JSON cannot represent value: ${String(value)}.` +
        "Only plain objects, arrays, and primitives are supported.",
    );
  }

  return value;
}

/**
 * Parses a value from a GraphQL AST literal.
 * Handles StringValue, IntValue, FloatValue, BooleanValue, NullValue, ObjectValue, and ListValue.
 */
function parseLiteral(ast: ValueNode): JSONValue {
  switch (ast.kind) {
    case Kind.STRING:
      return ast.value;

    case Kind.INT:
      return parseInt(ast.value, 10);

    case Kind.FLOAT:
      return parseFloat(ast.value);

    case Kind.BOOLEAN:
      return ast.value;

    case Kind.NULL:
      return null;

    case Kind.LIST:
      return ast.values.map((val) => parseLiteral(val));

    case Kind.OBJECT: {
      const obj: { [key: string]: JSONValue } = {};
      for (const field of ast.fields) {
        obj[field.name.value] = parseLiteral(field.value);
      }

      return obj;
    }

    default:
      throw new TypeError(
        `JSON cannot represent value: ${ast.kind}.` +
          "Only StringValue, IntValue, FloatValue, BooleanValue, NullValue, ObjectValue, and ListValue are supported",
      );
  }
}

/**
 * GraphQL JSON Scalar Type.
 * Provides a robust JSON scalar implementation with strict type safety.
 *
 * @example
 * ```ts
 * import { JSONScalar } from '@thomaslnx/graphql-json-scalar-ts'
 *
 * const typeDefs = `
 *    scalar JSON
 * `;
 *
 * const resolvers = {
 *    JSON: JSONScalar,
 * };
 * ```
 */
export const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description:
    "The `JSON` scalar type represents JSON values as specified by [ECMA-404](https://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).",
  serialize,
  parseValue,
  parseLiteral,
});

/**
 * Alias for JSONScalar convenience, naming convention and backward compatibility.
 * @deprecated Use JSONScalar instead. This alias may be removed in a future version.
 */
export const GraphQLJSON = JSONScalar;
