/** @type {import('detox/internals').DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: "jest",
      config: "e2e/jest.config.js",
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    "ios.debug": {
      type: "ios.app",
      build:
        "cd frontend && npx expo run:ios --configuration Debug --device",
      binaryPath:
        "frontend/ios/build/Build/Products/Debug-iphonesimulator/ThanniGo.app",
    },
    "android.debug": {
      type: "android.apk",
      build:
        "cd frontend && npx expo run:android --variant debug",
      binaryPath:
        "frontend/android/app/build/outputs/apk/debug/app-debug.apk",
    },
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone 15",
      },
    },
    emulator: {
      type: "android.emulator",
      device: {
        avdName: "Pixel_6_API_34",
      },
    },
  },
  configurations: {
    "ios.sim.debug": {
      device: "simulator",
      app: "ios.debug",
    },
    "android.emu.debug": {
      device: "emulator",
      app: "android.debug",
    },
  },
};
