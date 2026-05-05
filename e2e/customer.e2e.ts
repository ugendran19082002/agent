/**
 * Detox E2E — Customer journey:
 * launch app → enter phone → PIN → Customer Home visible
 * → tap shop → add product → checkout → Place Order → Order Tracking screen
 */
import { describe, it, beforeAll, afterAll, beforeEach } from "@jest/globals";
import { device, element, by, expect as detoxExpect, waitFor } from "detox";

const TEST_PHONE = "9900000001";
const TEST_PIN = "1357";

beforeAll(async () => {
  await device.launchApp({ newInstance: true });
});

afterAll(async () => {
  await device.terminateApp();
});

beforeEach(async () => {
  await device.reloadReactNative();
});

describe("Customer Journey — Login to Order Tracking", () => {
  it("should navigate from phone entry to PIN screen", async () => {
    // Wait for phone input on the auth screen
    await waitFor(element(by.id("phone-input")))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.id("phone-input")).typeText(TEST_PHONE);
    await element(by.id("continue-btn")).tap();

    // PIN screen should appear
    await waitFor(element(by.id("pin-input-0")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("should reach Customer Home after valid PIN entry", async () => {
    // Enter phone
    await waitFor(element(by.id("phone-input")))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id("phone-input")).typeText(TEST_PHONE);
    await element(by.id("continue-btn")).tap();

    // Enter 4-digit PIN
    for (let i = 0; i < TEST_PIN.length; i++) {
      await element(by.id(`pin-input-${i}`)).typeText(TEST_PIN[i]);
    }

    // Home screen should be visible
    await waitFor(element(by.id("customer-home")))
      .toBeVisible()
      .withTimeout(10000);
    await detoxExpect(element(by.id("customer-home"))).toBeVisible();
  });

  it("should navigate to shop, add product, and reach checkout", async () => {
    // Login first
    await waitFor(element(by.id("phone-input")))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id("phone-input")).typeText(TEST_PHONE);
    await element(by.id("continue-btn")).tap();
    for (let i = 0; i < TEST_PIN.length; i++) {
      await element(by.id(`pin-input-${i}`)).typeText(TEST_PIN[i]);
    }
    await waitFor(element(by.id("customer-home")))
      .toBeVisible()
      .withTimeout(10000);

    // Tap on first shop card
    await waitFor(element(by.id("shop-card-0")))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id("shop-card-0")).tap();

    // Add a product
    await waitFor(element(by.id("add-product-btn-0")))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id("add-product-btn-0")).tap();

    // Go to checkout
    await waitFor(element(by.id("checkout-btn")))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id("checkout-btn")).tap();

    // Checkout screen should be visible
    await waitFor(element(by.id("checkout-screen")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("should place order and show Order Tracking screen", async () => {
    // This test assumes the app is on the checkout screen (chained from above)
    // In CI, each test is independent — start from scratch
    await waitFor(element(by.id("phone-input")))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id("phone-input")).typeText(TEST_PHONE);
    await element(by.id("continue-btn")).tap();
    for (let i = 0; i < TEST_PIN.length; i++) {
      await element(by.id(`pin-input-${i}`)).typeText(TEST_PIN[i]);
    }
    await waitFor(element(by.id("customer-home"))).toBeVisible().withTimeout(10000);
    await element(by.id("shop-card-0")).tap();
    await waitFor(element(by.id("add-product-btn-0"))).toBeVisible().withTimeout(5000);
    await element(by.id("add-product-btn-0")).tap();
    await element(by.id("checkout-btn")).tap();
    await waitFor(element(by.id("checkout-screen"))).toBeVisible().withTimeout(5000);

    // Place the COD order
    await element(by.id("place-order-btn")).tap();

    // Order tracking screen should appear
    await waitFor(element(by.id("order-tracking-screen")))
      .toBeVisible()
      .withTimeout(15000);
    await detoxExpect(element(by.id("order-tracking-screen"))).toBeVisible();
  });
});
