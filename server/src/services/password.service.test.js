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

  // Test for invalid password

  //Test for uppercase missing

  //Test for lowercase missing

  //Test for number missing

  //Test for special character missing

  //Test for minimum length missing

  //hash and compare password
  test("hashPassword creates a hash and comparePassword verifies it", async () => {
    const password = "P@ssw0rd1";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);

    const matches = await comparePassword(password, hash);
    expect(matches).toBe(true);
  });
});
