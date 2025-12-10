================================================
FILE: biome.json
================================================
{
  "$schema": "https://biomejs.dev/schemas/1.0.0/schema.json",
  "files": {
    "ignore": [
      ".wrangler",
      "node_modules",
      "vendor/*"
    ]
  },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2
  },
  "javascript": {
    "formatter": {
      "trailingComma": "es5"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "a11y": {
        "useAltText": "off",
        "useMediaCaption": "off",
        "noSvgWithoutTitle": "off"
      },
      "complexity": {
        "useLiteralKeys": "off",
        "useOptionalChain": "off"
      },
      "performance": {
        "noAccumulatingSpread": "off"
      },
      "suspicious": {
        "noArrayIndexKey": "off",
        "noExplicitAny": "off"
      }
    }
  }
}



================================================
FILE: CONTRIBUTING.md
================================================
# Contributing

**This is an early alpha. The implementation might change between versions
without warning. Please use at your own risk and pin to a specific version if
you're relying on this for anything important!**

## Development

Make sure you have a recent version of Node.js installed (`>=18`). Then run:

```
npm install
npm test
```

## Releases

To cut a new release, run:

```
cd replicate-js
git checkout main
git pull
npx np minor
```

This will:

- Run tests locally
- Bump the version in `package.json`
- Commit and tag the release
- Push the commit and tag to GitHub
- Publish the package to npm
- Create a GitHub release

## Vendored Dependencies

We have a few dependencies that have been bundled into the vendor directory rather than adding external npm dependencies.

These have been generated using bundlejs.com and copied into the appropriate directory along with the license and repository information.

