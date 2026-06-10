import { test, expect } from '@playwright/test';

const VALID_USER = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: `jane.doe.${Date.now()}@example.com`,
  password: 'Secret123',
  phone: '555-0100',
  dateOfBirth: '1990-06-15',
};

test.describe('Registration Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('happy path — submits successfully and shows success banner', async ({ page }) => {
    await page.getByLabel('First Name *').fill(VALID_USER.firstName);
    await page.getByLabel('Last Name *').fill(VALID_USER.lastName);
    await page.getByLabel('Email *').fill(VALID_USER.email);
    await page.getByLabel('Password *').fill(VALID_USER.password);
    await page.getByLabel('Confirm Password *').fill(VALID_USER.password);
    await page.getByLabel('Phone Number').fill(VALID_USER.phone);
    await page.getByLabel('Date of Birth').fill(VALID_USER.dateOfBirth);

    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByRole('alert')).toContainText('Registration successful!');
  });

  test('form resets after successful submission', async ({ page }) => {
    const uniqueEmail = `reset.test.${Date.now()}@example.com`;

    await page.getByLabel('First Name *').fill('John');
    await page.getByLabel('Last Name *').fill('Reset');
    await page.getByLabel('Email *').fill(uniqueEmail);
    await page.getByLabel('Password *').fill('password123');
    await page.getByLabel('Confirm Password *').fill('password123');

    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByRole('alert')).toContainText('Registration successful!');
    await expect(page.getByLabel('First Name *')).toHaveValue('');
    await expect(page.getByLabel('Email *')).toHaveValue('');
  });

  test('required field validation — shows errors when form is empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.locator('#firstName-error')).toContainText('First name is required.');
    await expect(page.locator('#lastName-error')).toContainText('Last name is required.');
    await expect(page.locator('#email-error')).toContainText('Email is required.');
    await expect(page.locator('#password-error')).toContainText('Password is required.');
    await expect(page.locator('#confirmPassword-error')).toContainText('Please confirm your password.');
  });

  test('invalid email format — shows email validation error', async ({ page }) => {
    await page.getByLabel('Email *').fill('not-an-email');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.locator('#email-error')).toContainText('Enter a valid email address.');
  });

  test('short password — shows password length error', async ({ page }) => {
    await page.getByLabel('Password *').fill('abc');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.locator('#password-error')).toContainText('at least 6 characters');
  });

  test('password mismatch — shows confirm password error', async ({ page }) => {
    await page.getByLabel('Password *').fill('Secret123');
    await page.getByLabel('Confirm Password *').fill('Different99');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.locator('#confirmPassword-error')).toContainText('Passwords do not match.');
  });

  test('duplicate email — shows API error banner', async ({ page }) => {
    const dupeEmail = `dupe.${Date.now()}@example.com`;

    // First registration
    await page.getByLabel('First Name *').fill('Alice');
    await page.getByLabel('Last Name *').fill('Smith');
    await page.getByLabel('Email *').fill(dupeEmail);
    await page.getByLabel('Password *').fill('password123');
    await page.getByLabel('Confirm Password *').fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByRole('alert')).toContainText('Registration successful!');

    // Second registration with same email
    await page.getByLabel('First Name *').fill('Bob');
    await page.getByLabel('Last Name *').fill('Jones');
    await page.getByLabel('Email *').fill(dupeEmail);
    await page.getByLabel('Password *').fill('password456');
    await page.getByLabel('Confirm Password *').fill('password456');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByRole('alert')).toContainText('already exists');
  });
});
