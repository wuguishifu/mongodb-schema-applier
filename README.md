# @wuguishifu/mongodb-schema-applier

This package makes it easy to apply index specification schemas to existing mongodb applications. One major use-case is using a schema file to ensure that indexes exist on a mongodb slice on startup of a backend server.

## Installation

using npm:

```none
npm install @wuguishifu/mongodb-schema-applier
```

## Usage

### Applying Schemas

1. Create an `Applier` object.
2. Use the `apply()` function to asynchronously apply the schema.

```ts
import Applier, { Schema } from '@wuguishifu/mongodb-schema-applier';
const schema: Schema = { ... };
const applier = new Applier('localhost:27017', 'my-db', { w: 'majority', retryWrites: true });
applier.apply(schema);
```

### Clearing Schemas

1. Create an `Applier` object.
2. Use the `clear()` function to asynchronously drop indexes

```ts
import Applier, { Schema } from '@wuguishifu/mongodb-schema-applier';
const schema: Schema = { ... };
const applier = new Applier('localhost:27017', 'my-db', { w: 'majority', retryWrites: true });
applier.clear(schema);
```

## Usage with schema file

### schema.json

see full example in `schema-example.json`.

```json
{
  "collections": {
    "my-collection": {
      "indexes": [
        {
          "field": "myUniqueIndex",
          "type": "default",
          "indexSpec": {
            "pattern": 1
          }
        }
      ]
    }
  }
}
```

### index.ts

```ts
import Applier, { Schema } from '@wuguishifu/mongodb-schema-applier';
import _schema from './schema.json';
const schema = _schema as Schema;

const applier = new Applier('localhost:27017', 'my-db', { w: 'majority', retryWrites: true });

// add indexes
try {
    await applier.apply(schema);
} catch (error) {
    console.error(error);
    process.exit(1);
}

// delete indexes
try {
    await applier.clear(schema);
} catch (error) {
    console.error(error);
    process.exit(1);
}

```

## Credit

Built by Bo Bramer. Copyright 2023 Bo Bramer (<bbramer@uci.edu>)