* [eventsource-parser/stream](https://bundlejs.com/?bundle&q=eventsource-parser%40latest%2Fstream&config=%7B%22esbuild%22%3A%7B%22format%22%3A%22cjs%22%2C%22minify%22%3Afalse%2C%22platform%22%3A%22neutral%22%7D%7D)
* [streams-text-encoding/text-decoder-stream](https://bundlejs.com/?q=%40stardazed%2Fstreams-text-encoding&treeshake=%5B%7B+TextDecoderStream+%7D%5D&config=%7B%22esbuild%22%3A%7B%22format%22%3A%22cjs%22%2C%22minify%22%3Afalse%7D%7D)

> [!NOTE]
> The vendored implementation of `TextDecoderStream` requires
> the following patch to be applied to the output of bundlejs.com:
>
> ```diff
>   constructor(label, options) {
> -   this[decDecoder] = new TextDecoder(label, options);
> -   this[decTransform] = new TransformStream(new TextDecodeTransformer(this[decDecoder]));
> +   const decoder = new TextDecoder(label || "utf-8", options || {});
> +   this[decDecoder] = decoder;
> +   this[decTransform] = new TransformStream(new TextDecodeTransformer(decoder));
>   }
> ```



================================================
FILE: index.d.ts
================================================
declare module "replicate" {
  type Status = "starting" | "processing" | "succeeded" | "failed" | "canceled" | "aborted";
  type Visibility = "public" | "private";
  type WebhookEventType = "start" | "output" | "logs" | "completed";

  export interface ApiError extends Error {
    request: Request;
    response: Response;
  }

  export interface FileOutput extends ReadableStream {
    blob(): Promise<Blob>;
    url(): URL;
    toString(): string;
  }

  export interface Account {
    type: "user" | "organization";
    username: string;
    name: string;
    github_url?: string;
  }

  export interface Collection {
    name: string;
    slug: string;
    description: string;
    full_description: string | null;
    models?: Model[];
  }

  export interface Deployment {
    owner: string;
    name: string;
    current_release: {
      number: number;
      model: string;
      version: string;
      created_at: string;
      created_by: Account;
      configuration: {
        hardware: string;
        min_instances: number;
        max_instances: number;
      };
    };
  }

  export interface FileObject {
    id: string;
    name: string;
    content_type: string;
    size: number;
    etag: string;
    checksum: string;
    metadata: Record<string, unknown>;
    created_at: string;
    expires_at: string | null;
    urls: {
      get: string;
    };
  }

  export interface Hardware {
    sku: string;
    name: string;
  }

  export interface Model {
    url: string;
    owner: string;
    name: string;
    description?: string;
    visibility: "public" | "private";
    is_official: boolean;
    github_url?: string;
    paper_url?: string;
    license_url?: string;
    run_count: number;
    cover_image_url?: string;
    default_example?: Prediction;
    latest_version?: ModelVersion;
  }

  export interface ModelVersion {
    id: string;
    created_at: string;
    cog_version: string;
    openapi_schema: object;
  }

  export interface Prediction {
    id: string;
    status: Status;
    model: string;
    version: string;
    input: object;
    output?: any; // TODO: this should be `unknown`
    source: "api" | "web";
    error?: unknown;
    logs?: string;
    metrics?: {
      predict_time?: number;
    };
    webhook?: string;
    webhook_events_filter?: WebhookEventType[];
    created_at: string;
    started_at?: string;
    completed_at?: string;
    urls: {
      get: string;
      cancel: string;
      stream?: string;
    };
  }

  export type Training = Prediction;

  export type FileEncodingStrategy = "default" | "upload" | "data-uri";

  export interface Page<T> {
    previous?: string;
    next?: string;
    results: T[];
  }

  export interface ServerSentEvent {
    event: string;
    data: string;
    id?: string;
    retry?: number;
  }

  export interface WebhookSecret {
    key: string;
  }

  export default class Replicate {
    constructor(options?: {
      auth?: string;
      userAgent?: string;
      baseUrl?: string;
      fetch?: (
        input: Request | string,
        init?: RequestInit
      ) => Promise<Response>;
      fileEncodingStrategy?: FileEncodingStrategy;
      useFileOutput?: boolean;
    });

    auth: string;
    userAgent?: string;
    baseUrl?: string;
    fetch: (input: Request | string, init?: RequestInit) => Promise<Response>;
    fileEncodingStrategy: FileEncodingStrategy;

    run(
      identifier: `${string}/${string}` | `${string}/${string}:${string}`,
      options: {
        input: object;
        wait?:
          | { mode: "block"; interval?: number; timeout?: number }
          | { mode: "poll"; interval?: number };
        webhook?: string;
        webhook_events_filter?: WebhookEventType[];
        signal?: AbortSignal;
      },
      progress?: (prediction: Prediction) => void
    ): Promise<object>;

    stream(
      identifier: `${string}/${string}` | `${string}/${string}:${string}`,
      options: {
        input: object;
        webhook?: string;
        webhook_events_filter?: WebhookEventType[];
        signal?: AbortSignal;
      }
    ): AsyncGenerator<ServerSentEvent>;

    request(
      route: string | URL,
      options: {
        method?: string;
        headers?: object | Headers;
        params?: object;
        data?: object;
        signal?: AbortSignal;
      }
    ): Promise<Response>;

    paginate<T>(
      endpoint: () => Promise<Page<T>>,
      options?: { signal?: AbortSignal }
    ): AsyncGenerator<T[]>;

    wait(
      prediction: Prediction,
      options?: {
        interval?: number;
      },
      stop?: (prediction: Prediction) => Promise<boolean>
    ): Promise<Prediction>;

    accounts: {
      current(options?: { signal?: AbortSignal }): Promise<Account>;
    };

    collections: {
      list(options?: { signal?: AbortSignal }): Promise<Page<Collection>>;
      get(
        collection_slug: string,
        options?: { signal?: AbortSignal }
      ): Promise<Collection>;
    };

    deployments: {
      predictions: {
        create(
          deployment_owner: string,
          deployment_name: string,
          options: {
            input: object;
            /** @deprecated */
            stream?: boolean;
            webhook?: string;
            webhook_events_filter?: WebhookEventType[];
            wait?: number | boolean;
            signal?: AbortSignal;
          }
        ): Promise<Prediction>;
      };
      get(
        deployment_owner: string,
        deployment_name: string,
        options?: { signal?: AbortSignal }
      ): Promise<Deployment>;
      create(
        deployment_config: {
          name: string;
          model: string;
          version: string;
          hardware: string;
          min_instances: number;
          max_instances: number;
        },
        options?: { signal?: AbortSignal }
      ): Promise<Deployment>;
      update(
        deployment_owner: string,
        deployment_name: string,
        deployment_config: {
          version?: string;
          hardware?: string;
          min_instances?: number;
          max_instances?: number;
        } & (
          | { version: string }
          | { hardware: string }
          | { min_instances: number }
          | { max_instances: number }
        ),
        options?: { signal?: AbortSignal }
      ): Promise<Deployment>;
      delete(
        deployment_owner: string,
        deployment_name: string,
        options?: { signal?: AbortSignal }
      ): Promise<boolean>;
      list(options?: { signal?: AbortSignal }): Promise<Page<Deployment>>;
    };

    files: {
      create(
        file: Blob | Buffer,
        metadata?: Record<string, unknown>,
        options?: { signal?: AbortSignal }
      ): Promise<FileObject>;
      list(options?: { signal?: AbortSignal }): Promise<Page<FileObject>>;
      get(
        file_id: string,
        options?: { signal?: AbortSignal }
      ): Promise<FileObject>;
      delete(
        file_id: string,
        options?: { signal?: AbortSignal }
      ): Promise<boolean>;
    };

    hardware: {
      list(options?: { signal?: AbortSignal }): Promise<Hardware[]>;
    };

    models: {
      get(
        model_owner: string,
        model_name: string,
        options?: { signal?: AbortSignal }
      ): Promise<Model>;
      list(options?: { signal?: AbortSignal }): Promise<Page<Model>>;
      create(
        model_owner: string,
        model_name: string,
        options: {
          visibility: Visibility;
          hardware: string;
          description?: string;
          github_url?: string;
          paper_url?: string;
          license_url?: string;
          cover_image_url?: string;
          signal?: AbortSignal;
        }
      ): Promise<Model>;
      versions: {
        list(
          model_owner: string,
          model_name: string,
          options?: { signal?: AbortSignal }
        ): Promise<Page<ModelVersion>>;
        get(
          model_owner: string,
          model_name: string,
          version_id: string,
          options?: { signal?: AbortSignal }
        ): Promise<ModelVersion>;
      };
      search(
        query: string,
        options?: { signal?: AbortSignal }
      ): Promise<Page<Model>>;
    };

    predictions: {
      create(
        options: {
          model?: string;
          version?: string;
          input: object;
          /** @deprecated */
          stream?: boolean;
          webhook?: string;
          webhook_events_filter?: WebhookEventType[];
          wait?: boolean | number;
          signal?: AbortSignal;
        } & ({ version: string } | { model: string })
      ): Promise<Prediction>;
      get(
        prediction_id: string,
        options?: { signal?: AbortSignal }
      ): Promise<Prediction>;
      cancel(
        prediction_id: string,
        options?: { signal?: AbortSignal }
      ): Promise<Prediction>;
      list(options?: { signal?: AbortSignal }): Promise<Page<Prediction>>;
    };

    trainings: {
      create(
        model_owner: string,
        model_name: string,
        version_id: string,
        options: {
          destination: `${string}/${string}`;
          input: object;
          webhook?: string;
          webhook_events_filter?: WebhookEventType[];
          signal?: AbortSignal;
        }
      ): Promise<Training>;
      get(
        training_id: string,
        options?: { signal?: AbortSignal }
      ): Promise<Training>;
      cancel(
        training_id: string,
        options?: { signal?: AbortSignal }
      ): Promise<Training>;
      list(options?: { signal?: AbortSignal }): Promise<Page<Training>>;
    };

    webhooks: {
      default: {
        secret: {
          get(options?: { signal?: AbortSignal }): Promise<WebhookSecret>;
        };
      };
    };
  }

  export function validateWebhook(
    request: Request,
    secret: string,
    crypto?: Crypto
  ): Promise<boolean>;

  export function validateWebhook(
    requestData: {
      id: string;
      timestamp: string;
      signature: string;
      body: string;
      secret: string;
    },
    crypto?: Crypto
  ): Promise<boolean>;

  export function parseProgressFromLogs(logs: Prediction | string): {
    percentage: number;
    current: number;
    total: number;
  } | null;
}



================================================
FILE: index.js
================================================
const ApiError = require("./lib/error");
const ModelVersionIdentifier = require("./lib/identifier");
const { createReadableStream, createFileOutput } = require("./lib/stream");
const {
  transform,
  withAutomaticRetries,
  validateWebhook,
  parseProgressFromLogs,
  streamAsyncIterator,
} = require("./lib/util");

const accounts = require("./lib/accounts");
const collections = require("./lib/collections");
const deployments = require("./lib/deployments");
const files = require("./lib/files");
const hardware = require("./lib/hardware");
const models = require("./lib/models");
const predictions = require("./lib/predictions");
const trainings = require("./lib/trainings");
const webhooks = require("./lib/webhooks");

const packageJSON = require("./package.json");

/**
 * Replicate API client library
 *
 * @see https://replicate.com/docs/reference/http
 * @example
 * // Create a new Replicate API client instance
 * const Replicate = require("replicate");
 * const replicate = new Replicate({
 *     // get your token from https://replicate.com/account
 *     auth: process.env.REPLICATE_API_TOKEN,
 *     userAgent: "my-app/1.2.3"
 * });
 *
 * // Run a model and await the result:
 * const model = 'owner/model:version-id'
 * const input = {text: 'Hello, world!'}
 * const output = await replicate.run(model, { input });
 */
class Replicate {
  /**
   * Create a new Replicate API client instance.
   *
   * @param {object} options - Configuration options for the client
   * @param {string} options.auth - API access token. Defaults to the `REPLICATE_API_TOKEN` environment variable.
   * @param {string} options.userAgent - Identifier of your app
   * @param {string} [options.baseUrl] - Defaults to https://api.replicate.com/v1
   * @param {Function} [options.fetch] - Fetch function to use. Defaults to `globalThis.fetch`
   * @param {boolean} [options.useFileOutput] - Set to `false` to disable `FileOutput` objects from `run` instead of URLs, defaults to true.
   * @param {"default" | "upload" | "data-uri"} [options.fileEncodingStrategy] - Determines the file encoding strategy to use
   */
  constructor(options = {}) {
    this.auth =
      options.auth ||
      (typeof process !== "undefined" ? process.env.REPLICATE_API_TOKEN : null);
    this.userAgent =
      options.userAgent || `replicate-javascript/${packageJSON.version}`;
    this.baseUrl = options.baseUrl || "https://api.replicate.com/v1";
    this.fetch = options.fetch || globalThis.fetch;
    this.fileEncodingStrategy = options.fileEncodingStrategy || "default";
    this.useFileOutput = options.useFileOutput === false ? false : true;

    this.accounts = {
      current: accounts.current.bind(this),
    };

    this.collections = {
      list: collections.list.bind(this),
      get: collections.get.bind(this),
    };

    this.deployments = {
      get: deployments.get.bind(this),
      create: deployments.create.bind(this),
      update: deployments.update.bind(this),
      delete: deployments.delete.bind(this),
      list: deployments.list.bind(this),
      predictions: {
        create: deployments.predictions.create.bind(this),
      },
    };

    this.files = {
      create: files.create.bind(this),
      get: files.get.bind(this),
      list: files.list.bind(this),
      delete: files.delete.bind(this),
    };

    this.hardware = {
      list: hardware.list.bind(this),
    };

    this.models = {
      get: models.get.bind(this),
      list: models.list.bind(this),
      create: models.create.bind(this),
      versions: {
        list: models.versions.list.bind(this),
        get: models.versions.get.bind(this),
      },
      search: models.search.bind(this),
    };

    this.predictions = {
      create: predictions.create.bind(this),
      get: predictions.get.bind(this),
      cancel: predictions.cancel.bind(this),
      list: predictions.list.bind(this),
    };

    this.trainings = {
      create: trainings.create.bind(this),
      get: trainings.get.bind(this),
      cancel: trainings.cancel.bind(this),
      list: trainings.list.bind(this),
    };

    this.webhooks = {
      default: {
        secret: {
          get: webhooks.default.secret.get.bind(this),
        },
      },
    };
  }

  /**
   * Run a model and wait for its output.
   *
   * @param {string} ref - Required. The model version identifier in the format "owner/name" or "owner/name:version"
   * @param {object} options
   * @param {object} options.input - Required. An object with the model inputs
   * @param {{mode: "block", timeout?: number, interval?: number} | {mode: "poll", interval?: number }} [options.wait] - Options for waiting for the prediction to finish. If `wait` is explicitly true, the function will block and wait for the prediction to finish.
   * @param {string} [options.webhook] - An HTTPS URL for receiving a webhook when the prediction has new output
   * @param {string[]} [options.webhook_events_filter] - You can change which events trigger webhook requests by specifying webhook events (`start`|`output`|`logs`|`completed`)
   * @param {AbortSignal} [options.signal] - AbortSignal to cancel the prediction
   * @param {Function} [progress] - Callback function that receives the prediction object as it's updated. The function is called when the prediction is created, each time its updated while polling for completion, and when it's completed.
   * @throws {Error} If the reference is invalid
   * @throws {Error} If the prediction failed
   * @returns {Promise<object>} - Resolves with the output of running the model
   */
  async run(ref, options, progress) {
    const { wait = { mode: "block" }, signal, ...data } = options;

    const identifier = ModelVersionIdentifier.parse(ref);

    let prediction;
    if (identifier.version) {
      prediction = await this.predictions.create({
        ...data,
        version: identifier.version,
        wait: wait.mode === "block" ? wait.timeout ?? true : false,
      });
    } else if (identifier.owner && identifier.name) {
      prediction = await this.predictions.create({
        ...data,
        model: `${identifier.owner}/${identifier.name}`,
        wait: wait.mode === "block" ? wait.timeout ?? true : false,
      });
    } else {
      throw new Error("Invalid model version identifier");
    }

    // Call progress callback with the initial prediction object
    if (progress) {
      progress(prediction);
    }

    const isDone = wait.mode === "block" && prediction.status !== "starting";
    if (!isDone) {
      prediction = await this.wait(
        prediction,
        { interval: wait.mode === "poll" ? wait.interval : undefined },
        async (updatedPrediction) => {
          // Call progress callback with the updated prediction object
          if (progress) {
            progress(updatedPrediction);
          }

          // We handle the cancel later in the function.
          if (signal && signal.aborted) {
            return true; // stop polling
          }

          return false; // continue polling
        }
      );
    }

    if (signal && signal.aborted) {
      prediction = await this.predictions.cancel(prediction.id);
    }

    // Call progress callback with the completed prediction object
    if (progress) {
      progress(prediction);
    }

    if (prediction.status === "failed") {
      throw new Error(`Prediction failed: ${prediction.error}`);
    }

    return transform(prediction.output, (value) => {
      if (
        typeof value === "string" &&
        (value.startsWith("https:") || value.startsWith("data:"))
      ) {
        return this.useFileOutput
          ? createFileOutput({ url: value, fetch: this.fetch })
          : value;
      }
      return value;
    });
  }

  /**
   * Make a request to the Replicate API.
   *
   * @param {string} route - REST API endpoint path
   * @param {object} options - Request parameters
   * @param {string} [options.method] - HTTP method. Defaults to GET
   * @param {object} [options.params] - Query parameters
   * @param {object|Headers} [options.headers] - HTTP headers
   * @param {object} [options.data] - Body parameters
   * @param {AbortSignal} [options.signal] - AbortSignal to cancel the request
   * @returns {Promise<Response>} - Resolves with the response object
   * @throws {ApiError} If the request failed
   */
  async request(route, options) {
    const { auth, baseUrl, userAgent } = this;

    let url;
    if (route instanceof URL) {
      url = route;
    } else {
      url = new URL(
        route.startsWith("/") ? route.slice(1) : route,
        baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
      );
    }

    const { method = "GET", params = {}, data, signal } = options;

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }

    const headers = {
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    };
    if (auth) {
      headers["Authorization"] = `Bearer ${auth}`;
    }
    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers[key] = value;
      }
    }

    let body = undefined;
    if (data instanceof FormData) {
      body = data;
      // biome-ignore lint/performance/noDelete:
      delete headers["Content-Type"]; // Use automatic content type header
    } else if (data) {
      body = JSON.stringify(data);
    }

    const init = {
      method,
      headers,
      body,
      signal,
    };

    const shouldRetry =
      method === "GET"
        ? (response) => response.status === 429 || response.status >= 500
        : (response) => response.status === 429;

    // Workaround to fix `TypeError: Illegal invocation` error in Cloudflare Workers
    // https://github.com/replicate/replicate-javascript/issues/134
    const _fetch = this.fetch; // eslint-disable-line no-underscore-dangle
    const response = await withAutomaticRetries(async () => _fetch(url, init), {
      shouldRetry,
    });

    if (!response.ok) {
      const request = new Request(url, init);
      const responseText = await response.text();
      throw new ApiError(
        `Request to ${url} failed with status ${response.status} ${response.statusText}: ${responseText}.`,
        request,
        response
      );
    }

    return response;
  }

  /**
   * Stream a model and wait for its output.
   *
   * @param {string} identifier - Required. The model version identifier in the format "{owner}/{name}:{version}"
   * @param {object} options
   * @param {object} options.input - Required. An object with the model inputs
   * @param {string} [options.webhook] - An HTTPS URL for receiving a webhook when the prediction has new output
   * @param {string[]} [options.webhook_events_filter] - You can change which events trigger webhook requests by specifying webhook events (`start`|`output`|`logs`|`completed`)
   * @param {AbortSignal} [options.signal] - AbortSignal to cancel the prediction
   * @throws {Error} If the prediction failed
   * @yields {ServerSentEvent} Each streamed event from the prediction
   */
  async *stream(ref, options) {
    const { wait, signal, ...data } = options;

    const identifier = ModelVersionIdentifier.parse(ref);

    let prediction;
    if (identifier.version) {
      prediction = await this.predictions.create({
        ...data,
        version: identifier.version,
      });
    } else if (identifier.owner && identifier.name) {
      prediction = await this.predictions.create({
        ...data,
        model: `${identifier.owner}/${identifier.name}`,
      });
    } else {
      throw new Error("Invalid model version identifier");
    }

    if (prediction.urls && prediction.urls.stream) {
      const stream = createReadableStream({
        url: prediction.urls.stream,
        fetch: this.fetch,
        ...(signal ? { options: { signal } } : {}),
      });

      yield* streamAsyncIterator(stream);
    } else {
      throw new Error("Prediction does not support streaming");
    }
  }

  /**
   * Paginate through a list of results.
   *
   * @generator
   * @example
   * for await (const page of replicate.paginate(replicate.predictions.list) {
   *    console.log(page);
   * }
   * @param {Function} endpoint - Function that returns a promise for the next page of results
   * @param {object} [options]
   * @param {AbortSignal} [options.signal] - AbortSignal to cancel the request.
   * @yields {object[]} Each page of results
   */
  async *paginate(endpoint, options = {}) {
    const response = await endpoint();
    yield response.results;
    if (response.next && !(options.signal && options.signal.aborted)) {
      const nextPage = () =>
        this.request(response.next, {
          method: "GET",
          signal: options.signal,
        }).then((r) => r.json());
      yield* this.paginate(nextPage, options);
    }
  }

  /**
   * Wait for a prediction to finish.
   *
   * If the prediction has already finished,
   * this function returns immediately.
   * Otherwise, it polls the API until the prediction finishes.
   *
   * @async
   * @param {object} prediction - Prediction object
   * @param {object} options - Options
   * @param {number} [options.interval] - Polling interval in milliseconds. Defaults to 500
   * @param {Function} [stop] - Async callback function that is called after each polling attempt. Receives the prediction object as an argument. Return false to cancel polling.
   * @throws {Error} If the prediction doesn't complete within the maximum number of attempts
   * @throws {Error} If the prediction failed
   * @returns {Promise<object>} Resolves with the completed prediction object
   */
  async wait(prediction, options, stop) {
    const { id } = prediction;
    if (!id) {
      throw new Error("Invalid prediction");
    }

    if (
      prediction.status === "succeeded" ||
      prediction.status === "failed" ||
      prediction.status === "canceled"
    ) {
      return prediction;
    }

    // eslint-disable-next-line no-promise-executor-return
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const interval = (options && options.interval) || 500;

    let updatedPrediction = await this.predictions.get(id);

    while (
      updatedPrediction.status !== "succeeded" &&
      updatedPrediction.status !== "failed" &&
      updatedPrediction.status !== "canceled"
    ) {
      /* eslint-disable no-await-in-loop */
      if (stop && (await stop(updatedPrediction)) === true) {
        break;
      }

      await sleep(interval);
      updatedPrediction = await this.predictions.get(prediction.id);
      /* eslint-enable no-await-in-loop */
    }

    if (updatedPrediction.status === "failed") {
      throw new Error(`Prediction failed: ${updatedPrediction.error}`);
    }

    return updatedPrediction;
  }
}

module.exports = Replicate;
module.exports.validateWebhook = validateWebhook;
module.exports.parseProgressFromLogs = parseProgressFromLogs;



================================================
FILE: jest.config.js
================================================
// eslint-disable-next-line jsdoc/valid-types
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["integration"],
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
};



================================================
FILE: jsconfig.json
================================================
{
  "compilerOptions": {
    "checkJs": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "target": "ES2020",
    "resolveJsonModule": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  },
  "exclude": [
    "node_modules",
    "**/node_modules/*"
  ]
}



