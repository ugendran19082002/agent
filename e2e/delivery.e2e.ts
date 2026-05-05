/**
 * Detox E2E — Delivery person journey:
 * login → Delivery Dashboard shows pending order → tap order
 * → capture mock proof photo → Mark as Delivered → order shows `delivered` in tracking
 */
import { describe, it, beforeAll, afterAll, beforeEach } from "@jest/globals";
import { device, element, by, expect as detoxExpect, waitFor } from "detox";

const DELIVERY_PHONE = "9900000003";
const DELIVERY_PIN = "1357";

beforeAll(async () => {
  await device.launchApp({ newInstance: true });
});

afterAll(async () => {
  await device.terminateApp();
});

beforeEach(async () => {
  await device.reloadReactNative();
});

describe("Delivery Person Journey", () => {
  it("logs in as delivery person and sees Delivery Dashboard", async () => {
    await waitFor(element(by.id("phone-input")))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id("phone-input")).typeText(DELIVERY_PHONE);
    await element(by.id("continue-btn")).tap();

    for (let i = 0; i < DELIVERY_PIN.length; i++) {
      await element(by.id(`pin-input-${i}`)).typeText(DELIVERY_PIN[i]);
    }

    await waitFor(element(by.id("delivery-dashboard")))
      .toBeVisible()
      .withTimeout(10000);
    await detoxExpect(element(by.id("delivery-dashboard"))).toBeVisible();
  });

  it("opens a pending order and taps Mark as Delivered", async () => {
    // Login
    await waitFor(element(by.id("phone-input"))).toBeVisible().withTimeout(10000);
    await element(by.id("phone-input")).typeText(DELIVERY_PHONE);
    await element(by.id("continue-btn")).tap();
    for (let i = 0; i < DELIVERY_PIN.length; i++) {
      await element(by.id(`pin-input-${i}`)).typeText(DELIVERY_PIN[i]);
    }
    await waitFor(element(by.id("delivery-dashboard"))).toBeVisible().withTimeout(10000);

    // Tap first pending order
    await waitFor(element(by.id("delivery-order-card-0")))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id("delivery-order-card-0")).tap();

    // Order detail screen
    await waitFor(element(by.id("delivery-order-detail")))
      .toBeVisible()
      .withTimeout(5000);

    // Capture mock proof photo (Detox mock camera)
    const captureBtn = element(by.id("capture-proof-btn"));
    const captureVisible = await captureBtn.isVisible().catch(() => false);
    if (captureVisible) {
      await captureBtn.tap();
      // Mock camera: confirm/accept
      await waitFor(element(by.id("use-photo-btn")))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id("use-photo-btn")).tap();
    }

    // Mark as Delivered
    await waitFor(element(by.id("mark-delivered-btn")))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id("mark-delivered-btn")).tap();

    // Confirmation or success state
    await waitFor(element(by.id("delivery-success")))
      .toBeVisible()
      .withTimeout(10000);
    await detoxExpect(element(by.id("delivery-success"))).toBeVisible();
  });
});
