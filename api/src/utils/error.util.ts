/** A custom error that is configurable with environment-specific errors. */
export class CustomError extends Error {
  /** Status code */
  status: number;
  /** Custom production errors */
  errorProd?: { [key: string]: any };
  /** Custom development errors */
  errorDev?: { [key: string]: any };

  /**
   * Constructs a new CustomError. By default, the Error object doesn't have any
   * enumerable properties, which causes JSON output to return an empty object.
   * This constructor fixes JSON output by defining a `toJSON` prototype method.
   *
   * @param name The error name
   * @param status The status code
   * @param message The error message
   * @param errorProd Custom production errors
   * @param errorDev Custom development errors
   */
  constructor(
    name: string,
    status: number,
    message: string,
    errorProd?: { [key: string]: any },
    errorDev?: { [key: string]: any }
  ) {
    // super
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype); // for typescript

    // set variables
    this.name = name;
    this.status = status;
    this.errorProd = errorProd;
    this.errorDev = errorDev;

    // fixes json output
    Object.defineProperty(CustomError.prototype, "toJSON", {
      value: function () {
        const alt: { [key: string]: any } = {};
        Object.getOwnPropertyNames(this).forEach(function (this: any, key) {
          alt[key] = this[key];
        }, this);
        return alt;
      },
      configurable: true,
      writable: true,
    });
  }
}

/** A CustomError with the name as "ServerError". */
export class ServerError extends CustomError {
  constructor(
    status: number,
    message: string,
    errorProd?: { [key: string]: any },
    errorDev?: { [key: string]: any }
  ) {
    // super
    super("ServerError", status, message, errorProd, errorDev);
    Object.setPrototypeOf(this, ServerError.prototype); // for typescript
  }
}

/** A CustomError with the name as "ClientError". */
export class ClientError extends CustomError {
  constructor(
    status: number,
    message: string,
    errorProd?: { [key: string]: any },
    errorDev?: { [key: string]: any }
  ) {
    // super
    super("ClientError", status, message, errorProd, errorDev);
    Object.setPrototypeOf(this, ClientError.prototype); // for typescript
  }
}

/** A ClientError with the name as "AuthenticationError" and status as 401. */
export class AuthenticationError extends ClientError {
  constructor(
    message: string,
    errorProd?: { [key: string]: any },
    errorDev?: { [key: string]: any }
  ) {
    // super
    super(401, message, errorProd, errorDev);
    Object.setPrototypeOf(this, ClientError.prototype); // for typescript

    // set variables
    this.name = "AuthenticationError";
  }
}

/** A ClientError with the name as "AuthorizationError" and status as 403. */
export class AuthorizationError extends ClientError {
  constructor(
    message: string,
    errorProd?: { [key: string]: any },
    errorDev?: { [key: string]: any }
  ) {
    // super
    super(403, message, errorProd, errorDev);
    Object.setPrototypeOf(this, ClientError.prototype); // for typescript

    // set variables
    this.name = "AuthorizationError";
  }
}