================================================
FILE: LICENSE
================================================
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1.  Definitions.

    "License" shall mean the terms and conditions for use, reproduction,
    and distribution as defined by Sections 1 through 9 of this document.

    "Licensor" shall mean the copyright owner or entity authorized by
    the copyright owner that is granting the License.

    "Legal Entity" shall mean the union of the acting entity and all
    other entities that control, are controlled by, or are under common
    control with that entity. For the purposes of this definition,
    "control" means (i) the power, direct or indirect, to cause the
    direction or management of such entity, whether by contract or
    otherwise, or (ii) ownership of fifty percent (50%) or more of the
    outstanding shares, or (iii) beneficial ownership of such entity.

    "You" (or "Your") shall mean an individual or Legal Entity
    exercising permissions granted by this License.

    "Source" form shall mean the preferred form for making modifications,
    including but not limited to software source code, documentation
    source, and configuration files.

    "Object" form shall mean any form resulting from mechanical
    transformation or translation of a Source form, including but
    not limited to compiled object code, generated documentation,
    and conversions to other media types.

    "Work" shall mean the work of authorship, whether in Source or
    Object form, made available under the License, as indicated by a
    copyright notice that is included in or attached to the work
    (an example is provided in the Appendix below).

    "Derivative Works" shall mean any work, whether in Source or Object
    form, that is based on (or derived from) the Work and for which the
    editorial revisions, annotations, elaborations, or other modifications
    represent, as a whole, an original work of authorship. For the purposes
    of this License, Derivative Works shall not include works that remain
    separable from, or merely link (or bind by name) to the interfaces of,
    the Work and Derivative Works thereof.

    "Contribution" shall mean any work of authorship, including
    the original version of the Work and any modifications or additions
    to that Work or Derivative Works thereof, that is intentionally
    submitted to Licensor for inclusion in the Work by the copyright owner
    or by an individual or Legal Entity authorized to submit on behalf of
    the copyright owner. For the purposes of this definition, "submitted"
    means any form of electronic, verbal, or written communication sent
    to the Licensor or its representatives, including but not limited to
    communication on electronic mailing lists, source code control systems,
    and issue tracking systems that are managed by, or on behalf of, the
    Licensor for the purpose of discussing and improving the Work, but
    excluding communication that is conspicuously marked or otherwise
    designated in writing by the copyright owner as "Not a Contribution."

    "Contributor" shall mean Licensor and any individual or Legal Entity
    on behalf of whom a Contribution has been received by Licensor and
    subsequently incorporated within the Work.

2.  Grant of Copyright License. Subject to the terms and conditions of
    this License, each Contributor hereby grants to You a perpetual,
    worldwide, non-exclusive, no-charge, royalty-free, irrevocable
    copyright license to reproduce, prepare Derivative Works of,
    publicly display, publicly perform, sublicense, and distribute the
    Work and such Derivative Works in Source or Object form.

3.  Grant of Patent License. Subject to the terms and conditions of
    this License, each Contributor hereby grants to You a perpetual,
    worldwide, non-exclusive, no-charge, royalty-free, irrevocable
    (except as stated in this section) patent license to make, have made,
    use, offer to sell, sell, import, and otherwise transfer the Work,
    where such license applies only to those patent claims licensable
    by such Contributor that are necessarily infringed by their
    Contribution(s) alone or by combination of their Contribution(s)
    with the Work to which such Contribution(s) was submitted. If You
    institute patent litigation against any entity (including a
    cross-claim or counterclaim in a lawsuit) alleging that the Work
    or a Contribution incorporated within the Work constitutes direct
    or contributory patent infringement, then any patent licenses
    granted to You under this License for that Work shall terminate
    as of the date such litigation is filed.

4.  Redistribution. You may reproduce and distribute copies of the
    Work or Derivative Works thereof in any medium, with or without
    modifications, and in Source or Object form, provided that You
    meet the following conditions:

    (a) You must give any other recipients of the Work or
    Derivative Works a copy of this License; and

    (b) You must cause any modified files to carry prominent notices
    stating that You changed the files; and

    (c) You must retain, in the Source form of any Derivative Works
    that You distribute, all copyright, patent, trademark, and
    attribution notices from the Source form of the Work,
    excluding those notices that do not pertain to any part of
    the Derivative Works; and

    (d) If the Work includes a "NOTICE" text file as part of its
    distribution, then any Derivative Works that You distribute must
    include a readable copy of the attribution notices contained
    within such NOTICE file, excluding those notices that do not
    pertain to any part of the Derivative Works, in at least one
    of the following places: within a NOTICE text file distributed
    as part of the Derivative Works; within the Source form or
    documentation, if provided along with the Derivative Works; or,
    within a display generated by the Derivative Works, if and
    wherever such third-party notices normally appear. The contents
    of the NOTICE file are for informational purposes only and
    do not modify the License. You may add Your own attribution
    notices within Derivative Works that You distribute, alongside
    or as an addendum to the NOTICE text from the Work, provided
    that such additional attribution notices cannot be construed
    as modifying the License.

    You may add Your own copyright statement to Your modifications and
    may provide additional or different license terms and conditions
    for use, reproduction, or distribution of Your modifications, or
    for any such Derivative Works as a whole, provided Your use,
    reproduction, and distribution of the Work otherwise complies with
    the conditions stated in this License.

5.  Submission of Contributions. Unless You explicitly state otherwise,
    any Contribution intentionally submitted for inclusion in the Work
    by You to the Licensor shall be under the terms and conditions of
    this License, without any additional terms or conditions.
    Notwithstanding the above, nothing herein shall supersede or modify
    the terms of any separate license agreement you may have executed
    with Licensor regarding such Contributions.

6.  Trademarks. This License does not grant permission to use the trade
    names, trademarks, service marks, or product names of the Licensor,
    except as required for reasonable and customary use in describing the
    origin of the Work and reproducing the content of the NOTICE file.

7.  Disclaimer of Warranty. Unless required by applicable law or
    agreed to in writing, Licensor provides the Work (and each
    Contributor provides its Contributions) on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
    implied, including, without limitation, any warranties or conditions
    of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
    PARTICULAR PURPOSE. You are solely responsible for determining the
    appropriateness of using or redistributing the Work and assume any
    risks associated with Your exercise of permissions under this License.

8.  Limitation of Liability. In no event and under no legal theory,
    whether in tort (including negligence), contract, or otherwise,
    unless required by applicable law (such as deliberate and grossly
    negligent acts) or agreed to in writing, shall any Contributor be
    liable to You for damages, including any direct, indirect, special,
    incidental, or consequential damages of any character arising as a
    result of this License or out of the use or inability to use the
    Work (including but not limited to damages for loss of goodwill,
    work stoppage, computer failure or malfunction, or any and all
    other commercial damages or losses), even if such Contributor
    has been advised of the possibility of such damages.

9.  Accepting Warranty or Additional Liability. While redistributing
    the Work or Derivative Works thereof, You may choose to offer,
    and charge a fee for, acceptance of support, warranty, indemnity,
    or other liability obligations and/or rights consistent with this
    License. However, in accepting such obligations, You may act only
    on Your own behalf and on Your sole responsibility, not on behalf
    of any other Contributor, and only if You agree to indemnify,
    defend, and hold each Contributor harmless for any liability
    incurred by, or claims asserted against, such Contributor by reason
    of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS

APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

Copyright 2023 Replicate, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.



================================================
FILE: package.json
================================================
{
  "name": "replicate",
  "version": "1.3.0",
  "description": "JavaScript client for Replicate",
  "repository": "github:replicate/replicate-javascript",
  "homepage": "https://github.com/replicate/replicate-javascript#readme",
  "bugs": "https://github.com/replicate/replicate-javascript/issues",
  "license": "Apache-2.0",
  "main": "index.js",
  "type": "commonjs",
  "types": "index.d.ts",
  "files": [
    "CONTRIBUTING.md",
    "LICENSE",
    "README.md",
    "index.d.ts",
    "index.js",
    "lib/**/*.js",
    "vendor/**/*",
    "package.json"
  ],
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=7.19.0",
    "git": ">=2.11.0",
    "yarn": ">=1.7.0"
  },
  "scripts": {
    "check": "tsc",
    "format": "biome format . --write",
    "lint-biome": "biome lint .",
    "lint-publint": "publint",
    "lint": "npm run lint-biome && npm run lint-publint",
    "test": "jest"
  },
  "optionalDependencies": {
    "readable-stream": ">=4.0.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.4.1",
    "@types/jest": "^29.5.3",
    "@typescript-eslint/eslint-plugin": "^5.56.0",
    "cross-fetch": "^3.1.5",
    "jest": "^29.7.0",
    "nock": "^14.0.0-beta.6",
    "publint": "^0.2.7",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.2"
  }
}



================================================
FILE: tsconfig.json
================================================
{
  "compilerOptions": {
    "esModuleInterop": true,
    "noEmit": true,
    "strict": true,
    "allowJs": true
  },
  "exclude": ["**/node_modules", "integration"]
}



================================================
FILE: .editorconfig
================================================
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
insert_final_newline = true
end_of_line = lf
# editorconfig-tools is unable to ignore longs strings or urls
max_line_length = off

[*.{js,ts}]
quote_type = single

[CHANGELOG.md]
indent_size = false



================================================
FILE: .git-blame-ignore-revs
================================================
# Apply automatic formatting
66d81afa121fb205cfbe46cfe7e2845183b1b237



================================================
FILE: integration/browser/README.md
================================================
# Browser integration tests

Uses [`playwright`](https://playwright.dev/docs) to run a basic integration test against the three most common browser engines, Firefox, Chromium and WebKit.

It uses the `replicate/canary` model for the moment, which requires a Replicate API token available in the environment under `REPLICATE_API_TOKEN`.

The entire suite is a single `main()` function that calls a single model exercising the streaming API.

The test uses `esbuild` within the test generate a browser friendly version of the `index.js` file which is loaded into the given browser and calls the `main()` function asserting the response content.

## CORS

The Replicate API doesn't support Cross Origin Resource Sharing at this time. We work around this in Playwright by intercepting the request in a `page.route` handler. We don't modify the request/response, but this seems to work around the restriction.

## Setup

    npm install

## Local

The following command will run the tests across all browsers.

    npm test

To run against the default browser (chromium) run:

    npm exec playwright test

Or, specify a browser with:

    npm exec playwright test --browser firefox

## Debugging

Running `playwright test` with the `--debug` flag opens a browser window with a debugging interface, and a breakpoint set at the start of the test. It can also be connected directly to VSCode.

    npm exec playwright test --debug

The browser.js file is injected into the page via a script tag, to be able to set breakpoints in this file you'll need to use a `debugger` statement and open the devtools in the spawned browser window before continuing the test suite.



================================================
FILE: integration/browser/index.js
================================================
import Replicate from "replicate";

/**
 * @param {string} - token the REPLICATE_API_TOKEN
 */
window.main = async (token) => {
  const replicate = new Replicate({ auth: token });
  const stream = replicate.stream(
    "replicate/canary:30e22229542eb3f79d4f945dacb58d32001b02cc313ae6f54eef27904edf3272",
    {
      input: {
        text: "Betty Browser",
      },
    }
  );

  const output = [];
  for await (const event of stream) {
    output.push(String(event));
  }
  return output.join("");
};



================================================
FILE: integration/browser/index.test.js
================================================
import { test, expect } from "@playwright/test";
import { build } from "esbuild";

// Convert the source file from commonjs to a browser script.
const result = await build({
  entryPoints: ["index.js"],
  bundle: true,
  platform: "browser",
  external: ["node:crypto"],
  write: false,
});
const source = new TextDecoder().decode(result.outputFiles[0].contents);

// https://playwright.dev/docs/network#modify-requests

test("browser", async ({ page }) => {
  // Patch the API endpoint to work around CORS for now.
  await page.route(
    "https://api.replicate.com/v1/predictions",
    async (route) => {
      // Fetch original response.
      const response = await route.fetch();
      // Add a prefix to the title.
      return route.fulfill({ response });
    }
  );

  await page.addScriptTag({ content: source });
  const result = await page.evaluate(
    (token) => window.main(token),
    [process.env.REPLICATE_API_TOKEN]
  );
  expect(result).toBe("hello there, Betty Browser");
});



================================================
FILE: integration/browser/package.json
================================================
{
  "name": "replicate-app-browser",
  "private": true,
  "version": "0.0.0",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "playwright test --browser all"
  },
  "license": "ISC",
  "dependencies": {
    "replicate": "../../"
  },
  "devDependencies": {
    "@playwright/test": "^1.42.1",
    "esbuild": "^0.20.1"
  }
}



