/**
 * Wraps message and name 
 */
class MasterError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

// ################################################
// General errors 

/**
 * Thrown, when an argument did not pass sanity checks
 * @argument - he value of the invalid argument
 * @location - (optional) for debugging, String to explain where the error came from 
 */
export class InvalidArgumentError extends MasterError {
  constructor(argument, location=null, message=null) {
    if (!message) message = "Invalid argument: " + argument + " @location: "+location;
    super(message);
    this.argument = argument;
  }
}

/**
 * Error of last resort, when you want to cause pain to anybody daring to read your code
 * i.e. when you are not sure whether the error might ever happen or not
 */
export class UnknownLogicError extends MasterError {
  constructor(message=null) {
    if (!message) message = "Somebody fucked up bigtime";
    super(message);
  }
}

/*
const errors = {
  InvalidArgumentError,
  UnknownLogicError,
};

export default errors;
*/