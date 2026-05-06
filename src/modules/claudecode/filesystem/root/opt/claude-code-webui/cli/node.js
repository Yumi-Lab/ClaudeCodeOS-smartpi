#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@anthropic-ai/claude-code/sdk.mjs
var sdk_exports = {};
__export(sdk_exports, {
  createSdkMcpServer: () => createSdkMcpServer,
  query: () => query,
  tool: () => tool
});
import { join as join2 } from "path";
import { fileURLToPath } from "url";
import { setMaxListeners } from "events";
import { spawn } from "child_process";
import { createInterface } from "readline";
import * as fs2 from "fs";
import { stat as statPromise } from "fs/promises";
function createAbortController(maxListeners = DEFAULT_MAX_LISTENERS) {
  const controller = new AbortController();
  setMaxListeners(maxListeners, controller.signal);
  return controller;
}
function getFsImplementation() {
  return activeFs;
}
function isNativeBinary(executablePath) {
  const jsExtensions = [".js", ".mjs", ".tsx", ".ts", ".jsx"];
  return !jsExtensions.some((ext) => executablePath.endsWith(ext));
}
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      ctx.schemaErrorMap,
      overrideMap,
      overrideMap === en_default ? void 0 : en_default
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util3.objectKeys(b);
    const sharedKeys = util3.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
function mergeCapabilities(base, additional) {
  return Object.entries(additional).reduce((acc, [key, value]) => {
    if (value && typeof value === "object") {
      acc[key] = acc[key] ? { ...acc[key], ...value } : value;
    } else {
      acc[key] = value;
    }
    return acc;
  }, { ...base });
}
function addErrorMessage(res, key, errorMessage, refs) {
  if (!refs?.errorMessages)
    return;
  if (errorMessage) {
    res.errorMessage = {
      ...res.errorMessage,
      [key]: errorMessage
    };
  }
}
function setResponseValueAndErrors(res, key, value, errorMessage, refs) {
  res[key] = value;
  addErrorMessage(res, key, errorMessage, refs);
}
function parseAnyDef() {
  return {};
}
function parseArrayDef(def, refs) {
  const res = {
    type: "array"
  };
  if (def.type?._def && def.type?._def?.typeName !== ZodFirstPartyTypeKind.ZodAny) {
    res.items = parseDef(def.type._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items"]
    });
  }
  if (def.minLength) {
    setResponseValueAndErrors(res, "minItems", def.minLength.value, def.minLength.message, refs);
  }
  if (def.maxLength) {
    setResponseValueAndErrors(res, "maxItems", def.maxLength.value, def.maxLength.message, refs);
  }
  if (def.exactLength) {
    setResponseValueAndErrors(res, "minItems", def.exactLength.value, def.exactLength.message, refs);
    setResponseValueAndErrors(res, "maxItems", def.exactLength.value, def.exactLength.message, refs);
  }
  return res;
}
function parseBigintDef(def, refs) {
  const res = {
    type: "integer",
    format: "int64"
  };
  if (!def.checks)
    return res;
  for (const check of def.checks) {
    switch (check.kind) {
      case "min":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMinimum = true;
          }
          setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
        }
        break;
      case "max":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMaximum = true;
          }
          setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
        }
        break;
      case "multipleOf":
        setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
        break;
    }
  }
  return res;
}
function parseBooleanDef() {
  return {
    type: "boolean"
  };
}
function parseBrandedDef(_def, refs) {
  return parseDef(_def.type._def, refs);
}
function parseDateDef(def, refs, overrideDateStrategy) {
  const strategy = overrideDateStrategy ?? refs.dateStrategy;
  if (Array.isArray(strategy)) {
    return {
      anyOf: strategy.map((item, i) => parseDateDef(def, refs, item))
    };
  }
  switch (strategy) {
    case "string":
    case "format:date-time":
      return {
        type: "string",
        format: "date-time"
      };
    case "format:date":
      return {
        type: "string",
        format: "date"
      };
    case "integer":
      return integerDateParser(def, refs);
  }
}
function parseDefaultDef(_def, refs) {
  return {
    ...parseDef(_def.innerType._def, refs),
    default: _def.defaultValue()
  };
}
function parseEffectsDef(_def, refs) {
  return refs.effectStrategy === "input" ? parseDef(_def.schema._def, refs) : {};
}
function parseEnumDef(def) {
  return {
    type: "string",
    enum: Array.from(def.values)
  };
}
function parseIntersectionDef(def, refs) {
  const allOf = [
    parseDef(def.left._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "0"]
    }),
    parseDef(def.right._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "1"]
    })
  ].filter((x) => !!x);
  let unevaluatedProperties = refs.target === "jsonSchema2019-09" ? { unevaluatedProperties: false } : void 0;
  const mergedAllOf = [];
  allOf.forEach((schema) => {
    if (isJsonSchema7AllOfType(schema)) {
      mergedAllOf.push(...schema.allOf);
      if (schema.unevaluatedProperties === void 0) {
        unevaluatedProperties = void 0;
      }
    } else {
      let nestedSchema = schema;
      if ("additionalProperties" in schema && schema.additionalProperties === false) {
        const { additionalProperties, ...rest } = schema;
        nestedSchema = rest;
      } else {
        unevaluatedProperties = void 0;
      }
      mergedAllOf.push(nestedSchema);
    }
  });
  return mergedAllOf.length ? {
    allOf: mergedAllOf,
    ...unevaluatedProperties
  } : void 0;
}
function parseLiteralDef(def, refs) {
  const parsedType = typeof def.value;
  if (parsedType !== "bigint" && parsedType !== "number" && parsedType !== "boolean" && parsedType !== "string") {
    return {
      type: Array.isArray(def.value) ? "array" : "object"
    };
  }
  if (refs.target === "openApi3") {
    return {
      type: parsedType === "bigint" ? "integer" : parsedType,
      enum: [def.value]
    };
  }
  return {
    type: parsedType === "bigint" ? "integer" : parsedType,
    const: def.value
  };
}
function parseStringDef(def, refs) {
  const res = {
    type: "string"
  };
  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case "min":
          setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
          break;
        case "max":
          setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
          break;
        case "email":
          switch (refs.emailStrategy) {
            case "format:email":
              addFormat(res, "email", check.message, refs);
              break;
            case "format:idn-email":
              addFormat(res, "idn-email", check.message, refs);
              break;
            case "pattern:zod":
              addPattern(res, zodPatterns.email, check.message, refs);
              break;
          }
          break;
        case "url":
          addFormat(res, "uri", check.message, refs);
          break;
        case "uuid":
          addFormat(res, "uuid", check.message, refs);
          break;
        case "regex":
          addPattern(res, check.regex, check.message, refs);
          break;
        case "cuid":
          addPattern(res, zodPatterns.cuid, check.message, refs);
          break;
        case "cuid2":
          addPattern(res, zodPatterns.cuid2, check.message, refs);
          break;
        case "startsWith":
          addPattern(res, RegExp(`^${escapeLiteralCheckValue(check.value, refs)}`), check.message, refs);
          break;
        case "endsWith":
          addPattern(res, RegExp(`${escapeLiteralCheckValue(check.value, refs)}$`), check.message, refs);
          break;
        case "datetime":
          addFormat(res, "date-time", check.message, refs);
          break;
        case "date":
          addFormat(res, "date", check.message, refs);
          break;
        case "time":
          addFormat(res, "time", check.message, refs);
          break;
        case "duration":
          addFormat(res, "duration", check.message, refs);
          break;
        case "length":
          setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
          setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
          break;
        case "includes": {
          addPattern(res, RegExp(escapeLiteralCheckValue(check.value, refs)), check.message, refs);
          break;
        }
        case "ip": {
          if (check.version !== "v6") {
            addFormat(res, "ipv4", check.message, refs);
          }
          if (check.version !== "v4") {
            addFormat(res, "ipv6", check.message, refs);
          }
          break;
        }
        case "base64url":
          addPattern(res, zodPatterns.base64url, check.message, refs);
          break;
        case "jwt":
          addPattern(res, zodPatterns.jwt, check.message, refs);
          break;
        case "cidr": {
          if (check.version !== "v6") {
            addPattern(res, zodPatterns.ipv4Cidr, check.message, refs);
          }
          if (check.version !== "v4") {
            addPattern(res, zodPatterns.ipv6Cidr, check.message, refs);
          }
          break;
        }
        case "emoji":
          addPattern(res, zodPatterns.emoji(), check.message, refs);
          break;
        case "ulid": {
          addPattern(res, zodPatterns.ulid, check.message, refs);
          break;
        }
        case "base64": {
          switch (refs.base64Strategy) {
            case "format:binary": {
              addFormat(res, "binary", check.message, refs);
              break;
            }
            case "contentEncoding:base64": {
              setResponseValueAndErrors(res, "contentEncoding", "base64", check.message, refs);
              break;
            }
            case "pattern:zod": {
              addPattern(res, zodPatterns.base64, check.message, refs);
              break;
            }
          }
          break;
        }
        case "nanoid": {
          addPattern(res, zodPatterns.nanoid, check.message, refs);
        }
        case "toLowerCase":
        case "toUpperCase":
        case "trim":
          break;
        default:
          /* @__PURE__ */ ((_) => {
          })(check);
      }
    }
  }
  return res;
}
function escapeLiteralCheckValue(literal, refs) {
  return refs.patternStrategy === "escape" ? escapeNonAlphaNumeric(literal) : literal;
}
function escapeNonAlphaNumeric(source) {
  let result = "";
  for (let i = 0; i < source.length; i++) {
    if (!ALPHA_NUMERIC.has(source[i])) {
      result += "\\";
    }
    result += source[i];
  }
  return result;
}
function addFormat(schema, value, message, refs) {
  if (schema.format || schema.anyOf?.some((x) => x.format)) {
    if (!schema.anyOf) {
      schema.anyOf = [];
    }
    if (schema.format) {
      schema.anyOf.push({
        format: schema.format,
        ...schema.errorMessage && refs.errorMessages && {
          errorMessage: { format: schema.errorMessage.format }
        }
      });
      delete schema.format;
      if (schema.errorMessage) {
        delete schema.errorMessage.format;
        if (Object.keys(schema.errorMessage).length === 0) {
          delete schema.errorMessage;
        }
      }
    }
    schema.anyOf.push({
      format: value,
      ...message && refs.errorMessages && { errorMessage: { format: message } }
    });
  } else {
    setResponseValueAndErrors(schema, "format", value, message, refs);
  }
}
function addPattern(schema, regex, message, refs) {
  if (schema.pattern || schema.allOf?.some((x) => x.pattern)) {
    if (!schema.allOf) {
      schema.allOf = [];
    }
    if (schema.pattern) {
      schema.allOf.push({
        pattern: schema.pattern,
        ...schema.errorMessage && refs.errorMessages && {
          errorMessage: { pattern: schema.errorMessage.pattern }
        }
      });
      delete schema.pattern;
      if (schema.errorMessage) {
        delete schema.errorMessage.pattern;
        if (Object.keys(schema.errorMessage).length === 0) {
          delete schema.errorMessage;
        }
      }
    }
    schema.allOf.push({
      pattern: stringifyRegExpWithFlags(regex, refs),
      ...message && refs.errorMessages && { errorMessage: { pattern: message } }
    });
  } else {
    setResponseValueAndErrors(schema, "pattern", stringifyRegExpWithFlags(regex, refs), message, refs);
  }
}
function stringifyRegExpWithFlags(regex, refs) {
  if (!refs.applyRegexFlags || !regex.flags) {
    return regex.source;
  }
  const flags = {
    i: regex.flags.includes("i"),
    m: regex.flags.includes("m"),
    s: regex.flags.includes("s")
  };
  const source = flags.i ? regex.source.toLowerCase() : regex.source;
  let pattern = "";
  let isEscaped = false;
  let inCharGroup = false;
  let inCharRange = false;
  for (let i = 0; i < source.length; i++) {
    if (isEscaped) {
      pattern += source[i];
      isEscaped = false;
      continue;
    }
    if (flags.i) {
      if (inCharGroup) {
        if (source[i].match(/[a-z]/)) {
          if (inCharRange) {
            pattern += source[i];
            pattern += `${source[i - 2]}-${source[i]}`.toUpperCase();
            inCharRange = false;
          } else if (source[i + 1] === "-" && source[i + 2]?.match(/[a-z]/)) {
            pattern += source[i];
            inCharRange = true;
          } else {
            pattern += `${source[i]}${source[i].toUpperCase()}`;
          }
          continue;
        }
      } else if (source[i].match(/[a-z]/)) {
        pattern += `[${source[i]}${source[i].toUpperCase()}]`;
        continue;
      }
    }
    if (flags.m) {
      if (source[i] === "^") {
        pattern += `(^|(?<=[\r
]))`;
        continue;
      } else if (source[i] === "$") {
        pattern += `($|(?=[\r
]))`;
        continue;
      }
    }
    if (flags.s && source[i] === ".") {
      pattern += inCharGroup ? `${source[i]}\r
` : `[${source[i]}\r
]`;
      continue;
    }
    pattern += source[i];
    if (source[i] === "\\") {
      isEscaped = true;
    } else if (inCharGroup && source[i] === "]") {
      inCharGroup = false;
    } else if (!inCharGroup && source[i] === "[") {
      inCharGroup = true;
    }
  }
  try {
    new RegExp(pattern);
  } catch {
    console.warn(`Could not convert regex pattern at ${refs.currentPath.join("/")} to a flag-independent form! Falling back to the flag-ignorant source`);
    return regex.source;
  }
  return pattern;
}
function parseRecordDef(def, refs) {
  if (refs.target === "openAi") {
    console.warn("Warning: OpenAI may not support records in schemas! Try an array of key-value pairs instead.");
  }
  if (refs.target === "openApi3" && def.keyType?._def.typeName === ZodFirstPartyTypeKind.ZodEnum) {
    return {
      type: "object",
      required: def.keyType._def.values,
      properties: def.keyType._def.values.reduce((acc, key) => ({
        ...acc,
        [key]: parseDef(def.valueType._def, {
          ...refs,
          currentPath: [...refs.currentPath, "properties", key]
        }) ?? {}
      }), {}),
      additionalProperties: refs.rejectedAdditionalProperties
    };
  }
  const schema = {
    type: "object",
    additionalProperties: parseDef(def.valueType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    }) ?? refs.allowedAdditionalProperties
  };
  if (refs.target === "openApi3") {
    return schema;
  }
  if (def.keyType?._def.typeName === ZodFirstPartyTypeKind.ZodString && def.keyType._def.checks?.length) {
    const { type, ...keyType } = parseStringDef(def.keyType._def, refs);
    return {
      ...schema,
      propertyNames: keyType
    };
  } else if (def.keyType?._def.typeName === ZodFirstPartyTypeKind.ZodEnum) {
    return {
      ...schema,
      propertyNames: {
        enum: def.keyType._def.values
      }
    };
  } else if (def.keyType?._def.typeName === ZodFirstPartyTypeKind.ZodBranded && def.keyType._def.type._def.typeName === ZodFirstPartyTypeKind.ZodString && def.keyType._def.type._def.checks?.length) {
    const { type, ...keyType } = parseBrandedDef(def.keyType._def, refs);
    return {
      ...schema,
      propertyNames: keyType
    };
  }
  return schema;
}
function parseMapDef(def, refs) {
  if (refs.mapStrategy === "record") {
    return parseRecordDef(def, refs);
  }
  const keys = parseDef(def.keyType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items", "items", "0"]
  }) || {};
  const values = parseDef(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items", "items", "1"]
  }) || {};
  return {
    type: "array",
    maxItems: 125,
    items: {
      type: "array",
      items: [keys, values],
      minItems: 2,
      maxItems: 2
    }
  };
}
function parseNativeEnumDef(def) {
  const object = def.values;
  const actualKeys = Object.keys(def.values).filter((key) => {
    return typeof object[object[key]] !== "number";
  });
  const actualValues = actualKeys.map((key) => object[key]);
  const parsedTypes = Array.from(new Set(actualValues.map((values) => typeof values)));
  return {
    type: parsedTypes.length === 1 ? parsedTypes[0] === "string" ? "string" : "number" : ["string", "number"],
    enum: actualValues
  };
}
function parseNeverDef() {
  return {
    not: {}
  };
}
function parseNullDef(refs) {
  return refs.target === "openApi3" ? {
    enum: ["null"],
    nullable: true
  } : {
    type: "null"
  };
}
function parseUnionDef(def, refs) {
  if (refs.target === "openApi3")
    return asAnyOf(def, refs);
  const options = def.options instanceof Map ? Array.from(def.options.values()) : def.options;
  if (options.every((x) => x._def.typeName in primitiveMappings && (!x._def.checks || !x._def.checks.length))) {
    const types2 = options.reduce((types3, x) => {
      const type = primitiveMappings[x._def.typeName];
      return type && !types3.includes(type) ? [...types3, type] : types3;
    }, []);
    return {
      type: types2.length > 1 ? types2 : types2[0]
    };
  } else if (options.every((x) => x._def.typeName === "ZodLiteral" && !x.description)) {
    const types2 = options.reduce((acc, x) => {
      const type = typeof x._def.value;
      switch (type) {
        case "string":
        case "number":
        case "boolean":
          return [...acc, type];
        case "bigint":
          return [...acc, "integer"];
        case "object":
          if (x._def.value === null)
            return [...acc, "null"];
        case "symbol":
        case "undefined":
        case "function":
        default:
          return acc;
      }
    }, []);
    if (types2.length === options.length) {
      const uniqueTypes = types2.filter((x, i, a) => a.indexOf(x) === i);
      return {
        type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
        enum: options.reduce((acc, x) => {
          return acc.includes(x._def.value) ? acc : [...acc, x._def.value];
        }, [])
      };
    }
  } else if (options.every((x) => x._def.typeName === "ZodEnum")) {
    return {
      type: "string",
      enum: options.reduce((acc, x) => [
        ...acc,
        ...x._def.values.filter((x2) => !acc.includes(x2))
      ], [])
    };
  }
  return asAnyOf(def, refs);
}
function parseNullableDef(def, refs) {
  if (["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(def.innerType._def.typeName) && (!def.innerType._def.checks || !def.innerType._def.checks.length)) {
    if (refs.target === "openApi3") {
      return {
        type: primitiveMappings[def.innerType._def.typeName],
        nullable: true
      };
    }
    return {
      type: [
        primitiveMappings[def.innerType._def.typeName],
        "null"
      ]
    };
  }
  if (refs.target === "openApi3") {
    const base2 = parseDef(def.innerType._def, {
      ...refs,
      currentPath: [...refs.currentPath]
    });
    if (base2 && "$ref" in base2)
      return { allOf: [base2], nullable: true };
    return base2 && { ...base2, nullable: true };
  }
  const base = parseDef(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "0"]
  });
  return base && { anyOf: [base, { type: "null" }] };
}
function parseNumberDef(def, refs) {
  const res = {
    type: "number"
  };
  if (!def.checks)
    return res;
  for (const check of def.checks) {
    switch (check.kind) {
      case "int":
        res.type = "integer";
        addErrorMessage(res, "type", check.message, refs);
        break;
      case "min":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMinimum = true;
          }
          setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
        }
        break;
      case "max":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMaximum = true;
          }
          setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
        }
        break;
      case "multipleOf":
        setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
        break;
    }
  }
  return res;
}
function parseObjectDef(def, refs) {
  const forceOptionalIntoNullable = refs.target === "openAi";
  const result = {
    type: "object",
    properties: {}
  };
  const required = [];
  const shape = def.shape();
  for (const propName in shape) {
    let propDef = shape[propName];
    if (propDef === void 0 || propDef._def === void 0) {
      continue;
    }
    let propOptional = safeIsOptional(propDef);
    if (propOptional && forceOptionalIntoNullable) {
      if (propDef instanceof ZodOptional) {
        propDef = propDef._def.innerType;
      }
      if (!propDef.isNullable()) {
        propDef = propDef.nullable();
      }
      propOptional = false;
    }
    const parsedDef = parseDef(propDef._def, {
      ...refs,
      currentPath: [...refs.currentPath, "properties", propName],
      propertyPath: [...refs.currentPath, "properties", propName]
    });
    if (parsedDef === void 0) {
      continue;
    }
    result.properties[propName] = parsedDef;
    if (!propOptional) {
      required.push(propName);
    }
  }
  if (required.length) {
    result.required = required;
  }
  const additionalProperties = decideAdditionalProperties(def, refs);
  if (additionalProperties !== void 0) {
    result.additionalProperties = additionalProperties;
  }
  return result;
}
function decideAdditionalProperties(def, refs) {
  if (def.catchall._def.typeName !== "ZodNever") {
    return parseDef(def.catchall._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    });
  }
  switch (def.unknownKeys) {
    case "passthrough":
      return refs.allowedAdditionalProperties;
    case "strict":
      return refs.rejectedAdditionalProperties;
    case "strip":
      return refs.removeAdditionalStrategy === "strict" ? refs.allowedAdditionalProperties : refs.rejectedAdditionalProperties;
  }
}
function safeIsOptional(schema) {
  try {
    return schema.isOptional();
  } catch {
    return true;
  }
}
function parsePromiseDef(def, refs) {
  return parseDef(def.type._def, refs);
}
function parseSetDef(def, refs) {
  const items = parseDef(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items"]
  });
  const schema = {
    type: "array",
    uniqueItems: true,
    items
  };
  if (def.minSize) {
    setResponseValueAndErrors(schema, "minItems", def.minSize.value, def.minSize.message, refs);
  }
  if (def.maxSize) {
    setResponseValueAndErrors(schema, "maxItems", def.maxSize.value, def.maxSize.message, refs);
  }
  return schema;
}
function parseTupleDef(def, refs) {
  if (def.rest) {
    return {
      type: "array",
      minItems: def.items.length,
      items: def.items.map((x, i) => parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "items", `${i}`]
      })).reduce((acc, x) => x === void 0 ? acc : [...acc, x], []),
      additionalItems: parseDef(def.rest._def, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalItems"]
      })
    };
  } else {
    return {
      type: "array",
      minItems: def.items.length,
      maxItems: def.items.length,
      items: def.items.map((x, i) => parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "items", `${i}`]
      })).reduce((acc, x) => x === void 0 ? acc : [...acc, x], [])
    };
  }
}
function parseUndefinedDef() {
  return {
    not: {}
  };
}
function parseUnknownDef() {
  return {};
}
function parseDef(def, refs, forceResolution = false) {
  const seenItem = refs.seen.get(def);
  if (refs.override) {
    const overrideResult = refs.override?.(def, refs, seenItem, forceResolution);
    if (overrideResult !== ignoreOverride) {
      return overrideResult;
    }
  }
  if (seenItem && !forceResolution) {
    const seenSchema = get$ref(seenItem, refs);
    if (seenSchema !== void 0) {
      return seenSchema;
    }
  }
  const newItem = { def, path: refs.currentPath, jsonSchema: void 0 };
  refs.seen.set(def, newItem);
  const jsonSchemaOrGetter = selectParser(def, def.typeName, refs);
  const jsonSchema = typeof jsonSchemaOrGetter === "function" ? parseDef(jsonSchemaOrGetter(), refs) : jsonSchemaOrGetter;
  if (jsonSchema) {
    addMeta(def, refs, jsonSchema);
  }
  if (refs.postProcess) {
    const postProcessResult = refs.postProcess(jsonSchema, def, refs);
    newItem.jsonSchema = jsonSchema;
    return postProcessResult;
  }
  newItem.jsonSchema = jsonSchema;
  return jsonSchema;
}
function processCreateParams2(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    var _a, _b;
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message !== null && message !== void 0 ? message : ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: (_a = message !== null && message !== void 0 ? message : required_error) !== null && _a !== void 0 ? _a : ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: (_b = message !== null && message !== void 0 ? message : invalid_type_error) !== null && _b !== void 0 ? _b : ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
function isZodRawShape(obj) {
  if (typeof obj !== "object" || obj === null)
    return false;
  const isEmptyObject = Object.keys(obj).length === 0;
  return isEmptyObject || Object.values(obj).some(isZodTypeLike);
}
function isZodTypeLike(value) {
  return value !== null && typeof value === "object" && "parse" in value && typeof value.parse === "function" && "safeParse" in value && typeof value.safeParse === "function";
}
function promptArgumentsFromSchema(schema) {
  return Object.entries(schema.shape).map(([name, field]) => ({
    name,
    description: field.description,
    required: !field.isOptional()
  }));
}
function createCompletionResult(suggestions) {
  return {
    completion: {
      values: suggestions.slice(0, 100),
      total: suggestions.length,
      hasMore: suggestions.length > 100
    }
  };
}
function tool(name, description, inputSchema, handler) {
  return { name, description, inputSchema, handler };
}
function createSdkMcpServer(options) {
  const server = new McpServer({
    name: options.name,
    version: options.version ?? "1.0.0"
  }, {
    capabilities: {
      tools: options.tools ? {} : void 0
    }
  });
  if (options.tools) {
    options.tools.forEach((toolDef) => {
      server.tool(toolDef.name, toolDef.description, toolDef.inputSchema, toolDef.handler);
    });
  }
  return {
    type: "sdk",
    name: options.name,
    instance: server
  };
}
function query({
  prompt,
  options: {
    abortController = createAbortController(),
    additionalDirectories = [],
    allowedTools = [],
    appendSystemPrompt,
    canUseTool,
    continue: continueConversation,
    customSystemPrompt,
    cwd,
    disallowedTools = [],
    env,
    executable = isRunningWithBun() ? "bun" : "node",
    executableArgs = [],
    extraArgs = {},
    fallbackModel,
    hooks,
    maxTurns,
    mcpServers,
    model,
    pathToClaudeCodeExecutable,
    permissionMode = "default",
    permissionPromptToolName,
    resume,
    stderr,
    strictMcpConfig
  } = {}
}) {
  if (!env) {
    env = { ...process.env };
  }
  if (!env.CLAUDE_CODE_ENTRYPOINT) {
    env.CLAUDE_CODE_ENTRYPOINT = "sdk-ts";
  }
  if (pathToClaudeCodeExecutable === void 0) {
    const filename = fileURLToPath(import.meta.url);
    const dirname3 = join2(filename, "..");
    pathToClaudeCodeExecutable = join2(dirname3, "cli.js");
  }
  const allMcpServers = {};
  const sdkMcpServers = /* @__PURE__ */ new Map();
  if (mcpServers) {
    for (const [name, config] of Object.entries(mcpServers)) {
      if (config.type === "sdk") {
        sdkMcpServers.set(name, config.instance);
        allMcpServers[name] = {
          type: "sdk",
          name
        };
      } else {
        allMcpServers[name] = config;
      }
    }
  }
  const isStreamingMode = typeof prompt !== "string";
  const transport = new ProcessTransport({
    prompt,
    abortController,
    additionalDirectories,
    cwd,
    executable,
    executableArgs,
    extraArgs,
    pathToClaudeCodeExecutable,
    env,
    stderr,
    customSystemPrompt,
    appendSystemPrompt,
    maxTurns,
    model,
    fallbackModel,
    permissionMode,
    permissionPromptToolName,
    continueConversation,
    resume,
    allowedTools,
    disallowedTools,
    mcpServers,
    strictMcpConfig,
    canUseTool: !!canUseTool,
    hooks: !!hooks
  });
  const query2 = new Query(transport, isStreamingMode, canUseTool, hooks, abortController, sdkMcpServers);
  if (typeof prompt !== "string") {
    query2.streamInput(prompt);
  }
  return query2;
}
function isRunningWithBun() {
  return process.versions.bun !== void 0 || process.env.BUN_INSTALL !== void 0;
}
var __create2, __getProtoOf2, __defProp2, __getOwnPropNames2, __hasOwnProp2, __toESM2, __commonJS2, __export2, require_uri_all, require_fast_deep_equal, require_ucs2length, require_util, require_schema_obj, require_json_schema_traverse, require_resolve, require_error_classes, require_fast_json_stable_stringify, require_validate, require_compile, require_cache, require_formats, require_ref, require_allOf, require_anyOf, require_comment, require_const, require_contains, require_dependencies, require_enum, require_format, require_if, require_items, require__limit, require__limitItems, require__limitLength, require__limitProperties, require_multipleOf, require_not, require_oneOf, require_pattern, require_properties, require_propertyNames, require_required, require_uniqueItems, require_dotjs, require_rules, require_data, require_async, require_custom, require_json_schema_draft_07, require_definition_schema, require_keyword, require_data2, require_ajv, DEFAULT_MAX_LISTENERS, NodeFsOperations, activeFs, AbortError, ProcessTransport, Stream, SdkControlServerTransport, Query, exports_external, util3, objectUtil, ZodParsedType, getParsedType, ZodIssueCode, quotelessJson, ZodError, errorMap, en_default, overrideErrorMap, makeIssue, EMPTY_PATH, ParseStatus, INVALID, DIRTY, OK, isAborted, isDirty, isValid, isAsync, errorUtil, ParseInputLazyPath, handleResult, ZodType, cuidRegex, cuid2Regex, ulidRegex, uuidRegex, nanoidRegex, jwtRegex, durationRegex, emailRegex, _emojiRegex, emojiRegex, ipv4Regex, ipv4CidrRegex, ipv6Regex, ipv6CidrRegex, base64Regex, base64urlRegex, dateRegexSource, dateRegex, ZodString, ZodNumber, ZodBigInt, ZodBoolean, ZodDate, ZodSymbol, ZodUndefined, ZodNull, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodArray, ZodObject, ZodUnion, getDiscriminator, ZodDiscriminatedUnion, ZodIntersection, ZodTuple, ZodRecord, ZodMap, ZodSet, ZodFunction, ZodLazy, ZodLiteral, ZodEnum, ZodNativeEnum, ZodPromise, ZodEffects, ZodOptional, ZodNullable, ZodDefault, ZodCatch, ZodNaN, BRAND, ZodBranded, ZodPipeline, ZodReadonly, late, ZodFirstPartyTypeKind, instanceOfType, stringType, numberType, nanType, bigIntType, booleanType, dateType, symbolType, undefinedType, nullType, anyType, unknownType, neverType, voidType, arrayType, objectType, strictObjectType, unionType, discriminatedUnionType, intersectionType, tupleType, recordType, mapType, setType, functionType, lazyType, literalType, enumType, nativeEnumType, promiseType, effectsType, optionalType, nullableType, preprocessType, pipelineType, ostring, onumber, oboolean, coerce, NEVER, LATEST_PROTOCOL_VERSION, SUPPORTED_PROTOCOL_VERSIONS, JSONRPC_VERSION, ProgressTokenSchema, CursorSchema, RequestMetaSchema, BaseRequestParamsSchema, RequestSchema, BaseNotificationParamsSchema, NotificationSchema, ResultSchema, RequestIdSchema, JSONRPCRequestSchema, isJSONRPCRequest, JSONRPCNotificationSchema, isJSONRPCNotification, JSONRPCResponseSchema, isJSONRPCResponse, ErrorCode, JSONRPCErrorSchema, isJSONRPCError, JSONRPCMessageSchema, EmptyResultSchema, CancelledNotificationSchema, BaseMetadataSchema, ImplementationSchema, ClientCapabilitiesSchema, InitializeRequestSchema, ServerCapabilitiesSchema, InitializeResultSchema, InitializedNotificationSchema, PingRequestSchema, ProgressSchema, ProgressNotificationSchema, PaginatedRequestSchema, PaginatedResultSchema, ResourceContentsSchema, TextResourceContentsSchema, Base64Schema, BlobResourceContentsSchema, ResourceSchema, ResourceTemplateSchema, ListResourcesRequestSchema, ListResourcesResultSchema, ListResourceTemplatesRequestSchema, ListResourceTemplatesResultSchema, ReadResourceRequestSchema, ReadResourceResultSchema, ResourceListChangedNotificationSchema, SubscribeRequestSchema, UnsubscribeRequestSchema, ResourceUpdatedNotificationSchema, PromptArgumentSchema, PromptSchema, ListPromptsRequestSchema, ListPromptsResultSchema, GetPromptRequestSchema, TextContentSchema, ImageContentSchema, AudioContentSchema, EmbeddedResourceSchema, ResourceLinkSchema, ContentBlockSchema, PromptMessageSchema, GetPromptResultSchema, PromptListChangedNotificationSchema, ToolAnnotationsSchema, ToolSchema, ListToolsRequestSchema, ListToolsResultSchema, CallToolResultSchema, CompatibilityCallToolResultSchema, CallToolRequestSchema, ToolListChangedNotificationSchema, LoggingLevelSchema, SetLevelRequestSchema, LoggingMessageNotificationSchema, ModelHintSchema, ModelPreferencesSchema, SamplingMessageSchema, CreateMessageRequestSchema, CreateMessageResultSchema, BooleanSchemaSchema, StringSchemaSchema, NumberSchemaSchema, EnumSchemaSchema, PrimitiveSchemaDefinitionSchema, ElicitRequestSchema, ElicitResultSchema, ResourceTemplateReferenceSchema, PromptReferenceSchema, CompleteRequestSchema, CompleteResultSchema, RootSchema, ListRootsRequestSchema, ListRootsResultSchema, RootsListChangedNotificationSchema, ClientRequestSchema, ClientNotificationSchema, ClientResultSchema, ServerRequestSchema, ServerNotificationSchema, ServerResultSchema, McpError, DEFAULT_REQUEST_TIMEOUT_MSEC, Protocol, import_ajv, Server, ignoreOverride, defaultOptions, getDefaultOptions, getRefs, parseCatchDef, integerDateParser, isJsonSchema7AllOfType, emojiRegex2, zodPatterns, ALPHA_NUMERIC, primitiveMappings, asAnyOf, parseOptionalDef, parsePipelineDef, parseReadonlyDef, selectParser, get$ref, getRelativePath, addMeta, zodToJsonSchema, McpZodTypeKind, Completable, McpServer, EMPTY_OBJECT_JSON_SCHEMA, EMPTY_COMPLETION_RESULT;
var init_sdk = __esm({
  "node_modules/@anthropic-ai/claude-code/sdk.mjs"() {
    __create2 = Object.create;
    __getProtoOf2 = Object.getPrototypeOf;
    __defProp2 = Object.defineProperty;
    __getOwnPropNames2 = Object.getOwnPropertyNames;
    __hasOwnProp2 = Object.prototype.hasOwnProperty;
    __toESM2 = (mod, isNodeMode, target) => {
      target = mod != null ? __create2(__getProtoOf2(mod)) : {};
      const to = isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target;
      for (let key of __getOwnPropNames2(mod))
        if (!__hasOwnProp2.call(to, key))
          __defProp2(to, key, {
            get: () => mod[key],
            enumerable: true
          });
      return to;
    };
    __commonJS2 = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
    __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, {
          get: all[name],
          enumerable: true,
          configurable: true,
          set: (newValue) => all[name] = () => newValue
        });
    };
    require_uri_all = __commonJS2((exports, module) => {
      (function(global2, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : factory(global2.URI = global2.URI || {});
      })(exports, function(exports2) {
        function merge() {
          for (var _len = arguments.length, sets = Array(_len), _key = 0; _key < _len; _key++) {
            sets[_key] = arguments[_key];
          }
          if (sets.length > 1) {
            sets[0] = sets[0].slice(0, -1);
            var xl = sets.length - 1;
            for (var x = 1; x < xl; ++x) {
              sets[x] = sets[x].slice(1, -1);
            }
            sets[xl] = sets[xl].slice(1);
            return sets.join("");
          } else {
            return sets[0];
          }
        }
        function subexp(str) {
          return "(?:" + str + ")";
        }
        function typeOf(o) {
          return o === void 0 ? "undefined" : o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase();
        }
        function toUpperCase(str) {
          return str.toUpperCase();
        }
        function toArray(obj) {
          return obj !== void 0 && obj !== null ? obj instanceof Array ? obj : typeof obj.length !== "number" || obj.split || obj.setInterval || obj.call ? [obj] : Array.prototype.slice.call(obj) : [];
        }
        function assign(target, source) {
          var obj = target;
          if (source) {
            for (var key in source) {
              obj[key] = source[key];
            }
          }
          return obj;
        }
        function buildExps(isIRI2) {
          var ALPHA$$ = "[A-Za-z]", CR$ = "[\\x0D]", DIGIT$$ = "[0-9]", DQUOTE$$ = "[\\x22]", HEXDIG$$2 = merge(DIGIT$$, "[A-Fa-f]"), LF$$ = "[\\x0A]", SP$$ = "[\\x20]", PCT_ENCODED$2 = subexp(subexp("%[EFef]" + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2) + "|" + subexp("%" + HEXDIG$$2 + HEXDIG$$2)), GEN_DELIMS$$ = "[\\:\\/\\?\\#\\[\\]\\@]", SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]", RESERVED$$ = merge(GEN_DELIMS$$, SUB_DELIMS$$), UCSCHAR$$ = isIRI2 ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]", IPRIVATE$$ = isIRI2 ? "[\\uE000-\\uF8FF]" : "[]", UNRESERVED$$2 = merge(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]", UCSCHAR$$), SCHEME$ = subexp(ALPHA$$ + merge(ALPHA$$, DIGIT$$, "[\\+\\-\\.]") + "*"), USERINFO$ = subexp(subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\:]")) + "*"), DEC_OCTET$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("[1-9]" + DIGIT$$) + "|" + DIGIT$$), DEC_OCTET_RELAXED$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("0?[1-9]" + DIGIT$$) + "|0?0?" + DIGIT$$), IPV4ADDRESS$ = subexp(DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$), H16$ = subexp(HEXDIG$$2 + "{1,4}"), LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$), IPV6ADDRESS1$ = subexp(subexp(H16$ + "\\:") + "{6}" + LS32$), IPV6ADDRESS2$ = subexp("\\:\\:" + subexp(H16$ + "\\:") + "{5}" + LS32$), IPV6ADDRESS3$ = subexp(subexp(H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{4}" + LS32$), IPV6ADDRESS4$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,1}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{3}" + LS32$), IPV6ADDRESS5$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,2}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{2}" + LS32$), IPV6ADDRESS6$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,3}" + H16$) + "?\\:\\:" + H16$ + "\\:" + LS32$), IPV6ADDRESS7$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,4}" + H16$) + "?\\:\\:" + LS32$), IPV6ADDRESS8$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,5}" + H16$) + "?\\:\\:" + H16$), IPV6ADDRESS9$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,6}" + H16$) + "?\\:\\:"), IPV6ADDRESS$ = subexp([IPV6ADDRESS1$, IPV6ADDRESS2$, IPV6ADDRESS3$, IPV6ADDRESS4$, IPV6ADDRESS5$, IPV6ADDRESS6$, IPV6ADDRESS7$, IPV6ADDRESS8$, IPV6ADDRESS9$].join("|")), ZONEID$ = subexp(subexp(UNRESERVED$$2 + "|" + PCT_ENCODED$2) + "+"), IPV6ADDRZ$ = subexp(IPV6ADDRESS$ + "\\%25" + ZONEID$), IPV6ADDRZ_RELAXED$ = subexp(IPV6ADDRESS$ + subexp("\\%25|\\%(?!" + HEXDIG$$2 + "{2})") + ZONEID$), IPVFUTURE$ = subexp("[vV]" + HEXDIG$$2 + "+\\." + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\:]") + "+"), IP_LITERAL$ = subexp("\\[" + subexp(IPV6ADDRZ_RELAXED$ + "|" + IPV6ADDRESS$ + "|" + IPVFUTURE$) + "\\]"), REG_NAME$ = subexp(subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$)) + "*"), HOST$ = subexp(IP_LITERAL$ + "|" + IPV4ADDRESS$ + "(?!" + REG_NAME$ + ")|" + REG_NAME$), PORT$ = subexp(DIGIT$$ + "*"), AUTHORITY$ = subexp(subexp(USERINFO$ + "@") + "?" + HOST$ + subexp("\\:" + PORT$) + "?"), PCHAR$ = subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@]")), SEGMENT$ = subexp(PCHAR$ + "*"), SEGMENT_NZ$ = subexp(PCHAR$ + "+"), SEGMENT_NZ_NC$ = subexp(subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\@]")) + "+"), PATH_ABEMPTY$ = subexp(subexp("\\/" + SEGMENT$) + "*"), PATH_ABSOLUTE$ = subexp("\\/" + subexp(SEGMENT_NZ$ + PATH_ABEMPTY$) + "?"), PATH_NOSCHEME$ = subexp(SEGMENT_NZ_NC$ + PATH_ABEMPTY$), PATH_ROOTLESS$ = subexp(SEGMENT_NZ$ + PATH_ABEMPTY$), PATH_EMPTY$ = "(?!" + PCHAR$ + ")", PATH$ = subexp(PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$), QUERY$ = subexp(subexp(PCHAR$ + "|" + merge("[\\/\\?]", IPRIVATE$$)) + "*"), FRAGMENT$ = subexp(subexp(PCHAR$ + "|[\\/\\?]") + "*"), HIER_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$), URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"), RELATIVE_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$), RELATIVE$ = subexp(RELATIVE_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"), URI_REFERENCE$ = subexp(URI$ + "|" + RELATIVE$), ABSOLUTE_URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?"), GENERIC_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$", RELATIVE_REF$ = "^(){0}" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$", ABSOLUTE_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?$", SAMEDOC_REF$ = "^" + subexp("\\#(" + FRAGMENT$ + ")") + "?$", AUTHORITY_REF$ = "^" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?$";
          return {
            NOT_SCHEME: new RegExp(merge("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
            NOT_USERINFO: new RegExp(merge("[^\\%\\:]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
            NOT_HOST: new RegExp(merge("[^\\%\\[\\]\\:]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
            NOT_PATH: new RegExp(merge("[^\\%\\/\\:\\@]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
            NOT_PATH_NOSCHEME: new RegExp(merge("[^\\%\\/\\@]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
            NOT_QUERY: new RegExp(merge("[^\\%]", UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@\\/\\?]", IPRIVATE$$), "g"),
            NOT_FRAGMENT: new RegExp(merge("[^\\%]", UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@\\/\\?]"), "g"),
            ESCAPE: new RegExp(merge("[^]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
            UNRESERVED: new RegExp(UNRESERVED$$2, "g"),
            OTHER_CHARS: new RegExp(merge("[^\\%]", UNRESERVED$$2, RESERVED$$), "g"),
            PCT_ENCODED: new RegExp(PCT_ENCODED$2, "g"),
            IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS$ + ")$"),
            IPV6ADDRESS: new RegExp("^\\[?(" + IPV6ADDRESS$ + ")" + subexp(subexp("\\%25|\\%(?!" + HEXDIG$$2 + "{2})") + "(" + ZONEID$ + ")") + "?\\]?$")
          };
        }
        var URI_PROTOCOL = buildExps(false);
        var IRI_PROTOCOL = buildExps(true);
        var slicedToArray = /* @__PURE__ */ (function() {
          function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = void 0;
            try {
              for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (i && _arr.length === i)
                  break;
              }
            } catch (err) {
              _d = true;
              _e = err;
            } finally {
              try {
                if (!_n && _i["return"])
                  _i["return"]();
              } finally {
                if (_d)
                  throw _e;
              }
            }
            return _arr;
          }
          return function(arr, i) {
            if (Array.isArray(arr)) {
              return arr;
            } else if (Symbol.iterator in Object(arr)) {
              return sliceIterator(arr, i);
            } else {
              throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
          };
        })();
        var toConsumableArray = function(arr) {
          if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++)
              arr2[i] = arr[i];
            return arr2;
          } else {
            return Array.from(arr);
          }
        };
        var maxInt = 2147483647;
        var base = 36;
        var tMin = 1;
        var tMax = 26;
        var skew = 38;
        var damp = 700;
        var initialBias = 72;
        var initialN = 128;
        var delimiter = "-";
        var regexPunycode = /^xn--/;
        var regexNonASCII = /[^\0-\x7E]/;
        var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
        var errors2 = {
          overflow: "Overflow: input needs wider integers to process",
          "not-basic": "Illegal input >= 0x80 (not a basic code point)",
          "invalid-input": "Invalid input"
        };
        var baseMinusTMin = base - tMin;
        var floor = Math.floor;
        var stringFromCharCode = String.fromCharCode;
        function error$1(type) {
          throw new RangeError(errors2[type]);
        }
        function map(array, fn) {
          var result = [];
          var length = array.length;
          while (length--) {
            result[length] = fn(array[length]);
          }
          return result;
        }
        function mapDomain(string, fn) {
          var parts = string.split("@");
          var result = "";
          if (parts.length > 1) {
            result = parts[0] + "@";
            string = parts[1];
          }
          string = string.replace(regexSeparators, ".");
          var labels = string.split(".");
          var encoded = map(labels, fn).join(".");
          return result + encoded;
        }
        function ucs2decode(string) {
          var output = [];
          var counter = 0;
          var length = string.length;
          while (counter < length) {
            var value = string.charCodeAt(counter++);
            if (value >= 55296 && value <= 56319 && counter < length) {
              var extra = string.charCodeAt(counter++);
              if ((extra & 64512) == 56320) {
                output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
              } else {
                output.push(value);
                counter--;
              }
            } else {
              output.push(value);
            }
          }
          return output;
        }
        var ucs2encode = function ucs2encode2(array) {
          return String.fromCodePoint.apply(String, toConsumableArray(array));
        };
        var basicToDigit = function basicToDigit2(codePoint) {
          if (codePoint - 48 < 10) {
            return codePoint - 22;
          }
          if (codePoint - 65 < 26) {
            return codePoint - 65;
          }
          if (codePoint - 97 < 26) {
            return codePoint - 97;
          }
          return base;
        };
        var digitToBasic = function digitToBasic2(digit, flag) {
          return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
        };
        var adapt = function adapt2(delta, numPoints, firstTime) {
          var k = 0;
          delta = firstTime ? floor(delta / damp) : delta >> 1;
          delta += floor(delta / numPoints);
          for (; delta > baseMinusTMin * tMax >> 1; k += base) {
            delta = floor(delta / baseMinusTMin);
          }
          return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
        };
        var decode = function decode2(input) {
          var output = [];
          var inputLength = input.length;
          var i = 0;
          var n = initialN;
          var bias = initialBias;
          var basic = input.lastIndexOf(delimiter);
          if (basic < 0) {
            basic = 0;
          }
          for (var j = 0; j < basic; ++j) {
            if (input.charCodeAt(j) >= 128) {
              error$1("not-basic");
            }
            output.push(input.charCodeAt(j));
          }
          for (var index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
            var oldi = i;
            for (var w = 1, k = base; ; k += base) {
              if (index >= inputLength) {
                error$1("invalid-input");
              }
              var digit = basicToDigit(input.charCodeAt(index++));
              if (digit >= base || digit > floor((maxInt - i) / w)) {
                error$1("overflow");
              }
              i += digit * w;
              var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
              if (digit < t) {
                break;
              }
              var baseMinusT = base - t;
              if (w > floor(maxInt / baseMinusT)) {
                error$1("overflow");
              }
              w *= baseMinusT;
            }
            var out = output.length + 1;
            bias = adapt(i - oldi, out, oldi == 0);
            if (floor(i / out) > maxInt - n) {
              error$1("overflow");
            }
            n += floor(i / out);
            i %= out;
            output.splice(i++, 0, n);
          }
          return String.fromCodePoint.apply(String, output);
        };
        var encode = function encode2(input) {
          var output = [];
          input = ucs2decode(input);
          var inputLength = input.length;
          var n = initialN;
          var delta = 0;
          var bias = initialBias;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = void 0;
          try {
            for (var _iterator = input[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _currentValue2 = _step.value;
              if (_currentValue2 < 128) {
                output.push(stringFromCharCode(_currentValue2));
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
          var basicLength = output.length;
          var handledCPCount = basicLength;
          if (basicLength) {
            output.push(delimiter);
          }
          while (handledCPCount < inputLength) {
            var m = maxInt;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = void 0;
            try {
              for (var _iterator2 = input[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var currentValue = _step2.value;
                if (currentValue >= n && currentValue < m) {
                  m = currentValue;
                }
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }
            var handledCPCountPlusOne = handledCPCount + 1;
            if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
              error$1("overflow");
            }
            delta += (m - n) * handledCPCountPlusOne;
            n = m;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = void 0;
            try {
              for (var _iterator3 = input[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var _currentValue = _step3.value;
                if (_currentValue < n && ++delta > maxInt) {
                  error$1("overflow");
                }
                if (_currentValue == n) {
                  var q = delta;
                  for (var k = base; ; k += base) {
                    var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                    if (q < t) {
                      break;
                    }
                    var qMinusT = q - t;
                    var baseMinusT = base - t;
                    output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                    q = floor(qMinusT / baseMinusT);
                  }
                  output.push(stringFromCharCode(digitToBasic(q, 0)));
                  bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                  delta = 0;
                  ++handledCPCount;
                }
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }
            ++delta;
            ++n;
          }
          return output.join("");
        };
        var toUnicode = function toUnicode2(input) {
          return mapDomain(input, function(string) {
            return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
          });
        };
        var toASCII = function toASCII2(input) {
          return mapDomain(input, function(string) {
            return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
          });
        };
        var punycode = {
          version: "2.1.0",
          ucs2: {
            decode: ucs2decode,
            encode: ucs2encode
          },
          decode,
          encode,
          toASCII,
          toUnicode
        };
        var SCHEMES = {};
        function pctEncChar(chr) {
          var c = chr.charCodeAt(0);
          var e = void 0;
          if (c < 16)
            e = "%0" + c.toString(16).toUpperCase();
          else if (c < 128)
            e = "%" + c.toString(16).toUpperCase();
          else if (c < 2048)
            e = "%" + (c >> 6 | 192).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
          else
            e = "%" + (c >> 12 | 224).toString(16).toUpperCase() + "%" + (c >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
          return e;
        }
        function pctDecChars(str) {
          var newStr = "";
          var i = 0;
          var il = str.length;
          while (i < il) {
            var c = parseInt(str.substr(i + 1, 2), 16);
            if (c < 128) {
              newStr += String.fromCharCode(c);
              i += 3;
            } else if (c >= 194 && c < 224) {
              if (il - i >= 6) {
                var c2 = parseInt(str.substr(i + 4, 2), 16);
                newStr += String.fromCharCode((c & 31) << 6 | c2 & 63);
              } else {
                newStr += str.substr(i, 6);
              }
              i += 6;
            } else if (c >= 224) {
              if (il - i >= 9) {
                var _c = parseInt(str.substr(i + 4, 2), 16);
                var c3 = parseInt(str.substr(i + 7, 2), 16);
                newStr += String.fromCharCode((c & 15) << 12 | (_c & 63) << 6 | c3 & 63);
              } else {
                newStr += str.substr(i, 9);
              }
              i += 9;
            } else {
              newStr += str.substr(i, 3);
              i += 3;
            }
          }
          return newStr;
        }
        function _normalizeComponentEncoding(components, protocol) {
          function decodeUnreserved2(str) {
            var decStr = pctDecChars(str);
            return !decStr.match(protocol.UNRESERVED) ? str : decStr;
          }
          if (components.scheme)
            components.scheme = String(components.scheme).replace(protocol.PCT_ENCODED, decodeUnreserved2).toLowerCase().replace(protocol.NOT_SCHEME, "");
          if (components.userinfo !== void 0)
            components.userinfo = String(components.userinfo).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(protocol.NOT_USERINFO, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
          if (components.host !== void 0)
            components.host = String(components.host).replace(protocol.PCT_ENCODED, decodeUnreserved2).toLowerCase().replace(protocol.NOT_HOST, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
          if (components.path !== void 0)
            components.path = String(components.path).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(components.scheme ? protocol.NOT_PATH : protocol.NOT_PATH_NOSCHEME, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
          if (components.query !== void 0)
            components.query = String(components.query).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(protocol.NOT_QUERY, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
          if (components.fragment !== void 0)
            components.fragment = String(components.fragment).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(protocol.NOT_FRAGMENT, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
          return components;
        }
        function _stripLeadingZeros(str) {
          return str.replace(/^0*(.*)/, "$1") || "0";
        }
        function _normalizeIPv4(host, protocol) {
          var matches = host.match(protocol.IPV4ADDRESS) || [];
          var _matches = slicedToArray(matches, 2), address = _matches[1];
          if (address) {
            return address.split(".").map(_stripLeadingZeros).join(".");
          } else {
            return host;
          }
        }
        function _normalizeIPv6(host, protocol) {
          var matches = host.match(protocol.IPV6ADDRESS) || [];
          var _matches2 = slicedToArray(matches, 3), address = _matches2[1], zone = _matches2[2];
          if (address) {
            var _address$toLowerCase$ = address.toLowerCase().split("::").reverse(), _address$toLowerCase$2 = slicedToArray(_address$toLowerCase$, 2), last = _address$toLowerCase$2[0], first = _address$toLowerCase$2[1];
            var firstFields = first ? first.split(":").map(_stripLeadingZeros) : [];
            var lastFields = last.split(":").map(_stripLeadingZeros);
            var isLastFieldIPv4Address = protocol.IPV4ADDRESS.test(lastFields[lastFields.length - 1]);
            var fieldCount = isLastFieldIPv4Address ? 7 : 8;
            var lastFieldsStart = lastFields.length - fieldCount;
            var fields = Array(fieldCount);
            for (var x = 0; x < fieldCount; ++x) {
              fields[x] = firstFields[x] || lastFields[lastFieldsStart + x] || "";
            }
            if (isLastFieldIPv4Address) {
              fields[fieldCount - 1] = _normalizeIPv4(fields[fieldCount - 1], protocol);
            }
            var allZeroFields = fields.reduce(function(acc, field, index) {
              if (!field || field === "0") {
                var lastLongest = acc[acc.length - 1];
                if (lastLongest && lastLongest.index + lastLongest.length === index) {
                  lastLongest.length++;
                } else {
                  acc.push({ index, length: 1 });
                }
              }
              return acc;
            }, []);
            var longestZeroFields = allZeroFields.sort(function(a, b) {
              return b.length - a.length;
            })[0];
            var newHost = void 0;
            if (longestZeroFields && longestZeroFields.length > 1) {
              var newFirst = fields.slice(0, longestZeroFields.index);
              var newLast = fields.slice(longestZeroFields.index + longestZeroFields.length);
              newHost = newFirst.join(":") + "::" + newLast.join(":");
            } else {
              newHost = fields.join(":");
            }
            if (zone) {
              newHost += "%" + zone;
            }
            return newHost;
          } else {
            return host;
          }
        }
        var URI_PARSE = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i;
        var NO_MATCH_IS_UNDEFINED = "".match(/(){0}/)[1] === void 0;
        function parse(uriString) {
          var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          var components = {};
          var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
          if (options.reference === "suffix")
            uriString = (options.scheme ? options.scheme + ":" : "") + "//" + uriString;
          var matches = uriString.match(URI_PARSE);
          if (matches) {
            if (NO_MATCH_IS_UNDEFINED) {
              components.scheme = matches[1];
              components.userinfo = matches[3];
              components.host = matches[4];
              components.port = parseInt(matches[5], 10);
              components.path = matches[6] || "";
              components.query = matches[7];
              components.fragment = matches[8];
              if (isNaN(components.port)) {
                components.port = matches[5];
              }
            } else {
              components.scheme = matches[1] || void 0;
              components.userinfo = uriString.indexOf("@") !== -1 ? matches[3] : void 0;
              components.host = uriString.indexOf("//") !== -1 ? matches[4] : void 0;
              components.port = parseInt(matches[5], 10);
              components.path = matches[6] || "";
              components.query = uriString.indexOf("?") !== -1 ? matches[7] : void 0;
              components.fragment = uriString.indexOf("#") !== -1 ? matches[8] : void 0;
              if (isNaN(components.port)) {
                components.port = uriString.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? matches[4] : void 0;
              }
            }
            if (components.host) {
              components.host = _normalizeIPv6(_normalizeIPv4(components.host, protocol), protocol);
            }
            if (components.scheme === void 0 && components.userinfo === void 0 && components.host === void 0 && components.port === void 0 && !components.path && components.query === void 0) {
              components.reference = "same-document";
            } else if (components.scheme === void 0) {
              components.reference = "relative";
            } else if (components.fragment === void 0) {
              components.reference = "absolute";
            } else {
              components.reference = "uri";
            }
            if (options.reference && options.reference !== "suffix" && options.reference !== components.reference) {
              components.error = components.error || "URI is not a " + options.reference + " reference.";
            }
            var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
            if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
              if (components.host && (options.domainHost || schemeHandler && schemeHandler.domainHost)) {
                try {
                  components.host = punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
                } catch (e) {
                  components.error = components.error || "Host's domain name can not be converted to ASCII via punycode: " + e;
                }
              }
              _normalizeComponentEncoding(components, URI_PROTOCOL);
            } else {
              _normalizeComponentEncoding(components, protocol);
            }
            if (schemeHandler && schemeHandler.parse) {
              schemeHandler.parse(components, options);
            }
          } else {
            components.error = components.error || "URI can not be parsed.";
          }
          return components;
        }
        function _recomposeAuthority(components, options) {
          var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
          var uriTokens = [];
          if (components.userinfo !== void 0) {
            uriTokens.push(components.userinfo);
            uriTokens.push("@");
          }
          if (components.host !== void 0) {
            uriTokens.push(_normalizeIPv6(_normalizeIPv4(String(components.host), protocol), protocol).replace(protocol.IPV6ADDRESS, function(_, $1, $2) {
              return "[" + $1 + ($2 ? "%25" + $2 : "") + "]";
            }));
          }
          if (typeof components.port === "number" || typeof components.port === "string") {
            uriTokens.push(":");
            uriTokens.push(String(components.port));
          }
          return uriTokens.length ? uriTokens.join("") : void 0;
        }
        var RDS1 = /^\.\.?\//;
        var RDS2 = /^\/\.(\/|$)/;
        var RDS3 = /^\/\.\.(\/|$)/;
        var RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/;
        function removeDotSegments(input) {
          var output = [];
          while (input.length) {
            if (input.match(RDS1)) {
              input = input.replace(RDS1, "");
            } else if (input.match(RDS2)) {
              input = input.replace(RDS2, "/");
            } else if (input.match(RDS3)) {
              input = input.replace(RDS3, "/");
              output.pop();
            } else if (input === "." || input === "..") {
              input = "";
            } else {
              var im = input.match(RDS5);
              if (im) {
                var s = im[0];
                input = input.slice(s.length);
                output.push(s);
              } else {
                throw new Error("Unexpected dot segment condition");
              }
            }
          }
          return output.join("");
        }
        function serialize(components) {
          var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          var protocol = options.iri ? IRI_PROTOCOL : URI_PROTOCOL;
          var uriTokens = [];
          var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
          if (schemeHandler && schemeHandler.serialize)
            schemeHandler.serialize(components, options);
          if (components.host) {
            if (protocol.IPV6ADDRESS.test(components.host)) {
            } else if (options.domainHost || schemeHandler && schemeHandler.domainHost) {
              try {
                components.host = !options.iri ? punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase()) : punycode.toUnicode(components.host);
              } catch (e) {
                components.error = components.error || "Host's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
              }
            }
          }
          _normalizeComponentEncoding(components, protocol);
          if (options.reference !== "suffix" && components.scheme) {
            uriTokens.push(components.scheme);
            uriTokens.push(":");
          }
          var authority = _recomposeAuthority(components, options);
          if (authority !== void 0) {
            if (options.reference !== "suffix") {
              uriTokens.push("//");
            }
            uriTokens.push(authority);
            if (components.path && components.path.charAt(0) !== "/") {
              uriTokens.push("/");
            }
          }
          if (components.path !== void 0) {
            var s = components.path;
            if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
              s = removeDotSegments(s);
            }
            if (authority === void 0) {
              s = s.replace(/^\/\//, "/%2F");
            }
            uriTokens.push(s);
          }
          if (components.query !== void 0) {
            uriTokens.push("?");
            uriTokens.push(components.query);
          }
          if (components.fragment !== void 0) {
            uriTokens.push("#");
            uriTokens.push(components.fragment);
          }
          return uriTokens.join("");
        }
        function resolveComponents(base2, relative) {
          var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          var skipNormalization = arguments[3];
          var target = {};
          if (!skipNormalization) {
            base2 = parse(serialize(base2, options), options);
            relative = parse(serialize(relative, options), options);
          }
          options = options || {};
          if (!options.tolerant && relative.scheme) {
            target.scheme = relative.scheme;
            target.userinfo = relative.userinfo;
            target.host = relative.host;
            target.port = relative.port;
            target.path = removeDotSegments(relative.path || "");
            target.query = relative.query;
          } else {
            if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
              target.userinfo = relative.userinfo;
              target.host = relative.host;
              target.port = relative.port;
              target.path = removeDotSegments(relative.path || "");
              target.query = relative.query;
            } else {
              if (!relative.path) {
                target.path = base2.path;
                if (relative.query !== void 0) {
                  target.query = relative.query;
                } else {
                  target.query = base2.query;
                }
              } else {
                if (relative.path.charAt(0) === "/") {
                  target.path = removeDotSegments(relative.path);
                } else {
                  if ((base2.userinfo !== void 0 || base2.host !== void 0 || base2.port !== void 0) && !base2.path) {
                    target.path = "/" + relative.path;
                  } else if (!base2.path) {
                    target.path = relative.path;
                  } else {
                    target.path = base2.path.slice(0, base2.path.lastIndexOf("/") + 1) + relative.path;
                  }
                  target.path = removeDotSegments(target.path);
                }
                target.query = relative.query;
              }
              target.userinfo = base2.userinfo;
              target.host = base2.host;
              target.port = base2.port;
            }
            target.scheme = base2.scheme;
          }
          target.fragment = relative.fragment;
          return target;
        }
        function resolve(baseURI, relativeURI, options) {
          var schemelessOptions = assign({ scheme: "null" }, options);
          return serialize(resolveComponents(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true), schemelessOptions);
        }
        function normalize(uri, options) {
          if (typeof uri === "string") {
            uri = serialize(parse(uri, options), options);
          } else if (typeOf(uri) === "object") {
            uri = parse(serialize(uri, options), options);
          }
          return uri;
        }
        function equal(uriA, uriB, options) {
          if (typeof uriA === "string") {
            uriA = serialize(parse(uriA, options), options);
          } else if (typeOf(uriA) === "object") {
            uriA = serialize(uriA, options);
          }
          if (typeof uriB === "string") {
            uriB = serialize(parse(uriB, options), options);
          } else if (typeOf(uriB) === "object") {
            uriB = serialize(uriB, options);
          }
          return uriA === uriB;
        }
        function escapeComponent(str, options) {
          return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.ESCAPE : IRI_PROTOCOL.ESCAPE, pctEncChar);
        }
        function unescapeComponent(str, options) {
          return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.PCT_ENCODED : IRI_PROTOCOL.PCT_ENCODED, pctDecChars);
        }
        var handler = {
          scheme: "http",
          domainHost: true,
          parse: function parse2(components, options) {
            if (!components.host) {
              components.error = components.error || "HTTP URIs must have a host.";
            }
            return components;
          },
          serialize: function serialize2(components, options) {
            var secure = String(components.scheme).toLowerCase() === "https";
            if (components.port === (secure ? 443 : 80) || components.port === "") {
              components.port = void 0;
            }
            if (!components.path) {
              components.path = "/";
            }
            return components;
          }
        };
        var handler$1 = {
          scheme: "https",
          domainHost: handler.domainHost,
          parse: handler.parse,
          serialize: handler.serialize
        };
        function isSecure(wsComponents) {
          return typeof wsComponents.secure === "boolean" ? wsComponents.secure : String(wsComponents.scheme).toLowerCase() === "wss";
        }
        var handler$2 = {
          scheme: "ws",
          domainHost: true,
          parse: function parse2(components, options) {
            var wsComponents = components;
            wsComponents.secure = isSecure(wsComponents);
            wsComponents.resourceName = (wsComponents.path || "/") + (wsComponents.query ? "?" + wsComponents.query : "");
            wsComponents.path = void 0;
            wsComponents.query = void 0;
            return wsComponents;
          },
          serialize: function serialize2(wsComponents, options) {
            if (wsComponents.port === (isSecure(wsComponents) ? 443 : 80) || wsComponents.port === "") {
              wsComponents.port = void 0;
            }
            if (typeof wsComponents.secure === "boolean") {
              wsComponents.scheme = wsComponents.secure ? "wss" : "ws";
              wsComponents.secure = void 0;
            }
            if (wsComponents.resourceName) {
              var _wsComponents$resourc = wsComponents.resourceName.split("?"), _wsComponents$resourc2 = slicedToArray(_wsComponents$resourc, 2), path = _wsComponents$resourc2[0], query2 = _wsComponents$resourc2[1];
              wsComponents.path = path && path !== "/" ? path : void 0;
              wsComponents.query = query2;
              wsComponents.resourceName = void 0;
            }
            wsComponents.fragment = void 0;
            return wsComponents;
          }
        };
        var handler$3 = {
          scheme: "wss",
          domainHost: handler$2.domainHost,
          parse: handler$2.parse,
          serialize: handler$2.serialize
        };
        var O = {};
        var isIRI = true;
        var UNRESERVED$$ = "[A-Za-z0-9\\-\\.\\_\\~" + (isIRI ? "\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF" : "") + "]";
        var HEXDIG$$ = "[0-9A-Fa-f]";
        var PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$));
        var ATEXT$$ = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]";
        var QTEXT$$ = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]";
        var VCHAR$$ = merge(QTEXT$$, '[\\"\\\\]');
        var SOME_DELIMS$$ = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]";
        var UNRESERVED = new RegExp(UNRESERVED$$, "g");
        var PCT_ENCODED = new RegExp(PCT_ENCODED$, "g");
        var NOT_LOCAL_PART = new RegExp(merge("[^]", ATEXT$$, "[\\.]", '[\\"]', VCHAR$$), "g");
        var NOT_HFNAME = new RegExp(merge("[^]", UNRESERVED$$, SOME_DELIMS$$), "g");
        var NOT_HFVALUE = NOT_HFNAME;
        function decodeUnreserved(str) {
          var decStr = pctDecChars(str);
          return !decStr.match(UNRESERVED) ? str : decStr;
        }
        var handler$4 = {
          scheme: "mailto",
          parse: function parse$$1(components, options) {
            var mailtoComponents = components;
            var to = mailtoComponents.to = mailtoComponents.path ? mailtoComponents.path.split(",") : [];
            mailtoComponents.path = void 0;
            if (mailtoComponents.query) {
              var unknownHeaders = false;
              var headers = {};
              var hfields = mailtoComponents.query.split("&");
              for (var x = 0, xl = hfields.length; x < xl; ++x) {
                var hfield = hfields[x].split("=");
                switch (hfield[0]) {
                  case "to":
                    var toAddrs = hfield[1].split(",");
                    for (var _x = 0, _xl = toAddrs.length; _x < _xl; ++_x) {
                      to.push(toAddrs[_x]);
                    }
                    break;
                  case "subject":
                    mailtoComponents.subject = unescapeComponent(hfield[1], options);
                    break;
                  case "body":
                    mailtoComponents.body = unescapeComponent(hfield[1], options);
                    break;
                  default:
                    unknownHeaders = true;
                    headers[unescapeComponent(hfield[0], options)] = unescapeComponent(hfield[1], options);
                    break;
                }
              }
              if (unknownHeaders)
                mailtoComponents.headers = headers;
            }
            mailtoComponents.query = void 0;
            for (var _x2 = 0, _xl2 = to.length; _x2 < _xl2; ++_x2) {
              var addr = to[_x2].split("@");
              addr[0] = unescapeComponent(addr[0]);
              if (!options.unicodeSupport) {
                try {
                  addr[1] = punycode.toASCII(unescapeComponent(addr[1], options).toLowerCase());
                } catch (e) {
                  mailtoComponents.error = mailtoComponents.error || "Email address's domain name can not be converted to ASCII via punycode: " + e;
                }
              } else {
                addr[1] = unescapeComponent(addr[1], options).toLowerCase();
              }
              to[_x2] = addr.join("@");
            }
            return mailtoComponents;
          },
          serialize: function serialize$$1(mailtoComponents, options) {
            var components = mailtoComponents;
            var to = toArray(mailtoComponents.to);
            if (to) {
              for (var x = 0, xl = to.length; x < xl; ++x) {
                var toAddr = String(to[x]);
                var atIdx = toAddr.lastIndexOf("@");
                var localPart = toAddr.slice(0, atIdx).replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_LOCAL_PART, pctEncChar);
                var domain = toAddr.slice(atIdx + 1);
                try {
                  domain = !options.iri ? punycode.toASCII(unescapeComponent(domain, options).toLowerCase()) : punycode.toUnicode(domain);
                } catch (e) {
                  components.error = components.error || "Email address's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
                }
                to[x] = localPart + "@" + domain;
              }
              components.path = to.join(",");
            }
            var headers = mailtoComponents.headers = mailtoComponents.headers || {};
            if (mailtoComponents.subject)
              headers["subject"] = mailtoComponents.subject;
            if (mailtoComponents.body)
              headers["body"] = mailtoComponents.body;
            var fields = [];
            for (var name in headers) {
              if (headers[name] !== O[name]) {
                fields.push(name.replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFNAME, pctEncChar) + "=" + headers[name].replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFVALUE, pctEncChar));
              }
            }
            if (fields.length) {
              components.query = fields.join("&");
            }
            return components;
          }
        };
        var URN_PARSE = /^([^\:]+)\:(.*)/;
        var handler$5 = {
          scheme: "urn",
          parse: function parse$$1(components, options) {
            var matches = components.path && components.path.match(URN_PARSE);
            var urnComponents = components;
            if (matches) {
              var scheme = options.scheme || urnComponents.scheme || "urn";
              var nid = matches[1].toLowerCase();
              var nss = matches[2];
              var urnScheme = scheme + ":" + (options.nid || nid);
              var schemeHandler = SCHEMES[urnScheme];
              urnComponents.nid = nid;
              urnComponents.nss = nss;
              urnComponents.path = void 0;
              if (schemeHandler) {
                urnComponents = schemeHandler.parse(urnComponents, options);
              }
            } else {
              urnComponents.error = urnComponents.error || "URN can not be parsed.";
            }
            return urnComponents;
          },
          serialize: function serialize$$1(urnComponents, options) {
            var scheme = options.scheme || urnComponents.scheme || "urn";
            var nid = urnComponents.nid;
            var urnScheme = scheme + ":" + (options.nid || nid);
            var schemeHandler = SCHEMES[urnScheme];
            if (schemeHandler) {
              urnComponents = schemeHandler.serialize(urnComponents, options);
            }
            var uriComponents = urnComponents;
            var nss = urnComponents.nss;
            uriComponents.path = (nid || options.nid) + ":" + nss;
            return uriComponents;
          }
        };
        var UUID = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/;
        var handler$6 = {
          scheme: "urn:uuid",
          parse: function parse2(urnComponents, options) {
            var uuidComponents = urnComponents;
            uuidComponents.uuid = uuidComponents.nss;
            uuidComponents.nss = void 0;
            if (!options.tolerant && (!uuidComponents.uuid || !uuidComponents.uuid.match(UUID))) {
              uuidComponents.error = uuidComponents.error || "UUID is not valid.";
            }
            return uuidComponents;
          },
          serialize: function serialize2(uuidComponents, options) {
            var urnComponents = uuidComponents;
            urnComponents.nss = (uuidComponents.uuid || "").toLowerCase();
            return urnComponents;
          }
        };
        SCHEMES[handler.scheme] = handler;
        SCHEMES[handler$1.scheme] = handler$1;
        SCHEMES[handler$2.scheme] = handler$2;
        SCHEMES[handler$3.scheme] = handler$3;
        SCHEMES[handler$4.scheme] = handler$4;
        SCHEMES[handler$5.scheme] = handler$5;
        SCHEMES[handler$6.scheme] = handler$6;
        exports2.SCHEMES = SCHEMES;
        exports2.pctEncChar = pctEncChar;
        exports2.pctDecChars = pctDecChars;
        exports2.parse = parse;
        exports2.removeDotSegments = removeDotSegments;
        exports2.serialize = serialize;
        exports2.resolveComponents = resolveComponents;
        exports2.resolve = resolve;
        exports2.normalize = normalize;
        exports2.equal = equal;
        exports2.escapeComponent = escapeComponent;
        exports2.unescapeComponent = unescapeComponent;
        Object.defineProperty(exports2, "__esModule", { value: true });
      });
    });
    require_fast_deep_equal = __commonJS2((exports, module) => {
      module.exports = function equal(a, b) {
        if (a === b)
          return true;
        if (a && b && typeof a == "object" && typeof b == "object") {
          if (a.constructor !== b.constructor)
            return false;
          var length, i, keys;
          if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length)
              return false;
            for (i = length; i-- !== 0; )
              if (!equal(a[i], b[i]))
                return false;
            return true;
          }
          if (a.constructor === RegExp)
            return a.source === b.source && a.flags === b.flags;
          if (a.valueOf !== Object.prototype.valueOf)
            return a.valueOf() === b.valueOf();
          if (a.toString !== Object.prototype.toString)
            return a.toString() === b.toString();
          keys = Object.keys(a);
          length = keys.length;
          if (length !== Object.keys(b).length)
            return false;
          for (i = length; i-- !== 0; )
            if (!Object.prototype.hasOwnProperty.call(b, keys[i]))
              return false;
          for (i = length; i-- !== 0; ) {
            var key = keys[i];
            if (!equal(a[key], b[key]))
              return false;
          }
          return true;
        }
        return a !== a && b !== b;
      };
    });
    require_ucs2length = __commonJS2((exports, module) => {
      module.exports = function ucs2length(str) {
        var length = 0, len = str.length, pos = 0, value;
        while (pos < len) {
          length++;
          value = str.charCodeAt(pos++);
          if (value >= 55296 && value <= 56319 && pos < len) {
            value = str.charCodeAt(pos);
            if ((value & 64512) == 56320)
              pos++;
          }
        }
        return length;
      };
    });
    require_util = __commonJS2((exports, module) => {
      module.exports = {
        copy,
        checkDataType,
        checkDataTypes,
        coerceToTypes,
        toHash,
        getProperty,
        escapeQuotes,
        equal: require_fast_deep_equal(),
        ucs2length: require_ucs2length(),
        varOccurences,
        varReplace,
        schemaHasRules,
        schemaHasRulesExcept,
        schemaUnknownRules,
        toQuotedString,
        getPathExpr,
        getPath: getPath2,
        getData,
        unescapeFragment,
        unescapeJsonPointer,
        escapeFragment,
        escapeJsonPointer
      };
      function copy(o, to) {
        to = to || {};
        for (var key in o)
          to[key] = o[key];
        return to;
      }
      function checkDataType(dataType, data, strictNumbers, negate) {
        var EQUAL = negate ? " !== " : " === ", AND = negate ? " || " : " && ", OK2 = negate ? "!" : "", NOT = negate ? "" : "!";
        switch (dataType) {
          case "null":
            return data + EQUAL + "null";
          case "array":
            return OK2 + "Array.isArray(" + data + ")";
          case "object":
            return "(" + OK2 + data + AND + "typeof " + data + EQUAL + '"object"' + AND + NOT + "Array.isArray(" + data + "))";
          case "integer":
            return "(typeof " + data + EQUAL + '"number"' + AND + NOT + "(" + data + " % 1)" + AND + data + EQUAL + data + (strictNumbers ? AND + OK2 + "isFinite(" + data + ")" : "") + ")";
          case "number":
            return "(typeof " + data + EQUAL + '"' + dataType + '"' + (strictNumbers ? AND + OK2 + "isFinite(" + data + ")" : "") + ")";
          default:
            return "typeof " + data + EQUAL + '"' + dataType + '"';
        }
      }
      function checkDataTypes(dataTypes, data, strictNumbers) {
        switch (dataTypes.length) {
          case 1:
            return checkDataType(dataTypes[0], data, strictNumbers, true);
          default:
            var code = "";
            var types2 = toHash(dataTypes);
            if (types2.array && types2.object) {
              code = types2.null ? "(" : "(!" + data + " || ";
              code += "typeof " + data + ' !== "object")';
              delete types2.null;
              delete types2.array;
              delete types2.object;
            }
            if (types2.number)
              delete types2.integer;
            for (var t in types2)
              code += (code ? " && " : "") + checkDataType(t, data, strictNumbers, true);
            return code;
        }
      }
      var COERCE_TO_TYPES = toHash(["string", "number", "integer", "boolean", "null"]);
      function coerceToTypes(optionCoerceTypes, dataTypes) {
        if (Array.isArray(dataTypes)) {
          var types2 = [];
          for (var i = 0; i < dataTypes.length; i++) {
            var t = dataTypes[i];
            if (COERCE_TO_TYPES[t])
              types2[types2.length] = t;
            else if (optionCoerceTypes === "array" && t === "array")
              types2[types2.length] = t;
          }
          if (types2.length)
            return types2;
        } else if (COERCE_TO_TYPES[dataTypes]) {
          return [dataTypes];
        } else if (optionCoerceTypes === "array" && dataTypes === "array") {
          return ["array"];
        }
      }
      function toHash(arr) {
        var hash = {};
        for (var i = 0; i < arr.length; i++)
          hash[arr[i]] = true;
        return hash;
      }
      var IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
      var SINGLE_QUOTE = /'|\\/g;
      function getProperty(key) {
        return typeof key == "number" ? "[" + key + "]" : IDENTIFIER.test(key) ? "." + key : "['" + escapeQuotes(key) + "']";
      }
      function escapeQuotes(str) {
        return str.replace(SINGLE_QUOTE, "\\$&").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\f/g, "\\f").replace(/\t/g, "\\t");
      }
      function varOccurences(str, dataVar) {
        dataVar += "[^0-9]";
        var matches = str.match(new RegExp(dataVar, "g"));
        return matches ? matches.length : 0;
      }
      function varReplace(str, dataVar, expr) {
        dataVar += "([^0-9])";
        expr = expr.replace(/\$/g, "$$$$");
        return str.replace(new RegExp(dataVar, "g"), expr + "$1");
      }
      function schemaHasRules(schema, rules) {
        if (typeof schema == "boolean")
          return !schema;
        for (var key in schema)
          if (rules[key])
            return true;
      }
      function schemaHasRulesExcept(schema, rules, exceptKeyword) {
        if (typeof schema == "boolean")
          return !schema && exceptKeyword != "not";
        for (var key in schema)
          if (key != exceptKeyword && rules[key])
            return true;
      }
      function schemaUnknownRules(schema, rules) {
        if (typeof schema == "boolean")
          return;
        for (var key in schema)
          if (!rules[key])
            return key;
      }
      function toQuotedString(str) {
        return "'" + escapeQuotes(str) + "'";
      }
      function getPathExpr(currentPath, expr, jsonPointers, isNumber) {
        var path = jsonPointers ? "'/' + " + expr + (isNumber ? "" : ".replace(/~/g, '~0').replace(/\\//g, '~1')") : isNumber ? "'[' + " + expr + " + ']'" : "'[\\'' + " + expr + " + '\\']'";
        return joinPaths(currentPath, path);
      }
      function getPath2(currentPath, prop, jsonPointers) {
        var path = jsonPointers ? toQuotedString("/" + escapeJsonPointer(prop)) : toQuotedString(getProperty(prop));
        return joinPaths(currentPath, path);
      }
      var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
      var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
      function getData($data, lvl, paths) {
        var up, jsonPointer, data, matches;
        if ($data === "")
          return "rootData";
        if ($data[0] == "/") {
          if (!JSON_POINTER.test($data))
            throw new Error("Invalid JSON-pointer: " + $data);
          jsonPointer = $data;
          data = "rootData";
        } else {
          matches = $data.match(RELATIVE_JSON_POINTER);
          if (!matches)
            throw new Error("Invalid JSON-pointer: " + $data);
          up = +matches[1];
          jsonPointer = matches[2];
          if (jsonPointer == "#") {
            if (up >= lvl)
              throw new Error("Cannot access property/index " + up + " levels up, current level is " + lvl);
            return paths[lvl - up];
          }
          if (up > lvl)
            throw new Error("Cannot access data " + up + " levels up, current level is " + lvl);
          data = "data" + (lvl - up || "");
          if (!jsonPointer)
            return data;
        }
        var expr = data;
        var segments = jsonPointer.split("/");
        for (var i = 0; i < segments.length; i++) {
          var segment = segments[i];
          if (segment) {
            data += getProperty(unescapeJsonPointer(segment));
            expr += " && " + data;
          }
        }
        return expr;
      }
      function joinPaths(a, b) {
        if (a == '""')
          return b;
        return (a + " + " + b).replace(/([^\\])' \+ '/g, "$1");
      }
      function unescapeFragment(str) {
        return unescapeJsonPointer(decodeURIComponent(str));
      }
      function escapeFragment(str) {
        return encodeURIComponent(escapeJsonPointer(str));
      }
      function escapeJsonPointer(str) {
        return str.replace(/~/g, "~0").replace(/\//g, "~1");
      }
      function unescapeJsonPointer(str) {
        return str.replace(/~1/g, "/").replace(/~0/g, "~");
      }
    });
    require_schema_obj = __commonJS2((exports, module) => {
      var util32 = require_util();
      module.exports = SchemaObject;
      function SchemaObject(obj) {
        util32.copy(obj, this);
      }
    });
    require_json_schema_traverse = __commonJS2((exports, module) => {
      var traverse = module.exports = function(schema, opts, cb) {
        if (typeof opts == "function") {
          cb = opts;
          opts = {};
        }
        cb = opts.cb || cb;
        var pre = typeof cb == "function" ? cb : cb.pre || function() {
        };
        var post = cb.post || function() {
        };
        _traverse(opts, pre, post, schema, "", schema);
      };
      traverse.keywords = {
        additionalItems: true,
        items: true,
        contains: true,
        additionalProperties: true,
        propertyNames: true,
        not: true
      };
      traverse.arrayKeywords = {
        items: true,
        allOf: true,
        anyOf: true,
        oneOf: true
      };
      traverse.propsKeywords = {
        definitions: true,
        properties: true,
        patternProperties: true,
        dependencies: true
      };
      traverse.skipKeywords = {
        default: true,
        enum: true,
        const: true,
        required: true,
        maximum: true,
        minimum: true,
        exclusiveMaximum: true,
        exclusiveMinimum: true,
        multipleOf: true,
        maxLength: true,
        minLength: true,
        pattern: true,
        format: true,
        maxItems: true,
        minItems: true,
        uniqueItems: true,
        maxProperties: true,
        minProperties: true
      };
      function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
        if (schema && typeof schema == "object" && !Array.isArray(schema)) {
          pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
          for (var key in schema) {
            var sch = schema[key];
            if (Array.isArray(sch)) {
              if (key in traverse.arrayKeywords) {
                for (var i = 0; i < sch.length; i++)
                  _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
              }
            } else if (key in traverse.propsKeywords) {
              if (sch && typeof sch == "object") {
                for (var prop in sch)
                  _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
              }
            } else if (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) {
              _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
            }
          }
          post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
        }
      }
      function escapeJsonPtr(str) {
        return str.replace(/~/g, "~0").replace(/\//g, "~1");
      }
    });
    require_resolve = __commonJS2((exports, module) => {
      var URI = require_uri_all();
      var equal = require_fast_deep_equal();
      var util32 = require_util();
      var SchemaObject = require_schema_obj();
      var traverse = require_json_schema_traverse();
      module.exports = resolve;
      resolve.normalizeId = normalizeId;
      resolve.fullPath = getFullPath;
      resolve.url = resolveUrl;
      resolve.ids = resolveIds;
      resolve.inlineRef = inlineRef;
      resolve.schema = resolveSchema;
      function resolve(compile, root, ref) {
        var refVal = this._refs[ref];
        if (typeof refVal == "string") {
          if (this._refs[refVal])
            refVal = this._refs[refVal];
          else
            return resolve.call(this, compile, root, refVal);
        }
        refVal = refVal || this._schemas[ref];
        if (refVal instanceof SchemaObject) {
          return inlineRef(refVal.schema, this._opts.inlineRefs) ? refVal.schema : refVal.validate || this._compile(refVal);
        }
        var res = resolveSchema.call(this, root, ref);
        var schema, v, baseId;
        if (res) {
          schema = res.schema;
          root = res.root;
          baseId = res.baseId;
        }
        if (schema instanceof SchemaObject) {
          v = schema.validate || compile.call(this, schema.schema, root, void 0, baseId);
        } else if (schema !== void 0) {
          v = inlineRef(schema, this._opts.inlineRefs) ? schema : compile.call(this, schema, root, void 0, baseId);
        }
        return v;
      }
      function resolveSchema(root, ref) {
        var p = URI.parse(ref), refPath = _getFullPath(p), baseId = getFullPath(this._getId(root.schema));
        if (Object.keys(root.schema).length === 0 || refPath !== baseId) {
          var id = normalizeId(refPath);
          var refVal = this._refs[id];
          if (typeof refVal == "string") {
            return resolveRecursive.call(this, root, refVal, p);
          } else if (refVal instanceof SchemaObject) {
            if (!refVal.validate)
              this._compile(refVal);
            root = refVal;
          } else {
            refVal = this._schemas[id];
            if (refVal instanceof SchemaObject) {
              if (!refVal.validate)
                this._compile(refVal);
              if (id == normalizeId(ref))
                return { schema: refVal, root, baseId };
              root = refVal;
            } else {
              return;
            }
          }
          if (!root.schema)
            return;
          baseId = getFullPath(this._getId(root.schema));
        }
        return getJsonPointer.call(this, p, baseId, root.schema, root);
      }
      function resolveRecursive(root, ref, parsedRef) {
        var res = resolveSchema.call(this, root, ref);
        if (res) {
          var schema = res.schema;
          var baseId = res.baseId;
          root = res.root;
          var id = this._getId(schema);
          if (id)
            baseId = resolveUrl(baseId, id);
          return getJsonPointer.call(this, parsedRef, baseId, schema, root);
        }
      }
      var PREVENT_SCOPE_CHANGE = util32.toHash(["properties", "patternProperties", "enum", "dependencies", "definitions"]);
      function getJsonPointer(parsedRef, baseId, schema, root) {
        parsedRef.fragment = parsedRef.fragment || "";
        if (parsedRef.fragment.slice(0, 1) != "/")
          return;
        var parts = parsedRef.fragment.split("/");
        for (var i = 1; i < parts.length; i++) {
          var part = parts[i];
          if (part) {
            part = util32.unescapeFragment(part);
            schema = schema[part];
            if (schema === void 0)
              break;
            var id;
            if (!PREVENT_SCOPE_CHANGE[part]) {
              id = this._getId(schema);
              if (id)
                baseId = resolveUrl(baseId, id);
              if (schema.$ref) {
                var $ref = resolveUrl(baseId, schema.$ref);
                var res = resolveSchema.call(this, root, $ref);
                if (res) {
                  schema = res.schema;
                  root = res.root;
                  baseId = res.baseId;
                }
              }
            }
          }
        }
        if (schema !== void 0 && schema !== root.schema)
          return { schema, root, baseId };
      }
      var SIMPLE_INLINED = util32.toHash([
        "type",
        "format",
        "pattern",
        "maxLength",
        "minLength",
        "maxProperties",
        "minProperties",
        "maxItems",
        "minItems",
        "maximum",
        "minimum",
        "uniqueItems",
        "multipleOf",
        "required",
        "enum"
      ]);
      function inlineRef(schema, limit) {
        if (limit === false)
          return false;
        if (limit === void 0 || limit === true)
          return checkNoRef(schema);
        else if (limit)
          return countKeys(schema) <= limit;
      }
      function checkNoRef(schema) {
        var item;
        if (Array.isArray(schema)) {
          for (var i = 0; i < schema.length; i++) {
            item = schema[i];
            if (typeof item == "object" && !checkNoRef(item))
              return false;
          }
        } else {
          for (var key in schema) {
            if (key == "$ref")
              return false;
            item = schema[key];
            if (typeof item == "object" && !checkNoRef(item))
              return false;
          }
        }
        return true;
      }
      function countKeys(schema) {
        var count = 0, item;
        if (Array.isArray(schema)) {
          for (var i = 0; i < schema.length; i++) {
            item = schema[i];
            if (typeof item == "object")
              count += countKeys(item);
            if (count == Infinity)
              return Infinity;
          }
        } else {
          for (var key in schema) {
            if (key == "$ref")
              return Infinity;
            if (SIMPLE_INLINED[key]) {
              count++;
            } else {
              item = schema[key];
              if (typeof item == "object")
                count += countKeys(item) + 1;
              if (count == Infinity)
                return Infinity;
            }
          }
        }
        return count;
      }
      function getFullPath(id, normalize) {
        if (normalize !== false)
          id = normalizeId(id);
        var p = URI.parse(id);
        return _getFullPath(p);
      }
      function _getFullPath(p) {
        return URI.serialize(p).split("#")[0] + "#";
      }
      var TRAILING_SLASH_HASH = /#\/?$/;
      function normalizeId(id) {
        return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
      }
      function resolveUrl(baseId, id) {
        id = normalizeId(id);
        return URI.resolve(baseId, id);
      }
      function resolveIds(schema) {
        var schemaId = normalizeId(this._getId(schema));
        var baseIds = { "": schemaId };
        var fullPaths = { "": getFullPath(schemaId, false) };
        var localRefs = {};
        var self = this;
        traverse(schema, { allKeys: true }, function(sch, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
          if (jsonPtr === "")
            return;
          var id = self._getId(sch);
          var baseId = baseIds[parentJsonPtr];
          var fullPath = fullPaths[parentJsonPtr] + "/" + parentKeyword;
          if (keyIndex !== void 0)
            fullPath += "/" + (typeof keyIndex == "number" ? keyIndex : util32.escapeFragment(keyIndex));
          if (typeof id == "string") {
            id = baseId = normalizeId(baseId ? URI.resolve(baseId, id) : id);
            var refVal = self._refs[id];
            if (typeof refVal == "string")
              refVal = self._refs[refVal];
            if (refVal && refVal.schema) {
              if (!equal(sch, refVal.schema))
                throw new Error('id "' + id + '" resolves to more than one schema');
            } else if (id != normalizeId(fullPath)) {
              if (id[0] == "#") {
                if (localRefs[id] && !equal(sch, localRefs[id]))
                  throw new Error('id "' + id + '" resolves to more than one schema');
                localRefs[id] = sch;
              } else {
                self._refs[id] = fullPath;
              }
            }
          }
          baseIds[jsonPtr] = baseId;
          fullPaths[jsonPtr] = fullPath;
        });
        return localRefs;
      }
    });
    require_error_classes = __commonJS2((exports, module) => {
      var resolve = require_resolve();
      module.exports = {
        Validation: errorSubclass(ValidationError),
        MissingRef: errorSubclass(MissingRefError)
      };
      function ValidationError(errors2) {
        this.message = "validation failed";
        this.errors = errors2;
        this.ajv = this.validation = true;
      }
      MissingRefError.message = function(baseId, ref) {
        return "can't resolve reference " + ref + " from id " + baseId;
      };
      function MissingRefError(baseId, ref, message) {
        this.message = message || MissingRefError.message(baseId, ref);
        this.missingRef = resolve.url(baseId, ref);
        this.missingSchema = resolve.normalizeId(resolve.fullPath(this.missingRef));
      }
      function errorSubclass(Subclass) {
        Subclass.prototype = Object.create(Error.prototype);
        Subclass.prototype.constructor = Subclass;
        return Subclass;
      }
    });
    require_fast_json_stable_stringify = __commonJS2((exports, module) => {
      module.exports = function(data, opts) {
        if (!opts)
          opts = {};
        if (typeof opts === "function")
          opts = { cmp: opts };
        var cycles = typeof opts.cycles === "boolean" ? opts.cycles : false;
        var cmp = opts.cmp && /* @__PURE__ */ (function(f) {
          return function(node) {
            return function(a, b) {
              var aobj = { key: a, value: node[a] };
              var bobj = { key: b, value: node[b] };
              return f(aobj, bobj);
            };
          };
        })(opts.cmp);
        var seen = [];
        return (function stringify(node) {
          if (node && node.toJSON && typeof node.toJSON === "function") {
            node = node.toJSON();
          }
          if (node === void 0)
            return;
          if (typeof node == "number")
            return isFinite(node) ? "" + node : "null";
          if (typeof node !== "object")
            return JSON.stringify(node);
          var i, out;
          if (Array.isArray(node)) {
            out = "[";
            for (i = 0; i < node.length; i++) {
              if (i)
                out += ",";
              out += stringify(node[i]) || "null";
            }
            return out + "]";
          }
          if (node === null)
            return "null";
          if (seen.indexOf(node) !== -1) {
            if (cycles)
              return JSON.stringify("__cycle__");
            throw new TypeError("Converting circular structure to JSON");
          }
          var seenIndex = seen.push(node) - 1;
          var keys = Object.keys(node).sort(cmp && cmp(node));
          out = "";
          for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = stringify(node[key]);
            if (!value)
              continue;
            if (out)
              out += ",";
            out += JSON.stringify(key) + ":" + value;
          }
          seen.splice(seenIndex, 1);
          return "{" + out + "}";
        })(data);
      };
    });
    require_validate = __commonJS2((exports, module) => {
      module.exports = function generate_validate(it, $keyword, $ruleType) {
        var out = "";
        var $async = it.schema.$async === true, $refKeywords = it.util.schemaHasRulesExcept(it.schema, it.RULES.all, "$ref"), $id = it.self._getId(it.schema);
        if (it.opts.strictKeywords) {
          var $unknownKwd = it.util.schemaUnknownRules(it.schema, it.RULES.keywords);
          if ($unknownKwd) {
            var $keywordsMsg = "unknown keyword: " + $unknownKwd;
            if (it.opts.strictKeywords === "log")
              it.logger.warn($keywordsMsg);
            else
              throw new Error($keywordsMsg);
          }
        }
        if (it.isTop) {
          out += " var validate = ";
          if ($async) {
            it.async = true;
            out += "async ";
          }
          out += "function(data, dataPath, parentData, parentDataProperty, rootData) { 'use strict'; ";
          if ($id && (it.opts.sourceCode || it.opts.processCode)) {
            out += " " + ("/*# sourceURL=" + $id + " */") + " ";
          }
        }
        if (typeof it.schema == "boolean" || !($refKeywords || it.schema.$ref)) {
          var $keyword = "false schema";
          var $lvl = it.level;
          var $dataLvl = it.dataLevel;
          var $schema = it.schema[$keyword];
          var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
          var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
          var $breakOnError = !it.opts.allErrors;
          var $errorKeyword;
          var $data = "data" + ($dataLvl || "");
          var $valid = "valid" + $lvl;
          if (it.schema === false) {
            if (it.isTop) {
              $breakOnError = true;
            } else {
              out += " var " + $valid + " = false; ";
            }
            var $$outStack = $$outStack || [];
            $$outStack.push(out);
            out = "";
            if (it.createErrors !== false) {
              out += " { keyword: '" + ($errorKeyword || "false schema") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ";
              if (it.opts.messages !== false) {
                out += " , message: 'boolean schema is false' ";
              }
              if (it.opts.verbose) {
                out += " , schema: false , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
              }
              out += " } ";
            } else {
              out += " {} ";
            }
            var __err = out;
            out = $$outStack.pop();
            if (!it.compositeRule && $breakOnError) {
              if (it.async) {
                out += " throw new ValidationError([" + __err + "]); ";
              } else {
                out += " validate.errors = [" + __err + "]; return false; ";
              }
            } else {
              out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
            }
          } else {
            if (it.isTop) {
              if ($async) {
                out += " return data; ";
              } else {
                out += " validate.errors = null; return true; ";
              }
            } else {
              out += " var " + $valid + " = true; ";
            }
          }
          if (it.isTop) {
            out += " }; return validate; ";
          }
          return out;
        }
        if (it.isTop) {
          var $top = it.isTop, $lvl = it.level = 0, $dataLvl = it.dataLevel = 0, $data = "data";
          it.rootId = it.resolve.fullPath(it.self._getId(it.root.schema));
          it.baseId = it.baseId || it.rootId;
          delete it.isTop;
          it.dataPathArr = [""];
          if (it.schema.default !== void 0 && it.opts.useDefaults && it.opts.strictDefaults) {
            var $defaultMsg = "default is ignored in the schema root";
            if (it.opts.strictDefaults === "log")
              it.logger.warn($defaultMsg);
            else
              throw new Error($defaultMsg);
          }
          out += " var vErrors = null; ";
          out += " var errors = 0;     ";
          out += " if (rootData === undefined) rootData = data; ";
        } else {
          var { level: $lvl, dataLevel: $dataLvl } = it, $data = "data" + ($dataLvl || "");
          if ($id)
            it.baseId = it.resolve.url(it.baseId, $id);
          if ($async && !it.async)
            throw new Error("async schema in sync schema");
          out += " var errs_" + $lvl + " = errors;";
        }
        var $valid = "valid" + $lvl, $breakOnError = !it.opts.allErrors, $closingBraces1 = "", $closingBraces2 = "";
        var $errorKeyword;
        var $typeSchema = it.schema.type, $typeIsArray = Array.isArray($typeSchema);
        if ($typeSchema && it.opts.nullable && it.schema.nullable === true) {
          if ($typeIsArray) {
            if ($typeSchema.indexOf("null") == -1)
              $typeSchema = $typeSchema.concat("null");
          } else if ($typeSchema != "null") {
            $typeSchema = [$typeSchema, "null"];
            $typeIsArray = true;
          }
        }
        if ($typeIsArray && $typeSchema.length == 1) {
          $typeSchema = $typeSchema[0];
          $typeIsArray = false;
        }
        if (it.schema.$ref && $refKeywords) {
          if (it.opts.extendRefs == "fail") {
            throw new Error('$ref: validation keywords used in schema at path "' + it.errSchemaPath + '" (see option extendRefs)');
          } else if (it.opts.extendRefs !== true) {
            $refKeywords = false;
            it.logger.warn('$ref: keywords ignored in schema at path "' + it.errSchemaPath + '"');
          }
        }
        if (it.schema.$comment && it.opts.$comment) {
          out += " " + it.RULES.all.$comment.code(it, "$comment");
        }
        if ($typeSchema) {
          if (it.opts.coerceTypes) {
            var $coerceToTypes = it.util.coerceToTypes(it.opts.coerceTypes, $typeSchema);
          }
          var $rulesGroup = it.RULES.types[$typeSchema];
          if ($coerceToTypes || $typeIsArray || $rulesGroup === true || $rulesGroup && !$shouldUseGroup($rulesGroup)) {
            var $schemaPath = it.schemaPath + ".type", $errSchemaPath = it.errSchemaPath + "/type";
            var $schemaPath = it.schemaPath + ".type", $errSchemaPath = it.errSchemaPath + "/type", $method = $typeIsArray ? "checkDataTypes" : "checkDataType";
            out += " if (" + it.util[$method]($typeSchema, $data, it.opts.strictNumbers, true) + ") { ";
            if ($coerceToTypes) {
              var $dataType = "dataType" + $lvl, $coerced = "coerced" + $lvl;
              out += " var " + $dataType + " = typeof " + $data + "; var " + $coerced + " = undefined; ";
              if (it.opts.coerceTypes == "array") {
                out += " if (" + $dataType + " == 'object' && Array.isArray(" + $data + ") && " + $data + ".length == 1) { " + $data + " = " + $data + "[0]; " + $dataType + " = typeof " + $data + "; if (" + it.util.checkDataType(it.schema.type, $data, it.opts.strictNumbers) + ") " + $coerced + " = " + $data + "; } ";
              }
              out += " if (" + $coerced + " !== undefined) ; ";
              var arr1 = $coerceToTypes;
              if (arr1) {
                var $type, $i = -1, l1 = arr1.length - 1;
                while ($i < l1) {
                  $type = arr1[$i += 1];
                  if ($type == "string") {
                    out += " else if (" + $dataType + " == 'number' || " + $dataType + " == 'boolean') " + $coerced + " = '' + " + $data + "; else if (" + $data + " === null) " + $coerced + " = ''; ";
                  } else if ($type == "number" || $type == "integer") {
                    out += " else if (" + $dataType + " == 'boolean' || " + $data + " === null || (" + $dataType + " == 'string' && " + $data + " && " + $data + " == +" + $data + " ";
                    if ($type == "integer") {
                      out += " && !(" + $data + " % 1)";
                    }
                    out += ")) " + $coerced + " = +" + $data + "; ";
                  } else if ($type == "boolean") {
                    out += " else if (" + $data + " === 'false' || " + $data + " === 0 || " + $data + " === null) " + $coerced + " = false; else if (" + $data + " === 'true' || " + $data + " === 1) " + $coerced + " = true; ";
                  } else if ($type == "null") {
                    out += " else if (" + $data + " === '' || " + $data + " === 0 || " + $data + " === false) " + $coerced + " = null; ";
                  } else if (it.opts.coerceTypes == "array" && $type == "array") {
                    out += " else if (" + $dataType + " == 'string' || " + $dataType + " == 'number' || " + $dataType + " == 'boolean' || " + $data + " == null) " + $coerced + " = [" + $data + "]; ";
                  }
                }
              }
              out += " else {   ";
              var $$outStack = $$outStack || [];
              $$outStack.push(out);
              out = "";
              if (it.createErrors !== false) {
                out += " { keyword: '" + ($errorKeyword || "type") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { type: '";
                if ($typeIsArray) {
                  out += "" + $typeSchema.join(",");
                } else {
                  out += "" + $typeSchema;
                }
                out += "' } ";
                if (it.opts.messages !== false) {
                  out += " , message: 'should be ";
                  if ($typeIsArray) {
                    out += "" + $typeSchema.join(",");
                  } else {
                    out += "" + $typeSchema;
                  }
                  out += "' ";
                }
                if (it.opts.verbose) {
                  out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                }
                out += " } ";
              } else {
                out += " {} ";
              }
              var __err = out;
              out = $$outStack.pop();
              if (!it.compositeRule && $breakOnError) {
                if (it.async) {
                  out += " throw new ValidationError([" + __err + "]); ";
                } else {
                  out += " validate.errors = [" + __err + "]; return false; ";
                }
              } else {
                out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
              }
              out += " } if (" + $coerced + " !== undefined) {  ";
              var $parentData = $dataLvl ? "data" + ($dataLvl - 1 || "") : "parentData", $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : "parentDataProperty";
              out += " " + $data + " = " + $coerced + "; ";
              if (!$dataLvl) {
                out += "if (" + $parentData + " !== undefined)";
              }
              out += " " + $parentData + "[" + $parentDataProperty + "] = " + $coerced + "; } ";
            } else {
              var $$outStack = $$outStack || [];
              $$outStack.push(out);
              out = "";
              if (it.createErrors !== false) {
                out += " { keyword: '" + ($errorKeyword || "type") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { type: '";
                if ($typeIsArray) {
                  out += "" + $typeSchema.join(",");
                } else {
                  out += "" + $typeSchema;
                }
                out += "' } ";
                if (it.opts.messages !== false) {
                  out += " , message: 'should be ";
                  if ($typeIsArray) {
                    out += "" + $typeSchema.join(",");
                  } else {
                    out += "" + $typeSchema;
                  }
                  out += "' ";
                }
                if (it.opts.verbose) {
                  out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                }
                out += " } ";
              } else {
                out += " {} ";
              }
              var __err = out;
              out = $$outStack.pop();
              if (!it.compositeRule && $breakOnError) {
                if (it.async) {
                  out += " throw new ValidationError([" + __err + "]); ";
                } else {
                  out += " validate.errors = [" + __err + "]; return false; ";
                }
              } else {
                out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
              }
            }
            out += " } ";
          }
        }
        if (it.schema.$ref && !$refKeywords) {
          out += " " + it.RULES.all.$ref.code(it, "$ref") + " ";
          if ($breakOnError) {
            out += " } if (errors === ";
            if ($top) {
              out += "0";
            } else {
              out += "errs_" + $lvl;
            }
            out += ") { ";
            $closingBraces2 += "}";
          }
        } else {
          var arr2 = it.RULES;
          if (arr2) {
            var $rulesGroup, i2 = -1, l2 = arr2.length - 1;
            while (i2 < l2) {
              $rulesGroup = arr2[i2 += 1];
              if ($shouldUseGroup($rulesGroup)) {
                if ($rulesGroup.type) {
                  out += " if (" + it.util.checkDataType($rulesGroup.type, $data, it.opts.strictNumbers) + ") { ";
                }
                if (it.opts.useDefaults) {
                  if ($rulesGroup.type == "object" && it.schema.properties) {
                    var $schema = it.schema.properties, $schemaKeys = Object.keys($schema);
                    var arr3 = $schemaKeys;
                    if (arr3) {
                      var $propertyKey, i3 = -1, l3 = arr3.length - 1;
                      while (i3 < l3) {
                        $propertyKey = arr3[i3 += 1];
                        var $sch = $schema[$propertyKey];
                        if ($sch.default !== void 0) {
                          var $passData = $data + it.util.getProperty($propertyKey);
                          if (it.compositeRule) {
                            if (it.opts.strictDefaults) {
                              var $defaultMsg = "default is ignored for: " + $passData;
                              if (it.opts.strictDefaults === "log")
                                it.logger.warn($defaultMsg);
                              else
                                throw new Error($defaultMsg);
                            }
                          } else {
                            out += " if (" + $passData + " === undefined ";
                            if (it.opts.useDefaults == "empty") {
                              out += " || " + $passData + " === null || " + $passData + " === '' ";
                            }
                            out += " ) " + $passData + " = ";
                            if (it.opts.useDefaults == "shared") {
                              out += " " + it.useDefault($sch.default) + " ";
                            } else {
                              out += " " + JSON.stringify($sch.default) + " ";
                            }
                            out += "; ";
                          }
                        }
                      }
                    }
                  } else if ($rulesGroup.type == "array" && Array.isArray(it.schema.items)) {
                    var arr4 = it.schema.items;
                    if (arr4) {
                      var $sch, $i = -1, l4 = arr4.length - 1;
                      while ($i < l4) {
                        $sch = arr4[$i += 1];
                        if ($sch.default !== void 0) {
                          var $passData = $data + "[" + $i + "]";
                          if (it.compositeRule) {
                            if (it.opts.strictDefaults) {
                              var $defaultMsg = "default is ignored for: " + $passData;
                              if (it.opts.strictDefaults === "log")
                                it.logger.warn($defaultMsg);
                              else
                                throw new Error($defaultMsg);
                            }
                          } else {
                            out += " if (" + $passData + " === undefined ";
                            if (it.opts.useDefaults == "empty") {
                              out += " || " + $passData + " === null || " + $passData + " === '' ";
                            }
                            out += " ) " + $passData + " = ";
                            if (it.opts.useDefaults == "shared") {
                              out += " " + it.useDefault($sch.default) + " ";
                            } else {
                              out += " " + JSON.stringify($sch.default) + " ";
                            }
                            out += "; ";
                          }
                        }
                      }
                    }
                  }
                }
                var arr5 = $rulesGroup.rules;
                if (arr5) {
                  var $rule, i5 = -1, l5 = arr5.length - 1;
                  while (i5 < l5) {
                    $rule = arr5[i5 += 1];
                    if ($shouldUseRule($rule)) {
                      var $code = $rule.code(it, $rule.keyword, $rulesGroup.type);
                      if ($code) {
                        out += " " + $code + " ";
                        if ($breakOnError) {
                          $closingBraces1 += "}";
                        }
                      }
                    }
                  }
                }
                if ($breakOnError) {
                  out += " " + $closingBraces1 + " ";
                  $closingBraces1 = "";
                }
                if ($rulesGroup.type) {
                  out += " } ";
                  if ($typeSchema && $typeSchema === $rulesGroup.type && !$coerceToTypes) {
                    out += " else { ";
                    var $schemaPath = it.schemaPath + ".type", $errSchemaPath = it.errSchemaPath + "/type";
                    var $$outStack = $$outStack || [];
                    $$outStack.push(out);
                    out = "";
                    if (it.createErrors !== false) {
                      out += " { keyword: '" + ($errorKeyword || "type") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { type: '";
                      if ($typeIsArray) {
                        out += "" + $typeSchema.join(",");
                      } else {
                        out += "" + $typeSchema;
                      }
                      out += "' } ";
                      if (it.opts.messages !== false) {
                        out += " , message: 'should be ";
                        if ($typeIsArray) {
                          out += "" + $typeSchema.join(",");
                        } else {
                          out += "" + $typeSchema;
                        }
                        out += "' ";
                      }
                      if (it.opts.verbose) {
                        out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                      }
                      out += " } ";
                    } else {
                      out += " {} ";
                    }
                    var __err = out;
                    out = $$outStack.pop();
                    if (!it.compositeRule && $breakOnError) {
                      if (it.async) {
                        out += " throw new ValidationError([" + __err + "]); ";
                      } else {
                        out += " validate.errors = [" + __err + "]; return false; ";
                      }
                    } else {
                      out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
                    }
                    out += " } ";
                  }
                }
                if ($breakOnError) {
                  out += " if (errors === ";
                  if ($top) {
                    out += "0";
                  } else {
                    out += "errs_" + $lvl;
                  }
                  out += ") { ";
                  $closingBraces2 += "}";
                }
              }
            }
          }
        }
        if ($breakOnError) {
          out += " " + $closingBraces2 + " ";
        }
        if ($top) {
          if ($async) {
            out += " if (errors === 0) return data;           ";
            out += " else throw new ValidationError(vErrors); ";
          } else {
            out += " validate.errors = vErrors; ";
            out += " return errors === 0;       ";
          }
          out += " }; return validate;";
        } else {
          out += " var " + $valid + " = errors === errs_" + $lvl + ";";
        }
        function $shouldUseGroup($rulesGroup2) {
          var rules = $rulesGroup2.rules;
          for (var i = 0; i < rules.length; i++)
            if ($shouldUseRule(rules[i]))
              return true;
        }
        function $shouldUseRule($rule2) {
          return it.schema[$rule2.keyword] !== void 0 || $rule2.implements && $ruleImplementsSomeKeyword($rule2);
        }
        function $ruleImplementsSomeKeyword($rule2) {
          var impl = $rule2.implements;
          for (var i = 0; i < impl.length; i++)
            if (it.schema[impl[i]] !== void 0)
              return true;
        }
        return out;
      };
    });
    require_compile = __commonJS2((exports, module) => {
      var resolve = require_resolve();
      var util32 = require_util();
      var errorClasses = require_error_classes();
      var stableStringify = require_fast_json_stable_stringify();
      var validateGenerator = require_validate();
      var ucs2length = util32.ucs2length;
      var equal = require_fast_deep_equal();
      var ValidationError = errorClasses.Validation;
      module.exports = compile;
      function compile(schema, root, localRefs, baseId) {
        var self = this, opts = this._opts, refVal = [void 0], refs = {}, patterns = [], patternsHash = {}, defaults = [], defaultsHash = {}, customRules = [];
        root = root || { schema, refVal, refs };
        var c = checkCompiling.call(this, schema, root, baseId);
        var compilation = this._compilations[c.index];
        if (c.compiling)
          return compilation.callValidate = callValidate;
        var formats = this._formats;
        var RULES = this.RULES;
        try {
          var v = localCompile(schema, root, localRefs, baseId);
          compilation.validate = v;
          var cv = compilation.callValidate;
          if (cv) {
            cv.schema = v.schema;
            cv.errors = null;
            cv.refs = v.refs;
            cv.refVal = v.refVal;
            cv.root = v.root;
            cv.$async = v.$async;
            if (opts.sourceCode)
              cv.source = v.source;
          }
          return v;
        } finally {
          endCompiling.call(this, schema, root, baseId);
        }
        function callValidate() {
          var validate = compilation.validate;
          var result = validate.apply(this, arguments);
          callValidate.errors = validate.errors;
          return result;
        }
        function localCompile(_schema, _root, localRefs2, baseId2) {
          var isRoot = !_root || _root && _root.schema == _schema;
          if (_root.schema != root.schema)
            return compile.call(self, _schema, _root, localRefs2, baseId2);
          var $async = _schema.$async === true;
          var sourceCode = validateGenerator({
            isTop: true,
            schema: _schema,
            isRoot,
            baseId: baseId2,
            root: _root,
            schemaPath: "",
            errSchemaPath: "#",
            errorPath: '""',
            MissingRefError: errorClasses.MissingRef,
            RULES,
            validate: validateGenerator,
            util: util32,
            resolve,
            resolveRef,
            usePattern,
            useDefault,
            useCustomRule,
            opts,
            formats,
            logger: self.logger,
            self
          });
          sourceCode = vars(refVal, refValCode) + vars(patterns, patternCode) + vars(defaults, defaultCode) + vars(customRules, customRuleCode) + sourceCode;
          if (opts.processCode)
            sourceCode = opts.processCode(sourceCode, _schema);
          var validate;
          try {
            var makeValidate = new Function("self", "RULES", "formats", "root", "refVal", "defaults", "customRules", "equal", "ucs2length", "ValidationError", sourceCode);
            validate = makeValidate(self, RULES, formats, root, refVal, defaults, customRules, equal, ucs2length, ValidationError);
            refVal[0] = validate;
          } catch (e) {
            self.logger.error("Error compiling schema, function code:", sourceCode);
            throw e;
          }
          validate.schema = _schema;
          validate.errors = null;
          validate.refs = refs;
          validate.refVal = refVal;
          validate.root = isRoot ? validate : _root;
          if ($async)
            validate.$async = true;
          if (opts.sourceCode === true) {
            validate.source = {
              code: sourceCode,
              patterns,
              defaults
            };
          }
          return validate;
        }
        function resolveRef(baseId2, ref, isRoot) {
          ref = resolve.url(baseId2, ref);
          var refIndex = refs[ref];
          var _refVal, refCode;
          if (refIndex !== void 0) {
            _refVal = refVal[refIndex];
            refCode = "refVal[" + refIndex + "]";
            return resolvedRef(_refVal, refCode);
          }
          if (!isRoot && root.refs) {
            var rootRefId = root.refs[ref];
            if (rootRefId !== void 0) {
              _refVal = root.refVal[rootRefId];
              refCode = addLocalRef(ref, _refVal);
              return resolvedRef(_refVal, refCode);
            }
          }
          refCode = addLocalRef(ref);
          var v2 = resolve.call(self, localCompile, root, ref);
          if (v2 === void 0) {
            var localSchema = localRefs && localRefs[ref];
            if (localSchema) {
              v2 = resolve.inlineRef(localSchema, opts.inlineRefs) ? localSchema : compile.call(self, localSchema, root, localRefs, baseId2);
            }
          }
          if (v2 === void 0) {
            removeLocalRef(ref);
          } else {
            replaceLocalRef(ref, v2);
            return resolvedRef(v2, refCode);
          }
        }
        function addLocalRef(ref, v2) {
          var refId = refVal.length;
          refVal[refId] = v2;
          refs[ref] = refId;
          return "refVal" + refId;
        }
        function removeLocalRef(ref) {
          delete refs[ref];
        }
        function replaceLocalRef(ref, v2) {
          var refId = refs[ref];
          refVal[refId] = v2;
        }
        function resolvedRef(refVal2, code) {
          return typeof refVal2 == "object" || typeof refVal2 == "boolean" ? { code, schema: refVal2, inline: true } : { code, $async: refVal2 && !!refVal2.$async };
        }
        function usePattern(regexStr) {
          var index = patternsHash[regexStr];
          if (index === void 0) {
            index = patternsHash[regexStr] = patterns.length;
            patterns[index] = regexStr;
          }
          return "pattern" + index;
        }
        function useDefault(value) {
          switch (typeof value) {
            case "boolean":
            case "number":
              return "" + value;
            case "string":
              return util32.toQuotedString(value);
            case "object":
              if (value === null)
                return "null";
              var valueStr = stableStringify(value);
              var index = defaultsHash[valueStr];
              if (index === void 0) {
                index = defaultsHash[valueStr] = defaults.length;
                defaults[index] = value;
              }
              return "default" + index;
          }
        }
        function useCustomRule(rule, schema2, parentSchema, it) {
          if (self._opts.validateSchema !== false) {
            var deps = rule.definition.dependencies;
            if (deps && !deps.every(function(keyword) {
              return Object.prototype.hasOwnProperty.call(parentSchema, keyword);
            }))
              throw new Error("parent schema must have all required keywords: " + deps.join(","));
            var validateSchema = rule.definition.validateSchema;
            if (validateSchema) {
              var valid = validateSchema(schema2);
              if (!valid) {
                var message = "keyword schema is invalid: " + self.errorsText(validateSchema.errors);
                if (self._opts.validateSchema == "log")
                  self.logger.error(message);
                else
                  throw new Error(message);
              }
            }
          }
          var compile2 = rule.definition.compile, inline = rule.definition.inline, macro = rule.definition.macro;
          var validate;
          if (compile2) {
            validate = compile2.call(self, schema2, parentSchema, it);
          } else if (macro) {
            validate = macro.call(self, schema2, parentSchema, it);
            if (opts.validateSchema !== false)
              self.validateSchema(validate, true);
          } else if (inline) {
            validate = inline.call(self, it, rule.keyword, schema2, parentSchema);
          } else {
            validate = rule.definition.validate;
            if (!validate)
              return;
          }
          if (validate === void 0)
            throw new Error('custom keyword "' + rule.keyword + '"failed to compile');
          var index = customRules.length;
          customRules[index] = validate;
          return {
            code: "customRule" + index,
            validate
          };
        }
      }
      function checkCompiling(schema, root, baseId) {
        var index = compIndex.call(this, schema, root, baseId);
        if (index >= 0)
          return { index, compiling: true };
        index = this._compilations.length;
        this._compilations[index] = {
          schema,
          root,
          baseId
        };
        return { index, compiling: false };
      }
      function endCompiling(schema, root, baseId) {
        var i = compIndex.call(this, schema, root, baseId);
        if (i >= 0)
          this._compilations.splice(i, 1);
      }
      function compIndex(schema, root, baseId) {
        for (var i = 0; i < this._compilations.length; i++) {
          var c = this._compilations[i];
          if (c.schema == schema && c.root == root && c.baseId == baseId)
            return i;
        }
        return -1;
      }
      function patternCode(i, patterns) {
        return "var pattern" + i + " = new RegExp(" + util32.toQuotedString(patterns[i]) + ");";
      }
      function defaultCode(i) {
        return "var default" + i + " = defaults[" + i + "];";
      }
      function refValCode(i, refVal) {
        return refVal[i] === void 0 ? "" : "var refVal" + i + " = refVal[" + i + "];";
      }
      function customRuleCode(i) {
        return "var customRule" + i + " = customRules[" + i + "];";
      }
      function vars(arr, statement) {
        if (!arr.length)
          return "";
        var code = "";
        for (var i = 0; i < arr.length; i++)
          code += statement(i, arr);
        return code;
      }
    });
    require_cache = __commonJS2((exports, module) => {
      var Cache = module.exports = function Cache2() {
        this._cache = {};
      };
      Cache.prototype.put = function Cache_put(key, value) {
        this._cache[key] = value;
      };
      Cache.prototype.get = function Cache_get(key) {
        return this._cache[key];
      };
      Cache.prototype.del = function Cache_del(key) {
        delete this._cache[key];
      };
      Cache.prototype.clear = function Cache_clear() {
        this._cache = {};
      };
    });
    require_formats = __commonJS2((exports, module) => {
      var util32 = require_util();
      var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
      var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
      var HOSTNAME = /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i;
      var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
      var URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
      var URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
      var URL2 = /^(?:(?:http[s\u017F]?|ftp):\/\/)(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.[0-9]{1,3}){3})(?!127(?:\.[0-9]{1,3}){3})(?!169\.254(?:\.[0-9]{1,3}){2})(?!192\.168(?:\.[0-9]{1,3}){2})(?!172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})(?:[1-9][0-9]?|1[0-9][0-9]|2[01][0-9]|22[0-3])(?:\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}(?:\.(?:[1-9][0-9]?|1[0-9][0-9]|2[0-4][0-9]|25[0-4]))|(?:(?:(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-)*(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)(?:\.(?:(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-)*(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*(?:\.(?:(?:[a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})))(?::[0-9]{2,5})?(?:\/(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?$/i;
      var UUID = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
      var JSON_POINTER = /^(?:\/(?:[^~/]|~0|~1)*)*$/;
      var JSON_POINTER_URI_FRAGMENT = /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
      var RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;
      module.exports = formats;
      function formats(mode) {
        mode = mode == "full" ? "full" : "fast";
        return util32.copy(formats[mode]);
      }
      formats.fast = {
        date: /^\d\d\d\d-[0-1]\d-[0-3]\d$/,
        time: /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i,
        "date-time": /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i,
        uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
        "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
        "uri-template": URITEMPLATE,
        url: URL2,
        email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
        hostname: HOSTNAME,
        ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
        ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
        regex,
        uuid: UUID,
        "json-pointer": JSON_POINTER,
        "json-pointer-uri-fragment": JSON_POINTER_URI_FRAGMENT,
        "relative-json-pointer": RELATIVE_JSON_POINTER
      };
      formats.full = {
        date,
        time,
        "date-time": date_time,
        uri,
        "uri-reference": URIREF,
        "uri-template": URITEMPLATE,
        url: URL2,
        email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
        hostname: HOSTNAME,
        ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
        ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
        regex,
        uuid: UUID,
        "json-pointer": JSON_POINTER,
        "json-pointer-uri-fragment": JSON_POINTER_URI_FRAGMENT,
        "relative-json-pointer": RELATIVE_JSON_POINTER
      };
      function isLeapYear(year) {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      }
      function date(str) {
        var matches = str.match(DATE);
        if (!matches)
          return false;
        var year = +matches[1];
        var month = +matches[2];
        var day = +matches[3];
        return month >= 1 && month <= 12 && day >= 1 && day <= (month == 2 && isLeapYear(year) ? 29 : DAYS[month]);
      }
      function time(str, full) {
        var matches = str.match(TIME);
        if (!matches)
          return false;
        var hour = matches[1];
        var minute = matches[2];
        var second = matches[3];
        var timeZone = matches[5];
        return (hour <= 23 && minute <= 59 && second <= 59 || hour == 23 && minute == 59 && second == 60) && (!full || timeZone);
      }
      var DATE_TIME_SEPARATOR = /t|\s/i;
      function date_time(str) {
        var dateTime = str.split(DATE_TIME_SEPARATOR);
        return dateTime.length == 2 && date(dateTime[0]) && time(dateTime[1], true);
      }
      var NOT_URI_FRAGMENT = /\/|:/;
      function uri(str) {
        return NOT_URI_FRAGMENT.test(str) && URI.test(str);
      }
      var Z_ANCHOR = /[^\\]\\Z/;
      function regex(str) {
        if (Z_ANCHOR.test(str))
          return false;
        try {
          new RegExp(str);
          return true;
        } catch (e) {
          return false;
        }
      }
    });
    require_ref = __commonJS2((exports, module) => {
      module.exports = function generate_ref(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $valid = "valid" + $lvl;
        var $async, $refCode;
        if ($schema == "#" || $schema == "#/") {
          if (it.isRoot) {
            $async = it.async;
            $refCode = "validate";
          } else {
            $async = it.root.schema.$async === true;
            $refCode = "root.refVal[0]";
          }
        } else {
          var $refVal = it.resolveRef(it.baseId, $schema, it.isRoot);
          if ($refVal === void 0) {
            var $message = it.MissingRefError.message(it.baseId, $schema);
            if (it.opts.missingRefs == "fail") {
              it.logger.error($message);
              var $$outStack = $$outStack || [];
              $$outStack.push(out);
              out = "";
              if (it.createErrors !== false) {
                out += " { keyword: '$ref' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { ref: '" + it.util.escapeQuotes($schema) + "' } ";
                if (it.opts.messages !== false) {
                  out += " , message: 'can\\'t resolve reference " + it.util.escapeQuotes($schema) + "' ";
                }
                if (it.opts.verbose) {
                  out += " , schema: " + it.util.toQuotedString($schema) + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                }
                out += " } ";
              } else {
                out += " {} ";
              }
              var __err = out;
              out = $$outStack.pop();
              if (!it.compositeRule && $breakOnError) {
                if (it.async) {
                  out += " throw new ValidationError([" + __err + "]); ";
                } else {
                  out += " validate.errors = [" + __err + "]; return false; ";
                }
              } else {
                out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
              }
              if ($breakOnError) {
                out += " if (false) { ";
              }
            } else if (it.opts.missingRefs == "ignore") {
              it.logger.warn($message);
              if ($breakOnError) {
                out += " if (true) { ";
              }
            } else {
              throw new it.MissingRefError(it.baseId, $schema, $message);
            }
          } else if ($refVal.inline) {
            var $it = it.util.copy(it);
            $it.level++;
            var $nextValid = "valid" + $it.level;
            $it.schema = $refVal.schema;
            $it.schemaPath = "";
            $it.errSchemaPath = $schema;
            var $code = it.validate($it).replace(/validate\.schema/g, $refVal.code);
            out += " " + $code + " ";
            if ($breakOnError) {
              out += " if (" + $nextValid + ") { ";
            }
          } else {
            $async = $refVal.$async === true || it.async && $refVal.$async !== false;
            $refCode = $refVal.code;
          }
        }
        if ($refCode) {
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.opts.passContext) {
            out += " " + $refCode + ".call(this, ";
          } else {
            out += " " + $refCode + "( ";
          }
          out += " " + $data + ", (dataPath || '')";
          if (it.errorPath != '""') {
            out += " + " + it.errorPath;
          }
          var $parentData = $dataLvl ? "data" + ($dataLvl - 1 || "") : "parentData", $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : "parentDataProperty";
          out += " , " + $parentData + " , " + $parentDataProperty + ", rootData)  ";
          var __callValidate = out;
          out = $$outStack.pop();
          if ($async) {
            if (!it.async)
              throw new Error("async schema referenced by sync schema");
            if ($breakOnError) {
              out += " var " + $valid + "; ";
            }
            out += " try { await " + __callValidate + "; ";
            if ($breakOnError) {
              out += " " + $valid + " = true; ";
            }
            out += " } catch (e) { if (!(e instanceof ValidationError)) throw e; if (vErrors === null) vErrors = e.errors; else vErrors = vErrors.concat(e.errors); errors = vErrors.length; ";
            if ($breakOnError) {
              out += " " + $valid + " = false; ";
            }
            out += " } ";
            if ($breakOnError) {
              out += " if (" + $valid + ") { ";
            }
          } else {
            out += " if (!" + __callValidate + ") { if (vErrors === null) vErrors = " + $refCode + ".errors; else vErrors = vErrors.concat(" + $refCode + ".errors); errors = vErrors.length; } ";
            if ($breakOnError) {
              out += " else { ";
            }
          }
        }
        return out;
      };
    });
    require_allOf = __commonJS2((exports, module) => {
      module.exports = function generate_allOf(it, $keyword, $ruleType) {
        var out = " ";
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $it = it.util.copy(it);
        var $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level;
        var $currentBaseId = $it.baseId, $allSchemasEmpty = true;
        var arr1 = $schema;
        if (arr1) {
          var $sch, $i = -1, l1 = arr1.length - 1;
          while ($i < l1) {
            $sch = arr1[$i += 1];
            if (it.opts.strictKeywords ? typeof $sch == "object" && Object.keys($sch).length > 0 || $sch === false : it.util.schemaHasRules($sch, it.RULES.all)) {
              $allSchemasEmpty = false;
              $it.schema = $sch;
              $it.schemaPath = $schemaPath + "[" + $i + "]";
              $it.errSchemaPath = $errSchemaPath + "/" + $i;
              out += "  " + it.validate($it) + " ";
              $it.baseId = $currentBaseId;
              if ($breakOnError) {
                out += " if (" + $nextValid + ") { ";
                $closingBraces += "}";
              }
            }
          }
        }
        if ($breakOnError) {
          if ($allSchemasEmpty) {
            out += " if (true) { ";
          } else {
            out += " " + $closingBraces.slice(0, -1) + " ";
          }
        }
        return out;
      };
    });
    require_anyOf = __commonJS2((exports, module) => {
      module.exports = function generate_anyOf(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $valid = "valid" + $lvl;
        var $errs = "errs__" + $lvl;
        var $it = it.util.copy(it);
        var $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level;
        var $noEmptySchema = $schema.every(function($sch2) {
          return it.opts.strictKeywords ? typeof $sch2 == "object" && Object.keys($sch2).length > 0 || $sch2 === false : it.util.schemaHasRules($sch2, it.RULES.all);
        });
        if ($noEmptySchema) {
          var $currentBaseId = $it.baseId;
          out += " var " + $errs + " = errors; var " + $valid + " = false;  ";
          var $wasComposite = it.compositeRule;
          it.compositeRule = $it.compositeRule = true;
          var arr1 = $schema;
          if (arr1) {
            var $sch, $i = -1, l1 = arr1.length - 1;
            while ($i < l1) {
              $sch = arr1[$i += 1];
              $it.schema = $sch;
              $it.schemaPath = $schemaPath + "[" + $i + "]";
              $it.errSchemaPath = $errSchemaPath + "/" + $i;
              out += "  " + it.validate($it) + " ";
              $it.baseId = $currentBaseId;
              out += " " + $valid + " = " + $valid + " || " + $nextValid + "; if (!" + $valid + ") { ";
              $closingBraces += "}";
            }
          }
          it.compositeRule = $it.compositeRule = $wasComposite;
          out += " " + $closingBraces + " if (!" + $valid + ") {   var err =   ";
          if (it.createErrors !== false) {
            out += " { keyword: 'anyOf' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ";
            if (it.opts.messages !== false) {
              out += " , message: 'should match some schema in anyOf' ";
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError(vErrors); ";
            } else {
              out += " validate.errors = vErrors; return false; ";
            }
          }
          out += " } else {  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; } ";
          if (it.opts.allErrors) {
            out += " } ";
          }
        } else {
          if ($breakOnError) {
            out += " if (true) { ";
          }
        }
        return out;
      };
    });
    require_comment = __commonJS2((exports, module) => {
      module.exports = function generate_comment(it, $keyword, $ruleType) {
        var out = " ";
        var $schema = it.schema[$keyword];
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $comment = it.util.toQuotedString($schema);
        if (it.opts.$comment === true) {
          out += " console.log(" + $comment + ");";
        } else if (typeof it.opts.$comment == "function") {
          out += " self._opts.$comment(" + $comment + ", " + it.util.toQuotedString($errSchemaPath) + ", validate.root.schema);";
        }
        return out;
      };
    });
    require_const = __commonJS2((exports, module) => {
      module.exports = function generate_const(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $valid = "valid" + $lvl;
        var $isData = it.opts.$data && $schema && $schema.$data, $schemaValue;
        if ($isData) {
          out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ";
          $schemaValue = "schema" + $lvl;
        } else {
          $schemaValue = $schema;
        }
        if (!$isData) {
          out += " var schema" + $lvl + " = validate.schema" + $schemaPath + ";";
        }
        out += "var " + $valid + " = equal(" + $data + ", schema" + $lvl + "); if (!" + $valid + ") {   ";
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out += " { keyword: 'const' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { allowedValue: schema" + $lvl + " } ";
          if (it.opts.messages !== false) {
            out += " , message: 'should be equal to constant' ";
          }
          if (it.opts.verbose) {
            out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        out += " }";
        if ($breakOnError) {
          out += " else { ";
        }
        return out;
      };
    });
    require_contains = __commonJS2((exports, module) => {
      module.exports = function generate_contains(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $valid = "valid" + $lvl;
        var $errs = "errs__" + $lvl;
        var $it = it.util.copy(it);
        var $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level;
        var $idx = "i" + $lvl, $dataNxt = $it.dataLevel = it.dataLevel + 1, $nextData = "data" + $dataNxt, $currentBaseId = it.baseId, $nonEmptySchema = it.opts.strictKeywords ? typeof $schema == "object" && Object.keys($schema).length > 0 || $schema === false : it.util.schemaHasRules($schema, it.RULES.all);
        out += "var " + $errs + " = errors;var " + $valid + ";";
        if ($nonEmptySchema) {
          var $wasComposite = it.compositeRule;
          it.compositeRule = $it.compositeRule = true;
          $it.schema = $schema;
          $it.schemaPath = $schemaPath;
          $it.errSchemaPath = $errSchemaPath;
          out += " var " + $nextValid + " = false; for (var " + $idx + " = 0; " + $idx + " < " + $data + ".length; " + $idx + "++) { ";
          $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
          var $passData = $data + "[" + $idx + "]";
          $it.dataPathArr[$dataNxt] = $idx;
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
          } else {
            out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
          }
          out += " if (" + $nextValid + ") break; }  ";
          it.compositeRule = $it.compositeRule = $wasComposite;
          out += " " + $closingBraces + " if (!" + $nextValid + ") {";
        } else {
          out += " if (" + $data + ".length == 0) {";
        }
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out += " { keyword: 'contains' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ";
          if (it.opts.messages !== false) {
            out += " , message: 'should contain a valid item' ";
          }
          if (it.opts.verbose) {
            out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        out += " } else { ";
        if ($nonEmptySchema) {
          out += "  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; } ";
        }
        if (it.opts.allErrors) {
          out += " } ";
        }
        return out;
      };
    });
    require_dependencies = __commonJS2((exports, module) => {
      module.exports = function generate_dependencies(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $errs = "errs__" + $lvl;
        var $it = it.util.copy(it);
        var $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level;
        var $schemaDeps = {}, $propertyDeps = {}, $ownProperties = it.opts.ownProperties;
        for ($property in $schema) {
          if ($property == "__proto__")
            continue;
          var $sch = $schema[$property];
          var $deps = Array.isArray($sch) ? $propertyDeps : $schemaDeps;
          $deps[$property] = $sch;
        }
        out += "var " + $errs + " = errors;";
        var $currentErrorPath = it.errorPath;
        out += "var missing" + $lvl + ";";
        for (var $property in $propertyDeps) {
          $deps = $propertyDeps[$property];
          if ($deps.length) {
            out += " if ( " + $data + it.util.getProperty($property) + " !== undefined ";
            if ($ownProperties) {
              out += " && Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($property) + "') ";
            }
            if ($breakOnError) {
              out += " && ( ";
              var arr1 = $deps;
              if (arr1) {
                var $propertyKey, $i = -1, l1 = arr1.length - 1;
                while ($i < l1) {
                  $propertyKey = arr1[$i += 1];
                  if ($i) {
                    out += " || ";
                  }
                  var $prop = it.util.getProperty($propertyKey), $useData = $data + $prop;
                  out += " ( ( " + $useData + " === undefined ";
                  if ($ownProperties) {
                    out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
                  }
                  out += ") && (missing" + $lvl + " = " + it.util.toQuotedString(it.opts.jsonPointers ? $propertyKey : $prop) + ") ) ";
                }
              }
              out += ")) {  ";
              var $propertyPath = "missing" + $lvl, $missingProperty = "' + " + $propertyPath + " + '";
              if (it.opts._errorDataPathProperty) {
                it.errorPath = it.opts.jsonPointers ? it.util.getPathExpr($currentErrorPath, $propertyPath, true) : $currentErrorPath + " + " + $propertyPath;
              }
              var $$outStack = $$outStack || [];
              $$outStack.push(out);
              out = "";
              if (it.createErrors !== false) {
                out += " { keyword: 'dependencies' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { property: '" + it.util.escapeQuotes($property) + "', missingProperty: '" + $missingProperty + "', depsCount: " + $deps.length + ", deps: '" + it.util.escapeQuotes($deps.length == 1 ? $deps[0] : $deps.join(", ")) + "' } ";
                if (it.opts.messages !== false) {
                  out += " , message: 'should have ";
                  if ($deps.length == 1) {
                    out += "property " + it.util.escapeQuotes($deps[0]);
                  } else {
                    out += "properties " + it.util.escapeQuotes($deps.join(", "));
                  }
                  out += " when property " + it.util.escapeQuotes($property) + " is present' ";
                }
                if (it.opts.verbose) {
                  out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                }
                out += " } ";
              } else {
                out += " {} ";
              }
              var __err = out;
              out = $$outStack.pop();
              if (!it.compositeRule && $breakOnError) {
                if (it.async) {
                  out += " throw new ValidationError([" + __err + "]); ";
                } else {
                  out += " validate.errors = [" + __err + "]; return false; ";
                }
              } else {
                out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
              }
            } else {
              out += " ) { ";
              var arr2 = $deps;
              if (arr2) {
                var $propertyKey, i2 = -1, l2 = arr2.length - 1;
                while (i2 < l2) {
                  $propertyKey = arr2[i2 += 1];
                  var $prop = it.util.getProperty($propertyKey), $missingProperty = it.util.escapeQuotes($propertyKey), $useData = $data + $prop;
                  if (it.opts._errorDataPathProperty) {
                    it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
                  }
                  out += " if ( " + $useData + " === undefined ";
                  if ($ownProperties) {
                    out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
                  }
                  out += ") {  var err =   ";
                  if (it.createErrors !== false) {
                    out += " { keyword: 'dependencies' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { property: '" + it.util.escapeQuotes($property) + "', missingProperty: '" + $missingProperty + "', depsCount: " + $deps.length + ", deps: '" + it.util.escapeQuotes($deps.length == 1 ? $deps[0] : $deps.join(", ")) + "' } ";
                    if (it.opts.messages !== false) {
                      out += " , message: 'should have ";
                      if ($deps.length == 1) {
                        out += "property " + it.util.escapeQuotes($deps[0]);
                      } else {
                        out += "properties " + it.util.escapeQuotes($deps.join(", "));
                      }
                      out += " when property " + it.util.escapeQuotes($property) + " is present' ";
                    }
                    if (it.opts.verbose) {
                      out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                    }
                    out += " } ";
                  } else {
                    out += " {} ";
                  }
                  out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ";
                }
              }
            }
            out += " }   ";
            if ($breakOnError) {
              $closingBraces += "}";
              out += " else { ";
            }
          }
        }
        it.errorPath = $currentErrorPath;
        var $currentBaseId = $it.baseId;
        for (var $property in $schemaDeps) {
          var $sch = $schemaDeps[$property];
          if (it.opts.strictKeywords ? typeof $sch == "object" && Object.keys($sch).length > 0 || $sch === false : it.util.schemaHasRules($sch, it.RULES.all)) {
            out += " " + $nextValid + " = true; if ( " + $data + it.util.getProperty($property) + " !== undefined ";
            if ($ownProperties) {
              out += " && Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($property) + "') ";
            }
            out += ") { ";
            $it.schema = $sch;
            $it.schemaPath = $schemaPath + it.util.getProperty($property);
            $it.errSchemaPath = $errSchemaPath + "/" + it.util.escapeFragment($property);
            out += "  " + it.validate($it) + " ";
            $it.baseId = $currentBaseId;
            out += " }  ";
            if ($breakOnError) {
              out += " if (" + $nextValid + ") { ";
              $closingBraces += "}";
            }
          }
        }
        if ($breakOnError) {
          out += "   " + $closingBraces + " if (" + $errs + " == errors) {";
        }
        return out;
      };
    });
    require_enum = __commonJS2((exports, module) => {
      module.exports = function generate_enum(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $valid = "valid" + $lvl;
        var $isData = it.opts.$data && $schema && $schema.$data, $schemaValue;
        if ($isData) {
          out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ";
          $schemaValue = "schema" + $lvl;
        } else {
          $schemaValue = $schema;
        }
        var $i = "i" + $lvl, $vSchema = "schema" + $lvl;
        if (!$isData) {
          out += " var " + $vSchema + " = validate.schema" + $schemaPath + ";";
        }
        out += "var " + $valid + ";";
        if ($isData) {
          out += " if (schema" + $lvl + " === undefined) " + $valid + " = true; else if (!Array.isArray(schema" + $lvl + ")) " + $valid + " = false; else {";
        }
        out += "" + $valid + " = false;for (var " + $i + "=0; " + $i + "<" + $vSchema + ".length; " + $i + "++) if (equal(" + $data + ", " + $vSchema + "[" + $i + "])) { " + $valid + " = true; break; }";
        if ($isData) {
          out += "  }  ";
        }
        out += " if (!" + $valid + ") {   ";
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out += " { keyword: 'enum' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { allowedValues: schema" + $lvl + " } ";
          if (it.opts.messages !== false) {
            out += " , message: 'should be equal to one of the allowed values' ";
          }
          if (it.opts.verbose) {
            out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        out += " }";
        if ($breakOnError) {
          out += " else { ";
        }
        return out;
      };
    });
    require_format = __commonJS2((exports, module) => {
      module.exports = function generate_format(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        if (it.opts.format === false) {
          if ($breakOnError) {
            out += " if (true) { ";
          }
          return out;
        }
        var $isData = it.opts.$data && $schema && $schema.$data, $schemaValue;
        if ($isData) {
          out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ";
          $schemaValue = "schema" + $lvl;
        } else {
          $schemaValue = $schema;
        }
        var $unknownFormats = it.opts.unknownFormats, $allowUnknown = Array.isArray($unknownFormats);
        if ($isData) {
          var $format = "format" + $lvl, $isObject = "isObject" + $lvl, $formatType = "formatType" + $lvl;
          out += " var " + $format + " = formats[" + $schemaValue + "]; var " + $isObject + " = typeof " + $format + " == 'object' && !(" + $format + " instanceof RegExp) && " + $format + ".validate; var " + $formatType + " = " + $isObject + " && " + $format + ".type || 'string'; if (" + $isObject + ") { ";
          if (it.async) {
            out += " var async" + $lvl + " = " + $format + ".async; ";
          }
          out += " " + $format + " = " + $format + ".validate; } if (  ";
          if ($isData) {
            out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'string') || ";
          }
          out += " (";
          if ($unknownFormats != "ignore") {
            out += " (" + $schemaValue + " && !" + $format + " ";
            if ($allowUnknown) {
              out += " && self._opts.unknownFormats.indexOf(" + $schemaValue + ") == -1 ";
            }
            out += ") || ";
          }
          out += " (" + $format + " && " + $formatType + " == '" + $ruleType + "' && !(typeof " + $format + " == 'function' ? ";
          if (it.async) {
            out += " (async" + $lvl + " ? await " + $format + "(" + $data + ") : " + $format + "(" + $data + ")) ";
          } else {
            out += " " + $format + "(" + $data + ") ";
          }
          out += " : " + $format + ".test(" + $data + "))))) {";
        } else {
          var $format = it.formats[$schema];
          if (!$format) {
            if ($unknownFormats == "ignore") {
              it.logger.warn('unknown format "' + $schema + '" ignored in schema at path "' + it.errSchemaPath + '"');
              if ($breakOnError) {
                out += " if (true) { ";
              }
              return out;
            } else if ($allowUnknown && $unknownFormats.indexOf($schema) >= 0) {
              if ($breakOnError) {
                out += " if (true) { ";
              }
              return out;
            } else {
              throw new Error('unknown format "' + $schema + '" is used in schema at path "' + it.errSchemaPath + '"');
            }
          }
          var $isObject = typeof $format == "object" && !($format instanceof RegExp) && $format.validate;
          var $formatType = $isObject && $format.type || "string";
          if ($isObject) {
            var $async = $format.async === true;
            $format = $format.validate;
          }
          if ($formatType != $ruleType) {
            if ($breakOnError) {
              out += " if (true) { ";
            }
            return out;
          }
          if ($async) {
            if (!it.async)
              throw new Error("async format in sync schema");
            var $formatRef = "formats" + it.util.getProperty($schema) + ".validate";
            out += " if (!(await " + $formatRef + "(" + $data + "))) { ";
          } else {
            out += " if (! ";
            var $formatRef = "formats" + it.util.getProperty($schema);
            if ($isObject)
              $formatRef += ".validate";
            if (typeof $format == "function") {
              out += " " + $formatRef + "(" + $data + ") ";
            } else {
              out += " " + $formatRef + ".test(" + $data + ") ";
            }
            out += ") { ";
          }
        }
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out += " { keyword: 'format' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { format:  ";
          if ($isData) {
            out += "" + $schemaValue;
          } else {
            out += "" + it.util.toQuotedString($schema);
          }
          out += "  } ";
          if (it.opts.messages !== false) {
            out += ` , message: 'should match format "`;
            if ($isData) {
              out += "' + " + $schemaValue + " + '";
            } else {
              out += "" + it.util.escapeQuotes($schema);
            }
            out += `"' `;
          }
          if (it.opts.verbose) {
            out += " , schema:  ";
            if ($isData) {
              out += "validate.schema" + $schemaPath;
            } else {
              out += "" + it.util.toQuotedString($schema);
            }
            out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        out += " } ";
        if ($breakOnError) {
          out += " else { ";
        }
        return out;
      };
    });
    require_if = __commonJS2((exports, module) => {
      module.exports = function generate_if(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $valid = "valid" + $lvl;
        var $errs = "errs__" + $lvl;
        var $it = it.util.copy(it);
        $it.level++;
        var $nextValid = "valid" + $it.level;
        var $thenSch = it.schema["then"], $elseSch = it.schema["else"], $thenPresent = $thenSch !== void 0 && (it.opts.strictKeywords ? typeof $thenSch == "object" && Object.keys($thenSch).length > 0 || $thenSch === false : it.util.schemaHasRules($thenSch, it.RULES.all)), $elsePresent = $elseSch !== void 0 && (it.opts.strictKeywords ? typeof $elseSch == "object" && Object.keys($elseSch).length > 0 || $elseSch === false : it.util.schemaHasRules($elseSch, it.RULES.all)), $currentBaseId = $it.baseId;
        if ($thenPresent || $elsePresent) {
          var $ifClause;
          $it.createErrors = false;
          $it.schema = $schema;
          $it.schemaPath = $schemaPath;
          $it.errSchemaPath = $errSchemaPath;
          out += " var " + $errs + " = errors; var " + $valid + " = true;  ";
          var $wasComposite = it.compositeRule;
          it.compositeRule = $it.compositeRule = true;
          out += "  " + it.validate($it) + " ";
          $it.baseId = $currentBaseId;
          $it.createErrors = true;
          out += "  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; }  ";
          it.compositeRule = $it.compositeRule = $wasComposite;
          if ($thenPresent) {
            out += " if (" + $nextValid + ") {  ";
            $it.schema = it.schema["then"];
            $it.schemaPath = it.schemaPath + ".then";
            $it.errSchemaPath = it.errSchemaPath + "/then";
            out += "  " + it.validate($it) + " ";
            $it.baseId = $currentBaseId;
            out += " " + $valid + " = " + $nextValid + "; ";
            if ($thenPresent && $elsePresent) {
              $ifClause = "ifClause" + $lvl;
              out += " var " + $ifClause + " = 'then'; ";
            } else {
              $ifClause = "'then'";
            }
            out += " } ";
            if ($elsePresent) {
              out += " else { ";
            }
          } else {
            out += " if (!" + $nextValid + ") { ";
          }
          if ($elsePresent) {
            $it.schema = it.schema["else"];
            $it.schemaPath = it.schemaPath + ".else";
            $it.errSchemaPath = it.errSchemaPath + "/else";
            out += "  " + it.validate($it) + " ";
            $it.baseId = $currentBaseId;
            out += " " + $valid + " = " + $nextValid + "; ";
            if ($thenPresent && $elsePresent) {
              $ifClause = "ifClause" + $lvl;
              out += " var " + $ifClause + " = 'else'; ";
            } else {
              $ifClause = "'else'";
            }
            out += " } ";
          }
          out += " if (!" + $valid + ") {   var err =   ";
          if (it.createErrors !== false) {
            out += " { keyword: 'if' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { failingKeyword: " + $ifClause + " } ";
            if (it.opts.messages !== false) {
              out += ` , message: 'should match "' + ` + $ifClause + ` + '" schema' `;
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError(vErrors); ";
            } else {
              out += " validate.errors = vErrors; return false; ";
            }
          }
          out += " }   ";
          if ($breakOnError) {
            out += " else { ";
          }
        } else {
          if ($breakOnError) {
            out += " if (true) { ";
          }
        }
        return out;
      };
    });
    require_items = __commonJS2((exports, module) => {
      module.exports = function generate_items(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $valid = "valid" + $lvl;
        var $errs = "errs__" + $lvl;
        var $it = it.util.copy(it);
        var $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level;
        var $idx = "i" + $lvl, $dataNxt = $it.dataLevel = it.dataLevel + 1, $nextData = "data" + $dataNxt, $currentBaseId = it.baseId;
        out += "var " + $errs + " = errors;var " + $valid + ";";
        if (Array.isArray($schema)) {
          var $additionalItems = it.schema.additionalItems;
          if ($additionalItems === false) {
            out += " " + $valid + " = " + $data + ".length <= " + $schema.length + "; ";
            var $currErrSchemaPath = $errSchemaPath;
            $errSchemaPath = it.errSchemaPath + "/additionalItems";
            out += "  if (!" + $valid + ") {   ";
            var $$outStack = $$outStack || [];
            $$outStack.push(out);
            out = "";
            if (it.createErrors !== false) {
              out += " { keyword: 'additionalItems' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { limit: " + $schema.length + " } ";
              if (it.opts.messages !== false) {
                out += " , message: 'should NOT have more than " + $schema.length + " items' ";
              }
              if (it.opts.verbose) {
                out += " , schema: false , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
              }
              out += " } ";
            } else {
              out += " {} ";
            }
            var __err = out;
            out = $$outStack.pop();
            if (!it.compositeRule && $breakOnError) {
              if (it.async) {
                out += " throw new ValidationError([" + __err + "]); ";
              } else {
                out += " validate.errors = [" + __err + "]; return false; ";
              }
            } else {
              out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
            }
            out += " } ";
            $errSchemaPath = $currErrSchemaPath;
            if ($breakOnError) {
              $closingBraces += "}";
              out += " else { ";
            }
          }
          var arr1 = $schema;
          if (arr1) {
            var $sch, $i = -1, l1 = arr1.length - 1;
            while ($i < l1) {
              $sch = arr1[$i += 1];
              if (it.opts.strictKeywords ? typeof $sch == "object" && Object.keys($sch).length > 0 || $sch === false : it.util.schemaHasRules($sch, it.RULES.all)) {
                out += " " + $nextValid + " = true; if (" + $data + ".length > " + $i + ") { ";
                var $passData = $data + "[" + $i + "]";
                $it.schema = $sch;
                $it.schemaPath = $schemaPath + "[" + $i + "]";
                $it.errSchemaPath = $errSchemaPath + "/" + $i;
                $it.errorPath = it.util.getPathExpr(it.errorPath, $i, it.opts.jsonPointers, true);
                $it.dataPathArr[$dataNxt] = $i;
                var $code = it.validate($it);
                $it.baseId = $currentBaseId;
                if (it.util.varOccurences($code, $nextData) < 2) {
                  out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
                } else {
                  out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
                }
                out += " }  ";
                if ($breakOnError) {
                  out += " if (" + $nextValid + ") { ";
                  $closingBraces += "}";
                }
              }
            }
          }
          if (typeof $additionalItems == "object" && (it.opts.strictKeywords ? typeof $additionalItems == "object" && Object.keys($additionalItems).length > 0 || $additionalItems === false : it.util.schemaHasRules($additionalItems, it.RULES.all))) {
            $it.schema = $additionalItems;
            $it.schemaPath = it.schemaPath + ".additionalItems";
            $it.errSchemaPath = it.errSchemaPath + "/additionalItems";
            out += " " + $nextValid + " = true; if (" + $data + ".length > " + $schema.length + ") {  for (var " + $idx + " = " + $schema.length + "; " + $idx + " < " + $data + ".length; " + $idx + "++) { ";
            $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
            var $passData = $data + "[" + $idx + "]";
            $it.dataPathArr[$dataNxt] = $idx;
            var $code = it.validate($it);
            $it.baseId = $currentBaseId;
            if (it.util.varOccurences($code, $nextData) < 2) {
              out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
            } else {
              out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
            }
            if ($breakOnError) {
              out += " if (!" + $nextValid + ") break; ";
            }
            out += " } }  ";
            if ($breakOnError) {
              out += " if (" + $nextValid + ") { ";
              $closingBraces += "}";
            }
          }
        } else if (it.opts.strictKeywords ? typeof $schema == "object" && Object.keys($schema).length > 0 || $schema === false : it.util.schemaHasRules($schema, it.RULES.all)) {
          $it.schema = $schema;
          $it.schemaPath = $schemaPath;
          $it.errSchemaPath = $errSchemaPath;
          out += "  for (var " + $idx + " = 0; " + $idx + " < " + $data + ".length; " + $idx + "++) { ";
          $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
          var $passData = $data + "[" + $idx + "]";
          $it.dataPathArr[$dataNxt] = $idx;
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
          } else {
            out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
          }
          if ($breakOnError) {
            out += " if (!" + $nextValid + ") break; ";
          }
          out += " }";
        }
        if ($breakOnError) {
          out += " " + $closingBraces + " if (" + $errs + " == errors) {";
        }
        return out;
      };
    });
    require__limit = __commonJS2((exports, module) => {
      module.exports = function generate__limit(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $errorKeyword;
        var $data = "data" + ($dataLvl || "");
        var $isData = it.opts.$data && $schema && $schema.$data, $schemaValue;
        if ($isData) {
          out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ";
          $schemaValue = "schema" + $lvl;
        } else {
          $schemaValue = $schema;
        }
        var $isMax = $keyword == "maximum", $exclusiveKeyword = $isMax ? "exclusiveMaximum" : "exclusiveMinimum", $schemaExcl = it.schema[$exclusiveKeyword], $isDataExcl = it.opts.$data && $schemaExcl && $schemaExcl.$data, $op = $isMax ? "<" : ">", $notOp = $isMax ? ">" : "<", $errorKeyword = void 0;
        if (!($isData || typeof $schema == "number" || $schema === void 0)) {
          throw new Error($keyword + " must be number");
        }
        if (!($isDataExcl || $schemaExcl === void 0 || typeof $schemaExcl == "number" || typeof $schemaExcl == "boolean")) {
          throw new Error($exclusiveKeyword + " must be number or boolean");
        }
        if ($isDataExcl) {
          var $schemaValueExcl = it.util.getData($schemaExcl.$data, $dataLvl, it.dataPathArr), $exclusive = "exclusive" + $lvl, $exclType = "exclType" + $lvl, $exclIsNumber = "exclIsNumber" + $lvl, $opExpr = "op" + $lvl, $opStr = "' + " + $opExpr + " + '";
          out += " var schemaExcl" + $lvl + " = " + $schemaValueExcl + "; ";
          $schemaValueExcl = "schemaExcl" + $lvl;
          out += " var " + $exclusive + "; var " + $exclType + " = typeof " + $schemaValueExcl + "; if (" + $exclType + " != 'boolean' && " + $exclType + " != 'undefined' && " + $exclType + " != 'number') { ";
          var $errorKeyword = $exclusiveKeyword;
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out += " { keyword: '" + ($errorKeyword || "_exclusiveLimit") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ";
            if (it.opts.messages !== false) {
              out += " , message: '" + $exclusiveKeyword + " should be boolean' ";
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
          out += " } else if ( ";
          if ($isData) {
            out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || ";
          }
          out += " " + $exclType + " == 'number' ? ( (" + $exclusive + " = " + $schemaValue + " === undefined || " + $schemaValueExcl + " " + $op + "= " + $schemaValue + ") ? " + $data + " " + $notOp + "= " + $schemaValueExcl + " : " + $data + " " + $notOp + " " + $schemaValue + " ) : ( (" + $exclusive + " = " + $schemaValueExcl + " === true) ? " + $data + " " + $notOp + "= " + $schemaValue + " : " + $data + " " + $notOp + " " + $schemaValue + " ) || " + $data + " !== " + $data + ") { var op" + $lvl + " = " + $exclusive + " ? '" + $op + "' : '" + $op + "='; ";
          if ($schema === void 0) {
            $errorKeyword = $exclusiveKeyword;
            $errSchemaPath = it.errSchemaPath + "/" + $exclusiveKeyword;
            $schemaValue = $schemaValueExcl;
            $isData = $isDataExcl;
          }
        } else {
          var $exclIsNumber = typeof $schemaExcl == "number", $opStr = $op;
          if ($exclIsNumber && $isData) {
            var $opExpr = "'" + $opStr + "'";
            out += " if ( ";
            if ($isData) {
              out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || ";
            }
            out += " ( " + $schemaValue + " === undefined || " + $schemaExcl + " " + $op + "= " + $schemaValue + " ? " + $data + " " + $notOp + "= " + $schemaExcl + " : " + $data + " " + $notOp + " " + $schemaValue + " ) || " + $data + " !== " + $data + ") { ";
          } else {
            if ($exclIsNumber && $schema === void 0) {
              $exclusive = true;
              $errorKeyword = $exclusiveKeyword;
              $errSchemaPath = it.errSchemaPath + "/" + $exclusiveKeyword;
              $schemaValue = $schemaExcl;
              $notOp += "=";
            } else {
              if ($exclIsNumber)
                $schemaValue = Math[$isMax ? "min" : "max"]($schemaExcl, $schema);
              if ($schemaExcl === ($exclIsNumber ? $schemaValue : true)) {
                $exclusive = true;
                $errorKeyword = $exclusiveKeyword;
                $errSchemaPath = it.errSchemaPath + "/" + $exclusiveKeyword;
                $notOp += "=";
              } else {
                $exclusive = false;
                $opStr += "=";
              }
            }
            var $opExpr = "'" + $opStr + "'";
            out += " if ( ";
            if ($isData) {
              out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || ";
            }
            out += " " + $data + " " + $notOp + " " + $schemaValue + " || " + $data + " !== " + $data + ") { ";
          }
        }
        $errorKeyword = $errorKeyword || $keyword;
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out += " { keyword: '" + ($errorKeyword || "_limit") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { comparison: " + $opExpr + ", limit: " + $schemaValue + ", exclusive: " + $exclusive + " } ";
          if (it.opts.messages !== false) {
            out += " , message: 'should be " + $opStr + " ";
            if ($isData) {
              out += "' + " + $schemaValue;
            } else {
              out += "" + $schemaValue + "'";
            }
          }
          if (it.opts.verbose) {
            out += " , schema:  ";
            if ($isData) {
              out += "validate.schema" + $schemaPath;
            } else {
              out += "" + $schema;
            }
            out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        out += " } ";
        if ($breakOnError) {
          out += " else { ";
        }
        return out;
      };
    });
    require__limitItems = __commonJS2((exports, module) => {
      module.exports = function generate__limitItems(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $errorKeyword;
        var $data = "data" + ($dataLvl || "");
        var $isData = it.opts.$data && $schema && $schema.$data, $schemaValue;
        if ($isData) {
          out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ";
          $schemaValue = "schema" + $lvl;
        } else {
          $schemaValue = $schema;
        }
        if (!($isData || typeof $schema == "number")) {
          throw new Error($keyword + " must be number");
        }
        var $op = $keyword == "maxItems" ? ">" : "<";
        out += "if ( ";
        if ($isData) {
          out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || ";
        }
        out += " " + $data + ".length " + $op + " " + $schemaValue + ") { ";
        var $errorKeyword = $keyword;
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out += " { keyword: '" + ($errorKeyword || "_limitItems") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { limit: " + $schemaValue + " } ";
          if (it.opts.messages !== false) {
            out += " , message: 'should NOT have ";
            if ($keyword == "maxItems") {
              out += "more";
            } else {
              out += "fewer";
            }
            out += " than ";
            if ($isData) {
              out += "' + " + $schemaValue + " + '";
            } else {
              out += "" + $schema;
            }
            out += " items' ";
          }
          if (it.opts.verbose) {
            out += " , schema:  ";
            if ($isData) {
              out += "validate.schema" + $schemaPath;
            } else {
              out += "" + $schema;
            }
            out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        out += "} ";
        if ($breakOnError) {
          out += " else { ";
        }
        return out;
      };
    });
    require__limitLength = __commonJS2((exports, module) => {
      module.exports = function generate__limitLength(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $errorKeyword;
        var $data = "data" + ($dataLvl || "");
        var $isData = it.opts.$data && $schema && $schema.$data, $schemaValue;
        if ($isData) {
          out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ";
          $schemaValue = "schema" + $lvl;
        } else {
          $schemaValue = $schema;
        }
        if (!($isData || typeof $schema == "number")) {
          throw new Error($keyword + " must be number");
        }
        var $op = $keyword == "maxLength" ? ">" : "<";
        out += "if ( ";
        if ($isData) {
          out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || ";
        }
        if (it.opts.unicode === false) {
          out += " " + $data + ".length ";
        } else {
          out += " ucs2length(" + $data + ") ";
        }
        out += " " + $op + " " + $schemaValue + ") { ";
        var $errorKeyword = $keyword;
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out += " { keyword: '" + ($errorKeyword || "_limitLength") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { limit: " + $schemaValue + " } ";
          if (it.opts.messages !== false) {
            out += " , message: 'should NOT be ";
            if ($keyword == "maxLength") {
              out += "longer";
            } else {
              out += "shorter";
            }
            out += " than ";
            if ($isData) {
              out += "' + " + $schemaValue + " + '";
            } else {
              out += "" + $schema;
            }
            out += " characters' ";
          }
          if (it.opts.verbose) {
            out += " , schema:  ";
            if ($isData) {
              out += "validate.schema" + $schemaPath;
            } else {
              out += "" + $schema;
            }
            out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        out += "} ";
        if ($breakOnError) {
          out += " else { ";
        }
        return out;
      };
    });
    require__limitProperties = __commonJS2((exports, module) => {
      module.exports = function generate__limitProperties(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $errorKeyword;
        var $data = "data" + ($dataLvl || "");
        var $isData = it.opts.$data && $schema && $schema.$data, $schemaValue;
        if ($isData) {
          out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ";
          $schemaValue = "schema" + $lvl;
        } else {
          $schemaValue = $schema;
        }
        if (!($isData || typeof $schema == "number")) {
          throw new Error($keyword + " must be number");
        }
        var $op = $keyword == "maxProperties" ? ">" : "<";
        out += "if ( ";
        if ($isData) {
          out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || ";
        }
        out += " Object.keys(" + $data + ").length " + $op + " " + $schemaValue + ") { ";
        var $errorKeyword = $keyword;
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out += " { keyword: '" + ($errorKeyword || "_limitProperties") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { limit: " + $schemaValue + " } ";
          if (it.opts.messages !== false) {
            out += " , message: 'should NOT have ";
            if ($keyword == "maxProperties") {
              out += "more";
            } else {
              out += "fewer";
            }
            out += " than ";
            if ($isData) {
              out += "' + " + $schemaValue + " + '";
            } else {
              out += "" + $schema;
            }
            out += " properties' ";
          }
          if (it.opts.verbose) {
            out += " , schema:  ";
            if ($isData) {
              out += "validate.schema" + $schemaPath;
            } else {
              out += "" + $schema;
            }
            out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        out += "} ";
        if ($breakOnError) {
          out += " else { ";
        }
        return out;
      };
    });
    require_multipleOf = __commonJS2((exports, module) => {
      module.exports = function generate_multipleOf(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $isData = it.opts.$data && $schema && $schema.$data, $schemaValue;
        if ($isData) {
          out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ";
          $schemaValue = "schema" + $lvl;
        } else {
          $schemaValue = $schema;
        }
        if (!($isData || typeof $schema == "number")) {
          throw new Error($keyword + " must be number");
        }
        out += "var division" + $lvl + ";if (";
        if ($isData) {
          out += " " + $schemaValue + " !== undefined && ( typeof " + $schemaValue + " != 'number' || ";
        }
        out += " (division" + $lvl + " = " + $data + " / " + $schemaValue + ", ";
        if (it.opts.multipleOfPrecision) {
          out += " Math.abs(Math.round(division" + $lvl + ") - division" + $lvl + ") > 1e-" + it.opts.multipleOfPrecision + " ";
        } else {
          out += " division" + $lvl + " !== parseInt(division" + $lvl + ") ";
        }
        out += " ) ";
        if ($isData) {
          out += "  )  ";
        }
        out += " ) {   ";
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out += " { keyword: 'multipleOf' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { multipleOf: " + $schemaValue + " } ";
          if (it.opts.messages !== false) {
            out += " , message: 'should be multiple of ";
            if ($isData) {
              out += "' + " + $schemaValue;
            } else {
              out += "" + $schemaValue + "'";
            }
          }
          if (it.opts.verbose) {
            out += " , schema:  ";
            if ($isData) {
              out += "validate.schema" + $schemaPath;
            } else {
              out += "" + $schema;
            }
            out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        out += "} ";
        if ($breakOnError) {
          out += " else { ";
        }
        return out;
      };
    });
    require_not = __commonJS2((exports, module) => {
      module.exports = function generate_not(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $errs = "errs__" + $lvl;
        var $it = it.util.copy(it);
        $it.level++;
        var $nextValid = "valid" + $it.level;
        if (it.opts.strictKeywords ? typeof $schema == "object" && Object.keys($schema).length > 0 || $schema === false : it.util.schemaHasRules($schema, it.RULES.all)) {
          $it.schema = $schema;
          $it.schemaPath = $schemaPath;
          $it.errSchemaPath = $errSchemaPath;
          out += " var " + $errs + " = errors;  ";
          var $wasComposite = it.compositeRule;
          it.compositeRule = $it.compositeRule = true;
          $it.createErrors = false;
          var $allErrorsOption;
          if ($it.opts.allErrors) {
            $allErrorsOption = $it.opts.allErrors;
            $it.opts.allErrors = false;
          }
          out += " " + it.validate($it) + " ";
          $it.createErrors = true;
          if ($allErrorsOption)
            $it.opts.allErrors = $allErrorsOption;
          it.compositeRule = $it.compositeRule = $wasComposite;
          out += " if (" + $nextValid + ") {   ";
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out += " { keyword: 'not' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ";
            if (it.opts.messages !== false) {
              out += " , message: 'should NOT be valid' ";
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
          out += " } else {  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; } ";
          if (it.opts.allErrors) {
            out += " } ";
          }
        } else {
          out += "  var err =   ";
          if (it.createErrors !== false) {
            out += " { keyword: 'not' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ";
            if (it.opts.messages !== false) {
              out += " , message: 'should NOT be valid' ";
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          if ($breakOnError) {
            out += " if (false) { ";
          }
        }
        return out;
      };
    });
    require_oneOf = __commonJS2((exports, module) => {
      module.exports = function generate_oneOf(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $valid = "valid" + $lvl;
        var $errs = "errs__" + $lvl;
        var $it = it.util.copy(it);
        var $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level;
        var $currentBaseId = $it.baseId, $prevValid = "prevValid" + $lvl, $passingSchemas = "passingSchemas" + $lvl;
        out += "var " + $errs + " = errors , " + $prevValid + " = false , " + $valid + " = false , " + $passingSchemas + " = null; ";
        var $wasComposite = it.compositeRule;
        it.compositeRule = $it.compositeRule = true;
        var arr1 = $schema;
        if (arr1) {
          var $sch, $i = -1, l1 = arr1.length - 1;
          while ($i < l1) {
            $sch = arr1[$i += 1];
            if (it.opts.strictKeywords ? typeof $sch == "object" && Object.keys($sch).length > 0 || $sch === false : it.util.schemaHasRules($sch, it.RULES.all)) {
              $it.schema = $sch;
              $it.schemaPath = $schemaPath + "[" + $i + "]";
              $it.errSchemaPath = $errSchemaPath + "/" + $i;
              out += "  " + it.validate($it) + " ";
              $it.baseId = $currentBaseId;
            } else {
              out += " var " + $nextValid + " = true; ";
            }
            if ($i) {
              out += " if (" + $nextValid + " && " + $prevValid + ") { " + $valid + " = false; " + $passingSchemas + " = [" + $passingSchemas + ", " + $i + "]; } else { ";
              $closingBraces += "}";
            }
            out += " if (" + $nextValid + ") { " + $valid + " = " + $prevValid + " = true; " + $passingSchemas + " = " + $i + "; }";
          }
        }
        it.compositeRule = $it.compositeRule = $wasComposite;
        out += "" + $closingBraces + "if (!" + $valid + ") {   var err =   ";
        if (it.createErrors !== false) {
          out += " { keyword: 'oneOf' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { passingSchemas: " + $passingSchemas + " } ";
          if (it.opts.messages !== false) {
            out += " , message: 'should match exactly one schema in oneOf' ";
          }
          if (it.opts.verbose) {
            out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError(vErrors); ";
          } else {
            out += " validate.errors = vErrors; return false; ";
          }
        }
        out += "} else {  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; }";
        if (it.opts.allErrors) {
          out += " } ";
        }
        return out;
      };
    });
    require_pattern = __commonJS2((exports, module) => {
      module.exports = function generate_pattern(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $isData = it.opts.$data && $schema && $schema.$data, $schemaValue;
        if ($isData) {
          out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ";
          $schemaValue = "schema" + $lvl;
        } else {
          $schemaValue = $schema;
        }
        var $regexp = $isData ? "(new RegExp(" + $schemaValue + "))" : it.usePattern($schema);
        out += "if ( ";
        if ($isData) {
          out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'string') || ";
        }
        out += " !" + $regexp + ".test(" + $data + ") ) {   ";
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out += " { keyword: 'pattern' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { pattern:  ";
          if ($isData) {
            out += "" + $schemaValue;
          } else {
            out += "" + it.util.toQuotedString($schema);
          }
          out += "  } ";
          if (it.opts.messages !== false) {
            out += ` , message: 'should match pattern "`;
            if ($isData) {
              out += "' + " + $schemaValue + " + '";
            } else {
              out += "" + it.util.escapeQuotes($schema);
            }
            out += `"' `;
          }
          if (it.opts.verbose) {
            out += " , schema:  ";
            if ($isData) {
              out += "validate.schema" + $schemaPath;
            } else {
              out += "" + it.util.toQuotedString($schema);
            }
            out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        out += "} ";
        if ($breakOnError) {
          out += " else { ";
        }
        return out;
      };
    });
    require_properties = __commonJS2((exports, module) => {
      module.exports = function generate_properties(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $errs = "errs__" + $lvl;
        var $it = it.util.copy(it);
        var $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level;
        var $key = "key" + $lvl, $idx = "idx" + $lvl, $dataNxt = $it.dataLevel = it.dataLevel + 1, $nextData = "data" + $dataNxt, $dataProperties = "dataProperties" + $lvl;
        var $schemaKeys = Object.keys($schema || {}).filter(notProto), $pProperties = it.schema.patternProperties || {}, $pPropertyKeys = Object.keys($pProperties).filter(notProto), $aProperties = it.schema.additionalProperties, $someProperties = $schemaKeys.length || $pPropertyKeys.length, $noAdditional = $aProperties === false, $additionalIsSchema = typeof $aProperties == "object" && Object.keys($aProperties).length, $removeAdditional = it.opts.removeAdditional, $checkAdditional = $noAdditional || $additionalIsSchema || $removeAdditional, $ownProperties = it.opts.ownProperties, $currentBaseId = it.baseId;
        var $required = it.schema.required;
        if ($required && !(it.opts.$data && $required.$data) && $required.length < it.opts.loopRequired) {
          var $requiredHash = it.util.toHash($required);
        }
        function notProto(p) {
          return p !== "__proto__";
        }
        out += "var " + $errs + " = errors;var " + $nextValid + " = true;";
        if ($ownProperties) {
          out += " var " + $dataProperties + " = undefined;";
        }
        if ($checkAdditional) {
          if ($ownProperties) {
            out += " " + $dataProperties + " = " + $dataProperties + " || Object.keys(" + $data + "); for (var " + $idx + "=0; " + $idx + "<" + $dataProperties + ".length; " + $idx + "++) { var " + $key + " = " + $dataProperties + "[" + $idx + "]; ";
          } else {
            out += " for (var " + $key + " in " + $data + ") { ";
          }
          if ($someProperties) {
            out += " var isAdditional" + $lvl + " = !(false ";
            if ($schemaKeys.length) {
              if ($schemaKeys.length > 8) {
                out += " || validate.schema" + $schemaPath + ".hasOwnProperty(" + $key + ") ";
              } else {
                var arr1 = $schemaKeys;
                if (arr1) {
                  var $propertyKey, i1 = -1, l1 = arr1.length - 1;
                  while (i1 < l1) {
                    $propertyKey = arr1[i1 += 1];
                    out += " || " + $key + " == " + it.util.toQuotedString($propertyKey) + " ";
                  }
                }
              }
            }
            if ($pPropertyKeys.length) {
              var arr2 = $pPropertyKeys;
              if (arr2) {
                var $pProperty, $i = -1, l2 = arr2.length - 1;
                while ($i < l2) {
                  $pProperty = arr2[$i += 1];
                  out += " || " + it.usePattern($pProperty) + ".test(" + $key + ") ";
                }
              }
            }
            out += " ); if (isAdditional" + $lvl + ") { ";
          }
          if ($removeAdditional == "all") {
            out += " delete " + $data + "[" + $key + "]; ";
          } else {
            var $currentErrorPath = it.errorPath;
            var $additionalProperty = "' + " + $key + " + '";
            if (it.opts._errorDataPathProperty) {
              it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
            }
            if ($noAdditional) {
              if ($removeAdditional) {
                out += " delete " + $data + "[" + $key + "]; ";
              } else {
                out += " " + $nextValid + " = false; ";
                var $currErrSchemaPath = $errSchemaPath;
                $errSchemaPath = it.errSchemaPath + "/additionalProperties";
                var $$outStack = $$outStack || [];
                $$outStack.push(out);
                out = "";
                if (it.createErrors !== false) {
                  out += " { keyword: 'additionalProperties' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { additionalProperty: '" + $additionalProperty + "' } ";
                  if (it.opts.messages !== false) {
                    out += " , message: '";
                    if (it.opts._errorDataPathProperty) {
                      out += "is an invalid additional property";
                    } else {
                      out += "should NOT have additional properties";
                    }
                    out += "' ";
                  }
                  if (it.opts.verbose) {
                    out += " , schema: false , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                  }
                  out += " } ";
                } else {
                  out += " {} ";
                }
                var __err = out;
                out = $$outStack.pop();
                if (!it.compositeRule && $breakOnError) {
                  if (it.async) {
                    out += " throw new ValidationError([" + __err + "]); ";
                  } else {
                    out += " validate.errors = [" + __err + "]; return false; ";
                  }
                } else {
                  out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
                }
                $errSchemaPath = $currErrSchemaPath;
                if ($breakOnError) {
                  out += " break; ";
                }
              }
            } else if ($additionalIsSchema) {
              if ($removeAdditional == "failing") {
                out += " var " + $errs + " = errors;  ";
                var $wasComposite = it.compositeRule;
                it.compositeRule = $it.compositeRule = true;
                $it.schema = $aProperties;
                $it.schemaPath = it.schemaPath + ".additionalProperties";
                $it.errSchemaPath = it.errSchemaPath + "/additionalProperties";
                $it.errorPath = it.opts._errorDataPathProperty ? it.errorPath : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
                var $passData = $data + "[" + $key + "]";
                $it.dataPathArr[$dataNxt] = $key;
                var $code = it.validate($it);
                $it.baseId = $currentBaseId;
                if (it.util.varOccurences($code, $nextData) < 2) {
                  out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
                } else {
                  out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
                }
                out += " if (!" + $nextValid + ") { errors = " + $errs + "; if (validate.errors !== null) { if (errors) validate.errors.length = errors; else validate.errors = null; } delete " + $data + "[" + $key + "]; }  ";
                it.compositeRule = $it.compositeRule = $wasComposite;
              } else {
                $it.schema = $aProperties;
                $it.schemaPath = it.schemaPath + ".additionalProperties";
                $it.errSchemaPath = it.errSchemaPath + "/additionalProperties";
                $it.errorPath = it.opts._errorDataPathProperty ? it.errorPath : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
                var $passData = $data + "[" + $key + "]";
                $it.dataPathArr[$dataNxt] = $key;
                var $code = it.validate($it);
                $it.baseId = $currentBaseId;
                if (it.util.varOccurences($code, $nextData) < 2) {
                  out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
                } else {
                  out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
                }
                if ($breakOnError) {
                  out += " if (!" + $nextValid + ") break; ";
                }
              }
            }
            it.errorPath = $currentErrorPath;
          }
          if ($someProperties) {
            out += " } ";
          }
          out += " }  ";
          if ($breakOnError) {
            out += " if (" + $nextValid + ") { ";
            $closingBraces += "}";
          }
        }
        var $useDefaults = it.opts.useDefaults && !it.compositeRule;
        if ($schemaKeys.length) {
          var arr3 = $schemaKeys;
          if (arr3) {
            var $propertyKey, i3 = -1, l3 = arr3.length - 1;
            while (i3 < l3) {
              $propertyKey = arr3[i3 += 1];
              var $sch = $schema[$propertyKey];
              if (it.opts.strictKeywords ? typeof $sch == "object" && Object.keys($sch).length > 0 || $sch === false : it.util.schemaHasRules($sch, it.RULES.all)) {
                var $prop = it.util.getProperty($propertyKey), $passData = $data + $prop, $hasDefault = $useDefaults && $sch.default !== void 0;
                $it.schema = $sch;
                $it.schemaPath = $schemaPath + $prop;
                $it.errSchemaPath = $errSchemaPath + "/" + it.util.escapeFragment($propertyKey);
                $it.errorPath = it.util.getPath(it.errorPath, $propertyKey, it.opts.jsonPointers);
                $it.dataPathArr[$dataNxt] = it.util.toQuotedString($propertyKey);
                var $code = it.validate($it);
                $it.baseId = $currentBaseId;
                if (it.util.varOccurences($code, $nextData) < 2) {
                  $code = it.util.varReplace($code, $nextData, $passData);
                  var $useData = $passData;
                } else {
                  var $useData = $nextData;
                  out += " var " + $nextData + " = " + $passData + "; ";
                }
                if ($hasDefault) {
                  out += " " + $code + " ";
                } else {
                  if ($requiredHash && $requiredHash[$propertyKey]) {
                    out += " if ( " + $useData + " === undefined ";
                    if ($ownProperties) {
                      out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
                    }
                    out += ") { " + $nextValid + " = false; ";
                    var $currentErrorPath = it.errorPath, $currErrSchemaPath = $errSchemaPath, $missingProperty = it.util.escapeQuotes($propertyKey);
                    if (it.opts._errorDataPathProperty) {
                      it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
                    }
                    $errSchemaPath = it.errSchemaPath + "/required";
                    var $$outStack = $$outStack || [];
                    $$outStack.push(out);
                    out = "";
                    if (it.createErrors !== false) {
                      out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ";
                      if (it.opts.messages !== false) {
                        out += " , message: '";
                        if (it.opts._errorDataPathProperty) {
                          out += "is a required property";
                        } else {
                          out += "should have required property \\'" + $missingProperty + "\\'";
                        }
                        out += "' ";
                      }
                      if (it.opts.verbose) {
                        out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                      }
                      out += " } ";
                    } else {
                      out += " {} ";
                    }
                    var __err = out;
                    out = $$outStack.pop();
                    if (!it.compositeRule && $breakOnError) {
                      if (it.async) {
                        out += " throw new ValidationError([" + __err + "]); ";
                      } else {
                        out += " validate.errors = [" + __err + "]; return false; ";
                      }
                    } else {
                      out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
                    }
                    $errSchemaPath = $currErrSchemaPath;
                    it.errorPath = $currentErrorPath;
                    out += " } else { ";
                  } else {
                    if ($breakOnError) {
                      out += " if ( " + $useData + " === undefined ";
                      if ($ownProperties) {
                        out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
                      }
                      out += ") { " + $nextValid + " = true; } else { ";
                    } else {
                      out += " if (" + $useData + " !== undefined ";
                      if ($ownProperties) {
                        out += " &&   Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
                      }
                      out += " ) { ";
                    }
                  }
                  out += " " + $code + " } ";
                }
              }
              if ($breakOnError) {
                out += " if (" + $nextValid + ") { ";
                $closingBraces += "}";
              }
            }
          }
        }
        if ($pPropertyKeys.length) {
          var arr4 = $pPropertyKeys;
          if (arr4) {
            var $pProperty, i4 = -1, l4 = arr4.length - 1;
            while (i4 < l4) {
              $pProperty = arr4[i4 += 1];
              var $sch = $pProperties[$pProperty];
              if (it.opts.strictKeywords ? typeof $sch == "object" && Object.keys($sch).length > 0 || $sch === false : it.util.schemaHasRules($sch, it.RULES.all)) {
                $it.schema = $sch;
                $it.schemaPath = it.schemaPath + ".patternProperties" + it.util.getProperty($pProperty);
                $it.errSchemaPath = it.errSchemaPath + "/patternProperties/" + it.util.escapeFragment($pProperty);
                if ($ownProperties) {
                  out += " " + $dataProperties + " = " + $dataProperties + " || Object.keys(" + $data + "); for (var " + $idx + "=0; " + $idx + "<" + $dataProperties + ".length; " + $idx + "++) { var " + $key + " = " + $dataProperties + "[" + $idx + "]; ";
                } else {
                  out += " for (var " + $key + " in " + $data + ") { ";
                }
                out += " if (" + it.usePattern($pProperty) + ".test(" + $key + ")) { ";
                $it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
                var $passData = $data + "[" + $key + "]";
                $it.dataPathArr[$dataNxt] = $key;
                var $code = it.validate($it);
                $it.baseId = $currentBaseId;
                if (it.util.varOccurences($code, $nextData) < 2) {
                  out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
                } else {
                  out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
                }
                if ($breakOnError) {
                  out += " if (!" + $nextValid + ") break; ";
                }
                out += " } ";
                if ($breakOnError) {
                  out += " else " + $nextValid + " = true; ";
                }
                out += " }  ";
                if ($breakOnError) {
                  out += " if (" + $nextValid + ") { ";
                  $closingBraces += "}";
                }
              }
            }
          }
        }
        if ($breakOnError) {
          out += " " + $closingBraces + " if (" + $errs + " == errors) {";
        }
        return out;
      };
    });
    require_propertyNames = __commonJS2((exports, module) => {
      module.exports = function generate_propertyNames(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $errs = "errs__" + $lvl;
        var $it = it.util.copy(it);
        var $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level;
        out += "var " + $errs + " = errors;";
        if (it.opts.strictKeywords ? typeof $schema == "object" && Object.keys($schema).length > 0 || $schema === false : it.util.schemaHasRules($schema, it.RULES.all)) {
          $it.schema = $schema;
          $it.schemaPath = $schemaPath;
          $it.errSchemaPath = $errSchemaPath;
          var $key = "key" + $lvl, $idx = "idx" + $lvl, $i = "i" + $lvl, $invalidName = "' + " + $key + " + '", $dataNxt = $it.dataLevel = it.dataLevel + 1, $nextData = "data" + $dataNxt, $dataProperties = "dataProperties" + $lvl, $ownProperties = it.opts.ownProperties, $currentBaseId = it.baseId;
          if ($ownProperties) {
            out += " var " + $dataProperties + " = undefined; ";
          }
          if ($ownProperties) {
            out += " " + $dataProperties + " = " + $dataProperties + " || Object.keys(" + $data + "); for (var " + $idx + "=0; " + $idx + "<" + $dataProperties + ".length; " + $idx + "++) { var " + $key + " = " + $dataProperties + "[" + $idx + "]; ";
          } else {
            out += " for (var " + $key + " in " + $data + ") { ";
          }
          out += " var startErrs" + $lvl + " = errors; ";
          var $passData = $key;
          var $wasComposite = it.compositeRule;
          it.compositeRule = $it.compositeRule = true;
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
          } else {
            out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
          }
          it.compositeRule = $it.compositeRule = $wasComposite;
          out += " if (!" + $nextValid + ") { for (var " + $i + "=startErrs" + $lvl + "; " + $i + "<errors; " + $i + "++) { vErrors[" + $i + "].propertyName = " + $key + "; }   var err =   ";
          if (it.createErrors !== false) {
            out += " { keyword: 'propertyNames' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { propertyName: '" + $invalidName + "' } ";
            if (it.opts.messages !== false) {
              out += " , message: 'property name \\'" + $invalidName + "\\' is invalid' ";
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError(vErrors); ";
            } else {
              out += " validate.errors = vErrors; return false; ";
            }
          }
          if ($breakOnError) {
            out += " break; ";
          }
          out += " } }";
        }
        if ($breakOnError) {
          out += " " + $closingBraces + " if (" + $errs + " == errors) {";
        }
        return out;
      };
    });
    require_required = __commonJS2((exports, module) => {
      module.exports = function generate_required(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $valid = "valid" + $lvl;
        var $isData = it.opts.$data && $schema && $schema.$data, $schemaValue;
        if ($isData) {
          out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ";
          $schemaValue = "schema" + $lvl;
        } else {
          $schemaValue = $schema;
        }
        var $vSchema = "schema" + $lvl;
        if (!$isData) {
          if ($schema.length < it.opts.loopRequired && it.schema.properties && Object.keys(it.schema.properties).length) {
            var $required = [];
            var arr1 = $schema;
            if (arr1) {
              var $property, i1 = -1, l1 = arr1.length - 1;
              while (i1 < l1) {
                $property = arr1[i1 += 1];
                var $propertySch = it.schema.properties[$property];
                if (!($propertySch && (it.opts.strictKeywords ? typeof $propertySch == "object" && Object.keys($propertySch).length > 0 || $propertySch === false : it.util.schemaHasRules($propertySch, it.RULES.all)))) {
                  $required[$required.length] = $property;
                }
              }
            }
          } else {
            var $required = $schema;
          }
        }
        if ($isData || $required.length) {
          var $currentErrorPath = it.errorPath, $loopRequired = $isData || $required.length >= it.opts.loopRequired, $ownProperties = it.opts.ownProperties;
          if ($breakOnError) {
            out += " var missing" + $lvl + "; ";
            if ($loopRequired) {
              if (!$isData) {
                out += " var " + $vSchema + " = validate.schema" + $schemaPath + "; ";
              }
              var $i = "i" + $lvl, $propertyPath = "schema" + $lvl + "[" + $i + "]", $missingProperty = "' + " + $propertyPath + " + '";
              if (it.opts._errorDataPathProperty) {
                it.errorPath = it.util.getPathExpr($currentErrorPath, $propertyPath, it.opts.jsonPointers);
              }
              out += " var " + $valid + " = true; ";
              if ($isData) {
                out += " if (schema" + $lvl + " === undefined) " + $valid + " = true; else if (!Array.isArray(schema" + $lvl + ")) " + $valid + " = false; else {";
              }
              out += " for (var " + $i + " = 0; " + $i + " < " + $vSchema + ".length; " + $i + "++) { " + $valid + " = " + $data + "[" + $vSchema + "[" + $i + "]] !== undefined ";
              if ($ownProperties) {
                out += " &&   Object.prototype.hasOwnProperty.call(" + $data + ", " + $vSchema + "[" + $i + "]) ";
              }
              out += "; if (!" + $valid + ") break; } ";
              if ($isData) {
                out += "  }  ";
              }
              out += "  if (!" + $valid + ") {   ";
              var $$outStack = $$outStack || [];
              $$outStack.push(out);
              out = "";
              if (it.createErrors !== false) {
                out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ";
                if (it.opts.messages !== false) {
                  out += " , message: '";
                  if (it.opts._errorDataPathProperty) {
                    out += "is a required property";
                  } else {
                    out += "should have required property \\'" + $missingProperty + "\\'";
                  }
                  out += "' ";
                }
                if (it.opts.verbose) {
                  out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                }
                out += " } ";
              } else {
                out += " {} ";
              }
              var __err = out;
              out = $$outStack.pop();
              if (!it.compositeRule && $breakOnError) {
                if (it.async) {
                  out += " throw new ValidationError([" + __err + "]); ";
                } else {
                  out += " validate.errors = [" + __err + "]; return false; ";
                }
              } else {
                out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
              }
              out += " } else { ";
            } else {
              out += " if ( ";
              var arr2 = $required;
              if (arr2) {
                var $propertyKey, $i = -1, l2 = arr2.length - 1;
                while ($i < l2) {
                  $propertyKey = arr2[$i += 1];
                  if ($i) {
                    out += " || ";
                  }
                  var $prop = it.util.getProperty($propertyKey), $useData = $data + $prop;
                  out += " ( ( " + $useData + " === undefined ";
                  if ($ownProperties) {
                    out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
                  }
                  out += ") && (missing" + $lvl + " = " + it.util.toQuotedString(it.opts.jsonPointers ? $propertyKey : $prop) + ") ) ";
                }
              }
              out += ") {  ";
              var $propertyPath = "missing" + $lvl, $missingProperty = "' + " + $propertyPath + " + '";
              if (it.opts._errorDataPathProperty) {
                it.errorPath = it.opts.jsonPointers ? it.util.getPathExpr($currentErrorPath, $propertyPath, true) : $currentErrorPath + " + " + $propertyPath;
              }
              var $$outStack = $$outStack || [];
              $$outStack.push(out);
              out = "";
              if (it.createErrors !== false) {
                out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ";
                if (it.opts.messages !== false) {
                  out += " , message: '";
                  if (it.opts._errorDataPathProperty) {
                    out += "is a required property";
                  } else {
                    out += "should have required property \\'" + $missingProperty + "\\'";
                  }
                  out += "' ";
                }
                if (it.opts.verbose) {
                  out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                }
                out += " } ";
              } else {
                out += " {} ";
              }
              var __err = out;
              out = $$outStack.pop();
              if (!it.compositeRule && $breakOnError) {
                if (it.async) {
                  out += " throw new ValidationError([" + __err + "]); ";
                } else {
                  out += " validate.errors = [" + __err + "]; return false; ";
                }
              } else {
                out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
              }
              out += " } else { ";
            }
          } else {
            if ($loopRequired) {
              if (!$isData) {
                out += " var " + $vSchema + " = validate.schema" + $schemaPath + "; ";
              }
              var $i = "i" + $lvl, $propertyPath = "schema" + $lvl + "[" + $i + "]", $missingProperty = "' + " + $propertyPath + " + '";
              if (it.opts._errorDataPathProperty) {
                it.errorPath = it.util.getPathExpr($currentErrorPath, $propertyPath, it.opts.jsonPointers);
              }
              if ($isData) {
                out += " if (" + $vSchema + " && !Array.isArray(" + $vSchema + ")) {  var err =   ";
                if (it.createErrors !== false) {
                  out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ";
                  if (it.opts.messages !== false) {
                    out += " , message: '";
                    if (it.opts._errorDataPathProperty) {
                      out += "is a required property";
                    } else {
                      out += "should have required property \\'" + $missingProperty + "\\'";
                    }
                    out += "' ";
                  }
                  if (it.opts.verbose) {
                    out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                  }
                  out += " } ";
                } else {
                  out += " {} ";
                }
                out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } else if (" + $vSchema + " !== undefined) { ";
              }
              out += " for (var " + $i + " = 0; " + $i + " < " + $vSchema + ".length; " + $i + "++) { if (" + $data + "[" + $vSchema + "[" + $i + "]] === undefined ";
              if ($ownProperties) {
                out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", " + $vSchema + "[" + $i + "]) ";
              }
              out += ") {  var err =   ";
              if (it.createErrors !== false) {
                out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ";
                if (it.opts.messages !== false) {
                  out += " , message: '";
                  if (it.opts._errorDataPathProperty) {
                    out += "is a required property";
                  } else {
                    out += "should have required property \\'" + $missingProperty + "\\'";
                  }
                  out += "' ";
                }
                if (it.opts.verbose) {
                  out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                }
                out += " } ";
              } else {
                out += " {} ";
              }
              out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } } ";
              if ($isData) {
                out += "  }  ";
              }
            } else {
              var arr3 = $required;
              if (arr3) {
                var $propertyKey, i3 = -1, l3 = arr3.length - 1;
                while (i3 < l3) {
                  $propertyKey = arr3[i3 += 1];
                  var $prop = it.util.getProperty($propertyKey), $missingProperty = it.util.escapeQuotes($propertyKey), $useData = $data + $prop;
                  if (it.opts._errorDataPathProperty) {
                    it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
                  }
                  out += " if ( " + $useData + " === undefined ";
                  if ($ownProperties) {
                    out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
                  }
                  out += ") {  var err =   ";
                  if (it.createErrors !== false) {
                    out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ";
                    if (it.opts.messages !== false) {
                      out += " , message: '";
                      if (it.opts._errorDataPathProperty) {
                        out += "is a required property";
                      } else {
                        out += "should have required property \\'" + $missingProperty + "\\'";
                      }
                      out += "' ";
                    }
                    if (it.opts.verbose) {
                      out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                    }
                    out += " } ";
                  } else {
                    out += " {} ";
                  }
                  out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ";
                }
              }
            }
          }
          it.errorPath = $currentErrorPath;
        } else if ($breakOnError) {
          out += " if (true) {";
        }
        return out;
      };
    });
    require_uniqueItems = __commonJS2((exports, module) => {
      module.exports = function generate_uniqueItems(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $data = "data" + ($dataLvl || "");
        var $valid = "valid" + $lvl;
        var $isData = it.opts.$data && $schema && $schema.$data, $schemaValue;
        if ($isData) {
          out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ";
          $schemaValue = "schema" + $lvl;
        } else {
          $schemaValue = $schema;
        }
        if (($schema || $isData) && it.opts.uniqueItems !== false) {
          if ($isData) {
            out += " var " + $valid + "; if (" + $schemaValue + " === false || " + $schemaValue + " === undefined) " + $valid + " = true; else if (typeof " + $schemaValue + " != 'boolean') " + $valid + " = false; else { ";
          }
          out += " var i = " + $data + ".length , " + $valid + " = true , j; if (i > 1) { ";
          var $itemType = it.schema.items && it.schema.items.type, $typeIsArray = Array.isArray($itemType);
          if (!$itemType || $itemType == "object" || $itemType == "array" || $typeIsArray && ($itemType.indexOf("object") >= 0 || $itemType.indexOf("array") >= 0)) {
            out += " outer: for (;i--;) { for (j = i; j--;) { if (equal(" + $data + "[i], " + $data + "[j])) { " + $valid + " = false; break outer; } } } ";
          } else {
            out += " var itemIndices = {}, item; for (;i--;) { var item = " + $data + "[i]; ";
            var $method = "checkDataType" + ($typeIsArray ? "s" : "");
            out += " if (" + it.util[$method]($itemType, "item", it.opts.strictNumbers, true) + ") continue; ";
            if ($typeIsArray) {
              out += ` if (typeof item == 'string') item = '"' + item; `;
            }
            out += " if (typeof itemIndices[item] == 'number') { " + $valid + " = false; j = itemIndices[item]; break; } itemIndices[item] = i; } ";
          }
          out += " } ";
          if ($isData) {
            out += "  }  ";
          }
          out += " if (!" + $valid + ") {   ";
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out += " { keyword: 'uniqueItems' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { i: i, j: j } ";
            if (it.opts.messages !== false) {
              out += " , message: 'should NOT have duplicate items (items ## ' + j + ' and ' + i + ' are identical)' ";
            }
            if (it.opts.verbose) {
              out += " , schema:  ";
              if ($isData) {
                out += "validate.schema" + $schemaPath;
              } else {
                out += "" + $schema;
              }
              out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
          out += " } ";
          if ($breakOnError) {
            out += " else { ";
          }
        } else {
          if ($breakOnError) {
            out += " if (true) { ";
          }
        }
        return out;
      };
    });
    require_dotjs = __commonJS2((exports, module) => {
      module.exports = {
        $ref: require_ref(),
        allOf: require_allOf(),
        anyOf: require_anyOf(),
        $comment: require_comment(),
        const: require_const(),
        contains: require_contains(),
        dependencies: require_dependencies(),
        enum: require_enum(),
        format: require_format(),
        if: require_if(),
        items: require_items(),
        maximum: require__limit(),
        minimum: require__limit(),
        maxItems: require__limitItems(),
        minItems: require__limitItems(),
        maxLength: require__limitLength(),
        minLength: require__limitLength(),
        maxProperties: require__limitProperties(),
        minProperties: require__limitProperties(),
        multipleOf: require_multipleOf(),
        not: require_not(),
        oneOf: require_oneOf(),
        pattern: require_pattern(),
        properties: require_properties(),
        propertyNames: require_propertyNames(),
        required: require_required(),
        uniqueItems: require_uniqueItems(),
        validate: require_validate()
      };
    });
    require_rules = __commonJS2((exports, module) => {
      var ruleModules = require_dotjs();
      var toHash = require_util().toHash;
      module.exports = function rules() {
        var RULES = [
          {
            type: "number",
            rules: [
              { maximum: ["exclusiveMaximum"] },
              { minimum: ["exclusiveMinimum"] },
              "multipleOf",
              "format"
            ]
          },
          {
            type: "string",
            rules: ["maxLength", "minLength", "pattern", "format"]
          },
          {
            type: "array",
            rules: ["maxItems", "minItems", "items", "contains", "uniqueItems"]
          },
          {
            type: "object",
            rules: [
              "maxProperties",
              "minProperties",
              "required",
              "dependencies",
              "propertyNames",
              { properties: ["additionalProperties", "patternProperties"] }
            ]
          },
          { rules: ["$ref", "const", "enum", "not", "anyOf", "oneOf", "allOf", "if"] }
        ];
        var ALL = ["type", "$comment"];
        var KEYWORDS = [
          "$schema",
          "$id",
          "id",
          "$data",
          "$async",
          "title",
          "description",
          "default",
          "definitions",
          "examples",
          "readOnly",
          "writeOnly",
          "contentMediaType",
          "contentEncoding",
          "additionalItems",
          "then",
          "else"
        ];
        var TYPES = ["number", "integer", "string", "array", "object", "boolean", "null"];
        RULES.all = toHash(ALL);
        RULES.types = toHash(TYPES);
        RULES.forEach(function(group) {
          group.rules = group.rules.map(function(keyword) {
            var implKeywords;
            if (typeof keyword == "object") {
              var key = Object.keys(keyword)[0];
              implKeywords = keyword[key];
              keyword = key;
              implKeywords.forEach(function(k) {
                ALL.push(k);
                RULES.all[k] = true;
              });
            }
            ALL.push(keyword);
            var rule = RULES.all[keyword] = {
              keyword,
              code: ruleModules[keyword],
              implements: implKeywords
            };
            return rule;
          });
          RULES.all.$comment = {
            keyword: "$comment",
            code: ruleModules.$comment
          };
          if (group.type)
            RULES.types[group.type] = group;
        });
        RULES.keywords = toHash(ALL.concat(KEYWORDS));
        RULES.custom = {};
        return RULES;
      };
    });
    require_data = __commonJS2((exports, module) => {
      var KEYWORDS = [
        "multipleOf",
        "maximum",
        "exclusiveMaximum",
        "minimum",
        "exclusiveMinimum",
        "maxLength",
        "minLength",
        "pattern",
        "additionalItems",
        "maxItems",
        "minItems",
        "uniqueItems",
        "maxProperties",
        "minProperties",
        "required",
        "additionalProperties",
        "enum",
        "format",
        "const"
      ];
      module.exports = function(metaSchema, keywordsJsonPointers) {
        for (var i = 0; i < keywordsJsonPointers.length; i++) {
          metaSchema = JSON.parse(JSON.stringify(metaSchema));
          var segments = keywordsJsonPointers[i].split("/");
          var keywords = metaSchema;
          var j;
          for (j = 1; j < segments.length; j++)
            keywords = keywords[segments[j]];
          for (j = 0; j < KEYWORDS.length; j++) {
            var key = KEYWORDS[j];
            var schema = keywords[key];
            if (schema) {
              keywords[key] = {
                anyOf: [
                  schema,
                  { $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#" }
                ]
              };
            }
          }
        }
        return metaSchema;
      };
    });
    require_async = __commonJS2((exports, module) => {
      var MissingRefError = require_error_classes().MissingRef;
      module.exports = compileAsync;
      function compileAsync(schema, meta, callback) {
        var self = this;
        if (typeof this._opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        if (typeof meta == "function") {
          callback = meta;
          meta = void 0;
        }
        var p = loadMetaSchemaOf(schema).then(function() {
          var schemaObj = self._addSchema(schema, void 0, meta);
          return schemaObj.validate || _compileAsync(schemaObj);
        });
        if (callback) {
          p.then(function(v) {
            callback(null, v);
          }, callback);
        }
        return p;
        function loadMetaSchemaOf(sch) {
          var $schema = sch.$schema;
          return $schema && !self.getSchema($schema) ? compileAsync.call(self, { $ref: $schema }, true) : Promise.resolve();
        }
        function _compileAsync(schemaObj) {
          try {
            return self._compile(schemaObj);
          } catch (e) {
            if (e instanceof MissingRefError)
              return loadMissingSchema(e);
            throw e;
          }
          function loadMissingSchema(e) {
            var ref = e.missingSchema;
            if (added(ref))
              throw new Error("Schema " + ref + " is loaded but " + e.missingRef + " cannot be resolved");
            var schemaPromise = self._loadingSchemas[ref];
            if (!schemaPromise) {
              schemaPromise = self._loadingSchemas[ref] = self._opts.loadSchema(ref);
              schemaPromise.then(removePromise, removePromise);
            }
            return schemaPromise.then(function(sch) {
              if (!added(ref)) {
                return loadMetaSchemaOf(sch).then(function() {
                  if (!added(ref))
                    self.addSchema(sch, ref, void 0, meta);
                });
              }
            }).then(function() {
              return _compileAsync(schemaObj);
            });
            function removePromise() {
              delete self._loadingSchemas[ref];
            }
            function added(ref2) {
              return self._refs[ref2] || self._schemas[ref2];
            }
          }
        }
      }
    });
    require_custom = __commonJS2((exports, module) => {
      module.exports = function generate_custom(it, $keyword, $ruleType) {
        var out = " ";
        var $lvl = it.level;
        var $dataLvl = it.dataLevel;
        var $schema = it.schema[$keyword];
        var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
        var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
        var $breakOnError = !it.opts.allErrors;
        var $errorKeyword;
        var $data = "data" + ($dataLvl || "");
        var $valid = "valid" + $lvl;
        var $errs = "errs__" + $lvl;
        var $isData = it.opts.$data && $schema && $schema.$data, $schemaValue;
        if ($isData) {
          out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ";
          $schemaValue = "schema" + $lvl;
        } else {
          $schemaValue = $schema;
        }
        var $rule = this, $definition = "definition" + $lvl, $rDef = $rule.definition, $closingBraces = "";
        var $compile, $inline, $macro, $ruleValidate, $validateCode;
        if ($isData && $rDef.$data) {
          $validateCode = "keywordValidate" + $lvl;
          var $validateSchema = $rDef.validateSchema;
          out += " var " + $definition + " = RULES.custom['" + $keyword + "'].definition; var " + $validateCode + " = " + $definition + ".validate;";
        } else {
          $ruleValidate = it.useCustomRule($rule, $schema, it.schema, it);
          if (!$ruleValidate)
            return;
          $schemaValue = "validate.schema" + $schemaPath;
          $validateCode = $ruleValidate.code;
          $compile = $rDef.compile;
          $inline = $rDef.inline;
          $macro = $rDef.macro;
        }
        var $ruleErrs = $validateCode + ".errors", $i = "i" + $lvl, $ruleErr = "ruleErr" + $lvl, $asyncKeyword = $rDef.async;
        if ($asyncKeyword && !it.async)
          throw new Error("async keyword in sync schema");
        if (!($inline || $macro)) {
          out += "" + $ruleErrs + " = null;";
        }
        out += "var " + $errs + " = errors;var " + $valid + ";";
        if ($isData && $rDef.$data) {
          $closingBraces += "}";
          out += " if (" + $schemaValue + " === undefined) { " + $valid + " = true; } else { ";
          if ($validateSchema) {
            $closingBraces += "}";
            out += " " + $valid + " = " + $definition + ".validateSchema(" + $schemaValue + "); if (" + $valid + ") { ";
          }
        }
        if ($inline) {
          if ($rDef.statements) {
            out += " " + $ruleValidate.validate + " ";
          } else {
            out += " " + $valid + " = " + $ruleValidate.validate + "; ";
          }
        } else if ($macro) {
          var $it = it.util.copy(it);
          var $closingBraces = "";
          $it.level++;
          var $nextValid = "valid" + $it.level;
          $it.schema = $ruleValidate.validate;
          $it.schemaPath = "";
          var $wasComposite = it.compositeRule;
          it.compositeRule = $it.compositeRule = true;
          var $code = it.validate($it).replace(/validate\.schema/g, $validateCode);
          it.compositeRule = $it.compositeRule = $wasComposite;
          out += " " + $code;
        } else {
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          out += "  " + $validateCode + ".call( ";
          if (it.opts.passContext) {
            out += "this";
          } else {
            out += "self";
          }
          if ($compile || $rDef.schema === false) {
            out += " , " + $data + " ";
          } else {
            out += " , " + $schemaValue + " , " + $data + " , validate.schema" + it.schemaPath + " ";
          }
          out += " , (dataPath || '')";
          if (it.errorPath != '""') {
            out += " + " + it.errorPath;
          }
          var $parentData = $dataLvl ? "data" + ($dataLvl - 1 || "") : "parentData", $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : "parentDataProperty";
          out += " , " + $parentData + " , " + $parentDataProperty + " , rootData )  ";
          var def_callRuleValidate = out;
          out = $$outStack.pop();
          if ($rDef.errors === false) {
            out += " " + $valid + " = ";
            if ($asyncKeyword) {
              out += "await ";
            }
            out += "" + def_callRuleValidate + "; ";
          } else {
            if ($asyncKeyword) {
              $ruleErrs = "customErrors" + $lvl;
              out += " var " + $ruleErrs + " = null; try { " + $valid + " = await " + def_callRuleValidate + "; } catch (e) { " + $valid + " = false; if (e instanceof ValidationError) " + $ruleErrs + " = e.errors; else throw e; } ";
            } else {
              out += " " + $ruleErrs + " = null; " + $valid + " = " + def_callRuleValidate + "; ";
            }
          }
        }
        if ($rDef.modifying) {
          out += " if (" + $parentData + ") " + $data + " = " + $parentData + "[" + $parentDataProperty + "];";
        }
        out += "" + $closingBraces;
        if ($rDef.valid) {
          if ($breakOnError) {
            out += " if (true) { ";
          }
        } else {
          out += " if ( ";
          if ($rDef.valid === void 0) {
            out += " !";
            if ($macro) {
              out += "" + $nextValid;
            } else {
              out += "" + $valid;
            }
          } else {
            out += " " + !$rDef.valid + " ";
          }
          out += ") { ";
          $errorKeyword = $rule.keyword;
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out += " { keyword: '" + ($errorKeyword || "custom") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { keyword: '" + $rule.keyword + "' } ";
            if (it.opts.messages !== false) {
              out += ` , message: 'should pass "` + $rule.keyword + `" keyword validation' `;
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
          var def_customError = out;
          out = $$outStack.pop();
          if ($inline) {
            if ($rDef.errors) {
              if ($rDef.errors != "full") {
                out += "  for (var " + $i + "=" + $errs + "; " + $i + "<errors; " + $i + "++) { var " + $ruleErr + " = vErrors[" + $i + "]; if (" + $ruleErr + ".dataPath === undefined) " + $ruleErr + ".dataPath = (dataPath || '') + " + it.errorPath + "; if (" + $ruleErr + ".schemaPath === undefined) { " + $ruleErr + '.schemaPath = "' + $errSchemaPath + '"; } ';
                if (it.opts.verbose) {
                  out += " " + $ruleErr + ".schema = " + $schemaValue + "; " + $ruleErr + ".data = " + $data + "; ";
                }
                out += " } ";
              }
            } else {
              if ($rDef.errors === false) {
                out += " " + def_customError + " ";
              } else {
                out += " if (" + $errs + " == errors) { " + def_customError + " } else {  for (var " + $i + "=" + $errs + "; " + $i + "<errors; " + $i + "++) { var " + $ruleErr + " = vErrors[" + $i + "]; if (" + $ruleErr + ".dataPath === undefined) " + $ruleErr + ".dataPath = (dataPath || '') + " + it.errorPath + "; if (" + $ruleErr + ".schemaPath === undefined) { " + $ruleErr + '.schemaPath = "' + $errSchemaPath + '"; } ';
                if (it.opts.verbose) {
                  out += " " + $ruleErr + ".schema = " + $schemaValue + "; " + $ruleErr + ".data = " + $data + "; ";
                }
                out += " } } ";
              }
            }
          } else if ($macro) {
            out += "   var err =   ";
            if (it.createErrors !== false) {
              out += " { keyword: '" + ($errorKeyword || "custom") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { keyword: '" + $rule.keyword + "' } ";
              if (it.opts.messages !== false) {
                out += ` , message: 'should pass "` + $rule.keyword + `" keyword validation' `;
              }
              if (it.opts.verbose) {
                out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
              }
              out += " } ";
            } else {
              out += " {} ";
            }
            out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
            if (!it.compositeRule && $breakOnError) {
              if (it.async) {
                out += " throw new ValidationError(vErrors); ";
              } else {
                out += " validate.errors = vErrors; return false; ";
              }
            }
          } else {
            if ($rDef.errors === false) {
              out += " " + def_customError + " ";
            } else {
              out += " if (Array.isArray(" + $ruleErrs + ")) { if (vErrors === null) vErrors = " + $ruleErrs + "; else vErrors = vErrors.concat(" + $ruleErrs + "); errors = vErrors.length;  for (var " + $i + "=" + $errs + "; " + $i + "<errors; " + $i + "++) { var " + $ruleErr + " = vErrors[" + $i + "]; if (" + $ruleErr + ".dataPath === undefined) " + $ruleErr + ".dataPath = (dataPath || '') + " + it.errorPath + ";  " + $ruleErr + '.schemaPath = "' + $errSchemaPath + '";  ';
              if (it.opts.verbose) {
                out += " " + $ruleErr + ".schema = " + $schemaValue + "; " + $ruleErr + ".data = " + $data + "; ";
              }
              out += " } } else { " + def_customError + " } ";
            }
          }
          out += " } ";
          if ($breakOnError) {
            out += " else { ";
          }
        }
        return out;
      };
    });
    require_json_schema_draft_07 = __commonJS2((exports, module) => {
      module.exports = {
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: "http://json-schema.org/draft-07/schema#",
        title: "Core schema meta-schema",
        definitions: {
          schemaArray: {
            type: "array",
            minItems: 1,
            items: { $ref: "#" }
          },
          nonNegativeInteger: {
            type: "integer",
            minimum: 0
          },
          nonNegativeIntegerDefault0: {
            allOf: [
              { $ref: "#/definitions/nonNegativeInteger" },
              { default: 0 }
            ]
          },
          simpleTypes: {
            enum: [
              "array",
              "boolean",
              "integer",
              "null",
              "number",
              "object",
              "string"
            ]
          },
          stringArray: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
            default: []
          }
        },
        type: ["object", "boolean"],
        properties: {
          $id: {
            type: "string",
            format: "uri-reference"
          },
          $schema: {
            type: "string",
            format: "uri"
          },
          $ref: {
            type: "string",
            format: "uri-reference"
          },
          $comment: {
            type: "string"
          },
          title: {
            type: "string"
          },
          description: {
            type: "string"
          },
          default: true,
          readOnly: {
            type: "boolean",
            default: false
          },
          examples: {
            type: "array",
            items: true
          },
          multipleOf: {
            type: "number",
            exclusiveMinimum: 0
          },
          maximum: {
            type: "number"
          },
          exclusiveMaximum: {
            type: "number"
          },
          minimum: {
            type: "number"
          },
          exclusiveMinimum: {
            type: "number"
          },
          maxLength: { $ref: "#/definitions/nonNegativeInteger" },
          minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
          pattern: {
            type: "string",
            format: "regex"
          },
          additionalItems: { $ref: "#" },
          items: {
            anyOf: [
              { $ref: "#" },
              { $ref: "#/definitions/schemaArray" }
            ],
            default: true
          },
          maxItems: { $ref: "#/definitions/nonNegativeInteger" },
          minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
          uniqueItems: {
            type: "boolean",
            default: false
          },
          contains: { $ref: "#" },
          maxProperties: { $ref: "#/definitions/nonNegativeInteger" },
          minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
          required: { $ref: "#/definitions/stringArray" },
          additionalProperties: { $ref: "#" },
          definitions: {
            type: "object",
            additionalProperties: { $ref: "#" },
            default: {}
          },
          properties: {
            type: "object",
            additionalProperties: { $ref: "#" },
            default: {}
          },
          patternProperties: {
            type: "object",
            additionalProperties: { $ref: "#" },
            propertyNames: { format: "regex" },
            default: {}
          },
          dependencies: {
            type: "object",
            additionalProperties: {
              anyOf: [
                { $ref: "#" },
                { $ref: "#/definitions/stringArray" }
              ]
            }
          },
          propertyNames: { $ref: "#" },
          const: true,
          enum: {
            type: "array",
            items: true,
            minItems: 1,
            uniqueItems: true
          },
          type: {
            anyOf: [
              { $ref: "#/definitions/simpleTypes" },
              {
                type: "array",
                items: { $ref: "#/definitions/simpleTypes" },
                minItems: 1,
                uniqueItems: true
              }
            ]
          },
          format: { type: "string" },
          contentMediaType: { type: "string" },
          contentEncoding: { type: "string" },
          if: { $ref: "#" },
          then: { $ref: "#" },
          else: { $ref: "#" },
          allOf: { $ref: "#/definitions/schemaArray" },
          anyOf: { $ref: "#/definitions/schemaArray" },
          oneOf: { $ref: "#/definitions/schemaArray" },
          not: { $ref: "#" }
        },
        default: true
      };
    });
    require_definition_schema = __commonJS2((exports, module) => {
      var metaSchema = require_json_schema_draft_07();
      module.exports = {
        $id: "https://github.com/ajv-validator/ajv/blob/master/lib/definition_schema.js",
        definitions: {
          simpleTypes: metaSchema.definitions.simpleTypes
        },
        type: "object",
        dependencies: {
          schema: ["validate"],
          $data: ["validate"],
          statements: ["inline"],
          valid: { not: { required: ["macro"] } }
        },
        properties: {
          type: metaSchema.properties.type,
          schema: { type: "boolean" },
          statements: { type: "boolean" },
          dependencies: {
            type: "array",
            items: { type: "string" }
          },
          metaSchema: { type: "object" },
          modifying: { type: "boolean" },
          valid: { type: "boolean" },
          $data: { type: "boolean" },
          async: { type: "boolean" },
          errors: {
            anyOf: [
              { type: "boolean" },
              { const: "full" }
            ]
          }
        }
      };
    });
    require_keyword = __commonJS2((exports, module) => {
      var IDENTIFIER = /^[a-z_$][a-z0-9_$-]*$/i;
      var customRuleCode = require_custom();
      var definitionSchema = require_definition_schema();
      module.exports = {
        add: addKeyword,
        get: getKeyword,
        remove: removeKeyword,
        validate: validateKeyword
      };
      function addKeyword(keyword, definition) {
        var RULES = this.RULES;
        if (RULES.keywords[keyword])
          throw new Error("Keyword " + keyword + " is already defined");
        if (!IDENTIFIER.test(keyword))
          throw new Error("Keyword " + keyword + " is not a valid identifier");
        if (definition) {
          this.validateKeyword(definition, true);
          var dataType = definition.type;
          if (Array.isArray(dataType)) {
            for (var i = 0; i < dataType.length; i++)
              _addRule(keyword, dataType[i], definition);
          } else {
            _addRule(keyword, dataType, definition);
          }
          var metaSchema = definition.metaSchema;
          if (metaSchema) {
            if (definition.$data && this._opts.$data) {
              metaSchema = {
                anyOf: [
                  metaSchema,
                  { $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#" }
                ]
              };
            }
            definition.validateSchema = this.compile(metaSchema, true);
          }
        }
        RULES.keywords[keyword] = RULES.all[keyword] = true;
        function _addRule(keyword2, dataType2, definition2) {
          var ruleGroup;
          for (var i2 = 0; i2 < RULES.length; i2++) {
            var rg = RULES[i2];
            if (rg.type == dataType2) {
              ruleGroup = rg;
              break;
            }
          }
          if (!ruleGroup) {
            ruleGroup = { type: dataType2, rules: [] };
            RULES.push(ruleGroup);
          }
          var rule = {
            keyword: keyword2,
            definition: definition2,
            custom: true,
            code: customRuleCode,
            implements: definition2.implements
          };
          ruleGroup.rules.push(rule);
          RULES.custom[keyword2] = rule;
        }
        return this;
      }
      function getKeyword(keyword) {
        var rule = this.RULES.custom[keyword];
        return rule ? rule.definition : this.RULES.keywords[keyword] || false;
      }
      function removeKeyword(keyword) {
        var RULES = this.RULES;
        delete RULES.keywords[keyword];
        delete RULES.all[keyword];
        delete RULES.custom[keyword];
        for (var i = 0; i < RULES.length; i++) {
          var rules = RULES[i].rules;
          for (var j = 0; j < rules.length; j++) {
            if (rules[j].keyword == keyword) {
              rules.splice(j, 1);
              break;
            }
          }
        }
        return this;
      }
      function validateKeyword(definition, throwError) {
        validateKeyword.errors = null;
        var v = this._validateKeyword = this._validateKeyword || this.compile(definitionSchema, true);
        if (v(definition))
          return true;
        validateKeyword.errors = v.errors;
        if (throwError)
          throw new Error("custom keyword definition is invalid: " + this.errorsText(v.errors));
        else
          return false;
      }
    });
    require_data2 = __commonJS2((exports, module) => {
      module.exports = {
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
        description: "Meta-schema for $data reference (JSON Schema extension proposal)",
        type: "object",
        required: ["$data"],
        properties: {
          $data: {
            type: "string",
            anyOf: [
              { format: "relative-json-pointer" },
              { format: "json-pointer" }
            ]
          }
        },
        additionalProperties: false
      };
    });
    require_ajv = __commonJS2((exports, module) => {
      var compileSchema = require_compile();
      var resolve = require_resolve();
      var Cache = require_cache();
      var SchemaObject = require_schema_obj();
      var stableStringify = require_fast_json_stable_stringify();
      var formats = require_formats();
      var rules = require_rules();
      var $dataMetaSchema = require_data();
      var util32 = require_util();
      module.exports = Ajv;
      Ajv.prototype.validate = validate;
      Ajv.prototype.compile = compile;
      Ajv.prototype.addSchema = addSchema;
      Ajv.prototype.addMetaSchema = addMetaSchema;
      Ajv.prototype.validateSchema = validateSchema;
      Ajv.prototype.getSchema = getSchema;
      Ajv.prototype.removeSchema = removeSchema;
      Ajv.prototype.addFormat = addFormat2;
      Ajv.prototype.errorsText = errorsText;
      Ajv.prototype._addSchema = _addSchema;
      Ajv.prototype._compile = _compile;
      Ajv.prototype.compileAsync = require_async();
      var customKeyword = require_keyword();
      Ajv.prototype.addKeyword = customKeyword.add;
      Ajv.prototype.getKeyword = customKeyword.get;
      Ajv.prototype.removeKeyword = customKeyword.remove;
      Ajv.prototype.validateKeyword = customKeyword.validate;
      var errorClasses = require_error_classes();
      Ajv.ValidationError = errorClasses.Validation;
      Ajv.MissingRefError = errorClasses.MissingRef;
      Ajv.$dataMetaSchema = $dataMetaSchema;
      var META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
      var META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes", "strictDefaults"];
      var META_SUPPORT_DATA = ["/properties"];
      function Ajv(opts) {
        if (!(this instanceof Ajv))
          return new Ajv(opts);
        opts = this._opts = util32.copy(opts) || {};
        setLogger(this);
        this._schemas = {};
        this._refs = {};
        this._fragments = {};
        this._formats = formats(opts.format);
        this._cache = opts.cache || new Cache();
        this._loadingSchemas = {};
        this._compilations = [];
        this.RULES = rules();
        this._getId = chooseGetId(opts);
        opts.loopRequired = opts.loopRequired || Infinity;
        if (opts.errorDataPath == "property")
          opts._errorDataPathProperty = true;
        if (opts.serialize === void 0)
          opts.serialize = stableStringify;
        this._metaOpts = getMetaSchemaOptions(this);
        if (opts.formats)
          addInitialFormats(this);
        if (opts.keywords)
          addInitialKeywords(this);
        addDefaultMetaSchema(this);
        if (typeof opts.meta == "object")
          this.addMetaSchema(opts.meta);
        if (opts.nullable)
          this.addKeyword("nullable", { metaSchema: { type: "boolean" } });
        addInitialSchemas(this);
      }
      function validate(schemaKeyRef, data) {
        var v;
        if (typeof schemaKeyRef == "string") {
          v = this.getSchema(schemaKeyRef);
          if (!v)
            throw new Error('no schema with key or ref "' + schemaKeyRef + '"');
        } else {
          var schemaObj = this._addSchema(schemaKeyRef);
          v = schemaObj.validate || this._compile(schemaObj);
        }
        var valid = v(data);
        if (v.$async !== true)
          this.errors = v.errors;
        return valid;
      }
      function compile(schema, _meta) {
        var schemaObj = this._addSchema(schema, void 0, _meta);
        return schemaObj.validate || this._compile(schemaObj);
      }
      function addSchema(schema, key, _skipValidation, _meta) {
        if (Array.isArray(schema)) {
          for (var i = 0; i < schema.length; i++)
            this.addSchema(schema[i], void 0, _skipValidation, _meta);
          return this;
        }
        var id = this._getId(schema);
        if (id !== void 0 && typeof id != "string")
          throw new Error("schema id must be string");
        key = resolve.normalizeId(key || id);
        checkUnique(this, key);
        this._schemas[key] = this._addSchema(schema, _skipValidation, _meta, true);
        return this;
      }
      function addMetaSchema(schema, key, skipValidation) {
        this.addSchema(schema, key, skipValidation, true);
        return this;
      }
      function validateSchema(schema, throwOrLogError) {
        var $schema = schema.$schema;
        if ($schema !== void 0 && typeof $schema != "string")
          throw new Error("$schema must be a string");
        $schema = $schema || this._opts.defaultMeta || defaultMeta(this);
        if (!$schema) {
          this.logger.warn("meta-schema not available");
          this.errors = null;
          return true;
        }
        var valid = this.validate($schema, schema);
        if (!valid && throwOrLogError) {
          var message = "schema is invalid: " + this.errorsText();
          if (this._opts.validateSchema == "log")
            this.logger.error(message);
          else
            throw new Error(message);
        }
        return valid;
      }
      function defaultMeta(self) {
        var meta = self._opts.meta;
        self._opts.defaultMeta = typeof meta == "object" ? self._getId(meta) || meta : self.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0;
        return self._opts.defaultMeta;
      }
      function getSchema(keyRef) {
        var schemaObj = _getSchemaObj(this, keyRef);
        switch (typeof schemaObj) {
          case "object":
            return schemaObj.validate || this._compile(schemaObj);
          case "string":
            return this.getSchema(schemaObj);
          case "undefined":
            return _getSchemaFragment(this, keyRef);
        }
      }
      function _getSchemaFragment(self, ref) {
        var res = resolve.schema.call(self, { schema: {} }, ref);
        if (res) {
          var { schema, root, baseId } = res;
          var v = compileSchema.call(self, schema, root, void 0, baseId);
          self._fragments[ref] = new SchemaObject({
            ref,
            fragment: true,
            schema,
            root,
            baseId,
            validate: v
          });
          return v;
        }
      }
      function _getSchemaObj(self, keyRef) {
        keyRef = resolve.normalizeId(keyRef);
        return self._schemas[keyRef] || self._refs[keyRef] || self._fragments[keyRef];
      }
      function removeSchema(schemaKeyRef) {
        if (schemaKeyRef instanceof RegExp) {
          _removeAllSchemas(this, this._schemas, schemaKeyRef);
          _removeAllSchemas(this, this._refs, schemaKeyRef);
          return this;
        }
        switch (typeof schemaKeyRef) {
          case "undefined":
            _removeAllSchemas(this, this._schemas);
            _removeAllSchemas(this, this._refs);
            this._cache.clear();
            return this;
          case "string":
            var schemaObj = _getSchemaObj(this, schemaKeyRef);
            if (schemaObj)
              this._cache.del(schemaObj.cacheKey);
            delete this._schemas[schemaKeyRef];
            delete this._refs[schemaKeyRef];
            return this;
          case "object":
            var serialize = this._opts.serialize;
            var cacheKey2 = serialize ? serialize(schemaKeyRef) : schemaKeyRef;
            this._cache.del(cacheKey2);
            var id = this._getId(schemaKeyRef);
            if (id) {
              id = resolve.normalizeId(id);
              delete this._schemas[id];
              delete this._refs[id];
            }
        }
        return this;
      }
      function _removeAllSchemas(self, schemas, regex) {
        for (var keyRef in schemas) {
          var schemaObj = schemas[keyRef];
          if (!schemaObj.meta && (!regex || regex.test(keyRef))) {
            self._cache.del(schemaObj.cacheKey);
            delete schemas[keyRef];
          }
        }
      }
      function _addSchema(schema, skipValidation, meta, shouldAddSchema) {
        if (typeof schema != "object" && typeof schema != "boolean")
          throw new Error("schema should be object or boolean");
        var serialize = this._opts.serialize;
        var cacheKey2 = serialize ? serialize(schema) : schema;
        var cached = this._cache.get(cacheKey2);
        if (cached)
          return cached;
        shouldAddSchema = shouldAddSchema || this._opts.addUsedSchema !== false;
        var id = resolve.normalizeId(this._getId(schema));
        if (id && shouldAddSchema)
          checkUnique(this, id);
        var willValidate = this._opts.validateSchema !== false && !skipValidation;
        var recursiveMeta;
        if (willValidate && !(recursiveMeta = id && id == resolve.normalizeId(schema.$schema)))
          this.validateSchema(schema, true);
        var localRefs = resolve.ids.call(this, schema);
        var schemaObj = new SchemaObject({
          id,
          schema,
          localRefs,
          cacheKey: cacheKey2,
          meta
        });
        if (id[0] != "#" && shouldAddSchema)
          this._refs[id] = schemaObj;
        this._cache.put(cacheKey2, schemaObj);
        if (willValidate && recursiveMeta)
          this.validateSchema(schema, true);
        return schemaObj;
      }
      function _compile(schemaObj, root) {
        if (schemaObj.compiling) {
          schemaObj.validate = callValidate;
          callValidate.schema = schemaObj.schema;
          callValidate.errors = null;
          callValidate.root = root ? root : callValidate;
          if (schemaObj.schema.$async === true)
            callValidate.$async = true;
          return callValidate;
        }
        schemaObj.compiling = true;
        var currentOpts;
        if (schemaObj.meta) {
          currentOpts = this._opts;
          this._opts = this._metaOpts;
        }
        var v;
        try {
          v = compileSchema.call(this, schemaObj.schema, root, schemaObj.localRefs);
        } catch (e) {
          delete schemaObj.validate;
          throw e;
        } finally {
          schemaObj.compiling = false;
          if (schemaObj.meta)
            this._opts = currentOpts;
        }
        schemaObj.validate = v;
        schemaObj.refs = v.refs;
        schemaObj.refVal = v.refVal;
        schemaObj.root = v.root;
        return v;
        function callValidate() {
          var _validate = schemaObj.validate;
          var result = _validate.apply(this, arguments);
          callValidate.errors = _validate.errors;
          return result;
        }
      }
      function chooseGetId(opts) {
        switch (opts.schemaId) {
          case "auto":
            return _get$IdOrId;
          case "id":
            return _getId;
          default:
            return _get$Id;
        }
      }
      function _getId(schema) {
        if (schema.$id)
          this.logger.warn("schema $id ignored", schema.$id);
        return schema.id;
      }
      function _get$Id(schema) {
        if (schema.id)
          this.logger.warn("schema id ignored", schema.id);
        return schema.$id;
      }
      function _get$IdOrId(schema) {
        if (schema.$id && schema.id && schema.$id != schema.id)
          throw new Error("schema $id is different from id");
        return schema.$id || schema.id;
      }
      function errorsText(errors2, options) {
        errors2 = errors2 || this.errors;
        if (!errors2)
          return "No errors";
        options = options || {};
        var separator = options.separator === void 0 ? ", " : options.separator;
        var dataVar = options.dataVar === void 0 ? "data" : options.dataVar;
        var text = "";
        for (var i = 0; i < errors2.length; i++) {
          var e = errors2[i];
          if (e)
            text += dataVar + e.dataPath + " " + e.message + separator;
        }
        return text.slice(0, -separator.length);
      }
      function addFormat2(name, format) {
        if (typeof format == "string")
          format = new RegExp(format);
        this._formats[name] = format;
        return this;
      }
      function addDefaultMetaSchema(self) {
        var $dataSchema;
        if (self._opts.$data) {
          $dataSchema = require_data2();
          self.addMetaSchema($dataSchema, $dataSchema.$id, true);
        }
        if (self._opts.meta === false)
          return;
        var metaSchema = require_json_schema_draft_07();
        if (self._opts.$data)
          metaSchema = $dataMetaSchema(metaSchema, META_SUPPORT_DATA);
        self.addMetaSchema(metaSchema, META_SCHEMA_ID, true);
        self._refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      function addInitialSchemas(self) {
        var optsSchemas = self._opts.schemas;
        if (!optsSchemas)
          return;
        if (Array.isArray(optsSchemas))
          self.addSchema(optsSchemas);
        else
          for (var key in optsSchemas)
            self.addSchema(optsSchemas[key], key);
      }
      function addInitialFormats(self) {
        for (var name in self._opts.formats) {
          var format = self._opts.formats[name];
          self.addFormat(name, format);
        }
      }
      function addInitialKeywords(self) {
        for (var name in self._opts.keywords) {
          var keyword = self._opts.keywords[name];
          self.addKeyword(name, keyword);
        }
      }
      function checkUnique(self, id) {
        if (self._schemas[id] || self._refs[id])
          throw new Error('schema with key or id "' + id + '" already exists');
      }
      function getMetaSchemaOptions(self) {
        var metaOpts = util32.copy(self._opts);
        for (var i = 0; i < META_IGNORE_OPTIONS.length; i++)
          delete metaOpts[META_IGNORE_OPTIONS[i]];
        return metaOpts;
      }
      function setLogger(self) {
        var logger2 = self._opts.logger;
        if (logger2 === false) {
          self.logger = { log: noop, warn: noop, error: noop };
        } else {
          if (logger2 === void 0)
            logger2 = console;
          if (!(typeof logger2 == "object" && logger2.log && logger2.warn && logger2.error))
            throw new Error("logger must implement log, warn and error methods");
          self.logger = logger2;
        }
      }
      function noop() {
      }
    });
    DEFAULT_MAX_LISTENERS = 50;
    NodeFsOperations = {
      accessSync(fsPath, mode) {
        fs2.accessSync(fsPath, mode);
      },
      cwd() {
        return process.cwd();
      },
      chmodSync(fsPath, mode) {
        fs2.chmodSync(fsPath, mode);
      },
      existsSync(fsPath) {
        return fs2.existsSync(fsPath);
      },
      async stat(fsPath) {
        return statPromise(fsPath);
      },
      statSync(fsPath) {
        return fs2.statSync(fsPath);
      },
      readFileSync(fsPath, options) {
        return fs2.readFileSync(fsPath, { encoding: options.encoding });
      },
      readFileBytesSync(fsPath) {
        return fs2.readFileSync(fsPath);
      },
      readSync(fsPath, options) {
        let fd = void 0;
        try {
          fd = fs2.openSync(fsPath, "r");
          const buffer = Buffer.alloc(options.length);
          const bytesRead = fs2.readSync(fd, buffer, 0, options.length, 0);
          return { buffer, bytesRead };
        } finally {
          if (fd)
            fs2.closeSync(fd);
        }
      },
      writeFileSync(fsPath, data, options) {
        if (!options.flush) {
          fs2.writeFileSync(fsPath, data, { encoding: options.encoding });
          return;
        }
        let fd;
        try {
          fd = fs2.openSync(fsPath, "w");
          fs2.writeFileSync(fd, data, { encoding: options.encoding });
          fs2.fsyncSync(fd);
        } finally {
          if (fd) {
            fs2.closeSync(fd);
          }
        }
      },
      appendFileSync(path, data) {
        fs2.appendFileSync(path, data);
      },
      copyFileSync(src, dest) {
        fs2.copyFileSync(src, dest);
      },
      unlinkSync(path) {
        fs2.unlinkSync(path);
      },
      renameSync(oldPath, newPath) {
        fs2.renameSync(oldPath, newPath);
      },
      symlinkSync(target, path) {
        fs2.symlinkSync(target, path);
      },
      readlinkSync(path) {
        return fs2.readlinkSync(path);
      },
      realpathSync(path) {
        return fs2.realpathSync(path);
      },
      mkdirSync(dirPath) {
        if (!fs2.existsSync(dirPath)) {
          fs2.mkdirSync(dirPath, { recursive: true });
        }
      },
      readdirSync(dirPath) {
        return fs2.readdirSync(dirPath, { withFileTypes: true });
      },
      readdirStringSync(dirPath) {
        return fs2.readdirSync(dirPath);
      },
      isDirEmptySync(dirPath) {
        const files = this.readdirSync(dirPath);
        return files.length === 0;
      },
      rmdirSync(dirPath) {
        fs2.rmdirSync(dirPath);
      },
      rmSync(path, options) {
        fs2.rmSync(path, options);
      }
    };
    activeFs = NodeFsOperations;
    AbortError = class extends Error {
    };
    ProcessTransport = class {
      options;
      child;
      childStdin;
      childStdout;
      ready = false;
      abortController;
      exitError;
      exitListeners = [];
      processExitHandler;
      abortHandler;
      constructor(options) {
        this.options = options;
        this.abortController = options.abortController || createAbortController();
        this.initialize();
      }
      initialize() {
        try {
          const {
            prompt,
            additionalDirectories = [],
            cwd,
            executable = this.isRunningWithBun() ? "bun" : "node",
            executableArgs = [],
            extraArgs = {},
            pathToClaudeCodeExecutable,
            env = { ...process.env },
            stderr,
            customSystemPrompt,
            appendSystemPrompt,
            maxTurns,
            model,
            fallbackModel,
            permissionMode,
            permissionPromptToolName,
            continueConversation,
            resume,
            allowedTools = [],
            disallowedTools = [],
            mcpServers,
            strictMcpConfig,
            canUseTool
          } = this.options;
          const args = ["--output-format", "stream-json", "--verbose"];
          if (customSystemPrompt)
            args.push("--system-prompt", customSystemPrompt);
          if (appendSystemPrompt)
            args.push("--append-system-prompt", appendSystemPrompt);
          if (maxTurns)
            args.push("--max-turns", maxTurns.toString());
          if (model)
            args.push("--model", model);
          if (env.DEBUG)
            args.push("--debug-to-stderr");
          if (canUseTool) {
            if (typeof prompt === "string") {
              throw new Error("canUseTool callback requires --input-format stream-json. Please set prompt as an AsyncIterable.");
            }
            if (permissionPromptToolName) {
              throw new Error("canUseTool callback cannot be used with permissionPromptToolName. Please use one or the other.");
            }
            args.push("--permission-prompt-tool", "stdio");
          } else if (permissionPromptToolName) {
            args.push("--permission-prompt-tool", permissionPromptToolName);
          }
          if (continueConversation)
            args.push("--continue");
          if (resume)
            args.push("--resume", resume);
          if (allowedTools.length > 0) {
            args.push("--allowedTools", allowedTools.join(","));
          }
          if (disallowedTools.length > 0) {
            args.push("--disallowedTools", disallowedTools.join(","));
          }
          if (mcpServers && Object.keys(mcpServers).length > 0) {
            args.push("--mcp-config", JSON.stringify({ mcpServers }));
          }
          if (strictMcpConfig) {
            args.push("--strict-mcp-config");
          }
          if (permissionMode && permissionMode !== "default") {
            args.push("--permission-mode", permissionMode);
          }
          if (fallbackModel) {
            if (model && fallbackModel === model) {
              throw new Error("Fallback model cannot be the same as the main model. Please specify a different model for fallbackModel option.");
            }
            args.push("--fallback-model", fallbackModel);
          }
          if (typeof prompt === "string") {
            args.push("--print");
            args.push("--", prompt.trim());
          } else {
            args.push("--input-format", "stream-json");
          }
          for (const dir of additionalDirectories) {
            args.push("--add-dir", dir);
          }
          for (const [flag, value] of Object.entries(extraArgs)) {
            if (value === null) {
              args.push(`--${flag}`);
            } else {
              args.push(`--${flag}`, value);
            }
          }
          if (!env.CLAUDE_CODE_ENTRYPOINT) {
            env.CLAUDE_CODE_ENTRYPOINT = "sdk-ts";
          }
          const fs22 = getFsImplementation();
          if (!fs22.existsSync(pathToClaudeCodeExecutable)) {
            const errorMessage = isNativeBinary(pathToClaudeCodeExecutable) ? `Claude Code native binary not found at ${pathToClaudeCodeExecutable}. Please ensure Claude Code is installed via native installer or specify a valid path with options.pathToClaudeCodeExecutable.` : `Claude Code executable not found at ${pathToClaudeCodeExecutable}. Is options.pathToClaudeCodeExecutable set?`;
            throw new ReferenceError(errorMessage);
          }
          const isNative = isNativeBinary(pathToClaudeCodeExecutable);
          const spawnCommand = isNative ? pathToClaudeCodeExecutable : executable;
          const spawnArgs = isNative ? args : [...executableArgs, pathToClaudeCodeExecutable, ...args];
          this.logDebug(isNative ? `Spawning Claude Code native binary: ${pathToClaudeCodeExecutable} ${args.join(" ")}` : `Spawning Claude Code process: ${executable} ${[...executableArgs, pathToClaudeCodeExecutable, ...args].join(" ")}`);
          const stderrMode = env.DEBUG || stderr ? "pipe" : "ignore";
          this.child = spawn(spawnCommand, spawnArgs, {
            cwd,
            stdio: ["pipe", "pipe", stderrMode],
            signal: this.abortController.signal,
            env
          });
          this.childStdin = this.child.stdin;
          this.childStdout = this.child.stdout;
          if (typeof prompt === "string") {
            this.childStdin.end();
            this.childStdin = void 0;
          }
          if (env.DEBUG || stderr) {
            this.child.stderr.on("data", (data) => {
              this.logDebug(`Claude Code stderr: ${data.toString()}`);
              if (stderr) {
                stderr(data.toString());
              }
            });
          }
          const cleanup = () => {
            if (this.child && !this.child.killed) {
              this.child.kill("SIGTERM");
            }
          };
          this.processExitHandler = cleanup;
          this.abortHandler = cleanup;
          process.on("exit", this.processExitHandler);
          this.abortController.signal.addEventListener("abort", this.abortHandler);
          this.child.on("error", (error) => {
            this.ready = false;
            if (this.abortController.signal.aborted) {
              this.exitError = new AbortError("Claude Code process aborted by user");
            } else {
              this.exitError = new Error(`Failed to spawn Claude Code process: ${error.message}`);
              this.logDebug(this.exitError.message);
            }
          });
          this.child.on("close", (code, signal) => {
            this.ready = false;
            if (this.abortController.signal.aborted) {
              this.exitError = new AbortError("Claude Code process aborted by user");
            } else {
              const error = this.getProcessExitError(code, signal);
              if (error) {
                this.exitError = error;
                this.logDebug(error.message);
              }
            }
          });
          this.ready = true;
        } catch (error) {
          this.ready = false;
          throw error;
        }
      }
      getProcessExitError(code, signal) {
        if (code !== 0 && code !== null) {
          return new Error(`Claude Code process exited with code ${code}`);
        } else if (signal) {
          return new Error(`Claude Code process terminated by signal ${signal}`);
        }
        return;
      }
      isRunningWithBun() {
        return process.versions.bun !== void 0 || process.env.BUN_INSTALL !== void 0;
      }
      logDebug(message) {
        if (process.env.DEBUG) {
          process.stderr.write(`${message}
`);
        }
        if (this.options.stderr) {
          this.options.stderr(message);
        }
      }
      write(data) {
        if (this.abortController.signal.aborted) {
          throw new AbortError("Operation aborted");
        }
        if (!this.ready || !this.childStdin) {
          throw new Error("ProcessTransport is not ready for writing");
        }
        if (this.child?.killed || this.child?.exitCode !== null) {
          throw new Error("Cannot write to terminated process");
        }
        if (this.exitError) {
          throw new Error(`Cannot write to process that exited with error: ${this.exitError.message}`);
        }
        if (process.env.DEBUG_SDK) {
          process.stderr.write(`[ProcessTransport] Writing to stdin: ${data.substring(0, 100)}
`);
        }
        try {
          const written = this.childStdin.write(data);
          if (!written && process.env.DEBUG_SDK) {
            console.warn("[ProcessTransport] Write buffer full, data queued");
          }
        } catch (error) {
          this.ready = false;
          throw new Error(`Failed to write to process stdin: ${error.message}`);
        }
      }
      close() {
        if (this.childStdin) {
          this.childStdin.end();
          this.childStdin = void 0;
        }
        if (this.processExitHandler) {
          process.off("exit", this.processExitHandler);
          this.processExitHandler = void 0;
        }
        if (this.abortHandler) {
          this.abortController.signal.removeEventListener("abort", this.abortHandler);
          this.abortHandler = void 0;
        }
        for (const { handler } of this.exitListeners) {
          this.child?.off("exit", handler);
        }
        this.exitListeners = [];
        if (this.child && !this.child.killed) {
          this.child.kill("SIGTERM");
          setTimeout(() => {
            if (this.child && !this.child.killed) {
              this.child.kill("SIGKILL");
            }
          }, 5e3);
        }
        this.ready = false;
      }
      isReady() {
        return this.ready;
      }
      async *readMessages() {
        if (!this.childStdout) {
          throw new Error("ProcessTransport output stream not available");
        }
        const rl = createInterface({ input: this.childStdout });
        try {
          for await (const line of rl) {
            if (line.trim()) {
              const message = JSON.parse(line);
              yield message;
            }
          }
          await this.waitForExit();
        } catch (error) {
          throw error;
        } finally {
          rl.close();
        }
      }
      endInput() {
        if (this.childStdin) {
          this.childStdin.end();
        }
      }
      getInputStream() {
        return this.childStdin;
      }
      onExit(callback) {
        if (!this.child)
          return () => {
          };
        const handler = (code, signal) => {
          const error = this.getProcessExitError(code, signal);
          callback(error);
        };
        this.child.on("exit", handler);
        this.exitListeners.push({ callback, handler });
        return () => {
          if (this.child) {
            this.child.off("exit", handler);
          }
          const index = this.exitListeners.findIndex((l) => l.handler === handler);
          if (index !== -1) {
            this.exitListeners.splice(index, 1);
          }
        };
      }
      async waitForExit() {
        if (!this.child) {
          if (this.exitError) {
            throw this.exitError;
          }
          return;
        }
        if (this.child.exitCode !== null || this.child.killed) {
          if (this.exitError) {
            throw this.exitError;
          }
          return;
        }
        return new Promise((resolve, reject) => {
          const exitHandler = (code, signal) => {
            if (this.abortController.signal.aborted) {
              reject(new AbortError("Operation aborted"));
              return;
            }
            const error = this.getProcessExitError(code, signal);
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          };
          this.child.once("exit", exitHandler);
          const errorHandler2 = (error) => {
            this.child.off("exit", exitHandler);
            reject(error);
          };
          this.child.once("error", errorHandler2);
          this.child.once("exit", () => {
            this.child.off("error", errorHandler2);
          });
        });
      }
    };
    Stream = class {
      returned;
      queue = [];
      readResolve;
      readReject;
      isDone = false;
      hasError;
      started = false;
      constructor(returned) {
        this.returned = returned;
      }
      [Symbol.asyncIterator]() {
        if (this.started) {
          throw new Error("Stream can only be iterated once");
        }
        this.started = true;
        return this;
      }
      next() {
        if (this.queue.length > 0) {
          return Promise.resolve({
            done: false,
            value: this.queue.shift()
          });
        }
        if (this.isDone) {
          return Promise.resolve({ done: true, value: void 0 });
        }
        if (this.hasError) {
          return Promise.reject(this.hasError);
        }
        return new Promise((resolve, reject) => {
          this.readResolve = resolve;
          this.readReject = reject;
        });
      }
      enqueue(value) {
        if (this.readResolve) {
          const resolve = this.readResolve;
          this.readResolve = void 0;
          this.readReject = void 0;
          resolve({ done: false, value });
        } else {
          this.queue.push(value);
        }
      }
      done() {
        this.isDone = true;
        if (this.readResolve) {
          const resolve = this.readResolve;
          this.readResolve = void 0;
          this.readReject = void 0;
          resolve({ done: true, value: void 0 });
        }
      }
      error(error) {
        this.hasError = error;
        if (this.readReject) {
          const reject = this.readReject;
          this.readResolve = void 0;
          this.readReject = void 0;
          reject(error);
        }
      }
      return() {
        this.isDone = true;
        if (this.returned) {
          this.returned();
        }
        return Promise.resolve({ done: true, value: void 0 });
      }
    };
    SdkControlServerTransport = class {
      sendMcpMessage;
      isClosed = false;
      constructor(sendMcpMessage) {
        this.sendMcpMessage = sendMcpMessage;
      }
      onclose;
      onerror;
      onmessage;
      async start() {
      }
      async send(message) {
        if (this.isClosed) {
          throw new Error("Transport is closed");
        }
        this.sendMcpMessage(message);
      }
      async close() {
        if (this.isClosed) {
          return;
        }
        this.isClosed = true;
        this.onclose?.();
      }
    };
    Query = class {
      transport;
      isStreamingMode;
      canUseTool;
      hooks;
      abortController;
      pendingControlResponses = /* @__PURE__ */ new Map();
      cleanupPerformed = false;
      sdkMessages;
      inputStream = new Stream();
      intialization;
      cancelControllers = /* @__PURE__ */ new Map();
      hookCallbacks = /* @__PURE__ */ new Map();
      nextCallbackId = 0;
      sdkMcpTransports = /* @__PURE__ */ new Map();
      pendingMcpResponses = /* @__PURE__ */ new Map();
      constructor(transport, isStreamingMode, canUseTool, hooks, abortController, sdkMcpServers = /* @__PURE__ */ new Map()) {
        this.transport = transport;
        this.isStreamingMode = isStreamingMode;
        this.canUseTool = canUseTool;
        this.hooks = hooks;
        this.abortController = abortController;
        for (const [name, server] of sdkMcpServers) {
          const sdkTransport = new SdkControlServerTransport((message) => this.sendMcpServerMessageToCli(name, message));
          this.sdkMcpTransports.set(name, sdkTransport);
          server.connect(sdkTransport);
        }
        this.sdkMessages = this.readSdkMessages();
        this.readMessages();
        if (this.isStreamingMode) {
          this.intialization = this.initialize();
        }
      }
      setError(error) {
        this.inputStream.error(error);
      }
      cleanup(error) {
        if (this.cleanupPerformed)
          return;
        this.cleanupPerformed = true;
        try {
          this.transport.close();
          this.pendingControlResponses.clear();
          this.pendingMcpResponses.clear();
          if (error) {
            this.inputStream.error(error);
          } else {
            this.inputStream.done();
          }
        } catch (_error) {
        }
      }
      next(...[value]) {
        return this.sdkMessages.next(...[value]);
      }
      return(value) {
        return this.sdkMessages.return(value);
      }
      throw(e) {
        return this.sdkMessages.throw(e);
      }
      [Symbol.asyncIterator]() {
        return this.sdkMessages;
      }
      [Symbol.asyncDispose]() {
        return this.sdkMessages[Symbol.asyncDispose]();
      }
      async readMessages() {
        try {
          for await (const message of this.transport.readMessages()) {
            if (message.type === "control_response") {
              const handler = this.pendingControlResponses.get(message.response.request_id);
              if (handler) {
                handler(message.response);
              }
              continue;
            } else if (message.type === "control_request") {
              this.handleControlRequest(message);
              continue;
            } else if (message.type === "control_cancel_request") {
              this.handleControlCancelRequest(message);
              continue;
            }
            if (message.type === "stream_event") {
              continue;
            }
            this.inputStream.enqueue(message);
          }
          this.inputStream.done();
          this.cleanup();
        } catch (error) {
          this.inputStream.error(error);
          this.cleanup(error);
        }
      }
      async handleControlRequest(request) {
        const controller = new AbortController();
        this.cancelControllers.set(request.request_id, controller);
        try {
          const response = await this.processControlRequest(request, controller.signal);
          const controlResponse = {
            type: "control_response",
            response: {
              subtype: "success",
              request_id: request.request_id,
              response
            }
          };
          await Promise.resolve(this.transport.write(JSON.stringify(controlResponse) + `
`));
        } catch (error) {
          const controlErrorResponse = {
            type: "control_response",
            response: {
              subtype: "error",
              request_id: request.request_id,
              error: error.message || String(error)
            }
          };
          await Promise.resolve(this.transport.write(JSON.stringify(controlErrorResponse) + `
`));
        } finally {
          this.cancelControllers.delete(request.request_id);
        }
      }
      handleControlCancelRequest(request) {
        const controller = this.cancelControllers.get(request.request_id);
        if (controller) {
          controller.abort();
          this.cancelControllers.delete(request.request_id);
        }
      }
      async processControlRequest(request, signal) {
        if (request.request.subtype === "can_use_tool") {
          if (!this.canUseTool) {
            throw new Error("canUseTool callback is not provided.");
          }
          return this.canUseTool(request.request.tool_name, request.request.input, {
            signal,
            suggestions: request.request.permission_suggestions
          });
        } else if (request.request.subtype === "hook_callback") {
          const result = await this.handleHookCallbacks(request.request.callback_id, request.request.input, request.request.tool_use_id, signal);
          return result;
        } else if (request.request.subtype === "mcp_message") {
          const mcpRequest = request.request;
          const transport = this.sdkMcpTransports.get(mcpRequest.server_name);
          if (!transport) {
            throw new Error(`SDK MCP server not found: ${mcpRequest.server_name}`);
          }
          if ("method" in mcpRequest.message && "id" in mcpRequest.message && mcpRequest.message.id !== null) {
            const response = await this.handleMcpControlRequest(mcpRequest.server_name, mcpRequest, transport);
            return { mcp_response: response };
          } else {
            if (transport.onmessage) {
              transport.onmessage(mcpRequest.message);
            }
            return { mcp_response: { jsonrpc: "2.0", result: {}, id: 0 } };
          }
        }
        throw new Error("Unsupported control request subtype: " + request.request.subtype);
      }
      async *readSdkMessages() {
        for await (const message of this.inputStream) {
          yield message;
        }
      }
      async initialize() {
        let hooks;
        if (this.hooks) {
          hooks = {};
          for (const [event, matchers] of Object.entries(this.hooks)) {
            if (matchers.length > 0) {
              hooks[event] = matchers.map((matcher) => {
                const callbackIds = [];
                for (const callback of matcher.hooks) {
                  const callbackId = `hook_${this.nextCallbackId++}`;
                  this.hookCallbacks.set(callbackId, callback);
                  callbackIds.push(callbackId);
                }
                return {
                  matcher: matcher.matcher,
                  hookCallbackIds: callbackIds
                };
              });
            }
          }
        }
        const initRequest = {
          subtype: "initialize",
          hooks
        };
        const response = await this.request(initRequest);
        return response.response;
      }
      async interrupt() {
        if (!this.isStreamingMode) {
          throw new Error("Interrupt requires --input-format stream-json");
        }
        await this.request({
          subtype: "interrupt"
        });
      }
      async setPermissionMode(mode) {
        if (!this.isStreamingMode) {
          throw new Error("setPermissionMode requires --input-format stream-json");
        }
        await this.request({
          subtype: "set_permission_mode",
          mode
        });
      }
      request(request) {
        const requestId = Math.random().toString(36).substring(2, 15);
        const sdkRequest = {
          request_id: requestId,
          type: "control_request",
          request
        };
        return new Promise((resolve, reject) => {
          this.pendingControlResponses.set(requestId, (response) => {
            if (response.subtype === "success") {
              resolve(response);
            } else {
              reject(new Error(response.error));
            }
          });
          Promise.resolve(this.transport.write(JSON.stringify(sdkRequest) + `
`));
        });
      }
      async supportedCommands() {
        if (!this.isStreamingMode) {
          throw new Error("supportedCommands requires --input-format stream-json");
        }
        if (!this.intialization) {
          throw new Error("supportedCommands requires transport with bidirectional communication");
        }
        return (await this.intialization).commands;
      }
      async streamInput(stream) {
        try {
          for await (const message of stream) {
            if (this.abortController?.signal.aborted)
              break;
            await Promise.resolve(this.transport.write(JSON.stringify(message) + `
`));
          }
          this.transport.endInput();
        } catch (error) {
          if (!(error instanceof AbortError)) {
            throw error;
          }
        }
      }
      handleHookCallbacks(callbackId, input, toolUseID, abortSignal) {
        const callback = this.hookCallbacks.get(callbackId);
        if (!callback) {
          throw new Error(`No hook callback found for ID: ${callbackId}`);
        }
        return callback(input, toolUseID, {
          signal: abortSignal
        });
      }
      sendMcpServerMessageToCli(serverName, message) {
        if ("id" in message && message.id !== null && message.id !== void 0) {
          const key = `${serverName}:${message.id}`;
          const pending = this.pendingMcpResponses.get(key);
          if (pending) {
            pending.resolve(message);
            this.pendingMcpResponses.delete(key);
            return;
          }
        }
        throw new Error("No pending request found");
      }
      handleMcpControlRequest(serverName, mcpRequest, transport) {
        const messageId = "id" in mcpRequest.message ? mcpRequest.message.id : null;
        const key = `${serverName}:${messageId}`;
        return new Promise((resolve, reject) => {
          let timeoutId = null;
          const cleanup = () => {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            this.pendingMcpResponses.delete(key);
          };
          const resolveAndCleanup = (response) => {
            cleanup();
            resolve(response);
          };
          const rejectAndCleanup = (error) => {
            cleanup();
            reject(error);
          };
          this.pendingMcpResponses.set(key, {
            resolve: resolveAndCleanup,
            reject: rejectAndCleanup
          });
          if (transport.onmessage) {
            transport.onmessage(mcpRequest.message);
          } else {
            cleanup();
            reject(new Error("No message handler registered"));
            return;
          }
          timeoutId = setTimeout(() => {
            if (this.pendingMcpResponses.has(key)) {
              cleanup();
              reject(new Error("Request timeout"));
            }
          }, 3e4);
        });
      }
    };
    exports_external = {};
    __export2(exports_external, {
      void: () => voidType,
      util: () => util3,
      unknown: () => unknownType,
      union: () => unionType,
      undefined: () => undefinedType,
      tuple: () => tupleType,
      transformer: () => effectsType,
      symbol: () => symbolType,
      string: () => stringType,
      strictObject: () => strictObjectType,
      setErrorMap: () => setErrorMap,
      set: () => setType,
      record: () => recordType,
      quotelessJson: () => quotelessJson,
      promise: () => promiseType,
      preprocess: () => preprocessType,
      pipeline: () => pipelineType,
      ostring: () => ostring,
      optional: () => optionalType,
      onumber: () => onumber,
      oboolean: () => oboolean,
      objectUtil: () => objectUtil,
      object: () => objectType,
      number: () => numberType,
      nullable: () => nullableType,
      null: () => nullType,
      never: () => neverType,
      nativeEnum: () => nativeEnumType,
      nan: () => nanType,
      map: () => mapType,
      makeIssue: () => makeIssue,
      literal: () => literalType,
      lazy: () => lazyType,
      late: () => late,
      isValid: () => isValid,
      isDirty: () => isDirty,
      isAsync: () => isAsync,
      isAborted: () => isAborted,
      intersection: () => intersectionType,
      instanceof: () => instanceOfType,
      getParsedType: () => getParsedType,
      getErrorMap: () => getErrorMap,
      function: () => functionType,
      enum: () => enumType,
      effect: () => effectsType,
      discriminatedUnion: () => discriminatedUnionType,
      defaultErrorMap: () => en_default,
      datetimeRegex: () => datetimeRegex,
      date: () => dateType,
      custom: () => custom,
      coerce: () => coerce,
      boolean: () => booleanType,
      bigint: () => bigIntType,
      array: () => arrayType,
      any: () => anyType,
      addIssueToContext: () => addIssueToContext,
      ZodVoid: () => ZodVoid,
      ZodUnknown: () => ZodUnknown,
      ZodUnion: () => ZodUnion,
      ZodUndefined: () => ZodUndefined,
      ZodType: () => ZodType,
      ZodTuple: () => ZodTuple,
      ZodTransformer: () => ZodEffects,
      ZodSymbol: () => ZodSymbol,
      ZodString: () => ZodString,
      ZodSet: () => ZodSet,
      ZodSchema: () => ZodType,
      ZodRecord: () => ZodRecord,
      ZodReadonly: () => ZodReadonly,
      ZodPromise: () => ZodPromise,
      ZodPipeline: () => ZodPipeline,
      ZodParsedType: () => ZodParsedType,
      ZodOptional: () => ZodOptional,
      ZodObject: () => ZodObject,
      ZodNumber: () => ZodNumber,
      ZodNullable: () => ZodNullable,
      ZodNull: () => ZodNull,
      ZodNever: () => ZodNever,
      ZodNativeEnum: () => ZodNativeEnum,
      ZodNaN: () => ZodNaN,
      ZodMap: () => ZodMap,
      ZodLiteral: () => ZodLiteral,
      ZodLazy: () => ZodLazy,
      ZodIssueCode: () => ZodIssueCode,
      ZodIntersection: () => ZodIntersection,
      ZodFunction: () => ZodFunction,
      ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
      ZodError: () => ZodError,
      ZodEnum: () => ZodEnum,
      ZodEffects: () => ZodEffects,
      ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
      ZodDefault: () => ZodDefault,
      ZodDate: () => ZodDate,
      ZodCatch: () => ZodCatch,
      ZodBranded: () => ZodBranded,
      ZodBoolean: () => ZodBoolean,
      ZodBigInt: () => ZodBigInt,
      ZodArray: () => ZodArray,
      ZodAny: () => ZodAny,
      Schema: () => ZodType,
      ParseStatus: () => ParseStatus,
      OK: () => OK,
      NEVER: () => NEVER,
      INVALID: () => INVALID,
      EMPTY_PATH: () => EMPTY_PATH,
      DIRTY: () => DIRTY,
      BRAND: () => BRAND
    });
    (function(util22) {
      util22.assertEqual = (_) => {
      };
      function assertIs(_arg) {
      }
      util22.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      util22.assertNever = assertNever;
      util22.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util22.getValidEnumValues = (obj) => {
        const validKeys = util22.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util22.objectValues(filtered);
      };
      util22.objectValues = (obj) => {
        return util22.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util22.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
        const keys = [];
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util22.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return;
      };
      util22.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      util22.joinValues = joinValues;
      util22.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util3 || (util3 = {}));
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
        };
      };
    })(objectUtil || (objectUtil = {}));
    ZodParsedType = util3.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set"
    ]);
    getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return ZodParsedType.undefined;
        case "string":
          return ZodParsedType.string;
        case "number":
          return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
          return ZodParsedType.boolean;
        case "function":
          return ZodParsedType.function;
        case "bigint":
          return ZodParsedType.bigint;
        case "symbol":
          return ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return ZodParsedType.array;
          }
          if (data === null) {
            return ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return ZodParsedType.date;
          }
          return ZodParsedType.object;
        default:
          return ZodParsedType.unknown;
      }
    };
    ZodIssueCode = util3.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite"
    ]);
    quotelessJson = (obj) => {
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    };
    ZodError = class _ZodError extends Error {
      get errors() {
        return this.issues;
      }
      constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
          this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
          this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      format(_mapper) {
        const mapper = _mapper || function(issue) {
          return issue.message;
        };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
          for (const issue of error.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        };
        processError(this);
        return fieldErrors;
      }
      static assert(value) {
        if (!(value instanceof _ZodError)) {
          throw new Error(`Not a ZodError: ${value}`);
        }
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, util3.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            const firstEl = sub.path[0];
            fieldErrors[firstEl] = fieldErrors[firstEl] || [];
            fieldErrors[firstEl].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    ZodError.create = (issues) => {
      const error = new ZodError(issues);
      return error;
    };
    errorMap = (issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodIssueCode.invalid_type:
          if (issue.received === ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util3.jsonStringifyReplacer)}`;
          break;
        case ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util3.joinValues(issue.keys, ", ")}`;
          break;
        case ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util3.joinValues(issue.options)}`;
          break;
        case ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util3.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util3.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "bigint")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util3.assertNever(issue);
      }
      return { message };
    };
    en_default = errorMap;
    overrideErrorMap = en_default;
    makeIssue = (params) => {
      const { data, path, errorMaps, issueData } = params;
      const fullPath = [...path, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message
        };
      }
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: errorMessage
      };
    };
    EMPTY_PATH = [];
    ParseStatus = class _ParseStatus {
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted")
            return INVALID;
          if (value.status === "aborted")
            return INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    INVALID = Object.freeze({
      status: "aborted"
    });
    DIRTY = (value) => ({ status: "dirty", value });
    OK = (value) => ({ status: "valid", value });
    isAborted = (x) => x.status === "aborted";
    isDirty = (x) => x.status === "dirty";
    isValid = (x) => x.status === "valid";
    isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
    (function(errorUtil2) {
      errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
    })(errorUtil || (errorUtil = {}));
    ParseInputLazyPath = class {
      constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
      }
      get path() {
        if (!this._cachedPath.length) {
          if (Array.isArray(this._key)) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    handleResult = (ctx, result) => {
      if (isValid(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error)
              return this._error;
            const error = new ZodError(ctx.common.issues);
            this._error = error;
            return this._error;
          }
        };
      }
    };
    ZodType = class {
      get description() {
        return this._def.description;
      }
      _getType(input) {
        return getParsedType(input.data);
      }
      _getOrReturnCtx(input, ctx) {
        return ctx || {
          common: input.parent.common,
          data: input.data,
          parsedType: getParsedType(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        };
      }
      _processInputParams(input) {
        return {
          status: new ParseStatus(),
          ctx: {
            common: input.parent.common,
            data: input.data,
            parsedType: getParsedType(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent
          }
        };
      }
      _parseSync(input) {
        const result = this._parse(input);
        if (isAsync(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      safeParse(data, params) {
        const ctx = {
          common: {
            issues: [],
            async: params?.async ?? false,
            contextualErrorMap: params?.errorMap
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
      }
      "~validate"(data) {
        const ctx = {
          common: {
            issues: [],
            async: !!this["~standard"].async
          },
          path: [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        if (!this["~standard"].async) {
          try {
            const result = this._parseSync({ data, path: [], parent: ctx });
            return isValid(result) ? {
              value: result.value
            } : {
              issues: ctx.common.issues
            };
          } catch (err) {
            if (err?.message?.toLowerCase()?.includes("encountered")) {
              this["~standard"].async = true;
            }
            ctx.common = {
              issues: [],
              async: true
            };
          }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        });
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      async safeParseAsync(data, params) {
        const ctx = {
          common: {
            issues: [],
            contextualErrorMap: params?.errorMap,
            async: true
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = (val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        };
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = () => ctx.addIssue({
            code: ZodIssueCode.custom,
            ...getIssueProperties(val)
          });
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement }
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
          version: 1,
          vendor: "zod",
          validate: (data) => this["~validate"](data)
        };
      }
      optional() {
        return ZodOptional.create(this, this._def);
      }
      nullable() {
        return ZodNullable.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return ZodArray.create(this);
      }
      promise() {
        return ZodPromise.create(this, this._def);
      }
      or(option) {
        return ZodUnion.create([this, option], this._def);
      }
      and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
      }
      transform(transform) {
        return new ZodEffects({
          ...processCreateParams(this._def),
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "transform", transform }
        });
      }
      default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
          ...processCreateParams(this._def),
          innerType: this,
          defaultValue: defaultValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodDefault
        });
      }
      brand() {
        return new ZodBranded({
          typeName: ZodFirstPartyTypeKind.ZodBranded,
          type: this,
          ...processCreateParams(this._def)
        });
      }
      catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
          ...processCreateParams(this._def),
          innerType: this,
          catchValue: catchValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodCatch
        });
      }
      describe(description) {
        const This = this.constructor;
        return new This({
          ...this._def,
          description
        });
      }
      pipe(target) {
        return ZodPipeline.create(this, target);
      }
      readonly() {
        return ZodReadonly.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    };
    cuidRegex = /^c[^\s-]{8,}$/i;
    cuid2Regex = /^[0-9a-z]+$/;
    ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
    uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    nanoidRegex = /^[a-z0-9_-]{21}$/i;
    jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
    ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
    dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
    dateRegex = new RegExp(`^${dateRegexSource}$`);
    ZodString = class _ZodString extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.string,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.length < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.length > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "length") {
            const tooBig = input.data.length > check.value;
            const tooSmall = input.data.length < check.value;
            if (tooBig || tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              if (tooBig) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              } else if (tooSmall) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              }
              status.dirty();
            }
          } else if (check.kind === "email") {
            if (!emailRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "email",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "emoji") {
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
            if (!emojiRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "emoji",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "uuid") {
            if (!uuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "uuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "nanoid") {
            if (!nanoidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "nanoid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid") {
            if (!cuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid2") {
            if (!cuid2Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid2",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ulid") {
            if (!ulidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ulid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "url") {
            try {
              new URL(input.data);
            } catch {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "regex",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input.data = input.data.trim();
          } else if (check.kind === "includes") {
            if (!input.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input.data = input.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input.data = input.data.toUpperCase();
          } else if (check.kind === "startsWith") {
            if (!input.data.startsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { startsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "endsWith") {
            if (!input.data.endsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { endsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "datetime") {
            const regex = datetimeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "date") {
            const regex = dateRegex;
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "date",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "time") {
            const regex = timeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "time",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "duration") {
            if (!durationRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "duration",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ip") {
            if (!isValidIP(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ip",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "jwt") {
            if (!isValidJWT(input.data, check.alg)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "jwt",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cidr") {
            if (!isValidCidr(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cidr",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64") {
            if (!base64Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64url") {
            if (!base64urlRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util3.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodIssueCode.invalid_string,
          ...errorUtil.errToObj(message)
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      email(message) {
        return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
      }
      url(message) {
        return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
      }
      emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
      }
      uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
      }
      nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
      }
      cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
      }
      cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
      }
      ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
      }
      base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
      }
      base64url(message) {
        return this._addCheck({
          kind: "base64url",
          ...errorUtil.errToObj(message)
        });
      }
      jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
      }
      ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
      }
      cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
      }
      datetime(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            local: false,
            message: options
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          offset: options?.offset ?? false,
          local: options?.local ?? false,
          ...errorUtil.errToObj(options?.message)
        });
      }
      date(message) {
        return this._addCheck({ kind: "date", message });
      }
      time(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "time",
            precision: null,
            message: options
          });
        }
        return this._addCheck({
          kind: "time",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          ...errorUtil.errToObj(options?.message)
        });
      }
      duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
      }
      regex(regex, message) {
        return this._addCheck({
          kind: "regex",
          regex,
          ...errorUtil.errToObj(message)
        });
      }
      includes(value, options) {
        return this._addCheck({
          kind: "includes",
          value,
          position: options?.position,
          ...errorUtil.errToObj(options?.message)
        });
      }
      startsWith(value, message) {
        return this._addCheck({
          kind: "startsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      endsWith(value, message) {
        return this._addCheck({
          kind: "endsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      min(minLength, message) {
        return this._addCheck({
          kind: "min",
          value: minLength,
          ...errorUtil.errToObj(message)
        });
      }
      max(maxLength, message) {
        return this._addCheck({
          kind: "max",
          value: maxLength,
          ...errorUtil.errToObj(message)
        });
      }
      length(len, message) {
        return this._addCheck({
          kind: "length",
          value: len,
          ...errorUtil.errToObj(message)
        });
      }
      nonempty(message) {
        return this.min(1, errorUtil.errToObj(message));
      }
      trim() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }]
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }]
        });
      }
      toUpperCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toUpperCase" }]
        });
      }
      get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
      }
      get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
      }
      get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
      }
      get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
      }
      get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
      }
      get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
      }
      get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
      }
      get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
      }
      get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
      }
      get isBase64url() {
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
      }
      get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodString.create = (params) => {
      return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodNumber = class _ZodNumber extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
            if (!util3.isInteger(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (floatSafeRemainder(input.data, check.value) !== 0) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "finite") {
            if (!Number.isFinite(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_finite,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util3.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      int(message) {
        return this._addCheck({
          kind: "int",
          message: errorUtil.toString(message)
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      finite(message) {
        return this._addCheck({
          kind: "finite",
          message: errorUtil.toString(message)
        });
      }
      safe(message) {
        return this._addCheck({
          kind: "min",
          inclusive: true,
          value: Number.MIN_SAFE_INTEGER,
          message: errorUtil.toString(message)
        })._addCheck({
          kind: "max",
          inclusive: true,
          value: Number.MAX_SAFE_INTEGER,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util3.isInteger(ch.value));
      }
      get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return Number.isFinite(min) && Number.isFinite(max);
      }
    };
    ZodNumber.create = (params) => {
      return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodBigInt = class _ZodBigInt extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input) {
        if (this._def.coerce) {
          try {
            input.data = BigInt(input.data);
          } catch {
            return this._getInvalidInput(input);
          }
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.bigint) {
          return this._getInvalidInput(input);
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                type: "bigint",
                minimum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                type: "bigint",
                maximum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (input.data % check.value !== BigInt(0)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util3.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _getInvalidInput(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: ctx.parsedType
        });
        return INVALID;
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodBigInt.create = (params) => {
      return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodBoolean = class extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.boolean) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodBoolean.create = (params) => {
      return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodDate = class _ZodDate extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.date,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        if (Number.isNaN(input.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_date
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.getTime() < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                message: check.message,
                inclusive: true,
                exact: false,
                minimum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.getTime() > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                message: check.message,
                inclusive: true,
                exact: false,
                maximum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else {
            util3.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input.data.getTime())
        };
      }
      _addCheck(check) {
        return new _ZodDate({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      min(minDate, message) {
        return this._addCheck({
          kind: "min",
          value: minDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      max(maxDate, message) {
        return this._addCheck({
          kind: "max",
          value: maxDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max != null ? new Date(max) : null;
      }
    };
    ZodDate.create = (params) => {
      return new ZodDate({
        checks: [],
        coerce: params?.coerce || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params)
      });
    };
    ZodSymbol = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.symbol) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.symbol,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodSymbol.create = (params) => {
      return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params)
      });
    };
    ZodUndefined = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodUndefined.create = (params) => {
      return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params)
      });
    };
    ZodNull = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.null) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.null,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodNull.create = (params) => {
      return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params)
      });
    };
    ZodAny = class extends ZodType {
      constructor() {
        super(...arguments);
        this._any = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodAny.create = (params) => {
      return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params)
      });
    };
    ZodUnknown = class extends ZodType {
      constructor() {
        super(...arguments);
        this._unknown = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodUnknown.create = (params) => {
      return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params)
      });
    };
    ZodNever = class extends ZodType {
      _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.never,
          received: ctx.parsedType
        });
        return INVALID;
      }
    };
    ZodNever.create = (params) => {
      return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params)
      });
    };
    ZodVoid = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.void,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodVoid.create = (params) => {
      return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params)
      });
    };
    ZodArray = class _ZodArray extends ZodType {
      _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (def.exactLength !== null) {
          const tooBig = ctx.data.length > def.exactLength.value;
          const tooSmall = ctx.data.length < def.exactLength.value;
          if (tooBig || tooSmall) {
            addIssueToContext(ctx, {
              code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
              minimum: tooSmall ? def.exactLength.value : void 0,
              maximum: tooBig ? def.exactLength.value : void 0,
              type: "array",
              inclusive: true,
              exact: true,
              message: def.exactLength.message
            });
            status.dirty();
          }
        }
        if (def.minLength !== null) {
          if (ctx.data.length < def.minLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.minLength.message
            });
            status.dirty();
          }
        }
        if (def.maxLength !== null) {
          if (ctx.data.length > def.maxLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.maxLength.message
            });
            status.dirty();
          }
        }
        if (ctx.common.async) {
          return Promise.all([...ctx.data].map((item, i) => {
            return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
          })).then((result2) => {
            return ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: { value: minLength, message: errorUtil.toString(message) }
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: { value: maxLength, message: errorUtil.toString(message) }
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: { value: len, message: errorUtil.toString(message) }
        });
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodArray.create = (schema, params) => {
      return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params)
      });
    };
    ZodObject = class _ZodObject extends ZodType {
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null)
          return this._cached;
        const shape = this._def.shape();
        const keys = util3.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] }
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip") {
          } else {
            throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
              alwaysSet: key in ctx.data
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve().then(async () => {
            const syncPairs = [];
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              syncPairs.push({
                key,
                value,
                alwaysSet: pair.alwaysSet
              });
            }
            return syncPairs;
          }).then((syncPairs) => {
            return ParseStatus.mergeObjectSync(status, syncPairs);
          });
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...message !== void 0 ? {
            errorMap: (issue, ctx) => {
              const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: errorUtil.errToObj(message).message ?? defaultError
                };
              return {
                message: defaultError
              };
            }
          } : {}
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip"
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough"
        });
      }
      extend(augmentation) {
        return new _ZodObject({
          ...this._def,
          shape: () => ({
            ...this._def.shape(),
            ...augmentation
          })
        });
      }
      merge(merging) {
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: () => ({
            ...this._def.shape(),
            ...merging._def.shape()
          }),
          typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
      }
      setKey(key, schema) {
        return this.augment({ [key]: schema });
      }
      catchall(index) {
        return new _ZodObject({
          ...this._def,
          catchall: index
        });
      }
      pick(mask) {
        const shape = {};
        for (const key of util3.objectKeys(mask)) {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      omit(mask) {
        const shape = {};
        for (const key of util3.objectKeys(this.shape)) {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      deepPartial() {
        return deepPartialify(this);
      }
      partial(mask) {
        const newShape = {};
        for (const key of util3.objectKeys(this.shape)) {
          const fieldSchema = this.shape[key];
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      required(mask) {
        const newShape = {};
        for (const key of util3.objectKeys(this.shape)) {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      keyof() {
        return createZodEnum(util3.objectKeys(this.shape));
      }
    };
    ZodObject.create = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.strictCreate = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.lazycreate = (shape, params) => {
      return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodUnion = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return Promise.all(options.map(async (option) => {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            return {
              result: await option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: childCtx
              }),
              ctx: childCtx
            };
          })).then(handleResults);
        } else {
          let dirty = void 0;
          const issues = [];
          for (const option of options) {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            const result = option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            });
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map((issues2) => new ZodError(issues2));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    ZodUnion.create = (types, params) => {
      return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params)
      });
    };
    getDiscriminator = (type) => {
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return util3.objectValues(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else if (type instanceof ZodOptional) {
        return [void 0, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
      } else {
        return [];
      }
    };
    ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator]
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      static create(discriminator, options, params) {
        const optionsMap = /* @__PURE__ */ new Map();
        for (const type of options) {
          const discriminatorValues = getDiscriminator(type.shape[discriminator]);
          if (!discriminatorValues.length) {
            throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
          typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
          discriminator,
          options,
          optionsMap,
          ...processCreateParams(params)
        });
      }
    };
    ZodIntersection = class extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
          if (isAborted(parsedLeft) || isAborted(parsedRight)) {
            return INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_intersection_types
            });
            return INVALID;
          }
          if (isDirty(parsedLeft) || isDirty(parsedRight)) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            })
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(this._def.left._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }), this._def.right._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }));
        }
      }
    };
    ZodIntersection.create = (left, right, params) => {
      return new ZodIntersection({
        left,
        right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params)
      });
    };
    ZodTuple = class _ZodTuple extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          status.dirty();
        }
        const items = [...ctx.data].map((item, itemIndex) => {
          const schema = this._def.items[itemIndex] || this._def.rest;
          if (!schema)
            return null;
          return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return ParseStatus.mergeArray(status, results);
          });
        } else {
          return ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest
        });
      }
    };
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params)
      });
    };
    ZodRecord = class _ZodRecord extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
            value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (ctx.common.async) {
          return ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third)
          });
        }
        return new _ZodRecord({
          keyType: ZodString.create(),
          valueType: first,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(second)
        });
      }
    };
    ZodMap = class extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.map) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.map,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
          return {
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
            value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
          };
        });
        if (ctx.common.async) {
          const finalMap = /* @__PURE__ */ new Map();
          return Promise.resolve().then(async () => {
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair of pairs) {
            const key = pair.key;
            const value = pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        }
      }
    };
    ZodMap.create = (keyType, valueType, params) => {
      return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params)
      });
    };
    ZodSet = class _ZodSet extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.set) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.set,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
          if (ctx.data.size < def.minSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.minSize.message
            });
            status.dirty();
          }
        }
        if (def.maxSize !== null) {
          if (ctx.data.size > def.maxSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.maxSize.message
            });
            status.dirty();
          }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted")
              return INVALID;
            if (element.status === "dirty")
              status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) => finalizeSet(elements2));
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: { value: minSize, message: errorUtil.toString(message) }
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: { value: maxSize, message: errorUtil.toString(message) }
        });
      }
      size(size, message) {
        return this.min(size, message).max(size, message);
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodSet.create = (valueType, params) => {
      return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params)
      });
    };
    ZodFunction = class _ZodFunction extends ZodType {
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.function) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.function,
            received: ctx.parsedType
          });
          return INVALID;
        }
        function makeArgsIssue(args, error) {
          return makeIssue({
            data: args,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_arguments,
              argumentsError: error
            }
          });
        }
        function makeReturnsIssue(returns, error) {
          return makeIssue({
            data: returns,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_return_type,
              returnTypeError: error
            }
          });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
          const me = this;
          return OK(async function(...args) {
            const error = new ZodError([]);
            const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
              error.addIssue(makeArgsIssue(args, e));
              throw error;
            });
            const result = await Reflect.apply(fn, this, parsedArgs);
            const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
              error.addIssue(makeReturnsIssue(result, e));
              throw error;
            });
            return parsedReturns;
          });
        } else {
          const me = this;
          return OK(function(...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
            }
            return parsedReturns.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...items) {
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
          args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
          returns: returns || ZodUnknown.create(),
          typeName: ZodFirstPartyTypeKind.ZodFunction,
          ...processCreateParams(params)
        });
      }
    };
    ZodLazy = class extends ZodType {
      get schema() {
        return this._def.getter();
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
      }
    };
    ZodLazy.create = (getter, params) => {
      return new ZodLazy({
        getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params)
      });
    };
    ZodLiteral = class extends ZodType {
      _parse(input) {
        if (input.data !== this._def.value) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_literal,
            expected: this._def.value
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
      get value() {
        return this._def.value;
      }
    };
    ZodLiteral.create = (value, params) => {
      return new ZodLiteral({
        value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params)
      });
    };
    ZodEnum = class _ZodEnum extends ZodType {
      _parse(input) {
        if (typeof input.data !== "string") {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            expected: util3.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(this._def.values);
        }
        if (!this._cache.has(input.data)) {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values, newDef = this._def) {
        return _ZodEnum.create(values, {
          ...this._def,
          ...newDef
        });
      }
      exclude(values, newDef = this._def) {
        return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
          ...this._def,
          ...newDef
        });
      }
    };
    ZodEnum.create = createZodEnum;
    ZodNativeEnum = class extends ZodType {
      _parse(input) {
        const nativeEnumValues = util3.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
          const expectedValues = util3.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            expected: util3.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(util3.getValidEnumValues(this._def.values));
        }
        if (!this._cache.has(input.data)) {
          const expectedValues = util3.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    ZodNativeEnum.create = (values, params) => {
      return new ZodNativeEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params)
      });
    };
    ZodPromise = class extends ZodType {
      unwrap() {
        return this._def.type;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.promise,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return OK(promisified.then((data) => {
          return this._def.type.parseAsync(data, {
            path: ctx.path,
            errorMap: ctx.common.contextualErrorMap
          });
        }));
      }
    };
    ZodPromise.create = (schema, params) => {
      return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params)
      });
    };
    ZodEffects = class extends ZodType {
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
          addIssue: (arg) => {
            addIssueToContext(ctx, arg);
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          },
          get path() {
            return ctx.path;
          }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(processed).then(async (processed2) => {
              if (status.value === "aborted")
                return INVALID;
              const result = await this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx
              });
              if (result.status === "aborted")
                return INVALID;
              if (result.status === "dirty")
                return DIRTY(result.value);
              if (status.value === "dirty")
                return DIRTY(result.value);
              return result;
            });
          } else {
            if (status.value === "aborted")
              return INVALID;
            const result = this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return INVALID;
            if (result.status === "dirty")
              return DIRTY(result.value);
            if (status.value === "dirty")
              return DIRTY(result.value);
            return result;
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = (acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            }
            return acc;
          };
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
              if (inner.status === "aborted")
                return INVALID;
              if (inner.status === "dirty")
                status.dirty();
              return executeRefinement(inner.value).then(() => {
                return { status: status.value, value: inner.value };
              });
            });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (!isValid(base))
              return INVALID;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
              if (!isValid(base))
                return INVALID;
              return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                status: status.value,
                value: result
              }));
            });
          }
        }
        util3.assertNever(effect);
      }
    };
    ZodEffects.create = (schema, effect, params) => {
      return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params)
      });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
      return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params)
      });
    };
    ZodOptional = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.undefined) {
          return OK(void 0);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodOptional.create = (type, params) => {
      return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params)
      });
    };
    ZodNullable = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.null) {
          return OK(null);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodNullable.create = (type, params) => {
      return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params)
      });
    };
    ZodDefault = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    ZodDefault.create = (type, params) => {
      return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params)
      });
    };
    ZodCatch = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const newCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          }
        };
        const result = this._def.innerType._parse({
          data: newCtx.data,
          path: newCtx.path,
          parent: {
            ...newCtx
          }
        });
        if (isAsync(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value: result2.status === "valid" ? result2.value : this._def.catchValue({
                get error() {
                  return new ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          });
        } else {
          return {
            status: "valid",
            value: result.status === "valid" ? result.value : this._def.catchValue({
              get error() {
                return new ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        }
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    ZodCatch.create = (type, params) => {
      return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params)
      });
    };
    ZodNaN = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.nan,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
    };
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params)
      });
    };
    BRAND = Symbol("zod_brand");
    ZodBranded = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    ZodPipeline = class _ZodPipeline extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
          const handleAsync = async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return DIRTY(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          };
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
          in: a,
          out: b,
          typeName: ZodFirstPartyTypeKind.ZodPipeline
        });
      }
    };
    ZodReadonly = class extends ZodType {
      _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = (data) => {
          if (isValid(data)) {
            data.value = Object.freeze(data.value);
          }
          return data;
        };
        return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodReadonly.create = (type, params) => {
      return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params)
      });
    };
    late = {
      object: ZodObject.lazycreate
    };
    (function(ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
    instanceOfType = (cls, params = {
      message: `Input not instance of ${cls.name}`
    }) => custom((data) => data instanceof cls, params);
    stringType = ZodString.create;
    numberType = ZodNumber.create;
    nanType = ZodNaN.create;
    bigIntType = ZodBigInt.create;
    booleanType = ZodBoolean.create;
    dateType = ZodDate.create;
    symbolType = ZodSymbol.create;
    undefinedType = ZodUndefined.create;
    nullType = ZodNull.create;
    anyType = ZodAny.create;
    unknownType = ZodUnknown.create;
    neverType = ZodNever.create;
    voidType = ZodVoid.create;
    arrayType = ZodArray.create;
    objectType = ZodObject.create;
    strictObjectType = ZodObject.strictCreate;
    unionType = ZodUnion.create;
    discriminatedUnionType = ZodDiscriminatedUnion.create;
    intersectionType = ZodIntersection.create;
    tupleType = ZodTuple.create;
    recordType = ZodRecord.create;
    mapType = ZodMap.create;
    setType = ZodSet.create;
    functionType = ZodFunction.create;
    lazyType = ZodLazy.create;
    literalType = ZodLiteral.create;
    enumType = ZodEnum.create;
    nativeEnumType = ZodNativeEnum.create;
    promiseType = ZodPromise.create;
    effectsType = ZodEffects.create;
    optionalType = ZodOptional.create;
    nullableType = ZodNullable.create;
    preprocessType = ZodEffects.createWithPreprocess;
    pipelineType = ZodPipeline.create;
    ostring = () => stringType().optional();
    onumber = () => numberType().optional();
    oboolean = () => booleanType().optional();
    coerce = {
      string: (arg) => ZodString.create({ ...arg, coerce: true }),
      number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
      boolean: (arg) => ZodBoolean.create({
        ...arg,
        coerce: true
      }),
      bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
      date: (arg) => ZodDate.create({ ...arg, coerce: true })
    };
    NEVER = INVALID;
    LATEST_PROTOCOL_VERSION = "2025-06-18";
    SUPPORTED_PROTOCOL_VERSIONS = [
      LATEST_PROTOCOL_VERSION,
      "2025-03-26",
      "2024-11-05",
      "2024-10-07"
    ];
    JSONRPC_VERSION = "2.0";
    ProgressTokenSchema = exports_external.union([exports_external.string(), exports_external.number().int()]);
    CursorSchema = exports_external.string();
    RequestMetaSchema = exports_external.object({
      progressToken: exports_external.optional(ProgressTokenSchema)
    }).passthrough();
    BaseRequestParamsSchema = exports_external.object({
      _meta: exports_external.optional(RequestMetaSchema)
    }).passthrough();
    RequestSchema = exports_external.object({
      method: exports_external.string(),
      params: exports_external.optional(BaseRequestParamsSchema)
    });
    BaseNotificationParamsSchema = exports_external.object({
      _meta: exports_external.optional(exports_external.object({}).passthrough())
    }).passthrough();
    NotificationSchema = exports_external.object({
      method: exports_external.string(),
      params: exports_external.optional(BaseNotificationParamsSchema)
    });
    ResultSchema = exports_external.object({
      _meta: exports_external.optional(exports_external.object({}).passthrough())
    }).passthrough();
    RequestIdSchema = exports_external.union([exports_external.string(), exports_external.number().int()]);
    JSONRPCRequestSchema = exports_external.object({
      jsonrpc: exports_external.literal(JSONRPC_VERSION),
      id: RequestIdSchema
    }).merge(RequestSchema).strict();
    isJSONRPCRequest = (value) => JSONRPCRequestSchema.safeParse(value).success;
    JSONRPCNotificationSchema = exports_external.object({
      jsonrpc: exports_external.literal(JSONRPC_VERSION)
    }).merge(NotificationSchema).strict();
    isJSONRPCNotification = (value) => JSONRPCNotificationSchema.safeParse(value).success;
    JSONRPCResponseSchema = exports_external.object({
      jsonrpc: exports_external.literal(JSONRPC_VERSION),
      id: RequestIdSchema,
      result: ResultSchema
    }).strict();
    isJSONRPCResponse = (value) => JSONRPCResponseSchema.safeParse(value).success;
    (function(ErrorCode2) {
      ErrorCode2[ErrorCode2["ConnectionClosed"] = -32e3] = "ConnectionClosed";
      ErrorCode2[ErrorCode2["RequestTimeout"] = -32001] = "RequestTimeout";
      ErrorCode2[ErrorCode2["ParseError"] = -32700] = "ParseError";
      ErrorCode2[ErrorCode2["InvalidRequest"] = -32600] = "InvalidRequest";
      ErrorCode2[ErrorCode2["MethodNotFound"] = -32601] = "MethodNotFound";
      ErrorCode2[ErrorCode2["InvalidParams"] = -32602] = "InvalidParams";
      ErrorCode2[ErrorCode2["InternalError"] = -32603] = "InternalError";
    })(ErrorCode || (ErrorCode = {}));
    JSONRPCErrorSchema = exports_external.object({
      jsonrpc: exports_external.literal(JSONRPC_VERSION),
      id: RequestIdSchema,
      error: exports_external.object({
        code: exports_external.number().int(),
        message: exports_external.string(),
        data: exports_external.optional(exports_external.unknown())
      })
    }).strict();
    isJSONRPCError = (value) => JSONRPCErrorSchema.safeParse(value).success;
    JSONRPCMessageSchema = exports_external.union([
      JSONRPCRequestSchema,
      JSONRPCNotificationSchema,
      JSONRPCResponseSchema,
      JSONRPCErrorSchema
    ]);
    EmptyResultSchema = ResultSchema.strict();
    CancelledNotificationSchema = NotificationSchema.extend({
      method: exports_external.literal("notifications/cancelled"),
      params: BaseNotificationParamsSchema.extend({
        requestId: RequestIdSchema,
        reason: exports_external.string().optional()
      })
    });
    BaseMetadataSchema = exports_external.object({
      name: exports_external.string(),
      title: exports_external.optional(exports_external.string())
    }).passthrough();
    ImplementationSchema = BaseMetadataSchema.extend({
      version: exports_external.string()
    });
    ClientCapabilitiesSchema = exports_external.object({
      experimental: exports_external.optional(exports_external.object({}).passthrough()),
      sampling: exports_external.optional(exports_external.object({}).passthrough()),
      elicitation: exports_external.optional(exports_external.object({}).passthrough()),
      roots: exports_external.optional(exports_external.object({
        listChanged: exports_external.optional(exports_external.boolean())
      }).passthrough())
    }).passthrough();
    InitializeRequestSchema = RequestSchema.extend({
      method: exports_external.literal("initialize"),
      params: BaseRequestParamsSchema.extend({
        protocolVersion: exports_external.string(),
        capabilities: ClientCapabilitiesSchema,
        clientInfo: ImplementationSchema
      })
    });
    ServerCapabilitiesSchema = exports_external.object({
      experimental: exports_external.optional(exports_external.object({}).passthrough()),
      logging: exports_external.optional(exports_external.object({}).passthrough()),
      completions: exports_external.optional(exports_external.object({}).passthrough()),
      prompts: exports_external.optional(exports_external.object({
        listChanged: exports_external.optional(exports_external.boolean())
      }).passthrough()),
      resources: exports_external.optional(exports_external.object({
        subscribe: exports_external.optional(exports_external.boolean()),
        listChanged: exports_external.optional(exports_external.boolean())
      }).passthrough()),
      tools: exports_external.optional(exports_external.object({
        listChanged: exports_external.optional(exports_external.boolean())
      }).passthrough())
    }).passthrough();
    InitializeResultSchema = ResultSchema.extend({
      protocolVersion: exports_external.string(),
      capabilities: ServerCapabilitiesSchema,
      serverInfo: ImplementationSchema,
      instructions: exports_external.optional(exports_external.string())
    });
    InitializedNotificationSchema = NotificationSchema.extend({
      method: exports_external.literal("notifications/initialized")
    });
    PingRequestSchema = RequestSchema.extend({
      method: exports_external.literal("ping")
    });
    ProgressSchema = exports_external.object({
      progress: exports_external.number(),
      total: exports_external.optional(exports_external.number()),
      message: exports_external.optional(exports_external.string())
    }).passthrough();
    ProgressNotificationSchema = NotificationSchema.extend({
      method: exports_external.literal("notifications/progress"),
      params: BaseNotificationParamsSchema.merge(ProgressSchema).extend({
        progressToken: ProgressTokenSchema
      })
    });
    PaginatedRequestSchema = RequestSchema.extend({
      params: BaseRequestParamsSchema.extend({
        cursor: exports_external.optional(CursorSchema)
      }).optional()
    });
    PaginatedResultSchema = ResultSchema.extend({
      nextCursor: exports_external.optional(CursorSchema)
    });
    ResourceContentsSchema = exports_external.object({
      uri: exports_external.string(),
      mimeType: exports_external.optional(exports_external.string()),
      _meta: exports_external.optional(exports_external.object({}).passthrough())
    }).passthrough();
    TextResourceContentsSchema = ResourceContentsSchema.extend({
      text: exports_external.string()
    });
    Base64Schema = exports_external.string().refine((val) => {
      try {
        atob(val);
        return true;
      } catch (_a) {
        return false;
      }
    }, { message: "Invalid Base64 string" });
    BlobResourceContentsSchema = ResourceContentsSchema.extend({
      blob: Base64Schema
    });
    ResourceSchema = BaseMetadataSchema.extend({
      uri: exports_external.string(),
      description: exports_external.optional(exports_external.string()),
      mimeType: exports_external.optional(exports_external.string()),
      _meta: exports_external.optional(exports_external.object({}).passthrough())
    });
    ResourceTemplateSchema = BaseMetadataSchema.extend({
      uriTemplate: exports_external.string(),
      description: exports_external.optional(exports_external.string()),
      mimeType: exports_external.optional(exports_external.string()),
      _meta: exports_external.optional(exports_external.object({}).passthrough())
    });
    ListResourcesRequestSchema = PaginatedRequestSchema.extend({
      method: exports_external.literal("resources/list")
    });
    ListResourcesResultSchema = PaginatedResultSchema.extend({
      resources: exports_external.array(ResourceSchema)
    });
    ListResourceTemplatesRequestSchema = PaginatedRequestSchema.extend({
      method: exports_external.literal("resources/templates/list")
    });
    ListResourceTemplatesResultSchema = PaginatedResultSchema.extend({
      resourceTemplates: exports_external.array(ResourceTemplateSchema)
    });
    ReadResourceRequestSchema = RequestSchema.extend({
      method: exports_external.literal("resources/read"),
      params: BaseRequestParamsSchema.extend({
        uri: exports_external.string()
      })
    });
    ReadResourceResultSchema = ResultSchema.extend({
      contents: exports_external.array(exports_external.union([TextResourceContentsSchema, BlobResourceContentsSchema]))
    });
    ResourceListChangedNotificationSchema = NotificationSchema.extend({
      method: exports_external.literal("notifications/resources/list_changed")
    });
    SubscribeRequestSchema = RequestSchema.extend({
      method: exports_external.literal("resources/subscribe"),
      params: BaseRequestParamsSchema.extend({
        uri: exports_external.string()
      })
    });
    UnsubscribeRequestSchema = RequestSchema.extend({
      method: exports_external.literal("resources/unsubscribe"),
      params: BaseRequestParamsSchema.extend({
        uri: exports_external.string()
      })
    });
    ResourceUpdatedNotificationSchema = NotificationSchema.extend({
      method: exports_external.literal("notifications/resources/updated"),
      params: BaseNotificationParamsSchema.extend({
        uri: exports_external.string()
      })
    });
    PromptArgumentSchema = exports_external.object({
      name: exports_external.string(),
      description: exports_external.optional(exports_external.string()),
      required: exports_external.optional(exports_external.boolean())
    }).passthrough();
    PromptSchema = BaseMetadataSchema.extend({
      description: exports_external.optional(exports_external.string()),
      arguments: exports_external.optional(exports_external.array(PromptArgumentSchema)),
      _meta: exports_external.optional(exports_external.object({}).passthrough())
    });
    ListPromptsRequestSchema = PaginatedRequestSchema.extend({
      method: exports_external.literal("prompts/list")
    });
    ListPromptsResultSchema = PaginatedResultSchema.extend({
      prompts: exports_external.array(PromptSchema)
    });
    GetPromptRequestSchema = RequestSchema.extend({
      method: exports_external.literal("prompts/get"),
      params: BaseRequestParamsSchema.extend({
        name: exports_external.string(),
        arguments: exports_external.optional(exports_external.record(exports_external.string()))
      })
    });
    TextContentSchema = exports_external.object({
      type: exports_external.literal("text"),
      text: exports_external.string(),
      _meta: exports_external.optional(exports_external.object({}).passthrough())
    }).passthrough();
    ImageContentSchema = exports_external.object({
      type: exports_external.literal("image"),
      data: Base64Schema,
      mimeType: exports_external.string(),
      _meta: exports_external.optional(exports_external.object({}).passthrough())
    }).passthrough();
    AudioContentSchema = exports_external.object({
      type: exports_external.literal("audio"),
      data: Base64Schema,
      mimeType: exports_external.string(),
      _meta: exports_external.optional(exports_external.object({}).passthrough())
    }).passthrough();
    EmbeddedResourceSchema = exports_external.object({
      type: exports_external.literal("resource"),
      resource: exports_external.union([TextResourceContentsSchema, BlobResourceContentsSchema]),
      _meta: exports_external.optional(exports_external.object({}).passthrough())
    }).passthrough();
    ResourceLinkSchema = ResourceSchema.extend({
      type: exports_external.literal("resource_link")
    });
    ContentBlockSchema = exports_external.union([
      TextContentSchema,
      ImageContentSchema,
      AudioContentSchema,
      ResourceLinkSchema,
      EmbeddedResourceSchema
    ]);
    PromptMessageSchema = exports_external.object({
      role: exports_external.enum(["user", "assistant"]),
      content: ContentBlockSchema
    }).passthrough();
    GetPromptResultSchema = ResultSchema.extend({
      description: exports_external.optional(exports_external.string()),
      messages: exports_external.array(PromptMessageSchema)
    });
    PromptListChangedNotificationSchema = NotificationSchema.extend({
      method: exports_external.literal("notifications/prompts/list_changed")
    });
    ToolAnnotationsSchema = exports_external.object({
      title: exports_external.optional(exports_external.string()),
      readOnlyHint: exports_external.optional(exports_external.boolean()),
      destructiveHint: exports_external.optional(exports_external.boolean()),
      idempotentHint: exports_external.optional(exports_external.boolean()),
      openWorldHint: exports_external.optional(exports_external.boolean())
    }).passthrough();
    ToolSchema = BaseMetadataSchema.extend({
      description: exports_external.optional(exports_external.string()),
      inputSchema: exports_external.object({
        type: exports_external.literal("object"),
        properties: exports_external.optional(exports_external.object({}).passthrough()),
        required: exports_external.optional(exports_external.array(exports_external.string()))
      }).passthrough(),
      outputSchema: exports_external.optional(exports_external.object({
        type: exports_external.literal("object"),
        properties: exports_external.optional(exports_external.object({}).passthrough()),
        required: exports_external.optional(exports_external.array(exports_external.string()))
      }).passthrough()),
      annotations: exports_external.optional(ToolAnnotationsSchema),
      _meta: exports_external.optional(exports_external.object({}).passthrough())
    });
    ListToolsRequestSchema = PaginatedRequestSchema.extend({
      method: exports_external.literal("tools/list")
    });
    ListToolsResultSchema = PaginatedResultSchema.extend({
      tools: exports_external.array(ToolSchema)
    });
    CallToolResultSchema = ResultSchema.extend({
      content: exports_external.array(ContentBlockSchema).default([]),
      structuredContent: exports_external.object({}).passthrough().optional(),
      isError: exports_external.optional(exports_external.boolean())
    });
    CompatibilityCallToolResultSchema = CallToolResultSchema.or(ResultSchema.extend({
      toolResult: exports_external.unknown()
    }));
    CallToolRequestSchema = RequestSchema.extend({
      method: exports_external.literal("tools/call"),
      params: BaseRequestParamsSchema.extend({
        name: exports_external.string(),
        arguments: exports_external.optional(exports_external.record(exports_external.unknown()))
      })
    });
    ToolListChangedNotificationSchema = NotificationSchema.extend({
      method: exports_external.literal("notifications/tools/list_changed")
    });
    LoggingLevelSchema = exports_external.enum([
      "debug",
      "info",
      "notice",
      "warning",
      "error",
      "critical",
      "alert",
      "emergency"
    ]);
    SetLevelRequestSchema = RequestSchema.extend({
      method: exports_external.literal("logging/setLevel"),
      params: BaseRequestParamsSchema.extend({
        level: LoggingLevelSchema
      })
    });
    LoggingMessageNotificationSchema = NotificationSchema.extend({
      method: exports_external.literal("notifications/message"),
      params: BaseNotificationParamsSchema.extend({
        level: LoggingLevelSchema,
        logger: exports_external.optional(exports_external.string()),
        data: exports_external.unknown()
      })
    });
    ModelHintSchema = exports_external.object({
      name: exports_external.string().optional()
    }).passthrough();
    ModelPreferencesSchema = exports_external.object({
      hints: exports_external.optional(exports_external.array(ModelHintSchema)),
      costPriority: exports_external.optional(exports_external.number().min(0).max(1)),
      speedPriority: exports_external.optional(exports_external.number().min(0).max(1)),
      intelligencePriority: exports_external.optional(exports_external.number().min(0).max(1))
    }).passthrough();
    SamplingMessageSchema = exports_external.object({
      role: exports_external.enum(["user", "assistant"]),
      content: exports_external.union([TextContentSchema, ImageContentSchema, AudioContentSchema])
    }).passthrough();
    CreateMessageRequestSchema = RequestSchema.extend({
      method: exports_external.literal("sampling/createMessage"),
      params: BaseRequestParamsSchema.extend({
        messages: exports_external.array(SamplingMessageSchema),
        systemPrompt: exports_external.optional(exports_external.string()),
        includeContext: exports_external.optional(exports_external.enum(["none", "thisServer", "allServers"])),
        temperature: exports_external.optional(exports_external.number()),
        maxTokens: exports_external.number().int(),
        stopSequences: exports_external.optional(exports_external.array(exports_external.string())),
        metadata: exports_external.optional(exports_external.object({}).passthrough()),
        modelPreferences: exports_external.optional(ModelPreferencesSchema)
      })
    });
    CreateMessageResultSchema = ResultSchema.extend({
      model: exports_external.string(),
      stopReason: exports_external.optional(exports_external.enum(["endTurn", "stopSequence", "maxTokens"]).or(exports_external.string())),
      role: exports_external.enum(["user", "assistant"]),
      content: exports_external.discriminatedUnion("type", [
        TextContentSchema,
        ImageContentSchema,
        AudioContentSchema
      ])
    });
    BooleanSchemaSchema = exports_external.object({
      type: exports_external.literal("boolean"),
      title: exports_external.optional(exports_external.string()),
      description: exports_external.optional(exports_external.string()),
      default: exports_external.optional(exports_external.boolean())
    }).passthrough();
    StringSchemaSchema = exports_external.object({
      type: exports_external.literal("string"),
      title: exports_external.optional(exports_external.string()),
      description: exports_external.optional(exports_external.string()),
      minLength: exports_external.optional(exports_external.number()),
      maxLength: exports_external.optional(exports_external.number()),
      format: exports_external.optional(exports_external.enum(["email", "uri", "date", "date-time"]))
    }).passthrough();
    NumberSchemaSchema = exports_external.object({
      type: exports_external.enum(["number", "integer"]),
      title: exports_external.optional(exports_external.string()),
      description: exports_external.optional(exports_external.string()),
      minimum: exports_external.optional(exports_external.number()),
      maximum: exports_external.optional(exports_external.number())
    }).passthrough();
    EnumSchemaSchema = exports_external.object({
      type: exports_external.literal("string"),
      title: exports_external.optional(exports_external.string()),
      description: exports_external.optional(exports_external.string()),
      enum: exports_external.array(exports_external.string()),
      enumNames: exports_external.optional(exports_external.array(exports_external.string()))
    }).passthrough();
    PrimitiveSchemaDefinitionSchema = exports_external.union([
      BooleanSchemaSchema,
      StringSchemaSchema,
      NumberSchemaSchema,
      EnumSchemaSchema
    ]);
    ElicitRequestSchema = RequestSchema.extend({
      method: exports_external.literal("elicitation/create"),
      params: BaseRequestParamsSchema.extend({
        message: exports_external.string(),
        requestedSchema: exports_external.object({
          type: exports_external.literal("object"),
          properties: exports_external.record(exports_external.string(), PrimitiveSchemaDefinitionSchema),
          required: exports_external.optional(exports_external.array(exports_external.string()))
        }).passthrough()
      })
    });
    ElicitResultSchema = ResultSchema.extend({
      action: exports_external.enum(["accept", "decline", "cancel"]),
      content: exports_external.optional(exports_external.record(exports_external.string(), exports_external.unknown()))
    });
    ResourceTemplateReferenceSchema = exports_external.object({
      type: exports_external.literal("ref/resource"),
      uri: exports_external.string()
    }).passthrough();
    PromptReferenceSchema = exports_external.object({
      type: exports_external.literal("ref/prompt"),
      name: exports_external.string()
    }).passthrough();
    CompleteRequestSchema = RequestSchema.extend({
      method: exports_external.literal("completion/complete"),
      params: BaseRequestParamsSchema.extend({
        ref: exports_external.union([PromptReferenceSchema, ResourceTemplateReferenceSchema]),
        argument: exports_external.object({
          name: exports_external.string(),
          value: exports_external.string()
        }).passthrough(),
        context: exports_external.optional(exports_external.object({
          arguments: exports_external.optional(exports_external.record(exports_external.string(), exports_external.string()))
        }))
      })
    });
    CompleteResultSchema = ResultSchema.extend({
      completion: exports_external.object({
        values: exports_external.array(exports_external.string()).max(100),
        total: exports_external.optional(exports_external.number().int()),
        hasMore: exports_external.optional(exports_external.boolean())
      }).passthrough()
    });
    RootSchema = exports_external.object({
      uri: exports_external.string().startsWith("file://"),
      name: exports_external.optional(exports_external.string()),
      _meta: exports_external.optional(exports_external.object({}).passthrough())
    }).passthrough();
    ListRootsRequestSchema = RequestSchema.extend({
      method: exports_external.literal("roots/list")
    });
    ListRootsResultSchema = ResultSchema.extend({
      roots: exports_external.array(RootSchema)
    });
    RootsListChangedNotificationSchema = NotificationSchema.extend({
      method: exports_external.literal("notifications/roots/list_changed")
    });
    ClientRequestSchema = exports_external.union([
      PingRequestSchema,
      InitializeRequestSchema,
      CompleteRequestSchema,
      SetLevelRequestSchema,
      GetPromptRequestSchema,
      ListPromptsRequestSchema,
      ListResourcesRequestSchema,
      ListResourceTemplatesRequestSchema,
      ReadResourceRequestSchema,
      SubscribeRequestSchema,
      UnsubscribeRequestSchema,
      CallToolRequestSchema,
      ListToolsRequestSchema
    ]);
    ClientNotificationSchema = exports_external.union([
      CancelledNotificationSchema,
      ProgressNotificationSchema,
      InitializedNotificationSchema,
      RootsListChangedNotificationSchema
    ]);
    ClientResultSchema = exports_external.union([
      EmptyResultSchema,
      CreateMessageResultSchema,
      ElicitResultSchema,
      ListRootsResultSchema
    ]);
    ServerRequestSchema = exports_external.union([
      PingRequestSchema,
      CreateMessageRequestSchema,
      ElicitRequestSchema,
      ListRootsRequestSchema
    ]);
    ServerNotificationSchema = exports_external.union([
      CancelledNotificationSchema,
      ProgressNotificationSchema,
      LoggingMessageNotificationSchema,
      ResourceUpdatedNotificationSchema,
      ResourceListChangedNotificationSchema,
      ToolListChangedNotificationSchema,
      PromptListChangedNotificationSchema
    ]);
    ServerResultSchema = exports_external.union([
      EmptyResultSchema,
      InitializeResultSchema,
      CompleteResultSchema,
      GetPromptResultSchema,
      ListPromptsResultSchema,
      ListResourcesResultSchema,
      ListResourceTemplatesResultSchema,
      ReadResourceResultSchema,
      CallToolResultSchema,
      ListToolsResultSchema
    ]);
    McpError = class extends Error {
      constructor(code, message, data) {
        super(`MCP error ${code}: ${message}`);
        this.code = code;
        this.data = data;
        this.name = "McpError";
      }
    };
    DEFAULT_REQUEST_TIMEOUT_MSEC = 6e4;
    Protocol = class {
      constructor(_options) {
        this._options = _options;
        this._requestMessageId = 0;
        this._requestHandlers = /* @__PURE__ */ new Map();
        this._requestHandlerAbortControllers = /* @__PURE__ */ new Map();
        this._notificationHandlers = /* @__PURE__ */ new Map();
        this._responseHandlers = /* @__PURE__ */ new Map();
        this._progressHandlers = /* @__PURE__ */ new Map();
        this._timeoutInfo = /* @__PURE__ */ new Map();
        this._pendingDebouncedNotifications = /* @__PURE__ */ new Set();
        this.setNotificationHandler(CancelledNotificationSchema, (notification) => {
          const controller = this._requestHandlerAbortControllers.get(notification.params.requestId);
          controller === null || controller === void 0 || controller.abort(notification.params.reason);
        });
        this.setNotificationHandler(ProgressNotificationSchema, (notification) => {
          this._onprogress(notification);
        });
        this.setRequestHandler(PingRequestSchema, (_request) => ({}));
      }
      _setupTimeout(messageId, timeout, maxTotalTimeout, onTimeout, resetTimeoutOnProgress = false) {
        this._timeoutInfo.set(messageId, {
          timeoutId: setTimeout(onTimeout, timeout),
          startTime: Date.now(),
          timeout,
          maxTotalTimeout,
          resetTimeoutOnProgress,
          onTimeout
        });
      }
      _resetTimeout(messageId) {
        const info = this._timeoutInfo.get(messageId);
        if (!info)
          return false;
        const totalElapsed = Date.now() - info.startTime;
        if (info.maxTotalTimeout && totalElapsed >= info.maxTotalTimeout) {
          this._timeoutInfo.delete(messageId);
          throw new McpError(ErrorCode.RequestTimeout, "Maximum total timeout exceeded", { maxTotalTimeout: info.maxTotalTimeout, totalElapsed });
        }
        clearTimeout(info.timeoutId);
        info.timeoutId = setTimeout(info.onTimeout, info.timeout);
        return true;
      }
      _cleanupTimeout(messageId) {
        const info = this._timeoutInfo.get(messageId);
        if (info) {
          clearTimeout(info.timeoutId);
          this._timeoutInfo.delete(messageId);
        }
      }
      async connect(transport) {
        var _a, _b, _c;
        this._transport = transport;
        const _onclose = (_a = this.transport) === null || _a === void 0 ? void 0 : _a.onclose;
        this._transport.onclose = () => {
          _onclose === null || _onclose === void 0 || _onclose();
          this._onclose();
        };
        const _onerror = (_b = this.transport) === null || _b === void 0 ? void 0 : _b.onerror;
        this._transport.onerror = (error) => {
          _onerror === null || _onerror === void 0 || _onerror(error);
          this._onerror(error);
        };
        const _onmessage = (_c = this._transport) === null || _c === void 0 ? void 0 : _c.onmessage;
        this._transport.onmessage = (message, extra) => {
          _onmessage === null || _onmessage === void 0 || _onmessage(message, extra);
          if (isJSONRPCResponse(message) || isJSONRPCError(message)) {
            this._onresponse(message);
          } else if (isJSONRPCRequest(message)) {
            this._onrequest(message, extra);
          } else if (isJSONRPCNotification(message)) {
            this._onnotification(message);
          } else {
            this._onerror(new Error(`Unknown message type: ${JSON.stringify(message)}`));
          }
        };
        await this._transport.start();
      }
      _onclose() {
        var _a;
        const responseHandlers = this._responseHandlers;
        this._responseHandlers = /* @__PURE__ */ new Map();
        this._progressHandlers.clear();
        this._pendingDebouncedNotifications.clear();
        this._transport = void 0;
        (_a = this.onclose) === null || _a === void 0 || _a.call(this);
        const error = new McpError(ErrorCode.ConnectionClosed, "Connection closed");
        for (const handler of responseHandlers.values()) {
          handler(error);
        }
      }
      _onerror(error) {
        var _a;
        (_a = this.onerror) === null || _a === void 0 || _a.call(this, error);
      }
      _onnotification(notification) {
        var _a;
        const handler = (_a = this._notificationHandlers.get(notification.method)) !== null && _a !== void 0 ? _a : this.fallbackNotificationHandler;
        if (handler === void 0) {
          return;
        }
        Promise.resolve().then(() => handler(notification)).catch((error) => this._onerror(new Error(`Uncaught error in notification handler: ${error}`)));
      }
      _onrequest(request, extra) {
        var _a, _b;
        const handler = (_a = this._requestHandlers.get(request.method)) !== null && _a !== void 0 ? _a : this.fallbackRequestHandler;
        const capturedTransport = this._transport;
        if (handler === void 0) {
          capturedTransport === null || capturedTransport === void 0 || capturedTransport.send({
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: ErrorCode.MethodNotFound,
              message: "Method not found"
            }
          }).catch((error) => this._onerror(new Error(`Failed to send an error response: ${error}`)));
          return;
        }
        const abortController = new AbortController();
        this._requestHandlerAbortControllers.set(request.id, abortController);
        const fullExtra = {
          signal: abortController.signal,
          sessionId: capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.sessionId,
          _meta: (_b = request.params) === null || _b === void 0 ? void 0 : _b._meta,
          sendNotification: (notification) => this.notification(notification, { relatedRequestId: request.id }),
          sendRequest: (r, resultSchema, options) => this.request(r, resultSchema, { ...options, relatedRequestId: request.id }),
          authInfo: extra === null || extra === void 0 ? void 0 : extra.authInfo,
          requestId: request.id,
          requestInfo: extra === null || extra === void 0 ? void 0 : extra.requestInfo
        };
        Promise.resolve().then(() => handler(request, fullExtra)).then((result) => {
          if (abortController.signal.aborted) {
            return;
          }
          return capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.send({
            result,
            jsonrpc: "2.0",
            id: request.id
          });
        }, (error) => {
          var _a2;
          if (abortController.signal.aborted) {
            return;
          }
          return capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.send({
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: Number.isSafeInteger(error["code"]) ? error["code"] : ErrorCode.InternalError,
              message: (_a2 = error.message) !== null && _a2 !== void 0 ? _a2 : "Internal error"
            }
          });
        }).catch((error) => this._onerror(new Error(`Failed to send response: ${error}`))).finally(() => {
          this._requestHandlerAbortControllers.delete(request.id);
        });
      }
      _onprogress(notification) {
        const { progressToken, ...params } = notification.params;
        const messageId = Number(progressToken);
        const handler = this._progressHandlers.get(messageId);
        if (!handler) {
          this._onerror(new Error(`Received a progress notification for an unknown token: ${JSON.stringify(notification)}`));
          return;
        }
        const responseHandler = this._responseHandlers.get(messageId);
        const timeoutInfo = this._timeoutInfo.get(messageId);
        if (timeoutInfo && responseHandler && timeoutInfo.resetTimeoutOnProgress) {
          try {
            this._resetTimeout(messageId);
          } catch (error) {
            responseHandler(error);
            return;
          }
        }
        handler(params);
      }
      _onresponse(response) {
        const messageId = Number(response.id);
        const handler = this._responseHandlers.get(messageId);
        if (handler === void 0) {
          this._onerror(new Error(`Received a response for an unknown message ID: ${JSON.stringify(response)}`));
          return;
        }
        this._responseHandlers.delete(messageId);
        this._progressHandlers.delete(messageId);
        this._cleanupTimeout(messageId);
        if (isJSONRPCResponse(response)) {
          handler(response);
        } else {
          const error = new McpError(response.error.code, response.error.message, response.error.data);
          handler(error);
        }
      }
      get transport() {
        return this._transport;
      }
      async close() {
        var _a;
        await ((_a = this._transport) === null || _a === void 0 ? void 0 : _a.close());
      }
      request(request, resultSchema, options) {
        const { relatedRequestId, resumptionToken, onresumptiontoken } = options !== null && options !== void 0 ? options : {};
        return new Promise((resolve, reject) => {
          var _a, _b, _c, _d, _e, _f;
          if (!this._transport) {
            reject(new Error("Not connected"));
            return;
          }
          if (((_a = this._options) === null || _a === void 0 ? void 0 : _a.enforceStrictCapabilities) === true) {
            this.assertCapabilityForMethod(request.method);
          }
          (_b = options === null || options === void 0 ? void 0 : options.signal) === null || _b === void 0 || _b.throwIfAborted();
          const messageId = this._requestMessageId++;
          const jsonrpcRequest = {
            ...request,
            jsonrpc: "2.0",
            id: messageId
          };
          if (options === null || options === void 0 ? void 0 : options.onprogress) {
            this._progressHandlers.set(messageId, options.onprogress);
            jsonrpcRequest.params = {
              ...request.params,
              _meta: {
                ...((_c = request.params) === null || _c === void 0 ? void 0 : _c._meta) || {},
                progressToken: messageId
              }
            };
          }
          const cancel = (reason) => {
            var _a2;
            this._responseHandlers.delete(messageId);
            this._progressHandlers.delete(messageId);
            this._cleanupTimeout(messageId);
            (_a2 = this._transport) === null || _a2 === void 0 || _a2.send({
              jsonrpc: "2.0",
              method: "notifications/cancelled",
              params: {
                requestId: messageId,
                reason: String(reason)
              }
            }, { relatedRequestId, resumptionToken, onresumptiontoken }).catch((error) => this._onerror(new Error(`Failed to send cancellation: ${error}`)));
            reject(reason);
          };
          this._responseHandlers.set(messageId, (response) => {
            var _a2;
            if ((_a2 = options === null || options === void 0 ? void 0 : options.signal) === null || _a2 === void 0 ? void 0 : _a2.aborted) {
              return;
            }
            if (response instanceof Error) {
              return reject(response);
            }
            try {
              const result = resultSchema.parse(response.result);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });
          (_d = options === null || options === void 0 ? void 0 : options.signal) === null || _d === void 0 || _d.addEventListener("abort", () => {
            var _a2;
            cancel((_a2 = options === null || options === void 0 ? void 0 : options.signal) === null || _a2 === void 0 ? void 0 : _a2.reason);
          });
          const timeout = (_e = options === null || options === void 0 ? void 0 : options.timeout) !== null && _e !== void 0 ? _e : DEFAULT_REQUEST_TIMEOUT_MSEC;
          const timeoutHandler = () => cancel(new McpError(ErrorCode.RequestTimeout, "Request timed out", { timeout }));
          this._setupTimeout(messageId, timeout, options === null || options === void 0 ? void 0 : options.maxTotalTimeout, timeoutHandler, (_f = options === null || options === void 0 ? void 0 : options.resetTimeoutOnProgress) !== null && _f !== void 0 ? _f : false);
          this._transport.send(jsonrpcRequest, { relatedRequestId, resumptionToken, onresumptiontoken }).catch((error) => {
            this._cleanupTimeout(messageId);
            reject(error);
          });
        });
      }
      async notification(notification, options) {
        var _a, _b;
        if (!this._transport) {
          throw new Error("Not connected");
        }
        this.assertNotificationCapability(notification.method);
        const debouncedMethods = (_b = (_a = this._options) === null || _a === void 0 ? void 0 : _a.debouncedNotificationMethods) !== null && _b !== void 0 ? _b : [];
        const canDebounce = debouncedMethods.includes(notification.method) && !notification.params && !(options === null || options === void 0 ? void 0 : options.relatedRequestId);
        if (canDebounce) {
          if (this._pendingDebouncedNotifications.has(notification.method)) {
            return;
          }
          this._pendingDebouncedNotifications.add(notification.method);
          Promise.resolve().then(() => {
            var _a2;
            this._pendingDebouncedNotifications.delete(notification.method);
            if (!this._transport) {
              return;
            }
            const jsonrpcNotification2 = {
              ...notification,
              jsonrpc: "2.0"
            };
            (_a2 = this._transport) === null || _a2 === void 0 || _a2.send(jsonrpcNotification2, options).catch((error) => this._onerror(error));
          });
          return;
        }
        const jsonrpcNotification = {
          ...notification,
          jsonrpc: "2.0"
        };
        await this._transport.send(jsonrpcNotification, options);
      }
      setRequestHandler(requestSchema, handler) {
        const method = requestSchema.shape.method.value;
        this.assertRequestHandlerCapability(method);
        this._requestHandlers.set(method, (request, extra) => {
          return Promise.resolve(handler(requestSchema.parse(request), extra));
        });
      }
      removeRequestHandler(method) {
        this._requestHandlers.delete(method);
      }
      assertCanSetRequestHandler(method) {
        if (this._requestHandlers.has(method)) {
          throw new Error(`A request handler for ${method} already exists, which would be overridden`);
        }
      }
      setNotificationHandler(notificationSchema, handler) {
        this._notificationHandlers.set(notificationSchema.shape.method.value, (notification) => Promise.resolve(handler(notificationSchema.parse(notification))));
      }
      removeNotificationHandler(method) {
        this._notificationHandlers.delete(method);
      }
    };
    import_ajv = __toESM2(require_ajv(), 1);
    Server = class extends Protocol {
      constructor(_serverInfo, options) {
        var _a;
        super(options);
        this._serverInfo = _serverInfo;
        this._capabilities = (_a = options === null || options === void 0 ? void 0 : options.capabilities) !== null && _a !== void 0 ? _a : {};
        this._instructions = options === null || options === void 0 ? void 0 : options.instructions;
        this.setRequestHandler(InitializeRequestSchema, (request) => this._oninitialize(request));
        this.setNotificationHandler(InitializedNotificationSchema, () => {
          var _a2;
          return (_a2 = this.oninitialized) === null || _a2 === void 0 ? void 0 : _a2.call(this);
        });
      }
      registerCapabilities(capabilities) {
        if (this.transport) {
          throw new Error("Cannot register capabilities after connecting to transport");
        }
        this._capabilities = mergeCapabilities(this._capabilities, capabilities);
      }
      assertCapabilityForMethod(method) {
        var _a, _b, _c;
        switch (method) {
          case "sampling/createMessage":
            if (!((_a = this._clientCapabilities) === null || _a === void 0 ? void 0 : _a.sampling)) {
              throw new Error(`Client does not support sampling (required for ${method})`);
            }
            break;
          case "elicitation/create":
            if (!((_b = this._clientCapabilities) === null || _b === void 0 ? void 0 : _b.elicitation)) {
              throw new Error(`Client does not support elicitation (required for ${method})`);
            }
            break;
          case "roots/list":
            if (!((_c = this._clientCapabilities) === null || _c === void 0 ? void 0 : _c.roots)) {
              throw new Error(`Client does not support listing roots (required for ${method})`);
            }
            break;
          case "ping":
            break;
        }
      }
      assertNotificationCapability(method) {
        switch (method) {
          case "notifications/message":
            if (!this._capabilities.logging) {
              throw new Error(`Server does not support logging (required for ${method})`);
            }
            break;
          case "notifications/resources/updated":
          case "notifications/resources/list_changed":
            if (!this._capabilities.resources) {
              throw new Error(`Server does not support notifying about resources (required for ${method})`);
            }
            break;
          case "notifications/tools/list_changed":
            if (!this._capabilities.tools) {
              throw new Error(`Server does not support notifying of tool list changes (required for ${method})`);
            }
            break;
          case "notifications/prompts/list_changed":
            if (!this._capabilities.prompts) {
              throw new Error(`Server does not support notifying of prompt list changes (required for ${method})`);
            }
            break;
          case "notifications/cancelled":
            break;
          case "notifications/progress":
            break;
        }
      }
      assertRequestHandlerCapability(method) {
        switch (method) {
          case "sampling/createMessage":
            if (!this._capabilities.sampling) {
              throw new Error(`Server does not support sampling (required for ${method})`);
            }
            break;
          case "logging/setLevel":
            if (!this._capabilities.logging) {
              throw new Error(`Server does not support logging (required for ${method})`);
            }
            break;
          case "prompts/get":
          case "prompts/list":
            if (!this._capabilities.prompts) {
              throw new Error(`Server does not support prompts (required for ${method})`);
            }
            break;
          case "resources/list":
          case "resources/templates/list":
          case "resources/read":
            if (!this._capabilities.resources) {
              throw new Error(`Server does not support resources (required for ${method})`);
            }
            break;
          case "tools/call":
          case "tools/list":
            if (!this._capabilities.tools) {
              throw new Error(`Server does not support tools (required for ${method})`);
            }
            break;
          case "ping":
          case "initialize":
            break;
        }
      }
      async _oninitialize(request) {
        const requestedVersion = request.params.protocolVersion;
        this._clientCapabilities = request.params.capabilities;
        this._clientVersion = request.params.clientInfo;
        const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requestedVersion) ? requestedVersion : LATEST_PROTOCOL_VERSION;
        return {
          protocolVersion,
          capabilities: this.getCapabilities(),
          serverInfo: this._serverInfo,
          ...this._instructions && { instructions: this._instructions }
        };
      }
      getClientCapabilities() {
        return this._clientCapabilities;
      }
      getClientVersion() {
        return this._clientVersion;
      }
      getCapabilities() {
        return this._capabilities;
      }
      async ping() {
        return this.request({ method: "ping" }, EmptyResultSchema);
      }
      async createMessage(params, options) {
        return this.request({ method: "sampling/createMessage", params }, CreateMessageResultSchema, options);
      }
      async elicitInput(params, options) {
        const result = await this.request({ method: "elicitation/create", params }, ElicitResultSchema, options);
        if (result.action === "accept" && result.content) {
          try {
            const ajv = new import_ajv.default();
            const validate = ajv.compile(params.requestedSchema);
            const isValid2 = validate(result.content);
            if (!isValid2) {
              throw new McpError(ErrorCode.InvalidParams, `Elicitation response content does not match requested schema: ${ajv.errorsText(validate.errors)}`);
            }
          } catch (error) {
            if (error instanceof McpError) {
              throw error;
            }
            throw new McpError(ErrorCode.InternalError, `Error validating elicitation response: ${error}`);
          }
        }
        return result;
      }
      async listRoots(params, options) {
        return this.request({ method: "roots/list", params }, ListRootsResultSchema, options);
      }
      async sendLoggingMessage(params) {
        return this.notification({ method: "notifications/message", params });
      }
      async sendResourceUpdated(params) {
        return this.notification({
          method: "notifications/resources/updated",
          params
        });
      }
      async sendResourceListChanged() {
        return this.notification({
          method: "notifications/resources/list_changed"
        });
      }
      async sendToolListChanged() {
        return this.notification({ method: "notifications/tools/list_changed" });
      }
      async sendPromptListChanged() {
        return this.notification({ method: "notifications/prompts/list_changed" });
      }
    };
    ignoreOverride = Symbol("Let zodToJsonSchema decide on which parser to use");
    defaultOptions = {
      name: void 0,
      $refStrategy: "root",
      basePath: ["#"],
      effectStrategy: "input",
      pipeStrategy: "all",
      dateStrategy: "format:date-time",
      mapStrategy: "entries",
      removeAdditionalStrategy: "passthrough",
      allowedAdditionalProperties: true,
      rejectedAdditionalProperties: false,
      definitionPath: "definitions",
      target: "jsonSchema7",
      strictUnions: false,
      definitions: {},
      errorMessages: false,
      markdownDescription: false,
      patternStrategy: "escape",
      applyRegexFlags: false,
      emailStrategy: "format:email",
      base64Strategy: "contentEncoding:base64",
      nameStrategy: "ref"
    };
    getDefaultOptions = (options) => typeof options === "string" ? {
      ...defaultOptions,
      name: options
    } : {
      ...defaultOptions,
      ...options
    };
    getRefs = (options) => {
      const _options = getDefaultOptions(options);
      const currentPath = _options.name !== void 0 ? [..._options.basePath, _options.definitionPath, _options.name] : _options.basePath;
      return {
        ..._options,
        currentPath,
        propertyPath: void 0,
        seen: new Map(Object.entries(_options.definitions).map(([name, def]) => [
          def._def,
          {
            def: def._def,
            path: [..._options.basePath, _options.definitionPath, name],
            jsonSchema: void 0
          }
        ]))
      };
    };
    parseCatchDef = (def, refs) => {
      return parseDef(def.innerType._def, refs);
    };
    integerDateParser = (def, refs) => {
      const res = {
        type: "integer",
        format: "unix-time"
      };
      if (refs.target === "openApi3") {
        return res;
      }
      for (const check of def.checks) {
        switch (check.kind) {
          case "min":
            setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
            break;
          case "max":
            setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
            break;
        }
      }
      return res;
    };
    isJsonSchema7AllOfType = (type) => {
      if ("type" in type && type.type === "string")
        return false;
      return "allOf" in type;
    };
    emojiRegex2 = void 0;
    zodPatterns = {
      cuid: /^[cC][^\s-]{8,}$/,
      cuid2: /^[0-9a-z]+$/,
      ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
      email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
      emoji: () => {
        if (emojiRegex2 === void 0) {
          emojiRegex2 = RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u");
        }
        return emojiRegex2;
      },
      uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
      ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
      ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
      ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
      ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
      base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
      base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
      nanoid: /^[a-zA-Z0-9_-]{21}$/,
      jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
    };
    ALPHA_NUMERIC = new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
    primitiveMappings = {
      ZodString: "string",
      ZodNumber: "number",
      ZodBigInt: "integer",
      ZodBoolean: "boolean",
      ZodNull: "null"
    };
    asAnyOf = (def, refs) => {
      const anyOf = (def.options instanceof Map ? Array.from(def.options.values()) : def.options).map((x, i) => parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "anyOf", `${i}`]
      })).filter((x) => !!x && (!refs.strictUnions || typeof x === "object" && Object.keys(x).length > 0));
      return anyOf.length ? { anyOf } : void 0;
    };
    parseOptionalDef = (def, refs) => {
      if (refs.currentPath.toString() === refs.propertyPath?.toString()) {
        return parseDef(def.innerType._def, refs);
      }
      const innerSchema = parseDef(def.innerType._def, {
        ...refs,
        currentPath: [...refs.currentPath, "anyOf", "1"]
      });
      return innerSchema ? {
        anyOf: [
          {
            not: {}
          },
          innerSchema
        ]
      } : {};
    };
    parsePipelineDef = (def, refs) => {
      if (refs.pipeStrategy === "input") {
        return parseDef(def.in._def, refs);
      } else if (refs.pipeStrategy === "output") {
        return parseDef(def.out._def, refs);
      }
      const a = parseDef(def.in._def, {
        ...refs,
        currentPath: [...refs.currentPath, "allOf", "0"]
      });
      const b = parseDef(def.out._def, {
        ...refs,
        currentPath: [...refs.currentPath, "allOf", a ? "1" : "0"]
      });
      return {
        allOf: [a, b].filter((x) => x !== void 0)
      };
    };
    parseReadonlyDef = (def, refs) => {
      return parseDef(def.innerType._def, refs);
    };
    selectParser = (def, typeName, refs) => {
      switch (typeName) {
        case ZodFirstPartyTypeKind.ZodString:
          return parseStringDef(def, refs);
        case ZodFirstPartyTypeKind.ZodNumber:
          return parseNumberDef(def, refs);
        case ZodFirstPartyTypeKind.ZodObject:
          return parseObjectDef(def, refs);
        case ZodFirstPartyTypeKind.ZodBigInt:
          return parseBigintDef(def, refs);
        case ZodFirstPartyTypeKind.ZodBoolean:
          return parseBooleanDef();
        case ZodFirstPartyTypeKind.ZodDate:
          return parseDateDef(def, refs);
        case ZodFirstPartyTypeKind.ZodUndefined:
          return parseUndefinedDef();
        case ZodFirstPartyTypeKind.ZodNull:
          return parseNullDef(refs);
        case ZodFirstPartyTypeKind.ZodArray:
          return parseArrayDef(def, refs);
        case ZodFirstPartyTypeKind.ZodUnion:
        case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
          return parseUnionDef(def, refs);
        case ZodFirstPartyTypeKind.ZodIntersection:
          return parseIntersectionDef(def, refs);
        case ZodFirstPartyTypeKind.ZodTuple:
          return parseTupleDef(def, refs);
        case ZodFirstPartyTypeKind.ZodRecord:
          return parseRecordDef(def, refs);
        case ZodFirstPartyTypeKind.ZodLiteral:
          return parseLiteralDef(def, refs);
        case ZodFirstPartyTypeKind.ZodEnum:
          return parseEnumDef(def);
        case ZodFirstPartyTypeKind.ZodNativeEnum:
          return parseNativeEnumDef(def);
        case ZodFirstPartyTypeKind.ZodNullable:
          return parseNullableDef(def, refs);
        case ZodFirstPartyTypeKind.ZodOptional:
          return parseOptionalDef(def, refs);
        case ZodFirstPartyTypeKind.ZodMap:
          return parseMapDef(def, refs);
        case ZodFirstPartyTypeKind.ZodSet:
          return parseSetDef(def, refs);
        case ZodFirstPartyTypeKind.ZodLazy:
          return () => def.getter()._def;
        case ZodFirstPartyTypeKind.ZodPromise:
          return parsePromiseDef(def, refs);
        case ZodFirstPartyTypeKind.ZodNaN:
        case ZodFirstPartyTypeKind.ZodNever:
          return parseNeverDef();
        case ZodFirstPartyTypeKind.ZodEffects:
          return parseEffectsDef(def, refs);
        case ZodFirstPartyTypeKind.ZodAny:
          return parseAnyDef();
        case ZodFirstPartyTypeKind.ZodUnknown:
          return parseUnknownDef();
        case ZodFirstPartyTypeKind.ZodDefault:
          return parseDefaultDef(def, refs);
        case ZodFirstPartyTypeKind.ZodBranded:
          return parseBrandedDef(def, refs);
        case ZodFirstPartyTypeKind.ZodReadonly:
          return parseReadonlyDef(def, refs);
        case ZodFirstPartyTypeKind.ZodCatch:
          return parseCatchDef(def, refs);
        case ZodFirstPartyTypeKind.ZodPipeline:
          return parsePipelineDef(def, refs);
        case ZodFirstPartyTypeKind.ZodFunction:
        case ZodFirstPartyTypeKind.ZodVoid:
        case ZodFirstPartyTypeKind.ZodSymbol:
          return;
        default:
          return /* @__PURE__ */ ((_) => {
            return;
          })(typeName);
      }
    };
    get$ref = (item, refs) => {
      switch (refs.$refStrategy) {
        case "root":
          return { $ref: item.path.join("/") };
        case "relative":
          return { $ref: getRelativePath(refs.currentPath, item.path) };
        case "none":
        case "seen": {
          if (item.path.length < refs.currentPath.length && item.path.every((value, index) => refs.currentPath[index] === value)) {
            console.warn(`Recursive reference detected at ${refs.currentPath.join("/")}! Defaulting to any`);
            return {};
          }
          return refs.$refStrategy === "seen" ? {} : void 0;
        }
      }
    };
    getRelativePath = (pathA, pathB) => {
      let i = 0;
      for (; i < pathA.length && i < pathB.length; i++) {
        if (pathA[i] !== pathB[i])
          break;
      }
      return [(pathA.length - i).toString(), ...pathB.slice(i)].join("/");
    };
    addMeta = (def, refs, jsonSchema) => {
      if (def.description) {
        jsonSchema.description = def.description;
        if (refs.markdownDescription) {
          jsonSchema.markdownDescription = def.description;
        }
      }
      return jsonSchema;
    };
    zodToJsonSchema = (schema, options) => {
      const refs = getRefs(options);
      const definitions = typeof options === "object" && options.definitions ? Object.entries(options.definitions).reduce((acc, [name2, schema2]) => ({
        ...acc,
        [name2]: parseDef(schema2._def, {
          ...refs,
          currentPath: [...refs.basePath, refs.definitionPath, name2]
        }, true) ?? {}
      }), {}) : void 0;
      const name = typeof options === "string" ? options : options?.nameStrategy === "title" ? void 0 : options?.name;
      const main2 = parseDef(schema._def, name === void 0 ? refs : {
        ...refs,
        currentPath: [...refs.basePath, refs.definitionPath, name]
      }, false) ?? {};
      const title = typeof options === "object" && options.name !== void 0 && options.nameStrategy === "title" ? options.name : void 0;
      if (title !== void 0) {
        main2.title = title;
      }
      const combined = name === void 0 ? definitions ? {
        ...main2,
        [refs.definitionPath]: definitions
      } : main2 : {
        $ref: [
          ...refs.$refStrategy === "relative" ? [] : refs.basePath,
          refs.definitionPath,
          name
        ].join("/"),
        [refs.definitionPath]: {
          ...definitions,
          [name]: main2
        }
      };
      if (refs.target === "jsonSchema7") {
        combined.$schema = "http://json-schema.org/draft-07/schema#";
      } else if (refs.target === "jsonSchema2019-09" || refs.target === "openAi") {
        combined.$schema = "https://json-schema.org/draft/2019-09/schema#";
      }
      if (refs.target === "openAi" && ("anyOf" in combined || "oneOf" in combined || "allOf" in combined || "type" in combined && Array.isArray(combined.type))) {
        console.warn("Warning: OpenAI may not support schemas with unions as roots! Try wrapping it in an object property.");
      }
      return combined;
    };
    (function(McpZodTypeKind2) {
      McpZodTypeKind2["Completable"] = "McpCompletable";
    })(McpZodTypeKind || (McpZodTypeKind = {}));
    Completable = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    Completable.create = (type, params) => {
      return new Completable({
        type,
        typeName: McpZodTypeKind.Completable,
        complete: params.complete,
        ...processCreateParams2(params)
      });
    };
    McpServer = class {
      constructor(serverInfo, options) {
        this._registeredResources = {};
        this._registeredResourceTemplates = {};
        this._registeredTools = {};
        this._registeredPrompts = {};
        this._toolHandlersInitialized = false;
        this._completionHandlerInitialized = false;
        this._resourceHandlersInitialized = false;
        this._promptHandlersInitialized = false;
        this.server = new Server(serverInfo, options);
      }
      async connect(transport) {
        return await this.server.connect(transport);
      }
      async close() {
        await this.server.close();
      }
      setToolRequestHandlers() {
        if (this._toolHandlersInitialized) {
          return;
        }
        this.server.assertCanSetRequestHandler(ListToolsRequestSchema.shape.method.value);
        this.server.assertCanSetRequestHandler(CallToolRequestSchema.shape.method.value);
        this.server.registerCapabilities({
          tools: {
            listChanged: true
          }
        });
        this.server.setRequestHandler(ListToolsRequestSchema, () => ({
          tools: Object.entries(this._registeredTools).filter(([, tool2]) => tool2.enabled).map(([name, tool2]) => {
            const toolDefinition = {
              name,
              title: tool2.title,
              description: tool2.description,
              inputSchema: tool2.inputSchema ? zodToJsonSchema(tool2.inputSchema, {
                strictUnions: true
              }) : EMPTY_OBJECT_JSON_SCHEMA,
              annotations: tool2.annotations
            };
            if (tool2.outputSchema) {
              toolDefinition.outputSchema = zodToJsonSchema(tool2.outputSchema, { strictUnions: true });
            }
            return toolDefinition;
          })
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
          const tool2 = this._registeredTools[request.params.name];
          if (!tool2) {
            throw new McpError(ErrorCode.InvalidParams, `Tool ${request.params.name} not found`);
          }
          if (!tool2.enabled) {
            throw new McpError(ErrorCode.InvalidParams, `Tool ${request.params.name} disabled`);
          }
          let result;
          if (tool2.inputSchema) {
            const parseResult = await tool2.inputSchema.safeParseAsync(request.params.arguments);
            if (!parseResult.success) {
              throw new McpError(ErrorCode.InvalidParams, `Invalid arguments for tool ${request.params.name}: ${parseResult.error.message}`);
            }
            const args = parseResult.data;
            const cb = tool2.callback;
            try {
              result = await Promise.resolve(cb(args, extra));
            } catch (error) {
              result = {
                content: [
                  {
                    type: "text",
                    text: error instanceof Error ? error.message : String(error)
                  }
                ],
                isError: true
              };
            }
          } else {
            const cb = tool2.callback;
            try {
              result = await Promise.resolve(cb(extra));
            } catch (error) {
              result = {
                content: [
                  {
                    type: "text",
                    text: error instanceof Error ? error.message : String(error)
                  }
                ],
                isError: true
              };
            }
          }
          if (tool2.outputSchema && !result.isError) {
            if (!result.structuredContent) {
              throw new McpError(ErrorCode.InvalidParams, `Tool ${request.params.name} has an output schema but no structured content was provided`);
            }
            const parseResult = await tool2.outputSchema.safeParseAsync(result.structuredContent);
            if (!parseResult.success) {
              throw new McpError(ErrorCode.InvalidParams, `Invalid structured content for tool ${request.params.name}: ${parseResult.error.message}`);
            }
          }
          return result;
        });
        this._toolHandlersInitialized = true;
      }
      setCompletionRequestHandler() {
        if (this._completionHandlerInitialized) {
          return;
        }
        this.server.assertCanSetRequestHandler(CompleteRequestSchema.shape.method.value);
        this.server.registerCapabilities({
          completions: {}
        });
        this.server.setRequestHandler(CompleteRequestSchema, async (request) => {
          switch (request.params.ref.type) {
            case "ref/prompt":
              return this.handlePromptCompletion(request, request.params.ref);
            case "ref/resource":
              return this.handleResourceCompletion(request, request.params.ref);
            default:
              throw new McpError(ErrorCode.InvalidParams, `Invalid completion reference: ${request.params.ref}`);
          }
        });
        this._completionHandlerInitialized = true;
      }
      async handlePromptCompletion(request, ref) {
        const prompt = this._registeredPrompts[ref.name];
        if (!prompt) {
          throw new McpError(ErrorCode.InvalidParams, `Prompt ${ref.name} not found`);
        }
        if (!prompt.enabled) {
          throw new McpError(ErrorCode.InvalidParams, `Prompt ${ref.name} disabled`);
        }
        if (!prompt.argsSchema) {
          return EMPTY_COMPLETION_RESULT;
        }
        const field = prompt.argsSchema.shape[request.params.argument.name];
        if (!(field instanceof Completable)) {
          return EMPTY_COMPLETION_RESULT;
        }
        const def = field._def;
        const suggestions = await def.complete(request.params.argument.value, request.params.context);
        return createCompletionResult(suggestions);
      }
      async handleResourceCompletion(request, ref) {
        const template = Object.values(this._registeredResourceTemplates).find((t) => t.resourceTemplate.uriTemplate.toString() === ref.uri);
        if (!template) {
          if (this._registeredResources[ref.uri]) {
            return EMPTY_COMPLETION_RESULT;
          }
          throw new McpError(ErrorCode.InvalidParams, `Resource template ${request.params.ref.uri} not found`);
        }
        const completer = template.resourceTemplate.completeCallback(request.params.argument.name);
        if (!completer) {
          return EMPTY_COMPLETION_RESULT;
        }
        const suggestions = await completer(request.params.argument.value, request.params.context);
        return createCompletionResult(suggestions);
      }
      setResourceRequestHandlers() {
        if (this._resourceHandlersInitialized) {
          return;
        }
        this.server.assertCanSetRequestHandler(ListResourcesRequestSchema.shape.method.value);
        this.server.assertCanSetRequestHandler(ListResourceTemplatesRequestSchema.shape.method.value);
        this.server.assertCanSetRequestHandler(ReadResourceRequestSchema.shape.method.value);
        this.server.registerCapabilities({
          resources: {
            listChanged: true
          }
        });
        this.server.setRequestHandler(ListResourcesRequestSchema, async (request, extra) => {
          const resources = Object.entries(this._registeredResources).filter(([_, resource]) => resource.enabled).map(([uri, resource]) => ({
            uri,
            name: resource.name,
            ...resource.metadata
          }));
          const templateResources = [];
          for (const template of Object.values(this._registeredResourceTemplates)) {
            if (!template.resourceTemplate.listCallback) {
              continue;
            }
            const result = await template.resourceTemplate.listCallback(extra);
            for (const resource of result.resources) {
              templateResources.push({
                ...template.metadata,
                ...resource
              });
            }
          }
          return { resources: [...resources, ...templateResources] };
        });
        this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
          const resourceTemplates = Object.entries(this._registeredResourceTemplates).map(([name, template]) => ({
            name,
            uriTemplate: template.resourceTemplate.uriTemplate.toString(),
            ...template.metadata
          }));
          return { resourceTemplates };
        });
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request, extra) => {
          const uri = new URL(request.params.uri);
          const resource = this._registeredResources[uri.toString()];
          if (resource) {
            if (!resource.enabled) {
              throw new McpError(ErrorCode.InvalidParams, `Resource ${uri} disabled`);
            }
            return resource.readCallback(uri, extra);
          }
          for (const template of Object.values(this._registeredResourceTemplates)) {
            const variables = template.resourceTemplate.uriTemplate.match(uri.toString());
            if (variables) {
              return template.readCallback(uri, variables, extra);
            }
          }
          throw new McpError(ErrorCode.InvalidParams, `Resource ${uri} not found`);
        });
        this.setCompletionRequestHandler();
        this._resourceHandlersInitialized = true;
      }
      setPromptRequestHandlers() {
        if (this._promptHandlersInitialized) {
          return;
        }
        this.server.assertCanSetRequestHandler(ListPromptsRequestSchema.shape.method.value);
        this.server.assertCanSetRequestHandler(GetPromptRequestSchema.shape.method.value);
        this.server.registerCapabilities({
          prompts: {
            listChanged: true
          }
        });
        this.server.setRequestHandler(ListPromptsRequestSchema, () => ({
          prompts: Object.entries(this._registeredPrompts).filter(([, prompt]) => prompt.enabled).map(([name, prompt]) => {
            return {
              name,
              title: prompt.title,
              description: prompt.description,
              arguments: prompt.argsSchema ? promptArgumentsFromSchema(prompt.argsSchema) : void 0
            };
          })
        }));
        this.server.setRequestHandler(GetPromptRequestSchema, async (request, extra) => {
          const prompt = this._registeredPrompts[request.params.name];
          if (!prompt) {
            throw new McpError(ErrorCode.InvalidParams, `Prompt ${request.params.name} not found`);
          }
          if (!prompt.enabled) {
            throw new McpError(ErrorCode.InvalidParams, `Prompt ${request.params.name} disabled`);
          }
          if (prompt.argsSchema) {
            const parseResult = await prompt.argsSchema.safeParseAsync(request.params.arguments);
            if (!parseResult.success) {
              throw new McpError(ErrorCode.InvalidParams, `Invalid arguments for prompt ${request.params.name}: ${parseResult.error.message}`);
            }
            const args = parseResult.data;
            const cb = prompt.callback;
            return await Promise.resolve(cb(args, extra));
          } else {
            const cb = prompt.callback;
            return await Promise.resolve(cb(extra));
          }
        });
        this.setCompletionRequestHandler();
        this._promptHandlersInitialized = true;
      }
      resource(name, uriOrTemplate, ...rest) {
        let metadata;
        if (typeof rest[0] === "object") {
          metadata = rest.shift();
        }
        const readCallback = rest[0];
        if (typeof uriOrTemplate === "string") {
          if (this._registeredResources[uriOrTemplate]) {
            throw new Error(`Resource ${uriOrTemplate} is already registered`);
          }
          const registeredResource = this._createRegisteredResource(name, void 0, uriOrTemplate, metadata, readCallback);
          this.setResourceRequestHandlers();
          this.sendResourceListChanged();
          return registeredResource;
        } else {
          if (this._registeredResourceTemplates[name]) {
            throw new Error(`Resource template ${name} is already registered`);
          }
          const registeredResourceTemplate = this._createRegisteredResourceTemplate(name, void 0, uriOrTemplate, metadata, readCallback);
          this.setResourceRequestHandlers();
          this.sendResourceListChanged();
          return registeredResourceTemplate;
        }
      }
      registerResource(name, uriOrTemplate, config, readCallback) {
        if (typeof uriOrTemplate === "string") {
          if (this._registeredResources[uriOrTemplate]) {
            throw new Error(`Resource ${uriOrTemplate} is already registered`);
          }
          const registeredResource = this._createRegisteredResource(name, config.title, uriOrTemplate, config, readCallback);
          this.setResourceRequestHandlers();
          this.sendResourceListChanged();
          return registeredResource;
        } else {
          if (this._registeredResourceTemplates[name]) {
            throw new Error(`Resource template ${name} is already registered`);
          }
          const registeredResourceTemplate = this._createRegisteredResourceTemplate(name, config.title, uriOrTemplate, config, readCallback);
          this.setResourceRequestHandlers();
          this.sendResourceListChanged();
          return registeredResourceTemplate;
        }
      }
      _createRegisteredResource(name, title, uri, metadata, readCallback) {
        const registeredResource = {
          name,
          title,
          metadata,
          readCallback,
          enabled: true,
          disable: () => registeredResource.update({ enabled: false }),
          enable: () => registeredResource.update({ enabled: true }),
          remove: () => registeredResource.update({ uri: null }),
          update: (updates) => {
            if (typeof updates.uri !== "undefined" && updates.uri !== uri) {
              delete this._registeredResources[uri];
              if (updates.uri)
                this._registeredResources[updates.uri] = registeredResource;
            }
            if (typeof updates.name !== "undefined")
              registeredResource.name = updates.name;
            if (typeof updates.title !== "undefined")
              registeredResource.title = updates.title;
            if (typeof updates.metadata !== "undefined")
              registeredResource.metadata = updates.metadata;
            if (typeof updates.callback !== "undefined")
              registeredResource.readCallback = updates.callback;
            if (typeof updates.enabled !== "undefined")
              registeredResource.enabled = updates.enabled;
            this.sendResourceListChanged();
          }
        };
        this._registeredResources[uri] = registeredResource;
        return registeredResource;
      }
      _createRegisteredResourceTemplate(name, title, template, metadata, readCallback) {
        const registeredResourceTemplate = {
          resourceTemplate: template,
          title,
          metadata,
          readCallback,
          enabled: true,
          disable: () => registeredResourceTemplate.update({ enabled: false }),
          enable: () => registeredResourceTemplate.update({ enabled: true }),
          remove: () => registeredResourceTemplate.update({ name: null }),
          update: (updates) => {
            if (typeof updates.name !== "undefined" && updates.name !== name) {
              delete this._registeredResourceTemplates[name];
              if (updates.name)
                this._registeredResourceTemplates[updates.name] = registeredResourceTemplate;
            }
            if (typeof updates.title !== "undefined")
              registeredResourceTemplate.title = updates.title;
            if (typeof updates.template !== "undefined")
              registeredResourceTemplate.resourceTemplate = updates.template;
            if (typeof updates.metadata !== "undefined")
              registeredResourceTemplate.metadata = updates.metadata;
            if (typeof updates.callback !== "undefined")
              registeredResourceTemplate.readCallback = updates.callback;
            if (typeof updates.enabled !== "undefined")
              registeredResourceTemplate.enabled = updates.enabled;
            this.sendResourceListChanged();
          }
        };
        this._registeredResourceTemplates[name] = registeredResourceTemplate;
        return registeredResourceTemplate;
      }
      _createRegisteredPrompt(name, title, description, argsSchema, callback) {
        const registeredPrompt = {
          title,
          description,
          argsSchema: argsSchema === void 0 ? void 0 : exports_external.object(argsSchema),
          callback,
          enabled: true,
          disable: () => registeredPrompt.update({ enabled: false }),
          enable: () => registeredPrompt.update({ enabled: true }),
          remove: () => registeredPrompt.update({ name: null }),
          update: (updates) => {
            if (typeof updates.name !== "undefined" && updates.name !== name) {
              delete this._registeredPrompts[name];
              if (updates.name)
                this._registeredPrompts[updates.name] = registeredPrompt;
            }
            if (typeof updates.title !== "undefined")
              registeredPrompt.title = updates.title;
            if (typeof updates.description !== "undefined")
              registeredPrompt.description = updates.description;
            if (typeof updates.argsSchema !== "undefined")
              registeredPrompt.argsSchema = exports_external.object(updates.argsSchema);
            if (typeof updates.callback !== "undefined")
              registeredPrompt.callback = updates.callback;
            if (typeof updates.enabled !== "undefined")
              registeredPrompt.enabled = updates.enabled;
            this.sendPromptListChanged();
          }
        };
        this._registeredPrompts[name] = registeredPrompt;
        return registeredPrompt;
      }
      _createRegisteredTool(name, title, description, inputSchema, outputSchema, annotations, callback) {
        const registeredTool = {
          title,
          description,
          inputSchema: inputSchema === void 0 ? void 0 : exports_external.object(inputSchema),
          outputSchema: outputSchema === void 0 ? void 0 : exports_external.object(outputSchema),
          annotations,
          callback,
          enabled: true,
          disable: () => registeredTool.update({ enabled: false }),
          enable: () => registeredTool.update({ enabled: true }),
          remove: () => registeredTool.update({ name: null }),
          update: (updates) => {
            if (typeof updates.name !== "undefined" && updates.name !== name) {
              delete this._registeredTools[name];
              if (updates.name)
                this._registeredTools[updates.name] = registeredTool;
            }
            if (typeof updates.title !== "undefined")
              registeredTool.title = updates.title;
            if (typeof updates.description !== "undefined")
              registeredTool.description = updates.description;
            if (typeof updates.paramsSchema !== "undefined")
              registeredTool.inputSchema = exports_external.object(updates.paramsSchema);
            if (typeof updates.callback !== "undefined")
              registeredTool.callback = updates.callback;
            if (typeof updates.annotations !== "undefined")
              registeredTool.annotations = updates.annotations;
            if (typeof updates.enabled !== "undefined")
              registeredTool.enabled = updates.enabled;
            this.sendToolListChanged();
          }
        };
        this._registeredTools[name] = registeredTool;
        this.setToolRequestHandlers();
        this.sendToolListChanged();
        return registeredTool;
      }
      tool(name, ...rest) {
        if (this._registeredTools[name]) {
          throw new Error(`Tool ${name} is already registered`);
        }
        let description;
        let inputSchema;
        let outputSchema;
        let annotations;
        if (typeof rest[0] === "string") {
          description = rest.shift();
        }
        if (rest.length > 1) {
          const firstArg = rest[0];
          if (isZodRawShape(firstArg)) {
            inputSchema = rest.shift();
            if (rest.length > 1 && typeof rest[0] === "object" && rest[0] !== null && !isZodRawShape(rest[0])) {
              annotations = rest.shift();
            }
          } else if (typeof firstArg === "object" && firstArg !== null) {
            annotations = rest.shift();
          }
        }
        const callback = rest[0];
        return this._createRegisteredTool(name, void 0, description, inputSchema, outputSchema, annotations, callback);
      }
      registerTool(name, config, cb) {
        if (this._registeredTools[name]) {
          throw new Error(`Tool ${name} is already registered`);
        }
        const { title, description, inputSchema, outputSchema, annotations } = config;
        return this._createRegisteredTool(name, title, description, inputSchema, outputSchema, annotations, cb);
      }
      prompt(name, ...rest) {
        if (this._registeredPrompts[name]) {
          throw new Error(`Prompt ${name} is already registered`);
        }
        let description;
        if (typeof rest[0] === "string") {
          description = rest.shift();
        }
        let argsSchema;
        if (rest.length > 1) {
          argsSchema = rest.shift();
        }
        const cb = rest[0];
        const registeredPrompt = this._createRegisteredPrompt(name, void 0, description, argsSchema, cb);
        this.setPromptRequestHandlers();
        this.sendPromptListChanged();
        return registeredPrompt;
      }
      registerPrompt(name, config, cb) {
        if (this._registeredPrompts[name]) {
          throw new Error(`Prompt ${name} is already registered`);
        }
        const { title, description, argsSchema } = config;
        const registeredPrompt = this._createRegisteredPrompt(name, title, description, argsSchema, cb);
        this.setPromptRequestHandlers();
        this.sendPromptListChanged();
        return registeredPrompt;
      }
      isConnected() {
        return this.server.transport !== void 0;
      }
      sendResourceListChanged() {
        if (this.isConnected()) {
          this.server.sendResourceListChanged();
        }
      }
      sendToolListChanged() {
        if (this.isConnected()) {
          this.server.sendToolListChanged();
        }
      }
      sendPromptListChanged() {
        if (this.isConnected()) {
          this.server.sendPromptListChanged();
        }
      }
    };
    EMPTY_OBJECT_JSON_SCHEMA = {
      type: "object",
      properties: {}
    };
    EMPTY_COMPLETION_RESULT = {
      completion: {
        values: [],
        hasMore: false
      }
    };
  }
});

// node_modules/node-cron/dist/esm/create-id.js
var require_create_id = __commonJS({
  "node_modules/node-cron/dist/esm/create-id.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createID = createID;
    var node_crypto_1 = __importDefault(__require("node:crypto"));
    function createID(prefix = "", length = 16) {
      const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const values = node_crypto_1.default.randomBytes(length);
      const id = Array.from(values, (v) => charset[v % charset.length]).join("");
      return prefix ? `${prefix}-${id}` : id;
    }
  }
});

// node_modules/node-cron/dist/esm/logger.js
var require_logger = __commonJS({
  "node_modules/node-cron/dist/esm/logger.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var levelColors = {
      INFO: "\x1B[36m",
      WARN: "\x1B[33m",
      ERROR: "\x1B[31m",
      DEBUG: "\x1B[35m"
    };
    var GREEN = "\x1B[32m";
    var RESET3 = "\x1B[0m";
    function log(level, message, extra) {
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const color = levelColors[level] ?? "";
      const prefix = `[${timestamp}] [PID: ${process.pid}] ${GREEN}[NODE-CRON]${GREEN} ${color}[${level}]${RESET3}`;
      const output = `${prefix} ${message}`;
      switch (level) {
        case "ERROR":
          console.error(output, extra ?? "");
          break;
        case "DEBUG":
          console.debug(output, extra ?? "");
          break;
        case "WARN":
          console.warn(output);
          break;
        case "INFO":
        default:
          console.info(output);
          break;
      }
    }
    var logger2 = {
      info(message) {
        log("INFO", message);
      },
      warn(message) {
        log("WARN", message);
      },
      error(message, err) {
        if (message instanceof Error) {
          log("ERROR", message.message, message);
        } else {
          log("ERROR", message, err);
        }
      },
      debug(message, err) {
        if (message instanceof Error) {
          log("DEBUG", message.message, message);
        } else {
          log("DEBUG", message, err);
        }
      }
    };
    exports.default = logger2;
  }
});

// node_modules/node-cron/dist/esm/promise/tracked-promise.js
var require_tracked_promise = __commonJS({
  "node_modules/node-cron/dist/esm/promise/tracked-promise.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TrackedPromise = void 0;
    var TrackedPromise = class {
      promise;
      error;
      state;
      value;
      constructor(executor) {
        this.state = "pending";
        this.promise = new Promise((resolve, reject) => {
          executor((value) => {
            this.state = "fulfilled";
            this.value = value;
            resolve(value);
          }, (error) => {
            this.state = "rejected";
            this.error = error;
            reject(error);
          });
        });
      }
      getPromise() {
        return this.promise;
      }
      getState() {
        return this.state;
      }
      isPending() {
        return this.state === "pending";
      }
      isFulfilled() {
        return this.state === "fulfilled";
      }
      isRejected() {
        return this.state === "rejected";
      }
      getValue() {
        return this.value;
      }
      getError() {
        return this.error;
      }
      then(onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
      }
      catch(onrejected) {
        return this.promise.catch(onrejected);
      }
      finally(onfinally) {
        return this.promise.finally(onfinally);
      }
    };
    exports.TrackedPromise = TrackedPromise;
  }
});

// node_modules/node-cron/dist/esm/scheduler/runner.js
var require_runner = __commonJS({
  "node_modules/node-cron/dist/esm/scheduler/runner.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Runner = void 0;
    var create_id_1 = require_create_id();
    var logger_1 = __importDefault(require_logger());
    var tracked_promise_1 = require_tracked_promise();
    function emptyOnFn() {
    }
    function emptyHookFn() {
      return true;
    }
    function defaultOnError(date, error) {
      logger_1.default.error("Task failed with error!", error);
    }
    var Runner = class {
      timeMatcher;
      onMatch;
      noOverlap;
      maxExecutions;
      maxRandomDelay;
      runCount;
      running;
      heartBeatTimeout;
      onMissedExecution;
      onOverlap;
      onError;
      beforeRun;
      onFinished;
      onMaxExecutions;
      constructor(timeMatcher, onMatch, options) {
        this.timeMatcher = timeMatcher;
        this.onMatch = onMatch;
        this.noOverlap = options == void 0 || options.noOverlap === void 0 ? false : options.noOverlap;
        this.maxExecutions = options?.maxExecutions;
        this.maxRandomDelay = options?.maxRandomDelay || 0;
        this.onMissedExecution = options?.onMissedExecution || emptyOnFn;
        this.onOverlap = options?.onOverlap || emptyOnFn;
        this.onError = options?.onError || defaultOnError;
        this.onFinished = options?.onFinished || emptyHookFn;
        this.beforeRun = options?.beforeRun || emptyHookFn;
        this.onMaxExecutions = options?.onMaxExecutions || emptyOnFn;
        this.runCount = 0;
        this.running = false;
      }
      start() {
        this.running = true;
        let lastExecution;
        let expectedNextExecution;
        const scheduleNextHeartBeat = (currentDate) => {
          if (this.running) {
            clearTimeout(this.heartBeatTimeout);
            this.heartBeatTimeout = setTimeout(heartBeat, getDelay(this.timeMatcher, currentDate));
          }
        };
        const runTask = (date) => {
          return new Promise(async (resolve) => {
            const execution = {
              id: (0, create_id_1.createID)("exec"),
              reason: "scheduled"
            };
            const shouldExecute = await this.beforeRun(date, execution);
            const randomDelay = Math.floor(Math.random() * this.maxRandomDelay);
            if (shouldExecute) {
              setTimeout(async () => {
                try {
                  this.runCount++;
                  execution.startedAt = /* @__PURE__ */ new Date();
                  const result = await this.onMatch(date, execution);
                  execution.finishedAt = /* @__PURE__ */ new Date();
                  execution.result = result;
                  this.onFinished(date, execution);
                  if (this.maxExecutions && this.runCount >= this.maxExecutions) {
                    this.onMaxExecutions(date);
                    this.stop();
                  }
                } catch (error) {
                  execution.finishedAt = /* @__PURE__ */ new Date();
                  execution.error = error;
                  this.onError(date, error, execution);
                }
                resolve(true);
              }, randomDelay);
            }
          });
        };
        const checkAndRun = (date) => {
          return new tracked_promise_1.TrackedPromise(async (resolve, reject) => {
            try {
              if (this.timeMatcher.match(date)) {
                await runTask(date);
              }
              resolve(true);
            } catch (err) {
              reject(err);
            }
          });
        };
        const heartBeat = async () => {
          const currentDate = nowWithoutMs();
          if (expectedNextExecution && expectedNextExecution.getTime() < currentDate.getTime()) {
            while (expectedNextExecution.getTime() < currentDate.getTime()) {
              logger_1.default.warn(`missed execution at ${expectedNextExecution}! Possible blocking IO or high CPU user at the same process used by node-cron.`);
              expectedNextExecution = this.timeMatcher.getNextMatch(expectedNextExecution);
              runAsync(this.onMissedExecution, expectedNextExecution, defaultOnError);
            }
          }
          if (lastExecution && lastExecution.getState() === "pending") {
            runAsync(this.onOverlap, currentDate, defaultOnError);
            if (this.noOverlap) {
              logger_1.default.warn("task still running, new execution blocked by overlap prevention!");
              expectedNextExecution = this.timeMatcher.getNextMatch(currentDate);
              scheduleNextHeartBeat(currentDate);
              return;
            }
          }
          lastExecution = checkAndRun(currentDate);
          expectedNextExecution = this.timeMatcher.getNextMatch(currentDate);
          scheduleNextHeartBeat(currentDate);
        };
        this.heartBeatTimeout = setTimeout(() => {
          heartBeat();
        }, getDelay(this.timeMatcher, nowWithoutMs()));
      }
      nextRun() {
        return this.timeMatcher.getNextMatch(/* @__PURE__ */ new Date());
      }
      stop() {
        this.running = false;
        if (this.heartBeatTimeout) {
          clearTimeout(this.heartBeatTimeout);
          this.heartBeatTimeout = void 0;
        }
      }
      isStarted() {
        return !!this.heartBeatTimeout && this.running;
      }
      isStopped() {
        return !this.isStarted();
      }
      async execute() {
        const date = /* @__PURE__ */ new Date();
        const execution = {
          id: (0, create_id_1.createID)("exec"),
          reason: "invoked"
        };
        try {
          const shouldExecute = await this.beforeRun(date, execution);
          if (shouldExecute) {
            this.runCount++;
            execution.startedAt = /* @__PURE__ */ new Date();
            const result = await this.onMatch(date, execution);
            execution.finishedAt = /* @__PURE__ */ new Date();
            execution.result = result;
            this.onFinished(date, execution);
          }
        } catch (error) {
          execution.finishedAt = /* @__PURE__ */ new Date();
          execution.error = error;
          this.onError(date, error, execution);
        }
      }
    };
    exports.Runner = Runner;
    async function runAsync(fn, date, onError) {
      try {
        await fn(date);
      } catch (error) {
        onError(date, error);
      }
    }
    function getDelay(timeMatcher, currentDate) {
      const maxDelay = 864e5;
      const nextRun = timeMatcher.getNextMatch(currentDate);
      const now = /* @__PURE__ */ new Date();
      const delay = nextRun.getTime() - now.getTime();
      if (delay > maxDelay) {
        return maxDelay;
      }
      return Math.max(0, delay);
    }
    function nowWithoutMs() {
      const date = /* @__PURE__ */ new Date();
      date.setMilliseconds(0);
      return date;
    }
  }
});

// node_modules/node-cron/dist/esm/pattern/convertion/month-names-conversion.js
var require_month_names_conversion = __commonJS({
  "node_modules/node-cron/dist/esm/pattern/convertion/month-names-conversion.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = /* @__PURE__ */ (() => {
      const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december"
      ];
      const shortMonths = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec"
      ];
      function convertMonthName(expression, items) {
        for (let i = 0; i < items.length; i++) {
          expression = expression.replace(new RegExp(items[i], "gi"), i + 1);
        }
        return expression;
      }
      function interprete(monthExpression) {
        monthExpression = convertMonthName(monthExpression, months);
        monthExpression = convertMonthName(monthExpression, shortMonths);
        return monthExpression;
      }
      return interprete;
    })();
  }
});

// node_modules/node-cron/dist/esm/pattern/convertion/week-day-names-conversion.js
var require_week_day_names_conversion = __commonJS({
  "node_modules/node-cron/dist/esm/pattern/convertion/week-day-names-conversion.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = /* @__PURE__ */ (() => {
      const weekDays = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ];
      const shortWeekDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      function convertWeekDayName(expression, items) {
        for (let i = 0; i < items.length; i++) {
          expression = expression.replace(new RegExp(items[i], "gi"), i);
        }
        return expression;
      }
      function convertWeekDays(expression) {
        expression = expression.replace("7", "0");
        expression = convertWeekDayName(expression, weekDays);
        return convertWeekDayName(expression, shortWeekDays);
      }
      return convertWeekDays;
    })();
  }
});

// node_modules/node-cron/dist/esm/pattern/convertion/asterisk-to-range-conversion.js
var require_asterisk_to_range_conversion = __commonJS({
  "node_modules/node-cron/dist/esm/pattern/convertion/asterisk-to-range-conversion.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = /* @__PURE__ */ (() => {
      function convertAsterisk(expression, replecement) {
        if (expression.indexOf("*") !== -1) {
          return expression.replace("*", replecement);
        }
        return expression;
      }
      function convertAsterisksToRanges(expressions) {
        expressions[0] = convertAsterisk(expressions[0], "0-59");
        expressions[1] = convertAsterisk(expressions[1], "0-59");
        expressions[2] = convertAsterisk(expressions[2], "0-23");
        expressions[3] = convertAsterisk(expressions[3], "1-31");
        expressions[4] = convertAsterisk(expressions[4], "1-12");
        expressions[5] = convertAsterisk(expressions[5], "0-6");
        return expressions;
      }
      return convertAsterisksToRanges;
    })();
  }
});

// node_modules/node-cron/dist/esm/pattern/convertion/range-conversion.js
var require_range_conversion = __commonJS({
  "node_modules/node-cron/dist/esm/pattern/convertion/range-conversion.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = /* @__PURE__ */ (() => {
      function replaceWithRange(expression, text, init, end, stepTxt) {
        const step = parseInt(stepTxt);
        const numbers = [];
        let last = parseInt(end);
        let first = parseInt(init);
        if (first > last) {
          last = parseInt(init);
          first = parseInt(end);
        }
        for (let i = first; i <= last; i += step) {
          numbers.push(i);
        }
        return expression.replace(new RegExp(text, "i"), numbers.join());
      }
      function convertRange(expression) {
        const rangeRegEx = /(\d+)-(\d+)(\/(\d+)|)/;
        let match = rangeRegEx.exec(expression);
        while (match !== null && match.length > 0) {
          expression = replaceWithRange(expression, match[0], match[1], match[2], match[4] || "1");
          match = rangeRegEx.exec(expression);
        }
        return expression;
      }
      function convertAllRanges(expressions) {
        for (let i = 0; i < expressions.length; i++) {
          expressions[i] = convertRange(expressions[i]);
        }
        return expressions;
      }
      return convertAllRanges;
    })();
  }
});

// node_modules/node-cron/dist/esm/pattern/convertion/index.js
var require_convertion = __commonJS({
  "node_modules/node-cron/dist/esm/pattern/convertion/index.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var month_names_conversion_1 = __importDefault(require_month_names_conversion());
    var week_day_names_conversion_1 = __importDefault(require_week_day_names_conversion());
    var asterisk_to_range_conversion_1 = __importDefault(require_asterisk_to_range_conversion());
    var range_conversion_1 = __importDefault(require_range_conversion());
    exports.default = /* @__PURE__ */ (() => {
      function appendSeccondExpression(expressions) {
        if (expressions.length === 5) {
          return ["0"].concat(expressions);
        }
        return expressions;
      }
      function removeSpaces(str) {
        return str.replace(/\s{2,}/g, " ").trim();
      }
      function normalizeIntegers(expressions) {
        for (let i = 0; i < expressions.length; i++) {
          const numbers = expressions[i].split(",");
          for (let j = 0; j < numbers.length; j++) {
            numbers[j] = parseInt(numbers[j]);
          }
          expressions[i] = numbers;
        }
        return expressions;
      }
      function interprete(expression) {
        let expressions = removeSpaces(`${expression}`).split(" ");
        expressions = appendSeccondExpression(expressions);
        expressions[4] = (0, month_names_conversion_1.default)(expressions[4]);
        expressions[5] = (0, week_day_names_conversion_1.default)(expressions[5]);
        expressions = (0, asterisk_to_range_conversion_1.default)(expressions);
        expressions = (0, range_conversion_1.default)(expressions);
        expressions = normalizeIntegers(expressions);
        return expressions;
      }
      return interprete;
    })();
  }
});

// node_modules/node-cron/dist/esm/time/localized-time.js
var require_localized_time = __commonJS({
  "node_modules/node-cron/dist/esm/time/localized-time.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalizedTime = void 0;
    var LocalizedTime = class {
      timestamp;
      parts;
      timezone;
      constructor(date, timezone) {
        this.timestamp = date.getTime();
        this.timezone = timezone;
        this.parts = buildDateParts(date, timezone);
      }
      toDate() {
        return new Date(this.timestamp);
      }
      toISO() {
        const gmt = this.parts.gmt.replace(/^GMT/, "");
        const offset = gmt ? gmt : "Z";
        const pad = (n) => String(n).padStart(2, "0");
        return `${this.parts.year}-${pad(this.parts.month)}-${pad(this.parts.day)}T${pad(this.parts.hour)}:${pad(this.parts.minute)}:${pad(this.parts.second)}.${String(this.parts.milisecond).padStart(3, "0")}` + offset;
      }
      getParts() {
        return this.parts;
      }
      set(field, value) {
        this.parts[field] = value;
        const newDate = new Date(this.toISO());
        this.timestamp = newDate.getTime();
        this.parts = buildDateParts(newDate, this.timezone);
      }
    };
    exports.LocalizedTime = LocalizedTime;
    function buildDateParts(date, timezone) {
      const dftOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        weekday: "short",
        hour12: false
      };
      if (timezone) {
        dftOptions.timeZone = timezone;
      }
      const dateFormat = new Intl.DateTimeFormat("en-US", dftOptions);
      const parts = dateFormat.formatToParts(date).filter((part) => {
        return part.type !== "literal";
      }).reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
      }, {});
      return {
        day: parseInt(parts.day),
        month: parseInt(parts.month),
        year: parseInt(parts.year),
        hour: parts.hour === "24" ? 0 : parseInt(parts.hour),
        minute: parseInt(parts.minute),
        second: parseInt(parts.second),
        milisecond: date.getMilliseconds(),
        weekday: parts.weekday,
        gmt: getTimezoneGMT(date, timezone)
      };
    }
    function getTimezoneGMT(date, timezone) {
      const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
      const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
      let offsetInMinutes = (utcDate.getTime() - tzDate.getTime()) / 6e4;
      const sign = offsetInMinutes <= 0 ? "+" : "-";
      offsetInMinutes = Math.abs(offsetInMinutes);
      if (offsetInMinutes === 0)
        return "Z";
      const hours = Math.floor(offsetInMinutes / 60).toString().padStart(2, "0");
      const minutes = Math.floor(offsetInMinutes % 60).toString().padStart(2, "0");
      return `GMT${sign}${hours}:${minutes}`;
    }
  }
});

// node_modules/node-cron/dist/esm/time/matcher-walker.js
var require_matcher_walker = __commonJS({
  "node_modules/node-cron/dist/esm/time/matcher-walker.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MatcherWalker = void 0;
    var convertion_1 = __importDefault(require_convertion());
    var localized_time_1 = require_localized_time();
    var time_matcher_1 = require_time_matcher();
    var week_day_names_conversion_1 = __importDefault(require_week_day_names_conversion());
    var MatcherWalker = class {
      cronExpression;
      baseDate;
      pattern;
      expressions;
      timeMatcher;
      timezone;
      constructor(cronExpression, baseDate, timezone) {
        this.cronExpression = cronExpression;
        this.baseDate = baseDate;
        this.timeMatcher = new time_matcher_1.TimeMatcher(cronExpression, timezone);
        this.timezone = timezone;
        this.expressions = (0, convertion_1.default)(cronExpression);
      }
      isMatching() {
        return this.timeMatcher.match(this.baseDate);
      }
      matchNext() {
        const findNextDateIgnoringWeekday = () => {
          const baseDate = new Date(this.baseDate.getTime());
          baseDate.setMilliseconds(0);
          const localTime = new localized_time_1.LocalizedTime(baseDate, this.timezone);
          const dateParts = localTime.getParts();
          const date2 = new localized_time_1.LocalizedTime(localTime.toDate(), this.timezone);
          const seconds = this.expressions[0];
          const nextSecond = availableValue(seconds, dateParts.second);
          if (nextSecond) {
            date2.set("second", nextSecond);
            if (this.timeMatcher.match(date2.toDate())) {
              return date2;
            }
          }
          date2.set("second", seconds[0]);
          const minutes = this.expressions[1];
          const nextMinute = availableValue(minutes, dateParts.minute);
          if (nextMinute) {
            date2.set("minute", nextMinute);
            if (this.timeMatcher.match(date2.toDate())) {
              return date2;
            }
          }
          date2.set("minute", minutes[0]);
          const hours = this.expressions[2];
          const nextHour = availableValue(hours, dateParts.hour);
          if (nextHour) {
            date2.set("hour", nextHour);
            if (this.timeMatcher.match(date2.toDate())) {
              return date2;
            }
          }
          date2.set("hour", hours[0]);
          const days = this.expressions[3];
          const nextDay = availableValue(days, dateParts.day);
          if (nextDay) {
            date2.set("day", nextDay);
            if (this.timeMatcher.match(date2.toDate())) {
              return date2;
            }
          }
          date2.set("day", days[0]);
          const months = this.expressions[4];
          const nextMonth = availableValue(months, dateParts.month);
          if (nextMonth) {
            date2.set("month", nextMonth);
            if (this.timeMatcher.match(date2.toDate())) {
              return date2;
            }
          }
          date2.set("year", date2.getParts().year + 1);
          date2.set("month", months[0]);
          return date2;
        };
        const date = findNextDateIgnoringWeekday();
        const weekdays = this.expressions[5];
        let currentWeekday = parseInt((0, week_day_names_conversion_1.default)(date.getParts().weekday));
        while (!(weekdays.indexOf(currentWeekday) > -1)) {
          date.set("year", date.getParts().year + 1);
          currentWeekday = parseInt((0, week_day_names_conversion_1.default)(date.getParts().weekday));
        }
        return date;
      }
    };
    exports.MatcherWalker = MatcherWalker;
    function availableValue(values, currentValue) {
      const availableValues = values.sort((a, b) => a - b).filter((s) => s > currentValue);
      if (availableValues.length > 0)
        return availableValues[0];
      return false;
    }
  }
});

// node_modules/node-cron/dist/esm/time/time-matcher.js
var require_time_matcher = __commonJS({
  "node_modules/node-cron/dist/esm/time/time-matcher.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimeMatcher = void 0;
    var index_1 = __importDefault(require_convertion());
    var week_day_names_conversion_1 = __importDefault(require_week_day_names_conversion());
    var localized_time_1 = require_localized_time();
    var matcher_walker_1 = require_matcher_walker();
    function matchValue(allowedValues, value) {
      return allowedValues.indexOf(value) !== -1;
    }
    var TimeMatcher = class {
      timezone;
      pattern;
      expressions;
      constructor(pattern, timezone) {
        this.timezone = timezone;
        this.pattern = pattern;
        this.expressions = (0, index_1.default)(pattern);
      }
      match(date) {
        const localizedTime = new localized_time_1.LocalizedTime(date, this.timezone);
        const parts = localizedTime.getParts();
        const runOnSecond = matchValue(this.expressions[0], parts.second);
        const runOnMinute = matchValue(this.expressions[1], parts.minute);
        const runOnHour = matchValue(this.expressions[2], parts.hour);
        const runOnDay = matchValue(this.expressions[3], parts.day);
        const runOnMonth = matchValue(this.expressions[4], parts.month);
        const runOnWeekDay = matchValue(this.expressions[5], parseInt((0, week_day_names_conversion_1.default)(parts.weekday)));
        return runOnSecond && runOnMinute && runOnHour && runOnDay && runOnMonth && runOnWeekDay;
      }
      getNextMatch(date) {
        const walker = new matcher_walker_1.MatcherWalker(this.pattern, date, this.timezone);
        const next = walker.matchNext();
        return next.toDate();
      }
    };
    exports.TimeMatcher = TimeMatcher;
  }
});

// node_modules/node-cron/dist/esm/tasks/state-machine.js
var require_state_machine = __commonJS({
  "node_modules/node-cron/dist/esm/tasks/state-machine.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StateMachine = void 0;
    var allowedTransitions = {
      "stopped": ["stopped", "idle", "destroyed"],
      "idle": ["idle", "running", "stopped", "destroyed"],
      "running": ["running", "idle", "stopped", "destroyed"],
      "destroyed": ["destroyed"]
    };
    var StateMachine = class {
      state;
      constructor(initial = "stopped") {
        this.state = initial;
      }
      changeState(state) {
        if (allowedTransitions[this.state].includes(state)) {
          this.state = state;
        } else {
          throw new Error(`invalid transition from ${this.state} to ${state}`);
        }
      }
    };
    exports.StateMachine = StateMachine;
  }
});

// node_modules/node-cron/dist/esm/tasks/inline-scheduled-task.js
var require_inline_scheduled_task = __commonJS({
  "node_modules/node-cron/dist/esm/tasks/inline-scheduled-task.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineScheduledTask = void 0;
    var events_1 = __importDefault(__require("events"));
    var runner_1 = require_runner();
    var time_matcher_1 = require_time_matcher();
    var create_id_1 = require_create_id();
    var state_machine_1 = require_state_machine();
    var logger_1 = __importDefault(require_logger());
    var localized_time_1 = require_localized_time();
    var TaskEmitter = class extends events_1.default {
    };
    var InlineScheduledTask = class {
      emitter;
      cronExpression;
      timeMatcher;
      runner;
      id;
      name;
      stateMachine;
      timezone;
      constructor(cronExpression, taskFn, options) {
        this.emitter = new TaskEmitter();
        this.cronExpression = cronExpression;
        this.id = (0, create_id_1.createID)("task", 12);
        this.name = options?.name || this.id;
        this.timezone = options?.timezone;
        this.timeMatcher = new time_matcher_1.TimeMatcher(cronExpression, options?.timezone);
        this.stateMachine = new state_machine_1.StateMachine();
        const runnerOptions = {
          timezone: options?.timezone,
          noOverlap: options?.noOverlap,
          maxExecutions: options?.maxExecutions,
          maxRandomDelay: options?.maxRandomDelay,
          beforeRun: (date, execution) => {
            if (execution.reason === "scheduled") {
              this.changeState("running");
            }
            this.emitter.emit("execution:started", this.createContext(date, execution));
            return true;
          },
          onFinished: (date, execution) => {
            if (execution.reason === "scheduled") {
              this.changeState("idle");
            }
            this.emitter.emit("execution:finished", this.createContext(date, execution));
            return true;
          },
          onError: (date, error, execution) => {
            logger_1.default.error(error);
            this.emitter.emit("execution:failed", this.createContext(date, execution));
            this.changeState("idle");
          },
          onOverlap: (date) => {
            this.emitter.emit("execution:overlap", this.createContext(date));
          },
          onMissedExecution: (date) => {
            this.emitter.emit("execution:missed", this.createContext(date));
          },
          onMaxExecutions: (date) => {
            this.emitter.emit("execution:maxReached", this.createContext(date));
            this.destroy();
          }
        };
        this.runner = new runner_1.Runner(this.timeMatcher, (date, execution) => {
          return taskFn(this.createContext(date, execution));
        }, runnerOptions);
      }
      getNextRun() {
        if (this.stateMachine.state !== "stopped") {
          return this.runner.nextRun();
        }
        return null;
      }
      changeState(state) {
        if (this.runner.isStarted()) {
          this.stateMachine.changeState(state);
        }
      }
      start() {
        if (this.runner.isStopped()) {
          this.runner.start();
          this.stateMachine.changeState("idle");
          this.emitter.emit("task:started", this.createContext(/* @__PURE__ */ new Date()));
        }
      }
      stop() {
        if (this.runner.isStarted()) {
          this.runner.stop();
          this.stateMachine.changeState("stopped");
          this.emitter.emit("task:stopped", this.createContext(/* @__PURE__ */ new Date()));
        }
      }
      getStatus() {
        return this.stateMachine.state;
      }
      destroy() {
        if (this.stateMachine.state === "destroyed")
          return;
        this.stop();
        this.stateMachine.changeState("destroyed");
        this.emitter.emit("task:destroyed", this.createContext(/* @__PURE__ */ new Date()));
      }
      execute() {
        return new Promise((resolve, reject) => {
          const onFail = (context) => {
            this.off("execution:finished", onFail);
            reject(context.execution?.error);
          };
          const onFinished = (context) => {
            this.off("execution:failed", onFail);
            resolve(context.execution?.result);
          };
          this.once("execution:finished", onFinished);
          this.once("execution:failed", onFail);
          this.runner.execute();
        });
      }
      on(event, fun) {
        this.emitter.on(event, fun);
      }
      off(event, fun) {
        this.emitter.off(event, fun);
      }
      once(event, fun) {
        this.emitter.once(event, fun);
      }
      createContext(executionDate, execution) {
        const localTime = new localized_time_1.LocalizedTime(executionDate, this.timezone);
        const ctx = {
          date: localTime.toDate(),
          dateLocalIso: localTime.toISO(),
          triggeredAt: /* @__PURE__ */ new Date(),
          task: this,
          execution
        };
        return ctx;
      }
    };
    exports.InlineScheduledTask = InlineScheduledTask;
  }
});

// node_modules/node-cron/dist/esm/task-registry.js
var require_task_registry = __commonJS({
  "node_modules/node-cron/dist/esm/task-registry.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskRegistry = void 0;
    var tasks = /* @__PURE__ */ new Map();
    var TaskRegistry = class {
      add(task) {
        if (this.has(task.id)) {
          throw Error(`task ${task.id} already registred!`);
        }
        tasks.set(task.id, task);
        task.on("task:destroyed", () => {
          this.remove(task);
        });
      }
      get(taskId) {
        return tasks.get(taskId);
      }
      remove(task) {
        if (this.has(task.id)) {
          task?.destroy();
          tasks.delete(task.id);
        }
      }
      all() {
        return tasks;
      }
      has(taskId) {
        return tasks.has(taskId);
      }
      killAll() {
        tasks.forEach((id) => this.remove(id));
      }
    };
    exports.TaskRegistry = TaskRegistry;
  }
});

// node_modules/node-cron/dist/esm/pattern/validation/pattern-validation.js
var require_pattern_validation = __commonJS({
  "node_modules/node-cron/dist/esm/pattern/validation/pattern-validation.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var index_1 = __importDefault(require_convertion());
    var validationRegex = /^(?:\d+|\*|\*\/\d+)$/;
    function isValidExpression(expression, min, max) {
      const options = expression;
      for (const option of options) {
        const optionAsInt = parseInt(option, 10);
        if (!Number.isNaN(optionAsInt) && (optionAsInt < min || optionAsInt > max) || !validationRegex.test(option))
          return false;
      }
      return true;
    }
    function isInvalidSecond(expression) {
      return !isValidExpression(expression, 0, 59);
    }
    function isInvalidMinute(expression) {
      return !isValidExpression(expression, 0, 59);
    }
    function isInvalidHour(expression) {
      return !isValidExpression(expression, 0, 23);
    }
    function isInvalidDayOfMonth(expression) {
      return !isValidExpression(expression, 1, 31);
    }
    function isInvalidMonth(expression) {
      return !isValidExpression(expression, 1, 12);
    }
    function isInvalidWeekDay(expression) {
      return !isValidExpression(expression, 0, 7);
    }
    function validateFields(patterns, executablePatterns) {
      if (isInvalidSecond(executablePatterns[0]))
        throw new Error(`${patterns[0]} is a invalid expression for second`);
      if (isInvalidMinute(executablePatterns[1]))
        throw new Error(`${patterns[1]} is a invalid expression for minute`);
      if (isInvalidHour(executablePatterns[2]))
        throw new Error(`${patterns[2]} is a invalid expression for hour`);
      if (isInvalidDayOfMonth(executablePatterns[3]))
        throw new Error(`${patterns[3]} is a invalid expression for day of month`);
      if (isInvalidMonth(executablePatterns[4]))
        throw new Error(`${patterns[4]} is a invalid expression for month`);
      if (isInvalidWeekDay(executablePatterns[5]))
        throw new Error(`${patterns[5]} is a invalid expression for week day`);
    }
    function validate(pattern) {
      if (typeof pattern !== "string")
        throw new TypeError("pattern must be a string!");
      const patterns = pattern.split(" ");
      const executablePatterns = (0, index_1.default)(pattern);
      if (patterns.length === 5)
        patterns.unshift("0");
      validateFields(patterns, executablePatterns);
    }
    exports.default = validate;
  }
});

// node_modules/node-cron/dist/esm/tasks/background-scheduled-task/background-scheduled-task.js
var require_background_scheduled_task = __commonJS({
  "node_modules/node-cron/dist/esm/tasks/background-scheduled-task/background-scheduled-task.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var path_1 = __require("path");
    var child_process_1 = __require("child_process");
    var create_id_1 = require_create_id();
    var stream_1 = __require("stream");
    var state_machine_1 = require_state_machine();
    var localized_time_1 = require_localized_time();
    var logger_1 = __importDefault(require_logger());
    var time_matcher_1 = require_time_matcher();
    var daemonPath = (0, path_1.resolve)(__dirname, "daemon.js");
    var TaskEmitter = class extends stream_1.EventEmitter {
    };
    var BackgroundScheduledTask = class {
      emitter;
      id;
      name;
      cronExpression;
      taskPath;
      options;
      forkProcess;
      stateMachine;
      constructor(cronExpression, taskPath, options) {
        this.cronExpression = cronExpression;
        this.taskPath = taskPath;
        this.options = options;
        this.id = (0, create_id_1.createID)("task");
        this.name = options?.name || this.id;
        this.emitter = new TaskEmitter();
        this.stateMachine = new state_machine_1.StateMachine("stopped");
        this.on("task:stopped", () => {
          this.forkProcess?.kill();
          this.forkProcess = void 0;
          this.stateMachine.changeState("stopped");
        });
        this.on("task:destroyed", () => {
          this.forkProcess?.kill();
          this.forkProcess = void 0;
          this.stateMachine.changeState("destroyed");
        });
      }
      getNextRun() {
        if (this.stateMachine.state !== "stopped") {
          const timeMatcher = new time_matcher_1.TimeMatcher(this.cronExpression, this.options?.timezone);
          return timeMatcher.getNextMatch(/* @__PURE__ */ new Date());
        }
        return null;
      }
      start() {
        return new Promise((resolve, reject) => {
          if (this.forkProcess) {
            return resolve(void 0);
          }
          const timeout = setTimeout(() => {
            reject(new Error("Start operation timed out"));
          }, 5e3);
          try {
            this.forkProcess = (0, child_process_1.fork)(daemonPath);
            this.forkProcess.on("error", (err) => {
              clearTimeout(timeout);
              reject(new Error(`Error on daemon: ${err.message}`));
            });
            this.forkProcess.on("exit", (code, signal) => {
              if (code !== 0 && signal !== "SIGTERM") {
                const erro = new Error(`node-cron daemon exited with code ${code || signal}`);
                logger_1.default.error(erro);
                clearTimeout(timeout);
                reject(erro);
              }
            });
            this.forkProcess.on("message", (message) => {
              if (message.jsonError) {
                if (message.context?.execution) {
                  message.context.execution.error = deserializeError(message.jsonError);
                  delete message.jsonError;
                }
              }
              if (message.context?.task?.state) {
                this.stateMachine.changeState(message.context?.task?.state);
              }
              if (message.context) {
                const execution = message.context?.execution;
                delete execution?.hasError;
                const context = this.createContext(new Date(message.context.date), execution);
                this.emitter.emit(message.event, context);
              }
            });
            this.once("task:started", () => {
              this.stateMachine.changeState("idle");
              clearTimeout(timeout);
              resolve(void 0);
            });
            this.forkProcess.send({
              command: "task:start",
              path: this.taskPath,
              cron: this.cronExpression,
              options: this.options
            });
          } catch (error) {
            reject(error);
          }
        });
      }
      stop() {
        return new Promise((resolve, reject) => {
          if (!this.forkProcess) {
            return resolve(void 0);
          }
          const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            reject(new Error("Stop operation timed out"));
          }, 5e3);
          const cleanupAndResolve = () => {
            clearTimeout(timeoutId);
            this.off("task:stopped", onStopped);
            this.forkProcess = void 0;
            resolve(void 0);
          };
          const onStopped = () => {
            cleanupAndResolve();
          };
          this.once("task:stopped", onStopped);
          this.forkProcess.send({
            command: "task:stop"
          });
        });
      }
      getStatus() {
        return this.stateMachine.state;
      }
      destroy() {
        return new Promise((resolve, reject) => {
          if (!this.forkProcess) {
            return resolve(void 0);
          }
          const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            reject(new Error("Destroy operation timed out"));
          }, 5e3);
          const onDestroy = () => {
            clearTimeout(timeoutId);
            this.off("task:destroyed", onDestroy);
            resolve(void 0);
          };
          this.once("task:destroyed", onDestroy);
          this.forkProcess.send({
            command: "task:destroy"
          });
        });
      }
      execute() {
        return new Promise((resolve, reject) => {
          if (!this.forkProcess) {
            return reject(new Error("Cannot execute background task because it hasn't been started yet. Please initialize the task using the start() method before attempting to execute it."));
          }
          const timeoutId = setTimeout(() => {
            cleanupListeners();
            reject(new Error("Execution timeout exceeded"));
          }, 5e3);
          const cleanupListeners = () => {
            clearTimeout(timeoutId);
            this.off("execution:finished", onFinished);
            this.off("execution:failed", onFail);
          };
          const onFinished = (context) => {
            cleanupListeners();
            resolve(context.execution?.result);
          };
          const onFail = (context) => {
            cleanupListeners();
            reject(context.execution?.error || new Error("Execution failed without specific error"));
          };
          this.once("execution:finished", onFinished);
          this.once("execution:failed", onFail);
          this.forkProcess.send({
            command: "task:execute"
          });
        });
      }
      on(event, fun) {
        this.emitter.on(event, fun);
      }
      off(event, fun) {
        this.emitter.off(event, fun);
      }
      once(event, fun) {
        this.emitter.once(event, fun);
      }
      createContext(executionDate, execution) {
        const localTime = new localized_time_1.LocalizedTime(executionDate, this.options?.timezone);
        const ctx = {
          date: localTime.toDate(),
          dateLocalIso: localTime.toISO(),
          triggeredAt: /* @__PURE__ */ new Date(),
          task: this,
          execution
        };
        return ctx;
      }
    };
    function deserializeError(str) {
      const data = JSON.parse(str);
      const Err = globalThis[data.name] || Error;
      const err = new Err(data.message);
      if (data.stack) {
        err.stack = data.stack;
      }
      Object.keys(data).forEach((key) => {
        if (!["name", "message", "stack"].includes(key)) {
          err[key] = data[key];
        }
      });
      return err;
    }
    exports.default = BackgroundScheduledTask;
  }
});

// node_modules/node-cron/dist/esm/node-cron.js
var require_node_cron = __commonJS({
  "node_modules/node-cron/dist/esm/node-cron.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nodeCron = exports.getTask = exports.getTasks = void 0;
    exports.schedule = schedule;
    exports.createTask = createTask;
    exports.solvePath = solvePath;
    exports.validate = validate;
    var inline_scheduled_task_1 = require_inline_scheduled_task();
    var task_registry_1 = require_task_registry();
    var pattern_validation_1 = __importDefault(require_pattern_validation());
    var background_scheduled_task_1 = __importDefault(require_background_scheduled_task());
    var path_1 = __importDefault(__require("path"));
    var url_1 = __require("url");
    var registry = new task_registry_1.TaskRegistry();
    function schedule(expression, func, options) {
      const task = createTask(expression, func, options);
      task.start();
      return task;
    }
    function createTask(expression, func, options) {
      let task;
      if (func instanceof Function) {
        task = new inline_scheduled_task_1.InlineScheduledTask(expression, func, options);
      } else {
        const taskPath = solvePath(func);
        task = new background_scheduled_task_1.default(expression, taskPath, options);
      }
      registry.add(task);
      return task;
    }
    function solvePath(filePath) {
      if (path_1.default.isAbsolute(filePath))
        return (0, url_1.pathToFileURL)(filePath).href;
      if (filePath.startsWith("file://"))
        return filePath;
      const stackLines = new Error().stack?.split("\n");
      if (stackLines) {
        stackLines?.shift();
        const callerLine = stackLines?.find((line) => {
          return line.indexOf(__filename) === -1;
        });
        const match = callerLine?.match(/(file:\/\/)?(((\/?)(\w:))?([/\\].+)):\d+:\d+/);
        if (match) {
          const dir = `${match[5] ?? ""}${path_1.default.dirname(match[6])}`;
          return (0, url_1.pathToFileURL)(path_1.default.resolve(dir, filePath)).href;
        }
      }
      throw new Error(`Could not locate task file ${filePath}`);
    }
    function validate(expression) {
      try {
        (0, pattern_validation_1.default)(expression);
        return true;
      } catch (e) {
        return false;
      }
    }
    exports.getTasks = registry.all;
    exports.getTask = registry.get;
    exports.nodeCron = {
      schedule,
      createTask,
      validate,
      getTasks: exports.getTasks,
      getTask: exports.getTask
    };
    exports.default = exports.nodeCron;
  }
});

// node_modules/commander/lib/error.js
var require_error = __commonJS({
  "node_modules/commander/lib/error.js"(exports) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports.CommanderError = CommanderError2;
    exports.InvalidArgumentError = InvalidArgumentError2;
  }
});

// node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "node_modules/commander/lib/argument.js"(exports) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.endsWith("...")) {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @package
       */
      _collectValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        previous.push(value);
        return previous;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._collectValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       *
       * @returns {Argument}
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       *
       * @returns {Argument}
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports.Argument = Argument2;
    exports.humanReadableArgName = humanReadableArgName;
  }
});

// node_modules/commander/lib/help.js
var require_help = __commonJS({
  "node_modules/commander/lib/help.js"(exports) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.minWidthToWrap = 40;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
       * and just before calling `formatHelp()`.
       *
       * Commander just uses the helpWidth and the rest is provided for optional use by more complex subclasses.
       *
       * @param {{ error?: boolean, helpWidth?: number, outputHasColors?: boolean }} contextOptions
       */
      prepareContext(contextOptions) {
        this.helpWidth = this.helpWidth ?? contextOptions.helpWidth ?? 80;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        const helpCommand = cmd._getHelpCommand();
        if (helpCommand && !helpCommand._hidden) {
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns {number}
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const helpOption = cmd._getHelpOption();
        if (helpOption && !helpOption.hidden) {
          const removeShort = helpOption.short && cmd._findOption(helpOption.short);
          const removeLong = helpOption.long && cmd._findOption(helpOption.long);
          if (!removeShort && !removeLong) {
            visibleOptions.push(helpOption);
          } else if (helpOption.long && !removeLong) {
            visibleOptions.push(
              cmd.createOption(helpOption.long, helpOption.description)
            );
          } else if (helpOption.short && !removeShort) {
            visibleOptions.push(
              cmd.createOption(helpOption.short, helpOption.description)
            );
          }
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions) return [];
        const globalOptions = [];
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          const visibleOptions = ancestorCmd.options.filter(
            (option) => !option.hidden
          );
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd.registeredArguments.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd.registeredArguments.find((argument) => argument.description)) {
          return cmd.registeredArguments;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(
            max,
            this.displayWidth(
              helper.styleSubcommandTerm(helper.subcommandTerm(command))
            )
          );
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(
            max,
            this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
          );
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(
            max,
            this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
          );
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(
            max,
            this.displayWidth(
              helper.styleArgumentTerm(helper.argumentTerm(argument))
            )
          );
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let ancestorCmdNames = "";
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
        }
        return ancestorCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(
              `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`
            );
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          const extraDescription = `(${extraInfo.join(", ")})`;
          if (option.description) {
            return `${option.description} ${extraDescription}`;
          }
          return extraDescription;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(
            `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`
          );
        }
        if (extraInfo.length > 0) {
          const extraDescription = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescription}`;
          }
          return extraDescription;
        }
        return argument.description;
      }
      /**
       * Format a list of items, given a heading and an array of formatted items.
       *
       * @param {string} heading
       * @param {string[]} items
       * @param {Help} helper
       * @returns string[]
       */
      formatItemList(heading, items, helper) {
        if (items.length === 0) return [];
        return [helper.styleTitle(heading), ...items, ""];
      }
      /**
       * Group items by their help group heading.
       *
       * @param {Command[] | Option[]} unsortedItems
       * @param {Command[] | Option[]} visibleItems
       * @param {Function} getGroup
       * @returns {Map<string, Command[] | Option[]>}
       */
      groupItems(unsortedItems, visibleItems, getGroup) {
        const result = /* @__PURE__ */ new Map();
        unsortedItems.forEach((item) => {
          const group = getGroup(item);
          if (!result.has(group)) result.set(group, []);
        });
        visibleItems.forEach((item) => {
          const group = getGroup(item);
          if (!result.has(group)) {
            result.set(group, []);
          }
          result.get(group).push(item);
        });
        return result;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth ?? 80;
        function callFormatItem(term, description) {
          return helper.formatItem(term, termWidth, description, helper);
        }
        let output = [
          `${helper.styleTitle("Usage:")} ${helper.styleUsage(helper.commandUsage(cmd))}`,
          ""
        ];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([
            helper.boxWrap(
              helper.styleCommandDescription(commandDescription),
              helpWidth
            ),
            ""
          ]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return callFormatItem(
            helper.styleArgumentTerm(helper.argumentTerm(argument)),
            helper.styleArgumentDescription(helper.argumentDescription(argument))
          );
        });
        output = output.concat(
          this.formatItemList("Arguments:", argumentList, helper)
        );
        const optionGroups = this.groupItems(
          cmd.options,
          helper.visibleOptions(cmd),
          (option) => option.helpGroupHeading ?? "Options:"
        );
        optionGroups.forEach((options, group) => {
          const optionList = options.map((option) => {
            return callFormatItem(
              helper.styleOptionTerm(helper.optionTerm(option)),
              helper.styleOptionDescription(helper.optionDescription(option))
            );
          });
          output = output.concat(this.formatItemList(group, optionList, helper));
        });
        if (helper.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return callFormatItem(
              helper.styleOptionTerm(helper.optionTerm(option)),
              helper.styleOptionDescription(helper.optionDescription(option))
            );
          });
          output = output.concat(
            this.formatItemList("Global Options:", globalOptionList, helper)
          );
        }
        const commandGroups = this.groupItems(
          cmd.commands,
          helper.visibleCommands(cmd),
          (sub) => sub.helpGroup() || "Commands:"
        );
        commandGroups.forEach((commands, group) => {
          const commandList = commands.map((sub) => {
            return callFormatItem(
              helper.styleSubcommandTerm(helper.subcommandTerm(sub)),
              helper.styleSubcommandDescription(helper.subcommandDescription(sub))
            );
          });
          output = output.concat(this.formatItemList(group, commandList, helper));
        });
        return output.join("\n");
      }
      /**
       * Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations.
       *
       * @param {string} str
       * @returns {number}
       */
      displayWidth(str) {
        return stripColor(str).length;
      }
      /**
       * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
       *
       * @param {string} str
       * @returns {string}
       */
      styleTitle(str) {
        return str;
      }
      styleUsage(str) {
        return str.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word === "[command]") return this.styleSubcommandText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleCommandText(word);
        }).join(" ");
      }
      styleCommandDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleOptionDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleSubcommandDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleArgumentDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleDescriptionText(str) {
        return str;
      }
      styleOptionTerm(str) {
        return this.styleOptionText(str);
      }
      styleSubcommandTerm(str) {
        return str.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleSubcommandText(word);
        }).join(" ");
      }
      styleArgumentTerm(str) {
        return this.styleArgumentText(str);
      }
      styleOptionText(str) {
        return str;
      }
      styleArgumentText(str) {
        return str;
      }
      styleSubcommandText(str) {
        return str;
      }
      styleCommandText(str) {
        return str;
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Detect manually wrapped and indented strings by checking for line break followed by whitespace.
       *
       * @param {string} str
       * @returns {boolean}
       */
      preformatted(str) {
        return /\n[^\S\r\n]/.test(str);
      }
      /**
       * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
       *
       * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
       *   TTT  DDD DDDD
       *        DD DDD
       *
       * @param {string} term
       * @param {number} termWidth
       * @param {string} description
       * @param {Help} helper
       * @returns {string}
       */
      formatItem(term, termWidth, description, helper) {
        const itemIndent = 2;
        const itemIndentStr = " ".repeat(itemIndent);
        if (!description) return itemIndentStr + term;
        const paddedTerm = term.padEnd(
          termWidth + term.length - helper.displayWidth(term)
        );
        const spacerWidth = 2;
        const helpWidth = this.helpWidth ?? 80;
        const remainingWidth = helpWidth - termWidth - spacerWidth - itemIndent;
        let formattedDescription;
        if (remainingWidth < this.minWidthToWrap || helper.preformatted(description)) {
          formattedDescription = description;
        } else {
          const wrappedDescription = helper.boxWrap(description, remainingWidth);
          formattedDescription = wrappedDescription.replace(
            /\n/g,
            "\n" + " ".repeat(termWidth + spacerWidth)
          );
        }
        return itemIndentStr + paddedTerm + " ".repeat(spacerWidth) + formattedDescription.replace(/\n/g, `
${itemIndentStr}`);
      }
      /**
       * Wrap a string at whitespace, preserving existing line breaks.
       * Wrapping is skipped if the width is less than `minWidthToWrap`.
       *
       * @param {string} str
       * @param {number} width
       * @returns {string}
       */
      boxWrap(str, width) {
        if (width < this.minWidthToWrap) return str;
        const rawLines = str.split(/\r\n|\n/);
        const chunkPattern = /[\s]*[^\s]+/g;
        const wrappedLines = [];
        rawLines.forEach((line) => {
          const chunks = line.match(chunkPattern);
          if (chunks === null) {
            wrappedLines.push("");
            return;
          }
          let sumChunks = [chunks.shift()];
          let sumWidth = this.displayWidth(sumChunks[0]);
          chunks.forEach((chunk) => {
            const visibleWidth = this.displayWidth(chunk);
            if (sumWidth + visibleWidth <= width) {
              sumChunks.push(chunk);
              sumWidth += visibleWidth;
              return;
            }
            wrappedLines.push(sumChunks.join(""));
            const nextChunk = chunk.trimStart();
            sumChunks = [nextChunk];
            sumWidth = this.displayWidth(nextChunk);
          });
          wrappedLines.push(sumChunks.join(""));
        });
        return wrappedLines.join("\n");
      }
    };
    function stripColor(str) {
      const sgrPattern = /\x1b\[\d*(;\d*)*m/g;
      return str.replace(sgrPattern, "");
    }
    exports.Help = Help2;
    exports.stripColor = stripColor;
  }
});

// node_modules/commander/lib/option.js
var require_option = __commonJS({
  "node_modules/commander/lib/option.js"(exports) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
        this.helpGroupHeading = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {*} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {(string | string[])} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @package
       */
      _collectValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        previous.push(value);
        return previous;
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._collectValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as an object attribute key.
       *
       * @return {string}
       */
      attributeName() {
        if (this.negate) {
          return camelcase(this.name().replace(/^no-/, ""));
        }
        return camelcase(this.name());
      }
      /**
       * Set the help group heading.
       *
       * @param {string} heading
       * @return {Option}
       */
      helpGroup(heading) {
        this.helpGroupHeading = heading;
        return this;
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @package
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @package
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {*} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey)) return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const shortFlagExp = /^-[^-]$/;
      const longFlagExp = /^--[^-]/;
      const flagParts = flags.split(/[ |,]+/).concat("guard");
      if (shortFlagExp.test(flagParts[0])) shortFlag = flagParts.shift();
      if (longFlagExp.test(flagParts[0])) longFlag = flagParts.shift();
      if (!shortFlag && shortFlagExp.test(flagParts[0]))
        shortFlag = flagParts.shift();
      if (!shortFlag && longFlagExp.test(flagParts[0])) {
        shortFlag = longFlag;
        longFlag = flagParts.shift();
      }
      if (flagParts[0].startsWith("-")) {
        const unsupportedFlag = flagParts[0];
        const baseError = `option creation failed due to '${unsupportedFlag}' in option flags '${flags}'`;
        if (/^-[^-][^-]/.test(unsupportedFlag))
          throw new Error(
            `${baseError}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`
          );
        if (shortFlagExp.test(unsupportedFlag))
          throw new Error(`${baseError}
- too many short flags`);
        if (longFlagExp.test(unsupportedFlag))
          throw new Error(`${baseError}
- too many long flags`);
        throw new Error(`${baseError}
- unrecognised flag format`);
      }
      if (shortFlag === void 0 && longFlag === void 0)
        throw new Error(
          `option creation failed due to no flags found in '${flags}'.`
        );
      return { shortFlag, longFlag };
    }
    exports.Option = Option2;
    exports.DualOptions = DualOptions;
  }
});

// node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "node_modules/commander/lib/suggestSimilar.js"(exports) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0) return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1) return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports.suggestSimilar = suggestSimilar;
  }
});

// node_modules/commander/lib/command.js
var require_command = __commonJS({
  "node_modules/commander/lib/command.js"(exports) {
    var EventEmitter = __require("node:events").EventEmitter;
    var childProcess = __require("node:child_process");
    var path = __require("node:path");
    var fs3 = __require("node:fs");
    var process4 = __require("node:process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2, stripColor } = require_help();
    var { Option: Option2, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = false;
        this.registeredArguments = [];
        this._args = this.registeredArguments;
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._savedState = null;
        this._outputConfiguration = {
          writeOut: (str) => process4.stdout.write(str),
          writeErr: (str) => process4.stderr.write(str),
          outputError: (str, write) => write(str),
          getOutHelpWidth: () => process4.stdout.isTTY ? process4.stdout.columns : void 0,
          getErrHelpWidth: () => process4.stderr.isTTY ? process4.stderr.columns : void 0,
          getOutHasColors: () => useColor() ?? (process4.stdout.isTTY && process4.stdout.hasColors?.()),
          getErrHasColors: () => useColor() ?? (process4.stderr.isTTY && process4.stderr.hasColors?.()),
          stripColor: (str) => stripColor(str)
        };
        this._hidden = false;
        this._helpOption = void 0;
        this._addImplicitHelpCommand = void 0;
        this._helpCommand = void 0;
        this._helpConfiguration = {};
        this._helpGroupHeading = void 0;
        this._defaultCommandGroup = void 0;
        this._defaultOptionGroup = void 0;
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._helpOption = sourceCommand._helpOption;
        this._helpCommand = sourceCommand._helpCommand;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * @returns {Command[]}
       * @private
       */
      _getCommandAndAncestors() {
        const result = [];
        for (let command = this; command; command = command.parent) {
          result.push(command);
        }
        return result;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args) cmd.arguments(args);
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc) return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0) return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // change how output being written, defaults to stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // change how output being written for errors, defaults to writeErr
       *     outputError(str, write) // used for displaying errors and not used for displaying help
       *     // specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // color support, currently only used with Help
       *     getOutHasColors()
       *     getErrHasColors()
       *     stripColor() // used to remove ANSI escape codes if output does not have colors
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0) return this._outputConfiguration;
        this._outputConfiguration = {
          ...this._outputConfiguration,
          ...configuration
        };
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {(boolean|string)} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string") displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden) cmd._hidden = true;
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd._checkForBrokenPassThrough();
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom argument processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, parseArg, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof parseArg === "function") {
          argument.default(defaultValue).argParser(parseArg);
        } else {
          argument.default(parseArg);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this.registeredArguments.slice(-1)[0];
        if (previousArgument?.variadic) {
          throw new Error(
            `only the last argument can be variadic '${previousArgument.name()}'`
          );
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(
            `a default value for a required argument is never used: '${argument.name()}'`
          );
        }
        this.registeredArguments.push(argument);
        return this;
      }
      /**
       * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
       *
       * @example
       *    program.helpCommand('help [cmd]');
       *    program.helpCommand('help [cmd]', 'show help');
       *    program.helpCommand(false); // suppress default help command
       *    program.helpCommand(true); // add help command even if no subcommands
       *
       * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
       * @param {string} [description] - custom description
       * @return {Command} `this` command for chaining
       */
      helpCommand(enableOrNameAndArgs, description) {
        if (typeof enableOrNameAndArgs === "boolean") {
          this._addImplicitHelpCommand = enableOrNameAndArgs;
          if (enableOrNameAndArgs && this._defaultCommandGroup) {
            this._initCommandGroup(this._getHelpCommand());
          }
          return this;
        }
        const nameAndArgs = enableOrNameAndArgs ?? "help [command]";
        const [, helpName, helpArgs] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const helpDescription = description ?? "display help for command";
        const helpCommand = this.createCommand(helpName);
        helpCommand.helpOption(false);
        if (helpArgs) helpCommand.arguments(helpArgs);
        if (helpDescription) helpCommand.description(helpDescription);
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        if (enableOrNameAndArgs || description) this._initCommandGroup(helpCommand);
        return this;
      }
      /**
       * Add prepared custom help command.
       *
       * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
       * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(helpCommand, deprecatedDescription) {
        if (typeof helpCommand !== "object") {
          this.helpCommand(helpCommand, deprecatedDescription);
          return this;
        }
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        this._initCommandGroup(helpCommand);
        return this;
      }
      /**
       * Lazy create help command.
       *
       * @return {(Command|null)}
       * @package
       */
      _getHelpCommand() {
        const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
        if (hasImplicitHelpCommand) {
          if (this._helpCommand === void 0) {
            this.helpCommand(void 0, void 0);
          }
          return this._helpCommand;
        }
        return null;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process4.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this.registeredArguments.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Wrap parseArgs to catch 'commander.invalidArgument'.
       *
       * @param {(Option | Argument)} target
       * @param {string} value
       * @param {*} previous
       * @param {string} invalidArgumentMessage
       * @private
       */
      _callParseArg(target, value, previous, invalidArgumentMessage) {
        try {
          return target.parseArg(value, previous);
        } catch (err) {
          if (err.code === "commander.invalidArgument") {
            const message = `${invalidArgumentMessage} ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      }
      /**
       * Check for option flag conflicts.
       * Register option if no conflicts found, or throw on conflict.
       *
       * @param {Option} option
       * @private
       */
      _registerOption(option) {
        const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
        if (matchingOption) {
          const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
          throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
        }
        this._initOptionGroup(option);
        this.options.push(option);
      }
      /**
       * Check for command name and alias conflicts with existing commands.
       * Register command if no conflicts found, or throw on conflict.
       *
       * @param {Command} command
       * @private
       */
      _registerCommand(command) {
        const knownBy = (cmd) => {
          return [cmd.name()].concat(cmd.aliases());
        };
        const alreadyUsed = knownBy(command).find(
          (name) => this._findCommand(name)
        );
        if (alreadyUsed) {
          const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
          const newCmd = knownBy(command).join("|");
          throw new Error(
            `cannot add command '${newCmd}' as already have command '${existingCmd}'`
          );
        }
        this._initCommandGroup(command);
        this.commands.push(command);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        this._registerOption(option);
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(
              name,
              option.defaultValue === void 0 ? true : option.defaultValue,
              "default"
            );
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            val = this._callParseArg(option, val, oldValue, invalidValueMessage);
          } else if (val !== null && option.variadic) {
            val = option._collectValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @return {Command} `this` command for chaining
       * @private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error(
            "To add an Option object use addOption() instead of option() or requiredOption()"
          );
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
       * option-argument is indicated by `<>` and an optional option-argument by `[]`.
       *
       * See the README for more details, and see also addOption() and requiredOption().
       *
       * @example
       * program
       *     .option('-p, --pepper', 'add pepper')
       *     .option('--pt, --pizza-type <TYPE>', 'type of pizza') // required option-argument
       *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
       *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, parseArg, defaultValue) {
        return this._optionEx({}, flags, description, parseArg, defaultValue);
      }
      /**
       * Add a required option which must have a value after parsing. This usually means
       * the option must be specified on the command line. (Otherwise the same as .option().)
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      requiredOption(flags, description, parseArg, defaultValue) {
        return this._optionEx(
          { mandatory: true },
          flags,
          description,
          parseArg,
          defaultValue
        );
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
       * @return {Command} `this` command for chaining
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
       * @return {Command} `this` command for chaining
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
       * @return {Command} `this` command for chaining
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {boolean} [positional]
       * @return {Command} `this` command for chaining
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {boolean} [passThrough] for unknown options.
       * @return {Command} `this` command for chaining
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        this._checkForBrokenPassThrough();
        return this;
      }
      /**
       * @private
       */
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
          throw new Error(
            `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
          );
        }
      }
      /**
       * Whether to store option values as properties on command object,
       * or store separately (specify false). In both cases the option values can be accessed using .opts().
       *
       * @param {boolean} [storeAsProperties=true]
       * @return {Command} `this` command for chaining
       */
      storeOptionsAsProperties(storeAsProperties = true) {
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        if (Object.keys(this._optionValues).length) {
          throw new Error(
            "call .storeOptionsAsProperties() before setting option values"
          );
        }
        this._storeOptionsAsProperties = !!storeAsProperties;
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
       * Store option value and where the value came from.
       *
       * @param {string} key
       * @param {object} value
       * @param {string} source - expected values are default/config/env/cli/implied
       * @return {Command} `this` command for chaining
       */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
       * Get source of option value.
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
       * Get source of option value. See also .optsWithGlobals().
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSourceWithGlobals(key) {
        let source;
        this._getCommandAndAncestors().forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @private
       */
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0 && parseOptions.from === void 0) {
          if (process4.versions?.electron) {
            parseOptions.from = "electron";
          }
          const execArgv = process4.execArgv ?? [];
          if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
            parseOptions.from = "eval";
          }
        }
        if (argv === void 0) {
          argv = process4.argv;
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process4.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          case "eval":
            userArgs = argv.slice(1);
            break;
          default:
            throw new Error(
              `unexpected parse option { from: '${parseOptions.from}' }`
            );
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * program.parse(); // parse process.argv and auto-detect electron and special node flags
       * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions) {
        this._prepareForParse();
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
       * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions) {
        this._prepareForParse();
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      _prepareForParse() {
        if (this._savedState === null) {
          this.saveStateBeforeParse();
        } else {
          this.restoreStateBeforeParse();
        }
      }
      /**
       * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
       * Not usually called directly, but available for subclasses to save their custom state.
       *
       * This is called in a lazy way. Only commands used in parsing chain will have state saved.
       */
      saveStateBeforeParse() {
        this._savedState = {
          // name is stable if supplied by author, but may be unspecified for root command and deduced during parsing
          _name: this._name,
          // option values before parse have default values (including false for negated options)
          // shallow clones
          _optionValues: { ...this._optionValues },
          _optionValueSources: { ...this._optionValueSources }
        };
      }
      /**
       * Restore state before parse for calls after the first.
       * Not usually called directly, but available for subclasses to save their custom state.
       *
       * This is called in a lazy way. Only commands used in parsing chain will have state restored.
       */
      restoreStateBeforeParse() {
        if (this._storeOptionsAsProperties)
          throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
        this._name = this._savedState._name;
        this._scriptPath = null;
        this.rawArgs = [];
        this._optionValues = { ...this._savedState._optionValues };
        this._optionValueSources = { ...this._savedState._optionValueSources };
        this.args = [];
        this.processedArgs = [];
      }
      /**
       * Throw if expected executable is missing. Add lots of help for author.
       *
       * @param {string} executableFile
       * @param {string} executableDir
       * @param {string} subcommandName
       */
      _checkForMissingExecutable(executableFile, executableDir, subcommandName) {
        if (fs3.existsSync(executableFile)) return;
        const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
        const executableMissing = `'${executableFile}' does not exist
 - if '${subcommandName}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
        throw new Error(executableMissing);
      }
      /**
       * Execute a sub-command executable.
       *
       * @private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path.resolve(baseDir, baseName);
          if (fs3.existsSync(localBin)) return localBin;
          if (sourceExt.includes(path.extname(baseName))) return void 0;
          const foundExt = sourceExt.find(
            (ext) => fs3.existsSync(`${localBin}${ext}`)
          );
          if (foundExt) return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs3.realpathSync(this._scriptPath);
          } catch {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path.resolve(
            path.dirname(resolvedScriptPath),
            executableDir
          );
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path.basename(
              this._scriptPath,
              path.extname(this._scriptPath)
            );
            if (legacyName !== this._name) {
              localFile = findFile(
                executableDir,
                `${legacyName}-${subcommand._name}`
              );
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path.extname(executableFile));
        let proc;
        if (process4.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process4.execArgv).concat(args);
            proc = childProcess.spawn(process4.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          this._checkForMissingExecutable(
            executableFile,
            executableDir,
            subcommand._name
          );
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process4.execArgv).concat(args);
          proc = childProcess.spawn(process4.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process4.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        proc.on("close", (code) => {
          code = code ?? 1;
          if (!exitCallback) {
            process4.exit(code);
          } else {
            exitCallback(
              new CommanderError2(
                code,
                "commander.executeSubCommandAsync",
                "(close)"
              )
            );
          }
        });
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            this._checkForMissingExecutable(
              executableFile,
              executableDir,
              subcommand._name
            );
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process4.exit(1);
          } else {
            const wrappedError = new CommanderError2(
              1,
              "commander.executeSubCommandAsync",
              "(error)"
            );
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand) this.help({ error: true });
        subCommand._prepareForParse();
        let promiseChain;
        promiseChain = this._chainOrCallSubCommandHook(
          promiseChain,
          subCommand,
          "preSubcommand"
        );
        promiseChain = this._chainOrCall(promiseChain, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return promiseChain;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(
          subcommandName,
          [],
          [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
        );
      }
      /**
       * Check this.args against expected this.registeredArguments.
       *
       * @private
       */
      _checkNumberOfArguments() {
        this.registeredArguments.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
          return;
        }
        if (this.args.length > this.registeredArguments.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this.registeredArguments and save as this.processedArgs!
       *
       * @private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
            parsedValue = this._callParseArg(
              argument,
              value,
              previous,
              invalidValueMessage
            );
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this.registeredArguments.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {(Promise|undefined)} promise
       * @param {Function} fn
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCall(promise, fn) {
        if (promise?.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          this._outputHelpIfRequested(unknown);
          return this._dispatchSubcommand(
            this._defaultCommandName,
            operands,
            unknown
          );
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        this._outputHelpIfRequested(parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let promiseChain;
          promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
          promiseChain = this._chainOrCall(
            promiseChain,
            () => this._actionHandler(this.processedArgs)
          );
          if (this.parent) {
            promiseChain = this._chainOrCall(promiseChain, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
          return promiseChain;
        }
        if (this.parent?.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @private
       * @return {Command | undefined}
       */
      _findCommand(name) {
        if (!name) return void 0;
        return this.commands.find(
          (cmd) => cmd._name === name || cmd._aliases.includes(name)
        );
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @package
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        });
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter((option) => {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === void 0) {
            return false;
          }
          return this.getOptionValueSource(optionKey) !== "default";
        });
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd._checkForConflictingLocalOptions();
        });
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Side effects: modifies command by storing options. Does not reset state if called again.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {string[]} args
       * @return {{operands: string[], unknown: string[]}}
       */
      parseOptions(args) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        const negativeNumberArg = (arg) => {
          if (!/^-\d*\.?\d+(e[+-]?\d+)?$/.test(arg)) return false;
          return !this._getCommandAndAncestors().some(
            (cmd) => cmd.options.map((opt) => opt.short).some((short) => /^-\d$/.test(short))
          );
        };
        let activeVariadicOption = null;
        let activeGroup = null;
        let i = 0;
        while (i < args.length || activeGroup) {
          const arg = activeGroup ?? args[i++];
          activeGroup = null;
          if (arg === "--") {
            if (dest === unknown) dest.push(arg);
            dest.push(...args.slice(i));
            break;
          }
          if (activeVariadicOption && (!maybeOption(arg) || negativeNumberArg(arg))) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args[i++];
                if (value === void 0) this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (i < args.length && (!maybeOption(args[i]) || negativeNumberArg(args[i]))) {
                  value = args[i++];
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                activeGroup = `-${arg.slice(2)}`;
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (dest === operands && maybeOption(arg) && !(this.commands.length === 0 && negativeNumberArg(arg))) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              unknown.push(...args.slice(i));
              break;
            } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
              operands.push(arg, ...args.slice(i));
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg, ...args.slice(i));
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg, ...args.slice(i));
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {object}
       */
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(
          `${message}
`,
          this._outputConfiguration.writeErr
        );
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process4.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(
              this.getOptionValueSource(optionKey)
            )) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process4.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter(
          (option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option
          )
        ).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              "implied"
            );
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find(
            (target) => target.negate && optionKey === target.attributeName()
          );
          const positiveOption = this.options.find(
            (target) => !target.negate && optionKey === target.attributeName()
          );
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption) return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments) return;
        const expected = this.registeredArguments.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias()) candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Get or set the program version.
       *
       * This method auto-registers the "-V, --version" option which will print the version number.
       *
       * You can optionally supply the flags and description to override the defaults.
       *
       * @param {string} [str]
       * @param {string} [flags]
       * @param {string} [description]
       * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
       */
      version(str, flags, description) {
        if (str === void 0) return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {object} [argsDescription]
       * @return {(string|Command)}
       */
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      summary(str) {
        if (str === void 0) return this._summary;
        this._summary = str;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {(string|Command)}
       */
      alias(alias) {
        if (alias === void 0) return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        const matchingCommand = this.parent?._findCommand(alias);
        if (matchingCommand) {
          const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
          throw new Error(
            `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`
          );
        }
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {(string[]|Command)}
       */
      aliases(aliases) {
        if (aliases === void 0) return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      usage(str) {
        if (str === void 0) {
          if (this._usage) return this._usage;
          const args = this.registeredArguments.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._helpOption !== null ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this.registeredArguments.length ? args : []
          ).join(" ");
        }
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str) {
        if (str === void 0) return this._name;
        this._name = str;
        return this;
      }
      /**
       * Set/get the help group heading for this subcommand in parent command's help.
       *
       * @param {string} [heading]
       * @return {Command | string}
       */
      helpGroup(heading) {
        if (heading === void 0) return this._helpGroupHeading ?? "";
        this._helpGroupHeading = heading;
        return this;
      }
      /**
       * Set/get the default help group heading for subcommands added to this command.
       * (This does not override a group set directly on the subcommand using .helpGroup().)
       *
       * @example
       * program.commandsGroup('Development Commands:);
       * program.command('watch')...
       * program.command('lint')...
       * ...
       *
       * @param {string} [heading]
       * @returns {Command | string}
       */
      commandsGroup(heading) {
        if (heading === void 0) return this._defaultCommandGroup ?? "";
        this._defaultCommandGroup = heading;
        return this;
      }
      /**
       * Set/get the default help group heading for options added to this command.
       * (This does not override a group set directly on the option using .helpGroup().)
       *
       * @example
       * program
       *   .optionsGroup('Development Options:')
       *   .option('-d, --debug', 'output extra debugging')
       *   .option('-p, --profile', 'output profiling information')
       *
       * @param {string} [heading]
       * @returns {Command | string}
       */
      optionsGroup(heading) {
        if (heading === void 0) return this._defaultOptionGroup ?? "";
        this._defaultOptionGroup = heading;
        return this;
      }
      /**
       * @param {Option} option
       * @private
       */
      _initOptionGroup(option) {
        if (this._defaultOptionGroup && !option.helpGroupHeading)
          option.helpGroup(this._defaultOptionGroup);
      }
      /**
       * @param {Command} cmd
       * @private
       */
      _initCommandGroup(cmd) {
        if (this._defaultCommandGroup && !cmd.helpGroup())
          cmd.helpGroup(this._defaultCommandGroup);
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path.basename(filename, path.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {(string|null|Command)}
       */
      executableDir(path2) {
        if (path2 === void 0) return this._executableDir;
        this._executableDir = path2;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        const context = this._getOutputContext(contextOptions);
        helper.prepareContext({
          error: context.error,
          helpWidth: context.helpWidth,
          outputHasColors: context.hasColors
        });
        const text = helper.formatHelp(this, helper);
        if (context.hasColors) return text;
        return this._outputConfiguration.stripColor(text);
      }
      /**
       * @typedef HelpContext
       * @type {object}
       * @property {boolean} error
       * @property {number} helpWidth
       * @property {boolean} hasColors
       * @property {function} write - includes stripColor if needed
       *
       * @returns {HelpContext}
       * @private
       */
      _getOutputContext(contextOptions) {
        contextOptions = contextOptions || {};
        const error = !!contextOptions.error;
        let baseWrite;
        let hasColors;
        let helpWidth;
        if (error) {
          baseWrite = (str) => this._outputConfiguration.writeErr(str);
          hasColors = this._outputConfiguration.getErrHasColors();
          helpWidth = this._outputConfiguration.getErrHelpWidth();
        } else {
          baseWrite = (str) => this._outputConfiguration.writeOut(str);
          hasColors = this._outputConfiguration.getOutHasColors();
          helpWidth = this._outputConfiguration.getOutHelpWidth();
        }
        const write = (str) => {
          if (!hasColors) str = this._outputConfiguration.stripColor(str);
          return baseWrite(str);
        };
        return { error, write, hasColors, helpWidth };
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const outputContext = this._getOutputContext(contextOptions);
        const eventContext = {
          error: outputContext.error,
          write: outputContext.write,
          command: this
        };
        this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", eventContext));
        this.emit("beforeHelp", eventContext);
        let helpInformation = this.helpInformation({ error: outputContext.error });
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        outputContext.write(helpInformation);
        if (this._getHelpOption()?.long) {
          this.emit(this._getHelpOption().long);
        }
        this.emit("afterHelp", eventContext);
        this._getCommandAndAncestors().forEach(
          (command) => command.emit("afterAllHelp", eventContext)
        );
      }
      /**
       * You can pass in flags and a description to customise the built-in help option.
       * Pass in false to disable the built-in help option.
       *
       * @example
       * program.helpOption('-?, --help' 'show help'); // customise
       * program.helpOption(false); // disable
       *
       * @param {(string | boolean)} flags
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          if (flags) {
            if (this._helpOption === null) this._helpOption = void 0;
            if (this._defaultOptionGroup) {
              this._initOptionGroup(this._getHelpOption());
            }
          } else {
            this._helpOption = null;
          }
          return this;
        }
        this._helpOption = this.createOption(
          flags ?? "-h, --help",
          description ?? "display help for command"
        );
        if (flags || description) this._initOptionGroup(this._helpOption);
        return this;
      }
      /**
       * Lazy create help option.
       * Returns null if has been disabled with .helpOption(false).
       *
       * @returns {(Option | null)} the help option
       * @package
       */
      _getHelpOption() {
        if (this._helpOption === void 0) {
          this.helpOption(void 0, void 0);
        }
        return this._helpOption;
      }
      /**
       * Supply your own option to use for the built-in help option.
       * This is an alternative to using helpOption() to customise the flags and description etc.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addHelpOption(option) {
        this._helpOption = option;
        this._initOptionGroup(option);
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = Number(process4.exitCode ?? 0);
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * // Do a little typing to coordinate emit and listener for the help text events.
       * @typedef HelpTextEventContext
       * @type {object}
       * @property {boolean} error
       * @property {Command} command
       * @property {function} write
       */
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {(string | Function)} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
      /**
       * Output help information if help flags specified
       *
       * @param {Array} args - array of options to search for help flags
       * @private
       */
      _outputHelpIfRequested(args) {
        const helpOption = this._getHelpOption();
        const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
        if (helpRequested) {
          this.outputHelp();
          this._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    };
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    function useColor() {
      if (process4.env.NO_COLOR || process4.env.FORCE_COLOR === "0" || process4.env.FORCE_COLOR === "false")
        return false;
      if (process4.env.FORCE_COLOR || process4.env.CLICOLOR_FORCE !== void 0)
        return true;
      return void 0;
    }
    exports.Command = Command2;
    exports.useColor = useColor;
  }
});

// node_modules/commander/index.js
var require_commander = __commonJS({
  "node_modules/commander/index.js"(exports) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports.program = new Command2();
    exports.createCommand = (name) => new Command2(name);
    exports.createOption = (flags, description) => new Option2(flags, description);
    exports.createArgument = (name, description) => new Argument2(name, description);
    exports.Command = Command2;
    exports.Option = Option2;
    exports.Argument = Argument2;
    exports.Help = Help2;
    exports.CommanderError = CommanderError2;
    exports.InvalidArgumentError = InvalidArgumentError2;
    exports.InvalidOptionArgumentError = InvalidArgumentError2;
  }
});

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey2 = `${label}#${next}`;
    if (!patternCache[cacheKey2]) {
      if (match[2]) {
        patternCache[cacheKey2] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey2, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey2] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey2];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param ? /\%/.test(param) ? tryDecodeURIComponent(param) : param : void 0;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var Context = class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app) {
    const subApp = this.basePath(path);
    app.routes.map((r) => {
      let handler;
      if (app.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
var cors = (options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.origin !== "*") {
      const existingVary = c.req.header("Vary");
      if (existingVary) {
        set("Vary", existingVary);
      } else {
        set("Vary", "Origin");
      }
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
  };
};

// node_modules/hono/dist/helper/factory/index.js
var createMiddleware = (middleware) => middleware;

// middleware/config.ts
function createConfigMiddleware(options) {
  return createMiddleware(async (c, next) => {
    c.set("config", options);
    await next();
  });
}

// utils/fs.ts
import { promises as fs } from "node:fs";
import { constants as fsConstants } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
async function readTextFile(path) {
  return await fs.readFile(path, "utf8");
}
async function readBinaryFile(path) {
  const buffer = await fs.readFile(path);
  return new Uint8Array(buffer);
}
async function writeTextFile(path, content, options) {
  await fs.writeFile(path, content, "utf8");
  if (options?.mode !== void 0) {
    await fs.chmod(path, options.mode);
  }
}
async function exists(path) {
  try {
    await fs.access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}
async function stat(path) {
  const stats = await fs.stat(path);
  return {
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory(),
    isSymlink: stats.isSymbolicLink(),
    size: stats.size,
    mtime: stats.mtime
  };
}
async function* readDir(path) {
  const entries = await fs.readdir(path, { withFileTypes: true });
  for (const entry of entries) {
    yield {
      name: entry.name,
      isFile: entry.isFile(),
      isDirectory: entry.isDirectory(),
      isSymlink: entry.isSymbolicLink()
    };
  }
}
async function mkdir(path) {
  await fs.mkdir(path, { recursive: true });
}
async function withTempDir(callback) {
  const tempDir = await fs.mkdtemp(join(tmpdir(), "claude-code-webui-temp-"));
  try {
    return await callback(tempDir);
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
    }
  }
}

// utils/os.ts
import { homedir } from "node:os";
import process2 from "node:process";
function getEnv(key) {
  return process2.env[key];
}
function getArgs() {
  return process2.argv.slice(2);
}
function getPlatform() {
  switch (process2.platform) {
    case "win32":
      return "windows";
    case "darwin":
      return "darwin";
    case "linux":
      return "linux";
    default:
      return "linux";
  }
}
function getHomeDir() {
  try {
    return homedir();
  } catch {
    return void 0;
  }
}
function exit(code) {
  process2.exit(code);
}

// history/pathUtils.ts
async function getEncodedProjectName(projectPath) {
  const homeDir = getHomeDir();
  if (!homeDir) {
    return null;
  }
  const projectsDir = `${homeDir}/.claude/projects`;
  try {
    const entries = [];
    for await (const entry of readDir(projectsDir)) {
      if (entry.isDirectory) {
        entries.push(entry.name);
      }
    }
    const normalizedPath = projectPath.replace(/\/$/, "");
    const expectedEncoded = normalizedPath.replace(/[/\\:._]/g, "-");
    if (entries.includes(expectedEncoded)) {
      return expectedEncoded;
    }
    return null;
  } catch {
    return null;
  }
}
function validateEncodedProjectName(encodedName) {
  if (!encodedName) {
    return false;
  }
  const dangerousChars = /[<>:"|?*\x00-\x1f\/\\]/;
  if (dangerousChars.test(encodedName)) {
    return false;
  }
  return true;
}

// node_modules/@logtape/logtape/dist/filter.js
function toFilter(filter) {
  if (typeof filter === "function") return filter;
  return getLevelFilter(filter);
}
function getLevelFilter(level) {
  if (level == null) return () => false;
  if (level === "fatal") return (record) => record.level === "fatal";
  else if (level === "error") return (record) => record.level === "fatal" || record.level === "error";
  else if (level === "warning") return (record) => record.level === "fatal" || record.level === "error" || record.level === "warning";
  else if (level === "info") return (record) => record.level === "fatal" || record.level === "error" || record.level === "warning" || record.level === "info";
  else if (level === "debug") return (record) => record.level === "fatal" || record.level === "error" || record.level === "warning" || record.level === "info" || record.level === "debug";
  else if (level === "trace") return () => true;
  throw new TypeError(`Invalid log level: ${level}.`);
}

// node_modules/@logtape/logtape/dist/level.js
var logLevels = [
  "trace",
  "debug",
  "info",
  "warning",
  "error",
  "fatal"
];
function compareLogLevel(a, b) {
  const aIndex = logLevels.indexOf(a);
  if (aIndex < 0) throw new TypeError(`Invalid log level: ${JSON.stringify(a)}.`);
  const bIndex = logLevels.indexOf(b);
  if (bIndex < 0) throw new TypeError(`Invalid log level: ${JSON.stringify(b)}.`);
  return aIndex - bIndex;
}

// node_modules/@logtape/logtape/dist/logger.js
function getLogger(category = []) {
  return LoggerImpl.getLogger(category);
}
var globalRootLoggerSymbol = Symbol.for("logtape.rootLogger");
var LoggerImpl = class LoggerImpl2 {
  parent;
  children;
  category;
  sinks;
  parentSinks = "inherit";
  filters;
  lowestLevel = "trace";
  contextLocalStorage;
  static getLogger(category = []) {
    let rootLogger = globalRootLoggerSymbol in globalThis ? globalThis[globalRootLoggerSymbol] ?? null : null;
    if (rootLogger == null) {
      rootLogger = new LoggerImpl2(null, []);
      globalThis[globalRootLoggerSymbol] = rootLogger;
    }
    if (typeof category === "string") return rootLogger.getChild(category);
    if (category.length === 0) return rootLogger;
    return rootLogger.getChild(category);
  }
  constructor(parent, category) {
    this.parent = parent;
    this.children = {};
    this.category = category;
    this.sinks = [];
    this.filters = [];
  }
  getChild(subcategory) {
    const name = typeof subcategory === "string" ? subcategory : subcategory[0];
    const childRef = this.children[name];
    let child = childRef instanceof LoggerImpl2 ? childRef : childRef?.deref();
    if (child == null) {
      child = new LoggerImpl2(this, [...this.category, name]);
      this.children[name] = "WeakRef" in globalThis ? new WeakRef(child) : child;
    }
    if (typeof subcategory === "string" || subcategory.length === 1) return child;
    return child.getChild(subcategory.slice(1));
  }
  /**
  * Reset the logger.  This removes all sinks and filters from the logger.
  */
  reset() {
    while (this.sinks.length > 0) this.sinks.shift();
    this.parentSinks = "inherit";
    while (this.filters.length > 0) this.filters.shift();
    this.lowestLevel = "trace";
  }
  /**
  * Reset the logger and all its descendants.  This removes all sinks and
  * filters from the logger and all its descendants.
  */
  resetDescendants() {
    for (const child of Object.values(this.children)) {
      const logger2 = child instanceof LoggerImpl2 ? child : child.deref();
      if (logger2 != null) logger2.resetDescendants();
    }
    this.reset();
  }
  with(properties) {
    return new LoggerCtx(this, { ...properties });
  }
  filter(record) {
    for (const filter of this.filters) if (!filter(record)) return false;
    if (this.filters.length < 1) return this.parent?.filter(record) ?? true;
    return true;
  }
  *getSinks(level) {
    if (this.lowestLevel === null || compareLogLevel(level, this.lowestLevel) < 0) return;
    if (this.parent != null && this.parentSinks === "inherit") for (const sink of this.parent.getSinks(level)) yield sink;
    for (const sink of this.sinks) yield sink;
  }
  emit(record, bypassSinks) {
    const fullRecord = "category" in record ? record : {
      ...record,
      category: this.category
    };
    if (this.lowestLevel === null || compareLogLevel(fullRecord.level, this.lowestLevel) < 0 || !this.filter(fullRecord)) return;
    for (const sink of this.getSinks(fullRecord.level)) {
      if (bypassSinks?.has(sink)) continue;
      try {
        sink(fullRecord);
      } catch (error) {
        const bypassSinks2 = new Set(bypassSinks);
        bypassSinks2.add(sink);
        metaLogger.log("fatal", "Failed to emit a log record to sink {sink}: {error}", {
          sink,
          error,
          record: fullRecord
        }, bypassSinks2);
      }
    }
  }
  log(level, rawMessage, properties, bypassSinks) {
    const implicitContext = LoggerImpl2.getLogger().contextLocalStorage?.getStore() ?? {};
    let cachedProps = void 0;
    const record = typeof properties === "function" ? {
      category: this.category,
      level,
      timestamp: Date.now(),
      get message() {
        return parseMessageTemplate(rawMessage, this.properties);
      },
      rawMessage,
      get properties() {
        if (cachedProps == null) cachedProps = {
          ...implicitContext,
          ...properties()
        };
        return cachedProps;
      }
    } : {
      category: this.category,
      level,
      timestamp: Date.now(),
      message: parseMessageTemplate(rawMessage, {
        ...implicitContext,
        ...properties
      }),
      rawMessage,
      properties: {
        ...implicitContext,
        ...properties
      }
    };
    this.emit(record, bypassSinks);
  }
  logLazily(level, callback, properties = {}) {
    const implicitContext = LoggerImpl2.getLogger().contextLocalStorage?.getStore() ?? {};
    let rawMessage = void 0;
    let msg = void 0;
    function realizeMessage() {
      if (msg == null || rawMessage == null) {
        msg = callback((tpl, ...values) => {
          rawMessage = tpl;
          return renderMessage(tpl, values);
        });
        if (rawMessage == null) throw new TypeError("No log record was made.");
      }
      return [msg, rawMessage];
    }
    this.emit({
      category: this.category,
      level,
      get message() {
        return realizeMessage()[0];
      },
      get rawMessage() {
        return realizeMessage()[1];
      },
      timestamp: Date.now(),
      properties: {
        ...implicitContext,
        ...properties
      }
    });
  }
  logTemplate(level, messageTemplate, values, properties = {}) {
    const implicitContext = LoggerImpl2.getLogger().contextLocalStorage?.getStore() ?? {};
    this.emit({
      category: this.category,
      level,
      message: renderMessage(messageTemplate, values),
      rawMessage: messageTemplate,
      timestamp: Date.now(),
      properties: {
        ...implicitContext,
        ...properties
      }
    });
  }
  trace(message, ...values) {
    if (typeof message === "string") this.log("trace", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("trace", message);
    else if (!Array.isArray(message)) this.log("trace", "{*}", message);
    else this.logTemplate("trace", message, values);
  }
  debug(message, ...values) {
    if (typeof message === "string") this.log("debug", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("debug", message);
    else if (!Array.isArray(message)) this.log("debug", "{*}", message);
    else this.logTemplate("debug", message, values);
  }
  info(message, ...values) {
    if (typeof message === "string") this.log("info", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("info", message);
    else if (!Array.isArray(message)) this.log("info", "{*}", message);
    else this.logTemplate("info", message, values);
  }
  warn(message, ...values) {
    if (typeof message === "string") this.log("warning", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("warning", message);
    else if (!Array.isArray(message)) this.log("warning", "{*}", message);
    else this.logTemplate("warning", message, values);
  }
  warning(message, ...values) {
    this.warn(message, ...values);
  }
  error(message, ...values) {
    if (typeof message === "string") this.log("error", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("error", message);
    else if (!Array.isArray(message)) this.log("error", "{*}", message);
    else this.logTemplate("error", message, values);
  }
  fatal(message, ...values) {
    if (typeof message === "string") this.log("fatal", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("fatal", message);
    else if (!Array.isArray(message)) this.log("fatal", "{*}", message);
    else this.logTemplate("fatal", message, values);
  }
};
var LoggerCtx = class LoggerCtx2 {
  logger;
  properties;
  constructor(logger2, properties) {
    this.logger = logger2;
    this.properties = properties;
  }
  get category() {
    return this.logger.category;
  }
  get parent() {
    return this.logger.parent;
  }
  getChild(subcategory) {
    return this.logger.getChild(subcategory).with(this.properties);
  }
  with(properties) {
    return new LoggerCtx2(this.logger, {
      ...this.properties,
      ...properties
    });
  }
  log(level, message, properties, bypassSinks) {
    this.logger.log(level, message, typeof properties === "function" ? () => ({
      ...this.properties,
      ...properties()
    }) : {
      ...this.properties,
      ...properties
    }, bypassSinks);
  }
  logLazily(level, callback) {
    this.logger.logLazily(level, callback, this.properties);
  }
  logTemplate(level, messageTemplate, values) {
    this.logger.logTemplate(level, messageTemplate, values, this.properties);
  }
  emit(record) {
    const recordWithContext = {
      ...record,
      properties: {
        ...this.properties,
        ...record.properties
      }
    };
    this.logger.emit(recordWithContext);
  }
  trace(message, ...values) {
    if (typeof message === "string") this.log("trace", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("trace", message);
    else if (!Array.isArray(message)) this.log("trace", "{*}", message);
    else this.logTemplate("trace", message, values);
  }
  debug(message, ...values) {
    if (typeof message === "string") this.log("debug", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("debug", message);
    else if (!Array.isArray(message)) this.log("debug", "{*}", message);
    else this.logTemplate("debug", message, values);
  }
  info(message, ...values) {
    if (typeof message === "string") this.log("info", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("info", message);
    else if (!Array.isArray(message)) this.log("info", "{*}", message);
    else this.logTemplate("info", message, values);
  }
  warn(message, ...values) {
    if (typeof message === "string") this.log("warning", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("warning", message);
    else if (!Array.isArray(message)) this.log("warning", "{*}", message);
    else this.logTemplate("warning", message, values);
  }
  warning(message, ...values) {
    this.warn(message, ...values);
  }
  error(message, ...values) {
    if (typeof message === "string") this.log("error", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("error", message);
    else if (!Array.isArray(message)) this.log("error", "{*}", message);
    else this.logTemplate("error", message, values);
  }
  fatal(message, ...values) {
    if (typeof message === "string") this.log("fatal", message, values[0] ?? {});
    else if (typeof message === "function") this.logLazily("fatal", message);
    else if (!Array.isArray(message)) this.log("fatal", "{*}", message);
    else this.logTemplate("fatal", message, values);
  }
};
var metaLogger = LoggerImpl.getLogger(["logtape", "meta"]);
function parseMessageTemplate(template, properties) {
  const length = template.length;
  if (length === 0) return [""];
  if (!template.includes("{")) return [template];
  const message = [];
  let startIndex = 0;
  for (let i = 0; i < length; i++) {
    const char = template[i];
    if (char === "{") {
      const nextChar = i + 1 < length ? template[i + 1] : "";
      if (nextChar === "{") {
        i++;
        continue;
      }
      const closeIndex = template.indexOf("}", i + 1);
      if (closeIndex === -1) continue;
      const beforeText = template.slice(startIndex, i);
      message.push(beforeText.replace(/{{/g, "{").replace(/}}/g, "}"));
      const key = template.slice(i + 1, closeIndex);
      let prop;
      const trimmedKey = key.trim();
      if (trimmedKey === "*") prop = key in properties ? properties[key] : "*" in properties ? properties["*"] : properties;
      else if (key !== trimmedKey) prop = key in properties ? properties[key] : properties[trimmedKey];
      else prop = properties[key];
      message.push(prop);
      i = closeIndex;
      startIndex = i + 1;
    } else if (char === "}" && i + 1 < length && template[i + 1] === "}") i++;
  }
  const remainingText = template.slice(startIndex);
  message.push(remainingText.replace(/{{/g, "{").replace(/}}/g, "}"));
  return message;
}
function renderMessage(template, values) {
  const args = [];
  for (let i = 0; i < template.length; i++) {
    args.push(template[i]);
    if (i < values.length) args.push(values[i]);
  }
  return args;
}

// node_modules/@logtape/logtape/dist/util.node.js
var util_node_exports = {};
__export(util_node_exports, {
  inspect: () => inspect
});
import util from "node:util";
function inspect(obj, options) {
  return util.inspect(obj, options);
}

// node_modules/@logtape/logtape/dist/formatter.js
var levelAbbreviations = {
  "trace": "TRC",
  "debug": "DBG",
  "info": "INF",
  "warning": "WRN",
  "error": "ERR",
  "fatal": "FTL"
};
var inspect2 = typeof document !== "undefined" || typeof navigator !== "undefined" && navigator.product === "ReactNative" ? (v) => JSON.stringify(v) : "Deno" in globalThis && "inspect" in globalThis.Deno && typeof globalThis.Deno.inspect === "function" ? (v, opts) => globalThis.Deno.inspect(v, {
  strAbbreviateSize: Infinity,
  iterableLimit: Infinity,
  ...opts
}) : util_node_exports != null && "inspect" in util_node_exports && typeof inspect === "function" ? (v, opts) => inspect(v, {
  maxArrayLength: Infinity,
  maxStringLength: Infinity,
  ...opts
}) : (v) => JSON.stringify(v);
function padZero(num) {
  return num < 10 ? `0${num}` : `${num}`;
}
function padThree(num) {
  return num < 10 ? `00${num}` : num < 100 ? `0${num}` : `${num}`;
}
var timestampFormatters = {
  "date-time-timezone": (ts) => {
    const d = new Date(ts);
    const year = d.getUTCFullYear();
    const month = padZero(d.getUTCMonth() + 1);
    const day = padZero(d.getUTCDate());
    const hour = padZero(d.getUTCHours());
    const minute = padZero(d.getUTCMinutes());
    const second = padZero(d.getUTCSeconds());
    const ms = padThree(d.getUTCMilliseconds());
    return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms} +00:00`;
  },
  "date-time-tz": (ts) => {
    const d = new Date(ts);
    const year = d.getUTCFullYear();
    const month = padZero(d.getUTCMonth() + 1);
    const day = padZero(d.getUTCDate());
    const hour = padZero(d.getUTCHours());
    const minute = padZero(d.getUTCMinutes());
    const second = padZero(d.getUTCSeconds());
    const ms = padThree(d.getUTCMilliseconds());
    return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms} +00`;
  },
  "date-time": (ts) => {
    const d = new Date(ts);
    const year = d.getUTCFullYear();
    const month = padZero(d.getUTCMonth() + 1);
    const day = padZero(d.getUTCDate());
    const hour = padZero(d.getUTCHours());
    const minute = padZero(d.getUTCMinutes());
    const second = padZero(d.getUTCSeconds());
    const ms = padThree(d.getUTCMilliseconds());
    return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms}`;
  },
  "time-timezone": (ts) => {
    const d = new Date(ts);
    const hour = padZero(d.getUTCHours());
    const minute = padZero(d.getUTCMinutes());
    const second = padZero(d.getUTCSeconds());
    const ms = padThree(d.getUTCMilliseconds());
    return `${hour}:${minute}:${second}.${ms} +00:00`;
  },
  "time-tz": (ts) => {
    const d = new Date(ts);
    const hour = padZero(d.getUTCHours());
    const minute = padZero(d.getUTCMinutes());
    const second = padZero(d.getUTCSeconds());
    const ms = padThree(d.getUTCMilliseconds());
    return `${hour}:${minute}:${second}.${ms} +00`;
  },
  "time": (ts) => {
    const d = new Date(ts);
    const hour = padZero(d.getUTCHours());
    const minute = padZero(d.getUTCMinutes());
    const second = padZero(d.getUTCSeconds());
    const ms = padThree(d.getUTCMilliseconds());
    return `${hour}:${minute}:${second}.${ms}`;
  },
  "date": (ts) => {
    const d = new Date(ts);
    const year = d.getUTCFullYear();
    const month = padZero(d.getUTCMonth() + 1);
    const day = padZero(d.getUTCDate());
    return `${year}-${month}-${day}`;
  },
  "rfc3339": (ts) => new Date(ts).toISOString(),
  "none": () => null
};
var levelRenderersCache = {
  ABBR: levelAbbreviations,
  abbr: {
    trace: "trc",
    debug: "dbg",
    info: "inf",
    warning: "wrn",
    error: "err",
    fatal: "ftl"
  },
  FULL: {
    trace: "TRACE",
    debug: "DEBUG",
    info: "INFO",
    warning: "WARNING",
    error: "ERROR",
    fatal: "FATAL"
  },
  full: {
    trace: "trace",
    debug: "debug",
    info: "info",
    warning: "warning",
    error: "error",
    fatal: "fatal"
  },
  L: {
    trace: "T",
    debug: "D",
    info: "I",
    warning: "W",
    error: "E",
    fatal: "F"
  },
  l: {
    trace: "t",
    debug: "d",
    info: "i",
    warning: "w",
    error: "e",
    fatal: "f"
  }
};
function getTextFormatter(options = {}) {
  const timestampRenderer = (() => {
    const tsOption = options.timestamp;
    if (tsOption == null) return timestampFormatters["date-time-timezone"];
    else if (tsOption === "disabled") return timestampFormatters["none"];
    else if (typeof tsOption === "string" && tsOption in timestampFormatters) return timestampFormatters[tsOption];
    else return tsOption;
  })();
  const categorySeparator = options.category ?? "\xB7";
  const valueRenderer = options.value ?? inspect2;
  const levelRenderer = (() => {
    const levelOption = options.level;
    if (levelOption == null || levelOption === "ABBR") return (level) => levelRenderersCache.ABBR[level];
    else if (levelOption === "abbr") return (level) => levelRenderersCache.abbr[level];
    else if (levelOption === "FULL") return (level) => levelRenderersCache.FULL[level];
    else if (levelOption === "full") return (level) => levelRenderersCache.full[level];
    else if (levelOption === "L") return (level) => levelRenderersCache.L[level];
    else if (levelOption === "l") return (level) => levelRenderersCache.l[level];
    else return levelOption;
  })();
  const formatter = options.format ?? (({ timestamp, level, category, message }) => `${timestamp ? `${timestamp} ` : ""}[${level}] ${category}: ${message}`);
  return (record) => {
    const msgParts = record.message;
    const msgLen = msgParts.length;
    let message;
    if (msgLen === 1) message = msgParts[0];
    else if (msgLen <= 6) {
      message = "";
      for (let i = 0; i < msgLen; i++) message += i % 2 === 0 ? msgParts[i] : valueRenderer(msgParts[i]);
    } else {
      const parts = new Array(msgLen);
      for (let i = 0; i < msgLen; i++) parts[i] = i % 2 === 0 ? msgParts[i] : valueRenderer(msgParts[i]);
      message = parts.join("");
    }
    const timestamp = timestampRenderer(record.timestamp);
    const level = levelRenderer(record.level);
    const category = typeof categorySeparator === "function" ? categorySeparator(record.category) : record.category.join(categorySeparator);
    const values = {
      timestamp,
      level,
      category,
      message,
      record
    };
    return `${formatter(values)}
`;
  };
}
var defaultTextFormatter = getTextFormatter();
var RESET = "\x1B[0m";
var ansiColors = {
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m"
};
var ansiStyles = {
  bold: "\x1B[1m",
  dim: "\x1B[2m",
  italic: "\x1B[3m",
  underline: "\x1B[4m",
  strikethrough: "\x1B[9m"
};
var defaultLevelColors = {
  trace: null,
  debug: "blue",
  info: "green",
  warning: "yellow",
  error: "red",
  fatal: "magenta"
};
function getAnsiColorFormatter(options = {}) {
  const format = options.format;
  const timestampStyle = typeof options.timestampStyle === "undefined" ? "dim" : options.timestampStyle;
  const timestampColor = options.timestampColor ?? null;
  const timestampPrefix = `${timestampStyle == null ? "" : ansiStyles[timestampStyle]}${timestampColor == null ? "" : ansiColors[timestampColor]}`;
  const timestampSuffix = timestampStyle == null && timestampColor == null ? "" : RESET;
  const levelStyle = typeof options.levelStyle === "undefined" ? "bold" : options.levelStyle;
  const levelColors = options.levelColors ?? defaultLevelColors;
  const categoryStyle = typeof options.categoryStyle === "undefined" ? "dim" : options.categoryStyle;
  const categoryColor = options.categoryColor ?? null;
  const categoryPrefix = `${categoryStyle == null ? "" : ansiStyles[categoryStyle]}${categoryColor == null ? "" : ansiColors[categoryColor]}`;
  const categorySuffix = categoryStyle == null && categoryColor == null ? "" : RESET;
  return getTextFormatter({
    timestamp: "date-time-tz",
    value(value) {
      return inspect2(value, { colors: true });
    },
    ...options,
    format({ timestamp, level, category, message, record }) {
      const levelColor = levelColors[record.level];
      timestamp = `${timestampPrefix}${timestamp}${timestampSuffix}`;
      level = `${levelStyle == null ? "" : ansiStyles[levelStyle]}${levelColor == null ? "" : ansiColors[levelColor]}${level}${levelStyle == null && levelColor == null ? "" : RESET}`;
      return format == null ? `${timestamp} ${level} ${categoryPrefix}${category}:${categorySuffix} ${message}` : format({
        timestamp,
        level,
        category: `${categoryPrefix}${category}${categorySuffix}`,
        message,
        record
      });
    }
  });
}
var ansiColorFormatter = getAnsiColorFormatter();
function getJsonLinesFormatter(options = {}) {
  if (!options.categorySeparator && !options.message && !options.properties) return (record) => {
    if (record.message.length === 3) return JSON.stringify({
      "@timestamp": new Date(record.timestamp).toISOString(),
      level: record.level === "warning" ? "WARN" : record.level.toUpperCase(),
      message: record.message[0] + JSON.stringify(record.message[1]) + record.message[2],
      logger: record.category.join("."),
      properties: record.properties
    }) + "\n";
    if (record.message.length === 1) return JSON.stringify({
      "@timestamp": new Date(record.timestamp).toISOString(),
      level: record.level === "warning" ? "WARN" : record.level.toUpperCase(),
      message: record.message[0],
      logger: record.category.join("."),
      properties: record.properties
    }) + "\n";
    let msg = record.message[0];
    for (let i = 1; i < record.message.length; i++) msg += i & 1 ? JSON.stringify(record.message[i]) : record.message[i];
    return JSON.stringify({
      "@timestamp": new Date(record.timestamp).toISOString(),
      level: record.level === "warning" ? "WARN" : record.level.toUpperCase(),
      message: msg,
      logger: record.category.join("."),
      properties: record.properties
    }) + "\n";
  };
  const isTemplateMessage = options.message === "template";
  const propertiesOption = options.properties ?? "nest:properties";
  let joinCategory;
  if (typeof options.categorySeparator === "function") joinCategory = options.categorySeparator;
  else {
    const separator = options.categorySeparator ?? ".";
    joinCategory = (category) => category.join(separator);
  }
  let getProperties;
  if (propertiesOption === "flatten") getProperties = (properties) => properties;
  else if (propertiesOption.startsWith("prepend:")) {
    const prefix = propertiesOption.substring(8);
    if (prefix === "") throw new TypeError(`Invalid properties option: ${JSON.stringify(propertiesOption)}. It must be of the form "prepend:<prefix>" where <prefix> is a non-empty string.`);
    getProperties = (properties) => {
      const result = {};
      for (const key in properties) result[`${prefix}${key}`] = properties[key];
      return result;
    };
  } else if (propertiesOption.startsWith("nest:")) {
    const key = propertiesOption.substring(5);
    getProperties = (properties) => ({ [key]: properties });
  } else throw new TypeError(`Invalid properties option: ${JSON.stringify(propertiesOption)}. It must be "flatten", "prepend:<prefix>", or "nest:<key>".`);
  let getMessage;
  if (isTemplateMessage) getMessage = (record) => {
    if (typeof record.rawMessage === "string") return record.rawMessage;
    let msg = "";
    for (let i = 0; i < record.rawMessage.length; i++) msg += i % 2 < 1 ? record.rawMessage[i] : "{}";
    return msg;
  };
  else getMessage = (record) => {
    const msgLen = record.message.length;
    if (msgLen === 1) return record.message[0];
    let msg = "";
    for (let i = 0; i < msgLen; i++) msg += i % 2 < 1 ? record.message[i] : JSON.stringify(record.message[i]);
    return msg;
  };
  return (record) => {
    return JSON.stringify({
      "@timestamp": new Date(record.timestamp).toISOString(),
      level: record.level === "warning" ? "WARN" : record.level.toUpperCase(),
      message: getMessage(record),
      logger: joinCategory(record.category),
      ...getProperties(record.properties)
    }) + "\n";
  };
}
var jsonLinesFormatter = getJsonLinesFormatter();
var logLevelStyles = {
  "trace": "background-color: gray; color: white;",
  "debug": "background-color: gray; color: white;",
  "info": "background-color: white; color: black;",
  "warning": "background-color: orange; color: black;",
  "error": "background-color: red; color: white;",
  "fatal": "background-color: maroon; color: white;"
};
function defaultConsoleFormatter(record) {
  let msg = "";
  const values = [];
  for (let i = 0; i < record.message.length; i++) if (i % 2 === 0) msg += record.message[i];
  else {
    msg += "%o";
    values.push(record.message[i]);
  }
  const date = new Date(record.timestamp);
  const time = `${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}:${date.getUTCSeconds().toString().padStart(2, "0")}.${date.getUTCMilliseconds().toString().padStart(3, "0")}`;
  return [
    `%c${time} %c${levelAbbreviations[record.level]}%c %c${record.category.join("\xB7")} %c${msg}`,
    "color: gray;",
    logLevelStyles[record.level],
    "background-color: default;",
    "color: gray;",
    "color: default;",
    ...values
  ];
}

// node_modules/@logtape/logtape/dist/sink.js
function getConsoleSink(options = {}) {
  const formatter = options.formatter ?? defaultConsoleFormatter;
  const levelMap = {
    trace: "debug",
    debug: "debug",
    info: "info",
    warning: "warn",
    error: "error",
    fatal: "error",
    ...options.levelMap ?? {}
  };
  const console2 = options.console ?? globalThis.console;
  const baseSink = (record) => {
    const args = formatter(record);
    const method = levelMap[record.level];
    if (method === void 0) throw new TypeError(`Invalid log level: ${record.level}.`);
    if (typeof args === "string") {
      const msg = args.replace(/\r?\n$/, "");
      console2[method](msg);
    } else console2[method](...args);
  };
  if (!options.nonBlocking) return baseSink;
  const nonBlockingConfig = options.nonBlocking === true ? {} : options.nonBlocking;
  const bufferSize = nonBlockingConfig.bufferSize ?? 100;
  const flushInterval = nonBlockingConfig.flushInterval ?? 100;
  const buffer = [];
  let flushTimer = null;
  let disposed = false;
  let flushScheduled = false;
  const maxBufferSize = bufferSize * 2;
  function flush() {
    if (buffer.length === 0) return;
    const records = buffer.splice(0);
    for (const record of records) try {
      baseSink(record);
    } catch {
    }
  }
  function scheduleFlush() {
    if (flushScheduled) return;
    flushScheduled = true;
    setTimeout(() => {
      flushScheduled = false;
      flush();
    }, 0);
  }
  function startFlushTimer() {
    if (flushTimer !== null || disposed) return;
    flushTimer = setInterval(() => {
      flush();
    }, flushInterval);
  }
  const nonBlockingSink = (record) => {
    if (disposed) return;
    if (buffer.length >= maxBufferSize) buffer.shift();
    buffer.push(record);
    if (buffer.length >= bufferSize) scheduleFlush();
    else if (flushTimer === null) startFlushTimer();
  };
  nonBlockingSink[Symbol.dispose] = () => {
    disposed = true;
    if (flushTimer !== null) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
    flush();
  };
  return nonBlockingSink;
}

// node_modules/@logtape/logtape/dist/config.js
var currentConfig = null;
var strongRefs = /* @__PURE__ */ new Set();
var disposables = /* @__PURE__ */ new Set();
var asyncDisposables = /* @__PURE__ */ new Set();
function isLoggerConfigMeta(cfg) {
  return cfg.category.length === 0 || cfg.category.length === 1 && cfg.category[0] === "logtape" || cfg.category.length === 2 && cfg.category[0] === "logtape" && cfg.category[1] === "meta";
}
async function configure(config) {
  if (currentConfig != null && !config.reset) throw new ConfigError("Already configured; if you want to reset, turn on the reset flag.");
  await reset();
  try {
    configureInternal(config, true);
  } catch (e) {
    if (e instanceof ConfigError) await reset();
    throw e;
  }
}
function configureInternal(config, allowAsync) {
  currentConfig = config;
  let metaConfigured = false;
  const configuredCategories = /* @__PURE__ */ new Set();
  for (const cfg of config.loggers) {
    if (isLoggerConfigMeta(cfg)) metaConfigured = true;
    const categoryKey = Array.isArray(cfg.category) ? JSON.stringify(cfg.category) : JSON.stringify([cfg.category]);
    if (configuredCategories.has(categoryKey)) throw new ConfigError(`Duplicate logger configuration for category: ${categoryKey}. Each category can only be configured once.`);
    configuredCategories.add(categoryKey);
    const logger2 = LoggerImpl.getLogger(cfg.category);
    for (const sinkId of cfg.sinks ?? []) {
      const sink = config.sinks[sinkId];
      if (!sink) throw new ConfigError(`Sink not found: ${sinkId}.`);
      logger2.sinks.push(sink);
    }
    logger2.parentSinks = cfg.parentSinks ?? "inherit";
    if (cfg.lowestLevel !== void 0) logger2.lowestLevel = cfg.lowestLevel;
    for (const filterId of cfg.filters ?? []) {
      const filter = config.filters?.[filterId];
      if (filter === void 0) throw new ConfigError(`Filter not found: ${filterId}.`);
      logger2.filters.push(toFilter(filter));
    }
    strongRefs.add(logger2);
  }
  LoggerImpl.getLogger().contextLocalStorage = config.contextLocalStorage;
  for (const sink of Object.values(config.sinks)) {
    if (Symbol.asyncDispose in sink) if (allowAsync) asyncDisposables.add(sink);
    else throw new ConfigError("Async disposables cannot be used with configureSync().");
    if (Symbol.dispose in sink) disposables.add(sink);
  }
  for (const filter of Object.values(config.filters ?? {})) {
    if (filter == null || typeof filter === "string") continue;
    if (Symbol.asyncDispose in filter) if (allowAsync) asyncDisposables.add(filter);
    else throw new ConfigError("Async disposables cannot be used with configureSync().");
    if (Symbol.dispose in filter) disposables.add(filter);
  }
  if ("process" in globalThis && !("Deno" in globalThis)) {
    const proc = globalThis.process;
    if (proc?.on) proc.on("exit", allowAsync ? dispose : disposeSync);
  } else addEventListener("unload", allowAsync ? dispose : disposeSync);
  const meta = LoggerImpl.getLogger(["logtape", "meta"]);
  if (!metaConfigured) meta.sinks.push(getConsoleSink());
  meta.info("LogTape loggers are configured.  Note that LogTape itself uses the meta logger, which has category {metaLoggerCategory}.  The meta logger purposes to log internal errors such as sink exceptions.  If you are seeing this message, the meta logger is automatically configured.  It's recommended to configure the meta logger with a separate sink so that you can easily notice if logging itself fails or is misconfigured.  To turn off this message, configure the meta logger with higher log levels than {dismissLevel}.  See also <https://logtape.org/manual/categories#meta-logger>.", {
    metaLoggerCategory: ["logtape", "meta"],
    dismissLevel: "info"
  });
}
async function reset() {
  await dispose();
  resetInternal();
}
function resetInternal() {
  const rootLogger = LoggerImpl.getLogger([]);
  rootLogger.resetDescendants();
  delete rootLogger.contextLocalStorage;
  strongRefs.clear();
  currentConfig = null;
}
async function dispose() {
  disposeSync();
  const promises = [];
  for (const disposable of asyncDisposables) {
    promises.push(disposable[Symbol.asyncDispose]());
    asyncDisposables.delete(disposable);
  }
  await Promise.all(promises);
}
function disposeSync() {
  for (const disposable of disposables) disposable[Symbol.dispose]();
  disposables.clear();
}
var ConfigError = class extends Error {
  /**
  * Constructs a new configuration error.
  * @param message The error message.
  */
  constructor(message) {
    super(message);
    this.name = "ConfigureError";
  }
};

// node_modules/@logtape/pretty/dist/terminal.js
function isTerminal() {
  try {
    if (typeof Deno !== "undefined") {
      if (Deno.stdout.isTerminal) return Deno.stdout.isTerminal();
    }
    if (typeof process !== "undefined" && process.stdout) return Boolean(process.stdout.isTTY);
    if (typeof window !== "undefined") return false;
    return false;
  } catch {
    return false;
  }
}
function getTerminalWidth() {
  try {
    if (typeof Deno !== "undefined") {
      if (Deno.consoleSize) {
        const size = Deno.consoleSize();
        return size?.columns || null;
      }
    }
    if (typeof process !== "undefined" && process.stdout) return process.stdout.columns || null;
    const envColumns = typeof Deno !== "undefined" ? Deno.env.get("COLUMNS") : process?.env?.COLUMNS;
    if (envColumns) {
      const parsed = parseInt(envColumns, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  } catch {
    return null;
  }
}
function getOptimalWordWrapWidth(defaultWidth = 80) {
  if (!isTerminal()) return defaultWidth;
  const terminalWidth = getTerminalWidth();
  return terminalWidth || defaultWidth;
}

// node_modules/@logtape/pretty/dist/truncate.js
function truncateCategory(category, maxWidth, separator = ".", strategy = "middle") {
  if (!strategy || maxWidth <= 0) return category.join(separator);
  const full = category.join(separator);
  if (full.length <= maxWidth) return full;
  const minWidth = 5;
  if (maxWidth < minWidth) return "\u2026";
  if (strategy === "end") return full.substring(0, maxWidth - 1) + "\u2026";
  if (category.length <= 2) return full.substring(0, maxWidth - 1) + "\u2026";
  const first = category[0];
  const last = category[category.length - 1];
  const ellipsis = "\u2026";
  const minimalLength = first.length + ellipsis.length + last.length;
  if (minimalLength > maxWidth) return full.substring(0, maxWidth - 1) + "\u2026";
  return `${first}${ellipsis}${last}`;
}

// node_modules/@logtape/pretty/dist/wcwidth.js
var ANSI_PATTERN = /\x1b\[[0-9;]*m/g;
function stripAnsi(text) {
  return text.replace(ANSI_PATTERN, "");
}
function getDisplayWidth(text) {
  const cleanText = stripAnsi(text);
  if (cleanText.length === 0) return 0;
  let width = 0;
  let i = 0;
  while (i < cleanText.length) {
    const code = cleanText.codePointAt(i);
    if (code === void 0) {
      i++;
      continue;
    }
    const charWidth = wcwidth(code);
    if (charWidth >= 0) width += charWidth;
    i += code > 65535 ? 2 : 1;
  }
  return width;
}
function wcwidth(code) {
  if (code < 32 || code >= 127 && code < 160) return -1;
  if (isZeroWidth(code)) return 0;
  if (isWideCharacter(code)) return 2;
  return 1;
}
var ZERO_WIDTH_RANGES = [
  [768, 879],
  [1155, 1161],
  [1425, 1469],
  [1473, 1474],
  [1476, 1477],
  [1552, 1562],
  [1611, 1631],
  [1750, 1756],
  [1759, 1764],
  [1767, 1768],
  [1770, 1773],
  [1840, 1866],
  [1958, 1968],
  [2027, 2035],
  [2070, 2073],
  [2075, 2083],
  [2085, 2087],
  [2089, 2093],
  [2137, 2139],
  [2259, 2273],
  [2275, 2306],
  [2369, 2376],
  [2385, 2391],
  [2402, 2403],
  [2497, 2500],
  [2530, 2531],
  [2561, 2562],
  [2625, 2626],
  [2631, 2632],
  [2635, 2637],
  [2672, 2673],
  [2689, 2690],
  [2753, 2757],
  [2759, 2760],
  [2786, 2787],
  [2810, 2815],
  [2881, 2884],
  [2901, 2902],
  [2914, 2915],
  [3134, 3136],
  [3142, 3144],
  [3146, 3149],
  [3157, 3158],
  [3170, 3171],
  [3276, 3277],
  [3298, 3299],
  [3328, 3329],
  [3387, 3388],
  [3426, 3427],
  [3538, 3540],
  [3636, 3642],
  [3655, 3662],
  [3764, 3772],
  [3784, 3789],
  [3864, 3865],
  [3953, 3966],
  [3968, 3972],
  [3974, 3975],
  [3981, 3991],
  [3993, 4028],
  [4141, 4144],
  [4146, 4151],
  [4153, 4154],
  [4157, 4158],
  [4184, 4185],
  [4190, 4192],
  [4209, 4212],
  [4229, 4230],
  [4957, 4959],
  [5906, 5908],
  [5938, 5940],
  [5970, 5971],
  [6002, 6003],
  [6068, 6069],
  [6071, 6077],
  [6089, 6099],
  [6155, 6157],
  [6277, 6278],
  [6432, 6434],
  [6439, 6440],
  [6457, 6459],
  [6679, 6680],
  [6744, 6750],
  [6757, 6764],
  [6771, 6780],
  [6832, 6846],
  [6912, 6915],
  [6966, 6970],
  [7019, 7027],
  [7040, 7041],
  [7074, 7077],
  [7080, 7081],
  [7083, 7085],
  [7144, 7145],
  [7151, 7153],
  [7212, 7219],
  [7222, 7223],
  [7376, 7378],
  [7380, 7392],
  [7394, 7400],
  [7416, 7417],
  [7616, 7673],
  [7675, 7679],
  [8203, 8207],
  [8234, 8238],
  [8288, 8292],
  [8294, 8303],
  [65024, 65039],
  [65056, 65071]
];
var ZERO_WIDTH_SINGLES = /* @__PURE__ */ new Set([
  1471,
  1479,
  1648,
  1809,
  2045,
  2362,
  2364,
  2381,
  2433,
  2492,
  2509,
  2558,
  2620,
  2641,
  2677,
  2748,
  2765,
  2817,
  2876,
  2879,
  2893,
  2946,
  3008,
  3021,
  3072,
  3076,
  3201,
  3260,
  3263,
  3270,
  3393,
  3396,
  3405,
  3457,
  3530,
  3542,
  3633,
  3761,
  3893,
  3895,
  3897,
  4038,
  4226,
  4237,
  4253,
  6086,
  6109,
  6313,
  6450,
  6683,
  6742,
  6752,
  6754,
  6783,
  6964,
  6972,
  6978,
  7142,
  7149,
  7405,
  7412,
  65279
]);
function isInRanges(code, ranges) {
  let left = 0;
  let right = ranges.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const [start, end] = ranges[mid];
    if (code >= start && code <= end) return true;
    else if (code < start) right = mid - 1;
    else left = mid + 1;
  }
  return false;
}
function isZeroWidth(code) {
  return ZERO_WIDTH_SINGLES.has(code) || isInRanges(code, ZERO_WIDTH_RANGES);
}
function isWideCharacter(code) {
  return code >= 4352 && code <= 4447 || code >= 8986 && code <= 8987 || code >= 9001 && code <= 9002 || code >= 9193 && code <= 9196 || code === 9200 || code === 9203 || code >= 9725 && code <= 9726 || code >= 9748 && code <= 9749 || code >= 9800 && code <= 9811 || code === 9855 || code === 9875 || code === 9888 || code === 9889 || code === 9898 || code === 9899 || code >= 9917 && code <= 9918 || code >= 9924 && code <= 9925 || code === 9934 || code === 9940 || code >= 9962 && code <= 9962 || code >= 9970 && code <= 9971 || code === 9973 || code === 9978 || code === 9981 || code >= 9989 && code <= 9989 || code >= 9994 && code <= 9995 || code === 10024 || code === 10060 || code === 10062 || code >= 10067 && code <= 10069 || code === 10071 || code >= 10133 && code <= 10135 || code === 10160 || code === 10175 || code >= 11035 && code <= 11036 || code === 11088 || code === 11093 || code >= 11904 && code <= 11929 || code >= 11931 && code <= 12019 || code >= 12032 && code <= 12245 || code >= 12272 && code <= 12283 || code >= 12288 && code <= 12350 || code >= 12353 && code <= 12438 || code >= 12441 && code <= 12543 || code >= 12549 && code <= 12591 || code >= 12593 && code <= 12686 || code >= 12688 && code <= 12771 || code >= 12784 && code <= 12830 || code >= 12832 && code <= 12871 || code >= 12880 && code <= 19903 || code >= 19968 && code <= 40959 || code >= 43360 && code <= 43391 || code >= 44032 && code <= 55203 || code >= 55216 && code <= 55238 || code >= 63744 && code <= 64255 || code >= 65040 && code <= 65049 || code >= 65072 && code <= 65135 || code >= 65280 && code <= 65376 || code >= 65504 && code <= 65510 || code >= 94176 && code <= 94180 || code >= 94192 && code <= 94193 || code >= 94208 && code <= 100343 || code >= 100352 && code <= 101589 || code >= 101632 && code <= 101640 || code >= 110576 && code <= 110579 || code >= 110581 && code <= 110587 || code >= 110589 && code <= 110590 || code >= 110592 && code <= 110882 || code >= 110928 && code <= 110930 || code >= 110948 && code <= 110951 || code >= 110960 && code <= 111355 || code === 126980 || code === 127183 || code >= 127374 && code <= 127374 || code >= 127377 && code <= 127386 || code >= 127462 && code <= 127487 || code >= 127488 && code <= 127490 || code >= 127504 && code <= 127547 || code >= 127552 && code <= 127560 || code >= 127568 && code <= 127569 || code >= 127584 && code <= 127589 || code >= 127744 && code <= 128727 || code >= 128736 && code <= 128748 || code >= 128752 && code <= 128764 || code >= 128768 && code <= 128883 || code >= 128896 && code <= 128984 || code >= 128992 && code <= 129003 || code >= 129008 && code <= 129008 || code >= 129024 && code <= 129035 || code >= 129040 && code <= 129095 || code >= 129104 && code <= 129113 || code >= 129120 && code <= 129159 || code >= 129168 && code <= 129197 || code >= 129200 && code <= 129201 || code >= 129280 && code <= 129619 || code >= 129632 && code <= 129645 || code >= 129648 && code <= 129660 || code >= 129664 && code <= 129672 || code >= 129680 && code <= 129725 || code >= 129727 && code <= 129733 || code >= 129742 && code <= 129755 || code >= 129760 && code <= 129768 || code >= 129776 && code <= 129784 || code >= 131072 && code <= 196605 || code >= 196608 && code <= 262141;
}

// node_modules/@logtape/pretty/dist/wordwrap.js
function wrapText(text, maxWidth, messageContent) {
  if (maxWidth <= 0) return text;
  const displayWidth = getDisplayWidth(text);
  if (displayWidth <= maxWidth && !text.includes("\n")) return text;
  const firstLineWords = messageContent.split(" ");
  const firstWord = firstLineWords[0];
  const plainText = stripAnsi(text);
  const messageStartIndex = plainText.indexOf(firstWord);
  let indentWidth = 0;
  if (messageStartIndex >= 0) {
    const prefixText = plainText.slice(0, messageStartIndex);
    indentWidth = getDisplayWidth(prefixText);
  }
  const indent = " ".repeat(Math.max(0, indentWidth));
  if (text.includes("\n")) {
    const lines = text.split("\n");
    const wrappedLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineDisplayWidth = getDisplayWidth(line);
      if (lineDisplayWidth <= maxWidth) if (i === 0) wrappedLines.push(line);
      else wrappedLines.push(indent + line);
      else {
        const wrappedLine = wrapSingleLine(line, maxWidth, indent);
        if (i === 0) wrappedLines.push(wrappedLine);
        else {
          const subLines = wrappedLine.split("\n");
          for (let j = 0; j < subLines.length; j++) if (j === 0) wrappedLines.push(indent + subLines[j]);
          else wrappedLines.push(subLines[j]);
        }
      }
    }
    return wrappedLines.join("\n");
  }
  return wrapSingleLine(text, maxWidth, indent);
}
function wrapSingleLine(text, maxWidth, indent) {
  const lines = [];
  let currentLine = "";
  let currentDisplayWidth = 0;
  let i = 0;
  while (i < text.length) {
    if (text[i] === "\x1B" && text[i + 1] === "[") {
      let j = i + 2;
      while (j < text.length && text[j] !== "m") j++;
      if (j < text.length) {
        j++;
        currentLine += text.slice(i, j);
        i = j;
        continue;
      }
    }
    const char = text[i];
    if (currentDisplayWidth >= maxWidth && char !== " ") {
      const breakPoint = currentLine.lastIndexOf(" ");
      if (breakPoint > 0) {
        lines.push(currentLine.slice(0, breakPoint));
        currentLine = indent + currentLine.slice(breakPoint + 1) + char;
        currentDisplayWidth = getDisplayWidth(currentLine);
      } else {
        lines.push(currentLine);
        currentLine = indent + char;
        currentDisplayWidth = getDisplayWidth(currentLine);
      }
    } else {
      currentLine += char;
      currentDisplayWidth = getDisplayWidth(currentLine);
    }
    i++;
  }
  if (currentLine.trim()) lines.push(currentLine);
  const filteredLines = lines.filter((line) => line.trim().length > 0);
  return filteredLines.join("\n");
}

// node_modules/@logtape/pretty/dist/util.node.js
import util2 from "node:util";
function inspect3(obj, options) {
  return util2.inspect(obj, options);
}

// node_modules/@logtape/pretty/dist/formatter.js
var RESET2 = "\x1B[0m";
var DIM = "\x1B[2m";
var defaultColors = {
  trace: "rgb(167,139,250)",
  debug: "rgb(96,165,250)",
  info: "rgb(52,211,153)",
  warning: "rgb(251,191,36)",
  error: "rgb(248,113,113)",
  fatal: "rgb(220,38,38)",
  category: "rgb(100,116,139)",
  message: "rgb(148,163,184)",
  timestamp: "rgb(100,116,139)"
};
var styles = {
  reset: RESET2,
  bold: "\x1B[1m",
  dim: DIM,
  italic: "\x1B[3m",
  underline: "\x1B[4m",
  strikethrough: "\x1B[9m"
};
var ansiColors2 = {
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m"
};
var RGB_PATTERN = /^rgb\((\d+),(\d+),(\d+)\)$/;
var HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
function colorToAnsi(color) {
  if (color === null) return "";
  if (color in ansiColors2) return ansiColors2[color];
  const rgbMatch = color.match(RGB_PATTERN);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `\x1B[38;2;${r};${g};${b}m`;
  }
  const hexMatch = color.match(HEX_PATTERN);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `\x1B[38;2;${r};${g};${b}m`;
  }
  return "";
}
function styleToAnsi(style) {
  if (style === null) return "";
  if (Array.isArray(style)) return style.map((s) => styles[s] || "").join("");
  return styles[style] || "";
}
function prepareCategoryPatterns(categoryColorMap) {
  const patterns = [];
  for (const [prefix, color] of categoryColorMap) patterns.push({
    prefix,
    color
  });
  return patterns.sort((a, b) => b.prefix.length - a.prefix.length);
}
function matchCategoryColor(category, patterns) {
  for (const pattern of patterns) if (categoryMatches(category, pattern.prefix)) return pattern.color;
  return null;
}
function categoryMatches(category, prefix) {
  if (prefix.length > category.length) return false;
  for (let i = 0; i < prefix.length; i++) if (category[i] !== prefix[i]) return false;
  return true;
}
var defaultIcons = {
  trace: "\u{1F50D}",
  debug: "\u{1F41B}",
  info: "\u2728",
  warning: "\u26A1",
  error: "\u274C",
  fatal: "\u{1F480}"
};
function normalizeIconSpacing(iconMap) {
  const entries = Object.entries(iconMap);
  const maxWidth = Math.max(...entries.map(([, icon]) => getDisplayWidth(icon)));
  return Object.fromEntries(entries.map(([level, icon]) => [level, icon + " ".repeat(maxWidth - getDisplayWidth(icon))]));
}
function getPrettyFormatter(options = {}) {
  const { timestamp = "none", timestampColor = "rgb(100,116,139)", timestampStyle = "dim", level: levelFormat = "full", levelColors = {}, levelStyle = "underline", icons = true, categorySeparator = "\xB7", categoryColor = "rgb(100,116,139)", categoryColorMap = /* @__PURE__ */ new Map(), categoryStyle = ["dim", "italic"], categoryWidth = 20, categoryTruncate = "middle", messageColor = "rgb(148,163,184)", messageStyle = "dim", colors: useColors = true, align = true, inspectOptions = {}, wordWrap = true } = options;
  const baseIconMap = icons === false ? {
    trace: "",
    debug: "",
    info: "",
    warning: "",
    error: "",
    fatal: ""
  } : icons === true ? defaultIcons : {
    ...defaultIcons,
    ...icons
  };
  const iconMap = normalizeIconSpacing(baseIconMap);
  const resolvedLevelColors = {
    trace: defaultColors.trace,
    debug: defaultColors.debug,
    info: defaultColors.info,
    warning: defaultColors.warning,
    error: defaultColors.error,
    fatal: defaultColors.fatal,
    ...levelColors
  };
  const levelMappings = {
    "ABBR": {
      trace: "TRC",
      debug: "DBG",
      info: "INF",
      warning: "WRN",
      error: "ERR",
      fatal: "FTL"
    },
    "L": {
      trace: "T",
      debug: "D",
      info: "I",
      warning: "W",
      error: "E",
      fatal: "F"
    },
    "abbr": {
      trace: "trc",
      debug: "dbg",
      info: "inf",
      warning: "wrn",
      error: "err",
      fatal: "ftl"
    },
    "l": {
      trace: "t",
      debug: "d",
      info: "i",
      warning: "w",
      error: "e",
      fatal: "f"
    }
  };
  const formatLevel = (level) => {
    if (typeof levelFormat === "function") return levelFormat(level);
    if (levelFormat === "FULL") return level.toUpperCase();
    if (levelFormat === "full") return level;
    return levelMappings[levelFormat]?.[level] ?? level;
  };
  const timestampFormatters2 = {
    "date-time-timezone": (ts) => {
      const iso = new Date(ts).toISOString();
      return iso.replace("T", " ").replace("Z", " +00:00");
    },
    "date-time-tz": (ts) => {
      const iso = new Date(ts).toISOString();
      return iso.replace("T", " ").replace("Z", " +00");
    },
    "date-time": (ts) => {
      const iso = new Date(ts).toISOString();
      return iso.replace("T", " ").replace("Z", "");
    },
    "time-timezone": (ts) => {
      const iso = new Date(ts).toISOString();
      return iso.replace(/.*T/, "").replace("Z", " +00:00");
    },
    "time-tz": (ts) => {
      const iso = new Date(ts).toISOString();
      return iso.replace(/.*T/, "").replace("Z", " +00");
    },
    "time": (ts) => {
      const iso = new Date(ts).toISOString();
      return iso.replace(/.*T/, "").replace("Z", "");
    },
    "date": (ts) => new Date(ts).toISOString().replace(/T.*/, ""),
    "rfc3339": (ts) => new Date(ts).toISOString()
  };
  let timestampFn = null;
  if (timestamp === "none" || timestamp === "disabled") timestampFn = null;
  else if (typeof timestamp === "function") timestampFn = timestamp;
  else timestampFn = timestampFormatters2[timestamp] ?? null;
  const wordWrapEnabled = wordWrap !== false;
  let wordWrapWidth;
  if (typeof wordWrap === "number") wordWrapWidth = wordWrap;
  else if (wordWrap === true) wordWrapWidth = getOptimalWordWrapWidth(80);
  else wordWrapWidth = 80;
  const categoryPatterns = prepareCategoryPatterns(categoryColorMap);
  const allLevels = [
    "trace",
    "debug",
    "info",
    "warning",
    "error",
    "fatal"
  ];
  const levelWidth = Math.max(...allLevels.map((l) => formatLevel(l).length));
  return (record) => {
    const icon = iconMap[record.level] || "";
    const level = formatLevel(record.level);
    const categoryStr = truncateCategory(record.category, categoryWidth, categorySeparator, categoryTruncate);
    let message = "";
    const messageColorCode = useColors ? colorToAnsi(messageColor) : "";
    const messageStyleCode = useColors ? styleToAnsi(messageStyle) : "";
    const messagePrefix = useColors ? `${messageStyleCode}${messageColorCode}` : "";
    for (let i = 0; i < record.message.length; i++) if (i % 2 === 0) message += record.message[i];
    else {
      const value = record.message[i];
      const inspected = inspect3(value, {
        colors: useColors,
        ...inspectOptions
      });
      if (inspected.includes("\n")) {
        const lines = inspected.split("\n");
        const formattedLines = lines.map((line, index) => {
          if (index === 0) if (useColors && (messageColorCode || messageStyleCode)) return `${RESET2}${line}${messagePrefix}`;
          else return line;
          else if (useColors && (messageColorCode || messageStyleCode)) return `${line}${messagePrefix}`;
          else return line;
        });
        message += formattedLines.join("\n");
      } else if (useColors && (messageColorCode || messageStyleCode)) message += `${RESET2}${inspected}${messagePrefix}`;
      else message += inspected;
    }
    const finalCategoryColor = useColors ? matchCategoryColor(record.category, categoryPatterns) || categoryColor : null;
    const formattedIcon = icon;
    let formattedLevel = level;
    let formattedCategory = categoryStr;
    let formattedMessage = message;
    let formattedTimestamp = "";
    if (useColors) {
      const levelColorCode = colorToAnsi(resolvedLevelColors[record.level]);
      const levelStyleCode = styleToAnsi(levelStyle);
      formattedLevel = `${levelStyleCode}${levelColorCode}${level}${RESET2}`;
      const categoryColorCode = colorToAnsi(finalCategoryColor);
      const categoryStyleCode = styleToAnsi(categoryStyle);
      formattedCategory = `${categoryStyleCode}${categoryColorCode}${categoryStr}${RESET2}`;
      formattedMessage = `${messagePrefix}${message}${RESET2}`;
    }
    if (timestampFn) {
      const ts = timestampFn(record.timestamp);
      if (ts !== null) if (useColors) {
        const timestampColorCode = colorToAnsi(timestampColor);
        const timestampStyleCode = styleToAnsi(timestampStyle);
        formattedTimestamp = `${timestampStyleCode}${timestampColorCode}${ts}${RESET2}  `;
      } else formattedTimestamp = `${ts}  `;
    }
    if (align) {
      const levelColorLength = useColors ? colorToAnsi(resolvedLevelColors[record.level]).length + styleToAnsi(levelStyle).length + RESET2.length : 0;
      const categoryColorLength = useColors ? colorToAnsi(finalCategoryColor).length + styleToAnsi(categoryStyle).length + RESET2.length : 0;
      const paddedLevel = formattedLevel.padEnd(levelWidth + levelColorLength);
      const paddedCategory = formattedCategory.padEnd(categoryWidth + categoryColorLength);
      let result = `${formattedTimestamp}${formattedIcon} ${paddedLevel} ${paddedCategory} ${formattedMessage}`;
      if (wordWrapEnabled || message.includes("\n")) result = wrapText(result, wordWrapEnabled ? wordWrapWidth : Infinity, message);
      return result + "\n";
    } else {
      let result = `${formattedTimestamp}${formattedIcon} ${formattedLevel} ${formattedCategory} ${formattedMessage}`;
      if (wordWrapEnabled || message.includes("\n")) result = wrapText(result, wordWrapEnabled ? wordWrapWidth : Infinity, message);
      return result + "\n";
    }
  };
}
var prettyFormatter = getPrettyFormatter();

// utils/logger.ts
var isConfigured = false;
async function setupLogger(debugMode) {
  if (isConfigured) {
    return;
  }
  const lowestLevel = debugMode ? "debug" : "info";
  await configure({
    sinks: {
      console: getConsoleSink({
        formatter: getPrettyFormatter({
          icons: false,
          // Remove emoji icons
          align: false,
          // Disable column alignment for cleaner output
          inspectOptions: {
            depth: Infinity,
            // Unlimited depth for complex objects
            colors: true,
            // Keep syntax highlighting
            compact: false
            // Use readable formatting
          }
        })
      })
    },
    loggers: [
      {
        category: [],
        lowestLevel,
        sinks: ["console"]
      },
      // Suppress LogTape meta logger info messages
      {
        category: ["logtape", "meta"],
        lowestLevel: "warning",
        sinks: ["console"]
      }
    ]
  });
  isConfigured = true;
}
var logger = {
  // CLI and startup logging
  cli: getLogger(["cli"]),
  // Chat handling and streaming
  chat: getLogger(["chat"]),
  // History and conversation management
  history: getLogger(["history"]),
  // API handlers
  api: getLogger(["api"]),
  // General application logging
  app: getLogger(["app"])
};

// handlers/projects.ts
async function handleProjectsRequest(c) {
  try {
    const homeDir = getHomeDir();
    if (!homeDir) {
      return c.json({ error: "Home directory not found" }, 500);
    }
    const claudeConfigPath = `${homeDir}/.claude.json`;
    try {
      const configContent = await readTextFile(claudeConfigPath);
      const config = JSON.parse(configContent);
      if (config.projects && typeof config.projects === "object") {
        const projectPaths = Object.keys(config.projects);
        const projects = [];
        for (const path of projectPaths) {
          const encodedName = await getEncodedProjectName(path);
          if (encodedName) {
            projects.push({
              path,
              encodedName
            });
          }
        }
        const response = { projects };
        return c.json(response);
      } else {
        const response = { projects: [] };
        return c.json(response);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("No such file")) {
        const response = { projects: [] };
        return c.json(response);
      }
      throw error;
    }
  } catch (error) {
    logger.api.error("Error reading projects: {error}", { error });
    return c.json({ error: "Failed to read projects" }, 500);
  }
}

// history/parser.ts
async function parseHistoryFile(filePath) {
  try {
    const content = await readTextFile(filePath);
    const lines = content.trim().split("\n").filter((line) => line.trim());
    if (lines.length === 0) {
      return null;
    }
    const messages = [];
    const messageIds = /* @__PURE__ */ new Set();
    let startTime = "";
    let lastTime = "";
    let lastMessagePreview = "";
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        messages.push(parsed);
        if (parsed.message?.role === "assistant" && parsed.message?.id) {
          messageIds.add(parsed.message.id);
        }
        if (!startTime || parsed.timestamp < startTime) {
          startTime = parsed.timestamp;
        }
        if (!lastTime || parsed.timestamp > lastTime) {
          lastTime = parsed.timestamp;
        }
        if (parsed.message?.role === "assistant" && parsed.message?.content) {
          const content2 = parsed.message.content;
          if (Array.isArray(content2)) {
            for (const item of content2) {
              if (typeof item === "object" && item && "text" in item) {
                lastMessagePreview = String(item.text).substring(0, 100);
                break;
              }
            }
          } else if (typeof content2 === "string") {
            lastMessagePreview = content2.substring(0, 100);
          }
        }
      } catch (parseError) {
        logger.history.error(`Failed to parse line in ${filePath}: {error}`, {
          error: parseError
        });
      }
    }
    const fileName = filePath.split("/").pop() || "";
    const sessionId = fileName.replace(".jsonl", "");
    return {
      sessionId,
      filePath,
      messages,
      messageIds,
      startTime,
      lastTime,
      messageCount: messages.length,
      lastMessagePreview: lastMessagePreview || "No preview available"
    };
  } catch (error) {
    logger.history.error(`Failed to read history file ${filePath}: {error}`, {
      error
    });
    return null;
  }
}
async function getHistoryFiles(historyDir) {
  try {
    const files = [];
    for await (const entry of readDir(historyDir)) {
      if (entry.isFile && entry.name.endsWith(".jsonl")) {
        files.push(`${historyDir}/${entry.name}`);
      }
    }
    return files;
  } catch {
    return [];
  }
}
async function parseAllHistoryFiles(historyDir) {
  const filePaths = await getHistoryFiles(historyDir);
  const results = [];
  for (const filePath of filePaths) {
    const parsed = await parseHistoryFile(filePath);
    if (parsed) {
      results.push(parsed);
    }
  }
  return results;
}
function isSubset(subset, superset) {
  if (subset.size > superset.size) {
    return false;
  }
  for (const item of subset) {
    if (!superset.has(item)) {
      return false;
    }
  }
  return true;
}

// history/grouping.ts
function groupConversations(conversationFiles) {
  if (conversationFiles.length === 0) {
    return [];
  }
  const sortedConversations = [...conversationFiles].sort((a, b) => {
    return a.messageIds.size - b.messageIds.size;
  });
  const uniqueConversations = [];
  for (const currentConv of sortedConversations) {
    const isSubsetOfExisting = uniqueConversations.some(
      (existingConv) => isSubset(currentConv.messageIds, existingConv.messageIds)
    );
    if (!isSubsetOfExisting) {
      uniqueConversations.push(currentConv);
    }
  }
  const summaries = uniqueConversations.map(
    (conv) => createConversationSummary(conv)
  );
  summaries.sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  return summaries;
}
function createConversationSummary(conversationFile) {
  return {
    sessionId: conversationFile.sessionId,
    startTime: conversationFile.startTime,
    lastTime: conversationFile.lastTime,
    messageCount: conversationFile.messageCount,
    lastMessagePreview: conversationFile.lastMessagePreview
  };
}

// handlers/histories.ts
async function handleHistoriesRequest(c) {
  try {
    const encodedProjectName = c.req.param("encodedProjectName");
    if (!encodedProjectName) {
      return c.json({ error: "Encoded project name is required" }, 400);
    }
    if (!validateEncodedProjectName(encodedProjectName)) {
      return c.json({ error: "Invalid encoded project name" }, 400);
    }
    logger.history.debug(
      `Fetching histories for encoded project: ${encodedProjectName}`
    );
    const homeDir = getHomeDir();
    if (!homeDir) {
      return c.json({ error: "Home directory not found" }, 500);
    }
    const historyDir = `${homeDir}/.claude/projects/${encodedProjectName}`;
    logger.history.debug(`History directory: ${historyDir}`);
    try {
      const dirInfo = await stat(historyDir);
      if (!dirInfo.isDirectory) {
        return c.json({ error: "Project not found" }, 404);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("No such file")) {
        return c.json({ error: "Project not found" }, 404);
      }
      throw error;
    }
    const conversationFiles = await parseAllHistoryFiles(historyDir);
    logger.history.debug(
      `Found ${conversationFiles.length} conversation files`
    );
    const conversations = groupConversations(conversationFiles);
    logger.history.debug(
      `After grouping: ${conversations.length} unique conversations`
    );
    const response = {
      conversations
    };
    return c.json(response);
  } catch (error) {
    logger.history.error("Error fetching conversation histories: {error}", {
      error
    });
    return c.json(
      {
        error: "Failed to fetch conversation histories",
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
}

// history/timestampRestore.ts
function restoreTimestamps(messages) {
  const timestampMap = /* @__PURE__ */ new Map();
  for (const msg of messages) {
    if (msg.type === "assistant" && msg.message?.id) {
      const messageId = msg.message.id;
      if (!timestampMap.has(messageId)) {
        timestampMap.set(messageId, msg.timestamp);
      } else {
        const existingTimestamp = timestampMap.get(messageId);
        if (msg.timestamp < existingTimestamp) {
          timestampMap.set(messageId, msg.timestamp);
        }
      }
    }
  }
  return messages.map((msg) => {
    if (msg.type === "assistant" && msg.message?.id) {
      const restoredTimestamp = timestampMap.get(msg.message.id);
      if (restoredTimestamp) {
        return {
          ...msg,
          timestamp: restoredTimestamp
        };
      }
    }
    return msg;
  });
}
function sortMessagesByTimestamp(messages) {
  return [...messages].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });
}
function calculateConversationMetadata(messages) {
  if (messages.length === 0) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return {
      startTime: now,
      endTime: now,
      messageCount: 0
    };
  }
  const sortedMessages = sortMessagesByTimestamp(messages);
  const startTime = sortedMessages[0].timestamp;
  const endTime = sortedMessages[sortedMessages.length - 1].timestamp;
  return {
    startTime,
    endTime,
    messageCount: messages.length
  };
}
function processConversationMessages(messages, _sessionId) {
  const restoredMessages = restoreTimestamps(messages);
  const sortedMessages = sortMessagesByTimestamp(restoredMessages);
  const metadata = calculateConversationMetadata(sortedMessages);
  return {
    messages: sortedMessages,
    metadata
  };
}

// history/conversationLoader.ts
async function loadConversation(encodedProjectName, sessionId) {
  if (!validateEncodedProjectName(encodedProjectName)) {
    throw new Error("Invalid encoded project name");
  }
  if (!validateSessionId(sessionId)) {
    throw new Error("Invalid session ID format");
  }
  const homeDir = getHomeDir();
  if (!homeDir) {
    throw new Error("Home directory not found");
  }
  const historyDir = `${homeDir}/.claude/projects/${encodedProjectName}`;
  const filePath = `${historyDir}/${sessionId}.jsonl`;
  if (!await exists(filePath)) {
    return null;
  }
  try {
    const conversationHistory = await parseConversationFile(
      filePath,
      sessionId
    );
    return conversationHistory;
  } catch (error) {
    throw error;
  }
}
async function parseConversationFile(filePath, sessionId) {
  const content = await readTextFile(filePath);
  const lines = content.trim().split("\n").filter((line) => line.trim());
  if (lines.length === 0) {
    throw new Error("Empty conversation file");
  }
  const rawLines = [];
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      rawLines.push(parsed);
    } catch (parseError) {
      logger.history.error(`Failed to parse line in ${filePath}: {error}`, {
        error: parseError
      });
    }
  }
  const { messages: processedMessages, metadata } = processConversationMessages(
    rawLines,
    sessionId
  );
  return {
    sessionId,
    messages: processedMessages,
    metadata
  };
}
function validateSessionId(sessionId) {
  if (!sessionId) {
    return false;
  }
  const dangerousChars = /[<>:"|?*\x00-\x1f\/\\]/;
  if (dangerousChars.test(sessionId)) {
    return false;
  }
  if (sessionId.length > 255) {
    return false;
  }
  if (sessionId.startsWith(".")) {
    return false;
  }
  return true;
}

// handlers/conversations.ts
async function handleConversationRequest(c) {
  try {
    const encodedProjectName = c.req.param("encodedProjectName");
    const sessionId = c.req.param("sessionId");
    if (!encodedProjectName) {
      return c.json({ error: "Encoded project name is required" }, 400);
    }
    if (!sessionId) {
      return c.json({ error: "Session ID is required" }, 400);
    }
    if (!validateEncodedProjectName(encodedProjectName)) {
      return c.json({ error: "Invalid encoded project name" }, 400);
    }
    logger.history.debug(
      `Fetching conversation details for project: ${encodedProjectName}, session: ${sessionId}`
    );
    const conversationHistory = await loadConversation(
      encodedProjectName,
      sessionId
    );
    if (!conversationHistory) {
      return c.json(
        {
          error: "Conversation not found",
          sessionId
        },
        404
      );
    }
    logger.history.debug(
      `Loaded conversation with ${conversationHistory.messages.length} messages`
    );
    return c.json(conversationHistory);
  } catch (error) {
    logger.history.error("Error fetching conversation details: {error}", {
      error
    });
    if (error instanceof Error) {
      if (error.message.includes("Invalid session ID")) {
        return c.json(
          {
            error: "Invalid session ID format",
            details: error.message
          },
          400
        );
      }
      if (error.message.includes("Invalid encoded project name")) {
        return c.json(
          {
            error: "Invalid project name",
            details: error.message
          },
          400
        );
      }
    }
    return c.json(
      {
        error: "Failed to fetch conversation details",
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
}

// handlers/chat.ts
init_sdk();
async function* executeClaudeCommand(message, requestId, requestAbortControllers, cliPath, sessionId, allowedTools, workingDirectory, permissionMode) {
  let abortController;
  try {
    let processedMessage = message;
    if (message.startsWith("/")) {
      processedMessage = message.substring(1);
    }
    abortController = new AbortController();
    requestAbortControllers.set(requestId, abortController);
    for await (const sdkMessage of query({
      prompt: processedMessage,
      options: {
        abortController,
        executable: "node",
        executableArgs: [],
        pathToClaudeCodeExecutable: cliPath,
        ...sessionId ? { resume: sessionId } : {},
        ...allowedTools ? { allowedTools } : {},
        ...workingDirectory ? { cwd: workingDirectory } : {},
        ...permissionMode ? { permissionMode } : {}
      }
    })) {
      logger.chat.debug("Claude SDK Message: {sdkMessage}", { sdkMessage });
      yield {
        type: "claude_json",
        data: sdkMessage
      };
    }
    yield { type: "done" };
  } catch (error) {
    {
      logger.chat.error("Claude Code execution failed: {error}", { error });
      yield {
        type: "error",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  } finally {
    if (requestAbortControllers.has(requestId)) {
      requestAbortControllers.delete(requestId);
    }
  }
}
async function handleChatRequest(c, requestAbortControllers) {
  const chatRequest = await c.req.json();
  const { cliPath } = c.var.config;
  logger.chat.debug(
    "Received chat request {*}",
    chatRequest
  );
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of executeClaudeCommand(
          chatRequest.message,
          chatRequest.requestId,
          requestAbortControllers,
          cliPath,
          // Use detected CLI path from validateClaudeCli
          chatRequest.sessionId,
          chatRequest.allowedTools,
          chatRequest.workingDirectory,
          chatRequest.permissionMode
        )) {
          const data = JSON.stringify(chunk) + "\n";
          controller.enqueue(new TextEncoder().encode(data));
        }
        controller.close();
      } catch (error) {
        const errorResponse = {
          type: "error",
          error: error instanceof Error ? error.message : String(error)
        };
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(errorResponse) + "\n")
        );
        controller.close();
      }
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}

// handlers/abort.ts
function handleAbortRequest(c, requestAbortControllers) {
  const requestId = c.req.param("requestId");
  if (!requestId) {
    return c.json({ error: "Request ID is required" }, 400);
  }
  logger.api.debug(`Abort attempt for request: ${requestId}`);
  logger.api.debug(
    `Active requests: ${Array.from(requestAbortControllers.keys())}`
  );
  const abortController = requestAbortControllers.get(requestId);
  if (abortController) {
    abortController.abort();
    requestAbortControllers.delete(requestId);
    logger.api.debug(`Aborted request: ${requestId}`);
    return c.json({ success: true, message: "Request aborted" });
  } else {
    return c.json({ error: "Request not found or already completed" }, 404);
  }
}

// handlers/sessions.ts
async function handleSessionsRequest(c) {
  try {
    const homeDir = getHomeDir();
    if (!homeDir) {
      return c.json({ error: "Home directory not found" }, 500);
    }
    const projectsDir = `${homeDir}/.claude/projects`;
    if (!await exists(projectsDir)) {
      return c.json({ sessions: [] });
    }
    const sessions = [];
    for await (const projectEntry of readDir(projectsDir)) {
      if (!projectEntry.isDirectory) continue;
      const encodedProjectName = projectEntry.name;
      const historyDir = `${projectsDir}/${encodedProjectName}`;
      for await (const fileEntry of readDir(historyDir)) {
        if (!fileEntry.isFile || !fileEntry.name.endsWith(".jsonl")) continue;
        const sessionId = fileEntry.name.replace(".jsonl", "");
        let lastModified;
        try {
          const s = await stat(`${historyDir}/${fileEntry.name}`);
          lastModified = s.mtime?.getTime();
        } catch {
        }
        sessions.push({
          sessionId,
          project: historyDir,
          encodedProjectName,
          lastModified
        });
      }
    }
    sessions.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
    return c.json({ sessions, count: sessions.length });
  } catch (error) {
    logger.app.error("Error listing sessions: {error}", { error });
    return c.json(
      {
        error: "Failed to list sessions",
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
}

// scheduler/cronManager.ts
init_sdk();
var import_node_cron = __toESM(require_node_cron(), 1);
var SCHEDULED_TASKS = /* @__PURE__ */ new Map();
function getJobsPath() {
  const home = getHomeDir() || "/tmp";
  return `${home}/.claude/cron/jobs.json`;
}
async function ensureCronDir() {
  const home = getHomeDir() || "/tmp";
  const dir = `${home}/.claude/cron`;
  if (!await exists(dir)) {
    await mkdir(dir);
  }
}
async function loadJobs() {
  try {
    const path = getJobsPath();
    if (!await exists(path)) {
      return [];
    }
    const content = await readTextFile(path);
    return JSON.parse(content);
  } catch (error) {
    logger.app.error("Failed to load cron jobs: {error}", { error });
    return [];
  }
}
async function saveJobs(jobs) {
  await ensureCronDir();
  const path = getJobsPath();
  await writeTextFile(path, JSON.stringify(jobs, null, 2));
}
async function executeJob(job, cliPath) {
  try {
    const lines = [];
    for await (const msg of query({
      prompt: job.prompt,
      options: {
        executable: "node",
        executableArgs: [],
        pathToClaudeCodeExecutable: cliPath,
        ...job.workingDirectory ? { cwd: job.workingDirectory } : {},
        ...job.allowedTools ? { allowedTools: job.allowedTools } : {},
        ...job.permissionMode ? { permissionMode: job.permissionMode } : {}
      }
    })) {
      if (typeof msg === "object" && msg !== null) {
        lines.push(JSON.stringify(msg));
      }
    }
    const result = lines.join("\n").slice(0, 2e3);
    return result || "Done (no output)";
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    logger.app.error("Cron job {id} failed: {error}", {
      id: job.id,
      error: err
    });
    return `Error: ${err}`;
  }
}
async function startScheduler(cliPath) {
  for (const task of SCHEDULED_TASKS.values()) {
    task.stop();
  }
  SCHEDULED_TASKS.clear();
  const jobs = await loadJobs();
  for (const job of jobs) {
    if (!job.enabled || !import_node_cron.default.validate(job.schedule)) {
      continue;
    }
    const task = import_node_cron.default.schedule(
      job.schedule,
      async () => {
        logger.app.info("Executing cron job {name} ({id})", {
          name: job.name,
          id: job.id
        });
        const result = await executeJob(job, cliPath);
        job.lastRun = (/* @__PURE__ */ new Date()).toISOString();
        job.lastResult = result;
        await saveJobs(jobs);
      }
    );
    SCHEDULED_TASKS.set(job.id, task);
  }
  logger.app.info("Cron scheduler started with {count} jobs", {
    count: SCHEDULED_TASKS.size
  });
}
async function addJob(job, cliPath) {
  const jobs = await loadJobs();
  const newJob = {
    ...job,
    id: crypto.randomUUID(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  jobs.push(newJob);
  await saveJobs(jobs);
  await startScheduler(cliPath);
  return newJob;
}
async function updateJob(id, updates, cliPath) {
  const jobs = await loadJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return null;
  jobs[idx] = { ...jobs[idx], ...updates };
  await saveJobs(jobs);
  await startScheduler(cliPath);
  return jobs[idx];
}
async function deleteJob(id, cliPath) {
  const jobs = await loadJobs();
  const filtered = jobs.filter((j) => j.id !== id);
  if (filtered.length === jobs.length) return false;
  await saveJobs(filtered);
  await startScheduler(cliPath);
  return true;
}

// handlers/cron.ts
async function handleCronListRequest(c) {
  try {
    const jobs = await loadJobs();
    return c.json({ jobs, count: jobs.length });
  } catch (error) {
    logger.app.error("Error listing cron jobs: {error}", { error });
    return c.json({ error: "Failed to list cron jobs" }, 500);
  }
}
async function handleCronCreateRequest(c) {
  try {
    const body = await c.req.json();
    const { name, schedule, prompt, workingDirectory, allowedTools, permissionMode, enabled } = body;
    if (!name || !schedule || !prompt) {
      return c.json({ error: "name, schedule, and prompt are required" }, 400);
    }
    const { cliPath } = c.var.config;
    const job = await addJob(
      {
        name,
        schedule,
        prompt,
        workingDirectory,
        allowedTools,
        permissionMode,
        enabled: enabled !== false
      },
      cliPath
    );
    return c.json({ job }, 201);
  } catch (error) {
    logger.app.error("Error creating cron job: {error}", { error });
    return c.json(
      {
        error: "Failed to create cron job",
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
}
async function handleCronUpdateRequest(c) {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { cliPath } = c.var.config;
    const job = await updateJob(id, body, cliPath);
    if (!job) {
      return c.json({ error: "Job not found" }, 404);
    }
    return c.json({ job });
  } catch (error) {
    logger.app.error("Error updating cron job: {error}", { error });
    return c.json(
      {
        error: "Failed to update cron job",
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
}
async function handleCronDeleteRequest(c) {
  try {
    const id = c.req.param("id");
    const { cliPath } = c.var.config;
    const deleted = await deleteJob(id, cliPath);
    if (!deleted) {
      return c.json({ error: "Job not found" }, 404);
    }
    return c.json({ success: true });
  } catch (error) {
    logger.app.error("Error deleting cron job: {error}", { error });
    return c.json({ error: "Failed to delete cron job" }, 500);
  }
}
async function handleCronRunRequest(c) {
  try {
    const id = c.req.param("id");
    const { cliPath } = c.var.config;
    const jobs = await loadJobs();
    const job = jobs.find((j) => j.id === id);
    if (!job) {
      return c.json({ error: "Job not found" }, 404);
    }
    const { query: query2 } = await Promise.resolve().then(() => (init_sdk(), sdk_exports));
    const lines = [];
    for await (const msg of query2({
      prompt: job.prompt,
      options: {
        executable: "node",
        executableArgs: [],
        pathToClaudeCodeExecutable: cliPath,
        ...job.workingDirectory ? { cwd: job.workingDirectory } : {},
        ...job.allowedTools ? { allowedTools: job.allowedTools } : {},
        ...job.permissionMode ? { permissionMode: job.permissionMode } : {}
      }
    })) {
      if (typeof msg === "object" && msg !== null) {
        lines.push(JSON.stringify(msg));
      }
    }
    return c.json({
      result: lines.join("\n").slice(0, 2e3) || "Done (no output)"
    });
  } catch (error) {
    logger.app.error("Error running cron job: {error}", { error });
    return c.json({ error: "Failed to run job" }, 500);
  }
}

// middleware/auth.ts
var DEFAULT_API_KEY = "ccos-changeme";
function getApiKey() {
  return process.env.CCOS_API_KEY || DEFAULT_API_KEY;
}
async function authMiddleware(c, next) {
  const path = c.req.path;
  if (path === "/" || path.startsWith("/assets/") || path === "/api/health") {
    return next();
  }
  const authHeader = c.req.header("x-api-key");
  const expectedKey = getApiKey();
  if (expectedKey !== DEFAULT_API_KEY && authHeader !== expectedKey) {
    logger.app.warn("Unauthorized API request from {ip}", {
      ip: c.req.header("x-forwarded-for") || "unknown"
    });
    return c.json({ error: "Unauthorized. Set x-api-key header." }, 401);
  }
  return next();
}

// app.ts
function createApp(runtime2, config) {
  const app = new Hono2();
  const requestAbortControllers = /* @__PURE__ */ new Map();
  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "x-api-key"]
    })
  );
  app.use("/api/*", authMiddleware);
  app.use(
    "*",
    createConfigMiddleware({
      debugMode: config.debugMode,
      runtime: runtime2,
      cliPath: config.cliPath
    })
  );
  app.get("/api/projects", (c) => handleProjectsRequest(c));
  app.get(
    "/api/projects/:encodedProjectName/histories",
    (c) => handleHistoriesRequest(c)
  );
  app.get(
    "/api/projects/:encodedProjectName/histories/:sessionId",
    (c) => handleConversationRequest(c)
  );
  app.post(
    "/api/abort/:requestId",
    (c) => handleAbortRequest(c, requestAbortControllers)
  );
  app.post("/api/chat", (c) => handleChatRequest(c, requestAbortControllers));
  app.get("/api/sessions", (c) => handleSessionsRequest(c));
  app.get("/api/cron", (c) => handleCronListRequest(c));
  app.post("/api/cron", (c) => handleCronCreateRequest(c));
  app.put("/api/cron/:id", (c) => handleCronUpdateRequest(c));
  app.delete("/api/cron/:id", (c) => handleCronDeleteRequest(c));
  app.post("/api/cron/:id/run", (c) => handleCronRunRequest(c));
  app.get("/api/health", (c) => c.json({ status: "ok" }));
  startScheduler(config.cliPath).catch(
    (err) => logger.app.error("Failed to start cron scheduler: {error}", { error: err })
  );
  const serveStatic2 = runtime2.createStaticFileMiddleware({
    root: config.staticPath
  });
  app.use("/assets/*", serveStatic2);
  app.get("*", async (c) => {
    const path = c.req.path;
    if (path.startsWith("/api/")) {
      return c.text("Not found", 404);
    }
    try {
      const indexPath = `${config.staticPath}/index.html`;
      const indexFile = await readBinaryFile(indexPath);
      return c.html(new TextDecoder().decode(indexFile));
    } catch (error) {
      logger.app.error("Error serving index.html: {error}", { error });
      return c.text("Internal server error", 500);
    }
  });
  return app;
}

// runtime/node.ts
import { spawn as spawn2 } from "node:child_process";
import process3 from "node:process";

// node_modules/@hono/node-server/dist/index.mjs
import { createServer as createServerHTTP } from "http";
import { Http2ServerRequest as Http2ServerRequest2 } from "http2";
import { Http2ServerRequest } from "http2";
import { Readable } from "stream";
import crypto2 from "crypto";
var RequestError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "RequestError";
  }
};
var toRequestError = (e) => {
  if (e instanceof RequestError) {
    return e;
  }
  return new RequestError(e.message, { cause: e });
};
var GlobalRequest = global.Request;
var Request2 = class extends GlobalRequest {
  constructor(input, options) {
    if (typeof input === "object" && getRequestCache in input) {
      input = input[getRequestCache]();
    }
    if (typeof options?.body?.getReader !== "undefined") {
      ;
      options.duplex ??= "half";
    }
    super(input, options);
  }
};
var newHeadersFromIncoming = (incoming) => {
  const headerRecord = [];
  const rawHeaders = incoming.rawHeaders;
  for (let i = 0; i < rawHeaders.length; i += 2) {
    const { [i]: key, [i + 1]: value } = rawHeaders;
    if (key.charCodeAt(0) !== /*:*/
    58) {
      headerRecord.push([key, value]);
    }
  }
  return new Headers(headerRecord);
};
var wrapBodyStream = Symbol("wrapBodyStream");
var newRequestFromIncoming = (method, url, headers, incoming, abortController) => {
  const init = {
    method,
    headers,
    signal: abortController.signal
  };
  if (method === "TRACE") {
    init.method = "GET";
    const req = new Request2(url, init);
    Object.defineProperty(req, "method", {
      get() {
        return "TRACE";
      }
    });
    return req;
  }
  if (!(method === "GET" || method === "HEAD")) {
    if ("rawBody" in incoming && incoming.rawBody instanceof Buffer) {
      init.body = new ReadableStream({
        start(controller) {
          controller.enqueue(incoming.rawBody);
          controller.close();
        }
      });
    } else if (incoming[wrapBodyStream]) {
      let reader;
      init.body = new ReadableStream({
        async pull(controller) {
          try {
            reader ||= Readable.toWeb(incoming).getReader();
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
            } else {
              controller.enqueue(value);
            }
          } catch (error) {
            controller.error(error);
          }
        }
      });
    } else {
      init.body = Readable.toWeb(incoming);
    }
  }
  return new Request2(url, init);
};
var getRequestCache = Symbol("getRequestCache");
var requestCache = Symbol("requestCache");
var incomingKey = Symbol("incomingKey");
var urlKey = Symbol("urlKey");
var headersKey = Symbol("headersKey");
var abortControllerKey = Symbol("abortControllerKey");
var getAbortController = Symbol("getAbortController");
var requestPrototype = {
  get method() {
    return this[incomingKey].method || "GET";
  },
  get url() {
    return this[urlKey];
  },
  get headers() {
    return this[headersKey] ||= newHeadersFromIncoming(this[incomingKey]);
  },
  [getAbortController]() {
    this[getRequestCache]();
    return this[abortControllerKey];
  },
  [getRequestCache]() {
    this[abortControllerKey] ||= new AbortController();
    return this[requestCache] ||= newRequestFromIncoming(
      this.method,
      this[urlKey],
      this.headers,
      this[incomingKey],
      this[abortControllerKey]
    );
  }
};
[
  "body",
  "bodyUsed",
  "cache",
  "credentials",
  "destination",
  "integrity",
  "mode",
  "redirect",
  "referrer",
  "referrerPolicy",
  "signal",
  "keepalive"
].forEach((k) => {
  Object.defineProperty(requestPrototype, k, {
    get() {
      return this[getRequestCache]()[k];
    }
  });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
  Object.defineProperty(requestPrototype, k, {
    value: function() {
      return this[getRequestCache]()[k]();
    }
  });
});
Object.setPrototypeOf(requestPrototype, Request2.prototype);
var newRequest = (incoming, defaultHostname) => {
  const req = Object.create(requestPrototype);
  req[incomingKey] = incoming;
  const incomingUrl = incoming.url || "";
  if (incomingUrl[0] !== "/" && // short-circuit for performance. most requests are relative URL.
  (incomingUrl.startsWith("http://") || incomingUrl.startsWith("https://"))) {
    if (incoming instanceof Http2ServerRequest) {
      throw new RequestError("Absolute URL for :path is not allowed in HTTP/2");
    }
    try {
      const url2 = new URL(incomingUrl);
      req[urlKey] = url2.href;
    } catch (e) {
      throw new RequestError("Invalid absolute URL", { cause: e });
    }
    return req;
  }
  const host = (incoming instanceof Http2ServerRequest ? incoming.authority : incoming.headers.host) || defaultHostname;
  if (!host) {
    throw new RequestError("Missing host header");
  }
  let scheme;
  if (incoming instanceof Http2ServerRequest) {
    scheme = incoming.scheme;
    if (!(scheme === "http" || scheme === "https")) {
      throw new RequestError("Unsupported scheme");
    }
  } else {
    scheme = incoming.socket && incoming.socket.encrypted ? "https" : "http";
  }
  const url = new URL(`${scheme}://${host}${incomingUrl}`);
  if (url.hostname.length !== host.length && url.hostname !== host.replace(/:\d+$/, "")) {
    throw new RequestError("Invalid host header");
  }
  req[urlKey] = url.href;
  return req;
};
var responseCache = Symbol("responseCache");
var getResponseCache = Symbol("getResponseCache");
var cacheKey = Symbol("cache");
var GlobalResponse = global.Response;
var Response2 = class _Response {
  #body;
  #init;
  [getResponseCache]() {
    delete this[cacheKey];
    return this[responseCache] ||= new GlobalResponse(this.#body, this.#init);
  }
  constructor(body, init) {
    let headers;
    this.#body = body;
    if (init instanceof _Response) {
      const cachedGlobalResponse = init[responseCache];
      if (cachedGlobalResponse) {
        this.#init = cachedGlobalResponse;
        this[getResponseCache]();
        return;
      } else {
        this.#init = init.#init;
        headers = new Headers(init.#init.headers);
      }
    } else {
      this.#init = init;
    }
    if (typeof body === "string" || typeof body?.getReader !== "undefined" || body instanceof Blob || body instanceof Uint8Array) {
      headers ||= init?.headers || { "content-type": "text/plain; charset=UTF-8" };
      this[cacheKey] = [init?.status || 200, body, headers];
    }
  }
  get headers() {
    const cache = this[cacheKey];
    if (cache) {
      if (!(cache[2] instanceof Headers)) {
        cache[2] = new Headers(cache[2]);
      }
      return cache[2];
    }
    return this[getResponseCache]().headers;
  }
  get status() {
    return this[cacheKey]?.[0] ?? this[getResponseCache]().status;
  }
  get ok() {
    const status = this.status;
    return status >= 200 && status < 300;
  }
};
["body", "bodyUsed", "redirected", "statusText", "trailers", "type", "url"].forEach((k) => {
  Object.defineProperty(Response2.prototype, k, {
    get() {
      return this[getResponseCache]()[k];
    }
  });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
  Object.defineProperty(Response2.prototype, k, {
    value: function() {
      return this[getResponseCache]()[k]();
    }
  });
});
Object.setPrototypeOf(Response2, GlobalResponse);
Object.setPrototypeOf(Response2.prototype, GlobalResponse.prototype);
async function readWithoutBlocking(readPromise) {
  return Promise.race([readPromise, Promise.resolve().then(() => Promise.resolve(void 0))]);
}
function writeFromReadableStreamDefaultReader(reader, writable, currentReadPromise) {
  const handleError = () => {
  };
  writable.on("error", handleError);
  (currentReadPromise ?? reader.read()).then(flow, handleStreamError);
  return reader.closed.finally(() => {
    writable.off("error", handleError);
  });
  function handleStreamError(error) {
    if (error) {
      writable.destroy(error);
    }
  }
  function onDrain() {
    reader.read().then(flow, handleStreamError);
  }
  function flow({ done, value }) {
    try {
      if (done) {
        writable.end();
      } else if (!writable.write(value)) {
        writable.once("drain", onDrain);
      } else {
        return reader.read().then(flow, handleStreamError);
      }
    } catch (e) {
      handleStreamError(e);
    }
  }
}
function writeFromReadableStream(stream, writable) {
  if (stream.locked) {
    throw new TypeError("ReadableStream is locked.");
  } else if (writable.destroyed) {
    return;
  }
  return writeFromReadableStreamDefaultReader(stream.getReader(), writable);
}
var buildOutgoingHttpHeaders = (headers) => {
  const res = {};
  if (!(headers instanceof Headers)) {
    headers = new Headers(headers ?? void 0);
  }
  const cookies = [];
  for (const [k, v] of headers) {
    if (k === "set-cookie") {
      cookies.push(v);
    } else {
      res[k] = v;
    }
  }
  if (cookies.length > 0) {
    res["set-cookie"] = cookies;
  }
  res["content-type"] ??= "text/plain; charset=UTF-8";
  return res;
};
var X_ALREADY_SENT = "x-hono-already-sent";
var webFetch = global.fetch;
if (typeof global.crypto === "undefined") {
  global.crypto = crypto2;
}
global.fetch = (info, init) => {
  init = {
    // Disable compression handling so people can return the result of a fetch
    // directly in the loader without messing with the Content-Encoding header.
    compress: false,
    ...init
  };
  return webFetch(info, init);
};
var outgoingEnded = Symbol("outgoingEnded");
var handleRequestError = () => new Response(null, {
  status: 400
});
var handleFetchError = (e) => new Response(null, {
  status: e instanceof Error && (e.name === "TimeoutError" || e.constructor.name === "TimeoutError") ? 504 : 500
});
var handleResponseError = (e, outgoing) => {
  const err = e instanceof Error ? e : new Error("unknown error", { cause: e });
  if (err.code === "ERR_STREAM_PREMATURE_CLOSE") {
    console.info("The user aborted a request.");
  } else {
    console.error(e);
    if (!outgoing.headersSent) {
      outgoing.writeHead(500, { "Content-Type": "text/plain" });
    }
    outgoing.end(`Error: ${err.message}`);
    outgoing.destroy(err);
  }
};
var flushHeaders = (outgoing) => {
  if ("flushHeaders" in outgoing && outgoing.writable) {
    outgoing.flushHeaders();
  }
};
var responseViaCache = async (res, outgoing) => {
  let [status, body, header] = res[cacheKey];
  if (header instanceof Headers) {
    header = buildOutgoingHttpHeaders(header);
  }
  if (typeof body === "string") {
    header["Content-Length"] = Buffer.byteLength(body);
  } else if (body instanceof Uint8Array) {
    header["Content-Length"] = body.byteLength;
  } else if (body instanceof Blob) {
    header["Content-Length"] = body.size;
  }
  outgoing.writeHead(status, header);
  if (typeof body === "string" || body instanceof Uint8Array) {
    outgoing.end(body);
  } else if (body instanceof Blob) {
    outgoing.end(new Uint8Array(await body.arrayBuffer()));
  } else {
    flushHeaders(outgoing);
    await writeFromReadableStream(body, outgoing)?.catch(
      (e) => handleResponseError(e, outgoing)
    );
  }
  ;
  outgoing[outgoingEnded]?.();
};
var responseViaResponseObject = async (res, outgoing, options = {}) => {
  if (res instanceof Promise) {
    if (options.errorHandler) {
      try {
        res = await res;
      } catch (err) {
        const errRes = await options.errorHandler(err);
        if (!errRes) {
          return;
        }
        res = errRes;
      }
    } else {
      res = await res.catch(handleFetchError);
    }
  }
  if (cacheKey in res) {
    return responseViaCache(res, outgoing);
  }
  const resHeaderRecord = buildOutgoingHttpHeaders(res.headers);
  if (res.body) {
    const reader = res.body.getReader();
    const values = [];
    let done = false;
    let currentReadPromise = void 0;
    if (resHeaderRecord["transfer-encoding"] !== "chunked") {
      let maxReadCount = 2;
      for (let i = 0; i < maxReadCount; i++) {
        currentReadPromise ||= reader.read();
        const chunk = await readWithoutBlocking(currentReadPromise).catch((e) => {
          console.error(e);
          done = true;
        });
        if (!chunk) {
          if (i === 1) {
            await new Promise((resolve) => setTimeout(resolve));
            maxReadCount = 3;
            continue;
          }
          break;
        }
        currentReadPromise = void 0;
        if (chunk.value) {
          values.push(chunk.value);
        }
        if (chunk.done) {
          done = true;
          break;
        }
      }
      if (done && !("content-length" in resHeaderRecord)) {
        resHeaderRecord["content-length"] = values.reduce((acc, value) => acc + value.length, 0);
      }
    }
    outgoing.writeHead(res.status, resHeaderRecord);
    values.forEach((value) => {
      ;
      outgoing.write(value);
    });
    if (done) {
      outgoing.end();
    } else {
      if (values.length === 0) {
        flushHeaders(outgoing);
      }
      await writeFromReadableStreamDefaultReader(reader, outgoing, currentReadPromise);
    }
  } else if (resHeaderRecord[X_ALREADY_SENT]) {
  } else {
    outgoing.writeHead(res.status, resHeaderRecord);
    outgoing.end();
  }
  ;
  outgoing[outgoingEnded]?.();
};
var getRequestListener = (fetchCallback, options = {}) => {
  const autoCleanupIncoming = options.autoCleanupIncoming ?? true;
  if (options.overrideGlobalObjects !== false && global.Request !== Request2) {
    Object.defineProperty(global, "Request", {
      value: Request2
    });
    Object.defineProperty(global, "Response", {
      value: Response2
    });
  }
  return async (incoming, outgoing) => {
    let res, req;
    try {
      req = newRequest(incoming, options.hostname);
      let incomingEnded = !autoCleanupIncoming || incoming.method === "GET" || incoming.method === "HEAD";
      if (!incomingEnded) {
        ;
        incoming[wrapBodyStream] = true;
        incoming.on("end", () => {
          incomingEnded = true;
        });
        if (incoming instanceof Http2ServerRequest2) {
          ;
          outgoing[outgoingEnded] = () => {
            if (!incomingEnded) {
              setTimeout(() => {
                if (!incomingEnded) {
                  setTimeout(() => {
                    incoming.destroy();
                    outgoing.destroy();
                  });
                }
              });
            }
          };
        }
      }
      outgoing.on("close", () => {
        const abortController = req[abortControllerKey];
        if (abortController) {
          if (incoming.errored) {
            req[abortControllerKey].abort(incoming.errored.toString());
          } else if (!outgoing.writableFinished) {
            req[abortControllerKey].abort("Client connection prematurely closed.");
          }
        }
        if (!incomingEnded) {
          setTimeout(() => {
            if (!incomingEnded) {
              setTimeout(() => {
                incoming.destroy();
              });
            }
          });
        }
      });
      res = fetchCallback(req, { incoming, outgoing });
      if (cacheKey in res) {
        return responseViaCache(res, outgoing);
      }
    } catch (e) {
      if (!res) {
        if (options.errorHandler) {
          res = await options.errorHandler(req ? e : toRequestError(e));
          if (!res) {
            return;
          }
        } else if (!req) {
          res = handleRequestError();
        } else {
          res = handleFetchError(e);
        }
      } else {
        return handleResponseError(e, outgoing);
      }
    }
    try {
      return await responseViaResponseObject(res, outgoing, options);
    } catch (e) {
      return handleResponseError(e, outgoing);
    }
  };
};
var createAdaptorServer = (options) => {
  const fetchCallback = options.fetch;
  const requestListener = getRequestListener(fetchCallback, {
    hostname: options.hostname,
    overrideGlobalObjects: options.overrideGlobalObjects,
    autoCleanupIncoming: options.autoCleanupIncoming
  });
  const createServer = options.createServer || createServerHTTP;
  const server = createServer(options.serverOptions || {}, requestListener);
  return server;
};
var serve = (options, listeningListener) => {
  const server = createAdaptorServer(options);
  server.listen(options?.port ?? 3e3, options.hostname, () => {
    const serverInfo = server.address();
    listeningListener && listeningListener(serverInfo);
  });
  return server;
};

// node_modules/hono/dist/utils/mime.js
var getMimeType = (filename, mimes = baseMimes) => {
  const regexp = /\.([a-zA-Z0-9]+?)$/;
  const match = filename.match(regexp);
  if (!match) {
    return;
  }
  let mimeType = mimes[match[1]];
  if (mimeType && mimeType.startsWith("text")) {
    mimeType += "; charset=utf-8";
  }
  return mimeType;
};
var _baseMimes = {
  aac: "audio/aac",
  avi: "video/x-msvideo",
  avif: "image/avif",
  av1: "video/av1",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  css: "text/css",
  csv: "text/csv",
  eot: "application/vnd.ms-fontobject",
  epub: "application/epub+zip",
  gif: "image/gif",
  gz: "application/gzip",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  ics: "text/calendar",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript",
  json: "application/json",
  jsonld: "application/ld+json",
  map: "application/json",
  mid: "audio/x-midi",
  midi: "audio/x-midi",
  mjs: "text/javascript",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  oga: "audio/ogg",
  ogv: "video/ogg",
  ogx: "application/ogg",
  opus: "audio/opus",
  otf: "font/otf",
  pdf: "application/pdf",
  png: "image/png",
  rtf: "application/rtf",
  svg: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  ts: "video/mp2t",
  ttf: "font/ttf",
  txt: "text/plain",
  wasm: "application/wasm",
  webm: "video/webm",
  weba: "audio/webm",
  webmanifest: "application/manifest+json",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xhtml: "application/xhtml+xml",
  xml: "application/xml",
  zip: "application/zip",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",
  gltf: "model/gltf+json",
  glb: "model/gltf-binary"
};
var baseMimes = _baseMimes;

// node_modules/@hono/node-server/dist/serve-static.mjs
import { createReadStream, lstatSync, existsSync as existsSync2 } from "fs";
import { join as join3 } from "path";
var COMPRESSIBLE_CONTENT_TYPE_REGEX = /^\s*(?:text\/[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i;
var ENCODINGS = {
  br: ".br",
  zstd: ".zst",
  gzip: ".gz"
};
var ENCODINGS_ORDERED_KEYS = Object.keys(ENCODINGS);
var createStreamBody = (stream) => {
  const body = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      stream.on("end", () => {
        controller.close();
      });
    },
    cancel() {
      stream.destroy();
    }
  });
  return body;
};
var getStats = (path) => {
  let stats;
  try {
    stats = lstatSync(path);
  } catch {
  }
  return stats;
};
var serveStatic = (options = { root: "" }) => {
  const root = options.root || "";
  const optionPath = options.path;
  if (root !== "" && !existsSync2(root)) {
    console.error(`serveStatic: root path '${root}' is not found, are you sure it's correct?`);
  }
  return async (c, next) => {
    if (c.finalized) {
      return next();
    }
    let filename;
    if (optionPath) {
      filename = optionPath;
    } else {
      try {
        filename = decodeURIComponent(c.req.path);
        if (/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(filename)) {
          throw new Error();
        }
      } catch {
        await options.onNotFound?.(c.req.path, c);
        return next();
      }
    }
    let path = join3(
      root,
      !optionPath && options.rewriteRequestPath ? options.rewriteRequestPath(filename, c) : filename
    );
    let stats = getStats(path);
    if (stats && stats.isDirectory()) {
      const indexFile = options.index ?? "index.html";
      path = join3(path, indexFile);
      stats = getStats(path);
    }
    if (!stats) {
      await options.onNotFound?.(path, c);
      return next();
    }
    await options.onFound?.(path, c);
    const mimeType = getMimeType(path);
    c.header("Content-Type", mimeType || "application/octet-stream");
    if (options.precompressed && (!mimeType || COMPRESSIBLE_CONTENT_TYPE_REGEX.test(mimeType))) {
      const acceptEncodingSet = new Set(
        c.req.header("Accept-Encoding")?.split(",").map((encoding) => encoding.trim())
      );
      for (const encoding of ENCODINGS_ORDERED_KEYS) {
        if (!acceptEncodingSet.has(encoding)) {
          continue;
        }
        const precompressedStats = getStats(path + ENCODINGS[encoding]);
        if (precompressedStats) {
          c.header("Content-Encoding", encoding);
          c.header("Vary", "Accept-Encoding", { append: true });
          stats = precompressedStats;
          path = path + ENCODINGS[encoding];
          break;
        }
      }
    }
    const size = stats.size;
    if (c.req.method == "HEAD" || c.req.method == "OPTIONS") {
      c.header("Content-Length", size.toString());
      c.status(200);
      return c.body(null);
    }
    const range = c.req.header("range") || "";
    if (!range) {
      c.header("Content-Length", size.toString());
      return c.body(createStreamBody(createReadStream(path)), 200);
    }
    c.header("Accept-Ranges", "bytes");
    c.header("Date", stats.birthtime.toUTCString());
    const parts = range.replace(/bytes=/, "").split("-", 2);
    const start = parseInt(parts[0], 10) || 0;
    let end = parseInt(parts[1], 10) || size - 1;
    if (size < end - start + 1) {
      end = size - 1;
    }
    const chunksize = end - start + 1;
    const stream = createReadStream(path, { start, end });
    c.header("Content-Length", chunksize.toString());
    c.header("Content-Range", `bytes ${start}-${end}/${stats.size}`);
    return c.body(createStreamBody(stream), 206);
  };
};

// runtime/node.ts
var NodeRuntime = class {
  async findExecutable(name) {
    const platform = getPlatform();
    const candidates = [];
    if (platform === "windows") {
      const executableNames = [
        name,
        `${name}.exe`,
        `${name}.cmd`,
        `${name}.bat`
      ];
      for (const execName of executableNames) {
        const result = await this.runCommand("where", [execName]);
        if (result.success && result.stdout.trim()) {
          const paths = result.stdout.trim().split("\n").map((p) => p.trim()).filter((p) => p);
          candidates.push(...paths);
        }
      }
    } else {
      const result = await this.runCommand("which", [name]);
      if (result.success && result.stdout.trim()) {
        candidates.push(result.stdout.trim());
      }
    }
    return candidates;
  }
  runCommand(command, args, options) {
    return new Promise((resolve) => {
      const isWindows = getPlatform() === "windows";
      const spawnOptions = {
        stdio: ["ignore", "pipe", "pipe"],
        env: options?.env ? { ...process3.env, ...options.env } : process3.env
      };
      let actualCommand = command;
      let actualArgs = args;
      if (isWindows) {
        actualCommand = "cmd.exe";
        actualArgs = ["/c", command, ...args];
      }
      const child = spawn2(actualCommand, actualArgs, spawnOptions);
      const textDecoder = new TextDecoder();
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (data) => {
        stdout += textDecoder.decode(data, { stream: true });
      });
      child.stderr?.on("data", (data) => {
        stderr += textDecoder.decode(data, { stream: true });
      });
      child.on("close", (code) => {
        resolve({
          success: code === 0,
          code: code ?? 1,
          stdout,
          stderr
        });
      });
      child.on("error", (error) => {
        resolve({
          success: false,
          code: 1,
          stdout: "",
          stderr: error.message
        });
      });
    });
  }
  serve(port, hostname, handler) {
    const app = new Hono2();
    app.all("*", async (c) => {
      const response = await handler(c.req.raw);
      return response;
    });
    serve({
      fetch: app.fetch,
      port,
      hostname
    });
    console.log(`Listening on http://${hostname}:${port}/`);
  }
  createStaticFileMiddleware(options) {
    return serveStatic(options);
  }
};

// node_modules/commander/esm.mjs
var import_index = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// cli/version.ts
var VERSION = "0.2.0-cronos";

// cli/args.ts
function parseCliArgs() {
  const version = VERSION;
  const defaultPort = parseInt(getEnv("PORT") || "8080", 10);
  program.name("claude-code-webui").version(version, "-v, --version", "display version number").description("Claude Code Web UI Backend Server").option(
    "-p, --port <port>",
    "Port to listen on",
    (value) => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        throw new Error(`Invalid port number: ${value}`);
      }
      return parsed;
    },
    defaultPort
  ).option(
    "--host <host>",
    "Host address to bind to (use 0.0.0.0 for all interfaces)",
    "127.0.0.1"
  ).option(
    "--claude-path <path>",
    "Path to claude executable (overrides automatic detection)"
  ).option("-d, --debug", "Enable debug mode", false);
  program.parse(getArgs(), { from: "user" });
  const options = program.opts();
  const debugEnv = getEnv("DEBUG");
  const debugFromEnv = debugEnv?.toLowerCase() === "true" || debugEnv === "1";
  return {
    debug: options.debug || debugFromEnv,
    port: options.port,
    host: options.host,
    claudePath: options.claudePath
  };
}

// cli/validation.ts
import { dirname, join as join4 } from "node:path";
var DOUBLE_BACKSLASH_REGEX = /\\\\/g;
async function parseCmdScript(cmdPath) {
  try {
    logger.cli.debug(`Parsing Windows .cmd script: ${cmdPath}`);
    const cmdContent = await readTextFile(cmdPath);
    const cmdDir = dirname(cmdPath);
    const execLineMatch = cmdContent.match(/"%_prog%"[^"]*"(%dp0%\\[^"]+)"/);
    if (execLineMatch) {
      const fullPath = execLineMatch[1];
      const pathMatch = fullPath.match(/%dp0%\\(.+)/);
      if (pathMatch) {
        const relativePath = pathMatch[1];
        const absolutePath = join4(cmdDir, relativePath);
        logger.cli.debug(`Found CLI script reference: ${relativePath}`);
        logger.cli.debug(`Resolved absolute path: ${absolutePath}`);
        if (await exists(absolutePath)) {
          logger.cli.debug(`.cmd parsing successful: ${absolutePath}`);
          return absolutePath;
        } else {
          logger.cli.debug(`Resolved path does not exist: ${absolutePath}`);
        }
      } else {
        logger.cli.debug(`Could not extract relative path from: ${fullPath}`);
      }
    } else {
      logger.cli.debug(`No CLI script execution pattern found in .cmd content`);
    }
    return null;
  } catch (error) {
    logger.cli.debug(
      `Failed to parse .cmd script: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}
function getWindowsWrapperScript(traceFile, nodePath) {
  return `@echo off
echo %~1 >> "${traceFile}"
"${nodePath}" %*`;
}
function getUnixWrapperScript(traceFile, nodePath) {
  return `#!/bin/bash
echo "$1" >> "${traceFile}"
exec "${nodePath}" "$@"`;
}
async function detectClaudeCliPath(runtime2, claudePath) {
  const platform = getPlatform();
  const isWindows = platform === "windows";
  let pathWrappingResult = null;
  try {
    pathWrappingResult = await withTempDir(async (tempDir) => {
      const traceFile = `${tempDir}/trace.log`;
      const nodeExecutables = await runtime2.findExecutable("node");
      if (nodeExecutables.length === 0) {
        return null;
      }
      const originalNodePath = nodeExecutables[0];
      const wrapperFileName = isWindows ? "node.bat" : "node";
      const wrapperScript = isWindows ? getWindowsWrapperScript(traceFile, originalNodePath) : getUnixWrapperScript(traceFile, originalNodePath);
      await writeTextFile(
        `${tempDir}/${wrapperFileName}`,
        wrapperScript,
        isWindows ? void 0 : { mode: 493 }
      );
      const currentPath = getEnv("PATH") || "";
      const modifiedPath = isWindows ? `${tempDir};${currentPath}` : `${tempDir}:${currentPath}`;
      const executionResult = await runtime2.runCommand(
        claudePath,
        ["--version"],
        {
          env: { PATH: modifiedPath }
        }
      );
      if (!executionResult.success) {
        return null;
      }
      const versionOutput = executionResult.stdout.trim();
      let traceContent;
      try {
        traceContent = await readTextFile(traceFile);
      } catch {
        return { scriptPath: "", versionOutput };
      }
      if (!traceContent.trim()) {
        return { scriptPath: "", versionOutput };
      }
      const traceLines = traceContent.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
      for (const traceLine of traceLines) {
        let scriptPath = traceLine.trim();
        if (scriptPath) {
          if (isWindows) {
            scriptPath = scriptPath.replace(DOUBLE_BACKSLASH_REGEX, "\\");
          }
        }
        if (scriptPath) {
          return { scriptPath, versionOutput };
        }
      }
      return { scriptPath: "", versionOutput };
    });
  } catch (error) {
    logger.cli.debug(
      `PATH wrapping detection failed: ${error instanceof Error ? error.message : String(error)}`
    );
    pathWrappingResult = null;
  }
  if (pathWrappingResult && pathWrappingResult.scriptPath) {
    return pathWrappingResult;
  }
  if (isWindows && claudePath.endsWith(".cmd")) {
    logger.cli.debug(
      "PATH wrapping method failed, trying .cmd parsing fallback..."
    );
    try {
      const cmdParsedPath = await parseCmdScript(claudePath);
      if (cmdParsedPath) {
        let versionOutput = pathWrappingResult?.versionOutput || "";
        if (!versionOutput) {
          try {
            const versionResult = await runtime2.runCommand(claudePath, [
              "--version"
            ]);
            if (versionResult.success) {
              versionOutput = versionResult.stdout.trim();
            }
          } catch {
          }
        }
        return { scriptPath: cmdParsedPath, versionOutput };
      }
    } catch (fallbackError) {
      logger.cli.debug(
        `.cmd parsing fallback failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
      );
    }
  }
  return {
    scriptPath: "",
    versionOutput: pathWrappingResult?.versionOutput || ""
  };
}
async function validateClaudeCli(runtime2, customPath) {
  try {
    const platform = getPlatform();
    const isWindows = platform === "windows";
    let claudePath = "";
    if (customPath) {
      claudePath = customPath;
      logger.cli.info(`\u{1F50D} Validating custom Claude path: ${customPath}`);
    } else {
      logger.cli.info("\u{1F50D} Searching for Claude CLI in PATH...");
      const candidates = await runtime2.findExecutable("claude");
      if (candidates.length === 0) {
        logger.cli.error("\u274C Claude CLI not found in PATH");
        logger.cli.error("   Please install claude-code globally:");
        logger.cli.error(
          "   Visit: https://claude.ai/code for installation instructions"
        );
        exit(1);
      }
      if (isWindows && candidates.length > 1) {
        const cmdCandidate = candidates.find((path) => path.endsWith(".cmd"));
        claudePath = cmdCandidate || candidates[0];
        logger.cli.debug(
          `Found Claude CLI candidates: ${candidates.join(", ")}`
        );
        logger.cli.debug(
          `Using Claude CLI path: ${claudePath} (Windows .cmd preferred)`
        );
      } else {
        claudePath = candidates[0];
        logger.cli.debug(
          `Found Claude CLI candidates: ${candidates.join(", ")}`
        );
        logger.cli.debug(`Using Claude CLI path: ${claudePath}`);
      }
    }
    const isCmdFile = claudePath.endsWith(".cmd");
    if (isWindows && isCmdFile) {
      logger.cli.debug(
        "Detected Windows .cmd file - fallback parsing available if needed"
      );
    }
    logger.cli.info("\u{1F50D} Detecting actual Claude CLI script path...");
    const detection = await detectClaudeCliPath(runtime2, claudePath);
    if (detection.scriptPath) {
      logger.cli.info(`\u2705 Claude CLI script detected: ${detection.scriptPath}`);
      if (detection.versionOutput) {
        logger.cli.info(`\u2705 Claude CLI found: ${detection.versionOutput}`);
      }
      return detection.scriptPath;
    } else {
      logger.cli.warn("\u26A0\uFE0F  Claude CLI script path detection failed");
      logger.cli.warn(
        "   Falling back to using the claude executable directly."
      );
      logger.cli.warn("   This may not work properly, but continuing anyway.");
      logger.cli.warn("");
      logger.cli.warn(`   Using fallback path: ${claudePath}`);
      if (detection.versionOutput) {
        logger.cli.info(`\u2705 Claude CLI found: ${detection.versionOutput}`);
      }
      return claudePath;
    }
  } catch (error) {
    logger.cli.error("\u274C Failed to validate Claude CLI");
    logger.cli.error(
      `   Error: ${error instanceof Error ? error.message : String(error)}`
    );
    exit(1);
  }
}

// cli/node.ts
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { dirname as dirname2, join as join5 } from "node:path";
async function main(runtime2) {
  const args = parseCliArgs();
  await setupLogger(args.debug);
  if (args.debug) {
    logger.cli.info("\u{1F41B} Debug mode enabled");
  }
  const cliPath = await validateClaudeCli(runtime2, args.claudePath);
  const __dirname2 = import.meta.dirname ?? dirname2(fileURLToPath2(import.meta.url));
  const staticPath = join5(__dirname2, "../static");
  const app = createApp(runtime2, {
    debugMode: args.debug,
    staticPath,
    cliPath
  });
  logger.cli.info(`\u{1F680} Server starting on ${args.host}:${args.port}`);
  runtime2.serve(args.port, args.host, app.fetch);
}
var runtime = new NodeRuntime();
main(runtime).catch((error) => {
  console.error("Failed to start server:", error);
  exit(1);
});
//# sourceMappingURL=node.js.map