================================================
FILE: integration/browser/playwright.config.ts
================================================
import { defineConfig } from "@playwright/test";

export default defineConfig({});



================================================
FILE: integration/browser/.npmrc
================================================
package-lock=false
audit=false
fund=false



================================================
FILE: integration/bun/index.test.ts
================================================
import { expect, test } from "bun:test";
import main from "./index.js";

// Verify exported types.
import type {
  Status,
  Visibility,
  WebhookEventType,
  ApiError,
  Collection,
  Hardware,
  Model,
  ModelVersion,
  Prediction,
  Training,
  Page,
  ServerSentEvent,
} from "replicate";

test("main", async () => {
  const output = await main();
  expect(output).toEqual("hello there, Brünnhilde Bun");
});



================================================
FILE: integration/bun/index.ts
================================================
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function main() {
  const model =
    "replicate/canary:30e22229542eb3f79d4f945dacb58d32001b02cc313ae6f54eef27904edf3272";
  const options = {
    input: {
      text: "Brünnhilde Bun",
    },
  };
  const output = [];

  for await (const { event, data } of replicate.stream(model, options)) {
    console.log({ event, data });
    if (event === "output") {
      output.push(data);
    }
  }

  return output.join("").trim();
}



================================================
FILE: integration/bun/package.json
================================================
{
  "name": "replicate-app-bun",
  "version": "0.0.0",
  "private": true,
  "description": "Bun integration tests",
  "main": "index.js",
  "type": "module",
  "dependencies": {
    "replicate": "file:../../"
  },
  "devDependencies": {
    "@types/bun": "latest"
  }
}



================================================
FILE: integration/bun/tsconfig.json
================================================
{
  "compilerOptions": {
    "target": "es2018",
    "module": "nodenext",
    "inlineSourceMap": true,
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "skipDefaultLibCheck": true,
    "skipLibCheck": true
  }
}



================================================
FILE: integration/cloudflare-worker/index.js
================================================
import Replicate from "replicate";

export default {
  async fetch(_request, env, _ctx) {
    const replicate = new Replicate({ auth: env.REPLICATE_API_TOKEN });

    try {
      const controller = new AbortController();
      const output = replicate.stream(
        "replicate/canary:30e22229542eb3f79d4f945dacb58d32001b02cc313ae6f54eef27904edf3272",
        {
          input: {
            text: "Colin CloudFlare",
          },
          signal: controller.signal,
        }
      );
      const stream = new ReadableStream({
        async start(controller) {
          for await (const event of output) {
            controller.enqueue(new TextEncoder().encode(`${event}`));
          }
          controller.enqueue(new TextEncoder().encode("\n"));
          controller.close();
        },
      });

      return new Response(stream);
    } catch (err) {
      return Response("", { status: 500 });
    }
  },
};



================================================
FILE: integration/cloudflare-worker/index.test.js
================================================
// https://developers.cloudflare.com/workers/wrangler/api/#unstable_dev
import { unstable_dev as dev } from "wrangler";
import { test, after, before, describe } from "node:test";
import assert from "node:assert";

describe("CloudFlare Worker", () => {
  /** @type {import("wrangler").UnstableDevWorker} */
  let worker;

  before(async () => {
    worker = await dev("./index.js", {
      port: 3000,
      experimental: { disableExperimentalWarning: true },
    });
  });

  after(async () => {
    if (!worker) {
      // If no worker the before hook failed to run and the process will hang.
      process.exit(1);
    }
    await worker.stop();
  });

  test("worker streams back a response", { timeout: 5000 }, async () => {
    const resp = await worker.fetch();
    const text = await resp.text();

    assert.ok(resp.ok, `expected status to be 2xx but got ${resp.status}`);
    assert(
      text.length > 0,
      "expected body to have content but got body.length of 0"
    );
    assert(
      text.includes("Colin CloudFlare"),
      `expected body to include "Colin CloudFlare" but got ${JSON.stringify(
        text
      )}`
    );
  });
});



================================================
FILE: integration/cloudflare-worker/package.json
================================================
{
  "name": "replicate-app-cloudflare",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "deploy": "wrangler deploy",
    "dev": "wrangler dev",
    "start": "wrangler dev",
    "test": "node --test index.test.js"
  },
  "dependencies": {
    "replicate": "file:../../"
  },
  "devDependencies": {
    "wrangler": "^3.32.0"
  }
}



================================================
FILE: integration/cloudflare-worker/wrangler.toml
================================================
name = "cloudflare-worker"
main = "index.js"
compatibility_date = "2024-03-04"
compatibility_flags = [ "nodejs_compat" ]



================================================
FILE: integration/cloudflare-worker/.npmrc
================================================
package-lock=false
audit=false
fund=false



================================================
FILE: integration/commonjs/index.js
================================================
const Replicate = require("replicate");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

module.exports = async function main() {
  const output = await replicate.run(
    "replicate/canary:30e22229542eb3f79d4f945dacb58d32001b02cc313ae6f54eef27904edf3272",
    {
      input: {
        text: "Claire CommonJS",
      },
    }
  );
  return output.join("").trim();
};



================================================
FILE: integration/commonjs/index.test.js
================================================
const { test } = require("node:test");
const assert = require("node:assert");
const main = require("./index");

test("main", async () => {
  const output = await main();
  assert.equal(output, "hello there, Claire CommonJS");
});



================================================
FILE: integration/commonjs/package.json
================================================
{
  "name": "replicate-app-commonjs",
  "version": "0.0.0",
  "private": true,
  "description": "CommonJS integration tests",
  "main": "index.js",
  "scripts": {
    "test": "node --test ./index.test.js"
  },
  "dependencies": {
    "replicate": "file:../../"
  }
}


================================================
FILE: integration/commonjs/.npmrc
================================================
package-lock=false
audit=false
fund=false



================================================
FILE: integration/deno/deno.json
================================================
{
  "imports": {
    "replicate": "npm:replicate"
  }
}



================================================
FILE: integration/deno/deno.lock
================================================
{
  "version": "3",
  "packages": {
    "specifiers": {
      "jsr:@std/assert": "jsr:@std/assert@0.226.0",
      "jsr:@std/internal@^1.0.0": "jsr:@std/internal@1.0.1",
      "npm:replicate": "npm:replicate@0.31.0"
    },
    "jsr": {
      "@std/assert@0.226.0": {
        "integrity": "0dfb5f7c7723c18cec118e080fec76ce15b4c31154b15ad2bd74822603ef75b3",
        "dependencies": [
          "jsr:@std/internal@^1.0.0"
        ]
      },
      "@std/internal@1.0.1": {
        "integrity": "6f8c7544d06a11dd256c8d6ba54b11ed870aac6c5aeafff499892662c57673e6"
      }
    },
    "npm": {
      "abort-controller@3.0.0": {
        "integrity": "sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==",
        "dependencies": {
          "event-target-shim": "event-target-shim@5.0.1"
        }
      },
      "base64-js@1.5.1": {
        "integrity": "sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==",
        "dependencies": {}
      },
      "buffer@6.0.3": {
        "integrity": "sha512-FTiCpNxtwiZZHEZbcbTIcZjERVICn9yq/pDFkTl95/AxzD1naBctN7YO68riM/gLSDY7sdrMby8hofADYuuqOA==",
        "dependencies": {
          "base64-js": "base64-js@1.5.1",
          "ieee754": "ieee754@1.2.1"
        }
      },
      "event-target-shim@5.0.1": {
        "integrity": "sha512-i/2XbnSz/uxRCU6+NdVJgKWDTM427+MqYbkQzD321DuCQJUqOuJKIA0IM2+W2xtYHdKOmZ4dR6fExsd4SXL+WQ==",
        "dependencies": {}
      },
      "events@3.3.0": {
        "integrity": "sha512-mQw+2fkQbALzQ7V0MY0IqdnXNOeTtP4r0lN9z7AAawCXgqea7bDii20AYrIBrFd/Hx0M2Ocz6S111CaFkUcb0Q==",
        "dependencies": {}
      },
      "ieee754@1.2.1": {
        "integrity": "sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==",
        "dependencies": {}
      },
      "process@0.11.10": {
        "integrity": "sha512-cdGef/drWFoydD1JsMzuFf8100nZl+GT+yacc2bEced5f9Rjk4z+WtFUTBu9PhOi9j/jfmBPu0mMEY4wIdAF8A==",
        "dependencies": {}
      },
      "readable-stream@4.5.2": {
        "integrity": "sha512-yjavECdqeZ3GLXNgRXgeQEdz9fvDDkNKyHnbHRFtOr7/LcfgBcmct7t/ET+HaCTqfh06OzoAxrkN/IfjJBVe+g==",
        "dependencies": {
          "abort-controller": "abort-controller@3.0.0",
          "buffer": "buffer@6.0.3",
          "events": "events@3.3.0",
          "process": "process@0.11.10",
          "string_decoder": "string_decoder@1.3.0"
        }
      },
      "replicate@0.31.0": {
        "integrity": "sha512-BQl52LqndfY2sLQ384jyspaJI5ia301+IN1zOBbKZa2dB5EnayUxS0ynFueOdwo/4qRfQTR0GKJwpKFK/mb3zw==",
        "dependencies": {
          "readable-stream": "readable-stream@4.5.2"
        }
      },
      "safe-buffer@5.2.1": {
        "integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",
        "dependencies": {}
      },
      "string_decoder@1.3.0": {
        "integrity": "sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==",
        "dependencies": {
          "safe-buffer": "safe-buffer@5.2.1"
        }
      }
    }
  },
  "remote": {},
  "workspace": {
    "dependencies": [
      "npm:replicate"
    ]
  }
}



================================================
FILE: integration/deno/index.test.ts
================================================
import { assertEquals } from "jsr:@std/assert";
import main from "./index.ts";

// Verify exported types.
import type {
  Status,
  Visibility,
  WebhookEventType,
  ApiError,
  Collection,
  Hardware,
  Model,
  ModelVersion,
  Prediction,
  Training,
  Page,
  ServerSentEvent,
} from "replicate";

Deno.test({
  name: "main",
  async fn() {
    const output = await main();
    assertEquals({ output }, { output: "hello there, Deno the dinosaur" });
  },
});



================================================
FILE: integration/deno/index.ts
================================================
import Replicate from "replicate";

const replicate = new Replicate({
  auth: Deno.env.get("REPLICATE_API_TOKEN"),
});

export default async function main() {
  const output = (await replicate.run(
    "replicate/canary:30e22229542eb3f79d4f945dacb58d32001b02cc313ae6f54eef27904edf3272",
    {
      input: {
        text: "Deno the dinosaur",
      },
    }
  )) as string[];
  return output.join("").trim();
}



================================================
FILE: integration/deno/package.json
================================================
{}



================================================
FILE: integration/esm/index.js
================================================
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function main() {
  const output = await replicate.run(
    "replicate/canary:30e22229542eb3f79d4f945dacb58d32001b02cc313ae6f54eef27904edf3272",
    {
      input: {
        text: "Evelyn ESM",
      },
    }
  );
  return Array.isArray(output) ? output.join("").trim() : String(output).trim();
}



================================================
FILE: integration/esm/index.test.js
================================================
import { test } from "node:test";
import assert from "node:assert";
import main from "./index.js";

test("main", async () => {
  const output = await main();
  assert.equal(output, "hello there, Evelyn ESM");
});



================================================
FILE: integration/esm/package.json
================================================
{
  "name": "replicate-app-esm",
  "version": "0.0.0",
  "private": true,
  "description": "ESM (ECMAScript Modules) integration tests",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "node --test ./index.test.js"
  },
  "dependencies": {
    "replicate": "file:../../"
  }
}


================================================
FILE: integration/esm/.npmrc
================================================
package-lock=false
audit=false
fund=false



================================================
FILE: integration/next/middleware.ts
================================================
// NOTE: This file currently doesn't do anything other than
// validate that `next build` works as expected. We can
// extend it in future to support actual middleware tests.
import { NextRequest } from "next/server";
import Replicate from "replicate";

// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: "/api/:function*",
};

const replicate = new Replicate();

export function middleware(request: NextRequest) {
  const output = replicate.run("foo/bar");
  return Response.json({ output }, 200);
}



================================================
FILE: integration/next/package.json
================================================
{
  "name": "replicate-next",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next",
    "build": "rm -rf .next && next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.2.3",
    "replicate": "../../"
  }
}



================================================
FILE: integration/next/.npmrc
================================================
package-lock=false
audit=false
fund=false



================================================
FILE: integration/next/pages/index.js
================================================
export default () => (
  <main>
    <h1>Welcome to Next.js</h1>
  </main>
);



================================================
FILE: integration/typescript/index.test.ts
================================================
import { test } from "node:test";
import assert from "node:assert";
import main from "./index.js";

