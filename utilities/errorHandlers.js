function prepareErrors(error, errors) {
  if (error.errors) {
    errors = error.errors;
  } else {
    errors.error = error;
  }
  return errors;
}

module.exports = { prepareErrors };
