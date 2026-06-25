const bcrypt = require("bcryptjs");

const PASSWORD_RULES_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";

function validatePassword(password) {
  if (typeof password !== "string") {
    return {
      isValid: false,
      message: PASSWORD_RULES_MESSAGE,
    };
  }

  const hasMinimumLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialCharacter = /[!@#$%^&*]/.test(password);

  const isValid =
    hasMinimumLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialCharacter;

  return {
    isValid,
    message: isValid ? null : PASSWORD_RULES_MESSAGE,
  };
}