// Verify exported types.
import type {
  Status,
  Visibility,
  WebhookEventType,
  ApiError,
  Collection,
  Hardware,
  Model,
  ModelVersion,
  Prediction,
  Training,
  Page,
  ServerSentEvent,
} from "replicate";

test("main", async () => {
  const output = await main();
  assert.equal(output, "hello there, Tracy TypeScript");
});



================================================
FILE: integration/typescript/index.ts
================================================
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function main() {
  const output = (await replicate.run(
    "replicate/canary:30e22229542eb3f79d4f945dacb58d32001b02cc313ae6f54eef27904edf3272",
    {
      input: {
        text: "Tracy TypeScript",
      },
    }
  )) as string[];
  return output.join("").trim();
}



================================================
FILE: integration/typescript/package.json
================================================
{
  "name": "replicate-app-typescript",
  "version": "0.0.0",
  "private": true,
  "description": "TypeScript integration tests",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "tsc && node --test ./dist/index.test.js"
  },
  "dependencies": {
    "@types/node": "^20.11.0",
    "replicate": "file:../../",
    "typescript": "^5.3.3"
  }
}


================================================
FILE: integration/typescript/tsconfig.json
================================================
{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig to read more about this file */

    /* Projects */
    // "incremental": true,                              /* Save .tsbuildinfo files to allow for incremental compilation of projects. */
    // "composite": true,                                /* Enable constraints that allow a TypeScript project to be used with project references. */
    // "tsBuildInfoFile": "./.tsbuildinfo",              /* Specify the path to .tsbuildinfo incremental compilation file. */
    // "disableSourceOfProjectReferenceRedirect": true,  /* Disable preferring source files instead of declaration files when referencing composite projects. */
    // "disableSolutionSearching": true,                 /* Opt a project out of multi-project reference checking when editing. */
    // "disableReferencedProjectLoad": true,             /* Reduce the number of projects loaded automatically by TypeScript. */

    /* Language and Environment */
    "target": "es2018",                                  /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    // "lib": [],                                        /* Specify a set of bundled library declaration files that describe the target runtime environment. */
    // "jsx": "preserve",                                /* Specify what JSX code is generated. */
    // "experimentalDecorators": true,                   /* Enable experimental support for legacy experimental decorators. */
    // "emitDecoratorMetadata": true,                    /* Emit design-type metadata for decorated declarations in source files. */
    // "jsxFactory": "",                                 /* Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h'. */
    // "jsxFragmentFactory": "",                         /* Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'. */
    // "jsxImportSource": "",                            /* Specify module specifier used to import the JSX factory functions when using 'jsx: react-jsx*'. */
    // "reactNamespace": "",                             /* Specify the object invoked for 'createElement'. This only applies when targeting 'react' JSX emit. */
    // "noLib": true,                                    /* Disable including any library files, including the default lib.d.ts. */
    // "useDefineForClassFields": true,                  /* Emit ECMAScript-standard-compliant class fields. */
    // "moduleDetection": "auto",                        /* Control what method is used to detect module-format JS files. */

    /* Modules */
    "module": "nodenext",                                /* Specify what module code is generated. */
    // "rootDir": "./",                                  /* Specify the root folder within your source files. */
    // "moduleResolution": "node10",                     /* Specify how TypeScript looks up a file from a given module specifier. */
    // "baseUrl": "./",                                  /* Specify the base directory to resolve non-relative module names. */
    // "paths": {},                                      /* Specify a set of entries that re-map imports to additional lookup locations. */
    // "rootDirs": [],                                   /* Allow multiple folders to be treated as one when resolving modules. */
    // "typeRoots": [],                                  /* Specify multiple folders that act like './node_modules/@types'. */
    // "types": [],                                      /* Specify type package names to be included without being referenced in a source file. */
    // "allowUmdGlobalAccess": true,                     /* Allow accessing UMD globals from modules. */
    // "moduleSuffixes": [],                             /* List of file name suffixes to search when resolving a module. */
    // "allowImportingTsExtensions": true,               /* Allow imports to include TypeScript file extensions. Requires '--moduleResolution bundler' and either '--noEmit' or '--emitDeclarationOnly' to be set. */
    // "resolvePackageJsonExports": true,                /* Use the package.json 'exports' field when resolving package imports. */
    // "resolvePackageJsonImports": true,                /* Use the package.json 'imports' field when resolving imports. */
    // "customConditions": [],                           /* Conditions to set in addition to the resolver-specific defaults when resolving imports. */
    // "resolveJsonModule": true,                        /* Enable importing .json files. */
    // "allowArbitraryExtensions": true,                 /* Enable importing files with any extension, provided a declaration file is present. */
    // "noResolve": true,                                /* Disallow 'import's, 'require's or '<reference>'s from expanding the number of files TypeScript should add to a project. */

    /* JavaScript Support */
    // "allowJs": true,                                  /* Allow JavaScript files to be a part of your program. Use the 'checkJS' option to get errors from these files. */
    // "checkJs": true,                                  /* Enable error reporting in type-checked JavaScript files. */
    // "maxNodeModuleJsDepth": 1,                        /* Specify the maximum folder depth used for checking JavaScript files from 'node_modules'. Only applicable with 'allowJs'. */

    /* Emit */
    // "declaration": true,                              /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
    // "declarationMap": true,                           /* Create sourcemaps for d.ts files. */
    // "emitDeclarationOnly": true,                      /* Only output d.ts files and not JavaScript files. */
    // "sourceMap": true,                                /* Create source map files for emitted JavaScript files. */
    "inlineSourceMap": true,                             /* Include sourcemap files inside the emitted JavaScript. */
    // "outFile": "./",                                  /* Specify a file that bundles all outputs into one JavaScript file. If 'declaration' is true, also designates a file that bundles all .d.ts output. */
    "outDir": "./dist",                                  /* Specify an output folder for all emitted files. */
    // "removeComments": true,                           /* Disable emitting comments. */
    // "noEmit": true,                                   /* Disable emitting files from a compilation. */
    // "importHelpers": true,                            /* Allow importing helper functions from tslib once per project, instead of including them per-file. */
    // "importsNotUsedAsValues": "remove",               /* Specify emit/checking behavior for imports that are only used for types. */
    // "downlevelIteration": true,                       /* Emit more compliant, but verbose and less performant JavaScript for iteration. */
    // "sourceRoot": "",                                 /* Specify the root path for debuggers to find the reference source code. */
    // "mapRoot": "",                                    /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSources": true,                            /* Include source code in the sourcemaps inside the emitted JavaScript. */
    // "emitBOM": true,                                  /* Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. */
    // "newLine": "crlf",                                /* Set the newline character for emitting files. */
    // "stripInternal": true,                            /* Disable emitting declarations that have '@internal' in their JSDoc comments. */
    // "noEmitHelpers": true,                            /* Disable generating custom helper functions like '__extends' in compiled output. */
    // "noEmitOnError": true,                            /* Disable emitting files if any type checking errors are reported. */
    // "preserveConstEnums": true,                       /* Disable erasing 'const enum' declarations in generated code. */
    // "declarationDir": "./",                           /* Specify the output directory for generated declaration files. */
    // "preserveValueImports": true,                     /* Preserve unused imported values in the JavaScript output that would otherwise be removed. */

    /* Interop Constraints */
    // "isolatedModules": true,                          /* Ensure that each file can be safely transpiled without relying on other imports. */
    // "verbatimModuleSyntax": true,                     /* Do not transform or elide any imports or exports not marked as type-only, ensuring they are written in the output file's format based on the 'module' setting. */
    // "allowSyntheticDefaultImports": true,             /* Allow 'import x from y' when a module doesn't have a default export. */
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    // "preserveSymlinks": true,                         /* Disable resolving symlinks to their realpath. This correlates to the same flag in node. */
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */

    /* Type Checking */
    "strict": true,                                      /* Enable all strict type-checking options. */
    "noImplicitAny": true,                               /* Enable error reporting for expressions and declarations with an implied 'any' type. */
    "strictNullChecks": true,                            /* When type checking, take into account 'null' and 'undefined'. */
    // "strictFunctionTypes": true,                      /* When assigning functions, check to ensure parameters and the return values are subtype-compatible. */
    // "strictBindCallApply": true,                      /* Check that the arguments for 'bind', 'call', and 'apply' methods match the original function. */
    // "strictPropertyInitialization": true,             /* Check for class properties that are declared but not set in the constructor. */
    // "noImplicitThis": true,                           /* Enable error reporting when 'this' is given the type 'any'. */
    // "useUnknownInCatchVariables": true,               /* Default catch clause variables as 'unknown' instead of 'any'. */
    // "alwaysStrict": true,                             /* Ensure 'use strict' is always emitted. */
    // "noUnusedLocals": true,                           /* Enable error reporting when local variables aren't read. */
    // "noUnusedParameters": true,                       /* Raise an error when a function parameter isn't read. */
    // "exactOptionalPropertyTypes": true,               /* Interpret optional property types as written, rather than adding 'undefined'. */
    // "noImplicitReturns": true,                        /* Enable error reporting for codepaths that do not explicitly return in a function. */
    // "noFallthroughCasesInSwitch": true,               /* Enable error reporting for fallthrough cases in switch statements. */
    // "noUncheckedIndexedAccess": true,                 /* Add 'undefined' to a type when accessed using an index. */
    // "noImplicitOverride": true,                       /* Ensure overriding members in derived classes are marked with an override modifier. */
    // "noPropertyAccessFromIndexSignature": true,       /* Enforces using indexed accessors for keys declared using an indexed type. */
    // "allowUnusedLabels": true,                        /* Disable error reporting for unused labels. */
    // "allowUnreachableCode": true,                     /* Disable error reporting for unreachable code. */

    /* Completeness */
    "skipDefaultLibCheck": true,                         /* Skip type checking .d.ts files that are included with TypeScript. */
    "skipLibCheck": true                                 /* Skip type checking all .d.ts files. */
  }
}



================================================
FILE: integration/typescript/.npmrc
================================================
package-lock=false
audit=false
fund=false



================================================
FILE: lib/accounts.js
================================================
/**
 * Get the current account
 *
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the current account
 */
async function getCurrentAccount({ signal } = {}) {
  const response = await this.request("/account", {
    method: "GET",
    signal,
  });

  return response.json();
}

module.exports = {
  current: getCurrentAccount,
};



================================================
FILE: lib/collections.js
================================================
/**
 * Fetch a model collection
 *
 * @param {string} collection_slug - Required. The slug of the collection. See http://replicate.com/collections
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} - Resolves with the collection data
 */
async function getCollection(collection_slug, { signal } = {}) {
  const response = await this.request(`/collections/${collection_slug}`, {
    method: "GET",
    signal,
  });

  return response.json();
}

/**
 * Fetch a list of model collections
 *
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} - Resolves with the collections data
 */
async function listCollections({ signal } = {}) {
  const response = await this.request("/collections", {
    method: "GET",
    signal,
  });

  return response.json();
}

module.exports = { get: getCollection, list: listCollections };



================================================
FILE: lib/deployments.js
================================================
const { transformFileInputs } = require("./util");

/**
 * Create a new prediction with a deployment
 *
 * @param {string} deployment_owner - Required. The username of the user or organization who owns the deployment
 * @param {string} deployment_name - Required. The name of the deployment
 * @param {object} options
 * @param {object} options.input - Required. An object with the model inputs
 * @param {string} [options.webhook] - An HTTPS URL for receiving a webhook when the prediction has new output
 * @param {string[]} [options.webhook_events_filter] - You can change which events trigger webhook requests by specifying webhook events (`start`|`output`|`logs`|`completed`)
 * @param {boolean|integer} [options.wait] - Whether to wait until the prediction is completed before returning. If an integer is provided, it will wait for that many seconds. Defaults to false
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the created prediction data
 */
async function createPrediction(deployment_owner, deployment_name, options) {
  const { input, wait, signal, ...data } = options;

  if (data.webhook) {
    try {
      // eslint-disable-next-line no-new
      new URL(data.webhook);
    } catch (err) {
      throw new Error("Invalid webhook URL");
    }
  }

  const headers = {};
  if (wait) {
    if (typeof wait === "number") {
      const n = Math.max(1, Math.ceil(Number(wait)) || 1);
      headers["Prefer"] = `wait=${n}`;
    } else {
      headers["Prefer"] = "wait";
    }
  }

  const response = await this.request(
    `/deployments/${deployment_owner}/${deployment_name}/predictions`,
    {
      method: "POST",
      headers,
      data: {
        ...data,
        input: await transformFileInputs(
          this,
          input,
          this.fileEncodingStrategy
        ),
      },
      signal,
    }
  );

  return response.json();
}

/**
 * Get a deployment
 *
 * @param {string} deployment_owner - Required. The username of the user or organization who owns the deployment
 * @param {string} deployment_name - Required. The name of the deployment
 * @param {object] [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the deployment data
 */
