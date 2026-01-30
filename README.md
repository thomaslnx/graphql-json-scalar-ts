# @thomaslnx/graphql-json-scalar-ts

A production-ready GraphQL JSON scalar with excellent TypeScript support.

## Why This Package Exists

This package exists primarily as a practical response to changes in the modern GraphQL and TypeScript ecosystem.

This package provides a robust, type-safe alternative with:

- ✅ **First-class TypeScript support** - No `any` leaks, strict type safety
- ✅ **ESM + CommonJS dual support** - Works seamlessly in both module systems
- ✅ **Framework-agnostic** - Compatible with Apollo Server, GraphQL Yoga, Mercurius, Envelop, and more
- ✅ **Consistent behavior** - Uniform handling across all scalar methods
- ✅ **Zero runtime dependencies** - Only requires `graphql` as a peer dependency
- ✅ **Tree-shakable** - Optimized for modern bundlers
- ✅ **Production-ready** - Comprehensive tests and defensive error handling

## Installation

```bash
npm install @thomaslnx/graphql-json-scalar-ts graphql
```

```bash
yarn add @thomaslnx/graphql-json-scalar-ts graphql
```

```bash
pnpm add @thomaslnx/graphql-json-scalar-ts graphql
```

## Usage

### TypeScript Import (ESM)

```typescript
import { JSONScalar, type JSONValue } from "@thomaslnx/graphql-json-scalar-ts";
```

### CommonJS Import

```typescript
const { JSONScalar } = require("@thomaslnx/graphql-json-scalar-ts");
```

### Apollo Server

#### Schema-First Approach

```typescript
import { ApolloServer } from "@apollo/server";
import { JSONScalar } from "@thomaslnx/graphql-json-scalar-ts";

const typeDefs = `
  scalar JSON

  type Query {
    getData: JSON
    setData(input: JSON!): Boolean
  }
`;

const resolvers = {
  JSON: JSONScalar,
  Query: {
    getData: () => ({ foo: "bar", nested: { value: 42 } }),
    setData: (_: unknown, { input }: { input: JSONValue }) => {
      console.log("Received:", input);
      return true;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
```

#### Code-First Approach (TypeGraphQL, Pothos, etc.)

```typescript
import { JSONScalar } from "@thomaslnx/graphql-json-scalar-ts";
import { GraphQLScalarType } from "graphql";

// Register the scalar
const schema = buildSchema(`
  scalar JSON
`);

// Add resolver
addScalarResolvers({
  JSON: JSONScalar,
});
```

### GraphQL Yoga

```typescript
import { createYoga } from "graphql-yoga";
import { JSONScalar } from "@thomaslnx/graphql-json-scalar-ts";

const yoga = createYoga({
  schema: {
    typeDefs: `
      scalar JSON
      type Query {
        data: JSON
      }
    `,
    resolvers: {
      JSON: JSONScalar,
      Query: {
        data: () => ({ example: "value" }),
      },
    },
  },
});
```

### Mercurius (Fastify)

```typescript
import Fastify from "fastify";
import mercurius from "mercurius";
import { JSONScalar } from "@thomaslnx/graphql-json-scalar-ts";

const app = Fastify();

app.register(mercurius, {
  schema: `
    scalar JSON
    type Query {
      data: JSON
    }
  `,
  resolvers: {
    JSON: JSONScalar,
    Query: {
      data: () => ({ example: "value" }),
    },
  },
});
```

### Using the JSONValue Type

The package exports a `JSONValue` type that you can use for type-safe handling of JSON data:

```typescript
import type { JSONValue } from "@thomaslnx/graphql-json-scalar-ts";

function processData(data: JSONValue): string {
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    return JSON.stringify(data);
  }
  return String(data);
}

// Type-safe validation
import { isJSONValue } from "@thomaslnx/graphql-json-scalar-ts";

function validateInput(input: unknown): input is JSONValue {
  return isJSONValue(input);
}
```

## API

### `JSONScalar`

The main GraphQL scalar type. Use this as the resolver for your `JSON` scalar type.

```typescript
import { JSONScalar } from "@thomaslnx/graphql-json-scalar-ts";
```

### `GraphQLJSON`

Alias for `JSONScalar` (for compatibility). **Deprecated** - use `JSONScalar` instead.

### `JSONValue` (Type)

TypeScript type representing a valid JSON value:

```typescript
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };
```

### `isJSONValue(value: unknown): value is JSONValue`

Type guard to check if a value is a valid `JSONValue`.

## Behavior

### Accepted Values

- ✅ Primitives: `string`, `number`, `boolean`, `null`
- ✅ Arrays: `[1, 2, 3]`, `['a', 'b']`, nested arrays
- ✅ Objects: Plain objects with string keys
- ✅ Nested structures: Any combination of the above
- ✅ `Date` objects: Automatically converted to ISO 8601 strings

### Rejected Values

- ❌ `undefined`
- ❌ `function`
- ❌ `Symbol`
- ❌ Class instances (except `Date`, which is converted)
- ❌ `RegExp`
- ❌ `Error` objects

### Error Messages

The scalar provides clear, actionable error messages:

```
TypeError: JSON cannot represent value: [value]. Only plain objects, arrays, and primitives are supported.
```

## TypeScript Configuration

This package is built with `strict: true` and requires TypeScript 5.0+. For best results, enable strict mode in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## Requirements

- **Node.js**: >= 18.0.0
- **GraphQL**: ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0
- **TypeScript**: >= 5.0.0 (for type definitions)

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run typecheck

# Build
npm run build
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
