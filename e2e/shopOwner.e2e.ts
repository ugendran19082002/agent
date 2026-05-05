/**
 * Detox E2E — Shop owner journey:
 * login → Shop Dashboard → tap pending order → Accept → delivery person assigned confirmation
 */
import { describe, it, beforeAll, afterAll, beforeEach } from "@jest/globals";
import { device, element, by, expect as detoxExpect, waitFor } from "detox";

const OWNER_PHONE = "9900000002";
const OWNER_PIN = "1357";

beforeAll(async () => {
  await device.launchApp({ newInstance: true });
});

afterAll(async () => {
  await device.terminateApp();
});

beforeEach(async () => {
  await device.reloadReactNative();
});

describe("Shop Owner Journey", () => {
  it("logs in and sees Shop Dashboard", async () => {
    await waitFor(element(by.id("phone-input")))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id("phone-input")).typeText(OWNER_PHONE);
    await element(by.id("continue-btn")).tap();

    for (let i = 0; i < OWNER_PIN.length; i++) {
      await element(by.id(`pin-input-${i}`)).typeText(OWNER_PIN[i]);
    }

    await waitFor(element(by.id("shop-dashboard")))
      .toBeVisible()
      .withTimeout(10000);
    await detoxExpect(element(by.id("shop-dashboard"))).toBeVisible();
  });

  it("accepts a pending order from Shop Dashboard", async () => {
    // Login
    await waitFor(element(by.id("phone-input"))).toBeVisible().withTimeout(10000);
    await element(by.id("phone-input")).typeText(OWNER_PHONE);
    await element(by.id("continue-btn")).tap();
    for (let i = 0; i < OWNER_PIN.length; i++) {
      await element(by.id(`pin-input-${i}`)).typeText(OWNER_PIN[i]);
    }
    await waitFor(element(by.id("shop-dashboard"))).toBeVisible().withTimeout(10000);

    // Look for pending orders
    await waitFor(element(by.id("pending-orders-section")))
      .toBeVisible()
      .withTimeout(5000);

    // Tap the first pending order card
    await waitFor(element(by.id("shop-order-card-0")))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id("shop-order-card-0")).tap();

    // Order detail — Accept button
    await waitFor(element(by.id("accept-order-btn")))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id("accept-order-btn")).tap();

    // Delivery person assignment confirmation should appear
    await waitFor(
      element(by.id("delivery-assigned-confirmation"))
        .atIndex(0)
        .or(element(by.text("Order Accepted"))
        .or(element(by.text("Delivery Assigned"))))
    )
      .toBeVisible()
      .withTimeout(10000);

    await detoxExpect(
      element(by.id("delivery-assigned-confirmation"))
    ).toBeVisible();
  });
});