async function getDeployment(
  deployment_owner,
  deployment_name,
  { signal } = {}
) {
  const response = await this.request(
    `/deployments/${deployment_owner}/${deployment_name}`,
    {
      method: "GET",
      signal,
    }
  );

  return response.json();
}

/**
 * @typedef {Object} DeploymentCreateRequest - Request body for `deployments.create`
 * @property {string} name - the name of the deployment
 * @property {string} model - the full name of the model that you want to deploy e.g. stability-ai/sdxl
 * @property {string} version - the 64-character string ID of the model version that you want to deploy
 * @property {string} hardware - the SKU for the hardware used to run the model, via `replicate.hardware.list()`
 * @property {number} min_instances - the minimum number of instances for scaling
 * @property {number} max_instances - the maximum number of instances for scaling
 */

/**
 * Create a deployment
 *
 * @param {DeploymentCreateRequest} deployment_config - Required. The deployment config.
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the deployment data
 */
async function createDeployment(deployment_config, { signal } = {}) {
  const response = await this.request("/deployments", {
    method: "POST",
    data: deployment_config,
    signal,
  });

  return response.json();
}

/**
 * @typedef {Object} DeploymentUpdateRequest - Request body for `deployments.update`
 * @property {string} version - the 64-character string ID of the model version that you want to deploy
 * @property {string} hardware - the SKU for the hardware used to run the model, via `replicate.hardware.list()`
 * @property {number} min_instances - the minimum number of instances for scaling
 * @property {number} max_instances - the maximum number of instances for scaling
 */

/**
 * Update an existing deployment
 *
 * @param {string} deployment_owner - Required. The username of the user or organization who owns the deployment
 * @param {string} deployment_name - Required. The name of the deployment
 * @param {DeploymentUpdateRequest} deployment_config - Required. The deployment changes.
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the deployment data
 */
async function updateDeployment(
  deployment_owner,
  deployment_name,
  deployment_config,
  { signal } = {}
) {
  const response = await this.request(
    `/deployments/${deployment_owner}/${deployment_name}`,
    {
      method: "PATCH",
      data: deployment_config,
      signal,
    }
  );

  return response.json();
}

/**
 * Delete a deployment
 *
 * @param {string} deployment_owner - Required. The username of the user or organization who owns the deployment
 * @param {string} deployment_name - Required. The name of the deployment
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<boolean>} Resolves with true if the deployment was deleted
 */
async function deleteDeployment(
  deployment_owner,
  deployment_name,
  { signal } = {}
) {
  const response = await this.request(
    `/deployments/${deployment_owner}/${deployment_name}`,
    {
      method: "DELETE",
      signal,
    }
  );

  return response.status === 204;
}

/**
 * List all deployments
 *
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} - Resolves with a page of deployments
 */
async function listDeployments({ signal } = {}) {
  const response = await this.request("/deployments", {
    method: "GET",
    signal,
  });

  return response.json();
}

module.exports = {
  predictions: {
    create: createPrediction,
  },
  get: getDeployment,
  create: createDeployment,
  update: updateDeployment,
  list: listDeployments,
  delete: deleteDeployment,
};



================================================
FILE: lib/error.js
================================================
/**
 * A representation of an API error.
 */
class ApiError extends Error {
  /**
   * Creates a representation of an API error.
   *
   * @param {string} message - Error message
   * @param {Request} request - HTTP request
   * @param {Response} response - HTTP response
   * @returns {ApiError} - An instance of ApiError
   */
  constructor(message, request, response) {
    super(message);
    this.name = "ApiError";
    this.request = request;
    this.response = response;
  }
}

module.exports = ApiError;



================================================
FILE: lib/files.js
================================================
/**
 * Create a file
 *
 * @param {object} file - Required. The file object.
 * @param {object} metadata - Optional. User-provided metadata associated with the file.
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} - Resolves with the file data
 */
async function createFile(file, metadata = {}, { signal } = {}) {
  const form = new FormData();

  let filename;
  let blob;
  if (file instanceof Blob) {
    filename = file.name || `blob_${Date.now()}`;
    blob = file;
  } else if (Buffer.isBuffer(file)) {
    filename = `buffer_${Date.now()}`;
    const bytes = new Uint8Array(file);
    blob = new Blob([bytes], {
      type: "application/octet-stream",
      name: filename,
    });
  } else {
    throw new Error("Invalid file argument, must be a Blob, File or Buffer");
  }

  form.append("content", blob, filename);
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );

  const response = await this.request("/files", {
    method: "POST",
    data: form,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    signal,
  });

  return response.json();
}

/**
 * List all files
 *
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} - Resolves with the files data
 */
async function listFiles({ signal } = {}) {
  const response = await this.request("/files", {
    method: "GET",
    signal,
  });

  return response.json();
}

/**
 * Get a file
 *
 * @param {string} file_id - Required. The ID of the file.
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} - Resolves with the file data
 */
async function getFile(file_id, { signal } = {}) {
  const response = await this.request(`/files/${file_id}`, {
    method: "GET",
    signal,
  });

  return response.json();
}

/**
 * Delete a file
 *
 * @param {string} file_id - Required. The ID of the file.
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<boolean>} - Resolves with true if the file was deleted
 */
async function deleteFile(file_id, { signal } = {}) {
  const response = await this.request(`/files/${file_id}`, {
    method: "DELETE",
    signal,
  });

  return response.status === 204;
}

module.exports = {
  create: createFile,
  list: listFiles,
  get: getFile,
  delete: deleteFile,
};



================================================
FILE: lib/hardware.js
================================================
/**
 * List hardware
 *
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object[]>} Resolves with the array of hardware
 */
async function listHardware({ signal } = {}) {
  const response = await this.request("/hardware", {
    method: "GET",
    signal,
  });

  return response.json();
}

module.exports = {
  list: listHardware,
};



================================================
FILE: lib/identifier.js
================================================
/*
 * A reference to a model version in the format `owner/name` or `owner/name:version`.
 */
class ModelVersionIdentifier {
  /*
   * @param {string} Required. The model owner.
   * @param {string} Required. The model name.
   * @param {string} The model version.
   */
  constructor(owner, name, version = null) {
    this.owner = owner;
    this.name = name;
    this.version = version;
  }

  /*
   * Parse a reference to a model version
   *
   * @param {string}
   * @returns {ModelVersionIdentifier}
   * @throws {Error} If the reference is invalid.
   */
  static parse(ref) {
    const match = ref.match(
      /^(?<owner>[^/]+)\/(?<name>[^/:]+)(:(?<version>.+))?$/
    );
    if (!match) {
      throw new Error(
        `Invalid reference to model version: ${ref}. Expected format: owner/name or owner/name:version`
      );
    }

    const { owner, name, version } = match.groups;

    return new ModelVersionIdentifier(owner, name, version);
  }
}

module.exports = ModelVersionIdentifier;



================================================
FILE: lib/models.js
================================================
/**
 * Get information about a model
 *
 * @param {string} model_owner - Required. The name of the user or organization that owns the model
 * @param {string} model_name - Required. The name of the model
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the model data
 */
async function getModel(model_owner, model_name, { signal } = {}) {
  const response = await this.request(`/models/${model_owner}/${model_name}`, {
    method: "GET",
    signal,
  });

  return response.json();
}

/**
 * List model versions
 *
 * @param {string} model_owner - Required. The name of the user or organization that owns the model
 * @param {string} model_name - Required. The name of the model
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the list of model versions
 */
async function listModelVersions(model_owner, model_name, { signal } = {}) {
  const response = await this.request(
    `/models/${model_owner}/${model_name}/versions`,
    {
      method: "GET",
      signal,
    }
  );

  return response.json();
}

/**
 * Get a specific model version
 *
 * @param {string} model_owner - Required. The name of the user or organization that owns the model
 * @param {string} model_name - Required. The name of the model
 * @param {string} version_id - Required. The model version
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the model version data
 */
async function getModelVersion(
  model_owner,
  model_name,
  version_id,
  { signal } = {}
) {
  const response = await this.request(
    `/models/${model_owner}/${model_name}/versions/${version_id}`,
    {
      method: "GET",
      signal,
    }
  );

  return response.json();
}

/**
 * List all public models
 *
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the model version data
 */
async function listModels({ signal } = {}) {
  const response = await this.request("/models", {
    method: "GET",
    signal,
  });

  return response.json();
}

/**
 * Create a new model
 *
 * @param {string} model_owner - Required. The name of the user or organization that will own the model. This must be the same as the user or organization that is making the API request. In other words, the API token used in the request must belong to this user or organization.
 * @param {string} model_name - Required. The name of the model. This must be unique among all models owned by the user or organization.
 * @param {object} options
 * @param {("public"|"private")} options.visibility - Required. Whether the model should be public or private. A public model can be viewed and run by anyone, whereas a private model can be viewed and run only by the user or organization members that own the model.
 * @param {string} options.hardware - Required. The SKU for the hardware used to run the model. Possible values can be found by calling `Replicate.hardware.list()`.
 * @param {string} options.description - A description of the model.
 * @param {string} options.github_url - A URL for the model's source code on GitHub.
 * @param {string} options.paper_url - A URL for the model's paper.
 * @param {string} options.license_url - A URL for the model's license.
 * @param {string} options.cover_image_url - A URL for the model's cover image. This should be an image file.
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the model version data
 */
async function createModel(model_owner, model_name, options) {
  const { signal, ...rest } = options;
  const data = { owner: model_owner, name: model_name, ...rest };

  const response = await this.request("/models", {
    method: "POST",
    data,
    signal,
  });

  return response.json();
}

/**
 * Search for public models
 *
 * @param {string} query - The search query
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with a page of models matching the search query
 */
async function search(query, { signal } = {}) {
  const response = await this.request("/models", {
    method: "QUERY",
    headers: {
      "Content-Type": "text/plain",
    },
    data: query,
    signal,
  });

  return response.json();
}

module.exports = {
  get: getModel,
  list: listModels,
  create: createModel,
  versions: { list: listModelVersions, get: getModelVersion },
  search,
};



================================================
FILE: lib/predictions.js
================================================
const { transformFileInputs } = require("./util");

/**
 * Create a new prediction
 *
 * @param {object} options
 * @param {string} options.model - The model.
 * @param {string} options.version - The model version.
 * @param {object} options.input - Required. An object with the model inputs
 * @param {string} [options.webhook] - An HTTPS URL for receiving a webhook when the prediction has new output
 * @param {string[]} [options.webhook_events_filter] - You can change which events trigger webhook requests by specifying webhook events (`start`|`output`|`logs`|`completed`)
 * @param {boolean|integer} [options.wait] - Whether to wait until the prediction is completed before returning. If an integer is provided, it will wait for that many seconds. Defaults to false
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the created prediction
 */
async function createPrediction(options) {
  const { model, version, input, wait, signal, ...data } = options;

  if (data.webhook) {
    try {
      // eslint-disable-next-line no-new
      new URL(data.webhook);
    } catch (err) {
      throw new Error("Invalid webhook URL");
    }
  }

  const headers = {};
  if (wait) {
    if (typeof wait === "number") {
      const n = Math.max(1, Math.ceil(Number(wait)) || 1);
      headers["Prefer"] = `wait=${n}`;
    } else {
      headers["Prefer"] = "wait";
    }
  }

  let response;
  if (version) {
    response = await this.request("/predictions", {
      method: "POST",
      headers,
      data: {
        ...data,
        input: await transformFileInputs(
          this,
          input,
          this.fileEncodingStrategy
        ),
        version,
      },
      signal,
    });
  } else if (model) {
    response = await this.request(`/models/${model}/predictions`, {
      method: "POST",
      headers,
      data: {
        ...data,
        input: await transformFileInputs(
          this,
          input,
          this.fileEncodingStrategy
        ),
      },
      signal,
    });
  } else {
    throw new Error("Either model or version must be specified");
  }

  return response.json();
}

/**
 * Fetch a prediction by ID
 *
 * @param {number} prediction_id - Required. The prediction ID
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the prediction data
 */
async function getPrediction(prediction_id, { signal } = {}) {
  const response = await this.request(`/predictions/${prediction_id}`, {
    method: "GET",
    signal,
  });

  return response.json();
}

/**
 * Cancel a prediction by ID
 *
 * @param {string} prediction_id - Required. The training ID
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the data for the training
 */
async function cancelPrediction(prediction_id, { signal } = {}) {
  const response = await this.request(`/predictions/${prediction_id}/cancel`, {
    method: "POST",
    signal,
  });

  return response.json();
}

/**
 * List all predictions
 *
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} - Resolves with a page of predictions
 */
async function listPredictions({ signal } = {}) {
  const response = await this.request("/predictions", {
    method: "GET",
    signal,
  });

  return response.json();
}

