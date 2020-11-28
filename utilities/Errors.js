/**
 * Wraps message and name 
 */
class MasterError extends Error {
  constructor(message, location=null) {
    super(message);
    this.name = this.constructor.name;
    this.location = location;
  }
}

// ################################################
// General errors 

/**
 * Thrown, when an argument did not pass sanity checks
 * @argument - he value of the invalid argument
 * @location - (optional) for debugging, String to explain where the error came from 
 */
class InvalidArgumentError extends MasterError {
  constructor(argument, location=null, message=null) {
    if (!message) message = "Invalid argument: " + argument;
    super(message, location);
    this.argument = argument;
  }
}

/**
 * Error of last resort, when you want to cause pain to anybody daring to read your code
 * i.e. when you are not sure whether the error might ever happen or not
 */
class UnknownLogicError extends MasterError {
  constructor(location=null, message=null) {
    if (!message) message = "Somebody fucked up bigtime";
    super(message, location);
  }
}

// ################################################
// Database errors 

/**
 * Wrapper for master error so that all database errors have the same parent class
 */
class DatabaseError extends MasterError {
  constructor(message, location=null) {
    super(message, location);
  }
}

/**
 * @collection - collection name from where the document was not found
 * @query - the description of query that failed
 */
class DocumentNotFoundError extends DatabaseError {
  constructor(collection, query, location=null, message = null) {
    if (!message) message = "No such document. Query: "+query+", collection: "+collection;
    super(message, location);
    this.collection = collection;
    this.query = query;
  }
}

/**
 * Thrown e.g. when the doc[field] === undefined
 * @collection - collection where the query was made
 * @field - the field for which there was no value
 * @id - (optional) id of the document 
 */
class FieldNotFoundError extends DatabaseError {
  constructor(collection, field, id=null, location=null, message=null) {
    if (!message) message = "No such field: "+field+" in collection "+collection;
    super(message, location);
    this.collection = collection;
    this.field = field;
    this.id = id;
  }
}

module.exports = {
  InvalidArgumentError,
  DocumentNotFoundError,
  FieldNotFoundError,
  UnknownLogicError
}