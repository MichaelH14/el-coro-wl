---
name: cross-verify
description: Use when validating output that depends on external data, or when a result needs verification against multiple independent sources before acting on it
---

# Cross-Verification

Never trust a single source. Verify outputs against multiple independent sources before acting on them.

## Preconditions

- Output or data to verify identified
- At least 2 independent sources available for comparison
- Acceptable tolerance defined (exact match or within threshold)

## Steps

### 1. Identify What Needs Verification

Cross-verify when:
- Data comes from an external API (lottery results, exchange rates, scores)
- AI-generated output will be sent to users
- Configuration changes affect production
- Financial calculations are involved
- Any output that, if wrong, causes user harm

### 2. Select Independent Sources

For each data type, identify 2+ independent sources:

| Data | Source A | Source B | Source C |
|------|---------|---------|---------|
| Lottery results | Official website | Secondary API | Manual screenshot |
| Exchange rates | API provider 1 | API provider 2 | Central bank |
| Code correctness | Unit tests | Manual test | Type checker |
| Config validity | Schema validation | Dry-run | Peer review |

Sources must be independent (not derived from each other).

### 3. Compare Results

```json
{
  "data_type": "lottery_results",
  "query": "Nacional 2026-03-31",
  "sources": {
    "official_api": { "numbers": [12, 34, 56], "timestamp": "..." },
    "secondary_api": { "numbers": [12, 34, 56], "timestamp": "..." },
    "screenshot": { "numbers": [12, 34, 56], "verified_by": "manual" }
  },
  "consensus": true,
  "confidence": "high"
}
```

### 4. Handle Disagreement

When sources disagree:
1. **Log the discrepancy** with full details from each source
2. **Do not publish** the disputed data
3. **Flag for manual review** with all source data attached
4. **Use the most authoritative source** as tiebreaker (official > secondary > derived)
5. **Investigate why** sources disagree (stale cache? API error? timing?)

Never average conflicting data. One source is right, the others are wrong -- find which.

### 5. Confidence Levels

| Agreement | Action |
|-----------|--------|
| All sources agree | Publish/use immediately (high confidence) |
| Majority agree | Use majority value, log the outlier (medium confidence) |
| No agreement | Do not use, escalate for manual verification (low confidence) |

### 6. Verification Logging

Every cross-verification logged:
```json
{
  "verified_at": "timestamp",
  "data_type": "lottery_results",
  "sources_checked": 3,
  "sources_agreed": 3,
  "confidence": "high",
  "result_used": true
}
```

Track verification success rate over time. If a source is frequently the outlier, replace it.

## Verification / Exit Criteria

- Data verified against 2+ independent sources before use
- Discrepancies logged with full source data
- Disagreeing data never published without manual review
- Confidence level assigned and logged for every verification
- Frequently wrong sources identified and replaced
