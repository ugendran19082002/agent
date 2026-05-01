import os
import re

files = [
    "frontend/app/edit-profile.tsx",
    "frontend/app/shop-alternatives.tsx",
    "frontend/app/delivery/charge-request.tsx",
    "frontend/app/delivery/complete.tsx",
    "frontend/app/delivery/index.tsx",
    "frontend/app/delivery/history.tsx",
    "frontend/app/delivery/earnings.tsx",
    "frontend/app/payments/history.tsx",
    "frontend/app/privacy-security.tsx",
    "frontend/app/shop-detail/[id].tsx",
    "frontend/app/rewards.tsx",
    "frontend/app/shop/holidays.tsx",
    "frontend/app/shop/delivery-fleet.tsx",
    "frontend/app/shop/inventory-cans.tsx",
    "frontend/app/shop/staff.tsx",
    "frontend/app/shop/delivery.tsx",
    "frontend/app/shop/can-management.tsx",
    "frontend/app/shop/schedule.tsx",
    "frontend/app/shop/order/[id].tsx",
    "frontend/app/shop/slots.tsx",
    "frontend/app/shop/(tabs)/index.tsx",
    "frontend/app/shop/(tabs)/inventory.tsx",
    "frontend/app/shop/(tabs)/earnings.tsx",
    "frontend/app/shop/complaints.tsx",
    "frontend/app/shop/reviews.tsx",
    "frontend/app/shop/payout-settings.tsx",
    "frontend/app/shop/manual-order.tsx",
    "frontend/app/shop/promotions.tsx",
    "frontend/app/shop/profile.tsx",
    "frontend/app/shop/analytics.tsx",
    "frontend/app/onboarding/customer/index.tsx",
    "frontend/app/onboarding/shop/basic-details.tsx",
    "frontend/app/onboarding/shop/index.tsx",
    "frontend/app/emergency-help.tsx",
    "frontend/app/addresses.tsx",
    "frontend/app/admin/vendors/[id].tsx",
    "frontend/app/admin/features.tsx",
    "frontend/app/admin/orders.tsx",
    "frontend/app/admin/banks.tsx",
    "frontend/app/admin/refunds.tsx",
    "frontend/app/admin/payouts.tsx",
    "frontend/app/admin/coupons.tsx",
    "frontend/app/admin/order/[id].tsx",
    "frontend/app/admin/(tabs)/index.tsx",
    "frontend/app/admin/(tabs)/vendors.tsx",
    "frontend/app/admin/complaints.tsx",
    "frontend/app/admin/bank-requests.tsx",
    "frontend/app/admin/users.tsx",
    "frontend/app/admin/master.tsx",
    "frontend/app/admin/growth.tsx",
    "frontend/app/admin/support-master.tsx",
    "frontend/app/order/checkout.tsx",
    "frontend/app/order/cancel.tsx",
    "frontend/app/order/confirmed.tsx",
    "frontend/app/order/schedule.tsx",
    "frontend/app/order/rating.tsx",
    "frontend/app/order/[id].tsx",
    "frontend/app/(tabs)/orders.tsx",
    "frontend/app/(tabs)/profile.tsx",
    "frontend/app/auth/login.tsx",
    "frontend/app/auth/otp.tsx",
    "frontend/app/customer-payment-history.tsx"
]

# Match: import Toast from "react-native-toast-message" or import Toast from 'react-native-toast-message'
# with optional semicolon
old_pattern = re.compile(r"import\s+Toast\s+from\s+[\"']react-native-toast-message[\"'];?")
new_import = 'import { Toast } from "@/components/ui/AppToast";'

for file_path in files:
    abs_path = os.path.join(os.getcwd(), file_path)
    if not os.path.exists(abs_path):
        print(f"File not found: {abs_path}")
        continue
    with open(abs_path, 'r') as f:
        content = f.read()
    
    new_content = old_pattern.sub(new_import, content)
    
    if new_content != content:
        with open(abs_path, 'w') as f:
            f.write(new_content)
        print(f"Updated: {file_path}")
    else:
        print(f"No match in: {file_path}")