module.exports = {
  create: createPrediction,
  get: getPrediction,
  cancel: cancelPrediction,
  list: listPredictions,
};



================================================
FILE: lib/stream.js
================================================
// Attempt to use readable-stream if available, attempt to use the built-in stream module.

const ApiError = require("./error");
const { streamAsyncIterator } = require("./util");
const {
  EventSourceParserStream,
} = require("../vendor/eventsource-parser/stream");
const { TextDecoderStream } =
  typeof globalThis.TextDecoderStream === "undefined"
    ? require("../vendor/streams-text-encoding/text-decoder-stream")
    : globalThis;

/**
 * A server-sent event.
 */
class ServerSentEvent {
  /**
   * Create a new server-sent event.
   *
   * @param {string} event The event name.
   * @param {string} data The event data.
   * @param {string} id The event ID.
   * @param {number} retry The retry time.
   */
  constructor(event, data, id, retry) {
    this.event = event;
    this.data = data;
    this.id = id;
    this.retry = retry;
  }

  /**
   * Convert the event to a string.
   */
  toString() {
    if (this.event === "output") {
      return this.data;
    }

    return "";
  }
}

/**
 * Create a new stream of server-sent events.
 *
 * @param {object} config
 * @param {string} config.url The URL to connect to.
 * @param {typeof fetch} [config.fetch] The URL to connect to.
 * @param {object} [config.options] The EventSource options.
 * @param {boolean} [config.options.useFileOutput] Whether to use the file output stream.
 * @returns {ReadableStream<ServerSentEvent> & AsyncIterable<ServerSentEvent>}
 */
function createReadableStream({ url, fetch, options = {} }) {
  const { useFileOutput = true, headers = {}, ...initOptions } = options;

  return new ReadableStream({
    async start(controller) {
      const init = {
        ...initOptions,
        headers: {
          ...headers,
          Accept: "text/event-stream",
        },
      };
      const response = await fetch(url, init);

      if (!response.ok) {
        const text = await response.text();
        const request = new Request(url, init);
        controller.error(
          new ApiError(
            `Request to ${url} failed with status ${response.status}: ${text}`,
            request,
            response
          )
        );
      }

      const stream = response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new EventSourceParserStream());

      for await (const event of streamAsyncIterator(stream)) {
        if (event.event === "error") {
          controller.error(new Error(event.data));
          break;
        }

        let data = event.data;
        if (
          useFileOutput &&
          typeof data === "string" &&
          (data.startsWith("https:") || data.startsWith("data:"))
        ) {
          data = createFileOutput({ data, fetch });
        }
        controller.enqueue(new ServerSentEvent(event.event, data, event.id));

        if (event.event === "done") {
          break;
        }
      }

      controller.close();
    },
  });
}

/**
 * Create a new readable stream for an output file
 * created by running a Replicate model.
 *
 * @param {object} config
 * @param {string} config.url The URL to connect to.
 * @param {typeof fetch} [config.fetch] The fetch function.
 * @returns {ReadableStream<Uint8Array>}
 */
function createFileOutput({ url, fetch }) {
  let type = "application/octet-stream";

  class FileOutput extends ReadableStream {
    async blob() {
      const chunks = [];
      for await (const chunk of this) {
        chunks.push(chunk);
      }
      return new Blob(chunks, { type });
    }

    url() {
      return new URL(url);
    }

    toString() {
      return url;
    }
  }

  return new FileOutput({
    async start(controller) {
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        const request = new Request(url, init);
        controller.error(
          new ApiError(
            `Request to ${url} failed with status ${response.status}: ${text}`,
            request,
            response
          )
        );
      }

      if (response.headers.get("Content-Type")) {
        type = response.headers.get("Content-Type");
      }

      try {
        for await (const chunk of streamAsyncIterator(response.body)) {
          controller.enqueue(chunk);
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

module.exports = {
  createFileOutput,
  createReadableStream,
  ServerSentEvent,
};



================================================
FILE: lib/trainings.js
================================================
/**
 * Create a new training
 *
 * @param {string} model_owner - Required. The username of the user or organization who owns the model
 * @param {string} model_name - Required. The name of the model
 * @param {string} version_id - Required. The version ID
 * @param {object} options
 * @param {string} options.destination - Required. The destination for the trained version in the form "{username}/{model_name}"
 * @param {object} options.input - Required. An object with the model inputs
 * @param {string} [options.webhook] - An HTTPS URL for receiving a webhook when the training updates
 * @param {string[]} [options.webhook_events_filter] - You can change which events trigger webhook requests by specifying webhook events (`start`|`output`|`logs`|`completed`)
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the data for the created training
 */
async function createTraining(model_owner, model_name, version_id, options) {
  const { signal, ...data } = options;

  if (data.webhook) {
    try {
      // eslint-disable-next-line no-new
      new URL(data.webhook);
    } catch (err) {
      throw new Error("Invalid webhook URL");
    }
  }

  const response = await this.request(
    `/models/${model_owner}/${model_name}/versions/${version_id}/trainings`,
    {
      method: "POST",
      data,
      signal,
    }
  );

  return response.json();
}

/**
 * Fetch a training by ID
 *
 * @param {string} training_id - Required. The training ID
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the data for the training
 */
async function getTraining(training_id, { signal } = {}) {
  const response = await this.request(`/trainings/${training_id}`, {
    method: "GET",
    signal,
  });

  return response.json();
}

/**
 * Cancel a training by ID
 *
 * @param {string} training_id - Required. The training ID
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the data for the training
 */
async function cancelTraining(training_id, { signal } = {}) {
  const response = await this.request(`/trainings/${training_id}/cancel`, {
    method: "POST",
    signal,
  });

  return response.json();
}

/**
 * List all trainings
 *
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} - Resolves with a page of trainings
 */
async function listTrainings({ signal } = {}) {
  const response = await this.request("/trainings", {
    method: "GET",
    signal,
  });

  return response.json();
}

module.exports = {
  create: createTraining,
  get: getTraining,
  cancel: cancelTraining,
  list: listTrainings,
};



================================================
FILE: lib/util.js
================================================
const ApiError = require("./error");
const { create: createFile } = require("./files");

/**
 * @see {@link validateWebhook}
 * @overload
 * @param {object} requestData - The request data
 * @param {string} requestData.id - The webhook ID header from the incoming request.
 * @param {string} requestData.timestamp - The webhook timestamp header from the incoming request.
 * @param {string} requestData.body - The raw body of the incoming webhook request.
 * @param {string} requestData.secret - The webhook secret, obtained from `replicate.webhooks.defaul.secret` method.
 * @param {string} requestData.signature - The webhook signature header from the incoming request, comprising one or more space-delimited signatures.
 * @param {Crypto} [crypto] - An optional `Crypto` implementation that conforms to the [browser Crypto interface](https://developer.mozilla.org/en-US/docs/Web/API/Window/crypto)
 */

/**
 * @see {@link validateWebhook}
 * @overload
 * @param {object} requestData - The request object
 * @param {object} requestData.headers - The request headers
 * @param {string} requestData.headers["webhook-id"] - The webhook ID header from the incoming request
 * @param {string} requestData.headers["webhook-timestamp"] - The webhook timestamp header from the incoming request
 * @param {string} requestData.headers["webhook-signature"] - The webhook signature header from the incoming request, comprising one or more space-delimited signatures
 * @param {string} requestData.body - The raw body of the incoming webhook request
 * @param {string} secret - The webhook secret, obtained from `replicate.webhooks.defaul.secret` method
 * @param {Crypto} [crypto] - An optional `Crypto` implementation that conforms to the [browser Crypto interface](https://developer.mozilla.org/en-US/docs/Web/API/Window/crypto)
 */

/**
 * Validate a webhook signature
 *
 * @returns {Promise<boolean>} - True if the signature is valid
 * @throws {Error} - If the request is missing required headers, body, or secret
 */
async function validateWebhook(requestData, secretOrCrypto, customCrypto) {
  let id;
  let body;
  let timestamp;
  let signature;
  let secret;
  let crypto = globalThis.crypto;

  if (requestData && requestData.headers && requestData.body) {
    if (typeof requestData.headers.get === "function") {
      // Headers object (e.g. Fetch API Headers)
      id = requestData.headers.get("webhook-id");
      timestamp = requestData.headers.get("webhook-timestamp");
      signature = requestData.headers.get("webhook-signature");
    } else {
      // Plain object with header key-value pairs
      id = requestData.headers["webhook-id"];
      timestamp = requestData.headers["webhook-timestamp"];
      signature = requestData.headers["webhook-signature"];
    }
    body = requestData.body;
    if (typeof secretOrCrypto !== "string") {
      throw new Error(
        "Unexpected value for secret passed to validateWebhook, expected a string"
      );
    }

    secret = secretOrCrypto;
    if (customCrypto) {
      crypto = customCrypto;
    }
  } else {
    id = requestData.id;
    body = requestData.body;
    timestamp = requestData.timestamp;
    signature = requestData.signature;
    secret = requestData.secret;
    if (secretOrCrypto) {
      crypto = secretOrCrypto;
    }
  }

  if (body instanceof ReadableStream || body.readable) {
    try {
      body = await new Response(body).text();
    } catch (err) {
      throw new Error(`Error reading body: ${err.message}`);
    }
  } else if (isTypedArray(body)) {
    body = await new Blob([body]).text();
  } else if (typeof body === "object") {
    body = JSON.stringify(body);
  } else if (typeof body !== "string") {
    throw new Error("Invalid body type");
  }

  if (!id || !timestamp || !signature) {
    throw new Error("Missing required webhook headers");
  }

  if (!body) {
    throw new Error("Missing required body");
  }

  if (!secret) {
    throw new Error("Missing required secret");
  }

  if (!crypto) {
    throw new Error(
      'Missing `crypto` implementation. If using Node 18 pass in require("node:crypto").webcrypto'
    );
  }

  const signedContent = `${id}.${timestamp}.${body}`;

  const computedSignature = await createHMACSHA256(
    secret.split("_").pop(),
    signedContent,
    crypto
  );

  const expectedSignatures = signature
    .split(" ")
    .map((sig) => sig.split(",")[1]);

  return expectedSignatures.some(
    (expectedSignature) => expectedSignature === computedSignature
  );
}

/**
 * @param {string} secret - base64 encoded string
 * @param {string} data - text body of request
 * @param {Crypto} crypto - an implementation of the web Crypto api
 */
async function createHMACSHA256(secret, data, crypto) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    base64ToBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bytesToBase64(signature);
}

/**
 * Convert a base64 encoded string into bytes.
 *
 * @param {string} the base64 encoded string
 * @return {Uint8Array}
 *
 * Two functions for encoding/decoding base64 strings using web standards. Not
 * intended to be used to encode/decode arbitrary string data.
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Base64#javascript_support
 * See: https://stackoverflow.com/a/31621532
 *
 * Performance might take a hit because of the conversion to string and then to binary,
 * if this is the case we might want to look at an alternative solution.
 * See: https://jsben.ch/wnaZC
 */
function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), (m) => m.codePointAt(0));
}

/**
 * Convert a base64 encoded string into bytes.
 *
 * See {@link base64ToBytes} for caveats.
 *
 * @param {Uint8Array | ArrayBuffer} the base64 encoded string
 * @return {string}
 */
function bytesToBase64(bytes) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(bytes)));
}

/**
 * Automatically retry a request if it fails with an appropriate status code.
 *
 * A GET request is retried if it fails with a 429 or 5xx status code.
 * A non-GET request is retried only if it fails with a 429 status code.
 *
 * If the response sets a Retry-After header,
 * the request is retried after the number of seconds specified in the header.
 * Otherwise, the request is retried after the specified interval,
 * with exponential backoff and jitter.
 *
 * @param {Function} request - A function that returns a Promise that resolves with a Response object
 * @param {object} options
 * @param {Function} [options.shouldRetry] - A function that returns true if the request should be retried
 * @param {number} [options.maxRetries] - Maximum number of retries. Defaults to 5
 * @param {number} [options.interval] - Interval between retries in milliseconds. Defaults to 500
 * @returns {Promise<Response>} - Resolves with the response object
 * @throws {ApiError} If the request failed
 */
