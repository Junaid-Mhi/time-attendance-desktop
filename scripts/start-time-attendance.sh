#!/bin/bash

exec /opt/TimeAttendance/time-attendance \
  --no-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --disable-gpu-sandbox "$@"