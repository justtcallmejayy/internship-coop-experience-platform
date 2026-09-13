const {
  validatePassword,
  hashPassword,
  comparePassword,
} = require("./password.service");

describe("Password service", () => {
  test("valid password passes proposal rules", () => {
    const result = validatePassword("P@ssw0rd123");

    expect(result.isValid).toBe(true);
    expect(result.message).toBeNull();
  });
  // Additional tests

  // Test cases for invalid passwords
  test("password shorter than 8 characters fails", () => {
    const result = validatePassword("P@ss1");

    expect(result.isValid).toBe(false);
  });

  // Test cases for uppercase, lowercase, number, and special character requirements
  test("password without uppercase fails", () => {
    const result = validatePassword("p@ssw0rd1");

    expect(result.isValid).toBe(false);
  });

  test("password without lowercase fails", () => {
    const result = validatePassword("P@SSW0RD1");

    expect(result.isValid).toBe(false);
  });

  test("password without number fails", () => {
    const result = validatePassword("P@ssword");

    expect(result.isValid).toBe(false);
  });

  test("password without special character fails", () => {
    const result = validatePassword("Passw0rd1");

    expect(result.isValid).toBe(false);
  });

  //hash and compare password
  test("hashPassword creates a hash and comparePassword verifies it", async () => {
    const password = "P@ssw0rd123";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);

    const matches = await comparePassword(password, hash);
    expect(matches).toBe(true);
  });
});