async function withAutomaticRetries(request, options = {}) {
  const shouldRetry = options.shouldRetry || (() => false);
  const maxRetries = options.maxRetries || 5;
  const interval = options.interval || 500;
  const jitter = options.jitter || 100;

  // eslint-disable-next-line no-promise-executor-return
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let attempts = 0;
  do {
    let delay = interval * 2 ** attempts + Math.random() * jitter;

    /* eslint-disable no-await-in-loop */
    try {
      const response = await request();
      if (response.ok || !shouldRetry(response)) {
        return response;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const retryAfter = error.response.headers.get("Retry-After");
        if (retryAfter) {
          if (!Number.isInteger(retryAfter)) {
            // Retry-After is a date
            const date = new Date(retryAfter);
            if (!Number.isNaN(date.getTime())) {
              delay = date.getTime() - new Date().getTime();
            }
          } else {
            // Retry-After is a number of seconds
            delay = retryAfter * 1000;
          }
        }
      }
    }

    if (Number.isInteger(maxRetries) && maxRetries > 0) {
      if (Number.isInteger(delay) && delay > 0) {
        await sleep(interval * 2 ** (options.maxRetries - maxRetries));
      }
      attempts += 1;
    }
  } while (attempts < maxRetries);

  return request();
}

/**
 * Walks the inputs and, for any File or Blob, tries to upload it to Replicate
 * and replaces the input with the URL of the uploaded file.
 *
 * @param {Replicate} client - The client used to upload the file
 * @param {object} inputs - The inputs to transform
 * @param {"default" | "upload" | "data-uri"} strategy - Whether to upload files to Replicate, encode as dataURIs or try both.
 * @returns {Promise<object>} - The transformed inputs
 * @throws {ApiError} If the request to upload the file fails
 */
async function transformFileInputs(client, inputs, strategy) {
  switch (strategy) {
    case "data-uri":
      return await transformFileInputsToBase64EncodedDataURIs(client, inputs);
    case "upload":
      return await transformFileInputsToReplicateFileURLs(client, inputs);
    case "default":
      try {
        return await transformFileInputsToReplicateFileURLs(client, inputs);
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          throw error;
        }
        return await transformFileInputsToBase64EncodedDataURIs(inputs);
      }
    default:
      throw new Error(`Unexpected file upload strategy: ${strategy}`);
  }
}

/**
 * Walks the inputs and, for any File or Blob, tries to upload it to Replicate
 * and replaces the input with the URL of the uploaded file.
 *
 * @param {Replicate} client - The client used to upload the file
 * @param {object} inputs - The inputs to transform
 * @returns {Promise<object>} - The transformed inputs
 * @throws {ApiError} If the request to upload the file fails
 */
async function transformFileInputsToReplicateFileURLs(client, inputs) {
  return await transform(inputs, async (value) => {
    if (value instanceof Blob || value instanceof Buffer) {
      const file = await createFile.call(client, value);
      return file.urls.get;
    }

    return value;
  });
}

const MAX_DATA_URI_SIZE = 10_000_000;

/**
 * Walks the inputs and transforms any binary data found into a
 * base64-encoded data URI.
 *
 * @param {object} inputs - The inputs to transform
 * @returns {Promise<object>} - The transformed inputs
 * @throws {Error} If the size of inputs exceeds a given threshold set by MAX_DATA_URI_SIZE
 */
async function transformFileInputsToBase64EncodedDataURIs(inputs) {
  let totalBytes = 0;
  return await transform(inputs, async (value) => {
    let buffer;
    let mime;

    if (value instanceof Blob) {
      // Currently, we use a NodeJS only API for base64 encoding, as
      // we move to support the browser we could support either using
      // btoa (which does string encoding), the FileReader API or
      // a JavaScript implementation like base64-js.
      // See: https://developer.mozilla.org/en-US/docs/Glossary/Base64
      // See: https://github.com/beatgammit/base64-js
      buffer = await value.arrayBuffer();
      mime = value.type;
    } else if (isTypedArray(value)) {
      buffer = value;
    } else {
      return value;
    }

    totalBytes += buffer.byteLength;
    if (totalBytes > MAX_DATA_URI_SIZE) {
      throw new Error(
        `Combined filesize of prediction ${totalBytes} bytes exceeds 10mb limit for inline encoding, please provide URLs instead`
      );
    }

    const data = bytesToBase64(buffer);
    mime = mime || "application/octet-stream";

    return `data:${mime};base64,${data}`;
  });
}

// Walk a JavaScript object and transform the leaf values.
async function transform(value, mapper) {
  if (Array.isArray(value)) {
    const copy = [];
    for (const val of value) {
      const transformed = await transform(val, mapper);
      copy.push(transformed);
    }
    return copy;
  }

  if (isPlainObject(value)) {
    const copy = {};
    for (const key of Object.keys(value)) {
      copy[key] = await transform(value[key], mapper);
    }
    return copy;
  }

  return await mapper(value);
}

function isTypedArray(arr) {
  return (
    arr instanceof Int8Array ||
    arr instanceof Int16Array ||
    arr instanceof Int32Array ||
    arr instanceof Uint8Array ||
    arr instanceof Uint8ClampedArray ||
    arr instanceof Uint16Array ||
    arr instanceof Uint32Array ||
    arr instanceof Float32Array ||
    arr instanceof Float64Array
  );
}

// Test for a plain JS object.
// Source: lodash.isPlainObject
function isPlainObject(value) {
  const isObjectLike = typeof value === "object" && value !== null;
  if (!isObjectLike || String(value) !== "[object Object]") {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto === null) {
    return true;
  }
  const Ctor =
    Object.prototype.hasOwnProperty.call(proto, "constructor") &&
    proto.constructor;
  return (
    typeof Ctor === "function" &&
    Ctor instanceof Ctor &&
    Function.prototype.toString.call(Ctor) ===
      Function.prototype.toString.call(Object)
  );
}

/**
 * Parse progress from prediction logs.
 *
 * This function supports log statements in the following format,
 * which are generated by https://github.com/tqdm/tqdm and similar libraries:
 *
 * ```
 * 76%|████████████████████████████         | 7568/10000 [00:33<00:10, 229.00it/s]
 * ```
 *
 * @example
 * const progress = parseProgressFromLogs("76%|████████████████████████████         | 7568/10000 [00:33<00:10, 229.00it/s]");
 * console.log(progress);
 * // {
 * //   percentage: 0.76,
 * //   current: 7568,
 * //   total: 10000,
 * // }
 *
 * @param {object|string} input - A prediction object or string.
 * @returns {(object|null)} - An object with the percentage, current, and total, or null if no progress can be parsed.
 */
function parseProgressFromLogs(input) {
  const logs = typeof input === "object" && input.logs ? input.logs : input;
  if (!logs || typeof logs !== "string") {
    return null;
  }

  const pattern = /^\s*(\d+)%\s*\|.+?\|\s*(\d+)\/(\d+)/;
  const lines = logs.split("\n").reverse();

  for (const line of lines) {
    const matches = line.match(pattern);

    if (matches && matches.length === 4) {
      return {
        percentage: parseInt(matches[1], 10) / 100,
        current: parseInt(matches[2], 10),
        total: parseInt(matches[3], 10),
      };
    }
  }

  return null;
}

/**
 * Helper to make any `ReadableStream` iterable, this is supported
 * by most server runtimes but browsers still haven't implemented
 * it yet.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#browser_compatibility
 *
 * @template T
 * @param {ReadableStream<T>} stream an instance of a `ReadableStream`
 * @yields {T} a chunk/event from the stream
 */
async function* streamAsyncIterator(stream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

module.exports = {
  transform,
  transformFileInputs,
  validateWebhook,
  withAutomaticRetries,
  parseProgressFromLogs,
  streamAsyncIterator,
};



================================================
FILE: lib/webhooks.js
================================================
/**
 * Get the default webhook signing secret
 *
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - An optional AbortSignal
 * @returns {Promise<object>} Resolves with the signing secret for the default webhook
 */
async function getDefaultWebhookSecret({ signal } = {}) {
  const response = await this.request("/webhooks/default/secret", {
    method: "GET",
    signal,
  });

  return response.json();
}

module.exports = {
  default: {
    secret: {
      get: getDefaultWebhookSecret,
    },
  },
};



================================================
FILE: .github/workflows/ci.yml
================================================
name: CI

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        suite: [node]
        # See supported Node.js release schedule at https://nodejs.org/en/about/previous-releases
        node-version: [18.x, 20.x, 22.x]

    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"
      - run: npm ci
      - run: npm run test
      - run: npm run check
      - run: npm run lint


  # Build a production tarball and use it to run the integration
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        # See supported Node.js release schedule at https://nodejs.org/en/about/previous-releases
        node-version: [20.x]

    outputs:
      tarball-name: ${{ steps.pack.outputs.tarball-name }}

    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"
      - name: Build tarball
        id: pack
        run: |
          echo "tarball-name=$(npm --loglevel error pack)" >> $GITHUB_OUTPUT
      - uses: actions/upload-artifact@v4
        with:
          name: package-tarball
          path: ${{ steps.pack.outputs.tarball-name }}


  integration-node:
    needs: [test, build]
    runs-on: ubuntu-latest

    env:
      REPLICATE_API_TOKEN: ${{ secrets.REPLICATE_API_TOKEN }}

    strategy:
      matrix:
        suite: [commonjs, esm, typescript]
        # See supported Node.js release schedule at https://nodejs.org/en/about/previous-releases
        node-version: [18.x, 20.x]
      fail-fast: false

    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4.1.7
        with:
          name: package-tarball
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"
      - run: |
          npm --prefix integration/${{ matrix.suite }} install
          npm --prefix integration/${{ matrix.suite }} install "./${{ needs.build.outputs.tarball-name }}"
          npm --prefix integration/${{ matrix.suite }} test

  integration-browser:
    needs: [test, build]
    runs-on: ubuntu-latest

    env:
      REPLICATE_API_TOKEN: ${{ secrets.REPLICATE_API_TOKEN }}

    strategy:
      matrix:
        suite: ["browser"]
        browser: ["chromium", "firefox", "webkit"]
        node-version: [20.x]
      fail-fast: false

    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4.1.7
        with:
          name: package-tarball
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"
      - run: |
          cd integration/${{ matrix.suite }}
          npm install
          npm install "../../${{ needs.build.outputs.tarball-name }}"
          npm exec -- playwright install ${{ matrix.browser }}
          npm exec -- playwright install-deps ${{ matrix.browser }}
          npm exec -- playwright test --browser ${{ matrix.browser }}

  integration-edge:
    needs: [test, build]
    runs-on: ubuntu-latest

    env:
      REPLICATE_API_TOKEN: ${{ secrets.REPLICATE_API_TOKEN }}

    strategy:
      matrix:
        suite: [cloudflare-worker]
        node-version: [20.x]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4.1.7
        with:
          name: package-tarball
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"
      - run: |
          test "${{ matrix.suite }}" = "cloudflare-worker" && echo "REPLICATE_API_TOKEN=${{ secrets.REPLICATE_API_TOKEN }}" > integration/${{ matrix.suite }}/.dev.vars
          npm --prefix integration/${{ matrix.suite }} install
          npm --prefix integration/${{ matrix.suite }} install "./${{ needs.build.outputs.tarball-name }}"
          npm --prefix integration/${{ matrix.suite }} test

  integration-bun:
    needs: [test, build]
    runs-on: ubuntu-latest

    env:
      REPLICATE_API_TOKEN: ${{ secrets.REPLICATE_API_TOKEN }}

    strategy:
      matrix:
        suite: [bun]
        bun-version: [1.0.11]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4.1.7
        with:
          name: package-tarball
      - name: Use Bun ${{ matrix.bun-version }}
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ matrix.bun-version }}
      - run: |
          cd integration/${{ matrix.suite }}
          bun uninstall replicate
          bun install "file:../../${{ needs.build.outputs.tarball-name }}"
          retries=3
          for ((i=0; i<retries; i++)); do
            bun test && break || echo "Test failed, retrying..."
          done

  integration-deno:
    needs: [test, build]
    runs-on: ubuntu-latest

    env:
      REPLICATE_API_TOKEN: ${{ secrets.REPLICATE_API_TOKEN }}

    strategy:
      matrix:
        suite: [deno]
        deno-version: [v1.x]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4.1.7
        with:
          name: package-tarball
      - name: Use Deno ${{ matrix.deno-version }}
        uses: denoland/setup-deno@v1
        with:
          deno-version: ${{ matrix.deno-version }}
      - run: |
          cd integration/deno
          deno cache --node-modules-dir index.ts
          tar -xzf ../../${{ needs.build.outputs.tarball-name }} --strip-components=1 -C node_modules/replicate
          deno test --allow-env --allow-net --node-modules-dir index.test.ts

  integration-nextjs:
    needs: [test, build]
    runs-on: ubuntu-latest

    strategy:
      matrix:
        suite: [nextjs]
        node-version: [20.x]

    env:
      REPLICATE_API_TOKEN: ${{ secrets.REPLICATE_API_TOKEN }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4.1.7
        with:
          name: package-tarball
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"
      - run: |
          npm --prefix integration/next install
          npm --prefix integration/next install "./${{ needs.build.outputs.tarball-name }}"
          npm --prefix integration/next run build


