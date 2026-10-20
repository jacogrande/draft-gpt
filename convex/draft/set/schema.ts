export type Schema = {
  type: string;
  properties?: Record<string, Schema>;
  required?: string[];
  additionalProperties?: boolean;
  items?: Schema;
  enum?: readonly (string | number)[];
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
};
export const str = (maxLength = 1800): Schema => ({
  type: "string",
  maxLength,
});
export const nonempty = (maxLength = 1800): Schema => ({
  ...str(maxLength),
  minLength: 1,
});
export const num = (minimum = 0, maximum = 100): Schema => ({
  type: "number",
  minimum,
  maximum,
});
export const bool: Schema = { type: "boolean" };
export const choice = (values: readonly string[]): Schema => ({
  type: "string",
  enum: values,
});
export const arr = (items: Schema, minItems = 0, maxItems = 300): Schema => ({
  type: "array",
  items,
  minItems,
  maxItems,
});
export const obj = (properties: Record<string, Schema>): Schema => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

export const validate = (
  value: unknown,
  schema: Schema,
  path = "reply"
): void => {
  const fail = (reason: string): never => {
    throw new Error(`${path}: ${reason}`);
  };
  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value))
      fail("expected object");
    const record = value as Record<string, unknown>;
    for (const [key, child] of Object.entries(schema.properties ?? {}))
      validate(record[key], child, `${path}.${key}`);
    if (Object.keys(record).some((key) => !schema.properties?.[key]))
      fail("unexpected field");
  } else if (schema.type === "array") {
    if (!Array.isArray(value)) fail("expected array");
    const list = value as unknown[];
    if (
      list.length < (schema.minItems ?? 0) ||
      list.length > (schema.maxItems ?? Infinity)
    )
      fail("wrong array length");
    list.forEach((item, index) =>
      validate(item, schema.items!, `${path}[${index}]`)
    );
  } else {
    if (typeof value !== schema.type) fail(`expected ${schema.type}`);
    if (
      typeof value === "number" &&
      (!Number.isFinite(value) ||
        value < (schema.minimum ?? -Infinity) ||
        value > (schema.maximum ?? Infinity))
    )
      fail("number outside range");
    if (
      typeof value === "string" &&
      (value.trim().length < (schema.minLength ?? 0) ||
        value.length > (schema.maxLength ?? Infinity))
    )
      fail("text outside length limit");
    if (schema.enum && !schema.enum.includes(value as string))
      fail("invalid option");
  }
};
