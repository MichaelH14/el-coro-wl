#!/bin/sh
input=$(cat)

# Single jq call instead of 3 separate forks
parsed=$(echo "$input" | jq -r '[(.model.display_name // "Claude"), (.workspace.current_dir // .cwd // ""), (.context_window.remaining_percentage // "")] | join("\t")')
model=$(echo "$parsed" | cut -f1)
cwd=$(echo "$parsed" | cut -f2)
remaining=$(echo "$parsed" | cut -f3)
dir=$(basename "$cwd")

# ── El Coro work progress ──
work_str=""
if [ -f /tmp/el-coro-work ]; then
  now=$(date +%s)
  wdata=$(cat /tmp/el-coro-work 2>/dev/null)
  wparsed=$(echo "$wdata" | jq -r '[(.last // 0), (.steps // 0)] | join("\t")' 2>/dev/null)
  wlast=$(echo "$wparsed" | cut -f1)
  wsteps=$(echo "$wparsed" | cut -f2)

  # Convert ms to seconds
  wlast_s=$((wlast / 1000))
  age=$((now - wlast_s))

  if [ "$age" -le 5 ] && [ "$wsteps" -gt 0 ]; then
    # Active — progress bar fills with steps (each step = 10%, cap at 100%)
    wpct=$((wsteps * 10))
    if [ $wpct -gt 100 ]; then wpct=100; fi
    wfilled=$((wpct / 10))
    wempty=$((10 - wfilled))
    wbar=""
    i=0; while [ $i -lt $wfilled ]; do wbar="${wbar}▓"; i=$((i+1)); done
    i=0; while [ $i -lt $wempty ]; do wbar="${wbar}░"; i=$((i+1)); done
    work_str="\033[1;34m${wbar}\033[0m"
  else
    work_str="\033[0;90m░░░░░░░░░░\033[0m"
  fi
else
  work_str="\033[0;90m░░░░░░░░░░\033[0m"
fi

# ── Context window ──
if [ -n "$remaining" ]; then
  remaining_int=$(printf "%.0f" "$remaining")
  used_int=$((100 - remaining_int))

  if [ "$remaining_int" -le 20 ]; then
    ctx_color="\033[0;31m"
  elif [ "$remaining_int" -le 40 ]; then
    ctx_color="\033[0;33m"
  else
    ctx_color="\033[0;32m"
  fi
  # Context progress bar (10 chars)
  cfilled=$((used_int / 10))
  if [ $cfilled -gt 10 ]; then cfilled=10; fi
  if [ $cfilled -lt 0 ]; then cfilled=0; fi
  cempty=$((10 - cfilled))
  cbar=""
  i=0; while [ $i -lt $cfilled ]; do cbar="${cbar}█"; i=$((i+1)); done
  i=0; while [ $i -lt $cempty ]; do cbar="${cbar}░"; i=$((i+1)); done
  ctx_str="${ctx_color}${cbar} ctx: ${used_int}% usado / ${remaining_int}% libre\033[0m"
else
  ctx_str="░░░░░░░░░░ ctx: --"
fi

printf "\033[1;34m El Coro\033[0m %b  \033[0;36m%s\033[0m  \033[0;35m%s\033[0m  %b" "$work_str" "$model" "$dir" "$ctx_str"
