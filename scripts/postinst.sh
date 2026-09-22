#!/bin/bash
# Fix chrome-sandbox permissions after .deb install
# Required for Electron apps to run without --no-sandbox flag

SANDBOX_PATHS=(
    "/opt/Time Attendance/chrome-sandbox"
    "/opt/time-attendance-desktop/chrome-sandbox"
)

for SANDBOX_PATH in "${SANDBOX_PATHS[@]}"; do
    if [ -f "$SANDBOX_PATH" ]; then
        chown root:root "$SANDBOX_PATH"
        chmod 4755 "$SANDBOX_PATH"
        echo "Fixed permissions for $SANDBOX_PATH"
    fi
done

exit 0