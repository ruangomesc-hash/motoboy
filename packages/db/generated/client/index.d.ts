
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Affiliate
 * 
 */
export type Affiliate = $Result.DefaultSelection<Prisma.$AffiliatePayload>
/**
 * Model ActivityLog
 * 
 */
export type ActivityLog = $Result.DefaultSelection<Prisma.$ActivityLogPayload>
/**
 * Model CostConfig
 * 
 */
export type CostConfig = $Result.DefaultSelection<Prisma.$CostConfigPayload>
/**
 * Model Delivery
 * 
 */
export type Delivery = $Result.DefaultSelection<Prisma.$DeliveryPayload>
/**
 * Model Shift
 * 
 */
export type Shift = $Result.DefaultSelection<Prisma.$ShiftPayload>
/**
 * Model Goal
 * 
 */
export type Goal = $Result.DefaultSelection<Prisma.$GoalPayload>
/**
 * Model Route
 * 
 */
export type Route = $Result.DefaultSelection<Prisma.$RoutePayload>
/**
 * Model Payment
 * 
 */
export type Payment = $Result.DefaultSelection<Prisma.$PaymentPayload>
/**
 * Model WhatsAppMessage
 * 
 */
export type WhatsAppMessage = $Result.DefaultSelection<Prisma.$WhatsAppMessagePayload>
/**
 * Model FuelRefuel
 * 
 */
export type FuelRefuel = $Result.DefaultSelection<Prisma.$FuelRefuelPayload>
/**
 * Model OdometerReading
 * 
 */
export type OdometerReading = $Result.DefaultSelection<Prisma.$OdometerReadingPayload>
/**
 * Model AuthCode
 * 
 */
export type AuthCode = $Result.DefaultSelection<Prisma.$AuthCodePayload>
/**
 * Model AdminAccount
 * 
 */
export type AdminAccount = $Result.DefaultSelection<Prisma.$AdminAccountPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ActivityCategory: {
  PROFILE: 'PROFILE',
  COSTS: 'COSTS',
  GOAL: 'GOAL',
  DELIVERY: 'DELIVERY',
  FUEL: 'FUEL',
  ODOMETER: 'ODOMETER',
  SHIFT: 'SHIFT'
};

export type ActivityCategory = (typeof ActivityCategory)[keyof typeof ActivityCategory]


export const ActivityAction: {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED'
};

export type ActivityAction = (typeof ActivityAction)[keyof typeof ActivityAction]


export const UserStatus: {
  TRIAL: 'TRIAL',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CANCELED: 'CANCELED'
};

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]


export const DeliverySource: {
  IFOOD: 'IFOOD',
  NINETY_NINE: 'NINETY_NINE',
  RAPPI: 'RAPPI',
  PARTICULAR: 'PARTICULAR',
  OTHER: 'OTHER'
};

export type DeliverySource = (typeof DeliverySource)[keyof typeof DeliverySource]


export const GoalPeriod: {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY'
};

export type GoalPeriod = (typeof GoalPeriod)[keyof typeof GoalPeriod]


export const PaymentStatus: {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

}

export type ActivityCategory = $Enums.ActivityCategory

export const ActivityCategory: typeof $Enums.ActivityCategory

export type ActivityAction = $Enums.ActivityAction

export const ActivityAction: typeof $Enums.ActivityAction

export type UserStatus = $Enums.UserStatus

export const UserStatus: typeof $Enums.UserStatus

export type DeliverySource = $Enums.DeliverySource

export const DeliverySource: typeof $Enums.DeliverySource

export type GoalPeriod = $Enums.GoalPeriod

export const GoalPeriod: typeof $Enums.GoalPeriod

export type PaymentStatus = $Enums.PaymentStatus

export const PaymentStatus: typeof $Enums.PaymentStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.affiliate`: Exposes CRUD operations for the **Affiliate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Affiliates
    * const affiliates = await prisma.affiliate.findMany()
    * ```
    */
  get affiliate(): Prisma.AffiliateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.activityLog`: Exposes CRUD operations for the **ActivityLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ActivityLogs
    * const activityLogs = await prisma.activityLog.findMany()
    * ```
    */
  get activityLog(): Prisma.ActivityLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.costConfig`: Exposes CRUD operations for the **CostConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CostConfigs
    * const costConfigs = await prisma.costConfig.findMany()
    * ```
    */
  get costConfig(): Prisma.CostConfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.delivery`: Exposes CRUD operations for the **Delivery** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Deliveries
    * const deliveries = await prisma.delivery.findMany()
    * ```
    */
  get delivery(): Prisma.DeliveryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.shift`: Exposes CRUD operations for the **Shift** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Shifts
    * const shifts = await prisma.shift.findMany()
    * ```
    */
  get shift(): Prisma.ShiftDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.goal`: Exposes CRUD operations for the **Goal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Goals
    * const goals = await prisma.goal.findMany()
    * ```
    */
  get goal(): Prisma.GoalDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.route`: Exposes CRUD operations for the **Route** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Routes
    * const routes = await prisma.route.findMany()
    * ```
    */
  get route(): Prisma.RouteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.payment`: Exposes CRUD operations for the **Payment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Payments
    * const payments = await prisma.payment.findMany()
    * ```
    */
  get payment(): Prisma.PaymentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.whatsAppMessage`: Exposes CRUD operations for the **WhatsAppMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WhatsAppMessages
    * const whatsAppMessages = await prisma.whatsAppMessage.findMany()
    * ```
    */
  get whatsAppMessage(): Prisma.WhatsAppMessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.fuelRefuel`: Exposes CRUD operations for the **FuelRefuel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FuelRefuels
    * const fuelRefuels = await prisma.fuelRefuel.findMany()
    * ```
    */
  get fuelRefuel(): Prisma.FuelRefuelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.odometerReading`: Exposes CRUD operations for the **OdometerReading** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OdometerReadings
    * const odometerReadings = await prisma.odometerReading.findMany()
    * ```
    */
  get odometerReading(): Prisma.OdometerReadingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.authCode`: Exposes CRUD operations for the **AuthCode** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuthCodes
    * const authCodes = await prisma.authCode.findMany()
    * ```
    */
  get authCode(): Prisma.AuthCodeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.adminAccount`: Exposes CRUD operations for the **AdminAccount** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AdminAccounts
    * const adminAccounts = await prisma.adminAccount.findMany()
    * ```
    */
  get adminAccount(): Prisma.AdminAccountDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Affiliate: 'Affiliate',
    ActivityLog: 'ActivityLog',
    CostConfig: 'CostConfig',
    Delivery: 'Delivery',
    Shift: 'Shift',
    Goal: 'Goal',
    Route: 'Route',
    Payment: 'Payment',
    WhatsAppMessage: 'WhatsAppMessage',
    FuelRefuel: 'FuelRefuel',
    OdometerReading: 'OdometerReading',
    AuthCode: 'AuthCode',
    AdminAccount: 'AdminAccount'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "affiliate" | "activityLog" | "costConfig" | "delivery" | "shift" | "goal" | "route" | "payment" | "whatsAppMessage" | "fuelRefuel" | "odometerReading" | "authCode" | "adminAccount"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Affiliate: {
        payload: Prisma.$AffiliatePayload<ExtArgs>
        fields: Prisma.AffiliateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AffiliateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AffiliatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AffiliateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AffiliatePayload>
          }
          findFirst: {
            args: Prisma.AffiliateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AffiliatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AffiliateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AffiliatePayload>
          }
          findMany: {
            args: Prisma.AffiliateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AffiliatePayload>[]
          }
          create: {
            args: Prisma.AffiliateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AffiliatePayload>
          }
          createMany: {
            args: Prisma.AffiliateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AffiliateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AffiliatePayload>[]
          }
          delete: {
            args: Prisma.AffiliateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AffiliatePayload>
          }
          update: {
            args: Prisma.AffiliateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AffiliatePayload>
          }
          deleteMany: {
            args: Prisma.AffiliateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AffiliateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AffiliateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AffiliatePayload>[]
          }
          upsert: {
            args: Prisma.AffiliateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AffiliatePayload>
          }
          aggregate: {
            args: Prisma.AffiliateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAffiliate>
          }
          groupBy: {
            args: Prisma.AffiliateGroupByArgs<ExtArgs>
            result: $Utils.Optional<AffiliateGroupByOutputType>[]
          }
          count: {
            args: Prisma.AffiliateCountArgs<ExtArgs>
            result: $Utils.Optional<AffiliateCountAggregateOutputType> | number
          }
        }
      }
      ActivityLog: {
        payload: Prisma.$ActivityLogPayload<ExtArgs>
        fields: Prisma.ActivityLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ActivityLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ActivityLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          findFirst: {
            args: Prisma.ActivityLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ActivityLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          findMany: {
            args: Prisma.ActivityLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>[]
          }
          create: {
            args: Prisma.ActivityLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          createMany: {
            args: Prisma.ActivityLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ActivityLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>[]
          }
          delete: {
            args: Prisma.ActivityLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          update: {
            args: Prisma.ActivityLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          deleteMany: {
            args: Prisma.ActivityLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ActivityLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ActivityLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>[]
          }
          upsert: {
            args: Prisma.ActivityLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          aggregate: {
            args: Prisma.ActivityLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateActivityLog>
          }
          groupBy: {
            args: Prisma.ActivityLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ActivityLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.ActivityLogCountArgs<ExtArgs>
            result: $Utils.Optional<ActivityLogCountAggregateOutputType> | number
          }
        }
      }
      CostConfig: {
        payload: Prisma.$CostConfigPayload<ExtArgs>
        fields: Prisma.CostConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CostConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CostConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CostConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CostConfigPayload>
          }
          findFirst: {
            args: Prisma.CostConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CostConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CostConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CostConfigPayload>
          }
          findMany: {
            args: Prisma.CostConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CostConfigPayload>[]
          }
          create: {
            args: Prisma.CostConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CostConfigPayload>
          }
          createMany: {
            args: Prisma.CostConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CostConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CostConfigPayload>[]
          }
          delete: {
            args: Prisma.CostConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CostConfigPayload>
          }
          update: {
            args: Prisma.CostConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CostConfigPayload>
          }
          deleteMany: {
            args: Prisma.CostConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CostConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CostConfigUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CostConfigPayload>[]
          }
          upsert: {
            args: Prisma.CostConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CostConfigPayload>
          }
          aggregate: {
            args: Prisma.CostConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCostConfig>
          }
          groupBy: {
            args: Prisma.CostConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<CostConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.CostConfigCountArgs<ExtArgs>
            result: $Utils.Optional<CostConfigCountAggregateOutputType> | number
          }
        }
      }
      Delivery: {
        payload: Prisma.$DeliveryPayload<ExtArgs>
        fields: Prisma.DeliveryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DeliveryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DeliveryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPayload>
          }
          findFirst: {
            args: Prisma.DeliveryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DeliveryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPayload>
          }
          findMany: {
            args: Prisma.DeliveryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPayload>[]
          }
          create: {
            args: Prisma.DeliveryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPayload>
          }
          createMany: {
            args: Prisma.DeliveryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DeliveryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPayload>[]
          }
          delete: {
            args: Prisma.DeliveryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPayload>
          }
          update: {
            args: Prisma.DeliveryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPayload>
          }
          deleteMany: {
            args: Prisma.DeliveryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DeliveryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DeliveryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPayload>[]
          }
          upsert: {
            args: Prisma.DeliveryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryPayload>
          }
          aggregate: {
            args: Prisma.DeliveryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDelivery>
          }
          groupBy: {
            args: Prisma.DeliveryGroupByArgs<ExtArgs>
            result: $Utils.Optional<DeliveryGroupByOutputType>[]
          }
          count: {
            args: Prisma.DeliveryCountArgs<ExtArgs>
            result: $Utils.Optional<DeliveryCountAggregateOutputType> | number
          }
        }
      }
      Shift: {
        payload: Prisma.$ShiftPayload<ExtArgs>
        fields: Prisma.ShiftFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ShiftFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ShiftFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          findFirst: {
            args: Prisma.ShiftFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ShiftFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          findMany: {
            args: Prisma.ShiftFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>[]
          }
          create: {
            args: Prisma.ShiftCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          createMany: {
            args: Prisma.ShiftCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ShiftCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>[]
          }
          delete: {
            args: Prisma.ShiftDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          update: {
            args: Prisma.ShiftUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          deleteMany: {
            args: Prisma.ShiftDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ShiftUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ShiftUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>[]
          }
          upsert: {
            args: Prisma.ShiftUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          aggregate: {
            args: Prisma.ShiftAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateShift>
          }
          groupBy: {
            args: Prisma.ShiftGroupByArgs<ExtArgs>
            result: $Utils.Optional<ShiftGroupByOutputType>[]
          }
          count: {
            args: Prisma.ShiftCountArgs<ExtArgs>
            result: $Utils.Optional<ShiftCountAggregateOutputType> | number
          }
        }
      }
      Goal: {
        payload: Prisma.$GoalPayload<ExtArgs>
        fields: Prisma.GoalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GoalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GoalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>
          }
          findFirst: {
            args: Prisma.GoalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GoalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>
          }
          findMany: {
            args: Prisma.GoalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>[]
          }
          create: {
            args: Prisma.GoalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>
          }
          createMany: {
            args: Prisma.GoalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GoalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>[]
          }
          delete: {
            args: Prisma.GoalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>
          }
          update: {
            args: Prisma.GoalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>
          }
          deleteMany: {
            args: Prisma.GoalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GoalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GoalUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>[]
          }
          upsert: {
            args: Prisma.GoalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoalPayload>
          }
          aggregate: {
            args: Prisma.GoalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGoal>
          }
          groupBy: {
            args: Prisma.GoalGroupByArgs<ExtArgs>
            result: $Utils.Optional<GoalGroupByOutputType>[]
          }
          count: {
            args: Prisma.GoalCountArgs<ExtArgs>
            result: $Utils.Optional<GoalCountAggregateOutputType> | number
          }
        }
      }
      Route: {
        payload: Prisma.$RoutePayload<ExtArgs>
        fields: Prisma.RouteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RouteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RouteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>
          }
          findFirst: {
            args: Prisma.RouteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RouteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>
          }
          findMany: {
            args: Prisma.RouteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>[]
          }
          create: {
            args: Prisma.RouteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>
          }
          createMany: {
            args: Prisma.RouteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RouteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>[]
          }
          delete: {
            args: Prisma.RouteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>
          }
          update: {
            args: Prisma.RouteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>
          }
          deleteMany: {
            args: Prisma.RouteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RouteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RouteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>[]
          }
          upsert: {
            args: Prisma.RouteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>
          }
          aggregate: {
            args: Prisma.RouteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRoute>
          }
          groupBy: {
            args: Prisma.RouteGroupByArgs<ExtArgs>
            result: $Utils.Optional<RouteGroupByOutputType>[]
          }
          count: {
            args: Prisma.RouteCountArgs<ExtArgs>
            result: $Utils.Optional<RouteCountAggregateOutputType> | number
          }
        }
      }
      Payment: {
        payload: Prisma.$PaymentPayload<ExtArgs>
        fields: Prisma.PaymentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PaymentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PaymentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          findFirst: {
            args: Prisma.PaymentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PaymentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          findMany: {
            args: Prisma.PaymentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          create: {
            args: Prisma.PaymentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          createMany: {
            args: Prisma.PaymentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PaymentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          delete: {
            args: Prisma.PaymentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          update: {
            args: Prisma.PaymentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          deleteMany: {
            args: Prisma.PaymentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PaymentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PaymentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          upsert: {
            args: Prisma.PaymentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          aggregate: {
            args: Prisma.PaymentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePayment>
          }
          groupBy: {
            args: Prisma.PaymentGroupByArgs<ExtArgs>
            result: $Utils.Optional<PaymentGroupByOutputType>[]
          }
          count: {
            args: Prisma.PaymentCountArgs<ExtArgs>
            result: $Utils.Optional<PaymentCountAggregateOutputType> | number
          }
        }
      }
      WhatsAppMessage: {
        payload: Prisma.$WhatsAppMessagePayload<ExtArgs>
        fields: Prisma.WhatsAppMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WhatsAppMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WhatsAppMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>
          }
          findFirst: {
            args: Prisma.WhatsAppMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WhatsAppMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>
          }
          findMany: {
            args: Prisma.WhatsAppMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>[]
          }
          create: {
            args: Prisma.WhatsAppMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>
          }
          createMany: {
            args: Prisma.WhatsAppMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WhatsAppMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>[]
          }
          delete: {
            args: Prisma.WhatsAppMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>
          }
          update: {
            args: Prisma.WhatsAppMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>
          }
          deleteMany: {
            args: Prisma.WhatsAppMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WhatsAppMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WhatsAppMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>[]
          }
          upsert: {
            args: Prisma.WhatsAppMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>
          }
          aggregate: {
            args: Prisma.WhatsAppMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWhatsAppMessage>
          }
          groupBy: {
            args: Prisma.WhatsAppMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.WhatsAppMessageCountArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppMessageCountAggregateOutputType> | number
          }
        }
      }
      FuelRefuel: {
        payload: Prisma.$FuelRefuelPayload<ExtArgs>
        fields: Prisma.FuelRefuelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FuelRefuelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FuelRefuelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FuelRefuelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FuelRefuelPayload>
          }
          findFirst: {
            args: Prisma.FuelRefuelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FuelRefuelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FuelRefuelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FuelRefuelPayload>
          }
          findMany: {
            args: Prisma.FuelRefuelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FuelRefuelPayload>[]
          }
          create: {
            args: Prisma.FuelRefuelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FuelRefuelPayload>
          }
          createMany: {
            args: Prisma.FuelRefuelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FuelRefuelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FuelRefuelPayload>[]
          }
          delete: {
            args: Prisma.FuelRefuelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FuelRefuelPayload>
          }
          update: {
            args: Prisma.FuelRefuelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FuelRefuelPayload>
          }
          deleteMany: {
            args: Prisma.FuelRefuelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FuelRefuelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FuelRefuelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FuelRefuelPayload>[]
          }
          upsert: {
            args: Prisma.FuelRefuelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FuelRefuelPayload>
          }
          aggregate: {
            args: Prisma.FuelRefuelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFuelRefuel>
          }
          groupBy: {
            args: Prisma.FuelRefuelGroupByArgs<ExtArgs>
            result: $Utils.Optional<FuelRefuelGroupByOutputType>[]
          }
          count: {
            args: Prisma.FuelRefuelCountArgs<ExtArgs>
            result: $Utils.Optional<FuelRefuelCountAggregateOutputType> | number
          }
        }
      }
      OdometerReading: {
        payload: Prisma.$OdometerReadingPayload<ExtArgs>
        fields: Prisma.OdometerReadingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OdometerReadingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OdometerReadingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OdometerReadingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OdometerReadingPayload>
          }
          findFirst: {
            args: Prisma.OdometerReadingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OdometerReadingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OdometerReadingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OdometerReadingPayload>
          }
          findMany: {
            args: Prisma.OdometerReadingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OdometerReadingPayload>[]
          }
          create: {
            args: Prisma.OdometerReadingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OdometerReadingPayload>
          }
          createMany: {
            args: Prisma.OdometerReadingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OdometerReadingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OdometerReadingPayload>[]
          }
          delete: {
            args: Prisma.OdometerReadingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OdometerReadingPayload>
          }
          update: {
            args: Prisma.OdometerReadingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OdometerReadingPayload>
          }
          deleteMany: {
            args: Prisma.OdometerReadingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OdometerReadingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OdometerReadingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OdometerReadingPayload>[]
          }
          upsert: {
            args: Prisma.OdometerReadingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OdometerReadingPayload>
          }
          aggregate: {
            args: Prisma.OdometerReadingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOdometerReading>
          }
          groupBy: {
            args: Prisma.OdometerReadingGroupByArgs<ExtArgs>
            result: $Utils.Optional<OdometerReadingGroupByOutputType>[]
          }
          count: {
            args: Prisma.OdometerReadingCountArgs<ExtArgs>
            result: $Utils.Optional<OdometerReadingCountAggregateOutputType> | number
          }
        }
      }
      AuthCode: {
        payload: Prisma.$AuthCodePayload<ExtArgs>
        fields: Prisma.AuthCodeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuthCodeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuthCodeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>
          }
          findFirst: {
            args: Prisma.AuthCodeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuthCodeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>
          }
          findMany: {
            args: Prisma.AuthCodeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>[]
          }
          create: {
            args: Prisma.AuthCodeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>
          }
          createMany: {
            args: Prisma.AuthCodeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuthCodeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>[]
          }
          delete: {
            args: Prisma.AuthCodeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>
          }
          update: {
            args: Prisma.AuthCodeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>
          }
          deleteMany: {
            args: Prisma.AuthCodeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuthCodeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuthCodeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>[]
          }
          upsert: {
            args: Prisma.AuthCodeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>
          }
          aggregate: {
            args: Prisma.AuthCodeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuthCode>
          }
          groupBy: {
            args: Prisma.AuthCodeGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuthCodeGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuthCodeCountArgs<ExtArgs>
            result: $Utils.Optional<AuthCodeCountAggregateOutputType> | number
          }
        }
      }
      AdminAccount: {
        payload: Prisma.$AdminAccountPayload<ExtArgs>
        fields: Prisma.AdminAccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AdminAccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AdminAccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>
          }
          findFirst: {
            args: Prisma.AdminAccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AdminAccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>
          }
          findMany: {
            args: Prisma.AdminAccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>[]
          }
          create: {
            args: Prisma.AdminAccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>
          }
          createMany: {
            args: Prisma.AdminAccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AdminAccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>[]
          }
          delete: {
            args: Prisma.AdminAccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>
          }
          update: {
            args: Prisma.AdminAccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>
          }
          deleteMany: {
            args: Prisma.AdminAccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AdminAccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AdminAccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>[]
          }
          upsert: {
            args: Prisma.AdminAccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>
          }
          aggregate: {
            args: Prisma.AdminAccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdminAccount>
          }
          groupBy: {
            args: Prisma.AdminAccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AdminAccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AdminAccountCountArgs<ExtArgs>
            result: $Utils.Optional<AdminAccountCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    affiliate?: AffiliateOmit
    activityLog?: ActivityLogOmit
    costConfig?: CostConfigOmit
    delivery?: DeliveryOmit
    shift?: ShiftOmit
    goal?: GoalOmit
    route?: RouteOmit
    payment?: PaymentOmit
    whatsAppMessage?: WhatsAppMessageOmit
    fuelRefuel?: FuelRefuelOmit
    odometerReading?: OdometerReadingOmit
    authCode?: AuthCodeOmit
    adminAccount?: AdminAccountOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    deliveries: number
    shifts: number
    goals: number
    payments: number
    routes: number
    fuelRefuels: number
    odometerReadings: number
    activityLogs: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    deliveries?: boolean | UserCountOutputTypeCountDeliveriesArgs
    shifts?: boolean | UserCountOutputTypeCountShiftsArgs
    goals?: boolean | UserCountOutputTypeCountGoalsArgs
    payments?: boolean | UserCountOutputTypeCountPaymentsArgs
    routes?: boolean | UserCountOutputTypeCountRoutesArgs
    fuelRefuels?: boolean | UserCountOutputTypeCountFuelRefuelsArgs
    odometerReadings?: boolean | UserCountOutputTypeCountOdometerReadingsArgs
    activityLogs?: boolean | UserCountOutputTypeCountActivityLogsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDeliveriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeliveryWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountShiftsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShiftWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountGoalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GoalWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaymentWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountRoutesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RouteWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountFuelRefuelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FuelRefuelWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOdometerReadingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OdometerReadingWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountActivityLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivityLogWhereInput
  }


  /**
   * Count Type AffiliateCountOutputType
   */

  export type AffiliateCountOutputType = {
    referrals: number
  }

  export type AffiliateCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    referrals?: boolean | AffiliateCountOutputTypeCountReferralsArgs
  }

  // Custom InputTypes
  /**
   * AffiliateCountOutputType without action
   */
  export type AffiliateCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AffiliateCountOutputType
     */
    select?: AffiliateCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AffiliateCountOutputType without action
   */
  export type AffiliateCountOutputTypeCountReferralsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    currentOdometerKm: Decimal | null
  }

  export type UserSumAggregateOutputType = {
    currentOdometerKm: Decimal | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    whatsappNumber: string | null
    email: string | null
    name: string | null
    vehiclePlate: string | null
    city: string | null
    subscriptionPaymentMethod: string | null
    status: $Enums.UserStatus | null
    trialEndsAt: Date | null
    subscribedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    currentOdometerKm: Decimal | null
    referredByAffiliateId: string | null
    affiliateCouponCode: string | null
    referredAt: Date | null
    asaasCustomerId: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    whatsappNumber: string | null
    email: string | null
    name: string | null
    vehiclePlate: string | null
    city: string | null
    subscriptionPaymentMethod: string | null
    status: $Enums.UserStatus | null
    trialEndsAt: Date | null
    subscribedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    currentOdometerKm: Decimal | null
    referredByAffiliateId: string | null
    affiliateCouponCode: string | null
    referredAt: Date | null
    asaasCustomerId: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    whatsappNumber: number
    email: number
    name: number
    vehiclePlate: number
    city: number
    workApps: number
    subscriptionPaymentMethod: number
    workDays: number
    status: number
    trialEndsAt: number
    subscribedAt: number
    createdAt: number
    updatedAt: number
    currentOdometerKm: number
    referredByAffiliateId: number
    affiliateCouponCode: number
    referredAt: number
    asaasCustomerId: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    currentOdometerKm?: true
  }

  export type UserSumAggregateInputType = {
    currentOdometerKm?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    whatsappNumber?: true
    email?: true
    name?: true
    vehiclePlate?: true
    city?: true
    subscriptionPaymentMethod?: true
    status?: true
    trialEndsAt?: true
    subscribedAt?: true
    createdAt?: true
    updatedAt?: true
    currentOdometerKm?: true
    referredByAffiliateId?: true
    affiliateCouponCode?: true
    referredAt?: true
    asaasCustomerId?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    whatsappNumber?: true
    email?: true
    name?: true
    vehiclePlate?: true
    city?: true
    subscriptionPaymentMethod?: true
    status?: true
    trialEndsAt?: true
    subscribedAt?: true
    createdAt?: true
    updatedAt?: true
    currentOdometerKm?: true
    referredByAffiliateId?: true
    affiliateCouponCode?: true
    referredAt?: true
    asaasCustomerId?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    whatsappNumber?: true
    email?: true
    name?: true
    vehiclePlate?: true
    city?: true
    workApps?: true
    subscriptionPaymentMethod?: true
    workDays?: true
    status?: true
    trialEndsAt?: true
    subscribedAt?: true
    createdAt?: true
    updatedAt?: true
    currentOdometerKm?: true
    referredByAffiliateId?: true
    affiliateCouponCode?: true
    referredAt?: true
    asaasCustomerId?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    whatsappNumber: string
    email: string | null
    name: string | null
    vehiclePlate: string | null
    city: string | null
    workApps: JsonValue
    subscriptionPaymentMethod: string
    workDays: JsonValue
    status: $Enums.UserStatus
    trialEndsAt: Date | null
    subscribedAt: Date | null
    createdAt: Date
    updatedAt: Date
    currentOdometerKm: Decimal | null
    referredByAffiliateId: string | null
    affiliateCouponCode: string | null
    referredAt: Date | null
    asaasCustomerId: string | null
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    whatsappNumber?: boolean
    email?: boolean
    name?: boolean
    vehiclePlate?: boolean
    city?: boolean
    workApps?: boolean
    subscriptionPaymentMethod?: boolean
    workDays?: boolean
    status?: boolean
    trialEndsAt?: boolean
    subscribedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    currentOdometerKm?: boolean
    referredByAffiliateId?: boolean
    affiliateCouponCode?: boolean
    referredAt?: boolean
    asaasCustomerId?: boolean
    costs?: boolean | User$costsArgs<ExtArgs>
    deliveries?: boolean | User$deliveriesArgs<ExtArgs>
    shifts?: boolean | User$shiftsArgs<ExtArgs>
    goals?: boolean | User$goalsArgs<ExtArgs>
    payments?: boolean | User$paymentsArgs<ExtArgs>
    routes?: boolean | User$routesArgs<ExtArgs>
    fuelRefuels?: boolean | User$fuelRefuelsArgs<ExtArgs>
    odometerReadings?: boolean | User$odometerReadingsArgs<ExtArgs>
    activityLogs?: boolean | User$activityLogsArgs<ExtArgs>
    referredByAffiliate?: boolean | User$referredByAffiliateArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    whatsappNumber?: boolean
    email?: boolean
    name?: boolean
    vehiclePlate?: boolean
    city?: boolean
    workApps?: boolean
    subscriptionPaymentMethod?: boolean
    workDays?: boolean
    status?: boolean
    trialEndsAt?: boolean
    subscribedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    currentOdometerKm?: boolean
    referredByAffiliateId?: boolean
    affiliateCouponCode?: boolean
    referredAt?: boolean
    asaasCustomerId?: boolean
    referredByAffiliate?: boolean | User$referredByAffiliateArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    whatsappNumber?: boolean
    email?: boolean
    name?: boolean
    vehiclePlate?: boolean
    city?: boolean
    workApps?: boolean
    subscriptionPaymentMethod?: boolean
    workDays?: boolean
    status?: boolean
    trialEndsAt?: boolean
    subscribedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    currentOdometerKm?: boolean
    referredByAffiliateId?: boolean
    affiliateCouponCode?: boolean
    referredAt?: boolean
    asaasCustomerId?: boolean
    referredByAffiliate?: boolean | User$referredByAffiliateArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    whatsappNumber?: boolean
    email?: boolean
    name?: boolean
    vehiclePlate?: boolean
    city?: boolean
    workApps?: boolean
    subscriptionPaymentMethod?: boolean
    workDays?: boolean
    status?: boolean
    trialEndsAt?: boolean
    subscribedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    currentOdometerKm?: boolean
    referredByAffiliateId?: boolean
    affiliateCouponCode?: boolean
    referredAt?: boolean
    asaasCustomerId?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "whatsappNumber" | "email" | "name" | "vehiclePlate" | "city" | "workApps" | "subscriptionPaymentMethod" | "workDays" | "status" | "trialEndsAt" | "subscribedAt" | "createdAt" | "updatedAt" | "currentOdometerKm" | "referredByAffiliateId" | "affiliateCouponCode" | "referredAt" | "asaasCustomerId", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    costs?: boolean | User$costsArgs<ExtArgs>
    deliveries?: boolean | User$deliveriesArgs<ExtArgs>
    shifts?: boolean | User$shiftsArgs<ExtArgs>
    goals?: boolean | User$goalsArgs<ExtArgs>
    payments?: boolean | User$paymentsArgs<ExtArgs>
    routes?: boolean | User$routesArgs<ExtArgs>
    fuelRefuels?: boolean | User$fuelRefuelsArgs<ExtArgs>
    odometerReadings?: boolean | User$odometerReadingsArgs<ExtArgs>
    activityLogs?: boolean | User$activityLogsArgs<ExtArgs>
    referredByAffiliate?: boolean | User$referredByAffiliateArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    referredByAffiliate?: boolean | User$referredByAffiliateArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    referredByAffiliate?: boolean | User$referredByAffiliateArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      costs: Prisma.$CostConfigPayload<ExtArgs> | null
      deliveries: Prisma.$DeliveryPayload<ExtArgs>[]
      shifts: Prisma.$ShiftPayload<ExtArgs>[]
      goals: Prisma.$GoalPayload<ExtArgs>[]
      payments: Prisma.$PaymentPayload<ExtArgs>[]
      routes: Prisma.$RoutePayload<ExtArgs>[]
      fuelRefuels: Prisma.$FuelRefuelPayload<ExtArgs>[]
      odometerReadings: Prisma.$OdometerReadingPayload<ExtArgs>[]
      activityLogs: Prisma.$ActivityLogPayload<ExtArgs>[]
      referredByAffiliate: Prisma.$AffiliatePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      whatsappNumber: string
      email: string | null
      name: string | null
      vehiclePlate: string | null
      city: string | null
      workApps: Prisma.JsonValue
      subscriptionPaymentMethod: string
      workDays: Prisma.JsonValue
      status: $Enums.UserStatus
      trialEndsAt: Date | null
      subscribedAt: Date | null
      createdAt: Date
      updatedAt: Date
      currentOdometerKm: Prisma.Decimal | null
      referredByAffiliateId: string | null
      affiliateCouponCode: string | null
      referredAt: Date | null
      asaasCustomerId: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    costs<T extends User$costsArgs<ExtArgs> = {}>(args?: Subset<T, User$costsArgs<ExtArgs>>): Prisma__CostConfigClient<$Result.GetResult<Prisma.$CostConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    deliveries<T extends User$deliveriesArgs<ExtArgs> = {}>(args?: Subset<T, User$deliveriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeliveryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    shifts<T extends User$shiftsArgs<ExtArgs> = {}>(args?: Subset<T, User$shiftsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    goals<T extends User$goalsArgs<ExtArgs> = {}>(args?: Subset<T, User$goalsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    payments<T extends User$paymentsArgs<ExtArgs> = {}>(args?: Subset<T, User$paymentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    routes<T extends User$routesArgs<ExtArgs> = {}>(args?: Subset<T, User$routesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    fuelRefuels<T extends User$fuelRefuelsArgs<ExtArgs> = {}>(args?: Subset<T, User$fuelRefuelsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FuelRefuelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    odometerReadings<T extends User$odometerReadingsArgs<ExtArgs> = {}>(args?: Subset<T, User$odometerReadingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OdometerReadingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    activityLogs<T extends User$activityLogsArgs<ExtArgs> = {}>(args?: Subset<T, User$activityLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    referredByAffiliate<T extends User$referredByAffiliateArgs<ExtArgs> = {}>(args?: Subset<T, User$referredByAffiliateArgs<ExtArgs>>): Prisma__AffiliateClient<$Result.GetResult<Prisma.$AffiliatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly whatsappNumber: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly vehiclePlate: FieldRef<"User", 'String'>
    readonly city: FieldRef<"User", 'String'>
    readonly workApps: FieldRef<"User", 'Json'>
    readonly subscriptionPaymentMethod: FieldRef<"User", 'String'>
    readonly workDays: FieldRef<"User", 'Json'>
    readonly status: FieldRef<"User", 'UserStatus'>
    readonly trialEndsAt: FieldRef<"User", 'DateTime'>
    readonly subscribedAt: FieldRef<"User", 'DateTime'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly currentOdometerKm: FieldRef<"User", 'Decimal'>
    readonly referredByAffiliateId: FieldRef<"User", 'String'>
    readonly affiliateCouponCode: FieldRef<"User", 'String'>
    readonly referredAt: FieldRef<"User", 'DateTime'>
    readonly asaasCustomerId: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.costs
   */
  export type User$costsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigInclude<ExtArgs> | null
    where?: CostConfigWhereInput
  }

  /**
   * User.deliveries
   */
  export type User$deliveriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryInclude<ExtArgs> | null
    where?: DeliveryWhereInput
    orderBy?: DeliveryOrderByWithRelationInput | DeliveryOrderByWithRelationInput[]
    cursor?: DeliveryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DeliveryScalarFieldEnum | DeliveryScalarFieldEnum[]
  }

  /**
   * User.shifts
   */
  export type User$shiftsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    where?: ShiftWhereInput
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    cursor?: ShiftWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShiftScalarFieldEnum | ShiftScalarFieldEnum[]
  }

  /**
   * User.goals
   */
  export type User$goalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    where?: GoalWhereInput
    orderBy?: GoalOrderByWithRelationInput | GoalOrderByWithRelationInput[]
    cursor?: GoalWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GoalScalarFieldEnum | GoalScalarFieldEnum[]
  }

  /**
   * User.payments
   */
  export type User$paymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    where?: PaymentWhereInput
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    cursor?: PaymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * User.routes
   */
  export type User$routesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    where?: RouteWhereInput
    orderBy?: RouteOrderByWithRelationInput | RouteOrderByWithRelationInput[]
    cursor?: RouteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RouteScalarFieldEnum | RouteScalarFieldEnum[]
  }

  /**
   * User.fuelRefuels
   */
  export type User$fuelRefuelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelInclude<ExtArgs> | null
    where?: FuelRefuelWhereInput
    orderBy?: FuelRefuelOrderByWithRelationInput | FuelRefuelOrderByWithRelationInput[]
    cursor?: FuelRefuelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FuelRefuelScalarFieldEnum | FuelRefuelScalarFieldEnum[]
  }

  /**
   * User.odometerReadings
   */
  export type User$odometerReadingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingInclude<ExtArgs> | null
    where?: OdometerReadingWhereInput
    orderBy?: OdometerReadingOrderByWithRelationInput | OdometerReadingOrderByWithRelationInput[]
    cursor?: OdometerReadingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OdometerReadingScalarFieldEnum | OdometerReadingScalarFieldEnum[]
  }

  /**
   * User.activityLogs
   */
  export type User$activityLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    where?: ActivityLogWhereInput
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    cursor?: ActivityLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ActivityLogScalarFieldEnum | ActivityLogScalarFieldEnum[]
  }

  /**
   * User.referredByAffiliate
   */
  export type User$referredByAffiliateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AffiliateInclude<ExtArgs> | null
    where?: AffiliateWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Affiliate
   */

  export type AggregateAffiliate = {
    _count: AffiliateCountAggregateOutputType | null
    _min: AffiliateMinAggregateOutputType | null
    _max: AffiliateMaxAggregateOutputType | null
  }

  export type AffiliateMinAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    active: boolean | null
    phone: string | null
    email: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AffiliateMaxAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    active: boolean | null
    phone: string | null
    email: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AffiliateCountAggregateOutputType = {
    id: number
    name: number
    code: number
    active: number
    phone: number
    email: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AffiliateMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    active?: true
    phone?: true
    email?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AffiliateMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    active?: true
    phone?: true
    email?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AffiliateCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    active?: true
    phone?: true
    email?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AffiliateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Affiliate to aggregate.
     */
    where?: AffiliateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Affiliates to fetch.
     */
    orderBy?: AffiliateOrderByWithRelationInput | AffiliateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AffiliateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Affiliates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Affiliates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Affiliates
    **/
    _count?: true | AffiliateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AffiliateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AffiliateMaxAggregateInputType
  }

  export type GetAffiliateAggregateType<T extends AffiliateAggregateArgs> = {
        [P in keyof T & keyof AggregateAffiliate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAffiliate[P]>
      : GetScalarType<T[P], AggregateAffiliate[P]>
  }




  export type AffiliateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AffiliateWhereInput
    orderBy?: AffiliateOrderByWithAggregationInput | AffiliateOrderByWithAggregationInput[]
    by: AffiliateScalarFieldEnum[] | AffiliateScalarFieldEnum
    having?: AffiliateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AffiliateCountAggregateInputType | true
    _min?: AffiliateMinAggregateInputType
    _max?: AffiliateMaxAggregateInputType
  }

  export type AffiliateGroupByOutputType = {
    id: string
    name: string
    code: string
    active: boolean
    phone: string | null
    email: string | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: AffiliateCountAggregateOutputType | null
    _min: AffiliateMinAggregateOutputType | null
    _max: AffiliateMaxAggregateOutputType | null
  }

  type GetAffiliateGroupByPayload<T extends AffiliateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AffiliateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AffiliateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AffiliateGroupByOutputType[P]>
            : GetScalarType<T[P], AffiliateGroupByOutputType[P]>
        }
      >
    >


  export type AffiliateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    active?: boolean
    phone?: boolean
    email?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    referrals?: boolean | Affiliate$referralsArgs<ExtArgs>
    _count?: boolean | AffiliateCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["affiliate"]>

  export type AffiliateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    active?: boolean
    phone?: boolean
    email?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["affiliate"]>

  export type AffiliateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    active?: boolean
    phone?: boolean
    email?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["affiliate"]>

  export type AffiliateSelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    active?: boolean
    phone?: boolean
    email?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AffiliateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "code" | "active" | "phone" | "email" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["affiliate"]>
  export type AffiliateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    referrals?: boolean | Affiliate$referralsArgs<ExtArgs>
    _count?: boolean | AffiliateCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AffiliateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AffiliateIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AffiliatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Affiliate"
    objects: {
      referrals: Prisma.$UserPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      code: string
      active: boolean
      phone: string | null
      email: string | null
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["affiliate"]>
    composites: {}
  }

  type AffiliateGetPayload<S extends boolean | null | undefined | AffiliateDefaultArgs> = $Result.GetResult<Prisma.$AffiliatePayload, S>

  type AffiliateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AffiliateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AffiliateCountAggregateInputType | true
    }

  export interface AffiliateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Affiliate'], meta: { name: 'Affiliate' } }
    /**
     * Find zero or one Affiliate that matches the filter.
     * @param {AffiliateFindUniqueArgs} args - Arguments to find a Affiliate
     * @example
     * // Get one Affiliate
     * const affiliate = await prisma.affiliate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AffiliateFindUniqueArgs>(args: SelectSubset<T, AffiliateFindUniqueArgs<ExtArgs>>): Prisma__AffiliateClient<$Result.GetResult<Prisma.$AffiliatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Affiliate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AffiliateFindUniqueOrThrowArgs} args - Arguments to find a Affiliate
     * @example
     * // Get one Affiliate
     * const affiliate = await prisma.affiliate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AffiliateFindUniqueOrThrowArgs>(args: SelectSubset<T, AffiliateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AffiliateClient<$Result.GetResult<Prisma.$AffiliatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Affiliate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AffiliateFindFirstArgs} args - Arguments to find a Affiliate
     * @example
     * // Get one Affiliate
     * const affiliate = await prisma.affiliate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AffiliateFindFirstArgs>(args?: SelectSubset<T, AffiliateFindFirstArgs<ExtArgs>>): Prisma__AffiliateClient<$Result.GetResult<Prisma.$AffiliatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Affiliate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AffiliateFindFirstOrThrowArgs} args - Arguments to find a Affiliate
     * @example
     * // Get one Affiliate
     * const affiliate = await prisma.affiliate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AffiliateFindFirstOrThrowArgs>(args?: SelectSubset<T, AffiliateFindFirstOrThrowArgs<ExtArgs>>): Prisma__AffiliateClient<$Result.GetResult<Prisma.$AffiliatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Affiliates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AffiliateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Affiliates
     * const affiliates = await prisma.affiliate.findMany()
     * 
     * // Get first 10 Affiliates
     * const affiliates = await prisma.affiliate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const affiliateWithIdOnly = await prisma.affiliate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AffiliateFindManyArgs>(args?: SelectSubset<T, AffiliateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AffiliatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Affiliate.
     * @param {AffiliateCreateArgs} args - Arguments to create a Affiliate.
     * @example
     * // Create one Affiliate
     * const Affiliate = await prisma.affiliate.create({
     *   data: {
     *     // ... data to create a Affiliate
     *   }
     * })
     * 
     */
    create<T extends AffiliateCreateArgs>(args: SelectSubset<T, AffiliateCreateArgs<ExtArgs>>): Prisma__AffiliateClient<$Result.GetResult<Prisma.$AffiliatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Affiliates.
     * @param {AffiliateCreateManyArgs} args - Arguments to create many Affiliates.
     * @example
     * // Create many Affiliates
     * const affiliate = await prisma.affiliate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AffiliateCreateManyArgs>(args?: SelectSubset<T, AffiliateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Affiliates and returns the data saved in the database.
     * @param {AffiliateCreateManyAndReturnArgs} args - Arguments to create many Affiliates.
     * @example
     * // Create many Affiliates
     * const affiliate = await prisma.affiliate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Affiliates and only return the `id`
     * const affiliateWithIdOnly = await prisma.affiliate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AffiliateCreateManyAndReturnArgs>(args?: SelectSubset<T, AffiliateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AffiliatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Affiliate.
     * @param {AffiliateDeleteArgs} args - Arguments to delete one Affiliate.
     * @example
     * // Delete one Affiliate
     * const Affiliate = await prisma.affiliate.delete({
     *   where: {
     *     // ... filter to delete one Affiliate
     *   }
     * })
     * 
     */
    delete<T extends AffiliateDeleteArgs>(args: SelectSubset<T, AffiliateDeleteArgs<ExtArgs>>): Prisma__AffiliateClient<$Result.GetResult<Prisma.$AffiliatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Affiliate.
     * @param {AffiliateUpdateArgs} args - Arguments to update one Affiliate.
     * @example
     * // Update one Affiliate
     * const affiliate = await prisma.affiliate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AffiliateUpdateArgs>(args: SelectSubset<T, AffiliateUpdateArgs<ExtArgs>>): Prisma__AffiliateClient<$Result.GetResult<Prisma.$AffiliatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Affiliates.
     * @param {AffiliateDeleteManyArgs} args - Arguments to filter Affiliates to delete.
     * @example
     * // Delete a few Affiliates
     * const { count } = await prisma.affiliate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AffiliateDeleteManyArgs>(args?: SelectSubset<T, AffiliateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Affiliates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AffiliateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Affiliates
     * const affiliate = await prisma.affiliate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AffiliateUpdateManyArgs>(args: SelectSubset<T, AffiliateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Affiliates and returns the data updated in the database.
     * @param {AffiliateUpdateManyAndReturnArgs} args - Arguments to update many Affiliates.
     * @example
     * // Update many Affiliates
     * const affiliate = await prisma.affiliate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Affiliates and only return the `id`
     * const affiliateWithIdOnly = await prisma.affiliate.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AffiliateUpdateManyAndReturnArgs>(args: SelectSubset<T, AffiliateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AffiliatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Affiliate.
     * @param {AffiliateUpsertArgs} args - Arguments to update or create a Affiliate.
     * @example
     * // Update or create a Affiliate
     * const affiliate = await prisma.affiliate.upsert({
     *   create: {
     *     // ... data to create a Affiliate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Affiliate we want to update
     *   }
     * })
     */
    upsert<T extends AffiliateUpsertArgs>(args: SelectSubset<T, AffiliateUpsertArgs<ExtArgs>>): Prisma__AffiliateClient<$Result.GetResult<Prisma.$AffiliatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Affiliates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AffiliateCountArgs} args - Arguments to filter Affiliates to count.
     * @example
     * // Count the number of Affiliates
     * const count = await prisma.affiliate.count({
     *   where: {
     *     // ... the filter for the Affiliates we want to count
     *   }
     * })
    **/
    count<T extends AffiliateCountArgs>(
      args?: Subset<T, AffiliateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AffiliateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Affiliate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AffiliateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AffiliateAggregateArgs>(args: Subset<T, AffiliateAggregateArgs>): Prisma.PrismaPromise<GetAffiliateAggregateType<T>>

    /**
     * Group by Affiliate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AffiliateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AffiliateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AffiliateGroupByArgs['orderBy'] }
        : { orderBy?: AffiliateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AffiliateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAffiliateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Affiliate model
   */
  readonly fields: AffiliateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Affiliate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AffiliateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    referrals<T extends Affiliate$referralsArgs<ExtArgs> = {}>(args?: Subset<T, Affiliate$referralsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Affiliate model
   */
  interface AffiliateFieldRefs {
    readonly id: FieldRef<"Affiliate", 'String'>
    readonly name: FieldRef<"Affiliate", 'String'>
    readonly code: FieldRef<"Affiliate", 'String'>
    readonly active: FieldRef<"Affiliate", 'Boolean'>
    readonly phone: FieldRef<"Affiliate", 'String'>
    readonly email: FieldRef<"Affiliate", 'String'>
    readonly notes: FieldRef<"Affiliate", 'String'>
    readonly createdAt: FieldRef<"Affiliate", 'DateTime'>
    readonly updatedAt: FieldRef<"Affiliate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Affiliate findUnique
   */
  export type AffiliateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AffiliateInclude<ExtArgs> | null
    /**
     * Filter, which Affiliate to fetch.
     */
    where: AffiliateWhereUniqueInput
  }

  /**
   * Affiliate findUniqueOrThrow
   */
  export type AffiliateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AffiliateInclude<ExtArgs> | null
    /**
     * Filter, which Affiliate to fetch.
     */
    where: AffiliateWhereUniqueInput
  }

  /**
   * Affiliate findFirst
   */
  export type AffiliateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AffiliateInclude<ExtArgs> | null
    /**
     * Filter, which Affiliate to fetch.
     */
    where?: AffiliateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Affiliates to fetch.
     */
    orderBy?: AffiliateOrderByWithRelationInput | AffiliateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Affiliates.
     */
    cursor?: AffiliateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Affiliates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Affiliates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Affiliates.
     */
    distinct?: AffiliateScalarFieldEnum | AffiliateScalarFieldEnum[]
  }

  /**
   * Affiliate findFirstOrThrow
   */
  export type AffiliateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AffiliateInclude<ExtArgs> | null
    /**
     * Filter, which Affiliate to fetch.
     */
    where?: AffiliateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Affiliates to fetch.
     */
    orderBy?: AffiliateOrderByWithRelationInput | AffiliateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Affiliates.
     */
    cursor?: AffiliateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Affiliates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Affiliates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Affiliates.
     */
    distinct?: AffiliateScalarFieldEnum | AffiliateScalarFieldEnum[]
  }

  /**
   * Affiliate findMany
   */
  export type AffiliateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AffiliateInclude<ExtArgs> | null
    /**
     * Filter, which Affiliates to fetch.
     */
    where?: AffiliateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Affiliates to fetch.
     */
    orderBy?: AffiliateOrderByWithRelationInput | AffiliateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Affiliates.
     */
    cursor?: AffiliateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Affiliates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Affiliates.
     */
    skip?: number
    distinct?: AffiliateScalarFieldEnum | AffiliateScalarFieldEnum[]
  }

  /**
   * Affiliate create
   */
  export type AffiliateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AffiliateInclude<ExtArgs> | null
    /**
     * The data needed to create a Affiliate.
     */
    data: XOR<AffiliateCreateInput, AffiliateUncheckedCreateInput>
  }

  /**
   * Affiliate createMany
   */
  export type AffiliateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Affiliates.
     */
    data: AffiliateCreateManyInput | AffiliateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Affiliate createManyAndReturn
   */
  export type AffiliateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * The data used to create many Affiliates.
     */
    data: AffiliateCreateManyInput | AffiliateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Affiliate update
   */
  export type AffiliateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AffiliateInclude<ExtArgs> | null
    /**
     * The data needed to update a Affiliate.
     */
    data: XOR<AffiliateUpdateInput, AffiliateUncheckedUpdateInput>
    /**
     * Choose, which Affiliate to update.
     */
    where: AffiliateWhereUniqueInput
  }

  /**
   * Affiliate updateMany
   */
  export type AffiliateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Affiliates.
     */
    data: XOR<AffiliateUpdateManyMutationInput, AffiliateUncheckedUpdateManyInput>
    /**
     * Filter which Affiliates to update
     */
    where?: AffiliateWhereInput
    /**
     * Limit how many Affiliates to update.
     */
    limit?: number
  }

  /**
   * Affiliate updateManyAndReturn
   */
  export type AffiliateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * The data used to update Affiliates.
     */
    data: XOR<AffiliateUpdateManyMutationInput, AffiliateUncheckedUpdateManyInput>
    /**
     * Filter which Affiliates to update
     */
    where?: AffiliateWhereInput
    /**
     * Limit how many Affiliates to update.
     */
    limit?: number
  }

  /**
   * Affiliate upsert
   */
  export type AffiliateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AffiliateInclude<ExtArgs> | null
    /**
     * The filter to search for the Affiliate to update in case it exists.
     */
    where: AffiliateWhereUniqueInput
    /**
     * In case the Affiliate found by the `where` argument doesn't exist, create a new Affiliate with this data.
     */
    create: XOR<AffiliateCreateInput, AffiliateUncheckedCreateInput>
    /**
     * In case the Affiliate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AffiliateUpdateInput, AffiliateUncheckedUpdateInput>
  }

  /**
   * Affiliate delete
   */
  export type AffiliateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AffiliateInclude<ExtArgs> | null
    /**
     * Filter which Affiliate to delete.
     */
    where: AffiliateWhereUniqueInput
  }

  /**
   * Affiliate deleteMany
   */
  export type AffiliateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Affiliates to delete
     */
    where?: AffiliateWhereInput
    /**
     * Limit how many Affiliates to delete.
     */
    limit?: number
  }

  /**
   * Affiliate.referrals
   */
  export type Affiliate$referralsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Affiliate without action
   */
  export type AffiliateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Affiliate
     */
    select?: AffiliateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Affiliate
     */
    omit?: AffiliateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AffiliateInclude<ExtArgs> | null
  }


  /**
   * Model ActivityLog
   */

  export type AggregateActivityLog = {
    _count: ActivityLogCountAggregateOutputType | null
    _min: ActivityLogMinAggregateOutputType | null
    _max: ActivityLogMaxAggregateOutputType | null
  }

  export type ActivityLogMinAggregateOutputType = {
    id: string | null
    userId: string | null
    category: $Enums.ActivityCategory | null
    action: $Enums.ActivityAction | null
    title: string | null
    entityId: string | null
    source: string | null
    createdAt: Date | null
  }

  export type ActivityLogMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    category: $Enums.ActivityCategory | null
    action: $Enums.ActivityAction | null
    title: string | null
    entityId: string | null
    source: string | null
    createdAt: Date | null
  }

  export type ActivityLogCountAggregateOutputType = {
    id: number
    userId: number
    category: number
    action: number
    title: number
    changes: number
    entityId: number
    source: number
    createdAt: number
    _all: number
  }


  export type ActivityLogMinAggregateInputType = {
    id?: true
    userId?: true
    category?: true
    action?: true
    title?: true
    entityId?: true
    source?: true
    createdAt?: true
  }

  export type ActivityLogMaxAggregateInputType = {
    id?: true
    userId?: true
    category?: true
    action?: true
    title?: true
    entityId?: true
    source?: true
    createdAt?: true
  }

  export type ActivityLogCountAggregateInputType = {
    id?: true
    userId?: true
    category?: true
    action?: true
    title?: true
    changes?: true
    entityId?: true
    source?: true
    createdAt?: true
    _all?: true
  }

  export type ActivityLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivityLog to aggregate.
     */
    where?: ActivityLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityLogs to fetch.
     */
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ActivityLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ActivityLogs
    **/
    _count?: true | ActivityLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ActivityLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ActivityLogMaxAggregateInputType
  }

  export type GetActivityLogAggregateType<T extends ActivityLogAggregateArgs> = {
        [P in keyof T & keyof AggregateActivityLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateActivityLog[P]>
      : GetScalarType<T[P], AggregateActivityLog[P]>
  }




  export type ActivityLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivityLogWhereInput
    orderBy?: ActivityLogOrderByWithAggregationInput | ActivityLogOrderByWithAggregationInput[]
    by: ActivityLogScalarFieldEnum[] | ActivityLogScalarFieldEnum
    having?: ActivityLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ActivityLogCountAggregateInputType | true
    _min?: ActivityLogMinAggregateInputType
    _max?: ActivityLogMaxAggregateInputType
  }

  export type ActivityLogGroupByOutputType = {
    id: string
    userId: string
    category: $Enums.ActivityCategory
    action: $Enums.ActivityAction
    title: string
    changes: JsonValue
    entityId: string | null
    source: string
    createdAt: Date
    _count: ActivityLogCountAggregateOutputType | null
    _min: ActivityLogMinAggregateOutputType | null
    _max: ActivityLogMaxAggregateOutputType | null
  }

  type GetActivityLogGroupByPayload<T extends ActivityLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ActivityLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ActivityLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ActivityLogGroupByOutputType[P]>
            : GetScalarType<T[P], ActivityLogGroupByOutputType[P]>
        }
      >
    >


  export type ActivityLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    category?: boolean
    action?: boolean
    title?: boolean
    changes?: boolean
    entityId?: boolean
    source?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activityLog"]>

  export type ActivityLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    category?: boolean
    action?: boolean
    title?: boolean
    changes?: boolean
    entityId?: boolean
    source?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activityLog"]>

  export type ActivityLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    category?: boolean
    action?: boolean
    title?: boolean
    changes?: boolean
    entityId?: boolean
    source?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activityLog"]>

  export type ActivityLogSelectScalar = {
    id?: boolean
    userId?: boolean
    category?: boolean
    action?: boolean
    title?: boolean
    changes?: boolean
    entityId?: boolean
    source?: boolean
    createdAt?: boolean
  }

  export type ActivityLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "category" | "action" | "title" | "changes" | "entityId" | "source" | "createdAt", ExtArgs["result"]["activityLog"]>
  export type ActivityLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ActivityLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ActivityLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ActivityLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ActivityLog"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      category: $Enums.ActivityCategory
      action: $Enums.ActivityAction
      title: string
      changes: Prisma.JsonValue
      entityId: string | null
      source: string
      createdAt: Date
    }, ExtArgs["result"]["activityLog"]>
    composites: {}
  }

  type ActivityLogGetPayload<S extends boolean | null | undefined | ActivityLogDefaultArgs> = $Result.GetResult<Prisma.$ActivityLogPayload, S>

  type ActivityLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ActivityLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ActivityLogCountAggregateInputType | true
    }

  export interface ActivityLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ActivityLog'], meta: { name: 'ActivityLog' } }
    /**
     * Find zero or one ActivityLog that matches the filter.
     * @param {ActivityLogFindUniqueArgs} args - Arguments to find a ActivityLog
     * @example
     * // Get one ActivityLog
     * const activityLog = await prisma.activityLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ActivityLogFindUniqueArgs>(args: SelectSubset<T, ActivityLogFindUniqueArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ActivityLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ActivityLogFindUniqueOrThrowArgs} args - Arguments to find a ActivityLog
     * @example
     * // Get one ActivityLog
     * const activityLog = await prisma.activityLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ActivityLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ActivityLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivityLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogFindFirstArgs} args - Arguments to find a ActivityLog
     * @example
     * // Get one ActivityLog
     * const activityLog = await prisma.activityLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ActivityLogFindFirstArgs>(args?: SelectSubset<T, ActivityLogFindFirstArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivityLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogFindFirstOrThrowArgs} args - Arguments to find a ActivityLog
     * @example
     * // Get one ActivityLog
     * const activityLog = await prisma.activityLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ActivityLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ActivityLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ActivityLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ActivityLogs
     * const activityLogs = await prisma.activityLog.findMany()
     * 
     * // Get first 10 ActivityLogs
     * const activityLogs = await prisma.activityLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const activityLogWithIdOnly = await prisma.activityLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ActivityLogFindManyArgs>(args?: SelectSubset<T, ActivityLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ActivityLog.
     * @param {ActivityLogCreateArgs} args - Arguments to create a ActivityLog.
     * @example
     * // Create one ActivityLog
     * const ActivityLog = await prisma.activityLog.create({
     *   data: {
     *     // ... data to create a ActivityLog
     *   }
     * })
     * 
     */
    create<T extends ActivityLogCreateArgs>(args: SelectSubset<T, ActivityLogCreateArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ActivityLogs.
     * @param {ActivityLogCreateManyArgs} args - Arguments to create many ActivityLogs.
     * @example
     * // Create many ActivityLogs
     * const activityLog = await prisma.activityLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ActivityLogCreateManyArgs>(args?: SelectSubset<T, ActivityLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ActivityLogs and returns the data saved in the database.
     * @param {ActivityLogCreateManyAndReturnArgs} args - Arguments to create many ActivityLogs.
     * @example
     * // Create many ActivityLogs
     * const activityLog = await prisma.activityLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ActivityLogs and only return the `id`
     * const activityLogWithIdOnly = await prisma.activityLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ActivityLogCreateManyAndReturnArgs>(args?: SelectSubset<T, ActivityLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ActivityLog.
     * @param {ActivityLogDeleteArgs} args - Arguments to delete one ActivityLog.
     * @example
     * // Delete one ActivityLog
     * const ActivityLog = await prisma.activityLog.delete({
     *   where: {
     *     // ... filter to delete one ActivityLog
     *   }
     * })
     * 
     */
    delete<T extends ActivityLogDeleteArgs>(args: SelectSubset<T, ActivityLogDeleteArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ActivityLog.
     * @param {ActivityLogUpdateArgs} args - Arguments to update one ActivityLog.
     * @example
     * // Update one ActivityLog
     * const activityLog = await prisma.activityLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ActivityLogUpdateArgs>(args: SelectSubset<T, ActivityLogUpdateArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ActivityLogs.
     * @param {ActivityLogDeleteManyArgs} args - Arguments to filter ActivityLogs to delete.
     * @example
     * // Delete a few ActivityLogs
     * const { count } = await prisma.activityLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ActivityLogDeleteManyArgs>(args?: SelectSubset<T, ActivityLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivityLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ActivityLogs
     * const activityLog = await prisma.activityLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ActivityLogUpdateManyArgs>(args: SelectSubset<T, ActivityLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivityLogs and returns the data updated in the database.
     * @param {ActivityLogUpdateManyAndReturnArgs} args - Arguments to update many ActivityLogs.
     * @example
     * // Update many ActivityLogs
     * const activityLog = await prisma.activityLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ActivityLogs and only return the `id`
     * const activityLogWithIdOnly = await prisma.activityLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ActivityLogUpdateManyAndReturnArgs>(args: SelectSubset<T, ActivityLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ActivityLog.
     * @param {ActivityLogUpsertArgs} args - Arguments to update or create a ActivityLog.
     * @example
     * // Update or create a ActivityLog
     * const activityLog = await prisma.activityLog.upsert({
     *   create: {
     *     // ... data to create a ActivityLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ActivityLog we want to update
     *   }
     * })
     */
    upsert<T extends ActivityLogUpsertArgs>(args: SelectSubset<T, ActivityLogUpsertArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ActivityLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogCountArgs} args - Arguments to filter ActivityLogs to count.
     * @example
     * // Count the number of ActivityLogs
     * const count = await prisma.activityLog.count({
     *   where: {
     *     // ... the filter for the ActivityLogs we want to count
     *   }
     * })
    **/
    count<T extends ActivityLogCountArgs>(
      args?: Subset<T, ActivityLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ActivityLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ActivityLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ActivityLogAggregateArgs>(args: Subset<T, ActivityLogAggregateArgs>): Prisma.PrismaPromise<GetActivityLogAggregateType<T>>

    /**
     * Group by ActivityLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ActivityLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ActivityLogGroupByArgs['orderBy'] }
        : { orderBy?: ActivityLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ActivityLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetActivityLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ActivityLog model
   */
  readonly fields: ActivityLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ActivityLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ActivityLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ActivityLog model
   */
  interface ActivityLogFieldRefs {
    readonly id: FieldRef<"ActivityLog", 'String'>
    readonly userId: FieldRef<"ActivityLog", 'String'>
    readonly category: FieldRef<"ActivityLog", 'ActivityCategory'>
    readonly action: FieldRef<"ActivityLog", 'ActivityAction'>
    readonly title: FieldRef<"ActivityLog", 'String'>
    readonly changes: FieldRef<"ActivityLog", 'Json'>
    readonly entityId: FieldRef<"ActivityLog", 'String'>
    readonly source: FieldRef<"ActivityLog", 'String'>
    readonly createdAt: FieldRef<"ActivityLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ActivityLog findUnique
   */
  export type ActivityLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * Filter, which ActivityLog to fetch.
     */
    where: ActivityLogWhereUniqueInput
  }

  /**
   * ActivityLog findUniqueOrThrow
   */
  export type ActivityLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * Filter, which ActivityLog to fetch.
     */
    where: ActivityLogWhereUniqueInput
  }

  /**
   * ActivityLog findFirst
   */
  export type ActivityLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * Filter, which ActivityLog to fetch.
     */
    where?: ActivityLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityLogs to fetch.
     */
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivityLogs.
     */
    cursor?: ActivityLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivityLogs.
     */
    distinct?: ActivityLogScalarFieldEnum | ActivityLogScalarFieldEnum[]
  }

  /**
   * ActivityLog findFirstOrThrow
   */
  export type ActivityLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * Filter, which ActivityLog to fetch.
     */
    where?: ActivityLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityLogs to fetch.
     */
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivityLogs.
     */
    cursor?: ActivityLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivityLogs.
     */
    distinct?: ActivityLogScalarFieldEnum | ActivityLogScalarFieldEnum[]
  }

  /**
   * ActivityLog findMany
   */
  export type ActivityLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * Filter, which ActivityLogs to fetch.
     */
    where?: ActivityLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityLogs to fetch.
     */
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ActivityLogs.
     */
    cursor?: ActivityLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityLogs.
     */
    skip?: number
    distinct?: ActivityLogScalarFieldEnum | ActivityLogScalarFieldEnum[]
  }

  /**
   * ActivityLog create
   */
  export type ActivityLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * The data needed to create a ActivityLog.
     */
    data: XOR<ActivityLogCreateInput, ActivityLogUncheckedCreateInput>
  }

  /**
   * ActivityLog createMany
   */
  export type ActivityLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ActivityLogs.
     */
    data: ActivityLogCreateManyInput | ActivityLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ActivityLog createManyAndReturn
   */
  export type ActivityLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * The data used to create many ActivityLogs.
     */
    data: ActivityLogCreateManyInput | ActivityLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ActivityLog update
   */
  export type ActivityLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * The data needed to update a ActivityLog.
     */
    data: XOR<ActivityLogUpdateInput, ActivityLogUncheckedUpdateInput>
    /**
     * Choose, which ActivityLog to update.
     */
    where: ActivityLogWhereUniqueInput
  }

  /**
   * ActivityLog updateMany
   */
  export type ActivityLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ActivityLogs.
     */
    data: XOR<ActivityLogUpdateManyMutationInput, ActivityLogUncheckedUpdateManyInput>
    /**
     * Filter which ActivityLogs to update
     */
    where?: ActivityLogWhereInput
    /**
     * Limit how many ActivityLogs to update.
     */
    limit?: number
  }

  /**
   * ActivityLog updateManyAndReturn
   */
  export type ActivityLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * The data used to update ActivityLogs.
     */
    data: XOR<ActivityLogUpdateManyMutationInput, ActivityLogUncheckedUpdateManyInput>
    /**
     * Filter which ActivityLogs to update
     */
    where?: ActivityLogWhereInput
    /**
     * Limit how many ActivityLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ActivityLog upsert
   */
  export type ActivityLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * The filter to search for the ActivityLog to update in case it exists.
     */
    where: ActivityLogWhereUniqueInput
    /**
     * In case the ActivityLog found by the `where` argument doesn't exist, create a new ActivityLog with this data.
     */
    create: XOR<ActivityLogCreateInput, ActivityLogUncheckedCreateInput>
    /**
     * In case the ActivityLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ActivityLogUpdateInput, ActivityLogUncheckedUpdateInput>
  }

  /**
   * ActivityLog delete
   */
  export type ActivityLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * Filter which ActivityLog to delete.
     */
    where: ActivityLogWhereUniqueInput
  }

  /**
   * ActivityLog deleteMany
   */
  export type ActivityLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivityLogs to delete
     */
    where?: ActivityLogWhereInput
    /**
     * Limit how many ActivityLogs to delete.
     */
    limit?: number
  }

  /**
   * ActivityLog without action
   */
  export type ActivityLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
  }


  /**
   * Model CostConfig
   */

  export type AggregateCostConfig = {
    _count: CostConfigCountAggregateOutputType | null
    _avg: CostConfigAvgAggregateOutputType | null
    _sum: CostConfigSumAggregateOutputType | null
    _min: CostConfigMinAggregateOutputType | null
    _max: CostConfigMaxAggregateOutputType | null
  }

  export type CostConfigAvgAggregateOutputType = {
    fuelPricePerLiter: Decimal | null
    kmPerLiter: Decimal | null
    maintenancePerKm: Decimal | null
    dailyFoodCost: Decimal | null
    otherDailyCost: Decimal | null
  }

  export type CostConfigSumAggregateOutputType = {
    fuelPricePerLiter: Decimal | null
    kmPerLiter: Decimal | null
    maintenancePerKm: Decimal | null
    dailyFoodCost: Decimal | null
    otherDailyCost: Decimal | null
  }

  export type CostConfigMinAggregateOutputType = {
    id: string | null
    userId: string | null
    fuelPricePerLiter: Decimal | null
    kmPerLiter: Decimal | null
    maintenancePerKm: Decimal | null
    dailyFoodCost: Decimal | null
    otherDailyCost: Decimal | null
    updatedAt: Date | null
  }

  export type CostConfigMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    fuelPricePerLiter: Decimal | null
    kmPerLiter: Decimal | null
    maintenancePerKm: Decimal | null
    dailyFoodCost: Decimal | null
    otherDailyCost: Decimal | null
    updatedAt: Date | null
  }

  export type CostConfigCountAggregateOutputType = {
    id: number
    userId: number
    fuelPricePerLiter: number
    kmPerLiter: number
    maintenancePerKm: number
    dailyFoodCost: number
    otherDailyCost: number
    updatedAt: number
    _all: number
  }


  export type CostConfigAvgAggregateInputType = {
    fuelPricePerLiter?: true
    kmPerLiter?: true
    maintenancePerKm?: true
    dailyFoodCost?: true
    otherDailyCost?: true
  }

  export type CostConfigSumAggregateInputType = {
    fuelPricePerLiter?: true
    kmPerLiter?: true
    maintenancePerKm?: true
    dailyFoodCost?: true
    otherDailyCost?: true
  }

  export type CostConfigMinAggregateInputType = {
    id?: true
    userId?: true
    fuelPricePerLiter?: true
    kmPerLiter?: true
    maintenancePerKm?: true
    dailyFoodCost?: true
    otherDailyCost?: true
    updatedAt?: true
  }

  export type CostConfigMaxAggregateInputType = {
    id?: true
    userId?: true
    fuelPricePerLiter?: true
    kmPerLiter?: true
    maintenancePerKm?: true
    dailyFoodCost?: true
    otherDailyCost?: true
    updatedAt?: true
  }

  export type CostConfigCountAggregateInputType = {
    id?: true
    userId?: true
    fuelPricePerLiter?: true
    kmPerLiter?: true
    maintenancePerKm?: true
    dailyFoodCost?: true
    otherDailyCost?: true
    updatedAt?: true
    _all?: true
  }

  export type CostConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CostConfig to aggregate.
     */
    where?: CostConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CostConfigs to fetch.
     */
    orderBy?: CostConfigOrderByWithRelationInput | CostConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CostConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CostConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CostConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CostConfigs
    **/
    _count?: true | CostConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CostConfigAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CostConfigSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CostConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CostConfigMaxAggregateInputType
  }

  export type GetCostConfigAggregateType<T extends CostConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateCostConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCostConfig[P]>
      : GetScalarType<T[P], AggregateCostConfig[P]>
  }




  export type CostConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CostConfigWhereInput
    orderBy?: CostConfigOrderByWithAggregationInput | CostConfigOrderByWithAggregationInput[]
    by: CostConfigScalarFieldEnum[] | CostConfigScalarFieldEnum
    having?: CostConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CostConfigCountAggregateInputType | true
    _avg?: CostConfigAvgAggregateInputType
    _sum?: CostConfigSumAggregateInputType
    _min?: CostConfigMinAggregateInputType
    _max?: CostConfigMaxAggregateInputType
  }

  export type CostConfigGroupByOutputType = {
    id: string
    userId: string
    fuelPricePerLiter: Decimal
    kmPerLiter: Decimal
    maintenancePerKm: Decimal
    dailyFoodCost: Decimal
    otherDailyCost: Decimal
    updatedAt: Date
    _count: CostConfigCountAggregateOutputType | null
    _avg: CostConfigAvgAggregateOutputType | null
    _sum: CostConfigSumAggregateOutputType | null
    _min: CostConfigMinAggregateOutputType | null
    _max: CostConfigMaxAggregateOutputType | null
  }

  type GetCostConfigGroupByPayload<T extends CostConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CostConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CostConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CostConfigGroupByOutputType[P]>
            : GetScalarType<T[P], CostConfigGroupByOutputType[P]>
        }
      >
    >


  export type CostConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    fuelPricePerLiter?: boolean
    kmPerLiter?: boolean
    maintenancePerKm?: boolean
    dailyFoodCost?: boolean
    otherDailyCost?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["costConfig"]>

  export type CostConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    fuelPricePerLiter?: boolean
    kmPerLiter?: boolean
    maintenancePerKm?: boolean
    dailyFoodCost?: boolean
    otherDailyCost?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["costConfig"]>

  export type CostConfigSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    fuelPricePerLiter?: boolean
    kmPerLiter?: boolean
    maintenancePerKm?: boolean
    dailyFoodCost?: boolean
    otherDailyCost?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["costConfig"]>

  export type CostConfigSelectScalar = {
    id?: boolean
    userId?: boolean
    fuelPricePerLiter?: boolean
    kmPerLiter?: boolean
    maintenancePerKm?: boolean
    dailyFoodCost?: boolean
    otherDailyCost?: boolean
    updatedAt?: boolean
  }

  export type CostConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "fuelPricePerLiter" | "kmPerLiter" | "maintenancePerKm" | "dailyFoodCost" | "otherDailyCost" | "updatedAt", ExtArgs["result"]["costConfig"]>
  export type CostConfigInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CostConfigIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CostConfigIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $CostConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CostConfig"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      fuelPricePerLiter: Prisma.Decimal
      kmPerLiter: Prisma.Decimal
      maintenancePerKm: Prisma.Decimal
      dailyFoodCost: Prisma.Decimal
      otherDailyCost: Prisma.Decimal
      updatedAt: Date
    }, ExtArgs["result"]["costConfig"]>
    composites: {}
  }

  type CostConfigGetPayload<S extends boolean | null | undefined | CostConfigDefaultArgs> = $Result.GetResult<Prisma.$CostConfigPayload, S>

  type CostConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CostConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CostConfigCountAggregateInputType | true
    }

  export interface CostConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CostConfig'], meta: { name: 'CostConfig' } }
    /**
     * Find zero or one CostConfig that matches the filter.
     * @param {CostConfigFindUniqueArgs} args - Arguments to find a CostConfig
     * @example
     * // Get one CostConfig
     * const costConfig = await prisma.costConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CostConfigFindUniqueArgs>(args: SelectSubset<T, CostConfigFindUniqueArgs<ExtArgs>>): Prisma__CostConfigClient<$Result.GetResult<Prisma.$CostConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CostConfig that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CostConfigFindUniqueOrThrowArgs} args - Arguments to find a CostConfig
     * @example
     * // Get one CostConfig
     * const costConfig = await prisma.costConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CostConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, CostConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CostConfigClient<$Result.GetResult<Prisma.$CostConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CostConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostConfigFindFirstArgs} args - Arguments to find a CostConfig
     * @example
     * // Get one CostConfig
     * const costConfig = await prisma.costConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CostConfigFindFirstArgs>(args?: SelectSubset<T, CostConfigFindFirstArgs<ExtArgs>>): Prisma__CostConfigClient<$Result.GetResult<Prisma.$CostConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CostConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostConfigFindFirstOrThrowArgs} args - Arguments to find a CostConfig
     * @example
     * // Get one CostConfig
     * const costConfig = await prisma.costConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CostConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, CostConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__CostConfigClient<$Result.GetResult<Prisma.$CostConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CostConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CostConfigs
     * const costConfigs = await prisma.costConfig.findMany()
     * 
     * // Get first 10 CostConfigs
     * const costConfigs = await prisma.costConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const costConfigWithIdOnly = await prisma.costConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CostConfigFindManyArgs>(args?: SelectSubset<T, CostConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CostConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CostConfig.
     * @param {CostConfigCreateArgs} args - Arguments to create a CostConfig.
     * @example
     * // Create one CostConfig
     * const CostConfig = await prisma.costConfig.create({
     *   data: {
     *     // ... data to create a CostConfig
     *   }
     * })
     * 
     */
    create<T extends CostConfigCreateArgs>(args: SelectSubset<T, CostConfigCreateArgs<ExtArgs>>): Prisma__CostConfigClient<$Result.GetResult<Prisma.$CostConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CostConfigs.
     * @param {CostConfigCreateManyArgs} args - Arguments to create many CostConfigs.
     * @example
     * // Create many CostConfigs
     * const costConfig = await prisma.costConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CostConfigCreateManyArgs>(args?: SelectSubset<T, CostConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CostConfigs and returns the data saved in the database.
     * @param {CostConfigCreateManyAndReturnArgs} args - Arguments to create many CostConfigs.
     * @example
     * // Create many CostConfigs
     * const costConfig = await prisma.costConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CostConfigs and only return the `id`
     * const costConfigWithIdOnly = await prisma.costConfig.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CostConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, CostConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CostConfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CostConfig.
     * @param {CostConfigDeleteArgs} args - Arguments to delete one CostConfig.
     * @example
     * // Delete one CostConfig
     * const CostConfig = await prisma.costConfig.delete({
     *   where: {
     *     // ... filter to delete one CostConfig
     *   }
     * })
     * 
     */
    delete<T extends CostConfigDeleteArgs>(args: SelectSubset<T, CostConfigDeleteArgs<ExtArgs>>): Prisma__CostConfigClient<$Result.GetResult<Prisma.$CostConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CostConfig.
     * @param {CostConfigUpdateArgs} args - Arguments to update one CostConfig.
     * @example
     * // Update one CostConfig
     * const costConfig = await prisma.costConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CostConfigUpdateArgs>(args: SelectSubset<T, CostConfigUpdateArgs<ExtArgs>>): Prisma__CostConfigClient<$Result.GetResult<Prisma.$CostConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CostConfigs.
     * @param {CostConfigDeleteManyArgs} args - Arguments to filter CostConfigs to delete.
     * @example
     * // Delete a few CostConfigs
     * const { count } = await prisma.costConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CostConfigDeleteManyArgs>(args?: SelectSubset<T, CostConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CostConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CostConfigs
     * const costConfig = await prisma.costConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CostConfigUpdateManyArgs>(args: SelectSubset<T, CostConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CostConfigs and returns the data updated in the database.
     * @param {CostConfigUpdateManyAndReturnArgs} args - Arguments to update many CostConfigs.
     * @example
     * // Update many CostConfigs
     * const costConfig = await prisma.costConfig.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CostConfigs and only return the `id`
     * const costConfigWithIdOnly = await prisma.costConfig.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CostConfigUpdateManyAndReturnArgs>(args: SelectSubset<T, CostConfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CostConfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CostConfig.
     * @param {CostConfigUpsertArgs} args - Arguments to update or create a CostConfig.
     * @example
     * // Update or create a CostConfig
     * const costConfig = await prisma.costConfig.upsert({
     *   create: {
     *     // ... data to create a CostConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CostConfig we want to update
     *   }
     * })
     */
    upsert<T extends CostConfigUpsertArgs>(args: SelectSubset<T, CostConfigUpsertArgs<ExtArgs>>): Prisma__CostConfigClient<$Result.GetResult<Prisma.$CostConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CostConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostConfigCountArgs} args - Arguments to filter CostConfigs to count.
     * @example
     * // Count the number of CostConfigs
     * const count = await prisma.costConfig.count({
     *   where: {
     *     // ... the filter for the CostConfigs we want to count
     *   }
     * })
    **/
    count<T extends CostConfigCountArgs>(
      args?: Subset<T, CostConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CostConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CostConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CostConfigAggregateArgs>(args: Subset<T, CostConfigAggregateArgs>): Prisma.PrismaPromise<GetCostConfigAggregateType<T>>

    /**
     * Group by CostConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CostConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CostConfigGroupByArgs['orderBy'] }
        : { orderBy?: CostConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CostConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCostConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CostConfig model
   */
  readonly fields: CostConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CostConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CostConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CostConfig model
   */
  interface CostConfigFieldRefs {
    readonly id: FieldRef<"CostConfig", 'String'>
    readonly userId: FieldRef<"CostConfig", 'String'>
    readonly fuelPricePerLiter: FieldRef<"CostConfig", 'Decimal'>
    readonly kmPerLiter: FieldRef<"CostConfig", 'Decimal'>
    readonly maintenancePerKm: FieldRef<"CostConfig", 'Decimal'>
    readonly dailyFoodCost: FieldRef<"CostConfig", 'Decimal'>
    readonly otherDailyCost: FieldRef<"CostConfig", 'Decimal'>
    readonly updatedAt: FieldRef<"CostConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CostConfig findUnique
   */
  export type CostConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigInclude<ExtArgs> | null
    /**
     * Filter, which CostConfig to fetch.
     */
    where: CostConfigWhereUniqueInput
  }

  /**
   * CostConfig findUniqueOrThrow
   */
  export type CostConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigInclude<ExtArgs> | null
    /**
     * Filter, which CostConfig to fetch.
     */
    where: CostConfigWhereUniqueInput
  }

  /**
   * CostConfig findFirst
   */
  export type CostConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigInclude<ExtArgs> | null
    /**
     * Filter, which CostConfig to fetch.
     */
    where?: CostConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CostConfigs to fetch.
     */
    orderBy?: CostConfigOrderByWithRelationInput | CostConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CostConfigs.
     */
    cursor?: CostConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CostConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CostConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CostConfigs.
     */
    distinct?: CostConfigScalarFieldEnum | CostConfigScalarFieldEnum[]
  }

  /**
   * CostConfig findFirstOrThrow
   */
  export type CostConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigInclude<ExtArgs> | null
    /**
     * Filter, which CostConfig to fetch.
     */
    where?: CostConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CostConfigs to fetch.
     */
    orderBy?: CostConfigOrderByWithRelationInput | CostConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CostConfigs.
     */
    cursor?: CostConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CostConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CostConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CostConfigs.
     */
    distinct?: CostConfigScalarFieldEnum | CostConfigScalarFieldEnum[]
  }

  /**
   * CostConfig findMany
   */
  export type CostConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigInclude<ExtArgs> | null
    /**
     * Filter, which CostConfigs to fetch.
     */
    where?: CostConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CostConfigs to fetch.
     */
    orderBy?: CostConfigOrderByWithRelationInput | CostConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CostConfigs.
     */
    cursor?: CostConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CostConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CostConfigs.
     */
    skip?: number
    distinct?: CostConfigScalarFieldEnum | CostConfigScalarFieldEnum[]
  }

  /**
   * CostConfig create
   */
  export type CostConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigInclude<ExtArgs> | null
    /**
     * The data needed to create a CostConfig.
     */
    data: XOR<CostConfigCreateInput, CostConfigUncheckedCreateInput>
  }

  /**
   * CostConfig createMany
   */
  export type CostConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CostConfigs.
     */
    data: CostConfigCreateManyInput | CostConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CostConfig createManyAndReturn
   */
  export type CostConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * The data used to create many CostConfigs.
     */
    data: CostConfigCreateManyInput | CostConfigCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CostConfig update
   */
  export type CostConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigInclude<ExtArgs> | null
    /**
     * The data needed to update a CostConfig.
     */
    data: XOR<CostConfigUpdateInput, CostConfigUncheckedUpdateInput>
    /**
     * Choose, which CostConfig to update.
     */
    where: CostConfigWhereUniqueInput
  }

  /**
   * CostConfig updateMany
   */
  export type CostConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CostConfigs.
     */
    data: XOR<CostConfigUpdateManyMutationInput, CostConfigUncheckedUpdateManyInput>
    /**
     * Filter which CostConfigs to update
     */
    where?: CostConfigWhereInput
    /**
     * Limit how many CostConfigs to update.
     */
    limit?: number
  }

  /**
   * CostConfig updateManyAndReturn
   */
  export type CostConfigUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * The data used to update CostConfigs.
     */
    data: XOR<CostConfigUpdateManyMutationInput, CostConfigUncheckedUpdateManyInput>
    /**
     * Filter which CostConfigs to update
     */
    where?: CostConfigWhereInput
    /**
     * Limit how many CostConfigs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CostConfig upsert
   */
  export type CostConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigInclude<ExtArgs> | null
    /**
     * The filter to search for the CostConfig to update in case it exists.
     */
    where: CostConfigWhereUniqueInput
    /**
     * In case the CostConfig found by the `where` argument doesn't exist, create a new CostConfig with this data.
     */
    create: XOR<CostConfigCreateInput, CostConfigUncheckedCreateInput>
    /**
     * In case the CostConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CostConfigUpdateInput, CostConfigUncheckedUpdateInput>
  }

  /**
   * CostConfig delete
   */
  export type CostConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigInclude<ExtArgs> | null
    /**
     * Filter which CostConfig to delete.
     */
    where: CostConfigWhereUniqueInput
  }

  /**
   * CostConfig deleteMany
   */
  export type CostConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CostConfigs to delete
     */
    where?: CostConfigWhereInput
    /**
     * Limit how many CostConfigs to delete.
     */
    limit?: number
  }

  /**
   * CostConfig without action
   */
  export type CostConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CostConfig
     */
    select?: CostConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CostConfig
     */
    omit?: CostConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostConfigInclude<ExtArgs> | null
  }


  /**
   * Model Delivery
   */

  export type AggregateDelivery = {
    _count: DeliveryCountAggregateOutputType | null
    _avg: DeliveryAvgAggregateOutputType | null
    _sum: DeliverySumAggregateOutputType | null
    _min: DeliveryMinAggregateOutputType | null
    _max: DeliveryMaxAggregateOutputType | null
  }

  export type DeliveryAvgAggregateOutputType = {
    grossValue: Decimal | null
    distanceKm: Decimal | null
    durationMin: number | null
    destinationLat: number | null
    destinationLng: number | null
    proofLat: number | null
    proofLng: number | null
  }

  export type DeliverySumAggregateOutputType = {
    grossValue: Decimal | null
    distanceKm: Decimal | null
    durationMin: number | null
    destinationLat: number | null
    destinationLng: number | null
    proofLat: number | null
    proofLng: number | null
  }

  export type DeliveryMinAggregateOutputType = {
    id: string | null
    userId: string | null
    source: $Enums.DeliverySource | null
    grossValue: Decimal | null
    distanceKm: Decimal | null
    durationMin: number | null
    originName: string | null
    destinationAddr: string | null
    destinationLat: number | null
    destinationLng: number | null
    proofPhotoUrl: string | null
    proofLat: number | null
    proofLng: number | null
    proofAt: Date | null
    parsedAt: Date | null
    occurredAt: Date | null
  }

  export type DeliveryMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    source: $Enums.DeliverySource | null
    grossValue: Decimal | null
    distanceKm: Decimal | null
    durationMin: number | null
    originName: string | null
    destinationAddr: string | null
    destinationLat: number | null
    destinationLng: number | null
    proofPhotoUrl: string | null
    proofLat: number | null
    proofLng: number | null
    proofAt: Date | null
    parsedAt: Date | null
    occurredAt: Date | null
  }

  export type DeliveryCountAggregateOutputType = {
    id: number
    userId: number
    source: number
    grossValue: number
    distanceKm: number
    durationMin: number
    originName: number
    destinationAddr: number
    destinationLat: number
    destinationLng: number
    proofPhotoUrl: number
    proofLat: number
    proofLng: number
    proofAt: number
    rawInput: number
    parsedAt: number
    occurredAt: number
    _all: number
  }


  export type DeliveryAvgAggregateInputType = {
    grossValue?: true
    distanceKm?: true
    durationMin?: true
    destinationLat?: true
    destinationLng?: true
    proofLat?: true
    proofLng?: true
  }

  export type DeliverySumAggregateInputType = {
    grossValue?: true
    distanceKm?: true
    durationMin?: true
    destinationLat?: true
    destinationLng?: true
    proofLat?: true
    proofLng?: true
  }

  export type DeliveryMinAggregateInputType = {
    id?: true
    userId?: true
    source?: true
    grossValue?: true
    distanceKm?: true
    durationMin?: true
    originName?: true
    destinationAddr?: true
    destinationLat?: true
    destinationLng?: true
    proofPhotoUrl?: true
    proofLat?: true
    proofLng?: true
    proofAt?: true
    parsedAt?: true
    occurredAt?: true
  }

  export type DeliveryMaxAggregateInputType = {
    id?: true
    userId?: true
    source?: true
    grossValue?: true
    distanceKm?: true
    durationMin?: true
    originName?: true
    destinationAddr?: true
    destinationLat?: true
    destinationLng?: true
    proofPhotoUrl?: true
    proofLat?: true
    proofLng?: true
    proofAt?: true
    parsedAt?: true
    occurredAt?: true
  }

  export type DeliveryCountAggregateInputType = {
    id?: true
    userId?: true
    source?: true
    grossValue?: true
    distanceKm?: true
    durationMin?: true
    originName?: true
    destinationAddr?: true
    destinationLat?: true
    destinationLng?: true
    proofPhotoUrl?: true
    proofLat?: true
    proofLng?: true
    proofAt?: true
    rawInput?: true
    parsedAt?: true
    occurredAt?: true
    _all?: true
  }

  export type DeliveryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Delivery to aggregate.
     */
    where?: DeliveryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Deliveries to fetch.
     */
    orderBy?: DeliveryOrderByWithRelationInput | DeliveryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DeliveryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Deliveries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Deliveries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Deliveries
    **/
    _count?: true | DeliveryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DeliveryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DeliverySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DeliveryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DeliveryMaxAggregateInputType
  }

  export type GetDeliveryAggregateType<T extends DeliveryAggregateArgs> = {
        [P in keyof T & keyof AggregateDelivery]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDelivery[P]>
      : GetScalarType<T[P], AggregateDelivery[P]>
  }




  export type DeliveryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeliveryWhereInput
    orderBy?: DeliveryOrderByWithAggregationInput | DeliveryOrderByWithAggregationInput[]
    by: DeliveryScalarFieldEnum[] | DeliveryScalarFieldEnum
    having?: DeliveryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeliveryCountAggregateInputType | true
    _avg?: DeliveryAvgAggregateInputType
    _sum?: DeliverySumAggregateInputType
    _min?: DeliveryMinAggregateInputType
    _max?: DeliveryMaxAggregateInputType
  }

  export type DeliveryGroupByOutputType = {
    id: string
    userId: string
    source: $Enums.DeliverySource
    grossValue: Decimal
    distanceKm: Decimal | null
    durationMin: number | null
    originName: string | null
    destinationAddr: string | null
    destinationLat: number | null
    destinationLng: number | null
    proofPhotoUrl: string | null
    proofLat: number | null
    proofLng: number | null
    proofAt: Date | null
    rawInput: JsonValue
    parsedAt: Date
    occurredAt: Date
    _count: DeliveryCountAggregateOutputType | null
    _avg: DeliveryAvgAggregateOutputType | null
    _sum: DeliverySumAggregateOutputType | null
    _min: DeliveryMinAggregateOutputType | null
    _max: DeliveryMaxAggregateOutputType | null
  }

  type GetDeliveryGroupByPayload<T extends DeliveryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeliveryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeliveryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeliveryGroupByOutputType[P]>
            : GetScalarType<T[P], DeliveryGroupByOutputType[P]>
        }
      >
    >


  export type DeliverySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    source?: boolean
    grossValue?: boolean
    distanceKm?: boolean
    durationMin?: boolean
    originName?: boolean
    destinationAddr?: boolean
    destinationLat?: boolean
    destinationLng?: boolean
    proofPhotoUrl?: boolean
    proofLat?: boolean
    proofLng?: boolean
    proofAt?: boolean
    rawInput?: boolean
    parsedAt?: boolean
    occurredAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["delivery"]>

  export type DeliverySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    source?: boolean
    grossValue?: boolean
    distanceKm?: boolean
    durationMin?: boolean
    originName?: boolean
    destinationAddr?: boolean
    destinationLat?: boolean
    destinationLng?: boolean
    proofPhotoUrl?: boolean
    proofLat?: boolean
    proofLng?: boolean
    proofAt?: boolean
    rawInput?: boolean
    parsedAt?: boolean
    occurredAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["delivery"]>

  export type DeliverySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    source?: boolean
    grossValue?: boolean
    distanceKm?: boolean
    durationMin?: boolean
    originName?: boolean
    destinationAddr?: boolean
    destinationLat?: boolean
    destinationLng?: boolean
    proofPhotoUrl?: boolean
    proofLat?: boolean
    proofLng?: boolean
    proofAt?: boolean
    rawInput?: boolean
    parsedAt?: boolean
    occurredAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["delivery"]>

  export type DeliverySelectScalar = {
    id?: boolean
    userId?: boolean
    source?: boolean
    grossValue?: boolean
    distanceKm?: boolean
    durationMin?: boolean
    originName?: boolean
    destinationAddr?: boolean
    destinationLat?: boolean
    destinationLng?: boolean
    proofPhotoUrl?: boolean
    proofLat?: boolean
    proofLng?: boolean
    proofAt?: boolean
    rawInput?: boolean
    parsedAt?: boolean
    occurredAt?: boolean
  }

  export type DeliveryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "source" | "grossValue" | "distanceKm" | "durationMin" | "originName" | "destinationAddr" | "destinationLat" | "destinationLng" | "proofPhotoUrl" | "proofLat" | "proofLng" | "proofAt" | "rawInput" | "parsedAt" | "occurredAt", ExtArgs["result"]["delivery"]>
  export type DeliveryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type DeliveryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type DeliveryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $DeliveryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Delivery"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      source: $Enums.DeliverySource
      grossValue: Prisma.Decimal
      distanceKm: Prisma.Decimal | null
      durationMin: number | null
      originName: string | null
      destinationAddr: string | null
      destinationLat: number | null
      destinationLng: number | null
      proofPhotoUrl: string | null
      proofLat: number | null
      proofLng: number | null
      proofAt: Date | null
      rawInput: Prisma.JsonValue
      parsedAt: Date
      occurredAt: Date
    }, ExtArgs["result"]["delivery"]>
    composites: {}
  }

  type DeliveryGetPayload<S extends boolean | null | undefined | DeliveryDefaultArgs> = $Result.GetResult<Prisma.$DeliveryPayload, S>

  type DeliveryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DeliveryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DeliveryCountAggregateInputType | true
    }

  export interface DeliveryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Delivery'], meta: { name: 'Delivery' } }
    /**
     * Find zero or one Delivery that matches the filter.
     * @param {DeliveryFindUniqueArgs} args - Arguments to find a Delivery
     * @example
     * // Get one Delivery
     * const delivery = await prisma.delivery.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeliveryFindUniqueArgs>(args: SelectSubset<T, DeliveryFindUniqueArgs<ExtArgs>>): Prisma__DeliveryClient<$Result.GetResult<Prisma.$DeliveryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Delivery that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DeliveryFindUniqueOrThrowArgs} args - Arguments to find a Delivery
     * @example
     * // Get one Delivery
     * const delivery = await prisma.delivery.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeliveryFindUniqueOrThrowArgs>(args: SelectSubset<T, DeliveryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DeliveryClient<$Result.GetResult<Prisma.$DeliveryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Delivery that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryFindFirstArgs} args - Arguments to find a Delivery
     * @example
     * // Get one Delivery
     * const delivery = await prisma.delivery.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeliveryFindFirstArgs>(args?: SelectSubset<T, DeliveryFindFirstArgs<ExtArgs>>): Prisma__DeliveryClient<$Result.GetResult<Prisma.$DeliveryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Delivery that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryFindFirstOrThrowArgs} args - Arguments to find a Delivery
     * @example
     * // Get one Delivery
     * const delivery = await prisma.delivery.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeliveryFindFirstOrThrowArgs>(args?: SelectSubset<T, DeliveryFindFirstOrThrowArgs<ExtArgs>>): Prisma__DeliveryClient<$Result.GetResult<Prisma.$DeliveryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Deliveries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Deliveries
     * const deliveries = await prisma.delivery.findMany()
     * 
     * // Get first 10 Deliveries
     * const deliveries = await prisma.delivery.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const deliveryWithIdOnly = await prisma.delivery.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DeliveryFindManyArgs>(args?: SelectSubset<T, DeliveryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeliveryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Delivery.
     * @param {DeliveryCreateArgs} args - Arguments to create a Delivery.
     * @example
     * // Create one Delivery
     * const Delivery = await prisma.delivery.create({
     *   data: {
     *     // ... data to create a Delivery
     *   }
     * })
     * 
     */
    create<T extends DeliveryCreateArgs>(args: SelectSubset<T, DeliveryCreateArgs<ExtArgs>>): Prisma__DeliveryClient<$Result.GetResult<Prisma.$DeliveryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Deliveries.
     * @param {DeliveryCreateManyArgs} args - Arguments to create many Deliveries.
     * @example
     * // Create many Deliveries
     * const delivery = await prisma.delivery.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DeliveryCreateManyArgs>(args?: SelectSubset<T, DeliveryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Deliveries and returns the data saved in the database.
     * @param {DeliveryCreateManyAndReturnArgs} args - Arguments to create many Deliveries.
     * @example
     * // Create many Deliveries
     * const delivery = await prisma.delivery.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Deliveries and only return the `id`
     * const deliveryWithIdOnly = await prisma.delivery.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DeliveryCreateManyAndReturnArgs>(args?: SelectSubset<T, DeliveryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeliveryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Delivery.
     * @param {DeliveryDeleteArgs} args - Arguments to delete one Delivery.
     * @example
     * // Delete one Delivery
     * const Delivery = await prisma.delivery.delete({
     *   where: {
     *     // ... filter to delete one Delivery
     *   }
     * })
     * 
     */
    delete<T extends DeliveryDeleteArgs>(args: SelectSubset<T, DeliveryDeleteArgs<ExtArgs>>): Prisma__DeliveryClient<$Result.GetResult<Prisma.$DeliveryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Delivery.
     * @param {DeliveryUpdateArgs} args - Arguments to update one Delivery.
     * @example
     * // Update one Delivery
     * const delivery = await prisma.delivery.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DeliveryUpdateArgs>(args: SelectSubset<T, DeliveryUpdateArgs<ExtArgs>>): Prisma__DeliveryClient<$Result.GetResult<Prisma.$DeliveryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Deliveries.
     * @param {DeliveryDeleteManyArgs} args - Arguments to filter Deliveries to delete.
     * @example
     * // Delete a few Deliveries
     * const { count } = await prisma.delivery.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DeliveryDeleteManyArgs>(args?: SelectSubset<T, DeliveryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Deliveries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Deliveries
     * const delivery = await prisma.delivery.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DeliveryUpdateManyArgs>(args: SelectSubset<T, DeliveryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Deliveries and returns the data updated in the database.
     * @param {DeliveryUpdateManyAndReturnArgs} args - Arguments to update many Deliveries.
     * @example
     * // Update many Deliveries
     * const delivery = await prisma.delivery.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Deliveries and only return the `id`
     * const deliveryWithIdOnly = await prisma.delivery.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DeliveryUpdateManyAndReturnArgs>(args: SelectSubset<T, DeliveryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeliveryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Delivery.
     * @param {DeliveryUpsertArgs} args - Arguments to update or create a Delivery.
     * @example
     * // Update or create a Delivery
     * const delivery = await prisma.delivery.upsert({
     *   create: {
     *     // ... data to create a Delivery
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Delivery we want to update
     *   }
     * })
     */
    upsert<T extends DeliveryUpsertArgs>(args: SelectSubset<T, DeliveryUpsertArgs<ExtArgs>>): Prisma__DeliveryClient<$Result.GetResult<Prisma.$DeliveryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Deliveries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryCountArgs} args - Arguments to filter Deliveries to count.
     * @example
     * // Count the number of Deliveries
     * const count = await prisma.delivery.count({
     *   where: {
     *     // ... the filter for the Deliveries we want to count
     *   }
     * })
    **/
    count<T extends DeliveryCountArgs>(
      args?: Subset<T, DeliveryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeliveryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Delivery.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DeliveryAggregateArgs>(args: Subset<T, DeliveryAggregateArgs>): Prisma.PrismaPromise<GetDeliveryAggregateType<T>>

    /**
     * Group by Delivery.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DeliveryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeliveryGroupByArgs['orderBy'] }
        : { orderBy?: DeliveryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DeliveryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeliveryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Delivery model
   */
  readonly fields: DeliveryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Delivery.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeliveryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Delivery model
   */
  interface DeliveryFieldRefs {
    readonly id: FieldRef<"Delivery", 'String'>
    readonly userId: FieldRef<"Delivery", 'String'>
    readonly source: FieldRef<"Delivery", 'DeliverySource'>
    readonly grossValue: FieldRef<"Delivery", 'Decimal'>
    readonly distanceKm: FieldRef<"Delivery", 'Decimal'>
    readonly durationMin: FieldRef<"Delivery", 'Int'>
    readonly originName: FieldRef<"Delivery", 'String'>
    readonly destinationAddr: FieldRef<"Delivery", 'String'>
    readonly destinationLat: FieldRef<"Delivery", 'Float'>
    readonly destinationLng: FieldRef<"Delivery", 'Float'>
    readonly proofPhotoUrl: FieldRef<"Delivery", 'String'>
    readonly proofLat: FieldRef<"Delivery", 'Float'>
    readonly proofLng: FieldRef<"Delivery", 'Float'>
    readonly proofAt: FieldRef<"Delivery", 'DateTime'>
    readonly rawInput: FieldRef<"Delivery", 'Json'>
    readonly parsedAt: FieldRef<"Delivery", 'DateTime'>
    readonly occurredAt: FieldRef<"Delivery", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Delivery findUnique
   */
  export type DeliveryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryInclude<ExtArgs> | null
    /**
     * Filter, which Delivery to fetch.
     */
    where: DeliveryWhereUniqueInput
  }

  /**
   * Delivery findUniqueOrThrow
   */
  export type DeliveryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryInclude<ExtArgs> | null
    /**
     * Filter, which Delivery to fetch.
     */
    where: DeliveryWhereUniqueInput
  }

  /**
   * Delivery findFirst
   */
  export type DeliveryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryInclude<ExtArgs> | null
    /**
     * Filter, which Delivery to fetch.
     */
    where?: DeliveryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Deliveries to fetch.
     */
    orderBy?: DeliveryOrderByWithRelationInput | DeliveryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Deliveries.
     */
    cursor?: DeliveryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Deliveries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Deliveries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Deliveries.
     */
    distinct?: DeliveryScalarFieldEnum | DeliveryScalarFieldEnum[]
  }

  /**
   * Delivery findFirstOrThrow
   */
  export type DeliveryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryInclude<ExtArgs> | null
    /**
     * Filter, which Delivery to fetch.
     */
    where?: DeliveryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Deliveries to fetch.
     */
    orderBy?: DeliveryOrderByWithRelationInput | DeliveryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Deliveries.
     */
    cursor?: DeliveryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Deliveries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Deliveries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Deliveries.
     */
    distinct?: DeliveryScalarFieldEnum | DeliveryScalarFieldEnum[]
  }

  /**
   * Delivery findMany
   */
  export type DeliveryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryInclude<ExtArgs> | null
    /**
     * Filter, which Deliveries to fetch.
     */
    where?: DeliveryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Deliveries to fetch.
     */
    orderBy?: DeliveryOrderByWithRelationInput | DeliveryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Deliveries.
     */
    cursor?: DeliveryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Deliveries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Deliveries.
     */
    skip?: number
    distinct?: DeliveryScalarFieldEnum | DeliveryScalarFieldEnum[]
  }

  /**
   * Delivery create
   */
  export type DeliveryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryInclude<ExtArgs> | null
    /**
     * The data needed to create a Delivery.
     */
    data: XOR<DeliveryCreateInput, DeliveryUncheckedCreateInput>
  }

  /**
   * Delivery createMany
   */
  export type DeliveryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Deliveries.
     */
    data: DeliveryCreateManyInput | DeliveryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Delivery createManyAndReturn
   */
  export type DeliveryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * The data used to create many Deliveries.
     */
    data: DeliveryCreateManyInput | DeliveryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Delivery update
   */
  export type DeliveryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryInclude<ExtArgs> | null
    /**
     * The data needed to update a Delivery.
     */
    data: XOR<DeliveryUpdateInput, DeliveryUncheckedUpdateInput>
    /**
     * Choose, which Delivery to update.
     */
    where: DeliveryWhereUniqueInput
  }

  /**
   * Delivery updateMany
   */
  export type DeliveryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Deliveries.
     */
    data: XOR<DeliveryUpdateManyMutationInput, DeliveryUncheckedUpdateManyInput>
    /**
     * Filter which Deliveries to update
     */
    where?: DeliveryWhereInput
    /**
     * Limit how many Deliveries to update.
     */
    limit?: number
  }

  /**
   * Delivery updateManyAndReturn
   */
  export type DeliveryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * The data used to update Deliveries.
     */
    data: XOR<DeliveryUpdateManyMutationInput, DeliveryUncheckedUpdateManyInput>
    /**
     * Filter which Deliveries to update
     */
    where?: DeliveryWhereInput
    /**
     * Limit how many Deliveries to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Delivery upsert
   */
  export type DeliveryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryInclude<ExtArgs> | null
    /**
     * The filter to search for the Delivery to update in case it exists.
     */
    where: DeliveryWhereUniqueInput
    /**
     * In case the Delivery found by the `where` argument doesn't exist, create a new Delivery with this data.
     */
    create: XOR<DeliveryCreateInput, DeliveryUncheckedCreateInput>
    /**
     * In case the Delivery was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeliveryUpdateInput, DeliveryUncheckedUpdateInput>
  }

  /**
   * Delivery delete
   */
  export type DeliveryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryInclude<ExtArgs> | null
    /**
     * Filter which Delivery to delete.
     */
    where: DeliveryWhereUniqueInput
  }

  /**
   * Delivery deleteMany
   */
  export type DeliveryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Deliveries to delete
     */
    where?: DeliveryWhereInput
    /**
     * Limit how many Deliveries to delete.
     */
    limit?: number
  }

  /**
   * Delivery without action
   */
  export type DeliveryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Delivery
     */
    select?: DeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Delivery
     */
    omit?: DeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryInclude<ExtArgs> | null
  }


  /**
   * Model Shift
   */

  export type AggregateShift = {
    _count: ShiftCountAggregateOutputType | null
    _avg: ShiftAvgAggregateOutputType | null
    _sum: ShiftSumAggregateOutputType | null
    _min: ShiftMinAggregateOutputType | null
    _max: ShiftMaxAggregateOutputType | null
  }

  export type ShiftAvgAggregateOutputType = {
    startKm: Decimal | null
    endKm: Decimal | null
  }

  export type ShiftSumAggregateOutputType = {
    startKm: Decimal | null
    endKm: Decimal | null
  }

  export type ShiftMinAggregateOutputType = {
    id: string | null
    userId: string | null
    startedAt: Date | null
    endedAt: Date | null
    startKm: Decimal | null
    endKm: Decimal | null
  }

  export type ShiftMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    startedAt: Date | null
    endedAt: Date | null
    startKm: Decimal | null
    endKm: Decimal | null
  }

  export type ShiftCountAggregateOutputType = {
    id: number
    userId: number
    startedAt: number
    endedAt: number
    startKm: number
    endKm: number
    _all: number
  }


  export type ShiftAvgAggregateInputType = {
    startKm?: true
    endKm?: true
  }

  export type ShiftSumAggregateInputType = {
    startKm?: true
    endKm?: true
  }

  export type ShiftMinAggregateInputType = {
    id?: true
    userId?: true
    startedAt?: true
    endedAt?: true
    startKm?: true
    endKm?: true
  }

  export type ShiftMaxAggregateInputType = {
    id?: true
    userId?: true
    startedAt?: true
    endedAt?: true
    startKm?: true
    endKm?: true
  }

  export type ShiftCountAggregateInputType = {
    id?: true
    userId?: true
    startedAt?: true
    endedAt?: true
    startKm?: true
    endKm?: true
    _all?: true
  }

  export type ShiftAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Shift to aggregate.
     */
    where?: ShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shifts to fetch.
     */
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shifts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Shifts
    **/
    _count?: true | ShiftCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ShiftAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ShiftSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShiftMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShiftMaxAggregateInputType
  }

  export type GetShiftAggregateType<T extends ShiftAggregateArgs> = {
        [P in keyof T & keyof AggregateShift]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShift[P]>
      : GetScalarType<T[P], AggregateShift[P]>
  }




  export type ShiftGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShiftWhereInput
    orderBy?: ShiftOrderByWithAggregationInput | ShiftOrderByWithAggregationInput[]
    by: ShiftScalarFieldEnum[] | ShiftScalarFieldEnum
    having?: ShiftScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShiftCountAggregateInputType | true
    _avg?: ShiftAvgAggregateInputType
    _sum?: ShiftSumAggregateInputType
    _min?: ShiftMinAggregateInputType
    _max?: ShiftMaxAggregateInputType
  }

  export type ShiftGroupByOutputType = {
    id: string
    userId: string
    startedAt: Date
    endedAt: Date | null
    startKm: Decimal | null
    endKm: Decimal | null
    _count: ShiftCountAggregateOutputType | null
    _avg: ShiftAvgAggregateOutputType | null
    _sum: ShiftSumAggregateOutputType | null
    _min: ShiftMinAggregateOutputType | null
    _max: ShiftMaxAggregateOutputType | null
  }

  type GetShiftGroupByPayload<T extends ShiftGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShiftGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShiftGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShiftGroupByOutputType[P]>
            : GetScalarType<T[P], ShiftGroupByOutputType[P]>
        }
      >
    >


  export type ShiftSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    startedAt?: boolean
    endedAt?: boolean
    startKm?: boolean
    endKm?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shift"]>

  export type ShiftSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    startedAt?: boolean
    endedAt?: boolean
    startKm?: boolean
    endKm?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shift"]>

  export type ShiftSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    startedAt?: boolean
    endedAt?: boolean
    startKm?: boolean
    endKm?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shift"]>

  export type ShiftSelectScalar = {
    id?: boolean
    userId?: boolean
    startedAt?: boolean
    endedAt?: boolean
    startKm?: boolean
    endKm?: boolean
  }

  export type ShiftOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "startedAt" | "endedAt" | "startKm" | "endKm", ExtArgs["result"]["shift"]>
  export type ShiftInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ShiftIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ShiftIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ShiftPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Shift"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      startedAt: Date
      endedAt: Date | null
      startKm: Prisma.Decimal | null
      endKm: Prisma.Decimal | null
    }, ExtArgs["result"]["shift"]>
    composites: {}
  }

  type ShiftGetPayload<S extends boolean | null | undefined | ShiftDefaultArgs> = $Result.GetResult<Prisma.$ShiftPayload, S>

  type ShiftCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ShiftFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ShiftCountAggregateInputType | true
    }

  export interface ShiftDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Shift'], meta: { name: 'Shift' } }
    /**
     * Find zero or one Shift that matches the filter.
     * @param {ShiftFindUniqueArgs} args - Arguments to find a Shift
     * @example
     * // Get one Shift
     * const shift = await prisma.shift.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ShiftFindUniqueArgs>(args: SelectSubset<T, ShiftFindUniqueArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Shift that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ShiftFindUniqueOrThrowArgs} args - Arguments to find a Shift
     * @example
     * // Get one Shift
     * const shift = await prisma.shift.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ShiftFindUniqueOrThrowArgs>(args: SelectSubset<T, ShiftFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Shift that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftFindFirstArgs} args - Arguments to find a Shift
     * @example
     * // Get one Shift
     * const shift = await prisma.shift.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ShiftFindFirstArgs>(args?: SelectSubset<T, ShiftFindFirstArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Shift that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftFindFirstOrThrowArgs} args - Arguments to find a Shift
     * @example
     * // Get one Shift
     * const shift = await prisma.shift.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ShiftFindFirstOrThrowArgs>(args?: SelectSubset<T, ShiftFindFirstOrThrowArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Shifts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Shifts
     * const shifts = await prisma.shift.findMany()
     * 
     * // Get first 10 Shifts
     * const shifts = await prisma.shift.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shiftWithIdOnly = await prisma.shift.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ShiftFindManyArgs>(args?: SelectSubset<T, ShiftFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Shift.
     * @param {ShiftCreateArgs} args - Arguments to create a Shift.
     * @example
     * // Create one Shift
     * const Shift = await prisma.shift.create({
     *   data: {
     *     // ... data to create a Shift
     *   }
     * })
     * 
     */
    create<T extends ShiftCreateArgs>(args: SelectSubset<T, ShiftCreateArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Shifts.
     * @param {ShiftCreateManyArgs} args - Arguments to create many Shifts.
     * @example
     * // Create many Shifts
     * const shift = await prisma.shift.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ShiftCreateManyArgs>(args?: SelectSubset<T, ShiftCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Shifts and returns the data saved in the database.
     * @param {ShiftCreateManyAndReturnArgs} args - Arguments to create many Shifts.
     * @example
     * // Create many Shifts
     * const shift = await prisma.shift.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Shifts and only return the `id`
     * const shiftWithIdOnly = await prisma.shift.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ShiftCreateManyAndReturnArgs>(args?: SelectSubset<T, ShiftCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Shift.
     * @param {ShiftDeleteArgs} args - Arguments to delete one Shift.
     * @example
     * // Delete one Shift
     * const Shift = await prisma.shift.delete({
     *   where: {
     *     // ... filter to delete one Shift
     *   }
     * })
     * 
     */
    delete<T extends ShiftDeleteArgs>(args: SelectSubset<T, ShiftDeleteArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Shift.
     * @param {ShiftUpdateArgs} args - Arguments to update one Shift.
     * @example
     * // Update one Shift
     * const shift = await prisma.shift.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ShiftUpdateArgs>(args: SelectSubset<T, ShiftUpdateArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Shifts.
     * @param {ShiftDeleteManyArgs} args - Arguments to filter Shifts to delete.
     * @example
     * // Delete a few Shifts
     * const { count } = await prisma.shift.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ShiftDeleteManyArgs>(args?: SelectSubset<T, ShiftDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Shifts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Shifts
     * const shift = await prisma.shift.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ShiftUpdateManyArgs>(args: SelectSubset<T, ShiftUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Shifts and returns the data updated in the database.
     * @param {ShiftUpdateManyAndReturnArgs} args - Arguments to update many Shifts.
     * @example
     * // Update many Shifts
     * const shift = await prisma.shift.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Shifts and only return the `id`
     * const shiftWithIdOnly = await prisma.shift.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ShiftUpdateManyAndReturnArgs>(args: SelectSubset<T, ShiftUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Shift.
     * @param {ShiftUpsertArgs} args - Arguments to update or create a Shift.
     * @example
     * // Update or create a Shift
     * const shift = await prisma.shift.upsert({
     *   create: {
     *     // ... data to create a Shift
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Shift we want to update
     *   }
     * })
     */
    upsert<T extends ShiftUpsertArgs>(args: SelectSubset<T, ShiftUpsertArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Shifts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftCountArgs} args - Arguments to filter Shifts to count.
     * @example
     * // Count the number of Shifts
     * const count = await prisma.shift.count({
     *   where: {
     *     // ... the filter for the Shifts we want to count
     *   }
     * })
    **/
    count<T extends ShiftCountArgs>(
      args?: Subset<T, ShiftCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShiftCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Shift.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShiftAggregateArgs>(args: Subset<T, ShiftAggregateArgs>): Prisma.PrismaPromise<GetShiftAggregateType<T>>

    /**
     * Group by Shift.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ShiftGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ShiftGroupByArgs['orderBy'] }
        : { orderBy?: ShiftGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ShiftGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShiftGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Shift model
   */
  readonly fields: ShiftFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Shift.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ShiftClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Shift model
   */
  interface ShiftFieldRefs {
    readonly id: FieldRef<"Shift", 'String'>
    readonly userId: FieldRef<"Shift", 'String'>
    readonly startedAt: FieldRef<"Shift", 'DateTime'>
    readonly endedAt: FieldRef<"Shift", 'DateTime'>
    readonly startKm: FieldRef<"Shift", 'Decimal'>
    readonly endKm: FieldRef<"Shift", 'Decimal'>
  }
    

  // Custom InputTypes
  /**
   * Shift findUnique
   */
  export type ShiftFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shift to fetch.
     */
    where: ShiftWhereUniqueInput
  }

  /**
   * Shift findUniqueOrThrow
   */
  export type ShiftFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shift to fetch.
     */
    where: ShiftWhereUniqueInput
  }

  /**
   * Shift findFirst
   */
  export type ShiftFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shift to fetch.
     */
    where?: ShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shifts to fetch.
     */
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Shifts.
     */
    cursor?: ShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shifts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Shifts.
     */
    distinct?: ShiftScalarFieldEnum | ShiftScalarFieldEnum[]
  }

  /**
   * Shift findFirstOrThrow
   */
  export type ShiftFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shift to fetch.
     */
    where?: ShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shifts to fetch.
     */
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Shifts.
     */
    cursor?: ShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shifts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Shifts.
     */
    distinct?: ShiftScalarFieldEnum | ShiftScalarFieldEnum[]
  }

  /**
   * Shift findMany
   */
  export type ShiftFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shifts to fetch.
     */
    where?: ShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shifts to fetch.
     */
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Shifts.
     */
    cursor?: ShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shifts.
     */
    skip?: number
    distinct?: ShiftScalarFieldEnum | ShiftScalarFieldEnum[]
  }

  /**
   * Shift create
   */
  export type ShiftCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * The data needed to create a Shift.
     */
    data: XOR<ShiftCreateInput, ShiftUncheckedCreateInput>
  }

  /**
   * Shift createMany
   */
  export type ShiftCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Shifts.
     */
    data: ShiftCreateManyInput | ShiftCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Shift createManyAndReturn
   */
  export type ShiftCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * The data used to create many Shifts.
     */
    data: ShiftCreateManyInput | ShiftCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Shift update
   */
  export type ShiftUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * The data needed to update a Shift.
     */
    data: XOR<ShiftUpdateInput, ShiftUncheckedUpdateInput>
    /**
     * Choose, which Shift to update.
     */
    where: ShiftWhereUniqueInput
  }

  /**
   * Shift updateMany
   */
  export type ShiftUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Shifts.
     */
    data: XOR<ShiftUpdateManyMutationInput, ShiftUncheckedUpdateManyInput>
    /**
     * Filter which Shifts to update
     */
    where?: ShiftWhereInput
    /**
     * Limit how many Shifts to update.
     */
    limit?: number
  }

  /**
   * Shift updateManyAndReturn
   */
  export type ShiftUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * The data used to update Shifts.
     */
    data: XOR<ShiftUpdateManyMutationInput, ShiftUncheckedUpdateManyInput>
    /**
     * Filter which Shifts to update
     */
    where?: ShiftWhereInput
    /**
     * Limit how many Shifts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Shift upsert
   */
  export type ShiftUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * The filter to search for the Shift to update in case it exists.
     */
    where: ShiftWhereUniqueInput
    /**
     * In case the Shift found by the `where` argument doesn't exist, create a new Shift with this data.
     */
    create: XOR<ShiftCreateInput, ShiftUncheckedCreateInput>
    /**
     * In case the Shift was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ShiftUpdateInput, ShiftUncheckedUpdateInput>
  }

  /**
   * Shift delete
   */
  export type ShiftDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter which Shift to delete.
     */
    where: ShiftWhereUniqueInput
  }

  /**
   * Shift deleteMany
   */
  export type ShiftDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Shifts to delete
     */
    where?: ShiftWhereInput
    /**
     * Limit how many Shifts to delete.
     */
    limit?: number
  }

  /**
   * Shift without action
   */
  export type ShiftDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
  }


  /**
   * Model Goal
   */

  export type AggregateGoal = {
    _count: GoalCountAggregateOutputType | null
    _avg: GoalAvgAggregateOutputType | null
    _sum: GoalSumAggregateOutputType | null
    _min: GoalMinAggregateOutputType | null
    _max: GoalMaxAggregateOutputType | null
  }

  export type GoalAvgAggregateOutputType = {
    targetValue: Decimal | null
  }

  export type GoalSumAggregateOutputType = {
    targetValue: Decimal | null
  }

  export type GoalMinAggregateOutputType = {
    id: string | null
    userId: string | null
    period: $Enums.GoalPeriod | null
    targetValue: Decimal | null
    active: boolean | null
    createdAt: Date | null
  }

  export type GoalMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    period: $Enums.GoalPeriod | null
    targetValue: Decimal | null
    active: boolean | null
    createdAt: Date | null
  }

  export type GoalCountAggregateOutputType = {
    id: number
    userId: number
    period: number
    targetValue: number
    active: number
    createdAt: number
    _all: number
  }


  export type GoalAvgAggregateInputType = {
    targetValue?: true
  }

  export type GoalSumAggregateInputType = {
    targetValue?: true
  }

  export type GoalMinAggregateInputType = {
    id?: true
    userId?: true
    period?: true
    targetValue?: true
    active?: true
    createdAt?: true
  }

  export type GoalMaxAggregateInputType = {
    id?: true
    userId?: true
    period?: true
    targetValue?: true
    active?: true
    createdAt?: true
  }

  export type GoalCountAggregateInputType = {
    id?: true
    userId?: true
    period?: true
    targetValue?: true
    active?: true
    createdAt?: true
    _all?: true
  }

  export type GoalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Goal to aggregate.
     */
    where?: GoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Goals to fetch.
     */
    orderBy?: GoalOrderByWithRelationInput | GoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Goals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Goals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Goals
    **/
    _count?: true | GoalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GoalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GoalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GoalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GoalMaxAggregateInputType
  }

  export type GetGoalAggregateType<T extends GoalAggregateArgs> = {
        [P in keyof T & keyof AggregateGoal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGoal[P]>
      : GetScalarType<T[P], AggregateGoal[P]>
  }




  export type GoalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GoalWhereInput
    orderBy?: GoalOrderByWithAggregationInput | GoalOrderByWithAggregationInput[]
    by: GoalScalarFieldEnum[] | GoalScalarFieldEnum
    having?: GoalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GoalCountAggregateInputType | true
    _avg?: GoalAvgAggregateInputType
    _sum?: GoalSumAggregateInputType
    _min?: GoalMinAggregateInputType
    _max?: GoalMaxAggregateInputType
  }

  export type GoalGroupByOutputType = {
    id: string
    userId: string
    period: $Enums.GoalPeriod
    targetValue: Decimal
    active: boolean
    createdAt: Date
    _count: GoalCountAggregateOutputType | null
    _avg: GoalAvgAggregateOutputType | null
    _sum: GoalSumAggregateOutputType | null
    _min: GoalMinAggregateOutputType | null
    _max: GoalMaxAggregateOutputType | null
  }

  type GetGoalGroupByPayload<T extends GoalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GoalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GoalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GoalGroupByOutputType[P]>
            : GetScalarType<T[P], GoalGroupByOutputType[P]>
        }
      >
    >


  export type GoalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    period?: boolean
    targetValue?: boolean
    active?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["goal"]>

  export type GoalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    period?: boolean
    targetValue?: boolean
    active?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["goal"]>

  export type GoalSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    period?: boolean
    targetValue?: boolean
    active?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["goal"]>

  export type GoalSelectScalar = {
    id?: boolean
    userId?: boolean
    period?: boolean
    targetValue?: boolean
    active?: boolean
    createdAt?: boolean
  }

  export type GoalOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "period" | "targetValue" | "active" | "createdAt", ExtArgs["result"]["goal"]>
  export type GoalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type GoalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type GoalIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $GoalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Goal"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      period: $Enums.GoalPeriod
      targetValue: Prisma.Decimal
      active: boolean
      createdAt: Date
    }, ExtArgs["result"]["goal"]>
    composites: {}
  }

  type GoalGetPayload<S extends boolean | null | undefined | GoalDefaultArgs> = $Result.GetResult<Prisma.$GoalPayload, S>

  type GoalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GoalFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GoalCountAggregateInputType | true
    }

  export interface GoalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Goal'], meta: { name: 'Goal' } }
    /**
     * Find zero or one Goal that matches the filter.
     * @param {GoalFindUniqueArgs} args - Arguments to find a Goal
     * @example
     * // Get one Goal
     * const goal = await prisma.goal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GoalFindUniqueArgs>(args: SelectSubset<T, GoalFindUniqueArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Goal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GoalFindUniqueOrThrowArgs} args - Arguments to find a Goal
     * @example
     * // Get one Goal
     * const goal = await prisma.goal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GoalFindUniqueOrThrowArgs>(args: SelectSubset<T, GoalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Goal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalFindFirstArgs} args - Arguments to find a Goal
     * @example
     * // Get one Goal
     * const goal = await prisma.goal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GoalFindFirstArgs>(args?: SelectSubset<T, GoalFindFirstArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Goal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalFindFirstOrThrowArgs} args - Arguments to find a Goal
     * @example
     * // Get one Goal
     * const goal = await prisma.goal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GoalFindFirstOrThrowArgs>(args?: SelectSubset<T, GoalFindFirstOrThrowArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Goals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Goals
     * const goals = await prisma.goal.findMany()
     * 
     * // Get first 10 Goals
     * const goals = await prisma.goal.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const goalWithIdOnly = await prisma.goal.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GoalFindManyArgs>(args?: SelectSubset<T, GoalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Goal.
     * @param {GoalCreateArgs} args - Arguments to create a Goal.
     * @example
     * // Create one Goal
     * const Goal = await prisma.goal.create({
     *   data: {
     *     // ... data to create a Goal
     *   }
     * })
     * 
     */
    create<T extends GoalCreateArgs>(args: SelectSubset<T, GoalCreateArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Goals.
     * @param {GoalCreateManyArgs} args - Arguments to create many Goals.
     * @example
     * // Create many Goals
     * const goal = await prisma.goal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GoalCreateManyArgs>(args?: SelectSubset<T, GoalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Goals and returns the data saved in the database.
     * @param {GoalCreateManyAndReturnArgs} args - Arguments to create many Goals.
     * @example
     * // Create many Goals
     * const goal = await prisma.goal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Goals and only return the `id`
     * const goalWithIdOnly = await prisma.goal.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GoalCreateManyAndReturnArgs>(args?: SelectSubset<T, GoalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Goal.
     * @param {GoalDeleteArgs} args - Arguments to delete one Goal.
     * @example
     * // Delete one Goal
     * const Goal = await prisma.goal.delete({
     *   where: {
     *     // ... filter to delete one Goal
     *   }
     * })
     * 
     */
    delete<T extends GoalDeleteArgs>(args: SelectSubset<T, GoalDeleteArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Goal.
     * @param {GoalUpdateArgs} args - Arguments to update one Goal.
     * @example
     * // Update one Goal
     * const goal = await prisma.goal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GoalUpdateArgs>(args: SelectSubset<T, GoalUpdateArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Goals.
     * @param {GoalDeleteManyArgs} args - Arguments to filter Goals to delete.
     * @example
     * // Delete a few Goals
     * const { count } = await prisma.goal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GoalDeleteManyArgs>(args?: SelectSubset<T, GoalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Goals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Goals
     * const goal = await prisma.goal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GoalUpdateManyArgs>(args: SelectSubset<T, GoalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Goals and returns the data updated in the database.
     * @param {GoalUpdateManyAndReturnArgs} args - Arguments to update many Goals.
     * @example
     * // Update many Goals
     * const goal = await prisma.goal.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Goals and only return the `id`
     * const goalWithIdOnly = await prisma.goal.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GoalUpdateManyAndReturnArgs>(args: SelectSubset<T, GoalUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Goal.
     * @param {GoalUpsertArgs} args - Arguments to update or create a Goal.
     * @example
     * // Update or create a Goal
     * const goal = await prisma.goal.upsert({
     *   create: {
     *     // ... data to create a Goal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Goal we want to update
     *   }
     * })
     */
    upsert<T extends GoalUpsertArgs>(args: SelectSubset<T, GoalUpsertArgs<ExtArgs>>): Prisma__GoalClient<$Result.GetResult<Prisma.$GoalPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Goals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalCountArgs} args - Arguments to filter Goals to count.
     * @example
     * // Count the number of Goals
     * const count = await prisma.goal.count({
     *   where: {
     *     // ... the filter for the Goals we want to count
     *   }
     * })
    **/
    count<T extends GoalCountArgs>(
      args?: Subset<T, GoalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GoalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Goal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GoalAggregateArgs>(args: Subset<T, GoalAggregateArgs>): Prisma.PrismaPromise<GetGoalAggregateType<T>>

    /**
     * Group by Goal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoalGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GoalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GoalGroupByArgs['orderBy'] }
        : { orderBy?: GoalGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GoalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGoalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Goal model
   */
  readonly fields: GoalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Goal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GoalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Goal model
   */
  interface GoalFieldRefs {
    readonly id: FieldRef<"Goal", 'String'>
    readonly userId: FieldRef<"Goal", 'String'>
    readonly period: FieldRef<"Goal", 'GoalPeriod'>
    readonly targetValue: FieldRef<"Goal", 'Decimal'>
    readonly active: FieldRef<"Goal", 'Boolean'>
    readonly createdAt: FieldRef<"Goal", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Goal findUnique
   */
  export type GoalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * Filter, which Goal to fetch.
     */
    where: GoalWhereUniqueInput
  }

  /**
   * Goal findUniqueOrThrow
   */
  export type GoalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * Filter, which Goal to fetch.
     */
    where: GoalWhereUniqueInput
  }

  /**
   * Goal findFirst
   */
  export type GoalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * Filter, which Goal to fetch.
     */
    where?: GoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Goals to fetch.
     */
    orderBy?: GoalOrderByWithRelationInput | GoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Goals.
     */
    cursor?: GoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Goals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Goals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Goals.
     */
    distinct?: GoalScalarFieldEnum | GoalScalarFieldEnum[]
  }

  /**
   * Goal findFirstOrThrow
   */
  export type GoalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * Filter, which Goal to fetch.
     */
    where?: GoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Goals to fetch.
     */
    orderBy?: GoalOrderByWithRelationInput | GoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Goals.
     */
    cursor?: GoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Goals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Goals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Goals.
     */
    distinct?: GoalScalarFieldEnum | GoalScalarFieldEnum[]
  }

  /**
   * Goal findMany
   */
  export type GoalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * Filter, which Goals to fetch.
     */
    where?: GoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Goals to fetch.
     */
    orderBy?: GoalOrderByWithRelationInput | GoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Goals.
     */
    cursor?: GoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Goals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Goals.
     */
    skip?: number
    distinct?: GoalScalarFieldEnum | GoalScalarFieldEnum[]
  }

  /**
   * Goal create
   */
  export type GoalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * The data needed to create a Goal.
     */
    data: XOR<GoalCreateInput, GoalUncheckedCreateInput>
  }

  /**
   * Goal createMany
   */
  export type GoalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Goals.
     */
    data: GoalCreateManyInput | GoalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Goal createManyAndReturn
   */
  export type GoalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * The data used to create many Goals.
     */
    data: GoalCreateManyInput | GoalCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Goal update
   */
  export type GoalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * The data needed to update a Goal.
     */
    data: XOR<GoalUpdateInput, GoalUncheckedUpdateInput>
    /**
     * Choose, which Goal to update.
     */
    where: GoalWhereUniqueInput
  }

  /**
   * Goal updateMany
   */
  export type GoalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Goals.
     */
    data: XOR<GoalUpdateManyMutationInput, GoalUncheckedUpdateManyInput>
    /**
     * Filter which Goals to update
     */
    where?: GoalWhereInput
    /**
     * Limit how many Goals to update.
     */
    limit?: number
  }

  /**
   * Goal updateManyAndReturn
   */
  export type GoalUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * The data used to update Goals.
     */
    data: XOR<GoalUpdateManyMutationInput, GoalUncheckedUpdateManyInput>
    /**
     * Filter which Goals to update
     */
    where?: GoalWhereInput
    /**
     * Limit how many Goals to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Goal upsert
   */
  export type GoalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * The filter to search for the Goal to update in case it exists.
     */
    where: GoalWhereUniqueInput
    /**
     * In case the Goal found by the `where` argument doesn't exist, create a new Goal with this data.
     */
    create: XOR<GoalCreateInput, GoalUncheckedCreateInput>
    /**
     * In case the Goal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GoalUpdateInput, GoalUncheckedUpdateInput>
  }

  /**
   * Goal delete
   */
  export type GoalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
    /**
     * Filter which Goal to delete.
     */
    where: GoalWhereUniqueInput
  }

  /**
   * Goal deleteMany
   */
  export type GoalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Goals to delete
     */
    where?: GoalWhereInput
    /**
     * Limit how many Goals to delete.
     */
    limit?: number
  }

  /**
   * Goal without action
   */
  export type GoalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Goal
     */
    select?: GoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Goal
     */
    omit?: GoalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GoalInclude<ExtArgs> | null
  }


  /**
   * Model Route
   */

  export type AggregateRoute = {
    _count: RouteCountAggregateOutputType | null
    _avg: RouteAvgAggregateOutputType | null
    _sum: RouteSumAggregateOutputType | null
    _min: RouteMinAggregateOutputType | null
    _max: RouteMaxAggregateOutputType | null
  }

  export type RouteAvgAggregateOutputType = {
    totalKm: Decimal | null
    totalMin: number | null
  }

  export type RouteSumAggregateOutputType = {
    totalKm: Decimal | null
    totalMin: number | null
  }

  export type RouteMinAggregateOutputType = {
    id: string | null
    userId: string | null
    totalKm: Decimal | null
    totalMin: number | null
    createdAt: Date | null
  }

  export type RouteMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    totalKm: Decimal | null
    totalMin: number | null
    createdAt: Date | null
  }

  export type RouteCountAggregateOutputType = {
    id: number
    userId: number
    addresses: number
    optimizedOrder: number
    totalKm: number
    totalMin: number
    createdAt: number
    _all: number
  }


  export type RouteAvgAggregateInputType = {
    totalKm?: true
    totalMin?: true
  }

  export type RouteSumAggregateInputType = {
    totalKm?: true
    totalMin?: true
  }

  export type RouteMinAggregateInputType = {
    id?: true
    userId?: true
    totalKm?: true
    totalMin?: true
    createdAt?: true
  }

  export type RouteMaxAggregateInputType = {
    id?: true
    userId?: true
    totalKm?: true
    totalMin?: true
    createdAt?: true
  }

  export type RouteCountAggregateInputType = {
    id?: true
    userId?: true
    addresses?: true
    optimizedOrder?: true
    totalKm?: true
    totalMin?: true
    createdAt?: true
    _all?: true
  }

  export type RouteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Route to aggregate.
     */
    where?: RouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Routes to fetch.
     */
    orderBy?: RouteOrderByWithRelationInput | RouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Routes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Routes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Routes
    **/
    _count?: true | RouteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RouteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RouteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RouteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RouteMaxAggregateInputType
  }

  export type GetRouteAggregateType<T extends RouteAggregateArgs> = {
        [P in keyof T & keyof AggregateRoute]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoute[P]>
      : GetScalarType<T[P], AggregateRoute[P]>
  }




  export type RouteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RouteWhereInput
    orderBy?: RouteOrderByWithAggregationInput | RouteOrderByWithAggregationInput[]
    by: RouteScalarFieldEnum[] | RouteScalarFieldEnum
    having?: RouteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RouteCountAggregateInputType | true
    _avg?: RouteAvgAggregateInputType
    _sum?: RouteSumAggregateInputType
    _min?: RouteMinAggregateInputType
    _max?: RouteMaxAggregateInputType
  }

  export type RouteGroupByOutputType = {
    id: string
    userId: string
    addresses: JsonValue
    optimizedOrder: JsonValue
    totalKm: Decimal
    totalMin: number
    createdAt: Date
    _count: RouteCountAggregateOutputType | null
    _avg: RouteAvgAggregateOutputType | null
    _sum: RouteSumAggregateOutputType | null
    _min: RouteMinAggregateOutputType | null
    _max: RouteMaxAggregateOutputType | null
  }

  type GetRouteGroupByPayload<T extends RouteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RouteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RouteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RouteGroupByOutputType[P]>
            : GetScalarType<T[P], RouteGroupByOutputType[P]>
        }
      >
    >


  export type RouteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    addresses?: boolean
    optimizedOrder?: boolean
    totalKm?: boolean
    totalMin?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["route"]>

  export type RouteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    addresses?: boolean
    optimizedOrder?: boolean
    totalKm?: boolean
    totalMin?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["route"]>

  export type RouteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    addresses?: boolean
    optimizedOrder?: boolean
    totalKm?: boolean
    totalMin?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["route"]>

  export type RouteSelectScalar = {
    id?: boolean
    userId?: boolean
    addresses?: boolean
    optimizedOrder?: boolean
    totalKm?: boolean
    totalMin?: boolean
    createdAt?: boolean
  }

  export type RouteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "addresses" | "optimizedOrder" | "totalKm" | "totalMin" | "createdAt", ExtArgs["result"]["route"]>
  export type RouteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type RouteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type RouteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $RoutePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Route"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      addresses: Prisma.JsonValue
      optimizedOrder: Prisma.JsonValue
      totalKm: Prisma.Decimal
      totalMin: number
      createdAt: Date
    }, ExtArgs["result"]["route"]>
    composites: {}
  }

  type RouteGetPayload<S extends boolean | null | undefined | RouteDefaultArgs> = $Result.GetResult<Prisma.$RoutePayload, S>

  type RouteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RouteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RouteCountAggregateInputType | true
    }

  export interface RouteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Route'], meta: { name: 'Route' } }
    /**
     * Find zero or one Route that matches the filter.
     * @param {RouteFindUniqueArgs} args - Arguments to find a Route
     * @example
     * // Get one Route
     * const route = await prisma.route.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RouteFindUniqueArgs>(args: SelectSubset<T, RouteFindUniqueArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Route that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RouteFindUniqueOrThrowArgs} args - Arguments to find a Route
     * @example
     * // Get one Route
     * const route = await prisma.route.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RouteFindUniqueOrThrowArgs>(args: SelectSubset<T, RouteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Route that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteFindFirstArgs} args - Arguments to find a Route
     * @example
     * // Get one Route
     * const route = await prisma.route.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RouteFindFirstArgs>(args?: SelectSubset<T, RouteFindFirstArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Route that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteFindFirstOrThrowArgs} args - Arguments to find a Route
     * @example
     * // Get one Route
     * const route = await prisma.route.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RouteFindFirstOrThrowArgs>(args?: SelectSubset<T, RouteFindFirstOrThrowArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Routes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Routes
     * const routes = await prisma.route.findMany()
     * 
     * // Get first 10 Routes
     * const routes = await prisma.route.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const routeWithIdOnly = await prisma.route.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RouteFindManyArgs>(args?: SelectSubset<T, RouteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Route.
     * @param {RouteCreateArgs} args - Arguments to create a Route.
     * @example
     * // Create one Route
     * const Route = await prisma.route.create({
     *   data: {
     *     // ... data to create a Route
     *   }
     * })
     * 
     */
    create<T extends RouteCreateArgs>(args: SelectSubset<T, RouteCreateArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Routes.
     * @param {RouteCreateManyArgs} args - Arguments to create many Routes.
     * @example
     * // Create many Routes
     * const route = await prisma.route.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RouteCreateManyArgs>(args?: SelectSubset<T, RouteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Routes and returns the data saved in the database.
     * @param {RouteCreateManyAndReturnArgs} args - Arguments to create many Routes.
     * @example
     * // Create many Routes
     * const route = await prisma.route.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Routes and only return the `id`
     * const routeWithIdOnly = await prisma.route.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RouteCreateManyAndReturnArgs>(args?: SelectSubset<T, RouteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Route.
     * @param {RouteDeleteArgs} args - Arguments to delete one Route.
     * @example
     * // Delete one Route
     * const Route = await prisma.route.delete({
     *   where: {
     *     // ... filter to delete one Route
     *   }
     * })
     * 
     */
    delete<T extends RouteDeleteArgs>(args: SelectSubset<T, RouteDeleteArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Route.
     * @param {RouteUpdateArgs} args - Arguments to update one Route.
     * @example
     * // Update one Route
     * const route = await prisma.route.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RouteUpdateArgs>(args: SelectSubset<T, RouteUpdateArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Routes.
     * @param {RouteDeleteManyArgs} args - Arguments to filter Routes to delete.
     * @example
     * // Delete a few Routes
     * const { count } = await prisma.route.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RouteDeleteManyArgs>(args?: SelectSubset<T, RouteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Routes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Routes
     * const route = await prisma.route.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RouteUpdateManyArgs>(args: SelectSubset<T, RouteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Routes and returns the data updated in the database.
     * @param {RouteUpdateManyAndReturnArgs} args - Arguments to update many Routes.
     * @example
     * // Update many Routes
     * const route = await prisma.route.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Routes and only return the `id`
     * const routeWithIdOnly = await prisma.route.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RouteUpdateManyAndReturnArgs>(args: SelectSubset<T, RouteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Route.
     * @param {RouteUpsertArgs} args - Arguments to update or create a Route.
     * @example
     * // Update or create a Route
     * const route = await prisma.route.upsert({
     *   create: {
     *     // ... data to create a Route
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Route we want to update
     *   }
     * })
     */
    upsert<T extends RouteUpsertArgs>(args: SelectSubset<T, RouteUpsertArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Routes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteCountArgs} args - Arguments to filter Routes to count.
     * @example
     * // Count the number of Routes
     * const count = await prisma.route.count({
     *   where: {
     *     // ... the filter for the Routes we want to count
     *   }
     * })
    **/
    count<T extends RouteCountArgs>(
      args?: Subset<T, RouteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RouteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Route.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RouteAggregateArgs>(args: Subset<T, RouteAggregateArgs>): Prisma.PrismaPromise<GetRouteAggregateType<T>>

    /**
     * Group by Route.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RouteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RouteGroupByArgs['orderBy'] }
        : { orderBy?: RouteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RouteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRouteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Route model
   */
  readonly fields: RouteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Route.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RouteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Route model
   */
  interface RouteFieldRefs {
    readonly id: FieldRef<"Route", 'String'>
    readonly userId: FieldRef<"Route", 'String'>
    readonly addresses: FieldRef<"Route", 'Json'>
    readonly optimizedOrder: FieldRef<"Route", 'Json'>
    readonly totalKm: FieldRef<"Route", 'Decimal'>
    readonly totalMin: FieldRef<"Route", 'Int'>
    readonly createdAt: FieldRef<"Route", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Route findUnique
   */
  export type RouteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * Filter, which Route to fetch.
     */
    where: RouteWhereUniqueInput
  }

  /**
   * Route findUniqueOrThrow
   */
  export type RouteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * Filter, which Route to fetch.
     */
    where: RouteWhereUniqueInput
  }

  /**
   * Route findFirst
   */
  export type RouteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * Filter, which Route to fetch.
     */
    where?: RouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Routes to fetch.
     */
    orderBy?: RouteOrderByWithRelationInput | RouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Routes.
     */
    cursor?: RouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Routes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Routes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Routes.
     */
    distinct?: RouteScalarFieldEnum | RouteScalarFieldEnum[]
  }

  /**
   * Route findFirstOrThrow
   */
  export type RouteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * Filter, which Route to fetch.
     */
    where?: RouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Routes to fetch.
     */
    orderBy?: RouteOrderByWithRelationInput | RouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Routes.
     */
    cursor?: RouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Routes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Routes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Routes.
     */
    distinct?: RouteScalarFieldEnum | RouteScalarFieldEnum[]
  }

  /**
   * Route findMany
   */
  export type RouteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * Filter, which Routes to fetch.
     */
    where?: RouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Routes to fetch.
     */
    orderBy?: RouteOrderByWithRelationInput | RouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Routes.
     */
    cursor?: RouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Routes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Routes.
     */
    skip?: number
    distinct?: RouteScalarFieldEnum | RouteScalarFieldEnum[]
  }

  /**
   * Route create
   */
  export type RouteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * The data needed to create a Route.
     */
    data: XOR<RouteCreateInput, RouteUncheckedCreateInput>
  }

  /**
   * Route createMany
   */
  export type RouteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Routes.
     */
    data: RouteCreateManyInput | RouteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Route createManyAndReturn
   */
  export type RouteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * The data used to create many Routes.
     */
    data: RouteCreateManyInput | RouteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Route update
   */
  export type RouteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * The data needed to update a Route.
     */
    data: XOR<RouteUpdateInput, RouteUncheckedUpdateInput>
    /**
     * Choose, which Route to update.
     */
    where: RouteWhereUniqueInput
  }

  /**
   * Route updateMany
   */
  export type RouteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Routes.
     */
    data: XOR<RouteUpdateManyMutationInput, RouteUncheckedUpdateManyInput>
    /**
     * Filter which Routes to update
     */
    where?: RouteWhereInput
    /**
     * Limit how many Routes to update.
     */
    limit?: number
  }

  /**
   * Route updateManyAndReturn
   */
  export type RouteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * The data used to update Routes.
     */
    data: XOR<RouteUpdateManyMutationInput, RouteUncheckedUpdateManyInput>
    /**
     * Filter which Routes to update
     */
    where?: RouteWhereInput
    /**
     * Limit how many Routes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Route upsert
   */
  export type RouteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * The filter to search for the Route to update in case it exists.
     */
    where: RouteWhereUniqueInput
    /**
     * In case the Route found by the `where` argument doesn't exist, create a new Route with this data.
     */
    create: XOR<RouteCreateInput, RouteUncheckedCreateInput>
    /**
     * In case the Route was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RouteUpdateInput, RouteUncheckedUpdateInput>
  }

  /**
   * Route delete
   */
  export type RouteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * Filter which Route to delete.
     */
    where: RouteWhereUniqueInput
  }

  /**
   * Route deleteMany
   */
  export type RouteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Routes to delete
     */
    where?: RouteWhereInput
    /**
     * Limit how many Routes to delete.
     */
    limit?: number
  }

  /**
   * Route without action
   */
  export type RouteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Route
     */
    omit?: RouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
  }


  /**
   * Model Payment
   */

  export type AggregatePayment = {
    _count: PaymentCountAggregateOutputType | null
    _avg: PaymentAvgAggregateOutputType | null
    _sum: PaymentSumAggregateOutputType | null
    _min: PaymentMinAggregateOutputType | null
    _max: PaymentMaxAggregateOutputType | null
  }

  export type PaymentAvgAggregateOutputType = {
    amount: Decimal | null
  }

  export type PaymentSumAggregateOutputType = {
    amount: Decimal | null
  }

  export type PaymentMinAggregateOutputType = {
    id: string | null
    userId: string | null
    asaasChargeId: string | null
    status: $Enums.PaymentStatus | null
    amount: Decimal | null
    paidAt: Date | null
    createdAt: Date | null
  }

  export type PaymentMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    asaasChargeId: string | null
    status: $Enums.PaymentStatus | null
    amount: Decimal | null
    paidAt: Date | null
    createdAt: Date | null
  }

  export type PaymentCountAggregateOutputType = {
    id: number
    userId: number
    asaasChargeId: number
    status: number
    amount: number
    paidAt: number
    createdAt: number
    _all: number
  }


  export type PaymentAvgAggregateInputType = {
    amount?: true
  }

  export type PaymentSumAggregateInputType = {
    amount?: true
  }

  export type PaymentMinAggregateInputType = {
    id?: true
    userId?: true
    asaasChargeId?: true
    status?: true
    amount?: true
    paidAt?: true
    createdAt?: true
  }

  export type PaymentMaxAggregateInputType = {
    id?: true
    userId?: true
    asaasChargeId?: true
    status?: true
    amount?: true
    paidAt?: true
    createdAt?: true
  }

  export type PaymentCountAggregateInputType = {
    id?: true
    userId?: true
    asaasChargeId?: true
    status?: true
    amount?: true
    paidAt?: true
    createdAt?: true
    _all?: true
  }

  export type PaymentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Payment to aggregate.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Payments
    **/
    _count?: true | PaymentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PaymentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PaymentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PaymentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PaymentMaxAggregateInputType
  }

  export type GetPaymentAggregateType<T extends PaymentAggregateArgs> = {
        [P in keyof T & keyof AggregatePayment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePayment[P]>
      : GetScalarType<T[P], AggregatePayment[P]>
  }




  export type PaymentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaymentWhereInput
    orderBy?: PaymentOrderByWithAggregationInput | PaymentOrderByWithAggregationInput[]
    by: PaymentScalarFieldEnum[] | PaymentScalarFieldEnum
    having?: PaymentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PaymentCountAggregateInputType | true
    _avg?: PaymentAvgAggregateInputType
    _sum?: PaymentSumAggregateInputType
    _min?: PaymentMinAggregateInputType
    _max?: PaymentMaxAggregateInputType
  }

  export type PaymentGroupByOutputType = {
    id: string
    userId: string
    asaasChargeId: string | null
    status: $Enums.PaymentStatus
    amount: Decimal
    paidAt: Date | null
    createdAt: Date
    _count: PaymentCountAggregateOutputType | null
    _avg: PaymentAvgAggregateOutputType | null
    _sum: PaymentSumAggregateOutputType | null
    _min: PaymentMinAggregateOutputType | null
    _max: PaymentMaxAggregateOutputType | null
  }

  type GetPaymentGroupByPayload<T extends PaymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PaymentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PaymentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PaymentGroupByOutputType[P]>
            : GetScalarType<T[P], PaymentGroupByOutputType[P]>
        }
      >
    >


  export type PaymentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    asaasChargeId?: boolean
    status?: boolean
    amount?: boolean
    paidAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    asaasChargeId?: boolean
    status?: boolean
    amount?: boolean
    paidAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    asaasChargeId?: boolean
    status?: boolean
    amount?: boolean
    paidAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectScalar = {
    id?: boolean
    userId?: boolean
    asaasChargeId?: boolean
    status?: boolean
    amount?: boolean
    paidAt?: boolean
    createdAt?: boolean
  }

  export type PaymentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "asaasChargeId" | "status" | "amount" | "paidAt" | "createdAt", ExtArgs["result"]["payment"]>
  export type PaymentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PaymentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PaymentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PaymentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Payment"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      asaasChargeId: string | null
      status: $Enums.PaymentStatus
      amount: Prisma.Decimal
      paidAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["payment"]>
    composites: {}
  }

  type PaymentGetPayload<S extends boolean | null | undefined | PaymentDefaultArgs> = $Result.GetResult<Prisma.$PaymentPayload, S>

  type PaymentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PaymentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PaymentCountAggregateInputType | true
    }

  export interface PaymentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Payment'], meta: { name: 'Payment' } }
    /**
     * Find zero or one Payment that matches the filter.
     * @param {PaymentFindUniqueArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PaymentFindUniqueArgs>(args: SelectSubset<T, PaymentFindUniqueArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Payment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PaymentFindUniqueOrThrowArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PaymentFindUniqueOrThrowArgs>(args: SelectSubset<T, PaymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Payment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindFirstArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PaymentFindFirstArgs>(args?: SelectSubset<T, PaymentFindFirstArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Payment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindFirstOrThrowArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PaymentFindFirstOrThrowArgs>(args?: SelectSubset<T, PaymentFindFirstOrThrowArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Payments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Payments
     * const payments = await prisma.payment.findMany()
     * 
     * // Get first 10 Payments
     * const payments = await prisma.payment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const paymentWithIdOnly = await prisma.payment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PaymentFindManyArgs>(args?: SelectSubset<T, PaymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Payment.
     * @param {PaymentCreateArgs} args - Arguments to create a Payment.
     * @example
     * // Create one Payment
     * const Payment = await prisma.payment.create({
     *   data: {
     *     // ... data to create a Payment
     *   }
     * })
     * 
     */
    create<T extends PaymentCreateArgs>(args: SelectSubset<T, PaymentCreateArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Payments.
     * @param {PaymentCreateManyArgs} args - Arguments to create many Payments.
     * @example
     * // Create many Payments
     * const payment = await prisma.payment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PaymentCreateManyArgs>(args?: SelectSubset<T, PaymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Payments and returns the data saved in the database.
     * @param {PaymentCreateManyAndReturnArgs} args - Arguments to create many Payments.
     * @example
     * // Create many Payments
     * const payment = await prisma.payment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Payments and only return the `id`
     * const paymentWithIdOnly = await prisma.payment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PaymentCreateManyAndReturnArgs>(args?: SelectSubset<T, PaymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Payment.
     * @param {PaymentDeleteArgs} args - Arguments to delete one Payment.
     * @example
     * // Delete one Payment
     * const Payment = await prisma.payment.delete({
     *   where: {
     *     // ... filter to delete one Payment
     *   }
     * })
     * 
     */
    delete<T extends PaymentDeleteArgs>(args: SelectSubset<T, PaymentDeleteArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Payment.
     * @param {PaymentUpdateArgs} args - Arguments to update one Payment.
     * @example
     * // Update one Payment
     * const payment = await prisma.payment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PaymentUpdateArgs>(args: SelectSubset<T, PaymentUpdateArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Payments.
     * @param {PaymentDeleteManyArgs} args - Arguments to filter Payments to delete.
     * @example
     * // Delete a few Payments
     * const { count } = await prisma.payment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PaymentDeleteManyArgs>(args?: SelectSubset<T, PaymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Payments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Payments
     * const payment = await prisma.payment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PaymentUpdateManyArgs>(args: SelectSubset<T, PaymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Payments and returns the data updated in the database.
     * @param {PaymentUpdateManyAndReturnArgs} args - Arguments to update many Payments.
     * @example
     * // Update many Payments
     * const payment = await prisma.payment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Payments and only return the `id`
     * const paymentWithIdOnly = await prisma.payment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PaymentUpdateManyAndReturnArgs>(args: SelectSubset<T, PaymentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Payment.
     * @param {PaymentUpsertArgs} args - Arguments to update or create a Payment.
     * @example
     * // Update or create a Payment
     * const payment = await prisma.payment.upsert({
     *   create: {
     *     // ... data to create a Payment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Payment we want to update
     *   }
     * })
     */
    upsert<T extends PaymentUpsertArgs>(args: SelectSubset<T, PaymentUpsertArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Payments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentCountArgs} args - Arguments to filter Payments to count.
     * @example
     * // Count the number of Payments
     * const count = await prisma.payment.count({
     *   where: {
     *     // ... the filter for the Payments we want to count
     *   }
     * })
    **/
    count<T extends PaymentCountArgs>(
      args?: Subset<T, PaymentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PaymentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Payment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PaymentAggregateArgs>(args: Subset<T, PaymentAggregateArgs>): Prisma.PrismaPromise<GetPaymentAggregateType<T>>

    /**
     * Group by Payment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PaymentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PaymentGroupByArgs['orderBy'] }
        : { orderBy?: PaymentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PaymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Payment model
   */
  readonly fields: PaymentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Payment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PaymentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Payment model
   */
  interface PaymentFieldRefs {
    readonly id: FieldRef<"Payment", 'String'>
    readonly userId: FieldRef<"Payment", 'String'>
    readonly asaasChargeId: FieldRef<"Payment", 'String'>
    readonly status: FieldRef<"Payment", 'PaymentStatus'>
    readonly amount: FieldRef<"Payment", 'Decimal'>
    readonly paidAt: FieldRef<"Payment", 'DateTime'>
    readonly createdAt: FieldRef<"Payment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Payment findUnique
   */
  export type PaymentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment findUniqueOrThrow
   */
  export type PaymentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment findFirst
   */
  export type PaymentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment findFirstOrThrow
   */
  export type PaymentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment findMany
   */
  export type PaymentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payments to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment create
   */
  export type PaymentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * The data needed to create a Payment.
     */
    data: XOR<PaymentCreateInput, PaymentUncheckedCreateInput>
  }

  /**
   * Payment createMany
   */
  export type PaymentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Payments.
     */
    data: PaymentCreateManyInput | PaymentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Payment createManyAndReturn
   */
  export type PaymentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * The data used to create many Payments.
     */
    data: PaymentCreateManyInput | PaymentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Payment update
   */
  export type PaymentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * The data needed to update a Payment.
     */
    data: XOR<PaymentUpdateInput, PaymentUncheckedUpdateInput>
    /**
     * Choose, which Payment to update.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment updateMany
   */
  export type PaymentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Payments.
     */
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyInput>
    /**
     * Filter which Payments to update
     */
    where?: PaymentWhereInput
    /**
     * Limit how many Payments to update.
     */
    limit?: number
  }

  /**
   * Payment updateManyAndReturn
   */
  export type PaymentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * The data used to update Payments.
     */
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyInput>
    /**
     * Filter which Payments to update
     */
    where?: PaymentWhereInput
    /**
     * Limit how many Payments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Payment upsert
   */
  export type PaymentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * The filter to search for the Payment to update in case it exists.
     */
    where: PaymentWhereUniqueInput
    /**
     * In case the Payment found by the `where` argument doesn't exist, create a new Payment with this data.
     */
    create: XOR<PaymentCreateInput, PaymentUncheckedCreateInput>
    /**
     * In case the Payment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PaymentUpdateInput, PaymentUncheckedUpdateInput>
  }

  /**
   * Payment delete
   */
  export type PaymentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter which Payment to delete.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment deleteMany
   */
  export type PaymentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Payments to delete
     */
    where?: PaymentWhereInput
    /**
     * Limit how many Payments to delete.
     */
    limit?: number
  }

  /**
   * Payment without action
   */
  export type PaymentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
  }


  /**
   * Model WhatsAppMessage
   */

  export type AggregateWhatsAppMessage = {
    _count: WhatsAppMessageCountAggregateOutputType | null
    _min: WhatsAppMessageMinAggregateOutputType | null
    _max: WhatsAppMessageMaxAggregateOutputType | null
  }

  export type WhatsAppMessageMinAggregateOutputType = {
    id: string | null
    userId: string | null
    fromNumber: string | null
    messageType: string | null
    processedAs: string | null
    receivedAt: Date | null
  }

  export type WhatsAppMessageMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    fromNumber: string | null
    messageType: string | null
    processedAs: string | null
    receivedAt: Date | null
  }

  export type WhatsAppMessageCountAggregateOutputType = {
    id: number
    userId: number
    fromNumber: number
    messageType: number
    rawContent: number
    processedAs: number
    receivedAt: number
    _all: number
  }


  export type WhatsAppMessageMinAggregateInputType = {
    id?: true
    userId?: true
    fromNumber?: true
    messageType?: true
    processedAs?: true
    receivedAt?: true
  }

  export type WhatsAppMessageMaxAggregateInputType = {
    id?: true
    userId?: true
    fromNumber?: true
    messageType?: true
    processedAs?: true
    receivedAt?: true
  }

  export type WhatsAppMessageCountAggregateInputType = {
    id?: true
    userId?: true
    fromNumber?: true
    messageType?: true
    rawContent?: true
    processedAs?: true
    receivedAt?: true
    _all?: true
  }

  export type WhatsAppMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppMessage to aggregate.
     */
    where?: WhatsAppMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppMessages to fetch.
     */
    orderBy?: WhatsAppMessageOrderByWithRelationInput | WhatsAppMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WhatsAppMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WhatsAppMessages
    **/
    _count?: true | WhatsAppMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WhatsAppMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WhatsAppMessageMaxAggregateInputType
  }

  export type GetWhatsAppMessageAggregateType<T extends WhatsAppMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateWhatsAppMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWhatsAppMessage[P]>
      : GetScalarType<T[P], AggregateWhatsAppMessage[P]>
  }




  export type WhatsAppMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WhatsAppMessageWhereInput
    orderBy?: WhatsAppMessageOrderByWithAggregationInput | WhatsAppMessageOrderByWithAggregationInput[]
    by: WhatsAppMessageScalarFieldEnum[] | WhatsAppMessageScalarFieldEnum
    having?: WhatsAppMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WhatsAppMessageCountAggregateInputType | true
    _min?: WhatsAppMessageMinAggregateInputType
    _max?: WhatsAppMessageMaxAggregateInputType
  }

  export type WhatsAppMessageGroupByOutputType = {
    id: string
    userId: string | null
    fromNumber: string
    messageType: string
    rawContent: JsonValue
    processedAs: string | null
    receivedAt: Date
    _count: WhatsAppMessageCountAggregateOutputType | null
    _min: WhatsAppMessageMinAggregateOutputType | null
    _max: WhatsAppMessageMaxAggregateOutputType | null
  }

  type GetWhatsAppMessageGroupByPayload<T extends WhatsAppMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WhatsAppMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WhatsAppMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WhatsAppMessageGroupByOutputType[P]>
            : GetScalarType<T[P], WhatsAppMessageGroupByOutputType[P]>
        }
      >
    >


  export type WhatsAppMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    fromNumber?: boolean
    messageType?: boolean
    rawContent?: boolean
    processedAs?: boolean
    receivedAt?: boolean
  }, ExtArgs["result"]["whatsAppMessage"]>

  export type WhatsAppMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    fromNumber?: boolean
    messageType?: boolean
    rawContent?: boolean
    processedAs?: boolean
    receivedAt?: boolean
  }, ExtArgs["result"]["whatsAppMessage"]>

  export type WhatsAppMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    fromNumber?: boolean
    messageType?: boolean
    rawContent?: boolean
    processedAs?: boolean
    receivedAt?: boolean
  }, ExtArgs["result"]["whatsAppMessage"]>

  export type WhatsAppMessageSelectScalar = {
    id?: boolean
    userId?: boolean
    fromNumber?: boolean
    messageType?: boolean
    rawContent?: boolean
    processedAs?: boolean
    receivedAt?: boolean
  }

  export type WhatsAppMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "fromNumber" | "messageType" | "rawContent" | "processedAs" | "receivedAt", ExtArgs["result"]["whatsAppMessage"]>

  export type $WhatsAppMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WhatsAppMessage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string | null
      fromNumber: string
      messageType: string
      rawContent: Prisma.JsonValue
      processedAs: string | null
      receivedAt: Date
    }, ExtArgs["result"]["whatsAppMessage"]>
    composites: {}
  }

  type WhatsAppMessageGetPayload<S extends boolean | null | undefined | WhatsAppMessageDefaultArgs> = $Result.GetResult<Prisma.$WhatsAppMessagePayload, S>

  type WhatsAppMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WhatsAppMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WhatsAppMessageCountAggregateInputType | true
    }

  export interface WhatsAppMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WhatsAppMessage'], meta: { name: 'WhatsAppMessage' } }
    /**
     * Find zero or one WhatsAppMessage that matches the filter.
     * @param {WhatsAppMessageFindUniqueArgs} args - Arguments to find a WhatsAppMessage
     * @example
     * // Get one WhatsAppMessage
     * const whatsAppMessage = await prisma.whatsAppMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WhatsAppMessageFindUniqueArgs>(args: SelectSubset<T, WhatsAppMessageFindUniqueArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WhatsAppMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WhatsAppMessageFindUniqueOrThrowArgs} args - Arguments to find a WhatsAppMessage
     * @example
     * // Get one WhatsAppMessage
     * const whatsAppMessage = await prisma.whatsAppMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WhatsAppMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, WhatsAppMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageFindFirstArgs} args - Arguments to find a WhatsAppMessage
     * @example
     * // Get one WhatsAppMessage
     * const whatsAppMessage = await prisma.whatsAppMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WhatsAppMessageFindFirstArgs>(args?: SelectSubset<T, WhatsAppMessageFindFirstArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageFindFirstOrThrowArgs} args - Arguments to find a WhatsAppMessage
     * @example
     * // Get one WhatsAppMessage
     * const whatsAppMessage = await prisma.whatsAppMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WhatsAppMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, WhatsAppMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WhatsAppMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WhatsAppMessages
     * const whatsAppMessages = await prisma.whatsAppMessage.findMany()
     * 
     * // Get first 10 WhatsAppMessages
     * const whatsAppMessages = await prisma.whatsAppMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const whatsAppMessageWithIdOnly = await prisma.whatsAppMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WhatsAppMessageFindManyArgs>(args?: SelectSubset<T, WhatsAppMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WhatsAppMessage.
     * @param {WhatsAppMessageCreateArgs} args - Arguments to create a WhatsAppMessage.
     * @example
     * // Create one WhatsAppMessage
     * const WhatsAppMessage = await prisma.whatsAppMessage.create({
     *   data: {
     *     // ... data to create a WhatsAppMessage
     *   }
     * })
     * 
     */
    create<T extends WhatsAppMessageCreateArgs>(args: SelectSubset<T, WhatsAppMessageCreateArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WhatsAppMessages.
     * @param {WhatsAppMessageCreateManyArgs} args - Arguments to create many WhatsAppMessages.
     * @example
     * // Create many WhatsAppMessages
     * const whatsAppMessage = await prisma.whatsAppMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WhatsAppMessageCreateManyArgs>(args?: SelectSubset<T, WhatsAppMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WhatsAppMessages and returns the data saved in the database.
     * @param {WhatsAppMessageCreateManyAndReturnArgs} args - Arguments to create many WhatsAppMessages.
     * @example
     * // Create many WhatsAppMessages
     * const whatsAppMessage = await prisma.whatsAppMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WhatsAppMessages and only return the `id`
     * const whatsAppMessageWithIdOnly = await prisma.whatsAppMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WhatsAppMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, WhatsAppMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WhatsAppMessage.
     * @param {WhatsAppMessageDeleteArgs} args - Arguments to delete one WhatsAppMessage.
     * @example
     * // Delete one WhatsAppMessage
     * const WhatsAppMessage = await prisma.whatsAppMessage.delete({
     *   where: {
     *     // ... filter to delete one WhatsAppMessage
     *   }
     * })
     * 
     */
    delete<T extends WhatsAppMessageDeleteArgs>(args: SelectSubset<T, WhatsAppMessageDeleteArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WhatsAppMessage.
     * @param {WhatsAppMessageUpdateArgs} args - Arguments to update one WhatsAppMessage.
     * @example
     * // Update one WhatsAppMessage
     * const whatsAppMessage = await prisma.whatsAppMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WhatsAppMessageUpdateArgs>(args: SelectSubset<T, WhatsAppMessageUpdateArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WhatsAppMessages.
     * @param {WhatsAppMessageDeleteManyArgs} args - Arguments to filter WhatsAppMessages to delete.
     * @example
     * // Delete a few WhatsAppMessages
     * const { count } = await prisma.whatsAppMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WhatsAppMessageDeleteManyArgs>(args?: SelectSubset<T, WhatsAppMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WhatsAppMessages
     * const whatsAppMessage = await prisma.whatsAppMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WhatsAppMessageUpdateManyArgs>(args: SelectSubset<T, WhatsAppMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppMessages and returns the data updated in the database.
     * @param {WhatsAppMessageUpdateManyAndReturnArgs} args - Arguments to update many WhatsAppMessages.
     * @example
     * // Update many WhatsAppMessages
     * const whatsAppMessage = await prisma.whatsAppMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WhatsAppMessages and only return the `id`
     * const whatsAppMessageWithIdOnly = await prisma.whatsAppMessage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WhatsAppMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, WhatsAppMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WhatsAppMessage.
     * @param {WhatsAppMessageUpsertArgs} args - Arguments to update or create a WhatsAppMessage.
     * @example
     * // Update or create a WhatsAppMessage
     * const whatsAppMessage = await prisma.whatsAppMessage.upsert({
     *   create: {
     *     // ... data to create a WhatsAppMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WhatsAppMessage we want to update
     *   }
     * })
     */
    upsert<T extends WhatsAppMessageUpsertArgs>(args: SelectSubset<T, WhatsAppMessageUpsertArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WhatsAppMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageCountArgs} args - Arguments to filter WhatsAppMessages to count.
     * @example
     * // Count the number of WhatsAppMessages
     * const count = await prisma.whatsAppMessage.count({
     *   where: {
     *     // ... the filter for the WhatsAppMessages we want to count
     *   }
     * })
    **/
    count<T extends WhatsAppMessageCountArgs>(
      args?: Subset<T, WhatsAppMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WhatsAppMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WhatsAppMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WhatsAppMessageAggregateArgs>(args: Subset<T, WhatsAppMessageAggregateArgs>): Prisma.PrismaPromise<GetWhatsAppMessageAggregateType<T>>

    /**
     * Group by WhatsAppMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WhatsAppMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WhatsAppMessageGroupByArgs['orderBy'] }
        : { orderBy?: WhatsAppMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WhatsAppMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWhatsAppMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WhatsAppMessage model
   */
  readonly fields: WhatsAppMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WhatsAppMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WhatsAppMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WhatsAppMessage model
   */
  interface WhatsAppMessageFieldRefs {
    readonly id: FieldRef<"WhatsAppMessage", 'String'>
    readonly userId: FieldRef<"WhatsAppMessage", 'String'>
    readonly fromNumber: FieldRef<"WhatsAppMessage", 'String'>
    readonly messageType: FieldRef<"WhatsAppMessage", 'String'>
    readonly rawContent: FieldRef<"WhatsAppMessage", 'Json'>
    readonly processedAs: FieldRef<"WhatsAppMessage", 'String'>
    readonly receivedAt: FieldRef<"WhatsAppMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WhatsAppMessage findUnique
   */
  export type WhatsAppMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppMessage to fetch.
     */
    where: WhatsAppMessageWhereUniqueInput
  }

  /**
   * WhatsAppMessage findUniqueOrThrow
   */
  export type WhatsAppMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppMessage to fetch.
     */
    where: WhatsAppMessageWhereUniqueInput
  }

  /**
   * WhatsAppMessage findFirst
   */
  export type WhatsAppMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppMessage to fetch.
     */
    where?: WhatsAppMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppMessages to fetch.
     */
    orderBy?: WhatsAppMessageOrderByWithRelationInput | WhatsAppMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppMessages.
     */
    cursor?: WhatsAppMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppMessages.
     */
    distinct?: WhatsAppMessageScalarFieldEnum | WhatsAppMessageScalarFieldEnum[]
  }

  /**
   * WhatsAppMessage findFirstOrThrow
   */
  export type WhatsAppMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppMessage to fetch.
     */
    where?: WhatsAppMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppMessages to fetch.
     */
    orderBy?: WhatsAppMessageOrderByWithRelationInput | WhatsAppMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppMessages.
     */
    cursor?: WhatsAppMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppMessages.
     */
    distinct?: WhatsAppMessageScalarFieldEnum | WhatsAppMessageScalarFieldEnum[]
  }

  /**
   * WhatsAppMessage findMany
   */
  export type WhatsAppMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppMessages to fetch.
     */
    where?: WhatsAppMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppMessages to fetch.
     */
    orderBy?: WhatsAppMessageOrderByWithRelationInput | WhatsAppMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WhatsAppMessages.
     */
    cursor?: WhatsAppMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppMessages.
     */
    skip?: number
    distinct?: WhatsAppMessageScalarFieldEnum | WhatsAppMessageScalarFieldEnum[]
  }

  /**
   * WhatsAppMessage create
   */
  export type WhatsAppMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * The data needed to create a WhatsAppMessage.
     */
    data: XOR<WhatsAppMessageCreateInput, WhatsAppMessageUncheckedCreateInput>
  }

  /**
   * WhatsAppMessage createMany
   */
  export type WhatsAppMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WhatsAppMessages.
     */
    data: WhatsAppMessageCreateManyInput | WhatsAppMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WhatsAppMessage createManyAndReturn
   */
  export type WhatsAppMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * The data used to create many WhatsAppMessages.
     */
    data: WhatsAppMessageCreateManyInput | WhatsAppMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WhatsAppMessage update
   */
  export type WhatsAppMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * The data needed to update a WhatsAppMessage.
     */
    data: XOR<WhatsAppMessageUpdateInput, WhatsAppMessageUncheckedUpdateInput>
    /**
     * Choose, which WhatsAppMessage to update.
     */
    where: WhatsAppMessageWhereUniqueInput
  }

  /**
   * WhatsAppMessage updateMany
   */
  export type WhatsAppMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WhatsAppMessages.
     */
    data: XOR<WhatsAppMessageUpdateManyMutationInput, WhatsAppMessageUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppMessages to update
     */
    where?: WhatsAppMessageWhereInput
    /**
     * Limit how many WhatsAppMessages to update.
     */
    limit?: number
  }

  /**
   * WhatsAppMessage updateManyAndReturn
   */
  export type WhatsAppMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * The data used to update WhatsAppMessages.
     */
    data: XOR<WhatsAppMessageUpdateManyMutationInput, WhatsAppMessageUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppMessages to update
     */
    where?: WhatsAppMessageWhereInput
    /**
     * Limit how many WhatsAppMessages to update.
     */
    limit?: number
  }

  /**
   * WhatsAppMessage upsert
   */
  export type WhatsAppMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * The filter to search for the WhatsAppMessage to update in case it exists.
     */
    where: WhatsAppMessageWhereUniqueInput
    /**
     * In case the WhatsAppMessage found by the `where` argument doesn't exist, create a new WhatsAppMessage with this data.
     */
    create: XOR<WhatsAppMessageCreateInput, WhatsAppMessageUncheckedCreateInput>
    /**
     * In case the WhatsAppMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WhatsAppMessageUpdateInput, WhatsAppMessageUncheckedUpdateInput>
  }

  /**
   * WhatsAppMessage delete
   */
  export type WhatsAppMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * Filter which WhatsAppMessage to delete.
     */
    where: WhatsAppMessageWhereUniqueInput
  }

  /**
   * WhatsAppMessage deleteMany
   */
  export type WhatsAppMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppMessages to delete
     */
    where?: WhatsAppMessageWhereInput
    /**
     * Limit how many WhatsAppMessages to delete.
     */
    limit?: number
  }

  /**
   * WhatsAppMessage without action
   */
  export type WhatsAppMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
  }


  /**
   * Model FuelRefuel
   */

  export type AggregateFuelRefuel = {
    _count: FuelRefuelCountAggregateOutputType | null
    _avg: FuelRefuelAvgAggregateOutputType | null
    _sum: FuelRefuelSumAggregateOutputType | null
    _min: FuelRefuelMinAggregateOutputType | null
    _max: FuelRefuelMaxAggregateOutputType | null
  }

  export type FuelRefuelAvgAggregateOutputType = {
    totalAmount: Decimal | null
    liters: Decimal | null
    pricePerLiter: Decimal | null
  }

  export type FuelRefuelSumAggregateOutputType = {
    totalAmount: Decimal | null
    liters: Decimal | null
    pricePerLiter: Decimal | null
  }

  export type FuelRefuelMinAggregateOutputType = {
    id: string | null
    userId: string | null
    totalAmount: Decimal | null
    liters: Decimal | null
    pricePerLiter: Decimal | null
    receiptPhotoUrl: string | null
    occurredAt: Date | null
  }

  export type FuelRefuelMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    totalAmount: Decimal | null
    liters: Decimal | null
    pricePerLiter: Decimal | null
    receiptPhotoUrl: string | null
    occurredAt: Date | null
  }

  export type FuelRefuelCountAggregateOutputType = {
    id: number
    userId: number
    totalAmount: number
    liters: number
    pricePerLiter: number
    receiptPhotoUrl: number
    rawInput: number
    occurredAt: number
    _all: number
  }


  export type FuelRefuelAvgAggregateInputType = {
    totalAmount?: true
    liters?: true
    pricePerLiter?: true
  }

  export type FuelRefuelSumAggregateInputType = {
    totalAmount?: true
    liters?: true
    pricePerLiter?: true
  }

  export type FuelRefuelMinAggregateInputType = {
    id?: true
    userId?: true
    totalAmount?: true
    liters?: true
    pricePerLiter?: true
    receiptPhotoUrl?: true
    occurredAt?: true
  }

  export type FuelRefuelMaxAggregateInputType = {
    id?: true
    userId?: true
    totalAmount?: true
    liters?: true
    pricePerLiter?: true
    receiptPhotoUrl?: true
    occurredAt?: true
  }

  export type FuelRefuelCountAggregateInputType = {
    id?: true
    userId?: true
    totalAmount?: true
    liters?: true
    pricePerLiter?: true
    receiptPhotoUrl?: true
    rawInput?: true
    occurredAt?: true
    _all?: true
  }

  export type FuelRefuelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FuelRefuel to aggregate.
     */
    where?: FuelRefuelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FuelRefuels to fetch.
     */
    orderBy?: FuelRefuelOrderByWithRelationInput | FuelRefuelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FuelRefuelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FuelRefuels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FuelRefuels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FuelRefuels
    **/
    _count?: true | FuelRefuelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FuelRefuelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FuelRefuelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FuelRefuelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FuelRefuelMaxAggregateInputType
  }

  export type GetFuelRefuelAggregateType<T extends FuelRefuelAggregateArgs> = {
        [P in keyof T & keyof AggregateFuelRefuel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFuelRefuel[P]>
      : GetScalarType<T[P], AggregateFuelRefuel[P]>
  }




  export type FuelRefuelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FuelRefuelWhereInput
    orderBy?: FuelRefuelOrderByWithAggregationInput | FuelRefuelOrderByWithAggregationInput[]
    by: FuelRefuelScalarFieldEnum[] | FuelRefuelScalarFieldEnum
    having?: FuelRefuelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FuelRefuelCountAggregateInputType | true
    _avg?: FuelRefuelAvgAggregateInputType
    _sum?: FuelRefuelSumAggregateInputType
    _min?: FuelRefuelMinAggregateInputType
    _max?: FuelRefuelMaxAggregateInputType
  }

  export type FuelRefuelGroupByOutputType = {
    id: string
    userId: string
    totalAmount: Decimal
    liters: Decimal
    pricePerLiter: Decimal
    receiptPhotoUrl: string | null
    rawInput: JsonValue
    occurredAt: Date
    _count: FuelRefuelCountAggregateOutputType | null
    _avg: FuelRefuelAvgAggregateOutputType | null
    _sum: FuelRefuelSumAggregateOutputType | null
    _min: FuelRefuelMinAggregateOutputType | null
    _max: FuelRefuelMaxAggregateOutputType | null
  }

  type GetFuelRefuelGroupByPayload<T extends FuelRefuelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FuelRefuelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FuelRefuelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FuelRefuelGroupByOutputType[P]>
            : GetScalarType<T[P], FuelRefuelGroupByOutputType[P]>
        }
      >
    >


  export type FuelRefuelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    totalAmount?: boolean
    liters?: boolean
    pricePerLiter?: boolean
    receiptPhotoUrl?: boolean
    rawInput?: boolean
    occurredAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fuelRefuel"]>

  export type FuelRefuelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    totalAmount?: boolean
    liters?: boolean
    pricePerLiter?: boolean
    receiptPhotoUrl?: boolean
    rawInput?: boolean
    occurredAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fuelRefuel"]>

  export type FuelRefuelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    totalAmount?: boolean
    liters?: boolean
    pricePerLiter?: boolean
    receiptPhotoUrl?: boolean
    rawInput?: boolean
    occurredAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fuelRefuel"]>

  export type FuelRefuelSelectScalar = {
    id?: boolean
    userId?: boolean
    totalAmount?: boolean
    liters?: boolean
    pricePerLiter?: boolean
    receiptPhotoUrl?: boolean
    rawInput?: boolean
    occurredAt?: boolean
  }

  export type FuelRefuelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "totalAmount" | "liters" | "pricePerLiter" | "receiptPhotoUrl" | "rawInput" | "occurredAt", ExtArgs["result"]["fuelRefuel"]>
  export type FuelRefuelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FuelRefuelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FuelRefuelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $FuelRefuelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FuelRefuel"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      totalAmount: Prisma.Decimal
      liters: Prisma.Decimal
      pricePerLiter: Prisma.Decimal
      receiptPhotoUrl: string | null
      rawInput: Prisma.JsonValue
      occurredAt: Date
    }, ExtArgs["result"]["fuelRefuel"]>
    composites: {}
  }

  type FuelRefuelGetPayload<S extends boolean | null | undefined | FuelRefuelDefaultArgs> = $Result.GetResult<Prisma.$FuelRefuelPayload, S>

  type FuelRefuelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FuelRefuelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FuelRefuelCountAggregateInputType | true
    }

  export interface FuelRefuelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FuelRefuel'], meta: { name: 'FuelRefuel' } }
    /**
     * Find zero or one FuelRefuel that matches the filter.
     * @param {FuelRefuelFindUniqueArgs} args - Arguments to find a FuelRefuel
     * @example
     * // Get one FuelRefuel
     * const fuelRefuel = await prisma.fuelRefuel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FuelRefuelFindUniqueArgs>(args: SelectSubset<T, FuelRefuelFindUniqueArgs<ExtArgs>>): Prisma__FuelRefuelClient<$Result.GetResult<Prisma.$FuelRefuelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FuelRefuel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FuelRefuelFindUniqueOrThrowArgs} args - Arguments to find a FuelRefuel
     * @example
     * // Get one FuelRefuel
     * const fuelRefuel = await prisma.fuelRefuel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FuelRefuelFindUniqueOrThrowArgs>(args: SelectSubset<T, FuelRefuelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FuelRefuelClient<$Result.GetResult<Prisma.$FuelRefuelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FuelRefuel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FuelRefuelFindFirstArgs} args - Arguments to find a FuelRefuel
     * @example
     * // Get one FuelRefuel
     * const fuelRefuel = await prisma.fuelRefuel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FuelRefuelFindFirstArgs>(args?: SelectSubset<T, FuelRefuelFindFirstArgs<ExtArgs>>): Prisma__FuelRefuelClient<$Result.GetResult<Prisma.$FuelRefuelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FuelRefuel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FuelRefuelFindFirstOrThrowArgs} args - Arguments to find a FuelRefuel
     * @example
     * // Get one FuelRefuel
     * const fuelRefuel = await prisma.fuelRefuel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FuelRefuelFindFirstOrThrowArgs>(args?: SelectSubset<T, FuelRefuelFindFirstOrThrowArgs<ExtArgs>>): Prisma__FuelRefuelClient<$Result.GetResult<Prisma.$FuelRefuelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FuelRefuels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FuelRefuelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FuelRefuels
     * const fuelRefuels = await prisma.fuelRefuel.findMany()
     * 
     * // Get first 10 FuelRefuels
     * const fuelRefuels = await prisma.fuelRefuel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const fuelRefuelWithIdOnly = await prisma.fuelRefuel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FuelRefuelFindManyArgs>(args?: SelectSubset<T, FuelRefuelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FuelRefuelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FuelRefuel.
     * @param {FuelRefuelCreateArgs} args - Arguments to create a FuelRefuel.
     * @example
     * // Create one FuelRefuel
     * const FuelRefuel = await prisma.fuelRefuel.create({
     *   data: {
     *     // ... data to create a FuelRefuel
     *   }
     * })
     * 
     */
    create<T extends FuelRefuelCreateArgs>(args: SelectSubset<T, FuelRefuelCreateArgs<ExtArgs>>): Prisma__FuelRefuelClient<$Result.GetResult<Prisma.$FuelRefuelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FuelRefuels.
     * @param {FuelRefuelCreateManyArgs} args - Arguments to create many FuelRefuels.
     * @example
     * // Create many FuelRefuels
     * const fuelRefuel = await prisma.fuelRefuel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FuelRefuelCreateManyArgs>(args?: SelectSubset<T, FuelRefuelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FuelRefuels and returns the data saved in the database.
     * @param {FuelRefuelCreateManyAndReturnArgs} args - Arguments to create many FuelRefuels.
     * @example
     * // Create many FuelRefuels
     * const fuelRefuel = await prisma.fuelRefuel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FuelRefuels and only return the `id`
     * const fuelRefuelWithIdOnly = await prisma.fuelRefuel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FuelRefuelCreateManyAndReturnArgs>(args?: SelectSubset<T, FuelRefuelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FuelRefuelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FuelRefuel.
     * @param {FuelRefuelDeleteArgs} args - Arguments to delete one FuelRefuel.
     * @example
     * // Delete one FuelRefuel
     * const FuelRefuel = await prisma.fuelRefuel.delete({
     *   where: {
     *     // ... filter to delete one FuelRefuel
     *   }
     * })
     * 
     */
    delete<T extends FuelRefuelDeleteArgs>(args: SelectSubset<T, FuelRefuelDeleteArgs<ExtArgs>>): Prisma__FuelRefuelClient<$Result.GetResult<Prisma.$FuelRefuelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FuelRefuel.
     * @param {FuelRefuelUpdateArgs} args - Arguments to update one FuelRefuel.
     * @example
     * // Update one FuelRefuel
     * const fuelRefuel = await prisma.fuelRefuel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FuelRefuelUpdateArgs>(args: SelectSubset<T, FuelRefuelUpdateArgs<ExtArgs>>): Prisma__FuelRefuelClient<$Result.GetResult<Prisma.$FuelRefuelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FuelRefuels.
     * @param {FuelRefuelDeleteManyArgs} args - Arguments to filter FuelRefuels to delete.
     * @example
     * // Delete a few FuelRefuels
     * const { count } = await prisma.fuelRefuel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FuelRefuelDeleteManyArgs>(args?: SelectSubset<T, FuelRefuelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FuelRefuels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FuelRefuelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FuelRefuels
     * const fuelRefuel = await prisma.fuelRefuel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FuelRefuelUpdateManyArgs>(args: SelectSubset<T, FuelRefuelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FuelRefuels and returns the data updated in the database.
     * @param {FuelRefuelUpdateManyAndReturnArgs} args - Arguments to update many FuelRefuels.
     * @example
     * // Update many FuelRefuels
     * const fuelRefuel = await prisma.fuelRefuel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FuelRefuels and only return the `id`
     * const fuelRefuelWithIdOnly = await prisma.fuelRefuel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FuelRefuelUpdateManyAndReturnArgs>(args: SelectSubset<T, FuelRefuelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FuelRefuelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FuelRefuel.
     * @param {FuelRefuelUpsertArgs} args - Arguments to update or create a FuelRefuel.
     * @example
     * // Update or create a FuelRefuel
     * const fuelRefuel = await prisma.fuelRefuel.upsert({
     *   create: {
     *     // ... data to create a FuelRefuel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FuelRefuel we want to update
     *   }
     * })
     */
    upsert<T extends FuelRefuelUpsertArgs>(args: SelectSubset<T, FuelRefuelUpsertArgs<ExtArgs>>): Prisma__FuelRefuelClient<$Result.GetResult<Prisma.$FuelRefuelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FuelRefuels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FuelRefuelCountArgs} args - Arguments to filter FuelRefuels to count.
     * @example
     * // Count the number of FuelRefuels
     * const count = await prisma.fuelRefuel.count({
     *   where: {
     *     // ... the filter for the FuelRefuels we want to count
     *   }
     * })
    **/
    count<T extends FuelRefuelCountArgs>(
      args?: Subset<T, FuelRefuelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FuelRefuelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FuelRefuel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FuelRefuelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FuelRefuelAggregateArgs>(args: Subset<T, FuelRefuelAggregateArgs>): Prisma.PrismaPromise<GetFuelRefuelAggregateType<T>>

    /**
     * Group by FuelRefuel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FuelRefuelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FuelRefuelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FuelRefuelGroupByArgs['orderBy'] }
        : { orderBy?: FuelRefuelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FuelRefuelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFuelRefuelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FuelRefuel model
   */
  readonly fields: FuelRefuelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FuelRefuel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FuelRefuelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FuelRefuel model
   */
  interface FuelRefuelFieldRefs {
    readonly id: FieldRef<"FuelRefuel", 'String'>
    readonly userId: FieldRef<"FuelRefuel", 'String'>
    readonly totalAmount: FieldRef<"FuelRefuel", 'Decimal'>
    readonly liters: FieldRef<"FuelRefuel", 'Decimal'>
    readonly pricePerLiter: FieldRef<"FuelRefuel", 'Decimal'>
    readonly receiptPhotoUrl: FieldRef<"FuelRefuel", 'String'>
    readonly rawInput: FieldRef<"FuelRefuel", 'Json'>
    readonly occurredAt: FieldRef<"FuelRefuel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FuelRefuel findUnique
   */
  export type FuelRefuelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelInclude<ExtArgs> | null
    /**
     * Filter, which FuelRefuel to fetch.
     */
    where: FuelRefuelWhereUniqueInput
  }

  /**
   * FuelRefuel findUniqueOrThrow
   */
  export type FuelRefuelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelInclude<ExtArgs> | null
    /**
     * Filter, which FuelRefuel to fetch.
     */
    where: FuelRefuelWhereUniqueInput
  }

  /**
   * FuelRefuel findFirst
   */
  export type FuelRefuelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelInclude<ExtArgs> | null
    /**
     * Filter, which FuelRefuel to fetch.
     */
    where?: FuelRefuelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FuelRefuels to fetch.
     */
    orderBy?: FuelRefuelOrderByWithRelationInput | FuelRefuelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FuelRefuels.
     */
    cursor?: FuelRefuelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FuelRefuels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FuelRefuels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FuelRefuels.
     */
    distinct?: FuelRefuelScalarFieldEnum | FuelRefuelScalarFieldEnum[]
  }

  /**
   * FuelRefuel findFirstOrThrow
   */
  export type FuelRefuelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelInclude<ExtArgs> | null
    /**
     * Filter, which FuelRefuel to fetch.
     */
    where?: FuelRefuelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FuelRefuels to fetch.
     */
    orderBy?: FuelRefuelOrderByWithRelationInput | FuelRefuelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FuelRefuels.
     */
    cursor?: FuelRefuelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FuelRefuels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FuelRefuels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FuelRefuels.
     */
    distinct?: FuelRefuelScalarFieldEnum | FuelRefuelScalarFieldEnum[]
  }

  /**
   * FuelRefuel findMany
   */
  export type FuelRefuelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelInclude<ExtArgs> | null
    /**
     * Filter, which FuelRefuels to fetch.
     */
    where?: FuelRefuelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FuelRefuels to fetch.
     */
    orderBy?: FuelRefuelOrderByWithRelationInput | FuelRefuelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FuelRefuels.
     */
    cursor?: FuelRefuelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FuelRefuels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FuelRefuels.
     */
    skip?: number
    distinct?: FuelRefuelScalarFieldEnum | FuelRefuelScalarFieldEnum[]
  }

  /**
   * FuelRefuel create
   */
  export type FuelRefuelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelInclude<ExtArgs> | null
    /**
     * The data needed to create a FuelRefuel.
     */
    data: XOR<FuelRefuelCreateInput, FuelRefuelUncheckedCreateInput>
  }

  /**
   * FuelRefuel createMany
   */
  export type FuelRefuelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FuelRefuels.
     */
    data: FuelRefuelCreateManyInput | FuelRefuelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FuelRefuel createManyAndReturn
   */
  export type FuelRefuelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * The data used to create many FuelRefuels.
     */
    data: FuelRefuelCreateManyInput | FuelRefuelCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FuelRefuel update
   */
  export type FuelRefuelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelInclude<ExtArgs> | null
    /**
     * The data needed to update a FuelRefuel.
     */
    data: XOR<FuelRefuelUpdateInput, FuelRefuelUncheckedUpdateInput>
    /**
     * Choose, which FuelRefuel to update.
     */
    where: FuelRefuelWhereUniqueInput
  }

  /**
   * FuelRefuel updateMany
   */
  export type FuelRefuelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FuelRefuels.
     */
    data: XOR<FuelRefuelUpdateManyMutationInput, FuelRefuelUncheckedUpdateManyInput>
    /**
     * Filter which FuelRefuels to update
     */
    where?: FuelRefuelWhereInput
    /**
     * Limit how many FuelRefuels to update.
     */
    limit?: number
  }

  /**
   * FuelRefuel updateManyAndReturn
   */
  export type FuelRefuelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * The data used to update FuelRefuels.
     */
    data: XOR<FuelRefuelUpdateManyMutationInput, FuelRefuelUncheckedUpdateManyInput>
    /**
     * Filter which FuelRefuels to update
     */
    where?: FuelRefuelWhereInput
    /**
     * Limit how many FuelRefuels to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * FuelRefuel upsert
   */
  export type FuelRefuelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelInclude<ExtArgs> | null
    /**
     * The filter to search for the FuelRefuel to update in case it exists.
     */
    where: FuelRefuelWhereUniqueInput
    /**
     * In case the FuelRefuel found by the `where` argument doesn't exist, create a new FuelRefuel with this data.
     */
    create: XOR<FuelRefuelCreateInput, FuelRefuelUncheckedCreateInput>
    /**
     * In case the FuelRefuel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FuelRefuelUpdateInput, FuelRefuelUncheckedUpdateInput>
  }

  /**
   * FuelRefuel delete
   */
  export type FuelRefuelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelInclude<ExtArgs> | null
    /**
     * Filter which FuelRefuel to delete.
     */
    where: FuelRefuelWhereUniqueInput
  }

  /**
   * FuelRefuel deleteMany
   */
  export type FuelRefuelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FuelRefuels to delete
     */
    where?: FuelRefuelWhereInput
    /**
     * Limit how many FuelRefuels to delete.
     */
    limit?: number
  }

  /**
   * FuelRefuel without action
   */
  export type FuelRefuelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FuelRefuel
     */
    select?: FuelRefuelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FuelRefuel
     */
    omit?: FuelRefuelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FuelRefuelInclude<ExtArgs> | null
  }


  /**
   * Model OdometerReading
   */

  export type AggregateOdometerReading = {
    _count: OdometerReadingCountAggregateOutputType | null
    _avg: OdometerReadingAvgAggregateOutputType | null
    _sum: OdometerReadingSumAggregateOutputType | null
    _min: OdometerReadingMinAggregateOutputType | null
    _max: OdometerReadingMaxAggregateOutputType | null
  }

  export type OdometerReadingAvgAggregateOutputType = {
    odometerKm: Decimal | null
  }

  export type OdometerReadingSumAggregateOutputType = {
    odometerKm: Decimal | null
  }

  export type OdometerReadingMinAggregateOutputType = {
    id: string | null
    userId: string | null
    odometerKm: Decimal | null
    photoUrl: string | null
    recordedAt: Date | null
  }

  export type OdometerReadingMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    odometerKm: Decimal | null
    photoUrl: string | null
    recordedAt: Date | null
  }

  export type OdometerReadingCountAggregateOutputType = {
    id: number
    userId: number
    odometerKm: number
    photoUrl: number
    rawInput: number
    recordedAt: number
    _all: number
  }


  export type OdometerReadingAvgAggregateInputType = {
    odometerKm?: true
  }

  export type OdometerReadingSumAggregateInputType = {
    odometerKm?: true
  }

  export type OdometerReadingMinAggregateInputType = {
    id?: true
    userId?: true
    odometerKm?: true
    photoUrl?: true
    recordedAt?: true
  }

  export type OdometerReadingMaxAggregateInputType = {
    id?: true
    userId?: true
    odometerKm?: true
    photoUrl?: true
    recordedAt?: true
  }

  export type OdometerReadingCountAggregateInputType = {
    id?: true
    userId?: true
    odometerKm?: true
    photoUrl?: true
    rawInput?: true
    recordedAt?: true
    _all?: true
  }

  export type OdometerReadingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OdometerReading to aggregate.
     */
    where?: OdometerReadingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OdometerReadings to fetch.
     */
    orderBy?: OdometerReadingOrderByWithRelationInput | OdometerReadingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OdometerReadingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OdometerReadings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OdometerReadings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OdometerReadings
    **/
    _count?: true | OdometerReadingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OdometerReadingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OdometerReadingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OdometerReadingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OdometerReadingMaxAggregateInputType
  }

  export type GetOdometerReadingAggregateType<T extends OdometerReadingAggregateArgs> = {
        [P in keyof T & keyof AggregateOdometerReading]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOdometerReading[P]>
      : GetScalarType<T[P], AggregateOdometerReading[P]>
  }




  export type OdometerReadingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OdometerReadingWhereInput
    orderBy?: OdometerReadingOrderByWithAggregationInput | OdometerReadingOrderByWithAggregationInput[]
    by: OdometerReadingScalarFieldEnum[] | OdometerReadingScalarFieldEnum
    having?: OdometerReadingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OdometerReadingCountAggregateInputType | true
    _avg?: OdometerReadingAvgAggregateInputType
    _sum?: OdometerReadingSumAggregateInputType
    _min?: OdometerReadingMinAggregateInputType
    _max?: OdometerReadingMaxAggregateInputType
  }

  export type OdometerReadingGroupByOutputType = {
    id: string
    userId: string
    odometerKm: Decimal
    photoUrl: string | null
    rawInput: JsonValue
    recordedAt: Date
    _count: OdometerReadingCountAggregateOutputType | null
    _avg: OdometerReadingAvgAggregateOutputType | null
    _sum: OdometerReadingSumAggregateOutputType | null
    _min: OdometerReadingMinAggregateOutputType | null
    _max: OdometerReadingMaxAggregateOutputType | null
  }

  type GetOdometerReadingGroupByPayload<T extends OdometerReadingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OdometerReadingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OdometerReadingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OdometerReadingGroupByOutputType[P]>
            : GetScalarType<T[P], OdometerReadingGroupByOutputType[P]>
        }
      >
    >


  export type OdometerReadingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    odometerKm?: boolean
    photoUrl?: boolean
    rawInput?: boolean
    recordedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["odometerReading"]>

  export type OdometerReadingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    odometerKm?: boolean
    photoUrl?: boolean
    rawInput?: boolean
    recordedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["odometerReading"]>

  export type OdometerReadingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    odometerKm?: boolean
    photoUrl?: boolean
    rawInput?: boolean
    recordedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["odometerReading"]>

  export type OdometerReadingSelectScalar = {
    id?: boolean
    userId?: boolean
    odometerKm?: boolean
    photoUrl?: boolean
    rawInput?: boolean
    recordedAt?: boolean
  }

  export type OdometerReadingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "odometerKm" | "photoUrl" | "rawInput" | "recordedAt", ExtArgs["result"]["odometerReading"]>
  export type OdometerReadingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OdometerReadingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OdometerReadingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $OdometerReadingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OdometerReading"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      odometerKm: Prisma.Decimal
      photoUrl: string | null
      rawInput: Prisma.JsonValue
      recordedAt: Date
    }, ExtArgs["result"]["odometerReading"]>
    composites: {}
  }

  type OdometerReadingGetPayload<S extends boolean | null | undefined | OdometerReadingDefaultArgs> = $Result.GetResult<Prisma.$OdometerReadingPayload, S>

  type OdometerReadingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OdometerReadingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OdometerReadingCountAggregateInputType | true
    }

  export interface OdometerReadingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OdometerReading'], meta: { name: 'OdometerReading' } }
    /**
     * Find zero or one OdometerReading that matches the filter.
     * @param {OdometerReadingFindUniqueArgs} args - Arguments to find a OdometerReading
     * @example
     * // Get one OdometerReading
     * const odometerReading = await prisma.odometerReading.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OdometerReadingFindUniqueArgs>(args: SelectSubset<T, OdometerReadingFindUniqueArgs<ExtArgs>>): Prisma__OdometerReadingClient<$Result.GetResult<Prisma.$OdometerReadingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OdometerReading that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OdometerReadingFindUniqueOrThrowArgs} args - Arguments to find a OdometerReading
     * @example
     * // Get one OdometerReading
     * const odometerReading = await prisma.odometerReading.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OdometerReadingFindUniqueOrThrowArgs>(args: SelectSubset<T, OdometerReadingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OdometerReadingClient<$Result.GetResult<Prisma.$OdometerReadingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OdometerReading that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OdometerReadingFindFirstArgs} args - Arguments to find a OdometerReading
     * @example
     * // Get one OdometerReading
     * const odometerReading = await prisma.odometerReading.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OdometerReadingFindFirstArgs>(args?: SelectSubset<T, OdometerReadingFindFirstArgs<ExtArgs>>): Prisma__OdometerReadingClient<$Result.GetResult<Prisma.$OdometerReadingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OdometerReading that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OdometerReadingFindFirstOrThrowArgs} args - Arguments to find a OdometerReading
     * @example
     * // Get one OdometerReading
     * const odometerReading = await prisma.odometerReading.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OdometerReadingFindFirstOrThrowArgs>(args?: SelectSubset<T, OdometerReadingFindFirstOrThrowArgs<ExtArgs>>): Prisma__OdometerReadingClient<$Result.GetResult<Prisma.$OdometerReadingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OdometerReadings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OdometerReadingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OdometerReadings
     * const odometerReadings = await prisma.odometerReading.findMany()
     * 
     * // Get first 10 OdometerReadings
     * const odometerReadings = await prisma.odometerReading.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const odometerReadingWithIdOnly = await prisma.odometerReading.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OdometerReadingFindManyArgs>(args?: SelectSubset<T, OdometerReadingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OdometerReadingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OdometerReading.
     * @param {OdometerReadingCreateArgs} args - Arguments to create a OdometerReading.
     * @example
     * // Create one OdometerReading
     * const OdometerReading = await prisma.odometerReading.create({
     *   data: {
     *     // ... data to create a OdometerReading
     *   }
     * })
     * 
     */
    create<T extends OdometerReadingCreateArgs>(args: SelectSubset<T, OdometerReadingCreateArgs<ExtArgs>>): Prisma__OdometerReadingClient<$Result.GetResult<Prisma.$OdometerReadingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OdometerReadings.
     * @param {OdometerReadingCreateManyArgs} args - Arguments to create many OdometerReadings.
     * @example
     * // Create many OdometerReadings
     * const odometerReading = await prisma.odometerReading.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OdometerReadingCreateManyArgs>(args?: SelectSubset<T, OdometerReadingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OdometerReadings and returns the data saved in the database.
     * @param {OdometerReadingCreateManyAndReturnArgs} args - Arguments to create many OdometerReadings.
     * @example
     * // Create many OdometerReadings
     * const odometerReading = await prisma.odometerReading.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OdometerReadings and only return the `id`
     * const odometerReadingWithIdOnly = await prisma.odometerReading.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OdometerReadingCreateManyAndReturnArgs>(args?: SelectSubset<T, OdometerReadingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OdometerReadingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OdometerReading.
     * @param {OdometerReadingDeleteArgs} args - Arguments to delete one OdometerReading.
     * @example
     * // Delete one OdometerReading
     * const OdometerReading = await prisma.odometerReading.delete({
     *   where: {
     *     // ... filter to delete one OdometerReading
     *   }
     * })
     * 
     */
    delete<T extends OdometerReadingDeleteArgs>(args: SelectSubset<T, OdometerReadingDeleteArgs<ExtArgs>>): Prisma__OdometerReadingClient<$Result.GetResult<Prisma.$OdometerReadingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OdometerReading.
     * @param {OdometerReadingUpdateArgs} args - Arguments to update one OdometerReading.
     * @example
     * // Update one OdometerReading
     * const odometerReading = await prisma.odometerReading.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OdometerReadingUpdateArgs>(args: SelectSubset<T, OdometerReadingUpdateArgs<ExtArgs>>): Prisma__OdometerReadingClient<$Result.GetResult<Prisma.$OdometerReadingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OdometerReadings.
     * @param {OdometerReadingDeleteManyArgs} args - Arguments to filter OdometerReadings to delete.
     * @example
     * // Delete a few OdometerReadings
     * const { count } = await prisma.odometerReading.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OdometerReadingDeleteManyArgs>(args?: SelectSubset<T, OdometerReadingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OdometerReadings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OdometerReadingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OdometerReadings
     * const odometerReading = await prisma.odometerReading.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OdometerReadingUpdateManyArgs>(args: SelectSubset<T, OdometerReadingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OdometerReadings and returns the data updated in the database.
     * @param {OdometerReadingUpdateManyAndReturnArgs} args - Arguments to update many OdometerReadings.
     * @example
     * // Update many OdometerReadings
     * const odometerReading = await prisma.odometerReading.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OdometerReadings and only return the `id`
     * const odometerReadingWithIdOnly = await prisma.odometerReading.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OdometerReadingUpdateManyAndReturnArgs>(args: SelectSubset<T, OdometerReadingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OdometerReadingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OdometerReading.
     * @param {OdometerReadingUpsertArgs} args - Arguments to update or create a OdometerReading.
     * @example
     * // Update or create a OdometerReading
     * const odometerReading = await prisma.odometerReading.upsert({
     *   create: {
     *     // ... data to create a OdometerReading
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OdometerReading we want to update
     *   }
     * })
     */
    upsert<T extends OdometerReadingUpsertArgs>(args: SelectSubset<T, OdometerReadingUpsertArgs<ExtArgs>>): Prisma__OdometerReadingClient<$Result.GetResult<Prisma.$OdometerReadingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OdometerReadings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OdometerReadingCountArgs} args - Arguments to filter OdometerReadings to count.
     * @example
     * // Count the number of OdometerReadings
     * const count = await prisma.odometerReading.count({
     *   where: {
     *     // ... the filter for the OdometerReadings we want to count
     *   }
     * })
    **/
    count<T extends OdometerReadingCountArgs>(
      args?: Subset<T, OdometerReadingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OdometerReadingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OdometerReading.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OdometerReadingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OdometerReadingAggregateArgs>(args: Subset<T, OdometerReadingAggregateArgs>): Prisma.PrismaPromise<GetOdometerReadingAggregateType<T>>

    /**
     * Group by OdometerReading.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OdometerReadingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OdometerReadingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OdometerReadingGroupByArgs['orderBy'] }
        : { orderBy?: OdometerReadingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OdometerReadingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOdometerReadingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OdometerReading model
   */
  readonly fields: OdometerReadingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OdometerReading.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OdometerReadingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OdometerReading model
   */
  interface OdometerReadingFieldRefs {
    readonly id: FieldRef<"OdometerReading", 'String'>
    readonly userId: FieldRef<"OdometerReading", 'String'>
    readonly odometerKm: FieldRef<"OdometerReading", 'Decimal'>
    readonly photoUrl: FieldRef<"OdometerReading", 'String'>
    readonly rawInput: FieldRef<"OdometerReading", 'Json'>
    readonly recordedAt: FieldRef<"OdometerReading", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OdometerReading findUnique
   */
  export type OdometerReadingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingInclude<ExtArgs> | null
    /**
     * Filter, which OdometerReading to fetch.
     */
    where: OdometerReadingWhereUniqueInput
  }

  /**
   * OdometerReading findUniqueOrThrow
   */
  export type OdometerReadingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingInclude<ExtArgs> | null
    /**
     * Filter, which OdometerReading to fetch.
     */
    where: OdometerReadingWhereUniqueInput
  }

  /**
   * OdometerReading findFirst
   */
  export type OdometerReadingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingInclude<ExtArgs> | null
    /**
     * Filter, which OdometerReading to fetch.
     */
    where?: OdometerReadingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OdometerReadings to fetch.
     */
    orderBy?: OdometerReadingOrderByWithRelationInput | OdometerReadingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OdometerReadings.
     */
    cursor?: OdometerReadingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OdometerReadings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OdometerReadings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OdometerReadings.
     */
    distinct?: OdometerReadingScalarFieldEnum | OdometerReadingScalarFieldEnum[]
  }

  /**
   * OdometerReading findFirstOrThrow
   */
  export type OdometerReadingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingInclude<ExtArgs> | null
    /**
     * Filter, which OdometerReading to fetch.
     */
    where?: OdometerReadingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OdometerReadings to fetch.
     */
    orderBy?: OdometerReadingOrderByWithRelationInput | OdometerReadingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OdometerReadings.
     */
    cursor?: OdometerReadingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OdometerReadings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OdometerReadings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OdometerReadings.
     */
    distinct?: OdometerReadingScalarFieldEnum | OdometerReadingScalarFieldEnum[]
  }

  /**
   * OdometerReading findMany
   */
  export type OdometerReadingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingInclude<ExtArgs> | null
    /**
     * Filter, which OdometerReadings to fetch.
     */
    where?: OdometerReadingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OdometerReadings to fetch.
     */
    orderBy?: OdometerReadingOrderByWithRelationInput | OdometerReadingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OdometerReadings.
     */
    cursor?: OdometerReadingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OdometerReadings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OdometerReadings.
     */
    skip?: number
    distinct?: OdometerReadingScalarFieldEnum | OdometerReadingScalarFieldEnum[]
  }

  /**
   * OdometerReading create
   */
  export type OdometerReadingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingInclude<ExtArgs> | null
    /**
     * The data needed to create a OdometerReading.
     */
    data: XOR<OdometerReadingCreateInput, OdometerReadingUncheckedCreateInput>
  }

  /**
   * OdometerReading createMany
   */
  export type OdometerReadingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OdometerReadings.
     */
    data: OdometerReadingCreateManyInput | OdometerReadingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OdometerReading createManyAndReturn
   */
  export type OdometerReadingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * The data used to create many OdometerReadings.
     */
    data: OdometerReadingCreateManyInput | OdometerReadingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OdometerReading update
   */
  export type OdometerReadingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingInclude<ExtArgs> | null
    /**
     * The data needed to update a OdometerReading.
     */
    data: XOR<OdometerReadingUpdateInput, OdometerReadingUncheckedUpdateInput>
    /**
     * Choose, which OdometerReading to update.
     */
    where: OdometerReadingWhereUniqueInput
  }

  /**
   * OdometerReading updateMany
   */
  export type OdometerReadingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OdometerReadings.
     */
    data: XOR<OdometerReadingUpdateManyMutationInput, OdometerReadingUncheckedUpdateManyInput>
    /**
     * Filter which OdometerReadings to update
     */
    where?: OdometerReadingWhereInput
    /**
     * Limit how many OdometerReadings to update.
     */
    limit?: number
  }

  /**
   * OdometerReading updateManyAndReturn
   */
  export type OdometerReadingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * The data used to update OdometerReadings.
     */
    data: XOR<OdometerReadingUpdateManyMutationInput, OdometerReadingUncheckedUpdateManyInput>
    /**
     * Filter which OdometerReadings to update
     */
    where?: OdometerReadingWhereInput
    /**
     * Limit how many OdometerReadings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OdometerReading upsert
   */
  export type OdometerReadingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingInclude<ExtArgs> | null
    /**
     * The filter to search for the OdometerReading to update in case it exists.
     */
    where: OdometerReadingWhereUniqueInput
    /**
     * In case the OdometerReading found by the `where` argument doesn't exist, create a new OdometerReading with this data.
     */
    create: XOR<OdometerReadingCreateInput, OdometerReadingUncheckedCreateInput>
    /**
     * In case the OdometerReading was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OdometerReadingUpdateInput, OdometerReadingUncheckedUpdateInput>
  }

  /**
   * OdometerReading delete
   */
  export type OdometerReadingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingInclude<ExtArgs> | null
    /**
     * Filter which OdometerReading to delete.
     */
    where: OdometerReadingWhereUniqueInput
  }

  /**
   * OdometerReading deleteMany
   */
  export type OdometerReadingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OdometerReadings to delete
     */
    where?: OdometerReadingWhereInput
    /**
     * Limit how many OdometerReadings to delete.
     */
    limit?: number
  }

  /**
   * OdometerReading without action
   */
  export type OdometerReadingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OdometerReading
     */
    select?: OdometerReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OdometerReading
     */
    omit?: OdometerReadingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OdometerReadingInclude<ExtArgs> | null
  }


  /**
   * Model AuthCode
   */

  export type AggregateAuthCode = {
    _count: AuthCodeCountAggregateOutputType | null
    _min: AuthCodeMinAggregateOutputType | null
    _max: AuthCodeMaxAggregateOutputType | null
  }

  export type AuthCodeMinAggregateOutputType = {
    id: string | null
    phone: string | null
    code: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type AuthCodeMaxAggregateOutputType = {
    id: string | null
    phone: string | null
    code: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type AuthCodeCountAggregateOutputType = {
    id: number
    phone: number
    code: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type AuthCodeMinAggregateInputType = {
    id?: true
    phone?: true
    code?: true
    expiresAt?: true
    createdAt?: true
  }

  export type AuthCodeMaxAggregateInputType = {
    id?: true
    phone?: true
    code?: true
    expiresAt?: true
    createdAt?: true
  }

  export type AuthCodeCountAggregateInputType = {
    id?: true
    phone?: true
    code?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type AuthCodeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthCode to aggregate.
     */
    where?: AuthCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthCodes to fetch.
     */
    orderBy?: AuthCodeOrderByWithRelationInput | AuthCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuthCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuthCodes
    **/
    _count?: true | AuthCodeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuthCodeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuthCodeMaxAggregateInputType
  }

  export type GetAuthCodeAggregateType<T extends AuthCodeAggregateArgs> = {
        [P in keyof T & keyof AggregateAuthCode]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuthCode[P]>
      : GetScalarType<T[P], AggregateAuthCode[P]>
  }




  export type AuthCodeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthCodeWhereInput
    orderBy?: AuthCodeOrderByWithAggregationInput | AuthCodeOrderByWithAggregationInput[]
    by: AuthCodeScalarFieldEnum[] | AuthCodeScalarFieldEnum
    having?: AuthCodeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuthCodeCountAggregateInputType | true
    _min?: AuthCodeMinAggregateInputType
    _max?: AuthCodeMaxAggregateInputType
  }

  export type AuthCodeGroupByOutputType = {
    id: string
    phone: string
    code: string
    expiresAt: Date
    createdAt: Date
    _count: AuthCodeCountAggregateOutputType | null
    _min: AuthCodeMinAggregateOutputType | null
    _max: AuthCodeMaxAggregateOutputType | null
  }

  type GetAuthCodeGroupByPayload<T extends AuthCodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuthCodeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuthCodeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuthCodeGroupByOutputType[P]>
            : GetScalarType<T[P], AuthCodeGroupByOutputType[P]>
        }
      >
    >


  export type AuthCodeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone?: boolean
    code?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["authCode"]>

  export type AuthCodeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone?: boolean
    code?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["authCode"]>

  export type AuthCodeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone?: boolean
    code?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["authCode"]>

  export type AuthCodeSelectScalar = {
    id?: boolean
    phone?: boolean
    code?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }

  export type AuthCodeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "phone" | "code" | "expiresAt" | "createdAt", ExtArgs["result"]["authCode"]>

  export type $AuthCodePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuthCode"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      phone: string
      code: string
      expiresAt: Date
      createdAt: Date
    }, ExtArgs["result"]["authCode"]>
    composites: {}
  }

  type AuthCodeGetPayload<S extends boolean | null | undefined | AuthCodeDefaultArgs> = $Result.GetResult<Prisma.$AuthCodePayload, S>

  type AuthCodeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuthCodeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuthCodeCountAggregateInputType | true
    }

  export interface AuthCodeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuthCode'], meta: { name: 'AuthCode' } }
    /**
     * Find zero or one AuthCode that matches the filter.
     * @param {AuthCodeFindUniqueArgs} args - Arguments to find a AuthCode
     * @example
     * // Get one AuthCode
     * const authCode = await prisma.authCode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuthCodeFindUniqueArgs>(args: SelectSubset<T, AuthCodeFindUniqueArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuthCode that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuthCodeFindUniqueOrThrowArgs} args - Arguments to find a AuthCode
     * @example
     * // Get one AuthCode
     * const authCode = await prisma.authCode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuthCodeFindUniqueOrThrowArgs>(args: SelectSubset<T, AuthCodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuthCode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeFindFirstArgs} args - Arguments to find a AuthCode
     * @example
     * // Get one AuthCode
     * const authCode = await prisma.authCode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuthCodeFindFirstArgs>(args?: SelectSubset<T, AuthCodeFindFirstArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuthCode that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeFindFirstOrThrowArgs} args - Arguments to find a AuthCode
     * @example
     * // Get one AuthCode
     * const authCode = await prisma.authCode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuthCodeFindFirstOrThrowArgs>(args?: SelectSubset<T, AuthCodeFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuthCodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuthCodes
     * const authCodes = await prisma.authCode.findMany()
     * 
     * // Get first 10 AuthCodes
     * const authCodes = await prisma.authCode.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const authCodeWithIdOnly = await prisma.authCode.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuthCodeFindManyArgs>(args?: SelectSubset<T, AuthCodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuthCode.
     * @param {AuthCodeCreateArgs} args - Arguments to create a AuthCode.
     * @example
     * // Create one AuthCode
     * const AuthCode = await prisma.authCode.create({
     *   data: {
     *     // ... data to create a AuthCode
     *   }
     * })
     * 
     */
    create<T extends AuthCodeCreateArgs>(args: SelectSubset<T, AuthCodeCreateArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuthCodes.
     * @param {AuthCodeCreateManyArgs} args - Arguments to create many AuthCodes.
     * @example
     * // Create many AuthCodes
     * const authCode = await prisma.authCode.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuthCodeCreateManyArgs>(args?: SelectSubset<T, AuthCodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuthCodes and returns the data saved in the database.
     * @param {AuthCodeCreateManyAndReturnArgs} args - Arguments to create many AuthCodes.
     * @example
     * // Create many AuthCodes
     * const authCode = await prisma.authCode.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuthCodes and only return the `id`
     * const authCodeWithIdOnly = await prisma.authCode.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuthCodeCreateManyAndReturnArgs>(args?: SelectSubset<T, AuthCodeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuthCode.
     * @param {AuthCodeDeleteArgs} args - Arguments to delete one AuthCode.
     * @example
     * // Delete one AuthCode
     * const AuthCode = await prisma.authCode.delete({
     *   where: {
     *     // ... filter to delete one AuthCode
     *   }
     * })
     * 
     */
    delete<T extends AuthCodeDeleteArgs>(args: SelectSubset<T, AuthCodeDeleteArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuthCode.
     * @param {AuthCodeUpdateArgs} args - Arguments to update one AuthCode.
     * @example
     * // Update one AuthCode
     * const authCode = await prisma.authCode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuthCodeUpdateArgs>(args: SelectSubset<T, AuthCodeUpdateArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuthCodes.
     * @param {AuthCodeDeleteManyArgs} args - Arguments to filter AuthCodes to delete.
     * @example
     * // Delete a few AuthCodes
     * const { count } = await prisma.authCode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuthCodeDeleteManyArgs>(args?: SelectSubset<T, AuthCodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuthCodes
     * const authCode = await prisma.authCode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuthCodeUpdateManyArgs>(args: SelectSubset<T, AuthCodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthCodes and returns the data updated in the database.
     * @param {AuthCodeUpdateManyAndReturnArgs} args - Arguments to update many AuthCodes.
     * @example
     * // Update many AuthCodes
     * const authCode = await prisma.authCode.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuthCodes and only return the `id`
     * const authCodeWithIdOnly = await prisma.authCode.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuthCodeUpdateManyAndReturnArgs>(args: SelectSubset<T, AuthCodeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuthCode.
     * @param {AuthCodeUpsertArgs} args - Arguments to update or create a AuthCode.
     * @example
     * // Update or create a AuthCode
     * const authCode = await prisma.authCode.upsert({
     *   create: {
     *     // ... data to create a AuthCode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuthCode we want to update
     *   }
     * })
     */
    upsert<T extends AuthCodeUpsertArgs>(args: SelectSubset<T, AuthCodeUpsertArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuthCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeCountArgs} args - Arguments to filter AuthCodes to count.
     * @example
     * // Count the number of AuthCodes
     * const count = await prisma.authCode.count({
     *   where: {
     *     // ... the filter for the AuthCodes we want to count
     *   }
     * })
    **/
    count<T extends AuthCodeCountArgs>(
      args?: Subset<T, AuthCodeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuthCodeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuthCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuthCodeAggregateArgs>(args: Subset<T, AuthCodeAggregateArgs>): Prisma.PrismaPromise<GetAuthCodeAggregateType<T>>

    /**
     * Group by AuthCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuthCodeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuthCodeGroupByArgs['orderBy'] }
        : { orderBy?: AuthCodeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuthCodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthCodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuthCode model
   */
  readonly fields: AuthCodeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuthCode.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuthCodeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuthCode model
   */
  interface AuthCodeFieldRefs {
    readonly id: FieldRef<"AuthCode", 'String'>
    readonly phone: FieldRef<"AuthCode", 'String'>
    readonly code: FieldRef<"AuthCode", 'String'>
    readonly expiresAt: FieldRef<"AuthCode", 'DateTime'>
    readonly createdAt: FieldRef<"AuthCode", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuthCode findUnique
   */
  export type AuthCodeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Filter, which AuthCode to fetch.
     */
    where: AuthCodeWhereUniqueInput
  }

  /**
   * AuthCode findUniqueOrThrow
   */
  export type AuthCodeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Filter, which AuthCode to fetch.
     */
    where: AuthCodeWhereUniqueInput
  }

  /**
   * AuthCode findFirst
   */
  export type AuthCodeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Filter, which AuthCode to fetch.
     */
    where?: AuthCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthCodes to fetch.
     */
    orderBy?: AuthCodeOrderByWithRelationInput | AuthCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthCodes.
     */
    cursor?: AuthCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthCodes.
     */
    distinct?: AuthCodeScalarFieldEnum | AuthCodeScalarFieldEnum[]
  }

  /**
   * AuthCode findFirstOrThrow
   */
  export type AuthCodeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Filter, which AuthCode to fetch.
     */
    where?: AuthCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthCodes to fetch.
     */
    orderBy?: AuthCodeOrderByWithRelationInput | AuthCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthCodes.
     */
    cursor?: AuthCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthCodes.
     */
    distinct?: AuthCodeScalarFieldEnum | AuthCodeScalarFieldEnum[]
  }

  /**
   * AuthCode findMany
   */
  export type AuthCodeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Filter, which AuthCodes to fetch.
     */
    where?: AuthCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthCodes to fetch.
     */
    orderBy?: AuthCodeOrderByWithRelationInput | AuthCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuthCodes.
     */
    cursor?: AuthCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthCodes.
     */
    skip?: number
    distinct?: AuthCodeScalarFieldEnum | AuthCodeScalarFieldEnum[]
  }

  /**
   * AuthCode create
   */
  export type AuthCodeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * The data needed to create a AuthCode.
     */
    data: XOR<AuthCodeCreateInput, AuthCodeUncheckedCreateInput>
  }

  /**
   * AuthCode createMany
   */
  export type AuthCodeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuthCodes.
     */
    data: AuthCodeCreateManyInput | AuthCodeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuthCode createManyAndReturn
   */
  export type AuthCodeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * The data used to create many AuthCodes.
     */
    data: AuthCodeCreateManyInput | AuthCodeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuthCode update
   */
  export type AuthCodeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * The data needed to update a AuthCode.
     */
    data: XOR<AuthCodeUpdateInput, AuthCodeUncheckedUpdateInput>
    /**
     * Choose, which AuthCode to update.
     */
    where: AuthCodeWhereUniqueInput
  }

  /**
   * AuthCode updateMany
   */
  export type AuthCodeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuthCodes.
     */
    data: XOR<AuthCodeUpdateManyMutationInput, AuthCodeUncheckedUpdateManyInput>
    /**
     * Filter which AuthCodes to update
     */
    where?: AuthCodeWhereInput
    /**
     * Limit how many AuthCodes to update.
     */
    limit?: number
  }

  /**
   * AuthCode updateManyAndReturn
   */
  export type AuthCodeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * The data used to update AuthCodes.
     */
    data: XOR<AuthCodeUpdateManyMutationInput, AuthCodeUncheckedUpdateManyInput>
    /**
     * Filter which AuthCodes to update
     */
    where?: AuthCodeWhereInput
    /**
     * Limit how many AuthCodes to update.
     */
    limit?: number
  }

  /**
   * AuthCode upsert
   */
  export type AuthCodeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * The filter to search for the AuthCode to update in case it exists.
     */
    where: AuthCodeWhereUniqueInput
    /**
     * In case the AuthCode found by the `where` argument doesn't exist, create a new AuthCode with this data.
     */
    create: XOR<AuthCodeCreateInput, AuthCodeUncheckedCreateInput>
    /**
     * In case the AuthCode was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuthCodeUpdateInput, AuthCodeUncheckedUpdateInput>
  }

  /**
   * AuthCode delete
   */
  export type AuthCodeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Filter which AuthCode to delete.
     */
    where: AuthCodeWhereUniqueInput
  }

  /**
   * AuthCode deleteMany
   */
  export type AuthCodeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthCodes to delete
     */
    where?: AuthCodeWhereInput
    /**
     * Limit how many AuthCodes to delete.
     */
    limit?: number
  }

  /**
   * AuthCode without action
   */
  export type AuthCodeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
  }


  /**
   * Model AdminAccount
   */

  export type AggregateAdminAccount = {
    _count: AdminAccountCountAggregateOutputType | null
    _min: AdminAccountMinAggregateOutputType | null
    _max: AdminAccountMaxAggregateOutputType | null
  }

  export type AdminAccountMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdminAccountMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdminAccountCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AdminAccountMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdminAccountMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdminAccountCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AdminAccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdminAccount to aggregate.
     */
    where?: AdminAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminAccounts to fetch.
     */
    orderBy?: AdminAccountOrderByWithRelationInput | AdminAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AdminAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AdminAccounts
    **/
    _count?: true | AdminAccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AdminAccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AdminAccountMaxAggregateInputType
  }

  export type GetAdminAccountAggregateType<T extends AdminAccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAdminAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdminAccount[P]>
      : GetScalarType<T[P], AggregateAdminAccount[P]>
  }




  export type AdminAccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AdminAccountWhereInput
    orderBy?: AdminAccountOrderByWithAggregationInput | AdminAccountOrderByWithAggregationInput[]
    by: AdminAccountScalarFieldEnum[] | AdminAccountScalarFieldEnum
    having?: AdminAccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AdminAccountCountAggregateInputType | true
    _min?: AdminAccountMinAggregateInputType
    _max?: AdminAccountMaxAggregateInputType
  }

  export type AdminAccountGroupByOutputType = {
    id: string
    email: string
    passwordHash: string
    createdAt: Date
    updatedAt: Date
    _count: AdminAccountCountAggregateOutputType | null
    _min: AdminAccountMinAggregateOutputType | null
    _max: AdminAccountMaxAggregateOutputType | null
  }

  type GetAdminAccountGroupByPayload<T extends AdminAccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AdminAccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AdminAccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AdminAccountGroupByOutputType[P]>
            : GetScalarType<T[P], AdminAccountGroupByOutputType[P]>
        }
      >
    >


  export type AdminAccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["adminAccount"]>

  export type AdminAccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["adminAccount"]>

  export type AdminAccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["adminAccount"]>

  export type AdminAccountSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AdminAccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "passwordHash" | "createdAt" | "updatedAt", ExtArgs["result"]["adminAccount"]>

  export type $AdminAccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AdminAccount"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["adminAccount"]>
    composites: {}
  }

  type AdminAccountGetPayload<S extends boolean | null | undefined | AdminAccountDefaultArgs> = $Result.GetResult<Prisma.$AdminAccountPayload, S>

  type AdminAccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AdminAccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AdminAccountCountAggregateInputType | true
    }

  export interface AdminAccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AdminAccount'], meta: { name: 'AdminAccount' } }
    /**
     * Find zero or one AdminAccount that matches the filter.
     * @param {AdminAccountFindUniqueArgs} args - Arguments to find a AdminAccount
     * @example
     * // Get one AdminAccount
     * const adminAccount = await prisma.adminAccount.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AdminAccountFindUniqueArgs>(args: SelectSubset<T, AdminAccountFindUniqueArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AdminAccount that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AdminAccountFindUniqueOrThrowArgs} args - Arguments to find a AdminAccount
     * @example
     * // Get one AdminAccount
     * const adminAccount = await prisma.adminAccount.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AdminAccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AdminAccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdminAccount that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountFindFirstArgs} args - Arguments to find a AdminAccount
     * @example
     * // Get one AdminAccount
     * const adminAccount = await prisma.adminAccount.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AdminAccountFindFirstArgs>(args?: SelectSubset<T, AdminAccountFindFirstArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdminAccount that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountFindFirstOrThrowArgs} args - Arguments to find a AdminAccount
     * @example
     * // Get one AdminAccount
     * const adminAccount = await prisma.adminAccount.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AdminAccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AdminAccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AdminAccounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AdminAccounts
     * const adminAccounts = await prisma.adminAccount.findMany()
     * 
     * // Get first 10 AdminAccounts
     * const adminAccounts = await prisma.adminAccount.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const adminAccountWithIdOnly = await prisma.adminAccount.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AdminAccountFindManyArgs>(args?: SelectSubset<T, AdminAccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AdminAccount.
     * @param {AdminAccountCreateArgs} args - Arguments to create a AdminAccount.
     * @example
     * // Create one AdminAccount
     * const AdminAccount = await prisma.adminAccount.create({
     *   data: {
     *     // ... data to create a AdminAccount
     *   }
     * })
     * 
     */
    create<T extends AdminAccountCreateArgs>(args: SelectSubset<T, AdminAccountCreateArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AdminAccounts.
     * @param {AdminAccountCreateManyArgs} args - Arguments to create many AdminAccounts.
     * @example
     * // Create many AdminAccounts
     * const adminAccount = await prisma.adminAccount.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AdminAccountCreateManyArgs>(args?: SelectSubset<T, AdminAccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AdminAccounts and returns the data saved in the database.
     * @param {AdminAccountCreateManyAndReturnArgs} args - Arguments to create many AdminAccounts.
     * @example
     * // Create many AdminAccounts
     * const adminAccount = await prisma.adminAccount.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AdminAccounts and only return the `id`
     * const adminAccountWithIdOnly = await prisma.adminAccount.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AdminAccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AdminAccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AdminAccount.
     * @param {AdminAccountDeleteArgs} args - Arguments to delete one AdminAccount.
     * @example
     * // Delete one AdminAccount
     * const AdminAccount = await prisma.adminAccount.delete({
     *   where: {
     *     // ... filter to delete one AdminAccount
     *   }
     * })
     * 
     */
    delete<T extends AdminAccountDeleteArgs>(args: SelectSubset<T, AdminAccountDeleteArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AdminAccount.
     * @param {AdminAccountUpdateArgs} args - Arguments to update one AdminAccount.
     * @example
     * // Update one AdminAccount
     * const adminAccount = await prisma.adminAccount.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AdminAccountUpdateArgs>(args: SelectSubset<T, AdminAccountUpdateArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AdminAccounts.
     * @param {AdminAccountDeleteManyArgs} args - Arguments to filter AdminAccounts to delete.
     * @example
     * // Delete a few AdminAccounts
     * const { count } = await prisma.adminAccount.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AdminAccountDeleteManyArgs>(args?: SelectSubset<T, AdminAccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdminAccounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AdminAccounts
     * const adminAccount = await prisma.adminAccount.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AdminAccountUpdateManyArgs>(args: SelectSubset<T, AdminAccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdminAccounts and returns the data updated in the database.
     * @param {AdminAccountUpdateManyAndReturnArgs} args - Arguments to update many AdminAccounts.
     * @example
     * // Update many AdminAccounts
     * const adminAccount = await prisma.adminAccount.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AdminAccounts and only return the `id`
     * const adminAccountWithIdOnly = await prisma.adminAccount.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AdminAccountUpdateManyAndReturnArgs>(args: SelectSubset<T, AdminAccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AdminAccount.
     * @param {AdminAccountUpsertArgs} args - Arguments to update or create a AdminAccount.
     * @example
     * // Update or create a AdminAccount
     * const adminAccount = await prisma.adminAccount.upsert({
     *   create: {
     *     // ... data to create a AdminAccount
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AdminAccount we want to update
     *   }
     * })
     */
    upsert<T extends AdminAccountUpsertArgs>(args: SelectSubset<T, AdminAccountUpsertArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AdminAccounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountCountArgs} args - Arguments to filter AdminAccounts to count.
     * @example
     * // Count the number of AdminAccounts
     * const count = await prisma.adminAccount.count({
     *   where: {
     *     // ... the filter for the AdminAccounts we want to count
     *   }
     * })
    **/
    count<T extends AdminAccountCountArgs>(
      args?: Subset<T, AdminAccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AdminAccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AdminAccount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AdminAccountAggregateArgs>(args: Subset<T, AdminAccountAggregateArgs>): Prisma.PrismaPromise<GetAdminAccountAggregateType<T>>

    /**
     * Group by AdminAccount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AdminAccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AdminAccountGroupByArgs['orderBy'] }
        : { orderBy?: AdminAccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AdminAccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdminAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AdminAccount model
   */
  readonly fields: AdminAccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AdminAccount.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AdminAccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AdminAccount model
   */
  interface AdminAccountFieldRefs {
    readonly id: FieldRef<"AdminAccount", 'String'>
    readonly email: FieldRef<"AdminAccount", 'String'>
    readonly passwordHash: FieldRef<"AdminAccount", 'String'>
    readonly createdAt: FieldRef<"AdminAccount", 'DateTime'>
    readonly updatedAt: FieldRef<"AdminAccount", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AdminAccount findUnique
   */
  export type AdminAccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Filter, which AdminAccount to fetch.
     */
    where: AdminAccountWhereUniqueInput
  }

  /**
   * AdminAccount findUniqueOrThrow
   */
  export type AdminAccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Filter, which AdminAccount to fetch.
     */
    where: AdminAccountWhereUniqueInput
  }

  /**
   * AdminAccount findFirst
   */
  export type AdminAccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Filter, which AdminAccount to fetch.
     */
    where?: AdminAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminAccounts to fetch.
     */
    orderBy?: AdminAccountOrderByWithRelationInput | AdminAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdminAccounts.
     */
    cursor?: AdminAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdminAccounts.
     */
    distinct?: AdminAccountScalarFieldEnum | AdminAccountScalarFieldEnum[]
  }

  /**
   * AdminAccount findFirstOrThrow
   */
  export type AdminAccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Filter, which AdminAccount to fetch.
     */
    where?: AdminAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminAccounts to fetch.
     */
    orderBy?: AdminAccountOrderByWithRelationInput | AdminAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdminAccounts.
     */
    cursor?: AdminAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdminAccounts.
     */
    distinct?: AdminAccountScalarFieldEnum | AdminAccountScalarFieldEnum[]
  }

  /**
   * AdminAccount findMany
   */
  export type AdminAccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Filter, which AdminAccounts to fetch.
     */
    where?: AdminAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminAccounts to fetch.
     */
    orderBy?: AdminAccountOrderByWithRelationInput | AdminAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AdminAccounts.
     */
    cursor?: AdminAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminAccounts.
     */
    skip?: number
    distinct?: AdminAccountScalarFieldEnum | AdminAccountScalarFieldEnum[]
  }

  /**
   * AdminAccount create
   */
  export type AdminAccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * The data needed to create a AdminAccount.
     */
    data: XOR<AdminAccountCreateInput, AdminAccountUncheckedCreateInput>
  }

  /**
   * AdminAccount createMany
   */
  export type AdminAccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AdminAccounts.
     */
    data: AdminAccountCreateManyInput | AdminAccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdminAccount createManyAndReturn
   */
  export type AdminAccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * The data used to create many AdminAccounts.
     */
    data: AdminAccountCreateManyInput | AdminAccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdminAccount update
   */
  export type AdminAccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * The data needed to update a AdminAccount.
     */
    data: XOR<AdminAccountUpdateInput, AdminAccountUncheckedUpdateInput>
    /**
     * Choose, which AdminAccount to update.
     */
    where: AdminAccountWhereUniqueInput
  }

  /**
   * AdminAccount updateMany
   */
  export type AdminAccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AdminAccounts.
     */
    data: XOR<AdminAccountUpdateManyMutationInput, AdminAccountUncheckedUpdateManyInput>
    /**
     * Filter which AdminAccounts to update
     */
    where?: AdminAccountWhereInput
    /**
     * Limit how many AdminAccounts to update.
     */
    limit?: number
  }

  /**
   * AdminAccount updateManyAndReturn
   */
  export type AdminAccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * The data used to update AdminAccounts.
     */
    data: XOR<AdminAccountUpdateManyMutationInput, AdminAccountUncheckedUpdateManyInput>
    /**
     * Filter which AdminAccounts to update
     */
    where?: AdminAccountWhereInput
    /**
     * Limit how many AdminAccounts to update.
     */
    limit?: number
  }

  /**
   * AdminAccount upsert
   */
  export type AdminAccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * The filter to search for the AdminAccount to update in case it exists.
     */
    where: AdminAccountWhereUniqueInput
    /**
     * In case the AdminAccount found by the `where` argument doesn't exist, create a new AdminAccount with this data.
     */
    create: XOR<AdminAccountCreateInput, AdminAccountUncheckedCreateInput>
    /**
     * In case the AdminAccount was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AdminAccountUpdateInput, AdminAccountUncheckedUpdateInput>
  }

  /**
   * AdminAccount delete
   */
  export type AdminAccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Filter which AdminAccount to delete.
     */
    where: AdminAccountWhereUniqueInput
  }

  /**
   * AdminAccount deleteMany
   */
  export type AdminAccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdminAccounts to delete
     */
    where?: AdminAccountWhereInput
    /**
     * Limit how many AdminAccounts to delete.
     */
    limit?: number
  }

  /**
   * AdminAccount without action
   */
  export type AdminAccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    whatsappNumber: 'whatsappNumber',
    email: 'email',
    name: 'name',
    vehiclePlate: 'vehiclePlate',
    city: 'city',
    workApps: 'workApps',
    subscriptionPaymentMethod: 'subscriptionPaymentMethod',
    workDays: 'workDays',
    status: 'status',
    trialEndsAt: 'trialEndsAt',
    subscribedAt: 'subscribedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentOdometerKm: 'currentOdometerKm',
    referredByAffiliateId: 'referredByAffiliateId',
    affiliateCouponCode: 'affiliateCouponCode',
    referredAt: 'referredAt',
    asaasCustomerId: 'asaasCustomerId'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const AffiliateScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    active: 'active',
    phone: 'phone',
    email: 'email',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AffiliateScalarFieldEnum = (typeof AffiliateScalarFieldEnum)[keyof typeof AffiliateScalarFieldEnum]


  export const ActivityLogScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    category: 'category',
    action: 'action',
    title: 'title',
    changes: 'changes',
    entityId: 'entityId',
    source: 'source',
    createdAt: 'createdAt'
  };

  export type ActivityLogScalarFieldEnum = (typeof ActivityLogScalarFieldEnum)[keyof typeof ActivityLogScalarFieldEnum]


  export const CostConfigScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    fuelPricePerLiter: 'fuelPricePerLiter',
    kmPerLiter: 'kmPerLiter',
    maintenancePerKm: 'maintenancePerKm',
    dailyFoodCost: 'dailyFoodCost',
    otherDailyCost: 'otherDailyCost',
    updatedAt: 'updatedAt'
  };

  export type CostConfigScalarFieldEnum = (typeof CostConfigScalarFieldEnum)[keyof typeof CostConfigScalarFieldEnum]


  export const DeliveryScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    source: 'source',
    grossValue: 'grossValue',
    distanceKm: 'distanceKm',
    durationMin: 'durationMin',
    originName: 'originName',
    destinationAddr: 'destinationAddr',
    destinationLat: 'destinationLat',
    destinationLng: 'destinationLng',
    proofPhotoUrl: 'proofPhotoUrl',
    proofLat: 'proofLat',
    proofLng: 'proofLng',
    proofAt: 'proofAt',
    rawInput: 'rawInput',
    parsedAt: 'parsedAt',
    occurredAt: 'occurredAt'
  };

  export type DeliveryScalarFieldEnum = (typeof DeliveryScalarFieldEnum)[keyof typeof DeliveryScalarFieldEnum]


  export const ShiftScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    startedAt: 'startedAt',
    endedAt: 'endedAt',
    startKm: 'startKm',
    endKm: 'endKm'
  };

  export type ShiftScalarFieldEnum = (typeof ShiftScalarFieldEnum)[keyof typeof ShiftScalarFieldEnum]


  export const GoalScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    period: 'period',
    targetValue: 'targetValue',
    active: 'active',
    createdAt: 'createdAt'
  };

  export type GoalScalarFieldEnum = (typeof GoalScalarFieldEnum)[keyof typeof GoalScalarFieldEnum]


  export const RouteScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    addresses: 'addresses',
    optimizedOrder: 'optimizedOrder',
    totalKm: 'totalKm',
    totalMin: 'totalMin',
    createdAt: 'createdAt'
  };

  export type RouteScalarFieldEnum = (typeof RouteScalarFieldEnum)[keyof typeof RouteScalarFieldEnum]


  export const PaymentScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    asaasChargeId: 'asaasChargeId',
    status: 'status',
    amount: 'amount',
    paidAt: 'paidAt',
    createdAt: 'createdAt'
  };

  export type PaymentScalarFieldEnum = (typeof PaymentScalarFieldEnum)[keyof typeof PaymentScalarFieldEnum]


  export const WhatsAppMessageScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    fromNumber: 'fromNumber',
    messageType: 'messageType',
    rawContent: 'rawContent',
    processedAs: 'processedAs',
    receivedAt: 'receivedAt'
  };

  export type WhatsAppMessageScalarFieldEnum = (typeof WhatsAppMessageScalarFieldEnum)[keyof typeof WhatsAppMessageScalarFieldEnum]


  export const FuelRefuelScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    totalAmount: 'totalAmount',
    liters: 'liters',
    pricePerLiter: 'pricePerLiter',
    receiptPhotoUrl: 'receiptPhotoUrl',
    rawInput: 'rawInput',
    occurredAt: 'occurredAt'
  };

  export type FuelRefuelScalarFieldEnum = (typeof FuelRefuelScalarFieldEnum)[keyof typeof FuelRefuelScalarFieldEnum]


  export const OdometerReadingScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    odometerKm: 'odometerKm',
    photoUrl: 'photoUrl',
    rawInput: 'rawInput',
    recordedAt: 'recordedAt'
  };

  export type OdometerReadingScalarFieldEnum = (typeof OdometerReadingScalarFieldEnum)[keyof typeof OdometerReadingScalarFieldEnum]


  export const AuthCodeScalarFieldEnum: {
    id: 'id',
    phone: 'phone',
    code: 'code',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type AuthCodeScalarFieldEnum = (typeof AuthCodeScalarFieldEnum)[keyof typeof AuthCodeScalarFieldEnum]


  export const AdminAccountScalarFieldEnum: {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AdminAccountScalarFieldEnum = (typeof AdminAccountScalarFieldEnum)[keyof typeof AdminAccountScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'UserStatus'
   */
  export type EnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus'>
    


  /**
   * Reference to a field of type 'UserStatus[]'
   */
  export type ListEnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'ActivityCategory'
   */
  export type EnumActivityCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActivityCategory'>
    


  /**
   * Reference to a field of type 'ActivityCategory[]'
   */
  export type ListEnumActivityCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActivityCategory[]'>
    


  /**
   * Reference to a field of type 'ActivityAction'
   */
  export type EnumActivityActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActivityAction'>
    


  /**
   * Reference to a field of type 'ActivityAction[]'
   */
  export type ListEnumActivityActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActivityAction[]'>
    


  /**
   * Reference to a field of type 'DeliverySource'
   */
  export type EnumDeliverySourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeliverySource'>
    


  /**
   * Reference to a field of type 'DeliverySource[]'
   */
  export type ListEnumDeliverySourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeliverySource[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'GoalPeriod'
   */
  export type EnumGoalPeriodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GoalPeriod'>
    


  /**
   * Reference to a field of type 'GoalPeriod[]'
   */
  export type ListEnumGoalPeriodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GoalPeriod[]'>
    


  /**
   * Reference to a field of type 'PaymentStatus'
   */
  export type EnumPaymentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentStatus'>
    


  /**
   * Reference to a field of type 'PaymentStatus[]'
   */
  export type ListEnumPaymentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentStatus[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    whatsappNumber?: StringFilter<"User"> | string
    email?: StringNullableFilter<"User"> | string | null
    name?: StringNullableFilter<"User"> | string | null
    vehiclePlate?: StringNullableFilter<"User"> | string | null
    city?: StringNullableFilter<"User"> | string | null
    workApps?: JsonFilter<"User">
    subscriptionPaymentMethod?: StringFilter<"User"> | string
    workDays?: JsonFilter<"User">
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    trialEndsAt?: DateTimeNullableFilter<"User"> | Date | string | null
    subscribedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    currentOdometerKm?: DecimalNullableFilter<"User"> | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: StringNullableFilter<"User"> | string | null
    affiliateCouponCode?: StringNullableFilter<"User"> | string | null
    referredAt?: DateTimeNullableFilter<"User"> | Date | string | null
    asaasCustomerId?: StringNullableFilter<"User"> | string | null
    costs?: XOR<CostConfigNullableScalarRelationFilter, CostConfigWhereInput> | null
    deliveries?: DeliveryListRelationFilter
    shifts?: ShiftListRelationFilter
    goals?: GoalListRelationFilter
    payments?: PaymentListRelationFilter
    routes?: RouteListRelationFilter
    fuelRefuels?: FuelRefuelListRelationFilter
    odometerReadings?: OdometerReadingListRelationFilter
    activityLogs?: ActivityLogListRelationFilter
    referredByAffiliate?: XOR<AffiliateNullableScalarRelationFilter, AffiliateWhereInput> | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    whatsappNumber?: SortOrder
    email?: SortOrderInput | SortOrder
    name?: SortOrderInput | SortOrder
    vehiclePlate?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    workApps?: SortOrder
    subscriptionPaymentMethod?: SortOrder
    workDays?: SortOrder
    status?: SortOrder
    trialEndsAt?: SortOrderInput | SortOrder
    subscribedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    currentOdometerKm?: SortOrderInput | SortOrder
    referredByAffiliateId?: SortOrderInput | SortOrder
    affiliateCouponCode?: SortOrderInput | SortOrder
    referredAt?: SortOrderInput | SortOrder
    asaasCustomerId?: SortOrderInput | SortOrder
    costs?: CostConfigOrderByWithRelationInput
    deliveries?: DeliveryOrderByRelationAggregateInput
    shifts?: ShiftOrderByRelationAggregateInput
    goals?: GoalOrderByRelationAggregateInput
    payments?: PaymentOrderByRelationAggregateInput
    routes?: RouteOrderByRelationAggregateInput
    fuelRefuels?: FuelRefuelOrderByRelationAggregateInput
    odometerReadings?: OdometerReadingOrderByRelationAggregateInput
    activityLogs?: ActivityLogOrderByRelationAggregateInput
    referredByAffiliate?: AffiliateOrderByWithRelationInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    whatsappNumber?: string
    email?: string
    asaasCustomerId?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    vehiclePlate?: StringNullableFilter<"User"> | string | null
    city?: StringNullableFilter<"User"> | string | null
    workApps?: JsonFilter<"User">
    subscriptionPaymentMethod?: StringFilter<"User"> | string
    workDays?: JsonFilter<"User">
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    trialEndsAt?: DateTimeNullableFilter<"User"> | Date | string | null
    subscribedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    currentOdometerKm?: DecimalNullableFilter<"User"> | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: StringNullableFilter<"User"> | string | null
    affiliateCouponCode?: StringNullableFilter<"User"> | string | null
    referredAt?: DateTimeNullableFilter<"User"> | Date | string | null
    costs?: XOR<CostConfigNullableScalarRelationFilter, CostConfigWhereInput> | null
    deliveries?: DeliveryListRelationFilter
    shifts?: ShiftListRelationFilter
    goals?: GoalListRelationFilter
    payments?: PaymentListRelationFilter
    routes?: RouteListRelationFilter
    fuelRefuels?: FuelRefuelListRelationFilter
    odometerReadings?: OdometerReadingListRelationFilter
    activityLogs?: ActivityLogListRelationFilter
    referredByAffiliate?: XOR<AffiliateNullableScalarRelationFilter, AffiliateWhereInput> | null
  }, "id" | "whatsappNumber" | "email" | "asaasCustomerId">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    whatsappNumber?: SortOrder
    email?: SortOrderInput | SortOrder
    name?: SortOrderInput | SortOrder
    vehiclePlate?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    workApps?: SortOrder
    subscriptionPaymentMethod?: SortOrder
    workDays?: SortOrder
    status?: SortOrder
    trialEndsAt?: SortOrderInput | SortOrder
    subscribedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    currentOdometerKm?: SortOrderInput | SortOrder
    referredByAffiliateId?: SortOrderInput | SortOrder
    affiliateCouponCode?: SortOrderInput | SortOrder
    referredAt?: SortOrderInput | SortOrder
    asaasCustomerId?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    whatsappNumber?: StringWithAggregatesFilter<"User"> | string
    email?: StringNullableWithAggregatesFilter<"User"> | string | null
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    vehiclePlate?: StringNullableWithAggregatesFilter<"User"> | string | null
    city?: StringNullableWithAggregatesFilter<"User"> | string | null
    workApps?: JsonWithAggregatesFilter<"User">
    subscriptionPaymentMethod?: StringWithAggregatesFilter<"User"> | string
    workDays?: JsonWithAggregatesFilter<"User">
    status?: EnumUserStatusWithAggregatesFilter<"User"> | $Enums.UserStatus
    trialEndsAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    subscribedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    currentOdometerKm?: DecimalNullableWithAggregatesFilter<"User"> | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: StringNullableWithAggregatesFilter<"User"> | string | null
    affiliateCouponCode?: StringNullableWithAggregatesFilter<"User"> | string | null
    referredAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    asaasCustomerId?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type AffiliateWhereInput = {
    AND?: AffiliateWhereInput | AffiliateWhereInput[]
    OR?: AffiliateWhereInput[]
    NOT?: AffiliateWhereInput | AffiliateWhereInput[]
    id?: StringFilter<"Affiliate"> | string
    name?: StringFilter<"Affiliate"> | string
    code?: StringFilter<"Affiliate"> | string
    active?: BoolFilter<"Affiliate"> | boolean
    phone?: StringNullableFilter<"Affiliate"> | string | null
    email?: StringNullableFilter<"Affiliate"> | string | null
    notes?: StringNullableFilter<"Affiliate"> | string | null
    createdAt?: DateTimeFilter<"Affiliate"> | Date | string
    updatedAt?: DateTimeFilter<"Affiliate"> | Date | string
    referrals?: UserListRelationFilter
  }

  export type AffiliateOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    active?: SortOrder
    phone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    referrals?: UserOrderByRelationAggregateInput
  }

  export type AffiliateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: AffiliateWhereInput | AffiliateWhereInput[]
    OR?: AffiliateWhereInput[]
    NOT?: AffiliateWhereInput | AffiliateWhereInput[]
    name?: StringFilter<"Affiliate"> | string
    active?: BoolFilter<"Affiliate"> | boolean
    phone?: StringNullableFilter<"Affiliate"> | string | null
    email?: StringNullableFilter<"Affiliate"> | string | null
    notes?: StringNullableFilter<"Affiliate"> | string | null
    createdAt?: DateTimeFilter<"Affiliate"> | Date | string
    updatedAt?: DateTimeFilter<"Affiliate"> | Date | string
    referrals?: UserListRelationFilter
  }, "id" | "code">

  export type AffiliateOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    active?: SortOrder
    phone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AffiliateCountOrderByAggregateInput
    _max?: AffiliateMaxOrderByAggregateInput
    _min?: AffiliateMinOrderByAggregateInput
  }

  export type AffiliateScalarWhereWithAggregatesInput = {
    AND?: AffiliateScalarWhereWithAggregatesInput | AffiliateScalarWhereWithAggregatesInput[]
    OR?: AffiliateScalarWhereWithAggregatesInput[]
    NOT?: AffiliateScalarWhereWithAggregatesInput | AffiliateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Affiliate"> | string
    name?: StringWithAggregatesFilter<"Affiliate"> | string
    code?: StringWithAggregatesFilter<"Affiliate"> | string
    active?: BoolWithAggregatesFilter<"Affiliate"> | boolean
    phone?: StringNullableWithAggregatesFilter<"Affiliate"> | string | null
    email?: StringNullableWithAggregatesFilter<"Affiliate"> | string | null
    notes?: StringNullableWithAggregatesFilter<"Affiliate"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Affiliate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Affiliate"> | Date | string
  }

  export type ActivityLogWhereInput = {
    AND?: ActivityLogWhereInput | ActivityLogWhereInput[]
    OR?: ActivityLogWhereInput[]
    NOT?: ActivityLogWhereInput | ActivityLogWhereInput[]
    id?: StringFilter<"ActivityLog"> | string
    userId?: StringFilter<"ActivityLog"> | string
    category?: EnumActivityCategoryFilter<"ActivityLog"> | $Enums.ActivityCategory
    action?: EnumActivityActionFilter<"ActivityLog"> | $Enums.ActivityAction
    title?: StringFilter<"ActivityLog"> | string
    changes?: JsonFilter<"ActivityLog">
    entityId?: StringNullableFilter<"ActivityLog"> | string | null
    source?: StringFilter<"ActivityLog"> | string
    createdAt?: DateTimeFilter<"ActivityLog"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ActivityLogOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    action?: SortOrder
    title?: SortOrder
    changes?: SortOrder
    entityId?: SortOrderInput | SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type ActivityLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ActivityLogWhereInput | ActivityLogWhereInput[]
    OR?: ActivityLogWhereInput[]
    NOT?: ActivityLogWhereInput | ActivityLogWhereInput[]
    userId?: StringFilter<"ActivityLog"> | string
    category?: EnumActivityCategoryFilter<"ActivityLog"> | $Enums.ActivityCategory
    action?: EnumActivityActionFilter<"ActivityLog"> | $Enums.ActivityAction
    title?: StringFilter<"ActivityLog"> | string
    changes?: JsonFilter<"ActivityLog">
    entityId?: StringNullableFilter<"ActivityLog"> | string | null
    source?: StringFilter<"ActivityLog"> | string
    createdAt?: DateTimeFilter<"ActivityLog"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type ActivityLogOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    action?: SortOrder
    title?: SortOrder
    changes?: SortOrder
    entityId?: SortOrderInput | SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    _count?: ActivityLogCountOrderByAggregateInput
    _max?: ActivityLogMaxOrderByAggregateInput
    _min?: ActivityLogMinOrderByAggregateInput
  }

  export type ActivityLogScalarWhereWithAggregatesInput = {
    AND?: ActivityLogScalarWhereWithAggregatesInput | ActivityLogScalarWhereWithAggregatesInput[]
    OR?: ActivityLogScalarWhereWithAggregatesInput[]
    NOT?: ActivityLogScalarWhereWithAggregatesInput | ActivityLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ActivityLog"> | string
    userId?: StringWithAggregatesFilter<"ActivityLog"> | string
    category?: EnumActivityCategoryWithAggregatesFilter<"ActivityLog"> | $Enums.ActivityCategory
    action?: EnumActivityActionWithAggregatesFilter<"ActivityLog"> | $Enums.ActivityAction
    title?: StringWithAggregatesFilter<"ActivityLog"> | string
    changes?: JsonWithAggregatesFilter<"ActivityLog">
    entityId?: StringNullableWithAggregatesFilter<"ActivityLog"> | string | null
    source?: StringWithAggregatesFilter<"ActivityLog"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ActivityLog"> | Date | string
  }

  export type CostConfigWhereInput = {
    AND?: CostConfigWhereInput | CostConfigWhereInput[]
    OR?: CostConfigWhereInput[]
    NOT?: CostConfigWhereInput | CostConfigWhereInput[]
    id?: StringFilter<"CostConfig"> | string
    userId?: StringFilter<"CostConfig"> | string
    fuelPricePerLiter?: DecimalFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    kmPerLiter?: DecimalFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    maintenancePerKm?: DecimalFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    dailyFoodCost?: DecimalFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    otherDailyCost?: DecimalFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFilter<"CostConfig"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type CostConfigOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    fuelPricePerLiter?: SortOrder
    kmPerLiter?: SortOrder
    maintenancePerKm?: SortOrder
    dailyFoodCost?: SortOrder
    otherDailyCost?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type CostConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: CostConfigWhereInput | CostConfigWhereInput[]
    OR?: CostConfigWhereInput[]
    NOT?: CostConfigWhereInput | CostConfigWhereInput[]
    fuelPricePerLiter?: DecimalFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    kmPerLiter?: DecimalFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    maintenancePerKm?: DecimalFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    dailyFoodCost?: DecimalFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    otherDailyCost?: DecimalFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFilter<"CostConfig"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type CostConfigOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    fuelPricePerLiter?: SortOrder
    kmPerLiter?: SortOrder
    maintenancePerKm?: SortOrder
    dailyFoodCost?: SortOrder
    otherDailyCost?: SortOrder
    updatedAt?: SortOrder
    _count?: CostConfigCountOrderByAggregateInput
    _avg?: CostConfigAvgOrderByAggregateInput
    _max?: CostConfigMaxOrderByAggregateInput
    _min?: CostConfigMinOrderByAggregateInput
    _sum?: CostConfigSumOrderByAggregateInput
  }

  export type CostConfigScalarWhereWithAggregatesInput = {
    AND?: CostConfigScalarWhereWithAggregatesInput | CostConfigScalarWhereWithAggregatesInput[]
    OR?: CostConfigScalarWhereWithAggregatesInput[]
    NOT?: CostConfigScalarWhereWithAggregatesInput | CostConfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CostConfig"> | string
    userId?: StringWithAggregatesFilter<"CostConfig"> | string
    fuelPricePerLiter?: DecimalWithAggregatesFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    kmPerLiter?: DecimalWithAggregatesFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    maintenancePerKm?: DecimalWithAggregatesFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    dailyFoodCost?: DecimalWithAggregatesFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    otherDailyCost?: DecimalWithAggregatesFilter<"CostConfig"> | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeWithAggregatesFilter<"CostConfig"> | Date | string
  }

  export type DeliveryWhereInput = {
    AND?: DeliveryWhereInput | DeliveryWhereInput[]
    OR?: DeliveryWhereInput[]
    NOT?: DeliveryWhereInput | DeliveryWhereInput[]
    id?: StringFilter<"Delivery"> | string
    userId?: StringFilter<"Delivery"> | string
    source?: EnumDeliverySourceFilter<"Delivery"> | $Enums.DeliverySource
    grossValue?: DecimalFilter<"Delivery"> | Decimal | DecimalJsLike | number | string
    distanceKm?: DecimalNullableFilter<"Delivery"> | Decimal | DecimalJsLike | number | string | null
    durationMin?: IntNullableFilter<"Delivery"> | number | null
    originName?: StringNullableFilter<"Delivery"> | string | null
    destinationAddr?: StringNullableFilter<"Delivery"> | string | null
    destinationLat?: FloatNullableFilter<"Delivery"> | number | null
    destinationLng?: FloatNullableFilter<"Delivery"> | number | null
    proofPhotoUrl?: StringNullableFilter<"Delivery"> | string | null
    proofLat?: FloatNullableFilter<"Delivery"> | number | null
    proofLng?: FloatNullableFilter<"Delivery"> | number | null
    proofAt?: DateTimeNullableFilter<"Delivery"> | Date | string | null
    rawInput?: JsonFilter<"Delivery">
    parsedAt?: DateTimeFilter<"Delivery"> | Date | string
    occurredAt?: DateTimeFilter<"Delivery"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type DeliveryOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    grossValue?: SortOrder
    distanceKm?: SortOrderInput | SortOrder
    durationMin?: SortOrderInput | SortOrder
    originName?: SortOrderInput | SortOrder
    destinationAddr?: SortOrderInput | SortOrder
    destinationLat?: SortOrderInput | SortOrder
    destinationLng?: SortOrderInput | SortOrder
    proofPhotoUrl?: SortOrderInput | SortOrder
    proofLat?: SortOrderInput | SortOrder
    proofLng?: SortOrderInput | SortOrder
    proofAt?: SortOrderInput | SortOrder
    rawInput?: SortOrder
    parsedAt?: SortOrder
    occurredAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type DeliveryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DeliveryWhereInput | DeliveryWhereInput[]
    OR?: DeliveryWhereInput[]
    NOT?: DeliveryWhereInput | DeliveryWhereInput[]
    userId?: StringFilter<"Delivery"> | string
    source?: EnumDeliverySourceFilter<"Delivery"> | $Enums.DeliverySource
    grossValue?: DecimalFilter<"Delivery"> | Decimal | DecimalJsLike | number | string
    distanceKm?: DecimalNullableFilter<"Delivery"> | Decimal | DecimalJsLike | number | string | null
    durationMin?: IntNullableFilter<"Delivery"> | number | null
    originName?: StringNullableFilter<"Delivery"> | string | null
    destinationAddr?: StringNullableFilter<"Delivery"> | string | null
    destinationLat?: FloatNullableFilter<"Delivery"> | number | null
    destinationLng?: FloatNullableFilter<"Delivery"> | number | null
    proofPhotoUrl?: StringNullableFilter<"Delivery"> | string | null
    proofLat?: FloatNullableFilter<"Delivery"> | number | null
    proofLng?: FloatNullableFilter<"Delivery"> | number | null
    proofAt?: DateTimeNullableFilter<"Delivery"> | Date | string | null
    rawInput?: JsonFilter<"Delivery">
    parsedAt?: DateTimeFilter<"Delivery"> | Date | string
    occurredAt?: DateTimeFilter<"Delivery"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type DeliveryOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    grossValue?: SortOrder
    distanceKm?: SortOrderInput | SortOrder
    durationMin?: SortOrderInput | SortOrder
    originName?: SortOrderInput | SortOrder
    destinationAddr?: SortOrderInput | SortOrder
    destinationLat?: SortOrderInput | SortOrder
    destinationLng?: SortOrderInput | SortOrder
    proofPhotoUrl?: SortOrderInput | SortOrder
    proofLat?: SortOrderInput | SortOrder
    proofLng?: SortOrderInput | SortOrder
    proofAt?: SortOrderInput | SortOrder
    rawInput?: SortOrder
    parsedAt?: SortOrder
    occurredAt?: SortOrder
    _count?: DeliveryCountOrderByAggregateInput
    _avg?: DeliveryAvgOrderByAggregateInput
    _max?: DeliveryMaxOrderByAggregateInput
    _min?: DeliveryMinOrderByAggregateInput
    _sum?: DeliverySumOrderByAggregateInput
  }

  export type DeliveryScalarWhereWithAggregatesInput = {
    AND?: DeliveryScalarWhereWithAggregatesInput | DeliveryScalarWhereWithAggregatesInput[]
    OR?: DeliveryScalarWhereWithAggregatesInput[]
    NOT?: DeliveryScalarWhereWithAggregatesInput | DeliveryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Delivery"> | string
    userId?: StringWithAggregatesFilter<"Delivery"> | string
    source?: EnumDeliverySourceWithAggregatesFilter<"Delivery"> | $Enums.DeliverySource
    grossValue?: DecimalWithAggregatesFilter<"Delivery"> | Decimal | DecimalJsLike | number | string
    distanceKm?: DecimalNullableWithAggregatesFilter<"Delivery"> | Decimal | DecimalJsLike | number | string | null
    durationMin?: IntNullableWithAggregatesFilter<"Delivery"> | number | null
    originName?: StringNullableWithAggregatesFilter<"Delivery"> | string | null
    destinationAddr?: StringNullableWithAggregatesFilter<"Delivery"> | string | null
    destinationLat?: FloatNullableWithAggregatesFilter<"Delivery"> | number | null
    destinationLng?: FloatNullableWithAggregatesFilter<"Delivery"> | number | null
    proofPhotoUrl?: StringNullableWithAggregatesFilter<"Delivery"> | string | null
    proofLat?: FloatNullableWithAggregatesFilter<"Delivery"> | number | null
    proofLng?: FloatNullableWithAggregatesFilter<"Delivery"> | number | null
    proofAt?: DateTimeNullableWithAggregatesFilter<"Delivery"> | Date | string | null
    rawInput?: JsonWithAggregatesFilter<"Delivery">
    parsedAt?: DateTimeWithAggregatesFilter<"Delivery"> | Date | string
    occurredAt?: DateTimeWithAggregatesFilter<"Delivery"> | Date | string
  }

  export type ShiftWhereInput = {
    AND?: ShiftWhereInput | ShiftWhereInput[]
    OR?: ShiftWhereInput[]
    NOT?: ShiftWhereInput | ShiftWhereInput[]
    id?: StringFilter<"Shift"> | string
    userId?: StringFilter<"Shift"> | string
    startedAt?: DateTimeFilter<"Shift"> | Date | string
    endedAt?: DateTimeNullableFilter<"Shift"> | Date | string | null
    startKm?: DecimalNullableFilter<"Shift"> | Decimal | DecimalJsLike | number | string | null
    endKm?: DecimalNullableFilter<"Shift"> | Decimal | DecimalJsLike | number | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ShiftOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrderInput | SortOrder
    startKm?: SortOrderInput | SortOrder
    endKm?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type ShiftWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ShiftWhereInput | ShiftWhereInput[]
    OR?: ShiftWhereInput[]
    NOT?: ShiftWhereInput | ShiftWhereInput[]
    userId?: StringFilter<"Shift"> | string
    startedAt?: DateTimeFilter<"Shift"> | Date | string
    endedAt?: DateTimeNullableFilter<"Shift"> | Date | string | null
    startKm?: DecimalNullableFilter<"Shift"> | Decimal | DecimalJsLike | number | string | null
    endKm?: DecimalNullableFilter<"Shift"> | Decimal | DecimalJsLike | number | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type ShiftOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrderInput | SortOrder
    startKm?: SortOrderInput | SortOrder
    endKm?: SortOrderInput | SortOrder
    _count?: ShiftCountOrderByAggregateInput
    _avg?: ShiftAvgOrderByAggregateInput
    _max?: ShiftMaxOrderByAggregateInput
    _min?: ShiftMinOrderByAggregateInput
    _sum?: ShiftSumOrderByAggregateInput
  }

  export type ShiftScalarWhereWithAggregatesInput = {
    AND?: ShiftScalarWhereWithAggregatesInput | ShiftScalarWhereWithAggregatesInput[]
    OR?: ShiftScalarWhereWithAggregatesInput[]
    NOT?: ShiftScalarWhereWithAggregatesInput | ShiftScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Shift"> | string
    userId?: StringWithAggregatesFilter<"Shift"> | string
    startedAt?: DateTimeWithAggregatesFilter<"Shift"> | Date | string
    endedAt?: DateTimeNullableWithAggregatesFilter<"Shift"> | Date | string | null
    startKm?: DecimalNullableWithAggregatesFilter<"Shift"> | Decimal | DecimalJsLike | number | string | null
    endKm?: DecimalNullableWithAggregatesFilter<"Shift"> | Decimal | DecimalJsLike | number | string | null
  }

  export type GoalWhereInput = {
    AND?: GoalWhereInput | GoalWhereInput[]
    OR?: GoalWhereInput[]
    NOT?: GoalWhereInput | GoalWhereInput[]
    id?: StringFilter<"Goal"> | string
    userId?: StringFilter<"Goal"> | string
    period?: EnumGoalPeriodFilter<"Goal"> | $Enums.GoalPeriod
    targetValue?: DecimalFilter<"Goal"> | Decimal | DecimalJsLike | number | string
    active?: BoolFilter<"Goal"> | boolean
    createdAt?: DateTimeFilter<"Goal"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type GoalOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    period?: SortOrder
    targetValue?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type GoalWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GoalWhereInput | GoalWhereInput[]
    OR?: GoalWhereInput[]
    NOT?: GoalWhereInput | GoalWhereInput[]
    userId?: StringFilter<"Goal"> | string
    period?: EnumGoalPeriodFilter<"Goal"> | $Enums.GoalPeriod
    targetValue?: DecimalFilter<"Goal"> | Decimal | DecimalJsLike | number | string
    active?: BoolFilter<"Goal"> | boolean
    createdAt?: DateTimeFilter<"Goal"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type GoalOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    period?: SortOrder
    targetValue?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    _count?: GoalCountOrderByAggregateInput
    _avg?: GoalAvgOrderByAggregateInput
    _max?: GoalMaxOrderByAggregateInput
    _min?: GoalMinOrderByAggregateInput
    _sum?: GoalSumOrderByAggregateInput
  }

  export type GoalScalarWhereWithAggregatesInput = {
    AND?: GoalScalarWhereWithAggregatesInput | GoalScalarWhereWithAggregatesInput[]
    OR?: GoalScalarWhereWithAggregatesInput[]
    NOT?: GoalScalarWhereWithAggregatesInput | GoalScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Goal"> | string
    userId?: StringWithAggregatesFilter<"Goal"> | string
    period?: EnumGoalPeriodWithAggregatesFilter<"Goal"> | $Enums.GoalPeriod
    targetValue?: DecimalWithAggregatesFilter<"Goal"> | Decimal | DecimalJsLike | number | string
    active?: BoolWithAggregatesFilter<"Goal"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Goal"> | Date | string
  }

  export type RouteWhereInput = {
    AND?: RouteWhereInput | RouteWhereInput[]
    OR?: RouteWhereInput[]
    NOT?: RouteWhereInput | RouteWhereInput[]
    id?: StringFilter<"Route"> | string
    userId?: StringFilter<"Route"> | string
    addresses?: JsonFilter<"Route">
    optimizedOrder?: JsonFilter<"Route">
    totalKm?: DecimalFilter<"Route"> | Decimal | DecimalJsLike | number | string
    totalMin?: IntFilter<"Route"> | number
    createdAt?: DateTimeFilter<"Route"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type RouteOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    addresses?: SortOrder
    optimizedOrder?: SortOrder
    totalKm?: SortOrder
    totalMin?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type RouteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RouteWhereInput | RouteWhereInput[]
    OR?: RouteWhereInput[]
    NOT?: RouteWhereInput | RouteWhereInput[]
    userId?: StringFilter<"Route"> | string
    addresses?: JsonFilter<"Route">
    optimizedOrder?: JsonFilter<"Route">
    totalKm?: DecimalFilter<"Route"> | Decimal | DecimalJsLike | number | string
    totalMin?: IntFilter<"Route"> | number
    createdAt?: DateTimeFilter<"Route"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type RouteOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    addresses?: SortOrder
    optimizedOrder?: SortOrder
    totalKm?: SortOrder
    totalMin?: SortOrder
    createdAt?: SortOrder
    _count?: RouteCountOrderByAggregateInput
    _avg?: RouteAvgOrderByAggregateInput
    _max?: RouteMaxOrderByAggregateInput
    _min?: RouteMinOrderByAggregateInput
    _sum?: RouteSumOrderByAggregateInput
  }

  export type RouteScalarWhereWithAggregatesInput = {
    AND?: RouteScalarWhereWithAggregatesInput | RouteScalarWhereWithAggregatesInput[]
    OR?: RouteScalarWhereWithAggregatesInput[]
    NOT?: RouteScalarWhereWithAggregatesInput | RouteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Route"> | string
    userId?: StringWithAggregatesFilter<"Route"> | string
    addresses?: JsonWithAggregatesFilter<"Route">
    optimizedOrder?: JsonWithAggregatesFilter<"Route">
    totalKm?: DecimalWithAggregatesFilter<"Route"> | Decimal | DecimalJsLike | number | string
    totalMin?: IntWithAggregatesFilter<"Route"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Route"> | Date | string
  }

  export type PaymentWhereInput = {
    AND?: PaymentWhereInput | PaymentWhereInput[]
    OR?: PaymentWhereInput[]
    NOT?: PaymentWhereInput | PaymentWhereInput[]
    id?: StringFilter<"Payment"> | string
    userId?: StringFilter<"Payment"> | string
    asaasChargeId?: StringNullableFilter<"Payment"> | string | null
    status?: EnumPaymentStatusFilter<"Payment"> | $Enums.PaymentStatus
    amount?: DecimalFilter<"Payment"> | Decimal | DecimalJsLike | number | string
    paidAt?: DateTimeNullableFilter<"Payment"> | Date | string | null
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type PaymentOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    asaasChargeId?: SortOrderInput | SortOrder
    status?: SortOrder
    amount?: SortOrder
    paidAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type PaymentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    asaasChargeId?: string
    AND?: PaymentWhereInput | PaymentWhereInput[]
    OR?: PaymentWhereInput[]
    NOT?: PaymentWhereInput | PaymentWhereInput[]
    userId?: StringFilter<"Payment"> | string
    status?: EnumPaymentStatusFilter<"Payment"> | $Enums.PaymentStatus
    amount?: DecimalFilter<"Payment"> | Decimal | DecimalJsLike | number | string
    paidAt?: DateTimeNullableFilter<"Payment"> | Date | string | null
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "asaasChargeId">

  export type PaymentOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    asaasChargeId?: SortOrderInput | SortOrder
    status?: SortOrder
    amount?: SortOrder
    paidAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: PaymentCountOrderByAggregateInput
    _avg?: PaymentAvgOrderByAggregateInput
    _max?: PaymentMaxOrderByAggregateInput
    _min?: PaymentMinOrderByAggregateInput
    _sum?: PaymentSumOrderByAggregateInput
  }

  export type PaymentScalarWhereWithAggregatesInput = {
    AND?: PaymentScalarWhereWithAggregatesInput | PaymentScalarWhereWithAggregatesInput[]
    OR?: PaymentScalarWhereWithAggregatesInput[]
    NOT?: PaymentScalarWhereWithAggregatesInput | PaymentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Payment"> | string
    userId?: StringWithAggregatesFilter<"Payment"> | string
    asaasChargeId?: StringNullableWithAggregatesFilter<"Payment"> | string | null
    status?: EnumPaymentStatusWithAggregatesFilter<"Payment"> | $Enums.PaymentStatus
    amount?: DecimalWithAggregatesFilter<"Payment"> | Decimal | DecimalJsLike | number | string
    paidAt?: DateTimeNullableWithAggregatesFilter<"Payment"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Payment"> | Date | string
  }

  export type WhatsAppMessageWhereInput = {
    AND?: WhatsAppMessageWhereInput | WhatsAppMessageWhereInput[]
    OR?: WhatsAppMessageWhereInput[]
    NOT?: WhatsAppMessageWhereInput | WhatsAppMessageWhereInput[]
    id?: StringFilter<"WhatsAppMessage"> | string
    userId?: StringNullableFilter<"WhatsAppMessage"> | string | null
    fromNumber?: StringFilter<"WhatsAppMessage"> | string
    messageType?: StringFilter<"WhatsAppMessage"> | string
    rawContent?: JsonFilter<"WhatsAppMessage">
    processedAs?: StringNullableFilter<"WhatsAppMessage"> | string | null
    receivedAt?: DateTimeFilter<"WhatsAppMessage"> | Date | string
  }

  export type WhatsAppMessageOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    fromNumber?: SortOrder
    messageType?: SortOrder
    rawContent?: SortOrder
    processedAs?: SortOrderInput | SortOrder
    receivedAt?: SortOrder
  }

  export type WhatsAppMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WhatsAppMessageWhereInput | WhatsAppMessageWhereInput[]
    OR?: WhatsAppMessageWhereInput[]
    NOT?: WhatsAppMessageWhereInput | WhatsAppMessageWhereInput[]
    userId?: StringNullableFilter<"WhatsAppMessage"> | string | null
    fromNumber?: StringFilter<"WhatsAppMessage"> | string
    messageType?: StringFilter<"WhatsAppMessage"> | string
    rawContent?: JsonFilter<"WhatsAppMessage">
    processedAs?: StringNullableFilter<"WhatsAppMessage"> | string | null
    receivedAt?: DateTimeFilter<"WhatsAppMessage"> | Date | string
  }, "id">

  export type WhatsAppMessageOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    fromNumber?: SortOrder
    messageType?: SortOrder
    rawContent?: SortOrder
    processedAs?: SortOrderInput | SortOrder
    receivedAt?: SortOrder
    _count?: WhatsAppMessageCountOrderByAggregateInput
    _max?: WhatsAppMessageMaxOrderByAggregateInput
    _min?: WhatsAppMessageMinOrderByAggregateInput
  }

  export type WhatsAppMessageScalarWhereWithAggregatesInput = {
    AND?: WhatsAppMessageScalarWhereWithAggregatesInput | WhatsAppMessageScalarWhereWithAggregatesInput[]
    OR?: WhatsAppMessageScalarWhereWithAggregatesInput[]
    NOT?: WhatsAppMessageScalarWhereWithAggregatesInput | WhatsAppMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WhatsAppMessage"> | string
    userId?: StringNullableWithAggregatesFilter<"WhatsAppMessage"> | string | null
    fromNumber?: StringWithAggregatesFilter<"WhatsAppMessage"> | string
    messageType?: StringWithAggregatesFilter<"WhatsAppMessage"> | string
    rawContent?: JsonWithAggregatesFilter<"WhatsAppMessage">
    processedAs?: StringNullableWithAggregatesFilter<"WhatsAppMessage"> | string | null
    receivedAt?: DateTimeWithAggregatesFilter<"WhatsAppMessage"> | Date | string
  }

  export type FuelRefuelWhereInput = {
    AND?: FuelRefuelWhereInput | FuelRefuelWhereInput[]
    OR?: FuelRefuelWhereInput[]
    NOT?: FuelRefuelWhereInput | FuelRefuelWhereInput[]
    id?: StringFilter<"FuelRefuel"> | string
    userId?: StringFilter<"FuelRefuel"> | string
    totalAmount?: DecimalFilter<"FuelRefuel"> | Decimal | DecimalJsLike | number | string
    liters?: DecimalFilter<"FuelRefuel"> | Decimal | DecimalJsLike | number | string
    pricePerLiter?: DecimalFilter<"FuelRefuel"> | Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: StringNullableFilter<"FuelRefuel"> | string | null
    rawInput?: JsonFilter<"FuelRefuel">
    occurredAt?: DateTimeFilter<"FuelRefuel"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type FuelRefuelOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    totalAmount?: SortOrder
    liters?: SortOrder
    pricePerLiter?: SortOrder
    receiptPhotoUrl?: SortOrderInput | SortOrder
    rawInput?: SortOrder
    occurredAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type FuelRefuelWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FuelRefuelWhereInput | FuelRefuelWhereInput[]
    OR?: FuelRefuelWhereInput[]
    NOT?: FuelRefuelWhereInput | FuelRefuelWhereInput[]
    userId?: StringFilter<"FuelRefuel"> | string
    totalAmount?: DecimalFilter<"FuelRefuel"> | Decimal | DecimalJsLike | number | string
    liters?: DecimalFilter<"FuelRefuel"> | Decimal | DecimalJsLike | number | string
    pricePerLiter?: DecimalFilter<"FuelRefuel"> | Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: StringNullableFilter<"FuelRefuel"> | string | null
    rawInput?: JsonFilter<"FuelRefuel">
    occurredAt?: DateTimeFilter<"FuelRefuel"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type FuelRefuelOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    totalAmount?: SortOrder
    liters?: SortOrder
    pricePerLiter?: SortOrder
    receiptPhotoUrl?: SortOrderInput | SortOrder
    rawInput?: SortOrder
    occurredAt?: SortOrder
    _count?: FuelRefuelCountOrderByAggregateInput
    _avg?: FuelRefuelAvgOrderByAggregateInput
    _max?: FuelRefuelMaxOrderByAggregateInput
    _min?: FuelRefuelMinOrderByAggregateInput
    _sum?: FuelRefuelSumOrderByAggregateInput
  }

  export type FuelRefuelScalarWhereWithAggregatesInput = {
    AND?: FuelRefuelScalarWhereWithAggregatesInput | FuelRefuelScalarWhereWithAggregatesInput[]
    OR?: FuelRefuelScalarWhereWithAggregatesInput[]
    NOT?: FuelRefuelScalarWhereWithAggregatesInput | FuelRefuelScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FuelRefuel"> | string
    userId?: StringWithAggregatesFilter<"FuelRefuel"> | string
    totalAmount?: DecimalWithAggregatesFilter<"FuelRefuel"> | Decimal | DecimalJsLike | number | string
    liters?: DecimalWithAggregatesFilter<"FuelRefuel"> | Decimal | DecimalJsLike | number | string
    pricePerLiter?: DecimalWithAggregatesFilter<"FuelRefuel"> | Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: StringNullableWithAggregatesFilter<"FuelRefuel"> | string | null
    rawInput?: JsonWithAggregatesFilter<"FuelRefuel">
    occurredAt?: DateTimeWithAggregatesFilter<"FuelRefuel"> | Date | string
  }

  export type OdometerReadingWhereInput = {
    AND?: OdometerReadingWhereInput | OdometerReadingWhereInput[]
    OR?: OdometerReadingWhereInput[]
    NOT?: OdometerReadingWhereInput | OdometerReadingWhereInput[]
    id?: StringFilter<"OdometerReading"> | string
    userId?: StringFilter<"OdometerReading"> | string
    odometerKm?: DecimalFilter<"OdometerReading"> | Decimal | DecimalJsLike | number | string
    photoUrl?: StringNullableFilter<"OdometerReading"> | string | null
    rawInput?: JsonFilter<"OdometerReading">
    recordedAt?: DateTimeFilter<"OdometerReading"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type OdometerReadingOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    odometerKm?: SortOrder
    photoUrl?: SortOrderInput | SortOrder
    rawInput?: SortOrder
    recordedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type OdometerReadingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OdometerReadingWhereInput | OdometerReadingWhereInput[]
    OR?: OdometerReadingWhereInput[]
    NOT?: OdometerReadingWhereInput | OdometerReadingWhereInput[]
    userId?: StringFilter<"OdometerReading"> | string
    odometerKm?: DecimalFilter<"OdometerReading"> | Decimal | DecimalJsLike | number | string
    photoUrl?: StringNullableFilter<"OdometerReading"> | string | null
    rawInput?: JsonFilter<"OdometerReading">
    recordedAt?: DateTimeFilter<"OdometerReading"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type OdometerReadingOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    odometerKm?: SortOrder
    photoUrl?: SortOrderInput | SortOrder
    rawInput?: SortOrder
    recordedAt?: SortOrder
    _count?: OdometerReadingCountOrderByAggregateInput
    _avg?: OdometerReadingAvgOrderByAggregateInput
    _max?: OdometerReadingMaxOrderByAggregateInput
    _min?: OdometerReadingMinOrderByAggregateInput
    _sum?: OdometerReadingSumOrderByAggregateInput
  }

  export type OdometerReadingScalarWhereWithAggregatesInput = {
    AND?: OdometerReadingScalarWhereWithAggregatesInput | OdometerReadingScalarWhereWithAggregatesInput[]
    OR?: OdometerReadingScalarWhereWithAggregatesInput[]
    NOT?: OdometerReadingScalarWhereWithAggregatesInput | OdometerReadingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OdometerReading"> | string
    userId?: StringWithAggregatesFilter<"OdometerReading"> | string
    odometerKm?: DecimalWithAggregatesFilter<"OdometerReading"> | Decimal | DecimalJsLike | number | string
    photoUrl?: StringNullableWithAggregatesFilter<"OdometerReading"> | string | null
    rawInput?: JsonWithAggregatesFilter<"OdometerReading">
    recordedAt?: DateTimeWithAggregatesFilter<"OdometerReading"> | Date | string
  }

  export type AuthCodeWhereInput = {
    AND?: AuthCodeWhereInput | AuthCodeWhereInput[]
    OR?: AuthCodeWhereInput[]
    NOT?: AuthCodeWhereInput | AuthCodeWhereInput[]
    id?: StringFilter<"AuthCode"> | string
    phone?: StringFilter<"AuthCode"> | string
    code?: StringFilter<"AuthCode"> | string
    expiresAt?: DateTimeFilter<"AuthCode"> | Date | string
    createdAt?: DateTimeFilter<"AuthCode"> | Date | string
  }

  export type AuthCodeOrderByWithRelationInput = {
    id?: SortOrder
    phone?: SortOrder
    code?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AuthCodeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuthCodeWhereInput | AuthCodeWhereInput[]
    OR?: AuthCodeWhereInput[]
    NOT?: AuthCodeWhereInput | AuthCodeWhereInput[]
    phone?: StringFilter<"AuthCode"> | string
    code?: StringFilter<"AuthCode"> | string
    expiresAt?: DateTimeFilter<"AuthCode"> | Date | string
    createdAt?: DateTimeFilter<"AuthCode"> | Date | string
  }, "id">

  export type AuthCodeOrderByWithAggregationInput = {
    id?: SortOrder
    phone?: SortOrder
    code?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    _count?: AuthCodeCountOrderByAggregateInput
    _max?: AuthCodeMaxOrderByAggregateInput
    _min?: AuthCodeMinOrderByAggregateInput
  }

  export type AuthCodeScalarWhereWithAggregatesInput = {
    AND?: AuthCodeScalarWhereWithAggregatesInput | AuthCodeScalarWhereWithAggregatesInput[]
    OR?: AuthCodeScalarWhereWithAggregatesInput[]
    NOT?: AuthCodeScalarWhereWithAggregatesInput | AuthCodeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuthCode"> | string
    phone?: StringWithAggregatesFilter<"AuthCode"> | string
    code?: StringWithAggregatesFilter<"AuthCode"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"AuthCode"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"AuthCode"> | Date | string
  }

  export type AdminAccountWhereInput = {
    AND?: AdminAccountWhereInput | AdminAccountWhereInput[]
    OR?: AdminAccountWhereInput[]
    NOT?: AdminAccountWhereInput | AdminAccountWhereInput[]
    id?: StringFilter<"AdminAccount"> | string
    email?: StringFilter<"AdminAccount"> | string
    passwordHash?: StringFilter<"AdminAccount"> | string
    createdAt?: DateTimeFilter<"AdminAccount"> | Date | string
    updatedAt?: DateTimeFilter<"AdminAccount"> | Date | string
  }

  export type AdminAccountOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdminAccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: AdminAccountWhereInput | AdminAccountWhereInput[]
    OR?: AdminAccountWhereInput[]
    NOT?: AdminAccountWhereInput | AdminAccountWhereInput[]
    passwordHash?: StringFilter<"AdminAccount"> | string
    createdAt?: DateTimeFilter<"AdminAccount"> | Date | string
    updatedAt?: DateTimeFilter<"AdminAccount"> | Date | string
  }, "id" | "email">

  export type AdminAccountOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AdminAccountCountOrderByAggregateInput
    _max?: AdminAccountMaxOrderByAggregateInput
    _min?: AdminAccountMinOrderByAggregateInput
  }

  export type AdminAccountScalarWhereWithAggregatesInput = {
    AND?: AdminAccountScalarWhereWithAggregatesInput | AdminAccountScalarWhereWithAggregatesInput[]
    OR?: AdminAccountScalarWhereWithAggregatesInput[]
    NOT?: AdminAccountScalarWhereWithAggregatesInput | AdminAccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AdminAccount"> | string
    email?: StringWithAggregatesFilter<"AdminAccount"> | string
    passwordHash?: StringWithAggregatesFilter<"AdminAccount"> | string
    createdAt?: DateTimeWithAggregatesFilter<"AdminAccount"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AdminAccount"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigCreateNestedOneWithoutUserInput
    deliveries?: DeliveryCreateNestedManyWithoutUserInput
    shifts?: ShiftCreateNestedManyWithoutUserInput
    goals?: GoalCreateNestedManyWithoutUserInput
    payments?: PaymentCreateNestedManyWithoutUserInput
    routes?: RouteCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    referredByAffiliate?: AffiliateCreateNestedOneWithoutReferralsInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigUncheckedCreateNestedOneWithoutUserInput
    deliveries?: DeliveryUncheckedCreateNestedManyWithoutUserInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutUserInput
    goals?: GoalUncheckedCreateNestedManyWithoutUserInput
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput
    routes?: RouteUncheckedCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelUncheckedCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUpdateManyWithoutUserNestedInput
    shifts?: ShiftUpdateManyWithoutUserNestedInput
    goals?: GoalUpdateManyWithoutUserNestedInput
    payments?: PaymentUpdateManyWithoutUserNestedInput
    routes?: RouteUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    referredByAffiliate?: AffiliateUpdateOneWithoutReferralsNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: NullableStringFieldUpdateOperationsInput | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUncheckedUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUncheckedUpdateManyWithoutUserNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    goals?: GoalUncheckedUpdateManyWithoutUserNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput
    routes?: RouteUncheckedUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUncheckedUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: NullableStringFieldUpdateOperationsInput | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AffiliateCreateInput = {
    id?: string
    name: string
    code: string
    active?: boolean
    phone?: string | null
    email?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    referrals?: UserCreateNestedManyWithoutReferredByAffiliateInput
  }

  export type AffiliateUncheckedCreateInput = {
    id?: string
    name: string
    code: string
    active?: boolean
    phone?: string | null
    email?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    referrals?: UserUncheckedCreateNestedManyWithoutReferredByAffiliateInput
  }

  export type AffiliateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrals?: UserUpdateManyWithoutReferredByAffiliateNestedInput
  }

  export type AffiliateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrals?: UserUncheckedUpdateManyWithoutReferredByAffiliateNestedInput
  }

  export type AffiliateCreateManyInput = {
    id?: string
    name: string
    code: string
    active?: boolean
    phone?: string | null
    email?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AffiliateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AffiliateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityLogCreateInput = {
    id?: string
    category: $Enums.ActivityCategory
    action: $Enums.ActivityAction
    title: string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: string | null
    source?: string
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutActivityLogsInput
  }

  export type ActivityLogUncheckedCreateInput = {
    id?: string
    userId: string
    category: $Enums.ActivityCategory
    action: $Enums.ActivityAction
    title: string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: string | null
    source?: string
    createdAt?: Date | string
  }

  export type ActivityLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: EnumActivityCategoryFieldUpdateOperationsInput | $Enums.ActivityCategory
    action?: EnumActivityActionFieldUpdateOperationsInput | $Enums.ActivityAction
    title?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutActivityLogsNestedInput
  }

  export type ActivityLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    category?: EnumActivityCategoryFieldUpdateOperationsInput | $Enums.ActivityCategory
    action?: EnumActivityActionFieldUpdateOperationsInput | $Enums.ActivityAction
    title?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityLogCreateManyInput = {
    id?: string
    userId: string
    category: $Enums.ActivityCategory
    action: $Enums.ActivityAction
    title: string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: string | null
    source?: string
    createdAt?: Date | string
  }

  export type ActivityLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: EnumActivityCategoryFieldUpdateOperationsInput | $Enums.ActivityCategory
    action?: EnumActivityActionFieldUpdateOperationsInput | $Enums.ActivityAction
    title?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    category?: EnumActivityCategoryFieldUpdateOperationsInput | $Enums.ActivityCategory
    action?: EnumActivityActionFieldUpdateOperationsInput | $Enums.ActivityAction
    title?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CostConfigCreateInput = {
    id?: string
    fuelPricePerLiter?: Decimal | DecimalJsLike | number | string
    kmPerLiter?: Decimal | DecimalJsLike | number | string
    maintenancePerKm?: Decimal | DecimalJsLike | number | string
    dailyFoodCost?: Decimal | DecimalJsLike | number | string
    otherDailyCost?: Decimal | DecimalJsLike | number | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutCostsInput
  }

  export type CostConfigUncheckedCreateInput = {
    id?: string
    userId: string
    fuelPricePerLiter?: Decimal | DecimalJsLike | number | string
    kmPerLiter?: Decimal | DecimalJsLike | number | string
    maintenancePerKm?: Decimal | DecimalJsLike | number | string
    dailyFoodCost?: Decimal | DecimalJsLike | number | string
    otherDailyCost?: Decimal | DecimalJsLike | number | string
    updatedAt?: Date | string
  }

  export type CostConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fuelPricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    kmPerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    maintenancePerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dailyFoodCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otherDailyCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCostsNestedInput
  }

  export type CostConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fuelPricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    kmPerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    maintenancePerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dailyFoodCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otherDailyCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CostConfigCreateManyInput = {
    id?: string
    userId: string
    fuelPricePerLiter?: Decimal | DecimalJsLike | number | string
    kmPerLiter?: Decimal | DecimalJsLike | number | string
    maintenancePerKm?: Decimal | DecimalJsLike | number | string
    dailyFoodCost?: Decimal | DecimalJsLike | number | string
    otherDailyCost?: Decimal | DecimalJsLike | number | string
    updatedAt?: Date | string
  }

  export type CostConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fuelPricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    kmPerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    maintenancePerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dailyFoodCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otherDailyCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CostConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fuelPricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    kmPerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    maintenancePerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dailyFoodCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otherDailyCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeliveryCreateInput = {
    id?: string
    source: $Enums.DeliverySource
    grossValue: Decimal | DecimalJsLike | number | string
    distanceKm?: Decimal | DecimalJsLike | number | string | null
    durationMin?: number | null
    originName?: string | null
    destinationAddr?: string | null
    destinationLat?: number | null
    destinationLng?: number | null
    proofPhotoUrl?: string | null
    proofLat?: number | null
    proofLng?: number | null
    proofAt?: Date | string | null
    rawInput: JsonNullValueInput | InputJsonValue
    parsedAt?: Date | string
    occurredAt?: Date | string
    user: UserCreateNestedOneWithoutDeliveriesInput
  }

  export type DeliveryUncheckedCreateInput = {
    id?: string
    userId: string
    source: $Enums.DeliverySource
    grossValue: Decimal | DecimalJsLike | number | string
    distanceKm?: Decimal | DecimalJsLike | number | string | null
    durationMin?: number | null
    originName?: string | null
    destinationAddr?: string | null
    destinationLat?: number | null
    destinationLng?: number | null
    proofPhotoUrl?: string | null
    proofLat?: number | null
    proofLng?: number | null
    proofAt?: Date | string | null
    rawInput: JsonNullValueInput | InputJsonValue
    parsedAt?: Date | string
    occurredAt?: Date | string
  }

  export type DeliveryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: EnumDeliverySourceFieldUpdateOperationsInput | $Enums.DeliverySource
    grossValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    distanceKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    durationMin?: NullableIntFieldUpdateOperationsInput | number | null
    originName?: NullableStringFieldUpdateOperationsInput | string | null
    destinationAddr?: NullableStringFieldUpdateOperationsInput | string | null
    destinationLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destinationLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    proofLat?: NullableFloatFieldUpdateOperationsInput | number | null
    proofLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    parsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDeliveriesNestedInput
  }

  export type DeliveryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    source?: EnumDeliverySourceFieldUpdateOperationsInput | $Enums.DeliverySource
    grossValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    distanceKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    durationMin?: NullableIntFieldUpdateOperationsInput | number | null
    originName?: NullableStringFieldUpdateOperationsInput | string | null
    destinationAddr?: NullableStringFieldUpdateOperationsInput | string | null
    destinationLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destinationLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    proofLat?: NullableFloatFieldUpdateOperationsInput | number | null
    proofLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    parsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeliveryCreateManyInput = {
    id?: string
    userId: string
    source: $Enums.DeliverySource
    grossValue: Decimal | DecimalJsLike | number | string
    distanceKm?: Decimal | DecimalJsLike | number | string | null
    durationMin?: number | null
    originName?: string | null
    destinationAddr?: string | null
    destinationLat?: number | null
    destinationLng?: number | null
    proofPhotoUrl?: string | null
    proofLat?: number | null
    proofLng?: number | null
    proofAt?: Date | string | null
    rawInput: JsonNullValueInput | InputJsonValue
    parsedAt?: Date | string
    occurredAt?: Date | string
  }

  export type DeliveryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: EnumDeliverySourceFieldUpdateOperationsInput | $Enums.DeliverySource
    grossValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    distanceKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    durationMin?: NullableIntFieldUpdateOperationsInput | number | null
    originName?: NullableStringFieldUpdateOperationsInput | string | null
    destinationAddr?: NullableStringFieldUpdateOperationsInput | string | null
    destinationLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destinationLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    proofLat?: NullableFloatFieldUpdateOperationsInput | number | null
    proofLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    parsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeliveryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    source?: EnumDeliverySourceFieldUpdateOperationsInput | $Enums.DeliverySource
    grossValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    distanceKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    durationMin?: NullableIntFieldUpdateOperationsInput | number | null
    originName?: NullableStringFieldUpdateOperationsInput | string | null
    destinationAddr?: NullableStringFieldUpdateOperationsInput | string | null
    destinationLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destinationLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    proofLat?: NullableFloatFieldUpdateOperationsInput | number | null
    proofLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    parsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftCreateInput = {
    id?: string
    startedAt: Date | string
    endedAt?: Date | string | null
    startKm?: Decimal | DecimalJsLike | number | string | null
    endKm?: Decimal | DecimalJsLike | number | string | null
    user: UserCreateNestedOneWithoutShiftsInput
  }

  export type ShiftUncheckedCreateInput = {
    id?: string
    userId: string
    startedAt: Date | string
    endedAt?: Date | string | null
    startKm?: Decimal | DecimalJsLike | number | string | null
    endKm?: Decimal | DecimalJsLike | number | string | null
  }

  export type ShiftUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    endKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    user?: UserUpdateOneRequiredWithoutShiftsNestedInput
  }

  export type ShiftUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    endKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type ShiftCreateManyInput = {
    id?: string
    userId: string
    startedAt: Date | string
    endedAt?: Date | string | null
    startKm?: Decimal | DecimalJsLike | number | string | null
    endKm?: Decimal | DecimalJsLike | number | string | null
  }

  export type ShiftUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    endKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type ShiftUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    endKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type GoalCreateInput = {
    id?: string
    period: $Enums.GoalPeriod
    targetValue: Decimal | DecimalJsLike | number | string
    active?: boolean
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutGoalsInput
  }

  export type GoalUncheckedCreateInput = {
    id?: string
    userId: string
    period: $Enums.GoalPeriod
    targetValue: Decimal | DecimalJsLike | number | string
    active?: boolean
    createdAt?: Date | string
  }

  export type GoalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    period?: EnumGoalPeriodFieldUpdateOperationsInput | $Enums.GoalPeriod
    targetValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutGoalsNestedInput
  }

  export type GoalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    period?: EnumGoalPeriodFieldUpdateOperationsInput | $Enums.GoalPeriod
    targetValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GoalCreateManyInput = {
    id?: string
    userId: string
    period: $Enums.GoalPeriod
    targetValue: Decimal | DecimalJsLike | number | string
    active?: boolean
    createdAt?: Date | string
  }

  export type GoalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    period?: EnumGoalPeriodFieldUpdateOperationsInput | $Enums.GoalPeriod
    targetValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GoalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    period?: EnumGoalPeriodFieldUpdateOperationsInput | $Enums.GoalPeriod
    targetValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteCreateInput = {
    id?: string
    addresses: JsonNullValueInput | InputJsonValue
    optimizedOrder: JsonNullValueInput | InputJsonValue
    totalKm: Decimal | DecimalJsLike | number | string
    totalMin: number
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutRoutesInput
  }

  export type RouteUncheckedCreateInput = {
    id?: string
    userId: string
    addresses: JsonNullValueInput | InputJsonValue
    optimizedOrder: JsonNullValueInput | InputJsonValue
    totalKm: Decimal | DecimalJsLike | number | string
    totalMin: number
    createdAt?: Date | string
  }

  export type RouteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    addresses?: JsonNullValueInput | InputJsonValue
    optimizedOrder?: JsonNullValueInput | InputJsonValue
    totalKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalMin?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutRoutesNestedInput
  }

  export type RouteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    addresses?: JsonNullValueInput | InputJsonValue
    optimizedOrder?: JsonNullValueInput | InputJsonValue
    totalKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalMin?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteCreateManyInput = {
    id?: string
    userId: string
    addresses: JsonNullValueInput | InputJsonValue
    optimizedOrder: JsonNullValueInput | InputJsonValue
    totalKm: Decimal | DecimalJsLike | number | string
    totalMin: number
    createdAt?: Date | string
  }

  export type RouteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    addresses?: JsonNullValueInput | InputJsonValue
    optimizedOrder?: JsonNullValueInput | InputJsonValue
    totalKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalMin?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    addresses?: JsonNullValueInput | InputJsonValue
    optimizedOrder?: JsonNullValueInput | InputJsonValue
    totalKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalMin?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentCreateInput = {
    id?: string
    asaasChargeId?: string | null
    status: $Enums.PaymentStatus
    amount: Decimal | DecimalJsLike | number | string
    paidAt?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutPaymentsInput
  }

  export type PaymentUncheckedCreateInput = {
    id?: string
    userId: string
    asaasChargeId?: string | null
    status: $Enums.PaymentStatus
    amount: Decimal | DecimalJsLike | number | string
    paidAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PaymentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    asaasChargeId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPaymentsNestedInput
  }

  export type PaymentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    asaasChargeId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentCreateManyInput = {
    id?: string
    userId: string
    asaasChargeId?: string | null
    status: $Enums.PaymentStatus
    amount: Decimal | DecimalJsLike | number | string
    paidAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PaymentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    asaasChargeId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    asaasChargeId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppMessageCreateInput = {
    id?: string
    userId?: string | null
    fromNumber: string
    messageType: string
    rawContent: JsonNullValueInput | InputJsonValue
    processedAs?: string | null
    receivedAt?: Date | string
  }

  export type WhatsAppMessageUncheckedCreateInput = {
    id?: string
    userId?: string | null
    fromNumber: string
    messageType: string
    rawContent: JsonNullValueInput | InputJsonValue
    processedAs?: string | null
    receivedAt?: Date | string
  }

  export type WhatsAppMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    fromNumber?: StringFieldUpdateOperationsInput | string
    messageType?: StringFieldUpdateOperationsInput | string
    rawContent?: JsonNullValueInput | InputJsonValue
    processedAs?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    fromNumber?: StringFieldUpdateOperationsInput | string
    messageType?: StringFieldUpdateOperationsInput | string
    rawContent?: JsonNullValueInput | InputJsonValue
    processedAs?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppMessageCreateManyInput = {
    id?: string
    userId?: string | null
    fromNumber: string
    messageType: string
    rawContent: JsonNullValueInput | InputJsonValue
    processedAs?: string | null
    receivedAt?: Date | string
  }

  export type WhatsAppMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    fromNumber?: StringFieldUpdateOperationsInput | string
    messageType?: StringFieldUpdateOperationsInput | string
    rawContent?: JsonNullValueInput | InputJsonValue
    processedAs?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    fromNumber?: StringFieldUpdateOperationsInput | string
    messageType?: StringFieldUpdateOperationsInput | string
    rawContent?: JsonNullValueInput | InputJsonValue
    processedAs?: NullableStringFieldUpdateOperationsInput | string | null
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FuelRefuelCreateInput = {
    id?: string
    totalAmount: Decimal | DecimalJsLike | number | string
    liters: Decimal | DecimalJsLike | number | string
    pricePerLiter: Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: string | null
    rawInput: JsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    user: UserCreateNestedOneWithoutFuelRefuelsInput
  }

  export type FuelRefuelUncheckedCreateInput = {
    id?: string
    userId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    liters: Decimal | DecimalJsLike | number | string
    pricePerLiter: Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: string | null
    rawInput: JsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
  }

  export type FuelRefuelUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    liters?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    pricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutFuelRefuelsNestedInput
  }

  export type FuelRefuelUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    liters?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    pricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FuelRefuelCreateManyInput = {
    id?: string
    userId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    liters: Decimal | DecimalJsLike | number | string
    pricePerLiter: Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: string | null
    rawInput: JsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
  }

  export type FuelRefuelUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    liters?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    pricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FuelRefuelUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    liters?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    pricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OdometerReadingCreateInput = {
    id?: string
    odometerKm: Decimal | DecimalJsLike | number | string
    photoUrl?: string | null
    rawInput: JsonNullValueInput | InputJsonValue
    recordedAt?: Date | string
    user: UserCreateNestedOneWithoutOdometerReadingsInput
  }

  export type OdometerReadingUncheckedCreateInput = {
    id?: string
    userId: string
    odometerKm: Decimal | DecimalJsLike | number | string
    photoUrl?: string | null
    rawInput: JsonNullValueInput | InputJsonValue
    recordedAt?: Date | string
  }

  export type OdometerReadingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    odometerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    recordedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutOdometerReadingsNestedInput
  }

  export type OdometerReadingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    odometerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    recordedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OdometerReadingCreateManyInput = {
    id?: string
    userId: string
    odometerKm: Decimal | DecimalJsLike | number | string
    photoUrl?: string | null
    rawInput: JsonNullValueInput | InputJsonValue
    recordedAt?: Date | string
  }

  export type OdometerReadingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    odometerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    recordedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OdometerReadingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    odometerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    recordedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthCodeCreateInput = {
    id?: string
    phone: string
    code: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type AuthCodeUncheckedCreateInput = {
    id?: string
    phone: string
    code: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type AuthCodeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthCodeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthCodeCreateManyInput = {
    id?: string
    phone: string
    code: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type AuthCodeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthCodeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminAccountCreateInput = {
    id?: string
    email: string
    passwordHash: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdminAccountUncheckedCreateInput = {
    id?: string
    email: string
    passwordHash: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdminAccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminAccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminAccountCreateManyInput = {
    id?: string
    email: string
    passwordHash: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdminAccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminAccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type EnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type CostConfigNullableScalarRelationFilter = {
    is?: CostConfigWhereInput | null
    isNot?: CostConfigWhereInput | null
  }

  export type DeliveryListRelationFilter = {
    every?: DeliveryWhereInput
    some?: DeliveryWhereInput
    none?: DeliveryWhereInput
  }

  export type ShiftListRelationFilter = {
    every?: ShiftWhereInput
    some?: ShiftWhereInput
    none?: ShiftWhereInput
  }

  export type GoalListRelationFilter = {
    every?: GoalWhereInput
    some?: GoalWhereInput
    none?: GoalWhereInput
  }

  export type PaymentListRelationFilter = {
    every?: PaymentWhereInput
    some?: PaymentWhereInput
    none?: PaymentWhereInput
  }

  export type RouteListRelationFilter = {
    every?: RouteWhereInput
    some?: RouteWhereInput
    none?: RouteWhereInput
  }

  export type FuelRefuelListRelationFilter = {
    every?: FuelRefuelWhereInput
    some?: FuelRefuelWhereInput
    none?: FuelRefuelWhereInput
  }

  export type OdometerReadingListRelationFilter = {
    every?: OdometerReadingWhereInput
    some?: OdometerReadingWhereInput
    none?: OdometerReadingWhereInput
  }

  export type ActivityLogListRelationFilter = {
    every?: ActivityLogWhereInput
    some?: ActivityLogWhereInput
    none?: ActivityLogWhereInput
  }

  export type AffiliateNullableScalarRelationFilter = {
    is?: AffiliateWhereInput | null
    isNot?: AffiliateWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type DeliveryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ShiftOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GoalOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PaymentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RouteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FuelRefuelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OdometerReadingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ActivityLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    whatsappNumber?: SortOrder
    email?: SortOrder
    name?: SortOrder
    vehiclePlate?: SortOrder
    city?: SortOrder
    workApps?: SortOrder
    subscriptionPaymentMethod?: SortOrder
    workDays?: SortOrder
    status?: SortOrder
    trialEndsAt?: SortOrder
    subscribedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    currentOdometerKm?: SortOrder
    referredByAffiliateId?: SortOrder
    affiliateCouponCode?: SortOrder
    referredAt?: SortOrder
    asaasCustomerId?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    currentOdometerKm?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    whatsappNumber?: SortOrder
    email?: SortOrder
    name?: SortOrder
    vehiclePlate?: SortOrder
    city?: SortOrder
    subscriptionPaymentMethod?: SortOrder
    status?: SortOrder
    trialEndsAt?: SortOrder
    subscribedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    currentOdometerKm?: SortOrder
    referredByAffiliateId?: SortOrder
    affiliateCouponCode?: SortOrder
    referredAt?: SortOrder
    asaasCustomerId?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    whatsappNumber?: SortOrder
    email?: SortOrder
    name?: SortOrder
    vehiclePlate?: SortOrder
    city?: SortOrder
    subscriptionPaymentMethod?: SortOrder
    status?: SortOrder
    trialEndsAt?: SortOrder
    subscribedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    currentOdometerKm?: SortOrder
    referredByAffiliateId?: SortOrder
    affiliateCouponCode?: SortOrder
    referredAt?: SortOrder
    asaasCustomerId?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    currentOdometerKm?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserStatusFilter<$PrismaModel>
    _max?: NestedEnumUserStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AffiliateCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    active?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AffiliateMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    active?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AffiliateMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    active?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumActivityCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityCategory | EnumActivityCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityCategory[] | ListEnumActivityCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityCategory[] | ListEnumActivityCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityCategoryFilter<$PrismaModel> | $Enums.ActivityCategory
  }

  export type EnumActivityActionFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityAction | EnumActivityActionFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityAction[] | ListEnumActivityActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityAction[] | ListEnumActivityActionFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityActionFilter<$PrismaModel> | $Enums.ActivityAction
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ActivityLogCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    action?: SortOrder
    title?: SortOrder
    changes?: SortOrder
    entityId?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
  }

  export type ActivityLogMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    action?: SortOrder
    title?: SortOrder
    entityId?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
  }

  export type ActivityLogMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    action?: SortOrder
    title?: SortOrder
    entityId?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumActivityCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityCategory | EnumActivityCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityCategory[] | ListEnumActivityCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityCategory[] | ListEnumActivityCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityCategoryWithAggregatesFilter<$PrismaModel> | $Enums.ActivityCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActivityCategoryFilter<$PrismaModel>
    _max?: NestedEnumActivityCategoryFilter<$PrismaModel>
  }

  export type EnumActivityActionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityAction | EnumActivityActionFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityAction[] | ListEnumActivityActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityAction[] | ListEnumActivityActionFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityActionWithAggregatesFilter<$PrismaModel> | $Enums.ActivityAction
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActivityActionFilter<$PrismaModel>
    _max?: NestedEnumActivityActionFilter<$PrismaModel>
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type CostConfigCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    fuelPricePerLiter?: SortOrder
    kmPerLiter?: SortOrder
    maintenancePerKm?: SortOrder
    dailyFoodCost?: SortOrder
    otherDailyCost?: SortOrder
    updatedAt?: SortOrder
  }

  export type CostConfigAvgOrderByAggregateInput = {
    fuelPricePerLiter?: SortOrder
    kmPerLiter?: SortOrder
    maintenancePerKm?: SortOrder
    dailyFoodCost?: SortOrder
    otherDailyCost?: SortOrder
  }

  export type CostConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    fuelPricePerLiter?: SortOrder
    kmPerLiter?: SortOrder
    maintenancePerKm?: SortOrder
    dailyFoodCost?: SortOrder
    otherDailyCost?: SortOrder
    updatedAt?: SortOrder
  }

  export type CostConfigMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    fuelPricePerLiter?: SortOrder
    kmPerLiter?: SortOrder
    maintenancePerKm?: SortOrder
    dailyFoodCost?: SortOrder
    otherDailyCost?: SortOrder
    updatedAt?: SortOrder
  }

  export type CostConfigSumOrderByAggregateInput = {
    fuelPricePerLiter?: SortOrder
    kmPerLiter?: SortOrder
    maintenancePerKm?: SortOrder
    dailyFoodCost?: SortOrder
    otherDailyCost?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type EnumDeliverySourceFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliverySource | EnumDeliverySourceFieldRefInput<$PrismaModel>
    in?: $Enums.DeliverySource[] | ListEnumDeliverySourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliverySource[] | ListEnumDeliverySourceFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliverySourceFilter<$PrismaModel> | $Enums.DeliverySource
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type DeliveryCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    grossValue?: SortOrder
    distanceKm?: SortOrder
    durationMin?: SortOrder
    originName?: SortOrder
    destinationAddr?: SortOrder
    destinationLat?: SortOrder
    destinationLng?: SortOrder
    proofPhotoUrl?: SortOrder
    proofLat?: SortOrder
    proofLng?: SortOrder
    proofAt?: SortOrder
    rawInput?: SortOrder
    parsedAt?: SortOrder
    occurredAt?: SortOrder
  }

  export type DeliveryAvgOrderByAggregateInput = {
    grossValue?: SortOrder
    distanceKm?: SortOrder
    durationMin?: SortOrder
    destinationLat?: SortOrder
    destinationLng?: SortOrder
    proofLat?: SortOrder
    proofLng?: SortOrder
  }

  export type DeliveryMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    grossValue?: SortOrder
    distanceKm?: SortOrder
    durationMin?: SortOrder
    originName?: SortOrder
    destinationAddr?: SortOrder
    destinationLat?: SortOrder
    destinationLng?: SortOrder
    proofPhotoUrl?: SortOrder
    proofLat?: SortOrder
    proofLng?: SortOrder
    proofAt?: SortOrder
    parsedAt?: SortOrder
    occurredAt?: SortOrder
  }

  export type DeliveryMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    grossValue?: SortOrder
    distanceKm?: SortOrder
    durationMin?: SortOrder
    originName?: SortOrder
    destinationAddr?: SortOrder
    destinationLat?: SortOrder
    destinationLng?: SortOrder
    proofPhotoUrl?: SortOrder
    proofLat?: SortOrder
    proofLng?: SortOrder
    proofAt?: SortOrder
    parsedAt?: SortOrder
    occurredAt?: SortOrder
  }

  export type DeliverySumOrderByAggregateInput = {
    grossValue?: SortOrder
    distanceKm?: SortOrder
    durationMin?: SortOrder
    destinationLat?: SortOrder
    destinationLng?: SortOrder
    proofLat?: SortOrder
    proofLng?: SortOrder
  }

  export type EnumDeliverySourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliverySource | EnumDeliverySourceFieldRefInput<$PrismaModel>
    in?: $Enums.DeliverySource[] | ListEnumDeliverySourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliverySource[] | ListEnumDeliverySourceFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliverySourceWithAggregatesFilter<$PrismaModel> | $Enums.DeliverySource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDeliverySourceFilter<$PrismaModel>
    _max?: NestedEnumDeliverySourceFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type ShiftCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    startKm?: SortOrder
    endKm?: SortOrder
  }

  export type ShiftAvgOrderByAggregateInput = {
    startKm?: SortOrder
    endKm?: SortOrder
  }

  export type ShiftMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    startKm?: SortOrder
    endKm?: SortOrder
  }

  export type ShiftMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    startKm?: SortOrder
    endKm?: SortOrder
  }

  export type ShiftSumOrderByAggregateInput = {
    startKm?: SortOrder
    endKm?: SortOrder
  }

  export type EnumGoalPeriodFilter<$PrismaModel = never> = {
    equals?: $Enums.GoalPeriod | EnumGoalPeriodFieldRefInput<$PrismaModel>
    in?: $Enums.GoalPeriod[] | ListEnumGoalPeriodFieldRefInput<$PrismaModel>
    notIn?: $Enums.GoalPeriod[] | ListEnumGoalPeriodFieldRefInput<$PrismaModel>
    not?: NestedEnumGoalPeriodFilter<$PrismaModel> | $Enums.GoalPeriod
  }

  export type GoalCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    period?: SortOrder
    targetValue?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
  }

  export type GoalAvgOrderByAggregateInput = {
    targetValue?: SortOrder
  }

  export type GoalMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    period?: SortOrder
    targetValue?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
  }

  export type GoalMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    period?: SortOrder
    targetValue?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
  }

  export type GoalSumOrderByAggregateInput = {
    targetValue?: SortOrder
  }

  export type EnumGoalPeriodWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.GoalPeriod | EnumGoalPeriodFieldRefInput<$PrismaModel>
    in?: $Enums.GoalPeriod[] | ListEnumGoalPeriodFieldRefInput<$PrismaModel>
    notIn?: $Enums.GoalPeriod[] | ListEnumGoalPeriodFieldRefInput<$PrismaModel>
    not?: NestedEnumGoalPeriodWithAggregatesFilter<$PrismaModel> | $Enums.GoalPeriod
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGoalPeriodFilter<$PrismaModel>
    _max?: NestedEnumGoalPeriodFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type RouteCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    addresses?: SortOrder
    optimizedOrder?: SortOrder
    totalKm?: SortOrder
    totalMin?: SortOrder
    createdAt?: SortOrder
  }

  export type RouteAvgOrderByAggregateInput = {
    totalKm?: SortOrder
    totalMin?: SortOrder
  }

  export type RouteMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    totalKm?: SortOrder
    totalMin?: SortOrder
    createdAt?: SortOrder
  }

  export type RouteMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    totalKm?: SortOrder
    totalMin?: SortOrder
    createdAt?: SortOrder
  }

  export type RouteSumOrderByAggregateInput = {
    totalKm?: SortOrder
    totalMin?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumPaymentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusFilter<$PrismaModel> | $Enums.PaymentStatus
  }

  export type PaymentCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    asaasChargeId?: SortOrder
    status?: SortOrder
    amount?: SortOrder
    paidAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PaymentAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type PaymentMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    asaasChargeId?: SortOrder
    status?: SortOrder
    amount?: SortOrder
    paidAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PaymentMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    asaasChargeId?: SortOrder
    status?: SortOrder
    amount?: SortOrder
    paidAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PaymentSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type EnumPaymentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel> | $Enums.PaymentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentStatusFilter<$PrismaModel>
    _max?: NestedEnumPaymentStatusFilter<$PrismaModel>
  }

  export type WhatsAppMessageCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    fromNumber?: SortOrder
    messageType?: SortOrder
    rawContent?: SortOrder
    processedAs?: SortOrder
    receivedAt?: SortOrder
  }

  export type WhatsAppMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    fromNumber?: SortOrder
    messageType?: SortOrder
    processedAs?: SortOrder
    receivedAt?: SortOrder
  }

  export type WhatsAppMessageMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    fromNumber?: SortOrder
    messageType?: SortOrder
    processedAs?: SortOrder
    receivedAt?: SortOrder
  }

  export type FuelRefuelCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    totalAmount?: SortOrder
    liters?: SortOrder
    pricePerLiter?: SortOrder
    receiptPhotoUrl?: SortOrder
    rawInput?: SortOrder
    occurredAt?: SortOrder
  }

  export type FuelRefuelAvgOrderByAggregateInput = {
    totalAmount?: SortOrder
    liters?: SortOrder
    pricePerLiter?: SortOrder
  }

  export type FuelRefuelMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    totalAmount?: SortOrder
    liters?: SortOrder
    pricePerLiter?: SortOrder
    receiptPhotoUrl?: SortOrder
    occurredAt?: SortOrder
  }

  export type FuelRefuelMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    totalAmount?: SortOrder
    liters?: SortOrder
    pricePerLiter?: SortOrder
    receiptPhotoUrl?: SortOrder
    occurredAt?: SortOrder
  }

  export type FuelRefuelSumOrderByAggregateInput = {
    totalAmount?: SortOrder
    liters?: SortOrder
    pricePerLiter?: SortOrder
  }

  export type OdometerReadingCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    odometerKm?: SortOrder
    photoUrl?: SortOrder
    rawInput?: SortOrder
    recordedAt?: SortOrder
  }

  export type OdometerReadingAvgOrderByAggregateInput = {
    odometerKm?: SortOrder
  }

  export type OdometerReadingMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    odometerKm?: SortOrder
    photoUrl?: SortOrder
    recordedAt?: SortOrder
  }

  export type OdometerReadingMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    odometerKm?: SortOrder
    photoUrl?: SortOrder
    recordedAt?: SortOrder
  }

  export type OdometerReadingSumOrderByAggregateInput = {
    odometerKm?: SortOrder
  }

  export type AuthCodeCountOrderByAggregateInput = {
    id?: SortOrder
    phone?: SortOrder
    code?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AuthCodeMaxOrderByAggregateInput = {
    id?: SortOrder
    phone?: SortOrder
    code?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AuthCodeMinOrderByAggregateInput = {
    id?: SortOrder
    phone?: SortOrder
    code?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AdminAccountCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdminAccountMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdminAccountMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CostConfigCreateNestedOneWithoutUserInput = {
    create?: XOR<CostConfigCreateWithoutUserInput, CostConfigUncheckedCreateWithoutUserInput>
    connectOrCreate?: CostConfigCreateOrConnectWithoutUserInput
    connect?: CostConfigWhereUniqueInput
  }

  export type DeliveryCreateNestedManyWithoutUserInput = {
    create?: XOR<DeliveryCreateWithoutUserInput, DeliveryUncheckedCreateWithoutUserInput> | DeliveryCreateWithoutUserInput[] | DeliveryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DeliveryCreateOrConnectWithoutUserInput | DeliveryCreateOrConnectWithoutUserInput[]
    createMany?: DeliveryCreateManyUserInputEnvelope
    connect?: DeliveryWhereUniqueInput | DeliveryWhereUniqueInput[]
  }

  export type ShiftCreateNestedManyWithoutUserInput = {
    create?: XOR<ShiftCreateWithoutUserInput, ShiftUncheckedCreateWithoutUserInput> | ShiftCreateWithoutUserInput[] | ShiftUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ShiftCreateOrConnectWithoutUserInput | ShiftCreateOrConnectWithoutUserInput[]
    createMany?: ShiftCreateManyUserInputEnvelope
    connect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
  }

  export type GoalCreateNestedManyWithoutUserInput = {
    create?: XOR<GoalCreateWithoutUserInput, GoalUncheckedCreateWithoutUserInput> | GoalCreateWithoutUserInput[] | GoalUncheckedCreateWithoutUserInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutUserInput | GoalCreateOrConnectWithoutUserInput[]
    createMany?: GoalCreateManyUserInputEnvelope
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
  }

  export type PaymentCreateNestedManyWithoutUserInput = {
    create?: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput> | PaymentCreateWithoutUserInput[] | PaymentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutUserInput | PaymentCreateOrConnectWithoutUserInput[]
    createMany?: PaymentCreateManyUserInputEnvelope
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
  }

  export type RouteCreateNestedManyWithoutUserInput = {
    create?: XOR<RouteCreateWithoutUserInput, RouteUncheckedCreateWithoutUserInput> | RouteCreateWithoutUserInput[] | RouteUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RouteCreateOrConnectWithoutUserInput | RouteCreateOrConnectWithoutUserInput[]
    createMany?: RouteCreateManyUserInputEnvelope
    connect?: RouteWhereUniqueInput | RouteWhereUniqueInput[]
  }

  export type FuelRefuelCreateNestedManyWithoutUserInput = {
    create?: XOR<FuelRefuelCreateWithoutUserInput, FuelRefuelUncheckedCreateWithoutUserInput> | FuelRefuelCreateWithoutUserInput[] | FuelRefuelUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FuelRefuelCreateOrConnectWithoutUserInput | FuelRefuelCreateOrConnectWithoutUserInput[]
    createMany?: FuelRefuelCreateManyUserInputEnvelope
    connect?: FuelRefuelWhereUniqueInput | FuelRefuelWhereUniqueInput[]
  }

  export type OdometerReadingCreateNestedManyWithoutUserInput = {
    create?: XOR<OdometerReadingCreateWithoutUserInput, OdometerReadingUncheckedCreateWithoutUserInput> | OdometerReadingCreateWithoutUserInput[] | OdometerReadingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OdometerReadingCreateOrConnectWithoutUserInput | OdometerReadingCreateOrConnectWithoutUserInput[]
    createMany?: OdometerReadingCreateManyUserInputEnvelope
    connect?: OdometerReadingWhereUniqueInput | OdometerReadingWhereUniqueInput[]
  }

  export type ActivityLogCreateNestedManyWithoutUserInput = {
    create?: XOR<ActivityLogCreateWithoutUserInput, ActivityLogUncheckedCreateWithoutUserInput> | ActivityLogCreateWithoutUserInput[] | ActivityLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ActivityLogCreateOrConnectWithoutUserInput | ActivityLogCreateOrConnectWithoutUserInput[]
    createMany?: ActivityLogCreateManyUserInputEnvelope
    connect?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
  }

  export type AffiliateCreateNestedOneWithoutReferralsInput = {
    create?: XOR<AffiliateCreateWithoutReferralsInput, AffiliateUncheckedCreateWithoutReferralsInput>
    connectOrCreate?: AffiliateCreateOrConnectWithoutReferralsInput
    connect?: AffiliateWhereUniqueInput
  }

  export type CostConfigUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<CostConfigCreateWithoutUserInput, CostConfigUncheckedCreateWithoutUserInput>
    connectOrCreate?: CostConfigCreateOrConnectWithoutUserInput
    connect?: CostConfigWhereUniqueInput
  }

  export type DeliveryUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<DeliveryCreateWithoutUserInput, DeliveryUncheckedCreateWithoutUserInput> | DeliveryCreateWithoutUserInput[] | DeliveryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DeliveryCreateOrConnectWithoutUserInput | DeliveryCreateOrConnectWithoutUserInput[]
    createMany?: DeliveryCreateManyUserInputEnvelope
    connect?: DeliveryWhereUniqueInput | DeliveryWhereUniqueInput[]
  }

  export type ShiftUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ShiftCreateWithoutUserInput, ShiftUncheckedCreateWithoutUserInput> | ShiftCreateWithoutUserInput[] | ShiftUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ShiftCreateOrConnectWithoutUserInput | ShiftCreateOrConnectWithoutUserInput[]
    createMany?: ShiftCreateManyUserInputEnvelope
    connect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
  }

  export type GoalUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<GoalCreateWithoutUserInput, GoalUncheckedCreateWithoutUserInput> | GoalCreateWithoutUserInput[] | GoalUncheckedCreateWithoutUserInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutUserInput | GoalCreateOrConnectWithoutUserInput[]
    createMany?: GoalCreateManyUserInputEnvelope
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
  }

  export type PaymentUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput> | PaymentCreateWithoutUserInput[] | PaymentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutUserInput | PaymentCreateOrConnectWithoutUserInput[]
    createMany?: PaymentCreateManyUserInputEnvelope
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
  }

  export type RouteUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<RouteCreateWithoutUserInput, RouteUncheckedCreateWithoutUserInput> | RouteCreateWithoutUserInput[] | RouteUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RouteCreateOrConnectWithoutUserInput | RouteCreateOrConnectWithoutUserInput[]
    createMany?: RouteCreateManyUserInputEnvelope
    connect?: RouteWhereUniqueInput | RouteWhereUniqueInput[]
  }

  export type FuelRefuelUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<FuelRefuelCreateWithoutUserInput, FuelRefuelUncheckedCreateWithoutUserInput> | FuelRefuelCreateWithoutUserInput[] | FuelRefuelUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FuelRefuelCreateOrConnectWithoutUserInput | FuelRefuelCreateOrConnectWithoutUserInput[]
    createMany?: FuelRefuelCreateManyUserInputEnvelope
    connect?: FuelRefuelWhereUniqueInput | FuelRefuelWhereUniqueInput[]
  }

  export type OdometerReadingUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<OdometerReadingCreateWithoutUserInput, OdometerReadingUncheckedCreateWithoutUserInput> | OdometerReadingCreateWithoutUserInput[] | OdometerReadingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OdometerReadingCreateOrConnectWithoutUserInput | OdometerReadingCreateOrConnectWithoutUserInput[]
    createMany?: OdometerReadingCreateManyUserInputEnvelope
    connect?: OdometerReadingWhereUniqueInput | OdometerReadingWhereUniqueInput[]
  }

  export type ActivityLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ActivityLogCreateWithoutUserInput, ActivityLogUncheckedCreateWithoutUserInput> | ActivityLogCreateWithoutUserInput[] | ActivityLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ActivityLogCreateOrConnectWithoutUserInput | ActivityLogCreateOrConnectWithoutUserInput[]
    createMany?: ActivityLogCreateManyUserInputEnvelope
    connect?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumUserStatusFieldUpdateOperationsInput = {
    set?: $Enums.UserStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type CostConfigUpdateOneWithoutUserNestedInput = {
    create?: XOR<CostConfigCreateWithoutUserInput, CostConfigUncheckedCreateWithoutUserInput>
    connectOrCreate?: CostConfigCreateOrConnectWithoutUserInput
    upsert?: CostConfigUpsertWithoutUserInput
    disconnect?: CostConfigWhereInput | boolean
    delete?: CostConfigWhereInput | boolean
    connect?: CostConfigWhereUniqueInput
    update?: XOR<XOR<CostConfigUpdateToOneWithWhereWithoutUserInput, CostConfigUpdateWithoutUserInput>, CostConfigUncheckedUpdateWithoutUserInput>
  }

  export type DeliveryUpdateManyWithoutUserNestedInput = {
    create?: XOR<DeliveryCreateWithoutUserInput, DeliveryUncheckedCreateWithoutUserInput> | DeliveryCreateWithoutUserInput[] | DeliveryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DeliveryCreateOrConnectWithoutUserInput | DeliveryCreateOrConnectWithoutUserInput[]
    upsert?: DeliveryUpsertWithWhereUniqueWithoutUserInput | DeliveryUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DeliveryCreateManyUserInputEnvelope
    set?: DeliveryWhereUniqueInput | DeliveryWhereUniqueInput[]
    disconnect?: DeliveryWhereUniqueInput | DeliveryWhereUniqueInput[]
    delete?: DeliveryWhereUniqueInput | DeliveryWhereUniqueInput[]
    connect?: DeliveryWhereUniqueInput | DeliveryWhereUniqueInput[]
    update?: DeliveryUpdateWithWhereUniqueWithoutUserInput | DeliveryUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DeliveryUpdateManyWithWhereWithoutUserInput | DeliveryUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DeliveryScalarWhereInput | DeliveryScalarWhereInput[]
  }

  export type ShiftUpdateManyWithoutUserNestedInput = {
    create?: XOR<ShiftCreateWithoutUserInput, ShiftUncheckedCreateWithoutUserInput> | ShiftCreateWithoutUserInput[] | ShiftUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ShiftCreateOrConnectWithoutUserInput | ShiftCreateOrConnectWithoutUserInput[]
    upsert?: ShiftUpsertWithWhereUniqueWithoutUserInput | ShiftUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ShiftCreateManyUserInputEnvelope
    set?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    disconnect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    delete?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    connect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    update?: ShiftUpdateWithWhereUniqueWithoutUserInput | ShiftUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ShiftUpdateManyWithWhereWithoutUserInput | ShiftUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ShiftScalarWhereInput | ShiftScalarWhereInput[]
  }

  export type GoalUpdateManyWithoutUserNestedInput = {
    create?: XOR<GoalCreateWithoutUserInput, GoalUncheckedCreateWithoutUserInput> | GoalCreateWithoutUserInput[] | GoalUncheckedCreateWithoutUserInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutUserInput | GoalCreateOrConnectWithoutUserInput[]
    upsert?: GoalUpsertWithWhereUniqueWithoutUserInput | GoalUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: GoalCreateManyUserInputEnvelope
    set?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    disconnect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    delete?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    update?: GoalUpdateWithWhereUniqueWithoutUserInput | GoalUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: GoalUpdateManyWithWhereWithoutUserInput | GoalUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: GoalScalarWhereInput | GoalScalarWhereInput[]
  }

  export type PaymentUpdateManyWithoutUserNestedInput = {
    create?: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput> | PaymentCreateWithoutUserInput[] | PaymentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutUserInput | PaymentCreateOrConnectWithoutUserInput[]
    upsert?: PaymentUpsertWithWhereUniqueWithoutUserInput | PaymentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PaymentCreateManyUserInputEnvelope
    set?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    disconnect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    delete?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    update?: PaymentUpdateWithWhereUniqueWithoutUserInput | PaymentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PaymentUpdateManyWithWhereWithoutUserInput | PaymentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
  }

  export type RouteUpdateManyWithoutUserNestedInput = {
    create?: XOR<RouteCreateWithoutUserInput, RouteUncheckedCreateWithoutUserInput> | RouteCreateWithoutUserInput[] | RouteUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RouteCreateOrConnectWithoutUserInput | RouteCreateOrConnectWithoutUserInput[]
    upsert?: RouteUpsertWithWhereUniqueWithoutUserInput | RouteUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RouteCreateManyUserInputEnvelope
    set?: RouteWhereUniqueInput | RouteWhereUniqueInput[]
    disconnect?: RouteWhereUniqueInput | RouteWhereUniqueInput[]
    delete?: RouteWhereUniqueInput | RouteWhereUniqueInput[]
    connect?: RouteWhereUniqueInput | RouteWhereUniqueInput[]
    update?: RouteUpdateWithWhereUniqueWithoutUserInput | RouteUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RouteUpdateManyWithWhereWithoutUserInput | RouteUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RouteScalarWhereInput | RouteScalarWhereInput[]
  }

  export type FuelRefuelUpdateManyWithoutUserNestedInput = {
    create?: XOR<FuelRefuelCreateWithoutUserInput, FuelRefuelUncheckedCreateWithoutUserInput> | FuelRefuelCreateWithoutUserInput[] | FuelRefuelUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FuelRefuelCreateOrConnectWithoutUserInput | FuelRefuelCreateOrConnectWithoutUserInput[]
    upsert?: FuelRefuelUpsertWithWhereUniqueWithoutUserInput | FuelRefuelUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: FuelRefuelCreateManyUserInputEnvelope
    set?: FuelRefuelWhereUniqueInput | FuelRefuelWhereUniqueInput[]
    disconnect?: FuelRefuelWhereUniqueInput | FuelRefuelWhereUniqueInput[]
    delete?: FuelRefuelWhereUniqueInput | FuelRefuelWhereUniqueInput[]
    connect?: FuelRefuelWhereUniqueInput | FuelRefuelWhereUniqueInput[]
    update?: FuelRefuelUpdateWithWhereUniqueWithoutUserInput | FuelRefuelUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: FuelRefuelUpdateManyWithWhereWithoutUserInput | FuelRefuelUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: FuelRefuelScalarWhereInput | FuelRefuelScalarWhereInput[]
  }

  export type OdometerReadingUpdateManyWithoutUserNestedInput = {
    create?: XOR<OdometerReadingCreateWithoutUserInput, OdometerReadingUncheckedCreateWithoutUserInput> | OdometerReadingCreateWithoutUserInput[] | OdometerReadingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OdometerReadingCreateOrConnectWithoutUserInput | OdometerReadingCreateOrConnectWithoutUserInput[]
    upsert?: OdometerReadingUpsertWithWhereUniqueWithoutUserInput | OdometerReadingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OdometerReadingCreateManyUserInputEnvelope
    set?: OdometerReadingWhereUniqueInput | OdometerReadingWhereUniqueInput[]
    disconnect?: OdometerReadingWhereUniqueInput | OdometerReadingWhereUniqueInput[]
    delete?: OdometerReadingWhereUniqueInput | OdometerReadingWhereUniqueInput[]
    connect?: OdometerReadingWhereUniqueInput | OdometerReadingWhereUniqueInput[]
    update?: OdometerReadingUpdateWithWhereUniqueWithoutUserInput | OdometerReadingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OdometerReadingUpdateManyWithWhereWithoutUserInput | OdometerReadingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OdometerReadingScalarWhereInput | OdometerReadingScalarWhereInput[]
  }

  export type ActivityLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<ActivityLogCreateWithoutUserInput, ActivityLogUncheckedCreateWithoutUserInput> | ActivityLogCreateWithoutUserInput[] | ActivityLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ActivityLogCreateOrConnectWithoutUserInput | ActivityLogCreateOrConnectWithoutUserInput[]
    upsert?: ActivityLogUpsertWithWhereUniqueWithoutUserInput | ActivityLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ActivityLogCreateManyUserInputEnvelope
    set?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    disconnect?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    delete?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    connect?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    update?: ActivityLogUpdateWithWhereUniqueWithoutUserInput | ActivityLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ActivityLogUpdateManyWithWhereWithoutUserInput | ActivityLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ActivityLogScalarWhereInput | ActivityLogScalarWhereInput[]
  }

  export type AffiliateUpdateOneWithoutReferralsNestedInput = {
    create?: XOR<AffiliateCreateWithoutReferralsInput, AffiliateUncheckedCreateWithoutReferralsInput>
    connectOrCreate?: AffiliateCreateOrConnectWithoutReferralsInput
    upsert?: AffiliateUpsertWithoutReferralsInput
    disconnect?: AffiliateWhereInput | boolean
    delete?: AffiliateWhereInput | boolean
    connect?: AffiliateWhereUniqueInput
    update?: XOR<XOR<AffiliateUpdateToOneWithWhereWithoutReferralsInput, AffiliateUpdateWithoutReferralsInput>, AffiliateUncheckedUpdateWithoutReferralsInput>
  }

  export type CostConfigUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<CostConfigCreateWithoutUserInput, CostConfigUncheckedCreateWithoutUserInput>
    connectOrCreate?: CostConfigCreateOrConnectWithoutUserInput
    upsert?: CostConfigUpsertWithoutUserInput
    disconnect?: CostConfigWhereInput | boolean
    delete?: CostConfigWhereInput | boolean
    connect?: CostConfigWhereUniqueInput
    update?: XOR<XOR<CostConfigUpdateToOneWithWhereWithoutUserInput, CostConfigUpdateWithoutUserInput>, CostConfigUncheckedUpdateWithoutUserInput>
  }

  export type DeliveryUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<DeliveryCreateWithoutUserInput, DeliveryUncheckedCreateWithoutUserInput> | DeliveryCreateWithoutUserInput[] | DeliveryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DeliveryCreateOrConnectWithoutUserInput | DeliveryCreateOrConnectWithoutUserInput[]
    upsert?: DeliveryUpsertWithWhereUniqueWithoutUserInput | DeliveryUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DeliveryCreateManyUserInputEnvelope
    set?: DeliveryWhereUniqueInput | DeliveryWhereUniqueInput[]
    disconnect?: DeliveryWhereUniqueInput | DeliveryWhereUniqueInput[]
    delete?: DeliveryWhereUniqueInput | DeliveryWhereUniqueInput[]
    connect?: DeliveryWhereUniqueInput | DeliveryWhereUniqueInput[]
    update?: DeliveryUpdateWithWhereUniqueWithoutUserInput | DeliveryUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DeliveryUpdateManyWithWhereWithoutUserInput | DeliveryUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DeliveryScalarWhereInput | DeliveryScalarWhereInput[]
  }

  export type ShiftUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ShiftCreateWithoutUserInput, ShiftUncheckedCreateWithoutUserInput> | ShiftCreateWithoutUserInput[] | ShiftUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ShiftCreateOrConnectWithoutUserInput | ShiftCreateOrConnectWithoutUserInput[]
    upsert?: ShiftUpsertWithWhereUniqueWithoutUserInput | ShiftUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ShiftCreateManyUserInputEnvelope
    set?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    disconnect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    delete?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    connect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    update?: ShiftUpdateWithWhereUniqueWithoutUserInput | ShiftUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ShiftUpdateManyWithWhereWithoutUserInput | ShiftUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ShiftScalarWhereInput | ShiftScalarWhereInput[]
  }

  export type GoalUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<GoalCreateWithoutUserInput, GoalUncheckedCreateWithoutUserInput> | GoalCreateWithoutUserInput[] | GoalUncheckedCreateWithoutUserInput[]
    connectOrCreate?: GoalCreateOrConnectWithoutUserInput | GoalCreateOrConnectWithoutUserInput[]
    upsert?: GoalUpsertWithWhereUniqueWithoutUserInput | GoalUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: GoalCreateManyUserInputEnvelope
    set?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    disconnect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    delete?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    connect?: GoalWhereUniqueInput | GoalWhereUniqueInput[]
    update?: GoalUpdateWithWhereUniqueWithoutUserInput | GoalUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: GoalUpdateManyWithWhereWithoutUserInput | GoalUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: GoalScalarWhereInput | GoalScalarWhereInput[]
  }

  export type PaymentUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput> | PaymentCreateWithoutUserInput[] | PaymentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutUserInput | PaymentCreateOrConnectWithoutUserInput[]
    upsert?: PaymentUpsertWithWhereUniqueWithoutUserInput | PaymentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PaymentCreateManyUserInputEnvelope
    set?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    disconnect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    delete?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    update?: PaymentUpdateWithWhereUniqueWithoutUserInput | PaymentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PaymentUpdateManyWithWhereWithoutUserInput | PaymentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
  }

  export type RouteUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<RouteCreateWithoutUserInput, RouteUncheckedCreateWithoutUserInput> | RouteCreateWithoutUserInput[] | RouteUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RouteCreateOrConnectWithoutUserInput | RouteCreateOrConnectWithoutUserInput[]
    upsert?: RouteUpsertWithWhereUniqueWithoutUserInput | RouteUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RouteCreateManyUserInputEnvelope
    set?: RouteWhereUniqueInput | RouteWhereUniqueInput[]
    disconnect?: RouteWhereUniqueInput | RouteWhereUniqueInput[]
    delete?: RouteWhereUniqueInput | RouteWhereUniqueInput[]
    connect?: RouteWhereUniqueInput | RouteWhereUniqueInput[]
    update?: RouteUpdateWithWhereUniqueWithoutUserInput | RouteUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RouteUpdateManyWithWhereWithoutUserInput | RouteUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RouteScalarWhereInput | RouteScalarWhereInput[]
  }

  export type FuelRefuelUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<FuelRefuelCreateWithoutUserInput, FuelRefuelUncheckedCreateWithoutUserInput> | FuelRefuelCreateWithoutUserInput[] | FuelRefuelUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FuelRefuelCreateOrConnectWithoutUserInput | FuelRefuelCreateOrConnectWithoutUserInput[]
    upsert?: FuelRefuelUpsertWithWhereUniqueWithoutUserInput | FuelRefuelUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: FuelRefuelCreateManyUserInputEnvelope
    set?: FuelRefuelWhereUniqueInput | FuelRefuelWhereUniqueInput[]
    disconnect?: FuelRefuelWhereUniqueInput | FuelRefuelWhereUniqueInput[]
    delete?: FuelRefuelWhereUniqueInput | FuelRefuelWhereUniqueInput[]
    connect?: FuelRefuelWhereUniqueInput | FuelRefuelWhereUniqueInput[]
    update?: FuelRefuelUpdateWithWhereUniqueWithoutUserInput | FuelRefuelUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: FuelRefuelUpdateManyWithWhereWithoutUserInput | FuelRefuelUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: FuelRefuelScalarWhereInput | FuelRefuelScalarWhereInput[]
  }

  export type OdometerReadingUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<OdometerReadingCreateWithoutUserInput, OdometerReadingUncheckedCreateWithoutUserInput> | OdometerReadingCreateWithoutUserInput[] | OdometerReadingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OdometerReadingCreateOrConnectWithoutUserInput | OdometerReadingCreateOrConnectWithoutUserInput[]
    upsert?: OdometerReadingUpsertWithWhereUniqueWithoutUserInput | OdometerReadingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OdometerReadingCreateManyUserInputEnvelope
    set?: OdometerReadingWhereUniqueInput | OdometerReadingWhereUniqueInput[]
    disconnect?: OdometerReadingWhereUniqueInput | OdometerReadingWhereUniqueInput[]
    delete?: OdometerReadingWhereUniqueInput | OdometerReadingWhereUniqueInput[]
    connect?: OdometerReadingWhereUniqueInput | OdometerReadingWhereUniqueInput[]
    update?: OdometerReadingUpdateWithWhereUniqueWithoutUserInput | OdometerReadingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OdometerReadingUpdateManyWithWhereWithoutUserInput | OdometerReadingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OdometerReadingScalarWhereInput | OdometerReadingScalarWhereInput[]
  }

  export type ActivityLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ActivityLogCreateWithoutUserInput, ActivityLogUncheckedCreateWithoutUserInput> | ActivityLogCreateWithoutUserInput[] | ActivityLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ActivityLogCreateOrConnectWithoutUserInput | ActivityLogCreateOrConnectWithoutUserInput[]
    upsert?: ActivityLogUpsertWithWhereUniqueWithoutUserInput | ActivityLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ActivityLogCreateManyUserInputEnvelope
    set?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    disconnect?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    delete?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    connect?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    update?: ActivityLogUpdateWithWhereUniqueWithoutUserInput | ActivityLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ActivityLogUpdateManyWithWhereWithoutUserInput | ActivityLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ActivityLogScalarWhereInput | ActivityLogScalarWhereInput[]
  }

  export type UserCreateNestedManyWithoutReferredByAffiliateInput = {
    create?: XOR<UserCreateWithoutReferredByAffiliateInput, UserUncheckedCreateWithoutReferredByAffiliateInput> | UserCreateWithoutReferredByAffiliateInput[] | UserUncheckedCreateWithoutReferredByAffiliateInput[]
    connectOrCreate?: UserCreateOrConnectWithoutReferredByAffiliateInput | UserCreateOrConnectWithoutReferredByAffiliateInput[]
    createMany?: UserCreateManyReferredByAffiliateInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutReferredByAffiliateInput = {
    create?: XOR<UserCreateWithoutReferredByAffiliateInput, UserUncheckedCreateWithoutReferredByAffiliateInput> | UserCreateWithoutReferredByAffiliateInput[] | UserUncheckedCreateWithoutReferredByAffiliateInput[]
    connectOrCreate?: UserCreateOrConnectWithoutReferredByAffiliateInput | UserCreateOrConnectWithoutReferredByAffiliateInput[]
    createMany?: UserCreateManyReferredByAffiliateInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateManyWithoutReferredByAffiliateNestedInput = {
    create?: XOR<UserCreateWithoutReferredByAffiliateInput, UserUncheckedCreateWithoutReferredByAffiliateInput> | UserCreateWithoutReferredByAffiliateInput[] | UserUncheckedCreateWithoutReferredByAffiliateInput[]
    connectOrCreate?: UserCreateOrConnectWithoutReferredByAffiliateInput | UserCreateOrConnectWithoutReferredByAffiliateInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutReferredByAffiliateInput | UserUpsertWithWhereUniqueWithoutReferredByAffiliateInput[]
    createMany?: UserCreateManyReferredByAffiliateInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutReferredByAffiliateInput | UserUpdateWithWhereUniqueWithoutReferredByAffiliateInput[]
    updateMany?: UserUpdateManyWithWhereWithoutReferredByAffiliateInput | UserUpdateManyWithWhereWithoutReferredByAffiliateInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutReferredByAffiliateNestedInput = {
    create?: XOR<UserCreateWithoutReferredByAffiliateInput, UserUncheckedCreateWithoutReferredByAffiliateInput> | UserCreateWithoutReferredByAffiliateInput[] | UserUncheckedCreateWithoutReferredByAffiliateInput[]
    connectOrCreate?: UserCreateOrConnectWithoutReferredByAffiliateInput | UserCreateOrConnectWithoutReferredByAffiliateInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutReferredByAffiliateInput | UserUpsertWithWhereUniqueWithoutReferredByAffiliateInput[]
    createMany?: UserCreateManyReferredByAffiliateInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutReferredByAffiliateInput | UserUpdateWithWhereUniqueWithoutReferredByAffiliateInput[]
    updateMany?: UserUpdateManyWithWhereWithoutReferredByAffiliateInput | UserUpdateManyWithWhereWithoutReferredByAffiliateInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutActivityLogsInput = {
    create?: XOR<UserCreateWithoutActivityLogsInput, UserUncheckedCreateWithoutActivityLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutActivityLogsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumActivityCategoryFieldUpdateOperationsInput = {
    set?: $Enums.ActivityCategory
  }

  export type EnumActivityActionFieldUpdateOperationsInput = {
    set?: $Enums.ActivityAction
  }

  export type UserUpdateOneRequiredWithoutActivityLogsNestedInput = {
    create?: XOR<UserCreateWithoutActivityLogsInput, UserUncheckedCreateWithoutActivityLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutActivityLogsInput
    upsert?: UserUpsertWithoutActivityLogsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutActivityLogsInput, UserUpdateWithoutActivityLogsInput>, UserUncheckedUpdateWithoutActivityLogsInput>
  }

  export type UserCreateNestedOneWithoutCostsInput = {
    create?: XOR<UserCreateWithoutCostsInput, UserUncheckedCreateWithoutCostsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCostsInput
    connect?: UserWhereUniqueInput
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type UserUpdateOneRequiredWithoutCostsNestedInput = {
    create?: XOR<UserCreateWithoutCostsInput, UserUncheckedCreateWithoutCostsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCostsInput
    upsert?: UserUpsertWithoutCostsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCostsInput, UserUpdateWithoutCostsInput>, UserUncheckedUpdateWithoutCostsInput>
  }

  export type UserCreateNestedOneWithoutDeliveriesInput = {
    create?: XOR<UserCreateWithoutDeliveriesInput, UserUncheckedCreateWithoutDeliveriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDeliveriesInput
    connect?: UserWhereUniqueInput
  }

  export type EnumDeliverySourceFieldUpdateOperationsInput = {
    set?: $Enums.DeliverySource
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutDeliveriesNestedInput = {
    create?: XOR<UserCreateWithoutDeliveriesInput, UserUncheckedCreateWithoutDeliveriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDeliveriesInput
    upsert?: UserUpsertWithoutDeliveriesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDeliveriesInput, UserUpdateWithoutDeliveriesInput>, UserUncheckedUpdateWithoutDeliveriesInput>
  }

  export type UserCreateNestedOneWithoutShiftsInput = {
    create?: XOR<UserCreateWithoutShiftsInput, UserUncheckedCreateWithoutShiftsInput>
    connectOrCreate?: UserCreateOrConnectWithoutShiftsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutShiftsNestedInput = {
    create?: XOR<UserCreateWithoutShiftsInput, UserUncheckedCreateWithoutShiftsInput>
    connectOrCreate?: UserCreateOrConnectWithoutShiftsInput
    upsert?: UserUpsertWithoutShiftsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutShiftsInput, UserUpdateWithoutShiftsInput>, UserUncheckedUpdateWithoutShiftsInput>
  }

  export type UserCreateNestedOneWithoutGoalsInput = {
    create?: XOR<UserCreateWithoutGoalsInput, UserUncheckedCreateWithoutGoalsInput>
    connectOrCreate?: UserCreateOrConnectWithoutGoalsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumGoalPeriodFieldUpdateOperationsInput = {
    set?: $Enums.GoalPeriod
  }

  export type UserUpdateOneRequiredWithoutGoalsNestedInput = {
    create?: XOR<UserCreateWithoutGoalsInput, UserUncheckedCreateWithoutGoalsInput>
    connectOrCreate?: UserCreateOrConnectWithoutGoalsInput
    upsert?: UserUpsertWithoutGoalsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutGoalsInput, UserUpdateWithoutGoalsInput>, UserUncheckedUpdateWithoutGoalsInput>
  }

  export type UserCreateNestedOneWithoutRoutesInput = {
    create?: XOR<UserCreateWithoutRoutesInput, UserUncheckedCreateWithoutRoutesInput>
    connectOrCreate?: UserCreateOrConnectWithoutRoutesInput
    connect?: UserWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutRoutesNestedInput = {
    create?: XOR<UserCreateWithoutRoutesInput, UserUncheckedCreateWithoutRoutesInput>
    connectOrCreate?: UserCreateOrConnectWithoutRoutesInput
    upsert?: UserUpsertWithoutRoutesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutRoutesInput, UserUpdateWithoutRoutesInput>, UserUncheckedUpdateWithoutRoutesInput>
  }

  export type UserCreateNestedOneWithoutPaymentsInput = {
    create?: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPaymentsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumPaymentStatusFieldUpdateOperationsInput = {
    set?: $Enums.PaymentStatus
  }

  export type UserUpdateOneRequiredWithoutPaymentsNestedInput = {
    create?: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPaymentsInput
    upsert?: UserUpsertWithoutPaymentsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPaymentsInput, UserUpdateWithoutPaymentsInput>, UserUncheckedUpdateWithoutPaymentsInput>
  }

  export type UserCreateNestedOneWithoutFuelRefuelsInput = {
    create?: XOR<UserCreateWithoutFuelRefuelsInput, UserUncheckedCreateWithoutFuelRefuelsInput>
    connectOrCreate?: UserCreateOrConnectWithoutFuelRefuelsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutFuelRefuelsNestedInput = {
    create?: XOR<UserCreateWithoutFuelRefuelsInput, UserUncheckedCreateWithoutFuelRefuelsInput>
    connectOrCreate?: UserCreateOrConnectWithoutFuelRefuelsInput
    upsert?: UserUpsertWithoutFuelRefuelsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutFuelRefuelsInput, UserUpdateWithoutFuelRefuelsInput>, UserUncheckedUpdateWithoutFuelRefuelsInput>
  }

  export type UserCreateNestedOneWithoutOdometerReadingsInput = {
    create?: XOR<UserCreateWithoutOdometerReadingsInput, UserUncheckedCreateWithoutOdometerReadingsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOdometerReadingsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutOdometerReadingsNestedInput = {
    create?: XOR<UserCreateWithoutOdometerReadingsInput, UserUncheckedCreateWithoutOdometerReadingsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOdometerReadingsInput
    upsert?: UserUpsertWithoutOdometerReadingsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOdometerReadingsInput, UserUpdateWithoutOdometerReadingsInput>, UserUncheckedUpdateWithoutOdometerReadingsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserStatusFilter<$PrismaModel>
    _max?: NestedEnumUserStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumActivityCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityCategory | EnumActivityCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityCategory[] | ListEnumActivityCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityCategory[] | ListEnumActivityCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityCategoryFilter<$PrismaModel> | $Enums.ActivityCategory
  }

  export type NestedEnumActivityActionFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityAction | EnumActivityActionFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityAction[] | ListEnumActivityActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityAction[] | ListEnumActivityActionFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityActionFilter<$PrismaModel> | $Enums.ActivityAction
  }

  export type NestedEnumActivityCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityCategory | EnumActivityCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityCategory[] | ListEnumActivityCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityCategory[] | ListEnumActivityCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityCategoryWithAggregatesFilter<$PrismaModel> | $Enums.ActivityCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActivityCategoryFilter<$PrismaModel>
    _max?: NestedEnumActivityCategoryFilter<$PrismaModel>
  }

  export type NestedEnumActivityActionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityAction | EnumActivityActionFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityAction[] | ListEnumActivityActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityAction[] | ListEnumActivityActionFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityActionWithAggregatesFilter<$PrismaModel> | $Enums.ActivityAction
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActivityActionFilter<$PrismaModel>
    _max?: NestedEnumActivityActionFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedEnumDeliverySourceFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliverySource | EnumDeliverySourceFieldRefInput<$PrismaModel>
    in?: $Enums.DeliverySource[] | ListEnumDeliverySourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliverySource[] | ListEnumDeliverySourceFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliverySourceFilter<$PrismaModel> | $Enums.DeliverySource
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumDeliverySourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliverySource | EnumDeliverySourceFieldRefInput<$PrismaModel>
    in?: $Enums.DeliverySource[] | ListEnumDeliverySourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliverySource[] | ListEnumDeliverySourceFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliverySourceWithAggregatesFilter<$PrismaModel> | $Enums.DeliverySource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDeliverySourceFilter<$PrismaModel>
    _max?: NestedEnumDeliverySourceFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumGoalPeriodFilter<$PrismaModel = never> = {
    equals?: $Enums.GoalPeriod | EnumGoalPeriodFieldRefInput<$PrismaModel>
    in?: $Enums.GoalPeriod[] | ListEnumGoalPeriodFieldRefInput<$PrismaModel>
    notIn?: $Enums.GoalPeriod[] | ListEnumGoalPeriodFieldRefInput<$PrismaModel>
    not?: NestedEnumGoalPeriodFilter<$PrismaModel> | $Enums.GoalPeriod
  }

  export type NestedEnumGoalPeriodWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.GoalPeriod | EnumGoalPeriodFieldRefInput<$PrismaModel>
    in?: $Enums.GoalPeriod[] | ListEnumGoalPeriodFieldRefInput<$PrismaModel>
    notIn?: $Enums.GoalPeriod[] | ListEnumGoalPeriodFieldRefInput<$PrismaModel>
    not?: NestedEnumGoalPeriodWithAggregatesFilter<$PrismaModel> | $Enums.GoalPeriod
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGoalPeriodFilter<$PrismaModel>
    _max?: NestedEnumGoalPeriodFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumPaymentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusFilter<$PrismaModel> | $Enums.PaymentStatus
  }

  export type NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel> | $Enums.PaymentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentStatusFilter<$PrismaModel>
    _max?: NestedEnumPaymentStatusFilter<$PrismaModel>
  }

  export type CostConfigCreateWithoutUserInput = {
    id?: string
    fuelPricePerLiter?: Decimal | DecimalJsLike | number | string
    kmPerLiter?: Decimal | DecimalJsLike | number | string
    maintenancePerKm?: Decimal | DecimalJsLike | number | string
    dailyFoodCost?: Decimal | DecimalJsLike | number | string
    otherDailyCost?: Decimal | DecimalJsLike | number | string
    updatedAt?: Date | string
  }

  export type CostConfigUncheckedCreateWithoutUserInput = {
    id?: string
    fuelPricePerLiter?: Decimal | DecimalJsLike | number | string
    kmPerLiter?: Decimal | DecimalJsLike | number | string
    maintenancePerKm?: Decimal | DecimalJsLike | number | string
    dailyFoodCost?: Decimal | DecimalJsLike | number | string
    otherDailyCost?: Decimal | DecimalJsLike | number | string
    updatedAt?: Date | string
  }

  export type CostConfigCreateOrConnectWithoutUserInput = {
    where: CostConfigWhereUniqueInput
    create: XOR<CostConfigCreateWithoutUserInput, CostConfigUncheckedCreateWithoutUserInput>
  }

  export type DeliveryCreateWithoutUserInput = {
    id?: string
    source: $Enums.DeliverySource
    grossValue: Decimal | DecimalJsLike | number | string
    distanceKm?: Decimal | DecimalJsLike | number | string | null
    durationMin?: number | null
    originName?: string | null
    destinationAddr?: string | null
    destinationLat?: number | null
    destinationLng?: number | null
    proofPhotoUrl?: string | null
    proofLat?: number | null
    proofLng?: number | null
    proofAt?: Date | string | null
    rawInput: JsonNullValueInput | InputJsonValue
    parsedAt?: Date | string
    occurredAt?: Date | string
  }

  export type DeliveryUncheckedCreateWithoutUserInput = {
    id?: string
    source: $Enums.DeliverySource
    grossValue: Decimal | DecimalJsLike | number | string
    distanceKm?: Decimal | DecimalJsLike | number | string | null
    durationMin?: number | null
    originName?: string | null
    destinationAddr?: string | null
    destinationLat?: number | null
    destinationLng?: number | null
    proofPhotoUrl?: string | null
    proofLat?: number | null
    proofLng?: number | null
    proofAt?: Date | string | null
    rawInput: JsonNullValueInput | InputJsonValue
    parsedAt?: Date | string
    occurredAt?: Date | string
  }

  export type DeliveryCreateOrConnectWithoutUserInput = {
    where: DeliveryWhereUniqueInput
    create: XOR<DeliveryCreateWithoutUserInput, DeliveryUncheckedCreateWithoutUserInput>
  }

  export type DeliveryCreateManyUserInputEnvelope = {
    data: DeliveryCreateManyUserInput | DeliveryCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ShiftCreateWithoutUserInput = {
    id?: string
    startedAt: Date | string
    endedAt?: Date | string | null
    startKm?: Decimal | DecimalJsLike | number | string | null
    endKm?: Decimal | DecimalJsLike | number | string | null
  }

  export type ShiftUncheckedCreateWithoutUserInput = {
    id?: string
    startedAt: Date | string
    endedAt?: Date | string | null
    startKm?: Decimal | DecimalJsLike | number | string | null
    endKm?: Decimal | DecimalJsLike | number | string | null
  }

  export type ShiftCreateOrConnectWithoutUserInput = {
    where: ShiftWhereUniqueInput
    create: XOR<ShiftCreateWithoutUserInput, ShiftUncheckedCreateWithoutUserInput>
  }

  export type ShiftCreateManyUserInputEnvelope = {
    data: ShiftCreateManyUserInput | ShiftCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type GoalCreateWithoutUserInput = {
    id?: string
    period: $Enums.GoalPeriod
    targetValue: Decimal | DecimalJsLike | number | string
    active?: boolean
    createdAt?: Date | string
  }

  export type GoalUncheckedCreateWithoutUserInput = {
    id?: string
    period: $Enums.GoalPeriod
    targetValue: Decimal | DecimalJsLike | number | string
    active?: boolean
    createdAt?: Date | string
  }

  export type GoalCreateOrConnectWithoutUserInput = {
    where: GoalWhereUniqueInput
    create: XOR<GoalCreateWithoutUserInput, GoalUncheckedCreateWithoutUserInput>
  }

  export type GoalCreateManyUserInputEnvelope = {
    data: GoalCreateManyUserInput | GoalCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type PaymentCreateWithoutUserInput = {
    id?: string
    asaasChargeId?: string | null
    status: $Enums.PaymentStatus
    amount: Decimal | DecimalJsLike | number | string
    paidAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PaymentUncheckedCreateWithoutUserInput = {
    id?: string
    asaasChargeId?: string | null
    status: $Enums.PaymentStatus
    amount: Decimal | DecimalJsLike | number | string
    paidAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PaymentCreateOrConnectWithoutUserInput = {
    where: PaymentWhereUniqueInput
    create: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput>
  }

  export type PaymentCreateManyUserInputEnvelope = {
    data: PaymentCreateManyUserInput | PaymentCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type RouteCreateWithoutUserInput = {
    id?: string
    addresses: JsonNullValueInput | InputJsonValue
    optimizedOrder: JsonNullValueInput | InputJsonValue
    totalKm: Decimal | DecimalJsLike | number | string
    totalMin: number
    createdAt?: Date | string
  }

  export type RouteUncheckedCreateWithoutUserInput = {
    id?: string
    addresses: JsonNullValueInput | InputJsonValue
    optimizedOrder: JsonNullValueInput | InputJsonValue
    totalKm: Decimal | DecimalJsLike | number | string
    totalMin: number
    createdAt?: Date | string
  }

  export type RouteCreateOrConnectWithoutUserInput = {
    where: RouteWhereUniqueInput
    create: XOR<RouteCreateWithoutUserInput, RouteUncheckedCreateWithoutUserInput>
  }

  export type RouteCreateManyUserInputEnvelope = {
    data: RouteCreateManyUserInput | RouteCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type FuelRefuelCreateWithoutUserInput = {
    id?: string
    totalAmount: Decimal | DecimalJsLike | number | string
    liters: Decimal | DecimalJsLike | number | string
    pricePerLiter: Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: string | null
    rawInput: JsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
  }

  export type FuelRefuelUncheckedCreateWithoutUserInput = {
    id?: string
    totalAmount: Decimal | DecimalJsLike | number | string
    liters: Decimal | DecimalJsLike | number | string
    pricePerLiter: Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: string | null
    rawInput: JsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
  }

  export type FuelRefuelCreateOrConnectWithoutUserInput = {
    where: FuelRefuelWhereUniqueInput
    create: XOR<FuelRefuelCreateWithoutUserInput, FuelRefuelUncheckedCreateWithoutUserInput>
  }

  export type FuelRefuelCreateManyUserInputEnvelope = {
    data: FuelRefuelCreateManyUserInput | FuelRefuelCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OdometerReadingCreateWithoutUserInput = {
    id?: string
    odometerKm: Decimal | DecimalJsLike | number | string
    photoUrl?: string | null
    rawInput: JsonNullValueInput | InputJsonValue
    recordedAt?: Date | string
  }

  export type OdometerReadingUncheckedCreateWithoutUserInput = {
    id?: string
    odometerKm: Decimal | DecimalJsLike | number | string
    photoUrl?: string | null
    rawInput: JsonNullValueInput | InputJsonValue
    recordedAt?: Date | string
  }

  export type OdometerReadingCreateOrConnectWithoutUserInput = {
    where: OdometerReadingWhereUniqueInput
    create: XOR<OdometerReadingCreateWithoutUserInput, OdometerReadingUncheckedCreateWithoutUserInput>
  }

  export type OdometerReadingCreateManyUserInputEnvelope = {
    data: OdometerReadingCreateManyUserInput | OdometerReadingCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ActivityLogCreateWithoutUserInput = {
    id?: string
    category: $Enums.ActivityCategory
    action: $Enums.ActivityAction
    title: string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: string | null
    source?: string
    createdAt?: Date | string
  }

  export type ActivityLogUncheckedCreateWithoutUserInput = {
    id?: string
    category: $Enums.ActivityCategory
    action: $Enums.ActivityAction
    title: string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: string | null
    source?: string
    createdAt?: Date | string
  }

  export type ActivityLogCreateOrConnectWithoutUserInput = {
    where: ActivityLogWhereUniqueInput
    create: XOR<ActivityLogCreateWithoutUserInput, ActivityLogUncheckedCreateWithoutUserInput>
  }

  export type ActivityLogCreateManyUserInputEnvelope = {
    data: ActivityLogCreateManyUserInput | ActivityLogCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AffiliateCreateWithoutReferralsInput = {
    id?: string
    name: string
    code: string
    active?: boolean
    phone?: string | null
    email?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AffiliateUncheckedCreateWithoutReferralsInput = {
    id?: string
    name: string
    code: string
    active?: boolean
    phone?: string | null
    email?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AffiliateCreateOrConnectWithoutReferralsInput = {
    where: AffiliateWhereUniqueInput
    create: XOR<AffiliateCreateWithoutReferralsInput, AffiliateUncheckedCreateWithoutReferralsInput>
  }

  export type CostConfigUpsertWithoutUserInput = {
    update: XOR<CostConfigUpdateWithoutUserInput, CostConfigUncheckedUpdateWithoutUserInput>
    create: XOR<CostConfigCreateWithoutUserInput, CostConfigUncheckedCreateWithoutUserInput>
    where?: CostConfigWhereInput
  }

  export type CostConfigUpdateToOneWithWhereWithoutUserInput = {
    where?: CostConfigWhereInput
    data: XOR<CostConfigUpdateWithoutUserInput, CostConfigUncheckedUpdateWithoutUserInput>
  }

  export type CostConfigUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    fuelPricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    kmPerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    maintenancePerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dailyFoodCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otherDailyCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CostConfigUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    fuelPricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    kmPerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    maintenancePerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dailyFoodCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otherDailyCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeliveryUpsertWithWhereUniqueWithoutUserInput = {
    where: DeliveryWhereUniqueInput
    update: XOR<DeliveryUpdateWithoutUserInput, DeliveryUncheckedUpdateWithoutUserInput>
    create: XOR<DeliveryCreateWithoutUserInput, DeliveryUncheckedCreateWithoutUserInput>
  }

  export type DeliveryUpdateWithWhereUniqueWithoutUserInput = {
    where: DeliveryWhereUniqueInput
    data: XOR<DeliveryUpdateWithoutUserInput, DeliveryUncheckedUpdateWithoutUserInput>
  }

  export type DeliveryUpdateManyWithWhereWithoutUserInput = {
    where: DeliveryScalarWhereInput
    data: XOR<DeliveryUpdateManyMutationInput, DeliveryUncheckedUpdateManyWithoutUserInput>
  }

  export type DeliveryScalarWhereInput = {
    AND?: DeliveryScalarWhereInput | DeliveryScalarWhereInput[]
    OR?: DeliveryScalarWhereInput[]
    NOT?: DeliveryScalarWhereInput | DeliveryScalarWhereInput[]
    id?: StringFilter<"Delivery"> | string
    userId?: StringFilter<"Delivery"> | string
    source?: EnumDeliverySourceFilter<"Delivery"> | $Enums.DeliverySource
    grossValue?: DecimalFilter<"Delivery"> | Decimal | DecimalJsLike | number | string
    distanceKm?: DecimalNullableFilter<"Delivery"> | Decimal | DecimalJsLike | number | string | null
    durationMin?: IntNullableFilter<"Delivery"> | number | null
    originName?: StringNullableFilter<"Delivery"> | string | null
    destinationAddr?: StringNullableFilter<"Delivery"> | string | null
    destinationLat?: FloatNullableFilter<"Delivery"> | number | null
    destinationLng?: FloatNullableFilter<"Delivery"> | number | null
    proofPhotoUrl?: StringNullableFilter<"Delivery"> | string | null
    proofLat?: FloatNullableFilter<"Delivery"> | number | null
    proofLng?: FloatNullableFilter<"Delivery"> | number | null
    proofAt?: DateTimeNullableFilter<"Delivery"> | Date | string | null
    rawInput?: JsonFilter<"Delivery">
    parsedAt?: DateTimeFilter<"Delivery"> | Date | string
    occurredAt?: DateTimeFilter<"Delivery"> | Date | string
  }

  export type ShiftUpsertWithWhereUniqueWithoutUserInput = {
    where: ShiftWhereUniqueInput
    update: XOR<ShiftUpdateWithoutUserInput, ShiftUncheckedUpdateWithoutUserInput>
    create: XOR<ShiftCreateWithoutUserInput, ShiftUncheckedCreateWithoutUserInput>
  }

  export type ShiftUpdateWithWhereUniqueWithoutUserInput = {
    where: ShiftWhereUniqueInput
    data: XOR<ShiftUpdateWithoutUserInput, ShiftUncheckedUpdateWithoutUserInput>
  }

  export type ShiftUpdateManyWithWhereWithoutUserInput = {
    where: ShiftScalarWhereInput
    data: XOR<ShiftUpdateManyMutationInput, ShiftUncheckedUpdateManyWithoutUserInput>
  }

  export type ShiftScalarWhereInput = {
    AND?: ShiftScalarWhereInput | ShiftScalarWhereInput[]
    OR?: ShiftScalarWhereInput[]
    NOT?: ShiftScalarWhereInput | ShiftScalarWhereInput[]
    id?: StringFilter<"Shift"> | string
    userId?: StringFilter<"Shift"> | string
    startedAt?: DateTimeFilter<"Shift"> | Date | string
    endedAt?: DateTimeNullableFilter<"Shift"> | Date | string | null
    startKm?: DecimalNullableFilter<"Shift"> | Decimal | DecimalJsLike | number | string | null
    endKm?: DecimalNullableFilter<"Shift"> | Decimal | DecimalJsLike | number | string | null
  }

  export type GoalUpsertWithWhereUniqueWithoutUserInput = {
    where: GoalWhereUniqueInput
    update: XOR<GoalUpdateWithoutUserInput, GoalUncheckedUpdateWithoutUserInput>
    create: XOR<GoalCreateWithoutUserInput, GoalUncheckedCreateWithoutUserInput>
  }

  export type GoalUpdateWithWhereUniqueWithoutUserInput = {
    where: GoalWhereUniqueInput
    data: XOR<GoalUpdateWithoutUserInput, GoalUncheckedUpdateWithoutUserInput>
  }

  export type GoalUpdateManyWithWhereWithoutUserInput = {
    where: GoalScalarWhereInput
    data: XOR<GoalUpdateManyMutationInput, GoalUncheckedUpdateManyWithoutUserInput>
  }

  export type GoalScalarWhereInput = {
    AND?: GoalScalarWhereInput | GoalScalarWhereInput[]
    OR?: GoalScalarWhereInput[]
    NOT?: GoalScalarWhereInput | GoalScalarWhereInput[]
    id?: StringFilter<"Goal"> | string
    userId?: StringFilter<"Goal"> | string
    period?: EnumGoalPeriodFilter<"Goal"> | $Enums.GoalPeriod
    targetValue?: DecimalFilter<"Goal"> | Decimal | DecimalJsLike | number | string
    active?: BoolFilter<"Goal"> | boolean
    createdAt?: DateTimeFilter<"Goal"> | Date | string
  }

  export type PaymentUpsertWithWhereUniqueWithoutUserInput = {
    where: PaymentWhereUniqueInput
    update: XOR<PaymentUpdateWithoutUserInput, PaymentUncheckedUpdateWithoutUserInput>
    create: XOR<PaymentCreateWithoutUserInput, PaymentUncheckedCreateWithoutUserInput>
  }

  export type PaymentUpdateWithWhereUniqueWithoutUserInput = {
    where: PaymentWhereUniqueInput
    data: XOR<PaymentUpdateWithoutUserInput, PaymentUncheckedUpdateWithoutUserInput>
  }

  export type PaymentUpdateManyWithWhereWithoutUserInput = {
    where: PaymentScalarWhereInput
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyWithoutUserInput>
  }

  export type PaymentScalarWhereInput = {
    AND?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
    OR?: PaymentScalarWhereInput[]
    NOT?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
    id?: StringFilter<"Payment"> | string
    userId?: StringFilter<"Payment"> | string
    asaasChargeId?: StringNullableFilter<"Payment"> | string | null
    status?: EnumPaymentStatusFilter<"Payment"> | $Enums.PaymentStatus
    amount?: DecimalFilter<"Payment"> | Decimal | DecimalJsLike | number | string
    paidAt?: DateTimeNullableFilter<"Payment"> | Date | string | null
    createdAt?: DateTimeFilter<"Payment"> | Date | string
  }

  export type RouteUpsertWithWhereUniqueWithoutUserInput = {
    where: RouteWhereUniqueInput
    update: XOR<RouteUpdateWithoutUserInput, RouteUncheckedUpdateWithoutUserInput>
    create: XOR<RouteCreateWithoutUserInput, RouteUncheckedCreateWithoutUserInput>
  }

  export type RouteUpdateWithWhereUniqueWithoutUserInput = {
    where: RouteWhereUniqueInput
    data: XOR<RouteUpdateWithoutUserInput, RouteUncheckedUpdateWithoutUserInput>
  }

  export type RouteUpdateManyWithWhereWithoutUserInput = {
    where: RouteScalarWhereInput
    data: XOR<RouteUpdateManyMutationInput, RouteUncheckedUpdateManyWithoutUserInput>
  }

  export type RouteScalarWhereInput = {
    AND?: RouteScalarWhereInput | RouteScalarWhereInput[]
    OR?: RouteScalarWhereInput[]
    NOT?: RouteScalarWhereInput | RouteScalarWhereInput[]
    id?: StringFilter<"Route"> | string
    userId?: StringFilter<"Route"> | string
    addresses?: JsonFilter<"Route">
    optimizedOrder?: JsonFilter<"Route">
    totalKm?: DecimalFilter<"Route"> | Decimal | DecimalJsLike | number | string
    totalMin?: IntFilter<"Route"> | number
    createdAt?: DateTimeFilter<"Route"> | Date | string
  }

  export type FuelRefuelUpsertWithWhereUniqueWithoutUserInput = {
    where: FuelRefuelWhereUniqueInput
    update: XOR<FuelRefuelUpdateWithoutUserInput, FuelRefuelUncheckedUpdateWithoutUserInput>
    create: XOR<FuelRefuelCreateWithoutUserInput, FuelRefuelUncheckedCreateWithoutUserInput>
  }

  export type FuelRefuelUpdateWithWhereUniqueWithoutUserInput = {
    where: FuelRefuelWhereUniqueInput
    data: XOR<FuelRefuelUpdateWithoutUserInput, FuelRefuelUncheckedUpdateWithoutUserInput>
  }

  export type FuelRefuelUpdateManyWithWhereWithoutUserInput = {
    where: FuelRefuelScalarWhereInput
    data: XOR<FuelRefuelUpdateManyMutationInput, FuelRefuelUncheckedUpdateManyWithoutUserInput>
  }

  export type FuelRefuelScalarWhereInput = {
    AND?: FuelRefuelScalarWhereInput | FuelRefuelScalarWhereInput[]
    OR?: FuelRefuelScalarWhereInput[]
    NOT?: FuelRefuelScalarWhereInput | FuelRefuelScalarWhereInput[]
    id?: StringFilter<"FuelRefuel"> | string
    userId?: StringFilter<"FuelRefuel"> | string
    totalAmount?: DecimalFilter<"FuelRefuel"> | Decimal | DecimalJsLike | number | string
    liters?: DecimalFilter<"FuelRefuel"> | Decimal | DecimalJsLike | number | string
    pricePerLiter?: DecimalFilter<"FuelRefuel"> | Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: StringNullableFilter<"FuelRefuel"> | string | null
    rawInput?: JsonFilter<"FuelRefuel">
    occurredAt?: DateTimeFilter<"FuelRefuel"> | Date | string
  }

  export type OdometerReadingUpsertWithWhereUniqueWithoutUserInput = {
    where: OdometerReadingWhereUniqueInput
    update: XOR<OdometerReadingUpdateWithoutUserInput, OdometerReadingUncheckedUpdateWithoutUserInput>
    create: XOR<OdometerReadingCreateWithoutUserInput, OdometerReadingUncheckedCreateWithoutUserInput>
  }

  export type OdometerReadingUpdateWithWhereUniqueWithoutUserInput = {
    where: OdometerReadingWhereUniqueInput
    data: XOR<OdometerReadingUpdateWithoutUserInput, OdometerReadingUncheckedUpdateWithoutUserInput>
  }

  export type OdometerReadingUpdateManyWithWhereWithoutUserInput = {
    where: OdometerReadingScalarWhereInput
    data: XOR<OdometerReadingUpdateManyMutationInput, OdometerReadingUncheckedUpdateManyWithoutUserInput>
  }

  export type OdometerReadingScalarWhereInput = {
    AND?: OdometerReadingScalarWhereInput | OdometerReadingScalarWhereInput[]
    OR?: OdometerReadingScalarWhereInput[]
    NOT?: OdometerReadingScalarWhereInput | OdometerReadingScalarWhereInput[]
    id?: StringFilter<"OdometerReading"> | string
    userId?: StringFilter<"OdometerReading"> | string
    odometerKm?: DecimalFilter<"OdometerReading"> | Decimal | DecimalJsLike | number | string
    photoUrl?: StringNullableFilter<"OdometerReading"> | string | null
    rawInput?: JsonFilter<"OdometerReading">
    recordedAt?: DateTimeFilter<"OdometerReading"> | Date | string
  }

  export type ActivityLogUpsertWithWhereUniqueWithoutUserInput = {
    where: ActivityLogWhereUniqueInput
    update: XOR<ActivityLogUpdateWithoutUserInput, ActivityLogUncheckedUpdateWithoutUserInput>
    create: XOR<ActivityLogCreateWithoutUserInput, ActivityLogUncheckedCreateWithoutUserInput>
  }

  export type ActivityLogUpdateWithWhereUniqueWithoutUserInput = {
    where: ActivityLogWhereUniqueInput
    data: XOR<ActivityLogUpdateWithoutUserInput, ActivityLogUncheckedUpdateWithoutUserInput>
  }

  export type ActivityLogUpdateManyWithWhereWithoutUserInput = {
    where: ActivityLogScalarWhereInput
    data: XOR<ActivityLogUpdateManyMutationInput, ActivityLogUncheckedUpdateManyWithoutUserInput>
  }

  export type ActivityLogScalarWhereInput = {
    AND?: ActivityLogScalarWhereInput | ActivityLogScalarWhereInput[]
    OR?: ActivityLogScalarWhereInput[]
    NOT?: ActivityLogScalarWhereInput | ActivityLogScalarWhereInput[]
    id?: StringFilter<"ActivityLog"> | string
    userId?: StringFilter<"ActivityLog"> | string
    category?: EnumActivityCategoryFilter<"ActivityLog"> | $Enums.ActivityCategory
    action?: EnumActivityActionFilter<"ActivityLog"> | $Enums.ActivityAction
    title?: StringFilter<"ActivityLog"> | string
    changes?: JsonFilter<"ActivityLog">
    entityId?: StringNullableFilter<"ActivityLog"> | string | null
    source?: StringFilter<"ActivityLog"> | string
    createdAt?: DateTimeFilter<"ActivityLog"> | Date | string
  }

  export type AffiliateUpsertWithoutReferralsInput = {
    update: XOR<AffiliateUpdateWithoutReferralsInput, AffiliateUncheckedUpdateWithoutReferralsInput>
    create: XOR<AffiliateCreateWithoutReferralsInput, AffiliateUncheckedCreateWithoutReferralsInput>
    where?: AffiliateWhereInput
  }

  export type AffiliateUpdateToOneWithWhereWithoutReferralsInput = {
    where?: AffiliateWhereInput
    data: XOR<AffiliateUpdateWithoutReferralsInput, AffiliateUncheckedUpdateWithoutReferralsInput>
  }

  export type AffiliateUpdateWithoutReferralsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AffiliateUncheckedUpdateWithoutReferralsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutReferredByAffiliateInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigCreateNestedOneWithoutUserInput
    deliveries?: DeliveryCreateNestedManyWithoutUserInput
    shifts?: ShiftCreateNestedManyWithoutUserInput
    goals?: GoalCreateNestedManyWithoutUserInput
    payments?: PaymentCreateNestedManyWithoutUserInput
    routes?: RouteCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutReferredByAffiliateInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigUncheckedCreateNestedOneWithoutUserInput
    deliveries?: DeliveryUncheckedCreateNestedManyWithoutUserInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutUserInput
    goals?: GoalUncheckedCreateNestedManyWithoutUserInput
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput
    routes?: RouteUncheckedCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelUncheckedCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutReferredByAffiliateInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutReferredByAffiliateInput, UserUncheckedCreateWithoutReferredByAffiliateInput>
  }

  export type UserCreateManyReferredByAffiliateInputEnvelope = {
    data: UserCreateManyReferredByAffiliateInput | UserCreateManyReferredByAffiliateInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithWhereUniqueWithoutReferredByAffiliateInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutReferredByAffiliateInput, UserUncheckedUpdateWithoutReferredByAffiliateInput>
    create: XOR<UserCreateWithoutReferredByAffiliateInput, UserUncheckedCreateWithoutReferredByAffiliateInput>
  }

  export type UserUpdateWithWhereUniqueWithoutReferredByAffiliateInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutReferredByAffiliateInput, UserUncheckedUpdateWithoutReferredByAffiliateInput>
  }

  export type UserUpdateManyWithWhereWithoutReferredByAffiliateInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutReferredByAffiliateInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    whatsappNumber?: StringFilter<"User"> | string
    email?: StringNullableFilter<"User"> | string | null
    name?: StringNullableFilter<"User"> | string | null
    vehiclePlate?: StringNullableFilter<"User"> | string | null
    city?: StringNullableFilter<"User"> | string | null
    workApps?: JsonFilter<"User">
    subscriptionPaymentMethod?: StringFilter<"User"> | string
    workDays?: JsonFilter<"User">
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    trialEndsAt?: DateTimeNullableFilter<"User"> | Date | string | null
    subscribedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    currentOdometerKm?: DecimalNullableFilter<"User"> | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: StringNullableFilter<"User"> | string | null
    affiliateCouponCode?: StringNullableFilter<"User"> | string | null
    referredAt?: DateTimeNullableFilter<"User"> | Date | string | null
    asaasCustomerId?: StringNullableFilter<"User"> | string | null
  }

  export type UserCreateWithoutActivityLogsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigCreateNestedOneWithoutUserInput
    deliveries?: DeliveryCreateNestedManyWithoutUserInput
    shifts?: ShiftCreateNestedManyWithoutUserInput
    goals?: GoalCreateNestedManyWithoutUserInput
    payments?: PaymentCreateNestedManyWithoutUserInput
    routes?: RouteCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingCreateNestedManyWithoutUserInput
    referredByAffiliate?: AffiliateCreateNestedOneWithoutReferralsInput
  }

  export type UserUncheckedCreateWithoutActivityLogsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigUncheckedCreateNestedOneWithoutUserInput
    deliveries?: DeliveryUncheckedCreateNestedManyWithoutUserInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutUserInput
    goals?: GoalUncheckedCreateNestedManyWithoutUserInput
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput
    routes?: RouteUncheckedCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelUncheckedCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutActivityLogsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutActivityLogsInput, UserUncheckedCreateWithoutActivityLogsInput>
  }

  export type UserUpsertWithoutActivityLogsInput = {
    update: XOR<UserUpdateWithoutActivityLogsInput, UserUncheckedUpdateWithoutActivityLogsInput>
    create: XOR<UserCreateWithoutActivityLogsInput, UserUncheckedCreateWithoutActivityLogsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutActivityLogsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutActivityLogsInput, UserUncheckedUpdateWithoutActivityLogsInput>
  }

  export type UserUpdateWithoutActivityLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUpdateManyWithoutUserNestedInput
    shifts?: ShiftUpdateManyWithoutUserNestedInput
    goals?: GoalUpdateManyWithoutUserNestedInput
    payments?: PaymentUpdateManyWithoutUserNestedInput
    routes?: RouteUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUpdateManyWithoutUserNestedInput
    referredByAffiliate?: AffiliateUpdateOneWithoutReferralsNestedInput
  }

  export type UserUncheckedUpdateWithoutActivityLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: NullableStringFieldUpdateOperationsInput | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUncheckedUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUncheckedUpdateManyWithoutUserNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    goals?: GoalUncheckedUpdateManyWithoutUserNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput
    routes?: RouteUncheckedUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUncheckedUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutCostsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    deliveries?: DeliveryCreateNestedManyWithoutUserInput
    shifts?: ShiftCreateNestedManyWithoutUserInput
    goals?: GoalCreateNestedManyWithoutUserInput
    payments?: PaymentCreateNestedManyWithoutUserInput
    routes?: RouteCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    referredByAffiliate?: AffiliateCreateNestedOneWithoutReferralsInput
  }

  export type UserUncheckedCreateWithoutCostsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    deliveries?: DeliveryUncheckedCreateNestedManyWithoutUserInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutUserInput
    goals?: GoalUncheckedCreateNestedManyWithoutUserInput
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput
    routes?: RouteUncheckedCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelUncheckedCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCostsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCostsInput, UserUncheckedCreateWithoutCostsInput>
  }

  export type UserUpsertWithoutCostsInput = {
    update: XOR<UserUpdateWithoutCostsInput, UserUncheckedUpdateWithoutCostsInput>
    create: XOR<UserCreateWithoutCostsInput, UserUncheckedCreateWithoutCostsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCostsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCostsInput, UserUncheckedUpdateWithoutCostsInput>
  }

  export type UserUpdateWithoutCostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveries?: DeliveryUpdateManyWithoutUserNestedInput
    shifts?: ShiftUpdateManyWithoutUserNestedInput
    goals?: GoalUpdateManyWithoutUserNestedInput
    payments?: PaymentUpdateManyWithoutUserNestedInput
    routes?: RouteUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    referredByAffiliate?: AffiliateUpdateOneWithoutReferralsNestedInput
  }

  export type UserUncheckedUpdateWithoutCostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: NullableStringFieldUpdateOperationsInput | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveries?: DeliveryUncheckedUpdateManyWithoutUserNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    goals?: GoalUncheckedUpdateManyWithoutUserNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput
    routes?: RouteUncheckedUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUncheckedUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutDeliveriesInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigCreateNestedOneWithoutUserInput
    shifts?: ShiftCreateNestedManyWithoutUserInput
    goals?: GoalCreateNestedManyWithoutUserInput
    payments?: PaymentCreateNestedManyWithoutUserInput
    routes?: RouteCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    referredByAffiliate?: AffiliateCreateNestedOneWithoutReferralsInput
  }

  export type UserUncheckedCreateWithoutDeliveriesInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigUncheckedCreateNestedOneWithoutUserInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutUserInput
    goals?: GoalUncheckedCreateNestedManyWithoutUserInput
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput
    routes?: RouteUncheckedCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelUncheckedCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDeliveriesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDeliveriesInput, UserUncheckedCreateWithoutDeliveriesInput>
  }

  export type UserUpsertWithoutDeliveriesInput = {
    update: XOR<UserUpdateWithoutDeliveriesInput, UserUncheckedUpdateWithoutDeliveriesInput>
    create: XOR<UserCreateWithoutDeliveriesInput, UserUncheckedCreateWithoutDeliveriesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDeliveriesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDeliveriesInput, UserUncheckedUpdateWithoutDeliveriesInput>
  }

  export type UserUpdateWithoutDeliveriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUpdateOneWithoutUserNestedInput
    shifts?: ShiftUpdateManyWithoutUserNestedInput
    goals?: GoalUpdateManyWithoutUserNestedInput
    payments?: PaymentUpdateManyWithoutUserNestedInput
    routes?: RouteUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    referredByAffiliate?: AffiliateUpdateOneWithoutReferralsNestedInput
  }

  export type UserUncheckedUpdateWithoutDeliveriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: NullableStringFieldUpdateOperationsInput | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUncheckedUpdateOneWithoutUserNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    goals?: GoalUncheckedUpdateManyWithoutUserNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput
    routes?: RouteUncheckedUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUncheckedUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutShiftsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigCreateNestedOneWithoutUserInput
    deliveries?: DeliveryCreateNestedManyWithoutUserInput
    goals?: GoalCreateNestedManyWithoutUserInput
    payments?: PaymentCreateNestedManyWithoutUserInput
    routes?: RouteCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    referredByAffiliate?: AffiliateCreateNestedOneWithoutReferralsInput
  }

  export type UserUncheckedCreateWithoutShiftsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigUncheckedCreateNestedOneWithoutUserInput
    deliveries?: DeliveryUncheckedCreateNestedManyWithoutUserInput
    goals?: GoalUncheckedCreateNestedManyWithoutUserInput
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput
    routes?: RouteUncheckedCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelUncheckedCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutShiftsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutShiftsInput, UserUncheckedCreateWithoutShiftsInput>
  }

  export type UserUpsertWithoutShiftsInput = {
    update: XOR<UserUpdateWithoutShiftsInput, UserUncheckedUpdateWithoutShiftsInput>
    create: XOR<UserCreateWithoutShiftsInput, UserUncheckedCreateWithoutShiftsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutShiftsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutShiftsInput, UserUncheckedUpdateWithoutShiftsInput>
  }

  export type UserUpdateWithoutShiftsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUpdateManyWithoutUserNestedInput
    goals?: GoalUpdateManyWithoutUserNestedInput
    payments?: PaymentUpdateManyWithoutUserNestedInput
    routes?: RouteUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    referredByAffiliate?: AffiliateUpdateOneWithoutReferralsNestedInput
  }

  export type UserUncheckedUpdateWithoutShiftsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: NullableStringFieldUpdateOperationsInput | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUncheckedUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUncheckedUpdateManyWithoutUserNestedInput
    goals?: GoalUncheckedUpdateManyWithoutUserNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput
    routes?: RouteUncheckedUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUncheckedUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutGoalsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigCreateNestedOneWithoutUserInput
    deliveries?: DeliveryCreateNestedManyWithoutUserInput
    shifts?: ShiftCreateNestedManyWithoutUserInput
    payments?: PaymentCreateNestedManyWithoutUserInput
    routes?: RouteCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    referredByAffiliate?: AffiliateCreateNestedOneWithoutReferralsInput
  }

  export type UserUncheckedCreateWithoutGoalsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigUncheckedCreateNestedOneWithoutUserInput
    deliveries?: DeliveryUncheckedCreateNestedManyWithoutUserInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutUserInput
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput
    routes?: RouteUncheckedCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelUncheckedCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutGoalsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutGoalsInput, UserUncheckedCreateWithoutGoalsInput>
  }

  export type UserUpsertWithoutGoalsInput = {
    update: XOR<UserUpdateWithoutGoalsInput, UserUncheckedUpdateWithoutGoalsInput>
    create: XOR<UserCreateWithoutGoalsInput, UserUncheckedCreateWithoutGoalsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutGoalsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutGoalsInput, UserUncheckedUpdateWithoutGoalsInput>
  }

  export type UserUpdateWithoutGoalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUpdateManyWithoutUserNestedInput
    shifts?: ShiftUpdateManyWithoutUserNestedInput
    payments?: PaymentUpdateManyWithoutUserNestedInput
    routes?: RouteUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    referredByAffiliate?: AffiliateUpdateOneWithoutReferralsNestedInput
  }

  export type UserUncheckedUpdateWithoutGoalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: NullableStringFieldUpdateOperationsInput | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUncheckedUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUncheckedUpdateManyWithoutUserNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput
    routes?: RouteUncheckedUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUncheckedUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutRoutesInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigCreateNestedOneWithoutUserInput
    deliveries?: DeliveryCreateNestedManyWithoutUserInput
    shifts?: ShiftCreateNestedManyWithoutUserInput
    goals?: GoalCreateNestedManyWithoutUserInput
    payments?: PaymentCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    referredByAffiliate?: AffiliateCreateNestedOneWithoutReferralsInput
  }

  export type UserUncheckedCreateWithoutRoutesInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigUncheckedCreateNestedOneWithoutUserInput
    deliveries?: DeliveryUncheckedCreateNestedManyWithoutUserInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutUserInput
    goals?: GoalUncheckedCreateNestedManyWithoutUserInput
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelUncheckedCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutRoutesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutRoutesInput, UserUncheckedCreateWithoutRoutesInput>
  }

  export type UserUpsertWithoutRoutesInput = {
    update: XOR<UserUpdateWithoutRoutesInput, UserUncheckedUpdateWithoutRoutesInput>
    create: XOR<UserCreateWithoutRoutesInput, UserUncheckedCreateWithoutRoutesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutRoutesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutRoutesInput, UserUncheckedUpdateWithoutRoutesInput>
  }

  export type UserUpdateWithoutRoutesInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUpdateManyWithoutUserNestedInput
    shifts?: ShiftUpdateManyWithoutUserNestedInput
    goals?: GoalUpdateManyWithoutUserNestedInput
    payments?: PaymentUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    referredByAffiliate?: AffiliateUpdateOneWithoutReferralsNestedInput
  }

  export type UserUncheckedUpdateWithoutRoutesInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: NullableStringFieldUpdateOperationsInput | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUncheckedUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUncheckedUpdateManyWithoutUserNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    goals?: GoalUncheckedUpdateManyWithoutUserNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUncheckedUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutPaymentsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigCreateNestedOneWithoutUserInput
    deliveries?: DeliveryCreateNestedManyWithoutUserInput
    shifts?: ShiftCreateNestedManyWithoutUserInput
    goals?: GoalCreateNestedManyWithoutUserInput
    routes?: RouteCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    referredByAffiliate?: AffiliateCreateNestedOneWithoutReferralsInput
  }

  export type UserUncheckedCreateWithoutPaymentsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigUncheckedCreateNestedOneWithoutUserInput
    deliveries?: DeliveryUncheckedCreateNestedManyWithoutUserInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutUserInput
    goals?: GoalUncheckedCreateNestedManyWithoutUserInput
    routes?: RouteUncheckedCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelUncheckedCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPaymentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
  }

  export type UserUpsertWithoutPaymentsInput = {
    update: XOR<UserUpdateWithoutPaymentsInput, UserUncheckedUpdateWithoutPaymentsInput>
    create: XOR<UserCreateWithoutPaymentsInput, UserUncheckedCreateWithoutPaymentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPaymentsInput, UserUncheckedUpdateWithoutPaymentsInput>
  }

  export type UserUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUpdateManyWithoutUserNestedInput
    shifts?: ShiftUpdateManyWithoutUserNestedInput
    goals?: GoalUpdateManyWithoutUserNestedInput
    routes?: RouteUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    referredByAffiliate?: AffiliateUpdateOneWithoutReferralsNestedInput
  }

  export type UserUncheckedUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: NullableStringFieldUpdateOperationsInput | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUncheckedUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUncheckedUpdateManyWithoutUserNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    goals?: GoalUncheckedUpdateManyWithoutUserNestedInput
    routes?: RouteUncheckedUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUncheckedUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutFuelRefuelsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigCreateNestedOneWithoutUserInput
    deliveries?: DeliveryCreateNestedManyWithoutUserInput
    shifts?: ShiftCreateNestedManyWithoutUserInput
    goals?: GoalCreateNestedManyWithoutUserInput
    payments?: PaymentCreateNestedManyWithoutUserInput
    routes?: RouteCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    referredByAffiliate?: AffiliateCreateNestedOneWithoutReferralsInput
  }

  export type UserUncheckedCreateWithoutFuelRefuelsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigUncheckedCreateNestedOneWithoutUserInput
    deliveries?: DeliveryUncheckedCreateNestedManyWithoutUserInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutUserInput
    goals?: GoalUncheckedCreateNestedManyWithoutUserInput
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput
    routes?: RouteUncheckedCreateNestedManyWithoutUserInput
    odometerReadings?: OdometerReadingUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutFuelRefuelsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutFuelRefuelsInput, UserUncheckedCreateWithoutFuelRefuelsInput>
  }

  export type UserUpsertWithoutFuelRefuelsInput = {
    update: XOR<UserUpdateWithoutFuelRefuelsInput, UserUncheckedUpdateWithoutFuelRefuelsInput>
    create: XOR<UserCreateWithoutFuelRefuelsInput, UserUncheckedCreateWithoutFuelRefuelsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutFuelRefuelsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutFuelRefuelsInput, UserUncheckedUpdateWithoutFuelRefuelsInput>
  }

  export type UserUpdateWithoutFuelRefuelsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUpdateManyWithoutUserNestedInput
    shifts?: ShiftUpdateManyWithoutUserNestedInput
    goals?: GoalUpdateManyWithoutUserNestedInput
    payments?: PaymentUpdateManyWithoutUserNestedInput
    routes?: RouteUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    referredByAffiliate?: AffiliateUpdateOneWithoutReferralsNestedInput
  }

  export type UserUncheckedUpdateWithoutFuelRefuelsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: NullableStringFieldUpdateOperationsInput | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUncheckedUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUncheckedUpdateManyWithoutUserNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    goals?: GoalUncheckedUpdateManyWithoutUserNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput
    routes?: RouteUncheckedUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutOdometerReadingsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigCreateNestedOneWithoutUserInput
    deliveries?: DeliveryCreateNestedManyWithoutUserInput
    shifts?: ShiftCreateNestedManyWithoutUserInput
    goals?: GoalCreateNestedManyWithoutUserInput
    payments?: PaymentCreateNestedManyWithoutUserInput
    routes?: RouteCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    referredByAffiliate?: AffiliateCreateNestedOneWithoutReferralsInput
  }

  export type UserUncheckedCreateWithoutOdometerReadingsInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
    costs?: CostConfigUncheckedCreateNestedOneWithoutUserInput
    deliveries?: DeliveryUncheckedCreateNestedManyWithoutUserInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutUserInput
    goals?: GoalUncheckedCreateNestedManyWithoutUserInput
    payments?: PaymentUncheckedCreateNestedManyWithoutUserInput
    routes?: RouteUncheckedCreateNestedManyWithoutUserInput
    fuelRefuels?: FuelRefuelUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOdometerReadingsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOdometerReadingsInput, UserUncheckedCreateWithoutOdometerReadingsInput>
  }

  export type UserUpsertWithoutOdometerReadingsInput = {
    update: XOR<UserUpdateWithoutOdometerReadingsInput, UserUncheckedUpdateWithoutOdometerReadingsInput>
    create: XOR<UserCreateWithoutOdometerReadingsInput, UserUncheckedCreateWithoutOdometerReadingsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOdometerReadingsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOdometerReadingsInput, UserUncheckedUpdateWithoutOdometerReadingsInput>
  }

  export type UserUpdateWithoutOdometerReadingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUpdateManyWithoutUserNestedInput
    shifts?: ShiftUpdateManyWithoutUserNestedInput
    goals?: GoalUpdateManyWithoutUserNestedInput
    payments?: PaymentUpdateManyWithoutUserNestedInput
    routes?: RouteUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    referredByAffiliate?: AffiliateUpdateOneWithoutReferralsNestedInput
  }

  export type UserUncheckedUpdateWithoutOdometerReadingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    referredByAffiliateId?: NullableStringFieldUpdateOperationsInput | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUncheckedUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUncheckedUpdateManyWithoutUserNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    goals?: GoalUncheckedUpdateManyWithoutUserNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput
    routes?: RouteUncheckedUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type DeliveryCreateManyUserInput = {
    id?: string
    source: $Enums.DeliverySource
    grossValue: Decimal | DecimalJsLike | number | string
    distanceKm?: Decimal | DecimalJsLike | number | string | null
    durationMin?: number | null
    originName?: string | null
    destinationAddr?: string | null
    destinationLat?: number | null
    destinationLng?: number | null
    proofPhotoUrl?: string | null
    proofLat?: number | null
    proofLng?: number | null
    proofAt?: Date | string | null
    rawInput: JsonNullValueInput | InputJsonValue
    parsedAt?: Date | string
    occurredAt?: Date | string
  }

  export type ShiftCreateManyUserInput = {
    id?: string
    startedAt: Date | string
    endedAt?: Date | string | null
    startKm?: Decimal | DecimalJsLike | number | string | null
    endKm?: Decimal | DecimalJsLike | number | string | null
  }

  export type GoalCreateManyUserInput = {
    id?: string
    period: $Enums.GoalPeriod
    targetValue: Decimal | DecimalJsLike | number | string
    active?: boolean
    createdAt?: Date | string
  }

  export type PaymentCreateManyUserInput = {
    id?: string
    asaasChargeId?: string | null
    status: $Enums.PaymentStatus
    amount: Decimal | DecimalJsLike | number | string
    paidAt?: Date | string | null
    createdAt?: Date | string
  }

  export type RouteCreateManyUserInput = {
    id?: string
    addresses: JsonNullValueInput | InputJsonValue
    optimizedOrder: JsonNullValueInput | InputJsonValue
    totalKm: Decimal | DecimalJsLike | number | string
    totalMin: number
    createdAt?: Date | string
  }

  export type FuelRefuelCreateManyUserInput = {
    id?: string
    totalAmount: Decimal | DecimalJsLike | number | string
    liters: Decimal | DecimalJsLike | number | string
    pricePerLiter: Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: string | null
    rawInput: JsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
  }

  export type OdometerReadingCreateManyUserInput = {
    id?: string
    odometerKm: Decimal | DecimalJsLike | number | string
    photoUrl?: string | null
    rawInput: JsonNullValueInput | InputJsonValue
    recordedAt?: Date | string
  }

  export type ActivityLogCreateManyUserInput = {
    id?: string
    category: $Enums.ActivityCategory
    action: $Enums.ActivityAction
    title: string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: string | null
    source?: string
    createdAt?: Date | string
  }

  export type DeliveryUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: EnumDeliverySourceFieldUpdateOperationsInput | $Enums.DeliverySource
    grossValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    distanceKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    durationMin?: NullableIntFieldUpdateOperationsInput | number | null
    originName?: NullableStringFieldUpdateOperationsInput | string | null
    destinationAddr?: NullableStringFieldUpdateOperationsInput | string | null
    destinationLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destinationLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    proofLat?: NullableFloatFieldUpdateOperationsInput | number | null
    proofLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    parsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeliveryUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: EnumDeliverySourceFieldUpdateOperationsInput | $Enums.DeliverySource
    grossValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    distanceKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    durationMin?: NullableIntFieldUpdateOperationsInput | number | null
    originName?: NullableStringFieldUpdateOperationsInput | string | null
    destinationAddr?: NullableStringFieldUpdateOperationsInput | string | null
    destinationLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destinationLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    proofLat?: NullableFloatFieldUpdateOperationsInput | number | null
    proofLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    parsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeliveryUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: EnumDeliverySourceFieldUpdateOperationsInput | $Enums.DeliverySource
    grossValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    distanceKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    durationMin?: NullableIntFieldUpdateOperationsInput | number | null
    originName?: NullableStringFieldUpdateOperationsInput | string | null
    destinationAddr?: NullableStringFieldUpdateOperationsInput | string | null
    destinationLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destinationLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    proofLat?: NullableFloatFieldUpdateOperationsInput | number | null
    proofLng?: NullableFloatFieldUpdateOperationsInput | number | null
    proofAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    parsedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    endKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type ShiftUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    endKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type ShiftUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    endKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type GoalUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    period?: EnumGoalPeriodFieldUpdateOperationsInput | $Enums.GoalPeriod
    targetValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GoalUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    period?: EnumGoalPeriodFieldUpdateOperationsInput | $Enums.GoalPeriod
    targetValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GoalUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    period?: EnumGoalPeriodFieldUpdateOperationsInput | $Enums.GoalPeriod
    targetValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    asaasChargeId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    asaasChargeId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    asaasChargeId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    addresses?: JsonNullValueInput | InputJsonValue
    optimizedOrder?: JsonNullValueInput | InputJsonValue
    totalKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalMin?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    addresses?: JsonNullValueInput | InputJsonValue
    optimizedOrder?: JsonNullValueInput | InputJsonValue
    totalKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalMin?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    addresses?: JsonNullValueInput | InputJsonValue
    optimizedOrder?: JsonNullValueInput | InputJsonValue
    totalKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalMin?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FuelRefuelUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    liters?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    pricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FuelRefuelUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    liters?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    pricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FuelRefuelUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    liters?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    pricePerLiter?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    receiptPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OdometerReadingUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    odometerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    recordedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OdometerReadingUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    odometerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    recordedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OdometerReadingUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    odometerKm?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    photoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    rawInput?: JsonNullValueInput | InputJsonValue
    recordedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: EnumActivityCategoryFieldUpdateOperationsInput | $Enums.ActivityCategory
    action?: EnumActivityActionFieldUpdateOperationsInput | $Enums.ActivityAction
    title?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: EnumActivityCategoryFieldUpdateOperationsInput | $Enums.ActivityCategory
    action?: EnumActivityActionFieldUpdateOperationsInput | $Enums.ActivityAction
    title?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: EnumActivityCategoryFieldUpdateOperationsInput | $Enums.ActivityCategory
    action?: EnumActivityActionFieldUpdateOperationsInput | $Enums.ActivityAction
    title?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateManyReferredByAffiliateInput = {
    id?: string
    whatsappNumber: string
    email?: string | null
    name?: string | null
    vehiclePlate?: string | null
    city?: string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: $Enums.UserStatus
    trialEndsAt?: Date | string | null
    subscribedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    currentOdometerKm?: Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: string | null
    referredAt?: Date | string | null
    asaasCustomerId?: string | null
  }

  export type UserUpdateWithoutReferredByAffiliateInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUpdateManyWithoutUserNestedInput
    shifts?: ShiftUpdateManyWithoutUserNestedInput
    goals?: GoalUpdateManyWithoutUserNestedInput
    payments?: PaymentUpdateManyWithoutUserNestedInput
    routes?: RouteUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutReferredByAffiliateInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    costs?: CostConfigUncheckedUpdateOneWithoutUserNestedInput
    deliveries?: DeliveryUncheckedUpdateManyWithoutUserNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    goals?: GoalUncheckedUpdateManyWithoutUserNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutUserNestedInput
    routes?: RouteUncheckedUpdateManyWithoutUserNestedInput
    fuelRefuels?: FuelRefuelUncheckedUpdateManyWithoutUserNestedInput
    odometerReadings?: OdometerReadingUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutReferredByAffiliateInput = {
    id?: StringFieldUpdateOperationsInput | string
    whatsappNumber?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    vehiclePlate?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    workApps?: JsonNullValueInput | InputJsonValue
    subscriptionPaymentMethod?: StringFieldUpdateOperationsInput | string
    workDays?: JsonNullValueInput | InputJsonValue
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscribedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentOdometerKm?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    affiliateCouponCode?: NullableStringFieldUpdateOperationsInput | string | null
    referredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asaasCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}